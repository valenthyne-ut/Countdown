import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Measurement } from "../classes/db/models/Measurement.model";

export const data = new SlashCommandBuilder()
	.setName("create-measurement")
	.setDescription("Create a new measurement unit for the bot to use.")
	.addStringOption(option =>
		option
			.setName("name")
			.setDescription("The measurement unit's name.")
			.setRequired(true))
	.addNumberOption(option =>
		option
			.setName("multiplier")
			.setDescription("The unit's multiplier compared to a second (a day would be a multiplier of 86400).")
			.setRequired(true))
	.setDMPermission(false)
	.setDefaultMemberPermissions(32);

export const execute = async (interaction: ChatInputCommandInteraction) => {
	if(interaction.guildId == null) return;
	
	await interaction.deferReply();

	const measurementName = interaction.options.getString("name", true);
	const measurementMultiplier = interaction.options.getNumber("multiplier", true);

	const exists = await Measurement.findOne({
		where: {
			name: measurementName,
			guild_id: interaction.guildId
		}
	});

	if(exists) {
		await interaction.followUp({
			content: `A measurement unit with the name **${measurementName}** already exists.`,
			ephemeral: true
		});
	} else {
		await Measurement.create({
			name: measurementName,
			multiplier: measurementMultiplier,
			guild_id: interaction.guildId
		})
			.then(async (measurement) => {
				await interaction.followUp({
					content: `Successfully created a new measurement unit with the name **${measurement.name}** and a multiplier of **${measurement.multiplier}**.`
				});
			})
			.catch(async () => {
				await interaction.followUp({
					content: "Couldn't create a new measurement unit. Please try again.",
					ephemeral: true
				});
			});
	}
};