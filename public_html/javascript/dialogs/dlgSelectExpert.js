/* global _, ebutils */
const dlgSelectExperts = function (onTakeOverCallback, opts) {

  const defopts = {
    open: dlgOpen,
    close: function () {
      $(this).dialog('destroy');
    },
    title: opts.usertypeNames.join(', ') + ' ausw\u00e4hlen',
    heading: 'Bitte w\u00e4hlen Sie einen Bearbeiter',
    singleSelection: true,
    width: 1000,
    onlyThoseInOrgunitSpecialcase: false,
    position: {my: "left top", at: "left+30 top+40", of: window},
    closeText: 'Schlie\u00dfen',
    show: {effect: "blind", duration: 200},
    hide: {effect: "blind", duration: 200},
    modal: true,
    usertypeNames: ['Vorgangsbearbeiter'],
    buttons: {
      '\u00dcbernehmen': function () {
        utils.overtake() && $(this).dialog("destroy");
      },
      'Abbrechen': function () {
        $(this).dialog("destroy");
      }
    },
  };

  const myopts = $.extend({}, defopts, opts);

  const utils = {
    concat: function () {
      return _.compact([].slice.call(arguments)).join(', ');
    },
    formatName: function (o) {
      return utils.concat(o.lastname, o.firstname);
    },
    formatVornameNachname: function (o) {
      return ([o.firstname, o.lastname]).join(' ');
    },
    getExperts: function () {
      var ret = [];
      $.ajax({
        url: '/ISmed/ajax/workspace.do?action=get-experts&ajax=1&destRoles=' + myopts.usertypeNames
                + '&dlgContext=' + myopts.dlgContext + '&check4SpecialCase=' + myopts.onlyThoseInOrgunitSpecialcase,
        async: false,
        success: function (res) {
          handleAjaxResult(res, function (res) {
            ret = res.experts.filter(function (expert) {
              return myopts.onlyThoseInOrgunitSpecialcase ? expert.inOrgunitSpecialcase : true;
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
    getSelectedExpertIds: function (grid) {
      var selRows = grid.getSelectedRows();
      return selRows.map(function (row) {
        return row[0]
      });
    },
    getSelectedExpertsNames: function (grid) {
      var selRows = grid.getSelectedRows();
      return selRows.map(function (row) {
        return row[5]
      }).reduce(function (acc, o) {
        return acc + (acc ? ', ' : '') + o
      }, '');
    },
    getSelectedExpertName: function (grid) {
      var selRows = grid.getSelectedRows();
      return selRows.length === 0 ? '' : selRows[0][1];
    },
    getSelectedExpertVornameNachname: function (grid) {
      var selRows = grid.getSelectedRows();
      return selRows.length === 0 ? '' : selRows[0][5];
    },
    getExpertsForGrid: function (data) {
      return data.map(function (o) {
        return [o.userid, utils.formatName(o), (o.fakultaete || []).join(', '), (o.zusatzbezeichnung || []).join(', '), o.email, utils.formatVornameNachname(o)];
      });
    },
    overtake: function () {
      if (myopts.singleSelection) {
        var v = {
          userid: utils.getSelectedExpertId(grid),
          name: utils.getSelectedExpertName(grid),
          vornamenachname: utils.getSelectedExpertVornameNachname(grid)
        };
        if (!v.userid) {
          $.alert('Hinweis', 'Bitte einen Eintrag ausw\u00e4hlen');
          return false;
        }
        return onTakeOverCallback(v);
      } else {
        var ids = utils.getSelectedExpertIds(grid);
        const selectedExperts = experts.filter(function (expert) {
          return ids.includes(expert.userid)
        })
        return onTakeOverCallback(selectedExperts);
      }

    },
  };

  const experts = utils.getExperts()

  function dlgOpen( ) {
    var optsExpertsGrid = {
      columns: [
        {name: "userid", technical: true, invisible: true},
        {name: "Name"},
        {name: "Fachgebiet"},
        {name: "Zusatzbezeichnung"},
        {name: "E-Mail"},
        {name: "VornameNachname", technical: true, invisible: true}
      ],
      flags: {
        arrangeColumnsButton: false,
        colsResizable: false,
        config: false
      },
      sortcolname: 'Name',
      selectionCol: {
        singleSelection: myopts.singleSelection,
        selectOnRowClick: true,
        onSelection: myopts.singleSelection ? undefined : function () {
          const countSelected = utils.getSelectedExpertIds(grid).length;
          if (!myopts.singleSelection) {
            const s = 'Ausgew\u00e4hlt ' + (countSelected === 1 ? 'ist' : 'sind') + ':' + utils.getSelectedExpertsNames(grid);
            $('#expertsselected').text(countSelected > 0 ? s : '')
          }
        }
      },
      afterRedraw: styling,

    };
    const expertsForGridData = utils.getExpertsForGrid(experts);
    grid = $('#dlgSelectExperts #expertsgrid').ebtable(optsExpertsGrid, expertsForGridData);

    const selectedExpertsIds = myopts.selectedExperts.map(function (expert) {
      return expert.participant.userid;
    })

    grid.setSelectedRows(function (r) {
      return selectedExpertsIds.includes(r[0]); // r[0] => userid
    });

    $('#expertsselected').text(utils.getSelectedExpertsNames(grid))
  }

  var grid;

  const template = _.template("\
    <div id='dlgSelectExperts'>\n\
      <span style='float:right'><a href=javascript:call_help('<%=context%>');><i class='fa fa-question-circle-o fa-lg'></i> Hilfe</a></span>\n\
      <h2><%=heading%></h2>\n\
      <div id='expertsselected'></div>\n\
      <div id='expertsgrid'></div>\n\
    </div>")({
    context: myopts.dlgContext,
    heading: myopts.heading,
  })

  var dlg = $(template);
  dlg.dialog(myopts);
//  .keyup(function (e){ e.keyCode === 13 && utils.overtake(); });
  function styling() {
    $('#dlgSelectExperts').css('background-color', '#eeeee0');
    $('#expertsgrid  th, #expertsgrid td').css('border-color', '#fff').css('border-style', 'solid').css('border-width', '1px');
    $('#expertsgrid #data table td').css('padding', '3px 4px 3px 4px');
    $('#dlgSelectExperts').parent().find('*').css('font-size', '12px');
  }
};