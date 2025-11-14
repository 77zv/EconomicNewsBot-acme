import { NewsService } from '../services/news.service'
import { DiscordService } from '../services/discord.service'
import { GrokService } from '../services/grok.service'

// Export singleton instances
export const newsService = NewsService.getInstance()
export const discordService = DiscordService.getInstance()
export const grokService = GrokService.getInstance()

// Export types and interfaces
export type { NewsOptions } from '../services/news.service'
export type { DiscordGuild, GuildWithBot } from '../services/discord.service'

