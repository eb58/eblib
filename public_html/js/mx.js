/* global _ */

var mx = function mx(p1, p2) { // nr #rows, nc #cols OR  p1 = 2-dimensional array
   var data = _.isArray(p1) ? p1 : _.map(_.range(p1), function () {
      return [];
   }); // [ [], [], [], ..., [] ] 
   var nr = data.length;
   var nc = _.isArray(p1) ? p1[0].length : p2;

// ###################################################################
   data.sorters = {
      'date-de': function (a) { // '01.01.2013' -->   '20130101' 
         var d = a.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
         return d ? (d[3] + d[2] + d[1]) : '';
      },
      'datetime-de': function (a) { // '01.01.2013 12:36'  -->  '201301011236' 
         var d = a.match(/^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2}):(\d{2})$/);
         return d ? (d[3] + d[2] + d[1] + d[4] + d[5]) : '';
      }
   };
   data.helpers = {
      toLower: function (o) {
         return  $.type(o) === "string" ? o.toLowerCase() : o;
      }
   };

// ###################################################################

   data.fill = function (val) {
      val = val || 0;
      var n = 0;
      for (var r = 0; r < nr; r++) {
         for (var c = 0; c < nc; c++) {
            data[r][c] = _.isArray(val) ? val[n++] : val;
         }
      }
      return this;
   };

   data.zero = function () {
      return data.fill(0);
   };

   data.row = function (n) {
      return data[n];
   };

   data.rows = function (arr) {
      var d = [];
      for (var r = 0; r < nr; r++) {
         if (_.indexOf(arr, r) >= 0)
            d.push(data[r]);
      }
      return d;
   };

   data.withoutRows = function (p) { // pred-function or arr
      var d = [];
      for (var r = 0; r < nr; r++) {
         if (_.isFunction(p) ? !p(data[r]) : _.indexOf(p, r) < 0)
            d.push(data[r]);
      }
      return d;
   };

   data.col = function (n) {
      return _.map(_.range(data.length), function (r) {
         return data[r][n];
      });
   };

   data.rowCmpCols = function (coldefs) { // [ {col:1,order:asc,format:fmtfct1},{col:3, order:desc, format:fmtfct2},... ]  
      return function (r1, r2) {
         if( !_.isArray(coldefs) ) coldefs = [coldefs];
         for (var i = 0; i < coldefs.length; i++) {
            var cdef = coldefs[i];
            var bAsc = !cdef.order || cdef.order.indexOf('desc') < 0;
            var fmt = cdef.format ? data.sorters[cdef.format] : undefined;
            var x = data.helpers.toLower(r1[cdef.col]);
            var y = data.helpers.toLower(r2[cdef.col]);
            x = fmt ? fmt(x) : x;
            y = fmt ? fmt(y) : y;
            var ret = (x < y) ? -1 : ((x > y) ? 1 : 0);
            if (ret !== 0) {
               return bAsc ? ret : -ret;
            }
         }
         return 0;
      };
   };

   data.filterData = function filterData(filters) { // filters [{col: col,searchtext: text},...]
      if( !_.isArray(filters) ) filters = [filters];
      var d = [];
      for (var r = 0; r < this.length; r++) {
         var b = true;
         for (var i = 0; i < filters.length && b; i++) {
            var f = filters[i];
            var cellData = $.trim(this.row(r)[f.col]);
            var searchText = f.searchtext;
            b = b && cellData.indexOf(searchText) >= 0;
            
//            if (cellData) {
//               var rx = new RegExp(cellData, 'i');
//               b = b && rx.test(f.searchText);
//            }
         }
         if (b) {
            d.push(this[r]);
         }
      }
      return d;
   };
   return data;
};
