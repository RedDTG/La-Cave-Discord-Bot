const { promisify } = require('util');
const { glob } = require('glob');
const pGlob = promisify(glob);
const { PermissionsBitField } = require('discord.js');


module.exports = async client => {
    (await pGlob(`${process.cwd()}/commands/*/*.js`)).map(async cmdFile => {

        const cmd = require(cmdFile);

        if (!cmd.name || !cmd.description) return console.log(`-----\Commande non-chargée: pas de nom et/ou de description\nFichier -> ${cmdFile}\n-----`);

        if (!cmd.permissions) return console.log(`-----\Commande non-chargée: pas de permission\nFichier -> ${cmdFile}\n-----`)

        cmd.permissions.forEach(permission => {
            if (!permissionList.includes(permission)) {
                return console.log(`-----\Commande non-chargée: erreur de typo sur la permission '${permission}'\nFichier -> ${cmdFile}\n-----`);
            }
        });

        client.commands.set(cmd.name, cmd);

        console.log(`Commande chargée: ${cmd.name}`);
    });
};

const permissionList = [PermissionsBitField.Flags.AddReactions, PermissionsBitField.Flags.Administrator, PermissionsBitField.Flags.AttachFiles, PermissionsBitField.Flags.BanMembers, PermissionsBitField.Flags.ChangeNickname, PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.CreateInstantInvite, PermissionsBitField.Flags.CreatePrivateThreads, PermissionsBitField.Flags.CreatePublicThreads, PermissionsBitField.Flags.DeafenMembers, PermissionsBitField.Flags.EmbedLinks, PermissionsBitField.Flags.KickMembers, PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.ManageEmojisAndStickers, PermissionsBitField.Flags.ManageEvents, PermissionsBitField.Flags.ManageGuild, PermissionsBitField.Flags.ManageMessages, PermissionsBitField.Flags.ManageNicknames, PermissionsBitField.Flags.ManageRoles, PermissionsBitField.Flags.ManageThreads, PermissionsBitField.Flags.ManageWebhooks, PermissionsBitField.Flags.MentionEveryone, PermissionsBitField.Flags.ModerateMembers, PermissionsBitField.Flags.MoveMembers, PermissionsBitField.Flags.MuteMembers, PermissionsBitField.Flags.PrioritySpeaker, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.RequestToSpeak, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.SendMessagesInThreads, PermissionsBitField.Flags.SendTTSMessages, PermissionsBitField.Flags.Speak, PermissionsBitField.Flags.Stream, PermissionsBitField.Flags.UseApplicationCommands, PermissionsBitField.Flags.UseEmbeddedActivities, PermissionsBitField.Flags.UseExternalEmojis, PermissionsBitField.Flags.UseExternalStickers, PermissionsBitField.Flags.UseVAD, PermissionsBitField.Flags.ViewAuditLog, PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ViewGuildInsights];
