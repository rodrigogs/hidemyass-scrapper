'use strict';

const phantom = require('phantom');
const async = require('async');

const URL = 'http://proxylist.hidemyass.com/search-1292985#listable';

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
        if (options instanceof Function) {
            callback = options;
            options = {};
        }

        const url = options.url || URL;

        async.waterfall([
            (cb) => {
                const args = options.proxy ? {
                    parameters: {
                        proxy: options.proxy
                    }
                } : {};

                phantom.create(args, ph => cb(null, ph) );
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
            if (ph) {
                ph.exit();
            }
            if (err) {
                return callback(err);
            }
            callback(null, pages);
        });
    },

    /**
     * Crawl proxylist.hidemyass.com and retrieve a list of proxy servers.
     * 
     * @param {Object} options
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
                const args = options.proxy ? {
                    parameters: {
                        proxy: options.proxy
                    }
                } : {};

                phantom.create(args, ph => cb(null, ph) );
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
                        var table = document.querySelector('table#listable tbody');

                        if (table) {
                            var rows = document.querySelectorAll('tr', table);

                            for (var i = 0, len = rows.length; i < len; i++) {
                                var tr = rows[i];

                                var gateway = {};
                                var cols = document.querySelectorAll('td', tr);

                                for (var x = 0, xlen = rows.length; x < xlen; x++) {

                                    var col = cols[x];
                                    switch (col.cellIndex) {
                                        case 0:
                                            gateway.lastUpdate = col.innerText.trim();
                                            break;
                                        case 1:
                                            gateway.hostname = col.innerText.trim();
                                            break;
                                        case 2:
                                            gateway.port = col.innerText.trim();
                                            break;
                                        case 3:
                                            gateway.country = col.innerText.trim();
                                            break;
                                        case 6:
                                            gateway.protocol = col.innerText.trim().toLowerCase();
                                            break;
                                        case 7:
                                            gateway.anonymity = col.innerText.trim();
                                            break;
                                    }
                                }

                                gateway.provider = 'HideMyAss';
                                gtws.push(gateway);
                            }
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
            if (ph) {
                ph.exit();
            }
            if (err) {
                return callback(err);
            }
            callback(null, gateways);
        });
    }
};