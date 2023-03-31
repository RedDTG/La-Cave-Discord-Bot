const { PermissionsBitField } = require('discord.js');
const databases = { suggest: require("../../data/suggest.json"), config: require("../../data/config.json") }
const { writeFile } = require('fs');


module.exports = {
    name: 'complete-button',
    permissions: [PermissionsBitField.Flags.ManageMessages],
    runInteraction(client, interaction) {
        const config = databases.config[interaction.guildId];

        if (databases.suggest[interaction.message.id]) {

            const suggest_datas = databases.suggest[interaction.message.id];
            
            client.channels.fetch(config["suggest"]).then(channel => {
                channel.messages.delete(suggest_datas.message_id);
            });

            client.users.fetch(suggest_datas.author, false).then((user) => { user.send(`Votre demande '**${suggest_datas.title}**' a été ajoutée à LaCave !`) });
            delete databases.suggest[interaction.message.id];;

            const configData = JSON.stringify(databases.suggest);
            writeFile("data/suggest.json", configData, (err) => { if (err) { console.log(err) } });
        }

        interaction.message.delete();

        return interaction.reply({ content: 'Contenu ajouté !', ephemeral: true })
    }
};

