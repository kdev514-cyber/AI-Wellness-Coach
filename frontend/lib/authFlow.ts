import { supabase } from "./supabase";


// =========================================================
// TYPES
// =========================================================

export type AuthFlowResult = {
  userId: string | null;
  isLoggedIn: boolean;
  hasProfile: boolean;
};


// =========================================================
// GET AUTH FLOW STATUS
// =========================================================

export async function getAuthFlowStatus(): Promise<AuthFlowResult> {

  try {

    // =====================================================
    // GET CURRENT USER
    // =====================================================

    const {
      data: {
        user,
      },
      error: userError,
    } = await supabase.auth.getUser();


    // =====================================================
    // AUTH ERROR
    // =====================================================

    if (userError) {

      console.log(
        "Auth flow user error message:",
        userError.message
      );

      return {
        userId: null,
        isLoggedIn: false,
        hasProfile: false,
      };

    }


    // =====================================================
    // NO USER
    // =====================================================

    if (!user) {

      return {
        userId: null,
        isLoggedIn: false,
        hasProfile: false,
      };

    }


    // =====================================================
    // CHECK WHETHER PROFILE EXISTS
    // =====================================================

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();


    // =====================================================
    // PROFILE QUERY ERROR
    // =====================================================

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
        userId: user.id,
        isLoggedIn: true,
        hasProfile: false,
      };

    }


    // =====================================================
    // PROFILE EXISTS
    // =====================================================

    if (profile) {

      return {
        userId: user.id,
        isLoggedIn: true,
        hasProfile: true,
      };

    }


    // =====================================================
    // USER EXISTS BUT PROFILE DOES NOT
    // =====================================================

    return {
      userId: user.id,
      isLoggedIn: true,
      hasProfile: false,
    };


  } catch (error) {

    // =====================================================
    // UNEXPECTED ERROR
    // =====================================================

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
      userId: null,
      isLoggedIn: false,
      hasProfile: false,
    };

  }

}


// =========================================================
// CHECK IF USER IS LOGGED IN
// =========================================================

export async function isUserLoggedIn(): Promise<boolean> {

  const result =
    await getAuthFlowStatus();


  return result.isLoggedIn;

}


// =========================================================
// CHECK IF USER HAS COMPLETED ONBOARDING
// =========================================================

export async function hasCompletedOnboarding(): Promise<boolean> {

  const result =
    await getAuthFlowStatus();


  return (
    result.isLoggedIn &&
    result.hasProfile
  );

}