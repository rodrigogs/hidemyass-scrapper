'use strict';

const phantom = require('phantom');
const async = require('async');
const validator = require('validator');
const Promise = require('bluebird');

const URL = 'http://proxylist.hidemyass.com/search-1292985#listable';

/**
 * Loads a new page.
 *
 * @param {Object} options
 * @returns {Promise}
 */
function _loadPage(options) {
  options = options || {};

  return new Promise((resolve, reject) => {
    let instance,
      page;

    phantom.create(['--ignore-ssl-errors=yes', '--load-images=no', '--cookies-file=cookies.txt'])
      .then(ph => {
        instance = ph;
        return instance.createPage();
      })
      .then(createdPage => {
        page = createdPage;
        if (options.proxy) {
          return page.setProxy(options.proxy);
        } else {
          return Promise.resolve();
        }
      })
      .then(() => page.open(options.url || URL))
      .then(status => {
        if (status !== 'success') {
          throw new Error(`Error opening page for ${URL}`, null, ph);
        }
        return Promise.resolve();
      })
      .then(() => {
        let ret = {instance: instance, page: page};
        ret.exit = () => ret.instance.exit();
        return Promise.resolve(ret);
      })
      .then(_verifyDisponibility)
      .then(resolve)
      .catch(err => {
        instance.exit();
        reject(err);
      });
  });
}

/**
 *
 * @param loaded
 */
function _verifyDisponibility(loaded) {
  return new Promise((resolve, reject) => {
    loaded.page.evaluate(function () {
      var el = $('body');
      if (el.html().indexOf('403 Forbidden') > -1) {
        return 'forbidden';
      }
      if (el.html().indexOf('recaptcha_challenge_field') > -1) {
        return 'captcha';
      }
    }).then(status => {
      if (status === 'forbidden') {
        throw new Error('Your ip is blacklisted for proxylist.hidemyass.com');
      }
      if (status === 'captcha') {
        throw new Error('Captcha detected!');
      }
      resolve(loaded);
    }).catch(reject);
  });
}

/**
 * Retrieve the current pagination max number.
 *
 * @param {Object} options
 * @param {Function} callback
 * @returns {Promise}
 */
function _getPages(options, callback) {
  options = options || {};

  if (options instanceof Function) {
    callback = options;
    options = {};
  }

  return new Promise((resolve, reject) => {
    _loadPage(options).then(loaded => {
      loaded.page.evaluate(function () {
        var paginationSection = $('section.hma-pagination'),
          pages = $('.pagination li', paginationSection).not('.arrow');

        return pages.length;
      }).then(pages => {
        loaded.exit();
        if (callback) {
          callback(null, pages);
        }
        resolve(pages);
      });

    }).catch(err => {
      if (callback) {
        return callback(err);
      }
      reject(err);
    });
  });
}

/**
 * Crawl proxylist.hidemyass.com and retrieve a list of proxy servers.
 *
 * @param {Object} options
 * @param {Function} callback function (gateways) {}
 * @returns {Promise} Object[]
 *          lastUpdate
 *          hostname
 *          port
 *          country
 *          protocol
 *          anonymity
 */
function _crawl(options, callback) {
  options = options || {};

  if (options instanceof Function) {
    callback = options;
    options = {};
  }

  options.url = options.page ? `${URL}?page=${options.page}` : URL;

  return new Promise((resolve, reject) => {
    _loadPage(options).then(loaded => {

      return new Promise((resolve, reject) => {
        setTimeout(function () {
          loaded.page.evaluate(function () {
            var gtws = [];
            var table = $('table#listable tbody');
            if (table) {

              var rows = table.find('tr');
              rows.each(function (index, tr) {

                var gateway = {};
                var cols = $(tr).find('td');
                cols.each(function (index, col) {
                  col = $(col);
                  switch (col.index()) {
                    case 0:
                      gateway.lastUpdate = col[0].innerText.trim();
                      break;
                    case 1:
                      gateway.hostname = col[0].innerText.trim();
                      break;
                    case 2:
                      gateway.port = col[0].innerText.trim();
                      break;
                    case 3:
                      gateway.country = col[0].innerText.trim();
                      break;
                    case 6:
                      gateway.protocol = col[0].innerText.trim().toLowerCase();
                      break;
                    case 7:
                      gateway.anonymity = col[0].innerText.trim();
                      break;
                  }
                });

                gateway.provider = 'HideMyAss';
                gtws.push(gateway);
              });
            }

            return gtws;
          })
            .then(resolve)
            .catch(reject);
        }, 1500);

      }).then(gateways => {
        gateways = (gateways || [])
          .filter(n => {
            return n
              && n.hostname
              && validator.isIP(n.hostname)
              && n.port
              && n.protocol;
          });

        loaded.exit();
        if (callback) {
          callback(null, gateways);
        }
        resolve(gateways);
      });

    }).catch(err => {
      if (callback) {
        return callback(err);
      }
      reject(err);
    });
  });
}

/**
 * @module HideMyAssProvider
 */
module.exports = {
  getPages: _getPages,
  crawl: _crawl
};
