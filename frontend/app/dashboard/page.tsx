"use client";

import { useEffect, useMemo, useState } from "react";

import type { ReactNode } from "react";

import {

  ArrowRight,

  Bot,

  Check,

  Coffee,

  Droplets,

  Dumbbell,

  Footprints,

  HeartPulse,

  ListChecks,

  LogOut,

  Moon,

  Salad,

  Scale,

  Smile,

  TrendingUp,

  Utensils,

  Zap,

} from "lucide-react";

import AppSidebar from "../../components/AppSidebar";

import { supabase } from "../../lib/supabase";









// =========================================================

// TYPES

// =========================================================

type Profile = {

  full_name: string | null;

  age: number | null;

  gender: string | null;

  height_cm: number | null;

  weight_kg: number | null;

  goal: string | null;

  activity_level: string | null;

  workout_days: number | null;

  workout_duration: number | null;

  diet_preference: string | null;

};









type Meal = {

  name: string;

  foods: string[];

  calories: number;

  protein_grams: number;

  reason?: string;

};









type NutritionDay = {

  day: string;

  meals: Meal[];

};









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









type TrackerRecord = {

  breakfast_completed: boolean;

  lunch_completed: boolean;

  dinner_completed: boolean;

  workout_completed: boolean;

  water_litres: number | null;

  steps: number | null;

  sleep_hours: number | null;

  weight_kg: number | null;

  mood: number | null;

  energy: number | null;

};









// =========================================================

// DASHBOARD

// =========================================================

