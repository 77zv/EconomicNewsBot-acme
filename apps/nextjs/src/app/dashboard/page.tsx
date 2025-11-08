"use client";

import Nav from "../components/nav";
import Footer from "../components/footer";
import ServerGrid from "../components/server-grid";
import { api } from "../../utils/api";
import { useSession } from "../../lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const { data: guilds, isLoading, error } = api.guild.getMyGuilds.useQuery(undefined, {
    enabled: !!session,
  });

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isPending && !session) {
      router.push("/");
    }
  }, [session, isPending, router]);

  if (isPending || !session) {
    return (
      <>
        <Nav />
        <div className="min-h-screen bg-background-800 py-12 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-background-400">Loading...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Nav />
      <div className="min-h-screen bg-background-800 py-12 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Server Dashboard
            </h1>
            <p className="text-lg text-background-400">
              Manage your Discord servers and bot schedules
            </p>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-center gap-3">
                <svg
                  className="w-6 h-6 text-red-500 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h3 className="text-red-400 font-semibold">Error loading servers</h3>
                  <p className="text-red-300 text-sm mt-1">
                    {error.message || "Failed to fetch Discord servers. Please try again later."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-background-400">Loading your servers...</p>
              </div>
            </div>
          )}

          {/* Servers Grid */}
          {!isLoading && guilds && (
            <>
              {guilds.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-4 text-sm text-background-400">
                    <span>
                      {guilds.length} {guilds.length === 1 ? "server" : "servers"} found
                    </span>
                    <span>•</span>
                    <span>
                      {guilds.filter((g) => g.botInstalled).length} with bot installed
                    </span>
                  </div>
                </div>
              )}
              <ServerGrid guilds={guilds} />
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
} 