/* global _ */
"use strict";
jQuery.fn.ebtableSort = {
   delim: '#|#', // Used as delimiter between groupname and content of data

   dinDate: function (a) {
      // '01.01.2013' -->   '2013-01-01' 
      var d = a.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
      return d ? (d[3] + '-' + d[2] + '-' + d[1]) : '';
   },
   dinDateTime: function (a) {
      // '01.01.2013 12:36'  -->  '2013-01-01 12:36' 
      var d = a.match(/^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2}):(\d{2})$/);
      return d ? (d[3] + '-' + d[2] + '-' + d[1] + ' ' + d[4] + ':' + d[5]) : '';
   },
   normalizeDate: function (a) {
      // In  'xxx#|#01.01.2013' oder auch nur '01.01.2013'
      // Out 'xxx#|#2013-01-01' oder '2013-01-01' 
      if (a.indexOf(jQuery.fn.ebtableSort.delim) >= 0) {
         var s = a.split(jQuery.fn.ebtableSort.delim);
         return s[0] + jQuery.fn.ebtableSort.delim + jQuery.fn.ebtableSort.dinDate(s[1]);
      }
      return jQuery.fn.ebtableSort.dinDate(a);
   },
   normalizeDateTime: function (a) {
      // In  'xxx#|#01.01.2013 12:36' oder auch nur '01.01.2013 12:36'
      // Out 'xxx#|#2013-01-01 12:36' oder '2013-01-01 12:36' 
      if (a.indexOf(jQuery.fn.ebtableSort.delim) >= 0) {
         var s = a.split(jQuery.fn.ebtableSort.delim);
         return s[0] + jQuery.fn.ebtableSort.delim + jQuery.fn.ebtableSort.dinDate(s[1]);
      }
      return jQuery.fn.ebtableSort.dinDateTime(a);
   }
};
jQuery.fn.ebtableSort.sorter = {
   'sort-asc': function sortAsc(data, col) {
      return data.sort(function (r1, r2) {
         var x = r1[col], y = r2[col];
         return ((x < y) ? -1 : ((x > y) ? 1 : 0));
      });
   }
   , 'sort-desc': function sortDesc(data, col) {
      return data.sort(function (r1, r2) {
         var x = r1[col], y = r2[col];
         return ((x < y) ? 1 : ((x > y) ? -1 : 0));
      });
   }
   , 'date-de-asc': function sortDateDeAsc(data, col) {
      return data.sort(function (r1, r2) {
         var a = r1[col], b = r2[col];
         var x = jQuery.fn.ebtableSort.normalizeDate(a);
         var y = jQuery.fn.ebtableSort.normalizeDate(b);
         return ((x < y) ? -1 : ((x > y) ? 1 : 0));
      });
   }
   , 'date-de-desc': function sortDateDeDesc(data, col) {
      return data.sort(function (r1, r2) {
         var a = r1[col], b = r2[col];
         var x = jQuery.fn.ebtableSort.normalizeDate(a);
         var y = jQuery.fn.ebtableSort.normalizeDate(b);
         return ((x < y) ? 1 : ((x > y) ? -1 : 0));
      });
   }
};

// ##########################################################################################

$.fn.ebtable = function (opts) {
   var pageCur = 0;
   var defopts = {
      selectLen: [10, 25, 50, 100]
      , bodyheight: Math.max(300, $(window).height() - 150)
      , rowsPerPage: 10
   };
   var myopts = $.extend(defopts, opts);
   var tableHead = function () {
      var res = '';
      for (var c = 0; c < myopts.columns.length; c++) {
         var col = myopts.columns[c];
         if (!col.invisible)
            res += '<th id="' + col.name + '">' + col.name + '</th>';
      }
      ;
      return res;
   };
   var tableData = function tableData(pageNr) {
      var res = '';
      var startRow = myopts.rowsPerPage * pageNr;
      for (var r = startRow; r < Math.min(startRow + myopts.rowsPerPage, myopts.data.length); r++) {
         res += '<tr>';
         for (var c = 0; c < myopts.columns.length; c++) {
            if (myopts.columns[c].invisible)
               continue;
            var row = myopts.data[r];
            var rnd = myopts.columns[c].render;
            var val = myopts.data[r][c];
            val = rnd ? rnd(val, row) : val;
            res += '<td>' + val + '</td>';
         }
         res += '</tr>\n';
      }
      return res;
   };

   var indexOfCol = function indexOfCol(colname) {
      for (var c = 0; c < myopts.columns.length; c++)
         if (myopts.columns[c].name === colname)
            return c;
      return -1;
   };

   var selectLenCtrl = function () {
      var options = '';
      $.each(myopts.selectLen, function (idx, o) {
         var selected = o === myopts.rowsPerPage ? 'selected' : '';
         options += '<option value="' + o + '" ' + selected + '>' + o + '</option>\n';
      });
      return '<select id="lenctrl">\n' + options + '</select>\n';
   };
   var pageBrowseCtrl = function () {
      return '<button class="backBtn">Zurück</button><button class="nextBtn">Vor</button> ';
   };
   var infoCtrl = function () {
      var startRow = myopts.rowsPerPage * pageCur + 1;
      var endRow = Math.min(startRow + myopts.rowsPerPage - 1, myopts.data.length);
      var templ = _.template("<%=start%> bis <%=end%>  von <%=count%>");
      return templ({start: startRow, end: endRow, count: myopts.data.length});
   };

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
            <div>\n\
         </div>\n\
         <div id='ctrlInfo'><%= info %><div>\n\
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
   $('#lenctrl')
      .css('width', '60px')
      .selectmenu({change: function (event, data) {
            console.log('change select', event, data.item.value);
            myopts.rowsPerPage = Number(data.item.value);
            var newrows = tableData(pageCur);
            $('#data tbody').html(newrows);
            $('#ctrlInfo').html(infoCtrl());
            window.dispatchEvent(new Event('resize'));
         }
      });

   $('.backBtn').button().click(function () {
      pageCur = Math.max(0, pageCur - 1);
      var newrows = tableData(pageCur);
      $('#data tbody').html(newrows);
      $('#ctrlInfo').html(infoCtrl());
      window.dispatchEvent(new Event('resize'));

   });

   $('.nextBtn').button().click(function () {
      if (myopts.data.length === 0)
         return;
      var maxPageCur = Math.floor(myopts.data.length / myopts.rowsPerPage);
      pageCur = Math.max(0, Math.min(maxPageCur, pageCur + 1));
      var newrows = tableData(pageCur);
      $('#data tbody').html(newrows);
      $('#ctrlInfo').html(infoCtrl());
      window.dispatchEvent(new Event('resize'));
   });

   $('#head th').on('click', function (event, selector, data) {
      console.log('click', event, event.currentTarget.cellIndex);
      var idx = indexOfCol(event.currentTarget.id);
      var sorter = jQuery.fn.ebtableSort.sorter;
      var sortType = opts.columns[idx].sortType ? opts.columns[idx].sortType : 'sort';
      var sortFct = opts.columns[idx].sortStatus === 'desc' ? sorter[sortType + '-asc'] : sorter[sortType + '-desc'];
      opts.data = sortFct(opts.data, idx);
      opts.columns[idx].sortStatus = opts.columns[idx].sortStatus === 'desc' ? 'asc' : 'desc';
      var newrows = tableData(pageCur);
      $('#data tbody').html(newrows);
      window.dispatchEvent(new Event('resize'));
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
         console.log(i, w1, w2, w);
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
