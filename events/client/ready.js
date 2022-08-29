const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log('Je suis prêt !');

        const devGuild = await client.guilds.cache.get(process.env.DEV_GUILD);
        const prdGuild = await client.guilds.cache.get(process.env.PRD_GUILD);
        devGuild.commands.set(client.commands.map(cmd => cmd));
        prdGuild.commands.set(client.commands.map(cmd => cmd));
    }
}