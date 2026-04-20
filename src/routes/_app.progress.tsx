import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { studentInfo } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/progress")({
  component: ProgressPage,
  head: () => ({ meta: [{ title: "Прогресс — Компас" }] }),
});

type DayCell = {
  date: Date;
  iso: string;
  level: 0 | 1 | 2 | 3 | 4;
  done: number;
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

    if (!isWeekend) {
      if (r < 0.18) {
        level = 0;
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
  };

  return { weeks, monthLabels, totals };
}

// Stable fixed reference date so SSR & client render identically
const REFERENCE_DATE = new Date("2026-04-21T00:00:00Z");

function ProgressPage() {
  // Build with a stable date — avoids hydration mismatch
  const [data, setData] = useState(() => buildActivity(REFERENCE_DATE));

  useEffect(() => {
    // After hydration, refresh with today's date
    setData(buildActivity(new Date()));
  }, []);

  const { weeks, monthLabels, totals } = data;

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
    rows.push("");
    rows.push("Активность по дням");
    rows.push("Дата;Заданий");
    weeks.flat().forEach((c) => {
      if (c.done > 0) rows.push(`${c.iso};${c.done}`);
    });

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

  return (
    <div className="px-6 py-6 md:px-10 md:py-8">
      <header>
        <h1 className="text-2xl font-bold md:text-3xl">Прогресс</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Активность за последние полгода
        </p>
      </header>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <Stat label="Активных дней" value={String(totals.active)} />
        <Stat label="Выполнено заданий" value={String(totals.done)} />
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
                  fill={levelColor(cell.level)}
                  stroke="color-mix(in oklab, var(--border) 60%, transparent)"
                >
                  <title>
                    {cell.iso} —{" "}
                    {cell.level === 0 ? "Нет активности" : `${cell.done} заданий`}
                  </title>
                </rect>
              )),
            )}
          </svg>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 text-3xl font-bold">{value}</div>
    </div>
  );
}
