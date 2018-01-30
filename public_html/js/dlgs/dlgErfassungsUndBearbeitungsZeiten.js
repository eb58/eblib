var dlgErfassungsUndBearbeitungsZeiten = function (opts) {

   var dlgDefOpts = {
      open: function ( ) {

         var optsA = {type: 'A', readonly: opts.readonly, bereicheList: opts.bereicheList};
         var optsB = {type: 'B', readonly: opts.readonly, bereicheList: opts.bereicheList};

         $('#sichtungszeit').componentBearbeitungszeiten([opts.zeitdata['sichtungszeit']], _.extend(optsA, {title: 'Sichtungszeit'}));
         $('#fehlbesuchszeit').componentBearbeitungszeiten([opts.zeitdata['fehlbesuchszeit']], _.extend(optsA, {title: 'Fehlbesuchszeiten'}));
         $('#kodierfachkraft').componentBearbeitungszeiten(opts.zeitdata['kodierfachkraft'], _.extend(optsB, {title: 'Kodierfachkraft'}));
         $('#beteiligter-gutachter').componentBearbeitungszeiten(opts.zeitdata['beteiligter-gutachter'], _.extend(optsB, {title: 'Beteiligter Gutachter'}));
         $('#verantwortlicher-gutachter').componentBearbeitungszeiten(opts.zeitdata['verantwortlicher-gutachter'], _.extend(optsB, {title: 'Verantwortlicher Gutachter'}));

         //  Styling
         $('#dlgErfassungsUndBearbeitungsZeiten').css('background-color', '#eeeee0');
      },
      close: function ( ) {
         $(this).dialog('destroy');
      },
      position: { my: "left top", at: "left+20 top+30", of: window  },
      title: 'Erfassungs- und Bearbeitungszeiten',
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
      <div id='sichtungszeit'></div><br>\n\
      <div id='fehlbesuchszeit'></div><br>\n\
      <div id='kodierfachkraft'></div><br>\n\
      <div id='beteiligter-gutachter'></div><br>\n\
      <div id='verantwortlicher-gutachter'></div>\n\
    </div>");

   var myopts = $.extend({}, dlgDefOpts, opts);

   dlg.dialog(myopts);
};
