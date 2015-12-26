/* global _ */
"use strict";
$.fn.ebtableSort = {
   'date-de': function (a) { // '01.01.2013' -->   '20130101' 
      var d = a.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
      return d ? (d[3] + d[2] + d[1]) : '';
   },
   'datetime-de': function (a) { // '01.01.2013 12:36'  -->  '201301011236' 
      var d = a.match(/^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2}):(\d{2})$/);
      return d ? (d[3] + d[2] + d[1] + d[4] + d[5]) : '';
   },
   rowCmpCols: function (cols) { // [ {col:1,order:asc,format:fmtfct1},{col:3, order:desc, format:fmtfct2},... ]  
      return function (r1, r2) {
         for (var i = 0; i < cols.length; i++) {
            var cdef = cols[i];
            var bAsc = !cdef.order || cdef.order.indexOf('desc') < 0;
            var fmt = $.fn.ebtableSort[cdef.format];
            var x = $.fn.ebtableHelpers.toLower(r1[cdef.col]);
            var y = $.fn.ebtableHelpers.toLower(r2[cdef.col]);
            x = fmt ? fmt(x) : x;
            y = fmt ? fmt(y) : y;
            var ret = (x < y) ? -1 : ((x > y) ? 1 : 0);
            if (ret !== 0) {
               return bAsc ? ret : -ret;
            }
         }
         return 0;
      };
   }
   , sort: function (data, cols) {
      return data.sort($.fn.ebtableSort.rowCmpCols(cols));
   }
};

$.fn.ebtableHelpers = {
   toLower: function toLower(o) {
      return  $.type(o) === "string" ? o.toLowerCase() : o;
   }
   , clip: function clip(v, a, b) {
      return Math.min(Math.max(a, v), b);
   }
};

// ##########################################################################################

