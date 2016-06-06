/* global _ */
(function ($) {
  "use strict";
  $.fn.eblist = function (opts, vals) { 
    var id = this[0].id;
    var defopts = {
      height: Math.min(100, 50 * vals.length),
      width: 400,
    };
    var myopts = $.extend({}, defopts, opts);

    var init = function init(a) {
      var options = _.reduce(vals, function (acc, o) {
        return acc + _.template('<li><%=val%></li>')({val: o });
      }, '');

      var s = _.template('\
            <div class="eblist" style="height:<%=height%>px; width:<%=width%>px;">\n\
              <ul> <%=options%> </ul>\n\
            </div>\n')({options: options, width: myopts.width, height: myopts.height});
      a.html(s);
    }(this);

    this.id = id;
    return this;
  };
})(jQuery);