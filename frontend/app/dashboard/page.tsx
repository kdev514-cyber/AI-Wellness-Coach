"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

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

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      // Get currently logged-in user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // If there is no logged-in user, go to login
      if (!user) {
        window.location.href = "/login";
        return;
      }

      // Get this user's profile from Supabase
      const { data, error } = await supabase
        .from("profiles")
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
        .eq("id", user.id)
        .single();

      if (error) {
        console.error(error);
        setErrorMessage("Could not load your profile.");
        setLoading(false);
        return;
      }

      setProfile(data);
      setLoading(false);
    }

    loadProfile();
  }, []);

  // Logout
  async function logout() {
    await supabase.auth.signOut();

    window.location.href = "/login";
  }

  // Loading screen
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">
          Loading your dashboard...
        </p>
      </main>
    );
  }

  // Error screen
  if (errorMessage) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-600">
          {errorMessage}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">

      {/* ================= HEADER ================= */}

      <header className="bg-white border-b border-gray-200">

        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

          <div>
            <h1 className="text-2xl font-bold text-black">
              AI Wellness Coach
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Your personal wellness companion
            </p>
          </div>

          <button
            onClick={logout}
            className="px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800"
          >
            Logout
          </button>

        </div>

      </header>


      {/* ================= MAIN CONTENT ================= */}

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* ================= WELCOME ================= */}

        <section>

          <p className="text-gray-500">
            Welcome back
          </p>

          <h2 className="text-4xl font-bold text-black mt-1">
            {profile?.full_name || "there"} 👋
          </h2>

          <p className="text-gray-600 mt-3">
            Let's make today a healthy and productive day.
          </p>

        </section>


        {/* ================= QUICK STATS ================= */}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">

          {/* Weight */}

          <div className="bg-white border border-gray-200 rounded-2xl p-6">

            <p className="text-sm text-gray-500">
              Weight
            </p>

            <p className="text-3xl font-bold text-black mt-2">
              {profile?.weight_kg ?? "--"}

              <span className="text-base font-normal ml-1">
                kg
              </span>
            </p>

          </div>


          {/* Height */}

          <div className="bg-white border border-gray-200 rounded-2xl p-6">

            <p className="text-sm text-gray-500">
              Height
            </p>

            <p className="text-3xl font-bold text-black mt-2">
              {profile?.height_cm ?? "--"}

              <span className="text-base font-normal ml-1">
                cm
              </span>
            </p>

          </div>


          {/* Workout days */}

          <div className="bg-white border border-gray-200 rounded-2xl p-6">

            <p className="text-sm text-gray-500">
              Workout
            </p>

            <p className="text-3xl font-bold text-black mt-2">
              {profile?.workout_days ?? "--"}

              <span className="text-base font-normal ml-1">
                days
              </span>
            </p>

          </div>


          {/* Workout duration */}

          <div className="bg-white border border-gray-200 rounded-2xl p-6">

            <p className="text-sm text-gray-500">
              Workout Time
            </p>

            <p className="text-3xl font-bold text-black mt-2">
              {profile?.workout_duration ?? "--"}

              <span className="text-base font-normal ml-1">
                min
              </span>
            </p>

          </div>

        </section>


        {/* ================= GOAL ================= */}

        <section className="mt-8 bg-black text-white rounded-2xl p-8">

          <p className="text-gray-300 text-sm">
            Your primary goal
          </p>

          <h3 className="text-3xl font-bold mt-2">
            {formatGoal(profile?.goal)}
          </h3>

          <p className="text-gray-300 mt-3">
            Your AI wellness plan will be personalized around
            this goal.
          </p>

        </section>


        {/* ================= WELLNESS FEATURES ================= */}

        <section className="mt-10">

          <h3 className="text-2xl font-bold text-black">
            Your Wellness
          </h3>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-5">

            {/* Nutrition */}

            <DashboardCard
              title="Nutrition"
              description="Your personalized meal plan"
              icon="🥗"
            />


            {/* Workout */}

            <DashboardCard
              title="Workout"
              description="Your personalized training plan"
              icon="🏋️"
            />


            {/* Tracker */}

            <DashboardCard
              title="Daily Tracker"
              description="Track your daily habits"
              icon="✅"
            />


            {/* AI Coach */}

            <DashboardCard
              title="AI Coach"
              description="Get personalized guidance"
              icon="🤖"
            />

          </div>

        </section>


        {/* ================= PROFILE SUMMARY ================= */}

        <section className="mt-10">

          <h3 className="text-2xl font-bold text-black">
            Your Profile
          </h3>

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
                value={formatGender(profile?.gender)}
              />

              <ProfileItem
                label="Activity Level"
                value={formatActivity(profile?.activity_level)}
              />

              <ProfileItem
                label="Diet"
                value={formatDiet(profile?.diet_preference)}
              />

              <ProfileItem
                label="Height"
                value={
                  profile?.height_cm
                    ? `${profile.height_cm} cm`
                    : "--"
                }
              />

              <ProfileItem
                label="Weight"
                value={
                  profile?.weight_kg
                    ? `${profile.weight_kg} kg`
                    : "--"
                }
              />

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}


/* =====================================================
   DASHBOARD CARD
===================================================== */

function DashboardCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow cursor-pointer">

      <div className="text-3xl">
        {icon}
      </div>

      <h4 className="text-xl font-semibold text-black mt-4">
        {title}
      </h4>

      <p className="text-gray-500 mt-2 text-sm">
        {description}
      </p>

    </div>
  );
}


/* =====================================================
   PROFILE ITEM
===================================================== */

function ProfileItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>

      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="text-lg font-semibold text-black mt-1">
        {value}
      </p>

    </div>
  );
}


/* =====================================================
   FORMAT GOAL
===================================================== */

function formatGoal(
  goal: string | null | undefined
) {
  if (!goal) {
    return "Wellness";
  }

  const goals: Record<string, string> = {

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

  return goals[goal] || goal;
}


/* =====================================================
   FORMAT GENDER
===================================================== */

function formatGender(
  gender: string | null | undefined
) {
  if (!gender) {
    return "--";
  }

  const genders: Record<string, string> = {

    male: "Male",

    female: "Female",

    non_binary: "Non-binary",

    prefer_not_to_say:
      "Prefer not to say",

  };

  return genders[gender] || gender;
}


/* =====================================================
   FORMAT ACTIVITY
===================================================== */

function formatActivity(
  activity: string | null | undefined
) {
  if (!activity) {
    return "--";
  }

  const activities: Record<string, string> = {

    sedentary:
      "Mostly sedentary",

    light:
      "Lightly active",

    moderate:
      "Moderately active",

    very_active:
      "Very active",

  };

  return activities[activity] || activity;
}


/* =====================================================
   FORMAT DIET
===================================================== */

function formatDiet(
  diet: string | null | undefined
) {
  if (!diet) {
    return "--";
  }

  const diets: Record<string, string> = {

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

  return diets[diet] || diet;
}