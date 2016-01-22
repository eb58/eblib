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
                     <div id='divdata' style='overflow-y:auto;overflow-x:hidden;max-height:<%= bodyHeight %>px;'>\n\
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
   //#########################################
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
}}

       