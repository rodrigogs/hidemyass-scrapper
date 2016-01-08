import test from 'ava';
import HideMyAss from './index';

test.cb('get pagination number', t => {
    t.plan(2);
    HideMyAss.getPages((err, pages) => {
        t.ifError(err, 'Unexpected error getting pagination');
        t.is(typeof pages, 'number', 'Pages from getPages must be a number');
        t.end();
    });
});

test.cb('crawl the proxy list from FreeProxyLists', t => {
    t.plan(3);
    HideMyAss.crawl((err, gateways) => {
        t.ifError(err, 'Unexpected error crawling page');
        t.true((gateways instanceof Array), 'Return should be an array');
        t.true((gateways.length > 0), 'Return should have values');
        t.end();
    });
});

test.cb('crawl the proxy list from FreeProxyLists passing a specific page number', t => {
    t.plan(4);
    HideMyAss.getPages((err, pages) => {
        t.ifError(err, 'Unexpected error getting pagination');
        t.is(typeof pages, 'number', 'GetPages return type should be a number');

        HideMyAss.crawl(pages, (err, gateways) => {
            t.ifError(err, 'Unexpected error crawling page');
            t.true((gateways instanceof Array), 'Crawl return type should be an array');
            t.end();
        });
    });
});