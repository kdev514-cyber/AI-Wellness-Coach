"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Leaf, LockKeyhole, Mail, Sparkles } from "lucide-react";

import { supabase } from "../../lib/supabase";
import { getAuthFlowStatus } from "../../lib/authFlow";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setMessage("");

    try {
      const cleanEmail = email.trim().toLowerCase();

      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) throw error;

      const flow = await getAuthFlowStatus();

      if (!flow.isLoggedIn || !flow.userId) {
        throw new Error("Login succeeded, but your session could not be loaded.");
      }

      if (flow.hasProfile) {
        router.replace("/dashboard");
        return;
      }

      router.replace("/onboarding");
    } catch (error) {
      console.error("Login error:", error);
      setMessage(error instanceof Error ? error.message : "Could not log in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f8f5] px-5 py-8 sm:px-8 lg:flex lg:items-center lg:justify-center lg:py-12">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[32px] border border-emerald-100 bg-white shadow-xl shadow-emerald-950/5 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative overflow-hidden bg-[#07875f] p-8 text-white sm:p-12 lg:min-h-[680px] lg:p-14">
          <div className="relative z-10 flex h-full flex-col">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold">
              <Leaf className="h-4 w-4" />
              Daily Ally
            </div>

            <div className="my-auto py-14">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
                <Sparkles className="h-7 w-7" />
              </div>
              <h1 className="mt-6 max-w-md text-4xl font-bold leading-tight sm:text-5xl">
                Welcome back to your everyday wellness ally.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-emerald-50">
                Track your day, follow personalized nutrition and movement plans,
                and ask Nalamera for guidance grounded in your progress.
              </p>
            </div>

            <p className="text-sm text-emerald-100">
              Small steps. Clear progress. Every day.
            </p>
          </div>
        </section>

        <section className="flex items-center p-6 sm:p-10 lg:p-14">
          <div className="mx-auto w-full max-w-md">
            <p className="text-sm font-bold tracking-wide text-[#07875f]">
              WELCOME BACK
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">Log in</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Continue your Daily Ally journey.
            </p>

            <form onSubmit={handleLogin} className="mt-8">
              <AuthField
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@example.com"
                autoComplete="email"
                icon={<Mail className="h-5 w-5" />}
              />

              <div className="mt-5">
                <AuthField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  placeholder="Your password"
                  autoComplete="current-password"
                  icon={<LockKeyhole className="h-5 w-5" />}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#07875f] px-5 py-3.5 font-semibold text-white transition hover:bg-[#066f4f] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {loading ? "Checking your account..." : "Log In"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>

              {message && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="text-sm leading-6 text-red-700">{message}</p>
                </div>
              )}

              <div className="mt-8 border-t border-slate-100 pt-6 text-center">
                <p className="text-sm text-slate-500">New to Daily Ally?</p>
                <Link
                  href="/signup"
                  className="mt-2 inline-block font-semibold text-[#07875f] hover:underline"
                >
                  Create an account
                </Link>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

function AuthField({
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  icon,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete: string;
  icon: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
      <div className="flex items-center rounded-xl border border-slate-200 bg-[#fbfcfb] px-4 transition focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-50">
        <span className="mr-3 text-slate-400">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required
          autoComplete={autoComplete}
          className="w-full bg-transparent py-3.5 text-slate-950 outline-none placeholder:text-slate-400"
        />
      </div>
    </div>
  );
}
