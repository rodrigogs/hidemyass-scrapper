# HideMyAss Scrapper

Page scrapper that retrieves proxy server information from HideMyAss website.

> npm install hidemyass-scrapper

```javascript
var hidemyass = require('hidemyass-scrapper');

hidemyass.crawl(function (proxylist) {
    for (proxy in proxylist) {
        // You have a proxy here
    }
});
```

## License

[Licence](https://github.com/rodrigogs/hidemyass-scrapper/blob/master/LICENSE) © Rodrigo Gomes da Silva