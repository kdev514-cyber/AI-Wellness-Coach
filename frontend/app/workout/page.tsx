"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  Clock3,
  Dumbbell,
  HeartPulse,
  RefreshCw,
  Sparkles,
  TimerReset,
} from "lucide-react";

import AppSidebar from "../../components/AppSidebar";
import { supabase } from "../../lib/supabase";

type Exercise = {
  name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
};

type Cardio = {
  activity: string;
  duration_minutes: number;
};

type WorkoutDay = {
  day: string;
  type: "workout" | "rest";
  focus: string;
  duration_minutes: number;
  warmup: string[];
  exercises: Exercise[];
  cardio: Cardio | null;
  cooldown: string[];
};

type WorkoutPlan = {
  workout_days: number;
  days: WorkoutDay[];
};

export default function WorkoutPage() {
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [loading, setLoading] = useState(false);
  const [loadingSavedPlan, setLoadingSavedPlan] = useState(true);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    async function loadSavedPlan() {
      setLoadingSavedPlan(true);
      setErrorMessage("");

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw new Error(userError.message);
        if (!user) throw new Error("You are not logged in.");

        const { data, error: savedPlanError } = await supabase
          .from("workout_plans")
          .select(
            `
            workout_days,
            weekly_plan,
            created_at
            `
          )
          .eq("user_id", user.id)
          .eq("active", true)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (savedPlanError) {
          console.error("Workout saved plan message:", savedPlanError.message);
          console.error("Workout saved plan code:", savedPlanError.code);
          console.error("Workout saved plan details:", savedPlanError.details);
          throw new Error(
            savedPlanError.message || "Could not load your saved workout plan."
          );
        }

        if (
          data &&
          Array.isArray(data.weekly_plan) &&
          data.weekly_plan.length === 7
        ) {
          setPlan({
            workout_days: Number(data.workout_days),
            days: data.weekly_plan,
          });

          setSelectedDay(data.weekly_plan[0]?.day || "Monday");
        }
      } catch (err) {
        console.error("Workout load error:", err);

        if (err instanceof Error) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage("Could not load your workout plan.");
        }
      } finally {
        setLoadingSavedPlan(false);
      }
    }

    loadSavedPlan();
  }, []);

  async function generatePlan() {
    if (loading) return;

    setLoading(true);
    setErrorMessage("");
    setMessage("Loading your wellness profile...");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("You must be logged in.");
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        console.error("Workout profile error:", profileError);
        throw new Error(
          profileError?.message || "Could not load your wellness profile."
        );
      }

      setMessage("Nalamera is creating your weekly workout plan...");

      const apiUrl = `${API_BASE_URL}/workout-plan`;
      console.log("Calling workout API:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profile }),
      });

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error("The backend returned an invalid response.");
      }

      if (!response.ok) {
        throw new Error(data?.error || `Backend error: ${response.status}`);
      }

      if (!data.success) {
        throw new Error(
          data.error || "AI could not generate your workout plan."
        );
      }

      if (!data.plan) {
        throw new Error("Backend did not return a workout plan.");
      }

      const newPlan = data.plan as WorkoutPlan;

      if (!Array.isArray(newPlan.days) || newPlan.days.length !== 7) {
        console.error("Invalid workout plan:", newPlan);
        throw new Error("AI returned an invalid workout plan.");
      }

      const { error: deactivateError } = await supabase
        .from("workout_plans")
        .update({ active: false })
        .eq("user_id", user.id)
        .eq("active", true);

      if (deactivateError) {
        console.error("Workout deactivate error:", deactivateError.message);
      }

      const { error: saveError } = await supabase
        .from("workout_plans")
        .insert({
          user_id: user.id,
          workout_days: newPlan.workout_days,
          weekly_plan: newPlan.days,
          active: true,
        });

      if (saveError) {
        console.error("Workout save message:", saveError.message);
        console.error("Workout save code:", saveError.code);
        console.error("Workout save details:", saveError.details);

        throw new Error(
          saveError.message ||
            "Workout plan was generated but could not be saved."
        );
      }

      setPlan(newPlan);
      setSelectedDay(newPlan.days[0]?.day || "Monday");
      setMessage("");
    } catch (err) {
      console.error("Workout generation error:", err);

      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Something went wrong.");
      }

      setMessage("");
    } finally {
      setLoading(false);
    }
  }

  const currentDay = plan?.days?.find((day) => day.day === selectedDay);

  function generateNewPlan() {
    setPlan(null);
    setSelectedDay("Monday");
    setErrorMessage("");
    setMessage("");
  }

  return (
    <main className="min-h-screen bg-[#f4f8f5] lg:flex">
      <AppSidebar />

      <section className="min-w-0 flex-1 px-4 pb-12 pt-20 sm:px-6 lg:p-10">
        <div className="mx-auto w-full max-w-7xl min-w-0">
          <div>
            <p className="text-sm font-semibold tracking-wide text-[#58708f]">
              YOUR TRAINING
            </p>

            <h1 className="mt-2 text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">
              Workout
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Build strength, move consistently, and give your body the
              recovery it needs.
            </p>
          </div>

          {loadingSavedPlan && (
            <div className="mt-8 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm sm:mt-10 sm:p-8">
              <div className="flex items-center gap-3 text-slate-600">
                <RefreshCw className="h-5 w-5 animate-spin text-[#07875f]" />
                <p>Loading your weekly training plan...</p>
              </div>
            </div>
          )}

          {!loadingSavedPlan && errorMessage && !plan && (
            <div className="mt-8 rounded-[24px] border border-red-200 bg-red-50 p-6">
              <p className="font-semibold text-red-700">Workout data error</p>
              <p className="mt-2 text-sm leading-6 text-red-600">
                {errorMessage}
              </p>
            </div>
          )}

          {!loadingSavedPlan && !plan && (
            <div className="mt-8 overflow-hidden rounded-[28px] bg-[#07875f] p-6 text-white shadow-sm sm:mt-10 sm:p-9">
              <div className="flex max-w-3xl flex-col items-start">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold">
                  <Sparkles className="h-4 w-4" />
                  Nalamera training plan
                </div>

                <h2 className="mt-5 text-2xl font-bold sm:text-3xl">
                  Create a week that works for you.
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50 sm:text-base">
                  Nalamera uses your wellness profile, goals, available time,
                  activity level and preferred training days to build your
                  weekly workout plan.
                </p>

                <button
                  type="button"
                  onClick={generatePlan}
                  disabled={loading}
                  className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-[#07694c] transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Generating plan...
                    </>
                  ) : (
                    <>
                      Generate Workout Plan
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                {message && (
                  <div className="mt-5 rounded-xl bg-white/12 px-4 py-3 text-sm text-emerald-50">
                    {message}
                  </div>
                )}
              </div>
            </div>
          )}

          {plan && Array.isArray(plan.days) && (
            <>
              <div className="mt-8 overflow-hidden rounded-[28px] bg-[#07875f] p-6 text-white shadow-sm sm:mt-10 sm:p-8">
                <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold">
                      <Dumbbell className="h-4 w-4" />
                      This week
                    </div>

                    <h2 className="mt-4 text-2xl font-bold sm:text-3xl">
                      Keep your week moving.
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-50 sm:text-base">
                      Your plan balances training and recovery so you can build
                      consistency without ignoring rest.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={generateNewPlan}
                    className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Generate New Plan
                  </button>
                </div>

                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/12 p-5">
                    <p className="text-sm text-emerald-100">Training days</p>
                    <div className="mt-2 flex items-end gap-2">
                      <span className="text-4xl font-bold">
                        {plan.workout_days}
                      </span>
                      <span className="pb-1 text-sm text-emerald-100">
                        days this week
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/12 p-5">
                    <p className="text-sm text-emerald-100">Recovery days</p>
                    <div className="mt-2 flex items-end gap-2">
                      <span className="text-4xl font-bold">
                        {7 - plan.workout_days}
                      </span>
                      <span className="pb-1 text-sm text-emerald-100">
                        days to recharge
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 overflow-x-auto rounded-[24px] border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
                <div className="flex min-w-max gap-2">
                  {plan.days.map((day) => {
                    const active = selectedDay === day.day;

                    return (
                      <button
                        key={day.day}
                        type="button"
                        onClick={() => setSelectedDay(day.day)}
                        className={`min-w-[74px] rounded-xl px-4 py-3 text-center transition ${
                          active
                            ? "bg-[#07875f] text-white shadow-sm"
                            : "bg-[#f3f7f4] text-slate-600 hover:bg-[#e7f2eb] hover:text-[#07694c]"
                        }`}
                      >
                        <span className="block text-sm font-semibold">
                          {day.day.slice(0, 3)}
                        </span>
                        <span
                          className={`mt-1 block text-[11px] ${
                            active ? "text-emerald-100" : "text-slate-400"
                          }`}
                        >
                          {day.type === "workout" ? "Train" : "Rest"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {currentDay && (
                <section className="mt-7">
                  <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#07875f]">
                          {currentDay.type === "workout"
                            ? "Training day"
                            : "Recovery day"}
                        </p>

                        <h2 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">
                          {currentDay.day}
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
                          {currentDay.focus}
                        </p>
                      </div>

                      <div className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#edf7f1] px-4 py-3 font-semibold text-[#07694c]">
                        <Clock3 className="h-4 w-4" />
                        {currentDay.duration_minutes} min
                      </div>
                    </div>
                  </div>

                  {currentDay.type === "rest" && (
                    <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
                      <div className="rounded-[26px] border border-emerald-100 bg-[#eaf7f0] p-6 sm:p-7">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#07875f] shadow-sm">
                          <HeartPulse className="h-5 w-5" />
                        </div>

                        <h3 className="mt-5 text-xl font-bold text-slate-950">
                          Recovery is part of the plan
                        </h3>

                        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                          Keep today easy. Prioritize light movement, mobility,
                          hydration and enough rest so you are ready for your
                          next training day.
                        </p>

                        {currentDay.cardio && (
                          <div className="mt-5 rounded-2xl bg-white p-5">
                            <p className="text-xs font-bold uppercase tracking-wide text-[#07875f]">
                              Light activity
                            </p>
                            <p className="mt-2 font-semibold text-slate-900">
                              {currentDay.cardio.activity}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              {currentDay.cardio.duration_minutes} minutes
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef6ff] text-[#4773a8]">
                            <Activity className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                              Mobility
                            </p>
                            <h3 className="font-bold text-slate-950">
                              Move gently
                            </h3>
                          </div>
                        </div>

                        <div className="mt-5 space-y-3">
                          {Array.isArray(currentDay.cooldown) &&
                          currentDay.cooldown.length > 0 ? (
                            currentDay.cooldown.map((item, index) => (
                              <div
                                key={`${item}-${index}`}
                                className="flex gap-3 rounded-xl bg-slate-50 px-4 py-3"
                              >
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#dff1e6] text-xs font-bold text-[#07875f]">
                                  {index + 1}
                                </span>
                                <p className="text-sm leading-6 text-slate-600">
                                  {item}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-slate-500">
                              Keep movement light and comfortable today.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {currentDay.type === "workout" && (
                    <>
                      <div className="mt-5 rounded-[26px] border border-emerald-100 bg-[#edf8f2] p-6 sm:p-7">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#07875f] shadow-sm">
                            <Activity className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-[#07875f]">
                              Step 1
                            </p>
                            <h3 className="text-xl font-bold text-slate-950">
                              Warm-up
                            </h3>
                          </div>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                          {Array.isArray(currentDay.warmup) &&
                            currentDay.warmup.map((item, index) => (
                              <div
                                key={`${item}-${index}`}
                                className="flex items-start gap-3 rounded-2xl bg-white px-4 py-4 shadow-sm"
                              >
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#dff1e6] text-xs font-bold text-[#07875f]">
                                  {index + 1}
                                </span>
                                <p className="text-sm leading-6 text-slate-700">
                                  {item}
                                </p>
                              </div>
                            ))}
                        </div>
                      </div>

                      <div className="mt-5 rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e9f6ee] text-[#07875f]">
                            <Dumbbell className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-[#07875f]">
                              Step 2
                            </p>
                            <h3 className="text-xl font-bold text-slate-950">
                              Exercises
                            </h3>
                          </div>
                        </div>

                        <div className="mt-6 space-y-3">
                          {Array.isArray(currentDay.exercises) &&
                            currentDay.exercises.map((exercise, index) => (
                              <div
                                key={`${exercise.name}-${index}`}
                                className="rounded-2xl border border-slate-100 bg-[#fbfcfb] p-4 transition hover:border-emerald-100 sm:p-5"
                              >
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                  <div className="flex min-w-0 items-center gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#07875f] font-bold text-white">
                                      {index + 1}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="break-words font-bold text-slate-950">
                                        {exercise.name}
                                      </p>
                                      <p className="mt-1 text-xs text-slate-500">
                                        Complete with controlled form
                                      </p>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-3 gap-2 sm:flex">
                                    <ExerciseStat
                                      label="Sets"
                                      value={String(exercise.sets)}
                                    />
                                    <ExerciseStat
                                      label="Reps"
                                      value={exercise.reps}
                                    />
                                    <ExerciseStat
                                      label="Rest"
                                      value={`${exercise.rest_seconds}s`}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>

                      {currentDay.cardio && (
                        <div className="mt-5 rounded-[26px] border border-orange-100 bg-[#fff8ef] p-6 sm:p-7">
                          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#c46b20] shadow-sm">
                                <HeartPulse className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="text-xs font-bold uppercase tracking-wide text-[#b96520]">
                                  Cardio
                                </p>
                                <h3 className="mt-1 text-lg font-bold text-slate-950">
                                  {currentDay.cardio.activity}
                                </h3>
                              </div>
                            </div>

                            <div className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-3 font-semibold text-[#9a571e] shadow-sm">
                              <TimerReset className="h-4 w-4" />
                              {currentDay.cardio.duration_minutes} min
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-5 rounded-[26px] border border-sky-100 bg-[#f0f7fb] p-6 sm:p-7">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#4773a8] shadow-sm">
                            <Activity className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-[#4773a8]">
                              Final step
                            </p>
                            <h3 className="text-xl font-bold text-slate-950">
                              Cool-down
                            </h3>
                          </div>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                          {Array.isArray(currentDay.cooldown) &&
                            currentDay.cooldown.map((item, index) => (
                              <div
                                key={`${item}-${index}`}
                                className="flex items-start gap-3 rounded-2xl bg-white px-4 py-4 shadow-sm"
                              >
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e5f0f7] text-xs font-bold text-[#4773a8]">
                                  {index + 1}
                                </span>
                                <p className="text-sm leading-6 text-slate-700">
                                  {item}
                                </p>
                              </div>
                            ))}
                        </div>
                      </div>
                    </>
                  )}
                </section>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function ExerciseStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-[74px] rounded-xl bg-[#eef7f1] px-3 py-2 text-center">
      <p className="text-[10px] font-bold uppercase tracking-wide text-[#648171]">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-[#07694c]">{value}</p>
    </div>
  );
}
