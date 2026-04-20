import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { studentInfo } from "@/lib/mock-data";
import { Upload, Trash2, Sun, Moon } from "lucide-react";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Настройки — Компас" }] }),
});

function SettingsPage() {
  const [notifs, setNotifs] = useState({
    assignments: true,
    deadlines: true,
    grades: true,
    notes: false,
  });
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const toggleTheme = (t: "light" | "dark") => {
    setTheme(t);
    if (t === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  return (
    <div className="px-6 py-6 md:px-10 md:py-8 max-w-3xl">
      <header>
        <h1 className="text-2xl font-bold md:text-3xl">Настройки</h1>
        <p className="mt-1 text-sm text-muted-foreground">Управляй профилем и предпочтениями</p>
      </header>

      <section className="mt-6 rounded-xl border bg-card p-6">
        <h2 className="text-lg font-semibold">Профиль</h2>
        <div className="mt-5 flex items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent text-2xl font-bold text-accent-foreground">
            {studentInfo.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg border bg-background px-4 py-2 text-sm font-medium hover:bg-muted">
            <Upload className="h-4 w-4" />
            Загрузить аватар
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="ФИО" defaultValue={studentInfo.name} />
          <Field label="Email" type="email" defaultValue={studentInfo.email} />
          <Field label="Новый пароль" type="password" placeholder="••••••••" />
          <Field label="Подтверждение пароля" type="password" placeholder="••••••••" />
        </div>

        <div className="mt-6 flex justify-end">
          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
            Сохранить изменения
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-xl border bg-card p-6">
        <h2 className="text-lg font-semibold">Уведомления</h2>
        <ul className="mt-4 space-y-3">
          {[
            { key: "assignments", label: "Новые задания" },
            { key: "deadlines", label: "Напоминания о дедлайнах" },
            { key: "grades", label: "Оценки" },
            { key: "notes", label: "Заметки учителя" },
          ].map((item) => (
            <li key={item.key} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
              <span className="text-sm">{item.label}</span>
              <Toggle
                checked={notifs[item.key as keyof typeof notifs]}
                onChange={(v) => setNotifs((p) => ({ ...p, [item.key]: v }))}
              />
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-xl border bg-card p-6">
        <h2 className="text-lg font-semibold">Тема оформления</h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={() => toggleTheme("light")}
            className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium ${
              theme === "light" ? "border-primary bg-accent text-accent-foreground" : "hover:bg-muted"
            }`}
          >
            <Sun className="h-4 w-4" /> Светлая
          </button>
          <button
            onClick={() => toggleTheme("dark")}
            className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium ${
              theme === "dark" ? "border-primary bg-accent text-accent-foreground" : "hover:bg-muted"
            }`}
          >
            <Moon className="h-4 w-4" /> Тёмная
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 p-6">
        <h2 className="text-lg font-semibold text-destructive">Опасная зона</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Удаление аккаунта необратимо. Все твои данные будут потеряны.
        </p>
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:opacity-90"
          >
            <Trash2 className="h-4 w-4" /> Удалить аккаунт
          </button>
        ) : (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium">Точно удалить?</span>
            <button className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:opacity-90">
              Да, удалить
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="rounded-lg border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Отмена
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <input
        {...props}
        className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition-colors ${
        checked ? "bg-primary" : "bg-muted"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
