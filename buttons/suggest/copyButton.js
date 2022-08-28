module.exports = {
    name: 'copy-button',
    permissions: [],
    runInteraction(client, interaction) {
        clipboard.writeSync('Hello !')
        interaction.reply({content: 'Contenu copié !', ephemeral: true})
    }
};