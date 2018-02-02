/* global _, jQuery, */ /* jshint multistr: true *//* jshint expr: true */
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
      convertZeitenString2Minutes: function (v) {
        //return moment.duration(v).asMinutes();
        var arr = v.split(':').reverse();  // 'H:M' -> ['<M>', '<H>']    ~   '2:15' -> ['15', '2'] 
        return Number(arr[0]) + Number(arr[1] || '0') * 60;
      },
      convertMinutes2ZeitenString: function (v) {
        return Math.trunc(v / 60) + ':' + v % 60;
      },
      checkFormatForZeiten: function (o) {
        return function () {
          var v = $(o).val();

          var arr = v.split(':').reverse();  // 'H:M' -> ['<M>', '<H>']    ~   '2:15' -> ['15', '2'] 
          if (arr[0].length > 2) {
            $(o).val('');
            return;
          }

          if (_.isNaN(utils.convertZeitenString2Minutes($(o).val()))) {
            $(o).val('');
            return;
          }

          // Normalize
          $(o).val((arr[1] || '0') + ':' + arr[0]);

        };
      },
      newZeitenEntry: function(){
        return  {
            'user': {userid: null, firstname: null, lastname: null},
            'sectorid': null,
            'working-time': null,
            'setup-time': null
          };
      }
    };

    var defopts = {
    };

    var myopts = $.extend({}, defopts, opts);

    function initTable(zeitdata) {
      var tbldata = zeitdata.map(function (zeit) {
        return [
          zeit['user'],
          zeit['sector'],
          zeit['working-time'],
          zeit['setup-time'],
          '' // trash
        ];
      });

      $('#working-time' + id + 'grid').ebtable(tblopts, tbldata);

      $('#' + id + ' .fa-plus-circle').off().on('click', function () {
        var newZeit = {
          'user': {userid: null, firstname: null, lastname: null},
          'sectorid': null,
          'working-time': null,
          'setup-time': null
        };
        zeitdata.push(newZeit);
        initTable(zeitdata);
      });
    }

    var afterRedraw = function () {

      var optsForZeitenFields = {
        marshalling: {
          fromInputField: utils.convertZeitenString2Minutes,
          toInputField: utils.convertMinutes2ZeitenString
        }
      };

      $('#' + id + ' .sector').each(function (idx, elem) {
        $(elem).ebdropdown({disabled: myopts.readonly}, myopts.bereicheList).ebbind(zeitdata[idx], 'sectorid');
      });
      
      $('#' + id + ' .working-time').each(function (idx, elem) {
        $(elem).ebbind(zeitdata[idx], 'working-time', null, optsForZeitenFields).on('blur', utils.checkFormatForZeiten(elem));
      });
      
      $('#' + id + ' .setup-time').each(function (idx, elem) {
        $(elem).ebbind(zeitdata[idx], 'setup-time', null, optsForZeitenFields).on('blur', utils.checkFormatForZeiten(elem));
      });
      
      $('#' + id + ' i.fa-search').each(function (idx, elem) {
        $(elem).off().on('click', function (evt) {
          var n = Number(evt.target.id.replace(/.*-/, ''));
          dlgSelectExperts(function (user) {
            zeitdata[n].user.userid = user.userid;
            zeitdata[n].user.name = user.name;
            $('#' + id + 'mitarbeitercode-' + n).val(user.name);
            return true;
          }, {}
          );
        });
      });
      
      $('#' + id + ' i.fa-times-circle-o').each(function (idx, elem) {
        $(elem).off().on('click', function (evt) {
          var n = Number(evt.target.id.replace(/.*-/, ''));
          zeitdata[n] = utils.newZeitenEntry();
          initTable(zeitdata);
        });
      });

      $('#' + id + ' i.fa-plus-circle-o').off().on('click', function () {
        zeitdata.push(utils.newZeitenEntry());
        initTable(zeitdata);
      });

      $('#' + id + ' i.fa-trash-o').each(function (idx, elem) {
        $(elem).off().on('click', function (evt) {
          var n = Number(evt.target.id.replace(/.*-/, ''));
          zeitdata.splice(n, 1);
          initTable(zeitdata);
        });
      });

      $('#' + id + ' .user').css('width', '85%');
      $('#' + id + ' .sector').css('width', '98%');
      $('#' + id + ' .working-time').css('width', '95%');
      $('#' + id + ' .setup-time').css('width', '95%');
      $('#' + id + ' .ui-selectmenu-button').css('height', '12px');
      $('#' + id + ' .ebtable #data td').css('padding', '5px 5px 5px 5px');

      if (myopts.readonly) {
        $('#' + id + ' input').prop('disabled', true);
      }
    };

    var renderer = {
      user: function (data, row, r) {
        var displayname = data.name || utils.formatName(data);
        var t = _.template('<input class="user" type="text" id="<%=id%>mitarbeitercode-<%=r%>" value="<%=displayname%>" disabled >');
        return t({id: id, r: r, displayname: displayname}) + (myopts.readonly ? '' : '&nbsp;<i id="' + id + 'icdsearch-' + r + '" class="fa fa-search fa-lg"></i>');
      },
      sector: function (data, row, r) {
        return '<div class="sector" id="' + id + 'sector' + r + '">' + data + '</div>';
      },
      'working-time': function (data) {
        return '<input class="working-time" type="text" placeholder="HH:MM" value="' + data + '">';
      },
      'setup-time': function (data) {
        return '<input class="setup-time"  type="text" placeholder="HH:MM" value="' + data + '">';
      },
      trash: function (data, row, r) {
        if (myopts.readonly)
          return  '<span>&nbsp;</span>';
        return r === 0 ? '&nbsp;<i class="fa fa-times-circle-o fa-lg"></i>' : '&nbsp;<i class="fa fa-trash-o fa-lg"></i>';
      }
    };

    var tblopts = {
      flags: {filter: false, pagelenctrl: false, config: false, withsorting: false, clearFilterButton: false, colsResizable: false, jqueryuiTooltips: false, ctrls: false},
      columns: [
        {name: "Mitarbeiter", render: renderer.user},
        {name: "Bereich", render: renderer.sector},
        {name: "Bearbeitungszeit", render: renderer['working-time']},
        {name: "Rüstzeit", invisible: myopts.type === 'A', render: renderer['setup-time']},
        {name: "", invisible: myopts.readonly, render: myopts.readonly ? null : renderer.trash}
      ],
      afterRedraw: afterRedraw
    };


    this.id = id;
    (function (a) {
      var addBtn = myopts.readonly || (myopts.type !== 'B') ? '' : '<i class="fa fa-plus-circle fa-lg"></i>';
      var s = _.template('\
            <div>\n\
              <h1><%=title%> &nbsp; <%=addBtn%></h1>  \n\
              <div id="working-time<%=id%>grid"></div>\n\
            </div>\n')({title: myopts.title, id: id, addBtn: addBtn});
      a.html(s);
      initTable(zeitdata);
    })(this);

    afterRedraw();
  };
})(jQuery);