/* global _ */

var dlgBearbeitungsZeiten = function (opts) {

  var dlgDefOpts = {
    open: function ( ) {

      var optsA = {type: 'A', readonly: opts.readonly, bereicheList: opts.bereicheList};
      var optsB = {type: 'B', readonly: opts.readonly, bereicheList: opts.bereicheList};

      $('#sichtung').componentBearbeitungszeiten(opts.zeitdata['sichtung'], _.extend(optsA, {title: 'Sichtungszeit'}));
      $('#fehlbesuchszeit').componentBearbeitungszeiten(opts.zeitdata['fehlbesuchszeit'], _.extend(optsA, {title: 'Fehlbesuchszeiten'}));
      $('#kfk').componentBearbeitungszeiten(opts.zeitdata['kfk'], _.extend(optsB, {title: 'Kodierfachkraft'}));
      $('#bga').componentBearbeitungszeiten(opts.zeitdata['bga'], _.extend(optsB, {title: 'Beteiligter Gutachter'}));
      $('#vga').componentBearbeitungszeiten(opts.zeitdata['vga'], _.extend(optsB, {title: 'Verantwortlicher Gutachter'}));

      //  Styling
      $('#dlgErfassungsUndBearbeitungsZeiten').css('background-color', '#eeeee0');
    },
    close: function ( ) {
      $(this).dialog('destroy');
    },
    position: {my: "left top", at: "left+20 top+30", of: window},
    title: 'Erfassung von Bearbeitungszeiten',
    width: 'auto',
    height: 'auto',
    closeText: 'Schlie\u00dfen',
    modal: true,
    buttons: {
      '\u00dcbernehmen': function () {
        opts.callback && opts.callback(opts.zeitdata);
        $(this).dialog('close');
      },
      'Abbrechen': function () {
        $(this).dialog('close');
      }
    }
  };

  var dlg = $("\
    <div id='dlgErfassungsUndBearbeitungsZeiten'>\n\
      <div id='sichtung'></div><br>\n\
      <div id='fehlbesuchszeit'></div><br>\n\
      <div id='kfk'></div><br>\n\
      <div id='bga'></div><br>\n\
      <div id='vga'></div>\n\
    </div>");

  var myopts = $.extend({}, dlgDefOpts, opts);

  dlg.dialog(myopts);
};
