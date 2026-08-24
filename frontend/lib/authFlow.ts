import type { User } from "@supabase/supabase-js";

import { supabase } from "./supabase";


// =========================================================
// TYPES
// =========================================================

export type UserFlowState = {
  user: User | null;
  hasProfile: boolean;
};


// =========================================================
// GET USER FLOW STATE
// =========================================================

export async function getUserFlowState(): Promise<UserFlowState> {

  // =====================================================
  // GET CURRENT AUTHENTICATED USER
  // =====================================================

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

    return {
      user: null,
      hasProfile: false,
    };

  }


  // =====================================================
  // CHECK WHETHER ONBOARDING PROFILE EXISTS
  // =====================================================

  const {
    data:
      profile,
    error:
      profileError
  } =
    await supabase

      .from(
        "profiles"
      )

      .select(
        "id"
      )

      .eq(
        "id",
        user.id
      )

      .maybeSingle();


  if (
    profileError
  ) {

    console.error(
      "Profile flow check error:",
      profileError
    );

    throw new Error(
      "Could not check your profile."
    );

  }


  return {

    user,

    hasProfile:
      Boolean(
        profile
      ),

  };

}