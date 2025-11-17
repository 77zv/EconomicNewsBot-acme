import { ScheduleService, Schedule, NewsService, Market, NewsScope } from "@repo/api";
import { MessageBrokerService } from "@repo/messaging";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Checks for scheduled news summaries that need to be sent
 * Runs every 5 minutes to check if any schedules match the current time
 */
export class CheckSchedulesJob {
  private scheduleService: ScheduleService;
  private newsService: NewsService;
  private messageBroker: MessageBrokerService;

  constructor() {
    this.scheduleService = ScheduleService.getInstance();
    this.newsService = NewsService.getInstance();
    this.messageBroker = MessageBrokerService.getInstance();
  }

  async execute(): Promise<void> {
    try {
      // Get current time in New York timezone
      const nyTime = new Date().toLocaleString("en-US", {
        timeZone: "America/New_York",
        hour12: false,
      });
      const nyDate = new Date(nyTime);
      const currentHour = nyDate.getHours();
      const currentMinute = nyDate.getMinutes();

      console.log(
        `[CheckSchedulesJob] Checking schedules for ${currentHour}:${currentMinute} NY Time`
      );

      const matchingSchedules = await this.scheduleService.getSchedulesForTime(
        currentHour,
        currentMinute
      );

      if (matchingSchedules.length > 0) {
        console.log(
          `[CheckSchedulesJob] 📅 Found ${matchingSchedules.length} schedules to process`
        );

        for (const schedule of matchingSchedules) {
          await this.processSchedule(schedule);
        }
      } else {
        console.log(`[CheckSchedulesJob] No schedules found`);
      }
    } catch (error) {
      console.error("[CheckSchedulesJob] Error checking schedules:", error);
      throw error;
    }
  }

  private async processSchedule(schedule: Schedule): Promise<void> {
    try {
      const news = await this.getNewsForSchedule(schedule);
      
      if (!news || news.length === 0) {
        console.log(
          `[CheckSchedulesJob] No news found for schedule ${schedule.id}`
        );
        return;
      }

      await this.messageBroker.publishScheduleTask(schedule, news);
      console.log(
        `[CheckSchedulesJob] ✓ Published schedule task ${schedule.id} to queue (${news.length} news items)`
      );
    } catch (error) {
      console.error(
        `[CheckSchedulesJob] Error processing schedule ${schedule.id}:`,
        error
      );
    }
  }

  private async getNewsForSchedule(schedule: Schedule): Promise<any[]> {
    const options = {
      market: schedule.market as Market,
      currency: schedule.currency,
      impact: schedule.impact,
      timezone: schedule.timeZone,
    };

    switch (schedule.newsScope) {
      case NewsScope.DAILY:
        return await this.newsService.getTodayNews(options);
      case NewsScope.WEEKLY:
        return await this.newsService.getWeeklyNews(options);
      case NewsScope.TOMORROW:
        return await this.newsService.getTomorrowNews(options);
      default:
        return [];
    }
  }
}

