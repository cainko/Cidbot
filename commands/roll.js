const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageEmbed, MessageButton } = require('discord.js');
const wait = require('util').promisify(setTimeout);
const fs = require('fs');

const db = JSON.parse(fs.readFileSync('./commands/cid.json', 'utf8'));

module.exports = {
	data: new SlashCommandBuilder()
		.setName('roll')
		.setDescription('Roll for Cid pics!'),
	async execute(interaction) {
		
		const index = Math.floor(Math.random() * 14);
		const cidRoll = db[index];
		var claim = `Claim`;
		var footer = ``;
		var style = `PRIMARY`;
		var disable = `false`;
		
		if (cidRoll.claimed == true) {
			claim = `CLAIMED`;
			style = `SECONDARY`;
			disable = true;
		}

		const row = new MessageActionRow()
			.addComponents(
				claim = new MessageButton()
					.setDisabled(disable)
					.setCustomId(cidRoll.name)
					.setLabel(claim)
					.setStyle(style),
			);
		if (cidRoll.claimed == true) {
			footer = `Owned by ${cidRoll.owner}.`
		}
		
		const embed = new MessageEmbed()
			.setColor('#0099ff')
			.setTitle(cidRoll.name)
			.setImage(cidRoll.link)
			.setFooter(footer);

		await interaction.reply({ embeds: [embed], components: [row] });

		const filter = i => i.message.interaction.id === interaction.id;
		const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

		collector.on('collect', async i => {
			if (i.customId === cidRoll.name) {
				i.component.setDisabled(true);
				i.component.setStyle('SECONDARY');
				i.component.setLabel('CLAIMED!');
				embed.setFooter(`Claimed by${i.user.username}!`)

				await i.update({
					embeds: [embed],
					components: [new MessageActionRow().addComponents(i.component)],
				});
				await i.followUp(`${i.user.username} has claimed ${cidRoll.name}.`);
				
				db[index].claimed = true;
				db[index].owner = i.user.username;
				
				fs.writeFileSync('./commands/cid.json', JSON.stringify(db,null, ' '));

				collector.stop();
			}
		});

		collector.on('end', collected => {
			console.log(`Collected ${collected.size} items.`);
		});

		await wait(10000);

		if (!collector.ended && cidRoll.claimed == false) {
			await row.components[0]
				.setDisabled(true)
				.setLabel('Time\'s up!')
				.setStyle('SECONDARY');
			await interaction.editReply({ components: [row] });
		}

	},
};