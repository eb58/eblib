"use strict";

jQuery.fn.ebtable.delim = '#|#'; // Used as delimiter between Chargename and content of data

jQuery.fn.ebtable.dinDate = function (a) {
   // '01.01.2013' -->   '2013-01-01' 
   var d = a.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
   return  d ? (d[3] + '-' + d[2] + '-' + d[1]) : '';
};

jQuery.fn.ebtable.dinDateTime = function (a) {
   // '01.01.2013 12:36'  -->  '2013-01-01 12:36' 
   var d = a.match(/^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2}):(\d{2})$/);
   return  d ? (d[3] + '-' + d[2] + '-' + d[1] + ' ' + d[4] + ':' + d[5]) : '';
};

jQuery.fn.ebtable.normalizeDate = function (a) {
   // In  'xxx#|#01.01.2013' oder auch nur '01.01.2013'
   // Out 'xxx#|#2013-01-01' oder '2013-01-01' 
   if (a.indexOf(jQuery.fn.ebtable.delim) >= 0) {
      var s = a.split(jQuery.fn.ebtable.delim);
      return s[0] + jQuery.fn.ebtable.delim + jQuery.fn.ebtable.dinDate(s[1]);
   }
   return jQuery.fn.ebtable.dinDate(a);
};

jQuery.fn.ebtable.normalizeDateTime = function (a) {
   // In  'xxx#|#01.01.2013 12:36' oder auch nur '01.01.2013 12:36'
   // Out 'xxx#|#2013-01-01 12:36' oder '2013-01-01 12:36' 
   if (a.indexOf(jQuery.fn.ebtable.delim) >= 0) {
      var s = a.split(jQuery.fn.ebtable.delim);
      return s[0] + jQuery.fn.ebtable.delim + jQuery.fn.ebtable.dinDate(s[1]);
   }
   return jQuery.fn.ebtable.dinDateTime(a);
};

jQuery.fn.ebtable.groupComparer = function (bAsc, cmp) {
   return function (a, b) {
      var delim = jQuery.fn.ebtable.delim; // '#|#'
      if (!bAsc && (a.indexOf(delim) >= 0 || b.indexOf(delim) >= 0)) {
         a = a.indexOf('!!!' + delim ) >= 0 ? a.replace('!!!' + delim , '~~~' + delim ) : a.replace('~~~'+delim, '!!!' + delim );
         b = b.indexOf('!!!' + delim ) >= 0 ? b.replace('!!!' + delim , '~~~' + delim ) : b.replace('~~~'+delim, '!!!' + delim );
      }
      return cmp(a, b);
   };
};

jQuery.extend(jQuery.fn.ebtable.oSort, {
   "de_datetime-asc": jQuery.fn.ebtable.groupComparer(true, function (a, b) {
      var x = jQuery.fn.ebtable.normalizeDateTime(a);
      var y = jQuery.fn.ebtable.normalizeDateTime(b);
      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
   }),
   "de_datetime-desc": jQuery.fn.ebtable.groupComparer(false, function (a, b) {
      var x = jQuery.fn.ebtable.normalizeDateTime(a);
      var y = jQuery.fn.ebtable.normalizeDateTime(b);
      return ((x < y) ? 1 : ((x > y) ? -1 : 0));
   }),
   //-----------------------------------------------------------------------------
   "de_date-asc": jQuery.fn.ebtable.groupComparer(true, function (a, b) {
      var x = jQuery.fn.ebtable.normalizeDate(a);
      var y = jQuery.fn.ebtable.normalizeDate(b);
      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
   }),
   "de_date-desc": jQuery.fn.ebtable.groupComparer(false, function (a, b) {
      var x = jQuery.fn.ebtable.normalizeDate(a);
      var y = jQuery.fn.ebtable.normalizeDate(b);
      return ((x < y) ? 1 : ((x > y) ? -1 : 0));
   }),
   //-----------------------------------------------------------------------------
   "simple-asc": jQuery.fn.ebtable.groupComparer(true, function (a, b) {
      return ((a < b) ? -1 : ((a > b) ? 1 : 0));
   }),
   "simple-desc": jQuery.fn.ebtable.groupComparer(false, function (a, b) {
      return ((a < b) ? 1 : ((a > b) ? -1 : 0));
   })
   //"simple-pre": function (a) {return a;},  // https://datatables.net/forums/discussion/21104/custom-sorting-asc-desc-not-called-when-pre-is-present
});
// see also http://datatables.net/blog/2014-12-18
