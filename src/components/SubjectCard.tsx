import type { Subject } from "@/lib/mock-data";

export function SubjectCard({ subject, onClick }: { subject: Subject; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl border bg-card p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div
        className="absolute inset-y-0 left-0 w-1.5"
        style={{ backgroundColor: subject.color }}
      />
      <div className="flex items-start justify-between gap-3 pl-2">
        <div className="text-3xl">{subject.emoji}</div>
      </div>
      <h3 className="mt-3 pl-2 text-base font-semibold text-foreground">{subject.name}</h3>
      <p className="mt-1 pl-2 text-xs text-muted-foreground">{subject.teacher}</p>
      <div className="mt-4 pl-2 text-xs text-muted-foreground">
        Следующий урок: <span className="text-foreground">{subject.nextLesson}</span>
      </div>
    </button>
  );
}
