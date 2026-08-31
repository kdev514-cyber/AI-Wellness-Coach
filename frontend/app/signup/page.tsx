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


// =========================================================
// SIGNUP PAGE
// =========================================================

export default function SignupPage() {

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
    errorMessage,
    setErrorMessage
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
  // SIGN UP
  // =====================================================

  async function handleSignup(
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


    setErrorMessage(
      ""
    );


    try {

      const cleanEmail =
        email
          .trim()
          .toLowerCase();


      const {
        data,
        error
      } =
        await supabase.auth.signUp({

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
      // SESSION EXISTS
      //
      // Email confirmation disabled / auto confirmation
      // =================================================

      if (
        data.session &&
        data.user
      ) {

        router.replace(
          "/onboarding"
        );

        return;

      }


      // =================================================
      // EMAIL CONFIRMATION REQUIRED
      // =================================================

      setMessage(
        "Account created. Please confirm your email, then log in to continue."
      );


    }

    catch (
      error
    ) {

      console.error(
        "Signup error:",
        error
      );


      if (
        error instanceof Error
      ) {

        setErrorMessage(
          error.message
        );

      }

      else {

        setErrorMessage(
          "Could not create your account."
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

            Daily Ally

          </h1>


          <p className="mt-3 text-gray-600">

            Create your wellness account

          </p>


        </div>


        {/* FORM */}

        <form

          onSubmit={
            handleSignup
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

              placeholder="Create a password"

              required

              minLength={
                6
              }

              autoComplete="new-password"

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


            <p className="text-xs text-gray-400 mt-2">

              Use at least 6 characters.

            </p>


          </div>


          {/* BUTTON */}

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

                ? "Creating account..."

                : "Create Account"
            }

          </button>


          {/* SUCCESS */}

          {
            message && (

              <div className="mt-5 bg-green-50 border border-green-200 rounded-xl p-4">


                <p className="text-sm text-green-700">

                  {
                    message
                  }

                </p>


              </div>

            )
          }


          {/* ERROR */}

          {
            errorMessage && (

              <div className="mt-5 bg-red-50 border border-red-200 rounded-xl p-4">


                <p className="text-sm text-red-700">

                  {
                    errorMessage
                  }

                </p>


              </div>

            )
          }


          {/* LOGIN LINK */}

          <div className="mt-7 pt-6 border-t border-gray-100 text-center">


            <p className="text-sm text-gray-500">

              Already have an account?

            </p>


            <a

              href="/login"

              className="inline-block mt-2 font-semibold text-black hover:underline"

            >

              Log in

            </a>


          </div>


        </form>


      </div>


    </main>

  );

}