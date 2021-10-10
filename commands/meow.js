const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('meow')
        .setDescription('Cid reply!'),
    async execute(interaction) {
        return interaction.reply('Meow!');
    },
}