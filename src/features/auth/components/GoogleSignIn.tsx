"use client";
import { Button } from "@/components/shadcn/button";
import { FcGoogle } from "react-icons/fc";
import { authClient } from "../lib/authClient";
import { routes } from "@/utils/routes";

export default function GoogleSignIn() {
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        await authClient.signIn.social({
          provider: "google",
          callbackURL: routes.dashboard,
          additionalData: { timezone },
        });
      }}
    >
      <Button
        type="submit"
        variant="outline"
        size="lg"
        className="w-full flex items-center justify-center gap-2 rounded-xl shadow-sm hover:shadow-md transition-all"
      >
        <FcGoogle className="w-5 h-5" />
        <span className="font-medium">Sign in with Google</span>
      </Button>
    </form>
  );
}
