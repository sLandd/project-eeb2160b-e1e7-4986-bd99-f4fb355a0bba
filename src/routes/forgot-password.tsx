import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Compass, ArrowLeft, MailCheck } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
  head: () => ({ meta: [{ title: "Восстановление пароля — Компас" }] }),
});

function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Compass className="h-5 w-5" />
          </div>
          <div className="font-display text-xl font-bold">Компас</div>
        </div>

        {!sent ? (
          <>
            <h1 className="mt-6 text-2xl font-bold">Забыли пароль?</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Введите email — мы отправим ссылку для сброса пароля
            </p>

            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">Email</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ivan@school.ru"
                  className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </label>

              <button
                type="submit"
                className="h-11 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                Отправить ссылку
              </button>
            </form>
          </>
        ) : (
          <div className="mt-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <MailCheck className="h-6 w-6" />
            </div>
            <h1 className="mt-4 text-2xl font-bold">Проверьте почту</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Мы отправили ссылку для восстановления пароля на
              <br />
              <span className="font-medium text-foreground">{email}</span>
            </p>
          </div>
        )}

        <Link
          to="/login"
          className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Вернуться ко входу
        </Link>
      </div>
    </div>
  );
}
