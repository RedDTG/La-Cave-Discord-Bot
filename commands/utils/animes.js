const { TextInputBuilder, TextInputStyle, ActionRowBuilder, ModalBuilder } = require('discord.js');

const animesSModal = new ModalBuilder()
    .setCustomId('ajout-modal-anime')
    .setTitle('Entrez un nouvel anime')
    .addComponents([
        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('title')
                .setLabel('Titre')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder(`My Hero Academia (pas besoin de préciser la saison)`)
                .setRequired(true)
        )
    ]);


module.exports = {
    name: 'animes',
    description: 'Ajoute un anime à la Saison actuelle !',
    permissions: [],
    runInteraction: async (client, interaction) => {

        await interaction.showModal(animesSModal);

    }
}