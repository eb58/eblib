/* global mimaData, _, moment, serviceTypes, mimagrid, keywords, dlgDocAttrEdit, sessionId, ebutils */
var mimaUtils = {
  takeInsuredpersonData: function takeInsuredpersonData(actionResults) {
    var ip = ':::::::';

    if (actionResults && _.isArray(actionResults)) {
      var attr = ['Insuredpersonid', 'Lastname', 'Firstname', 'Insuranceno', 'VB_Dateofbirth', 'Dateofbirth'];
      ip = _.values(_.pick(_.reduce(actionResults, function (acc, x) {
        acc[x.name] = x.value;
        return acc;
      }, {}), attr)).join(':');
    }

    var x = ip.split(':'); // ip ~ '1790:Aimer:Aurelia:12343434124:17.05.1969:0';
    if (x.length >= 5) {
      mimaData.insuredperson.insuredpersonid = parseInt(x[0]) || null;
      mimaData.insuredperson.firstname = x[1];
      mimaData.insuredperson.lastname = x[2];
      mimaData.insuredperson.insuranceid = x[3];
      mimaData.insuredperson.dateofbirth = x[4];
      $('#ipLastname').val(x[1]);
      $('#ipFirstname').val(x[2]);
      $('#ipNumber').val(x[3]);
      $('#ipDateOfBirth').val(x[4]);
      $('.ip').prop('disabled', mimaData.insuredperson.insuredpersonid !== 0);
    }
  },
  takeApplicantData: function takeApplicantData(actionResults) { // == '234567:AOK Bremen:Pflegekasse'
    var appl = ':::';
    if (actionResults && _.isArray(actionResults)) {
      var attr = ['Applicantid', 'Name', 'Type'];
      appl = _.values(_.pick(_.reduce(actionResults, function (acc, x) {
        acc[x.name] = x.value;
        return acc;
      }, {}), attr)).join(':');
    }
    var x = appl.split(':');// appl ~ '234567:AOK Bremen:Pflegekasse'
    if (x.length >= 3) {
      mimaData.applicant.applicantid = parseInt(x[0]) || null;
      mimaData.applicant.name = x[1];
      $('#applicant').val(x[1]);
      $('.applicant').prop('disabled', mimaData.applicant.applicantid !== 0);
    }
  },
  takeServicerendererData: function takeServicerendererData(actionResults) { // == '15:Albertsen-Neu:Albertsen:4'
    var sr = ':::';
    if (actionResults && _.isArray(actionResults)) {
      var attr = ['Servicerendererid', 'Name', 'Shortname'];
      sr = _.values(_.pick(_.reduce(actionResults, function (acc, x) {
        acc[x.name] = x.value;
        return acc;
      }, {}), attr)).join(':');
    }
    var x = sr.split(':');
    if (x.length >= 3) {
      mimaData.servicerenderer.servicerendererid = parseInt(x[0]) || null;
      mimaData.servicerenderer.name = x[2].trim();
      $('#servicerenderer').val(x[2].trim());
      $('.servicerenderer').prop('disabled', mimaData.servicerenderer.servicerendererid !== 0);
    }
  },
  takeExpertsData: function takeExpertsData(expertsid, expertListAsShortString) { // [3454], 'Fehrenbach, Mario'
    mimaData.performer = {userid: parseInt(expertsid[0])} || null;
    mimaData.performer.firstname = expertListAsShortString.split(',')[1];
    mimaData.performer.lastname = expertListAsShortString.split(',')[0];
    $('#performer').val(expertListAsShortString);
  }
};

//################################################################################################################

