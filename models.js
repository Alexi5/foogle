var Sequelize = require('sequelize');
var db = new Sequelize('postgres://localhost:5432/webcrawler');

domainSchema = {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    }
}

var Domain = db.define('domain', domainSchema)

pageSchema = {
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
    // The status code returned upon retrieving this page
}

var Page = db.define('page', pageSchema)


Page.belongsToMany(Page, { as: 'outboundLinks', through: 'links', foreignKey: 'linker' });
Page.belongsToMany(Page, { as: 'inboundLinks', through: 'links', foreignKey: 'linkee' });

Domain.hasMany(Page);


module.exports = {
    db: db,
    Page: Page,
    Domain: Domain
}
