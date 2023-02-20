const { TextInputBuilder, TextInputStyle, ActionRowBuilder, ModalBuilder, PermissionsBitField } = require('discord.js');
const animesModal = require('../../modals/animes/animesModal');
const databases = { config: require("../../data/config.json"), notifications: require("../../data/notifications.json"), animes: require("../../data/animes.json"),  }

module.exports = {
    name: 'list',
    description: 'Liste les animes auxquels tu es notifié !',
    permissions: [],
    runInteraction: async (client, interaction) => {
        notifs = databases.notifications;
        animes = databases.animes;

        const keys = notifs.filter(obj => {
            const key = Object.keys(obj)[0];
            return obj[key].includes(interaction.user.id);
          }).map(obj => Object.keys(obj)[0]);

        let title = "";
        keys.forEach(key => {
            title += "- ";
            title += Object.values(animes).find(item => item.id === String(key)).title;
            title += "\n";
        });
        if (title === "") title = "Pas encore de notifications pour toi :)";
        
        return interaction.reply({ content: ` Voici ta liste : \n \`\`\`${title}\`\`\``, ephemeral: true });
        
        

    }
}