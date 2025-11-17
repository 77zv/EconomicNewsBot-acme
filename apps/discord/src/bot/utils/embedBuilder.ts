import { EmbedBuilder } from "discord.js";
import { News } from "@repo/api";

const impactColors = {
  HIGH: "🔴",
  MEDIUM: "🟠",
  LOW: "🟡",
  HOLIDAY: "⚪",
};

type ImpactLevel = keyof typeof impactColors;

const countryFlags: Record<string, string> = {
  USD: "🇺🇸",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
  JPY: "🇯🇵",
  CHF: "🇨🇭",
  AUD: "🇦🇺",
  CAD: "🇨🇦",
  CNY: "🇨🇳",
  NZD: "🇳🇿",
};

const MAX_FIELDS_PER_EMBED = 25;

export function buildNewsEmbed(
  news: News[],
  title: string
): EmbedBuilder[] {
  if (news.length === 0) {
    const embed = new EmbedBuilder()
      .setTitle(title)
      .setColor(0x02ebf7)
      .setDescription("No news found for the specified criteria.")
      .setFooter({ text: "Powered by ForexFactory" });
    return [embed];
  }

  const embeds: EmbedBuilder[] = [];
  const totalPages = Math.ceil(news.length / MAX_FIELDS_PER_EMBED);

  for (let page = 0; page < totalPages; page++) {
    const embed = new EmbedBuilder()
      .setTitle(
        `${title}${totalPages > 1 ? ` (Page ${page + 1}/${totalPages})` : ""}`
      )
      .setColor(0x02ebf7)
      .setFooter({ text: "Powered by ForexFactory" });

    const startIdx = page * MAX_FIELDS_PER_EMBED;
    const endIdx = Math.min(startIdx + MAX_FIELDS_PER_EMBED, news.length);
    const pageNews = news.slice(startIdx, endIdx);

    pageNews.forEach((item) => {
      const flag = countryFlags[item.country] || "";
      const impactColor =
        impactColors[item.impact.toUpperCase() as ImpactLevel] || "⚪";

      embed.addFields({
        name: `${flag} ${item.country} - ${item.title}`,
        value: `📅 ${getFormattedDate(new Date(item.date))}\n🕒 ${getFormattedTime(new Date(item.date))}\n${impactColor} ${item.impact} impact\n\`\`\`Forecast: ${item.forecast}\nPrevious: ${item.previous}\`\`\``,
        inline: true,
      });
    });

    embeds.push(embed);
  }

  return embeds;
}

export const getFormattedDate = (date: Date): string => {
  // Fixed format only (e.g., "Dec 13")
  const month = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate();

  return `${month} ${day}`;
};

export const getFormattedTime = (date: Date): string => {
  // Fixed format only (e.g., "4:30 AM ET")
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const period = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12; // Convert 24h to 12h format

  return `${formattedHours}:${minutes} ${period}`;
};
