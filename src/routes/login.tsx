import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Compass } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Вход — Компас" }] }),
});

function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Compass className="h-5 w-5" />
          </div>
          <div className="font-display text-xl font-bold">Компас</div>
        </div>

        <h1 className="mt-6 text-2xl font-bold">Войти в аккаунт</h1>
        <p className="mt-1 text-sm text-muted-foreground">Введи данные для входа</p>

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/" });
          }}
        >
          <Field label="Email" type="email" placeholder="ivan@school.ru" required />
          <Field label="Пароль" type="password" placeholder="••••••••" required />

          <div className="text-right">
            <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
              Забыли пароль?
            </Link>
          </div>

          <button
            type="submit"
            className="h-11 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Войти
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Нет аккаунта?{" "}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
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
