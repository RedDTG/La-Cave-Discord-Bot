const { PermissionsBitField } = require('discord.js');
const databases = { animes: require("../../data/animes.json"), notifications: require("../../data/notifications.json") }
const { writeFile } = require('fs');


module.exports = {
    name: 'animes-supprimer-button',
    permissions: [PermissionsBitField.Flags.ManageMessages],
    runInteraction(client, interaction) {

        if (databases.animes[interaction.message.id]) {
            const index = databases.animes[interaction.message.id].id;
            delete databases.notifications[index];
            writeFile("data/notifications.json", JSON.stringify(databases.notifications), (err) => { if (err) { console.log(err) } });

            delete databases.animes[interaction.message.id];
            writeFile("data/animes.json", JSON.stringify(databases.animes), (err) => { if (err) { console.log(err) } });
        }

        interaction.message.delete();

        return interaction.reply({ content: 'Anime supprimé !', ephemeral: true })
    }
};