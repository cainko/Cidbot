const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');

const db = JSON.parse(fs.readFileSync('./commands/cid.json', 'utf8'));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('im')
        .setDescription('View specific Cid pic.')
        .addStringOption(option => option.setName('input').setDescription('The Cid pic to view')),
    async execute(interaction) {
        const value = interaction.options.getString('input');
        var cidRoll = null;
        for (let i = 0; i< Object.keys(db).length; i++){
            if (db[i].name == value) {
                console.log('found');
                var cidRoll = db[i];
            }
        }

        if (cidRoll == null) {
            await interaction.reply({ content: 'Specified Cid pic could not be found.', ephemeral: true});
        }
        else{
        var footer = ``;
        if (cidRoll.claimed == true) {
            footer = `Owned by ${cidRoll.owner}.`
        }

        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(cidRoll.name)
            .setImage(cidRoll.link)
            .setFooter(footer);

        await interaction.reply({ embeds: [embed] });
        }
    },
};