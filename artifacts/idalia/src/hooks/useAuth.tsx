import { ReactNode, useMemo } from "react";
// @ts-ignore
import { useUser, useClerk, SignedIn, SignedOut } from "@clerk/clerk-react";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useAuth() {
  // @ts-ignore
  const { isLoaded, isSignedIn, user } = useUser();
  // @ts-ignore
  const { signOut: clerkSignOut } = useClerk();

  const id = isSignedIn && user ? (user.id as string) : null;
  const email =
    isSignedIn && user
      ? user.primaryEmailAddress?.emailAddress ?? user.emailAddresses?.[0]?.emailAddress ?? ""
      : "";
  const fullName =
    isSignedIn && user
      ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || ""
      : "";

  // Memoize on PRIMITIVE fields so the returned object keeps a stable reference
  // across renders. Returning a fresh object literal each render makes every
  // downstream useEffect/useCallback keyed on `user` re-fire on every render,
  // which produced a fetch -> setState -> re-render -> refetch storm in
  // useSubscription and useIsAdmin (continuous /subscription + /me/is-admin hits).
  const authUser: AuthUser | null = useMemo(
    () => (id ? { id, email, fullName } : null),
    [id, email, fullName],
  );

  return {
    user: authUser,
    session: isSignedIn ? { access_token: "clerk" } : null,
    loading: !isLoaded,
    signOut: async () => {
      await clerkSignOut({ redirectUrl: import.meta.env.BASE_URL });
    },
    // For legacy callers - Clerk handles sign-up/sign-in via pages
    signIn: async (_email: string, _password: string) => ({ error: new Error("Use Clerk SignIn component") }),
    signUp: async (_email: string, _password: string, _fullName: string) => ({ error: new Error("Use Clerk SignUp component") }),
  };
}

export { SignedIn, SignedOut };
