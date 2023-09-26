const { EmbedBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const databases = { config: require("../../../data/config.json"), notifications: require("../../../data/notifications.json"), animes: require("../../../data/animes.json") };
const axios = require('axios');
const { writeFile, copyFileSync } = require('fs');


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

            let arguments = titre ? `type: ANIME, search: "${titre}", status_in: [RELEASING, NOT_YET_RELEASED], 
            format_in:[TV, TV_SHORT, ONA], sort: TRENDING_DESC`
                : `type: ANIME, id: ${id}`;


            const query = `
            query GetAnime {
                results: Page(perPage: 1) {
                  media(${arguments}) {
                    id
                    status
                    idMal
                    synonyms
                    format
                    nextAiringEpisode {
                      id
                      timeUntilAiring
                    }
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
                          synonyms
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

        async function recursiveCall(data, edges, synonyms, format, compteur) {
            if (!compteur) compteur = 0;

            const isPart = synonyms.find(str => {
                const match = str.match(/Part (\d+)/);
                if (!match || match[1] === "01" || match[1] === "1") {
                    return false;
                }
                return true;
            });

            if ((format === "TV" || format === "ONA") && !isPart) {
                compteur++;
            }

            data = edges.filter(edge => edge.relationType && edge.relationType === 'PREQUEL')
                .sort((b, a) => {
                    const dateA = new Date(a.node.startDate.year, a.node.startDate.month, a.node.startDate.day);
                    const dateB = new Date(b.node.startDate.year, b.node.startDate.month, b.node.startDate.day);
                    return dateA - dateB;
                });

            const { node: { id: id_call, format: format_prequel, synonyms: synonyms_prequel, title: { english, romaji } } } = data[0];
            synonyms_prequel.push(english);
            synonyms_prequel.push(romaji);

            data_prequel = await callAPI(null, id_call);
            let { relations: { edges: edges_prequel } } = data_prequel;

            if (format_prequel !== "TV" && format_prequel !== "ONA") {
                edges_prequel.path_title = edges.path_title;
            } else {
                english ? edges_prequel.path_title = english : edges_prequel.path_title = romaji;
            }

            hasPrequel = edges_prequel.some(edge => edge.relationType === 'PREQUEL');

            if (hasPrequel) {
                return await recursiveCall(data_prequel, edges_prequel, synonyms_prequel, format_prequel, compteur)
            } else {
                if (format_prequel !== "TV" && format_prequel !== "ONA") {
                    compteur--;
                }
                data_prequel.path_title = edges_prequel.path_title;
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

        async function getDay(animeData, timeUntilAiring) {
            //Jour de la semaine Anglais - Français
            const jour_semaine = {
                nom_fr: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"],
                nom_en: ["Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays", "Sundays"]
            };

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

            //horaire france (-8h)
            let realTimeHours
            let realTimeMinutes

            if (time) {
                const [hours, minutes] = time.split(":");
                realTimeHours = (parseInt(hours, 10) - 6 + 24) % 24;
                realTimeMinutes = parseInt(minutes, 10);
                if (realTimeMinutes < 10) { realTimeMinutes = `0${realTimeMinutes}`; }
                if (realTimeHours < 10) { realTimeHours = `0${realTimeHours}`; }

            } else if (timeUntilAiring) {
                // Récupérer le jour et l'heure grâce au 1er episode qui sort (pas très accurate mais pour les NOT_YET_RELEASED)
                const currentDate = new Date();
                const futureDate = new Date(currentDate.getTime() + (timeUntilAiring * 1000));

                var index = futureDate.getDay()
                index = index === 0 ? index = 6 : index -= 1;
                jour = jour_semaine.nom_fr[index];

                realTimeHours = futureDate.getHours().toString().padStart(2, '0');
                realTimeMinutes = futureDate.getMinutes().toString().padStart(2, '0');
                //var futureSecond = futureDate.getSeconds().toString().padStart(2, '0');

            } else {
                realTimeHours = "00";
                realTimeMinutes = "00";
            }

            if (!jour) jour = "TBA";

            const obj = {
                jour: jour,
                heure: `${realTimeHours}h${realTimeMinutes}`,
            };
            return obj;
        }

        const config = databases.config[interaction.guildId];
        const notif_ = databases.notifications;

        //Récupération Modal
        const titre = interaction.fields.getTextInputValue('animes-title');

        //Récupération final anime
        const animeData = await callAPI(titre);

        if (!animeData || !animeData.idMal || !animeData.nextAiringEpisode) {
            const title_error = animeData.title.english || animeData.title.romaji || animeData.title.userPreferred || animeData.title.native || titre;

            return interaction.reply({ content: `\`${title_error}\` ne sort pas encore, n'a pas été trouvé ou n'a pas encore de date de sortie`, ephemeral: true });
        }

        //Récupération variable dans anime
        const { relations: { edges: edges }, id: ani_id, idMal: mal_id, format: format, title: { english: title_english, romaji: title_romaji }, coverImage: { extraLarge: URL_POSTER }, synonyms } = animeData;

        //Doublon ?
        const exists = notif_.some(obj => Object.keys(obj)[0] === String(mal_id));
        if (exists) {
            return interaction.reply({ content: `L'anime est un doublon !`, ephemeral: true });
        }

        let saison = false;
        let part = false;
        let hasPrequel = false;
        title_english ? final_title = title_english : final_title = title_romaji
        let tmp_title = final_title;

        synonyms.push(final_title);
        if (title_romaji) synonyms.push(title_romaji);
        match = synonyms.find(str => /Season (\d+)/.test(str));
        match_season = synonyms.find(str => / (\d+)(st|nd|rd|th)/.test(str));
        if (match) {
            saison = match.match(/Season (\d+)/)[1];
            if (match.match(/Part (\d+)/)) part = match.match(/Part (\d+)/)[1];
            tmp_title = match.replace(/Season (\d+).*/, "");
        } else if (match_season) {
            saison = match_season.match(/ (\d+)(st|nd|rd|th)/)[1];
            if (match_season.match(/Part (\d+)/)) part = match_season.match(/Part (\d+)/)[1];
            tmp_title = match_season.replace(/\s\d+(st|nd|rd|th).*/, "");
        } else {
            hasPrequel = edges.some(edge => edge.relationType === 'PREQUEL');
            hasParent = edges.some(edge => edge.relationType === 'PARENT');
            hasAlternative = edges.some(edge => edge.relationType === 'ALTERNATIVE');

            if (!hasPrequel && !hasParent && !hasAlternative) {
                const hasSource = edges.some(edge => edge.relationType === 'SOURCE');
                if (hasSource && title_english) {
                    final_title = edges
                        .filter(edge => edge.relationType && edge.relationType === 'SOURCE')
                        .sort((b, a) => a.node.popularity - b.node.popularity)[0].node.title.english;

                    final_title ? final_title : final_title = title_english;
                } else {
                    title_english ? final_title = title_english : final_title = title_romaji;
                }
                tmp_title = final_title;
            } else {
                let data_prequel;
                if (hasPrequel) {
                    data_prequel = await recursiveCall(hasPrequel, edges, synonyms, format);
                    saison = data_prequel.compteur + 1;
                    data_prequel.path_title ? tmp_title = data_prequel.path_title : tmp_title = final_title;

                } else {
                    data_prequel = animeData
                    data_prequel.path_title = tmp_title;
                }

                match = synonyms.find(str => /Part (\d+)/.test(str));
                if (match) { if (match.match(/Part (\d+)/)) { part = match.match(/Part (\d+)/)[1]; } }
            }
        }

        //Date de Japon à france   
        const response = await axios.get(`https://api.jikan.moe/v4/anime/${mal_id}`, {
            headers: { "Accept-Encoding": "gzip,deflate,compress" }
        });
        const data_anime = await response.data.data;

        const Horaires = await getDay(data_anime, animeData.nextAiringEpisode.timeUntilAiring);

        //Création du message de sortie
        const embed = new EmbedBuilder()
            .setTitle(final_title)
            .setThumbnail(URL_POSTER)
            .addFields(
                { name: `path_title`, value: `${tmp_title}`, inline: false },
            );

        let season;
        if (saison) {
            season = saison;
        }
        if (saison > 1) {
            embed.addFields({ name: `path_season`, value: `${saison}`, inline: false });

            if (!part) {
                saison = `Saison ${saison}`;
            } else {
                saison = `Saison ${saison} - Partie ${part}`;
            }

            embed.addFields({ name: `\n`, value: `${saison}`, inline: false })
            embed.setTitle(tmp_title);
            final_title = tmp_title;
        } else if (!saison) {
            embed.data.title = final_title;
            saison = 1;
            embed.addFields({ name: `path_season`, value: `${saison}`, inline: false })

        }
        embed.addFields(
            { name: `Jour`, value: Horaires.jour, inline: true },
            { name: `Heure`, value: Horaires.heure, inline: true },
        )

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
            embed_calendar.data.title = 'Anime - ' + nom_saison
        }
        //modification de la ligne (avec détéction du jour)
        if (Horaires.jour !== "TBA") {
            embed_calendar.fields.forEach((semaine, index) => {
                if (Horaires.jour.toLowerCase() === semaine.name.toLowerCase()) {
                    embed_calendar.fields[index].value = embed_calendar.fields[index].value.replace("```", "").replace("ini", "").replace("\n```", "").replace("```", "");
                    let calendar_title;
                    season > 1 ? calendar_title = `[${Horaires.heure}] ${final_title.trim() + ' '}[${saison}]` : calendar_title = `[${Horaires.heure}] ${final_title}`

                    if (embed_calendar.fields[index].value === " ") {
                        embed_calendar.fields[index].value = "\n- " + calendar_title;
                    } else {
                        embed_calendar.fields[index].value += "\n- " + calendar_title;
                    }
                    embed_calendar.fields[index].value = "```ini" + embed_calendar.fields[index].value + "\n```";

                    const tableau = embed_calendar.fields[index].value.split('\n');
                    tableau.sort((a, b) => {
                        const heureA = a.match(/\d{1,2}h\d{2}/);
                        const heureB = b.match(/\d{1,2}h\d{2}/);
                        if (heureA && heureB) {
                            heureA_minutes = parseInt(heureA[0].replace('h', ''));
                            heureB_minutes = parseInt(heureB[0].replace('h', ''));
                            return heureA_minutes - heureB_minutes;
                        } else {
                            return 0;
                        }
                    });
                    embed_calendar.fields[index].value = tableau.join('\n');

                }
            })
            //notification
            const configData = JSON.stringify(notif_)
            writeFile("../data/notifications.json", configData, (err) => { if (err) { console.log(err) } });

            //modification du message
            await channel_calendar.messages.fetch(calendar_msg.id).then(msg => { msg.edit({ embeds: [embed_calendar] }) });

        }

        const channel = client.channels.cache.get(config["animes"]);
        const thread = await channel.threads.fetch(config["animes-thread"]);

        await thread.send({ embeds: [embed], components: buttonMod }).then(() =>
            setTimeout(() => {
                client.channels.cache.get(config["animes"]).send({ embeds: [embed], components: buttons });
            }, 2000)
        );

        return interaction.reply({ content: 'Cet animé a été ajouté dans la liste', ephemeral: true });

    }
};