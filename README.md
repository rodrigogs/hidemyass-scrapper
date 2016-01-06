# HideMyAss Scrapper

Page scrapper that retrieves proxy server information from HideMyAss website.

> npm install hidemyass-scrapper

```javascript
var HideMyAss = require('hidemyass-scrapper');

HideMyAss.getPages(function (pages) {
    HideMyAss.crawl(pages, function (proxylist) {
        for (proxy in proxylist) {
            // You have a proxy here
        }
    });
});
```

## License

[Licence](https://github.com/rodrigogs/hidemyass-scrapper/blob/master/LICENSE) © Rodrigo Gomes da Silva