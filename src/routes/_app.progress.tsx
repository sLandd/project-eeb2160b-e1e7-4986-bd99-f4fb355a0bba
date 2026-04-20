import { createFileRoute } from "@tanstack/react-router";
import { subjects } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/progress")({
  component: ProgressPage,
  head: () => ({ meta: [{ title: "Прогресс — Компас" }] }),
});

function ProgressPage() {
  const allAssignments = subjects.flatMap((s) => s.assignments);
  const submitted = allAssignments.filter((a) => a.status === "submitted" || a.status === "graded").length;
  const overdue = allAssignments.filter((a) => a.status === "overdue").length;
  const total = allAssignments.length;
  const allGrades = subjects.flatMap((s) =>
    s.grades.map((g) => ({ ...g, subject: s.name, emoji: s.emoji })),
  );
  const avg = (
    allGrades.reduce((sum, g) => sum + g.grade, 0) / Math.max(allGrades.length, 1)
  ).toFixed(2);

  const maxGrade = 5;

  return (
    <div className="px-6 py-6 md:px-10 md:py-8">
      <header>
        <h1 className="text-2xl font-bold md:text-3xl">Прогресс</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Твоя успеваемость по всем предметам
        </p>
      </header>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Выполнено заданий" value={`${submitted} / ${total}`} />
        <Stat label="Средний балл" value={avg} highlight />
        <Stat label="Просрочено" value={String(overdue)} danger />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-lg font-semibold">Успеваемость по предметам</h2>
          <ul className="mt-4 space-y-4">
            {subjects.map((s) => {
              const pct = (s.averageGrade / maxGrade) * 100;
              return (
                <li key={s.id}>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span>{s.emoji}</span>
                      <span className="font-medium">{s.name}</span>
                    </div>
                    <span className="font-semibold">{s.averageGrade.toFixed(1)}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: s.color }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-lg font-semibold">Последние оценки</h2>
          <ul className="mt-4 divide-y">
            {allGrades
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 8)
              .map((g, i) => (
                <li key={i} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="text-xl">{g.emoji}</div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{g.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {g.subject} · {g.date}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold ${
                      g.grade >= 5
                        ? "bg-status-graded text-status-graded-foreground"
                        : g.grade >= 4
                          ? "bg-status-submitted text-status-submitted-foreground"
                          : "bg-status-progress text-status-progress-foreground"
                    }`}
                  >
                    {g.grade}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
  danger,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  danger?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-6 ${
        highlight ? "bg-primary text-primary-foreground" : danger ? "bg-status-overdue text-status-overdue-foreground" : "bg-card"
      }`}
    >
      <div className={`text-xs font-medium uppercase tracking-wide ${highlight || danger ? "opacity-80" : "text-muted-foreground"}`}>
        {label}
      </div>
      <div className="mt-3 text-3xl font-bold">{value}</div>
    </div>
  );
}
