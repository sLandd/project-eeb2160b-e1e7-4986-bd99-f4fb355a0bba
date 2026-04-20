import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { subjects, type Subject } from "@/lib/mock-data";
import { SubjectCard } from "@/components/SubjectCard";
import { SubjectDetailPanel } from "@/components/SubjectDetailPanel";

export const Route = createFileRoute("/_app/lessons")({
  component: LessonsPage,
  head: () => ({ meta: [{ title: "Уроки — Компас" }] }),
});

function LessonsPage() {
  const [selected, setSelected] = useState<Subject | null>(null);

  return (
    <div className="px-6 py-6 md:px-10 md:py-8">
      <header>
        <h1 className="text-2xl font-bold md:text-3xl">Уроки</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Выбери предмет, чтобы посмотреть оценки, расписание, заметки и задания
        </p>
      </header>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {subjects.map((s) => (
          <SubjectCard key={s.id} subject={s} onClick={() => setSelected(s)} />
        ))}
      </div>

      {selected && <SubjectDetailPanel subject={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
