import { betterAuth } from "better-auth";
import {nextCookies} from "better-auth/next-js";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@repo/db";
 
export const auth = betterAuth({
  socialProviders: {
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID as unknown as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as unknown as string,
    },
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [nextCookies()],
  debug: process.env.NODE_ENV === "development",
});