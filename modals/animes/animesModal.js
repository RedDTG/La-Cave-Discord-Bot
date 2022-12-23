const { EmbedBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder, PermissionsBitField, TextInputBuilder } = require('discord.js');
const databases = { config: require("../../data/config.json"), notifications: require("../../data/notifications.json"), animes: require("../../data/animes.json") };
const axios = require('axios');
const { writeFile } = require('fs');
const { threadId } = require('worker_threads');


const buttons = [
    new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('animes-notification-button')
                .setLabel(' 🔔 Notifications')
                .setStyle(ButtonStyle.Secondary),
        )

]
const buttonMod =[
    new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('animes-supprimer-button')
            .setLabel('Supprimer cet anime')
            .setStyle(ButtonStyle.Danger)
    )
]

module.exports = {
    name: 'animes-modal',
    async runInteraction(client, interaction) {
        const config = databases.config[interaction.guildId].animes;
        let notif_ = databases.notifications;
        

        //Jour de la semaine Anglais - Français
        const jour_semaine = {
            nom_fr: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"],
            nom_en: ["Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays", "Sundays"]
        };
        let index = 0;

        //Récupération Modal
        const titre = interaction.fields.getTextInputValue('animes-title');

        //Appel API pour données
        const url_name = `https://www.livechart.me/api/v1/anime?q=${titre}`;
        const response_name = await axios.get(url_name);
        if (response_name.data.items.length === 0) return interaction.reply({ content: "Anime not found", ephemeral: true });
        
        const { native_title, romaji_title } = response_name.data.items[index];
        let title_ = encodeURIComponent(native_title.replace("-", " "));
        let url = `https://api.jikan.moe/v4/anime?order_by=popularity&sort=asc&type=tv&status=airing&q=${title_}`;
        let response = await axios.get(url);
        if (typeof response.data.data[index] === "undefined") {
            title_ = encodeURIComponent(romaji_title);
            url = `https://api.jikan.moe/v4/anime?order_by=popularity&sort=asc&type=tv&status=airing&q=${title_}`;
            response = await axios.get(url);
        }
        if (response.data.data.length === 0) return interaction.reply({ content: "Anime not found", ephemeral: true });
        //Approved Anime
        let approved = await response.data.data[index].approved;
        if (!approved){
            while (!approved){
                approved = await response.data.data[index].approved;
                index++;
            }
            index--;
        }
        
        //Récupération final anime
        const animeData = await response.data.data[index];
        if (!animeData) return interaction.reply({ content: "Anime not found", ephemeral: true });

        //Récupération variable dans anime
        const { title, images, mal_id } = animeData;
        const exists = notif_.some(obj => Object.keys(obj)[0] === String(mal_id));
        if (exists) {
            return interaction.reply({ content: `L'anime est un doublon !`, ephemeral: true });
        }

        let {title_english} = animeData;
        if (!title_english) {title_english = title;};
        const { webp } = images;

        let URL_POSTER = webp.large_image_url;
        if (URL_POSTER === null) {
            title_ = encodeURIComponent(title_english);
            const response = await axios.get(`https://www.livechart.me/api/v1/anime?q=${title_}`);
            URL_POSTER = response.data.items[0].poster_image_large;
        }

        //Date de Japon  à france   
        let jour;
        let time;
        for (const data in animeData) {
            if (data == "broadcast") {
                const day = animeData[data].day;
                time = animeData[data].time;
                let index = jour_semaine.nom_en.findIndex((en) => en === day);

                if (index !== -1) {
                    if (time < "07:00") {
                        index = index === 0 ? index = 6 : index -= 1;
                    }
                    jour = jour_semaine.nom_fr[index];
                    break;
                }
            }
        }

        if (!jour) return interaction.reply({ content: "Jour de diffusion non trouvé", ephemeral: true });

        //horaire france (-8h)
        const [hours, minutes] = time.split(":");
        const realTimeHours = (parseInt(hours, 10) - 6 + 24) % 24;
        let realTimeMinutes = parseInt(minutes, 10);
        if (realTimeMinutes === 0) {realTimeMinutes = "00";}

        //traduction nom anglais
        let titre_anime = title_english.replace("Season", "- Saison");
        titre_anime = titre_anime.replace("Part", "- Partie");

        //Création du message de sortie
        const embed = new EmbedBuilder()
            .setTitle(titre_anime)
            .setThumbnail(URL_POSTER)
            .addFields(
                { name: `Jour`, value: jour, inline: true },
                { name: `Heure`, value: `${realTimeHours}:${realTimeMinutes}`, inline: true },
            );


        let newObject = { [mal_id]: []};
        notif_.push(newObject);
              
        writeFile("data/notifications.json", JSON.stringify(notif_), (err) => { if (err) { console.log(err) } });

        const channel = client.channels.cache.get(config);
        const thread = channel.threads.cache.find(x => x.name === 'Gestion-Anime');
        await thread.send({ embeds: [embed], components: buttonMod});

        client.channels.cache.get(config).send({ embeds: [embed], components: buttons});
        
        return interaction.reply({ content: 'Cet animé a été ajouté dans la liste', ephemeral: true });

    }
};