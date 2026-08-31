"use client";

import { useEffect, useMemo, useState } from "react";

import type { ReactNode } from "react";

import {

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

    <main className="min-h-screen bg-gray-50 lg:flex">

      <AppSidebar />



      <section className="min-w-0 flex-1 px-4 pb-10 pt-20 sm:px-6 lg:p-10">

        <div className="mx-auto w-full max-w-7xl min-w-0">



          {/* ============================================

              HEADER

          \============================================ */}

          <div className="flex min-w-0 flex-col gap-5 sm:gap-6 md:flex-row md:items-start md:justify-between">



            <div>

              <p className="text-sm font-semibold text-gray-500">

                DASHBOARD

              </p>



              <h1 className="mt-2 break-words text-3xl font-bold leading-tight text-black sm:text-4xl">

                Welcome back, {

                  profile?.full_name ||

                  "there"

                }

              </h1>



              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">

                {

                  todayReadable

                } · Here&apos;s your wellness plan for today.

              </p>

            </div>



            <button

              type="button"

              onClick={

                logout

              }

              className="

                px-5

                py-3

                rounded-xl

                bg-black

                text-white

                text-sm

                font-semibold

                hover:bg-gray-800

                cursor-pointer

              "

            >

              <span className="inline-flex items-center gap-2">

                <LogOut size={17} strokeWidth={2} />

                Logout

              </span>

            </button>

          </div>



          {/* ============================================

              TODAY'S COMPLETION

          \============================================ */}

          <section className="mt-8 overflow-hidden rounded-2xl bg-black p-5 text-white sm:mt-10 sm:p-8">



            <div className="flex min-w-0 flex-col gap-6 md:flex-row md:items-end md:justify-between">



              <div>

                <p className="text-sm text-gray-300">

                  Today&apos;s Completion

                </p>



                <div className="flex items-end gap-2 mt-2">

                  <p className="text-5xl font-bold sm:text-6xl">

                    {

                      todayStats.percentage

                    }

                  </p>

                  <p className="mb-1 text-xl text-gray-300 sm:mb-2 sm:text-2xl">

                    %

                  </p>

                </div>



                <p className="text-sm text-gray-300 mt-3">

                  {

                    todayStats.completed

                  } of {

                    todayStats.total

                  } wellness targets completed

                </p>

              </div>



              <a

                href="/tracker"

                className="

                  inline-flex

                  items-center

                  justify-center

                  bg-white

                  text-black

                  px-6

                  py-3

                  rounded-xl

                  font-semibold

                  hover:bg-gray-100

                "

              >

                Open Daily Tracker

              </a>

            </div>



            <div className="mt-6 h-3 bg-gray-700 rounded-full overflow-hidden">

              <div

                className="h-full bg-white rounded-full transition-all"

                style={{

                  width:

                    `${todayStats.percentage}%`

                }}

              />

            </div>

          </section>



          {/* ============================================

              QUICK STATS

          \============================================ */}

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">



            <StatCard

              title="Weight"

              value={

                tracker?.weight_kg ??

                profile?.weight_kg ??

                "--"

              }

              unit={

                tracker?.weight_kg !==

                  null ||

                profile?.weight_kg !==

                  null

                  ? "kg"

                  : ""

              }

              icon={<Scale size={24} strokeWidth={2} className="text-black" />}

            />



            <StatCard

              title="Water Today"

              value={

                tracker?.water_litres ??

                0

              }

              unit="L"

              icon={<Droplets size={24} strokeWidth={2} className="text-black" />}

            />



            <StatCard

              title="Steps Today"

              value={

                tracker?.steps ??

                0

              }

              unit=""

              icon={<Footprints size={24} strokeWidth={2} className="text-black" />}

            />



            <StatCard

              title="Sleep"

              value={

                tracker?.sleep_hours ??

                0

              }

              unit="hrs"

              icon={<Moon size={24} strokeWidth={2} className="text-black" />}

            />



          </section>



          {/* ============================================

              TODAY'S NUTRITION

          \============================================ */}

          <section className="mt-10">



            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-5">

              <div>

                <p className="text-sm font-semibold text-gray-400">

                  TODAY&apos;S PLAN

                </p>



                <h2 className="mt-1 text-xl font-bold text-black sm:text-2xl">

                  Nutrition

                </h2>

              </div>



              <a

                href="/nutrition"

                className="w-fit text-sm font-semibold text-gray-500 hover:text-black"

              >

                View full plan →

              </a>

            </div>



            {

              nutritionDay

                ? (

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mt-5">



                    <MealCard

                      icon={<Coffee size={24} strokeWidth={2} className="text-black" />}

                      fallbackTitle="Breakfast"

                      meal={

                        breakfast

                      }

                      completed={

                        tracker?.breakfast_completed ??

                        false

                      }

                    />



                    <MealCard

                      icon={<Salad size={24} strokeWidth={2} className="text-black" />}

                      fallbackTitle="Lunch"

                      meal={

                        lunch

                      }

                      completed={

                        tracker?.lunch_completed ??

                        false

                      }

                    />



                    <MealCard

                      icon={<Utensils size={24} strokeWidth={2} className="text-black" />}

                      fallbackTitle="Dinner"

                      meal={

                        dinner

                      }

                      completed={

                        tracker?.dinner_completed ??

                        false

                      }

                    />



                  </div>

                )

                : (

                  <EmptyPlanCard

                    title="No active nutrition plan"

                    description="Generate your weekly nutrition plan to see today's meals here."

                    href="/nutrition"

                    buttonText="Open Nutrition"

                  />

                )

            }

          </section>



          {/* ============================================

              TODAY'S WORKOUT

          \============================================ */}

          <section className="mt-10">



            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-5">

              <div>

                <p className="text-sm font-semibold text-gray-400">

                  TODAY&apos;S TRAINING

                </p>



                <h2 className="mt-1 text-xl font-bold text-black sm:text-2xl">

                  Workout

                </h2>

              </div>



              <a

                href="/workout"

                className="w-fit text-sm font-semibold text-gray-500 hover:text-black"

              >

                View full plan →

              </a>

            </div>



            {

              workoutDay

                ? (

                  workoutDay.type ===

                    "rest"

                    ? (

                      <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 sm:p-7">

                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">

                          <div>

                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">

                              <HeartPulse

                                size={25}

                                strokeWidth={2}

                                className="text-black"

                              />

                            </div>



                            <h3 className="mt-4 break-words text-xl font-bold text-black sm:text-2xl">

                              Recovery Day

                            </h3>



                            <p className="text-gray-500 mt-2">

                              {

                                workoutDay.focus

                              }

                            </p>

                          </div>



                          <span className="bg-green-50 text-green-700 px-4 py-2 rounded-xl text-sm font-semibold">

                            Recovery

                          </span>

                        </div>



                        {

                          workoutDay.cardio && (

                            <div className="mt-6 pt-5 border-t border-gray-100">

                              <p className="text-sm text-gray-500">

                                Suggested activity

                              </p>



                              <p className="font-semibold text-black mt-2">

                                {

                                  workoutDay.cardio.activity

                                } · {

                                  workoutDay.cardio.duration_minutes

                                } minutes

                              </p>

                            </div>

                          )

                        }

                      </div>

                    )

                    : (

                      <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 sm:p-7">



                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">

                          <div>

                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">

                              <Dumbbell

                                size={25}

                                strokeWidth={2}

                                className="text-black"

                              />

                            </div>



                            <h3 className="mt-4 break-words text-xl font-bold text-black sm:text-2xl">

                              {

                                workoutDay.focus

                              }

                            </h3>



                            <p className="text-gray-500 mt-2">

                              {

                                workoutDay.duration_minutes

                              } minutes · {

                                workoutDay.exercises?.length ||

                                0

                              } exercises

                            </p>

                          </div>



                          <span className={`

                            px-4

                            py-2

                            rounded-xl

                            text-sm

                            font-semibold

                            ${

                              tracker?.workout_completed

                                ? "bg-green-50 text-green-700"

                                : "bg-gray-100 text-gray-600"

                            }

                          `}>

                            {

                              tracker?.workout_completed

                                ? (

                                  <span className="inline-flex items-center gap-1.5">

                                    <Check size={15} strokeWidth={2.2} />

                                    Completed

                                  </span>

                                )

                                : "Not completed"

                            }

                          </span>

                        </div>



                        {

                          Array.isArray(

                            workoutDay.exercises

                          ) &&

                          workoutDay.exercises.length >

                            0 && (

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">

                              {

                                workoutDay.exercises

                                  .slice(

                                    0,

                                    6

                                  )

                                  .map(

                                    (

                                      exercise,

                                      index

                                    ) => (

                                      <div

                                        key={

                                          `${exercise.name}-${index}`

                                        }

                                        className="bg-gray-50 rounded-xl p-4"

                                      >

                                        <p className="break-words font-semibold text-black">

                                          {

                                            exercise.name

                                          }

                                        </p>



                                        <p className="text-sm text-gray-500 mt-1">

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

                          )

                        }

                      </div>

                    )

                )

                : (

                  <EmptyPlanCard

                    title="No active workout plan"

                    description="Generate your weekly training plan to see today's workout here."

                    href="/workout"

                    buttonText="Open Workout"

                  />

                )

            }

          </section>



          {/* ============================================

              WELLBEING

          \============================================ */}

          <section className="mt-10">



            <h2 className="text-xl font-bold text-black sm:text-2xl">

              Today&apos;s Wellbeing

            </h2>



            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">



              <WellbeingCard

                icon={<Smile size={24} strokeWidth={2} className="text-black" />}

                title="Mood"

                value={

                  tracker?.mood ??

                  null

                }

              />



              <WellbeingCard

                icon={<Zap size={24} strokeWidth={2} className="text-black" />}

                title="Energy"

                value={

                  tracker?.energy ??

                  null

                }

              />



            </div>

          </section>



          {/* ============================================

              QUICK ACTIONS

          \============================================ */}

          <section className="mt-10">



            <h2 className="text-xl font-bold text-black sm:text-2xl">

              Quick Actions

            </h2>



            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5 mt-5">



              <DashboardCard

                title="Nutrition"

                description="View or regenerate your meal plan."

                icon={<Salad size={24} strokeWidth={2} />}

                href="/nutrition"

              />



              <DashboardCard

                title="Workout"

                description="See your weekly training plan."

                icon={<Dumbbell size={24} strokeWidth={2} />}

                href="/workout"

              />



              <DashboardCard

                title="Daily Tracker"

                description="Record today's habits and metrics."

                icon={<ListChecks size={24} strokeWidth={2} />}

                href="/tracker"

              />



              <DashboardCard

                title="Progress"

                description="Review trends and consistency."

                icon={<TrendingUp size={24} strokeWidth={2} />}

                href="/progress"

              />



              <DashboardCard

                title="Ask Nalamera"

                description="Ask questions about your progress."

                icon={<Bot size={24} strokeWidth={2} />}

                href="/coach"

              />



            </div>

          </section>



          {/* ============================================

              PROFILE SUMMARY

          \============================================ */}

          <section className="mt-10 mb-10">



            <h2 className="text-xl font-bold text-black sm:text-2xl">

              Your Profile

            </h2>



            <div className="mt-5 bg-white border border-gray-200 rounded-2xl p-6">



              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">



                <ProfileItem

                  label="Age"

                  value={

                    profile?.age

                      ? `${profile.age} years`

                      : "--"

                  }

                />



                <ProfileItem

                  label="Gender"

                  value={

                    formatGender(

                      profile?.gender

                    )

                  }

                />



                <ProfileItem

                  label="Primary Goal"

                  value={

                    formatGoal(

                      profile?.goal

                    )

                  }

                />



                <ProfileItem

                  label="Activity Level"

                  value={

                    formatActivity(

                      profile?.activity_level

                    )

                  }

                />



                <ProfileItem

                  label="Diet"

                  value={

                    formatDiet(

                      profile?.diet_preference

                    )

                  }

                />



                <ProfileItem

                  label="Weekly Training"

                  value={

                    profile?.workout_days

                      ? `${profile.workout_days} days`

                      : "--"

                  }

                />



              </div>

            </div>

          </section>



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

}: {

  title:

    string;

  value:

    number | string;

  unit:

    string;

  icon:

    ReactNode;

}) {

  return (

    <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">



      <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center">

        {

          icon

        }

      </div>



      <p className="text-sm text-gray-500 mt-4">

        {

          title

        }

      </p>



      <p className="text-3xl font-bold text-black mt-2">

        {

          value

        }



        {

          unit && (

            <span className="text-base font-normal ml-1">

              {

                unit

              }

            </span>

          )

        }

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

  icon:

    ReactNode;

  fallbackTitle:

    string;

  meal:

    Meal | null;

  completed:

    boolean;

}) {

  return (

    <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">



      <div className="flex items-start justify-between gap-4">



        <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center">

          {

            icon

          }

        </div>



        <span className={`

          text-xs

          font-semibold

          px-3

          py-2

          rounded-xl

          ${

            completed

              ? "bg-green-50 text-green-700"

              : "bg-gray-100 text-gray-500"

          }

        `}>

          {

            completed

              ? (

                  <span className="inline-flex items-center gap-1.5">

                    <Check size={14} strokeWidth={2.2} />

                    Completed

                  </span>

                )

              : "Pending"

          }

        </span>

      </div>



      <h3 className="text-xl font-bold text-black mt-5">

        {

          meal

            ? cleanMealName(

                meal.name,

                fallbackTitle

              )

            : fallbackTitle

        }

      </h3>



      {

        meal

          ? (

            <>

              <p className="text-sm text-gray-500 mt-2">

                {

                  meal.calories

                } kcal · {

                  meal.protein_grams

                }g protein

              </p>



              {

                Array.isArray(

                  meal.foods

                ) &&

                meal.foods.length >

                  0 && (

                  <ul className="mt-4 space-y-2 text-sm text-gray-700">

                    {

                      meal.foods

                        .slice(

                          0,

                          4

                        )

                        .map(

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

          : (

            <p className="text-sm text-gray-500 mt-3">

              Meal details unavailable.

            </p>

          )

      }

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

}: {

  title:

    string;

  description:

    string;

  icon:

    ReactNode;

  href:

    string;

}) {

  return (

    <a

      href={

        href

      }

      className="

        block

        bg-white

        border

        border-gray-200

        rounded-2xl

        p-6

        hover:shadow-md

        hover:border-gray-300

        transition

      "

    >

      <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-black">

        {

          icon

        }

      </div>



      <h3 className="text-lg font-semibold text-black mt-4">

        {

          title

        }

      </h3>



      <p className="text-gray-500 mt-2 text-sm">

        {

          description

        }

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

  icon:

    ReactNode;

  title:

    string;

  value:

    number | null;

}) {

  return (

    <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">



      <div className="flex items-center gap-3">

        <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center">

          {

            icon

          }

        </div>



        <div>

          <p className="text-sm text-gray-500">

            {

              title

            }

          </p>



          <p className="mt-1 text-xl font-bold text-black sm:text-2xl">

            {

              value !==

                null

                ? `${value} / 5`

                : "--"

            }

          </p>

        </div>

      </div>

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

  title:

    string;

  description:

    string;

  href:

    string;

  buttonText:

    string;

}) {

  return (

    <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 sm:p-7">



      <h3 className="text-xl font-semibold text-black">

        {

          title

        }

      </h3>



      <p className="text-gray-500 mt-2">

        {

          description

        }

      </p>



      <a

        href={

          href

        }

        className="inline-block mt-5 bg-black text-white px-5 py-3 rounded-xl font-semibold"

      >

        {

          buttonText

        }

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

  label:

    string;

  value:

    string;

}) {

  return (

    <div>

      <p className="text-sm text-gray-500">

        {

          label

        }

      </p>



      <p className="mt-1 break-words text-lg font-semibold text-black">

        {

          value

        }

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