import { EmbedBuilder } from "discord.js";
import { Schedule } from "@repo/api";

export function buildScheduleListEmbed(schedules: Schedule[]): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle("Scheduled News Updates")
    .setColor(0x02ebf7)
    .setDescription(`Found ${schedules.length} schedule(s)`)
    .setFooter({ text: "Powered by ForexFactory" });

  schedules.forEach((schedule, index) => {
    embed.addFields({
      name: `Schedule ${index + 1}`,
      value: [
        `🆔 ID: ${schedule.id}`,
        `🕒 Time: ${schedule.hour}:${schedule.minute}`,
        `🌐 Timezone: ${schedule.timeZone}`,
        `📊 Market: ${schedule.market}`,
        `📅 Frequency: ${schedule.frequency}`,
        `📰 News Scope: ${schedule.newsScope}`,
        `💹 Currencies: ${schedule.currency.join(', ') || 'All'}`,
        `⚡ Impact Levels: ${schedule.impact.join(', ') || 'All'}`,
        `📍 Channel: <#${schedule.channelId}>`
      ].join('\n'),
    });

    if ((index + 1) % 3 === 0) {
      embed.addFields({ name: '\u200b', value: '\u200b', inline: false });
    }
  });

  return embed;
} 