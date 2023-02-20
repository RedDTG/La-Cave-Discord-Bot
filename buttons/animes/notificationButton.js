const { PermissionsBitField } = require('discord.js');
const databases = { animes: require("../../data/animes.json"), notifications: require("../../data/notifications.json") }
const { writeFile } = require('fs');


module.exports = {
    name: 'animes-notification-button',
    permissions: [],
    runInteraction(client, interaction) {


        const value = Object.values(databases.animes).find(o => o.message_id === interaction.message.id);
        notif = databases.notifications;

        let content = "";

        const obj = notif.find(obj => Object.keys(obj)[0] === String(value.id));

        if (obj) {
            const exists = obj[String(value.id)].includes(interaction.user.id);

            if (exists) {
                obj[String(value.id)].splice(obj[value.id].indexOf(interaction.user.id), 1);
                content = `[ :x: ] Tu as enlevé **\`${value.title}\`** de ta liste de notification ! \n **\`/list\`** pour voir toutes tes notifications`
            } else {
                obj[String(value.id)].push(interaction.user.id);
                content = `[ :white_check_mark: ] Tu as ajouté **\`${value.title}\`** à ta liste de notification ! \n **\`/list\`** pour voir toutes tes notifications`
            }
        }
        
        const configData =  JSON.stringify(databases.notifications);
        writeFile("data/notifications.json", configData, (err) => { if (err) { console.log(err) } });
        return interaction.reply({ content: content, ephemeral: true })
    }
};