export default function Dashboard() {

  // =======================================================

  // STATE

  // =======================================================

  const [

    profile,

    setProfile

  ] = useState<Profile | null>(

    null

  );









  const [

    nutritionDay,

    setNutritionDay

  ] = useState<NutritionDay | null>(

    null

  );









  const [

    workoutDay,

    setWorkoutDay

  ] = useState<WorkoutDay | null>(

    null

  );









  const [

    tracker,

    setTracker

  ] = useState<TrackerRecord | null>(

    null

  );









  const [

    loading,

    setLoading

  ] = useState(

    true

  );









  const [

    errorMessage,

    setErrorMessage

  ] = useState(

    ""

  );









  // =======================================================

  // DATE

  // =======================================================

  const today =

    new Date()

      .toLocaleDateString(

        "en-CA"

      );









  const todayName =

    new Date()

      .toLocaleDateString(

        "en-US",

        {

          weekday:

            "long"

        }

      );









  const todayReadable =

    new Date()

      .toLocaleDateString(

        "en-NZ",

        {

          weekday:

            "long",

          day:

            "numeric",

          month:

            "long"

        }

      );









  // =======================================================

  // LOAD DASHBOARD

  // =======================================================

  useEffect(() => {

    async function loadDashboard() {

      setLoading(

        true

      );

      setErrorMessage(

        ""

      );









      try {

        // =================================================

        // USER

        // =================================================

        const {

          data: {

            user

          },

          error:

            userError

        } =

          await supabase.auth.getUser();









        if (

          userError ||

          !user

        ) {

          window.location.href =

            "/login";

          return;

        }









        // =================================================

        // PROFILE

        // =================================================

        const {

          data:

            profileData,

          error:

            profileError

        } =

          await supabase

            .from(

              "profiles"

            )

            .select(

              `

              full_name,

              age,

              gender,

              height_cm,

              weight_kg,

              goal,

              activity_level,

              workout_days,

              workout_duration,

              diet_preference

              `

            )

            .eq(

              "id",

              user.id

            )

            .single();









        if (

          profileError

        ) {

          console.error(

            "Dashboard profile error:",

            profileError

          );

          throw new Error(

            "Could not load your profile."

          );

        }









        setProfile(

          profileData

        );









        // =================================================

        // ACTIVE NUTRITION PLAN

        // =================================================

        const {

          data:

            nutritionData,

          error:

            nutritionError

        } =

          await supabase

            .from(

              "nutrition_plans"

            )

            .select(

              "weekly_plan"

            )

            .eq(

              "user_id",

              user.id

            )

            .eq(

              "active",

              true

            )

            .order(

              "created_at",

              {

                ascending:

                  false

              }

            )

            .limit(

              1

            )

            .maybeSingle();









        if (

          nutritionError

        ) {

          console.error(

            "Dashboard nutrition error:",

            nutritionError

          );

        }









        if (

          nutritionData &&

          Array.isArray(

            nutritionData.weekly_plan

          )

        ) {

          const day =

            nutritionData.weekly_plan.find(

              (

                item:

                  NutritionDay

              ) =>

                item.day ===

                  todayName

            );









          setNutritionDay(

            day ??

              null

          );

        }

        else {

          setNutritionDay(

            null

          );

        }









        // =================================================

        // ACTIVE WORKOUT PLAN

        // =================================================

        const {

          data:

            workoutData,

          error:

            workoutError

        } =

          await supabase

            .from(

              "workout_plans"

            )

            .select(

              "weekly_plan"

            )

            .eq(

              "user_id",

              user.id

            )

            .eq(

              "active",

              true

            )

            .order(

              "created_at",

              {

                ascending:

                  false

              }

            )

            .limit(

              1

            )

            .maybeSingle();









        if (

          workoutError

        ) {

          console.error(

            "Dashboard workout error:",

            workoutError

          );

        }









        if (

          workoutData &&

          Array.isArray(

            workoutData.weekly_plan

          )

        ) {

          const day =

            workoutData.weekly_plan.find(

              (

                item:

                  WorkoutDay

              ) =>

                item.day ===

                  todayName

            );









          setWorkoutDay(

            day ??

              null

          );

        }

        else {

          setWorkoutDay(

            null

          );

        }









        // =================================================

        // TODAY'S TRACKER

        // =================================================

        const {

          data:

            trackerData,

          error:

            trackerError

        } =

          await supabase

            .from(

              "daily_tracker"

            )

            .select(

              `

              breakfast_completed,

              lunch_completed,

              dinner_completed,

              workout_completed,

              water_litres,

              steps,

              sleep_hours,

              weight_kg,

              mood,

              energy

              `

            )

            .eq(

              "user_id",

              user.id

            )

            .eq(

              "tracker_date",

              today

            )

            .maybeSingle();









        if (

          trackerError

        ) {

          console.error(

            "Dashboard tracker error:",

            trackerError

          );

        }









        setTracker(

          trackerData ??

            null

        );









      } catch (

        err

      ) {

        console.error(

          "Dashboard load error:",

          err

        );









        if (

          err instanceof Error

        ) {

          setErrorMessage(

            err.message

          );

        }

        else {

          setErrorMessage(

            "Something went wrong."

          );

        }

      }

      finally {

        setLoading(

          false

        );

      }

    }









    loadDashboard();

  }, [

    today,

    todayName

  ]);









  // =======================================================

  // LOGOUT

  // =======================================================

  async function logout() {

    await supabase.auth.signOut();

    window.location.href =

      "/login";

  }









  // =======================================================

  // TODAY'S SCORE

  // =======================================================

  const todayStats =

    useMemo(

      () => {

        if (

          !tracker

        ) {

          return {

            percentage:

              0,

            completed:

              0,

            total:

              7

          };

        }









        const workoutDone =

          workoutDay?.type ===

            "rest"

            ? true

            : tracker.workout_completed;









        const habits = [

          tracker.breakfast_completed,

          tracker.lunch_completed,

          tracker.dinner_completed,

          workoutDone,

          Number(

            tracker.water_litres ||

              0

          ) >=

            2,

          Number(

            tracker.steps ||

              0

          ) >=

            7000,

          Number(

            tracker.sleep_hours ||

              0

          ) >=

            7,

        ];









        const completed =

          habits.filter(

            Boolean

          ).length;









        return {

          percentage:

            Math.round(

              (

                completed /

                habits.length

              ) *

                100

            ),

          completed,

          total:

            habits.length

        };

      },

      [

        tracker,

        workoutDay

      ]

    );









  // =======================================================

  // MEALS

  // =======================================================

  const breakfast =

    findMeal(

      nutritionDay,

      "breakfast"

    );









  const lunch =

    findMeal(

      nutritionDay,

      "lunch"

    );









  const dinner =

    findMeal(

      nutritionDay,

      "dinner"

    );









  // =======================================================

  // LOADING

  // =======================================================

  if (

    loading

  ) {

    return (

      <main className="min-h-screen bg-gray-50 lg:flex">

        <AppSidebar />

        <section className="flex min-w-0 flex-1 items-center justify-center px-4 pb-8 pt-20 sm:px-6 lg:pt-0">

          <p className="text-gray-600">

            Loading your dashboard...

          </p>

        </section>

      </main>

    );

  }









  // =======================================================

  // ERROR

  // =======================================================

  if (

    errorMessage

  ) {

    return (

      <main className="min-h-screen bg-gray-50 lg:flex">

        <AppSidebar />

        <section className="flex min-w-0 flex-1 items-center justify-center px-4 pb-8 pt-20 sm:px-6 lg:pt-0">

          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">

            <p className="text-red-700">

              {

                errorMessage

              }

            </p>

          </div>

        </section>

      </main>

    );

  }









  // =======================================================

  // PAGE

  // =======================================================

  return (
    <main className="min-h-screen bg-[#f4f8f5] lg:flex">
      <AppSidebar />

      <section className="min-w-0 flex-1 px-4 pb-12 pt-20 sm:px-6 lg:p-10">
        <div className="mx-auto w-full max-w-7xl min-w-0">

          {/* HERO */}
          <section className="relative overflow-hidden rounded-[30px] border border-emerald-100 bg-gradient-to-br from-[#e7f8ef] via-white to-[#edf8f5] p-6 shadow-sm sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-emerald-100/70 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 right-32 h-56 w-56 rounded-full bg-teal-100/60 blur-3xl" />

            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Daily Ally
                </div>

                <h1 className="mt-5 break-words text-3xl font-bold leading-tight text-slate-950 sm:text-4xl lg:text-5xl">
                  Welcome back, {profile?.full_name || "there"}.
                </h1>

                <p className="mt-3 text-base font-semibold text-emerald-800 sm:text-lg">
                  Small steps. A healthier you.
                </p>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                  {todayReadable} · Your nutrition, movement, recovery and wellbeing are together in one place.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href="/tracker"
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
                  >
                    Open Daily Tracker
                    <ArrowRight size={17} strokeWidth={2.2} />
                  </a>

                  <a
                    href="/coach"
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-emerald-50"
                  >
                    <Bot size={17} strokeWidth={2.2} />
                    Ask Nalamera
                  </a>
                </div>
              </div>

              <div className="w-full rounded-2xl border border-white/80 bg-white/80 p-5 shadow-sm backdrop-blur lg:max-w-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                      Today&apos;s progress
                    </p>
                    <p className="mt-2 text-4xl font-bold text-slate-950">
                      {todayStats.percentage}%
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                    <TrendingUp size={24} strokeWidth={2.2} />
                  </div>
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  {todayStats.completed} of {todayStats.total} wellness targets completed
                </p>

                <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-emerald-100">
                  <div
                    className="h-full rounded-full bg-emerald-600 transition-all"
                    style={{ width: `${todayStats.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* QUICK STATS */}
          <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              title="Weight"
              value={tracker?.weight_kg ?? profile?.weight_kg ?? "--"}
              unit={
                tracker?.weight_kg !== null || profile?.weight_kg !== null
                  ? "kg"
                  : ""
              }
              icon={<Scale size={22} strokeWidth={2} />}
              tone="emerald"
            />

            <StatCard
              title="Water"
              value={tracker?.water_litres ?? 0}
              unit="L"
              icon={<Droplets size={22} strokeWidth={2} />}
              tone="sky"
            />

            <StatCard
              title="Steps"
              value={tracker?.steps ?? 0}
              unit=""
              icon={<Footprints size={22} strokeWidth={2} />}
              tone="amber"
            />

            <StatCard
              title="Sleep"
              value={tracker?.sleep_hours ?? 0}
              unit="hrs"
              icon={<Moon size={22} strokeWidth={2} />}
              tone="violet"
            />
          </section>

          {/* WELLNESS SPACE */}
          <section className="mt-10">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">
              Explore
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-950 sm:text-2xl">
              Your wellness space
            </h2>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <DashboardCard
                title="Nutrition"
                description="Meals personalized around your goals."
                icon={<Salad size={23} strokeWidth={2} />}
                href="/nutrition"
                tone="emerald"
              />

              <DashboardCard
                title="Workout"
                description="Your weekly training and recovery."
                icon={<Dumbbell size={23} strokeWidth={2} />}
                href="/workout"
                tone="blue"
              />

              <DashboardCard
                title="Daily Tracker"
                description="Record habits, mood and daily metrics."
                icon={<ListChecks size={23} strokeWidth={2} />}
                href="/tracker"
                tone="amber"
              />

              <DashboardCard
                title="Progress"
                description="See trends, consistency and progress."
                icon={<TrendingUp size={23} strokeWidth={2} />}
                href="/progress"
                tone="rose"
              />

              <DashboardCard
                title="Nalamera"
                description="Personalized AI wellness guidance."
                icon={<Bot size={23} strokeWidth={2} />}
                href="/coach"
                tone="violet"
              />
            </div>
          </section>

          {/* TODAY'S PLAN */}
          <section className="mt-10">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">
              Today&apos;s plan
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-950 sm:text-2xl">
              Plan · Track · Improve
            </h2>

            <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">

              {/* NUTRITION */}
              <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm">
                <div className="flex items-center justify-between gap-4 border-b border-emerald-50 bg-emerald-50/60 p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                      <Salad size={23} strokeWidth={2} />
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700">
                        Nutrition
                      </p>
                      <h3 className="mt-0.5 text-lg font-bold text-slate-950">
                        Today&apos;s meals
                      </h3>
                    </div>
                  </div>

                  <a
                    href="/nutrition"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-800 hover:underline"
                  >
                    Full plan
                    <ArrowRight size={15} />
                  </a>
                </div>

                {nutritionDay ? (
                  <div className="grid grid-cols-1 gap-3 p-5 sm:p-6">
                    <MealCard
                      icon={<Coffee size={20} strokeWidth={2} />}
                      fallbackTitle="Breakfast"
                      meal={breakfast}
                      completed={tracker?.breakfast_completed ?? false}
                    />

                    <MealCard
                      icon={<Salad size={20} strokeWidth={2} />}
                      fallbackTitle="Lunch"
                      meal={lunch}
                      completed={tracker?.lunch_completed ?? false}
                    />

                    <MealCard
                      icon={<Utensils size={20} strokeWidth={2} />}
                      fallbackTitle="Dinner"
                      meal={dinner}
                      completed={tracker?.dinner_completed ?? false}
                    />
                  </div>
                ) : (
                  <div className="p-5 sm:p-6">
                    <EmptyPlanCard
                      title="No active nutrition plan"
                      description="Generate your weekly nutrition plan to see today's meals here."
                      href="/nutrition"
                      buttonText="Open Nutrition"
                    />
                  </div>
                )}
              </div>

              {/* WORKOUT */}
              <div className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm">
                <div className="flex items-center justify-between gap-4 border-b border-blue-50 bg-blue-50/60 p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                      <Dumbbell size={23} strokeWidth={2} />
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-700">
                        Training
                      </p>
                      <h3 className="mt-0.5 text-lg font-bold text-slate-950">
                        Today&apos;s movement
                      </h3>
                    </div>
                  </div>

                  <a
                    href="/workout"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-blue-800 hover:underline"
                  >
                    Full plan
                    <ArrowRight size={15} />
                  </a>
                </div>

                <div className="p-5 sm:p-6">
                  {workoutDay ? (
                    workoutDay.type === "rest" ? (
                      <div className="rounded-2xl bg-blue-50/60 p-5">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-sm">
                            <HeartPulse size={24} strokeWidth={2} />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-blue-700">
                              Recovery Day
                            </p>
                            <h4 className="mt-1 text-xl font-bold text-slate-950">
                              {workoutDay.focus}
                            </h4>
                            <p className="mt-2 text-sm leading-6 text-slate-500">
                              Give your body time to recover so you can come back stronger.
                            </p>
                          </div>
                        </div>

                        {workoutDay.cardio && (
                          <div className="mt-5 rounded-xl border border-blue-100 bg-white p-4">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                              Suggested activity
                            </p>
                            <p className="mt-1 font-semibold text-slate-900">
                              {workoutDay.cardio.activity} · {workoutDay.cardio.duration_minutes} minutes
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                              {workoutDay.duration_minutes} min session
                            </span>
                            <h4 className="mt-3 text-2xl font-bold text-slate-950">
                              {workoutDay.focus}
                            </h4>
                            <p className="mt-1 text-sm text-slate-500">
                              {workoutDay.exercises?.length || 0} exercises planned for today
                            </p>
                          </div>

                          <span
                            className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                              tracker?.workout_completed
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {tracker?.workout_completed && (
                              <Check size={14} strokeWidth={2.2} />
                            )}
                            {tracker?.workout_completed ? "Completed" : "Pending"}
                          </span>
                        </div>

                        {Array.isArray(workoutDay.exercises) &&
                          workoutDay.exercises.length > 0 && (
                            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                              {workoutDay.exercises
                                .slice(0, 6)
                                .map((exercise, index) => (
                                  <div
                                    key={`${exercise.name}-${index}`}
                                    className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                                  >
                                    <p className="font-semibold text-slate-900">
                                      {exercise.name}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-500">
                                      {exercise.sets} sets × {exercise.reps}
                                    </p>
                                  </div>
                                ))}
                            </div>
                          )}
                      </div>
                    )
                  ) : (
                    <EmptyPlanCard
                      title="No active workout plan"
                      description="Generate your weekly training plan to see today's workout here."
                      href="/workout"
                      buttonText="Open Workout"
                    />
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* WELLBEING */}
          <section className="mt-10">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">
                  Daily check-in
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-950 sm:text-2xl">
                  How are you feeling?
                </h2>
              </div>

              <a
                href="/tracker"
                className="hidden text-sm font-semibold text-emerald-800 hover:underline sm:inline"
              >
                Update check-in
              </a>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 to-teal-700 p-6 text-white shadow-sm md:col-span-2">
                <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10" />

                <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                      <Smile size={28} strokeWidth={2} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-emerald-100">
                        Today&apos;s Mood
                      </p>
                      <p className="mt-1 text-2xl font-bold sm:text-3xl">
                        {tracker?.mood !== null && tracker?.mood !== undefined
                          ? `${tracker.mood} / 5`
                          : "Not checked in yet"}
                      </p>
                      <p className="mt-1 text-sm text-emerald-100">
                        {tracker?.mood !== null && tracker?.mood !== undefined
                          ? "Your mood is recorded for today."
                          : "Take a moment to record how you feel today."}
                      </p>
                    </div>
                  </div>

                  <a
                    href="/tracker"
                    className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
                  >
                    {tracker?.mood !== null && tracker?.mood !== undefined
                      ? "Update Mood"
                      : "Log Today's Mood"}
                  </a>
                </div>
              </div>

              <WellbeingCard
                icon={<Zap size={24} strokeWidth={2} />}
                title="Energy"
                value={tracker?.energy ?? null}
              />
            </div>
          </section>

          {/* PROFILE */}
          <section className="mb-10 mt-10">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Personalization
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-950 sm:text-2xl">
                  Your profile
                </h2>
              </div>

              <a
                href="/profile"
                className="text-sm font-semibold text-emerald-800 hover:underline"
              >
                Edit profile
              </a>
            </div>

            <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
                <ProfileItem
                  label="Age"
                  value={profile?.age ? `${profile.age} years` : "--"}
                />
                <ProfileItem
                  label="Gender"
                  value={formatGender(profile?.gender)}
                />
                <ProfileItem
                  label="Primary Goal"
                  value={formatGoal(profile?.goal)}
                />
                <ProfileItem
                  label="Activity"
                  value={formatActivity(profile?.activity_level)}
                />
                <ProfileItem
                  label="Diet"
                  value={formatDiet(profile?.diet_preference)}
                />
                <ProfileItem
                  label="Training"
                  value={profile?.workout_days ? `${profile.workout_days} days` : "--"}
                />
              </div>
            </div>
          </section>

          <div className="flex justify-center pb-4">
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-950"
            >
              <LogOut size={17} strokeWidth={2} />
              Logout
            </button>
          </div>

        </div>
      </section>
    </main>
  );
}

// =========================================================
// STAT CARD
// =========================================================

function StatCard({
  title,
  value,
  unit,
  icon,
  tone,
}: {
  title: string;
  value: number | string;
  unit: string;
  icon: ReactNode;
  tone: "emerald" | "sky" | "amber" | "violet";
}) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700",
    sky: "bg-sky-50 text-sky-700",
    amber: "bg-amber-50 text-amber-700",
    violet: "bg-violet-50 text-violet-700",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}
      >
        {icon}
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p className="mt-1 break-words text-2xl font-bold text-slate-950 sm:text-3xl">
        {value}
        {unit && (
          <span className="ml-1 text-sm font-semibold text-slate-400">
            {unit}
          </span>
        )}
      </p>
    </div>
  );
}


// =========================================================
// MEAL CARD
// =========================================================

function MealCard({
  icon,
  fallbackTitle,
  meal,
  completed,
}: {
  icon: ReactNode;
  fallbackTitle: string;
  meal: Meal | null;
  completed: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                {fallbackTitle}
              </p>
              <h4 className="mt-1 break-words font-bold text-slate-950">
                {meal ? cleanMealName(meal.name, fallbackTitle) : fallbackTitle}
              </h4>
            </div>

            <span
              className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                completed
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-white text-slate-400"
              }`}
            >
              {completed && <Check size={12} strokeWidth={2.3} />}
              {completed ? "Done" : "Pending"}
            </span>
          </div>

          {meal ? (
            <>
              <p className="mt-2 text-sm text-slate-500">
                {meal.calories} kcal · {meal.protein_grams}g protein
              </p>

              {Array.isArray(meal.foods) && meal.foods.length > 0 && (
                <p className="mt-2 text-sm leading-5 text-slate-600">
                  {meal.foods.slice(0, 3).join(" · ")}
                </p>
              )}
            </>
          ) : (
            <p className="mt-2 text-sm text-slate-500">
              Meal details unavailable.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}


// =========================================================
// DASHBOARD CARD
// =========================================================

function DashboardCard({
  title,
  description,
  icon,
  href,
  tone,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  href: string;
  tone: "emerald" | "blue" | "amber" | "rose" | "violet";
}) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100",
    blue: "bg-blue-50 text-blue-700 group-hover:bg-blue-100",
    amber: "bg-amber-50 text-amber-700 group-hover:bg-amber-100",
    rose: "bg-rose-50 text-rose-700 group-hover:bg-rose-100",
    violet: "bg-violet-50 text-violet-700 group-hover:bg-violet-100",
  };

  return (
    <a
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${tones[tone]}`}
      >
        {icon}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <h3 className="font-bold text-slate-950">
          {title}
        </h3>
        <ArrowRight
          size={16}
          className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-600"
        />
      </div>

      <p className="mt-2 text-sm leading-5 text-slate-500">
        {description}
      </p>
    </a>
  );
}


// =========================================================
// WELLBEING CARD
// =========================================================

function WellbeingCard({
  icon,
  title,
  value,
}: {
  icon: ReactNode;
  title: string;
  value: number | null;
}) {
  return (
    <div className="rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
        {icon}
      </div>

      <p className="mt-5 text-sm font-semibold text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-3xl font-bold text-slate-950">
        {value !== null ? `${value} / 5` : "--"}
      </p>

      <p className="mt-2 text-sm leading-5 text-slate-500">
        Your daily energy check-in helps Nalamera understand your routine.
      </p>
    </div>
  );
}


// =========================================================
// EMPTY PLAN CARD
// =========================================================

function EmptyPlanCard({
  title,
  description,
  href,
  buttonText,
}: {
  title: string;
  description: string;
  href: string;
  buttonText: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-5">
      <h3 className="text-lg font-bold text-slate-950">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>

      <a
        href={href}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        {buttonText}
        <ArrowRight size={15} />
      </a>
    </div>
  );
}


// =========================================================
// PROFILE ITEM
// =========================================================

function ProfileItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-slate-900 sm:text-base">
        {value}
      </p>
    </div>
  );
}


// =========================================================

// CLEAN MEAL NAME

// =========================================================

function cleanMealName(

  mealName:

    string,

  fallbackTitle:

    string

) {

  const lower =

    mealName.toLowerCase();

  if (

    lower.includes(

      "breakfast"

    )

  ) {

    return "Breakfast";

  }

  if (

    lower.includes(

      "lunch"

    )

  ) {

    return "Lunch";

  }

  if (

    lower.includes(

      "dinner"

    )

  ) {

    return "Dinner";

  }

  return (

    mealName

      .replace(

        /^[^\p{L}\p{N}]+/u,

        ""

      )

      .trim() ||

    fallbackTitle

  );

}









// =========================================================

// FIND MEAL

// =========================================================

function findMeal(

  day:

    NutritionDay | null,

  mealName:

    string

) {

  if (

    !day ||

    !Array.isArray(

      day.meals

    )

  ) {

    return null;

  }









  return (

    day.meals.find(

      meal =>

        meal.name

          .toLowerCase()

          .includes(

            mealName.toLowerCase()

          )

    ) ??

    null

  );

}









// =========================================================

// FORMAT GOAL

// =========================================================

function formatGoal(

  goal:

    string |

    null |

    undefined

) {

  if (

    !goal

  ) {

    return "Wellness";

  }









  const goals:

    Record<

      string,

      string

    > = {

      lose_weight:

        "Lose Weight",

      build_muscle:

        "Build Muscle",

      maintain_weight:

        "Maintain Weight",

      improve_fitness:

        "Improve Fitness",

      general_wellness:

        "General Wellness",

    };









  return (

    goals[

      goal

    ] ||

    goal

  );

}









// =========================================================

// FORMAT GENDER

// =========================================================

function formatGender(

  gender:

    string |

    null |

    undefined

) {

  if (

    !gender

  ) {

    return "--";

  }









  const genders:

    Record<

      string,

      string

    > = {

      male:

        "Male",

      female:

        "Female",

      non_binary:

        "Non-binary",

      prefer_not_to_say:

        "Prefer not to say",

    };









  return (

    genders[

      gender

    ] ||

    gender

  );

}









// =========================================================

// FORMAT ACTIVITY

// =========================================================

function formatActivity(

  activity:

    string |

    null |

    undefined

) {

  if (

    !activity

  ) {

    return "--";

  }









  const activities:

    Record<

      string,

      string

    > = {

      sedentary:

        "Mostly sedentary",

      light:

        "Lightly active",

      moderate:

        "Moderately active",

      very_active:

        "Very active",

    };









  return (

    activities[

      activity

    ] ||

    activity

  );

}









// =========================================================

// FORMAT DIET

// =========================================================

function formatDiet(

  diet:

    string |

    null |

    undefined

) {

  if (

    !diet

  ) {

    return "--";

  }









  const diets:

    Record<

      string,

      string

    > = {

      no_preference:

        "No specific preference",

      vegetarian:

        "Vegetarian",

      vegan:

        "Vegan",

      pescatarian:

        "Pescatarian",

      high_protein:

        "High protein",

    };









  return (

    diets[

      diet

    ] ||

    diet

  );

}