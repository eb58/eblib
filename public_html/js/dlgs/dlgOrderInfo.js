/* global _ */
var dlgOrderInfo = function (opts, data) {
  $('#dlgAuftragsInfo').remove();
  var dlg = $("\
    <div id='dlgAuftragsInfo'>\n\
        <h1>Kommentar</h1>\n\
        <div id='addComment' style='width:100%; height:75px; overflow-y:auto; border:1px solid #aaa; padding:3px;'></div>\n\
        <h1>Hinweise zum Auftrag</h1>\n\
        <div id='workorderComments'></div>\n\
        <h1>Ergebnis</h1>\n\
        <div id='resulttext' style='width:100%; height:75px; overflow-y:auto; border:1px solid #aaa; padding:3px;'></div>\n\
    </div>");
  var defopts = {
    open: function ( ) {
      var renderLine = function (txt) {
        return txt.replace(/ /g, '\u00a0');
      };
      var infoopts = {
        flags: {
          filter: false,
          config: false
        },
        columns: [
          {name: "Verfasser", render: renderLine},
          {name: "Hinweis"},
          {name: "Datum", render: renderLine}
        ],
        bodyHeight: 250,
        rowsPerPage: 1000, // all?
        saveState: false
      };
      var tblData = mx(_.map(data.workorderComments, function (o) {
        return _.values(o);
      })).cols([1, 2, 3]);

      $('#workorderComments').ebtable(infoopts, tblData);
      $('#workorderComments .ctrl').hide();
      $('#addComment').text(data.addComment ? data.addComment : '');
      $('#resulttext').text(data.resulttext ? data.resulttext : '');
    },
    title: 'Info Auftrag - ' + opts.name + ' (' + opts.wid + ')',
    height: 600, width: 600,
    closeText: 'Schlie\u00dfen',
    modal: true,
    buttons: {
      'Abbrechen': function () {
        $(this).dialog("destroy");
      }
    }
  };
  var myDlgOpts = $.extend({}, defopts, opts);
  dlg.dialog(myDlgOpts);
  // styling
  $('#dlgAuftragsInfo').css('background-color', '#eeeee0');
  $('#dlgAuftragsInfo').parent().find('*').css('font-size', '12px');
  $('#workorderComments .ebtable #data th div.sort_wrapper span').css('position', 'absolute');
  $('#workorderComments .ebtable #data th div.sort_wrapper span').css('margin-top', '1px');
  $('#workorderComments .ebtable #data th div.sort_wrapper span').css('right', '1px');
};