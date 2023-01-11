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
        async function callAPI(titre, id) {

            let arguments = titre ? `type: ANIME, search: "${titre}", status_in: [RELEASING, NOT_YET_RELEASED]` : `type: ANIME, id: ${id}`;


            const query = `
            query GetAnime {
                results: Page(perPage: 1) {
                  media(${arguments}) {
                    id
                    idMal
                    synonyms
                    format
                    title {
                      romaji
                      userPreferred
                      native
                      english
                    }
                    coverImage {
                      extraLarge
                    }
                    source(version: 2)
                    relations {
                      edges {
                        relationType(version: 2)
                        node {
                          id
                          format
                          popularity
                          title {
                            userPreferred
                            romaji
                            english
                          }
                          startDate {
                            year
                            month
                            day
                          }
                        }
                      }
                    }
                  }
                }
              }
              
                `;

            const responseJSON = await axios.post('https://graphql.anilist.co/', { query });

            return responseJSON.data.data.results.media[0];
        }

        async function recursiveCall(data, edges, compteur) {
            if (!compteur) compteur = 0;

            data = edges.filter(edge => edge.relationType && edge.relationType === 'PREQUEL')
                .sort((a, b) => {
                    const dateA = new Date(a.node.startDate.year, a.node.startDate.month, a.node.startDate.day);
                    const dateB = new Date(b.node.startDate.year, b.node.startDate.month, b.node.startDate.day);
                    return dateA - dateB;
                });


            let { node: { id: id_call, format: format } } = data[0];

            if (format === "TV" || format === "ONA") compteur++;

            data_prequel = await callAPI(null, id_call);
            let { relations: { edges: edges_prequel } } = data_prequel;

            hasPrequel = edges_prequel.some(edge => edge.relationType === 'PREQUEL');

            if (hasPrequel) {
                return await recursiveCall(data_prequel, edges_prequel, compteur)
            } else {
                data_prequel.compteur = compteur;
                return data_prequel;
            }
        }

        async function getSeason() {
            const url = 'https://www.livechart.me/api/v1/charts/nearest';
            const response = await axios.get(url, {
                headers: { "Accept-Encoding": "gzip,deflate,compress" }
            });
            const nom_saison = response.data.title;
            return nom_saison;
        }

        async function getDay(animeData) {
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

        async function getTitle(titre){
            const animeData = await callAPI(titre);
            if (!animeData) return 0;
            const { relations: { edges: edges }, title: { english, romaji }, synonyms } = animeData;


            
        }

        const config = databases.config[interaction.guildId];
        const notif_ = databases.notifications;

        //Récupération Modal
        const titre = interaction.fields.getTextInputValue('animes-title');

        //Récupération final anime
        const animeData = await callAPI(titre);

        if (!animeData || !animeData.idMal) return interaction.reply({ content: "Anime pas dans cette saison ou pas trouvé", ephemeral: true });

        //Récupération variable dans anime
        const { relations: { edges: edges }, id: ani_id, idMal: mal_id, title: { english: title_english, romaji: title_romaji }, coverImage: { extraLarge: URL_POSTER }, synonyms } = animeData;
        
        //Doublon ?
        const exists = notif_.some(obj => Object.keys(obj)[0] === String(mal_id));
        if (exists) {
            return interaction.reply({ content: `L'anime est un doublon !`, ephemeral: true });
        }

        let saison = false;
        title_english ? final_title = title_english : final_title = title_romaji
        let match = final_title.match(/ Season (\d+)/);
        if (match) {
            saison = Number(match[1]);
        } else {
            const hasSource = edges.some(edge => edge.relationType === 'SOURCE');
            if (hasSource && title_english) {
                final_title = edges
                    .filter(edge => edge.relationType && edge.relationType === 'SOURCE')
                    .sort((b, a) => a.node.popularity - b.node.popularity)[0].node.title.english;
                
                final_title ? final_title : final_title = title_english; 
            } else {
                title_english ? final_title = title_english : final_title = title_romaji;
            }
            synonyms.push(final_title);
            match = synonyms.find(str => /Season (\d+)/.test(str));
            let hasPrequel = edges.some(edge => edge.relationType === 'PREQUEL');

            if (match) {
                saison = match.match(/Season (\d+)/)[1];
                final_title = synonyms.find(str => /Season (\d+)/g.test(str));

            } else if (hasPrequel) {
                const data_prequel = await recursiveCall(hasPrequel, edges);
                saison = data_prequel.compteur + 1;
            }

            /*match = saison.match(/ (\d+)(st|nd|rd|th)/);
            if (match) {
                saison = Number(match[1]);
            }else{
                saison = final_title;
            }*/
        }

        //Traduction

        if (final_title.match(/ Season (\d+)/)){
            final_title = final_title.replace(/ Season (\d+)/, saison ? ` - Saison ${saison}` : ``);
        }else  if (saison){
            final_title += ` - Saison ${saison}`;
        } 

        if (final_title.match(/ Part (\d+)/)){

            final_title = final_title.replace(/ Part (\d+)/, ` - Partie ${Number(final_title.match(/ Part (\d+)/)[1])}`);
        }
        

        //Date de Japon à france   
        const response = await axios.get(`https://api.jikan.moe/v4/anime/${mal_id}`, {
            headers: { "Accept-Encoding": "gzip,deflate,compress" }
        });
        const data_anime = await response.data.data;
        
        const Horaires = await getDay(data_anime);

        //Création du message de sortie
        const embed = new EmbedBuilder()
            .setTitle(final_title)
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

        //Changement Saison - Titre
        const nom_saison = await getSeason();

        let current_season = embed_calendar.title;
        current_season = current_season.split(" - ")[1];
        if (nom_saison !== current_season) {
            embed_calendar.setTitle('Anime - ' + nom_saison);
        }
        //modification de la ligne (avec détéction du jour)
        embed_calendar.fields.forEach((semaine, index) => {
            if (jour.toLowerCase() === semaine.name.toLowerCase()) {
                embed_calendar.fields[index].value = embed_calendar.fields[index].value.replaceAll("`", "");
                if (embed_calendar.fields[index].value === " ") {
                    embed_calendar.fields[index].value = "\n- " + final_title;
                } else {
                    embed_calendar.fields[index].value += "\n- " + final_title;
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
        await thread.send({ embeds: [embed], components: buttonMod }).then(() =>
            setTimeout(() => {
                client.channels.cache.get(config["animes"]).send({ embeds: [embed], components: buttons });
            }, 3000)
        );



        return interaction.reply({ content: 'Cet animé a été ajouté dans la liste', ephemeral: true });

    }
};