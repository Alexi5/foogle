const RequestTurtle = require('request-turtle');
const { db, Page, Domain, Queue } = require('./models');
const cheerio = require('cheerio');
const turtle = new RequestTurtle({ limit: 300 });

function findLinks($) {
  return Array.from($('a'))
    .map(anchor => anchor.attribs.href)
    .filter(link => link && link.startsWith('http'));
  // [uri, uri, uri]
}

function addLink(direction, origin, destination) {
  const methodNames = {
    inbound: {
      getLinks: 'getInboundLinks',
      addLink: 'addInboundLink'
    },
    outbound: {
      getLinks: 'getOutboundLinks',
      addLink: 'addOutboundLink'
    }
  }[direction];

  return origin[methodNames.getLinks]({ // page_instance.getInboundLinks()
      where: {
        uri: destination.uri
      },
      limit: 1
    })
    .then(link => {
      return link[0] || origin[methodNames.addLink](destination); // page_instance.addInboundLink(page_instance)
    })
    .catch(err => {
      console.error('ruh roh', err);
    });
}

function findOrCreatePage(params) {
  return Page.findOrCreate({ where: params })
    .then(results => results[0])
    .catch(err => {
      console.error('uh oh', err);
    });
}

function crawl(uri, origin) {
  turtle.request({
      method: 'GET',
      uri: uri
    })
    .then(html => {
      const $ = cheerio.load(html);
      return Promise.all([
        $,
        // Add Page
        findOrCreatePage({
          title: $('title').text(),
          uri: uri,
          textContent: $('body').text(),
        })
      ]);
    })
    .then(grossArray => {
      const [$, page] = grossArray;
      // Associate
      if (origin) {
        Page.findOne({ where: { uri: origin } })
          .then(origin => {
            grossArray.push(addLink('outbound', origin, page));
            grossArray.push(addLink('inbound', origin, page));
          })
          .catch(err => {
            console.error('now hold your horses', err);
          });
      }
      return Promise.all(grossArray);
    })
    .then(grossArray => {
      const [$, page] = grossArray;
      const links = findLinks($);
      // Find all links
      const linkPromises = links.map(link => {
        // Add links to the queue
        return Queue.create({ origin: uri, uri: link })
          .catch(err => {
            console.error('halp', err);
          });
      });
      return Promise.all(linkPromises);
    })
    // .then(() => {
    //   console.log('hey guys i got hit');
    //   popFromQueue();
    // })
    .catch(err => {
      console.error(err, err.stack);
      process.exit(1);
    });
}

function popFromQueue() {
  Queue.findAll({ limit: 1, order: [['createdAt']]})
    .then(queue => {
      queue = queue[0];

      return Promise.all([
        crawl(queue.uri, queue.origin),
        queue.destroy()
      ]);
    })
    .catch(err => {
      console.error('nooo', err);
    });
}

function run() {
  return db.sync()
    .then(() => {
      return Queue.create({ uri: 'http://www.sentencingproject.org' })
        .catch(err => {
          console.error('why', err);
        });
    })
    .then(() => popFromQueue())
    .catch(err => {
      console.error('bad news bears', err);
    });
}

  module.exports = { run: run };
