const { EmbedBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const databases = { config: require("../../../data/config.json") }


const buttons = [
    new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('complete-button')
                .setLabel('Complétée !')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setLabel('Télécharger')
                .setStyle(ButtonStyle.Link)
        )

]

module.exports = {
    name: 'suggest-modal',
    async runInteraction(client, interaction) {
        const id_type = interaction.fields.fields.entries().next().value[0];
        const title = interaction.fields.fields.get(id_type);
        const season = interaction.fields.fields.get('suggest-season');
        const infos = interaction.fields.fields.get('suggest-infos');
        const year = interaction.fields.fields.get('suggest-year');
        const creator = interaction.fields.fields.get('suggest-creator');

        let type;
        let url;
        let title_url;
        let quotedWords;
        type = id_type.replaceAll("suggest-title-", "");

        const embed = new EmbedBuilder()
            .setTitle(`${title.value}`)
            // .setThumbnail(client.user.displayAvatarURL())
            .setTimestamp()
            .setFooter({ text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
            .addFields(
                { name: `Type`, value: `${type}`, inline: true },
            );

        if (season && season.value) {
            title_url = title.value + ' ' + season.value;
            embed.addFields({ name: `Saison`, value: season.value, inline: true });
        }
        if (creator && creator.value) {
            title_url = title.value;
            embed.addFields({ name: `Créateur`, value: creator.value, inline: true });
        }
        if (infos && infos.value) {
            embed.addFields({ name: `Informations complémentaires`, value: infos.value, inline: false });
        }
        if (year && year.value) {
            title_url = title.value + ' ' + year.value;
            embed.addFields({ name: `Année`, value: year.value, inline: false });
        }

        quotedWords = encodeURIComponent(title_url.split(" ").map(word => `"${word}"`).join(" "));

        switch (type) {
            case "Anime":
                embed.setColor('#905AB8');
                url = `https://www6.yggtorrent.lol/engine/search?name=${quotedWords}&description=&file=&uploader=&category=2145&sub_category=2179&do=search&order=desc&sort=size`;

                break;
            case "Film":
                embed.setColor('#3B8AD3');
                url = `https://www6.yggtorrent.lol/engine/search?name=${quotedWords}&description=&file=&uploader=&category=2145&sub_category=2183&do=search&order=desc&sort=size`;

                break;
            case "Série":
                embed.setColor('#121325');
                url = `https://www6.yggtorrent.lol/engine/search?name=${quotedWords}&description=&file=&uploader=&category=2145&sub_category=2184&do=search&order=desc&sort=size`;

                break;
            case "Livre Audio":
                embed.setColor('#6778CC');
                url = `https://www6.yggtorrent.lol/engine/search?name=${quotedWords}&description=&file=&uploader=&category=2140&sub_category=all&do=search`;

                break;
        }

        buttons[0].components[1].setURL(url);



        await client.channels.cache
            .get(databases.config[interaction.guildId].suggest).threads.cache
            .find(x => x.name === 'Gestion-suggest')
            .send({ embeds: [embed], components: buttons }).then(()=>
            setTimeout(()=> {
                client.channels.cache.get(databases.config[interaction.guildId].suggest).send({ embeds: [embed] });
            }, 1000)            
        );;
            
        

        

        


        return interaction.reply({ content: `Vous avez demandé ${title.value} !`, ephemeral: true })
    }
};