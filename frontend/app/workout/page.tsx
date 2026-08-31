"use client";

import { useEffect, useState } from "react";
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

  // =====================================================
  // API BASE URL
  // =====================================================

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://127.0.0.1:8000";

  // =====================================================
  // LOAD SAVED PLAN
  // =====================================================

  useEffect(() => {
    async function loadSavedPlan() {
      setLoadingSavedPlan(true);
      setErrorMessage("");

      try {
        // -------------------------------------------------
        // GET USER
        // -------------------------------------------------

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw new Error(userError.message);
        }

        if (!user) {
          throw new Error("You are not logged in.");
        }

        // -------------------------------------------------
        // GET SAVED WORKOUT PLAN
        // -------------------------------------------------

        const {
          data,
          error: savedPlanError,
        } = await supabase
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
          .order("created_at", {
            ascending: false,
          })
          .limit(1)
          .maybeSingle();

        if (savedPlanError) {
          console.error(
            "Workout saved plan message:",
            savedPlanError.message
          );

          console.error(
            "Workout saved plan code:",
            savedPlanError.code
          );

          console.error(
            "Workout saved plan details:",
            savedPlanError.details
          );

          throw new Error(
            savedPlanError.message ||
              "Could not load your saved workout plan."
          );
        }

        // -------------------------------------------------
        // LOAD VALID PLAN
        // -------------------------------------------------

        if (
          data &&
          Array.isArray(data.weekly_plan) &&
          data.weekly_plan.length === 7
        ) {
          setPlan({
            workout_days: Number(data.workout_days),
            days: data.weekly_plan,
          });

          setSelectedDay(
            data.weekly_plan[0]?.day || "Monday"
          );
        }
      } catch (err) {
        console.error(
          "Workout load error:",
          err
        );

        if (err instanceof Error) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage(
            "Could not load your workout plan."
          );
        }
      } finally {
        setLoadingSavedPlan(false);
      }
    }

    loadSavedPlan();
  }, []);

  // =====================================================
  // GENERATE WORKOUT PLAN
  // =====================================================

  async function generatePlan() {
    if (loading) {
      return;
    }

    setLoading(true);
    setErrorMessage("");

    setMessage(
      "Loading your wellness profile..."
    );

    try {
      // -------------------------------------------------
      // USER
      // -------------------------------------------------

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(
          "You must be logged in."
        );
      }

      // -------------------------------------------------
      // PROFILE
      // -------------------------------------------------

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        console.error(
          "Workout profile error:",
          profileError
        );

        throw new Error(
          profileError?.message ||
            "Could not load your wellness profile."
        );
      }

      // -------------------------------------------------
      // CALL RAILWAY FASTAPI
      // -------------------------------------------------

      setMessage(
        "AI is creating your weekly workout plan..."
      );

      const apiUrl =
        `${API_BASE_URL}/workout-plan`;

      console.log(
        "Calling workout API:",
        apiUrl
      );

      const response = await fetch(
        apiUrl,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            profile,
          }),
        }
      );

      // -------------------------------------------------
      // READ BACKEND RESPONSE
      // -------------------------------------------------

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "The backend returned an invalid response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            `Backend error: ${response.status}`
        );
      }

      if (!data.success) {
        throw new Error(
          data.error ||
            "AI could not generate your workout plan."
        );
      }

      if (!data.plan) {
        throw new Error(
          "Backend did not return a workout plan."
        );
      }

      const newPlan =
        data.plan as WorkoutPlan;

      // -------------------------------------------------
      // VALIDATE PLAN
      // -------------------------------------------------

      if (
        !Array.isArray(newPlan.days) ||
        newPlan.days.length !== 7
      ) {
        console.error(
          "Invalid workout plan:",
          newPlan
        );

        throw new Error(
          "AI returned an invalid workout plan."
        );
      }

      // -------------------------------------------------
      // DISABLE OLD PLAN
      // -------------------------------------------------

      const {
        error: deactivateError,
      } = await supabase
        .from("workout_plans")
        .update({
          active: false,
        })
        .eq("user_id", user.id)
        .eq("active", true);

      if (deactivateError) {
        console.error(
          "Workout deactivate error:",
          deactivateError.message
        );
      }

      // -------------------------------------------------
      // SAVE NEW PLAN
      // -------------------------------------------------

      const {
        error: saveError,
      } = await supabase
        .from("workout_plans")
        .insert({
          user_id: user.id,
          workout_days:
            newPlan.workout_days,
          weekly_plan:
            newPlan.days,
          active: true,
        });

      if (saveError) {
        console.error(
          "Workout save message:",
          saveError.message
        );

        console.error(
          "Workout save code:",
          saveError.code
        );

        console.error(
          "Workout save details:",
          saveError.details
        );

        throw new Error(
          saveError.message ||
            "Workout plan was generated but could not be saved."
        );
      }

      // -------------------------------------------------
      // DISPLAY PLAN
      // -------------------------------------------------

      setPlan(newPlan);

      setSelectedDay(
        newPlan.days[0]?.day ||
          "Monday"
      );

      setMessage("");
    } catch (err) {
      console.error(
        "Workout generation error:",
        err
      );

      if (err instanceof Error) {
        setErrorMessage(
          err.message
        );
      } else {
        setErrorMessage(
          "Something went wrong."
        );
      }

      setMessage("");
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // CURRENT DAY
  // =====================================================

  const currentDay =
    plan?.days?.find(
      (day) =>
        day.day === selectedDay
    );

  // =====================================================
  // RESET PLAN
  // =====================================================

  function generateNewPlan() {
    setPlan(null);
    setSelectedDay("Monday");
    setErrorMessage("");
    setMessage("");
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main className="min-h-screen bg-gray-50 lg:flex">

      <AppSidebar />

      <section className="min-w-0 flex-1 px-4 pb-10 pt-20 sm:px-6 lg:p-10">

        <div className="mx-auto w-full max-w-6xl min-w-0">

          {/* HEADER */}

          <p className="text-sm font-semibold text-gray-500">
            FITNESS PLAN
          </p>

          <h1 className="mt-2 text-3xl font-bold leading-tight text-black sm:text-4xl">
            Workout
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
            Your personalized AI-powered weekly workout plan.
          </p>

          {/* LOADING */}

          {loadingSavedPlan && (
            <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 sm:mt-10 sm:p-8">

              <p className="text-gray-500">
                Loading your saved workout plan...
              </p>

            </div>
          )}

          {/* SAVED PLAN ERROR */}

          {!loadingSavedPlan &&
            errorMessage &&
            !plan && (
              <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 sm:p-6">

                <p className="font-semibold text-red-700">
                  Workout data error
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

                <h2 className="text-xl font-semibold text-black sm:text-2xl">
                  Create Your Workout Plan
                </h2>

                <p className="mt-2 break-words text-sm leading-6 text-gray-500 sm:text-base">
                  AI will generate a weekly workout using your goal,
                  activity level, workout days and available time.
                </p>

                <button
                  type="button"
                  onClick={generatePlan}
                  disabled={loading}
                  className="
                    mt-6
                    w-full
                    rounded-xl
                    bg-black
                    px-6
                    py-3
                    font-semibold
                    text-white
                    hover:bg-gray-800
                    disabled:cursor-not-allowed
                    disabled:bg-gray-400
                    cursor-pointer
                    sm:w-auto
                  "
                >
                  {loading
                    ? "Generating Workout..."
                    : "Generate Workout Plan"}
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
            Array.isArray(plan.days) && (
              <>

                {/* SUMMARY */}

                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mt-10 md:gap-5">

                  <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">

                    <p className="text-sm text-gray-500">
                      Weekly Training
                    </p>

                    <p className="mt-2 text-2xl font-bold text-black sm:text-3xl">
                      {plan.workout_days}

                      <span className="text-base font-normal ml-1">
                        days
                      </span>
                    </p>

                  </div>

                  <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">

                    <p className="text-sm text-gray-500">
                      Recovery Days
                    </p>

                    <p className="mt-2 text-2xl font-bold text-black sm:text-3xl">
                      {7 -
                        plan.workout_days}

                      <span className="text-base font-normal ml-1">
                        days
                      </span>
                    </p>

                  </div>

                </div>

                {/* DAY NAVIGATION */}

                <div className="mt-8 overflow-x-auto rounded-2xl border border-gray-200 bg-white p-3 sm:mt-10 sm:p-4">

                  <div className="flex min-w-max gap-2 sm:min-w-0 sm:flex-wrap">

                    {plan.days.map(
                      (day) => (
                        <button
                          key={day.day}
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

                            ${
                              selectedDay ===
                              day.day
                                ? "bg-black text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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

                {/* SELECTED DAY */}

                {currentDay && (
                  <section className="mt-8">

                    <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                      <div>

                        <h2 className="break-words text-2xl font-bold text-black sm:text-3xl">
                          {currentDay.day}
                        </h2>

                        <p className="mt-2 break-words text-sm leading-6 text-gray-500 sm:text-base">
                          {currentDay.focus}
                          {" • "}
                          {currentDay.duration_minutes} minutes
                        </p>

                      </div>

                      <button
                        type="button"
                        onClick={
                          generateNewPlan
                        }
                        className="w-fit text-left text-sm text-gray-500 hover:text-black cursor-pointer"
                      >
                        Generate New Plan
                      </button>

                    </div>

                    {/* REST DAY */}

                    {currentDay.type ===
                      "rest" && (
                        <div className="mt-6 min-w-0 rounded-2xl border border-gray-200 bg-white p-5 sm:p-8">

                          <h3 className="text-2xl font-semibold text-black">
                            Recovery Day
                          </h3>

                          <p className="mt-2 break-words text-sm leading-6 text-gray-500 sm:text-base">
                            Focus on recovery, light movement
                            and preparation for your next workout.
                          </p>

                          {currentDay.cardio && (
                            <div className="mt-6">

                              <p className="font-semibold text-black">
                                Activity
                              </p>

                              <p className="mt-2 break-words text-gray-600">
                                {currentDay.cardio.activity}
                                {" — "}
                                {currentDay.cardio.duration_minutes} minutes
                              </p>

                            </div>
                          )}

                          {Array.isArray(
                            currentDay.cooldown
                          ) &&
                            currentDay.cooldown.length >
                              0 && (
                              <div className="mt-6">

                                <p className="font-semibold text-black">
                                  Mobility
                                </p>

                                <ul className="mt-2 space-y-2 text-gray-600">

                                  {currentDay.cooldown.map(
                                    (
                                      item,
                                      index
                                    ) => (
                                      <li key={index}>
                                        • {item}
                                      </li>
                                    )
                                  )}

                                </ul>

                              </div>
                            )}

                        </div>
                      )}

                    {/* WORKOUT DAY */}

                    {currentDay.type ===
                      "workout" && (
                        <>

                          {/* WARMUP */}

                          <div className="mt-6 min-w-0 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">

                            <h3 className="text-xl font-semibold text-black">
                              Warm-up
                            </h3>

                            <ul className="mt-4 space-y-2">

                              {Array.isArray(
                                currentDay.warmup
                              ) &&
                                currentDay.warmup.map(
                                  (
                                    item,
                                    index
                                  ) => (
                                    <li
                                      key={index}
                                      className="break-words text-gray-700"
                                    >
                                      • {item}
                                    </li>
                                  )
                                )}

                            </ul>

                          </div>

                          {/* EXERCISES */}

                          <div className="mt-6 min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white">

                            <div className="border-b border-gray-200 p-5 sm:p-6">

                              <h3 className="text-xl font-semibold text-black">
                                Exercises
                              </h3>

                            </div>

                            <div className="overflow-x-auto">

                              <table className="w-full min-w-[620px]">

                                <thead className="bg-gray-50">

                                  <tr>

                                    <th className="whitespace-nowrap px-4 py-4 text-left text-sm text-gray-500 sm:px-6">
                                      Exercise
                                    </th>

                                    <th className="whitespace-nowrap px-4 py-4 text-left text-sm text-gray-500 sm:px-6">
                                      Sets
                                    </th>

                                    <th className="whitespace-nowrap px-4 py-4 text-left text-sm text-gray-500 sm:px-6">
                                      Reps
                                    </th>

                                    <th className="whitespace-nowrap px-4 py-4 text-left text-sm text-gray-500 sm:px-6">
                                      Rest
                                    </th>

                                  </tr>

                                </thead>

                                <tbody>

                                  {Array.isArray(
                                    currentDay.exercises
                                  ) &&
                                    currentDay.exercises.map(
                                      (
                                        exercise,
                                        index
                                      ) => (
                                        <tr
                                          key={`${exercise.name}-${index}`}
                                          className="border-t border-gray-100"
                                        >

                                          <td className="px-4 py-4 font-medium text-black sm:px-6">
                                            {exercise.name}
                                          </td>

                                          <td className="whitespace-nowrap px-4 py-4 text-gray-600 sm:px-6">
                                            {exercise.sets}
                                          </td>

                                          <td className="whitespace-nowrap px-4 py-4 text-gray-600 sm:px-6">
                                            {exercise.reps}
                                          </td>

                                          <td className="whitespace-nowrap px-4 py-4 text-gray-600 sm:px-6">
                                            {exercise.rest_seconds} sec
                                          </td>

                                        </tr>
                                      )
                                    )}

                                </tbody>

                              </table>

                            </div>

                          </div>

                          {/* CARDIO */}

                          {currentDay.cardio && (
                            <div className="mt-6 min-w-0 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">

                              <h3 className="text-xl font-semibold text-black">
                                Cardio
                              </h3>

                              <p className="mt-3 break-words text-gray-600">
                                {currentDay.cardio.activity}
                                {" — "}
                                {currentDay.cardio.duration_minutes} minutes
                              </p>

                            </div>
                          )}

                          {/* COOLDOWN */}

                          <div className="mt-6 min-w-0 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">

                            <h3 className="text-xl font-semibold text-black">
                              Cool-down
                            </h3>

                            <ul className="mt-4 space-y-2">

                              {Array.isArray(
                                currentDay.cooldown
                              ) &&
                                currentDay.cooldown.map(
                                  (
                                    item,
                                    index
                                  ) => (
                                    <li
                                      key={index}
                                      className="break-words text-gray-700"
                                    >
                                      • {item}
                                    </li>
                                  )
                                )}

                            </ul>

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