import { NewsService } from "@repo/api";
import { Market, Impact, Currency } from "@repo/api";
import { prisma } from "@repo/db";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Fetches news events from the API and stores them in the database
 * Runs daily at 2 AM to sync the next 7-14 days of events
 */
export class FetchNewsJob {
  private newsService: NewsService;

  constructor() {
    this.newsService = NewsService.getInstance();
  }

  async execute(): Promise<void> {
    console.log("[FetchNewsJob] Starting daily news sync...");

    try {
      // const markets = [Market.FOREX, Market.CRYPTO, Market.ENERGY, Market.METAL];
      const markets = [Market.FOREX]
      
      for (const market of markets) {
        await this.fetchAndStoreNewsForMarket(market);
      }

      console.log("[FetchNewsJob] Daily news sync completed successfully");
    } catch (error) {
      console.error("[FetchNewsJob] Error during news sync:", error);
      throw error;
    }
  }

  private async fetchAndStoreNewsForMarket(market: Market): Promise<void> {
    try {
      console.log(`[FetchNewsJob] Fetching news for market: ${market}`);

      // Fetch weekly news (ForexFactory should be next 7 days)
      const news = await this.newsService.getWeeklyNews({
        market,
      });

      console.log(`[FetchNewsJob] Found ${news.length} news events for ${market}`);

      // Store each news event
      let created = 0;
      let updated = 0;
      let skipped = 0;

      for (const newsItem of news) {
        try {
          // Map "country" from API to Currency enum
          const currency = newsItem.country.toUpperCase() as Currency;
          const impact = newsItem.impact.toUpperCase() as Impact;

          // Check if currency is valid
          if (!Object.values(Currency).includes(currency)) {
            console.warn(`[FetchNewsJob] Invalid currency: ${newsItem.country}, skipping event`);
            skipped++;
            continue;
          }

          // Parse date as naive timestamp (same approach as schedules)
          // API returns: "2025-11-16T16:45:00-05:00" (EST/EDT time with offset)
          // We want to store: "2025-11-16 16:45:00" as naive timestamp
          
          // Parse the date and ensure we're working in NY timezone to get correct local time
          // Even though the offset is already there, we explicitly set timezone to handle it consistently
          const nyDate = dayjs(newsItem.date).tz("America/New_York");
          
          // Extract just the date/time components (16:45, not 21:45 UTC)
          const timeString = nyDate.format('YYYY-MM-DD HH:mm:ss');
          
          // Create a Date object treating these EST/EDT values as UTC (making it naive)
          // This stores "16:45" in the database as "2025-11-16 16:45:00"
          const eventDate = dayjs.utc(timeString).toDate();

          // Upsert based on unique constraint [title, date, impact, currency]
          const result = await prisma.newsEvent.upsert({
            where: {
              title_date_impact_currency: {
                title: newsItem.title,
                date: eventDate,
                impact: impact,
                currency: currency,
              },
            },
            update: {
              forecast: newsItem.forecast || "",
              previous: newsItem.previous || "",
              // Don't overwrite actual if it already exists
            },
            create: {
              title: newsItem.title,
              currency: currency,
              date: eventDate,
              impact: impact,
              forecast: newsItem.forecast || "",
              previous: newsItem.previous || "",
              source: "ForexFactory",
            },
          });

          // Track if this was a new record or update
          // Prisma doesn't tell us directly, so we'll just count all as processed
          created++;
        } catch (error) {
          console.error(`[FetchNewsJob] Error storing news event:`, error);
          skipped++;
        }
      }

      console.log(
        `[FetchNewsJob] Market ${market}: Processed ${news.length} events (${created} upserted, ${skipped} skipped)`
      );
    } catch (error) {
      console.error(`[FetchNewsJob] Error fetching news for market ${market}:`, error);
      throw error;
    }
  }
}

