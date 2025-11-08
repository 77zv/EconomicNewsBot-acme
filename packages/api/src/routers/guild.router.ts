import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { DiscordService } from "../services/discord.service";
import { ScheduleService } from "../services/schedule.service";

const discordService = DiscordService.getInstance();
const scheduleService = ScheduleService.getInstance();

export const guildRouter = createTRPCRouter({
  /**
   * Get all guilds (servers) the user is in
   */
  getMyGuilds: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Get user's Discord account with access token
      const account = await discordService.getUserDiscordAccount(ctx.session.user.id);

      // Fetch guilds with bot status
      const guilds = await discordService.getUserGuildsWithBotStatus(
        account.accessToken!
      );

      // Filter to only show guilds where user has admin permissions
      const adminGuilds = discordService.filterAdminGuilds(guilds);

      // Add icon URLs
      return adminGuilds.map((guild) => ({
        ...guild,
        iconUrl: discordService.getGuildIconUrl(guild.id, guild.icon),
      }));
    } catch (error) {
      console.error("Error fetching user guilds:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to fetch Discord servers"
      );
    }
  }),

  /**
   * Get details for a specific guild including schedules
   */
  getGuildDetails: protectedProcedure
    .input(
      z.object({
        guildId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // Get user's Discord account
        const account = await discordService.getUserDiscordAccount(
          ctx.session.user.id
        );

        // Fetch user's guilds to verify access
        const guilds = await discordService.getUserGuilds(account.accessToken!);
        const guild = guilds.find((g) => g.id === input.guildId);

        if (!guild) {
          throw new Error("Guild not found or you don't have access");
        }

        // Check admin permissions
        if (!guild.owner && !discordService.hasAdminPermission(guild.permissions)) {
          throw new Error("You need admin permissions to manage this server");
        }

        // Get schedules for this guild
        const schedules = await scheduleService.getSchedulesByServerId(
          input.guildId
        );

        return {
          guild: {
            ...guild,
            iconUrl: discordService.getGuildIconUrl(guild.id, guild.icon),
          },
          schedules,
        };
      } catch (error) {
        console.error("Error fetching guild details:", error);
        throw new Error(
          error instanceof Error ? error.message : "Failed to fetch guild details"
        );
      }
    }),

  /**
   * Get all schedules for a specific guild
   */
  getGuildSchedules: protectedProcedure
    .input(
      z.object({
        guildId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // Verify user has access to this guild
        const account = await discordService.getUserDiscordAccount(
          ctx.session.user.id
        );
        const guilds = await discordService.getUserGuilds(account.accessToken!);
        const guild = guilds.find((g) => g.id === input.guildId);

        if (!guild) {
          throw new Error("Guild not found or you don't have access");
        }

        // Get schedules
        const schedules = await scheduleService.getSchedulesByServerId(
          input.guildId
        );

        return schedules;
      } catch (error) {
        console.error("Error fetching guild schedules:", error);
        throw new Error(
          error instanceof Error
            ? error.message
            : "Failed to fetch schedules"
        );
      }
    }),
});

