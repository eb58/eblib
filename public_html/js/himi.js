/* global _ */
var himiutils = {
  opts: function opts(qas, opts) {
//  i.e. var opts = [
//    [1, "1", "ja"],
//    [2, "2", "nein"],
//   ...
    return _.reduce(opts, function (acc, s) {
      return acc + '<option id="' + s[1] + '">' + s[2] + '</option>';
    }, '');
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
          var v = tblData[r].text || '';
          var val = coldef.render ? coldef.render(v, row) : v;
          res += '<td>' + val + '</td>';
        }
        res += '</tr>\n';
      }
      return res;
    }

    function initGrid(a) {
      var tableTemplate = _.template("\
        <div class='himitable'>\n\
          <div id='data' style='overflow-y:auto;overflow-x:auto; max-height:<%= bodyHeight %>px; width:100%'>\n\
            <table>\n\
              <tbody><%= data %></tbody>\n\
            </table>\n\
          </div>\n\
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

(function ($) {
  "use strict";
  $.fn.himiaccordion = function (qas, quests, answs) {
    // "qas": [
    //   {"id": 1, "question-id": 1, "question-number": '01', "question-text": "Ist das beantragte Hilfsmittel medizinisch notwendig?", "answer-id": 1, "answer-number": '1', "answer-text": 'Ja', "motivation": 'bla bla bla'},
    //   {"id": 2, "question-id": 4, "question-number": '04', "question-text": "Ist die Versorgung wirtschaftlich?", "answer-id": 1, "answer-number": '1', "answer-text": 'Ja', "motivation": 'bla bla bla'}
    // ]
    function acc() {
      var t = '';
      for (var r = 0; r < qas.length; r++) {
        var qopts = himiutils.opts(qas, quests);
        var aopts = himiutils.opts(qas, answs);
        var s = _.template('\
          <p>Frage <%=row%></p>\n\
          <div>\n\
            <select id="q<%=row%>"><%=qopts%></select>\n\
            <select id="a<%=row%>"><%=aopts%></select>\n\
            <textarea id="reason"<%=row%> rows=5 cols=80></textarea>\n\
          </div>\n')({row: r + 1, qopts: qopts, aopts: aopts});
        t += s;
      }
      return '<div id="himiaccordion">' + t + '</div>';
    }
    this.html(acc());
    return this;
  };
})(jQuery);