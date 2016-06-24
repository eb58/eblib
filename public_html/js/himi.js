/* global _ */

var himiutils = {
  opts: function opts(arr) {
    return _.reduce(arr, function (acc, s) {
      var v = _.values(s);
      return acc + '<option value=' + v[0] + '>' + v[1] + ' ' + v[2] + '</option>';
    }, '');
  },
  qasTable: function qasTable( himi ){
    var xxx = himi[2].split('###');
    var himitext = xxx[0].trim() + ' - ' + xxx[1].trim();
    var himiansw = xxx[2].trim();
    var qas = himi[3];
    return '\
      <table class="qastbl">\n' + 
        _.template("<tr><td><b><%=himi%></td><td><b><%=answ%></td></b></tr>")({himi: himitext, answ: himiansw }) +           
        _.reduce(qas, function( res, qa ) { 
          var answ = _.findWhere(answs, {'answer-id': qa['answer-id']});
          var answtext = answ ? answ['answer-text'] : '';
          return res + '\
            <tr>\n\
              <td>' + qa['question-text'] + '</td>\n\
              <td>' + answtext + '</td>\n\
              <td hidden=true>' + qa['motivation-question'] + '</td>\n\
              <td hidden=true>' + qa['motivation-answer'] + '</td>\n\
            </tr>\n';
        }, '' ) +
      '</table>\n';
  },
  createHimi: function createHimi(number, name) {
    return {id: -1, number: number, text: name, digital: false, qas: []};
  },
  createQas: function createQas(id, motivationQuestion, motivationAnswer, q, a) {
    return _.extend({id: id, 'motivation-question': motivationQuestion, 'motivation-answer': motivationAnswer}, q, a);
  },
  selectVal: function selectVal(id, val) {
    var x = '#' + id;
    $(x + " option[value=" + val + "]").attr('selected', true);
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
