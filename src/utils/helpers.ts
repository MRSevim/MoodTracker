import { auth } from "@/features/auth/lib/auth";
import { headers } from "next/headers";

//Helper funt to return error messages compitable with ts
export const returnErrorFromUnknown = (error: unknown) => {
  if (error instanceof Error) return { error: error.message };
  if (typeof error === "string" && error) return { error };
  return { error: "Unknown Error Occurred!" };
};

//Helper func to check authantication from authjs
export const checkAuth = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const user = session?.user;
  if (!user) throw Error("Please authorize first");
  return user;
};
