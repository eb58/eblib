/* global _, jQuery */ /* jshint multistr: true *//* jshint expr: true */
(function ($) {
  "use strict";
  $.fn.icdlist = function (icds, opts) {
    var id = this[0].id;
    var self = this;
    var defopts = {
    };
    var myopts = $.extend({}, defopts, opts);

    this.id = id;
    (function (a) {
      var s = _.template('<div> </div>\n')({options: options, width: myopts.width, height: myopts.height});
      a.html(s);
    })(this);

  }
})(jQuery);