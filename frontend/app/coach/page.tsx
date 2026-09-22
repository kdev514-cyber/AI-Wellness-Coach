"use client";

import { FormEvent, useState } from "react";
import {
  Bot,
  CalendarDays,
  ChartNoAxesCombined,
  Dumbbell,
  Moon,
  Salad,
  Send,
  Sparkles,
  Target,
} from "lucide-react";
import AppSidebar from "../../components/AppSidebar";
import { supabase } from "../../lib/supabase";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function CoachPage() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  async function askCoach(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    const cleanQuestion = question.trim();
    if (!cleanQuestion) return;

    if (!API_BASE_URL) {
      setError("Nalamera backend is not configured.");
      return;
    }

    setLoading(true);
    setError("");

    setMessages((previous) => [
      ...previous,
      { role: "user", content: cleanQuestion },
    ]);
    setQuestion("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) throw new Error("You must be logged in.");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        console.error("Profile context error:", profileError);
        throw new Error(
          profileError?.message || "Could not load your wellness profile."
        );
      }

      const { data: nutritionPlan, error: nutritionError } = await supabase
        .from("nutrition_plans")
        .select(
          `
          daily_calories,
          protein_grams,
          water_litres,
          weekly_plan
          `
        )
        .eq("user_id", user.id)
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (nutritionError) {
        console.error("Nutrition context error:", nutritionError);
      }

      const { data: workoutPlan, error: workoutError } = await supabase
        .from("workout_plans")
        .select(
          `
          workout_days,
          weekly_plan
          `
        )
        .eq("user_id", user.id)
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (workoutError) {
        console.error("Workout context error:", workoutError);
      }

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      const startDate = sevenDaysAgo.toLocaleDateString("en-CA");

      const { data: trackerHistory, error: trackerError } = await supabase
        .from("daily_tracker")
        .select(
          `
          tracker_date,
          breakfast_completed,
          lunch_completed,
          dinner_completed,
          workout_completed,
          water_litres,
          steps,
          sleep_hours,
          weight_kg,
          mood,
          energy,
          notes
          `
        )
        .eq("user_id", user.id)
        .gte("tracker_date", startDate)
        .order("tracker_date", { ascending: true });

      if (trackerError) {
        console.error("Tracker context error:", trackerError);
      }

      const response = await fetch(`${API_BASE_URL}/coach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: cleanQuestion,
          profile,
          nutrition_plan: nutritionPlan,
          workout_plan: workoutPlan,
          tracker_history: trackerHistory || [],
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error("Nalamera returned an invalid response.");
      }

      if (!response.ok) {
        throw new Error(data?.error || `Backend error: ${response.status}`);
      }
      if (!data.success) {
        throw new Error(data.error || "Nalamera could not answer.");
      }
      if (!data.answer) {
        throw new Error("Nalamera returned an empty answer.");
      }

      setMessages((previous) => [
        ...previous,
        { role: "assistant", content: data.answer },
      ]);
    } catch (err) {
      console.error("Nalamera error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const quickQuestions = [
    {
      icon: <ChartNoAxesCombined size={22} />,
      title: "Weekly Review",
      question: "Give me a review of how I am doing this week.",
    },
    {
      icon: <Target size={22} />,
      title: "What to Improve",
      question:
        "What are the most important things I should improve based on my recent progress?",
    },
    {
      icon: <Moon size={22} />,
      title: "Sleep",
      question: "How has my sleep been recently and what should I focus on?",
    },
    {
      icon: <Dumbbell size={22} />,
      title: "Workout Consistency",
      question: "How consistent have I been with my workouts?",
    },
    {
      icon: <Salad size={22} />,
      title: "Meal Adherence",
      question: "How well have I followed my nutrition plan recently?",
    },
    {
      icon: <CalendarDays size={22} />,
      title: "Tomorrow",
      question:
        "Based on my plan and recent progress, what should I focus on tomorrow?",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f4f8f5] lg:flex">
      <AppSidebar />

      <section className="min-w-0 flex-1 px-4 pb-10 pt-20 sm:px-6 lg:p-10">
        <div className="mx-auto w-full max-w-6xl">
          <p className="text-sm font-semibold tracking-wide text-[#58708f]">
            PERSONAL GUIDANCE
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">
            Ask Nalamera
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Your AI wellness companion, grounded in your plan and recent Daily
            Tracker activity.
          </p>

          <div className="mt-8 overflow-hidden rounded-[28px] bg-[#07875f] p-6 text-white shadow-sm sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                <Bot size={28} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">Nalamera knows your context</h2>
                  <Sparkles size={18} className="text-emerald-100" />
                </div>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-emerald-50">
                  Before answering, Nalamera can use your profile, active
                  nutrition and workout plans, plus recent meals, movement,
                  sleep, water, steps, mood and energy.
                </p>
              </div>
            </div>
          </div>

          {messages.length === 0 && (
            <section className="mt-9">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#07875f]">
                Quick guidance
              </p>
              <h2 className="mt-2 text-xl font-bold text-slate-950">
                What would you like to understand?
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Pick a prompt or write your own question below.
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {quickQuestions.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => setQuestion(item.question)}
                    className="group rounded-[22px] border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e9f6ee] text-[#07875f] transition group-hover:bg-[#07875f] group-hover:text-white">
                      {item.icon}
                    </div>
                    <p className="mt-4 font-bold text-slate-950">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {item.question}
                    </p>
                  </button>
                ))}
              </div>
            </section>
          )}

          {messages.length > 0 && (
            <section className="mt-9 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="space-y-5">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={
                      message.role === "user"
                        ? "flex justify-end"
                        : "flex justify-start"
                    }
                  >
                    <div
                      className={
                        message.role === "user"
                          ? "max-w-2xl rounded-[20px] rounded-br-md bg-[#07875f] px-5 py-4 text-white"
                          : "max-w-3xl rounded-[20px] rounded-bl-md bg-[#f0f7f3] px-5 py-4 text-slate-800"
                      }
                    >
                      {message.role === "assistant" && (
                        <div className="mb-3 flex items-center gap-2 text-xs font-bold tracking-wide text-[#07875f]">
                          <Bot size={15} />
                          NALAMERA
                        </div>
                      )}
                      <p className="whitespace-pre-wrap break-words leading-7 [overflow-wrap:anywhere]">
                        {message.content}
                      </p>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-[20px] rounded-bl-md bg-[#f0f7f3] px-5 py-4">
                      <div className="flex items-center gap-2 text-xs font-bold tracking-wide text-[#07875f]">
                        <Sparkles size={15} />
                        NALAMERA
                      </div>
                      <p className="mt-2 text-sm text-slate-600">
                        Analyzing your recent wellness data...
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="font-semibold text-red-700">Nalamera Error</p>
              <p className="mt-1 text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={askCoach} className="mb-10 mt-7">
            <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm focus-within:border-emerald-300 focus-within:ring-4 focus-within:ring-emerald-50">
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask Nalamera about your wellness..."
                rows={4}
                disabled={loading}
                className="w-full resize-none bg-transparent text-slate-950 outline-none placeholder:text-slate-400"
              />

              <div className="mt-4 flex flex-col gap-4 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-400">
                  General wellness guidance — not medical advice.
                </p>

                <button
                  type="submit"
                  disabled={loading || !question.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#07875f] px-6 py-3 font-semibold text-white transition hover:bg-[#066f4f] disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {loading ? (
                    <>
                      <Sparkles size={18} />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Ask Nalamera
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
