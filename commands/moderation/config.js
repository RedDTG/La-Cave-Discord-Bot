const { PermissionsBitField, ChannelType } = require('discord.js');
const databases = { config: require("../../data/config.json") }
const { writeFile } = require('fs');

module.exports = {
    name: 'config',
    description: 'Configuration des channels',
    permissions: [PermissionsBitField.Flags.Administrator],
    options : [
        {
            name: 'type',
            description: 'Quel type de channel configurer ?',
            type: 3, 
            required: true,
            choices: [
                {
                    name: 'suggest',
                    value: 'suggest'
                },
                {
                    name: 'report',
                    value: 'report'
                },
                {
                    name: 'animes',
                    value: 'animes'
                }
            ]
        },
        {
            name: 'channel',
            description: 'Quel channel assigner ?',
            type: 7, //channel type
            required: false,
        },
        {
            name: 'delete',
            description: 'Voulez vous le supprimer ?',
            type: 5, 
            required: false,
        }
    ],
    runInteraction: async (client, interaction) => {

        const typeChoice = interaction.options.getString('type');
        const channelChoice = interaction.options.getChannel('channel');
        const deleteChoice = interaction.options.getBoolean('delete');

        if (!databases.config[interaction.guildId]) {
            databases.config[interaction.guildId] = {}
        }
        
        if (!databases.config[interaction.guildId].hasOwnProperty(typeChoice) || deleteChoice ){
            let config = databases.config[interaction.guildId];
            if (deleteChoice) {
                if (!config.hasOwnProperty(typeChoice)){
                    interaction.reply({content: `Aucun channel n'est pas encore configuré pour la commande : **\`${typeChoice}\`**`,ephemeral: true});
                }else {
                    interaction.reply({content: `Le channel <#${config[typeChoice]}> a été dé-configuré pour la commande : **\`${typeChoice}\`**`,ephemeral: true});
                    
                    if (typeChoice === "animes"){
                        const fetchedChannel = interaction.guild.channels.cache.get(config[typeChoice]);
                        const thread = fetchedChannel.threads.cache.find(x => x.name === 'Gestion-Anime');
                        await thread.delete();
                    }
                    delete config[typeChoice];
                }
                
            } else if (channelChoice){

                config[typeChoice] = channelChoice.id;
                if (typeChoice === "animes"){
                    const thread = await channelChoice.threads.create({
                        name: 'Gestion-Anime',
                        autoArchiveDuration: 10080,
                        type: ChannelType.GuildPrivateThread,
                        reason: 'Needed a separate thread for moderation',
                    });
                    await thread.members.add(interaction.user.id);
                }
                
                
                await interaction.reply({content: `Le channel <#${config[typeChoice]}> a été configuré pour la commande : **\`${typeChoice}\`**`,ephemeral: true});

            }else{
                return interaction.reply({content: `Merci de faire un vrai choix :)`,ephemeral: true});
            }
            writeFile("data/config.json", JSON.stringify(databases.config), (err) => {
                if (err) {
                    console.log(err);
                }
                });
        }else{
            return interaction.reply({ content: `Le channel pour la commande : **\`${typeChoice}\`**, est déjà configuré`, ephemeral: true });
        }
    }
}