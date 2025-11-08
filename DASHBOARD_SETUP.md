# Discord Server Dashboard Setup

This document explains the newly implemented Discord server dashboard feature.

## Overview

Users can now log in to the website and see all their Discord servers where they have admin permissions. They can click on any server to view and manage the bot's schedules for that server.

## What Was Implemented

### 1. Backend (API Package)

#### Discord Service (`packages/api/src/services/discord.service.ts`)
- Fetches user's Discord guilds from Discord API using OAuth access token
- Checks bot installation status by querying the database
- Filters guilds to show only those where user has admin permissions
- Provides guild icon URLs and schedule counts

#### Guild Router (`packages/api/src/routers/guild.router.ts`)
- `getMyGuilds`: Returns all user's Discord servers with bot status
- `getGuildDetails`: Returns detailed information for a specific server including schedules
- `getGuildSchedules`: Returns all schedules for a specific server

#### Schedule Service Enhancement
- Added `getSchedulesByServerId()` method to fetch schedules for a specific server

### 2. Frontend (Next.js App)

#### Components
- **ServerCard** (`apps/nextjs/src/app/components/server-card.tsx`): Card component displaying server info
- **ServerGrid** (`apps/nextjs/src/app/components/server-grid.tsx`): Grid layout for displaying servers

#### Pages
- **Dashboard** (`apps/nextjs/src/app/dashboard/page.tsx`): Main dashboard showing all servers
- **Server Detail** (`apps/nextjs/src/app/dashboard/server/[guildId]/page.tsx`): Individual server management page

## Features

### Dashboard Page (`/dashboard`)
- Shows all Discord servers where user has admin permissions
- Displays bot installation status for each server
- Shows schedule count for each server
- Provides "Invite Bot" link if no servers found
- Authentication required (redirects to home if not logged in)

### Server Detail Page (`/dashboard/server/[guildId]`)
- Displays server icon and name
- Lists all configured schedules for the server
- Shows schedule details (time, timezone, frequency, impact, currencies)
- Provides placeholder buttons for creating/editing/deleting schedules
- Back navigation to main dashboard

## Authentication & Authorization

### OAuth Scopes
The Better Auth configuration includes the following Discord scopes:
- `identify`: Get user's basic Discord profile
- `guilds`: Access user's Discord servers

### Access Control
- Users can only see servers where they have admin permissions (Administrator or Manage Server)
- The backend verifies user access before returning guild details
- Access tokens are stored in the database and validated before API calls

## UI/UX Features

### Design Elements
- Modern card-based design with hover effects
- Loading states with animated spinners
- Error handling with user-friendly messages
- Status badges showing bot installation status
- Empty states with helpful call-to-action buttons
- Responsive grid layout (1 column on mobile, 2 on tablet, 3 on desktop)

### Visual Indicators
- Green "Active" badge for servers with bot installed
- Schedule count display
- Server icons (or first letter fallback)
- Animated hover effects on cards

## How It Works

### Flow

1. **User logs in** with Discord OAuth
   - Better Auth handles authentication
   - Access token stored in database

2. **User navigates to /dashboard**
   - Frontend makes tRPC call to `guild.getMyGuilds`
   - Backend fetches guilds from Discord API using stored access token
   - Backend checks database for bot installation status
   - Backend filters to only admin guilds
   - Returns enriched guild data to frontend

3. **User clicks on a server**
   - Navigates to `/dashboard/server/[guildId]`
   - Frontend makes tRPC call to `guild.getGuildDetails`
   - Backend verifies user has access to this guild
   - Backend fetches schedules from database
   - Returns guild details and schedules

## Database Schema

The existing schema supports this feature:
- `DiscordServer`: Stores guild IDs where bot is installed
- `Schedule`: Stores schedule configurations linked to servers
- `Account`: Stores Discord OAuth access tokens

## API Endpoints

### tRPC Routes

```typescript
// Get all user's guilds with bot status
guild.getMyGuilds.useQuery()

// Get specific guild details
guild.getGuildDetails.useQuery({ guildId: "123..." })

// Get guild schedules
guild.getGuildSchedules.useQuery({ guildId: "123..." })
```

## Next Steps / Future Enhancements

1. **Schedule Management**
   - Implement create schedule form
   - Implement edit schedule functionality
   - Implement delete schedule with confirmation

2. **Real-time Updates**
   - Add refresh button or auto-refresh
   - Show bot online status
   - Display last schedule execution time

3. **Advanced Features**
   - Bulk schedule operations
   - Schedule templates
   - Server settings page
   - Bot configuration options

4. **Permissions**
   - Fine-grained permission checks
   - Role-based access within servers
   - Audit logs for schedule changes

## Testing

To test the feature:

1. Ensure you have Discord OAuth credentials configured in `.env`
2. Start the Next.js app: `pnpm dev`
3. Navigate to the website and log in with Discord
4. Go to `/dashboard` to see your servers
5. Click on any server to view its details

## Troubleshooting

### "No Discord account found"
- User hasn't logged in with Discord
- Solution: Log in again

### "Access token expired"
- OAuth token has expired
- Solution: User needs to re-authenticate

### No servers showing
- User doesn't have admin permissions in any servers
- Bot hasn't been invited to any servers
- Solution: Invite bot or verify permissions

### Error loading servers
- Discord API might be down
- Network issues
- Invalid OAuth credentials
- Solution: Check logs, verify credentials, retry

