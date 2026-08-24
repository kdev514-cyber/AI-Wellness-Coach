"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { getAuthFlowStatus } from "../lib/authFlow";


export default function HomePage() {

  const router = useRouter();


  useEffect(() => {

    async function redirectUser() {

      const state =
        await getAuthFlowStatus();


      // Not logged in
      if (!state.isLoggedIn) {

        router.replace("/login");

        return;

      }


      // Logged in but onboarding not completed
      if (!state.hasProfile) {

        router.replace("/onboarding");

        return;

      }


      // Existing onboarded user
      router.replace("/dashboard");

    }


    redirectUser();

  }, [router]);


  return (

    <main className="min-h-screen bg-white flex items-center justify-center">

      <div className="text-center">

        <h1 className="text-3xl font-bold text-black">

          AI Wellness Coach

        </h1>

        <p className="mt-3 text-gray-500">

          Loading your wellness experience...

        </p>

      </div>

    </main>

  );

}