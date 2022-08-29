const { EmbedBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const databases = { config: require("../../data/config.json") }


const buttons = [
    new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('complete-button')
            .setLabel('Complétée !')
            .setStyle(ButtonStyle.Success),
        // new ButtonBuilder()
        //     .setCustomId('copy-button')
        //     .setLabel('Copier')
        //     .setStyle(ButtonStyle.Secondary)
    )

]

module.exports = {
    name: 'movie-modal',
    runInteraction(client, interaction) {
        if (!databases.config[interaction.guildId].suggest || !databases.config[interaction.guildId]) {
            return interaction.reply({ content: `Le channel de suggestion n'est pas configuré !`, ephemeral: true })
        }

        const title = interaction.fields.getTextInputValue('suggest-title');
        const year = interaction.fields.getTextInputValue('suggest-year');
        const infos = interaction.fields.getTextInputValue('suggest-infos');
        const embed = new EmbedBuilder() 
            .setTitle(title)
            // .setThumbnail(client.user.displayAvatarURL())
            .setTimestamp()
            .setFooter({text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
            .setColor('#bfa917')
            .addFields(
                { name: `Type`, value: 'Film', inline: true },
                { name: `Année`, value: year, inline: true },
            );

            if (infos) { embed.addFields({ name: `Informations complémentaires`, value: infos, inline: false }) }

        client.channels.cache.get(databases.config[interaction.guildId].suggest).send({ embeds: [embed], components: buttons });
        return interaction.reply({ content: `Vous avez demandé ${title} !`, ephemeral: true })
    }
};