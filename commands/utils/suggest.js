const { TextInputBuilder, TextInputStyle, ActionRowBuilder, ModalBuilder, SelectMenuBuilder } = require('discord.js');

const filmModal = new ModalBuilder()
    .setCustomId('movie-modal')
    .setTitle('Demandez un nouveau film')
    .addComponents([
        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('suggest-title')
                .setLabel('Titre')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder(`L'Incendie du monastère du Lotus rouge`)
                .setRequired(true)
        ),

        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('suggest-year')
                .setLabel('Année')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder(`1928`)
                .setRequired(true)
        ),

        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('suggest-infos')
                .setLabel('Informations complémentaires')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder(`En qualité 2160p 4K UHD et un son Dolby 5.1 True HD ATMOS pour le regarder sur mon téléphone stp`)
                .setRequired(false),
        )

    ]);

const animeModal = new ModalBuilder()
    .setCustomId('anime-modal')
    .setTitle('Demandez un nouvel anime')
    .addComponents([
        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('suggest-title')
                .setLabel('Titre')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder(`Tensei Kenja no Isekai Life: Daini no Shokugyo wo Ete, Sekai Saikyou ni Narimashita`)
                .setRequired(true)
        ),

        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('suggest-season')
                .setLabel('Saison')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder(`57`)
                .setRequired(false)
        ),

        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('suggest-infos')
                .setLabel('Informations complémentaires')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder(`En VF même si c'est un TV-Short à peine traduit en occident je m'en bat les c* doublez-le vous même.`)
                .setRequired(false),
        )
    ]);

const serieModal = new ModalBuilder()
    .setCustomId('serie-modal')
    .setTitle('Demandez une nouvelle série')
    .addComponents([
        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('suggest-title')
                .setLabel('Titre')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder(`House of the Power`)
                .setRequired(true)
        ),

        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('suggest-season')
                .setLabel('Saison')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder(`5`)
                .setRequired(false)
        ),

        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('suggest-infos')
                .setLabel('Informations complémentaires')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder(`La saison sort dans 6 ans mais je fais une suggest quand même histoire de polluer le channel.`)
                .setRequired(false),
        )
    ]);

const audiobookModal = new ModalBuilder()
    .setCustomId('audiobook-modal')
    .setTitle(`Vous voulez un livre audio ? Serieusement ?`)
    .addComponents([
        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('suggest-title')
                .setLabel('Titre')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder(`Le Temps des Tempêtes`)
                .setRequired(true)
        ),

        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('suggest-creator')
                .setLabel('Créateur')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder(`Nicolas Sarkozy`)
                .setRequired(true)
        ),

        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('suggest-infos')
                .setLabel('Informations complémentaires')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder(`Non vraiment je crois que même le développeur n'a jamais testé cette commande, seulement vous.`)
                .setRequired(false),
        )
    ]);


module.exports = {
    name: 'suggest',
    description: 'Demandez un nouveau média',
    permissions: [],
    options: [
        {
            name: 'type',
            description: 'Quel type de média ?',
            type: 3, 
            required: true,
            choices: [
                {
                    name: 'Anime',
                    value: 'Anime'
                },
                {
                    name: 'Film',
                    value: 'Film'
                },
                {
                    name: 'Série',
                    value: 'Série'
                },
                {
                    name: 'Livre Audio',
                    value: 'Livre Audio'
                },
            ]
        },
    ],
    runInteraction: async (client, interaction) => {
        const typeChoice = interaction.options.getString('type');

        if (typeChoice == 'Anime') { await interaction.showModal(animeModal) };
        if (typeChoice == 'Film') { await interaction.showModal(filmModal) };
        if (typeChoice == 'Série') { await interaction.showModal(serieModal) };
        if (typeChoice == 'Livre Audio') { await interaction.showModal(audiobookModal) };

    }
}