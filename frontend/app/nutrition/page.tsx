"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import {
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

    <main className="min-h-screen bg-gray-50 lg:flex">

      <AppSidebar />


      <section className="min-w-0 flex-1 px-4 pb-10 pt-20 sm:px-6 lg:p-10">

        <div className="mx-auto w-full max-w-6xl min-w-0">


          {/* HEADER */}

          <p className="text-sm font-semibold text-gray-500">

            WELLNESS PLAN

          </p>


          <h1 className="mt-2 text-3xl font-bold leading-tight text-black sm:text-4xl">

            Nutrition

          </h1>


          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">

            Your personalized AI-powered weekly nutrition plan.

          </p>


          {/* LOADING */}

          {loadingSavedPlan && (

            <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 sm:mt-10 sm:p-8">

              <div className="flex items-center gap-3">

                <RefreshCw
                  size={20}
                  strokeWidth={2}
                  className="text-black animate-spin"
                />


                <p className="text-gray-500">

                  Loading your saved nutrition plan...

                </p>

              </div>

            </div>

          )}


          {/* LOAD ERROR */}

          {!loadingSavedPlan &&
            errorMessage &&
            !plan && (

              <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 sm:p-6">

                <p className="font-semibold text-red-700">

                  Nutrition data error

                </p>


                <p className="text-red-600 mt-2">

                  {errorMessage}

                </p>

              </div>

            )}


          {/* GENERATOR */}

          {!loadingSavedPlan &&
            !plan && (

              <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 sm:mt-10 sm:p-8">

                <div className="flex items-center gap-3">

                  <div
                    className="
                      w-11
                      h-11
                      rounded-xl
                      bg-gray-100
                      flex
                      items-center
                      justify-center
                    "
                  >

                    <Sparkles
                      size={22}
                      strokeWidth={2}
                      className="text-black"
                    />

                  </div>


                  <h2 className="text-xl font-semibold text-black sm:text-2xl">

                    Create Your Weekly Nutrition Plan

                  </h2>

                </div>


                <p className="text-gray-500 mt-4 max-w-2xl">

                  AI will create a seven-day meal plan using your profile,
                  goals, diet preferences and foods.

                </p>


                <button
                  type="button"

                  onClick={
                    generatePlan
                  }

                  disabled={
                    loading
                  }

                  className="
                    mt-6
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-black
                    px-6
                    py-3
                    font-semibold
                    text-white
                    transition
                    hover:bg-gray-800
                    disabled:cursor-not-allowed
                    disabled:bg-gray-400
                    cursor-pointer
                    sm:w-auto
                  "
                >

                  {loading ? (

                    <>
                      <RefreshCw
                        size={18}
                        strokeWidth={2}
                        className="animate-spin"
                      />

                      Generating 7-Day Plan...
                    </>

                  ) : (

                    <>
                      <Sparkles
                        size={18}
                        strokeWidth={2}
                      />

                      Generate Nutrition Plan
                    </>

                  )}

                </button>


                {message && (

                  <div className="mt-5 bg-blue-50 rounded-xl p-4">

                    <p className="text-blue-700 text-sm">

                      {message}

                    </p>

                  </div>

                )}

              </div>

            )}


          {/* PLAN */}

          {plan &&
            Array.isArray(
              plan.days
            ) && (

              <>


                {/* DAILY TARGETS */}

                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mt-10 md:grid-cols-3 md:gap-5">

                  <TargetCard
                    title="Daily Calories"
                    value={
                      plan.daily_calories
                    }
                    unit="kcal"
                    icon={
                      <Flame
                        size={22}
                        strokeWidth={2}
                        className="text-black"
                      />
                    }
                  />


                  <TargetCard
                    title="Protein"
                    value={
                      plan.protein_grams
                    }
                    unit="g"
                    icon={
                      <Dumbbell
                        size={22}
                        strokeWidth={2}
                        className="text-black"
                      />
                    }
                  />


                  <TargetCard
                    title="Water"
                    value={
                      plan.water_litres
                    }
                    unit="L"
                    icon={
                      <Droplets
                        size={22}
                        strokeWidth={2}
                        className="text-black"
                      />
                    }
                  />

                </div>


                {/* DAY SELECTOR */}

                <div className="mt-8 overflow-x-auto rounded-2xl border border-gray-200 bg-white p-3 sm:mt-10 sm:p-4">

                  <div className="flex min-w-max gap-2 sm:min-w-0 sm:flex-wrap">

                    {plan.days.map(
                      (
                        day
                      ) => (

                        <button
                          key={
                            day.day
                          }

                          type="button"

                          onClick={() =>
                            setSelectedDay(
                              day.day
                            )
                          }

                          className={`
                            px-4
                            py-2
                            rounded-xl
                            font-medium
                            cursor-pointer
                            transition

                            ${
                              selectedDay ===
                              day.day
                                ? "bg-black text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-black"
                            }
                          `}
                        >

                          {day.day.slice(
                            0,
                            3
                          )}

                        </button>

                      )
                    )}

                  </div>

                </div>


                {/* CURRENT DAY */}

                {currentDay && (

                  <section className="mt-8">

                    <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">

                      <div>

                        <p className="text-sm font-semibold text-gray-500">

                          DAILY MEAL PLAN

                        </p>


                        <h2 className="mt-1 text-2xl font-bold text-black sm:text-3xl">

                          {currentDay.day}

                        </h2>

                      </div>


                      <button
                        type="button"

                        onClick={
                          generateNewWeek
                        }

                        className="
                          flex
                          w-fit
                          items-center
                          gap-2
                          text-left
                          text-sm
                          text-gray-500
                          transition
                          hover:text-black
                          cursor-pointer
                        "
                      >

                        <RefreshCw
                          size={17}
                          strokeWidth={2}
                          className="text-current"
                        />

                        Generate New Week

                      </button>

                    </div>


                    {/* MEALS */}

                    <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3 xl:gap-6">

                      {Array.isArray(
                        currentDay.meals
                      ) &&
                        currentDay.meals.map(
                          (
                            meal,
                            index
                          ) => (

                            <div
                              key={`${meal.name}-${index}`}

                              className="
                                min-w-0
                                rounded-2xl
                                border
                                border-gray-200
                                bg-white
                                p-5
                                transition
                                hover:shadow-sm
                                sm:p-6
                              "
                            >


                              {/* MEAL HEADER */}

                              <div className="flex items-center gap-3">

                                <div
                                  className="
                                    w-11
                                    h-11
                                    rounded-xl
                                    bg-gray-100
                                    flex
                                    items-center
                                    justify-center
                                    shrink-0
                                  "
                                >

                                  {getMealIcon(
                                    meal.name
                                  )}

                                </div>


                                <h3 className="break-words text-lg font-bold text-black sm:text-xl">

                                  {meal.name}

                                </h3>

                              </div>


                              {/* MACROS */}

                              <div className="flex flex-wrap gap-4 mt-5 text-sm text-gray-500">

                                <div className="flex items-center gap-1.5">

                                  <Flame
                                    size={17}
                                    strokeWidth={2}
                                    className="text-black"
                                  />


                                  <span>

                                    {meal.calories} kcal

                                  </span>

                                </div>


                                <div className="flex items-center gap-1.5">

                                  <Dumbbell
                                    size={17}
                                    strokeWidth={2}
                                    className="text-black"
                                  />


                                  <span>

                                    {meal.protein_grams}g protein

                                  </span>

                                </div>

                              </div>


                              {/* FOODS */}

                              <div className="mt-6">

                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">

                                  Foods

                                </p>


                                <div className="mt-3 space-y-3">

                                  {Array.isArray(
                                    meal.foods
                                  ) &&
                                    meal.foods.map(
                                      (
                                        food,
                                        foodIndex
                                      ) => (

                                        <div
                                          key={`${food}-${foodIndex}`}

                                          className="flex gap-3 items-start"
                                        >

                                          <div
                                            className="
                                              w-1.5
                                              h-1.5
                                              bg-gray-400
                                              rounded-full
                                              mt-2
                                              shrink-0
                                            "
                                          />


                                          <p className="min-w-0 break-words text-gray-700 leading-relaxed">

                                            {food}

                                          </p>

                                        </div>

                                      )
                                    )}

                                </div>

                              </div>


                              {/* REASON */}

                              {meal.reason && (

                                <div className="mt-6 pt-5 border-t border-gray-100">

                                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">

                                    Why this meal?

                                  </p>


                                  <p className="mt-2 break-words text-sm leading-relaxed text-gray-600">

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
  icon,
}: {
  title: string;
  value: number;
  unit: string;
  icon: ReactNode;
}) {

  return (

    <div
      className="
        flex
        min-w-0
        items-start
        justify-between
        gap-4
        rounded-2xl
        border
        border-gray-200
        bg-white
        p-5
        sm:p-6
      "
    >

      <div>

        <p className="text-sm text-gray-500">

          {title}

        </p>


        <p className="mt-2 break-words text-2xl font-bold text-black sm:text-3xl">

          {value}

          <span className="text-base font-normal ml-1 text-gray-500">

            {unit}

          </span>

        </p>

      </div>


      <div
        className="
          w-11
          h-11
          rounded-xl
          bg-gray-100
          flex
          items-center
          justify-center
          shrink-0
        "
      >

        {icon}

      </div>

    </div>
  );
}