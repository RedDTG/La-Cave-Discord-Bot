const { PermissionsBitField } = require('discord.js');
const databases = { suggests: require("../../data/suggests.json") }
const { writeFile } = require('fs');


module.exports = {
    name: 'complete-button',
    permissions: [PermissionsBitField.Flags.ManageMessages],
    runInteraction(client, interaction) {

        if (databases.suggests[interaction.message.id]) {
            let suggest_datas = databases.suggests[interaction.message.id]
            client.users.fetch(suggest_datas.author, false).then((user) => { user.send(`Votre demande '**${suggest_datas.title}**' a été ajoutée à LaCave !`)});
            delete databases.suggests[interaction.message.id];
            writeFile("data/suggests.json", JSON.stringify(databases.suggests), (err) => { if (err) { console.log(err) } });
        }

        interaction.message.delete();

        return interaction.reply({ content: 'Contenu ajouté !', ephemeral: true })
    }
};