import { type FormEvent, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { LockKeyhole, LogIn, Mail } from "lucide-react";
import { auth } from "../firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
    } catch (error) {
      console.error("Firebase login failed:", error);

      setError(
        "Incorrect email address or password. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8"
      style={{
        background:
          "radial-gradient(circle at top, #102035 0%, #070b13 45%, #030509 100%)",
        color: "#e2e8f0",
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[-180px] h-[420px] w-[420px] -translate-x-1/2 rounded-full opacity-20 blur-[100px]"
        style={{ background: "#22d3ee" }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-200px] right-[-120px] h-[420px] w-[420px] rounded-full opacity-10 blur-[120px]"
        style={{ background: "#8b5cf6" }}
      />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950/80 shadow-2xl backdrop-blur-xl">
        <div className="border-b border-slate-800/80 px-7 py-7 text-center sm:px-9">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 shadow-[0_0_30px_rgba(34,211,238,0.15)]">
            <LockKeyhole className="h-8 w-8 text-cyan-400" />
          </div>

          <p className="text-xs font-semibold tracking-[0.28em] text-cyan-400">
            POWER PLAY GAMING ZONE
          </p>

          <h1 className="mt-3 text-2xl font-bold text-white">
            Owner Dashboard
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Sign in to manage gaming sessions, bookings, expenses and reports.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 px-7 py-7 sm:px-9 sm:py-8"
        >
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Email address
            </label>

            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                disabled={loading}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 py-3.5 pl-12 pr-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Password
            </label>

            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                disabled={loading}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 py-3.5 pl-12 pr-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-300"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3.5 text-sm font-bold text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.18)] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogIn className="h-5 w-5" />

            {loading ? "Signing in..." : "Sign in"}
          </button>

          <p className="text-center text-xs leading-5 text-slate-500">
            Access is restricted to the authorized business owner.
          </p>
        </form>
      </div>
    </div>
  );
}