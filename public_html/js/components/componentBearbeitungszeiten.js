/* global _, jQuery, */ /* jshint multistr: true *//* jshint expr: true */
(function ($) {
   "use strict";
   $.fn.componentBearbeitungszeiten = function (zeitdata, opts) {
      var id = this[0].id;

      var invisibleColumns = {
         A: [4],
         B: []
      };

      var defopts = {
      };

      var myopts = $.extend({}, defopts, opts);

      function initTable(zeitdata) {
         var tbldata = zeitdata.map(function (zeit) {
            return [
               zeit,
               zeit['mitarbeiter'],
               zeit['bereich'],
               zeit['erledigungszeit'],
               zeit['ruestzeit'],
               '' // trash
            ];
         });

         $('#bearbeitungszeit' + id + 'grid').ebtable(tblopts, tbldata);

         $('#' + id + ' .fa-plus-circle').off().on('click', function () {
            var newZeit = {
               'mitarbeiter': {id: null, name: null},
               'bereichId': null,
               'erledigungszeit': null,
               'ruestzeit': null
            };
            zeitdata.push(newZeit);
            initTable(zeitdata);
         });
      }

      var afterRedraw = function () {

         var optsForZeitenFields = {
            marshalling: {
               fromInputField: function (v) {
                  var a = v.split(':');
                  return Number(a[0]) * 60 + Number(a[1]);
               },
               toInputField: function (v) {
                  return Math.trunc(v / 60) + ':' + v % 60;
               }
            }
         };

         $('#' + id + ' .bereich').each(function (idx, elem) {
            $(elem).ebdropdown({disabled: myopts.readonly}, myopts.bereicheList).ebbind(zeitdata[idx], 'bereichId');
         });
         $('#' + id + ' .erledigungszeit').each(function (idx, elem) {
            $(elem).ebbind(zeitdata[idx], 'erledigungszeit', null, optsForZeitenFields);
         });
         $('#' + id + ' .ruestzeit').each(function (idx, elem) {
            $(elem).ebbind(zeitdata[idx], 'ruestzeit', null, optsForZeitenFields);
         });
         $('#' + id + ' i.fa-search').each(function (idx, elem) {
            $(elem).off().on('click', function (evt) {
               var n = Number(evt.target.id.replace(/.*-/, ''));
               dlgSelectExperts(function (user) {
                  zeitdata[n].mitarbeiter.id = user.userid;
                  zeitdata[n].mitarbeiter.name = user.name;
                  $('#' + id + 'mitarbeitercode-' + n).val(user.name);
                  return true;
               }, {}
               );
            });
         });
         $('#' + id + ' i.fa-trash-o').each(function (idx, elem) {
            $(elem).off().on('click', function (evt) {
               var n = Number(evt.target.id.replace(/.*-/, ''));
               zeitdata.splice(n, 1);
               initTable(zeitdata);
            });
         });
         $('#' + id + ' .mitarbeiter').css('width', '85%');
         $('#' + id + ' .bereich').css('width', '98%');
         $('#' + id + ' .erledigungszeit').css('width', '95%');
         $('#' + id + ' .ruestzeit').css('width', '95%');
         $('#' + id + ' .ui-selectmenu-button').css('height', '12px');
         $('#' + id + ' .ebtable #data td').css('padding', '5px 5px 5px 5px');

         if (myopts.readonly) {
            $('#' + id + ' input').prop('disabled', true);
            $('#' + id + ' img.ui-datepicker-trigger').hide();
         }
      };

      var renderer = {
         mitarbeiter: function (data, row, r) {
            var disabled = myopts.readonly;
            return '<input class="mitarbeiter" type="text" \n\
                     id="' + id + 'mitarbeitercode-' + r + '" \n\
                     value="' + (data.name || '') + '"\
                     disabled >'
                    + (disabled ? '' : '&nbsp;<i id="icdsearch-' + r + '" class="fa fa-search fa-lg"></i>');
         },
         bereich: function (data, row, r) {
            return '<div class="bereich" id="' + id + 'bereich' + r + '">' + data + '</div>';
         },
         erledigungszeit: function (data) {
            return '<input class="erledigungszeit" type="text" placeholder="HH:MM" value="' + data + '">';
         },
         ruestzeit: function (data) {
            return '<input class="ruestzeit"  type="text" placeholder="HH:MM" value="' + data + '">';
         },
         trash: function (data, row, r) {
            return r === 0 || myopts.readonly || myopts.type === 'A' ? '<span class="trash">&nbsp;</span>' : '&nbsp;<i id="' + id + 'icdtrash-' + r + '" class="fa fa-trash-o fa-lg trash"></i>';
         }
      };

      var tblopts = {
         flags: {filter: false, pagelenctrl: false, config: false, withsorting: false, clearFilter: false, colsResizable: false, jqueryuiTooltips: false, ctrls: false},
         columns: [
            {name: 'zeitentry', invisible: true},
            {name: "Mitarbeiter", render: renderer.mitarbeiter},
            {name: "Bereich", render: renderer.bereich},
            {name: "Erledigungszeit", render: renderer.erledigungszeit},
            {name: "Rüstzeit", invisible: myopts.type==='A', render: renderer.ruestzeit},
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
              <div id="bearbeitungszeit<%=id%>grid"></div>\n\
            </div>\n')({title: myopts.title, id: id, addBtn: addBtn});
         a.html(s);
         initTable(zeitdata);
      })(this);

      afterRedraw();
   };
})(jQuery);