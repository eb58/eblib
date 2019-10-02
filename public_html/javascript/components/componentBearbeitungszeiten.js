/* global _, jQuery, top.objectIsChanged = editOrder save-Flag*/ /* jshint multistr: true *//* jshint expr: true */
(function ($) {
  "use strict";
  $.fn.componentBearbeitungszeiten = function (zeitdata, opts) {
    var id = this[0].id;

    var utils = {
      concat: function () {
        return _.compact([].slice.call(arguments)).join(', ');
      },
      formatName: function (o) {
        return o ? utils.concat(o.lastname, o.firstname) : '';
      },
      check4UniqueUser: function (userid) {
        var ok = true;
        zeitdata.forEach(function (entry) {
          if (entry.user.userid === userid) {
            ok = false;
          }
        })
        return ok;
      },
      disableOtherEntries: function (userid) {
        var i = -1;
        $('#costs_' + id + '_grid tr').each(function() {
          if (i > -1 && zeitdata[i].user.userid !== userid) {
            $.each(this.cells, function(){
              $('input', this).prop("disabled", true);
            });
          }
          i++;
        });
      },
      newZeitenEntry: function(){
        return  {
            'dms-position': 0,
            'user': {userid: null, firstname: null, lastname: null},
            'category': opts.category,
            'sectorid': opts.defSector != '' ? opts.defSector : null,
            'classification-time': 0,
            'setup-time': 0,
            'examine-time': 0,
            'nonencountered-time': 0
          };
      }
    };

    var defopts = {
    };

    var myopts = $.extend({}, defopts, opts);

    function initTable(zeitdata) {
      var tbldata = zeitdata.map(function (zeit) {
        return [
          zeit['dms-position'],
          zeit['user'],
          zeit['sector'],
          zeit['classification-time'],
          zeit['setup-time'],
          zeit['examine-time'],
          zeit['nonencountered-time'],
          '' // trash
        ];
      });

      $('#costs_' + id + '_grid').ebtable(tblopts, tbldata);

      $('#' + id + ' .fa-plus-circle').off().on('click', function () {
        if (opts.category === 'vga' && !utils.check4UniqueUser(opts.currentuser)) {
          $.alert('Hinweis', 'Bitte bearbeiten Sie Ihren bereits vorhandenen Eintrag.');
          return;
        }
        if (zeitdata.length >= opts.maxrows) {
          $.alert('Hinweis', 'In dieser Bearbeiterkategorie sind maximal ' + opts.maxrows + ' Eintr\u00e4ge erlaubt.');
          return;
        }
        var newZeit = utils.newZeitenEntry();
        if (opts.category === 'vga') {
          newZeit.user.userid = opts.currentuser;
          newZeit.user.lastname = opts.currentusername;
        }
        else if (opts.category === 'bga' && utils.check4UniqueUser(opts.currentuser)) {
          newZeit.user.userid = opts.currentuser;
          newZeit.user.lastname = opts.currentusername;
        }

        var pos = 1;
        for (; pos <= zeitdata.length; pos++)
          if (pos < zeitdata[pos-1]['dms-position']) {
            break;
          }
        newZeit['dms-position'] = pos;
        if (pos > zeitdata.length)
          zeitdata.push(newZeit);
        else
          zeitdata.splice(pos-1, 0, newZeit);
        top.objectIsChanged = true;
        initTable(zeitdata);
      });
    }

    var afterRedraw = function () {

      var optsForZeitenFields = {
        marshalling: {
          fromInputField: timeUtils.convertZeitenString2Minutes,
          toInputField: timeUtils.convertMinutes2ZeitenString
        }
      };

      $('#' + id + ' .sector').each(function (idx, elem) {
        $(elem).ebdropdown({disabled: myopts.readonly || (opts.category === 'vga' && zeitdata[idx].user.userid != opts.currentuser)}, myopts.bereicheList).ebbind(zeitdata[idx], 'sectorid');
      });
      
      $('#' + id + ' .classification-time').each(function (idx, elem) {
        $(elem).ebbind(zeitdata[idx], 'classification-time', null, optsForZeitenFields).on('blur', timeUtils.checkFormat4Zeiten(elem));
      });
      
      $('#' + id + ' .setup-time').each(function (idx, elem) {
        $(elem).ebbind(zeitdata[idx], 'setup-time', null, optsForZeitenFields).on('blur', timeUtils.checkFormat4Zeiten(elem));
      });
      
      $('#' + id + ' .examine-time').each(function (idx, elem) {
        $(elem).ebbind(zeitdata[idx], 'examine-time', null, optsForZeitenFields).on('blur', timeUtils.checkFormat4Zeiten(elem));
      });
      
      $('#' + id + ' .nonencountered-time').each(function (idx, elem) {
        $(elem).ebbind(zeitdata[idx], 'nonencountered-time', null, optsForZeitenFields).on('blur', timeUtils.checkFormat4Zeiten(elem));
      });
      
      $('#' + id + ' i.fa-search').each(function (idx, elem) {
        $(elem).off().on('click', function (evt) {
          var n = Number(evt.target.id.replace(/.*-/, ''));
          var usertypeNames = ['Gutachter'];
          if (opts.category === 'kfk')
            usertypeNames = ['Kodierfachkraft'];
          dlgSelectExperts(function (user) {
            if (utils.check4UniqueUser(user.userid)) {
              zeitdata[n].user.userid = user.userid;
              zeitdata[n].user.name = user.name;
              $('#' + id + 'mitarbeitercode-' + n).val(user.name);
              top.objectIsChanged = true;
            }
            else
              $.alert('Hinweis', 'Der ausgew\u00e4hlte Bearbeiter ist bereits in der Bearbeiterliste vorhanden.\nBitte bearbeiten Sie den vorhandenen Eintrag.');
            return true;
          }, {usertypeNames: usertypeNames, dlgContext: 'dlgHandlingCosts'}
          );
        });
      });
      
      $('#' + id + ' i.fa-trash-o').each(function (idx, elem) {
        $(elem).off().on('click', function (evt) {
          $.confirm('Frage', 'Sind Sie sicher, dass Sie diesen Eintrag l\u00f6schen wollen?', function(){
            var n = Number(evt.target.id.replace(/.*-/, ''));
            zeitdata.splice(n, 1);
            top.objectIsChanged = true;
            initTable(zeitdata);
          });
        });
      });

      $('#' + id + ' .user').css('width', '85%');
      $('#' + id + ' .sector').css('width', '110%');
      $('#' + id + ' .classification-time').css('width', '95%');
      $('#' + id + ' .setup-time').css('width', '95%');
      $('#' + id + ' .examine-time').css('width', '95%');
      $('#' + id + ' .nonencountered-time').css('width', '95%');
      $('#' + id + ' .ui-selectmenu-button').css('height', '12px');
      $('#' + id + ' .ebtable #data td').css('padding', '5px 5px 5px 5px');

      if (myopts.readonly) {
        $('#' + id + ' input').prop('disabled', true);
      }
      else if (opts.category === 'vga') {
        utils.disableOtherEntries(opts.currentuser);
      }
    };

    var renderer = {
      'dms-position': function (data) {
        return data;
      },
      user: function (data, row, r) {
        var displayname = data.name || utils.formatName(data);
        var t = _.template('<input class="user" type="text" id="<%=id%>mitarbeitercode-<%=r%>" value="<%=displayname%>" disabled >');
        return t({id: id, r: r, displayname: displayname}) + (myopts.readonly || opts.category === 'vga' ? '' : '&nbsp;<i id="' + id + 'icdsearch-' + r + '" class="fa fa-search fa-lg" title="Mitarbeiter ausw\u00e4hlen"></i>');
      },
      sector: function (data, row, r) {
        return '<div class="sector" id="' + id + 'sector' + r + '">' + data + '</div>';
      },
      'classification-time': function (data) {
        return '<input class="classification-time" type="text" placeholder="HH:MM" value="' + data + '">';
      },
      'setup-time': function (data) {
        return '<input class="setup-time"  type="text" placeholder="HH:MM" value="' + data + '">';
      },
      'examine-time': function (data) {
        return '<input class="examine-time" type="text" placeholder="HH:MM" value="' + data + '">';
      },
      'nonencountered-time': function (data) {
        return '<input class="nonencountered-time"  type="text" placeholder="HH:MM" value="' + data + '">';
      },
      trash: function (data, row, r) {
        if (myopts.readonly || (opts.category === 'vga' && zeitdata[r].user.userid != opts.currentuser))
          return  '<span>&nbsp;</span>';
        return '&nbsp;<i id="' + r + '" class="fa fa-trash-o fa-lg" title="Eintrag l\u00f6schen"></i>';
      }
    };

    var tblopts = {
      flags: {filter: false, pagelenctrl: false, config: false, withsorting: false, clearFilterButton: false, colsResizable: false, jqueryuiTooltips: false, ctrls: false},
      columns: [
        {name: "", render: renderer['dms-position'], css: 'width: 20px; text-align: center'},
        {name: "Mitarbeiter", render: renderer.user},
        {name: "Bereich", render: renderer.sector, css: 'width: 120px;'},
        {name: "Sichtungszeit", render: renderer['classification-time']},
        {name: "R\u00fcstzeit", render: renderer['setup-time']},
        {name: "Begutachtungszeit", render: renderer['examine-time']},
        {name: "Fehlbesuchszeit", invisible: myopts.type === 'S', render: renderer['nonencountered-time']},
        {name: "", invisible: myopts.readonly, render: myopts.readonly ? null : renderer.trash}
      ],
      afterRedraw: afterRedraw
    };


    this.id = id;
    (function (a) {
      var addBtn = myopts.readonly ? '' : '<i class="fa fa-plus-circle" title="Zeile hinzuf\u00fcgen"></i>';
      var s = _.template('\
            <div>\n\
              <h1><%=title%> &nbsp; <%=addBtn%></h1>  \n\
              <div id="costs_<%=id%>_grid"></div>\n\
            </div>\n')({title: myopts.title, id: id, addBtn: addBtn});
      a.html(s);
      initTable(zeitdata);
    })(this);

    afterRedraw();
  };
})(jQuery);