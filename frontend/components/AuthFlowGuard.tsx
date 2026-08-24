"use client";

import {
  ReactNode,
  useEffect,
  useState,
} from "react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  supabase
} from "../lib/supabase";

import {
  getUserFlowState
} from "../lib/authFlow";


// =========================================================
// ROUTES
// =========================================================

const protectedRoutes = [
  "/dashboard",
  "/nutrition",
  "/workout",
  "/tracker",
  "/progress",
  "/coach",
];


const authRoutes = [
  "/login",
  "/signup",
];


// =========================================================
// HELPERS
// =========================================================

function matchesRoute(
  pathname: string,
  routes: string[]
) {

  return routes.some(
    route =>
      pathname === route ||
      pathname.startsWith(
        `${route}/`
      )
  );

}


// =========================================================
// AUTH FLOW GUARD
// =========================================================

export default function AuthFlowGuard({
  children,
}: {
  children: ReactNode;
}) {

  const pathname =
    usePathname();


  const router =
    useRouter();


  const [
    checking,
    setChecking
  ] =
    useState(
      true
    );


  useEffect(
    () => {

      let active =
        true;


      // ===================================================
      // ENFORCE FLOW
      // ===================================================

      async function enforceFlow() {

        try {

          setChecking(
            true
          );


          const state =
            await getUserFlowState();


          if (
            !active
          ) {

            return;

          }


          const isProtectedPage =
            matchesRoute(
              pathname,
              protectedRoutes
            );


          const isAuthPage =
            matchesRoute(
              pathname,
              authRoutes
            );


          const isOnboardingPage =
            pathname ===
              "/onboarding";


          // =================================================
          // NOT LOGGED IN
          // =================================================

          if (
            !state.user
          ) {

            if (
              isProtectedPage ||
              isOnboardingPage
            ) {

              router.replace(
                "/login"
              );

              return;

            }


            setChecking(
              false
            );

            return;

          }


          // =================================================
          // LOGGED IN + LOGIN / SIGNUP
          // =================================================

          if (
            isAuthPage
          ) {

            if (
              state.hasProfile
            ) {

              router.replace(
                "/dashboard"
              );

            }

            else {

              router.replace(
                "/onboarding"
              );

            }


            return;

          }


          // =================================================
          // PROFILE EXISTS + ONBOARDING
          // =================================================

          if (
            isOnboardingPage &&
            state.hasProfile
          ) {

            router.replace(
              "/dashboard"
            );

            return;

          }


          // =================================================
          // PROTECTED PAGE WITHOUT PROFILE
          // =================================================

          if (
            isProtectedPage &&
            !state.hasProfile
          ) {

            router.replace(
              "/onboarding"
            );

            return;

          }


          setChecking(
            false
          );


        }

        catch (
          error
        ) {

          console.error(
            "Authentication flow error:",
            error
          );


          setChecking(
            false
          );

        }

      }


      enforceFlow();


      // ===================================================
      // LISTEN FOR LOGIN / LOGOUT CHANGES
      // ===================================================

      const {
        data: {
          subscription
        }
      } =
        supabase.auth.onAuthStateChange(
          () => {

            enforceFlow();

          }
        );


      return () => {

        active =
          false;


        subscription.unsubscribe();

      };

    },

    [
      pathname,
      router
    ]

  );


  // =====================================================
  // LOADING
  // =====================================================

  const flowSensitivePage =
    matchesRoute(
      pathname,
      [
        ...protectedRoutes,
        ...authRoutes,
        "/onboarding",
      ]
    );


  if (
    checking &&
    flowSensitivePage
  ) {

    return (

      <main className="min-h-screen bg-white flex items-center justify-center">

        <div className="text-center">

          <p className="font-semibold text-black">

            AI Wellness Coach

          </p>


          <p className="text-sm text-gray-500 mt-2">

            Checking your account...

          </p>

        </div>

      </main>

    );

  }


  return (
    <>
      {children}
    </>
  );

}