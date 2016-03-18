/* global _ */

var himiutils = {
  opts: function opts(arr) {
    return _.reduce(arr, function (acc, s) {
      var v = _.values(s);
      return acc + '<option val="' + v[1] + '">' + v[1] + ' ' + v[2] + '</option>';
    }, '');
  },
  createHimi: function createHimi(number, name) {
    return {id: -1, number: number, text: name, digital: false, qas: []};
  },
  createQas: function createQas(id, motivation, q, a) {
    return _.extend({id: id, motivation: motivation}, q, a);
  },
  selectVal: function selectVal(id, val) {
    var x = '#' + id;
    $(x + " option[val='" + val + "']").attr('selected', true);
    $(x).selectmenu('refresh');
  },
  selectBox: function selectBox(id, opts) {
    return _.template("<select id='<%=id%>' class='selectmenu'><%=opts%></select>")({opts: himiutils.opts(opts), id: id});
  }
};

(function ($) {
  "use strict";
  $.fn.himitable = function (opts, data) {
    var defopts = {
      columns: [],
      bodyHeight: Math.max(200, $(window).height() - 100)
    };
    var myopts = $.extend({}, defopts, opts);
    var tblData = data;

    function tableData() {
      var res = '';
      for (var r = 0; r < tblData.length; r++) {
        var row = tblData[r];
        res += '<tr>';
        for (var c = 0; c < myopts.columns.length; c++) {
          var coldef = myopts.columns[c];
          if (coldef.invisible)
            continue;
          var v = tblData[r][c];
          var val = coldef.render ? coldef.render(v, row, r) : v;
          res += _.template('<td><%=val%></td>')({val: val});
        }
        res += '</tr>\n';
      }
      return res;
    }

    function initGrid(a) {
      var tableTemplate = _.template("\
        <div class='himitable'>\n\
            <table>\n\
              <tbody><%= data %></tbody>\n\
            </table>\n\
        </div>");
      a.html(tableTemplate({
        data: tableData(),
        bodyHeight: myopts.bodyHeight
      }));
    }
    initGrid(this);
    return this;
  };
})(jQuery);
