"use client";

import { FormEvent, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function OnboardingPage() {
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");

  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const [goal, setGoal] = useState("");
  const [activityLevel, setActivityLevel] = useState("");

  const [workoutDays, setWorkoutDays] = useState("");
  const [workoutDuration, setWorkoutDuration] = useState("");

  const [dietPreference, setDietPreference] = useState("");
  const [favoriteFoods, setFavoriteFoods] = useState("");
  const [avoidedFoods, setAvoidedFoods] = useState("");
  const [allergies, setAllergies] = useState("");

  const [sleepTime, setSleepTime] = useState("");
  const [wakeTime, setWakeTime] = useState("");

  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setMessage("");

    // Get the currently logged-in user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setMessage("You must be logged in to save your profile.");
      setSaving(false);
      return;
    }

    // Save the user's profile to Supabase
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,

      full_name: fullName,
      age: Number(age),
      gender: gender,

      height_cm: Number(height),
      weight_kg: Number(weight),

      goal: goal,
      activity_level: activityLevel,

      workout_days: Number(workoutDays),
      workout_duration: Number(workoutDuration),

      diet_preference: dietPreference,
      favorite_foods: favoriteFoods,
      avoided_foods: avoidedFoods,
      allergies: allergies,

      sleep_time: sleepTime,
      wake_time: wakeTime,

      updated_at: new Date().toISOString(),
    });

    setSaving(false);

    if (error) {
      console.error("Profile save error:", error);
      setMessage(error.message);
      return;
    }

    setMessage("Profile saved successfully!");

    // Move user to dashboard
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 800);
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-3xl mx-auto">

        {/* HEADER */}

        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-black">
            AI Wellness Coach
          </h1>

          <p className="mt-3 text-xl font-semibold text-gray-800">
            Let's get to know you
          </p>

          <p className="mt-2 text-gray-500">
            Your answers will help us create a wellness plan
            personalized to your lifestyle and goals.
          </p>
        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
        >

          {/* BASIC INFORMATION */}

          <section>
            <h2 className="text-2xl font-semibold text-black">
              Basic Information
            </h2>

            <p className="text-gray-500 mt-1 mb-6">
              Tell us a little about yourself.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* NAME */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>

                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-black outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* AGE */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>

                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="25"
                  min="13"
                  max="100"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-black outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* GENDER */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>

                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-black bg-white"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non_binary">Non-binary</option>
                  <option value="prefer_not_to_say">
                    Prefer not to say
                  </option>
                </select>
              </div>

              {/* HEIGHT */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Height (cm)
                </label>

                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="180"
                  min="100"
                  max="250"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-black"
                />
              </div>

              {/* WEIGHT */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (kg)
                </label>

                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="80"
                  min="30"
                  max="300"
                  step="0.1"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-black"
                />
              </div>

            </div>
          </section>

          {/* GOALS */}

          <section className="mt-12">
            <h2 className="text-2xl font-semibold text-black">
              Your Goal
            </h2>

            <p className="text-gray-500 mt-1 mb-6">
              What would you primarily like to achieve?
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Goal
                </label>

                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-black bg-white"
                >
                  <option value="">Select your goal</option>

                  <option value="lose_weight">
                    Lose Weight
                  </option>

                  <option value="build_muscle">
                    Build Muscle
                  </option>

                  <option value="maintain_weight">
                    Maintain Weight
                  </option>

                  <option value="improve_fitness">
                    Improve Fitness
                  </option>

                  <option value="general_wellness">
                    General Wellness
                  </option>
                </select>
              </div>

              {/* ACTIVITY */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Activity Level
                </label>

                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-black bg-white"
                >
                  <option value="">
                    Select activity level
                  </option>

                  <option value="sedentary">
                    Mostly Sedentary
                  </option>

                  <option value="light">
                    Lightly Active
                  </option>

                  <option value="moderate">
                    Moderately Active
                  </option>

                  <option value="very_active">
                    Very Active
                  </option>
                </select>
              </div>

            </div>
          </section>

          {/* WORKOUT */}

          <section className="mt-12">
            <h2 className="text-2xl font-semibold text-black">
              Fitness
            </h2>

            <p className="text-gray-500 mt-1 mb-6">
              Tell us how much time you can realistically dedicate
              to exercise.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workout Days Per Week
                </label>

                <select
                  value={workoutDays}
                  onChange={(e) => setWorkoutDays(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-black bg-white"
                >
                  <option value="">Select</option>
                  <option value="1">1 day</option>
                  <option value="2">2 days</option>
                  <option value="3">3 days</option>
                  <option value="4">4 days</option>
                  <option value="5">5 days</option>
                  <option value="6">6 days</option>
                  <option value="7">7 days</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workout Duration
                </label>

                <input
                  type="number"
                  value={workoutDuration}
                  onChange={(e) =>
                    setWorkoutDuration(e.target.value)
                  }
                  placeholder="60"
                  min="10"
                  max="180"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-black"
                />

                <p className="text-xs text-gray-400 mt-1">
                  Minutes per workout
                </p>
              </div>

            </div>
          </section>

          {/* NUTRITION */}

          <section className="mt-12">
            <h2 className="text-2xl font-semibold text-black">
              Nutrition
            </h2>

            <p className="text-gray-500 mt-1 mb-6">
              This information will help personalize your future
              nutrition plan.
            </p>

            <div className="space-y-5">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diet Preference
                </label>

                <select
                  value={dietPreference}
                  onChange={(e) =>
                    setDietPreference(e.target.value)
                  }
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-black bg-white"
                >
                  <option value="">Select</option>

                  <option value="no_preference">
                    No Specific Preference
                  </option>

                  <option value="vegetarian">
                    Vegetarian
                  </option>

                  <option value="vegan">
                    Vegan
                  </option>

                  <option value="pescatarian">
                    Pescatarian
                  </option>

                  <option value="high_protein">
                    High Protein
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Foods You Enjoy
                </label>

                <textarea
                  value={favoriteFoods}
                  onChange={(e) =>
                    setFavoriteFoods(e.target.value)
                  }
                  placeholder="Chicken, fish, rice, avocado, eggs..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Foods You Avoid
                </label>

                <textarea
                  value={avoidedFoods}
                  onChange={(e) =>
                    setAvoidedFoods(e.target.value)
                  }
                  placeholder="Foods you dislike or prefer not to eat..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Food Allergies
                </label>

                <textarea
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="Enter allergies, or leave blank if none"
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-black"
                />
              </div>

            </div>
          </section>

          {/* SLEEP */}

          <section className="mt-12">
            <h2 className="text-2xl font-semibold text-black">
              Sleep
            </h2>

            <p className="text-gray-500 mt-1 mb-6">
              Your sleep schedule can influence your daily wellness
              plan.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Typical Sleep Time
                </label>

                <input
                  type="time"
                  value={sleepTime}
                  onChange={(e) => setSleepTime(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Typical Wake-up Time
                </label>

                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-black"
                />
              </div>

            </div>
          </section>

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={saving}
            className="mt-12 w-full bg-black text-white rounded-xl px-6 py-4 font-semibold text-lg hover:bg-gray-800 disabled:opacity-50"
          >
            {saving
              ? "Saving your profile..."
              : "Complete Setup"}
          </button>

          {message && (
            <p className="mt-5 text-center text-sm text-gray-600">
              {message}
            </p>
          )}

        </form>

      </div>
    </main>
  );
}