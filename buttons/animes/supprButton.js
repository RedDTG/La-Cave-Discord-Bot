const { PermissionsBitField } = require('discord.js');
const databases = { animes: require("../../data/animes.json"), notifications: require("../../data/notifications.json"), config: require("../../data/config.json"), }
const { writeFile } = require('fs');


module.exports = {
    name: 'animes-supprimer-button',
    permissions: [PermissionsBitField.Flags.ManageMessages],
    async runInteraction(client, interaction) {

        const config = databases.config[interaction.guildId];

        if (databases.animes[interaction.message.id]) {
            const id = databases.animes[interaction.message.id].message_id;
            const data_suppr = databases.animes[interaction.message.id];

            const channel_calendar = await interaction.guild.channels.cache.get(config["calendar"]);
            const calendar_msg = await channel_calendar.messages.fetch(config["calendar_msg_id"]);
            const embed_calendar = await calendar_msg.embeds[0];

            embed_calendar.fields.forEach((semaine, index)=>{
                if (data_suppr.day.toLowerCase() === semaine.name.toLowerCase()){
                    embed_calendar.fields[index].value = embed_calendar.fields[index].value.replaceAll('`', "");
                    embed_calendar.fields[index].value = embed_calendar.fields[index].value.replaceAll(`\n- ${data_suppr.title}`, ""); 
                    if (embed_calendar.fields[index].value){
                        embed_calendar.fields[index].value = "```"+embed_calendar.fields[index].value+"```";
                    }else{
                        embed_calendar.fields[index].value = "```"+embed_calendar.fields[index].value+" ```";
                    }
                }
            })
            await  channel_calendar.messages.fetch(calendar_msg.id).then(msg => {msg.edit({ embeds: [embed_calendar]})});
            
            client.channels.fetch(config["animes"]).then(channel => {
                channel.messages.delete(id);
            });

            const index = databases.notifications.findIndex(obj => Object.keys(obj)[0] === databases.animes[interaction.message.id].id);
            if (index !== -1) {
                databases.notifications.splice(index, 1);
            }
            
            writeFile("data/notifications.json", JSON.stringify(databases.notifications), (err) => { if (err) { console.log(err) } });

            delete databases.animes[interaction.message.id];
            writeFile("data/animes.json", JSON.stringify(databases.animes), (err) => { if (err) { console.log(err) } });
        }

       await interaction.message.delete();

        

        return interaction.reply({ content: 'Anime supprimé !', ephemeral: true })
    }
};