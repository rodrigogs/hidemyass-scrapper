'use strict';

const phantom = require('phantom');

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
        phantom.create(ph => {
            ph.createPage(page => {
                page.open(URL, status => {

                    page.evaluate(
                        /* It runs on the virtual browser, so we cant use ES6 */
                        function () {
                            var paginationSection = $('section.hma-pagination'),
                                pages = $('.pagination li', paginationSection).not('.arrow');

                            return pages.length;
                        }
                        /* XXX */
                        , pages => {
                            callback(pages);
                            ph.exit();
                        }
                    );
                });
            });
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

        phantom.create(ph => {
            ph.createPage(page => {
                page.open(PAGE_URL, status => {

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

                            callback(gateways);
                            ph.exit();
                        }
                    );
                });
            });
        });
    }
};