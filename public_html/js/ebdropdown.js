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
        var cmp = '' + (v.txt || v.v || v);
        $(idX + ' option').filter(function (i, o) {
          if (v.txt)
            return $(o).text() === v.txt;
          else if (v.v)
            return  $(o).val() === v.v;
          else
            return $(o).text() === cmp || $(o).val() === cmp;
        }).prop("selected", "selected");
        $(idX).selectmenu().selectmenu('refresh');
      }
    };
    var getSelectedValue = function () {
      var v = $(idX).val();
      return typeof v === 'string' || typeof v === 'number' ? v : null;
    };


    var init = function init(a) {
      var options = _.map(values, function (o) {
        var val = typeof o.v === 'string' || typeof o.v === 'number' ? ' value=' + o.v || '' : '';
        var txt = typeof o.v === 'string' || typeof o.v === 'number' ? o.txt || '' : '';
        return '<option' + val + '>' + txt + '</option>';
      }).join('\n');
      var t = _.template('<select id="<%=id%>" size="1" style="width:<%=w%>"><%= o %> </select>');
      a.html(t({id: id + 'X', w: myopts.width, o: options}));
      setSelectedValue(selected);
      $(idX).selectmenu().selectmenu({change: myopts.onchange});
    };
    init(this);
    this.setSelectedValue = setSelectedValue;
    this.getSelectedValue = getSelectedValue;
    return this;
  };
})(jQuery);