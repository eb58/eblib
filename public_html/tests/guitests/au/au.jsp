<!DOCTYPE html>
<!-- himi.jsp (<%=org.slf4j.MDC.get("Request")%>) -->
<%@ page contentType="text/html;charset=UTF-8" pageEncoding="UTF-8" errorPage="appError.jsp"%>
<html lang='de'>
  <head>
    <title>Arbeitsunfähigkeit</title>
    <meta http-equiv='Content-Type' content='text/html; charset=UTF-8'/>
    <link rel='stylesheet' href='vendor/jQueryUI-1.12.0/jquery-ui.min.css'/>
    <link rel='stylesheet' href='css/ebtable.css'/>
    <link rel='stylesheet' href='css/eblib.css'/>
    <style>
      * {font-family:Arial; color: black; font-size: 12px;}
      body{ margin: 20px 20px 20px 20px; }
      textarea{ width:100%;}
      textarea[readonly]{ background-color: #e3e0e0; }
      .ui-datepicker-trigger {vertical-align:bottom;}
      #questionsTable .ebtable .ctrl { display: none}
      #questionsTable thead { display: none}

    </style>
    <script src='vendor/Underscore-1.8.3/underscore-1.8.3.min.js'></script>
    <script src='vendor/jQuery-1.11.3/jquery-1.11.3.min.js'></script>
    <script src='vendor/jQueryUI-1.12.0/jquery-ui.min.js'></script>
    <script src='vendor/jquery.numeric.min.js'></script>
    <script src='vendor/moment.min.js'></script>

    <script src='javascript/data/icddata.js'></script>
    <script src='javascript/data/audata.js'></script>
    <script src='javascript/data/aulists.js'></script>
    
    <script src='javascript/polyfill.js'></script>
    
    <script src='javascript/ebutils.js'></script>
    <script src='javascript/ebbind.js'></script>
    <script src='javascript/ebdropdown.js'></script>  
    <script src='javascript/ebselect.js'></script>  
    <script src='javascript/ebtextarea.js'></script>  
    <script src='javascript/ebtable/mx.js'></script>
    <script src='javascript/ebtable/ebtable.js'></script>  

    <script src='javascript/dialogs/dlgIcdcode.js'></script>
    <script src='javascript/jquery-ui-datepicker-de.js'></script>

    <script src='javascript/jquery-ismed.js'></script>
    <script src='javascript/ismed_script.js'></script>
    <script src='javascript/help_caller.js'></script>
    <script src='javascript/context.js'></script>

    <script>

      ///////////////////////////////////////////////////
      var dialogName = 'au';
      var isSFB = true;

      var setOrderParameter = function () {
        return true;
      };
      setOrderParameter = function () {
        console.log('setOrderParameter');
        result.data.aus = aus;
        result.data.icds = _.compact(icds).filter(function (o) {
          return !!o['icd-code-id'];
        });
        return doSave(result.data);
      };

      var validateDialogValues = function () {
        return '';
      };

      ///////////////////////////////////////////////////

      var readonly = false;

      var icdfct = (function () {
        function getIcdCodeFromNumber(code) {
          var x = _.find(icddata, function (o) {
            return o[2] === code;
          });
          return x ? {id: x[0], text: x[1]} : null;
        }
        function initIcdTable(icds) {
          for (var i = 1; i <= 5; i++) {
            var icd = icds[i - 1] || {};
            $('#icdcode' + i).val(icd['icd-code-number']);
            $('#icdtext' + i).val(icd['text']);
            $('#icdsrch' + i).toggle(!icd.digital);
          }
          initActionsForIcdlist();
        }
        function initActionsForIcdlist() {   // Actions for Icdlist
          $('#diagnosen .ui-icon-trash').off().on('click', function (event) { // delete icd
            $.confirm('Frage', 'Sind Sie sicher, dass Sie die Diagnose löschen wollen?', function () {
              var n = event.target.id.replace('icdtrash', '') - 1;
              icds.splice(n, 1);
              icds.push({'icd-code-id': null, 'icd-code-number': null, text: '', digital: false});
              initIcdTable(icds);
            });
          });
          $('#diagnosen .ui-icon-search').on('click', function (event) {
            var n = event.target.id.replace('icdsrch', '');
            var opts = {icdCode: $('#icdcode' + n).val()};
            dlgIcd(icddata, function (code, text, id) {
              icds[n - 1] = icds[n - 1] || {'icd-code-id': null, 'icd-code-number': null, digital: false};
              icds[n - 1]['icd-code-id'] = id;
              icds[n - 1]['icd-code-number'] = code;
              icds[n - 1]['text'] = code === '---.-' ? $('#icdtext' + n).val() : text;
              $('#icdcode' + n).val(icds[n - 1]['icd-code-number']);
              $('#icdtext' + n).val(icds[n - 1]['text']);
              return true;
            }, opts);
          });
          for (var i = 1; i <= 5; i++) {
            $('#diagnosen #icdcode' + i).on('blur', function (event) {
              var n = event.target.id.replace('icdcode', '');
              var icdCodeNumber = $('#icdcode' + n).val().trim().toUpperCase();
              if (!icdCodeNumber)
                return;
              var icdCode = getIcdCodeFromNumber(icdCodeNumber);
              if (icdCode) {
                icds[n - 1] = icds[n - 1] || {'icd-code-id': null, 'icd-code-number': null, digital: false};
                icds[n - 1]['icd-code-id'] = icdCode.id;
                icds[n - 1]['icd-code-number'] = icdCodeNumber;
                icds[n - 1]['text'] = icdCodeNumber === '---.-' ? $('#icdtext' + n).val() : icdCode.text;
                $('#icdtext' + n).val(icds[n - 1]['text']);
              }
            });
            $('#icdtext' + i).on('change', function (event) {
              var n = parseInt(event.target.id.replace('icdtext', ''));
              icds[n - 1] = icds[n - 1] || {'icd-code-id': null, 'icd-code-number': null, digital: false};
              icds[n - 1]['text'] = $('#icdtext' + n).val();

            });
          }
        }
        // API
        return {
          initIcdTable: initIcdTable
        };
      })();

      var auquests = (function () {
        var renderers = {
          question: function question(data, row) {
            return data + ' <br>Erläuterung: ' + row[0].explanation;
          },
          answer: function answer(data, row) {
            return '<div class="answer" id="answ_au' + row[0]['au_question_id'] + '"></div>';
          },
          deleteItem: function deleteItem(data, row) {
            return "<span id='au" + row[0]['au_question_id'] + "' class='ui-icon ui-icon-trash'></span>";
          }

        };
        var opts = {
          rowsPerPage: 200,
          columns: [
            {name: "quest", invisible: true},
            {name: "questionnumber" },
            {name: "question", render: renderers.question},
            {name: "answer", render: renderers.answer},
            {name: "delete", render: renderers.deleteItem}
          ],
          flags: {filter: false, pagelenctrl: false, config: false, withsorting: false},
          sortcolname: 'questionnumber'
        };
        var grid;
        // API
        return {
          initQuestionsTable: function initQuestionsTable(data) {
            var d = data.aus.map(function (row) {
              return [row, row.qnumber, row.qtext, row.answ, ''];
            });
            grid = $('#questionsTable').ebtable(opts, d);
            $('.answer').each(function (idx, a) {
              var id = Number($(a).prop('id').replace('answ_au', '').replace('X', ''));
              var o = _.findWhere(data.aus, {'au_question_id': id});
              $(a).ebdropdown({width: '150px'}, lists.resultList()).ebbind(o, 'answer-id');
            });
            $('#questionsTable .ui-icon-trash').on('click', function () {
              var id = Number($(this).prop('id').replace('au', ''));
              data.aus = data.aus.filter(function (item) {
                return item.au_question_id !== id;
              })
              initQuestionsTable(data);
              ddQuestions = $('#questions').ebdropdown({}, lists.questionList().filter(function (q) {
                return !_.findWhere(data.aus, {au_question_id: q.v});
              }));

            });
          },
          addQuestion: function addQuestion(aaa) {
            console.log(aaa);
          }
        };
      })();

      function doSave(data) {
//        var ret = '';
//        $.ajax({
//          url: "/ISmed/ajax/workspace/au.do?action=save-au-data&ajax=1",
//          async: false,
//          data: {data: JSON.stringify(data)},
//          type: "POST",
//          success: function (result) {
//            handleAjaxResult(result, {cbErr: function () {
//                ret = 'ERROR';
//              }, errortitle: 'Fehler beim Speichern'});
//          },
//          error: function (request, status, error) {
//            console.log(request, status, error);
//            ret = 'ERROR';
//          }
//        });
//        return ret;
      }



      function initDialog(data) {
        //initAuTable(data.himis);
        auquests.initQuestionsTable(data);
        icdfct.initIcdTable(data.icds);
        var taopts4000 = {counter: {fontSize: '8px', pos: 'bottom'}, maxByte: 4000, maxNrOfVisibleRows:10};
        var taopts10000 = {counter: {fontSize: '8px', pos: 'bottom'}, maxByte: 10000, maxNrOfVisibleRows:10};
        var ddQuestions = $('#questions').ebdropdown({}, lists.questionList().filter(function (q) {
          return !_.findWhere(data, {au_question_id: q.v});
        }));
        $('#addAuQuest').on('click', function () {
          var questId = Number(ddQuestions.getSelectedValue());
          console.log(questId);
          var q = _.extend(_.findWhere(auListQuests, {au_question_id: questId}), {explanation: '', 'answer-id': null});
          data.aus.push(q);
          auquests.initQuestionsTable(data);
          ddQuestions = $('#questions').ebdropdown({}, lists.questionList().filter(function (q) {
            return !_.findWhere(data.aus, {au_question_id: q.v});
          }));
        })
        $('#au-since').datepicker(datepickerOptions).ebbind(data);
        $('#medical-base').ebtextarea(taopts4000).ebbind(data);
        $('#anamnesis').ebtextarea(taopts10000).ebbind(data);
        $('#practice').ebtextarea(taopts4000).ebbind(data);
        $('#profile').ebtextarea(taopts4000).ebbind(data);
        $('#statement').ebdropdown({}, lists.statementList()).ebbind(data);
        $('#agency-start-date').datepicker(datepickerOptions).ebbind(data);
        $('#effort').ebdropdown({}, lists.effortList()).ebbind(data);
        $('#indication').ebtextarea(taopts10000).ebbind(data);
        $('#summary').ebtextarea(taopts4000).ebbind(data);
        $('#rating').ebtextarea(taopts10000).ebbind(data);
        $('#accordance').ebtextarea(taopts4000).ebbind(data);
        $('#result').ebdropdown({}, lists.resultList()).ebbind(data);
        $('#duration').ebbind(data);
        $('#setup-time').ebbind(data);
        $('#expertise-date').datepicker(datepickerOptions).ebbind(data);
        $(".positive-integer").numeric({decimal: false, negative: false});

        if (readonly) {
          $("input").prop('disabled', true);
          $("textarea").prop('disabled', false).prop('readonly', true).on('keydown', function (evt) {
            evt.preventDefault();
          });
          //??$('option:not(:selected)').attr('disabled', true);
          $('#statementX').selectmenu().selectmenu(readonly ? 'disable' : 'enable');
          $('#effortX').selectmenu().selectmenu(readonly ? 'disable' : 'enable');
          $('#resultX').selectmenu().selectmenu(readonly ? 'disable' : 'enable');
          $('h1:contains(*)').each(function (idx, o) {
            $(o).text($(o).text().replace('(*)', '').replace('*', ''));
          });
          //$('img.ui-datepicker-trigger').hide();
        } else {
          //$('img.ui-datepicker-trigger').show();
        }
        $('img.ui-datepicker-trigger').toggle(!readonly);
      }


      $(document).ready(function () {
        top.DialogID = "au";
        $(".positive-integer").numeric({decimal: false, negative: false});
        aus = result.data.aus;
        icds = result.data.icds = result.data.icds.filter(function (o) {
          return !!o['icd-code-id'];
        });
        initDialog(result.data);
      });
    </script>

  </head>
  <body style="background:#F0F0F0">

    <div id='orderattr'>

      <div><h1>AU Fragen:                                     </h1> <span   id='questions'></span>&nbsp;<span id='addAuQuest' class='ui-icon ui-icon-circle-plus'></span></div>
      <div><h1>Vorhandene AU Fragen:                          </h1> <div   id='questionsTable'></div></div>

      <div><h1>Datum                                          </h1> <input id='au-since'></div>
      <div><h1>Medizinische Unterlagen:(*)                    </h1> <div   id='medical-base'></div></div>
      <div><h1>Anamnese:(*)                                   </h1> <div   id='anamnesis' ></div></div>
      <div><h1>Rehabilitations- und Rentenverfahren, GdB, GdS </h1> <div   id='practice'></div></div>
      <div><h1>Anforderungsprofil der Bezugstätigkeit(*)      </h1> <div   id='profile'></div></div>
      <div><h1>Nach Angaben:                                  </h1> <div   id='statement'></div></div>
      <div><h1>Bei der Arbeitsagentur in Vermittlung seit:    </h1> <input id='agency-start-date'></div>
      <div><h1>Zeitlicher Vermittlungsaufwand:                </h1> <div   id='effort'></div></div>
      <div><h1>Befund:(*)                                     </h1> <div   id='indication'></div></div>

      <div id='diagnosen'>
        <h1>Diagnosen:</h1>
        <table>
          <tbody>
            <tr><td>*</td><td><input id='icdcode1' type='text'/></td><td><input id='icdtext1' type='text'/></td><td><span id='icdsrch1' class='ui-icon ui-icon-search'></span></td><td><span id='icdtrash1' class='ui-icon ui-icon-trash'></span></td></tr>
            <tr><td> </td><td><input id='icdcode2' type='text'/></td><td><input id='icdtext2' type='text'/></td><td><span id='icdsrch2' class='ui-icon ui-icon-search'></span></td><td><span id='icdtrash2' class='ui-icon ui-icon-trash'></span></td></tr>
            <tr><td> </td><td><input id='icdcode3' type='text'/></td><td><input id='icdtext3' type='text'/></td><td><span id='icdsrch3' class='ui-icon ui-icon-search'></span></td><td><span id='icdtrash3' class='ui-icon ui-icon-trash'></span></td></tr>
            <tr><td> </td><td><input id='icdcode4' type='text'/></td><td><input id='icdtext4' type='text'/></td><td><span id='icdsrch4' class='ui-icon ui-icon-search'></span></td><td><span id='icdtrash4' class='ui-icon ui-icon-trash'></span></td></tr>
            <tr><td> </td><td><input id='icdcode5' type='text'/></td><td><input id='icdtext5' type='text'/></td><td><span id='icdsrch5' class='ui-icon ui-icon-search'></span></td><td><span id='icdtrash5' class='ui-icon ui-icon-trash'></span></td></tr>
          </tbody>
        </table>
      </div>

      <div><h1>Zusammenfassung:                                 </h1> <div   id='summary'></div></div>
      <div><h1>Sozialmedizinische Beurteilung der AU:           </h1> <div   id='rating'></div></div>
      <div><h1>Übereinstimmung von Leistungsvermögen mit Anforderungsprofil der zuletzt ausgeübten/maßgeblichen Tätigkeit'        
        </h1> <div   id='accordance'></div></div>
      <div><h1>Ergebnis                                         </h1> <div   id='result'></div></div>
      <div><h1>Erledigungszeit in Minuten                       </h1> <input id='duration' class='positive-integer' type='text'></div>
      <div><h1>Rüstzeit in Minuten                              </h1> <input id='setup-time' class='positive-integer' type='text'></div>
      <div><h1>Begutachtungsdatum                               </h1> <input id='expertise-date'></div>
      <div><h1>Gefährdung/Minderung der Erwerbsfähigkeit        </h1> <input id='au-reduction'></div>
      <div><h1>Sozialmedizinische Empfehlung                    </h1> <input id='au-suggestion'></div>


    </div>

    <div id='versandeinstellungen'>
      <h1>Versandeinstellungen:</h1>
      <table>
        <tr><td>Auftraggeber:     </td><td><div id='auftraggeber'>       </div></td>
        <tr><td>Leistungserbringer</td><td><div id='leistungserbringer'> </div></td>
        <tr><td>Sanitätshaus      </td><td><div id='sanitaetshaus'>      </div></td>
      </table>
    </div>

  </body>
</html>
