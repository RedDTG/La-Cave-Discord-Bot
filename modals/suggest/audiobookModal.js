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
    name: 'audiobook-modal',
    runInteraction(client, interaction) {
        if (!databases.config[interaction.guildId].suggest || !databases.config[interaction.guildId]) {
            return interaction.reply({ content: `Le channel pour la commande : suggest, n'est pas configuré !`, ephemeral: true })
        }

        const title = interaction.fields.getTextInputValue('suggest-title');
        const creator = interaction.fields.getTextInputValue('suggest-creator');
        const infos = interaction.fields.getTextInputValue('suggest-infos');
        const embed = new EmbedBuilder() 
            .setTitle(title)
            // .setThumbnail(client.user.displayAvatarURL())
            .setTimestamp()
            .setFooter({text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
            .setColor('#6778CC')
            .addFields(
                { name: `Type`, value: 'Livre Audio', inline: true },
                { name: `Créateur`, value: creator, inline: true },
            );
            
            if (infos) { embed.addFields({ name: `Informations complémentaires`, value: infos, inline: false }) }

        client.channels.cache.get(databases.config[interaction.guildId].suggest).send({ embeds: [embed], components: buttons });
        return interaction.reply({ content: `Vous avez demandé ${title} !`, ephemeral: true })
    }
};