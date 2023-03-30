const { TextInputBuilder, TextInputStyle, ActionRowBuilder, ModalBuilder, SelectMenuBuilder, Message } = require('discord.js');
const { type } = require('os');
const databases = { config: require("../../data/config.json") }

const suggestModal = new ModalBuilder()
    .setCustomId(`suggest-modal`)
    .setComponents([
    new ActionRowBuilder()
        .setComponents(
        new TextInputBuilder()
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
    ),

    new ActionRowBuilder().setComponents(
        new TextInputBuilder()
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
    ),

    new ActionRowBuilder().setComponents(
        new TextInputBuilder()
            .setCustomId('suggest-infos')
            .setLabel('Informations complémentaires')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false),
    ),
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
        function isEmpty(obj) {
            return JSON.stringify(obj) === '{}';
        }

        if (isEmpty(databases.config)) {
            return interaction.reply({ content: `Aucun channel n'est configuré`, ephemeral: true });
        } else if (!databases.config[interaction.guildId].hasOwnProperty('suggest')) {
            return interaction.reply({ content: `Le channel pour la commande : **\`/suggest\`**, n'est pas configuré`, ephemeral: true });
        } else {
            const typeChoice = interaction.options.getString('type');

            suggestModal.setTitle(`Un nouveau ${typeChoice} ?`)
            suggestModal.components[0].components[0].setLabel(typeChoice);

            switch (typeChoice) {
                case "Anime":
                    suggestModal.components[0].components[0]
                        .setCustomId(`suggest-title-${typeChoice}`)
                        .setPlaceholder("Tensei Kenja no Isekai Life: Daini no Shokugyo wo Ete, Sekai Saikyou ni Narimashita");

                    suggestModal.components[1].components[0]
                        .setCustomId("suggest-season")
                        .setLabel("Saison")
                        .setPlaceholder("57");

                    suggestModal.components[2].components[0].setPlaceholder(`En VF même si c'est un TV-Short à peine traduit en occident je m'en bat les c* doublez-le vous même.`);

                    break;
                case "Film":
                    suggestModal.components[0].components[0]
                        .setCustomId(`suggest-title-${typeChoice}`)
                        .setPlaceholder("L'Incendie du monastère du Lotus rouge");

                    suggestModal.components[1].components[0]
                        .setCustomId("suggest-year")
                        .setLabel("Année")
                        .setPlaceholder("1928");

                    suggestModal.components[2].components[0].setPlaceholder(`En qualité 2160p 4K UHD et un son Dolby 5.1 True HD ATMOS pour le regarder sur mon téléphone stp`);
                    break;
                case "Série":
                    suggestModal.components[0].components[0]
                        .setCustomId(`suggest-title-${typeChoice}`)
                        .setPlaceholder("House of the Power");

                    suggestModal.components[1].components[0]
                        .setCustomId("suggest-season")
                        .setLabel("Saison")
                        .setPlaceholder("5");
                        
                    suggestModal.components[2].components[0].setPlaceholder(`J'aimerais bien en VO, /!\\ ne pas mettre de saison qui sort dans 8 ans - merci, LaCave Corp/!\\`);

                    break; 
                case "Livre Audio":
                    suggestModal.components[0].components[0]
                        .setCustomId(`suggest-title-${typeChoice}`)
                        .setPlaceholder("Le Temps des Tempêtes");

                    suggestModal.components[1].components[0]
                        .setCustomId("suggest-creator")
                        .setLabel("Créateur")
                        .setPlaceholder("Nicolas Sarkozy");

                    suggestModal.components[2].components[0].setPlaceholder(`Non vraiment je crois que même le développeur n'a jamais testé cette commande, seulement vous.`);
                    
                    break;
            }

            await interaction.showModal(suggestModal)
            
        }
    }
}