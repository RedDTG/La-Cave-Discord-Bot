const databases = { suggest: require("../../data/suggest.json"), report: require("../../data/report.json"), animes: require("../../data/animes.json"), config: require("../../data/config.json"), notifications: require("../../data/notifications.json") }
const { MessageFlags } = require("discord.js");
const { writeFile } = require('fs');

module.exports = {
    name: 'messageCreate',
    once: false,
    execute(client, message) {     
        const config = databases.config[message.guildId];
        if (config && (message.interaction === null) && (message.author.bot) && (message.type !== 19 && message.type !== 20 && message.type !== 1)) {
            
            let commands = ['report', 'suggest', 'animes'];
            commands.forEach(command => {

                if ((message.type === 18) && config.hasOwnProperty("report") && command === "report") {
                    console.log("JEANJEAN"+message.type);
                    if (message.channel.id == config[command]) {
                        message.delete();
                    }
                }

                if (config.hasOwnProperty(command) && (message.type !== 18 && message.type !== 1 )) {
                    let id;
                    let message_value;
                    //console.log(message);
                    //console.log(message.channelId, config[command]);
                    if (command === "animes") {
                        const notif = databases.notifications;
                        const dernier_objet = notif[notif.length - 1];
                        id = Object.keys(dernier_objet)[Object.keys(dernier_objet).length - 1];
                    }

                    if (message.channelId != config[command]) {
                        
                        message_value = message.id;
                        let author = client.users.cache.find(user => user.username == message.embeds[0].footer.text.split("#")[0]).id;
                        databases[command][message_value] = {
                        author: author,
                        title: message.embeds[0].title,
                        // Ajout de media pour la propriété 'report' uniquement
                        media: command === 'report' ? message.embeds[0].fields[0].value : undefined,
                        id: command === 'animes' ? id : undefined,
                        message_id: command === 'animes' ? message.id : undefined,
                    };
                    } else {
                        
                        const value = Object.values(databases[command]).find(o => o.id === id);  // value = { author: '332556979220381699', title: 'My Hero Academia - Saison 6', id: '49918', message_id: '1055204924692103268' }
                        const index = Object.values(databases[command]).indexOf(value);  // index = 0
                        const key = Object.keys(databases[command])[index];
                        //console.log(value, index, key);
                        message_value = key;
                        let author = client.users.cache.find(user => user.username == message.embeds[0].footer.text.split("#")[0]).id;
                        databases[command][message_value] = {
                        author: author,
                        title: message.embeds[0].title,
                        // Ajout de media pour la propriété 'report' uniquement
                        media: command === 'report' ? message.embeds[0].fields[0].value : undefined,
                        id: command === 'animes' ? id : undefined,
                        message_id: command === 'animes' ? message.id : undefined,
                    };
                    }
                    


                    writeFile(`data/${command}.json`, JSON.stringify(databases[command]), (err) => { if (err) { console.log(err) } });
                }
            });
        }


        if (!message.author.bot && message.content.startsWith("+suggest")) {
            return message.reply({ content: `La commande +suggest n'existe plus ! Veuillez utiliser /suggest à la place !` });
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