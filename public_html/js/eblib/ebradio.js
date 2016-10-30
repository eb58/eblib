/* global _, jQuery*/
/*jshint multistr: true */
(function ($) {
  "use strict";
  $.fn.ebradio = function (opts, vals, choice) {
    var id = this[0].id;
    if (opts) {
      var defopts = {
        vertical: false,
        width: 400,
        icon: false
      };
      var myopts = $.extend({}, defopts, opts);

      (function (a) {
        var options = _.reduce(vals, function (acc, o) {
          return acc + _.template('<label><input type="radio" id="<%=val%>" name="<%=name%>"><%=val%></label><%=vertical%>')
                  ({name: id, val: o, vertical: myopts.vertical ? '<br>' : ''});
        }, '');

        var s = _.template('\
            <div class="ebradio">\n\
              <%=options%>\n\
            </div>\n')({options: options});
        a.html(s);
      })(this);
      $('#' + id + " input").checkboxradio(myopts);
    }
    this.id = id;
    this.val = function(choice) {
      if (_.isString(choice) || _.isNumber(choice)) {
        $('#' + id + ' #' + choice).prop('checked', true).checkboxradio('refresh');
        //$('div#' +id +'input:radio', ).checkboxradio('refresh');
        return this;
      } else {
        return $('#' + id + ' input:radio:checked').prop('id');
      }
    };
    return this;
  };
})(jQuery);