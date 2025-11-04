import { createAuthClient } from "better-auth/react";
 
export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:3000"
});
 
export const { signIn, signOut, useSession } = authClient;

export const signInDiscord = async () => {
    const data = await signIn.social({
        provider: "discord"
    })
    return data;
};