const databases = { suggest: require("../../data/suggest.json"), report: require("../../data/report.json"), animes: require("../../data/animes.json"), config: require("../../data/config.json"), notifications: require("../../data/notifications.json") }
const { MessageFlags } = require("discord.js");
const { writeFile } = require('fs');
const axios = require('axios');

module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(client, message) {

        const msg_type = [0, 20];

        if (message.guildId !== null && message.author.bot && (msg_type.includes(message.type)) && message.embeds.length !== 0 && message.webhookId === null) {
            const config = databases.config[message.guildId];
            let id;
            let channelThreadId;
            let message_value;
            let command = false;
            let jour;
            let time;

            if (message.channelId === config["suggest"]) {
                command = "suggest";
            } else if (message.channelId === config["report"]) {
                command = "report";
            } else if (config["animes"]) {
                const channel = message.guild.channels.cache.get(config["animes"])
                const thread = channel.threads.cache.find(x => x.name === 'Gestion-animes');

                if (thread.parentId === message.channelId || thread.id === message.channelId) {
                    command = "animes";
                    channelThreadId = thread.parentId;
                    const notif = databases.notifications;
                    const dernier_objet = notif[notif.length - 1];
                    id = Object.keys(dernier_objet)[Object.keys(dernier_objet).length - 1];

                    const url = `https://api.jikan.moe/v4/anime/${id}`;
                    const response = await axios.get(url);
                    //Date de Japon  à france   
                    const jour_semaine = {
                        nom_fr: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"],
                        nom_en: ["Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays", "Sundays"]
                    };
                    
                    for (const data in response.data.data) {
                        if (data === "broadcast") {
                            const day = response.data.data[data].day;
                            time = response.data.data[data].time;
                            let index = jour_semaine.nom_en.findIndex((en) => en === day);

                            if (index !== -1) {
                                if (time < "07:00") {
                                    index = index === 0 ? index = 6 : index -= 1;
                                }
                                jour = jour_semaine.nom_fr[index];
                                break;
                            }
                        }
                    }

                    if (!jour) return interaction.reply({ content: "Jour de diffusion non trouvé", ephemeral: true });
                }
            }

            if (command) {

                let compare;
                if (command === "animes") { compare = (message.channelId !== channelThreadId) }
                else {
                    compare = (message.channelId === config[command]);
                }
                if (compare) {
                    message_value = message.id;
                } else {
                    const value = Object.values(databases[command]).find(o => o.id === id);
                    const index = Object.values(databases[command]).indexOf(value);
                    const key = Object.keys(databases[command])[index];
                    message_value = key;
                };
                databases[command][message_value] = {
                    author: command !== 'animes' ? client.users.cache.find(user => user.username == message.embeds[0].footer.text.split("#")[0]).id : undefined,
                    title: message.embeds[0].title,
                    media: command === 'report' ? message.embeds[0].fields[0].value : undefined,
                    id: command === 'animes' ? id : undefined,
                    message_id: command === 'animes' ? message.id : undefined,
                    day: command === "animes" ? jour : undefined,
                }

                writeFile(`data/${command}.json`, JSON.stringify(databases[command]), (err) => { if (err) { console.log(err) } });
            }

        }

        if (!message.author.bot && message.content.startsWith("+suggest")) {
            return message.reply({ content: `La commande +suggest n'existe plus ! Veuillez utiliser **\`/suggest\`** à la place !` });
        }

        // if (message.author.bot) return;
        // if (!message.content.startsWith(prefix)) return;

        // const args = message.content.slice(prefix.length).trim().split(/ +/g);
        // const cmdName = args.shift().toLowerCase();
        // if (cmdName.length == 0) return;

        // let cmd = client.commands.get(cmdName);
        // if (cmd) cmd.run(client, message, args);
    },
}