var utils = {
  concat: function () {
    return _.compact([].slice.call(arguments)).join(', ');
  },
  formatName: function (o) {
    return o ? utils.concat(o.lastname, o.firstname) : '';
  },
  formatIpName: function (o) {
    return o ? utils.concat(o.ipLastname, o.ipFirstname, o.ipDateofbirth) : '';
  },
  formatPerformerName: function (o) {
    return utils.concat(o.performerLastname, o.performerFirstname);
  },
  getSelectedMimas: function (grid) {
    var mimas = [];
    grid.iterateSelectedValues(function (o) {
      o[0] === 'M' && mimas.push(o[1]);
    }); // o[1] = id  ## o[0] = type --- 'M' Mima / 'W' Workorder
    return mimas;
  },
  getSelectedWorkorders: function (grid) {
    var res = [];
    grid.iterateSelectedValues(function (o) {
      o[0] === 'W' && res.push(o[1]);
    }); // o[1] = id  ## o[0] = type --- 'M' Mima / 'W' Workorder
    return res;
  },
  getServiceType: function (o) {
    return o.serviceTypeId ? _.find(serviceTypes, function (x) {
      return x.v === o.serviceTypeId;
    }).txt.substring(3) : '';
  },
  getEntryType: function (o) { // VDTA, VDIG, VMAN, ADTA, ADIG, AMAN
    // M for Mima! V for Vorgang, A for Auftrag
    // DIG = digital, DTA = dta, MAN = mannuell
    return (o.type === 'W' ? 'A' : 'V') + (o.dta ? 'dta' : (o.dig ? 'dig' : 'man'));
  },
  getTypeFromEntryType: function (et) { // VDTA, VDIG, VMAN, ADTA, ADIG, AMAN - A oder V
    if (!et)
      return null;
    var c = et[0].toUpperCase()
    return c === 'V' || c === 'A' ? c : null;
  },
  getIsDtaFromEntryType: function (o) { // VDTA, VDIG, VMAN, ADTA, ADIG, AMAN -> true/false
    return o.toLowerCase().contains('dta');
  },
  getIsDigFromEntryType: function (o) { // VDTA, VDIG, VMAN, ADTA, ADIG, AMAN -> true/false
    return o.toLowerCase().contains('dta') || o.toLowerCase().contains('dig');
  },
  getDocStatusName: function (o) {
    var statusNames = ['offen', 'best\u00e4tigt', 'vorhanden'];
    return statusNames[o.docStatus];
  },
  getDocStatusFromName: function (o) {
    var map = {'offen': 0, 'best\u00e4tigt': 1, 'vorhanden': 2};
    return map[o];
  }
};

//################################################################################################################

var upload = {
  docs: [],
  addDocuments: function addDocuments(data) {
    $.ajax({
      url: 'mima.do?action=add-documents&ajax=1',
      data: {data: JSON.stringify(data)},
      method: 'POST',
      success: function (result) {
        handleAjaxResult(result, function () {
          $.alert('Meldung', 'Anf\u00fcgen erfolgreich.');
        });
      },
      error: function (a, b, c) {
        console.log('Fehler bei addDocuments', a, b, c);
      }
    });
  },
  uploadDocuments: function uploadDocuments(tblData, tableUpdateCallback) {
    if (tblData.length === 0) {
      var mimas = utils.getSelectedMimas(mimagrid);
      var wids = utils.getSelectedWorkorders(mimagrid);
      var opts = _.extend({}, {docs: upload.docs}, mimas.length ? {mimas: mimas} : {workorderid: wids[0]});
      upload.addDocuments(opts);
      return;
    }
    var att = tblData[0][1];
    var file = tblData[0][0];
    var formData = new FormData();
    formData.append("file", file);
    formData.append("docname", att.docname);
    formData.append("docext", att.docext);
    formData.append("docdate", moment(att.docdate, 'DD.MM.YYYY').format('YYYY-MM-DD'));
    formData.append("doctypeId", att.doctypeId);
    formData.append("doctabId", att.doctabId);
    formData.append("autor", att.autor);
    formData.append("keywords", att.keywords);
    formData.append("bemerkung", att.bemerkung);
    $.ajax({
      url: 'fileUpload.do?action=ajax-upload&ajax=1',
      data: formData,
      method: 'POST',
      contentType: false,
      processData: false,
      success: function (result) {
        var opts = {
          errortitle: 'Fehler beim Upload von Dokument',
          cbOk: function () {
            upload.docs.push(result['doc-info'].crypteddocid);
            tblData.splice(0, 1);
            tableUpdateCallback();
            upload.uploadDocuments(tblData, tableUpdateCallback);
          }
        };
        handleAjaxResult(result, opts);
      },
      error: function (ev, x, y, z) {
        console.log('Fehler beim Upload von Dokument', ev, x, y, z);
      }
    });
  }
};

//################################################################################################################

