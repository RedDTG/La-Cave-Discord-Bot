const { TextInputBuilder, TextInputStyle, ActionRowBuilder, ModalBuilder, PermissionsBitField } = require('discord.js');
const animesModal = require('../../modals/animes/animesModal');
const databases = { config: require("../../data/config.json"), notifications: require("../../data/notifications.json"), animes: require("../../data/animes.json"),  }

module.exports = {
    name: 'list',
    description: 'Ajoute un anime à la Saison actuelle !',
    permissions: [],
    runInteraction: async (client, interaction) => {
        notifs = databases.notifications;
        animes = databases.animes;

        const keys = notifs.filter(obj => {
            const key = Object.keys(obj)[0];
            return obj[key].includes(interaction.user.id);
          }).map(obj => Object.keys(obj)[0]);

        console.log(keys);

        let title = "";
        keys.forEach(key => {
            console.log(key);
            title += "- ";
            title += Object.values(animes).find(item => item.id === String(key)).title;
            title += "\n";
        });

          

          
        
        return interaction.reply({ content: ` Voici votre liste : \n \`\`\`${title}\`\`\``, ephemeral: true });
        
        

    }
}