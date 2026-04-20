import { createFileRoute } from "@tanstack/react-router";
import { Download, AlertTriangle, CalendarX } from "lucide-react";
import { useMemo } from "react";
import { studentInfo } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/progress")({
  component: ProgressPage,
  head: () => ({ meta: [{ title: "Прогресс — Компас" }] }),
});

type DayCell = {
  date: Date;
  iso: string;
  level: 0 | 1 | 2 | 3 | 4; // intensity
  done: number;
  missed: boolean;
  absent: boolean;
};

// Deterministic pseudo-random for stable mock heatmap
function seeded(n: number) {
  const x = Math.sin(n * 9999) * 10000;
  return x - Math.floor(x);
}

function buildActivity(): {
  weeks: DayCell[][];
  monthLabels: { index: number; label: string }[];
  totals: { active: number; done: number; missedDays: DayCell[]; absentDays: DayCell[] };
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 26 weeks back, align to Monday
  const start = new Date(today);
  start.setDate(today.getDate() - 26 * 7);
  const day = (start.getDay() + 6) % 7; // Mon=0..Sun=6
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
    let absent = false;

    if (!isWeekend) {
      if (r < 0.08) {
        absent = true; // пропуск
        level = 0;
      } else if (r < 0.18) {
        missed = true; // не выполнил план
        level = 1;
        done = 1;
      } else if (r < 0.4) {
        level = 1;
        done = 1;
      } else if (r < 0.65) {
        level = 2;
        done = 2;
      } else if (r < 0.85) {
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
      absent,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  // Group into weeks (columns of 7)
  const weeks: DayCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  // Month labels — show month name when first column of that month appears
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
    absentDays: cells.filter((c) => c.absent),
  };

  return { weeks, monthLabels, totals };
}

function ProgressPage() {
  const { weeks, monthLabels, totals } = useMemo(() => buildActivity(), []);

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
    rows.push(`Пропусков;${totals.absentDays.length}`);
    rows.push(`Дней с невыполненным планом;${totals.missedDays.length}`);
    rows.push("");
    rows.push("Пропуски");
    rows.push("Дата");
    totals.absentDays.forEach((d) => rows.push(d.iso));
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

  // heatmap geometry
  const cellSize = 12;
  const gap = 3;
  const colW = cellSize + gap;
  const leftPad = 28; // day labels
  const topPad = 18; // month labels
  const width = leftPad + weeks.length * colW;
  const height = topPad + 7 * colW;

  const levelColor = (c: DayCell): string => {
    if (c.absent) return "var(--destructive)";
    if (c.missed) return "var(--status-progress)";
    switch (c.level) {
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
    d.toLocaleDateString("ru-RU", { day: "2-digit", month: "long" });

  return (
    <div className="px-6 py-6 md:px-10 md:py-8">
      <header>
        <h1 className="text-2xl font-bold md:text-3xl">Прогресс</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Активность за последние полгода
        </p>
      </header>

      <section className="mt-6 grid gap-4 sm:grid-cols-4">
        <Stat label="Активных дней" value={String(totals.active)} />
        <Stat label="Выполнено заданий" value={String(totals.done)} />
        <Stat
          label="Невыполненный план"
          value={String(totals.missedDays.length)}
          tone="warn"
        />
        <Stat
          label="Пропусков"
          value={String(totals.absentDays.length)}
          tone="danger"
        />
      </section>

      <section className="mt-8 rounded-xl border bg-card p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold">Активность ученика</h2>
          <span className="text-xs text-muted-foreground">
            {totals.active} активных дней за 26 недель
          </span>
        </div>

        <div className="mt-5 w-full overflow-x-auto">
          <svg
            width={width}
            height={height}
            className="block"
            role="img"
            aria-label="Календарь активности"
          >
            {/* Month labels */}
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

            {/* Day-of-week labels */}
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

            {/* Cells */}
            {weeks.map((week, x) =>
              week.map((cell, y) => (
                <rect
                  key={`${x}-${y}`}
                  x={leftPad + x * colW}
                  y={topPad + y * colW}
                  width={cellSize}
                  height={cellSize}
                  rx={2}
                  fill={levelColor(cell)}
                  stroke={
                    cell.absent || cell.missed
                      ? "transparent"
                      : "color-mix(in oklab, var(--border) 60%, transparent)"
                  }
                >
                  <title>
                    {cell.iso} —{" "}
                    {cell.absent
                      ? "Пропуск"
                      : cell.missed
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

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Меньше</span>
            {[0, 1, 2, 3, 4].map((l) => (
              <span
                key={l}
                className="inline-block h-3 w-3 rounded-sm"
                style={{
                  backgroundColor: levelColor({
                    date: new Date(),
                    iso: "",
                    level: l as DayCell["level"],
                    done: 0,
                    missed: false,
                    absent: false,
                  }),
                }}
              />
            ))}
            <span>Больше</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block h-3 w-3 rounded-sm"
                style={{ backgroundColor: "var(--status-progress)" }}
              />
              План не выполнен
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block h-3 w-3 rounded-sm"
                style={{ backgroundColor: "var(--destructive)" }}
              />
              Пропуск
            </span>
          </div>
        </div>

        {/* Lists of missed / absent */}
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <IssueList
            icon={<CalendarX className="h-4 w-4" />}
            title="Пропуски"
            empty="Пропусков не было — отлично!"
            tone="danger"
            items={totals.absentDays.slice(-6).reverse().map((d) => ({
              date: formatDate(d.date),
              text: "Не присутствовал на занятиях",
            }))}
          />
          <IssueList
            icon={<AlertTriangle className="h-4 w-4" />}
            title="Невыполненный план"
            empty="Все планы выполнены"
            tone="warn"
            items={totals.missedDays.slice(-6).reverse().map((d) => ({
              date: formatDate(d.date),
              text: "Часть заданий дня не сдана",
            }))}
          />
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
  tone?: "warn" | "danger";
}) {
  const toneClass =
    tone === "danger"
      ? "bg-status-overdue text-status-overdue-foreground"
      : tone === "warn"
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

function IssueList({
  icon,
  title,
  items,
  empty,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  items: { date: string; text: string }[];
  empty: string;
  tone: "warn" | "danger";
}) {
  const dotClass =
    tone === "danger" ? "bg-destructive" : "bg-status-progress-foreground/70";

  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-md ${
            tone === "danger"
              ? "bg-status-overdue text-status-overdue-foreground"
              : "bg-status-progress text-status-progress-foreground"
          }`}
        >
          {icon}
        </span>
        {title}
        <span className="ml-auto text-xs font-normal text-muted-foreground">
          {items.length}
        </span>
      </div>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((it, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm">
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dotClass}`} />
              <div>
                <div className="font-medium">{it.date}</div>
                <div className="text-xs text-muted-foreground">{it.text}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
