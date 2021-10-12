// Look up info on elements in roll json, and show if element is claimed by a user.
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('im')
        .setDescription('View specific Cid pic.')
        .addStringOption(option => 
            option
                .setName('input')
                .setDescription('The Cid pic to view')
                .setRequired(true)
        ),
    async execute(interaction) {
        // Read file and user input
        const db = JSON.parse(fs.readFileSync('./commands/cid.json', 'utf8'));
        const value = interaction.options.getString('input');

        // Search for specified element
        var cidRoll = null;
        for (let i = 0; i< Object.keys(db).length; i++){
            if (db[i].name == value) {
                var cidRoll = db[i];
            }
        }

        // Reply if no element found.
        if (cidRoll == null) {
            await interaction.reply({ content: 'Specified Cid pic could not be found.', ephemeral: true});
        }
        else{
        var footer = ``;
        if (cidRoll.claimed == true) {
            footer = `Owned by ${cidRoll.owner}.`
        }

        // Create embed for message and send message
        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(cidRoll.name)
            .setImage(cidRoll.link)
            .setFooter(footer);

        await interaction.reply({ embeds: [embed] });
        }
    },
};