import { useState } from "react";
import { X } from "lucide-react";
import type { Subject } from "@/lib/mock-data";
import { StatusBadge } from "./StatusBadge";

const tabs = [
  { id: "grades", label: "Оценки" },
  { id: "schedule", label: "Расписание" },
  { id: "assignments", label: "Задания" },
] as const;

type TabId = (typeof tabs)[number]["id"];

const gradeColor = (g: number) =>
  g >= 5 ? "text-status-graded-foreground bg-status-graded" :
  g >= 4 ? "text-status-submitted-foreground bg-status-submitted" :
  g >= 3 ? "text-status-progress-foreground bg-status-progress" :
  "text-status-overdue-foreground bg-status-overdue";

export function SubjectDetailPanel({ subject, onClose }: { subject: Subject; onClose: () => void }) {
  const [tab, setTab] = useState<TabId>("grades");

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-xl overflow-y-auto bg-card shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b bg-card px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="text-4xl">{subject.emoji}</div>
            <div>
              <h2 className="text-xl font-bold">{subject.name}</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">{subject.teacher}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Закрыть"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b px-6">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                  tab === t.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {tab === "grades" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-4">
                <div className="text-sm text-muted-foreground">Средний балл</div>
                <div className="text-2xl font-bold">{subject.averageGrade.toFixed(1)}</div>
              </div>
              <ul className="space-y-2">
                {subject.grades.length === 0 && (
                  <li className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
                    Оценок пока нет
                  </li>
                )}
                {subject.grades.map((g, i) => (
                  <li key={i} className="flex items-start justify-between gap-3 rounded-lg border p-4">
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{g.title}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{g.date}</div>
                      {g.comment && (
                        <div className="mt-2 text-xs text-muted-foreground">{g.comment}</div>
                      )}
                    </div>
                    <span
                      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${gradeColor(g.grade)}`}
                    >
                      {g.grade}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === "schedule" && (
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left">День</th>
                    <th className="px-3 py-2 text-left">Время</th>
                    <th className="px-3 py-2 text-left">Кабинет</th>
                  </tr>
                </thead>
                <tbody>
                  {subject.schedule.map((s, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-3 py-2.5 font-medium">{s.day}</td>
                      <td className="px-3 py-2.5">{s.time}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{s.room}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "assignments" && (
            <ul className="space-y-3">
              {subject.assignments.length === 0 && (
                <li className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
                  Заданий нет
                </li>
              )}
              {subject.assignments.map((a, i) => (
                <li key={i} className="flex items-center justify-between gap-3 rounded-lg border p-4">
                  <div>
                    <div className="text-sm font-medium">{a.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">Дедлайн: {a.deadline}</div>
                  </div>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
