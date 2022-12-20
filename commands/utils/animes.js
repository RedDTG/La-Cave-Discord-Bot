const { TextInputBuilder, TextInputStyle, ActionRowBuilder, ModalBuilder } = require('discord.js');

const animesModal = new ModalBuilder()
    .setCustomId('animes-modal')
    .setTitle('Entrez un nouvel anime')
    .addComponents([
        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('animes-title')
                .setLabel('Titre')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder(`My Hero Academia (pas besoin de préciser la saison)`)
                .setRequired(true)
        )
    ]);


module.exports = {
    name: 'add-anime',
    description: 'Ajoute un anime à la Saison actuelle !',
    permissions: [],
    runInteraction: async (client, interaction) => {

        await interaction.showModal(animesModal);

    }
}