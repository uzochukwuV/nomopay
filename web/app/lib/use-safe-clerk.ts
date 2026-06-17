"use client";

import { useAuth, useClerk, useSignIn, useSignUp, useUser } from "@clerk/nextjs";

function isMissingProviderError(error: unknown) {
  return (
    error instanceof Error &&
    error.message.includes("can only be used within the <ClerkProvider />")
  );
}

export function useSafeAuth() {
  try {
    return useAuth();
  } catch (error) {
    if (!isMissingProviderError(error)) throw error;

    return {
      getToken: async () => null,
      isLoaded: true,
      isSignedIn: false,
      sessionId: null,
      userId: null,
      orgId: null,
      orgRole: null,
      orgSlug: null,
      actor: null,
      sessionClaims: null,
      has: () => false,
      signOut: async () => undefined,
    };
  }
}

export function useSafeUser() {
  try {
    return useUser();
  } catch (error) {
    if (!isMissingProviderError(error)) throw error;

    return {
      isLoaded: true,
      isSignedIn: false,
      user: null,
    };
  }
}

export function useSafeClerk() {
  try {
    return useClerk();
  } catch (error) {
    if (!isMissingProviderError(error)) throw error;

    return {
      setActive: async () => undefined,
    };
  }
}

export function useSafeSignIn() {
  try {
    return useSignIn();
  } catch (error) {
    if (!isMissingProviderError(error)) throw error;

    return {
      isLoaded: true,
      signIn: null,
      setActive: async () => undefined,
    };
  }
}

export function useSafeSignUp() {
  try {
    return useSignUp();
  } catch (error) {
    if (!isMissingProviderError(error)) throw error;

    return {
      isLoaded: true,
      signUp: null,
      setActive: async () => undefined,
    };
  }
}
