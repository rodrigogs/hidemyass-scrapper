import test from 'ava';
import HideMyAss from './index';

test.cb('get pagination number', t => {
    t.plan(1);
    HideMyAss.getPages(pages => {
        t.is(typeof pages, 'number');
        t.end();
    });
});

test.cb('crawl the proxy list from HideMyAss', t => {
    t.plan(1);
    HideMyAss.crawl(gateways => {
        t.true((gateways instanceof Array), 'Return should be an array');
        t.end();
    });
});

test.cb('crawl the proxy list from HideMyAss passing a specific page number', t => {
    t.plan(2);
    HideMyAss.getPages(pages => {
        t.is(typeof pages, 'number', 'GetPages return type should be a number');

        HideMyAss.crawl(pages, gateways => {
            t.true((gateways instanceof Array), 'Crawl return type should be an array');
            t.end();
        });
    });
});