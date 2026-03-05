"use client";

import { useAuth } from "../components/AuthProvider";

export function useUser() {
  const { user, promptsRemaining, isLoading, refreshProfile } = useAuth();
  return {
    user,
    promptsRemaining,
    hasPrompts: promptsRemaining > 0,
    isLoading,
    isLoggedIn: !!user,
    refreshProfile,
  };
}
