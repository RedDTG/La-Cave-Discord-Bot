const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log('Je suis prêt !');

        const devGuild = await client.guilds.cache.get(process.env.DEV-GUILD);
        const prdGuild = await client.guilds.cache.get(process.env.PRD-GUILD);
        devGuild.commands.set(client.commands.map(cmd => cmd));
        prdGuild.commands.set(client.commands.map(cmd => cmd));
    }
}