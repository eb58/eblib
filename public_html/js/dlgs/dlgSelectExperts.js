/* global _, ebutils */
var dlgSelectExperts = function (onTakeOverCallback, opts) {

  opts.usertypeName = opts.usertypeName || 'Vorgangsbearbeiter';

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
        url: 'mima.do?action=get-experts&ajax=1' + (opts.usertypeName === 'Gutachter' ? '' : '&all=true'),
        async: false,
        success: function (res) {
          handleAjaxResult(res, function (res) {
            ret = res.experts.filter(function (expert) {
              return opts.onlyThoseInOrgunitSpecialcase ? expert.inOrgunitSpecialcase : true;
            });
          });
        },
        error: function (a, b, c) {
          console.log('Error in getExperts', a, b, c);
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
    getSelectedExpertId: function (grid) {
      var selRows = grid.getSelectedRows();
      return selRows.length === 0 ? 0 : selRows[0][0];
    },
    getSelectedExpertName: function (grid) {
      var selRows = grid.getSelectedRows();
      return selRows.length === 0 ? '' : selRows[0][1];
    },
    getExpertsForGrid: function (data) {
      return data.map(function (o) {
        return [o.userid, utils.formatName(o), (o.fakultaete || []).join(', '), (o.zusatzbezeichnung || []).join(', '), o.email];
      });
    },
    overtake: function () {
      var v = {
        userid: utils.getSelectedExpertId(grid),
        name: utils.getSelectedExpertName(grid)
      };
      if (!v.userid) {
        $.alert('Hinweis', 'Bitte einen Eintrag ausw\u00e4hlen');
        return false;
      } else {
        return onTakeOverCallback(v);
      }
    },
  };

  function dlgOpen( ) {
    var optsExpertsGrid = {
      columns: [
        {name: "userid", technical: true, invisible: true},
        {name: "Name"},
        {name: "Fachgebiet"},
        {name: "Zusatzbezeichnung"},
        {name: "E-Mail"}
      ],
      flags: {
        arrangeColumnsButton: false,
        colsResizable: false,
        config:false,
      },
      sortcolname: 'Name',
      selectionCol: {singleSelection: true, selectOnRowClick: true},
      afterRedraw: styling

    };
    grid = $('#dlgSelectExperts #expertsgrid').ebtable(optsExpertsGrid, utils.getExpertsForGrid(utils.getExperts()));
  }

  var grid;
  var defopts = {
    open: dlgOpen,
    close: function () {
      $(this).dialog('destroy');
    },
    title: opts.usertypeName + ' ausw\u00e4hlen',
    width: 1000,
    closeText: 'Schlie\u00dfen',
    show: {effect: "blind", duration: 200},
    hide: {effect: "blind", duration: 200},
    modal: true,
    buttons: {
      '\u00dcbernehmen': function () {
        utils.overtake() && $(this).dialog("close");
      },
      'Abbrechen': function () {
        $(this).dialog("close");
      }
    },
    onlyThoseInOrgunitSpecialcase: false
  };

  var dlg = $("\
    <div id='dlgSelectExperts'>\n\
      <span style='float:right'><a href=javascript:call_help('mimaDlgDispose');><i class='fa fa-question-circle-o fa-lg'></i> Hilfe</a></span>\n\
      <h2>Bitte w\u00e4hlen Sie einen " + opts.usertypeName + "</h2>\n\
        <div id='expertsgrid'></div>\n\
    </div>");

  var myopts = $.extend({}, defopts, opts);

  dlg.dialog(myopts);
//  .keyup(function (e){ e.keyCode === 13 && utils.overtake(); });
//  Styling
  function styling() {
    $('#dlgSelectExperts').css('background-color', '#eeeee0');
    $('#expertsgrid  th, #expertsgrid td').css('border-color', '#fff').css('border-style', 'solid').css('border-width', '1px');
    $('#expertsgrid #data table td').css('padding', '3px 4px 3px 4px');
  }

};
