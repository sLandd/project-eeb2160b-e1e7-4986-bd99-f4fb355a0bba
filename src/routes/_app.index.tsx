import { createFileRoute, Link } from "@tanstack/react-router";
import { subjects, studentInfo } from "@/lib/mock-data";
import { StatusBadge } from "@/components/StatusBadge";
import { Search, Bell } from "lucide-react";

export const Route = createFileRoute("/_app/")({
  component: HomePage,
  head: () => ({ meta: [{ title: "Главная — Компас" }] }),
});

function HomePage() {
  const allAssignments = subjects.flatMap((s) =>
    s.assignments.map((a) => ({ ...a, subject: s.name, emoji: s.emoji })),
  );
  const overdue = allAssignments.filter((a) => a.status === "overdue");
  const inProgress = allAssignments.filter((a) => a.status === "progress");
  const todo = allAssignments.filter((a) => a.status === "todo");

  const avg = (
    subjects.reduce((sum, s) => sum + s.averageGrade, 0) / subjects.length
  ).toFixed(2);

  return (
    <div className="px-6 py-6 md:px-10 md:py-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Главная</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Привет, {studentInfo.name.split(" ")[0]} 👋 Класс {studentInfo.class}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Поиск по задачам…"
              className="h-10 w-64 rounded-lg border bg-card pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-lg border bg-card text-muted-foreground hover:text-foreground">
            <Bell className="h-4 w-4" />
          </button>
        </div>
      </header>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Средний балл" value={avg} accent="primary" />
        <StatCard label="Просрочено" value={String(overdue.length)} accent="overdue" />
        <StatCard label="В работе" value={String(inProgress.length)} accent="progress" />
        <StatCard label="Не начато" value={String(todo.length)} accent="todo" />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Ближайшие задания</h2>
            <Link to="/lessons" className="text-sm font-medium text-primary hover:underline">
              Все уроки →
            </Link>
          </div>
          <ul className="space-y-2">
            {[...overdue, ...inProgress, ...todo].slice(0, 8).map((a, i) => (
              <li
                key={i}
                className="relative flex items-center justify-between gap-3 rounded-xl border bg-card p-4 pl-5"
              >
                <div
                  className={`absolute inset-y-0 left-0 w-1 rounded-l-xl ${
                    a.status === "overdue"
                      ? "bg-status-overdue-foreground"
                      : a.status === "progress"
                        ? "bg-status-progress-foreground"
                        : "bg-border"
                  }`}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span>{a.emoji}</span>
                    <span className="truncate text-sm font-medium">{a.title}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full bg-muted px-2 py-0.5">{a.subject}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5">{a.deadline}</span>
                  </div>
                </div>
                <StatusBadge status={a.status} />
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Сегодня в расписании</h2>
          <div className="rounded-xl border bg-card p-5">
            <ul className="space-y-3">
              {subjects.slice(0, 4).map((s) => (
                <li key={s.id} className="flex items-center gap-3">
                  <div className="text-2xl">{s.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.schedule[0]?.time ?? "—"}</div>
                  </div>
                  <span className="text-xs text-muted-foreground">{s.schedule[0]?.room ?? ""}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "primary" | "overdue" | "progress" | "todo";
}) {
  const accents = {
    primary: "bg-accent text-accent-foreground",
    overdue: "bg-status-overdue text-status-overdue-foreground",
    progress: "bg-status-progress text-status-progress-foreground",
    todo: "bg-status-todo text-status-todo-foreground",
  };
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-3 flex items-end justify-between">
        <div className="text-3xl font-bold">{value}</div>
        <div className={`h-8 w-8 rounded-lg ${accents[accent]}`} />
      </div>
    </div>
  );
}
