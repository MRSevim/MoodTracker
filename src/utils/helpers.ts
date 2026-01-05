import { auth } from "@/features/auth/lib/auth";

//Helper funt to return error messages compitable with ts
export const returnErrorFromUnknown = (error: unknown) => {
  if (error instanceof Error) return { error: error.message };
  if (typeof error === "string") return { error };
  return { error: "Unknown Error Occurred!" };
};

//Helper func to check authantication from authjs
export const checkAuth = async () => {
  const session = await auth();
  const user = session?.user;
  if (!user) throw "Please authorize first";
  return user;
};
