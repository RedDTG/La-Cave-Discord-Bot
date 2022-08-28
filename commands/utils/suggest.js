const { TextInputBuilder, TextInputStyle, ActionRowBuilder, ModalBuilder, SelectMenuBuilder } = require('discord.js');

const modal = new ModalBuilder()
    .setCustomId('suggest-modal')
    .setTitle('Demandez un nouveau média')
    .addComponents([
        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('suggest-title')
                .setLabel('Titre')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder(`L'Incendie du monastère du Lotus rouge`)
                .setRequired(true)
        ),

        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('suggest-type')
                .setLabel('Type (Anime, Film, Série, Livre audio)')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder(`Film`)
                .setRequired(true)
        ),

        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('suggest-year')
                .setLabel('Année')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder(`1928`)
                .setRequired(true)
        ),

        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('suggest-infos')
                .setLabel('Informations complémentaires')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder(`En qualité 2160p 4K UHD et un son Dolby 5.1 True HD ATMOS pour le regarder sur mon téléphone stp`)
                .setRequired(false),
        )

    ]);


module.exports = {
    name: 'suggest',
    description: 'Demandez un nouveau média',
    permissions: [],
    runInteraction: async (client, interaction) => {

        await interaction.showModal(modal);

    }
}