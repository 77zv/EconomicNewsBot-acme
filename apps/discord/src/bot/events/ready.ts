import { Events, Client } from "discord.js";
import { MessageBrokerService } from "@repo/messaging";

export const name = Events.ClientReady;
export const once = true;

export async function execute(client: Client) {
  console.log(`Ready! Logged in as ${client.user?.tag}`);

  // Start all message consumers (schedule tasks + news alerts)
  // Don't await - let it happen in the background so bot can respond to commands
  MessageBrokerService.getInstance().startConsumer(client)
    .then(() => {
      console.log("✓ All message consumers started on shard", client.shard?.ids[0]);
    })
    .catch((error) => {
      console.error("⚠️ Failed to start message consumers (bot will still work for commands):", error.message);
    });
}
