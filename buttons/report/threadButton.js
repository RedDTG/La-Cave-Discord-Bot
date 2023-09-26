const { PermissionsBitField } = require('discord.js');
const databases = { report: require("../../../data/report.json") }

module.exports = {
    name: 'thread-button',
    permissions: [PermissionsBitField.Flags.ManageMessages],
    runInteraction(client, interaction) {

        if (interaction.message.hasThread) { return interaction.reply({ content: 'Ce report de bug possède déjà un thread.', ephemeral: true }) }

        let threadName = 'Thread de résolution'
        let authorTag = '{User_Introuvable}'

        if (databases.report[interaction.message.id]) {
            let report_datas = databases.report[interaction.message.id]
            client.users.fetch(report_datas.author, false).then((user) => { user.send(`Le bug que vous avez remonté ('**${report_datas.title}**') sur le fichier '__${report_datas.media}__' demande plus d'informations afin d'être résolu. Merci de vous rendre dans le fil associé à votre rapport de bug afin de vous entretenir avec un administrateur.`) });

            threadName = report_datas.title
            authorTag = `<@${report_datas.author}>`;
        }

        interaction.message.startThread({
            name: threadName,
            autoArchiveDuration: 1440,
            reason: 'Ce bug demande un peu plus d\'attention',
        }).then((client, report_datas) => {
            interaction.message.thread.send(`${authorTag} ce bug requiert votre attention ! Un administrateur va s'entretenir avec vous.`)
        });

        return interaction.reply({ content: 'Thread créé !', ephemeral: true })
    }
};