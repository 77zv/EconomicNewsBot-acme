# 📊 Forex Factory Bot - Economic Calendar Automation

A full-stack Discord bot and web platform that delivers real-time economic news and calendar events from Forex Factory, supporting multiple markets (Forex, Crypto, Energy, and Metals).

## 🌟 Features

### Discord Bot
- **Automated News Delivery** - Schedule economic news updates to Discord channels
- **Multi-Market Support** - Forex, Crypto, Energy, and Metal markets
- **Flexible Scheduling** - Daily, weekdays, weekends, or weekly schedules
- **Timezone Support** - 24+ timezone options for global users
- **Custom Filters** - Filter by currency, impact level (High/Medium/Low)
- **Interactive Commands** - Slash commands for news queries and schedule management

### Web Dashboard
- **User Authentication** - Discord OAuth integration
- **Schedule Management** - Create, edit, and delete schedules via web interface
- **Modern UI** - Beautiful, responsive design with Next.js and Tailwind CSS
- **Real-time Updates** - View and manage all your server schedules

## 🏗️ Architecture

This project uses a **monorepo architecture** with shared packages and multiple applications:

```
forex-factory-bot-website/
├── apps/
│   ├── discord/          # Discord bot application
│   └── nextjs/           # Next.js web dashboard
└── packages/
    ├── api/              # Shared API layer (tRPC)
    ├── db/               # Database (Prisma ORM)
    ├── env/              # Environment configuration
    ├── messaging/        # Message broker (RabbitMQ)
    └── typescript-config/ # Shared TypeScript config
```

### Design Patterns
The codebase implements enterprise-level design patterns including:
- **Repository Pattern** - Clean data access abstraction
- **Service Layer Pattern** - Business logic encapsulation
- **Singleton Pattern** - Single service instances
- **Message Queue Pattern** - Asynchronous task processing
- **DTO Pattern** - Type-safe data transfer

📖 See [DESIGN_PATTERNS.md](./DESIGN_PATTERNS.md) for detailed architecture documentation.

## 🛠️ Tech Stack

### Core Technologies
- **TypeScript** - Type-safe development
- **Node.js** - Runtime environment
- **PostgreSQL** - Primary database
- **RabbitMQ** - Message broker for async processing

### Backend
- **tRPC** - End-to-end type-safe API
- **Prisma ORM** - Type-safe database access
- **Better Auth** - Authentication with Discord OAuth
- **Discord.js** - Discord bot framework

### Frontend
- **Next.js 14** - React framework (App Router)
- **Tailwind CSS** - Utility-first styling
- **React Query** - Data fetching via tRPC

### Infrastructure
- **pnpm** - Fast, efficient package manager
- **Turborepo** - High-performance build system
- **Docker** - Containerization (RabbitMQ, PostgreSQL)

## 📋 Prerequisites

