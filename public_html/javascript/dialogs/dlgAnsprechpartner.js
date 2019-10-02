/* global _ */

var dlgAnsprechpartner = function (opts, ansprechpartner){
  const ansprechp = $.extend({},ansprechpartner);
  ansprechp.branchoffice = ansprechpartner['branch-office']
  ansprechp.branchofficeno = ansprechpartner['branch-office-no']
  ansprechp.additionalinformation = ansprechpartner['additional-information']
  
  $('#dlgAnsprechpartner').remove();
  var dlg = $('\
      <div id="dlgAnsprechpartner">\n\
        <table style="width=100%">\n\
          <tr><td>Name      <td><td><input type="text" v-model="name"/><td></tr>\n\
          <tr><td>Vorname   <td><td><input type="text" v-model="firstname"/><td></tr>\n\
          <tr><td>Abteilung <td><td><input type="text" v-model="branchoffice"/><td></tr>\n\
          <tr><td>Telefon   <td><td><input type="text" v-model="branchofficeno"/><td></tr>\n\
          <tr><td>Fax       <td><td><input type="text" v-model="fax"/><td></tr>\n\
          <tr><td>Email     <td><td><input type="text" v-model="email"/><td></tr>\n\
          <tr><td>Bemerkung <td><td><textarea cols=42  v-model="additionalinformation"></textarea/><td></tr>\n\
        </table>\n\
      </div>');

  const buttonsReadonlyModus = {
    'OK': function (){
      $(this).dialog("destroy");
    }
  }

  const buttonsEditModus = {
    '\u00dcbernehmen': function (){
      if (!opts.onTakeOverCallback) {
        $(this).dialog("destroy");
        return;
      }
  
      ansprechpartner = ansprechp;
      ansprechpartner['branch-office'] = ansprechp.branchoffice
      ansprechpartner['branch-office-no'] = ansprechp.branchofficeno
      ansprechpartner['additional-information'] = ansprechp.additionalinformation
      if (opts.onTakeOverCallback(ansprechpartner)) {
        $(this).dialog("destroy");
      }
    },
    'Abbrechen': function (){
      $(this).dialog("destroy");
    }
  }

  var defopts = {
    open: function (){
      const vue = new Vue({
        el: '#dlgAnsprechpartner',
        data: ansprechp
      });
    },
    title: 'Ansprechpartner',
    height: 300, width: 400,
    closeText: 'Schlie\u00dfen',
    modal: true,
    buttons: opts.readonly ? buttonsReadonlyModus : buttonsEditModus
  };
  var myDlgOpts = $.extend({}, defopts, opts);
  dlg.dialog(myDlgOpts).keyup(function (e){
    if (e.keyCode === 13 && !myDlgOpts.readonly) {
      if ( opts.onTakeOverCallback &&  opts.onTakeOverCallback(ansprechpartner)) {
        $(this).dialog("destroy");
      }
    }
  });
// styling
  $('#dlgAnsprechpartner').css('background-color', '#eeeee0');
  $('#dlgAnsprechpartner').parent().find('*').css('font-size', '12px');
  $("#dlgAnsprechpartner input").width('300px').prop('disabled',opts.readonly);
  $("#dlgAnsprechpartner textarea").prop('disabled',opts.readonly)
};