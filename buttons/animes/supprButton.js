const { PermissionsBitField } = require('discord.js');
const databases = { animes: require("../../data/animes.json"), notifications: require("../../data/notifications.json"), config: require("../../data/config.json"), }
const yarss = { yarss: require("../../data/yarss2/yarss2.json") }
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

            embed_calendar.fields.forEach((semaine, index) => {
                if (data_suppr.day.toLowerCase() === semaine.name.toLowerCase()) {
                    const lignes = embed_calendar.fields[index].value.split('\n');
                    const lignesFiltrees = lignes.filter(ligne => !ligne.includes(data_suppr.title)).filter((ligne) => {return ligne !== '';});
                    const nouveauTexte = lignesFiltrees.join('\n');
                    embed_calendar.fields[index].value = nouveauTexte;
                    
                    if (embed_calendar.fields[index].value !== "```ini\n```") {

                        embed_calendar.fields[index].value = embed_calendar.fields[index].value;
                    } else {
                        embed_calendar.fields[index].value = "``` ```";
                    }
                }
            })
            await channel_calendar.messages.fetch(calendar_msg.id).then(msg => { msg.edit({ embeds: [embed_calendar] }) });

            await client.channels.fetch(config["animes"]).then(channel => {
                channel.messages.delete(id);
            }).then(() =>
            setTimeout(() => {
                interaction.message.delete()
            }, 1000));

            const index = databases.notifications.findIndex(obj => Object.keys(obj)[0] === databases.animes[interaction.message.id].id);
            if (index !== -1) {
                const rssJson = yarss.yarss;

                delete rssJson.subscriptions[index];
                let i = 0;
                for (const key in rssJson.subscriptions) {
                    if (parseInt(i) !== parseInt(key)) {
                        rssJson.subscriptions[i] = rssJson.subscriptions[key];
                        rssJson.subscriptions[i].key = `${i}`;
                        delete rssJson.subscriptions[key];
                    }
                    i++;
                }
                const configDataRss = JSON.stringify(rssJson, null, 4)
                writeFile("data/yarss2/yarss2.json", configDataRss, (err) => { if (err) { console.log(err) } });

                const conf = JSON.stringify(yarss.yarss, null, 4);
                const str_start = JSON.stringify(JSON.parse('{"file": 8,"format": 1}'), null, 2);
                const str_FINAL = str_start + conf
                writeFile("data/yarss2/yarss2.conf", str_FINAL, (err) => { if (err) { console.log(err) } });

                databases.notifications.splice(index, 1);
            }

            const configData = JSON.stringify(databases.notifications);
            writeFile("data/notifications.json", configData, (err) => { if (err) { console.log(err) } });

            delete databases.animes[interaction.message.id];
            const configData_ = JSON.stringify(databases.animes);
            writeFile("data/animes.json", configData_, (err) => { if (err) { console.log(err) } });
        }

        return interaction.reply({ content: 'Anime supprimé !', ephemeral: true })
    }
};