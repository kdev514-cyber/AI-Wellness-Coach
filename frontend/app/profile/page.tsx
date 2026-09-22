"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  CheckCircle2,
  Dumbbell,
  Info,
  Moon,
  Salad,
  Save,
  Sparkles,
  UserRound,
} from "lucide-react";

import AppSidebar from "../../components/AppSidebar";
import { supabase } from "../../lib/supabase";

export default function ProfilePage() {
  const router = useRouter();

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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setErrorMessage("");

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          router.replace("/login");
          return;
        }

        const { data: profile, error } = await supabase
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
            diet_preference,
            favorite_foods,
            avoided_foods,
            allergies,
            sleep_time,
            wake_time
            `
          )
          .eq("id", user.id)
          .single();

        if (error || !profile) {
          throw new Error(error?.message || "Could not load your profile.");
        }

        setFullName(profile.full_name ?? "");
        setAge(profile.age !== null ? String(profile.age) : "");
        setGender(profile.gender ?? "");
        setHeight(profile.height_cm !== null ? String(profile.height_cm) : "");
        setWeight(profile.weight_kg !== null ? String(profile.weight_kg) : "");
        setGoal(profile.goal ?? "");
        setActivityLevel(profile.activity_level ?? "");
        setWorkoutDays(
          profile.workout_days !== null ? String(profile.workout_days) : ""
        );
        setWorkoutDuration(
          profile.workout_duration !== null
            ? String(profile.workout_duration)
            : ""
        );
        setDietPreference(profile.diet_preference ?? "");
        setFavoriteFoods(profile.favorite_foods ?? "");
        setAvoidedFoods(profile.avoided_foods ?? "");
        setAllergies(profile.allergies ?? "");
        setSleepTime(profile.sleep_time ?? "");
        setWakeTime(profile.wake_time ?? "");
      } catch (error) {
        console.error("Profile load error:", error);
        setErrorMessage(
          error instanceof Error ? error.message : "Could not load your profile."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setErrorMessage("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("You must be logged in.");
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          age: Number(age),
          gender,
          height_cm: Number(height),
          weight_kg: Number(weight),
          goal,
          activity_level: activityLevel,
          workout_days: Number(workoutDays),
          workout_duration: Number(workoutDuration),
          diet_preference: dietPreference,
          favorite_foods: favoriteFoods.trim(),
          avoided_foods: avoidedFoods.trim(),
          allergies: allergies.trim(),
          sleep_time: sleepTime,
          wake_time: wakeTime,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;
      setMessage("Profile updated successfully.");
    } catch (error) {
      console.error("Profile update error:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Could not update your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f4f8f5] lg:flex">
        <AppSidebar />
        <section className="flex min-w-0 flex-1 items-center justify-center px-6 pt-20 lg:pt-0">
          <div className="rounded-2xl border border-emerald-100 bg-white px-6 py-5 text-sm text-slate-600 shadow-sm">
            Loading your wellness profile...
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f8f5] lg:flex">
      <AppSidebar />

      <section className="min-w-0 flex-1 px-4 pb-12 pt-20 sm:px-6 lg:p-10">
        <div className="mx-auto w-full max-w-5xl">
          <p className="text-sm font-semibold tracking-wide text-[#58708f]">
            YOUR WELLNESS PROFILE
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">
            Profile
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Keep the details that personalize your Daily Ally experience up to date.
          </p>

          <div className="mt-8 rounded-[26px] bg-[#07875f] p-6 text-white shadow-sm sm:p-7">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-bold">Your profile powers personalization</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-emerald-50">
                  Changes here are used for future AI guidance. Your existing
                  nutrition and workout plans stay unchanged until you generate
                  new ones.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="mt-6 space-y-5">
            <ProfileSection
              icon={<UserRound className="h-5 w-5" />}
              eyebrow="About you"
              title="Basic Information"
              description="The essentials Daily Ally uses to understand your profile."
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <InputField label="Full Name" type="text" value={fullName} onChange={setFullName} required />
                <InputField label="Age" type="number" value={age} onChange={setAge} min="13" max="100" required />
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
                <InputField label="Height (cm)" type="number" value={height} onChange={setHeight} min="100" max="250" required />
                <InputField label="Weight (kg)" type="number" value={weight} onChange={setWeight} min="30" max="300" step="0.1" required />
              </div>
            </ProfileSection>

            <ProfileSection
              icon={<Activity className="h-5 w-5" />}
              eyebrow="Direction"
              title="Goals & Activity"
              description="Tell Daily Ally what you are working toward and how active your days are."
            >
              <div className="grid gap-5 sm:grid-cols-2">
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
            </ProfileSection>

            <ProfileSection
              icon={<Dumbbell className="h-5 w-5" />}
              eyebrow="Movement"
              title="Fitness"
              description="Set the weekly training rhythm used when creating workout plans."
            >
              <div className="grid gap-5 sm:grid-cols-2">
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
            </ProfileSection>

            <ProfileSection
              icon={<Salad className="h-5 w-5" />}
              eyebrow="Fuel"
              title="Nutrition"
              description="Keep your food preferences and restrictions together in one place."
            >
              <div className="space-y-5">
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
                <div className="grid gap-5 sm:grid-cols-2">
                  <TextAreaField label="Foods You Enjoy" value={favoriteFoods} onChange={setFavoriteFoods} />
                  <TextAreaField label="Foods You Avoid" value={avoidedFoods} onChange={setAvoidedFoods} />
                </div>
                <TextAreaField label="Food Allergies" value={allergies} onChange={setAllergies} />
              </div>
            </ProfileSection>

            <ProfileSection
              icon={<Moon className="h-5 w-5" />}
              eyebrow="Recovery"
              title="Sleep"
              description="Your typical sleep schedule helps Daily Ally understand your recovery routine."
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <InputField label="Typical Sleep Time" type="time" value={sleepTime} onChange={setSleepTime} required />
                <InputField label="Typical Wake-up Time" type="time" value={wakeTime} onChange={setWakeTime} required />
              </div>
            </ProfileSection>

            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:flex sm:items-center sm:justify-between sm:gap-5">
              <div className="flex gap-3">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#07875f]" />
                <p className="text-sm leading-6 text-slate-500">
                  Save your changes before generating new plans or asking Nalamera
                  to use your updated preferences.
                </p>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#07875f] px-6 py-3 font-semibold text-white transition hover:bg-[#066f4f] disabled:cursor-not-allowed disabled:bg-slate-300 sm:mt-0 sm:w-auto"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>

            {message && (
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                {message}
              </div>
            )}

            {errorMessage && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {errorMessage}
              </div>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}

function ProfileSection({
  icon,
  eyebrow,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e9f6ee] text-[#07875f]">
          {icon}
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#07875f]">
            {eyebrow}
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

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
      <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        min={min}
        max={max}
        step={step}
        required={required}
        className="block w-full min-w-0 rounded-xl border border-slate-200 bg-[#fbfcfb] px-4 py-3 text-slate-950 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
      />
    </div>
  );
}

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
      <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="block w-full min-w-0 rounded-xl border border-slate-200 bg-[#fbfcfb] px-4 py-3 text-slate-950 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={`${optionValue}-${optionLabel}`} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </div>
  );
}

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
      <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        className="block w-full min-w-0 resize-none rounded-xl border border-slate-200 bg-[#fbfcfb] px-4 py-3 text-slate-950 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
      />
    </div>
  );
}
