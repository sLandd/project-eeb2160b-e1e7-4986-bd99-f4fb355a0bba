import { createFileRoute } from "@tanstack/react-router";
import { Download, AlertTriangle, GraduationCap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { studentInfo, subjects } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/progress")({
  component: ProgressPage,
  head: () => ({ meta: [{ title: "Прогресс — Компас" }] }),
});

type DayCell = {
  date: Date;
  iso: string;
  level: 0 | 1 | 2 | 3 | 4;
  done: number;
  missed: boolean;
};

function seeded(n: number) {
  const x = Math.sin(n * 9999) * 10000;
  return x - Math.floor(x);
}

function buildActivity(referenceDate: Date) {
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);

  const start = new Date(today);
  start.setDate(today.getDate() - 26 * 7);
  const day = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - day);

  const cells: DayCell[] = [];
  const cursor = new Date(start);
  while (cursor <= today) {
    const idx = Math.round((cursor.getTime() - start.getTime()) / 86400000);
    const dow = (cursor.getDay() + 6) % 7;
    const r = seeded(idx + 1);
    const isWeekend = dow >= 5;

    let level: DayCell["level"] = 0;
    let done = 0;
    let missed = false;

    if (!isWeekend) {
      if (r < 0.12) {
        // Невыполненный план
        missed = true;
        level = 1;
        done = 1;
      } else if (r < 0.3) {
        level = 0;
      } else if (r < 0.5) {
        level = 1;
        done = 1;
      } else if (r < 0.72) {
        level = 2;
        done = 2;
      } else if (r < 0.88) {
        level = 3;
        done = 3 + Math.floor(seeded(idx + 200) * 2);
      } else {
        level = 4;
        done = 5 + Math.floor(seeded(idx + 300) * 3);
      }
    }

    cells.push({
      date: new Date(cursor),
      iso: cursor.toISOString().slice(0, 10),
      level,
      done,
      missed,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  const weeks: DayCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  const monthNames = [
    "Янв", "Фев", "Мар", "Апр", "Май", "Июн",
    "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек",
  ];
  const monthLabels: { index: number; label: string }[] = [];
  let lastMonth = -1;
  weeks.forEach((w, i) => {
    const m = w[0].date.getMonth();
    if (m !== lastMonth) {
      monthLabels.push({ index: i, label: monthNames[m] });
      lastMonth = m;
    }
  });

  const totals = {
    active: cells.filter((c) => c.level > 0).length,
    done: cells.reduce((s, c) => s + c.done, 0),
    missedDays: cells.filter((c) => c.missed),
  };

  return { weeks, monthLabels, totals };
}

// Stable fixed reference date so SSR & client render identically
const REFERENCE_DATE = new Date("2026-04-21T00:00:00Z");

function ProgressPage() {
  const [data, setData] = useState(() => buildActivity(REFERENCE_DATE));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setData(buildActivity(new Date()));
    setHydrated(true);
  }, []);

  const { weeks, monthLabels, totals } = data;

  const gradeStats = useMemo(() => {
    const allGrades = subjects.flatMap((s) =>
      s.grades.map((g) => ({ ...g, subject: s.name, emoji: s.emoji })),
    );
    const overall = allGrades.length
      ? allGrades.reduce((sum, g) => sum + g.grade, 0) / allGrades.length
      : 0;
    const recent = [...allGrades].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
    return { allGrades, overall, recent };
  }, []);

  const handleDownloadReport = () => {
    const rows: string[] = [];
    rows.push("Отчёт об активности");
    rows.push(`Ученик;${studentInfo.name}`);
    rows.push(`Класс;${studentInfo.class}`);
    rows.push(`Email;${studentInfo.email}`);
    rows.push(`Дата формирования;${new Date().toLocaleDateString("ru-RU")}`);
    rows.push("");
    rows.push("Сводка за последние полгода");
    rows.push(`Активных дней;${totals.active}`);
    rows.push(`Выполнено заданий всего;${totals.done}`);
    rows.push(`Дней с невыполненным планом;${totals.missedDays.length}`);
    rows.push(`Общий средний балл;${gradeStats.overall.toFixed(2)}`);
    rows.push("");
    rows.push("Средний балл по предметам");
    rows.push("Предмет;Средний балл;Количество оценок");
    subjects.forEach((s) =>
      rows.push(`${s.name};${s.averageGrade.toFixed(1)};${s.grades.length}`),
    );
    rows.push("");
    rows.push("Все оценки");
    rows.push("Дата;Предмет;Работа;Оценка;Комментарий");
    gradeStats.allGrades
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))
      .forEach((g) => rows.push(`${g.date};${g.subject};${g.title};${g.grade};${g.comment}`));
    rows.push("");
    rows.push("Невыполненный план");
    rows.push("Дата");
    totals.missedDays.forEach((d) => rows.push(d.iso));

    const csv = "\uFEFF" + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Отчёт_активность_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const cellSize = 12;
  const gap = 3;
  const colW = cellSize + gap;
  const leftPad = 28;
  const topPad = 18;
  const width = leftPad + weeks.length * colW;
  const height = topPad + 7 * colW;

  const levelColor = (level: DayCell["level"]): string => {
    switch (level) {
      case 0:
        return "var(--muted)";
      case 1:
        return "color-mix(in oklab, var(--primary) 25%, var(--muted))";
      case 2:
        return "color-mix(in oklab, var(--primary) 50%, var(--muted))";
      case 3:
        return "color-mix(in oklab, var(--primary) 75%, transparent)";
      case 4:
        return "var(--primary)";
    }
  };

  const dayLabels = ["Пн", "", "Ср", "", "Пт", "", ""];

  const formatDate = (d: Date) =>
    `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;

  return (
    // suppressHydrationWarning so dates rendered after effect won't warn even if SSR snapshot differs
    <div className="px-6 py-6 md:px-10 md:py-8" suppressHydrationWarning>
      <header>
        <h1 className="text-2xl font-bold md:text-3xl">Прогресс</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Активность за последние полгода
        </p>
      </header>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Активных дней" value={String(totals.active)} />
        <Stat label="Выполнено заданий" value={String(totals.done)} />
        <Stat label="Средний балл" value={gradeStats.overall.toFixed(1)} />
        <Stat
          label="Невыполненный план"
          value={String(totals.missedDays.length)}
          tone="warn"
        />
      </section>

      <section
        className="mt-8 rounded-xl border bg-card p-6"
        suppressHydrationWarning
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold">Активность ученика</h2>
          <span className="text-xs text-muted-foreground">
            {totals.active} активных дней за 26 недель
          </span>
        </div>

        <div className="mt-5 w-full overflow-x-auto" suppressHydrationWarning>
          <svg
            width={width}
            height={height}
            className="block"
            role="img"
            aria-label="Календарь активности"
          >
            {monthLabels.map((m, i) => (
              <text
                key={i}
                x={leftPad + m.index * colW}
                y={topPad - 6}
                fontSize="10"
                fill="var(--muted-foreground)"
              >
                {m.label}
              </text>
            ))}

            {dayLabels.map((d, i) =>
              d ? (
                <text
                  key={i}
                  x={0}
                  y={topPad + i * colW + cellSize - 2}
                  fontSize="10"
                  fill="var(--muted-foreground)"
                >
                  {d}
                </text>
              ) : null,
            )}

            {weeks.map((week, x) =>
              week.map((cell, y) => (
                <rect
                  key={`${x}-${y}`}
                  x={leftPad + x * colW}
                  y={topPad + y * colW}
                  width={cellSize}
                  height={cellSize}
                  rx={2}
                  fill={
                    cell.missed
                      ? "var(--status-progress)"
                      : levelColor(cell.level)
                  }
                  stroke={
                    cell.missed
                      ? "transparent"
                      : "color-mix(in oklab, var(--border) 60%, transparent)"
                  }
                >
                  <title>
                    {cell.iso} —{" "}
                    {cell.missed
                      ? "План не выполнен"
                      : cell.level === 0
                        ? "Нет активности"
                        : `${cell.done} заданий`}
                  </title>
                </rect>
              )),
            )}
          </svg>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Меньше</span>
            {[0, 1, 2, 3, 4].map((l) => (
              <span
                key={l}
                className="inline-block h-3 w-3 rounded-sm"
                style={{ backgroundColor: levelColor(l as DayCell["level"]) }}
              />
            ))}
            <span>Больше</span>
          </div>

          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-3 rounded-sm"
              style={{ backgroundColor: "var(--status-progress)" }}
            />
            План не выполнен
          </span>
        </div>

        <div className="mt-6 rounded-lg border bg-muted/30 p-4" suppressHydrationWarning>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-status-progress text-status-progress-foreground">
              <AlertTriangle className="h-4 w-4" />
            </span>
            Невыполненный план
            <span className="ml-auto text-xs font-normal text-muted-foreground">
              {totals.missedDays.length}
            </span>
          </div>

          {totals.missedDays.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Все планы выполнены — отличная работа!
            </p>
          ) : (
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {(hydrated
                ? totals.missedDays.slice(-8).reverse()
                : totals.missedDays.slice(-8).reverse()
              ).map((d, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-status-progress-foreground/70" />
                  <div>
                    <div className="font-medium">{formatDate(d.date)}</div>
                    <div className="text-xs text-muted-foreground">
                      Часть заданий дня не сдана
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6 rounded-lg border bg-muted/30 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              <GraduationCap className="h-4 w-4" />
            </span>
            Оценки
            <span className="ml-auto text-xs font-normal text-muted-foreground">
              средний {gradeStats.overall.toFixed(2)} · всего {gradeStats.allGrades.length}
            </span>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {subjects.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5"
              >
                <span className="text-xl">{s.emoji}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{s.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {s.grades.length} {s.grades.length === 1 ? "оценка" : "оценок"}
                  </div>
                </div>
                <span
                  className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${gradeColor(s.averageGrade)}`}
                >
                  {s.averageGrade.toFixed(1)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Последние оценки
            </div>
            <ul className="space-y-2">
              {gradeStats.recent.map((g, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5"
                >
                  <span className="text-lg">{g.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{g.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {g.subject} · {g.date}
                    </div>
                  </div>
                  <span
                    className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${gradeColor(g.grade)}`}
                  >
                    {g.grade}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 flex justify-end border-t pt-5">
          <button
            onClick={handleDownloadReport}
            className="flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            <Download className="h-4 w-4" />
            Скачать отчёт
          </button>
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "warn";
}) {
  const toneClass =
    tone === "warn"
      ? "bg-status-progress text-status-progress-foreground"
      : "bg-card";

  return (
    <div className={`rounded-xl border p-5 ${toneClass}`}>
      <div
        className={`text-xs font-medium uppercase tracking-wide ${
          tone ? "opacity-80" : "text-muted-foreground"
        }`}
      >
        {label}
      </div>
      <div className="mt-2 text-3xl font-bold">{value}</div>
    </div>
  );
}
