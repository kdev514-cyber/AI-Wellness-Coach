"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  useRouter
} from "next/navigation";

import {
  supabase
} from "../../lib/supabase";


// =========================================================
// ONBOARDING
// =========================================================

export default function OnboardingPage() {

  const router =
    useRouter();


  // =====================================================
  // BASIC INFORMATION
  // =====================================================

  const [
    fullName,
    setFullName
  ] =
    useState(
      ""
    );


  const [
    age,
    setAge
  ] =
    useState(
      ""
    );


  const [
    gender,
    setGender
  ] =
    useState(
      ""
    );


  const [
    height,
    setHeight
  ] =
    useState(
      ""
    );


  const [
    weight,
    setWeight
  ] =
    useState(
      ""
    );


  // =====================================================
  // GOALS
  // =====================================================

  const [
    goal,
    setGoal
  ] =
    useState(
      ""
    );


  const [
    activityLevel,
    setActivityLevel
  ] =
    useState(
      ""
    );


  // =====================================================
  // FITNESS
  // =====================================================

  const [
    workoutDays,
    setWorkoutDays
  ] =
    useState(
      ""
    );


  const [
    workoutDuration,
    setWorkoutDuration
  ] =
    useState(
      ""
    );


  // =====================================================
  // NUTRITION
  // =====================================================

  const [
    dietPreference,
    setDietPreference
  ] =
    useState(
      ""
    );


  const [
    favoriteFoods,
    setFavoriteFoods
  ] =
    useState(
      ""
    );


  const [
    avoidedFoods,
    setAvoidedFoods
  ] =
    useState(
      ""
    );


  const [
    allergies,
    setAllergies
  ] =
    useState(
      ""
    );


  // =====================================================
  // SLEEP
  // =====================================================

  const [
    sleepTime,
    setSleepTime
  ] =
    useState(
      ""
    );


  const [
    wakeTime,
    setWakeTime
  ] =
    useState(
      ""
    );


  // =====================================================
  // PAGE STATE
  // =====================================================

  const [
    checkingUser,
    setCheckingUser
  ] =
    useState(
      true
    );


  const [
    saving,
    setSaving
  ] =
    useState(
      false
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


  // =====================================================
  // VERIFY LOGIN
  // =====================================================

  useEffect(
    () => {

      async function checkUser() {

        const {
          data: {
            user
          }
        } =
          await supabase.auth.getUser();


        if (
          !user
        ) {

          router.replace(
            "/login"
          );

          return;

        }


        setCheckingUser(
          false
        );

      }


      checkUser();

    },

    [
      router
    ]

  );


  // =====================================================
  // SAVE ONBOARDING
  // =====================================================

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();


    setSaving(
      true
    );


    setMessage(
      ""
    );


    setErrorMessage(
      ""
    );


    try {

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

        throw new Error(
          "You must be logged in to complete onboarding."
        );

      }


      // =================================================
      // SAVE PROFILE
      // =================================================

      const {
        error
      } =
        await supabase

          .from(
            "profiles"
          )

          .upsert({

            id:
              user.id,

            full_name:
              fullName.trim(),

            age:
              Number(
                age
              ),

            gender,

            height_cm:
              Number(
                height
              ),

            weight_kg:
              Number(
                weight
              ),

            goal,

            activity_level:
              activityLevel,

            workout_days:
              Number(
                workoutDays
              ),

            workout_duration:
              Number(
                workoutDuration
              ),

            diet_preference:
              dietPreference,

            favorite_foods:
              favoriteFoods.trim(),

            avoided_foods:
              avoidedFoods.trim(),

            allergies:
              allergies.trim(),

            sleep_time:
              sleepTime,

            wake_time:
              wakeTime,

            updated_at:
              new Date()
                .toISOString(),

          });


      if (
        error
      ) {

        console.error(
          "Profile save error:",
          error
        );

        throw error;

      }


      setMessage(
        "Profile saved. Preparing your dashboard..."
      );


      // =================================================
      // GO TO DASHBOARD
      // =================================================

      router.replace(
        "/dashboard"
      );


    }

    catch (
      error
    ) {

      console.error(
        "Onboarding error:",
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
          "Could not save your profile."
        );

      }

    }

    finally {

      setSaving(
        false
      );

    }

  }


  // =====================================================
  // CHECKING USER
  // =====================================================

  if (
    checkingUser
  ) {

    return (

      <main className="min-h-screen bg-gray-50 flex items-center justify-center">

        <p className="text-gray-500">

          Preparing onboarding...

        </p>

      </main>

    );

  }


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <main className="min-h-screen bg-gray-50 py-12 px-6">


      <div className="max-w-3xl mx-auto">


        {/* HEADER */}

        <div className="text-center mb-10">


          <p className="text-sm font-semibold text-gray-400">

            STEP 1 OF 1

          </p>


          <h1 className="text-4xl font-bold text-black mt-2">

            Let&apos;s build your wellness profile

          </h1>


          <p className="mt-3 text-gray-500 max-w-xl mx-auto">

            Your answers will personalize your nutrition plan,
            workout plan, dashboard and AI Coach.

          </p>


        </div>


        {/* FORM */}

        <form

          onSubmit={
            handleSubmit
          }

          className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"

        >


          {/* =================================================
              BASIC INFORMATION
          ================================================= */}

          <section>


            <h2 className="text-2xl font-semibold text-black">

              Basic Information

            </h2>


            <p className="text-gray-500 mt-1 mb-6">

              Tell us a little about yourself.

            </p>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">


              <InputField
                label="Full Name"
                type="text"
                value={fullName}
                onChange={setFullName}
                placeholder="Enter your name"
                required
              />


              <InputField
                label="Age"
                type="number"
                value={age}
                onChange={setAge}
                placeholder="25"
                min="13"
                max="100"
                required
              />


              <SelectField

                label="Gender"

                value={
                  gender
                }

                onChange={
                  setGender
                }

                options={[
                  [
                    "",
                    "Select gender"
                  ],
                  [
                    "male",
                    "Male"
                  ],
                  [
                    "female",
                    "Female"
                  ],
                  [
                    "non_binary",
                    "Non-binary"
                  ],
                  [
                    "prefer_not_to_say",
                    "Prefer not to say"
                  ],
                ]}

                required

              />


              <InputField
                label="Height (cm)"
                type="number"
                value={height}
                onChange={setHeight}
                placeholder="180"
                min="100"
                max="250"
                required
              />


              <InputField
                label="Weight (kg)"
                type="number"
                value={weight}
                onChange={setWeight}
                placeholder="80"
                min="30"
                max="300"
                step="0.1"
                required
              />


            </div>


          </section>


          {/* =================================================
              GOAL
          ================================================= */}

          <section className="mt-12">


            <h2 className="text-2xl font-semibold text-black">

              Your Goal

            </h2>


            <p className="text-gray-500 mt-1 mb-6">

              What would you primarily like to achieve?

            </p>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">


              <SelectField

                label="Primary Goal"

                value={
                  goal
                }

                onChange={
                  setGoal
                }

                options={[
                  [
                    "",
                    "Select your goal"
                  ],
                  [
                    "lose_weight",
                    "Lose Weight"
                  ],
                  [
                    "build_muscle",
                    "Build Muscle"
                  ],
                  [
                    "maintain_weight",
                    "Maintain Weight"
                  ],
                  [
                    "improve_fitness",
                    "Improve Fitness"
                  ],
                  [
                    "general_wellness",
                    "General Wellness"
                  ],
                ]}

                required

              />


              <SelectField

                label="Current Activity Level"

                value={
                  activityLevel
                }

                onChange={
                  setActivityLevel
                }

                options={[
                  [
                    "",
                    "Select activity level"
                  ],
                  [
                    "sedentary",
                    "Mostly Sedentary"
                  ],
                  [
                    "light",
                    "Lightly Active"
                  ],
                  [
                    "moderate",
                    "Moderately Active"
                  ],
                  [
                    "very_active",
                    "Very Active"
                  ],
                ]}

                required

              />


            </div>


          </section>


          {/* =================================================
              FITNESS
          ================================================= */}

          <section className="mt-12">


            <h2 className="text-2xl font-semibold text-black">

              Fitness

            </h2>


            <p className="text-gray-500 mt-1 mb-6">

              Tell us how much time you can realistically dedicate to exercise.

            </p>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">


              <SelectField

                label="Workout Days Per Week"

                value={
                  workoutDays
                }

                onChange={
                  setWorkoutDays
                }

                options={[
                  [
                    "",
                    "Select"
                  ],
                  [
                    "1",
                    "1 day"
                  ],
                  [
                    "2",
                    "2 days"
                  ],
                  [
                    "3",
                    "3 days"
                  ],
                  [
                    "4",
                    "4 days"
                  ],
                  [
                    "5",
                    "5 days"
                  ],
                  [
                    "6",
                    "6 days"
                  ],
                  [
                    "7",
                    "7 days"
                  ],
                ]}

                required

              />


              <InputField
                label="Workout Duration (minutes)"
                type="number"
                value={workoutDuration}
                onChange={setWorkoutDuration}
                placeholder="60"
                min="10"
                max="180"
                required
              />


            </div>


          </section>


          {/* =================================================
              NUTRITION
          ================================================= */}

          <section className="mt-12">


            <h2 className="text-2xl font-semibold text-black">

              Nutrition

            </h2>


            <p className="text-gray-500 mt-1 mb-6">

              These preferences will be used when generating your nutrition plan.

            </p>


            <div className="space-y-5">


              <SelectField

                label="Diet Preference"

                value={
                  dietPreference
                }

                onChange={
                  setDietPreference
                }

                options={[
                  [
                    "",
                    "Select"
                  ],
                  [
                    "no_preference",
                    "No Specific Preference"
                  ],
                  [
                    "vegetarian",
                    "Vegetarian"
                  ],
                  [
                    "vegan",
                    "Vegan"
                  ],
                  [
                    "pescatarian",
                    "Pescatarian"
                  ],
                  [
                    "high_protein",
                    "High Protein"
                  ],
                ]}

                required

              />


              <TextAreaField
                label="Foods You Enjoy"
                value={favoriteFoods}
                onChange={setFavoriteFoods}
                placeholder="Chicken, fish, rice, avocado, eggs..."
              />


              <TextAreaField
                label="Foods You Avoid"
                value={avoidedFoods}
                onChange={setAvoidedFoods}
                placeholder="Foods you dislike or prefer not to eat..."
              />


              <TextAreaField
                label="Food Allergies"
                value={allergies}
                onChange={setAllergies}
                placeholder="Enter allergies, or leave blank if none"
              />


            </div>


          </section>


          {/* =================================================
              SLEEP
          ================================================= */}

          <section className="mt-12">


            <h2 className="text-2xl font-semibold text-black">

              Sleep

            </h2>


            <p className="text-gray-500 mt-1 mb-6">

              Your normal schedule helps the Coach understand your routine.

            </p>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">


              <InputField
                label="Typical Sleep Time"
                type="time"
                value={sleepTime}
                onChange={setSleepTime}
                required
              />


              <InputField
                label="Typical Wake-up Time"
                type="time"
                value={wakeTime}
                onChange={setWakeTime}
                required
              />


            </div>


          </section>


          {/* =================================================
              SAVE
          ================================================= */}

          <button

            type="submit"

            disabled={
              saving
            }

            className="
              mt-12
              w-full
              bg-black
              text-white
              rounded-xl
              px-6
              py-4
              font-semibold
              text-lg
              hover:bg-gray-800
              disabled:opacity-50
              disabled:cursor-not-allowed
              cursor-pointer
            "

          >

            {
              saving

                ? "Creating your wellness profile..."

                : "Complete Setup"
            }

          </button>


          {
            message && (

              <div className="mt-5 bg-green-50 border border-green-200 rounded-xl p-4">

                <p className="text-green-700 text-sm">

                  {
                    message
                  }

                </p>

              </div>

            )
          }


          {
            errorMessage && (

              <div className="mt-5 bg-red-50 border border-red-200 rounded-xl p-4">

                <p className="text-red-700 text-sm">

                  {
                    errorMessage
                  }

                </p>

              </div>

            )
          }


        </form>


      </div>


    </main>

  );

}


