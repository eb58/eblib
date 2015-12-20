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
            var bAsc = cdef.order !== 'desc';
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
   var localStorageKey = 'ebtable-' + $('title').text().replace(' ', '');
   var origData = data || [];
   var tblData = $.extend([], origData);
   var pageCur = 0;
   var defopts = {
      bodyheight: Math.max(200, $(window).height() - 10)
      , rowsPerPageSelect: [10, 25, 50, 100]
      , rowsPerPage: 10
      , colorder: _.range(opts.columns.length) // [0,1,2,... ]
      , sortmaster: null //[{col:1,order:asc,format:fct1},{col:2}]
      , saveState: function saveState() {
         var opts = {rowsPerPage: myopts.rowsPerPage, colorder: myopts.colorder};
         localStorage[localStorageKey] = JSON.stringify(opts);
      }
      , loadState: function loadState() {
         return localStorage[localStorageKey] ? $.parseJSON(localStorage[localStorageKey]) : {};
      }
   };
   var myopts = $.extend({}, defopts, opts, defopts.loadState());

   function tableHead() {
      var res = '';
      var order = myopts.colorder;
      for (var c = 0; c < myopts.columns.length; c++) {
         var col = myopts.columns[order[c]];
         if (!col.invisible) {
            res += '   <th id="' + col.name + '">'
                    + '   <input type="text" id="' + col.name + '" />'
                    + '   <div class="sort_wrapper">' + col.name
                    + '      <span class="ui-icon ui-icon-triangle-2-n-s">'
                    + '   </div>'
                    + '</th>';
         }
      }
      return res;
   }

   function tableData(pageNr) {
      var res = '';
      var startRow = myopts.rowsPerPage * pageNr;
      var order = myopts.colorder;
      for (var r = startRow; r < Math.min(startRow + myopts.rowsPerPage, tblData.length); r++) {
         res += '<tr>';
         for (var c = 0; c < myopts.columns.length; c++) {
            if (!myopts.columns[order[c]].invisible) {
               var row = tblData[r];
               var rnd = myopts.columns[order[c]].render;
               var val = tblData[r][order[c]];
               val = rnd ? rnd(val, row) : val;
               res += '<td>' + val + '</td>';
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
      $.each(myopts.rowsPerPageSelect, function (idx, o) {
         var selected = o === myopts.rowsPerPage ? 'selected' : '';
         options += '<option value="' + o + '" ' + selected + '>' + o + '</option>\n';
      });
      return '<select id="lenctrl">\n' + options + '</select>\n';
   }

   function pageBrowseCtrl() {
      return '\n\
              <button class="firstBtn"><span class="ui-icon ui-icon-seek-first"></span></button>\n\
              <button class="backBtn"><span  class="ui-icon ui-icon-seek-prev"></span></button>\n\
              <button class="nextBtn"><span  class="ui-icon ui-icon-seek-next"></span></button>\n\
              <button class="lastBtn"><span  class="ui-icon ui-icon-seek-end"></span></button>';
   }

   function infoCtrl() {
      var startRow = myopts.rowsPerPage * pageCur + 1;
      var endRow = Math.min(startRow + myopts.rowsPerPage - 1, tblData.length);
      var templ = _.template("<%=start%> bis <%=end%>  von <%=count%>");
      var label = templ({start: startRow, end: endRow, count: tblData.length});
      return '<button id="info">' + label + '</button>';
   }

   function filterData() {
      var filters = [];
      $('#head input').each(function (idx, o) {
         var filterText = $(o).val();
         if (filterText)
            filters.push({col: myopts.colorder[idx], text: filterText});
      });
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
            b = b && cellData.indexOf(f.text) >= 0;
         }
         if (b) {
            fData.push(origData[r]);
         }
      }
      tblData = fData;
      return true;
   }
// ##############################################################################

   function adjustHeader() {
      console.log('>>>adjustHeader window-width=', $(window).width());
      $('#divall').width($(window).width() - 25);
      $('#head').width($('#divall').width() - 20);
      $('#data').width($('#divall').width() - 20);

      for (var i = 1; i <= opts.columns.length; i++) {
         var w1 = $('#head th:nth-child(' + i + ')').width();
         var w2 = $('#data td:nth-child(' + i + ')').width();
         var w = Math.max(w1, w2);
         console.log(i, 'head:', w1, 'data:', w2, 'max:', w);
         $('#head th:nth-child(' + i + ')').width(w);
         $('#data tr:first td:nth-child(' + i + ')').width(w);
      }
      $('#ctrlPage1').css('position', 'absolute').css('top', 5);
      $('#ctrlPage1').css('position', 'absolute').css('right', $(document).width() - $('#data').width() - 10);
      $('#ctrlPage2').css('position', 'absolute').css('right', $(document).width() - $('#data').width() - 10);
   }
   ;
   // ##############################################################################


   var tableTemplate = _.template(
           "<div>\n\
         <div id='ctrlLength'><%= selectLen %></div>\n\
         <div id='ctrlPage1'><%= browseBtns %></div>\n\
         <div id='divall' style='overflow-x:auto;'>\n\
            <div>\n\
               <table id='head' >\n\
                  <thead><tr><%= head %></tr></thead>\n\
               </table>\n\
            </div>\n\
            <div class='scroll-pane' id='divdata' style='max-height:<%= bodyheight %>px;'>\n\
               <table id='data'>\n\
                  <tbody><%= data %></tbody>\n\
               </table>\n\
            </div>\n\
         </div>\n\
         <div id='ctrlInfo'><%= info %></div>\n\
         <div id='ctrlPage2'><%= browseBtns %></div>\n\
      </div>"
           );
   this.html(tableTemplate({
      head: tableHead()
      , data: tableData(0)
      , selectLen: selectLenCtrl()
      , browseBtns: pageBrowseCtrl()
      , info: infoCtrl()
      , bodyheight: myopts.bodyheight
   }));
   adjustHeader();

   // #################################################################
   // Actions
   // #################################################################

   $('#lenctrl').css('width', '60px')
           .selectmenu({change: function (event, data) {
                 console.log('change rowsPerPage', event, data.item.value);
                 var startRow = myopts.rowsPerPage * pageCur + 1;
                 myopts.rowsPerPage = Number(data.item.value);
                 pageCur = Math.floor(startRow / myopts.rowsPerPage);
                 var newrows = tableData(pageCur);
                 $('#data tbody').html(newrows);
                 $('#ctrlInfo').html(infoCtrl());
                 $(window).trigger('resize');
                 myopts.saveState();
              }
           });

   $('.firstBtn').button()
           .click(function () {
              pageCur = 0;
              var newrows = tableData(pageCur);
              $('#data tbody').html(newrows);
              $('#ctrlInfo').html(infoCtrl());
              $(window).trigger('resize');
           });
   $('.backBtn').button()
           .click(function () {
              pageCur = Math.max(0, pageCur - 1);
              var newrows = tableData(pageCur);
              $('#data tbody').html(newrows);
              $('#ctrlInfo').html(infoCtrl());
              $(window).trigger('resize');
           });
   $('.nextBtn').button()
           .click(function () {
              if (tblData.length === 0)
                 return;
              var maxPageCur = Math.floor(tblData.length / myopts.rowsPerPage);
              pageCur = $.fn.ebtableHelpers.clip(pageCur + 1, 0, maxPageCur);
              var newrows = tableData(pageCur);
              $('#data tbody').html(newrows);
              $('#ctrlInfo').html(infoCtrl());
              $(window).trigger('resize');
           });
   $('.lastBtn').button()
           .click(function () {
              pageCur = Math.floor(tblData.length / myopts.rowsPerPage);
              var newrows = tableData(pageCur);
              $('#data tbody').html(newrows);
              $('#ctrlInfo').html(infoCtrl());
              $(window).trigger('resize');
           });

   $('#head th')
           .on('click', function (event, selector, data) {
              console.log('click', event.currentTarget.cellIndex);
              var idx = indexOfCol(event.currentTarget.id);
              var col = myopts.columns[idx];
              var coldefs = (myopts.sortmaster && idx !== myopts.sortmaster[0].col) ? $.extend([], myopts.sortmaster) : [];
              coldefs.push({col: idx, format: col.format, order: opts.columns[idx].order});
              tblData = $.fn.ebtableSort.sort(tblData, coldefs);
              $.each(coldefs, function (idx, o) {
                 myopts.columns[o.col].order = opts.columns[o.col].order === 'desc' ? 'asc' : 'desc';
              });
              pageCur = 0;
              var newrows = tableData(pageCur);
              $('#data tbody').html(newrows);
              $('#ctrlInfo').html(infoCtrl());
              var cls1 = col.order === 'asc' ? 'ui-icon-triangle-1-s' : 'ui-icon-triangle-1-n';
              $('#head div span').removeClass('ui-icon-triangle-1-n').removeClass('ui-icon-triangle-1-s').addClass('ui-icon-triangle-2-n-s');
              $('#head #' + event.currentTarget.id + ' div span').removeClass('ui-icon-triangle-2-n-s').addClass(cls1);
              $(window).trigger('resize');
           });
   $('#info')
           .button();
   $('#head input')
           .on('keyup', function (event) {
              console.log('filter', event);
              filterData();
              pageCur = 0;
              $('#data tbody').html(tableData(pageCur));
              $('#ctrlInfo').html(infoCtrl());
              $(window).trigger('resize');
           })
           .on('click', function (event) {
              event.target.focus();
              return false; // ignore - sorting
           });

   $(window)
           .on('resize', function () {
              console.log('resize!!!');
              adjustHeader();
           });
   return this;
};
