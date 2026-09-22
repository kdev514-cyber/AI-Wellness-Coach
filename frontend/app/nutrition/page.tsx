"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import {
  ArrowRight,
  Apple,
  Coffee,
  Droplets,
  Dumbbell,
  Flame,
  RefreshCw,
  Sparkles,
  Utensils,
} from "lucide-react";

import AppSidebar from "../../components/AppSidebar";
import { supabase } from "../../lib/supabase";


// =========================================================
// TYPES
// =========================================================

type Meal = {
  name: string;
  foods: string[];
  calories: number;
  protein_grams: number;
  reason?: string;
};


type DayPlan = {
  day: string;
  meals: Meal[];
};


type NutritionPlan = {
  daily_calories: number;
  protein_grams: number;
  water_litres: number;
  days: DayPlan[];
};


// =========================================================
// MEAL ICON
// =========================================================

function getMealIcon(mealName: string) {

  const name =
    mealName.toLowerCase();


  if (
    name.includes("breakfast")
  ) {
    return (
      <Coffee
        size={22}
        strokeWidth={2}
        className="text-black"
      />
    );
  }


  if (
    name.includes("lunch")
  ) {
    return (
      <Utensils
        size={22}
        strokeWidth={2}
        className="text-black"
      />
    );
  }


  if (
    name.includes("dinner")
  ) {
    return (
      <Utensils
        size={22}
        strokeWidth={2}
        className="text-black"
      />
    );
  }


  if (
    name.includes("snack")
  ) {
    return (
      <Apple
        size={22}
        strokeWidth={2}
        className="text-black"
      />
    );
  }


  return (
    <Utensils
      size={22}
      strokeWidth={2}
      className="text-black"
    />
  );
}


// =========================================================
// NUTRITION PAGE
// =========================================================

