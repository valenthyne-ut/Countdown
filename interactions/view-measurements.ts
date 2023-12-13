import { ActionRowBuilder, ButtonStyle, ChatInputCommandInteraction, MessageComponentInteraction, SlashCommandBuilder } from "discord.js";
import { Measurement } from "../classes/db/models/Measurement.model";
import { ButtonBuilder, EmbedBuilder } from "discord.js";

const unitsPerPage = 5;

const getUnitPagesCount = async (guildId: string): Promise<number> => {
	const unitTotal = await Measurement.count({
		where: {
			guild_id: guildId
		}
	});

	return Math.floor(unitTotal / unitsPerPage) + 1;
};

const getEmbedArrayFromPage = async (guildId: string, pageNumber: number, maxPages: number): Promise<Array<EmbedBuilder>> => {
	const units = (await Measurement.findAll({
		where: {
			guild_id: guildId,
		},
		limit: unitsPerPage,
		offset: (pageNumber - 1) * unitsPerPage
	})).map(unit => unit.toJSON());

	const unitEmbeds: Array<EmbedBuilder> = [];
	units.forEach((unit, index) => {
		const unitEmbed = new EmbedBuilder()
			.setTitle(unit.name)
			.setDescription(`Multiplier: ${unit.multiplier}`)
			.setColor("#2B2D31");	
		if(index == 4 || units.length - 1 == index) { unitEmbed.setFooter({text: `${pageNumber} out of ${maxPages} pages`}); }

		unitEmbeds.push(unitEmbed);
	});

	return unitEmbeds;
};
export const data = new SlashCommandBuilder()
	.setName("view-measurements")
	.setDescription("View the measurement units available in this server.")
	.setDMPermission(false);

export const execute = async (interaction: ChatInputCommandInteraction) => {
	if(interaction.guildId == null) return;
	
	const guildId = interaction.guildId;

	await interaction.deferReply();

	let unitPages = await getUnitPagesCount(guildId);

	const pageNumberOptionValue = interaction.options.getInteger("page-number", false);
	const pageNumber = (pageNumberOptionValue != null && (pageNumberOptionValue > 0 && pageNumberOptionValue <unitPages)) ?
		pageNumberOptionValue:
		1;

	const paginationButtonGroup = new ActionRowBuilder<ButtonBuilder>()
		.addComponents(
			new ButtonBuilder()
				.setCustomId("previous")
				.setLabel("<-")
				.setStyle(ButtonStyle.Primary),
			new ButtonBuilder()
				.setCustomId("next")
				.setLabel("->")
				.setStyle(ButtonStyle.Primary)
		);

	const unitEmbeds = await getEmbedArrayFromPage(guildId, pageNumber, unitPages);
	if(unitEmbeds.length == 0) {
		await interaction.followUp({
			content: "This server doesn't have any measurement units."
		});
	} else {
		await interaction.followUp({
			embeds: unitEmbeds,
			components: [paginationButtonGroup]
		}).then(async response => {
			const filter = (filterInteraction: MessageComponentInteraction) => {
				filterInteraction.deferUpdate();
				return filterInteraction.user.id === interaction.user.id;
			};

			let rejected = false;

			while(!rejected) {
				const responseMessage = await response.fetch();
				await response.awaitMessageComponent({filter: filter, time: 60000})
					.then(async confirmation => {
						const embedPage = parseInt(responseMessage.embeds.pop()!.footer!.text.split(" ").shift()!);
						unitPages = await getUnitPagesCount(guildId);
						let nextPage = pageNumber;

						switch(confirmation.customId) {
						case "previous":
							if(embedPage > 1) {
								nextPage = embedPage - 1;
							}
							break;

						case "next":
							if(embedPage < unitPages) {
								nextPage = embedPage + 1;
							}
							break;
						}

						await responseMessage.edit({
							embeds: await getEmbedArrayFromPage(guildId, nextPage, unitPages)
						});
					})
					.catch(async () => {
						await response.fetch().then(fetched =>{
							fetched.edit({
								components: [
									new ActionRowBuilder<ButtonBuilder>()
										.addComponents(
											new ButtonBuilder()
												.setCustomId("halted")
												.setLabel("🛑")
												.setStyle(ButtonStyle.Secondary)
												.setDisabled(true)
										)
								]
							});
						}).catch(() => { return; });
						rejected = true;
					});
			}
		});
	}
};