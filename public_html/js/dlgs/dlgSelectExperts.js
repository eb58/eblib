/* global _ *//* jshint multistr: true */
var dlgSelectExperts = function (onTakeOverCallback, opts) {

  var utils = {
    concat: function () {
      return _.compact([].slice.call(arguments)).join(', ');
    },
    formatName: function (o) {
      return utils.concat(o.lastname, o.firstname);
    },
    getExperts: function () {
      var ret = [];
      $.ajax({
        url: "mima.do?action=get-experts",
        async: false,
        success: function (res) {
          if (res['error-html'] || res.error ) {
            $.alert('Fehler beim Lesen der Vorgangspaketnamen', res['error-html'] || res.error || '????');
          } else {
            console.log(res.experts);
            ret = res.experts;
          }
        },
        error: function () {
          ret = [
            {userid: 50000000000015, lastname: 'Fahrenbach', firstname: 'Markus', fakultaete: ['fakultät', 'moreFak1', 'moreFak2', 'moreFak3'], zusatzbezeichnung: ['ZusatzbezTest1', 'ZusatzbezTest2', 'ZusatzbezTest3']},
            {userid: 50000000000016, lastname: 'Burka', firstname: 'Anne', fakultaete: ['Allgemeinmedizin'], zusatzbezeichnung: ['ZusatzbezTest1', 'ZusatzbezTest2', 'ZusatzbezTest3']},
            {userid: 50000000000017, lastname: 'Schmiester', firstname: 'Bernd', fakultaete: [], zusatzbezeichnung: []},
            {userid: 50000000000018, lastname: 'Wollmann', firstname: 'Piot', fakultaete: ['Geriatrie'], zusatzbezeichnung: ['Akkupunktur', 'Andrologie', 'Sportmedizin']},
            {userid: 50000000000019, lastname: 'Burka', firstname: 'Anne', fakultaete: ['Allgemeinmedizin'], zusatzbezeichnung: ['ZusatzbezTest1', 'ZusatzbezTest2', 'ZusatzbezTest3']},
            {userid: 50000000000017, lastname: 'Schmiester', firstname: 'Bernd', fakultaete: [], zusatzbezeichnung: []},
            {userid: 50000000000018, lastname: 'Wollmann', firstname: 'Piot', fakultaete: ['Geriatrie'], zusatzbezeichnung: ['Akkupunktur', 'Andrologie', 'Sportmedizin']},
          ];
        }
      });
      return ret;
    },
    takeover: function () {
      var rows =  grid.getSelectedRows();
      if (!rows || rows.length===0) {
        $.alert('Hinweis', 'Bitte einen Eintrag ausw\u00e4hlen');
        return false;
      } else {
        var id =  rows[0][0];
        var expert = _.findWhere(experts, {userid:id});
        return onTakeOverCallback({
          userid: id,
          name: utils.formatName(expert)
        });
      }
    }
  };

  var grid;
  var experts = utils.getExperts();
  var tbldata = experts.map(function (o) {
    return [o.userid, utils.formatName(o), (o.fakultaete || []).join(', '), (o.zusatzbezeichnung || []).join(', '), o.email || ''];
  });

  var optsExpertsGrid = {
    columns: [
      {name: "userid", technical: true, invisible: true},
      {name: "Name"},
      {name: "Fachgebiet"},
      {name: "Zusatzbezeichnung"},
      {name: "E-Mail"}
    ],
    sortcolname: 'Name',
    selectionCol: { singleSelection: true},
  };
  var defopts = {
    open: function ( ) {
      _.each(tbldata, function (x) {
        x.selected = false;
      });
      grid = $('#dlgSelectExperts #expertsgrid').ebtable(optsExpertsGrid, tbldata);

    },
    title: 'Vorg\u00e4nge disponieren',
    width: 1000,
    closeText: 'Schlie\u00dfen',
    show: {effect: "blind", duration: 500},
    hide: {effect: "blind", duration: 500},
    modal: true,
    buttons: {
      '\u00dcbernehmen': function () {
        if( utils.takeover() ) $(this).dialog("destroy");
      },
      'Abbrechen': function () {
        $(this).dialog("destroy");
      }
    }
  };

  var dlg = $("\
    <div id='dlgSelectExperts'>\n\
      <div>\n\
        <table style='width:100%'>\n\
          <tr>\n\
            <td style='width:85%'>Bitte w\u00e4hlen Sie einen Bearbeiter</td>\n\
            <td style='width:15%; vertical-align:top'><span style='float:right'><a href=javascript:call_help(mimaDlgDispaose);>[?] Hilfe</a></span></td>\n\
          </tr>\n\
        </table>\n\
        <div id='expertsgrid'></div>\n\
      </div>\n\
    </div>");

  var myopts = $.extend({}, defopts, opts);

  dlg.dialog(myopts);
//  .keyup(function (e){ e.keyCode === 13 && utils.takeover(); });
//  Styling
  $('#dlgSelectExperts').css('background-color', '#eeeee0');
  $('#expertsgrid  th, #expertsgrid td').css('border-color', '#fff').css('border-style', 'solid').css('border-width', '1px');
};
