const { TextInputBuilder, TextInputStyle, ActionRowBuilder, ModalBuilder } = require('discord.js');
const databases = { config: require("../../../data/config.json") }

const modal = new ModalBuilder()
    .setCustomId('report-modal')
    .setTitle('Reportez un bug !')
    .addComponents([
        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('report-title')
                .setLabel('Titre de votre bug')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder(`Sous-titres partiels et lecture impossible`)
                .setRequired(true)
        ),

        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('report-media')
                .setLabel(`Quel média ? ('Aucun' si problème général)`)
                .setStyle(TextInputStyle.Short)
                .setPlaceholder(`L'Incendie du monastère du Lotus rouge`)
                .setRequired(true)
        ),

        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('report-details')
                .setLabel('Détails du problème')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder(`Les sous-titres disparaissent à partir de 47:25 et la lecture s'arrête à 1:23:14.`)
                .setRequired(true)
        )
    ]);


module.exports = {
    name: 'report',
    description: 'Reportez un bug !',
    permissions: [],
    runInteraction: async (client, interaction) => {
        function isEmpty(obj) {
            return JSON.stringify(obj) === '{}';
        }

        if (isEmpty(databases.config)) {
            return interaction.reply({ content: `Aucun channel n'est configuré`, ephemeral: true });
        } else if (!databases.config[interaction.guildId].hasOwnProperty('report')) {
            return interaction.reply({ content: `Le channel pour la commande : **\`/report\`**, n'est pas configuré`, ephemeral: true });
        } else {
            await interaction.showModal(modal);
        }
    }
}