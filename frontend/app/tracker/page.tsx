"use client";

import { useEffect, useState } from "react";

import AppSidebar from "../../components/AppSidebar";

import { supabase } from "../../lib/supabase";


export default function TrackerPage() {

  // =====================================================
  // DATE
  // =====================================================

  const today =
    new Date()
      .toLocaleDateString(
        "en-CA"
      );


  const [
    selectedDate,
    setSelectedDate
  ] = useState(
    today
  );


  // =====================================================
  // MEALS
  // =====================================================

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


  // =====================================================
  // WORKOUT
  // =====================================================

  const [
    workoutCompleted,
    setWorkoutCompleted
  ] = useState(
    false
  );


  // =====================================================
  // DAILY VALUES
  // =====================================================

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


  // =====================================================
  // WELLBEING
  // =====================================================

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


  // =====================================================
  // PAGE STATE
  // =====================================================

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


  // =====================================================
  // LOAD TRACKER WHEN DATE CHANGES
  // =====================================================

  useEffect(() => {

    async function loadTracker() {

      setLoading(
        true
      );


      setMessage(
        ""
      );


      setError(
        ""
      );


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

        setLoading(
          false
        );

        return;

      }


      const {

        data,

        error

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


      if (error) {

        console.error(
          "Tracker load error:",
          error
        );


        setError(
          "Could not load your daily tracker."
        );


        setLoading(
          false
        );

        return;

      }


      // =================================================
      // EXISTING DAY
      // =================================================

      if (data) {

        setBreakfastCompleted(
          data.breakfast_completed
        );

        setLunchCompleted(
          data.lunch_completed
        );

        setDinnerCompleted(
          data.dinner_completed
        );

        setWorkoutCompleted(
          data.workout_completed
        );

        setWater(
          String(
            data.water_litres ?? 0
          )
        );

        setSteps(
          String(
            data.steps ?? 0
          )
        );

        setSleep(
          String(
            data.sleep_hours ?? 0
          )
        );

        setWeight(
          data.weight_kg !== null
            ? String(
                data.weight_kg
              )
            : ""
        );

        setMood(
          data.mood ?? 3
        );

        setEnergy(
          data.energy ?? 3
        );

        setNotes(
          data.notes ?? ""
        );

      }

      // =================================================
      // EMPTY DAY
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


      setLoading(
        false
      );

    }


    loadTracker();

  }, [selectedDate]);


  // =====================================================
  // SAVE TRACKER
  // =====================================================

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
            water || 0
          ),

        steps:
          Number(
            steps || 0
          ),

        sleep_hours:
          Number(
            sleep || 0
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

      } else {

        setError(
          "Something went wrong."
        );

      }


    } finally {

      setSaving(
        false
      );

    }

  }


  // =====================================================
  // COMPLETION SCORE
  // =====================================================

  const completedHabits = [

    breakfastCompleted,

    lunchCompleted,

    dinnerCompleted,

    workoutCompleted,

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


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <main className="min-h-screen bg-gray-50 flex">


      <AppSidebar />


      <section className="flex-1 p-10">


        <div className="max-w-6xl">


          {/* ============================================
              HEADER
          ============================================ */}

          <p className="text-sm font-semibold text-gray-500">

            DAILY WELLNESS

          </p>


          <h1 className="text-4xl font-bold text-black mt-2">

            Daily Tracker

          </h1>


          <p className="text-gray-600 mt-3">

            Track your habits, health and daily progress.

          </p>


          {/* ============================================
              DATE
          ============================================ */}

          <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-6">


            <label className="block text-sm font-medium text-gray-600">

              Tracking Date

            </label>


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
                mt-3
                border
                border-gray-300
                rounded-xl
                px-4
                py-3
                text-black
              "

            />


          </div>


          {/* ============================================
              LOADING
          ============================================ */}

          {loading && (

            <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-8">


              <p className="text-gray-500">

                Loading your tracker...

              </p>


            </div>

          )}


          {!loading && (

            <>


              {/* ========================================
                  DAILY SCORE
              ======================================== */}

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


              {/* ========================================
                  MEALS
              ======================================== */}

              <section className="mt-10">


                <h2 className="text-2xl font-bold text-black">

                  Meals

                </h2>


                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">


                  <CheckCard

                    title="Breakfast"

                    emoji="🍳"

                    checked={
                      breakfastCompleted
                    }

                    onChange={
                      setBreakfastCompleted
                    }

                  />


                  <CheckCard

                    title="Lunch"

                    emoji="🥗"

                    checked={
                      lunchCompleted
                    }

                    onChange={
                      setLunchCompleted
                    }

                  />


                  <CheckCard

                    title="Dinner"

                    emoji="🍽️"

                    checked={
                      dinnerCompleted
                    }

                    onChange={
                      setDinnerCompleted
                    }

                  />


                </div>


              </section>


              {/* ========================================
                  WORKOUT
              ======================================== */}

              <section className="mt-10">


                <h2 className="text-2xl font-bold text-black">

                  Workout

                </h2>


                <div className="mt-5">


                  <CheckCard

                    title="Today's Workout"

                    emoji="🏋️"

                    checked={
                      workoutCompleted
                    }

                    onChange={
                      setWorkoutCompleted
                    }

                  />


                </div>


              </section>


              {/* ========================================
                  HEALTH METRICS
              ======================================== */}

              <section className="mt-10">


                <h2 className="text-2xl font-bold text-black">

                  Daily Metrics

                </h2>


                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-5">


                  <NumberCard

                    title="Water"

                    emoji="💧"

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

                    emoji="🚶"

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

                    emoji="😴"

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

                    emoji="⚖️"

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


              {/* ========================================
                  WELLBEING
              ======================================== */}

              <section className="mt-10">


                <h2 className="text-2xl font-bold text-black">

                  How Do You Feel?

                </h2>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">


                  <RatingCard

                    title="Mood"

                    emoji="🙂"

                    value={
                      mood
                    }

                    onChange={
                      setMood
                    }

                  />


                  <RatingCard

                    title="Energy"

                    emoji="⚡"

                    value={
                      energy
                    }

                    onChange={
                      setEnergy
                    }

                  />


                </div>


              </section>


              {/* ========================================
                  NOTES
              ======================================== */}

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


              {/* ========================================
                  SAVE
              ======================================== */}

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
                  "

                >

                  {
                    saving
                      ? "Saving..."
                      : "Save Daily Progress"
                  }

                </button>


                {message && (

                  <div className="mt-5 bg-green-50 border border-green-200 rounded-xl p-4">


                    <p className="text-green-700">

                      ✓ {
                        message
                      }

                    </p>


                  </div>

                )}


                {error && (

                  <div className="mt-5 bg-red-50 border border-red-200 rounded-xl p-4">


                    <p className="text-red-700">

                      {
                        error
                      }

                    </p>


                  </div>

                )}


              </div>


            </>

          )}


        </div>


      </section>


    </main>

  );

}