var plausis = {
  checkSelectedAreMimas: function checkSelectedAreMimas(grid) {
    if (utils.getSelectedMimas(grid).length === 0) {
      $.alert('Warnung', 'Keine Vorg\u00e4nge ausgew\u00e4hlt.');
      return false;
    }
    return true;
  },
  checkSelectionForAddDocument: function checkSelectionForAddDocument(grid) {
    var mimas = utils.getSelectedMimas(grid);
    var wids = utils.getSelectedWorkorders(grid);
    var msg = '';
    msg += wids.length > 1 ? 'Bitte nur einen Auftrag selektieren' : '';
    msg += wids.length === 1 && mimas.length > 0 ? 'Bitte nur einen Auftrag oder Vorg\u00e4nge selektieren' : '';
    msg += wids.length === 0 && mimas.length === 0 ? 'Bitte einen Auftrag oder einen Vorgang selektieren' : '';
    if (msg) {
      $.alert('Warnung', msg);
      return false;
    }
    return true;
  }
};

//################################################################################################################


var externalCalledFunctions = {
  doDlgGrouping: function doDlgGrouping() {
    function callback(packagename) {
      console.log('packagename', packagename);
      $.ajax({
        async: true,
        url: 'mima.do?action=group&ajax=1',
        data: {data: JSON.stringify({"package-name": packagename, mimas: utils.getSelectedMimas(mimagrid)})},
        method: 'POST',
        success: function (result) {
          var opts = {
            errortitle: 'Fehler beim Gruppieren',
            cbOk: function () {
              $.alert('Meldung', 'Gruppierung wurde erfolgreich durchgef\u00fchrt.');
              searchMima();
            }
          };
          handleAjaxResult(result, opts);
          searchMima();
        }
      });
      return true;
    }
    plausis.checkSelectedAreMimas(mimagrid) && dlgPackageNames(callback);
  },
  doDlgUnGrouping: function doDlgUnGrouping() {
    function callback() {
      console.log('doDlgUnGrouping');
      $.ajax({
        url: 'mima.do?action=ungroup&ajax=1',
        data: {data: JSON.stringify({mimas: utils.getSelectedMimas(mimagrid)})},
        method: 'POST',
        success: function (result) {
          var opts = {
            errortitle: 'Fehler beim L\u00f6schen aus der Vorgangsgruppe',
            cbOk: function () {
              $.alert('Meldung', 'Gruppierung wurde entfernt.');
              searchMima();
            }
          };
          handleAjaxResult(result, opts);
        }
      });
    }
    plausis.checkSelectedAreMimas(mimagrid) && callback();
  },
  doDlgDispose: function doDlgDispose() {
    function callback(performerid) {
      console.log('performerid', performerid);
      $.ajax({
        async: true,
        url: 'mima.do?action=disposition&ajax=1',
        data: {data: JSON.stringify({performer: performerid, mimas: utils.getSelectedMimas(mimagrid)})},
        method: 'POST',
        success: function (result) {
          var opts = {
            errortitle: 'Fehler beim Disponieren',
            cbOk: function () {
              $.alert('Meldung', 'Erfolgreich disponiert');
              searchMima();
            }
          };
          handleAjaxResult(result, opts);
        }
      });
      return true;
    }
    plausis.checkSelectedAreMimas(mimagrid) && dlgSelectExperts(callback);
  },
  doDlgAttachDocuments: function doDlgAttachDocuments() {
    console.log('doDlgAttachDocument');
    var opts = {
      dlgDocAttrEdit: dlgDocAttrEdit,
      uploadDocuments: upload.uploadDocuments,
      keywords: keywords
    };
    plausis.checkSelectionForAddDocument(mimagrid) && dlgDocUpload(opts);
  },
  prepareCover: function prepareCover() {
    console.log('prepareCover');
    plausis.checkSelectedAreMimas(mimagrid) && window.open("printOrderCover.do?ObjectType=MiMa&workorderid=" + utils.getSelectedMimas(mimagrid), "mimaCover",
            "width=200,height=300,left=0,top=0,location=no,menubar=no,toolbar=no,dependent=yes,resizable=yes,scrollbars=yes,status=no");
    ;
  },
  confirmDocs: function confirmDocs() {
    function callback() {
      console.log('confirmDocs');
      $.ajax({
        url: 'mima.do?action=set-doc-incoming-date&ajax=1',
        data: {data: JSON.stringify({date: moment().format('DD.MM.YYYY'), mimas: utils.getSelectedMimas(mimagrid)})},
        method: 'POST',
        success: function (result) {
          var opts = {
            errortitle: 'Fehler beim Best\u00e4tigen des Unterlageneingangs',
            cbOk: function () {
              $.alert('Meldung', 'Unterlageneingang wurde best\u00e4tigt');
              searchMima();
            }
          };
          handleAjaxResult(result, opts);
        }
      });
    }
    plausis.checkSelectedAreMimas(mimagrid) && callback();
  }
};

