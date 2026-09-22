"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Leaf,
  LockKeyhole,
  Mail,
  Sparkles,
} from "lucide-react";

import { supabase } from "../../lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setErrorMessage("");

    try {
      const cleanEmail = email.trim().toLowerCase();

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
      });

      if (error) throw error;

      if (data.session && data.user) {
        router.replace("/onboarding");
        return;
      }

      setMessage(
        "Account created. Please confirm your email, then log in to continue."
      );
    } catch (error) {
      console.error("Signup error:", error);

      if (error instanceof Error) {
        const errorText = error.message.toLowerCase();

        if (
          errorText.includes("rate limit") ||
          errorText.includes("rate_limit") ||
          errorText.includes("too many requests") ||
          errorText.includes("email rate limit exceeded")
        ) {
          setErrorMessage(
            "Too many email requests have been made. Please wait a few minutes before trying again."
          );
        } else if (
          errorText.includes("already registered") ||
          errorText.includes("already exists")
        ) {
          setErrorMessage(
            "An account may already exist with this email. Try logging in instead."
          );
        } else {
          setErrorMessage(error.message);
        }
      } else {
        setErrorMessage("Could not create your account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f8f5] px-5 py-8 sm:px-8 lg:flex lg:items-center lg:justify-center lg:py-12">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[32px] border border-emerald-100 bg-white shadow-xl shadow-emerald-950/5 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative overflow-hidden bg-[#07875f] p-8 text-white sm:p-12 lg:min-h-[700px] lg:p-14">
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
                Build a healthier rhythm, one day at a time.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-emerald-50">
                Create your Daily Ally account to bring your nutrition,
                movement, recovery, tracking and Nalamera guidance together.
              </p>
            </div>

            <p className="text-sm text-emerald-100">
              Your wellness plan should feel personal.
            </p>
          </div>
        </section>

        <section className="flex items-center p-6 sm:p-10 lg:p-14">
          <div className="mx-auto w-full max-w-md">
            <p className="text-sm font-bold tracking-wide text-[#07875f]">
              GET STARTED
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">
              Create your account
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Start building your personalized Daily Ally experience.
            </p>

            <form onSubmit={handleSignup} className="mt-8">
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
                  placeholder="Create a password"
                  autoComplete="new-password"
                  icon={<LockKeyhole className="h-5 w-5" />}
                  minLength={6}
                />
                <p className="mt-2 text-xs text-slate-400">
                  Use at least 6 characters.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#07875f] px-5 py-3.5 font-semibold text-white transition hover:bg-[#066f4f] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {loading ? "Creating account..." : "Create Account"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>

              {message && (
                <div className="mt-5 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                  <p className="text-sm leading-6 text-emerald-700">{message}</p>
                </div>
              )}

              {errorMessage && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="text-sm leading-6 text-red-700">{errorMessage}</p>
                </div>
              )}

              <div className="mt-8 border-t border-slate-100 pt-6 text-center">
                <p className="text-sm text-slate-500">Already have an account?</p>
                <Link
                  href="/login"
                  className="mt-2 inline-block font-semibold text-[#07875f] hover:underline"
                >
                  Log in
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
  minLength,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete: string;
  icon: React.ReactNode;
  minLength?: number;
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
          minLength={minLength}
          autoComplete={autoComplete}
          className="w-full bg-transparent py-3.5 text-slate-950 outline-none placeholder:text-slate-400"
        />
      </div>
    </div>
  );
}
