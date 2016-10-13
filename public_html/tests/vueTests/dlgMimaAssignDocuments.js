/* global _, renderer */
var dlgMimaAssignDocuments = function (mimas, opts) {
  $('#dlgMimaAssignDocuments').remove();
  opts = opts || {};
  var vue;
  var t = "\
    <div id='dlgMimaAssignDocuments'>\n\
      <h1>Vorgänge</h1>\n\
      <div id='mimalist'></div>\n\
      <h1>Dokumente zu selektiertem Vorgang</h1>\n\
      <div id='docsgrid'></div>\n\
    </div>";
  var dlg = $(t);

  function initMimaList(mimas) {
    var mimaTblData = getTableDataFromResult(mimas);
    var mimaTblOpts = {
      columns: [
        {name: "Type", invisible: true, technical: true},
        {name: "MimaId", invisible: true, technical: true},
        {name: "Typ", css: 'width:65px', render: renderer.typ, dbcol: 'type'},
        {name: "Vorgang", mandatory: true},
        {name: "Auftraggeber", dbcol: 'applicantName'},
        {name: "Aktenzeichen", dbcol: 'applicantReference'},
        {name: "Leistungserbringer", dbcol: 'servicerendererName'},
        {name: "Leistungsbereich", dbcol: 'serviceTypeId'},
        {name: "Frage des AG", dbcol: 'reasonNumber'},
        {name: "Paketname", dbcol: 'packageName'},
        {name: "Vorgangsbearbeiter"},
        {name: "Unterlagenstatus", dbcol: 'docStatus'}
      ],
      saveState: function () {},
      loadState: function () {},
      jqueryuiTooltips: false,
      flags: {filter: false, pagelenctrl: false, config: false, withsorting: false}
    };
    $('#mimalist').ebtable(mimaTblOpts, mimaTblData);
    $('#mimalist .ctrl:first').hide()
  }

  function initDoclist(docs) {
    var docsopts = {
      columns: [
        {name: "crypteddocid", invisible: true},
        {name: "Name"},
        {name: "Dokumentenart"},
        {name: "Lasche"},
        {name: "Dateierweiterung"},
        {name: "Datum", sortformat: 'date-de'},
        {name: "Gr\u00f6\u00dfe"}, // = Größe
        {name: "", render: renderer.actions, css: 'width: 50px'}
      ],
      bodyHeight: 300,
      rowsPerPage: 10,
      flags: {filter: false, pagelenctrl: false, config: false, withsorting: false},
      saveState: function () {},
      loadState: function () {}
    };
    var docsdata = _.map(docs, function (o) {
      return [o.crypteddocid, o.name, o.tab.name, o.doctype.doctypetext, o.extension, o.docdate, ebutils.formatBytes(o.docsize), ''];
    });
    $('#docsgrid').ebtable(docsopts, docsdata);
    $('#docsgrid tbody tr').off().click(function () { // Auch Klick auf Zeile öffnet Viewer
      var row = docsdata[$(this).index()];
      actions.docShow(row[0], row[2], row[5], mimaData.mimaId);
    });
    $('#docsgrid .ctrl:first').hide()
    $('#docsgrid').css('text-align', 'left');
  }

  var init = function () {
    vue = new Vue({
      el: '#dlgMimaAssignDocuments',
      data: {
        mimas: mimas,
        docs: mimas.length > 0 ? mimas[0].docs : []
      }
    });
    initMimaList(mimas);
    initDoclist(mimas[0].docs);
    style();
  };

  var defopts = {
    open: function () {
      init();
    },
    title: 'Mimas zuordnen',
    width: 1200,
    height: 900,
    closeText: 'Schlie\u00dfen',
    buttons: {
      'Sichern': function () {
        $(this).dialog("close");
      },
      'Beenden': function () {
        $(this).dialog("close");
      }
    }
  };
  var myopts = $.extend({}, defopts, opts || {});
  dlg.dialog(myopts);

  function style() {
    $('#dlgMimaAssignDocuments').css('background-color', '#eeeee0');
  }
  
};
