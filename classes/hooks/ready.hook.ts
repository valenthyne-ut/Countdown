import { Client } from "discord.js";
import { logger } from "shared-lib/classes/Logger";
import { sequelize } from "../db";
import { ExtendedClient } from "cli-lib/ExtendedClient";

export const readyHook = async (client: Client) => {
	const extendedClient = client as ExtendedClient;

	logger.success(extendedClient.user?.tag, "ready.");
	await sequelize.sync();

	if(extendedClient.getShouldDeployCommands()) {
		extendedClient.deployCommands();
	}
};