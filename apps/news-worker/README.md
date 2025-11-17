# News Worker

Background worker service that fetches, stores, and manages news events for the Discord Forex Factory Bot.

## Overview

The news-worker is a separate application in the monorepo that handles:
- Fetching news events from external APIs
- Storing events in the database
- Monitoring for actual value releases
- Sending alerts to configured Discord channels

## Architecture

This worker operates independently from the Discord bot, allowing for:
- ✅ Independent scaling
- ✅ Fault isolation
- ✅ Different resource allocation
- ✅ Separate deployment cycles

### Communication Flow

```
News Worker -----> RabbitMQ -----> Discord Bot
   (Publishes)    (news_alerts)    (Consumes & sends to Discord)
```

## Jobs

### 1. Fetch News Job
**Schedule:** Daily at 2:00 AM  
**Purpose:** Syncs news events for the next 7-14 days

- Fetches from multiple markets (FOREX, CRYPTO, ENERGY, METAL)
- Uses upsert logic to avoid duplicates
- Updates forecast/previous values if changed

### 2. Check Actuals Job
**Schedule:** Every 5 minutes  
**Purpose:** Monitors for released actual values

- Queries unprocessed events from the last 2 hours
- Checks API for actual values
- Updates database when found
- Triggers `ON_NEWS_DROP` alerts

### 3. Send Alerts Job
**Schedule:** Every minute  
**Purpose:** Sends 5-minute-before alerts

- Finds events occurring in 5-6 minutes
- Matches with `NewsAlert` configurations
- Publishes to RabbitMQ for Discord bot consumption
- Uses in-memory cache to prevent duplicates

### 4. Cleanup Job
**Schedule:** Weekly on Sunday at 3:00 AM  
**Purpose:** Removes old events

- Deletes processed events older than 30 days
- Removes stale unprocessed events (60+ days)
- Keeps database size manageable

## Database Schema

### NewsEvent
Stores all news events from the API:
```prisma
model NewsEvent {
  id          String
  title       String
  currency    Currency
  date        DateTime
  impact      Impact
  forecast    String
  previous    String
  actual      String?
  isProcessed Boolean
  
  @@unique([title, date, impact, currency])
}
```

### NewsAlert
Configuration for which channels receive alerts:
```prisma
model NewsAlert {
  id         String
  serverId   String
  channelId  String
  impact     Impact[]      // Filter by impact
  currency   Currency[]    // Filter by currency
  alertType  AlertType[]   // FIVE_MINUTES_BEFORE, ON_NEWS_DROP
  
  @@unique([serverId, channelId])
}
```

## Environment Variables

Required variables (shared from root `.env`):
```env
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
RABBITMQ_URL=amqp://...
# Or individual RabbitMQ vars:
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASS=guest
```

## Development

```bash
# Install dependencies (from root)
pnpm install

# Run in development mode
cd apps/news-worker
pnpm dev

# Build
pnpm build

# Start production
pnpm start
```

## Production Deployment

### Option 1: PM2 (with Discord bot)
```bash
pm2 start dist/index.js --name 'news-worker'
```

### Option 2: Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm build
CMD ["node", "dist/index.js"]
```

### Option 3: Systemd Service
```ini
[Unit]
Description=News Worker
After=network.target

[Service]
Type=simple
User=nodejs
WorkingDirectory=/opt/news-worker
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

## Monitoring

The worker logs important events:
- ✓ Job execution start/completion
- ⚠️ Errors and warnings
- 📊 Statistics (events processed, alerts sent)

Example output:
```
[FetchNewsJob] Found 142 news events for FOREX
[CheckActualsJob] Updated actual for: FOMC Member Daly Speaks (0.5%)
[SendAlertsJob] Sending 5-minute alerts to 3 channels for: NFP Report
[CleanupJob] Deleted 234 processed events older than 30 days
```

## Troubleshooting

### No alerts being sent
1. Check `NewsAlert` configurations exist in database
2. Verify RabbitMQ connection
3. Check Discord bot is consuming `news_alerts` queue

### Duplicate events in database
- The unique constraint `[title, date, impact, currency]` prevents duplicates
- If seeing duplicates, ensure all 4 fields are identical

### High memory usage
- The `SendAlertsJob` keeps an in-memory cache
- Cache is cleared when size exceeds 1000 entries
- Restart service if memory continues to grow

## Future Enhancements

- [ ] Add market-specific scheduling (only run during market hours)
- [ ] Implement retry logic for failed API calls
- [ ] Add metrics/observability (Prometheus, Grafana)
- [ ] Support additional news sources beyond ForexFactory
- [ ] Add webhook support for real-time news updates

