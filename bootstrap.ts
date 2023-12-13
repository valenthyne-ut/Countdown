import { GatewayIntentBits } from "discord.js";
import { interactionCreateHook } from "./classes/hooks/interactionCreate.hook";
import { readyHook } from "./classes/hooks/ready.hook";
import { ExtendedClient } from "cli-lib/ExtendedClient";
import { dirname, join } from "path";
import { ClientInstanceConfig } from "shared-lib/types/ClientInstanceConfig";

export const init = async (config: ClientInstanceConfig) => {
	const interactionsFolderPath = join(dirname(__filename), "interactions");
	const client = new ExtendedClient({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMessages
		]
	}, config, interactionsFolderPath);

	client.on("ready", readyHook);
	client.on("interactionCreate", interactionCreateHook);

	await client.login(config.token);
};