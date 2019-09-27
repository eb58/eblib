/* global _,jQuery *//* jshint expr: true */
(function ($) {

   var pagingModel = function (n, cb) {
      var page = 0;
      var pageMax = n;

      return {
         pageFirst: function () {
            page = 0;
            cb(page);
         },
         pagePrev: function () {
            page = Math.max(0, page - 1);
            cb(page);
         },
         pageNext: function () {
            page = Math.min(page + 1, pageMax);
            cb(page);
         },
         pageLast: function () {
            page = pageMax;
            cb(page);
         },
         setPageSize: function (n) {
            page = 0;
            this.pageMax = n;
         }
      };
   };

   $.fn.pager = function (opts) {
      if (!this || !this[0]) {
         return;
      }

      var id = this[0].id;
      var defopts = {
         pageCount: 10
      };
      var myopts = $.extend({}, defopts, opts);

      var pm = pagingModel(myopts.pageCount, console.log);

      var init = function init(a) {
         a.html('\
            <button class="firstBtn"><span class="ui-icon ui-icon-seek-first"/></button>\
            <button class="backBtn"><span  class="ui-icon ui-icon-seek-prev" /></button>\
            <button class="nextBtn"><span  class="ui-icon ui-icon-seek-next" /></button>\
            <button class="lastBtn"><span  class="ui-icon ui-icon-seek-end"  /></button>\
            ');

         $('.firstBtn').button().on('click', pm.pageFirst );
         $('.backBtn').button().on('click', pm.pagePrev);
         $('.nextBtn').button().on('click', pm.pageNext);
         $('.lastBtn').button().on('click', pm.pageLast);

      };
      init(this);
      return _.extend(this, {});
   }
   ;
})(jQuery);
  