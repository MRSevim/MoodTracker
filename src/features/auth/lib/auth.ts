import "server-only";
import { prisma } from "@/lib/prisma";
import { env } from "@/utils/config";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { APIError } from "better-auth/api";
import { getOAuthState } from "better-auth/api";
import { IANAZone } from "luxon";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    google: {
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
    },
  },
  plugins: [nextCookies()], // make sure nextCookies is the last plugin in the array, it is to set cookies correctly on authentications
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const state = await getOAuthState();
          const timezone = state?.timezone;

          if (!timezone || !IANAZone.isValidZone(timezone)) {
            throw new APIError("BAD_REQUEST", {
              message: "You must have a valid timezone in the query params.",
            });
          }

          // Modify user data before creation
          return { data: { ...user, timezone } };
        },
      },
    },
  },
  user: {
    additionalFields: {
      timezone: {
        type: "string",
        required: true,
      },
    },
  },
});
