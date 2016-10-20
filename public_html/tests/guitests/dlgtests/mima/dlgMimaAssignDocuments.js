/* global _, renderer, utils, doctabs, doctypes */
var dlgMimaAssignDocuments = function (mimas, opts) {
  $('#dlgMimaAssignDocuments').remove();
  var DOCSTATUS = {
    ACCEPTED: 1,
    REJECTED: 2
  };
  opts = opts || {};
  var mimagrid;
  var actMima = mimas[0];
  function initMimaGrid(mimas) {
    var mimaTblData = _.map(mimas, function (o) {
      return [o.id, utils.getEntryType(o), utils.formatIpName(o), o.applicantName, o.applicantReference,
        o.servicerendererName, utils.getServiceType(o), o.packageName, utils.formatPerformerName(o)];
    });
    var mimaTblOpts = {
      columns: [
        {name: "MimaId", invisible: true, technical: true},
        {name: "Typ", css: 'width:65px'},
        {name: "Vorgang", mandatory: true},
        {name: "Auftraggeber"},
        {name: "Aktenzeichen"},
        {name: "Leistungserbringer"},
        {name: "Leistungsbereich"},
        {name: "Paketname"},
        {name: "Vorgangsbearbeiter"}
      ],
      saveState: false,
      jqueryuiTooltips: false,
      flags: {filter: false, pagelenctrl: false, config: false, withsorting: false},
      clickOnRowHandler: function (rowData, row) {
        actMima = _.findWhere(mimas, {id: rowData[0]});
        initDoclist(actMima.docs)
        mimagrid.find('td').css('background-color', '#dfdfdf');
        row.find('td').css('background-color', '#cfcfef');
      }
    };
    mimagrid = $('#mimagrid').ebtable(mimaTblOpts, mimaTblData);
    mimagrid.find('.ctrl:first').hide();
    mimagrid.find('tbody tr:first td').css('background-color', '#cfcfef');
  }

  function initDoclist(docs) {
    var docsdata = _.map(docs, function (o) {
      return [o.crypteddocid, o.name, o.tab.name, o.doctype.doctypetext, o.extension, o.docdate, ''];
    });
    var docsrenderer = {
      actioncol: function (data, row, idx) {
        var t = "\
          <div style='background-color:<%=col%>'>\n\
            <span id='<%=docid%>' style='display:inline-block;' class='ui-icon ui-icon-circle-check' title='Dokument annehmen'></span>\n\
            <span id='<%=docid%>' style='display:inline-block;' class='ui-icon ui-icon-circle-close' title='Dokument zurückweisen'></span>\n\
            <span id='<%=docid%>' style='display:inline-block;' class='ui-icon ui-icon-info'         title='Info zum Dokument anzeigen'></span>\n\
            <span id='<%=docid%>' style='display:inline-block;' class='ui-icon ui-icon-document'     title='Dokument anzeigen'></span>\n\
          </div>";
        var doc = _.findWhere(actMima.docs, {crypteddocid: row[0]});
        var col = !doc.status ? '#dfdfdf' : (doc.status === DOCSTATUS.ACCEPTED ? '#aaddaa' : '#ddaaaa');
        return _.template(t)({docid: row[0], col: col});
      }
    };
    var docsopts = {
      columns: [
        {name: "crypteddocid", invisible: true},
        {name: "Name"},
        {name: "Dokumentenart"},
        {name: "Lasche"},
        {name: "Dateierweiterung"},
        {name: "Datum", sortformat: 'date-de'},
        {name: "", render: docsrenderer.actioncol, css: 'width: 80px'}
      ],
      bodyHeight: 300,
      rowsPerPage: 10,
      flags: {filter: false, pagelenctrl: false, config: false, withsorting: false},
      saveState: false,
      jqueryuiTooltips: false,
      clickOnRowHandler: function (rowData) {
        //actions.docShow(rowData[0], rowData[2], rowData[5], mimaData.mimaId);
        console.log(rowData);
      }
    };
    docsgrid = $('#docsgrid').ebtable(docsopts, docsdata);
    $('#docsgrid .ctrl:first').hide()
    $('#docsgrid').css('text-align', 'left');
    // actions
    var actions = {
      accept: function (evt) {
        var doc = _.findWhere(actMima.docs, {crypteddocid: evt.target.id});
        doc.status = (doc.status === DOCSTATUS.ACCEPTED) ? null : DOCSTATUS.ACCEPTED;
        initDoclist(actMima.docs);
        evt.stopPropagation();
      },
      reject: function (evt) {
        var doc = _.findWhere(actMima.docs, {crypteddocid: evt.target.id});
        doc.status = (doc.status === DOCSTATUS.REJECTED) ? null : DOCSTATUS.REJECTED;
        initDoclist(actMima.docs);
        evt.stopPropagation();
      },
      docInfo: function (evt) {
        console.log('dlgDocAttrInfoEdit', evt.target.id);
        var opts = {readonly: true, keywords: keywords || [], doctypes: doctypes, doctabs: doctabs};
        dlgDocAttrInfoEdit(evt.target.id, opts);
      },
      docShow: function (evt) {
        var doc = _.findWhere(actMima.docs, {crypteddocid: evt.target.id});
        console.log('ebviewer', doc.crypteddocid, doc.name, doc.extension, actMima.id);
        //ebviewer.view('mima.do?action=document&crypteddocid=' + evt.target.id, name, ext, actMima.id);
      },
      allSetDocstatus: function (stat) {
        return function () {
          console.log('set status', stat, actMima.id, actMima.docs);
          actMima.docs.forEach(function (doc) {
            doc.status = stat;
          });
          initDoclist(actMima.docs);
        };
      }
    }
    $('.ui-icon-circle-check').off().on('click', actions.accept);
    $('.ui-icon-circle-close').off().on('click', actions.reject)
    $('.ui-icon-document').off().on('click', actions.docShow)
    $('.ui-icon-info').off().on('click', actions.docInfo)

    $('#docsgrid table thead th:last').append("<span id='allAccept' style='display:inline-block;' class='ui-icon ui-icon-circle-check' title='Alle Dokumente annehmen'></span>");
    $('#docsgrid table thead th:last').append("<span id='allReject' style='display:inline-block;' class='ui-icon ui-icon-circle-close' title='Alle Dokumente zurückweisen'></span>");
    $('#docsgrid table thead th:last').append("<span id='allReset' style='display:inline-block;' class='ui-icon  ui-icon-circle-arrow-w' title='Status aller Dokumente zurücksetzen'></span>");

    $('#allReject').off().on('click', actions.allSetDocstatus(DOCSTATUS.REJECTED));
    $('#allAccept').off().on('click', actions.allSetDocstatus(DOCSTATUS.ACCEPTED));
    $('#allReset').off().on('click', actions.allSetDocstatus(null));
  }

  var dlgDefOpts = {
    open: function () {
      init();
    },
    title: 'Mimas zuordnen',
    width: 1200,
    height: 600,
    closeText: 'Schlie\u00dfen',
    buttons: {
      'Zuordnung sichern': function () {
        var x = mimas.reduce(function (accm, mima) {
          var docstat = mima.docs.reduce(function (accd, doc) {
            accd.push({crypteddocid: doc.crypteddocid, 'status': doc.status});
            return accd;
          }, [])
          accm = accm.concat(docstat);
          return accm;
        }, [])
        console.log(x);
        // ajax-call 
        $(this).dialog("close");
      },
      'Beenden': function () {
        $(this).dialog("close");
      }
    }
  };
  var init = function () {
    initMimaGrid(mimas);
    initDoclist(mimas[0].docs);
    // styling
    $('#dlgMimaAssignDocuments').css('background-color', '#eeeee0');
  };
  var dlg = $("\
    <div id='dlgMimaAssignDocuments'>\n\
      <h1>Vorgänge</h1>\n\
      <div id='mimagrid'></div>\n\
      <h1>Dokumente zu selektiertem Vorgang</h1>\n\
      <div id='docsgrid'></div>\n\
    </div>");
  var myopts = $.extend({}, dlgDefOpts, opts || {});
  dlg.dialog(myopts);
};
