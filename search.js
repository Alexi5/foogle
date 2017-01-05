const { db, Page, Domain, Queue } = require('./models');

const search = query => {
  db.query(`SELECT pages.title, pages.uri, COUNT (pages.id)
    FROM pages
    JOIN links ON pages.id = linker
    WHERE pages.title ILIKE :search_term
    GROUP BY pages.id
    ORDER BY COUNT(*) DESC`,
  { replacements: { search_term: `%${query}%` }, type: db.QueryTypes.SELECT })
    .then(results => {
      // Title found nothing
      if (results.length === 0) {
        db.query(`SELECT pages."textContent", pages.uri, COUNT (pages.id)
          FROM pages
          JOIN links ON pages.id = linker
          WHERE pages."textContent" ILIKE :search_term
          GROUP BY pages.id
          ORDER BY COUNT(*) DESC`,
          { replacements: { search_term: `%${query}%`  }, type: db.QueryTypes.SELECT })
          .then(results => {
            if (results.length === 0) {
              console.log('we have NOTHING for you.');
              return;
            }
            console.log('here is everything we found with your query', results[0].title);
            return;
          })
          .catch(err => {
            console.error('mayday mayday', err);
          });
      } else {
        // Title found something
        console.log('we found some good stuff:', results[0].title);
        return;
      }
    })
    .catch(err => {
      console.error('bad news', err);
    });
};

const orderSearchResults = results => {

}

search('fullstack')
