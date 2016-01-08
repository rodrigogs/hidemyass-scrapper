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
     * @param {Function} callback
     * @returns {Number}
     */
    getPages: (callback) => {
        async.waterfall([
            (cb) => {
                phantom.create(ph => cb(null, ph) );
            },

            (ph, cb) => {
                ph.createPage(page => cb(null, ph, page) );
            },

            (ph, page, cb) => {
                page.open(URL, status => {
                    if (status !== 'success') {
                        return cb(new Error(`Error opening page for ${URL}`), null, ph);
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
    crawl: (page, callback) => {
        if (page instanceof Function) {
            callback = page;
            page = null;
        }

        const PAGE_URL = page ? URL.replace('#', `/${page}#`) : URL;
        
        async.waterfall([
            (cb) => {
                phantom.create(ph => cb(null, ph) );
            },

            (ph, cb) => {
                ph.createPage(page => cb(null, ph, page) );
            },

            (ph, page, cb) => {
                page.open(URL, status => {
                    if (status !== 'success') {
                        return cb(new Error(`Error opening page for ${URL}`, null, ph));
                    }
                    cb(null, ph, page);
                });
            },

            (ph, page, cb) => {
                page.evaluate(
                    /* It runs on the virtual browser, so we cant use ES6 */
                    function () {
                        var gtws = [];
                        var table = $('table.DataGrid tbody');
                        if (table) {
    
                            var rows = table.find('tr.Odd, tr.Even');
                            rows.each(function (index, tr) {
    
                                var gateway = {};
                                var cols = $(tr).find('td');
                                cols.each(function (index, col) {
    
                                    col = $(col);
                                    switch (col.index()) {
                                        case 0:
                                            gateway.hostname = col[0].innerText.trim();
                                            break;
                                        case 1:
                                            gateway.port = col[0].innerText.trim();
                                            break;
                                        case 2:
                                            gateway.protocol = col[0].innerText.trim().toLowerCase();
                                            break;
                                        case 3:
                                            gateway.anonymity = col[0].innerText.trim();
                                            break;
                                        case 4:
                                            gateway.country = col[0].innerText.trim();
                                            break;
                                        case 5:
                                            gateway.region = col[0].innerText.trim();
                                            break;
                                        case 6:
                                            gateway.city = col[0].innerText.trim();
                                            break;
                                        case 7:
                                            gateway.uptime = col[0].innerText.trim();
                                            break;
                                    }
    
                                    gateway.provider = 'FreeProxyLists';
                                    gtws.push(gateway);
                                });
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