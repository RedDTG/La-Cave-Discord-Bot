const { PermissionsBitField, ChannelType, EmbedBuilder } = require('discord.js');
const databases = { config: require("../../data/config.json") }
const { writeFile } = require('fs');
const axios = require('axios');

const embed_animes = new EmbedBuilder()
    .setTitle("Anime - ")
    .addFields(
        { name: `Lundi`, value: '``` ```', inline: false },
        { name: `Mardi`, value: '``` ```', inline: false },
        { name: `Mercredi`, value: '``` ```', inline: false },
        { name: `Jeudi`, value: '``` ```', inline: false },
        { name: `Vendredi`, value: '``` ```', inline: false },
        { name: `Samedi`, value: '``` ```', inline: false },
        { name: `Dimanche`, value: '``` ```', inline: false },
    );

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
            name: 'calendrier',
            description: 'Quel channel assigner pour le calendrier ?',
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
        const calendarChoice = interaction.options.getChannel('calendrier');
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
                    
                    const channel = interaction.guild.channels.cache.get(config["calendar"]);
                    const calendar_msg = await channel.messages.fetch(config["calendar_msg_id"]);
                    calendar_msg.delete();

                    if (typeChoice === "animes"){
                        const fetchedChannel = interaction.guild.channels.cache.get(config[typeChoice]);
                        const thread = fetchedChannel.threads.cache.find(x => x.name === 'Gestion-Anime');
                        await thread.delete();
                    }
                    delete config[typeChoice];
                    delete config["calendar"];
                    delete config["calendar_msg_id"];
                }
                
            } else if (channelChoice && calendarChoice){

                let url = 'https://www.livechart.me/api/v1/charts/nearest';         
                const response = await axios.get(url);
                const nom_saison = response.data.title;

                embed_animes.setTitle('Anime - '+ nom_saison);
                const calendar_msg = await client.channels.cache.get(calendarChoice.id).send({ embeds: [embed_animes] });
                config["calendar"] = calendarChoice.id;
                config["calendar_msg_id"] = calendar_msg.id;

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