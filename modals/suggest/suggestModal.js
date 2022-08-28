const { EmbedBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder } = require('discord.js');


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
    name: 'suggest-modal',
    async runInteraction(client, interaction) {
        const title = interaction.fields.getTextInputValue('suggest-title');
        const year = interaction.fields.getTextInputValue('suggest-year');
        let type = interaction.fields.getTextInputValue('suggest-type');
        const infos = interaction.fields.getTextInputValue('suggest-infos');
        const embed = new EmbedBuilder() 
            .setTitle(title)
            // .setThumbnail(client.user.displayAvatarURL())
            .setTimestamp()
            .setFooter({text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })

            if (infos) { embed.addFields({ name: `Informations complémentaires`, value: infos, inline: false }) }

            if (type.toLowerCase() == 'anime') { embed.setColor('#a81313'); type = 'Anime'; }
            if (type.toLowerCase() == 'serie' || type.toLowerCase() == 'série') { embed.setColor('#48008c'); type = 'Série'}
            if (type.toLowerCase() == 'film') { embed.setColor('#bfa917'); type = 'Film'}
            if (type.toLowerCase() == 'livre audio') { embed.setColor('#010770'); type = 'Livre audio'}

            embed.addFields(
                { name: `Type`, value: type, inline: true },
                { name: `Année`, value: year, inline: true },
            );

        
        client.channels.cache.get('1009965116013424730').send({ embeds: [embed], components: buttons });
        interaction.reply({ content: `Vous avez demandé ${title} !`, ephemeral: true })
    }
};