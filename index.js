'use strict';

const phantom = require('phantom');
const async = require('async');

const URL = 'http://proxylist.hidemyass.com/search-1302871#listable';

/**
 * @module HideMyAssProvider
 */
module.exports = {

    /**
     * Retrieve the current pagination max number.
     * 
     * @param {Object} options
     * @param {Function} callback
     * @returns {Number}
     */
    getPages: (options, callback) => {
        let url = options.url || URL;

        async.waterfall([
            (cb) => {
                phantom.create(ph => cb(null, ph) );
            },

            (ph, cb) => {
                ph.createPage(page => cb(null, ph, page) );
            },

            (ph, page, cb) => {
                page.open(url, status => {
                    if (status !== 'success') {
                        return cb(new Error(`Error opening page for ${url}`), null, ph);
                    }
                    cb(null, ph, page);
                });
            },

            (ph, page, cb) => {
                page.evaluate(
                    /* It runs on the virtual browser, so we cant use ES6 */
                        function () {
                            var paginationSection = $('section.hma-pagination'),
                                pages = $('.pagination li', paginationSection).not('.arrow');

                            return pages.length;
                        }
                    /* XXX */
                    , pages => {
                        cb(null, pages, ph);
                    }
                );
            }
        ], (err, pages, ph) => {
            ph.exit();

            if (err) {
                return callback(err);
            }
            callback(null, pages);
        });
    },

    /**
     * Crawl proxylist.hidemyass.com and retrieve a list of proxy servers.
     * 
     * @param {Number} page Page number
     * @param {Function} callback function (gateways) {}
     * @returns Object[] 
     *          lastUpdate
     *          hostname
     *          port
     *          country
     *          protocol
     *          anonymity
     */
    crawl: (options, callback) => {
        if (options instanceof Function) {
            callback = options;
            options = {};
        }

        let url = options.url || URL;
        const PAGE_URL = options.page ? url.replace('#', `/${options.page}#`) : url;
        
        async.waterfall([
            (cb) => {
                phantom.create(ph => cb(null, ph) );
            },

            (ph, cb) => {
                ph.createPage(page => cb(null, ph, page) );
            },

            (ph, page, cb) => {
                page.open(url, status => {
                    if (status !== 'success') {
                        return cb(new Error(`Error opening page for ${url}`, null, ph));
                    }
                    cb(null, ph, page);
                });
            },

            (ph, page, cb) => {
                page.evaluate(
                    /* It runs on the virtual browser, so we cant use ES6 */
                    function () {
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
                    }
                    /* XXX */
                    , gateways => {
                        gateways = gateways
                            .filter(n => {
                                return !!n
                                    && !!n.hostname
                                    && !!n.port
                                    && !!n.protocol;
                            });
    
                        cb(null, gateways, ph);
                    }
                );
            }
        ], (err, gateways, ph) => {
            ph.exit();

            if (err) {
                return callback(err);
            }
            callback(null, gateways);
        });
    }
};