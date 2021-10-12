// Look up info on user claims, and display them.
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Message } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mm')
        .setDescription('View your Cid claims.'),
    async execute(interaction) {
        // Read userstore file
        const db = JSON.parse(fs.readFileSync('./commands/userstore.json', 'utf8'));
        const user = interaction.user.username;

        // Search for 
        var cidRoll = db[user];

        // Reply if no element found.
        if (cidRoll == null) {
            await interaction.reply({ content: 'You have no claims.', ephemeral: true });
        }
        else {
            var claimDesc = "";
            for (let i = 0; i < cidRoll.length; i++) {
                claimDesc = claimDesc + cidRoll[i] + '\n'
            }
            // Create embed for message and send message
            const embed = new MessageEmbed()
                .setTitle(`${user}'s claims`)
                .setDescription(claimDesc)

            await interaction.reply({ embeds: [embed] });
        }
    },
};