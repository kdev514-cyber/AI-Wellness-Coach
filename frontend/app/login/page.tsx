"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  useRouter
} from "next/navigation";

import {
  supabase
} from "../../lib/supabase";

import {
  getUserFlowState
} from "../../lib/authFlow";


// =========================================================
// LOGIN PAGE
// =========================================================

export default function LoginPage() {

  const router =
    useRouter();


  const [
    email,
    setEmail
  ] =
    useState(
      ""
    );


  const [
    password,
    setPassword
  ] =
    useState(
      ""
    );


  const [
    message,
    setMessage
  ] =
    useState(
      ""
    );


  const [
    loading,
    setLoading
  ] =
    useState(
      false
    );


  // =====================================================
  // LOGIN
  // =====================================================

  async function handleLogin(
    event:
      FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();


    setLoading(
      true
    );


    setMessage(
      ""
    );


    try {

      const cleanEmail =
        email
          .trim()
          .toLowerCase();


      const {
        error
      } =
        await supabase.auth.signInWithPassword({

          email:
            cleanEmail,

          password,

        });


      if (
        error
      ) {

        throw error;

      }


      // =================================================
      // CHECK ONBOARDING STATUS
      // =================================================

      const flow =
        await getUserFlowState();


      if (
        !flow.user
      ) {

        throw new Error(
          "Login succeeded but the session could not be loaded."
        );

      }


      // =================================================
      // EXISTING USER
      // =================================================

      if (
        flow.hasProfile
      ) {

        router.replace(
          "/dashboard"
        );

        return;

      }


      // =================================================
      // NEW USER
      // =================================================

      router.replace(
        "/onboarding"
      );


    }

    catch (
      error
    ) {

      console.error(
        "Login error:",
        error
      );


      if (
        error instanceof Error
      ) {

        setMessage(
          error.message
        );

      }

      else {

        setMessage(
          "Could not log in."
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
  // PAGE
  // =====================================================

  return (

    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">


      <div className="w-full max-w-md">


        {/* HEADER */}

        <div className="text-center mb-8">


          <h1 className="text-4xl font-bold text-black">

            AI Wellness Coach

          </h1>


          <p className="mt-3 text-gray-600">

            Welcome back

          </p>


        </div>


        {/* FORM */}

        <form

          onSubmit={
            handleLogin
          }

          className="
            bg-white
            border
            border-gray-200
            rounded-2xl
            p-8
            shadow-sm
          "

        >


          {/* EMAIL */}

          <div className="mb-5">


            <label className="block text-sm font-medium text-gray-700 mb-2">

              Email

            </label>


            <input

              type="email"

              value={
                email
              }

              onChange={
                event =>
                  setEmail(
                    event.target.value
                  )
              }

              placeholder="you@example.com"

              required

              autoComplete="email"

              className="
                w-full
                rounded-xl
                border
                border-gray-300
                px-4
                py-3
                text-black
                outline-none
                focus:ring-2
                focus:ring-black
              "

            />


          </div>


          {/* PASSWORD */}

          <div className="mb-6">


            <label className="block text-sm font-medium text-gray-700 mb-2">

              Password

            </label>


            <input

              type="password"

              value={
                password
              }

              onChange={
                event =>
                  setPassword(
                    event.target.value
                  )
              }

              placeholder="Your password"

              required

              autoComplete="current-password"

              className="
                w-full
                rounded-xl
                border
                border-gray-300
                px-4
                py-3
                text-black
                outline-none
                focus:ring-2
                focus:ring-black
              "

            />


          </div>


          {/* LOGIN BUTTON */}

          <button

            type="submit"

            disabled={
              loading
            }

            className="
              w-full
              rounded-xl
              bg-black
              px-4
              py-3
              font-semibold
              text-white
              hover:bg-gray-800
              disabled:opacity-50
              disabled:cursor-not-allowed
              cursor-pointer
            "

          >

            {
              loading

                ? "Checking your account..."

                : "Log In"
            }

          </button>


          {/* ERROR */}

          {
            message && (

              <div className="mt-5 bg-red-50 border border-red-200 rounded-xl p-4">


                <p className="text-sm text-red-700">

                  {
                    message
                  }

                </p>


              </div>

            )
          }


          {/* SIGNUP */}

          <div className="mt-7 pt-6 border-t border-gray-100 text-center">


            <p className="text-sm text-gray-500">

              New to AI Wellness Coach?

            </p>


            <a

              href="/signup"

              className="inline-block mt-2 font-semibold text-black hover:underline"

            >

              Create an account

            </a>


          </div>


        </form>


      </div>


    </main>

  );

}