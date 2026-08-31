"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  useRouter
} from "next/navigation";

import AppSidebar from "../../components/AppSidebar";

import {
  supabase
} from "../../lib/supabase";


// =========================================================
// PROFILE PAGE
// =========================================================

export default function ProfilePage() {

  const router =
    useRouter();


  // =====================================================
  // BASIC INFORMATION
  // =====================================================

  const [
    fullName,
    setFullName
  ] = useState("");


  const [
    age,
    setAge
  ] = useState("");


  const [
    gender,
    setGender
  ] = useState("");


  const [
    height,
    setHeight
  ] = useState("");


  const [
    weight,
    setWeight
  ] = useState("");


  // =====================================================
  // GOALS
  // =====================================================

  const [
    goal,
    setGoal
  ] = useState("");


  const [
    activityLevel,
    setActivityLevel
  ] = useState("");


  // =====================================================
  // FITNESS
  // =====================================================

  const [
    workoutDays,
    setWorkoutDays
  ] = useState("");


  const [
    workoutDuration,
    setWorkoutDuration
  ] = useState("");


  // =====================================================
  // NUTRITION
  // =====================================================

  const [
    dietPreference,
    setDietPreference
  ] = useState("");


  const [
    favoriteFoods,
    setFavoriteFoods
  ] = useState("");


  const [
    avoidedFoods,
    setAvoidedFoods
  ] = useState("");


  const [
    allergies,
    setAllergies
  ] = useState("");


  // =====================================================
  // SLEEP
  // =====================================================

  const [
    sleepTime,
    setSleepTime
  ] = useState("");


  const [
    wakeTime,
    setWakeTime
  ] = useState("");


  // =====================================================
  // PAGE STATE
  // =====================================================

  const [
    loading,
    setLoading
  ] = useState(true);


  const [
    saving,
    setSaving
  ] = useState(false);


  const [
    message,
    setMessage
  ] = useState("");


  const [
    errorMessage,
    setErrorMessage
  ] = useState("");


  // =====================================================
  // LOAD PROFILE
  // =====================================================

  useEffect(() => {

    async function loadProfile() {

      setLoading(true);

      setErrorMessage("");

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

          router.replace(
            "/login"
          );

          return;

        }


        const {
          data:
            profile,
          error
        } =
          await supabase
            .from(
              "profiles"
            )
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
              diet_preference,
              favorite_foods,
              avoided_foods,
              allergies,
              sleep_time,
              wake_time
              `
            )
            .eq(
              "id",
              user.id
            )
            .single();


        if (
          error ||
          !profile
        ) {

          throw new Error(
            error?.message ||
            "Could not load your profile."
          );

        }


        setFullName(
          profile.full_name ??
          ""
        );

        setAge(
          profile.age !== null
            ? String(
                profile.age
              )
            : ""
        );

        setGender(
          profile.gender ??
          ""
        );

        setHeight(
          profile.height_cm !== null
            ? String(
                profile.height_cm
              )
            : ""
        );

        setWeight(
          profile.weight_kg !== null
            ? String(
                profile.weight_kg
              )
            : ""
        );

        setGoal(
          profile.goal ??
          ""
        );

        setActivityLevel(
          profile.activity_level ??
          ""
        );

        setWorkoutDays(
          profile.workout_days !== null
            ? String(
                profile.workout_days
              )
            : ""
        );

        setWorkoutDuration(
          profile.workout_duration !== null
            ? String(
                profile.workout_duration
              )
            : ""
        );

        setDietPreference(
          profile.diet_preference ??
          ""
        );

        setFavoriteFoods(
          profile.favorite_foods ??
          ""
        );

        setAvoidedFoods(
          profile.avoided_foods ??
          ""
        );

        setAllergies(
          profile.allergies ??
          ""
        );

        setSleepTime(
          profile.sleep_time ??
          ""
        );

        setWakeTime(
          profile.wake_time ??
          ""
        );


      } catch (
        error
      ) {

        console.error(
          "Profile load error:",
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
            "Could not load your profile."
          );

        }

      }

      finally {

        setLoading(false);

      }

    }


    loadProfile();

  }, [
    router
  ]);


  // =====================================================
  // SAVE PROFILE
  // =====================================================

  async function handleSave(
    event:
      FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();

    setSaving(true);

    setMessage("");

    setErrorMessage("");


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


      const {
        error
      } =
        await supabase
          .from(
            "profiles"
          )
          .update({

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

          })

          .eq(
            "id",
            user.id
          );


      if (
        error
      ) {

        throw error;

      }


      setMessage(
        "Profile updated successfully."
      );


    } catch (
      error
    ) {

      console.error(
        "Profile update error:",
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
          "Could not update your profile."
        );

      }

    }

    finally {

      setSaving(false);

    }

  }


  // =====================================================
  // LOADING
  // =====================================================

  if (
    loading
  ) {

    return (

      <main className="min-h-screen bg-gray-50 lg:flex">

        <AppSidebar />

        <section className="flex min-w-0 flex-1 items-center justify-center px-4 pb-8 pt-20 sm:px-6 lg:pt-0">

          <p className="text-gray-500">

            Loading your profile...

          </p>

        </section>

      </main>

    );

  }


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <main className="min-h-screen bg-gray-50 lg:flex">

      <AppSidebar />


      <section className="min-w-0 flex-1 px-4 pb-10 pt-20 sm:px-6 lg:p-10">

        <div className="mx-auto w-full max-w-4xl min-w-0">


          {/* HEADER */}

          <p className="text-sm font-semibold text-gray-500">

            YOUR ACCOUNT

          </p>


          <h1 className="mt-2 text-3xl font-bold leading-tight text-black sm:text-4xl">

            Profile

          </h1>


          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">

            Update the information used to personalize your wellness experience.

          </p>


          {/* IMPORTANT NOTE */}

          <div className="mt-8 min-w-0 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 sm:p-5">

            <p className="font-semibold text-yellow-800">

              Plan updates

            </p>

            <p className="mt-1 break-words text-sm leading-6 text-yellow-700">

              Updating your profile changes the information used for future AI guidance.
              Existing nutrition and workout plans stay unchanged until you generate a new plan.

            </p>

          </div>


          {/* FORM */}

          <form

            onSubmit={
              handleSave
            }

            className="mt-8 min-w-0 rounded-2xl border border-gray-200 bg-white p-5 sm:p-8"

          >


            {/* BASIC */}

            <section>

              <h2 className="text-xl font-semibold text-black sm:text-2xl">

                Basic Information

              </h2>


              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">


                <InputField
                  label="Full Name"
                  type="text"
                  value={fullName}
                  onChange={setFullName}
                  required
                />


                <InputField
                  label="Age"
                  type="number"
                  value={age}
                  onChange={setAge}
                  min="13"
                  max="100"
                  required
                />


                <SelectField

                  label="Gender"

                  value={gender}

                  onChange={setGender}

                  options={[
                    ["", "Select gender"],
                    ["male", "Male"],
                    ["female", "Female"],
                    ["non_binary", "Non-binary"],
                    ["prefer_not_to_say", "Prefer not to say"],
                  ]}

                  required

                />


                <InputField
                  label="Height (cm)"
                  type="number"
                  value={height}
                  onChange={setHeight}
                  min="100"
                  max="250"
                  required
                />


                <InputField
                  label="Weight (kg)"
                  type="number"
                  value={weight}
                  onChange={setWeight}
                  min="30"
                  max="300"
                  step="0.1"
                  required
                />


              </div>

            </section>


            {/* GOAL */}

            <section className="mt-12">

              <h2 className="text-xl font-semibold text-black sm:text-2xl">

                Goals

              </h2>


              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">


                <SelectField

                  label="Primary Goal"

                  value={goal}

                  onChange={setGoal}

                  options={[
                    ["", "Select goal"],
                    ["lose_weight", "Lose Weight"],
                    ["build_muscle", "Build Muscle"],
                    ["maintain_weight", "Maintain Weight"],
                    ["improve_fitness", "Improve Fitness"],
                    ["general_wellness", "General Wellness"],
                  ]}

                  required

                />


                <SelectField

                  label="Activity Level"

                  value={activityLevel}

                  onChange={setActivityLevel}

                  options={[
                    ["", "Select activity level"],
                    ["sedentary", "Mostly Sedentary"],
                    ["light", "Lightly Active"],
                    ["moderate", "Moderately Active"],
                    ["very_active", "Very Active"],
                  ]}

                  required

                />


              </div>

            </section>


            {/* FITNESS */}

            <section className="mt-12">

              <h2 className="text-xl font-semibold text-black sm:text-2xl">

                Fitness

              </h2>


              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">


                <SelectField

                  label="Workout Days Per Week"

                  value={workoutDays}

                  onChange={setWorkoutDays}

                  options={[
                    ["", "Select"],
                    ["1", "1 day"],
                    ["2", "2 days"],
                    ["3", "3 days"],
                    ["4", "4 days"],
                    ["5", "5 days"],
                    ["6", "6 days"],
                    ["7", "7 days"],
                  ]}

                  required

                />


                <InputField
                  label="Workout Duration (minutes)"
                  type="number"
                  value={workoutDuration}
                  onChange={setWorkoutDuration}
                  min="10"
                  max="180"
                  required
                />


              </div>

            </section>


            {/* NUTRITION */}

            <section className="mt-12">

              <h2 className="text-xl font-semibold text-black sm:text-2xl">

                Nutrition

              </h2>


              <div className="mt-6 min-w-0 space-y-5">


                <SelectField

                  label="Diet Preference"

                  value={dietPreference}

                  onChange={setDietPreference}

                  options={[
                    ["", "Select"],
                    ["no_preference", "No Specific Preference"],
                    ["vegetarian", "Vegetarian"],
                    ["vegan", "Vegan"],
                    ["pescatarian", "Pescatarian"],
                    ["high_protein", "High Protein"],
                  ]}

                  required

                />


                <TextAreaField
                  label="Foods You Enjoy"
                  value={favoriteFoods}
                  onChange={setFavoriteFoods}
                />


                <TextAreaField
                  label="Foods You Avoid"
                  value={avoidedFoods}
                  onChange={setAvoidedFoods}
                />


                <TextAreaField
                  label="Food Allergies"
                  value={allergies}
                  onChange={setAllergies}
                />


              </div>

            </section>


            {/* SLEEP */}

            <section className="mt-12">

              <h2 className="text-xl font-semibold text-black sm:text-2xl">

                Sleep

              </h2>


              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">


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


            {/* SAVE */}

            <button

              type="submit"

              disabled={
                saving
              }

              className="
                mt-10
                w-full
                rounded-xl
                bg-black
                px-8
                py-4
                font-semibold
                text-white
                hover:bg-gray-800
                disabled:cursor-not-allowed
                disabled:bg-gray-400
                cursor-pointer
                sm:mt-12
                sm:w-auto
              "

            >

              {
                saving
                  ? "Saving..."
                  : "Save Profile Changes"
              }

            </button>


            {
              message && (

                <div className="mt-5 min-w-0 rounded-xl border border-green-200 bg-green-50 p-4">

                  <p className="break-words text-green-700">

                    ✓ {
                      message
                    }

                  </p>

                </div>

              )
            }


            {
              errorMessage && (

                <div className="mt-5 min-w-0 rounded-xl border border-red-200 bg-red-50 p-4">

                  <p className="break-words text-red-700">

                    {
                      errorMessage
                    }

                  </p>

                </div>

              )
            }


          </form>


        </div>

      </section>

    </main>

  );

}


// =========================================================
// INPUT
// =========================================================

function InputField({

  label,
  type,
  value,
  onChange,
  min,
  max,
  step,
  required,

}: {

  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  step?: string;
  required?: boolean;

}) {

  return (

    <div className="min-w-0">

      <label className="block text-sm font-medium text-gray-700 mb-2">

        {label}

      </label>


      <input

        type={type}

        value={value}

        onChange={
          event =>
            onChange(
              event.target.value
            )
        }

        min={min}

        max={max}

        step={step}

        required={required}

        className="
          block
          w-full
          min-w-0
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
// SELECT
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
  onChange: (value: string) => void;
  options: [string, string][];
  required?: boolean;

}) {

  return (

    <div className="min-w-0">

      <label className="block text-sm font-medium text-gray-700 mb-2">

        {label}

      </label>


      <select

        value={value}

        onChange={
          event =>
            onChange(
              event.target.value
            )
        }

        required={required}

        className="
          block
          w-full
          min-w-0
          border
          border-gray-300
          rounded-xl
          px-4
          py-3
          text-black
          bg-white
        "

      >

        {
          options.map(
            (
              [
                optionValue,
                optionLabel
              ]
            ) => (

              <option
                key={
                  `${optionValue}-${optionLabel}`
                }
                value={optionValue}
              >

                {optionLabel}

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

}: {

  label: string;
  value: string;
  onChange: (value: string) => void;

}) {

  return (

    <div className="min-w-0">

      <label className="block text-sm font-medium text-gray-700 mb-2">

        {label}

      </label>


      <textarea

        value={value}

        onChange={
          event =>
            onChange(
              event.target.value
            )
        }

        rows={3}

        className="
          block
          w-full
          min-w-0
          border
          border-gray-300
          rounded-xl
          px-4
          py-3
          text-black
        "

      />

    </div>

  );

}