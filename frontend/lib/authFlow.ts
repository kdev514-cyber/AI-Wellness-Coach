import { supabase } from "./supabase";


// =========================================================
// TYPES
// =========================================================

export type AuthFlowResult = {
  user: {
    id: string;
  } | null;

  userId: string | null;

  isLoggedIn: boolean;

  hasProfile: boolean;
};


// =========================================================
// MAIN AUTH FLOW CHECK
// =========================================================

export async function getAuthFlowStatus(): Promise<AuthFlowResult> {

  try {

    const {
      data: {
        user,
      },
      error: userError,
    } = await supabase.auth.getUser();


    if (userError) {

      console.log(
        "Auth flow user error message:",
        userError.message
      );


      return {
        user: null,
        userId: null,
        isLoggedIn: false,
        hasProfile: false,
      };

    }


    if (!user) {

      return {
        user: null,
        userId: null,
        isLoggedIn: false,
        hasProfile: false,
      };

    }


    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();


    if (profileError) {

      console.log(
        "Profile flow check message:",
        profileError.message
      );

      console.log(
        "Profile flow check code:",
        profileError.code
      );

      console.log(
        "Profile flow check details:",
        profileError.details
      );

      console.log(
        "Profile flow check hint:",
        profileError.hint
      );


      return {
        user: {
          id: user.id,
        },

        userId: user.id,

        isLoggedIn: true,

        hasProfile: false,
      };

    }


    return {
      user: {
        id: user.id,
      },

      userId: user.id,

      isLoggedIn: true,

      hasProfile: Boolean(profile),
    };


  } catch (error) {

    if (error instanceof Error) {

      console.log(
        "Unexpected auth flow error:",
        error.message
      );

    } else {

      console.log(
        "Unexpected auth flow error:",
        error
      );

    }


    return {
      user: null,
      userId: null,
      isLoggedIn: false,
      hasProfile: false,
    };

  }

}


// =========================================================
// COMPATIBILITY EXPORT
// =========================================================

export async function getUserFlowState(): Promise<AuthFlowResult> {

  return await getAuthFlowStatus();

}


// =========================================================
// LOGGED-IN CHECK
// =========================================================

export async function isUserLoggedIn(): Promise<boolean> {

  const result =
    await getAuthFlowStatus();


  return result.isLoggedIn;

}


// =========================================================
// ONBOARDING CHECK
// =========================================================

export async function hasCompletedOnboarding(): Promise<boolean> {

  const result =
    await getAuthFlowStatus();


  return (
    result.isLoggedIn &&
    result.hasProfile
  );

}