// =========================================================
// CHECK CARD
// =========================================================

function CheckCard({

  title,

  emoji,

  checked,

  onChange,

}: {

  title:
    string;

  emoji:
    string;

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

    <button

      type="button"

      onClick={
        () =>
          onChange(
            !checked
          )
      }

      className={`
        text-left
        border
        rounded-2xl
        p-6
        transition

        ${
          checked
            ? "bg-black text-white border-black"
            : "bg-white text-black border-gray-200 hover:border-gray-400"
        }
      `}

    >


      <div className="flex justify-between items-start">


        <span className="text-3xl">

          {
            emoji
          }

        </span>


        <span className="text-xl">

          {
            checked
              ? "✓"
              : "○"
          }

        </span>


      </div>


      <p className="font-semibold text-lg mt-5">

        {
          title
        }

      </p>


      <p
        className={
          checked
            ? "text-gray-300 text-sm mt-1"
            : "text-gray-500 text-sm mt-1"
        }
      >

        {
          checked
            ? "Completed"
            : "Not completed"
        }

      </p>


    </button>

  );

}


// =========================================================
// NUMBER CARD
// =========================================================

function NumberCard({

  title,

  emoji,

  value,

  onChange,

  unit,

  step,

}: {

  title:
    string;

  emoji:
    string;

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


      <span className="text-3xl">

        {
          emoji
        }

      </span>


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

  emoji,

  value,

  onChange,

}: {

  title:
    string;

  emoji:
    string;

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


        <span className="text-3xl">

          {
            emoji
          }

        </span>


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

                  ${
                    value === rating
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