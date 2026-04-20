import { useState } from "react";
import { X } from "lucide-react";
import type { Subject } from "@/lib/mock-data";
import { StatusBadge } from "./StatusBadge";

const tabs = [
  { id: "grades", label: "Оценки" },
  { id: "schedule", label: "Расписание" },
  { id: "notes", label: "Заметки учителя" },
  { id: "assignments", label: "Задания" },
] as const;

type TabId = (typeof tabs)[number]["id"];

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
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
                  Средний: {subject.averageGrade.toFixed(1)}
                </span>
              </div>
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
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left">Работа</th>
                    <th className="px-3 py-2 text-left">Дата</th>
                    <th className="px-3 py-2 text-left">Оценка</th>
                    <th className="px-3 py-2 text-left">Комментарий</th>
                  </tr>
                </thead>
                <tbody>
                  {subject.grades.length === 0 && (
                    <tr><td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">Оценок пока нет</td></tr>
                  )}
                  {subject.grades.map((g, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-3 py-2.5">{g.title}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{g.date}</td>
                      <td className="px-3 py-2.5">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-status-graded font-semibold text-status-graded-foreground">
                          {g.grade}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">{g.comment || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

          {tab === "notes" && (
            <ul className="space-y-3">
              {subject.notes.length === 0 && (
                <li className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
                  Заметок от учителя пока нет
                </li>
              )}
              {subject.notes.map((n, i) => (
                <li key={i} className="rounded-lg border p-4">
                  <div className="text-xs text-muted-foreground">{n.date}</div>
                  <p className="mt-1 text-sm">{n.text}</p>
                </li>
              ))}
            </ul>
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
