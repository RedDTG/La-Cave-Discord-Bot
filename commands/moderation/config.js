const { PermissionsBitField } = require('discord.js');
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
                }
            ]
        },
        {
            name: 'channel',
            description: 'Quel channel assigner ?',
            type: 7, //channel type
            required: true,
        },
        {
            name: 'delete',
            description: 'Voulez vous le supprimer ?',
            type: 5, 
            required: false,
        }
    ],
    runInteraction: (client, interaction) => {

        const typeChoice = interaction.options.getString('type');
        const channelChoice = interaction.options.getChannel('channel');
        const deleteChoice = interaction.options.getBoolean('delete');

        if (!databases.config[interaction.guildId]) {
            databases.config[interaction.guildId] = {}
        }

        if (deleteChoice) {
            if (typeChoice == 'suggest') { delete databases.config[interaction.guildId].suggest }
            else { delete databases.config[interaction.guildId].report }

            writeFile("data/config.json", JSON.stringify(databases.config), (err) => { if (err) { console.log(err) } });
            return interaction.reply({ content: `Ce channel a été délink !` })
        }

        else if (typeChoice == 'suggest') {
            databases.config[interaction.guildId].suggest = channelChoice.id;

            writeFile("data/config.json", JSON.stringify(databases.config), (err) => { if (err) { console.log(err) } });
            return interaction.reply({ content: `Le channel ${channelChoice} a été configuré pour recevoir les suggestions.`, ephemeral: true });
        }

        else if (typeChoice == 'report') {
            databases.config[interaction.guildId].report = channelChoice.id;

            writeFile("data/config.json", JSON.stringify(databases.config), (err) => { if (err) { console.log(err) } });
            return interaction.reply({ content: `Le channel ${channelChoice} a été configuré pour recevoir les reports de bugs.`, ephemeral: true });
        }
    }
}