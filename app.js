// const express = require('express');
// const app = express();
const RequestTurtle = require('request-turtle');
const turtle = new RequestTurtle({ limit: 300 }); // limit rate to 300ms. this is the default
const cheerio = require('cheerio');

const { db, Page, Domain } = require('./models');

let testUrl = 'http://www.craigslist.org/';

let crawlees = {};

const crawl = url => {

  if (Object.keys(crawlees).length > 50 || crawlees.url) {
    return;
  }

  crawlees[url] = 'yay';
  console.log('url:', url);

  turtle.request(url)
    .then(function(res) {
      let $ = cheerio.load(res);
      let title = $('title').text();
      let textContent = $('body').text();
      let links = $('a');
      let outboundLinks = Array.from(links)
        .map(anchor => anchor.attribs.href);

      // outboundLinks.forEach(crawl);

      // console.log('title', title);
      // console.log('textContent', textContent);
      // console.log('OL: ', outboundLinks)

      Page.findOrCreate({
          where: {
            url: url,
          },
          defaults: {
            title: title,
            textContent: textContent
          },
          // include: [outboundLinks]
        })
        .spread((page, created) => {
          //crawl with links
          outboundLinks.forEach(crawl);
          // include: [Page]

        });

    })
    .catch(err => {
      console.error('PROBLEM', err);
    });
    console.log('obj:', crawlees)
};

db.sync({ force: true })
  .then(() => {
    crawl(testUrl);
  })
  .catch(err => {
    console.log(error);
  });
