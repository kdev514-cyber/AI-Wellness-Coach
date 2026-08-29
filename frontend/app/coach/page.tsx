"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  Bot,
  CalendarDays,
  ChartNoAxesCombined,
  Dumbbell,
  Moon,
  Salad,
  Send,
  Sparkles,
  Target,
} from "lucide-react";

import AppSidebar from "../../components/AppSidebar";
import { supabase } from "../../lib/supabase";


// =========================================================
// TYPES
// =========================================================

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};


// =========================================================
// PAGE
// =========================================================

export default function CoachPage() {

  const [
    question,
    setQuestion,
  ] = useState("");


  const [
    messages,
    setMessages,
  ] = useState<ChatMessage[]>(
    []
  );


  const [
    loading,
    setLoading,
  ] = useState(
    false
  );


  const [
    error,
    setError,
  ] = useState(
    ""
  );


  // =====================================================
  // API BASE URL
  // =====================================================

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL;


  // =====================================================
  // ASK AI COACH
  // =====================================================

  async function askCoach(
    event:
      FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();


    if (
      loading
    ) {

      return;

    }


    const cleanQuestion =
      question.trim();


    if (
      !cleanQuestion
    ) {

      return;

    }


    if (
      !API_BASE_URL
    ) {

      setError(
        "AI Coach backend is not configured."
      );

      return;

    }


    setLoading(
      true
    );


    setError(
      ""
    );


    // ===================================================
    // SHOW USER MESSAGE
    // ===================================================

    setMessages(
      previous => [

        ...previous,

        {
          role:
            "user",

          content:
            cleanQuestion,
        },

      ]
    );


    setQuestion(
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
      // PROFILE
      // =================================================

      const {

        data:
          profile,

        error:
          profileError

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
          "Profile context error:",
          profileError
        );


        throw new Error(
          profileError?.message ||
          "Could not load your wellness profile."
        );

      }


      // =================================================
      // NUTRITION PLAN
      // =================================================

      const {

        data:
          nutritionPlan,

        error:
          nutritionError

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
            weekly_plan
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
          "Nutrition context error:",
          nutritionError
        );

      }


      // =================================================
      // WORKOUT PLAN
      // =================================================

      const {

        data:
          workoutPlan,

        error:
          workoutError

      } =
        await supabase

          .from(
            "workout_plans"
          )

          .select(
            `
            workout_days,
            weekly_plan
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
          "Workout context error:",
          workoutError
        );

      }


      // =================================================
      // LAST 7 DAYS
      // =================================================

      const sevenDaysAgo =
        new Date();


      sevenDaysAgo.setDate(

        sevenDaysAgo.getDate() -
        6

      );


      const startDate =
        sevenDaysAgo
          .toLocaleDateString(
            "en-CA"
          );


      // =================================================
      // TRACKER HISTORY
      // =================================================

      const {

        data:
          trackerHistory,

        error:
          trackerError

      } =
        await supabase

          .from(
            "daily_tracker"
          )

          .select(
            `
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
            startDate
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
          "Tracker context error:",
          trackerError
        );

      }


      // =================================================
      // CALL RAILWAY
      // =================================================

      const apiUrl =
        `${API_BASE_URL}/coach`;


      console.log(
        "Calling Coach API:",
        apiUrl
      );


      const response =
        await fetch(
          apiUrl,
          {

            method:
              "POST",

            headers: {

              "Content-Type":
                "application/json",

            },

            body:
              JSON.stringify({

                question:
                  cleanQuestion,

                profile,

                nutrition_plan:
                  nutritionPlan,

                workout_plan:
                  workoutPlan,

                tracker_history:
                  trackerHistory ||
                  [],

              }),

          }
        );


      // =================================================
      // RESPONSE
      // =================================================

      let data;


      try {

        data =
          await response.json();

      }

      catch {

        throw new Error(
          "The AI Coach backend returned an invalid response."
        );

      }


      if (
        !response.ok
      ) {

        throw new Error(

          data?.error ||

          `Backend error: ${response.status}`

        );

      }


      if (
        !data.success
      ) {

        throw new Error(

          data.error ||

          "AI Coach could not answer."

        );

      }


      if (
        !data.answer
      ) {

        throw new Error(
          "AI Coach returned an empty answer."
        );

      }


      // =================================================
      // ADD AI MESSAGE
      // =================================================

      setMessages(
        previous => [

          ...previous,

          {

            role:
              "assistant",

            content:
              data.answer,

          },

        ]
      );


    }

    catch (
      err
    ) {

      console.error(
        "AI Coach error:",
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


  // =====================================================
  // QUICK QUESTIONS
  // =====================================================

  const quickQuestions = [

    {
      icon:
        <ChartNoAxesCombined size={24} strokeWidth={2} />,

      title:
        "Weekly Review",

      question:
        "Give me a review of how I am doing this week.",
    },

    {
      icon:
        <Target size={24} strokeWidth={2} />,

      title:
        "What to Improve",

      question:
        "What are the most important things I should improve based on my recent progress?",
    },

    {
      icon:
        <Moon size={24} strokeWidth={2} />,

      title:
        "Sleep",

      question:
        "How has my sleep been recently and what should I focus on?",
    },

    {
      icon:
        <Dumbbell size={24} strokeWidth={2} />,

      title:
        "Workout Consistency",

      question:
        "How consistent have I been with my workouts?",
    },

    {
      icon:
        <Salad size={24} strokeWidth={2} />,

      title:
        "Meal Adherence",

      question:
        "How well have I followed my nutrition plan recently?",
    },

    {
      icon:
        <CalendarDays size={24} strokeWidth={2} />,

      title:
        "Tomorrow",

      question:
        "Based on my plan and recent progress, what should I focus on tomorrow?",
    },

  ];


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <main className="min-h-screen bg-gray-50 flex">


      <AppSidebar />


      <section className="flex-1 p-10">


        <div className="max-w-5xl mx-auto">


          {/* ============================================
              HEADER
          ============================================ */}

          <p className="text-sm font-semibold text-gray-500">

            PERSONAL GUIDANCE

          </p>


          <h1 className="text-4xl font-bold text-black mt-2">

            AI Coach

          </h1>


          <p className="text-gray-600 mt-3 max-w-2xl">

            Ask questions about your wellness plan and recent
            progress. Your coach can use your profile, nutrition,
            workout and Daily Tracker history.

          </p>


          {/* ============================================
              CONTEXT
          ============================================ */}

          <div className="mt-8 bg-black text-white rounded-2xl p-6">


            <div className="flex gap-4">


              <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center shrink-0">

                <Bot
                  size={25}
                  strokeWidth={2}
                  className="text-white"
                />

              </div>


              <div>


                <h2 className="font-semibold text-lg">

                  Personalized Wellness Analysis

                </h2>


                <p className="text-sm text-gray-300 mt-2">

                  The coach analyzes your recent tracked data before
                  answering so that guidance can reflect your actual
                  meals, workouts, sleep, water, steps, mood and energy.

                </p>


              </div>


            </div>


          </div>


          {/* ============================================
              QUICK QUESTIONS
          ============================================ */}

          {
            messages.length ===
              0 && (

              <section className="mt-10">


                <h2 className="text-xl font-semibold text-black">

                  Start with a question

                </h2>


                <p className="text-gray-500 text-sm mt-1">

                  These questions use your recent wellness data.

                </p>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">


                  {
                    quickQuestions.map(
                      item => (

                        <button

                          key={
                            item.title
                          }

                          type="button"

                          onClick={
                            () =>
                              setQuestion(
                                item.question
                              )
                          }

                          className="
                            text-left
                            bg-white
                            border
                            border-gray-200
                            rounded-2xl
                            p-5
                            hover:border-gray-400
                            hover:shadow-sm
                            transition
                            cursor-pointer
                          "

                        >


                          <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-black">

                            {
                              item.icon
                            }

                          </div>


                          <p className="font-semibold text-black mt-3">

                            {
                              item.title
                            }

                          </p>


                          <p className="text-sm text-gray-500 mt-1">

                            {
                              item.question
                            }

                          </p>


                        </button>

                      )
                    )
                  }


                </div>


              </section>

            )
          }


          {/* ============================================
              CHAT
          ============================================ */}

          <section className="mt-10">


            <div className="space-y-5">


              {
                messages.map(
                  (
                    message,
                    index
                  ) => (

                    <div

                      key={
                        index
                      }

                      className={
                        message.role ===
                        "user"

                          ? "flex justify-end"

                          : "flex justify-start"
                      }

                    >


                      <div

                        className={

                          message.role ===
                          "user"

                            ? `
                              max-w-2xl
                              bg-black
                              text-white
                              rounded-2xl
                              px-6
                              py-4
                            `

                            : `
                              max-w-3xl
                              bg-white
                              border
                              border-gray-200
                              text-gray-800
                              rounded-2xl
                              px-6
                              py-5
                            `

                        }

                      >


                        {
                          message.role ===
                            "assistant" && (

                            <p className="text-xs font-semibold text-gray-400 mb-3">

                              AI WELLNESS COACH

                            </p>

                          )
                        }


                        <p className="whitespace-pre-wrap leading-7">

                          {
                            message.content
                          }

                        </p>


                      </div>


                    </div>

                  )
                )
              }


              {/* ========================================
                  THINKING
              ======================================== */}

              {
                loading && (

                  <div className="flex justify-start">


                    <div className="bg-white border border-gray-200 rounded-2xl px-6 py-5">


                      <p className="text-xs font-semibold text-gray-400">

                        AI WELLNESS COACH

                      </p>


                      <p className="text-gray-600 mt-2">

                        Analyzing your recent wellness data...

                      </p>


                    </div>


                  </div>

                )
              }


            </div>


          </section>


          {/* ============================================
              ERROR
          ============================================ */}

          {
            error && (

              <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">


                <p className="text-red-700 font-semibold">

                  AI Coach Error

                </p>


                <p className="text-red-600 text-sm mt-1">

                  {
                    error
                  }

                </p>


              </div>

            )
          }


          {/* ============================================
              FORM
          ============================================ */}

          <form

            onSubmit={
              askCoach
            }

            className="mt-8 mb-10"

          >


            <div className="bg-white border border-gray-200 rounded-2xl p-4">


              <textarea

                value={
                  question
                }

                onChange={
                  event =>
                    setQuestion(
                      event.target.value
                    )
                }

                placeholder="Ask your AI Coach something..."

                rows={
                  4
                }

                disabled={
                  loading
                }

                className="
                  w-full
                  resize-none
                  outline-none
                  text-black
                  placeholder:text-gray-400
                "

              />


              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mt-4">


                <p className="text-xs text-gray-400">

                  General wellness guidance — not medical advice.

                </p>


                <button

                  type="submit"

                  disabled={
                    loading ||
                    !question.trim()
                  }

                  className="
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

                  <span className="inline-flex items-center gap-2">

                    {
                      loading

                        ? (
                          <>
                            <Sparkles size={18} strokeWidth={2} />
                            Analyzing...
                          </>
                        )

                        : (
                          <>
                            <Send size={18} strokeWidth={2} />
                            Ask Coach
                          </>
                        )
                    }

                  </span>

                </button>


              </div>


            </div>


          </form>


        </div>


      </section>


    </main>

  );

}