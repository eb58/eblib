/* global _ */
(function ($) {
   "use strict";
   $.fn.ebtable = function (opts, data) {
      var localStorageKey = 'ebtable-' + $(document).prop('title').replace(' ', '');
      var util = {
         indexOfCol: function indexOfCol(colname) {
            return _.findIndex(myopts.columns, function (o) {
               return o.name === colname;
            });
         },
         colIsInvisible: function colIsInvisible(colname) {
            return myopts.columns[util.indexOfCol(colname)].invisible;
         },
         colIsTechnical: function colIsTechnical(colname) {
            return myopts.columns[util.indexOfCol(colname)].technical;
         },
         getVisibleCols: function getVisibleCols() {
            return _.filter(myopts.columns, function (o) {
               return !o.invisible;
            });
         },
         // saving/loading state
         saveState: function saveState() {
            localStorage[localStorageKey] = JSON.stringify({
               rowsPerPage: myopts.rowsPerPage,
               colorder: myopts.colorder,
               invisible: _.pluck(myopts.columns, 'invisible')
            });
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
            if (localStorage[localStorageKey] && $.parseJSON(localStorage[localStorageKey])['colorder'].length !== myopts.columns.length) {
               alert('Column definition and LocalStorage don\'t match!');
               localStorage[localStorageKey] = '';
               myopts = $.extend({}, defopts, opts);
            }
            $.each(myopts.columns, function (idx, coldef) {
               if (coldef.technical && !coldef.invisible)
                  alert(coldef.name + ": technical column must be invisble!");
            });
         }
      };
// ##############################################################################

      var defopts = {
         columns: [],
         bodyHeight: Math.max(200, $(window).height() - 100),
         bodyWidth: Math.max(200, $(window).width() - 10),
         rowsPerPageSelectValues: [10, 25, 50, 100],
         rowsPerPage: 10,
         colorder: _.range(opts.columns.length), // [0,1,2,... ]
         selection: false,
         saveState: util.saveState,
         loadState: util.loadState,
         sortmaster: [], //[{col:1,order:asc,sortformat:fct1},{col:2,order:asc-fix}]
         groupdefs: {} // {grouplabel: 0, groupcnt: 1, groupid: 2, groupsortstring: 3, groupname: 4, grouphead: 'GA', groupelem: 'GB'},
      };
      var myopts = $.extend({}, defopts, opts, defopts.loadState());
      var origData = mx(data, myopts.groupdefs);
      var tblData = mx(origData.slice());
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
                     <input type="text" id="<%=colname%>" title="<%=tooltip%>"/>\
                  </th>';
               res += _.template(t)({colname: col.name, tooltip: col.tooltip});
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
         var gc = myopts.groupdefs;
         for (var r = startRow; r < Math.min(startRow + myopts.rowsPerPage, tblData.length); r++) {
            var row = tblData[r];

            if (gc && row.isGroupElement && !origData.groups[tblData[r][gc.groupid]].isOpen)
               continue

            var cls = row.isGroupElement ? 'group' : '';
            cls = row.isGroupHeader ? 'groupheader' : cls;
            res += '<tr>';

            var checked = !!tblData[r].selected ? ' checked="checked" ' : ' ';
            if (myopts.selection && myopts.selection.render) {
               var x = '<td class="' + cls + '">' + myopts.selection.render(origData, row, checked) + '</td>';
               res += x.replace('input type', 'input id="check' + r + '"' + checked + ' type');
            } else if (myopts.selection) {
               res += '<td class="' + cls + '"><input id="check' + r + '" type="checkbox"' + checked + '/></td>';
            }

            var order = myopts.colorder;
            for (var c = 0; c < myopts.columns.length; c++) {
               if (!myopts.columns[order[c]].invisible) {
                  var val = tblData[r][order[c]] || '';
                  var render = myopts.columns[order[c]].render;
                  val = render ? render(val, row) : val;
                  res += '<td class="' + cls + '">' + val + '</td>';
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
         if (row) {
            row.selected = $(event.target).prop('checked');
            console.log('change !', event.target.id, rowNr, row, row.selected);
            // Grouping
            var gc = myopts.groupdefs;
            if (gc && row[gc.groupid] && row[gc.grouplabel] === gc.grouphead) {
               var groupId = row[gc.groupid];
               console.log('Group', row[gc.groupid], row[gc.grouplabel]);
               for (var i = 0; i < tblData.length; i++) {
                  if (tblData[i][gc.groupid] === groupId) {
                     tblData[i].selected = row.selected;
                     $('#check' + i).prop('checked', row.selected);
                  }
               }
            }
         }
      }

      function sorting(event) { // sorting
         var sortToggle = {'desc': 'asc', 'asc': 'desc', 'desc-fix': 'desc-fix', 'asc-fix': 'asc-fix'};
         var colname = event.currentTarget.id;
         if (colname) {
            console.log('sorting', myopts.sortcolname);
            myopts.sortcolname = colname;
            var colidx = util.indexOfCol(myopts.sortcolname);
            var coldef = myopts.columns[colidx];
            var coldefs = $.extend([], coldef.sortmaster ? coldef.sortmaster : myopts.sortmaster);
            coldefs.push({col: colidx, sortformat: coldef.sortformat, order: coldef.order});
            $.each(coldefs, function (idx, o) {
               var c = myopts.columns[o.col];
               o.order = c.order || 'desc';
               c.order = c.order ? sortToggle[c.order] : 'asc';
            });
            var cls1 = coldef.order === 'asc' ? 'ui-icon-triangle-1-s' : 'ui-icon-triangle-1-n';
            $('thead div span').removeClass('ui-icon-triangle-1-n').removeClass('ui-icon-triangle-1-s').addClass('ui-icon-triangle-2-n-s');
            $('thead #' + myopts.sortcolname + ' div span').removeClass('ui-icon-triangle-2-n-s').addClass(cls1);
            doSort();
         }
      }

      function doSort() { // sorting
         if (myopts.sortcolname) {
            var colidx = util.indexOfCol(myopts.sortcolname);
            var coldef = myopts.columns[colidx];
            var coldefs = $.extend([], coldef.sortmaster ? coldef.sortmaster : myopts.sortmaster);
            coldefs.push({col: colidx, sortformat: coldef.sortformat, order: coldef.order});
            tblData = tblData.sort(tblData.rowCmpCols(coldefs, origData.groups));
            pageCur = 0;
            redraw(pageCur);
         }
      }

      function filtering(event) { // filtering
         console.log('filtering', event);
         if (event.which === 13 && myopts.reloadData) {
            myopts.reloadData();
         } else {
            filterData();
         }
         pageCur = 0;
         redraw(pageCur);
      }

      function ignoreSorting(event) {
         event.target.focus();
         return false; // ignore - sorting
      }

// ##############################################################################

      function adjustLayout() {
         console.log('>>>adjustLayout window-width=', $(window).width(), 'body-width:', $('body').width());

         //adjust();
         //$('#head,#data').width(Math.floor($(window).width() - 30));
         //$('#divdata').width($('#data').width() + 14);
         $('#ctrlPage1').css('position', 'absolute').css('right', "5px");
         $('#ctrlPage2').css('position', 'absolute').css('right', "5px");
      }

// ##############################################################################

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
         tblData = mx(origData.filterGroups(myopts.groupdefs, origData.groups));
         tblData = mx(filters.length === 0 ? tblData : tblData.filterData(filters));
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
         doSort();
         var tableTemplate = _.template(
            "<div class='ebtable'>\n\
                  <table>\n\
                     <th id='ctrlLength'><%= selectLen  %></th>\n\
                     <th id='ctrlConfig'><%= configBtn  %></th>\n\
                     <th id='ctrlPage1' ><%= browseBtns %></th>\n\
                  </table>\n\
                  <div id='divdata' style='overflow:auto; max-height:<%= bodyHeight %>px;'>\n\
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

         a.html(tableTemplate({
            head: tableHead(),
            data: tableData(pageCur),
            selectLen: selectLenCtrl(),
            configBtn: configBtn(),
            browseBtns: pageBrowseCtrl(),
            infoCtrl: infoCtrl(),
            bodyHeight: myopts.bodyHeight
         }));
         adjustLayout();
      }

      initGrid(this);

      // #################################################################
      // Actions
      // #################################################################

      $('#lenctrl').css('width', '70px')
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
         height: myopts.columns.length * 20 + 10,
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

      $(window).on('resize', function () {
         console.log('resize!!!');
         adjustLayout(0);
      });

// ##########  Exports ############  
      $.extend(this, {
         toggleGroupIsOpen: function (groupid) {
            origData.groups[groupid].isOpen = !origData.groups[groupid].isOpen;
            filterData();
            doSort();
            pageCurMax = Math.floor((tblData.length - 1) / myopts.rowsPerPage);
            redraw(0);
            redraw(pageCur);
         },
         groupIsOpen: function (groupName) {
            return _.property('isOpen')(origData.groups[groupName]);
         },
         getFilterValues: function getFilterValues() {
            var filter = {};
            $('thead th input[type="text"').each(function (idx, elem) {
               var val = $(elem).val().trim();
               if (val) {
                  filter[elem.id] = val;
               }
            });
            return filter;
         },
         setFilterValues: function setFilterValues(filter) {
            $('thead th input[type="text"').each(function (i, o) {
               $('#' + o.id + ' input').val(filter[o.id]);
            });
            return this;
         }
      });
      return this.tooltip();
   };

   $.fn.ebtable.sortformats = {
      'date-de': function (a) { // '01.01.2013' -->   '20130101' 
         var d = a.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
         return d ? (d[3] + d[2] + d[1]) : '';
      },
      'datetime-de': function (a) { // '01.01.2013 12:36'  -->  '201301011236' 
         var d = a.match(/^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2}):(\d{2})$/);
         return d ? (d[3] + d[2] + d[1] + d[4] + d[5]) : '';
      },
      'scientific': function (a) { // '1e+3'  -->  '1000' 
         return parseFloat(a);
      }
   };


})(jQuery);