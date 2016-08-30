import test from 'ava';
import HideMyAss from './index';

test('get pagination number', t => {
  return HideMyAss.getPages().then(pages => {
    t.is(typeof pages, 'number', 'Pages from getPages must be a number');
  });
});

test('crawl the proxy list from HideMyAss', t => {
  return HideMyAss.crawl().then(gateways => {
    console.log(gateways);
    t.true((gateways instanceof Array), 'Return should be an array');
  });
});

test('crawl the proxy list from HideMyAss passing a specific page number', t => {
  return HideMyAss.getPages().then(pages => {
    t.is(typeof pages, 'number', 'GetPages return type should be a number');

    return HideMyAss.crawl({page: pages}).then(gateways => {
      t.true((gateways instanceof Array), 'Crawl return type should be an array');
    });
  });
});
