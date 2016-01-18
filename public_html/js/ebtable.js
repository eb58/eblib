/* global _ */
(function ($) {
   "use strict";
   $.fn.ebtable = function (opts, data) {
      var localStorageKey = 'ebtable-' + $(document).prop('title').replace(' ', '');
      var util = {
         indexOfCol: function indexOfCol(colname) {
            for (var c = 0; c < myopts.columns.length; c++)
               if (myopts.columns[c].name === colname)
                  return c;
            return -1;
         },
         colIsInvisible: function colIsInvisible(colname) {
            return myopts.columns[util.indexOfCol(colname)].invisible;
         },
         colIsTechnical: function colIsTechnical(colname) {
            return myopts.columns[util.indexOfCol(colname)].technical;
         },
         saveState: function saveState() {
            localStorage[localStorageKey] = JSON.stringify({rowsPerPage: myopts.rowsPerPage, colorder: myopts.colorder, invisible: _.pluck(myopts.columns, 'invisible')});
         },
         loadState: function loadState() {
            var state = localStorage[localStorageKey] ? $.parseJSON(localStorage[localStorageKey]) : {};
            _.each(state.invisible, function (o, idx) {
               opts.columns[idx].invisible = !!o;
            });
            return state;
         },
         checkConfig: function checkConfig() {
            $.each(myopts.columns, function (idx, coldef) { // set reasonable defaults for coldefs
               coldef.technical = coldef.technical || false;
               coldef.invisible = coldef.invisible || false;
               coldef.order = coldef.order || 'asc';
            });

            if (origData[0] && origData[0].length !== myopts.columns.length) {
               alert('Data definition and column definition don\'t match!');
               localStorage[localStorageKey] = '';
               myopts = $.extend({}, defopts, opts);
            }
            $.each(myopts.columns, function (idx, coldef) {
               if (coldef.technical && !coldef.invisible)
                  alert(coldef.name + ": technical column must be invisble!");
            });
         },
         getVisibleCols: function getVisibleCols() {
            var res = [];
            for (var i = 0; i < myopts.columns.length; i++) {
               if (!myopts.columns[i].invisible)
                  res.push(i);
            }
            return res;
         }
      };
// ##############################################################################
      var defopts = {
         columns: []
         , bodyheight: Math.max(200, $(window).height() - 100)
         , rowsPerPageSelectValues: [10, 25, 50, 100]
         , rowsPerPage: 10
         , colorder: _.range(opts.columns.length) // [0,1,2,... ]
         , selection: false
         , saveState: util.saveState
         , loadState: util.loadState
         , sortmaster: [] //[{col:1,order:asc,format:fct1},{col:2,order:asc-fix}]
         , groupingCols: {} //{groupid:1,groupsort:0,grouphead:'GA'}
         , groups: []
      };
      var myopts = $.extend({}, defopts, opts, defopts.loadState());
      var origData = mx(data);
      var tblData = mx($.extend([], origData)).initGroups(myopts);
      var pageCur = 0;
      var pageCurMax = Math.floor((tblData.length - 1) / myopts.rowsPerPage);

      function configBtn() {
         var list = _.reduce(myopts.colorder, function (res, idx) {
            var t = '<li id="<%=name%>" class="ui-widget-content <%=cls%>"><%=name%></li>';
            var col = myopts.columns[idx];
            var cls = col.invisible ? 'invisible' : 'visible';
            return res + (col.technical ? '' : _.template(t)({name: col.name, cls: cls}));
         }, '');
         var t = '<button id="configBtn">Anpassen</button>\n\
               <div id="configDlg">\n\
                  <ol id="selectable"><%=list%></ol>\n\
               </div>';
         return _.template(t)({list: list});
      }

      function tableHead() {
         var res = myopts.selection ? '<th></th>' : '';
         for (var c = 0; c < myopts.columns.length; c++) {
            var col = myopts.columns[myopts.colorder[c]];
            if (!col.invisible) {
               var t = '\
                  <th id="<%=colname%>">\
                     <div class="sort_wrapper">\
                        <span class="ui-icon ui-icon-triangle-2-n-s"/><%=colname%>\
                     </div>\
                     <input type="text" id="<%=colname%>" />\
                  </th>';
               res += _.template(t)({colname: col.name});
            }
         }
         return res;
      }

      function tableData(pageNr) {
         if (origData[0] && origData[0].length !== myopts.columns.length) {
            return '';
         }

         var res = '';
         var startRow = myopts.rowsPerPage * pageNr;
         var order = myopts.colorder;
         for (var r = startRow; r < Math.min(startRow + myopts.rowsPerPage, tblData.length); r++) {
            var gc = myopts.groupingCols;
            var row = tblData[r];
            if (gc && row.isGroupElement && !myopts.groups[tblData[r][gc.groupid]].isOpen)
               continue
            var cls = row.isGroupElement ? ' class="group" ' : '';
            cls = row.isGroupHeader ? ' class="groupheader" ' : cls;
            res += '<tr>';
            if (myopts.selection) {
               var checked = !!tblData[r].selected ? ' checked="checked" ' : ' ';
               res += '\
                  <td' + cls + '>\
                     <input type="checkbox" class="checkRow"' + checked + 'id="check' + r + '"/>\
                  </td>';
            }
            for (var c = 0; c < myopts.columns.length; c++) {
               if (!myopts.columns[order[c]].invisible) {
                  var val = tblData[r][order[c]] || '';
                  var render = myopts.columns[order[c]].render;
                  val = render ? render(val, row) : val;
                  res += '<td' + cls + '>' + val + '</td>';
               }
            }
            res += '</tr>\n';
         }
         return res;
      }

      function selectLenCtrl() {
         var options = '';
         $.each(myopts.rowsPerPageSelectValues, function (idx, o) {
            var selected = o === myopts.rowsPerPage ? 'selected' : '';
            options += '<option value="' + o + '" ' + selected + '>' + o + '</option>\n';
         });
         return '<select id="lenctrl">\n' + options + '</select>\n';
      }

      function pageBrowseCtrl() {
         return '\
            <button class="firstBtn"><span class="ui-icon ui-icon-seek-first"></button>\n\
            <button class="backBtn"><span  class="ui-icon ui-icon-seek-prev" ></button>\n\
            <button class="nextBtn"><span  class="ui-icon ui-icon-seek-next" ></button>\n\
            <button class="lastBtn"><span  class="ui-icon ui-icon-seek-end"  ></button>';
      }

      function infoCtrl() {
         var startRow = Math.min(myopts.rowsPerPage * pageCur + 1, tblData.length);
         var endRow = Math.min(startRow + myopts.rowsPerPage - 1, tblData.length);
         var filtered = origData.length === tblData.length ? '' : ' (gefiltert von ' + origData.length + ' Einträgen)';
         var templ = _.template("<%=start%> bis <%=end%> von <%=count%> Einträgen <%= filtered %>");
         var label = templ({start: startRow, end: endRow, count: tblData.length, filtered: filtered});
         //return '<button id="info">' + label + '</button>';
         return label;
      }

      function selectRows(event) { // select row
         var rowNr = event.target.id.replace('check', '');
         var row = tblData[rowNr];
         row.selected = $(event.target).prop('checked');
         console.log('change !', event.target.id, rowNr, row, row.selected);
         // Grouping
         var gc = myopts.groupingCols;
         if (gc && row[gc.groupid] && row[gc.groupsort] === gc.grouphead) {
            var groupId = row[gc.groupid];
            console.log('Group', row[gc.groupid], row[gc.groupsort]);
            for (var i = 0; i < tblData.length; i++) {
               if (tblData[i][gc.groupid] === groupId) {
                  tblData[i].selected = row.selected;
                  $('#check' + i).prop('checked', row.selected);
               }
            }
         }
      }

      function sorting(event) { // sorting
         var sortToggle = {'desc': 'asc', 'asc': 'desc', 'desc-fix': 'desc-fix', 'asc-fix': 'asc-fix'};
         console.log('sorting', event.currentTarget.id);
         if (event.currentTarget.id) {
            var idx = util.indexOfCol(event.currentTarget.id);
            var col = myopts.columns[idx];
            var coldefs = $.extend([], myopts.sortmaster);
            coldefs.push({col: idx, format: col.format, order: col.order});
            $.each(coldefs, function (idx, o) {
               var c = myopts.columns[o.col];
               o.order = c.order || 'desc';
               c.order = c.order ? sortToggle[c.order] : 'asc';
            });
            tblData = tblData.sort(tblData.rowCmpCols(coldefs));
            var cls1 = col.order === 'asc' ? 'ui-icon-triangle-1-s' : 'ui-icon-triangle-1-n';
            $('thead div span').removeClass('ui-icon-triangle-1-n').removeClass('ui-icon-triangle-1-s').addClass('ui-icon-triangle-2-n-s');
            $('thead #' + event.currentTarget.id + ' div span').removeClass('ui-icon-triangle-2-n-s').addClass(cls1);
            pageCur = 0;
            redraw(pageCur);
         }
      }

      function filtering(event) { // filtering
         console.log('filtering', event);
         filterData();
         pageCur = 0;
         redraw(pageCur);
      }

      function ignoreSorting(event) {
         event.target.focus();
         return false; // ignore - sorting
      }

// ##############################################################################

      var adjustxxx = function () {
         var scrollbarWidth = function () {
            var div = $('<div style="width:50px;height:50px;overflow:hidden;position:absolute;top:-200px;left:-200px;"><div style="height:100px;"></div></div>');
            $('body').append(div);
            var w1 = $('div', div).innerWidth();
            div.css('overflow-y', 'auto');
            var w2 = $('div', div).innerWidth();
            $(div).remove();
            return w1 - w2;
         }();

         function wdths() {
            var wh = $("#head").width();
            var wd = $("#data").width();
            var wb = $('body').width();
            var ww = $(window).width();
            var wm = Math.floor(Math.max(wh, wd));
            console.log('Width tables', 'head:', wh, 'data:', wd, 'body', wb, 'win', ww, 'max:', wm, 'sbwidth:', scrollbarWidth);
            return {wh: wh, wd: wd, wb: wb, ww: ww, wm: wm};
         }

         function adjustWidth(n) {
            if (n > 5)
               return;
            if (n === 0) {
               $('#head,#data').css('width', '');
            }
            var ws = wdths();
            if (Math.abs(ws.wh - ws.wd) > 0) {
               $('#head,#data').width(ws.wm + 10);
               $('#divdata').width(ws.wm + 10 + scrollbarWidth);
               adjustWidth(n + 1);
            }
         }

         function adjustColumns(n) {
            if (n > 20)
               return;

            adjustWidth(0);
            if (n === 0) {
               $('#head th, #data td').css('width', '');
            }
            $('#head th').each(function (i) {
               var w1 = $('#head th:nth-child(' + (i + 1) + ')').width();
               var w2 = $('#data td:nth-child(' + (i + 1) + ')').width();
               if (Math.abs(w1 - w2) > 0) {
                  var w = Math.max(w1, w2);
                  //console.log('Spalte', i + 1, 'head:', w1, 'data:', w2, 'max:', w);
                  $('#head th:nth-child(' + (i + 1) + ')').width(w);
                  $('#data td:nth-child(' + (i + 1) + ')').width(w);
               }
            });
            $('#head th').each(function (i) {
               var w1 = $('#head th:nth-child(' + (i + 1) + ')').width();
               var w2 = $('#data td:nth-child(' + (i + 1) + ')').width();
               if (Math.abs(w1 - w2) > 0) {
                  var w = Math.max(w1, w2);
                  //console.log('Spalte', i + 1, 'head:', w1, 'data:', w2, 'max:', w);
                  $('#head th:nth-child(' + (i + 1) + ')').width(w);
                  $('#data td:nth-child(' + (i + 1) + ')').width(w);
               }
            });
            $('#head th').each(function (i) {
               var w1 = $('#head th:nth-child(' + (i + 1) + ')').width();
               var w2 = $('#data td:nth-child(' + (i + 1) + ')').width();
               if (Math.abs(w1 - w2) > 2) {
                  console.log('Aua !!!', n, 'Spalte', i + 1, 'whead:', w1, 'wdata:', w2);
                  var ws = wdths();
                  $('#head,#data').width(ws.wm + 10);
                  $('#divdata').width(ws.wm + scrollbarWidth + 10);
                  return adjustColumns(n + 1);
               }
            });
         }
         return {
            adjustColumns: adjustColumns
         };
      }();

      function adjust() {
         $('#data').prepend($('#head tr'))
         var wtable = $('#data').width();
         var wcells = $('#data tr:first td').map(function (i, o) {
            return $(o).width();
         });
         console.log('wtable:', wtable, 'wcells', wcells);
         $('#head').append($('#data tr:first'));
         $('#head,#data').width(wtable);
         $('#head td').each(function (i, o) {
            $(o).width(wcells[i]);
         });
         $('#data tr:first td').each(function (i, o) {
            $(o).width(wcells[i]);
         });
      }

      function adjustX() {
//         $('#head, #data').css('width', '');
//         $('#head th, #data td').css('width', '');
         $('#data').prepend($('#head tr'));
         var wtable = $('#data').width();
         var wcells = $('#data td').map(function (i, o) {
            return $(o).width();
         });
         console.log('wtable:', wtable, 'wcells', wcells);
//         $('#head').append($('#data tr:first'));
//         $('#head,#data').width(wtable);
//         $('#head th').each(function (i, o) {
//            $(o).width(wcells[i]);
//         });
//         $('#data tr:first td').each(function (i, o) {
//            $(o).width(wcells[i]);
//         });
      }

      function adjustLayout() {
         console.log('>>>adjustLayout window-width=', $(window).width(), 'body-width:', $('body').width());

         //adjust();
         $('#head,#data').width(Math.floor($(window).width() - 30));
         $('#divdata').width($('#data').width() + 14);
         $('#ctrlPage1').css('position', 'absolute').css('right', "5px");
         $('#ctrlPage2').css('position', 'absolute').css('right', "5px");
      }

      function filterData() {
         var filters = [];
         $('thead th input[type=text]').each(function (idx, o) {
            if ($(o).val()) {
               var colname = $(o).attr('id');
               var col = util.indexOfCol(colname);
               var render = myopts.columns[col].render;
               filters.push({col: col, searchtext: $(o).val(), render: render});
            }
         });
         tblData = mx(origData.filterGroups(myopts));
         tblData = filters.length === 0 ? tblData : mx(tblData.filterData(filters, myopts));
      }

      function redraw(pageCur, withHeader) {
         $('#ctrlInfo').html(infoCtrl());
         $('#data tbody').html(tableData(pageCur));
         $('#data input[type=checkbox]').on('change', selectRows);
         if (withHeader) {
            $('thead tr').html(tableHead());
            $('thead th:gt(0)').on('click', sorting);
            $('thead input[type=text]').on('keyup', filtering).on('click', ignoreSorting);
         }
         adjustLayout();
      }

      // ##############################################################################

      function initGrid(a) {
         util.checkConfig();
         filterData();
         var tableTemplate = _.template(
            "<div class='ebtable'>\n\
                  <table>\n\
                     <th id='ctrlLength'><%= selectLen  %></th>\n\
                     <th id='ctrlConfig'><%= configBtn  %></th>\n\
                     <th id='ctrlPage1' ><%= browseBtns %></th>\n\
                  </table>\n\
                  <div id='divdata' max-height:<%= bodyheight %>px;'>\n\
                     <table id='data'>\n\
                        <thead><tr><%= head %></tr></thead>\n\
                        <tbody><%= data %></tbody>\n\
                     </table>\n\
                  </div>\n\
                  <table>\n\
                     <th class='ui-widget-content' id='ctrlInfo'><%= infoCtrl %></th>\n\
                     <th id='ctrlPage2'><%= browseBtns %></th>\n\
                  </table>\n\
               </div>"
            );
         var tableTemplateXXX = _.template(
            "<div class='ebtable'>\n\
                  <table>\n\
                     <th id='ctrlLength'><%= selectLen  %></th>\n\
                     <th id='ctrlConfig'><%= configBtn  %></th>\n\
                     <th id='ctrlPage1' ><%= browseBtns %></th>\n\
                  </table>\n\
                  <div id='divall' style='overflow-x:auto'>\n\
                     <div>\n\
                        <table id='head' >\n\
                           <thead><tr><%= head %></tr></thead>\n\
                        </table>\n\
                     </div>\n\
                     <div id='divdata' style='overflow-y:auto;overflow-x:hidden;max-height:<%= bodyheight %>px;'>\n\
                        <table id='data'>\n\
                           <tbody><%= data %></tbody>\n\
                        </table>\n\
                     </div>\n\
                  </div>\n\
                  <table>\n\
                     <th class='ui-widget-content' id='ctrlInfo'><%= infoCtrl %></th>\n\
                     <th id='ctrlPage2'><%= browseBtns %></th>\n\
                  </table>\n\
               </div>"
            );
         a.html(tableTemplate({
            head: tableHead(),
            data: tableData(pageCur),
            selectLen: selectLenCtrl(),
            configBtn: configBtn(),
            browseBtns: pageBrowseCtrl(),
            infoCtrl: infoCtrl(),
            bodyheight: myopts.bodyheight
         }));
         adjustLayout();
      }

      initGrid(this);

      // #################################################################
      // Actions
      // #################################################################

      $('#lenctrl').css('width', '60px')
         .selectmenu({change: function (event, data) {
               console.log('change rowsPerPage', event, data.item.value);
               myopts.rowsPerPage = Number(data.item.value);
               pageCurMax = Math.floor((tblData.length - 1) / myopts.rowsPerPage);
               pageCur = 0;
               redraw(pageCur);
               myopts.saveState();
            }
         });
      $('#configBtn').button().on('click', function () {
         $("#selectable").sortable();
         $("#configDlg").dialog("open");
         $("#configDlg li").off('click').on("click", function (event) {
            var col = myopts.columns[util.indexOfCol(event.target.id)];
            col.invisible = !col.invisible;
            $('#configDlg [id="' + event.target.id + '"]').toggleClass('invisible').toggleClass('visible');
            console.log('change visibility', event.target.id, 'now visible:', !col.invisible);
         });
      });
      $("#configDlg").dialog({
         create: function (event, ui) {
            $(".ui-widget-header").hide();
         },
         position: {my: "left top", at: "left bottom", of: '#configBtn'},
         autoOpen: false,
         height: myopts.columns.length * 26 + 30,
         width: 100,
         modal: true,
         resizable: true,
         buttons: {
            "OK": function () {
               var colnames = [];
               $('#configDlg li').each(function (idx, o) {
                  colnames.push($(o).prop('id'));
               });
               myopts.colorder = _.map(myopts.columns, function (col, idx) {
                  return col.technical ? idx : util.indexOfCol(colnames.shift());
               });
               myopts.saveState();
               redraw(pageCur, true);
               $(this).dialog("close");
            }
            , 'Abbrechen': function () {
               $(this).dialog("close");
            }
         }
      });
      $('.firstBtn').button().on('click', function () {
         pageCur = 0;
         redraw(pageCur);
      });
      $('.backBtn').button().on('click', function () {
         pageCur = Math.max(0, pageCur - 1);
         redraw(pageCur);
      });
      $('.nextBtn').button().on('click', function () {
         pageCur = Math.min(pageCur + 1, pageCurMax);
         redraw(pageCur);
      });
      $('.lastBtn').button().on('click', function () {
         pageCur = pageCurMax;
         redraw(pageCur);
      });
      $('thead th:gt(0)').on('click', sorting);
      $('thead input[type=text]').on('keyup', filtering).on('click', ignoreSorting);
      $('#data input[type=checkbox]').on('change', selectRows);
      $('#info').button();

      var inResize = false;
      $(window).on('resize', function () {
         console.log('resize!!!', inResize);
         adjustLayout(0);
      });

// ##########  Exports ############           
      this.toggleGroupIsOpen = function (groupName) {
         myopts.groups[groupName].isOpen = !myopts.groups[groupName].isOpen;
         filterData();
         redraw(pageCur);
      };
      this.groupIsOpen = function (groupName) {
         return _.property('isOpen')(myopts.groups[groupName]);
      };
      return this;
   };
})(jQuery);