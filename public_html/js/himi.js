/* global _ */
// himi = {
//    "himis": [{
//        "id": 0,
//        "lfd-nr": 0,
//        "number": 0,
//        "text": 'Rollstuhl',
//        "digital": false,
//        "qas": [
//          {"id": 1, "question-id": 2, "question-number": '03', "question-text": "Ist das beantragte ...?", "answer-id": 2, "answer-number": '2', "answer-text": 'Nein', "motivation": 'motivation'},
//          {"id": 2, "question-id": 4, "question-number": '04', "question-text": "Ist die Versorgung ...?", "answer-id": 1, "answer-number": '1', "answer-text": 'Ja', "motivation": 'bla bla bla'}
//        ]
//      }
//    ],
//    "global-answer-id": '1',
//    "medical-base": '',
//    "anamnesis": '',
//    "indication": '',
//    "evaluation": '',
//    "suggestion": ''
//  }
//  

function createHimi(id, name) {
  return {"id": id, "lfd-nr": id, "number": id, "text": name, "digital": false, "qas": []};
}
function createQas(id) {
  var q = _.object(['question-id', 'question-number', 'question-text'], [quests[0][0], quests[0][1], quests[0][2]]);
  var a = _.object(['answer-id', 'answer-number', 'answer-text'], [answs[0][0], answs[0][1], answs[0][2]]);
  return _.extend({"id": id, "motivation": ''}, q, a );
}

var himiModel = function (m) {
  var blankHimi = {"id": 0, "lfd-nr": 0, "number": 0, "text": '', "digital": false, "qas": []};
  var blankQas = {"id": 0, "question-id": 0, "question-number": '', "question-text": "", "answer-id": 1, "answer-number": '1', "answer-text": 'Ja', "motivation": ''};

  var basic_api = {
    appendHimi: function () {
      var id = m.himis.length + 1;
      m.himis.push(_.extend({}, blankHimi, {"id": id}));
      return _.last(m.himis);
    },
    appendQas: function (n) {
      var id = m.himis[n].qas.length + 1;
      m.himis[n].qas.push(_.extend({}, blankQas, {"id": id}));
      return _.last(m.himis[n].qas);
    },
    getHimis: function () {
      return m.himis;
    }
  };
  return _.extend({}, basic_api);
};

// ############################################################################

var himiutils = {
  //var qas = [
  //    {"id": 1, "question-id": 1, "question-number": '01', "question-text": "Ist das beantragte Hilfsmittel medizinisch notwendig?", "answer-id": 1, "answer-number": '1', "answer-text": 'Ja', "motivation": 'bla bla bla'},
  //    {"id": 2, "question-id": 4, "question-number": '04', "question-text": "Ist die Versorgung wirtschaftlich?", "answer-id": 1, "answer-number": '1', "answer-text": 'Ja', "motivation": 'bla bla bla'}
  //];
  opts: function opts(arr) {
    return _.reduce(arr, function (acc, s) {
      return acc + '<option val="' + s[1] + '">' + s[1] + ' ' + s[2] + '</option>';
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
          var v = tblData[r][c] || '';
          var val = coldef.render ? coldef.render(v, row) : v;
          var w = coldef.width ? ' style="width:' + coldef.width + 'px"' : '';
          res += _.template('<td<%=w%>><%=val%></td>')({val: val, w: w});
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