- **Node.js** 18.x or higher
- **pnpm** 8.x or higher
- **PostgreSQL** 14.x or higher
- **RabbitMQ** 3.x or higher (optional, for scheduler)
- **Discord Bot Token** - [Create a bot](https://discord.com/developers/applications)
- **Discord OAuth App** - For web authentication

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/forex-factory-bot-website.git
cd forex-factory-bot-website
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/forex_bot"
DIRECT_URL="postgresql://user:password@localhost:5432/forex_bot"

# Discord Bot
DISCORD_TOKEN="your-bot-token"
DISCORD_CLIENT_ID="your-client-id"
DISCORD_CLIENT_SECRET="your-client-secret"

# Authentication
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# RabbitMQ (Optional - for scheduler)
RABBITMQ_URL="amqp://localhost:5672"
RABBITMQ_HOST="localhost"
RABBITMQ_PORT="5672"
RABBITMQ_USER="guest"
RABBITMQ_PASS="guest"

# Environment
NODE_ENV="development"
```

### 4. Database Setup

```bash
# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# (Optional) Seed database
pnpm db:seed
```

### 5. Start Development Servers

```bash
# Start all applications
pnpm dev

# Or start individually:
pnpm dev:discord    # Discord bot only
pnpm dev:web        # Next.js web app only
```

### 6. Deploy Discord Commands

```bash
cd apps/discord
pnpm deploy-commands
```

## 📦 Project Structure

```
apps/
├── discord/
│   └── src/
│       ├── bot/
│       │   ├── commands/
│       │   │   ├── admin/      # Schedule management commands
│       │   │   └── public/     # News query commands
│       │   ├── events/         # Discord event handlers
│       │   └── utils/          # Embed builders, helpers
│       └── scheduler/          # Automated task scheduler
│
└── nextjs/
    └── src/
        ├── app/
        │   ├── api/            # API routes (tRPC, auth)
        │   ├── components/     # React components
        │   ├── dashboard/      # Dashboard pages
        │   └── (pages)/        # Other pages
        └── lib/                # Client utilities

packages/
├── api/
│   └── src/
│       ├── repositories/       # Data access layer
│       ├── services/          # Business logic layer
│       ├── routers/           # tRPC routers
│       └── utils/             # Shared utilities
│
├── db/
│   └── src/
│       ├── schema.prisma      # Database schema
│       └── migrations/        # Database migrations
│
├── messaging/
│   └── src/
│       └── messagebroker.service.ts  # RabbitMQ integration
│
└── env/
    └── src/
        └── env.mjs            # Environment validation
```

📁 See [FILE_STRUCTURE.txt](./FILE_STRUCTURE.txt) for complete file tree.

## 🤖 Discord Bot Commands

### Public Commands
- `/today` - Get today's economic news
- `/tomorrow` - Get tomorrow's economic news  
- `/week` - Get this week's economic news

### Admin Commands (Manage Server permission required)
- `/create-schedule` - Create an automated news schedule
- `/list-schedules` - View all schedules for your server
- `/edit-schedule` - Modify an existing schedule
- `/delete-schedule` - Delete a specific schedule
- `/delete-all-schedules` - Remove all schedules (with confirmation)

### Command Options
- `market` - Forex, Crypto, Energy, Metal
- `currency` - USD, EUR, GBP, JPY, etc.
- `impact` - High, Medium, Low
- `timezone` - GMT+0 to GMT+12, GMT-1 to GMT-12
- `frequency` - Daily, Weekdays, Weekends, Weekly

## 🧪 Development

### Build

```bash
# Build all packages and applications
pnpm build

# Build specific application
pnpm build --filter=discord
pnpm build --filter=nextjs
```

### Type Checking

```bash
# Type check all packages
pnpm typecheck
```

### Linting

```bash
# Lint all packages
pnpm lint

# Fix linting issues
pnpm lint:fix
```

### Database Commands

```bash
# Generate Prisma client
pnpm db:generate

# Create migration
pnpm db:migrate:dev

# Deploy migrations
pnpm db:migrate

# Reset database
pnpm db:reset

# Open Prisma Studio
pnpm db:studio
```

## 🔧 Package Scripts

Root level commands:

```json
{
  "dev": "turbo dev",
  "build": "turbo build",
  "typecheck": "turbo typecheck",
  "lint": "turbo lint",
  "db:generate": "turbo db:generate",
  "db:migrate": "turbo db:migrate",
  "db:studio": "turbo db:studio"
}
```

## 🌐 Deployment

### Discord Bot

1. Build the application:
   ```bash
   pnpm build --filter=discord
   ```

2. Deploy commands to Discord:
   ```bash
   cd apps/discord
   pnpm deploy-commands
   ```

3. Run the bot:
   ```bash
   cd apps/discord
   node dist/bot/index.js
   ```

### Next.js Web App

Deploy to Vercel (recommended):

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or build for self-hosting:

```bash
pnpm build --filter=nextjs
cd apps/nextjs
pnpm start
```

### Environment Variables

Ensure all production environment variables are set:
- `DATABASE_URL` - Production PostgreSQL connection
- `DISCORD_TOKEN` - Discord bot token
- `BETTER_AUTH_SECRET` - Secure random string
- `BETTER_AUTH_URL` - Production URL
- `RABBITMQ_URL` - RabbitMQ connection (if using scheduler)

## 🐳 Docker Support

Run supporting services with Docker:

```bash
# PostgreSQL
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=forex_bot \
  -p 5432:5432 \
  postgres:14

# RabbitMQ
docker run -d \
  --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  rabbitmq:3-management
```

## 📝 API Documentation

The project uses tRPC for type-safe APIs. No separate API documentation needed - types are inferred automatically!

### Example tRPC Usage

```typescript
// In Next.js components
import { api } from "~/utils/api";

const { data } = api.example.hello.useQuery({ text: "world" });
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow existing code structure and patterns
- Write meaningful commit messages
- Add types for all function parameters and returns

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Forex Factory](https://www.forexfactory.com/) - Economic calendar data
- [Discord.js](https://discord.js.org/) - Discord bot framework
- [tRPC](https://trpc.io/) - Type-safe API framework
- [Prisma](https://www.prisma.io/) - Database ORM

## 📞 Support

For support, questions, or feature requests:
- Open an issue on GitHub
- Join our Discord server: [Invite Link]
- Email: support@example.com

## 🗺️ Roadmap

- [ ] Add more market types (Stocks, Commodities)
- [ ] Email notifications
- [ ] Advanced filtering options
- [ ] Historical data charts
- [ ] Multi-language support
- [ ] Mobile app

---

Built with ❤️ using TypeScript, Next.js, and Discord.js
