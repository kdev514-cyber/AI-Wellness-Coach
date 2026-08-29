"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import {
  Coffee,
  Utensils,
  Droplets,
  Footprints,
  Moon,
  Scale,
  Smile,
  Zap,
  Dumbbell,
  HeartPulse,
  Check,
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


// =========================================================
// TRACKER PAGE
// =========================================================

export default function TrackerPage() {

  // =======================================================
  // DATE
  // =======================================================

  const today =
    new Date().toLocaleDateString(
      "en-CA"
    );


  const [
    selectedDate,
    setSelectedDate
  ] = useState(
    today
  );


  // =======================================================
  // PLAN DATA
  // =======================================================

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


  // =======================================================
  // COMPLETION
  // =======================================================

  const [
    breakfastCompleted,
    setBreakfastCompleted
  ] = useState(
    false
  );


  const [
    lunchCompleted,
    setLunchCompleted
  ] = useState(
    false
  );


  const [
    dinnerCompleted,
    setDinnerCompleted
  ] = useState(
    false
  );


  const [
    workoutCompleted,
    setWorkoutCompleted
  ] = useState(
    false
  );


  // =======================================================
  // DAILY VALUES
  // =======================================================

  const [
    water,
    setWater
  ] = useState(
    "0"
  );


  const [
    steps,
    setSteps
  ] = useState(
    "0"
  );


  const [
    sleep,
    setSleep
  ] = useState(
    "0"
  );


  const [
    weight,
    setWeight
  ] = useState(
    ""
  );


  // =======================================================
  // WELLBEING
  // =======================================================

  const [
    mood,
    setMood
  ] = useState(
    3
  );


  const [
    energy,
    setEnergy
  ] = useState(
    3
  );


  const [
    notes,
    setNotes
  ] = useState(
    ""
  );


  // =======================================================
  // PAGE STATE
  // =======================================================

  const [
    loading,
    setLoading
  ] = useState(
    true
  );


  const [
    saving,
    setSaving
  ] = useState(
    false
  );


  const [
    message,
    setMessage
  ] = useState(
    ""
  );


  const [
    error,
    setError
  ] = useState(
    ""
  );


  // =======================================================
  // SELECTED DATE -> WEEKDAY
  // =======================================================

  function getDayName(
    dateString: string
  ) {

    const [
      year,
      month,
      day
    ] =
      dateString
        .split("-")
        .map(
          Number
        );


    const date =
      new Date(
        year,
        month - 1,
        day
      );


    return date.toLocaleDateString(
      "en-US",
      {
        weekday:
          "long"
      }
    );
  }


  const selectedDayName =
    getDayName(
      selectedDate
    );


  // =======================================================
  // LOAD TRACKER + PLANS
  // =======================================================

  useEffect(() => {

    async function loadPage() {

      setLoading(
        true
      );

      setMessage(
        ""
      );

      setError(
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

          throw new Error(
            "You must be logged in."
          );

        }


        // =================================================
        // LOAD DAILY TRACKER
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
              "*"
            )

            .eq(
              "user_id",
              user.id
            )

            .eq(
              "tracker_date",
              selectedDate
            )

            .maybeSingle();


        if (
          trackerError
        ) {

          console.error(
            "Tracker load error:",
            trackerError
          );

          throw new Error(
            "Could not load your daily tracker."
          );

        }


        // =================================================
        // EXISTING TRACKER
        // =================================================

        if (
          trackerData
        ) {

          setBreakfastCompleted(
            trackerData.breakfast_completed ??
              false
          );

          setLunchCompleted(
            trackerData.lunch_completed ??
              false
          );

          setDinnerCompleted(
            trackerData.dinner_completed ??
              false
          );

          setWorkoutCompleted(
            trackerData.workout_completed ??
              false
          );

          setWater(
            String(
              trackerData.water_litres ??
                0
            )
          );

          setSteps(
            String(
              trackerData.steps ??
                0
            )
          );

          setSleep(
            String(
              trackerData.sleep_hours ??
                0
            )
          );

          setWeight(

            trackerData.weight_kg !==
              null &&
            trackerData.weight_kg !==
              undefined

              ? String(
                  trackerData.weight_kg
                )

              : ""

          );

          setMood(
            trackerData.mood ??
              3
          );

          setEnergy(
            trackerData.energy ??
              3
          );

          setNotes(
            trackerData.notes ??
              ""
          );

        }


        // =================================================
        // EMPTY TRACKER
        // =================================================

        else {

          setBreakfastCompleted(
            false
          );

          setLunchCompleted(
            false
          );

          setDinnerCompleted(
            false
          );

          setWorkoutCompleted(
            false
          );

          setWater(
            "0"
          );

          setSteps(
            "0"
          );

          setSleep(
            "0"
          );

          setWeight(
            ""
          );

          setMood(
            3
          );

          setEnergy(
            3
          );

          setNotes(
            ""
          );

        }


        // =================================================
        // LOAD ACTIVE NUTRITION PLAN
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
            "Nutrition tracker load error:",
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
                  selectedDayName
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
        // LOAD ACTIVE WORKOUT PLAN
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
            "Workout tracker load error:",
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
                  selectedDayName
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


      } catch (
        err
      ) {

        console.error(
          "Tracker page load error:",
          err
        );


        if (
          err instanceof Error
        ) {

          setError(
            err.message
          );

        }

        else {

          setError(
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


    loadPage();

  }, [
    selectedDate,
    selectedDayName
  ]);


  // =======================================================
  // MEAL FINDER
  // =======================================================

  function findMeal(
    mealName:
      string
  ) {

    if (
      !nutritionDay ||
      !Array.isArray(
        nutritionDay.meals
      )
    ) {

      return null;

    }


    return (

      nutritionDay.meals.find(
        (
          meal
        ) =>
          meal.name
            .toLowerCase()
            .includes(
              mealName.toLowerCase()
            )
      ) ??

      null

    );

  }


  const breakfast =
    findMeal(
      "breakfast"
    );


  const lunch =
    findMeal(
      "lunch"
    );


  const dinner =
    findMeal(
      "dinner"
    );


  // =======================================================
  // SAVE TRACKER
  // =======================================================

  async function saveTracker() {

    setSaving(
      true
    );

    setMessage(
      ""
    );

    setError(
      ""
    );


    try {

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

        throw new Error(
          "You must be logged in."
        );

      }


      const trackerData = {

        user_id:
          user.id,

        tracker_date:
          selectedDate,

        breakfast_completed:
          breakfastCompleted,

        lunch_completed:
          lunchCompleted,

        dinner_completed:
          dinnerCompleted,

        workout_completed:
          workoutCompleted,

        water_litres:
          Number(
            water ||
              0
          ),

        steps:
          Number(
            steps ||
              0
          ),

        sleep_hours:
          Number(
            sleep ||
              0
          ),

        weight_kg:
          weight

            ? Number(
                weight
              )

            : null,

        mood:
          mood,

        energy:
          energy,

        notes:
          notes,

        updated_at:
          new Date()
            .toISOString(),

      };


      const {

        error:
          saveError

      } =
        await supabase

          .from(
            "daily_tracker"
          )

          .upsert(

            trackerData,

            {

              onConflict:
                "user_id,tracker_date",

            }

          );


      if (
        saveError
      ) {

        console.error(
          "Tracker save error:",
          saveError
        );

        throw new Error(
          "Could not save your daily tracker."
        );

      }


      setMessage(
        "Daily progress saved successfully!"
      );


    } catch (
      err
    ) {

      console.error(
        "Tracker save error:",
        err
      );


      if (
        err instanceof Error
      ) {

        setError(
          err.message
        );

      }

      else {

        setError(
          "Something went wrong."
        );

      }

    }

    finally {

      setSaving(
        false
      );

    }

  }


  // =======================================================
  // COMPLETION SCORE
  // =======================================================

  const workoutTargetCompleted =
    workoutDay?.type ===
      "rest"

      ? true

      : workoutCompleted;


  const completedHabits = [

    breakfastCompleted,

    lunchCompleted,

    dinnerCompleted,

    workoutTargetCompleted,

    Number(
      water
    ) >= 2,

    Number(
      steps
    ) >= 7000,

    Number(
      sleep
    ) >= 7,

  ].filter(
    Boolean
  ).length;


  const completionPercentage =
    Math.round(

      (
        completedHabits /
        7
      ) *
        100

    );


  // =======================================================
  // PAGE
  // =======================================================

  return (

    <main className="min-h-screen bg-gray-50 flex">

      <AppSidebar />


      <section className="flex-1 p-10">

        <div className="max-w-6xl">


          {/* HEADER */}

          <p className="text-sm font-semibold text-gray-500">

            DAILY WELLNESS

          </p>


          <h1 className="text-4xl font-bold text-black mt-2">

            Daily Tracker

          </h1>


          <p className="text-gray-600 mt-3">

            Follow your personalized plan and track your daily wellness.

          </p>


          {/* DATE */}

          <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-6">

            <label className="block text-sm font-medium text-gray-600">

              Tracking Date

            </label>


            <div className="flex flex-wrap items-center gap-5 mt-3">

              <input

                type="date"

                value={
                  selectedDate
                }

                onChange={
                  (
                    event
                  ) =>
                    setSelectedDate(
                      event.target.value
                    )
                }

                className="
                  border
                  border-gray-300
                  rounded-xl
                  px-4
                  py-3
                  text-black
                "

              />


              <p className="font-semibold text-black">

                {
                  selectedDayName
                }

              </p>

            </div>

          </div>


          {/* LOADING */}

          {
            loading && (

              <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-8">

                <p className="text-gray-500">

                  Loading your daily plan...

                </p>

              </div>

            )
          }


          {
            !loading && (

              <>


                {/* DAILY SCORE */}

                <div className="mt-8 bg-black text-white rounded-2xl p-8">

                  <p className="text-gray-300 text-sm">

                    Daily Completion

                  </p>


                  <p className="text-5xl font-bold mt-2">

                    {
                      completionPercentage
                    }%

                  </p>


                  <div className="mt-5 h-3 bg-gray-700 rounded-full overflow-hidden">

                    <div

                      className="h-full bg-white rounded-full transition-all"

                      style={{

                        width:
                          `${completionPercentage}%`

                      }}

                    />

                  </div>


                  <p className="text-gray-300 mt-4 text-sm">

                    {
                      completedHabits
                    } of 7 daily wellness targets completed

                  </p>

                </div>


                {/* ==========================================
                    NUTRITION
                ========================================== */}

                <section className="mt-10">

                  <div>

                    <p className="text-sm font-semibold text-gray-400">

                      TODAY&apos;S PLAN

                    </p>

                    <h2 className="text-2xl font-bold text-black mt-1">

                      Nutrition

                    </h2>

                  </div>


                  {
                    !nutritionDay && (

                      <div className="mt-5 bg-white border border-gray-200 rounded-2xl p-6">

                        <p className="text-gray-500">

                          No active nutrition plan found for {
                            selectedDayName
                          }.

                        </p>

                      </div>

                    )
                  }


                  {
                    nutritionDay && (

                      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mt-5">


                        <MealTrackerCard

                          icon={
                            <Coffee
                              size={24}
                              strokeWidth={2}
                              className="text-current"
                            />
                          }

                          fallbackTitle="Breakfast"

                          meal={
                            breakfast
                          }

                          checked={
                            breakfastCompleted
                          }

                          onChange={
                            setBreakfastCompleted
                          }

                        />


                        <MealTrackerCard

                          icon={
                            <Utensils
                              size={24}
                              strokeWidth={2}
                              className="text-current"
                            />
                          }

                          fallbackTitle="Lunch"

                          meal={
                            lunch
                          }

                          checked={
                            lunchCompleted
                          }

                          onChange={
                            setLunchCompleted
                          }

                        />


                        <MealTrackerCard

                          icon={
                            <Utensils
                              size={24}
                              strokeWidth={2}
                              className="text-current"
                            />
                          }

                          fallbackTitle="Dinner"

                          meal={
                            dinner
                          }

                          checked={
                            dinnerCompleted
                          }

                          onChange={
                            setDinnerCompleted
                          }

                        />


                      </div>

                    )
                  }

                </section>


                {/* ==========================================
                    WORKOUT
                ========================================== */}

                <section className="mt-10">

                  <p className="text-sm font-semibold text-gray-400">

                    TODAY&apos;S TRAINING

                  </p>


                  <h2 className="text-2xl font-bold text-black mt-1">

                    Workout

                  </h2>


                  {
                    !workoutDay && (

                      <div className="mt-5 bg-white border border-gray-200 rounded-2xl p-6">

                        <p className="text-gray-500">

                          No active workout plan found for {
                            selectedDayName
                          }.

                        </p>

                      </div>

                    )
                  }


                  {
                    workoutDay &&
                    workoutDay.type ===
                      "rest" && (

                      <div className="mt-5 bg-white border border-gray-200 rounded-2xl p-7">

                        <div className="flex justify-between gap-5">

                          <div>

                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">

                              <HeartPulse
                                size={25}
                                strokeWidth={2}
                                className="text-black"
                              />

                            </div>


                            <h3 className="text-xl font-bold text-black mt-4">

                              Recovery Day

                            </h3>


                            <p className="text-gray-500 mt-2">

                              {
                                workoutDay.focus
                              }

                            </p>

                          </div>


                          <span className="bg-green-50 text-green-700 h-fit px-4 py-2 rounded-xl text-sm font-semibold">

                            Recovery

                          </span>

                        </div>


                        {
                          workoutDay.cardio && (

                            <div className="mt-6 pt-5 border-t border-gray-100">

                              <p className="text-sm font-semibold text-gray-500">

                                Suggested activity

                              </p>


                              <p className="text-black mt-2">

                                {
                                  workoutDay.cardio.activity
                                } — {
                                  workoutDay.cardio.duration_minutes
                                } minutes

                              </p>

                            </div>

                          )
                        }


                        <p className="text-sm text-gray-400 mt-6">

                          Recovery days automatically count toward your daily workout target.

                        </p>

                      </div>

                    )
                  }


                  {
                    workoutDay &&
                    workoutDay.type ===
                      "workout" && (

                      <div className={`
                        mt-5
                        border
                        rounded-2xl
                        p-7
                        transition

                        ${
                          workoutCompleted

                            ? "bg-black text-white border-black"

                            : "bg-white text-black border-gray-200"
                        }
                      `}>


                        <div className="flex justify-between items-start gap-5">

                          <div>

                            <div
                              className={
                                workoutCompleted
                                  ? "w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center"
                                  : "w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center"
                              }
                            >

                              <Dumbbell
                                size={25}
                                strokeWidth={2}
                                className={
                                  workoutCompleted
                                    ? "text-white"
                                    : "text-black"
                                }
                              />

                            </div>


                            <h3 className="text-2xl font-bold mt-4">

                              {
                                workoutDay.focus
                              }

                            </h3>


                            <p className={
                              workoutCompleted

                                ? "text-gray-300 mt-2"

                                : "text-gray-500 mt-2"
                            }>

                              {
                                workoutDay.duration_minutes
                              } minutes

                            </p>

                          </div>


                          <button

                            type="button"

                            onClick={
                              () =>
                                setWorkoutCompleted(
                                  !workoutCompleted
                                )
                            }

                            className={`
                              px-5
                              py-3
                              rounded-xl
                              font-semibold
                              cursor-pointer

                              ${
                                workoutCompleted

                                  ? "bg-white text-black"

                                  : "bg-black text-white"
                              }
                            `}

                          >

                            {
                              workoutCompleted

                                ? "✓ Completed"

                                : "Mark Complete"
                            }

                          </button>

                        </div>


                        {
                          Array.isArray(
                            workoutDay.exercises
                          ) &&
                          workoutDay.exercises.length >
                            0 && (

                            <div className={`
                              mt-7
                              pt-6
                              border-t

                              ${
                                workoutCompleted

                                  ? "border-gray-700"

                                  : "border-gray-100"
                              }
                            `}>


                              <p className={
                                workoutCompleted

                                  ? "font-semibold text-gray-200"

                                  : "font-semibold text-gray-500"
                              }>

                                Exercises

                              </p>


                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">

                                {
                                  workoutDay.exercises.map(
                                    (
                                      exercise,
                                      index
                                    ) => (

                                      <div

                                        key={
                                          `${exercise.name}-${index}`
                                        }

                                        className={
                                          workoutCompleted

                                            ? "bg-gray-900 rounded-xl p-4"

                                            : "bg-gray-50 rounded-xl p-4"
                                        }

                                      >

                                        <p className="font-semibold">

                                          {
                                            exercise.name
                                          }

                                        </p>


                                        <p className={
                                          workoutCompleted

                                            ? "text-gray-400 text-sm mt-1"

                                            : "text-gray-500 text-sm mt-1"
                                        }>

                                          {
                                            exercise.sets
                                          } sets × {
                                            exercise.reps
                                          }

                                        </p>

                                      </div>

                                    )
                                  )
                                }

                              </div>

                            </div>

                          )
                        }

                      </div>

                    )
                  }

                </section>


                {/* ==========================================
                    HEALTH METRICS
                ========================================== */}

                <section className="mt-10">

                  <h2 className="text-2xl font-bold text-black">

                    Daily Metrics

                  </h2>


                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-5">


                    <NumberCard

                      title="Water"

                      icon={
                        <Droplets
                          size={24}
                          strokeWidth={2}
                          className="text-black"
                        />
                      }

                      value={
                        water
                      }

                      onChange={
                        setWater
                      }

                      unit="L"

                      step="0.1"

                    />


                    <NumberCard

                      title="Steps"

                      icon={
                        <Footprints
                          size={24}
                          strokeWidth={2}
                          className="text-black"
                        />
                      }

                      value={
                        steps
                      }

                      onChange={
                        setSteps
                      }

                      unit="steps"

                      step="1"

                    />


                    <NumberCard

                      title="Sleep"

                      icon={
                        <Moon
                          size={24}
                          strokeWidth={2}
                          className="text-black"
                        />
                      }

                      value={
                        sleep
                      }

                      onChange={
                        setSleep
                      }

                      unit="hours"

                      step="0.1"

                    />


                    <NumberCard

                      title="Weight"

                      icon={
                        <Scale
                          size={24}
                          strokeWidth={2}
                          className="text-black"
                        />
                      }

                      value={
                        weight
                      }

                      onChange={
                        setWeight
                      }

                      unit="kg"

                      step="0.1"

                    />


                  </div>

                </section>


                {/* ==========================================
                    WELLBEING
                ========================================== */}

                <section className="mt-10">

                  <h2 className="text-2xl font-bold text-black">

                    How Do You Feel?

                  </h2>


                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">


                    <RatingCard

                      title="Mood"

                      icon={
                        <Smile
                          size={24}
                          strokeWidth={2}
                          className="text-black"
                        />
                      }

                      value={
                        mood
                      }

                      onChange={
                        setMood
                      }

                    />


                    <RatingCard

                      title="Energy"

                      icon={
                        <Zap
                          size={24}
                          strokeWidth={2}
                          className="text-black"
                        />
                      }

                      value={
                        energy
                      }

                      onChange={
                        setEnergy
                      }

                    />


                  </div>

                </section>


                {/* ==========================================
                    NOTES
                ========================================== */}

                <section className="mt-10">

                  <h2 className="text-2xl font-bold text-black">

                    Notes

                  </h2>


                  <textarea

                    value={
                      notes
                    }

                    onChange={
                      (
                        event
                      ) =>
                        setNotes(
                          event.target.value
                        )
                    }

                    placeholder="How did your day go? Anything worth remembering?"

                    rows={
                      5
                    }

                    className="
                      mt-5
                      w-full
                      bg-white
                      border
                      border-gray-200
                      rounded-2xl
                      p-5
                      text-black
                      outline-none
                      focus:ring-2
                      focus:ring-black
                    "

                  />

                </section>


                {/* ==========================================
                    SAVE
                ========================================== */}

                <div className="mt-10 mb-10">

                  <button

                    type="button"

                    onClick={
                      saveTracker
                    }

                    disabled={
                      saving
                    }

                    className="
                      bg-black
                      text-white
                      px-8
                      py-4
                      rounded-xl
                      font-semibold
                      hover:bg-gray-800
                      disabled:bg-gray-400
                      disabled:cursor-not-allowed
                      cursor-pointer
                    "

                  >

                    {
                      saving

                        ? "Saving..."

                        : "Save Daily Progress"
                    }

                  </button>


                  {
                    message && (

                      <div className="mt-5 bg-green-50 border border-green-200 rounded-xl p-4">

                        <div className="flex items-center gap-2 text-green-700">

                          <Check
                            size={18}
                            strokeWidth={2}
                          />

                          <p>
                            {message}
                          </p>

                        </div>

                      </div>

                    )
                  }


                  {
                    error && (

                      <div className="mt-5 bg-red-50 border border-red-200 rounded-xl p-4">

                        <p className="text-red-700">

                          {
                            error
                          }

                        </p>

                      </div>

                    )
                  }

                </div>


              </>

            )
          }


        </div>

      </section>

    </main>

  );

}


// =========================================================
// MEAL TRACKER CARD
// =========================================================

function MealTrackerCard({

  icon,

  fallbackTitle,

  meal,

  checked,

  onChange,

}: {

  icon:
    ReactNode;

  fallbackTitle:
    string;

  meal:
    Meal | null;

  checked:
    boolean;

  onChange:
    (
      value:
        boolean
    ) =>
      void;

}) {

  return (

    <div className={`
      border
      rounded-2xl
      p-6
      transition

      ${
        checked

          ? "bg-black text-white border-black"

          : "bg-white text-black border-gray-200"
      }
    `}>


      <div className="flex justify-between items-start">

        <div
          className={`
            w-11
            h-11
            rounded-xl
            flex
            items-center
            justify-center

            ${
              checked
                ? "bg-gray-800 text-white"
                : "bg-gray-100 text-black"
            }
          `}
        >

          {icon}

        </div>


        <button

          type="button"

          onClick={
            () =>
              onChange(
                !checked
              )
          }

          className={`
            px-4
            py-2
            rounded-xl
            text-sm
            font-semibold
            cursor-pointer

            ${
              checked

                ? "bg-white text-black"

                : "bg-black text-white"
            }
          `}

        >

          {
            checked

              ? "✓ Completed"

              : "Mark Complete"
          }

        </button>

      </div>


      <h3 className="font-bold text-xl mt-5">

        {
          meal?.name ??
            fallbackTitle
        }

      </h3>


      {
        meal && (

          <>

            <div className={
              checked

                ? "flex gap-4 text-sm text-gray-300 mt-2"

                : "flex gap-4 text-sm text-gray-500 mt-2"
            }>

              <span>

                {
                  meal.calories
                } kcal

              </span>


              <span>

                {
                  meal.protein_grams
                }g protein

              </span>

            </div>


            {
              Array.isArray(
                meal.foods
              ) &&
              meal.foods.length >
                0 && (

                <ul className={
                  checked

                    ? "mt-5 space-y-2 text-gray-200"

                    : "mt-5 space-y-2 text-gray-700"
                }>

                  {
                    meal.foods.map(
                      (
                        food,
                        index
                      ) => (

                        <li
                          key={
                            `${food}-${index}`
                          }
                        >

                          • {
                            food
                          }

                        </li>

                      )
                    )
                  }

                </ul>

              )
            }

          </>

        )
      }


      {
        !meal && (

          <p className={
            checked

              ? "text-gray-300 text-sm mt-3"

              : "text-gray-500 text-sm mt-3"
          }>

            Meal details were not found in your plan.

          </p>

        )
      }

    </div>

  );

}


// =========================================================
// NUMBER CARD
// =========================================================

function NumberCard({

  title,

  icon,

  value,

  onChange,

  unit,

  step,

}: {

  title:
    string;

  icon:
    ReactNode;

  value:
    string;

  onChange:
    (
      value:
        string
    ) =>
      void;

  unit:
    string;

  step:
    string;

}) {

  return (

    <div className="bg-white border border-gray-200 rounded-2xl p-6">

      <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center">

        {icon}

      </div>


      <p className="font-semibold text-black mt-4">

        {
          title
        }

      </p>


      <div className="flex items-center gap-2 mt-4">

        <input

          type="number"

          min="0"

          step={
            step
          }

          value={
            value
          }

          onChange={
            (
              event
            ) =>
              onChange(
                event.target.value
              )
          }

          className="
            w-full
            border
            border-gray-300
            rounded-xl
            px-4
            py-3
            text-black
          "

        />


        <span className="text-sm text-gray-500">

          {
            unit
          }

        </span>

      </div>

    </div>

  );

}


// =========================================================
// RATING CARD
// =========================================================

function RatingCard({

  title,

  icon,

  value,

  onChange,

}: {

  title:
    string;

  icon:
    ReactNode;

  value:
    number;

  onChange:
    (
      value:
        number
    ) =>
      void;

}) {

  return (

    <div className="bg-white border border-gray-200 rounded-2xl p-6">

      <div className="flex items-center gap-3">

        <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center">

          {icon}

        </div>


        <p className="font-semibold text-black text-lg">

          {
            title
          }

        </p>

      </div>


      <div className="flex gap-2 mt-6">

        {
          [
            1,
            2,
            3,
            4,
            5
          ].map(

            (
              rating
            ) => (

              <button

                key={
                  rating
                }

                type="button"

                onClick={
                  () =>
                    onChange(
                      rating
                    )
                }

                className={`
                  w-11
                  h-11
                  rounded-xl
                  font-semibold
                  cursor-pointer

                  ${
                    value ===
                      rating

                      ? "bg-black text-white"

                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }
                `}

              >

                {
                  rating
                }

              </button>

            )

          )
        }

      </div>


      <p className="text-sm text-gray-400 mt-3">

        1 = Low · 5 = Excellent

      </p>

    </div>

  );

}