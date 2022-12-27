const { PermissionsBitField } = require('discord.js');
const databases = { report: require("../../data/report.json") }
const { writeFile } = require('fs');


module.exports = {
    name: 'fixed-button',
    permissions: [PermissionsBitField.Flags.ManageMessages],
    runInteraction(client, interaction) {

        if (databases.report[interaction.message.id]) {
            let report_datas = databases.report[interaction.message.id]
            client.users.fetch(report_datas.author, false).then((user) => { user.send(`Le bug que vous avez remonté ('**${report_datas.title}**') sur le fichier '__${report_datas.media}__' a été résolu ! Merci encore de l'avoir reporté et désolé pour la gène occasionnée !`)});
            delete databases.report[interaction.message.id];
            const configData = JSON.stringify(databases.report);
            writeFile("data/report.json", configData, (err) => { if (err) { console.log(err) } });
        }

        if (interaction.message.hasThread) { interaction.message.thread.delete('Ce bug a été résolu ou archivé.')}
        interaction.message.delete();
        interaction.reply({ content: 'Bug corrigé !', ephemeral: true })
    }
};