// =========================================================
// INPUT FIELD
// =========================================================

function InputField({

  label,

  type,

  value,

  onChange,

  placeholder,

  min,

  max,

  step,

  required,

}: {

  label: string;

  type: string;

  value: string;

  onChange:
    (
      value: string
    ) =>
      void;

  placeholder?: string;

  min?: string;

  max?: string;

  step?: string;

  required?: boolean;

}) {

  return (

    <div>


      <label className="block text-sm font-medium text-gray-700 mb-2">

        {
          label
        }

      </label>


      <input

        type={
          type
        }

        value={
          value
        }

        onChange={
          event =>
            onChange(
              event.target.value
            )
        }

        placeholder={
          placeholder
        }

        min={
          min
        }

        max={
          max
        }

        step={
          step
        }

        required={
          required
        }

        className="
          w-full
          border
          border-gray-300
          rounded-xl
          px-4
          py-3
          text-black
          outline-none
          focus:ring-2
          focus:ring-black
        "

      />


    </div>

  );

}


// =========================================================
// SELECT FIELD
// =========================================================

function SelectField({

  label,

  value,

  onChange,

  options,

  required,

}: {

  label: string;

  value: string;

  onChange:
    (
      value: string
    ) =>
      void;

  options:
    [
      string,
      string
    ][];

  required?: boolean;

}) {

  return (

    <div>


      <label className="block text-sm font-medium text-gray-700 mb-2">

        {
          label
        }

      </label>


      <select

        value={
          value
        }

        onChange={
          event =>
            onChange(
              event.target.value
            )
        }

        required={
          required
        }

        className="
          w-full
          border
          border-gray-300
          rounded-xl
          px-4
          py-3
          text-black
          bg-white
          outline-none
          focus:ring-2
          focus:ring-black
        "

      >

        {
          options.map(
            (
              [
                optionValue,
                label
              ]
            ) => (

              <option
                key={
                  `${optionValue}-${label}`
                }
                value={
                  optionValue
                }
              >

                {
                  label
                }

              </option>

            )
          )
        }

      </select>


    </div>

  );

}


// =========================================================
// TEXTAREA
// =========================================================

function TextAreaField({

  label,

  value,

  onChange,

  placeholder,

}: {

  label: string;

  value: string;

  onChange:
    (
      value: string
    ) =>
      void;

  placeholder: string;

}) {

  return (

    <div>


      <label className="block text-sm font-medium text-gray-700 mb-2">

        {
          label
        }

      </label>


      <textarea

        value={
          value
        }

        onChange={
          event =>
            onChange(
              event.target.value
            )
        }

        placeholder={
          placeholder
        }

        rows={
          3
        }

        className="
          w-full
          border
          border-gray-300
          rounded-xl
          px-4
          py-3
          text-black
          outline-none
          focus:ring-2
          focus:ring-black
        "

      />


    </div>

  );

}