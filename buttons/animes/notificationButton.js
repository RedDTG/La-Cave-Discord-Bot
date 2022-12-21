const { PermissionsBitField } = require('discord.js');
const databases = { animes: require("../../data/animes.json"), notifications: require("../../data/notifications.json") }
const { writeFile } = require('fs');


module.exports = {
    name: 'animes-notification-button',
    permissions: [],
    runInteraction(client, interaction) {

        
        const value = Object.values(databases.animes).find(o => o.message_id === interaction.message.id);
        notif = databases.notifications[value.id];
        
        let content="";
        if(notif.includes(interaction.user.id))
        {
            notif.pop();
            content=`Tu as enlevé **\`${value.title}\`** de ta liste - **\`/list\`** pour voir tous tes animes`
        }else{
            notif.push(interaction.user.id);
            content=`Tu as ajouté **\`${value.title}\`** à ta liste de notification`
        }
        
        

        writeFile("data/notifications.json", JSON.stringify(databases.notifications), (err) => { if (err) { console.log(err) } });
        return interaction.reply({ content: content, ephemeral: true })
    }
};