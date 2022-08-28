const { promisify } = require('util');
const { glob } = require('glob');
const pGlob = promisify(glob);

module.exports = async client => {
    (await pGlob(`${process.cwd()}/modals/*/*.js`)).map(async modalFile => {

        const modal = require(modalFile);

        if (!modal.name) return console.log(`-----\nModale non-chargé: pas de nom\nFichier -> ${modalFile}\n-----`);

        client.modals.set(modal.name, modal);

        console.log(`Modale chargé: ${modal.name}`);
    });
};
