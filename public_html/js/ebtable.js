$.fn.ebtable = function (opts) {
   var defopts = {
      selectLen: [10, 25, 50, 100]
      , bodyheight: Math.max(300, $(window).height() - 150)
      , rowsPerPage: 10
   };
   var myopts = $.extend(defopts, opts);
   var tableHead = function () {
      var res = '';
      $.each(opts.head, function (idx, o) {
         res += '<th>' + o + '</th>';
      });
      return res;
   };
   var tableData = function tableData(pageNr) {
      var res = '';
      var start = myopts.rowsPerPage * pageNr;
      for (var r = start; r < Math.min(start + myopts.rowsPerPage, myopts.data.length); r++) {
         res += '<tr>';
         for (var c = 0; c < start + myopts.head.length; c++) {
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
         <div style='overflow:auto;'>\n\
            <div>\n\
               <table id='head' >\n\
                  <thead><tr><%= head %></tr></thead>\n\
               </table>\n\
            </div>\n\
            <div id='xxx' max-height:<%= bodyheight %>px;'>\n\
               <table id='data'>\n\
                  <tbody><%= data %></tbody>\n\
               </table>\n\
            <div>\n\
         </div>\n\
         <div id='info'><%= info %><div>\n\
         <div id='ctrlPage2' style='float:right'><%= browseBtns %></div>\n\
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
      .css('width', '80px')
      .selectmenu({change: function (event, data) {
            console.log('change select', event, data.item.value);
            myopts.rowsPerPage = Number(data.item.value);
            var newrows = tableData(0);
            $('#data tbody').html(newrows);
            window.dispatchEvent(new Event('resize'));
         }
      });
   $('#back').button();
   $('#next').button();
   // ##############################################################################

   this.adjustHeader = function adjustHeader() {
      console.log('>>>adjustHeader window-width=', $(window).width());
      $('#xxx').width($(window).width() - 25);
      $('#head').width($('#xxx').width() - 20);
      $('#data').width($('#xxx').width() - 20);

      for (var i = 1; i <= opts.head.length; i++) {
         var w1 = $('#data tr:first td:nth-child(' + i + ')').width();
         var w2 = $('#head th:nth-child(' + i + ')').width();
         var w = Math.max(w1, w2);
         $('#head th:nth-child(' + i + ')').width(w);
         $('#data tr:first td:nth-child(' + i + ')').width(w);
         $('#ctrlPage1').css('position', 'absolute').css('top', 10);
         $('#ctrlPage1').css('position', 'absolute').css('right', $(document).width() - $('#data').width());
         //$('#ctrlPage2').css('position', 'absolute').css('right', $(document).width() - $('#data').width());
      }


   };
   // ##############################################################################

   return this;
};
