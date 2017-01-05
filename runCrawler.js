const crawler = require('./crawler');

function forever() {
  crawler.run()
    .then(() => forever());
}

forever();
