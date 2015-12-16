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
      $.each(opts.columns, function (idx, o) {
         res += '<th>' + o + '</th>';
      });
      return res;
   };
   var tableData = function tableData(pageNr) {
      var res = '';
      var startRow = myopts.rowsPerPage * pageNr;
      for (var r = startRow; r < Math.min(startRow + myopts.rowsPerPage, myopts.data.length); r++) {
         res += '<tr>';
         for (var c = 0; c < myopts.columns.length; c++) {
            res += '<td>' + myopts.data[r][c] + '</td>';
         }
         res += '</tr>\n';
      }
      return res;
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
      return '<button id="back">Zurück</button><button id="next">Vor</button> ';
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
         <div id='info'><%= info %><div>\n\
      </div>"

      );
   this.html(tableTemplate({
      head: tableHead()
      , data: tableData(0)
      , selectLen: selectLenCtrl()
      , browseBtns: pageBrowseCtrl()
      , info: "Info blbla"
      , bodyheight: myopts.bodyheight
   }));
   $('#lenctrl')
      .css('width', '60px')
      .selectmenu({change: function (event, data) {
            console.log('change select', event, data.item.value);
            myopts.rowsPerPage = Number(data.item.value);
            var newrows = tableData(pageCur);
            $('#data tbody').html(newrows);
            window.dispatchEvent(new Event('resize'));
         }
      });
   $('#back').button().click(function () {
      pageCur = Math.max(0, pageCur - 1);
      var newrows = tableData(pageCur);
      $('#data tbody').html(newrows);
      window.dispatchEvent(new Event('resize'));

   });
   $('#next').button().click(function () {
      if( myopts.data.length ===0 )  return;
      var maxPageCur = Math.floor(myopts.data.length / myopts.rowsPerPage);
      pageCur = Math.min(maxPageCur-1, pageCur + 1);
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
