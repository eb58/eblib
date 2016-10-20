/* global _, moment, products, fags, resultcategorys, resultlocations, results, datepickerOptions */

var dlgMimaSFB = function (opts) {
  $('#dlgMimaSFB').remove();
  opts = opts || {};

  var dlgDefOpts = {
    open: function () {
      init();
    },
    title: 'Mima-SFB erstellen',
    width: 1060,
    height: 430,
    closeText: 'Schlie\u00dfen',
    buttons: {
      'OK': function () {
        $(this).dialog("close");
      },
      'Beenden': function () {
        $(this).dialog("close");
      }
    }
  };

  function cp2textfield(evt) {
    var s = evt.target.id;
    var id = s.substring(2).substring(0, s.length - 3);
    var val = $(evt.target).selectmenu().val();
    $('#t' + id).val(val);
    //console.log('AAA#', evt.target.id, id, val, evt);
  }
  function cp2dd(evt) {
    var id = evt.target.id.substring(1);
    var val = $(evt.target).val();
    var table = window[id + 's'];
    if (!_.findWhere(table, {number: val})) {
      $(evt.target).val('');
      $.alert('Hinweis', 'Kein erlaubter Wert: ' + val);
      return;
    }
    $('#dd' + id + 'X').val(val).selectmenu('refresh');
    //console.log('BBB', evt.target.id, id, val, table, evt);
  }
  var data = {
    begutachtungsdatum: moment().format('DD.MM.YYYY')
  };


  var init = function () {
    $(document).ready(function () {
      $(".positive-integer").numeric({decimal: false, negative: false});

      $('#ddproduct').ebdropdown({change: cp2textfield}, products).ebbind(data, 'product');

      $('#ddfag').ebdropdown({change: cp2textfield}, fags.map(o => ({v: o.number, txt: o.number + ' ' + o.text}))).ebbind(data, 'fag');
      $('#ddresultcategory').ebdropdown({change: cp2textfield}, resultcategorys.map(o => ({v: o.number, txt: o.number + ' ' + o.text}))).ebbind(data, 'resultcategory');
      $('#ddresultlocation').ebdropdown({change: cp2textfield}, resultlocations.map(o => ({v: o.number, txt: o.number + ' ' + o.text}))).ebbind(data, 'resultlocation');
      $('#ddresult').ebdropdown({change: cp2textfield}, results.map(o => ({v: o.number, txt: o.number + ' ' + o.text}))).ebbind(data, 'result');

      $('#tfag').change(cp2dd).ebbind(data, 'fag')
      $('#tresultcategory').change(cp2dd).ebbind(data, 'resultcategory')
      $('#tresultlocation').change(cp2dd).ebbind(data, 'resultlocation')
      $('#tresult').change(cp2dd).ebbind(data, 'result')

      $('#begutachtungsdatum').datepicker(datepickerOptions).ebbind(data);
      $('#gutachter').ebbind(data);
      $('#bearbeitungsdauerHours').ebbind(data);
      $('#bearbeitungsdauerMins').ebbind(data);

      $('.ui-icon-search').click(function () {
        dlgSelectExperts(function (v) {
          data.expertsid = v.userid;
          $('#gutachter').val(v.name);
          return true;
        });
      });
      $('.ui-icon-trash').click(function () {
        $('#gutachter').val(null);
      });

      // styling
      $('#dlgMimaSFB').css('background-color', '#eeeee0');
      $('#dlgMimaSFB .ui-selectmenu-button').width('800px');
      $('#dlgMimaSFB td').css('padding', '3px 5px 3px 5px');
      $('#dlgMimaSFB #layouttable1 input').css('width', '40px');
      $('#dlgMimaSFB #layouttable1,#dlgMimaSFB #layouttable2').css('padding', '10px');
      $('#dlgMimaSFB img.ui-datepicker-trigger').css('vertical-align', 'bottom');
      $("#dlgMimaSFB #bearbeitungsdauerHours,#dlgMimaSFB #bearbeitungsdauerMins").css('width', '69px');
    });

  };
  var dlgTemplate = ("\
    <div id='dlgMimaSFB'>\n\
      <table id='layouttable1'>\n\
        <tbody>\n\
          <tr><td>Produkt           </td><td>                                                                 </td><td><div id='ddproduct'></div></td></tr>\n\
          <tr><td>Frage Auftraggeber</td><td><input id='tfag' class='positive-integer' type='text'>           </td><td><div id='ddfag'></div></td></tr>\n\
          <tr><td>Erledigungsart    </td><td><input id='tresultcategory' class='positive-integer' type='text'></td><td><div id='ddresultcategory'></div></td></tr>\n\
          <tr><td>Erledigungsort    </td><td><input id='tresultlocation' class='positive-integer' type='text'></td><td><div id='ddresultlocation'></div></td></tr>\n\
          <tr><td>Ergebnis          </td><td><input id='tresult' class='positive-integer' type='text'>        </td><td><div id='ddresult'></div></td></tr>\n\
        </tbody>\n\
      </table>\n\
      <table id='layouttable2'>\n\
        <tr><td>Begutachtungsdatum</td><td><input type='text' id='begutachtungsdatum'></td></tr>\n\
        <tr>\n\
          <td>Verantwortlicher Gutachter</td>\n\
          <td><input type='text' id='gutachter' disabled>\n\
            <span id='gaSearch' style='display:inline-block;' class='ui-icon ui-icon-search' title='Gutachter anzeigen/auswählen'></span>\n\
            <span id='gaDelete' style='display:inline-block;' class='ui-icon ui-icon-trash'  title='Gutachter entfernen'></span>\n\
          </td>\n\
        </tr>\n\
        <tr>\n\
          <td>Bearbeitungsdauer(Std/Min)</td><td><input type='text' class='positive-integer' id='bearbeitungsdauerHours'> / <input type='text' class='positive-integer' id='bearbeitungsdauerMins'></td>\n\
        </tr>\n\
      </table>\n\
    </div>");
  var dlg = $(dlgTemplate);
  var myopts = $.extend({}, dlgDefOpts, opts || {});
  dlg.dialog(myopts);
};
