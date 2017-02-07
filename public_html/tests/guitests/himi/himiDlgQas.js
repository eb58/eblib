/* global himiutils, answs, _ */

var himiDlgQas = function (actqas, opts, okCallback, closeCallback) {
  $('#dlgQas').remove();
  var dlg = $("\
    <div id='dlgQas'>\n\
      <table style='width:95%'>\n\
        <tr><td>Frage:      </td><td><div id='quests'></div></td></tr>\n\
        <tr><td>Erl\u00e4uterung:</td><td><div id='motivation-question' ></div></td></tr>\n\
        <tr><td>Antwort:    </td><td><div id='answs'></div></td></tr>\n\
        <tr><td>Begr\u00fcndung: </td><td><div id='motivation-answer'></div></td></tr>\n\
      </table>\n\
    </div>");
  var openfct = function openfct() {
    $('#dlgQas #quests').html(himiutils.selectBox('quests', opts.quests));
    $('#dlgQas #answs').html(himiutils.selectBox('answs', opts.answs));
    $('#dlgQas #quests option[value=' + actqas['question-id'] + ']').attr('selected', true);
    $('#dlgQas #answs  option[value=' + actqas['answer-id'] + ']').attr('selected', true);
    $('#dlgQas #motivation-question').val(actqas['motivation-question']);
    $('#dlgQas #motivation-answer').val(actqas['motivation-answer']);
    $('#dlgQas #motivation-question').val(actqas['motivation-question']);
    $('#dlgQas #motivation-answer').val(actqas['motivation-answer']);

    $('#dlgQas .selectmenu').selectmenu();
    $('#dlgQas select#quests').selectmenu().selectmenu(opts.readonly || actqas.digital ? 'disable' : 'enable');
    $('#dlgQas select#answs')
      .selectmenu({
        change: function (evt, ui) {
          var answerId = parseInt(ui.item.value);
          var answ = _.findWhere(answs, {"answer-id": answerId});
          var answerNumber = answ ? answ["answer-number"] : 0;
          var isAndereAntwort = answerNumber === '3';  // '3' === 'Andere Antwort' in answs
          if (opts.isSFB && isAndereAntwort && $('#dlgQas #motivation-answer').val().trim() === '') {
            $('#dlgQas #motivation-answer').val('Siehe Beurteilung');
          }
        }
      })
      .selectmenu(opts.readonly ? 'disable' : 'enable');

    $('#dlgQas .ui-selectmenu-button').width('100%');
    if (opts.readonly) {
      $('.selectmenu').selectmenu().selectmenu('disable');
      $('#dlgQas #motivation-answer').prop('readonly', true).on('keydown', function (evt) {
        evt.preventDefault();
      });
      $('#dlgQas #motivation-question').prop('readonly', true).on('keydown', function (evt) {
        evt.preventDefault();
      });
    }
    if (actqas.digital) {
      $('#dlgQas #motivation-question').prop('readonly', true).on('keydown', function (evt) {
        evt.preventDefault();
      });
    }
    opts1 = {title: {text: 'Text1', fontSize: '12px', pos: 'top'}, counter: {fontSize: '12px', pos: 'top'}, maxByte: 550};
    opts2 = {title: {text: 'Text2', fontSize: '12px', pos: 'top'}, maxByte: 30};
    taopts = {title: {text: '', fontSize: '8px', pos: 'bottom'}, maxByte: 1000};
    $('#dlgQas #motivation-question').ebtextarea(taopts);
    $('#dlgQas #motivation-answer').ebtextarea(taopts);
  };

  var defopts = {
    open: openfct,
    close: function () {
      closeCallback && closeCallback();
    },
    title: 'Frage',
    height: 400, width: 900,
    closeText: 'Schlie\u00dfen',
    modal: true,
    buttons: {
      'Ok': function () {
        okCallback && okCallback();
        $(this).dialog("destroy");
      },
      'Abbrechen': function () {
        $(this).dialog("destroy");
      }
    }
  };

  var myopts = $.extend({}, defopts, opts);
  dlg.dialog(myopts);
  {  //  Styling
    $('#dlgQas').css('background-color', '#eeeee0');
    $('#dlgQas textarea').css('width', '100%');
    $('#dlgQas table, #dlgQas td').css('border-style', 'none');
    $('#dlgQas td').css('padding', '3px');
  }
};