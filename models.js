const Sequelize = require('sequelize');
const db = new Sequelize('postgres://localhost:5432/foogle', { logging: false });

const domainSchema = {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    }
};

const Domain = db.define('domain', domainSchema);

const pageSchema = {
    // defined by <head> <title> title goes here </title> </head>
    title: {
        type: Sequelize.TEXT,
        allowNull: false   // just store an empty string
    },
    // The precise URL where this page is located
    uri: {
        type: Sequelize.TEXT,
        allowNull: false,
        // validate: {
        //     isUrl: true
        // }
    },
    // A string containing a concatenated form of all text strings from this page
    textContent: {
        type: Sequelize.TEXT,
        allowNull: false
    },
};

const Page = db.define('page', pageSchema);

const queueSchema = {
    uri: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    origin: {
        type: Sequelize.TEXT
    }
};

const Queue = db.define('queue', queueSchema);


Page.belongsToMany(Page, { as: 'outboundLinks', through: 'links', foreignKey: 'linker' });
Page.belongsToMany(Page, { as: 'inboundLinks', through: 'links', foreignKey: 'linkee' });

Domain.hasMany(Page);


module.exports = {
    db: db,
    Page: Page,
    Domain: Domain,
    Queue: Queue
};
