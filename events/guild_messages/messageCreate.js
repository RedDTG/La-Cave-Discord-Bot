const databases = { suggest: require("../../data/suggest.json"), report: require("../../data/report.json"), animes: require("../../data/animes.json"), config: require("../../data/config.json"), notifications: require("../../data/notifications.json") }
const { MessageFlags } = require("discord.js");
const { writeFile } = require('fs');
const axios = require('axios');
const { MessageChannel } = require("worker_threads");

module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(client, message) {
        async function getJour(id) {
            let jour_;
            let time_;
            const url = `https://api.jikan.moe/v4/anime/${id}`;
            const response = await axios.get(url, { 
                headers: { "Accept-Encoding": "gzip,deflate,compress" } 
            });
            //Date de Japon  à france   
            const jour_semaine = {
                nom_fr: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"],
                nom_en: ["Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays", "Sundays"]
            };

            for (const data in response.data.data) {
                if (data === "broadcast") {
                    const day = response.data.data[data].day;
                    time_ = response.data.data[data].time;
                    let index = jour_semaine.nom_en.findIndex((en) => en === day);

                    if (index !== -1) {
                        if (time_ < "07:00") {
                            index = index === 0 ? index = 6 : index -= 1;
                        }
                        jour_ = jour_semaine.nom_fr[index];
                        break;
                    }
                }
            }

            if (!jour_) return interaction.reply({ content: "Jour de diffusion non trouvé", ephemeral: true });

            return jour_;
        }

        const msg_type = [0, 20];

        if (message.guildId !== null && message.author.bot && (msg_type.includes(message.type)) && message.embeds.length !== 0 && message.webhookId === null) {
            const config = databases.config[message.guildId];
            let id;
            let channelId;
            let message_value;
            let command = false;
            let jour;

            if (message.channelId === config["report"]) {
                command = "report";
            } else if (config["animes"] || config["suggest"]) {

                const types = ["animes", "suggest"];
                const channels = {};
                const threads = {};

                for (const type of types) {
                    channels[type] = message.guild.channels.cache.get(config[type]);
                    if (channels[type]) {
                        threads[type] = channels[type].threads.cache.find(x => x.name === `Gestion-${type}`);
                        if (threads[type].parentId === message.channelId || threads[type].id === message.channelId) {
                            command = type;
                            channelId = threads[type].parentId;

                            if (command === "animes") {
                                const notif = databases.notifications;
                                const dernier_objet = notif[notif.length - 1];
                                id = Object.keys(dernier_objet)[Object.keys(dernier_objet).length - 1];
                                jour = await getJour(id);
                            }

                        }

                    }

                }

            }

            if (command) {

                let compare;
                if (command !== "report") { 
                    compare = (message.channelId !== channelId) 
                    if (command === "suggest") {
                        id = channelId;
                    }  
                }
                else {
                    compare = (message.channelId === config[command]);
                }  
                if (compare) {
                    message_value = message.id;                  
                } else {
                    const value = Object.values(databases[command]).find(o => o.id === id);
                    const index = Object.values(databases[command]).indexOf(value);
                    const key = Object.keys(databases[command])[index];
                    if (command === "suggest") {
                        id = undefined;
                    }  
                    message_value = key;
                };
                databases[command][message_value] = {
                    author: command !== 'animes' ? client.users.cache.find(user => user.username == message.embeds[0].footer.text.split("#")[0]).id : undefined,
                    title: message.embeds[0].title,
                    media: command === 'report' ? message.embeds[0].fields[0].value : undefined,
                    id: command !== 'report' ? id : undefined,
                    message_id: command !== 'report' ? message.id : undefined,
                    day: command === "animes" ? jour : undefined,
                }
                const configData = JSON.stringify(databases[command]);
                writeFile(`data/${command}.json`, configData, (err) => { if (err) { console.log(err) } });
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