/* global _ */

var dlgBearbeitungsZeiten = function (opts) {
  var MAX_TIME = 59999;   /* 999:59 */
  var checkTimes = null;

  var utils = {
    checkEntries: function () {
      var ok = true;
      $.each(opts.zeitdata, function (key, objarray) {
        if (key != 'migrated') {
          objarray.forEach(function (entry) {
            if (entry.user.userid == null) {
              ok = false;
            }
          })
        }
      })
      return ok;
    },
    checkMaxTimeValues: function () {
      var ok = true;
      $.each(opts.zeitdata, function (key, objarray) {
        if (key !== 'migrated') {
          objarray.forEach(function (entry) {
            if (entry['classification-time'] > MAX_TIME || entry['examine-time'] > MAX_TIME ||
                entry['nonencountered-time'] > MAX_TIME || entry['setup-time'] > MAX_TIME) {
              ok = false;
            }
          })
        }
      })
      return ok;
    },
    check4RejectOrWarning: function () {
      var ok = true;
      if (!checkTimes)
        return ok;
      var timeSum = 0;
      $.each(opts.zeitdata, function (key, objarray) {
        if (key != 'migrated') {
          objarray.forEach(function (entry) {
            timeSum += entry['classification-time'] + entry['examine-time'] +
                      entry['nonencountered-time'] + entry['setup-time'];
          })
        }
      })
      if (checkTimes.reject > 0 && timeSum > checkTimes.reject) {
        ok = false;
        $.alert("Speicherablehnung", "Die Summe der Bearbeitungszeiten (" + timeSum + 
          " Minuten) hat die Summenvorgabe (" + checkTimes.reject + " Minuten) des aktuellen Auftragsprodukts \u00fcberschritten.\
          \nZum Speichern m\u00fcssen Sie die Zeiteingaben anpassen.");
      }
      else if (checkTimes.warn > 0 && timeSum > checkTimes.warn) {
        $.alert("Warnung", "Die Summe der Bearbeitungszeiten (" + timeSum + " Minuten) n\u00e4hert sich der Summenvorgabe (" + 
          checkTimes.reject + " Minuten) des aktuellen Auftragsprodukts.");
      }
      return ok;
    }
  }
  
  var dlgDefOpts = {
    open: function ( ) {

      var optsM = {type: 'M', readonly: true};
      var optsS = {type: 'S', readonly: opts.readonly, bereicheList: opts.bereicheList, defSector: opts.defSector};
      var optsP = {type: 'P', readonly: opts.readonly, bereicheList: opts.bereicheList, defSector: opts.defSector};

      if (opts.zeitdata['migrated'].length === 0)
        $('#migrated').remove();
      else
        $('#migrated').componentBearbeitungszeiten(opts.zeitdata['migrated'], _.extend(optsM, {title: 'Migrationsdaten ohne Zuordnung',category: 'migrated', maxrows: 1}));

      var kfkops = jQuery.extend({}, optsS);
      if (opts.ordertype != 2)
        $('#kfk').remove();
      else
        $('#kfk').componentBearbeitungszeiten(opts.zeitdata['kfk'], _.extend(kfkops, {title: 'Kodierfachkraft',category: 'kfk', maxrows: 3}));
      $('#bga').componentBearbeitungszeiten(opts.zeitdata['bga'], _.extend(optsS, {title: 'Beteiligter Gutachter',category: 'bga', maxrows: 5, 
                                                                                    currentuser: opts.currentuser, currentusername: opts.currentusername}));
      
      var actops = jQuery.extend({}, opts.ordertype == 1 ? optsP : optsS);
      if (opts.currentuser !== opts.currentvga)
        _.extend(actops, {readonly: true});
      else
        _.extend(actops, {currentuser: opts.currentuser, currentusername: opts.currentusername});
      $('#vga').componentBearbeitungszeiten(opts.zeitdata['vga'], _.extend(actops, {title: 'Verantwortlicher Gutachter',category: 'vga', maxrows: 3}));

      if (!opts.readonly) {
        // var currProductid = "1"// top.frames[2].$('#Productid').val();
        // if (currProductid.trim().length > 0)
        //   checkTimes = _.findWhere(top.valueLists.workingtimesCheckList, {productid:Number(currProductid)});
      }

      style();
    },
    close: function ( ) {
      $(this).dialog('destroy');
    },
    position: {my: "left top", at: "left+20 top+30", of: window},
    title: !opts.readonly ? 'Erfassung von ' : '' + 'Bearbeitungszeiten',
    width: 'auto',
    height: 'auto',
    closeText: 'Schlie\u00dfen',
    modal: true,
    buttons: {
      '\u00dcbernehmen': function () {
        var correctEntries = utils.checkEntries();
        var correctTimes = utils.checkMaxTimeValues();
        var checkSum = utils.check4RejectOrWarning();
        if (correctEntries && correctTimes && checkSum) {
          opts.callback && opts.callback(opts.zeitdata);
          $(this).dialog('close');
        }
        else {
          var msg = "";
          if (!correctEntries)
            msg = 'Mindestens eine Bearbeitungszeile ist unvollst\u00e4ndig. Bitte setzen Sie je Zeile einen Bearbeiter oder l\u00f6schen Sie die leeren Zeilen.\n'; 
          if (!correctTimes)
            msg += 'Die maximale erfassbare Arbeitszeit je Feld sind 999h 59m (59999 Minuten). Bitte korrigieren Sie die zu gro\u00dfen Zeiteintr\u00e4ge.\n';
          if (msg.length > 0)
            $.alert('Unvollst\u00e4ndige / inkorrekte Daten', msg + '\nBitte erg\u00e4nzen bzw. korrigieren Sie die Eintr\u00e4ge.');
        }
      },
      'Abbrechen': function () {
        $(this).dialog('close');
      }
    }
  };

  if( opts.readonly ) delete dlgDefOpts.buttons['\u00dcbernehmen'];

  var dlg = $("\
    <div id='dlgErfassungsUndBearbeitungsZeiten'>\n\
      <div id='migrated'></div><br>\n\
      <div id='kfk'></div><br>\n\
      <div id='bga'></div><br>\n\
      <div id='vga'></div>\n\
    </div>");

  var myopts = $.extend({}, dlgDefOpts, opts);

  dlg.dialog(myopts);

  //  Styling
  function style() {
    $('#dlgErfassungsUndBearbeitungsZeiten').css('background-color', '#eeeee0');
    $('#dlgErfassungsUndBearbeitungsZeiten th, #dlgErfassungsUndBearbeitungsZeiten td').css('border-color', '#fff').css('border-style', 'solid').css('border-width', '1px');
    $('#dlgErfassungsUndBearbeitungsZeiten .ebtable #data input[type=radio]').width('20px');
    $('#dlgErfassungsUndBearbeitungsZeiten').parent().find('h1').css('font-size', '12px');
    $('#dlgErfassungsUndBearbeitungsZeiten').parent().find('.ebtable').css('font-size', '12px');
  }
};
