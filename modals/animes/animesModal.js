const { EmbedBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder, PermissionsBitField } = require('discord.js');
const databases = { config: require("../../data/config.json") }


const buttons = [
    new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('animes-notification-button')
            .setLabel(' 🔔 Notifications')
            .setStyle(ButtonStyle.Secondary),
    
        new ButtonBuilder()
            .setCustomId('animes-supprimer-button')
            .setLabel('Supprimer cet anime')
            .setStyle(ButtonStyle.Danger)
    )

]

module.exports = {
    name: 'animes-modal',
    runInteraction(client, interaction) {
        const config = databases.config[interaction.guildId].animes;
        if (!config) {
            return interaction.reply({ content: `Le channel pour la commande : animes, n'est pas configuré !`, ephemeral: true })
        }

        const title = interaction.fields.getTextInputValue('animes-title');
        const day = "Lundi";
        const hour = "21:00";

        const embed = new EmbedBuilder() 
            .setTitle(title)
            .setThumbnail("https://cdn.myanimelist.net/images/anime/1258/126929l.webp")
            .addFields(
                { name: `Jour`, value: day, inline: true },
                { name: `Heure`, value: hour, inline: true },
            );

        client.channels.cache.get(config).send({ embeds: [embed], components: buttons });
        return interaction.reply({ content: `${title} à bien été ajouté à la liste des animes de la Saison !`, ephemeral: true });

        
    }
};