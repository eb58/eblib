/* global _,jQuery *//* jshint expr: true */
(function ($) {
    $.fn.ebdropdown = function (opts, values, selected) {
        // values = ['val1', 'val2', 'val3' ];
        // values = [{v:1, txt:'val1'}, {v:2, txt:'val2'} ];
        if (!this || !this[0]) {
            return;
        }
        var id = this[0].id;
        var defopts = {
            id: id + 'X',
            width: '100%',
            disabled: false,
            jqueryui: true,
            change: function (evt, ui) {},
        };
        var myopts = $.extend({}, defopts, opts);
        var idX = '#' + myopts.id;

        var api = {
            setSelectedValue: function setSelectedValue(v) {
        if (v !== undefined && v !== null) {
          var cmp = '' + (v.txt || v.v || v);
          $(idX + ' option').filter(function (i, o) {
            if (v.txt) {
                        return $(o).text() === v.txt;
            } else if (v.v) {
                        return $(o).val() === v.v;
                    } else {
              return $(o).text() === cmp || $(o).val() === cmp;
                    }
          }).prop("selected", "selected");
                myopts.jqueryui && $(idX).selectmenu().selectmenu('refresh');
        }
                return this;
            },
            getSelectedValue: function getSelectedValue() {
                var v = $(idX).val();
                return v && v !== 'null' ? v : null;
            },
            disable: function disable(b) {
                $(idX).selectmenu(b ? 'disable' : 'enable');
            },
        }

        var init = function(a) {
            var options = values.map(function (o) {
                var val = typeof o.txt !== 'undefined' ? ' value=' + o.v : '';
                var txt = typeof o.txt !== 'undefined' ? o.txt : o;
                return '<option' + val + '>' + txt + '</option>';
            }).join('\n');
            var t = _.template('<select id="<%=id%>" name="<%=id%>" size="1"><%= o %> </select>');
            a.html(t({id: myopts.id, o: options}));
            api.setSelectedValue(selected);
            if (myopts.jqueryui) {
                $(idX).selectmenu().selectmenu(myopts);
                myopts.disabled && $(idX).selectmenu('disable');
            } else {
                myopts.disabled && $(idX).prop('disabled', true);
                $(idX).change(myopts.change).width(myopts.width);
            }
        };
        init(this);
        return _.extend(this, api);
    };
})(jQuery);
