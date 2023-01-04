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
const buttonMod = [
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
        async function callAPI(titre) {
            const query = `
                    query GetAnime {
                        results: Page(perPage: 1) {
                        media(type: ANIME, search: "${titre}", status: RELEASING) {
                            id
                            idMal
                            title {
                            english
                            }
                            coverImage {
                            extraLarge
                            }
                        }
                        }
                    }
                `;

            const responseJSON = await axios.post('https://graphql.anilist.co/', { query });

            return responseJSON.data.data.results.media[0];
        }

        async function getDay(animeData){
            //Jour de la semaine Anglais - Français
            const jour_semaine = {
                nom_fr: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"],
                nom_en: ["Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays", "Sundays"]
            };

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
            if (realTimeMinutes === 0) { realTimeMinutes = "00"; }

            const obj = {
                jour: jour,
                heure: `${realTimeHours}:${realTimeMinutes}`,
            };
            return obj;
        }

        const config = databases.config[interaction.guildId];
        const notif_ = databases.notifications;

        //Récupération Modal
        const titre = interaction.fields.getTextInputValue('animes-title');

        //Récupération final anime
        const animeData = await callAPI(titre);
        
        if (!animeData || !animeData.idMal) return interaction.reply({ content: "Anime pas dans cette saison ou pas trouvé", ephemeral: true });

        //Récupération variable dans anime
        const { id: ani_id, idMal: mal_id, title: { english: title_english }, coverImage: { extraLarge: URL_POSTER } } = animeData;
        
        const exists = notif_.some(obj => Object.keys(obj)[0] === String(mal_id));
        if (exists) {
            return interaction.reply({ content: `L'anime est un doublon !`, ephemeral: true });
        }

        const response = await axios.get(`https://api.jikan.moe/v4/anime/${mal_id}`, { 
            headers: { "Accept-Encoding": "gzip,deflate,compress" } 
        });
        const data_anime = await response.data.data;
  
        //Date de Japon à france   
        const Horaires = await getDay(data_anime);

        //traduction nom anglais
        let titre_anime = title_english.replace("Season", "- Saison");
        titre_anime = titre_anime.replace("Part", "- Partie");

        //Création du message de sortie
        const embed = new EmbedBuilder()
            .setTitle(titre_anime)
            .setThumbnail(URL_POSTER)
            .addFields(
                { name: `Jour`, value: Horaires.jour, inline: true },
                { name: `Heure`, value: Horaires.heure, inline: true },
            );


        const newObject = { [mal_id]: [] };
        notif_.push(newObject);

        const channel_calendar = await interaction.guild.channels.cache.get(config["calendar"]);
        const calendar_msg = await channel_calendar.messages.fetch(config["calendar_msg_id"]);

        //récupération du message actuel
        const embed_calendar = await calendar_msg.embeds[0];

        //modification de la ligne (avec détéction du jour)
        embed_calendar.fields.forEach((semaine, index) => {
            if (jour.toLowerCase() === semaine.name.toLowerCase()) {
                embed_calendar.fields[index].value = embed_calendar.fields[index].value.replaceAll("`", "");
                if (embed_calendar.fields[index].value === " ") {
                    embed_calendar.fields[index].value = "\n- " + titre_anime;
                } else {
                    embed_calendar.fields[index].value += "\n- " + titre_anime;
                }
                embed_calendar.fields[index].value = "```" + embed_calendar.fields[index].value + "```";
            }
        })
        //notification
        const configData = JSON.stringify(notif_)
        writeFile("data/notifications.json", configData, (err) => { if (err) { console.log(err) } });

        //modification du message
        await channel_calendar.messages.fetch(calendar_msg.id).then(msg => { msg.edit({ embeds: [embed_calendar] }) });


        const channel = client.channels.cache.get(config["animes"]);
        const thread = channel.threads.cache.find(x => x.name === 'Gestion-animes');
        await thread.send({ embeds: [embed], components: buttonMod });

        await client.channels.cache.get(config["animes"]).send({ embeds: [embed], components: buttons });

        return interaction.reply({ content: 'Cet animé a été ajouté dans la liste', ephemeral: true });

    }
};