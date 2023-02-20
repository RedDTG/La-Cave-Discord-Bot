const { TextInputBuilder, TextInputStyle, ActionRowBuilder, ModalBuilder, PermissionsBitField } = require('discord.js');
const databases = { config: require("../../data/config.json") }

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
    permissions: [PermissionsBitField.Flags.ManageMessages],
    runInteraction: async (client, interaction) => {
        function isEmpty(obj) {
            return JSON.stringify(obj) === '{}';
        }

        if (isEmpty(databases.config)) {
            return interaction.reply({ content: `Aucun channel n'est configuré`, ephemeral: true });
        } else if (!databases.config[interaction.guildId].hasOwnProperty('animes')){
            return interaction.reply({ content: `Le channel pour la commande : **\`/add-anime\`**, n'est pas configuré`, ephemeral: true });
        }else{
            return interaction.showModal(animesModal);
        }

        

    }
}