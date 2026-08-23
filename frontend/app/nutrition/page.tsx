"use client";

import { useEffect, useState } from "react";
import AppSidebar from "../../components/AppSidebar";
import { supabase } from "../../lib/supabase";

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

export default function NutritionPage() {
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [selectedDay, setSelectedDay] = useState("Monday");

  const [loading, setLoading] = useState(false);
  const [loadingSavedPlan, setLoadingSavedPlan] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // LOAD SAVED WEEKLY PLAN
  // =====================================================

  useEffect(() => {
    async function loadSavedPlan() {
      setLoadingSavedPlan(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoadingSavedPlan(false);
        return;
      }

      const { data, error } = await supabase
        .from("nutrition_plans")
        .select(
          `
          daily_calories,
          protein_grams,
          water_litres,
          weekly_plan,
          created_at
          `
        )
        .eq("user_id", user.id)
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Saved nutrition plan error:", error);
        setLoadingSavedPlan(false);
        return;
      }

      // Only load NEW 7-day format
      if (
        data &&
        Array.isArray(data.weekly_plan) &&
        data.weekly_plan.length === 7
      ) {
        setPlan({
          daily_calories: data.daily_calories,
          protein_grams: data.protein_grams,
          water_litres: Number(data.water_litres),
          days: data.weekly_plan,
        });

        setSelectedDay(data.weekly_plan[0]?.day || "Monday");
      }

      setLoadingSavedPlan(false);
    }

    loadSavedPlan();
  }, []);

  // =====================================================
  // GENERATE NEW WEEKLY PLAN
  // =====================================================

  async function generatePlan() {
    if (loading) {
      return;
    }

    setLoading(true);
    setMessage("Loading your wellness profile...");
    setError("");

    try {
      // -------------------------------------------------
      // GET USER
      // -------------------------------------------------

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("You must be logged in.");
      }

      // -------------------------------------------------
      // GET PROFILE
      // -------------------------------------------------

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        throw new Error("Could not load your wellness profile.");
      }

      // -------------------------------------------------
      // CALL FASTAPI
      // -------------------------------------------------

      setMessage("AI is creating your 7-day nutrition plan...");

      const response = await fetch(
        "http://127.0.0.1:8000/nutrition-plan",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            profile,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || `Backend error: ${response.status}`
        );
      }

      if (!data.success) {
        throw new Error(
          data.error || "AI could not generate your nutrition plan."
        );
      }

      if (!data.plan) {
        throw new Error("Backend did not return a nutrition plan.");
      }

      const newPlan = data.plan as NutritionPlan;

      // -------------------------------------------------
      // VALIDATE NEW FORMAT
      // -------------------------------------------------

      if (
        !Array.isArray(newPlan.days) ||
        newPlan.days.length !== 7
      ) {
        console.error("Invalid weekly nutrition plan:", newPlan);

        throw new Error(
          "AI returned an invalid weekly nutrition plan."
        );
      }

      // -------------------------------------------------
      // DISABLE OLD PLANS
      // -------------------------------------------------

      const { error: deactivateError } = await supabase
        .from("nutrition_plans")
        .update({
          active: false,
        })
        .eq("user_id", user.id)
        .eq("active", true);

      if (deactivateError) {
        console.error(
          "Could not deactivate previous plan:",
          deactivateError
        );
      }

      // -------------------------------------------------
      // SAVE NEW PLAN
      // -------------------------------------------------

      const { error: saveError } = await supabase
        .from("nutrition_plans")
        .insert({
          user_id: user.id,
          daily_calories: newPlan.daily_calories,
          protein_grams: newPlan.protein_grams,
          water_litres: newPlan.water_litres,
          weekly_plan: newPlan.days,
          active: true,
        });

      if (saveError) {
        console.error("Save nutrition plan error:", saveError);

        throw new Error(
          "Your AI plan was generated but could not be saved."
        );
      }

      // -------------------------------------------------
      // DISPLAY NEW PLAN
      // -------------------------------------------------

      setPlan(newPlan);

      setSelectedDay(
        newPlan.days[0]?.day || "Monday"
      );

      setMessage("");
    } catch (err) {
      console.error("Nutrition generation error:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong.");
      }

      setMessage("");
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // CURRENT DAY
  // =====================================================

  const currentDay = plan?.days?.find(
    (day) => day.day === selectedDay
  );

  // =====================================================
  // RESET VIEW FOR NEW GENERATION
  // =====================================================

  function generateNewWeek() {
    setPlan(null);
    setSelectedDay("Monday");
    setMessage("");
    setError("");
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main className="min-h-screen bg-gray-50 flex">
      <AppSidebar />

      <section className="flex-1 p-10">
        <div className="max-w-6xl">

          {/* HEADER */}

          <p className="text-sm font-semibold text-gray-500">
            WELLNESS PLAN
          </p>

          <h1 className="text-4xl font-bold text-black mt-2">
            Nutrition
          </h1>

          <p className="text-gray-600 mt-3">
            Your personalized AI-powered weekly nutrition plan.
          </p>

          {/* LOADING SAVED PLAN */}

          {loadingSavedPlan && (
            <div className="mt-10 bg-white border border-gray-200 rounded-2xl p-8">
              <p className="text-gray-500">
                Loading your saved nutrition plan...
              </p>
            </div>
          )}

          {/* GENERATOR */}

          {!loadingSavedPlan && !plan && (
            <div className="mt-10 bg-white border border-gray-200 rounded-2xl p-8">

              <h2 className="text-2xl font-semibold text-black">
                Create Your Weekly Nutrition Plan
              </h2>

              <p className="text-gray-500 mt-2">
                AI will create a seven-day meal plan using your
                profile, goals, diet preferences and foods.
              </p>

              <button
                type="button"
                onClick={generatePlan}
                disabled={loading}
                className="
                  mt-6
                  bg-black
                  text-white
                  px-6
                  py-3
                  rounded-xl
                  font-semibold
                  hover:bg-gray-800
                  disabled:bg-gray-400
                  disabled:cursor-not-allowed
                  cursor-pointer
                "
              >
                {loading
                  ? "Generating 7-Day Plan..."
                  : "Generate Nutrition Plan"}
              </button>

              {message && (
                <div className="mt-5 bg-blue-50 rounded-xl p-4">
                  <p className="text-blue-700 text-sm">
                    {message}
                  </p>
                </div>
              )}

              {error && (
                <div className="mt-5 bg-red-50 border border-red-200 rounded-xl p-4">

                  <p className="text-red-700 font-semibold">
                    Could not generate plan
                  </p>

                  <p className="text-red-600 mt-1 text-sm">
                    {error}
                  </p>

                </div>
              )}

            </div>
          )}

          {/* WEEKLY PLAN */}

          {plan && Array.isArray(plan.days) && (
            <>
              {/* TARGETS */}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10">

                <TargetCard
                  title="Daily Calories"
                  value={plan.daily_calories}
                  unit="kcal"
                />

                <TargetCard
                  title="Protein"
                  value={plan.protein_grams}
                  unit="g"
                />

                <TargetCard
                  title="Water"
                  value={plan.water_litres}
                  unit="L"
                />

              </div>

              {/* DAY NAVIGATION */}

              <div className="mt-10 bg-white border border-gray-200 rounded-2xl p-4">

                <div className="flex flex-wrap gap-2">

                  {plan.days.map((day) => (
                    <button
                      key={day.day}
                      type="button"
                      onClick={() =>
                        setSelectedDay(day.day)
                      }
                      className={`
                        px-4
                        py-2
                        rounded-xl
                        font-medium
                        cursor-pointer

                        ${
                          selectedDay === day.day
                            ? "bg-black text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }
                      `}
                    >
                      {day.day.slice(0, 3)}
                    </button>
                  ))}

                </div>

              </div>

              {/* SELECTED DAY */}

              {currentDay && (
                <section className="mt-8">

                  <div className="flex justify-between items-center">

                    <h2 className="text-3xl font-bold text-black">
                      {currentDay.day}
                    </h2>

                    <button
                      type="button"
                      onClick={generateNewWeek}
                      className="text-sm text-gray-500 hover:text-black cursor-pointer"
                    >
                      Generate New Week
                    </button>

                  </div>

                  {/* MEALS */}

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">

                    {currentDay.meals.map(
                      (meal, index) => (
                        <div
                          key={`${meal.name}-${index}`}
                          className="bg-white border border-gray-200 rounded-2xl p-6"
                        >

                          <h3 className="text-xl font-bold text-black">
                            {meal.name}
                          </h3>

                          {/* MACROS */}

                          <div className="flex gap-4 mt-3 text-sm text-gray-500">

                            <span>
                              {meal.calories} kcal
                            </span>

                            <span>
                              {meal.protein_grams}g protein
                            </span>

                          </div>

                          {/* FOODS */}

                          <div className="mt-5 space-y-3">

                            {meal.foods.map(
                              (food, foodIndex) => (
                                <div
                                  key={`${food}-${foodIndex}`}
                                  className="flex gap-3 items-start"
                                >
                                  <span>•</span>

                                  <p className="text-gray-700">
                                    {food}
                                  </p>
                                </div>
                              )
                            )}

                          </div>

                          {/* REASON */}

                          {meal.reason && (
                            <div className="mt-6 pt-5 border-t border-gray-100">

                              <p className="text-xs font-semibold text-gray-400 uppercase">
                                Why this meal?
                              </p>

                              <p className="text-sm text-gray-600 mt-2">
                                {meal.reason}
                              </p>

                            </div>
                          )}

                        </div>
                      )
                    )}

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
}: {
  title: string;
  value: number;
  unit: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">

      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="text-3xl font-bold text-black mt-2">
        {value}

        <span className="text-base font-normal ml-1">
          {unit}
        </span>
      </p>

    </div>
  );
}