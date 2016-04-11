/* global _ */

var himiutils = {
  opts: function opts(arr) {
    return _.reduce(arr, function (acc, s) {
      var v = _.values(s);
      return acc + '<option val="' + v[1] + '">' + v[1] + ' ' + v[2] + '</option>';
    }, '');
  },
  qasTable: function qasTable( qas ){
    return '\
      <table class="qastbl">\n' + 
        _.reduce(qas, function( res, qa ) { 
          return res + '<tr><td>' + qa['question-text'] + '</td><td>' + qa['answer-text'] + '</td><td hidden=true>' + qa['motivation'] + '</td></tr>\n';
        }, '' ) +
      '</table>\n';

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
  $.fn.himitable = function (opts, tblData) {
    var defopts = {
      columns: [],
      bodyHeight: Math.max(200, $(window).height() - 100)
    };
    var myopts = $.extend({}, defopts, opts);

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

if (typeof $ !== 'undefined') {
  $.extend({
    alert: function (title, message) {
      $("<div></div>").dialog({
        buttons: {"Ok": function () {
            $(this).dialog("close");
          }},
        close: function () {
          $(this).remove();
        },
        title: title,
        modal: true,
        closeText: 'Schlie\u00dfen'
      }).html('<br>' + message.replace('\n', '<br>'));
    }
  });
}