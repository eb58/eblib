/* global _, jQuery */ /* jshint multistr: true *//* jshint expr: true */
(function ($) {
  "use strict";
  $.fn.template = function (icds, opts) {
    const id = this[0].id;
    const self = this;

    const defopts = {
    };

    const myopts = $.extend({}, defopts, opts);

    const init = function () { }
    const styling = function () { }

    this.id = id;
    (function (a) {
      const template = '<div> </div>\n';
      const s = _.template(template)({options: options, width: myopts.width, height: myopts.height});
      a.html(s);
      init();
      styling();
    })(this);

  }
}(jQuery));