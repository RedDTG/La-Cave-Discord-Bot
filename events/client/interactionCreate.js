const { Interaction } = require("discord.js");
const messageCreate = require("../guild_messages/messageCreate");
const { PermissionsBitField } = require('discord.js');


module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(client, interaction) {
        if (interaction.isCommand()) {
            const cmd = client.commands.get(interaction.commandName);
            if (!cmd) return interaction.reply(`Cette commande n'existe pas !`);
            if (!interaction.memberPermissions.has(cmd.permissions)) return interaction.reply({ content: `Vous n'avez pas la/les permission(s) requise(s) (\'${cmd.permissions.join(', ')}\')`, ephemeral: true })
            cmd.runInteraction(client, interaction);
        }
        else if (interaction.isButton()) {
            const btn = client.buttons.get(interaction.customId);
            if (!btn) return interaction.reply(`Ce bouton n'existe pas !`);
            if (!interaction.memberPermissions.has(btn.permissions)) return interaction.reply({ content: `Vous n'avez pas la/les permission(s) requise(s) (\'${btn.permissions.join(', ')}\')`, ephemeral: true })
            btn.runInteraction(client, interaction);
        }
        else if (interaction.isModalSubmit()) {
            const modal = client.modals.get(interaction.customId);
            if(!modal) return interaction.reply(`Cette modale n'existe pas !`)
            modal.runInteraction(client, interaction);
        }
    },
};