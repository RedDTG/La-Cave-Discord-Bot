const { PermissionsBitField } = require('discord.js');
const databases = { animes: require("../../data/animes.json"), notifications: require("../../data/notifications.json") }
const { writeFile } = require('fs');


module.exports = {
    name: 'animes-notification-button',
    permissions: [],
    runInteraction(client, interaction) {

        anime = databases.animes[interaction.message.id];
        notif = databases.notifications[anime.id];
        console.log(notif);

        console.log(`${interaction.user.id} Tu as appuyé sur : ${anime.id}, ${anime.title}`)
        let content="";
        if(notif.includes(interaction.user.id))
        {
            notif.splice(interaction.user.id, 1)
            content=`Tu as déjà ajouté **\`${anime.title}\`** dans ta liste - **\`/list\`** pour voir tous tes animes`
        }else{
            notif.push(interaction.user.id);
            content=`Tu as ajouté **\`${anime.title}\`** à ta liste de notification`
        }
        
        

        writeFile("data/notifications.json", JSON.stringify(databases.notifications), (err) => { if (err) { console.log(err) } });
        return interaction.reply({ content: content, ephemeral: true })
    }
};