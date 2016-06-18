/* global _ */
(function ($) {
  $.fn.ebdropdown = function (opts, values, selected) {
    // values = ['val1', 'val2', 'val3' ];
    // values = [{v:1, txt:'val1'}, {v:2, txt:'val2'} ];
    var defopts = {
      width: '200px',
      onchange: function (evt, ui) {
        console.log('changed', ui, evt);
      }
    };
    var myopts = $.extend({}, defopts, opts);
    var id = this[0].id;
    var idX = '#' + id + 'X';

    var setSelectedValue = function (v) {
      if (v) {
        $(idX + ' option').filter(function (i, o) {
          return $(o).val() === v;
        }).prop("selected", "selected");
        $(idX).selectmenu().selectmenu('refresh');
      }
    };

    var init = function init(a) {
      var options = _.map(values, function (o) {
        var value = typeof o.v === 'undefined' ? '' : ' value=' + o.v;
        return '<option' + value + '>' + o.txt + '</option>';
      }).join('\n');
      var t = _.template('<select id="<%=id%>" size="1" style="width:<%=w%>"><%= o %> </select>');
      a.html(t({id: id + 'X', w: myopts.width, o: options}));
      setSelectedValue(selected);
      $(idX).selectmenu().selectmenu({change: myopts.onchange});
    };
    init(this);
    this.setSelectedValue = setSelectedValue;
    return this;
  };
})(jQuery);