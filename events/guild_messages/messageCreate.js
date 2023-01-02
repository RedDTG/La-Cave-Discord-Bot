const databases = { suggest: require("../../data/suggest.json"), report: require("../../data/report.json"), animes: require("../../data/animes.json"), config: require("../../data/config.json"), notifications: require("../../data/notifications.json") }
const yarss = { yarss: require("../../data/yarss2/yarss2.json") }
const { writeFile } = require('fs');
const axios = require('axios');

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

        function setYarss() {
            //Yarss2 config
            const key = Object.keys(yarss.yarss.rssfeeds).length;
            const new_anime_feed = JSON.parse('{"active": true,"key": "0","last_update": "2022-12-27T21:36:09+00:00","name": "One Piece","obey_ttl": true,"prefer_magnet": false,"site": "rss-tsundere.deta.dev","update_interval": 5,"update_on_startup": true,"url": "https://rss-tsundere.deta.dev/rss/nyaa","user_agent": ""}');
            const new_anime_sub = JSON.parse('{"active": true,"add_torrents_in_paused_state": "Default","auto_managed": "Default","custom_text_lines": "","download_location": "/ocean/animes/One Piece/S1/","email_notifications": {},"ignore_timestamp": false,"key": "0","label": "","last_match": "2022-12-25T08:22:24+00:00","max_connections": -2,"max_download_speed": -2,"max_upload_slots": -2,"max_upload_speed": -2,"move_completed": "/ocean/animes/One Piece/S1/","name": "One Piece","prioritize_first_last_pieces": "Default","regex_exclude": ".mp4","regex_exclude_ignorecase": true,"regex_include": "(?=.*One Piece)(?=.*1080)","regex_include_ignorecase": true,"rssfeed_key": "0","sequential_download": "Default"}');

            const id_last_anime = Object.keys(databases.notifications[key])[0];
            const last_anime = Object.values(databases.animes).find(o => o.id === id_last_anime);
            const date = new Date(Date.now()).toISOString().replace(/\.\d+/, "").replace(/Z$/, "+00:00");

            new_anime_feed.key = String(`${key}`);
            new_anime_feed.last_update = date;
            new_anime_feed.name = last_anime.title;

            const str = last_anime.title.replace(/[\/#,+$~%"`:;*?<>{}|^@]+/, "");
            const word_part = str.split(" ");
            const index_rss = word_part.findIndex(word_part => word_part === "Saison");
            let title_rss;
            if (index_rss === -1) {
                title_rss = str;
                saison = 1;
            } else {
                saison = +word_part[index_rss + 1];
                title_rss = word_part.slice(0, index_rss).join(" ").replace(/ -\s*$/, "");;
            }

            const path = `/ocean/animes/${title_rss}/S${saison}`;
            const regex = last_anime.title.split(" ").slice(0, 2).join(" ");

            new_anime_sub.key = String(`${key}`);;
            new_anime_sub.last_match = date;
            new_anime_sub.rssfeed_key = String(`${key}`);;
            new_anime_sub.name = last_anime.title;
            new_anime_sub.download_location = path;
            new_anime_sub.move_completed = path;
            new_anime_sub.regex_include = `(?=.*${regex})(?=.*1080)`;

            const rssJson = yarss.yarss;

            rssJson.rssfeeds[key] = new_anime_feed;
            rssJson.subscriptions[key] = new_anime_sub;

            const configDataRss = JSON.stringify(rssJson)
            writeFile("data/yarss2/yarss2.json", configDataRss, (err) => { if (err) { console.log(err) } });

            const conf = JSON.stringify(yarss.yarss);
            const str_start = '{"file": 8,"format": 1}';
            const str_FINAL = str_start + conf;
            writeFile("data/yarss2/yarss2.conf", str_FINAL, (err) => { if (err) { console.log(err) } });

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
                
                if (command === "animes" && compare){
                    setYarss();
                }
            }

        }

        if (!message.author.bot && message.content.startsWith("+suggest")) {
            return message.reply({ content: `La commande +suggest n'existe plus ! Veuillez utiliser **\`/suggest\`** à la place !` });
        }
        /*
                if (!message.author.bot && message.content.startsWith("!test")) {
                    const key = Object.keys(yarss.yarss.rssfeeds).length;
                    const new_anime_feed = yarss.rssfeed.rssfeeds[0];
                    const new_anime_sub = yarss.subscription.subscriptions[0];
                    
                    const id_last_anime = Object.keys(databases.notifications[parseInt(key - 1)])[0];
                    const last_anime = Object.values(databases.animes).find(o => o.id === id_last_anime);
                    const date = new Date(Date.now()).toISOString().replace(/\.\d+/, "").replace(/Z$/, "+00:00");
        
                    new_anime_feed.key = String(`${key}`);
                    new_anime_feed.last_update = date;
                    new_anime_feed.name = last_anime.title;
        
                    const str = last_anime.title.replace(/[\/#,+$~%"`:;*?<>{}|^@]+/, "");
                    const word_part = str.split(" ");
                    const index = word_part.findIndex(word_part => word_part === "Saison");
                    let title;
                    if (index === -1) {
                        title = str;
                        saison = 1;
                    } else {
                        saison = +word_part[index + 1];
                        title = word_part.slice(0, index).join(" ").replace(/ -\s*$/, "");;
                    }
        
                    const path = `/ocean/animes/${title}/S${saison}`;
                    const regex = last_anime.title.split(" ").slice(0, 2).join(" ");
        
                    new_anime_sub.key = String(`${key}`);;
                    new_anime_sub.last_match = date;
                    new_anime_sub.rssfeed_key = String(`${key}`);;
                    new_anime_sub.name = last_anime.title;
                    new_anime_sub.download_location = path;
                    new_anime_sub.move_completed = path;
                    new_anime_sub.regex_include = `(?=.*${regex})(?=.*1080)`;
        
                    console.log(new_anime_feed);
                    console.log(new_anime_sub);
        
                    const json = yarss.yarss;
        
                    json.rssfeeds[key] = new_anime_feed;
                    json.subscriptions[key] = new_anime_sub;
                    console.log(json);
        
        
        
                    return 0;
                }
        */
        // if (message.author.bot) return;
        // if (!message.content.startsWith(prefix)) return;

        // const args = message.content.slice(prefix.length).trim().split(/ +/g);
        // const cmdName = args.shift().toLowerCase();
        // if (cmdName.length == 0) return;

        // let cmd = client.commands.get(cmdName);
        // if (cmd) cmd.run(client, message, args);
    },
}