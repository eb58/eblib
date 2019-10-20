/* global _, jQuery */ /* jshint multistr: true *//* jshint expr: true */
(function ($) {
    "use strict";
    $.fn.icdlist = function (icds, opts) {
        const id = this[0].id;
        const self = this;

        const defopts = {
        };

        const myopts = $.extend({}, defopts, opts);

        const init = function () {

        }

        this.id = id;
        (function (a) {
            const s = _.template('<div> </div>\n')({options: options, width: myopts.width, height: myopts.height});
            a.html(s);
            init()
        })(this);

    }
})(jQuery);