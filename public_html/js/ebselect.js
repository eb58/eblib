/* global _ */
(function ($) {
  "use strict";
  $.fn.ebselect = function (opts, data) { // data = array of selected values i.e ['3','4']
    var defopts = {
      height: 100,
      width: 400,
      selectoptions: [{value: '1', label: 'test1'}, {value: '2', label: 'test2'}] //  just an example
    };
    var myopts = $.extend({}, defopts, opts);
    _.each(data, function (n) {
      _.findWhere(myopts.selectoptions, {value: '' + n}).selected = true;
    })

    var init = function init(a) {
      var options = _.reduce(myopts.selectoptions, function (acc, o) {
        var isselected = o.selected ? 'checked="checked"' : '';
        return acc + _.template('\
          <li>\
            <input type="checkbox" id="<%=id%>" value="<%=value%>" <%=isselected%> onchange="$.fn.ebselect.onselchange(this)" /><%=label%>\n\
          </li>\n')({isselected: isselected, label: o.label, value: o.value, id: o.label});
      }, '');
      console.log(options);
      var s = _.template('\
        <div class="ebselect" style="height:<%=height%>px; width:<%=width%>px;">\n\
          <ul>\n\n\
            <%=options%>\n\
          </ul>\n\
        </div>')({options: options, width: myopts.width, height: myopts.height});
      a.html(s);
    }(this);
    return this;
  };
  $.fn.ebselect.onselchange = function (a) {
    console.log('selchange:', a.id, a.value);
  };
})(jQuery);