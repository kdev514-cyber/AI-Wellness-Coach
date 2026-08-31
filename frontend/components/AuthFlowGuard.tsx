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
  supabase,
} from "../lib/supabase";

import {
  getAuthFlowStatus,
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
  "/profile",
];


const authRoutes = [
  "/login",
  "/signup",
];


// =========================================================
// ROUTE MATCHER
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
  children:
    ReactNode;
}) {

  const pathname =
    usePathname();


  const router =
    useRouter();


  const [
    checking,
    setChecking,
  ] =
    useState(true);


  useEffect(
    () => {

      let active =
        true;


      // ===================================================
      // CHECK FLOW
      // ===================================================

      async function enforceFlow() {

        try {

          setChecking(
            true
          );


          const state =
            await getAuthFlowStatus();


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
            !state.isLoggedIn
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
          // LOGGED IN USER VISITS LOGIN / SIGNUP
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

            } else {

              router.replace(
                "/onboarding"
              );

            }


            return;

          }


          // =================================================
          // USER ALREADY HAS PROFILE
          // BUT OPENS ONBOARDING
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
          // PROTECTED PAGE BUT PROFILE DOES NOT EXIST
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


          // =================================================
          // PAGE IS ALLOWED
          // =================================================

          setChecking(
            false
          );


        } catch (
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
      // LISTEN FOR LOGIN / LOGOUT
      // ===================================================

      const {
        data: {
          subscription,
        },
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
      router,
    ]

  );


  // =====================================================
  // FLOW-SENSITIVE ROUTES
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


  // =====================================================
  // LOADING
  // =====================================================

  if (
    checking &&
    flowSensitivePage
  ) {

    return (

      <main className="min-h-screen bg-white flex items-center justify-center">

        <div className="text-center">

          <p className="font-semibold text-black">

            Daily Ally

          </p>


          <p className="text-sm text-gray-500 mt-2">

            Checking your account...

          </p>

        </div>

      </main>

    );

  }


  // =====================================================
  // PAGE CONTENT
  // =====================================================

  return (

    <>

      {
        children
      }

    </>

  );

}