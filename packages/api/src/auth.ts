import { betterAuth } from "better-auth";
import {nextCookies} from "better-auth/next-js";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@repo/db";
 
export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET as string,
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