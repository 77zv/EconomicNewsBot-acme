import { EmbedBuilder } from "discord.js";
import { Schedule } from "@repo/api";

export function buildScheduleConfirmationEmbed(
  schedule: Schedule,
  action: string
): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle(`📅 Schedule ${action}`)
    .setColor(0x02ebf7)
    .setFooter({ text: "Powered by ForexFactory" })
    .addFields(
      {
        name: "🔐 Required Permissions",
        value: "Bot needs 'Send Messages' and 'Embed Links' permissions",
        inline: false,
      },
      {
        name: "🌐 Time Zone",
        value: schedule.timeZone.toString(),
        inline: true,
      },
      {
        name: "📰 News Scope",
        value: schedule.newsScope.toString(),
        inline: true,
      },
      {
        name: "⏱️ Frequency",
        value: schedule.frequency.toString(),
        inline: true,
      },
      {
        name: "💫 Impacts",
        value: schedule.impact.join(", ") || "All",
        inline: true,
      },
      {
        name: "💹 Currencies",
        value: schedule.currency.join(", ") || "All",
        inline: true,
      },
      { name: "📊 Market", value: schedule.market.toString(), inline: true },
      {
        name: "🕒 Time",
        value: schedule.hourServerTime.toString(),
        inline: true,
      }
    );

  return embed;
}
