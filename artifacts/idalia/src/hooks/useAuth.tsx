import { ReactNode } from "react";
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

  const authUser: AuthUser | null = isSignedIn && user
    ? {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress ?? user.emailAddresses?.[0]?.emailAddress ?? "",
        fullName: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || "",
      }
    : null;

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
