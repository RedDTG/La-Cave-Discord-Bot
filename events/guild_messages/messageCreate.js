const databases = { suggest: require("../../data/suggest.json"), report: require("../../data/report.json"), animes: require("../../data/animes.json"), config: require("../../data/config.json") }
const { writeFile } = require('fs');

module.exports = {
    name: 'messageCreate',
    once: false,
    execute(client, message) {

        const config = databases.config[message.guildId];

        if (config) {
            let commands = ['report', 'suggest', 'animes'];
        
            commands.forEach(command => {
        
                if ((message.type == 18) && config.hasOwnProperty(command)) {
                    if (message.channel.id == config[command]) {
                        message.delete();
                    }
                }
                
                if (config.hasOwnProperty(command)) {
                    if (message.author.bot && (message.channel.id == config[command]) && (message.embeds.length == 1)) {
                        let author = client.users.cache.find(user => user.username == message.embeds[0].footer.text.split("#")[0]).id;
                        databases[command][message.id] = {
                            author: author,
                            title: message.embeds[0].title,
                            // Ajout de media pour la propriété 'report' uniquement
                            media: command === 'report' ? message.embeds[0].fields[0].value : undefined,
                        };
                    }
        
                    writeFile(`data/${command}.json`, JSON.stringify(databases[command]), (err) => {
                        if (err) {
                            console.log(err)
                        }
                    });
                }
            });
        }
        

        if (!message.author.bot && message.content.startsWith("+suggest")) {
            return message.reply({ content: `La commande +suggest n'existe plus ! Veuillez utiliser /suggest à la place !`});
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