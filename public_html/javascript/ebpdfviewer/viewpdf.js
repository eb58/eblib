/* global _,jQuery, fabric, menuBearbeitungssausschluss, menusBlattbereichAuswahl, utils, valuesBlattbereichAuswahl, geom, CONSTS, viewesv, pdfpagemgr, valuesBearbeitungssausschluss, menuItemsBearbeitungssausschluss, menuItemsBlattbereichAuswahl, blattbereich2esvTypes */
/*jshint multistr: true */
(function ($) {
  'use strict';
  $.fn.viewpdf = function (pdfmgr, opts) {
    var id = this[0].id;
    this.id = id;

    var defopts = {
      xborder: '1px solid lightgray'
    };
    var myopts = $.extend({}, defopts, opts || {});

    var initPagination = function (n) {
      $('#paginationPdf').pagination({
        currentPage: n,
        displayedPages: 1,
        nextText: '>',
        prevText: '<',
        items: pdfmgr.getNumPages(),
        itemsOnPage: 1,
        cssStyle: 'compact-theme',
        onPageClick: function (n) {
          renderPage(n - 1); // pagination tool uses 1,2,3 
        }
      });
    };

    (function (a) {
      var s = _.template('\n\
       <div>\n\
          <div id="headerpdf" style="height:10px; margin:2px 2px 2px 2px">\n\
            <div id="paginationPdf"style="float:right" ></div>\n\
          </div>\n\
          <div id="contentpdf" style="margin:0px; border:<%=border%>;">\n\
            <img id="content-img" style="max-width:100%; max-height:100%;">\n\
          </div>\n\
        </div>\n')({border: myopts.border});
      a.html(s);
    })(this);

    function renderPage(num) { // 0,1,2,
      pdfmgr.getPageAsBase64(num, function (img, afterLoading) {
        $('#content-img').prop('src', img.data);
        afterLoading && afterLoading(img);
      });
    }

    initPagination(1);
    renderPage(0);
    return this;
  }
})(jQuery);