$.fn.ebtable = function (opts, data) {
   var localStorageKey = 'ebtable-' + $(document)[0].title.replace(' ', '');
   var origData = data || [];
   var tblData = $.extend([], origData);
   var pageCur = 0;
   var defopts = {
      bodyheight: Math.max(200, $(window).height() - 10)
      , rowsPerPageSelectValues: [10, 25, 50, 100]
      , rowsPerPage: 10
      , colorder: _.range(opts.columns.length) // [0,1,2,... ]
      , saveState: function () {
         var opts = {rowsPerPage: myopts.rowsPerPage, colorder: myopts.colorder};
         localStorage[localStorageKey] = JSON.stringify(opts);
      }
      , loadState: function () {
         return localStorage[localStorageKey] ? $.parseJSON(localStorage[localStorageKey]) : {};
      }
      , sortmaster: [] //[{col:1,order:asc,format:fct1},{col:2}]
      , groupingCols: null //{groupid:1,groupsort:0,grouphead:'GA'}
      , groups:[]

   };
   var myopts = $.extend({}, defopts, opts, defopts.loadState());

   function preprocessData(){
      for (var r = 0; r < tblData.length; r++) {
         var groupName = tblData[r][myopts.groupingCols.groupid];
         tblData[r].isGroupHeader = tblData[r][myopts.groupingCols.groupsort]===myopts.groupingCols.grouphead;
         tblData[r].isGroupElement = !!groupName && !tblData[r].isGroupHeader;
         if( !!groupName ) myopts.groups[groupName] =  {isOpen:false};
      }
   }

   function selectRows(event) { // select row
      var rowNr = event.target.id.replace('check', '');
      tblData[rowNr].selected = $(event.target).prop('checked');
      console.log('change !', event.target.id, rowNr, tblData[rowNr], tblData[rowNr].selected);
      // Grouping
      if (myopts.groupingCols && tblData[rowNr][myopts.groupingCols.groupid]
              && tblData[rowNr][myopts.groupingCols.groupsort] === myopts.groupingCols.grouphead) {
         var groupId = tblData[rowNr][myopts.groupingCols.groupid];
         var groupSort = tblData[rowNr][myopts.groupingCols.groupsort];
         console.log('Group', groupId, groupSort);
         for (var i = 0; i < tblData.length; i++) {
            if (tblData[i][myopts.groupingCols.groupid] === groupId) {
               tblData[i].selected = tblData[rowNr].selected
               $('#check' + i).prop('checked', tblData[rowNr].selected);
            }
         }
      }
   }

   function tableHead() {
      var res = '';
      var order = myopts.colorder;
      if (myopts.selection) {
//         res += '<th><input type="checkbox" id="selectAll"></th>';
         res += '<th></th>';
      }
      for (var c = 0; c < myopts.columns.length; c++) {
         var col = myopts.columns[order[c]];
         if (!col.invisible) {
            var templ = _.template(
                    '<th id="<%=colname%>">\n\
                        <div class="sort_wrapper">\n\
                           <span class="ui-icon ui-icon-triangle-2-n-s"/><%=colname%>\n\
                        </div>\n\
                        <input type="text" id="<%=colname%>" />\n\
                     </th>');
            res += templ({colname: col.name});
         }
      }
      return res;
   }

   function tableData(pageNr) {
      var res = '';
      var startRow = myopts.rowsPerPage * pageNr;
      var order = myopts.colorder;
      for (var r = startRow; r < Math.min(startRow + myopts.rowsPerPage, tblData.length); r++) {
         var groupName = tblData[r][myopts.groupingCols.groupid];
         if( tblData[r].isGroupElement && !myopts.groups[groupName].isOpen ) continue
         var cls = tblData[r].isGroupElement ? ' class="group" ' : '';
         cls = tblData[r].isGroupHeader ? ' class="groupheader" ' : cls;
         res += '<tr>';
         if (myopts.selection) {
            var c = !!tblData[r].selected ? ' checked="checked" ' : ' ';
            res += '<td' +cls +'>\n\
                      <input type="checkbox" class="checkRow"' + c + 'id="check' + r + '"/>\n\
                    </td>';
         }
         for (var c = 0; c < myopts.columns.length; c++) {
            if (!myopts.columns[order[c]].invisible) {
               var row = tblData[r];
               var rnd = myopts.columns[order[c]].render;
               var val = tblData[r][order[c]];
               val = rnd ? rnd(val, row) : val;
               res += '<td' +cls +'>' + val + '</td>';
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
      return '\n\
              <button class="firstBtn"><span class="ui-icon ui-icon-seek-first"/></button>\n\
              <button class="backBtn"><span  class="ui-icon ui-icon-seek-prev"/></button>\n\
              <button class="nextBtn"><span  class="ui-icon ui-icon-seek-next"/></button>\n\
              <button class="lastBtn"><span  class="ui-icon ui-icon-seek-end"/></button>';
   }

   function infoCtrl() {
      var startRow = myopts.rowsPerPage * pageCur + 1;
      var endRow = Math.min(startRow + myopts.rowsPerPage - 1, tblData.length);
      var filtered = origData.length === tblData.length ? "" : " (gefiltert von " + origData.length + " Einträgen)";
      var templ = _.template("<%=start%> bis <%=end%>  von <%=count%> Einträgen <%= filtered %>");
      var label = templ({start: startRow, end: endRow, count: tblData.length, filtered: filtered});
      return '<button id="info">' + label + '</button>';
   }

   function getFilters() {
      var filters = [];
      $('#head input[type=text]').each(function (idx, o) {
         if ($(o).val()) {
            var col = indexOfCol($(o).attr('id'));
            filters.push({col: col,searchtext: $.fn.ebtableHelpers.toLower($(o).val())});
         }
      });
      return filters

   }
   function filterData() {
      var filters = getFilters();
      if (filters.length === 0) {
         tblData = origData;
         return true;
      }

      var fData = [];
      for (var r = 0; r < origData.length; r++) {
         var b = true;
         for (var i = 0; i < filters.length && b; i++) {
            var f = filters[i];
            var cellData = $.fn.ebtableHelpers.toLower(origData[r][f.col]);
            var searchText = f.searchtext;
            b = b && cellData.indexOf(searchText) >= 0;
         }
         if (b) {
            fData.push(origData[r]);
         }
      }
      tblData = fData;
      return true;
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
      , data: tableData(0)
      , selectLen: selectLenCtrl()
      , browseBtns: pageBrowseCtrl()
      , info: infoCtrl()
      , bodyheight: myopts.bodyheight
   }));
   adjustTable();

   function redraw(pageCur) {
      var newrows = tableData(pageCur);
      $('#data tbody').html(newrows);
      $('#ctrlInfo').html(infoCtrl());
      $(window).trigger('resize');
      $('#data input[type=checkbox]').on('change', selectRows);

   }
   // #################################################################
   // Actions
   // #################################################################

   $('#lenctrl').css('width', '60px')
           .selectmenu({change: function (event, data) {
                 console.log('change rowsPerPage', event, data.item.value);
                 myopts.rowsPerPage = Number(data.item.value);
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
      if (tblData.length === 0)
         return;
      var maxPageCur = Math.floor(tblData.length / myopts.rowsPerPage);
      pageCur = $.fn.ebtableHelpers.clip(pageCur + 1, 0, maxPageCur);
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
      var sm = myopts.sortmaster && myopts.sortmaster[col] != idx ? myopts.sortmaster : []
      var coldefs = $.extend([], sm);
      coldefs.push({col: idx, format: col.format, order: myopts.columns[idx].order});
      $.each(coldefs, function (idx, o) {
         o.order = myopts.columns[o.col].order || 'asc';
      });
      tblData = $.fn.ebtableSort.sort(tblData, coldefs);
      $.each(coldefs, function (idx, o) {
         var toggle = {'desc': 'asc', 'asc': 'desc', 'desc-fix': 'desc-fix', 'asc-fix': 'asc-fix'};
         myopts.columns[o.col].order = myopts.columns[o.col].order ? toggle[myopts.columns[o.col].order] : 'asc';
      });
      console.log('sorting2', myopts.columns);
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

//   $('#selectAll').on('click', function (event) { // select all rows
//      console.log('change!!!', event.target, $(event.target).prop('checked'));
//      $('#data input[type=checkbox]').prop("checked", $(event.target).prop('checked'));
//   });
   $('#data input[type=checkbox]').on('change', selectRows);

   $(window)
           .on('resize', function () {
              console.log('resize!!!');
              adjustTable();
           });
           
// ##########  Exports ############           
   this.toggleGroupIsOpen = function(groupName){
      myopts.groups[groupName].isOpen = !myopts.groups[groupName].isOpen;
      redraw(pageCur);
   }
   this.groupIsOpen = function(groupName){
      return _.property('isOpen')(myopts.groups[groupName]);
   }
   return this;
};