/* global _ */
(function ($) {
  "use strict";
  $.fn.ebselect = function (opts, data) { // data = array of selected values i.e ['3','4']
    var id = this[0].id;
    var self = this;
    var defopts = {
      height: Math.min(100, 50 * opts.values.length),
      width: 400,
      values: [{value: '1', label: 'test1'}, {value: '2', label: 'test2'}], //  just an example for docu
      onselchange: function (o) {
        alert("selected values" + o.getSelectedValues());
      }
    };
    var myopts = $.extend({}, defopts, opts);

    myopts.values = _.map(myopts.values, function (key, val) {
      return _.isString(key) ? {value: val, label: key} : key;
    });
    _.each(myopts.values, function (val) {
      val.selected = _.indexOf(data, val.value) >= 0;
    });

    var init = function init(a) {
      var options = _.reduce(myopts.values, function (acc, o) {
        var isselected = o.selected ? 'checked="checked"' : '';
        return acc + _.template('\
               <li>\
                 <input type="checkbox" id="<%=id%>" value="<%=value%>" <%=isselected%> /><%=label%>\n\
               </li>')({id: o.label, value: o.value, isselected: isselected, label: o.label});
      }, '');
      var s = _.template('\
            <div class="ebselect" style="height:<%=height%>px; width:<%=width%>px;">\n\
              <ul> <%=options%> </ul>\n\
            </div>\n')({options: options, width: myopts.width, height: myopts.height});
      a.html(s);
    }(this);

    this.id = id;
    this.getSelectedValues = function getSelectedValues() {
      return _.pluck($('#' + id + ' .ebselect input:checked'), 'value');
    };
    $('#' + id + ' .ebselect input').on('change', function () {
      myopts.onselchange(self);
    });
    return this;
  };
})(jQuery);