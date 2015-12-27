/* global _ */
"use strict";
$.fn.ebtable = function (opts, data) {
   var defopts = {
      bodyheight: Math.max(200, $(window).height() - 10)
      , rowsPerPageSelectValues: [10, 25, 50, 100]
      , rowsPerPage: 10
      , colorder: _.range(opts.columns.length) // [0,1,2,... ]
      , saveState: saveState
      , loadState: loadState
      , sortmaster: [] //[{col:1,order:asc,format:fct1},{col:2,order:asc-fix}]
      , groupingCols: null //{groupid:1,groupsort:0,grouphead:'GA'}
      , groups: []
   };
   var myopts = $.extend({}, defopts, opts, defopts.loadState());

   var title = $(document).prop('title').replace(' ', '');
   var localStorageKey = 'ebtable-' + title;
   var origData = mx(data);
   var tblData = mx($.extend([], origData));
   var pageCur = 0;
   var maxPageCur = Math.floor(tblData.length / myopts.rowsPerPage);

   if (origData[0] && origData[0].length !== myopts.columns.length) {
      alert('Data definition and column definition don\'t match!');
      localStorage[localStorageKey] = '';
      delete opts.colorder;
      myopts = $.extend({}, defopts, opts);
   }

// ##############################################################################

   function clip(v, a, b) {
      return Math.min(Math.max(a, v), b);
   }

   function saveState() {
      localStorage[localStorageKey] = JSON.stringify({rowsPerPage: myopts.rowsPerPage, colorder: myopts.colorder});
   }

   function loadState() {
      return localStorage[localStorageKey] ? $.parseJSON(localStorage[localStorageKey]) : {};
   }

   function preprocessData() {
      var gc = myopts.groupingCols;
      for (var r = 0; gc && r < tblData.length; r++) {
         var groupName = tblData[r][gc.groupid];
         tblData[r].isGroupHeader = tblData[r][gc.groupsort] === gc.grouphead;
         tblData[r].isGroupElement = !!groupName && !tblData[r].isGroupHeader;
         if (!!groupName)
            myopts.groups[groupName] = {isOpen: false};
      }
   }

   function selectRows(event) { // select row
      var rowNr = event.target.id.replace('check', '');
      tblData[rowNr].selected = $(event.target).prop('checked');
      console.log('change !', event.target.id, rowNr, tblData[rowNr], tblData[rowNr].selected);
      // Grouping
      var gc = myopts.groupingCols;
      if (gc && tblData[rowNr][gc.groupid] && tblData[rowNr][gc.groupsort] === gc.grouphead) {
         var groupId = tblData[rowNr][gc.groupid];
         var groupSort = tblData[rowNr][gc.groupsort];
         console.log('Group', groupId, groupSort);
         for (var i = 0; i < tblData.length; i++) {
            if (tblData[i][gc.groupid] === groupId) {
               tblData[i].selected = tblData[rowNr].selected;
               $('#check' + i).prop('checked', tblData[rowNr].selected);
            }
         }
      }
   }

   function tableHead() {
      var res = myopts.selection ? '<th></th>' : '';
      for (var c = 0; c < myopts.columns.length; c++) {
         var col = myopts.columns[myopts.colorder[c]];
         if (!col.invisible) {
            var t = '<th id="<%=colname%>">\n\
                        <div class="sort_wrapper">\n\
                           <span class="ui-icon ui-icon-triangle-2-n-s"/><%=colname%>\n\
                        </div>\n\
                        <input type="text" id="<%=colname%>" />\n\
                     </th>';
            res += _.template(t)({colname: col.name});
         }
      }
      return res;
   }

   function tableData(pageNr) {
      if (origData[0] && origData[0].length !== myopts.columns.length) {
         //alert('data and column definition don\'t match!');
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
         var cls = tblData[r].isGroupElement ? ' class="group" ' : '';
         cls = tblData[r].isGroupHeader ? ' class="groupheader" ' : cls;
         res += '<tr>';
         if (myopts.selection) {
            var checked = !!tblData[r].selected ? ' checked="checked" ' : ' ';
            res += '<td' + cls + '>\n\
                      <input type="checkbox" class="checkRow"' + checked + 'id="check' + r + '"/>\n\
                    </td>';
         }
         for (var c = 0; c < myopts.columns.length; c++) {
            if (!myopts.columns[order[c]].invisible) {
               var row = tblData[r];
               var val = tblData[r][order[c]];
               var render = myopts.columns[order[c]].render;
               val = render ? render(val, row) : val;
               res += '<td' + cls + '>' + val + '</td>';
            }
         }
         res += '</tr>\n';
      }
      return res;
   }

   function indexOfCol(colname) {
      for (var c = 0; c < myopts.columns.length; c++)
         if (myopts.columns[c].name === colname)
            return c;
      return -1;
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
      return '<button class="firstBtn"><span class="ui-icon ui-icon-seek-first"></button>\n\
              <button class="backBtn"><span  class="ui-icon ui-icon-seek-prev" ></button>\n\
              <button class="nextBtn"><span  class="ui-icon ui-icon-seek-next" ></button>\n\
              <button class="lastBtn"><span  class="ui-icon ui-icon-seek-end"  ></button>';
   }

   function infoCtrl() {
      var startRow = myopts.rowsPerPage * pageCur + 1;
      var endRow = Math.min(startRow + myopts.rowsPerPage - 1, tblData.length);
      var filtered = origData.length === tblData.length ? '' : ' (gefiltert von ' + origData.length + ' Einträgen)';
      var templ = _.template("<%=start%> bis <%=end%> von <%=count%> Einträgen <%= filtered %>");
      var label = templ({start: startRow, end: endRow, count: tblData.length, filtered: filtered});
      return '<button id="info">' + label + '</button>';
      //return label;
   }

   function getFilters() {
      var filters = [];
      $('#head input[type=text]').each(function (idx, o) {
         if ($(o).val()) {
            var col = indexOfCol($(o).attr('id'));
            filters.push({col: col, searchtext: $(o).val()});
         }
      });
      return filters;

   }
   function filterData() {
      var filters = getFilters();
      tblData = filters.length === 0 ? origData : origData.filterData(filters);
   }

// ##############################################################################
   function adjustColumns() {
      if (myopts.selection) {
         $('#head th:first').width(20);
         $('#data td:first').width(20);
      }
      for (var i = (myopts.selection ? 2 : 1); i <= opts.columns.length + (myopts.selection ? 1 : 0); i++) {
         var w1 = $('#head th:nth-child(' + i + ')').innerWidth();
         var w2 = $('#data td:nth-child(' + i + ')').innerWidth();
         var w = Math.max(w1, w2);
         //console.log(i, 'head:', w1, 'data:', w2, 'max:', w);
         $('#head th:nth-child(' + i + ')').innerWidth(w);
         $('#data tr:first td:nth-child(' + i + ')').innerWidth(w);
      }
      for (var i = (myopts.selection ? 2 : 1); i <= opts.columns.length + (myopts.selection ? 1 : 0); i++) {
         var w1 = $('#head th:nth-child(' + i + ')').innerWidth();
         var w2 = $('#data td:nth-child(' + i + ')').innerWidth();
         if (w1 !== w2) {
            console.log('Aua!', i, 'head:', w1, 'data:', w2);
            //???$(document).width($(document).width() + 100);
            //adjustColumn();
         }
      }
   }

   function adjustTable() {
      console.log('>>>adjustTable window-width=', $(window).width());
      $('#divall').width($(window).width() - 25);
      $('#head').width($('#divall').width() - 20);
      $('#data').width($('#divall').width() - 20);
      $('th,td').removeAttr('width');
      adjustColumns();
      $('#ctrlPage1').css('position', 'absolute').css('top', 5);
      $('#ctrlPage1').css('position', 'absolute').css('right', $(document).width() - $('#data').width() - 10);
      $('#ctrlPage2').css('position', 'absolute').css('right', $(document).width() - $('#data').width() - 10);
   }

   function redraw(pageCur) {
      var newrows = tableData(pageCur);
      $('#data tbody').html(newrows);
      $('#ctrlInfo').html(infoCtrl());
      $(window).trigger('resize');
      $('#data input[type=checkbox]').on('change', selectRows);
   }

   // ##############################################################################

   var tableTemplate = _.template(
           "<div>\n\
               <div id='ctrlLength'><%= selectLen %></div>\n\
               <div id='ctrlPage1'><%= browseBtns %></div>\n\
               <div id='divall'>\n\
                  <div>\n\
                     <table id='head' >\n\
                        <thead><tr><%= head %></tr></thead>\n\
                     </table>\n\
                  </div>\n\
                  <div id='divdata' style='max-height:<%= bodyheight %>px;'>\n\
                     <table id='data'>\n\
                        <tbody><%= data %></tbody>\n\
                     </table>\n\
                  </div>\n\
               </div>\n\
               <div id='ctrlInfo'><%= info %></div>\n\
               <div id='ctrlPage2'><%= browseBtns %></div>\n\
            </div>"
           );

   preprocessData();
   this.html(tableTemplate({
      head: tableHead()
      , data: tableData(pageCur)
      , selectLen: selectLenCtrl()
      , browseBtns: pageBrowseCtrl()
      , info: infoCtrl()
      , bodyheight: myopts.bodyheight
   }));
   adjustTable();

   // #################################################################
   // Actions
   // #################################################################

   $('#lenctrl').css('width', '60px')
           .selectmenu({change: function (event, data) {
                 console.log('change rowsPerPage', event, data.item.value);
                 myopts.rowsPerPage = Number(data.item.value);
                 maxPageCur = Math.floor(tblData.length / myopts.rowsPerPage);
                 var startRow = myopts.rowsPerPage * pageCur + 1;
                 pageCur = Math.floor(startRow / myopts.rowsPerPage);

                 redraw(pageCur);
                 myopts.saveState();
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
      pageCur = clip(pageCur + 1, 0, maxPageCur);
      redraw(pageCur);
   });
   $('.lastBtn').button().on('click', function () {
      pageCur = Math.floor(tblData.length / myopts.rowsPerPage);
      redraw(pageCur);
   });

   $('#head th:gt(0)').on('click', function (event) { // sorting
      console.log('sorting', event.currentTarget.id);
      if (!event.currentTarget.id)
         return;
      var idx = indexOfCol(event.currentTarget.id);
      var col = myopts.columns[idx];
      var sm = (myopts.sortmaster && myopts.sortmaster[col] !== idx) ? myopts.sortmaster : [];
      var coldefs = $.extend([], sm);
      coldefs.push({col: idx, format: col.format, order: myopts.columns[idx].order});
      $.each(coldefs, function (idx, o) {
         o.order = myopts.columns[o.col].order || 'asc';
      });
      tblData = tblData.sort(tblData.rowCmpCols(coldefs));
      $.each(coldefs, function (idx, o) {
         var toggle = {'desc': 'asc', 'asc': 'desc', 'desc-fix': 'desc-fix', 'asc-fix': 'asc-fix'};
         myopts.columns[o.col].order = myopts.columns[o.col].order ? toggle[myopts.columns[o.col].order] : 'asc';
      });
      var cls1 = col.order === 'asc' ? 'ui-icon-triangle-1-s' : 'ui-icon-triangle-1-n';
      $('#head div span').removeClass('ui-icon-triangle-1-n').removeClass('ui-icon-triangle-1-s').addClass('ui-icon-triangle-2-n-s');
      $('#head #' + event.currentTarget.id + ' div span').removeClass('ui-icon-triangle-2-n-s').addClass(cls1);
      pageCur = 0;
      redraw(pageCur);
   });

   $('#head input[type=text]').on('keyup', function (event) { // filtering
      console.log('filtering', event);
      filterData();
      pageCur = 0;
      redraw(pageCur);
   }).on('click', function (event) {
      event.target.focus();
      return false; // ignore - sorting
   });

   $('#info').button();

   $('#data input[type=checkbox]').on('change', selectRows);

   $(window)
           .on('resize', function () {
              console.log('resize!!!');
              adjustTable();
           });

// ##########  Exports ############           
   this.toggleGroupIsOpen = function (groupName) {
      myopts.groups[groupName].isOpen = !myopts.groups[groupName].isOpen;
      redraw(pageCur);
   };
   this.groupIsOpen = function (groupName) {
      return _.property('isOpen')(myopts.groups[groupName]);
   };
   return this;
};