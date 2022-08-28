const { promisify } = require('util');
const { glob } = require('glob');
const pGlob = promisify(glob);
const { PermissionsBitField } = require('discord.js');

module.exports = async client => {
    (await pGlob(`${process.cwd()}/buttons/*/*.js`)).map(async btnFile => {

        const btn = require(btnFile);

        if (!btn.name) return console.log(`-----\nBouton non-chargé: pas de nom\nFichier -> ${btnFile}\n-----`);

        btn.permissions.forEach(permission => {
            if (!permissionList.includes(permission)) {
                return console.log(`-----\nBouton non-chargée: erreur de typo sur la permission '${permission}'\nFichier -> ${btnFile}\n-----`);
            }
        });

        client.buttons.set(btn.name, btn);

        console.log(`Bouton chargé: ${btn.name}`);
    });
};

const permissionList = [PermissionsBitField.Flags.AddReactions, PermissionsBitField.Flags.Administrator, PermissionsBitField.Flags.AttachFiles, PermissionsBitField.Flags.BanMembers, PermissionsBitField.Flags.ChangeNickname, PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.CreateInstantInvite, PermissionsBitField.Flags.CreatePrivateThreads, PermissionsBitField.Flags.CreatePublicThreads, PermissionsBitField.Flags.DeafenMembers, PermissionsBitField.Flags.EmbedLinks, PermissionsBitField.Flags.KickMembers, PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.ManageEmojisAndStickers, PermissionsBitField.Flags.ManageEvents, PermissionsBitField.Flags.ManageGuild, PermissionsBitField.Flags.ManageMessages, PermissionsBitField.Flags.ManageNicknames, PermissionsBitField.Flags.ManageRoles, PermissionsBitField.Flags.ManageThreads, PermissionsBitField.Flags.ManageWebhooks, PermissionsBitField.Flags.MentionEveryone, PermissionsBitField.Flags.ModerateMembers, PermissionsBitField.Flags.MoveMembers, PermissionsBitField.Flags.MuteMembers, PermissionsBitField.Flags.PrioritySpeaker, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.RequestToSpeak, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.SendMessagesInThreads, PermissionsBitField.Flags.SendTTSMessages, PermissionsBitField.Flags.Speak, PermissionsBitField.Flags.Stream, PermissionsBitField.Flags.UseApplicationCommands, PermissionsBitField.Flags.UseEmbeddedActivities, PermissionsBitField.Flags.UseExternalEmojis, PermissionsBitField.Flags.UseExternalStickers, PermissionsBitField.Flags.UseVAD, PermissionsBitField.Flags.ViewAuditLog, PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ViewGuildInsights];