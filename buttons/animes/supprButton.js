const { PermissionsBitField } = require('discord.js');
const databases = { animes: require("../../data/animes.json"), notifications: require("../../data/notifications.json"), config: require("../../data/config.json"), }
const { writeFile } = require('fs');


module.exports = {
    name: 'animes-supprimer-button',
    permissions: [PermissionsBitField.Flags.ManageMessages],
    runInteraction(client, interaction) {

        const config = databases.config[interaction.guildId].animes;

        if (databases.animes[interaction.message.id]) {
            const id = databases.animes[interaction.message.id].message_id;
            client.channels.fetch(config).then(channel => {
                channel.messages.delete(id);
            });
            
            const index = databases.notifications.findIndex(obj => Object.keys(obj)[0] === databases.animes[interaction.message.id].id);
            if (index !== -1) {
                console.log(databases.notifications);
                databases.notifications.splice(index, 1);
                console.log(databases.notifications);
            }

            //delete databases.notifications[index];
            writeFile("data/notifications.json", JSON.stringify(databases.notifications), (err) => { if (err) { console.log(err) } });

            delete databases.animes[interaction.message.id];
            writeFile("data/animes.json", JSON.stringify(databases.animes), (err) => { if (err) { console.log(err) } });
        }

        interaction.message.delete();

        

        return interaction.reply({ content: 'Anime supprimé !', ephemeral: true })
    }
};