export default function NutritionPage() {

  const [
    plan,
    setPlan,
  ] =
    useState<NutritionPlan | null>(
      null
    );


  const [
    selectedDay,
    setSelectedDay,
  ] =
    useState(
      "Monday"
    );


  const [
    loading,
    setLoading,
  ] =
    useState(
      false
    );


  const [
    loadingSavedPlan,
    setLoadingSavedPlan,
  ] =
    useState(
      true
    );


  const [
    message,
    setMessage,
  ] =
    useState(
      ""
    );


  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState(
      ""
    );


  // =====================================================
  // API BASE URL
  // =====================================================

  const API_BASE_URL =
    process.env
      .NEXT_PUBLIC_API_BASE_URL ||
    "http://127.0.0.1:8000";


  // =====================================================
  // LOAD SAVED WEEKLY PLAN
  // =====================================================

  useEffect(() => {

    async function loadSavedPlan() {

      setLoadingSavedPlan(
        true
      );

      setErrorMessage(
        ""
      );


      try {

        // -----------------------------------------------
        // GET LOGGED-IN USER
        // -----------------------------------------------

        const {
          data: {
            user,
          },
          error:
            userError,
        } =
          await supabase.auth.getUser();


        if (
          userError
        ) {

          console.error(
            "Supabase user error:",
            userError.message,
            userError
          );


          throw new Error(
            `Authentication error: ${userError.message}`
          );
        }


        if (
          !user
        ) {

          throw new Error(
            "You are not logged in."
          );
        }


        // -----------------------------------------------
        // LOAD ACTIVE NUTRITION PLAN
        // -----------------------------------------------

        const {
          data,
          error:
            savedPlanError,
        } =
          await supabase
            .from(
              "nutrition_plans"
            )
            .select(
              `
                daily_calories,
                protein_grams,
                water_litres,
                weekly_plan,
                created_at
              `
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
                  false,
              }
            )
            .limit(
              1
            )
            .maybeSingle();


        // -----------------------------------------------
        // SUPABASE ERROR
        // -----------------------------------------------

        if (
          savedPlanError
        ) {

          console.error(
            "SUPABASE NUTRITION ERROR"
          );


          console.error(
            "Message:",
            savedPlanError.message
          );


          console.error(
            "Code:",
            savedPlanError.code
          );


          console.error(
            "Details:",
            savedPlanError.details
          );


          console.error(
            "Hint:",
            savedPlanError.hint
          );


          console.error(
            "Full error:",
            JSON.stringify(
              savedPlanError,
              null,
              2
            )
          );


          throw new Error(
            savedPlanError.message ||
              "Could not load your saved nutrition plan."
          );
        }


        // -----------------------------------------------
        // LOAD VALID 7-DAY PLAN
        // -----------------------------------------------

        if (
          data &&
          Array.isArray(
            data.weekly_plan
          ) &&
          data.weekly_plan.length ===
            7
        ) {

          setPlan({

            daily_calories:
              Number(
                data.daily_calories
              ),

            protein_grams:
              Number(
                data.protein_grams
              ),

            water_litres:
              Number(
                data.water_litres
              ),

            days:
              data.weekly_plan,

          });


          setSelectedDay(
            data.weekly_plan[0]
              ?.day ||
              "Monday"
          );
        }

      } catch (
        error
      ) {

        console.error(
          "Nutrition load error:",
          error
        );


        if (
          error instanceof Error
        ) {

          setErrorMessage(
            error.message
          );

        } else {

          setErrorMessage(
            "Could not load your nutrition plan."
          );
        }

      } finally {

        setLoadingSavedPlan(
          false
        );
      }
    }


    loadSavedPlan();

  }, []);


  // =====================================================
  // GENERATE NEW WEEKLY PLAN
  // =====================================================

  async function generatePlan() {

    if (
      loading
    ) {
      return;
    }


    setLoading(
      true
    );


    setMessage(
      "Loading your wellness profile..."
    );


    setErrorMessage(
      ""
    );


    try {

      // -----------------------------------------------
      // GET LOGGED-IN USER
      // -----------------------------------------------

      const {
        data: {
          user,
        },
        error:
          userError,
      } =
        await supabase.auth.getUser();


      if (
        userError ||
        !user
      ) {

        throw new Error(
          "You must be logged in."
        );
      }


      // -----------------------------------------------
      // GET USER PROFILE
      // -----------------------------------------------

      const {
        data:
          profile,
        error:
          profileError,
      } =
        await supabase
          .from(
            "profiles"
          )
          .select(
            "*"
          )
          .eq(
            "id",
            user.id
          )
          .single();


      if (
        profileError ||
        !profile
      ) {

        console.error(
          "Profile error:",
          profileError
        );


        throw new Error(
          profileError
            ?.message ||
            "Could not load your wellness profile."
        );
      }


      // -----------------------------------------------
      // CALL FASTAPI
      // -----------------------------------------------

      setMessage(
        "AI is creating your 7-day nutrition plan..."
      );


      console.log(
        "Nutrition API:",
        `${API_BASE_URL}/nutrition-plan`
      );


      const response =
        await fetch(
          `${API_BASE_URL}/nutrition-plan`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                profile,
              }),
          }
        );


      let responseData;


      try {

        responseData =
          await response.json();

      } catch {

        throw new Error(
          "Backend returned an invalid response."
        );
      }


      if (
        !response.ok
      ) {

        throw new Error(
          responseData
            ?.error ||
            `Backend error: ${response.status}`
        );
      }


      if (
        !responseData.success
      ) {

        throw new Error(
          responseData.error ||
            "AI could not generate your nutrition plan."
        );
      }


      if (
        !responseData.plan
      ) {

        throw new Error(
          "Backend did not return a nutrition plan."
        );
      }


      const newPlan =
        responseData.plan as NutritionPlan;


      // -----------------------------------------------
      // VALIDATE PLAN
      // -----------------------------------------------

      if (
        !Array.isArray(
          newPlan.days
        ) ||
        newPlan.days.length !==
          7
      ) {

        throw new Error(
          "AI returned an invalid 7-day nutrition plan."
        );
      }


      // -----------------------------------------------
      // DEACTIVATE OLD PLANS
      // -----------------------------------------------

      const {
        error:
          deactivateError,
      } =
        await supabase
          .from(
            "nutrition_plans"
          )
          .update({
            active:
              false,
          })
          .eq(
            "user_id",
            user.id
          )
          .eq(
            "active",
            true
          );


      if (
        deactivateError
      ) {

        console.error(
          "Deactivate plan error:",
          deactivateError.message
        );
      }


      // -----------------------------------------------
      // SAVE NEW PLAN
      // -----------------------------------------------

      const {
        error:
          saveError,
      } =
        await supabase
          .from(
            "nutrition_plans"
          )
          .insert({

            user_id:
              user.id,

            daily_calories:
              newPlan.daily_calories,

            protein_grams:
              newPlan.protein_grams,

            water_litres:
              newPlan.water_litres,

            weekly_plan:
              newPlan.days,

            active:
              true,

          });


      if (
        saveError
      ) {

        console.error(
          "Nutrition save message:",
          saveError.message
        );


        console.error(
          "Nutrition save code:",
          saveError.code
        );


        console.error(
          "Nutrition save details:",
          saveError.details
        );


        throw new Error(
          saveError.message ||
            "AI generated your plan, but it could not be saved."
        );
      }


      // -----------------------------------------------
      // DISPLAY PLAN
      // -----------------------------------------------

      setPlan(
        newPlan
      );


      setSelectedDay(
        newPlan.days[0]
          ?.day ||
          "Monday"
      );


      setMessage(
        ""
      );

    } catch (
      error
    ) {

      console.error(
        "Nutrition generation error:",
        error
      );


      if (
        error instanceof Error
      ) {

        setErrorMessage(
          error.message
        );

      } else {

        setErrorMessage(
          "Something went wrong."
        );
      }


      setMessage(
        ""
      );

    } finally {

      setLoading(
        false
      );
    }
  }


  // =====================================================
  // CURRENT DAY
  // =====================================================

  const currentDay =
    plan?.days?.find(
      (
        day
      ) =>
        day.day ===
        selectedDay
    );


  // =====================================================
  // GENERATE NEW WEEK
  // =====================================================

  function generateNewWeek() {

    setPlan(
      null
    );


    setSelectedDay(
      "Monday"
    );


    setMessage(
      ""
    );


    setErrorMessage(
      ""
    );
  }


  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="min-h-screen bg-[#f4f8f5] lg:flex">
      <AppSidebar />

      <section className="min-w-0 flex-1 px-4 pb-12 pt-20 sm:px-6 lg:p-10">
        <div className="mx-auto w-full max-w-7xl min-w-0">
          <section className="relative overflow-hidden rounded-[30px] border border-emerald-100 bg-gradient-to-br from-[#e7f8ef] via-white to-[#edf8f5] p-6 shadow-sm sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-emerald-100/70 blur-3xl" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">
                  <Sparkles size={14} strokeWidth={2.2} />
                  AI Nutrition
                </div>
                <h1 className="mt-5 text-3xl font-bold leading-tight text-slate-950 sm:text-4xl lg:text-5xl">
                  Nutrition that fits your day.
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                  Your personalized seven-day meal plan, built around your wellness profile, goals and dietary preferences.
                </p>
              </div>

              {plan && (
                <button
                  type="button"
                  onClick={generateNewWeek}
                  className="inline-flex w-fit items-center gap-2 rounded-xl border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
                >
                  <RefreshCw size={17} strokeWidth={2} />
                  Generate New Week
                </button>
              )}
            </div>
          </section>

          {loadingSavedPlan && (
            <div className="mt-6 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <RefreshCw size={19} strokeWidth={2} className="animate-spin" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Loading your nutrition plan</p>
                  <p className="mt-0.5 text-sm text-slate-500">Getting your latest personalized week ready.</p>
                </div>
              </div>
            </div>
          )}

          {!loadingSavedPlan && errorMessage && !plan && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 sm:p-6">
              <p className="font-semibold text-red-700">Nutrition data error</p>
              <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
            </div>
          )}

          {!loadingSavedPlan && !plan && (
            <section className="mt-6 overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 sm:p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-700 text-white">
                  <Sparkles size={23} strokeWidth={2} />
                </div>
                <h2 className="mt-5 text-2xl font-bold text-slate-950 sm:text-3xl">
                  Create your weekly nutrition plan
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                  Nalamera will use your profile, goals and diet preferences to create a complete seven-day nutrition plan.
                </p>
                <button
                  type="button"
                  onClick={generatePlan}
                  disabled={loading}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto"
                >
                  {loading ? (
                    <>
                      <RefreshCw size={18} strokeWidth={2} className="animate-spin" />
                      Generating 7-Day Plan...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} strokeWidth={2} />
                      Generate Nutrition Plan
                      <ArrowRight size={17} strokeWidth={2} />
                    </>
                  )}
                </button>
                {message && (
                  <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <p className="text-sm font-medium text-blue-700">{message}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {plan && Array.isArray(plan.days) && (
            <>
              <section className="mt-8">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">
                  Daily targets
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-950 sm:text-2xl">
                  Your nutrition goals
                </h2>
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <TargetCard title="Daily Calories" value={plan.daily_calories} unit="kcal" icon={<Flame size={22} strokeWidth={2} />} tone="orange" />
                  <TargetCard title="Protein" value={plan.protein_grams} unit="g" icon={<Dumbbell size={22} strokeWidth={2} />} tone="violet" />
                  <TargetCard title="Water" value={plan.water_litres} unit="L" icon={<Droplets size={22} strokeWidth={2} />} tone="sky" />
                </div>
              </section>

              <section className="mt-8">
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
                  <div className="flex min-w-max gap-2 sm:min-w-0 sm:grid sm:grid-cols-7">
                    {plan.days.map((day) => (
                      <button
                        key={day.day}
                        type="button"
                        onClick={() => setSelectedDay(day.day)}
                        className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                          selectedDay === day.day
                            ? "bg-emerald-700 text-white shadow-sm"
                            : "bg-transparent text-slate-500 hover:bg-emerald-50 hover:text-emerald-800"
                        }`}
                      >
                        <span className="xl:hidden">{day.day.slice(0, 3)}</span>
                        <span className="hidden xl:inline">{day.day}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {currentDay && (
                <section className="mt-8">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">
                      Daily meal plan
                    </p>
                    <h2 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">
                      {currentDay.day}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Meals selected to support your daily targets.
                    </p>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
                    {Array.isArray(currentDay.meals) &&
                      currentDay.meals.map((meal, index) => (
                        <article
                          key={`${meal.name}-${index}`}
                          className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                          <div className="border-b border-emerald-50 bg-gradient-to-r from-emerald-50 to-white p-5 sm:p-6">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                                {getMealIcon(meal.name)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                                  Meal {index + 1}
                                </p>
                                <h3 className="mt-1 break-words text-lg font-bold text-slate-950 sm:text-xl">
                                  {meal.name}
                                </h3>
                              </div>
                            </div>

                            <div className="mt-5 flex flex-wrap gap-2">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
                                <Flame size={14} className="text-orange-600" />
                                {meal.calories} kcal
                              </span>
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
                                <Dumbbell size={14} className="text-violet-600" />
                                {meal.protein_grams}g protein
                              </span>
                            </div>
                          </div>

                          <div className="p-5 sm:p-6">
                            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                              What&apos;s included
                            </p>
                            <div className="mt-4 space-y-3">
                              {Array.isArray(meal.foods) &&
                                meal.foods.map((food, foodIndex) => (
                                  <div key={`${food}-${foodIndex}`} className="flex items-start gap-3">
                                    <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                                    <p className="min-w-0 break-words text-sm leading-6 text-slate-700">
                                      {food}
                                    </p>
                                  </div>
                                ))}
                            </div>

                            {meal.reason && (
                              <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                                  Why this meal?
                                </p>
                                <p className="mt-2 break-words text-sm leading-6 text-slate-600">
                                  {meal.reason}
                                </p>
                              </div>
                            )}
                          </div>
                        </article>
                      ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}

// =========================================================
// TARGET CARD
// =========================================================

function TargetCard({
  title,
  value,
  unit,
  icon,
  tone,
}: {
  title: string;
  value: number;
  unit: string;
  icon: ReactNode;
  tone: "orange" | "violet" | "sky";
}) {
  const tones = {
    orange: "bg-orange-50 text-orange-700",
    violet: "bg-violet-50 text-violet-700",
    sky: "bg-sky-50 text-sky-700",
  };

  return (
    <div className="flex min-w-0 items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="mt-1 break-words text-2xl font-bold text-slate-950 sm:text-3xl">
          {value}
          <span className="ml-1 text-sm font-semibold text-slate-400">{unit}</span>
        </p>
      </div>
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>
        {icon}
      </div>
    </div>
  );
}