var doDlgGrouping = externalCalledFunctions.doDlgGrouping;
var doDlgUnGrouping = externalCalledFunctions.doDlgUnGrouping;
var doDlgDispose = externalCalledFunctions.doDlgDispose;
var doDlgAttachDocument = externalCalledFunctions.doDlgAttachDocuments;
var prepareCover = externalCalledFunctions.prepareCover;
var confirmDocs = externalCalledFunctions.confirmDocs;

//################################################################################################################

var renderer = {
  auftrag: function (data, row) {
    var src = top.DialogID;
    var name = data.substring(0, 30).replace(/ /g, '\u00a0') + data.substring(30); // a0 = &nbsp; -> prevent line wrap in table cell if data.length <30
    if (row[0] === 'M') { // Vorgang  'M' -> Mima 
      var t = _.template('<a href="mima.do;jsessionid=<\%=sid%>?src=<\%=src%>&action=show&mimaid=<\%=wid%>" title="Vorgang <\%=wid%>"><\%=name%></a>');
      return t({wid: row[1], name: name, sid: sessionId, src: src  });
    } else { // Auftrag
      var t = _.template('<a href="showOrder.do;jsessionid=<\%=sid%>?src=<\%=src%>&action=show&workorderid=<\%=wid%>" title="Auftrag <\%=wid%>"><\%=name%></a>');
      return t({wid: row[1], name: name, sid: sessionId, src: src});
    }
  },
  typ: function (data, row) {
    var t = _.template('<span class="<%=cls%>"><%=typ%></span>');
    return t({cls: row[0] === 'M' ? 'mimaClass' : 'workorderClass', typ: data});
  }
};

var valuelist = ['', 'Vman', 'Vdig', 'Vdta', 'Aman', 'Adig', 'Adta'];
var valuelistDocStatus = ['', 'offen', 'best\u00e4tigt', 'vorhanden'];

var tblopts = {
  columns: [
    {name: "Type", invisible: true, technical: true},
    {name: "MimaId", invisible: true, technical: true},
    {name: "Typ", css: 'width:65px', render: renderer.typ, dbcol: 'type', valuelist: valuelist},
    {name: "Auftrag/Vorgang", mandatory: true, render: renderer.auftrag},
    {name: "Auftraggeber", dbcol: 'applicantName'},
    {name: "Aktenzeichen", dbcol: 'applicantReference'},
    {name: "Leistungserbringer", dbcol: 'servicerendererName'},
    {name: "Leistungsbereich", dbcol: 'serviceTypeId'},
    {name: "Frage des AG", dbcol: 'reasonNumber'},
    {name: "Paketname", dbcol: 'packageName'},
    {name: "Vorgangsbearbeiter"},
    {name: "Unterlagenstatus", dbcol: 'docStatus', valuelist: valuelistDocStatus}
  ],
  sortcolname: 'Auftrag/Vorgang',
  selectionCol: true,
  rowsPerPageSelectValues: [10, 15, 25, 50, 100],
  lang: 'mdk',
  jqueryuiTooltips: false,
  afterRedraw: function () {
    $('#mimagrid #data tbody .mimaClass').parent().css('background-color', '#FAB237');
    $('#mimagrid #data tbody .workorderClass').parent().css('background-color', '#3b7fc4');
  },
  addInfo: function (opts, data) {
    if (opts.hasMoreResults) {
      $('#ctrlAddInfo').show();
    } else {
      $('#ctrlAddInfo').hide();
    }
    return opts.resultCount ? 'Treffer insgesamt:' + opts.resultCount : 'Trefferliste abgeschnitten';
  }
};

function getTableDataFromResult(result) {
  return result.map(function (o) {
    return [
      o.type,
      o.id,
      utils.getEntryType(o),
      utils.formatIpName(o),
      o.applicantName,
      o.applicantReference,
      o.servicerendererName,
      utils.getServiceType(o),
      o.reasonNumber,
      o.packageName,
      utils.formatPerformerName(o),
      utils.getDocStatusName(o)
    ];
  });
}

