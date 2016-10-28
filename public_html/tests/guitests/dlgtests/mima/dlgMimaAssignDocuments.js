/* global _, renderer, utils, doctabs, doctypes */
var dlgMimaAssignDocuments = function (opts) {
  opts = opts || {};
  var dlgFunc = function (mimas, opts) {

    $('#dlgMimaAssignDocuments').remove();

    var mimagrid;
    var actMima = mimas[0];
    var oldMimaState = JSON.parse(JSON.stringify(mimas)); // keep State 
    
    function getOldDecicion(crypteddocid){
      var m = _.findWhere(oldMimaState, {id:actMima.id});
      var doc = _.findWhere( m.docs, {crypteddocid:crypteddocid} );
      return doc.decisionAccept;
    }

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
      var actions = {
        accept: function (evt) {
          var crypteddocid = evt.target.id;
          var doc = _.findWhere(actMima.docs, {crypteddocid: crypteddocid});
          if( getOldDecicion(crypteddocid) === null )
            doc.decisionAccept = doc.decisionAccept ? null : true;
          else
            doc.decisionAccept = true;
          
          initDoclist(actMima.docs);
          evt.stopPropagation();
        },
        reject: function (evt) {
          var crypteddocid = evt.target.id;
          var doc = _.findWhere(actMima.docs, {crypteddocid: crypteddocid});
          if( getOldDecicion(crypteddocid) === null )
            doc.decisionAccept = !doc.decisionAccept ? false : null;
          else
            doc.decisionAccept = false;
          initDoclist(actMima.docs);
          evt.stopPropagation();
        },
        docInfo: function (evt) {
          console.log('dlgDocAttrInfoEdit', evt.target.id);
          var doc = _.findWhere(actMima.docs, {crypteddocid: evt.target.id});
          var opts = {readonly: true, keywords: keywords || [], doctypes: doctypes, doctabs: doctabs};
          console.log('docInfo', doc.crypteddocid, doc.name, doc.extension, actMima.id);
          dlgDocAttrInfoEdit(doc, opts);
          evt.stopPropagation();
        },
        docShow: function (evt) {
          var doc = _.findWhere(actMima.docs, {crypteddocid: evt.target.id});
          console.log('docShow', doc.crypteddocid, doc.name, doc.extension, actMima.id);
          ebviewer.view('mima.do?action=document&crypteddocid=' + doc.crypteddocid, doc.name, doc.extension, actMima.id);
          evt.stopPropagation();
        },
        allSetDocstatus: function (stat) {
          return function () {
            console.log('set status', stat, actMima.id, actMima.docs);
            actMima.docs.forEach(function (doc) {
              doc.decisionAccept = stat;
              if( stat === null && getOldDecicion(doc.crypteddocid) !== null ){
                doc.decisionAccept = getOldDecicion(doc.crypteddocid);
              }
            });
            initDoclist(actMima.docs);
          };
        }
      };
      var docsrenderer = {
        actioncol: function (data, row) {
          var t = "\
          <div style='background-color:<%=col%>'>\n\
            <span id='<%=docid%>' style='display:inline-block;' class='ui-icon ui-icon-circle-check' title='Dokument annehmen'></span>\n\
            <span id='<%=docid%>' style='display:inline-block;' class='ui-icon ui-icon-circle-close' title='Dokument zur\u00fcckweisen'></span>\n\
            <span id='<%=docid%>' style='display:inline-block;' class='ui-icon ui-icon-info'         title='Info zum Dokument anzeigen'></span>\n\
            <span id='<%=docid%>' style='display:inline-block;' class='ui-icon ui-icon-document'     title='Dokument anzeigen'></span>\n\
          </div>";
          var doc = _.findWhere(actMima.docs, {crypteddocid: row[0]});
          var col = doc.decisionAccept===true ? '#aaddaa': (doc.decisionAccept === false ?  '#ddaaaa' : '#dfdfdf');
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
          console.log(rowData);
          ebviewer.view('mima.do?action=document&crypteddocid=' + rowData[0], rowData[1], rowData[4], actMima.id);
        }
      };
      docsgrid = $('#docsgrid').ebtable(docsopts, docsdata);
      $('#docsgrid .ctrl:first').hide()
      $('#docsgrid').css('text-align', 'left');

      $('.ui-icon-circle-check').off().on('click', actions.accept);
      $('.ui-icon-circle-close').off().on('click', actions.reject)
      $('.ui-icon-document').off().on('click', actions.docShow)
      $('.ui-icon-info').off().on('click', actions.docInfo)

      $('#docsgrid table thead th:last').append("<span id='allAccept' style='display:inline-block;' class='ui-icon ui-icon-circle-check' title='Alle Dokumente annehmen'></span>");
      $('#docsgrid table thead th:last').append("<span id='allReject' style='display:inline-block;' class='ui-icon ui-icon-circle-close' title='Alle Dokumente zur\u00fcckweisen'></span>");
      $('#docsgrid table thead th:last').append("<span id='allReset' style='display:inline-block;' class='ui-icon  ui-icon-circle-arrow-w' title='Status aller Dokumente zur\u00fccksetzen'></span>");

      $('#allAccept').off().on('click', actions.allSetDocstatus(true));
      $('#allReject').off().on('click', actions.allSetDocstatus(false));
      $('#allReset').off().on('click', actions.allSetDocstatus(null));
      $('#dlgMimaAssignDocuments').parent().find('*').css('font-size', '12px');
    }

    var saveDocStatus = function () {
      var docsdata = mimas.reduce(function (accm, mima) {
        var docstat = mima.docs.reduce(function (accd, doc) {
          accd.push({mimadocid: doc.mimadocid, crypteddocid: doc.crypteddocid, accept: doc.decisionAccept});
          return accd;
        }, []);
        accm = accm.concat(docstat);
        return accm;
      }, []);
      console.log(docsdata);
      $.ajax({
        url: 'ajax/workspace/workorder.do?action=assign-mima-docs&ajax=1',
        data:{
          workorderid: opts.workorderid,
          data:  JSON.stringify(docsdata)
        },
        method: 'POST',
        success: function (result) {
          handleAjaxResult(result, function (result) {
            console.log(result);
            $.alert('Meldung', 'Zuordnung erfolgreich gespeichert.' );
          });
        },
        error: function (a, b, c) {
          console.log('Fehler bei addDocuments', a, b, c);
        }
      });
    }

    var dlgDefOpts = {
      open: function () {
        init();
      },
      title: 'Mimas zuordnen',
      width: 1200,
      height: 620,
      closeText: 'Schlie\u00dfen',
      modal: true,
      buttons: {
        'Zuordnung sichern': function () {
          saveDocStatus();
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
      $('#dlgMimaAssignDocuments').parent().find('.ui-dialog-title').css('font-size', '16px');
    };

    var dlg = $("\
    <div id='dlgMimaAssignDocuments'>\n\
      <h1>Vorg\u00e4nge</h1>\n\
      <div id='mimagrid'></div>\n\
      <h1>Dokumente zu selektiertem Vorgang</h1>\n\
      <div id='docsgrid'></div>\n\
    </div>");
    var myopts = $.extend({}, dlgDefOpts, opts || {});
    dlg.dialog(myopts);
  };

  var ajaxopts = {
    url: "ajax/workspace/workorder.do?action=find-mima-docs&ajax=1",
    method: "POST",
    success: function (result) {
      handleAjaxResult(result, function (result) {
        dlgFunc(result.mimas, opts);
      });
    },
    error: function (a, b, c) {
        dlgFunc(mimadata.mimas, opts);      
    }
  };
  ajaxopts = opts.workorderid ? _.extend(ajaxopts, { data: {workorderid: opts.workorderid } } ) : ajaxopts;
  $.ajax(ajaxopts);
};