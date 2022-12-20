const { PermissionsBitField } = require('discord.js');
const databases = { suggest: require("../../data/suggest.json") }
const { writeFile } = require('fs');


module.exports = {
    name: 'complete-button',
    permissions: [PermissionsBitField.Flags.ManageMessages],
    runInteraction(client, interaction) {

        if (databases.suggest[interaction.message.id]) {
            let suggest_datas = databases.suggest[interaction.message.id]
            client.users.fetch(suggest_datas.author, false).then((user) => { user.send(`Votre demande '**${suggest_datas.title}**' a été ajoutée à LaCave !`)});
            delete databases.suggest[interaction.message.id];
            writeFile("data/suggest.json", JSON.stringify(databases.suggest), (err) => { if (err) { console.log(err) } });
        }

        interaction.message.delete();

        return interaction.reply({ content: 'Contenu ajouté !', ephemeral: true })
    }
};