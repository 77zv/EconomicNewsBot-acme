import { prisma } from "@repo/db";

export interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
  features: string[];
}

export interface GuildWithBot extends DiscordGuild {
  botInstalled: boolean;
  scheduleCount?: number;
}

export class DiscordService {
  private static instance: DiscordService;

  private constructor() {}

  public static getInstance(): DiscordService {
    if (!DiscordService.instance) {
      DiscordService.instance = new DiscordService();
    }
    return DiscordService.instance;
  }

  /**
   * Fetches user's Discord guilds from Discord API
   */
  async getUserGuilds(accessToken: string): Promise<DiscordGuild[]> {
    try {
      const response = await fetch("https://discord.com/api/v10/users/@me/guilds", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Discord API error: ${response.status}`);
      }

      const guilds = await response.json();
      return guilds;
    } catch (error) {
      console.error("Error fetching user guilds:", error);
      throw error;
    }
  }

  /**
   * Gets user's guilds with bot installation status and schedule count
   */
  async getUserGuildsWithBotStatus(
    accessToken: string
  ): Promise<GuildWithBot[]> {
    const userGuilds = await this.getUserGuilds(accessToken);
    
    // Get guilds where bot is installed (has schedules or channels)
    const installedServers = await prisma.discordServer.findMany({
      select: {
        guildId: true,
        _count: {
          select: {
            schedules: true,
          },
        },
      },
    });

    const installedServerMap = new Map(
      installedServers.map((server) => [
        server.guildId,
        server._count.schedules,
      ])
    );

    return userGuilds.map((guild) => ({
      ...guild,
      botInstalled: installedServerMap.has(guild.id),
      scheduleCount: installedServerMap.get(guild.id) ?? 0,
    }));
  }

  /**
   * Checks if user has admin permissions in a guild
   */
  hasAdminPermission(permissions: string): boolean {
    const permissionBits = BigInt(permissions);
    const ADMINISTRATOR = BigInt(0x8);
    const MANAGE_GUILD = BigInt(0x20);
    
    return (
      (permissionBits & ADMINISTRATOR) === ADMINISTRATOR ||
      (permissionBits & MANAGE_GUILD) === MANAGE_GUILD
    );
  }

  /**
   * Filters guilds where user has admin permissions
   */
  filterAdminGuilds(guilds: DiscordGuild[]): DiscordGuild[] {
    return guilds.filter(
      (guild) => guild.owner || this.hasAdminPermission(guild.permissions)
    );
  }

  /**
   * Gets guild icon URL
   */
  getGuildIconUrl(guildId: string, iconHash: string | null): string | null {
    if (!iconHash) return null;
    return `https://cdn.discordapp.com/icons/${guildId}/${iconHash}.png?size=128`;
  }

  /**
   * Gets user's Discord account from database
   */
  async getUserDiscordAccount(userId: string) {
    const account = await prisma.account.findFirst({
      where: {
        userId,
        providerId: "discord",
      },
      select: {
        accessToken: true,
        accessTokenExpiresAt: true,
      },
    });

    if (!account) {
      throw new Error("No Discord account found");
    }

    if (!account.accessToken) {
      throw new Error("No access token available");
    }

    // Check if token is expired
    if (account.accessTokenExpiresAt && account.accessTokenExpiresAt < new Date()) {
      throw new Error("Access token expired. Please re-authenticate.");
    }

    return account;
  }
}

