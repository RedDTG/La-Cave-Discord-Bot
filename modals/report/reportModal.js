const { EmbedBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder } = require('discord.js');

const buttons = [
    new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('thread-button')
            .setLabel('Thread')
            .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
            .setCustomId('fixed-button')
            .setLabel('Fixed !')
            .setStyle(ButtonStyle.Success)
    )

]

module.exports = {
    name: 'report-modal',
    async runInteraction(client, interaction) {
        const title = interaction.fields.getTextInputValue('report-title');
        const media = interaction.fields.getTextInputValue('report-media');
        const details = interaction.fields.getTextInputValue('report-details');

        const embed = new EmbedBuilder() 
            .setTitle(title)
            // .setThumbnail(client.user.displayAvatarURL())
            .setTimestamp()
            .setFooter({text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
            .addFields(
                { name: `Média`, value: media, inline: false },
                { name: `Détails`, value: details, inline: false },
            );

                client.channels.cache.get('1011339702722379858').send({ embeds: [embed], components: buttons });
                interaction.reply({ content: `Merci de nous avoir indiqué ce bug ! Nous nous en chargerons au plus vite et vous recontacterons si nous avons besoin de plus d'informations !`, ephemeral: true })
    }
};