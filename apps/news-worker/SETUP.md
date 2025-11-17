# News Worker Setup Complete! 🎉

## What Was Created

### 1. Application Structure
```
apps/news-worker/
├── src/
│   ├── jobs/
│   │   ├── fetch-news.job.ts       # Daily news sync
│   │   ├── check-actuals.job.ts    # Check for actual values
│   │   ├── send-alerts.job.ts      # 5-min before alerts
│   │   └── cleanup.job.ts          # Weekly cleanup
│   ├── utils/
│   │   └── hash.util.ts            # News event hash generator
│   └── index.ts                     # Main orchestrator
├── package.json
├── tsconfig.json
├── .gitignore
└── README.md
```

## Next Steps

### 1. Install Dependencies
```bash
# From root of monorepo
pnpm install
```

### 2. Run Database Migration
```bash
# Generate Prisma client with updated schema
pnpm db:generate

# Push schema changes to database
pnpm db:push
```

### 3. Configure NewsAlert Settings

You'll need to populate the `NewsAlert` table with channel configurations. Here's an example:

```typescript
// Add this via a script or database migration
await prisma.newsAlert.create({
  data: {
    serverId: "YOUR_DISCORD_SERVER_ID",
    channelId: "YOUR_DISCORD_CHANNEL_ID",
    currency: ["USD", "EUR", "GBP"],
    impact: ["HIGH", "MEDIUM"],
    alertType: ["FIVE_MINUTES_BEFORE", "ON_NEWS_DROP"],
  },
});
```

### 4. Start the Worker

**Development Mode:**
```bash
# From root
pnpm worker:dev

# Or from apps/news-worker
pnpm dev
```

**Production Mode:**
```bash
# Build first
pnpm worker:build

# Then start
pnpm worker:start
```

### 5. Update Discord Bot to Consume Alerts

The Discord bot needs to be updated to consume the `news_alerts` queue. Add this to your Discord bot:

```typescript
// In apps/discord/src/bot/index.ts or similar

const messageBroker = MessageBrokerService.getInstance();
await messageBroker.connect();

// Consume news alerts
messageBroker.channel.consume('news_alerts', async (msg) => {
  if (msg) {
    const alert = JSON.parse(msg.content.toString());
    
    // Get channel and send alert
    const channel = await client.channels.fetch(alert.channelId);
    
    // Build embed based on alert type
    const embed = buildNewsAlertEmbed(alert);
    await channel.send({ embeds: [embed] });
    
    messageBroker.channel.ack(msg);
  }
});
```

## How It Works

### Job Schedule
```
┌─────────────────────────────────────────────────────────┐
│  Daily at 2 AM: Fetch News                              │
│  ├─ Fetches next 7-14 days of events                    │
│  └─ Stores in NewsEvent table (upsert to avoid dupes)   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Every 5 Minutes: Check Actuals                         │
│  ├─ Queries unprocessed events from last 2 hours        │
│  ├─ Checks API for actual values                        │
│  └─ Triggers ON_NEWS_DROP alerts when found             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Every Minute: Send Alerts                              │
│  ├─ Finds events occurring in 5-6 minutes               │
│  ├─ Matches with NewsAlert configurations               │
│  └─ Publishes FIVE_MINUTES_BEFORE alerts to RabbitMQ    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Weekly (Sunday 3 AM): Cleanup                          │
│  ├─ Deletes processed events older than 30 days         │
│  └─ Removes stale unprocessed events (60+ days)         │
└─────────────────────────────────────────────────────────┘
```

### Alert Flow
```
News Worker                RabbitMQ              Discord Bot
    │                         │                       │
    │  1. Detect event        │                       │
    │     in 5 minutes        │                       │
    │                         │                       │
    │  2. Query NewsAlert     │                       │
    │     configurations      │                       │
    │                         │                       │
    │  3. Publish alert ──────►                       │
    │     to queue            │                       │
    │                         │                       │
    │                         │  4. Consume ──────────►
    │                         │     message           │
    │                         │                       │
    │                         │          5. Send to Discord
    │                         │             channel
```

## Database Schema

### NewsEvent
Stores all news events:
- `title`, `currency`, `date`, `impact`
- `forecast`, `previous`, `actual`
- `isProcessed` flag
- Unique constraint on `[title, date, impact, currency]`

### NewsAlert
Configuration for alerts:
- `serverId`, `channelId`
- `currency[]` - filter by currencies
- `impact[]` - filter by impact levels
- `alertType[]` - FIVE_MINUTES_BEFORE, ON_NEWS_DROP
- Unique constraint on `[serverId, channelId]`

## Environment Variables

Make sure these are in your `.env`:
```env
# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# RabbitMQ
RABBITMQ_URL=amqp://localhost
# Or individual vars:
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASS=guest
```

## Monitoring

Watch the logs for:
```
✓ Connected to RabbitMQ
✓ Scheduled: Fetch news (daily at 2:00 AM)
✓ Scheduled: Check actuals (every 5 minutes)
✓ Scheduled: Send alerts (every minute)
✓ Scheduled: Cleanup (weekly on Sunday at 3:00 AM)

[FetchNewsJob] Found 142 news events for FOREX
[CheckActualsJob] Updated actual for: NFP Report (250K)
[SendAlertsJob] Sending 5-minute alerts to 3 channels
[CleanupJob] Deleted 234 processed events
```

## Production Deployment

### With PM2
```bash
pm2 start dist/index.js --name 'news-worker'
pm2 save
```

### With Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
CMD ["node", "dist/index.js"]
```

## Testing

1. **Test fetch job manually:**
```typescript
const job = new FetchNewsJob();
await job.execute();
```

2. **Check database:**
```bash
pnpm studio
# Check NewsEvent table for entries
```

3. **Test alerts:**
   - Create a NewsAlert config
   - Wait for a news event in 5-6 minutes
   - Check RabbitMQ queue: `news_alerts`
   - Verify Discord bot receives and sends message

## Troubleshooting

### Worker not starting
- Check RabbitMQ is running: `rabbitmq-server`
- Verify DATABASE_URL is correct
- Check logs for connection errors

### No news events in database
- Verify API is accessible
- Check logs in FetchNewsJob
- Run job manually to debug

### No alerts being sent
- Check NewsAlert configurations exist
- Verify currency/impact filters match events
- Check RabbitMQ queue has messages
- Ensure Discord bot is consuming `news_alerts` queue

## What's Different from Old Scheduler?

### Before (apps/discord/src/scheduler/)
- Scheduler called API every time
- No persistence of events
- Couldn't track individual events
- Limited to scheduled summaries

### After (apps/news-worker/)
- Events stored in database
- Can track individual events
- Real-time alerts (5 min before & on drop)
- Separate from Discord bot
- Better scalability

## Success! 🚀

Your news-worker is ready to:
- ✅ Fetch and store news events daily
- ✅ Monitor for actual value releases
- ✅ Send timely alerts to Discord channels
- ✅ Keep database clean and efficient

Happy trading! 📈📉

