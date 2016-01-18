/* global _ */

var mx = function mx(m) { //  2-dimensional array -- m(atri)x
   var data = m;
// ###################################################################

   data.util = {
      toLower: function (o) {
         return  $.type(o) === "string" ? o.toLowerCase() : o;
      },
      normalizeGroupId: function (id) {
         return _.isString(id) ? id : (id <= 0 ? 0 : id);
      }
   };

// ###################################################################

   data.formats = {
      'date-de': function (a) { // '01.01.2013' -->   '20130101' 
         var d = a.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
         return d ? (d[3] + d[2] + d[1]) : '';
      },
      'datetime-de': function (a) { // '01.01.2013 12:36'  -->  '201301011236' 
         var d = a.match(/^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2}):(\d{2})$/);
         return d ? (d[3] + d[2] + d[1] + d[4] + d[5]) : '';
      },
      'scientific': function (a) { // '1e+3'  -->  '1000' 
         return parseFloat(a);
      }
   };

// ###################################################################

//   data.fill = function (val) {
//      val = val || 0;
//      var n = 0;
//      for (var r = 0; r < data.length; r++) {
//         for (var c = 0; c < row.length; c++) {
//            data[r][c] = _.isArray(val) ? val[n++] : val;
//         }
//      }
//      return this;
//   };

   data.zero = function () {
      return data.fill(0);
   };

   data.row = function (n) {
      return data[n];
   };

   data.rows = function (arr) {
      var d = [];
      for (var r = 0; r < data.length; r++) {
         if (_.indexOf(arr, r) >= 0)
            d.push(data[r]);
      }
      return d;
   };

   data.withoutRows = function (p) { // pred-function or arr
      var d = [];
      for (var r = 0; r < data.length; r++) {
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

   data.cols = function (arr) {
      var res = [];
      for (var r = 0; r < data.length; r++) {
         var row = data[r];
         var nrow = [];
         for (var c = 0; c < row.length; c++) {
            if (_.indexOf(arr, c) >= 0)
               nrow.push(row[c]);
         }
         res.push(nrow);
      }
      return res;
   };
   
   data.withoutCols = function (arr) {
      var res = [];
      for (var r = 0; r < data.length; r++) {
         var row = data[r];
         var nrow = [];
         for (var c = 0; c < row.length; c++) {
            if (_.indexOf(arr, c) < 0)
               nrow.push(row[c]);
         }
         res.push(nrow);
      }
      return res;
   };

//####################################  sorting #######################
   data.rowCmpCols = function (coldefs) { // [ {col:1,order:asc,format:fmtfct1},{col:3, order:desc, format:fmtfct2},... ]  
      coldefs = _.isArray(coldefs) ? coldefs : [coldefs];
      return function (r1, r2) {
         for (var i = 0; i < coldefs.length; i++) {
            var cdef = coldefs[i];
            var bAsc = !cdef.order || cdef.order.indexOf('desc') < 0;
            var x = data.util.toLower(r1[cdef.col]);
            var y = data.util.toLower(r2[cdef.col]);
            var fmt = cdef.format ? data.formats[cdef.format] : undefined;
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

//####################################  filtering #######################
   data.rowMatch = function rowMatch(row, filters) {
      filters = _.isArray(filters) ? filters : [filters];
      var b = true;
      for (var i = 0; i < filters.length && b; i++) {
         var f = filters[i];
         var cellData = $.trim(row[f.col]).toLowerCase();
         cellData = f.render ? f.render(cellData, row, 'filter') : cellData;
         var searchText = f.searchtext.toLowerCase();
         b = b && cellData.indexOf(searchText) >= 0;
      }
      return b;
   };

   data.isGroupingHeader = function isGroupingHeader(row, myopts) {
      return row[myopts.groupingCols.groupsort] === myopts.groupingCols.grouphead;
   };


   data.initGroups = function initGroups(myopts) { // groupingCols: {groupid:1,groupsort:0,grouphead:'HEAD'}
      var gc = myopts.groupingCols;
      for (var r = 0; gc && r < this.length; r++) {
         var row = this[r];
         var groupId = data.util.normalizeGroupId(row[gc.groupid]);
         row.isGroupHeader = row[gc.groupsort] === gc.grouphead;
         row.isGroupElement = groupId && !row.isGroupHeader;
         if (groupId)
            myopts.groups[groupId] = {isOpen: false};
      }
      return this;
   };


   data.filterData = function filterData(filters, myopts) { // filters [{col: col,searchtext: text},...]
      var d = [];
      for (var r = 0; r < this.length; r++) {
//         if (this.rowMatch(this[r], filters) || this.isGroupingHeader(this[r], myopts)) {
         if (this.rowMatch(this[r], filters)) {
            d.push(this[r]);
         }
      }
      return d;
   };

   data.filterGroups = function filterGroups(myopts) { // filters [{col: col,searchtext: text},...]
      var d = [];
      var colNrGroupId = myopts.groupingCols.groupid;
      for (var r = 0; r < this.length; r++) {
         var groupId = data.util.normalizeGroupId((this[r][colNrGroupId]));
         if (!groupId || this.isGroupingHeader(this[r], myopts) || myopts.groups[groupId].isOpen) {
            d.push(this[r]);
         }
      }
      return d;
   };

   data.aggregateLongestRow = function () {
      if (this.length === 0)
         return [];
      var res = [];
      for (var r = 0; r < this.length; r++) {
         var row = this[r];
         for (var c = 0; c < row.length; c++) {
            var s1 = '' + row[c];
            var s2 = res[c] ? res[c] : '';
            res[c] = s1.length > s2.length ? s1 : s2;
         }
      }
      this.aggrLine = res;
      console.log('aggr', res);
   };
   ///data.aggregateLongestRow();
   return data;
};
