/* global _ */
"use strict";
jQuery.fn.ebtableSort = {
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
            var x = r1[cdef.col], y = r2[cdef.col];
            if (jQuery.type(x) === "string")
               x = x.toLowerCase();
            if (jQuery.type(y) === "string")
               y = y.toLowerCase();
            var fmt = $.fn.ebtableSort[cdef.format];
            x = fmt ? fmt(x) : x;
            y = fmt ? fmt(y) : y;
            var ret = (x < y) ? -1 : ((x > y) ? 1 : 0);
            if (ret !== 0)
               return bAsc ? ret : -ret;
         }
         return 0;
      };
   }
   , sort: function (data, cols) {
      return data.sort($.fn.ebtableSort.rowCmpCols(cols));
   }
};

// ##########################################################################################

$.fn.ebtable = function (opts) {
   var pageCur = 0;
   var defopts = {
      bodyheight: Math.max(300, $(window).height() - 150)
      , rowsPerPageSelect: [10, 25, 50, 100]
      , rowsPerPage: 10
      , colorder: _.range(opts.columns.length) // [0,1,2,... ]
      , sortmaster: null //[{col:1,order:asc,format:fct1},{col:2}]
   };
   var myopts = $.extend(defopts, opts);

   function tableHead() {
      var res = '';
      var order = myopts.colorder;
      for (var c = 0; c < myopts.columns.length; c++) {
         var col = myopts.columns[order[c]];
         if (!col.invisible) {
            res += '   <th id="' + col.name + '">'
                    + '   <div class="sort_wrapper">' + col.name
                    + '      <span class="ui-icon ui-icon-triangle-2-n-s">'
                    + '   </div>'
                    + '   <input width="30px" type="text" id="' + col.name + '" />'
                    + '</th>';
         }
      }
      ;
      return res;
   }

   function tableData(pageNr) {
      var res = '';
      var startRow = myopts.rowsPerPage * pageNr;
      var order = myopts.colorder;
      for (var r = startRow; r < Math.min(startRow + myopts.rowsPerPage, myopts.data.length); r++) {
         res += '<tr>';
         for (var c = 0; c < myopts.columns.length; c++) {
            if (!myopts.columns[order[c]].invisible) {
               var row = myopts.data[r];
               var rnd = myopts.columns[order[c]].render;
               var val = myopts.data[r][order[c]];
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
      var endRow = Math.min(startRow + myopts.rowsPerPage - 1, myopts.data.length);
      var templ = _.template("<%=start%> bis <%=end%>  von <%=count%>");
      var label = templ({start: startRow, end: endRow, count: myopts.data.length});
      return '<button id="info">' + label + '</button>';
   }

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
   $('#lenctrl').css('width', '60px')
           .selectmenu({change: function (event, data) {
                 console.log('change rowsPerPage', event, data.item.value);
                 var startRow = myopts.rowsPerPage * pageCur + 1;
                 myopts.rowsPerPage = Number(data.item.value);
                 pageCur = Math.floor(startRow / myopts.rowsPerPage);
                 var newrows = tableData(pageCur);
                 $('#data tbody').html(newrows);
                 $('#ctrlInfo').html(infoCtrl());
                 window.dispatchEvent(new Event('resize'));
              }
           });

   $('.firstBtn').button()
           .click(function () {
              pageCur = 0;
              var newrows = tableData(pageCur);
              $('#data tbody').html(newrows);
              $('#ctrlInfo').html(infoCtrl());
              window.dispatchEvent(new Event('resize'));
           });
   $('.backBtn').button()
           .click(function () {
              pageCur = Math.max(0, pageCur - 1);
              var newrows = tableData(pageCur);
              $('#data tbody').html(newrows);
              $('#ctrlInfo').html(infoCtrl());
              window.dispatchEvent(new Event('resize'));
           });
   $('.nextBtn').button()
           .click(function () {
              if (myopts.data.length === 0)
                 return;
              var maxPageCur = Math.floor(myopts.data.length / myopts.rowsPerPage);
              pageCur = Math.max(0, Math.min(maxPageCur, pageCur + 1));
              var newrows = tableData(pageCur);
              $('#data tbody').html(newrows);
              $('#ctrlInfo').html(infoCtrl());
              window.dispatchEvent(new Event('resize'));
           });
   $('.lastBtn').button()
           .click(function () {
              pageCur = Math.floor(myopts.data.length / myopts.rowsPerPage);
              var newrows = tableData(pageCur);
              $('#data tbody').html(newrows);
              $('#ctrlInfo').html(infoCtrl());
              window.dispatchEvent(new Event('resize'));
           });

   $('#head th')
           .on('click', function (event, selector, data) {
              console.log('click', event.currentTarget.cellIndex);
              var idx = indexOfCol(event.currentTarget.id);
              var col = myopts.columns[idx];
              var coldefs = (myopts.sortmaster && idx !== myopts.sortmaster[0].col) ? $.extend([], myopts.sortmaster) : [];
              coldefs.push({col: idx, format: col.format, order: opts.columns[idx].order});
              myopts.data = $.fn.ebtableSort.sort(opts.data, coldefs);
              $.each(coldefs, function (idx, o) {
                 myopts.columns[o.col].order = opts.columns[o.col].order === 'desc' ? 'asc' : 'desc';
              });
              //myopts.columns[idx].order = opts.columns[idx].order === 'desc' ? 'asc' : 'desc');
              var newrows = tableData(pageCur);
              $('#data tbody').html(newrows);
              var cls1 = col.order === 'asc' ? 'ui-icon-triangle-1-s' : 'ui-icon-triangle-1-n';
              $('#head div span').removeClass('ui-icon-triangle-1-n').removeClass('ui-icon-triangle-1-s').addClass('ui-icon-triangle-2-n-s');
              $('#head #' + event.currentTarget.id + ' div span').removeClass('ui-icon-triangle-2-n-s').addClass(cls1);
              window.dispatchEvent(new Event('resize'));
           });
   $('#info')
           .button();
   $('#head input')
           .on('keyup change', function (event) {
              //var c = $('#' + event.target.id);
              //grid.column(c + ':visIdx').search(this.value).draw();
              var x = $('#head input');
              $.each(x, function (idx, o) {
                 console.log(idx, $(o).val());
              });
           })
           .on('click', function (event) {
              event.target.focus();
              return false; // ignore - sorting
           });
   // ##############################################################################

   this.adjustHeader = function adjustHeader() {
      console.log('>>>adjustHeader window-width=', $(window).width());
      $('#divall').width($(window).width() - 25);
      $('#head').width($('#divall').width() - 20);
      $('#data').width($('#divall').width() - 20);

      for (var i = 1; i <= opts.columns.length; i++) {
         var w1 = $('#head th:nth-child(' + i + ')').width();
         var w2 = $('#data td:nth-child(' + i + ')').width();
         var w = Math.max(w1, w2);
         //console.log(i, w1, w2, w);
         $('#head th:nth-child(' + i + ')').width(w);
         $('#data tr:first td:nth-child(' + i + ')').width(w);
         $('#ctrlPage1').css('position', 'absolute').css('top', 10);
         $('#ctrlPage1').css('position', 'absolute').css('right', $(document).width() - $('#data').width());
         $('#ctrlPage2').css('position', 'absolute').css('right', $(document).width() - $('#data').width());
      }
   };
   // ##############################################################################

   return this;
};
