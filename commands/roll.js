// This command will randomly choose an element from a json file and allow
// users to claim for themselves.s
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageEmbed, MessageButton } = require('discord.js');
const wait = require('util').promisify(setTimeout);
const fs = require('fs');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('roll')
		.setDescription('Roll for Cid pics!'),
	async execute(interaction) {
		const db = JSON.parse(fs.readFileSync('./commands/cid.json', 'utf8'));
		const index = Math.floor(Math.random() * 14);
		const cidRoll = db[index];
		var claim = `Claim`;
		var footer = ``;
		var style = `PRIMARY`;
		var disable = `false`;
		
		// Display info if claimed.
		if (cidRoll.claimed == true) {
			claim = `CLAIMED`;
			style = `SECONDARY`;
			disable = true;
		}

		// Button creator
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
		
		// Embed creator
		const embed = new MessageEmbed()
			.setColor('#0099ff')
			.setTitle(cidRoll.name)
			.setImage(cidRoll.link)
			.setFooter(footer);

		// Send interaction reply in channel
		await interaction.reply({ embeds: [embed], components: [row] });

		// Create interaction collector
		const filter = i => i.message.interaction.id === interaction.id;
		const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

		// Collect on interaction, update message and update json
		collector.on('collect', async i => {
			if (i.customId === cidRoll.name) {
				i.component.setDisabled(true);
				i.component.setStyle('SECONDARY');
				i.component.setLabel('CLAIMED!');
				embed.setFooter(`Claimed by ${i.user.username}!`)

				await i.update({
					embeds: [embed],
					components: [new MessageActionRow().addComponents(i.component)],
				});
				await i.followUp(`${i.user.username} has claimed ${cidRoll.name}.`);
				
				db[index].claimed = true;
				db[index].owner = i.user.username;
				const userStore = JSON.parse(fs.readFileSync('./commands/userstore.json', 'utf8'));
				if (userStore[i.user.username] == undefined){
					userStore[i.user.username] = [];
				}
				userStore[i.user.username].push(cidRoll.name);

				
				fs.writeFileSync('./commands/cid.json', JSON.stringify(db,null, ' '));
				fs.writeFileSync('./commands/userstore.json', JSON.stringify(userStore, null, ' '));

				collector.stop();
			}
		});

		collector.on('end', collected => {
			console.log(`Collected ${collected.size} items.`);
		});

		// If roll is not claimed, disable claim button and update message.
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