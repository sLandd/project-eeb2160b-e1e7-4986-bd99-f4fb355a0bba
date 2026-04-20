import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Compass, GraduationCap, Users } from "lucide-react";
import { classOptions } from "@/lib/mock-data";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  head: () => ({ meta: [{ title: "Регистрация — Компас" }] }),
});

function RegisterPage() {
  const [role, setRole] = useState<"student" | "parent">("student");
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl border bg-card p-8 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Compass className="h-5 w-5" />
          </div>
          <div className="font-display text-xl font-bold">Компас</div>
        </div>

        <h1 className="mt-6 text-2xl font-bold">Создать аккаунт</h1>
        <p className="mt-1 text-sm text-muted-foreground">Выбери роль и заполни данные</p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <RoleCard
            active={role === "student"}
            onClick={() => setRole("student")}
            icon={<GraduationCap className="h-5 w-5" />}
            title="Ученик"
          />
          <RoleCard
            active={role === "parent"}
            onClick={() => setRole("parent")}
            icon={<Users className="h-5 w-5" />}
            title="Родитель"
          />
        </div>

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/" });
          }}
        >
          <Field label="ФИО" placeholder="Иванов Иван Иванович" required />
          <Field label="Email" type="email" placeholder="ivan@school.ru" required />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Пароль" type="password" placeholder="••••••••" required />
            <Field label="Подтверждение" type="password" placeholder="••••••••" required />
          </div>

          {role === "student" && (
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Класс</span>
              <select
                required
                className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                defaultValue=""
              >
                <option value="" disabled>
                  Выберите класс
                </option>
                {classOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          )}

          <button
            type="submit"
            className="h-11 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Зарегистрироваться
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Уже есть аккаунт?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}

function RoleCard({
  active,
  onClick,
  icon,
  title,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
        active ? "border-primary bg-accent text-accent-foreground" : "hover:bg-muted"
      }`}
    >
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-lg ${
          active ? "bg-primary text-primary-foreground" : "bg-muted"
        }`}
      >
        {icon}
      </div>
      <span className="text-sm font-semibold">{title}</span>
    </button>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <input
        {...props}
        className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}
