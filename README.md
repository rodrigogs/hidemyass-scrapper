# HideMyAss Scrapper

[![Build Status](https://travis-ci.org/rodrigogs/hidemyass-scrapper.svg?branch=master)](https://travis-ci.org/rodrigogs/hidemyass-scrapper)
[![npm version](https://badge.fury.io/js/hidemyass-scrapper.svg)](https://badge.fury.io/js/hidemyass-scrapper)
[![npm](https://img.shields.io/npm/dt/hidemyass-scrapper.svg)](https://www.npmjs.com/package/hidemyass-scrapper)

Page scrapper that retrieves proxy server information from HideMyAss website.

Make sure phantomjs is installed!

> npm install hidemyass-scrapper

```javascript
var HideMyAss = require('hidemyass-scrapper');

HideMyAss.getPages(function (err, pages) {
    if (err) {
        return console.log('Dammit!');
    }
    HideMyAss.crawl(pages, function (err, proxylist) {
        if (err) {
            return console.log('Dammit!');
        }
        for (proxy in proxylist) {
            // You have a proxy here
        }
    });
});
```

## License

[Licence](https://github.com/rodrigogs/hidemyass-scrapper/blob/master/LICENSE) © Rodrigo Gomes da Silva
