/* global _ */
(function ($) {
  "use strict";
  $.fn.ebselect = function (opts, selected) {  // selected = [1,3] or { vals:[1,3]}  or {txts:['Keyword1', 'Keyword3']};
    var id = this[0].id;
    var self = this;
    var defopts = {
      height: Math.min(100, 50 * opts.values.length),
      width: 400,
      values: [{v: '1', txt: 'test1'}, {v: '2', txt: 'test2'}], //  just an example for docu
      onselchange: function (o) {
        console.log("selected values" + o.getSelectedValues());
      }
    };
    var myopts = $.extend({}, defopts, opts);

    this.id = id;
    selected = _.isArray(selected) ? {vals: selected} : selected;
    myopts.values = _.map(myopts.values, function (key, val) {
      return _.isString(key) ? {v: val, txt: key} : key;
    });
    _.each(myopts.values, function (val) {
      val.selected = selected.vals && _.indexOf(selected.vals, val.v) >= 0 || selected.txts && _.indexOf(selected.txts, val.txt) >= 0;
    });

    var init = function init(a) {
      var options = _.reduce(myopts.values, function (acc, o) {
        var isselected = o.selected ? 'checked="checked"' : '';
        return acc + _.template('\
               <li>\
                 <input type="checkbox" id="<%=id%>" value="<%=value%>" <%=isselected%> /><%=txt%>\n\
               </li>')({id: o.txt, value: o.v, isselected: isselected, txt: o.txt});
      }, '');
      var s = _.template('\
            <div class="ebselect" style="height:<%=height%>px; width:<%=width%>px;">\n\
              <ul> <%=options%> </ul>\n\
            </div>\n')({options: options, width: myopts.width, height: myopts.height});
      a.html(s);
      myopts.disabled && $('#' + id + ' input' ).prop('disabled', true);
    }(this);

    this.getSelectedValues = function getSelectedValues() {
      return _.pluck($('#' + id + ' .ebselect input:checked'), 'value');
    };
    this.getSelectedValuesAsString = function getSelectedValues() {
      return _.map(this.getSelectedValues(), function (o, idx) {
        return myopts.values[o].txt;
      });
    };
    $('#' + id + ' .ebselect input').on('change', function () {
      myopts.onselchange(self);
    });
    myopts.onselchange(this);
    return this;
  };
})(jQuery);