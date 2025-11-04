import { 
  SlashCommandBuilder, 
  ChatInputCommandInteraction, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle,
  ComponentType
} from "discord.js";
import { ScheduleService } from "@repo/api";
import { PermissionFlagsBits } from "discord.js";

const scheduleService = ScheduleService.getInstance();

export const data = new SlashCommandBuilder()
  .setName("delete-all-schedules")
  .setDescription("Delete multiple schedules")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.inGuild()) {
    await interaction.reply({
      content: "This command can only be used in a server.",
      ephemeral: true,
    });
    return;
  }

  try {
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('delete-all')
          .setLabel('Delete All Schedules')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('delete-channel')
          .setLabel('Delete Channel Schedules')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('cancel')
          .setLabel('Cancel')
          .setStyle(ButtonStyle.Secondary),
      );

    const response = await interaction.reply({
      content: '⚠️ **Warning**: This action cannot be undone. What would you like to do?',
      components: [row],
      ephemeral: true,
    });

    try {
      const confirmation = await response.awaitMessageComponent({ 
        filter: i => i.user.id === interaction.user.id,
        time: 30_000,
        componentType: ComponentType.Button
      });

      switch (confirmation.customId) {
        case 'delete-all': {
          const count = await scheduleService.deleteAllSchedulesForServer(interaction.guildId);
          await confirmation.update({
            content: `Successfully deleted ${count} schedules from this server.`,
            components: []
          });
          break;
        }
        case 'delete-channel': {
          const count = await scheduleService.deleteAllSchedulesForChannel(interaction.guildId, interaction.channelId);
          await confirmation.update({
            content: `Successfully deleted ${count} schedules from this channel.`,
            components: []
          });
          break;
        }
        case 'cancel':
          await confirmation.update({
            content: 'Operation cancelled.',
            components: []
          });
          break;
      }
    } catch (e) {
      await interaction.editReply({
        content: 'No response received within 30 seconds, operation cancelled.',
        components: []
      });
    }
  } catch (error) {
    console.error('Error in delete-all-schedules:', error);
    await interaction.editReply({
      content: 'An error occurred while trying to delete schedules.',
      components: []
    });
  }
}
