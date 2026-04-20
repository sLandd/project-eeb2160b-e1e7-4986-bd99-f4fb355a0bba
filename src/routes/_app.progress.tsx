import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { subjects, studentInfo } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/progress")({
  component: ProgressPage,
  head: () => ({ meta: [{ title: "Прогресс — Компас" }] }),
});

function ProgressPage() {
  const allAssignments = subjects.flatMap((s) => s.assignments);
  const submitted = allAssignments.filter(
    (a) => a.status === "submitted" || a.status === "graded",
  ).length;
  const overdue = allAssignments.filter((a) => a.status === "overdue").length;
  const total = allAssignments.length;
  const allGrades = subjects.flatMap((s) =>
    s.grades.map((g) => ({ ...g, subject: s.name, emoji: s.emoji })),
  );

  const maxGrade = 5;

  const handleDownloadReport = () => {
    const rows: string[] = [];
    rows.push("Отчёт об успеваемости");
    rows.push(`Ученик;${studentInfo.name}`);
    rows.push(`Класс;${studentInfo.class}`);
    rows.push(`Email;${studentInfo.email}`);
    rows.push(`Дата формирования;${new Date().toLocaleDateString("ru-RU")}`);
    rows.push("");
    rows.push("Сводка");
    rows.push(`Выполнено заданий;${submitted} из ${total}`);
    rows.push(`Просрочено;${overdue}`);
    rows.push("");
    rows.push("Успеваемость по предметам");
    rows.push("Предмет;Учитель;Средний балл");
    subjects.forEach((s) => {
      rows.push(`${s.name};${s.teacher};${s.averageGrade.toFixed(2)}`);
    });
    rows.push("");
    rows.push("Все оценки");
    rows.push("Предмет;Работа;Дата;Оценка;Комментарий");
    allGrades
      .sort((a, b) => b.date.localeCompare(a.date))
      .forEach((g) => {
        rows.push(
          `${g.subject};${g.title};${g.date};${g.grade};${g.comment.replace(/;/g, ",")}`,
        );
      });

    const csv = "\uFEFF" + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Отчёт_прогресс_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="px-6 py-6 md:px-10 md:py-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Прогресс</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Твоя успеваемость по всем предметам
          </p>
        </div>
        <button
          onClick={handleDownloadReport}
          className="flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
        >
          <Download className="h-4 w-4" />
          Скачать отчёт
        </button>
      </header>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <Stat label="Выполнено заданий" value={`${submitted} / ${total}`} />
        <Stat label="Просрочено" value={String(overdue)} danger />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <BarChartCard />
        <LineChartCard />
      </section>
    </div>
  );

  function BarChartCard() {
    return (
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Средний балл по предметам</h2>
          <span className="text-xs text-muted-foreground">шкала 0–5</span>
        </div>

        <div className="mt-5 space-y-4">
          {subjects.map((s) => {
            const pct = (s.averageGrade / maxGrade) * 100;
            return (
              <div key={s.id} className="grid grid-cols-[140px_1fr_40px] items-center gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <span>{s.emoji}</span>
                  <span className="truncate font-medium">{s.name}</span>
                </div>
                <div className="relative h-7 overflow-hidden rounded-md bg-muted">
                  <div
                    className="flex h-full items-center justify-end rounded-md pr-2 text-[11px] font-semibold text-white shadow-sm transition-all"
                    style={{ width: `${pct}%`, backgroundColor: s.color }}
                  >
                    {s.averageGrade.toFixed(1)}
                  </div>
                </div>
                <span className="text-right text-xs text-muted-foreground">
                  {Math.round(pct)}%
                </span>
              </div>
            );
          })}
        </div>

        {/* Grid scale */}
        <div className="mt-5 grid grid-cols-[140px_1fr_40px] gap-3">
          <div />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>0</span>
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
          </div>
          <div />
        </div>
      </div>
    );
  }

  function LineChartCard() {
    const recent = [...allGrades].sort((a, b) => a.date.localeCompare(b.date)).slice(-10);

    const width = 520;
    const height = 220;
    const padding = { top: 20, right: 16, bottom: 32, left: 28 };
    const innerW = width - padding.left - padding.right;
    const innerH = height - padding.top - padding.bottom;

    const yMin = 2;
    const yMax = 5;
    const xStep = recent.length > 1 ? innerW / (recent.length - 1) : 0;

    const points = recent.map((g, i) => {
      const x = padding.left + i * xStep;
      const y =
        padding.top + innerH - ((g.grade - yMin) / (yMax - yMin)) * innerH;
      return { x, y, ...g };
    });

    const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
    const area =
      points.length > 0
        ? `${path} L${points[points.length - 1].x},${padding.top + innerH} L${points[0].x},${padding.top + innerH} Z`
        : "";

    const yTicks = [2, 3, 4, 5];

    return (
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Динамика последних оценок</h2>
          <span className="text-xs text-muted-foreground">{recent.length} работ</span>
        </div>

        <div className="mt-4 w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Y grid */}
            {yTicks.map((t) => {
              const y = padding.top + innerH - ((t - yMin) / (yMax - yMin)) * innerH;
              return (
                <g key={t}>
                  <line
                    x1={padding.left}
                    x2={width - padding.right}
                    y1={y}
                    y2={y}
                    stroke="var(--border)"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 3}
                    textAnchor="end"
                    fontSize="10"
                    fill="var(--muted-foreground)"
                  >
                    {t}
                  </text>
                </g>
              );
            })}

            {/* Area */}
            {area && <path d={area} fill="url(#lineFill)" />}
            {/* Line */}
            {path && (
              <path
                d={path}
                fill="none"
                stroke="var(--primary)"
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}

            {/* Points */}
            {points.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="4" fill="var(--card)" stroke="var(--primary)" strokeWidth="2" />
                <text
                  x={p.x}
                  y={padding.top + innerH + 18}
                  textAnchor="middle"
                  fontSize="10"
                  fill="var(--muted-foreground)"
                >
                  {p.date.slice(5)}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <ul className="mt-4 flex flex-wrap gap-2">
          {recent.slice(-5).map((g, i) => (
            <li
              key={i}
              className="flex items-center gap-1.5 rounded-full border bg-muted/40 px-2.5 py-1 text-xs"
            >
              <span>{g.emoji}</span>
              <span className="text-muted-foreground">{g.subject}</span>
              <span className="font-semibold">{g.grade}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

function Stat({
  label,
  value,
  danger,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-6 ${
        danger ? "bg-status-overdue text-status-overdue-foreground" : "bg-card"
      }`}
    >
      <div
        className={`text-xs font-medium uppercase tracking-wide ${
          danger ? "opacity-80" : "text-muted-foreground"
        }`}
      >
        {label}
      </div>
      <div className="mt-3 text-3xl font-bold">{value}</div>
    </div>
  );
}
