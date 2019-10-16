/* ui-dialog: global _, modus */
var dlgApplicant = function (opts, callback) {
  $('#dlgApplicant').remove();
  
  var changedData = false;
  var valueListsWindow = (top.window == window) ? opener.top : top;
  var applicantTypes = valueListsWindow.valueLists.applicantTypes;
  var applicantSorts = valueListsWindow.valueLists.applicantSorts;
  var mdkRegionaltypes = valueListsWindow.valueLists.mdkRegionaltypes;  
  var countries = valueListsWindow.valueLists.countries;
  var janein = valueListsWindow.valueLists.janein;

  var shipments = [
    {v: 'Alles', txt: 'Alles'},
    {v: 'nichts', txt: 'nichts'}
  ];
  var jn01 = [
    {v: 1, txt: 'ja'},
    {v: 0, txt: 'nein'}
  ];

  var appData;
  var orgData;

  function loadData() {
    $.ajax({
      url: "basicdata.do?action=load-applicant&ajax=1",
      data: {id: opts.id},
      method: "POST",
      success: function (result) {
        handleAjaxResult( result, function(data){
          appData = data.result;
          orgData = _.extend({}, appData);
          initDlg();
        });
      },
      error: function (request, status, error){ console.log(request, status, error); }
    });
  }

  function saveData() {
    if (!validate('dlgApplicant', appData))
      return;
    var create = appData.id == null;
    var oldId = appData.id;
    $.ajax({
      url: "basicdata.do?action=save-applicant&ajax=1",
      method: 'POST',
      data: {applicant: JSON.stringify(appData),mode: myOpts.modus},
      success: function (result) {
        handleAjaxResult(result, function(data){
          appData = data.applicant;
          switch (data.saveResult) {
            case 'error': 
              $.alert('Fehler', 'Die Daten wurden nicht gespeichert, bitte melden Sie diesen Fehlerfall an die ISmed3-Administration.');
              break;
            case 'valid': 
              $.alert('Hinweis', 'Auftraggeber ' + appData.id + ' erfolgreich ' + (create ? 'angelegt' : 'gespeichert'));
              if ((myOpts.modus.indexOf('order') == 0 || myOpts.modus == 'new') && callback) {
                callback(appData);
                if (typeof(modus) !== 'undefined' && modus === 'order-search')
                  window.close();
              }
              changedData = true;
              initDlg();
              break;
            case 'newAlreadyKnown':
              var msg = 'Die Daten des neuen Auftraggebers identifizieren einen anderen aktiven Auftraggeber.' + 
                '\n\nDieser Auftraggeber (' + appData.id + ') wird jetzt angezeigt. Die neuen Daten wurden nicht gespeichert.';
              $.alert('Ablehnung', msg);
              initDlg();
              break;
            case 'changeAlreadyKnown':
              var msg = 'Die ge\u00e4nderten Daten des Auftraggebers (' + oldId + ') identifizieren einen anderen aktiven Auftraggeber.\n\n'; 
              if (myOpts.modus != "validate")
                msg += 'Dieser Auftraggeber (' + appData.id + ') wird jetzt angezeigt.\n';
              msg += 'Die neuen Daten wurden nicht gespeichert.';
              $.alert('Ablehnung', msg);
              initDlg();
              break;
          }
          closeHistory();
        });
      },
      error: function (request, status, error) {console.log('saveData', error);}
    });
  }

  function initDlg() {
    $('#dlgApplicant #name').ebbind(appData, 'name');
    $('#dlgApplicant #ikNumber').ebbind(appData, 'ikNumber')
          .on('blur', applicantUtils.checkFormat4Number('dlgApplicant','ikNumber', appData));
    $('#dlgApplicant #branchNumber').ebbind(appData, 'branchNumber');
    $('#dlgApplicant #branchName').ebbind(appData, 'branchName');
    $('#dlgApplicant #applicantType')
          .ebdropdown({disabled:myOpts.readOnly}, applicantTypes, appData.applicanttypeid)
          .ebbind(appData, 'applicanttypeid');
    $('#dlgApplicant #applicantSort')
          .ebdropdown({disabled:myOpts.readOnly}, applicantSorts, appData.applicantsortid)
          .ebbind(appData, 'applicantsortid');
    $('#dlgApplicant #organisationunit').ebbind(appData, 'organisationunit');
    $('#dlgApplicant #hint').ebbind(appData, 'hint');
    $('#dlgApplicant #newname').ebbind(appData, 'newname');
    $('#dlgApplicant #nameValidFrom')
          .prop( 'disabled', myOpts.readOnly)
          .val(appData.nameValidFrom)
          .datepicker(datepickerOptions)
          .change(function(){ appData.nameValidFrom=$('#nameValidFrom').val().trim() == '' ? null : $('#nameValidFrom').val().trim();});
    $('#dlgApplicant #responsibleMdk').ebbind(appData, 'responsibleMdk')
          .on('blur', applicantUtils.checkFormat4Number('dlgApplicant','responsibleMdk', appData));
    $('#dlgApplicant #mdkRegionaltype')
          .ebdropdown({width: '150px',disabled:myOpts.readOnly}, mdkRegionaltypes, appData.mdkRegionaltype)
          .ebbind(appData, 'mdkRegionaltype');
    $('#dlgApplicant #street').ebbind(appData, 'street');
    $('#dlgApplicant #additional1').ebbind(appData, 'additional1');
    $('#dlgApplicant #additional2').ebbind(appData, 'additional2');
    $('#dlgApplicant #additional3').ebbind(appData, 'additional3');
    appData.countryid = appData.countryid == '' && myOpts.modus == 'new' ? 'DE' : appData.countryid;
    $('#dlgApplicant #country')
          .ebdropdown({disabled:myOpts.readOnly}, countries, appData.countryid)
          .ebbind(appData, 'countryid');
    $('#dlgApplicant #zipcode').css('width','60px').ebbind(appData, 'zipcode');
    $('#dlgApplicant #city').css('width','50%').ebbind(appData, 'city');
    $('#dlgApplicant #district').ebbind(appData, 'district');
    $('#dlgApplicant #pozipcode').css('width','60px').ebbind(appData, 'pozipcode');
    $('#dlgApplicant #poboxno').css('width','50%').ebbind(appData, 'poboxno')
          .on('blur', applicantUtils.checkFormat4Number('dlgApplicant','poboxno', appData));
    $('#dlgApplicant #email').ebbind(appData, 'email');
    $('#dlgApplicant #phoneno1').ebbind(appData, 'phoneno1');
    $('#dlgApplicant #faxno').ebbind(appData, 'faxno');
    $('#dlgApplicant #phoneno2').ebbind(appData, 'phoneno2');
    $('#dlgApplicant #active')
          .ebdropdown({height:'60px',disabled:myOpts.readOnly}, janein, appData.active)
          .ebbind(appData, 'active');
    $('#dlgApplicant #valid')
          .ebdropdown({height:'60px',disabled:true}, janein, appData.valid)
          .ebbind(appData, 'valid');
    $('#dlgApplicant #productChangeAllowed')
          .ebdropdown({height:'60px',disabled:myOpts.readOnly}, janein, appData.productChangeAllowed)
          .ebbind(appData, 'productChangeAllowed');
    $('#dlgApplicant #generateCheckadvice')
          .ebdropdown({height:'60px',disabled:myOpts.readOnly}, janein, appData.generateCheckadvice)
          .ebbind(appData, 'generateCheckadvice');
    $('#dlgApplicant #hospitalizationInCheckadvice')
          .ebdropdown({height:'60px',disabled:myOpts.readOnly}, janein, appData.hospitalizationInCheckadvice)
          .ebbind(appData, 'hospitalizationInCheckadvice');
    $('#dlgApplicant #addDtaQuestion')
          .ebdropdown({height:'60px',disabled:myOpts.readOnly}, janein, appData.addDtaQuestion)
          .ebbind(appData, 'addDtaQuestion');
    $('#dlgApplicant #scopeOfShipment')
          .ebdropdown({height:'60px',disabled:myOpts.readOnly}, shipments, appData.scopeOfShipment)
          .ebbind(appData, 'scopeOfShipment');
    $('#dlgApplicant #statusmsg')
          .ebdropdown({height:'60px',disabled:myOpts.readOnly}, jn01, appData.statusmsg)
          .ebbind(appData, 'statusmsg');
    $('#dlgApplicant #docentryinfo')
          .ebdropdown({height:'60px',disabled:myOpts.readOnly}, janein, appData.docentryinfo)
          .ebbind(appData, 'docentryinfo');
    $('#dlgApplicant #modificationdate').text(appData.modificationdate);
    $('#dlgApplicant #applicantid').text(appData.id != null ? '(' + appData.id + ')' : '');
    $('#dlgApplicant :input').prop('disabled',myOpts.readOnly);
    $('#dlgApplicant .ui-datepicker-trigger').prop('disabled',myOpts.readOnly);
    styling();
    $('#dlgApplicant .layouttable').css('visibility', 'visible');
    top.objectIsChanged = false;
    
    if (myOpts.modus === 'validate' && callback) {
      var simFilter = {
        id : appData.id,
        name : appData.name,
        city : appData.city,
        street : appData.street,
        zipcode : appData.zipcode,
        ikNumber : appData.ikNumber
      }
      callback(simFilter);
    }
  }
  
  var dlgDefOpts = {
    open: function () {
      $('.ui-dialog-buttonpane button:contains("Akzeptieren")').button().hide();
      $('.ui-dialog-buttonpane button:contains("Bearbeiten")').button().hide();
      $('.ui-dialog-buttonpane button:contains("Attributhistorie")').button().hide();
      $('.ui-dialog-buttonpane button:contains("Speichern")').button().hide();
      $('.ui-dialog-buttonpane button:contains("\u00dcbernehmen")').button().hide();
      $('.ui-dialog-buttonpane button:contains("Zur\u00fccksetzen")').button().hide();

      switch (myOpts.modus) {
        case 'show-only':
                      myOpts.readOnly = true;
                      break;
        case 'read-only':
                      myOpts.readOnly = true;
                      $('.ui-dialog-buttonpane button:contains("\u00dcbernehmen")').button().show();
                      break;
        case 'order-search':
                      myOpts.readOnly = false;
                      $('.ui-dialog-buttonpane button:contains("Zur\u00fccksetzen")').button().show();
                      $('.ui-dialog-buttonpane button:contains("\u00dcbernehmen")').button().show();
                      $('.ui-dialog-buttonpane button:contains("Speichern")').button().show();
                      break;
        case 'order': myOpts.readOnly = true;
                      $('.ui-dialog-buttonpane button:contains("Bearbeiten")').button().show();
                      break;
        case 'admin': myOpts.readOnly = true; 
                      $('.ui-dialog-buttonpane button:contains("Attributhistorie")').button().show();
                      $('.ui-dialog-buttonpane button:contains("Bearbeiten")').button().show();
                      break;
        case 'new':   myOpts.readOnly = false;
                      $('.ui-dialog-buttonpane button:contains("Zur\u00fccksetzen")').button().show();
                      $('.ui-dialog-buttonpane button:contains("Speichern")').button().show();
                      break;
        case 'validate': myOpts.readOnly = true;
                      $('.ui-dialog-buttonpane button:contains("Akzeptieren")').button().show();
                      break;
        default:      $.alert('Fehler', 'Unerwarteter Dialogmodus: ' + modus);
                      return;
      }
      loadData();
    },
    title: 'Stammdatensatz',
    width: 750,
    height: 'auto',
    position: {my: "left top", at: "left top", of: window},
    closeText: 'Schlie\u00dfen',
    modal: true,
    readOnly: true,
    buttons: {
      'Attributhistorie': function() {showHistory(myOpts.id)},
      'Bearbeiten': function() {editObject();},
      'Zur\u00fccksetzen': function() {resetDlg();},
      'Akzeptieren': function () {
        appData.valid = true;
        saveData();
      },
      '\u00dcbernehmen': function () {
        if ((myOpts.modus === 'order-search' || myOpts.modus === 'read-only') && callback) {
          callback(orgData);
          window.close();
        }
      },
      'Speichern': function () {
        saveData();
      },
      'Beenden': function() {
        closeHistory();
        if (changedData) {
          switch (myOpts.modus) {
            case 'validate':  restartDlg();
                              break;
            case 'admin':     searchApplicant();
                              break;
            default:          // do nothing
          }
        }
        $(this).dialog("destroy");
      }
    }
  };

  function editObject() {
    myOpts.readOnly = false;
    $('.ui-dialog-buttonpane button:contains("Zur\u00fccksetzen")').button().show();
    $('.ui-dialog-buttonpane button:contains("Speichern")').button().show();
    $('.ui-dialog-buttonpane button:contains("Bearbeiten")').button().hide();
    $('#dlgApplicant .fa-calendar').css('visibility', 'visible');
    initDlg();
  };

  function resetDlg() {
    $('#dlgApplicant .layouttable').css('visibility', 'hidden');
    loadData();
  }

  var dlg = $("\
    <div id='dlgApplicant'>\n\
      <span style='float:right'><a href=javascript:call_help('editApplicant');><i class='fa fa-question-circle-o fa-lg'></i> Hilfe</a></span>\n\
      <br>\n\
      <table class='layouttable' style='width:100%;visibility:hidden'>\n\
        <tbody>\n\
          <tr>\n\
            <td>Name *</td>\n\
            <td><input type='text' id='name' maxlength='128'/></td>\n\
            <td>IK-Nummer *</td>\n\
            <td><input type='text' id='ikNumber' maxlength='9'/></td>\n\
          </tr>\n\
          <tr>\n\
            <td>Nr. d. Nebenstelle</td>\n\
            <td><input type='text' id='branchNumber' maxlength='5'/></td>\n\
            <td>Name d. Nebenstelle</td>\n\
            <td><input type='text' id='branchName' maxlength='30'/></td>\n\
          </tr>\n\
          <tr>\n\
            <td>Typ</td>\n\
            <td><div id='applicantType'></div></td>\n\
            <td>Art</td>\n\
            <td><div id='applicantSort'></div></td>\n\
          </tr>\n\
          <tr>\n\
            <td>Organisation</td>\n\
            <td><input type='text' id='organisationunit' maxlength='128'/></td>\n\
            <td>Hinweis</td>\n\
            <td><input type='text' id='hint' maxlength='128'/></td>\n\
          </tr>\n\
          <tr>\n\
            <td>Neuer Name</td>\n\
            <td><input type='text' id='newname' maxlength='128'/></td>\n\
            <td>G&uuml;ltig ab</td>\n\
            <td><input type='text' id='nameValidFrom'/></td>\n\
          </tr>\n\
          <tr>\n\
            <td>Zust&auml;nd. MDK</td>\n\
            <td><input type='text' id='responsibleMdk'/></td>\n\
            <td>Bundestyp</td>\n\
            <td><div id='mdkRegionaltype'></div></td>\n\
          </tr>\n\
          <tr>\n\
            <td>Stra&szlig;e Hausnr.</td>\n\
            <td><input type='text' id='street' maxlength='128'/></td>\n\
            <td>Anschrift 1</td>\n\
            <td><input type='text' id='additional1' maxlength='128'/></td>\n\
          </tr>\n\
          <tr>\n\
            <td>Anschrift 2</td>\n\
            <td><input type='text' id='additional2' maxlength='128'/></td>\n\
            <td>Anschrift 3</td>\n\
            <td><input type='text' id='additional3' maxlength='128'/></td>\n\
          </tr>\n\
          <tr>\n\
            <td>L&auml;ndercode *</td>\n\
            <td><div id='country'></div></td>\n\
            <td>PLZ Ort *</td>\n\
            <td>\n\
              <input type='text' id='zipcode' maxlength='10'/>\n\
              <input type='text' id='city' maxlength='128'/>\n\
            </td>\n\
          </tr>\n\
          <tr>\n\
            <td>Ortsteil</td>\n\
            <td><input type='text' id='district' maxlength='256'/></td>\n\
            <td>PLZ Postfach</td>\n\
            <td>\n\
              <input type='text' id='pozipcode' maxlength='10'/>\n\
              <input type='text' id='poboxno'/>\n\
            </td>\n\
          </tr>\n\
          <tr>\n\
            <td>E-Mail</td>\n\
            <td><input type='text' id='email' maxlength='128'/></td>\n\
            <td>Telefon</td>\n\
            <td><input type='text' id='phoneno1' maxlength='50'/></td>\n\
          </tr>\n\
          <tr>\n\
            <td>Telefax</td>\n\
            <td><input type='text' id='faxno' maxlength='50'/></td>\n\
            <td>Mobil</td>\n\
            <td><input type='text' id='phoneno2' maxlength='50'/></td>\n\
          </tr>\n\
          <tr>\n\
            <td>Aktiv *</td>\n\
            <td><div id='active'></div></td>\n\
            <td id='validLabel'>Valide</td>\n\
            <td><div id='valid'></div></td>\n\
          </tr>\n\
          <tr>\n\
            <td>Produktwechsel bei KH-Auftr&auml;gen</td>\n\
            <td><div id='productChangeAllowed'></div></td>\n\
            <td>Pr&uuml;fanzeige erstellen</td>\n\
            <td><div id='generateCheckadvice'></div></td>\n\
          </tr>\n\
          <tr>\n\
            <td>Aufnahme-/ Entlassungsdatum auf Pr&uuml;fanzeige</td>\n\
            <td><div id='hospitalizationInCheckadvice'></div></td>\n\
            <td>DTA-Fragen bei digitalen Auftr&auml;gen &auml;nderbar</td>\n\
            <td><div id='addDtaQuestion'></div></td>\n\
          </tr>\n\
          <tr>\n\
            <td>Versandart</td>\n\
            <td><div id='scopeOfShipment'></div></td>\n\
            <td>Papierzwischennachricht *</td>\n\
            <td><div id='statusmsg'></div></td>\n\
          </tr>\n\
          <tr>\n\
            <td>Vorgangs-Info Unterlage *</td>\n\
            <td><div id='docentryinfo'></div></td>\n\
            <td></td>\n\
            <td></td>\n\
          </tr>\n\
          <tr>\n\
            <td>Zuletzt ge&auml;ndert am</td>\n\
            <td><span id='modificationdate'/></td>\n\
            <td></td>\n\
            <td align='right'><span id='applicantid'/></td>\n\
          </tr>\n\
        </tbody>\n\
      </table>\n\
    </div>");

  var myOpts = $.extend({}, dlgDefOpts, opts || {});
  dlg.dialog(myOpts);

  function styling() {
    $('#dlgApplicant').css('background-color', '#eeeee0');
    $('#dlgApplicant td:nth-child(odd)').css('width', '15%');
    $('#dlgApplicant td:nth-child(even)').css('width', '35%');
    $('#dlgApplicant td input').css('width', '80%');
    $('.ui-selectmenu-button').css('width', '80%');
  }
};