"use client";

import { useEffect, useMemo, useState } from "react";

import AppSidebar from "../../components/AppSidebar";

import { supabase } from "../../lib/supabase";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";


// =========================================================
// TYPES
// =========================================================

type TrackerRecord = {
  id: string;

  tracker_date: string;

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

  notes: string | null;
};


type RangeOption = 7 | 30;


// =========================================================
// PAGE
// =========================================================

export default function ProgressPage() {

  const [
    records,
    setRecords
  ] = useState<TrackerRecord[]>([]);


  const [
    loading,
    setLoading
  ] = useState(true);


  const [
    error,
    setError
  ] = useState("");


  const [
    range,
    setRange
  ] = useState<RangeOption>(7);


  // =====================================================
  // LOAD TRACKER DATA
  // =====================================================

  useEffect(() => {

    async function loadProgress() {

      setLoading(true);

      setError("");


      // =================================================
      // GET CURRENT USER
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

        setError(
          "You must be logged in."
        );

        setLoading(false);

        return;

      }


      // =================================================
      // CALCULATE START DATE
      // =================================================

      const startDate =
        new Date();


      startDate.setDate(
        startDate.getDate() -
        (range - 1)
      );


      const formattedStartDate =
        startDate
          .toLocaleDateString(
            "en-CA"
          );


      // =================================================
      // LOAD TRACKER RECORDS
      // =================================================

      const {
        data,
        error:
          trackerError

      } =
        await supabase

          .from(
            "daily_tracker"
          )

          .select(
            `
            id,
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

          .eq(
            "user_id",
            user.id
          )

          .gte(
            "tracker_date",
            formattedStartDate
          )

          .order(
            "tracker_date",
            {
              ascending:
                true
            }
          );


      if (
        trackerError
      ) {

        console.error(
          "Progress load error:",
          trackerError
        );


        setError(
          "Could not load your progress."
        );


        setLoading(false);

        return;

      }


      setRecords(
        (data || []) as TrackerRecord[]
      );


      setLoading(false);

    }


    loadProgress();

  }, [range]);


  // =====================================================
  // CALCULATED STATS
  // =====================================================

  const stats =
    useMemo(
      () => {

        if (
          records.length === 0
        ) {

          return {

            averageSleep:
              0,

            averageWater:
              0,

            averageSteps:
              0,

            averageMood:
              0,

            averageEnergy:
              0,

            workoutCompletion:
              0,

            mealCompletion:
              0,

            consistencyScore:
              0,

            latestWeight:
              null as number | null,

            weightChange:
              null as number | null,

          };

        }


        // =================================================
        // SLEEP
        // =================================================

        const sleepValues =
          records

            .map(
              record =>
                Number(
                  record.sleep_hours || 0
                )
            )

            .filter(
              value =>
                value > 0
            );


        const averageSleep =
          average(
            sleepValues
          );


        // =================================================
        // WATER
        // =================================================

        const waterValues =
          records

            .map(
              record =>
                Number(
                  record.water_litres || 0
                )
            )

            .filter(
              value =>
                value >= 0
            );


        const averageWater =
          average(
            waterValues
          );


        // =================================================
        // STEPS
        // =================================================

        const stepValues =
          records

            .map(
              record =>
                Number(
                  record.steps || 0
                )
            )

            .filter(
              value =>
                value >= 0
            );


        const averageSteps =
          average(
            stepValues
          );


        // =================================================
        // MOOD
        // =================================================

        const moodValues =
          records

            .map(
              record =>
                Number(
                  record.mood || 0
                )
            )

            .filter(
              value =>
                value > 0
            );


        const averageMood =
          average(
            moodValues
          );


        // =================================================
        // ENERGY
        // =================================================

        const energyValues =
          records

            .map(
              record =>
                Number(
                  record.energy || 0
                )
            )

            .filter(
              value =>
                value > 0
            );


        const averageEnergy =
          average(
            energyValues
          );


        // =================================================
        // WORKOUT COMPLETION
        // =================================================

        const workoutsCompleted =
          records.filter(
            record =>
              record.workout_completed
          ).length;


        const workoutCompletion =
          records.length > 0

            ? Math.round(
                (
                  workoutsCompleted /
                  records.length
                ) *
                100
              )

            : 0;


        // =================================================
        // MEAL COMPLETION
        // =================================================

        let totalMeals =
          0;


        let completedMeals =
          0;


        records.forEach(
          record => {

            totalMeals += 3;


            if (
              record.breakfast_completed
            ) {

              completedMeals += 1;

            }


            if (
              record.lunch_completed
            ) {

              completedMeals += 1;

            }


            if (
              record.dinner_completed
            ) {

              completedMeals += 1;

            }

          }
        );


        const mealCompletion =
          totalMeals > 0

            ? Math.round(
                (
                  completedMeals /
                  totalMeals
                ) *
                100
              )

            : 0;


        // =================================================
        // CONSISTENCY SCORE
        // =================================================

        const dailyScores =
          records.map(
            record => {

              const habits = [

                record.breakfast_completed,

                record.lunch_completed,

                record.dinner_completed,

                record.workout_completed,

                Number(
                  record.water_litres || 0
                ) >= 2,

                Number(
                  record.steps || 0
                ) >= 7000,

                Number(
                  record.sleep_hours || 0
                ) >= 7,

              ];


              const completed =
                habits.filter(
                  Boolean
                ).length;


              return (
                completed /
                habits.length
              ) *
              100;

            }
          );


        const consistencyScore =
          Math.round(
            average(
              dailyScores
            )
          );


        // =================================================
        // WEIGHT
        // =================================================

        const weightValues =
          records

            .filter(
              record =>
                record.weight_kg !== null
            )

            .map(
              record => ({
                date:
                  record.tracker_date,

                weight:
                  Number(
                    record.weight_kg
                  ),
              })
            );


        const latestWeight =
          weightValues.length > 0

            ? weightValues[
                weightValues.length - 1
              ].weight

            : null;


        const weightChange =
          weightValues.length >= 2

            ? Number(
                (
                  weightValues[
                    weightValues.length - 1
                  ].weight -
                  weightValues[0]
                    .weight
                ).toFixed(
                  1
                )
              )

            : null;


        return {

          averageSleep:
            round(
              averageSleep,
              1
            ),

          averageWater:
            round(
              averageWater,
              1
            ),

          averageSteps:
            Math.round(
              averageSteps
            ),

          averageMood:
            round(
              averageMood,
              1
            ),

          averageEnergy:
            round(
              averageEnergy,
              1
            ),

          workoutCompletion,

          mealCompletion,

          consistencyScore,

          latestWeight,

          weightChange,

        };

      },

      [records]

    );


  // =====================================================
  // CHART DATA
  // =====================================================

  const chartData =
    records.map(
      record => ({

        date:
          formatShortDate(
            record.tracker_date
          ),

        weight:
          record.weight_kg !== null
            ? Number(
                record.weight_kg
              )
            : null,

        sleep:
          Number(
            record.sleep_hours || 0
          ),

        water:
          Number(
            record.water_litres || 0
          ),

        steps:
          Number(
            record.steps || 0
          ),

        mood:
          Number(
            record.mood || 0
          ),

        energy:
          Number(
            record.energy || 0
          ),

      })
    );


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <main className="min-h-screen bg-gray-50 flex">


      <AppSidebar />


      <section className="flex-1 p-10">


        <div className="max-w-7xl">


          {/* ============================================
              HEADER
          ============================================ */}

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">


            <div>


              <p className="text-sm font-semibold text-gray-500">

                YOUR PROGRESS

              </p>


              <h1 className="text-4xl font-bold text-black mt-2">

                Progress

              </h1>


              <p className="text-gray-600 mt-3">

                Understand your habits and track how consistently
                you're following your wellness routine.

              </p>


            </div>


            {/* RANGE */}

            <div className="bg-white border border-gray-200 rounded-xl p-1 flex">


              <button

                type="button"

                onClick={
                  () =>
                    setRange(
                      7
                    )
                }

                className={`
                  px-5
                  py-2
                  rounded-lg
                  font-medium

                  ${
                    range === 7

                      ? "bg-black text-white"

                      : "text-gray-500 hover:text-black"
                  }
                `}

              >

                7 Days

              </button>


              <button

                type="button"

                onClick={
                  () =>
                    setRange(
                      30
                    )
                }

                className={`
                  px-5
                  py-2
                  rounded-lg
                  font-medium

                  ${
                    range === 30

                      ? "bg-black text-white"

                      : "text-gray-500 hover:text-black"
                  }
                `}

              >

                30 Days

              </button>


            </div>


          </div>


          {/* ============================================
              LOADING
          ============================================ */}

          {loading && (

            <div className="mt-10 bg-white border border-gray-200 rounded-2xl p-8">


              <p className="text-gray-500">

                Loading your progress...

              </p>


            </div>

          )}


          {/* ============================================
              ERROR
          ============================================ */}

          {!loading &&
            error && (

              <div className="mt-10 bg-red-50 border border-red-200 rounded-2xl p-6">


                <p className="text-red-700">

                  {
                    error
                  }

                </p>


              </div>

            )}


          {/* ============================================
              NO DATA
          ============================================ */}

          {!loading &&
            !error &&
            records.length === 0 && (

              <div className="mt-10 bg-white border border-gray-200 rounded-2xl p-10">


                <h2 className="text-2xl font-semibold text-black">

                  No progress data yet

                </h2>


                <p className="text-gray-500 mt-2">

                  Start using your Daily Tracker and your progress
                  will appear here automatically.

                </p>


                <a

                  href="/tracker"

                  className="inline-block mt-6 bg-black text-white px-6 py-3 rounded-xl font-semibold"

                >

                  Open Daily Tracker

                </a>


              </div>

            )}


          {/* ============================================
              PROGRESS CONTENT
          ============================================ */}

          {!loading &&
            !error &&
            records.length > 0 && (

              <>


                {/* ========================================
                    CONSISTENCY
                ======================================== */}

                <div className="mt-10 bg-black text-white rounded-2xl p-8">


                  <p className="text-sm text-gray-300">

                    Overall Consistency

                  </p>


                  <div className="flex items-end gap-3 mt-2">


                    <p className="text-6xl font-bold">

                      {
                        stats.consistencyScore
                      }

                    </p>


                    <p className="text-2xl text-gray-300 mb-2">

                      %

                    </p>


                  </div>


                  <div className="mt-6 h-3 bg-gray-700 rounded-full overflow-hidden">


                    <div

                      className="h-full bg-white rounded-full"

                      style={{

                        width:
                          `${stats.consistencyScore}%`

                      }}

                    />


                  </div>


                  <p className="text-sm text-gray-300 mt-4">

                    Based on meals, workouts, water, steps and sleep.

                  </p>


                </div>


                {/* ========================================
                    SUMMARY CARDS
                ======================================== */}

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-8">


                  <StatCard

                    emoji="😴"

                    title="Average Sleep"

                    value={
                      stats.averageSleep
                    }

                    unit="hrs"

                  />


                  <StatCard

                    emoji="💧"

                    title="Average Water"

                    value={
                      stats.averageWater
                    }

                    unit="L"

                  />


                  <StatCard

                    emoji="🚶"

                    title="Average Steps"

                    value={
                      stats.averageSteps
                    }

                    unit=""

                  />


                  <StatCard

                    emoji="⚖️"

                    title="Current Weight"

                    value={
                      stats.latestWeight ??
                      "--"
                    }

                    unit={
                      stats.latestWeight !== null
                        ? "kg"
                        : ""
                    }

                  />


                </div>


                {/* ========================================
                    COMPLETION CARDS
                ======================================== */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">


                  <PercentageCard

                    emoji="🏋️"

                    title="Workout Completion"

                    percentage={
                      stats.workoutCompletion
                    }

                  />


                  <PercentageCard

                    emoji="🥗"

                    title="Meal Completion"

                    percentage={
                      stats.mealCompletion
                    }

                  />


                </div>


                {/* ========================================
                    WEIGHT CHANGE
                ======================================== */}

                {stats.weightChange !== null && (

                  <div className="mt-5 bg-white border border-gray-200 rounded-2xl p-6">


                    <p className="text-sm text-gray-500">

                      Weight Change

                    </p>


                    <p className="text-3xl font-bold text-black mt-2">

                      {
                        stats.weightChange > 0
                          ? "+"
                          : ""
                      }

                      {
                        stats.weightChange
                      }

                      <span className="text-base font-normal ml-1">

                        kg

                      </span>


                    </p>


                    <p className="text-sm text-gray-500 mt-2">

                      During the selected {
                        range
                      }-day period.

                    </p>


                  </div>

                )}


                {/* ========================================
                    WEIGHT CHART
                ======================================== */}

                <ChartCard

                  title="Weight Trend"

                  description="Your recorded body weight over time."

                >


                  <ResponsiveContainer
                    width="100%"
                    height={300}
                  >

                    <LineChart
                      data={
                        chartData
                      }
                    >


                      <CartesianGrid
                        strokeDasharray="3 3"
                      />


                      <XAxis
                        dataKey="date"
                      />


                      <YAxis
                        domain={[
                          "auto",
                          "auto"
                        ]}
                      />


                      <Tooltip />


                      <Line

                        type="monotone"

                        dataKey="weight"

                        stroke="currentColor"

                        strokeWidth={2}

                        connectNulls

                      />


                    </LineChart>


                  </ResponsiveContainer>


                </ChartCard>


                {/* ========================================
                    STEPS CHART
                ======================================== */}

                <ChartCard

                  title="Daily Steps"

                  description="Your movement and daily activity."

                >


                  <ResponsiveContainer
                    width="100%"
                    height={300}
                  >


                    <BarChart
                      data={
                        chartData
                      }
                    >


                      <CartesianGrid
                        strokeDasharray="3 3"
                      />


                      <XAxis
                        dataKey="date"
                      />


                      <YAxis />


                      <Tooltip />


                      <Bar
                        dataKey="steps"
                        fill="currentColor"
                      />


                    </BarChart>


                  </ResponsiveContainer>


                </ChartCard>


                {/* ========================================
                    SLEEP
                ======================================== */}

                <ChartCard

                  title="Sleep"

                  description="Hours of sleep recorded each day."

                >


                  <ResponsiveContainer
                    width="100%"
                    height={300}
                  >


                    <LineChart
                      data={
                        chartData
                      }
                    >


                      <CartesianGrid
                        strokeDasharray="3 3"
                      />


                      <XAxis
                        dataKey="date"
                      />


                      <YAxis />


                      <Tooltip />


                      <Line

                        type="monotone"

                        dataKey="sleep"

                        stroke="currentColor"

                        strokeWidth={2}

                      />


                    </LineChart>


                  </ResponsiveContainer>


                </ChartCard>


                {/* ========================================
                    WATER
                ======================================== */}

                <ChartCard

                  title="Water Intake"

                  description="Your recorded daily hydration."

                >


                  <ResponsiveContainer
                    width="100%"
                    height={300}
                  >


                    <BarChart
                      data={
                        chartData
                      }
                    >


                      <CartesianGrid
                        strokeDasharray="3 3"
                      />


                      <XAxis
                        dataKey="date"
                      />


                      <YAxis />


                      <Tooltip />


                      <Bar
                        dataKey="water"
                        fill="currentColor"
                      />


                    </BarChart>


                  </ResponsiveContainer>


                </ChartCard>


                {/* ========================================
                    MOOD + ENERGY
                ======================================== */}

                <section className="mt-8">


                  <h2 className="text-2xl font-bold text-black">

                    Wellbeing

                  </h2>


                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">


                    <StatCard

                      emoji="🙂"

                      title="Average Mood"

                      value={
                        stats.averageMood
                      }

                      unit="/ 5"

                    />


                    <StatCard

                      emoji="⚡"

                      title="Average Energy"

                      value={
                        stats.averageEnergy
                      }

                      unit="/ 5"

                    />


                  </div>


                </section>


                <ChartCard

                  title="Mood & Energy"

                  description="How you have been feeling across your tracked days."

                >


                  <ResponsiveContainer
                    width="100%"
                    height={300}
                  >


                    <LineChart
                      data={
                        chartData
                      }
                    >


                      <CartesianGrid
                        strokeDasharray="3 3"
                      />


                      <XAxis
                        dataKey="date"
                      />


                      <YAxis
                        domain={[
                          0,
                          5
                        ]}
                      />


                      <Tooltip />


                      <Line

                        type="monotone"

                        dataKey="mood"

                        stroke="currentColor"

                        strokeWidth={2}

                      />


                      <Line

                        type="monotone"

                        dataKey="energy"

                        stroke="currentColor"

                        strokeWidth={2}

                        strokeDasharray="6 4"

                      />


                    </LineChart>


                  </ResponsiveContainer>


                </ChartCard>


                {/* ========================================
                    RECENT DAYS
                ======================================== */}

                <section className="mt-10 mb-10">


                  <h2 className="text-2xl font-bold text-black">

                    Recent Activity

                  </h2>


                  <div className="mt-5 bg-white border border-gray-200 rounded-2xl overflow-hidden">


                    <div className="overflow-x-auto">


                      <table className="w-full">


                        <thead className="bg-gray-50">


                          <tr>


                            <th className="text-left px-6 py-4 text-sm text-gray-500">

                              Date

                            </th>


                            <th className="text-left px-6 py-4 text-sm text-gray-500">

                              Meals

                            </th>


                            <th className="text-left px-6 py-4 text-sm text-gray-500">

                              Workout

                            </th>


                            <th className="text-left px-6 py-4 text-sm text-gray-500">

                              Water

                            </th>


                            <th className="text-left px-6 py-4 text-sm text-gray-500">

                              Steps

                            </th>


                            <th className="text-left px-6 py-4 text-sm text-gray-500">

                              Sleep

                            </th>


                          </tr>


                        </thead>


                        <tbody>


                          {[...records]
                            .reverse()
                            .map(

                              record => {

                                const mealsCompleted = [

                                  record.breakfast_completed,

                                  record.lunch_completed,

                                  record.dinner_completed,

                                ].filter(
                                  Boolean
                                ).length;


                                return (

                                  <tr

                                    key={
                                      record.id
                                    }

                                    className="border-t border-gray-100"

                                  >


                                    <td className="px-6 py-4 font-medium text-black">

                                      {
                                        formatReadableDate(
                                          record.tracker_date
                                        )
                                      }

                                    </td>


                                    <td className="px-6 py-4 text-gray-600">

                                      {
                                        mealsCompleted
                                      } / 3

                                    </td>


                                    <td className="px-6 py-4 text-gray-600">

                                      {
                                        record.workout_completed
                                          ? "✓"
                                          : "—"
                                      }

                                    </td>


                                    <td className="px-6 py-4 text-gray-600">

                                      {
                                        Number(
                                          record.water_litres || 0
                                        )
                                      } L

                                    </td>


                                    <td className="px-6 py-4 text-gray-600">

                                      {
                                        Number(
                                          record.steps || 0
                                        ).toLocaleString()
                                      }

                                    </td>


                                    <td className="px-6 py-4 text-gray-600">

                                      {
                                        Number(
                                          record.sleep_hours || 0
                                        )
                                      } hrs

                                    </td>


                                  </tr>

                                );

                              }

                            )}


                        </tbody>


                      </table>


                    </div>


                  </div>


                </section>


              </>

            )}


        </div>


      </section>


    </main>

  );

}


// =========================================================
// STAT CARD
// =========================================================

function StatCard({

  emoji,

  title,

  value,

  unit,

}: {

  emoji:
    string;

  title:
    string;

  value:
    number | string;

  unit:
    string;

}) {

  return (

    <div className="bg-white border border-gray-200 rounded-2xl p-6">


      <span className="text-3xl">

        {
          emoji
        }

      </span>


      <p className="text-sm text-gray-500 mt-4">

        {
          title
        }

      </p>


      <p className="text-3xl font-bold text-black mt-2">

        {
          value
        }


        {unit && (

          <span className="text-base font-normal ml-1">

            {
              unit
            }

          </span>

        )}


      </p>


    </div>

  );

}


// =========================================================
// PERCENTAGE CARD
// =========================================================

function PercentageCard({

  emoji,

  title,

  percentage,

}: {

  emoji:
    string;

  title:
    string;

  percentage:
    number;

}) {

  return (

    <div className="bg-white border border-gray-200 rounded-2xl p-6">


      <span className="text-3xl">

        {
          emoji
        }

      </span>


      <p className="text-gray-500 mt-4">

        {
          title
        }

      </p>


      <p className="text-3xl font-bold text-black mt-2">

        {
          percentage
        }%

      </p>


      <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">


        <div

          className="h-full bg-black rounded-full"

          style={{

            width:
              `${percentage}%`

          }}

        />


      </div>


    </div>

  );

}


// =========================================================
// CHART CARD
// =========================================================

function ChartCard({

  title,

  description,

  children,

}: {

  title:
    string;

  description:
    string;

  children:
    React.ReactNode;

}) {

  return (

    <section className="mt-8 bg-white border border-gray-200 rounded-2xl p-6">


      <h2 className="text-2xl font-bold text-black">

        {
          title
        }

      </h2>


      <p className="text-gray-500 mt-1 mb-6">

        {
          description
        }

      </p>


      {
        children
      }


    </section>

  );

}


// =========================================================
// HELPERS
// =========================================================

function average(
  values:
    number[]
) {

  if (
    values.length === 0
  ) {

    return 0;

  }


  return (

    values.reduce(
      (
        total,
        value
      ) =>
        total +
        value,
      0
    ) /
    values.length

  );

}


function round(
  value:
    number,
  decimals:
    number
) {

  const multiplier =
    10 **
    decimals;


  return (

    Math.round(
      value *
      multiplier
    ) /
    multiplier

  );

}


function formatShortDate(
  date:
    string
) {

  const parts =
    date.split(
      "-"
    );


  if (
    parts.length !== 3
  ) {

    return date;

  }


  return (
    `${parts[2]}/${parts[1]}`
  );

}


function formatReadableDate(
  date:
    string
) {

  const parsed =
    new Date(
      `${date}T00:00:00`
    );


  return parsed.toLocaleDateString(
    "en-NZ",
    {

      day:
        "numeric",

      month:
        "short",

    }
  );

}