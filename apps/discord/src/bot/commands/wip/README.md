# Work-in-Progress Commands

This folder contains commands that are still being developed and tested. These commands are experimental and may change significantly before being moved to production.

## How It Works

- **Development Mode** (`NODE_ENV=development`): ONLY commands in this folder are loaded and deployed. Public and admin commands are skipped.
- **Production Mode**: Commands in this folder are automatically skipped. Only public and admin commands are loaded.

## Adding a New WIP Command

1. Create your command file in this folder (e.g., `myCommand.ts`)
2. Follow the same structure as other commands:
   ```typescript
   import { ChatInputCommandInteraction } from "discord.js";
   import { CommandBuilder } from "../../utils/CommandBuilder";

   export const data = new CommandBuilder("my-command", "Command description")
     .build();

   export async function execute(interaction: ChatInputCommandInteraction) {
     // Your command logic here
   }
   ```
3. Deploy commands: `pnpm discord:deploy` (make sure `NODE_ENV=development`)
4. Test the command in Discord

## Promoting a Command to Production

When a command is ready for production:

1. Move the command file from `wip/` to the appropriate folder (`public/` or `admin/`)
2. Update the documentation in `apps/nextjs/src/app/data/commands.ts`
3. Update `README.md` in the project root
4. Redeploy commands in production

## Current WIP Commands

- **`/ai-analysis`** - Generate a comprehensive AI-powered forex market analysis for today (in French)
  - Requires: `GROK_API_KEY` environment variable
  - Status: Testing Grok API integration and prompt optimization

## Environment Variables

Some WIP commands may require additional environment variables. Make sure to add them to your `.env` file:

```env
# Grok API (X.AI)
GROK_API_KEY="your-grok-api-key-here"
```

## Testing Best Practices

- Test commands thoroughly in development before promoting to production
- Document any special requirements or dependencies
- Note any known issues or limitations
- Get feedback from other developers before promoting

