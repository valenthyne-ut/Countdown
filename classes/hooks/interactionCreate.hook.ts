import { Interaction } from "discord.js";
import { ExtendedClient } from "cli-lib/ExtendedClient";
import { logger } from "shared-lib/classes/Logger";

export const interactionCreateHook = async (interaction: Interaction) => {
	if(interaction.user.bot) return;
	const client = interaction.client as ExtendedClient;

	if(interaction.isCommand()) {
		const clientCommand = client.getCommand(interaction.commandName);
		if(clientCommand == undefined) {
			logger.error("Missed command named", interaction.commandName);
		} else {
			clientCommand.execute(interaction);
		}
	}
};