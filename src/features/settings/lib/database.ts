"use server";

import { auth } from "@/features/auth/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkAuth, returnErrorFromUnknown } from "@/utils/helpers";
import { routes } from "@/utils/routes";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const deleteAccount = async () => {
  try {
    const user = await checkAuth();

    const { success } = await auth.api.signOut({
      headers: await headers(),
    });

    // Delete the user (cascades to accounts, sessions, moods)
    await prisma.user.delete({
      where: { id: user.id },
    });
    if (!success) {
      throw Error("Could not Logout");
    }
  } catch (error) {
    return returnErrorFromUnknown(error);
  }
  return redirect(routes.homepage);
};

export const updateTimezone = async (newTimezone: string) => {
  try {
    const user = await checkAuth();

    // Delete the user (cascades to accounts, sessions, moods)
    await prisma.user.update({
      where: { id: user.id },
      data: { timezone: newTimezone },
    });
  } catch (error) {
    return returnErrorFromUnknown(error);
  }
  redirect(routes.settings);
};
