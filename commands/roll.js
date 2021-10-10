const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageEmbed, MessageButton } = require('discord.js');
const wait = require('util').promisify(setTimeout);
const json = require('./cid.json')


module.exports = {
	data: new SlashCommandBuilder()
		.setName('roll')
		.setDescription('Roll for Cid pics!'),
	async execute(interaction) {
		const index = Math.floor(Math.random() * 14);
		const title = json[index].name;
		const link = json[index].link;		
		const row = new MessageActionRow()
			.addComponents(
				// eslint-disable-next-line no-undef
				claim = new MessageButton()
					.setDisabled(false)
					.setCustomId(title)
					.setLabel('Claim')
					.setStyle('PRIMARY'),
			);
		
		const embed = new MessageEmbed()
			.setColor('#0099ff')
			.setTitle(title)
			.setImage(link);

		await interaction.reply({ embeds: [embed], components: [row] });

		const filter = i => i.message.interaction.id === interaction.id;
		const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

		collector.on('collect', async i => {
			if (i.customId === title) {
				i.component.setDisabled(true);
				i.component.setStyle('SECONDARY');
				i.component.setLabel('CLAIMED!');
				await i.update({
					components: [new MessageActionRow().addComponents(i.component)],
				});
				await i.followUp(`${i.user.username} has claimed ${title}.`);
				collector.stop();
			}
		});

		collector.on('end', collected => {
			console.log(`Collected ${collected.size} items.`);
		});

		await wait(10000);

		if (!collector.ended) {
			await row.components[0]
				.setDisabled(true)
				.setLabel('Time\'s up!')
				.setStyle('SECONDARY');
			await interaction.editReply({ components: [row] });
		}

	},
};