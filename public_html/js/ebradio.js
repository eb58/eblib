/* global _ */
(function ($) {
  "use strict";
  $.fn.ebradio = function (opts, vals, choice) {
    var id = this[0].id;
    var defopts = {
      vertical: false,
      width: 400,
      icon: false
    };
    var myopts = $.extend({}, defopts, opts);

    var init = function init(a) {
      var options = _.reduce(vals, function (acc, o) {
        return acc + _.template('<label><input type="radio" id="<%=val%>" name="<%=name%>"><%=val%></label><%=vertical%>')
                ({name: id, val: o, vertical: myopts.vertical ? '<br>' : ''});
      }, '');

      var s = _.template('\
            <div class="ebradio">\n\
              <%=options%>\n\
            </div>\n')({options: options});
      a.html(s);
    }(this);
    $('#' + id + " input").checkboxradio(myopts);
    this.id = id;
    this.val = function val(choice) {
      if (_.isString(choice) || _.isNumber(choice)) {
        $('#' + id + ' #' + choice).prop('checked', true).checkboxradio("refresh");
        return this;
      } else{
        return $('#' + id + ' input:radio:checked').prop('id');
      }
    };
    return this;
  };
})(jQuery);