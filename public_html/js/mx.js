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

   data.sortformats = {
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
      },
      'flags': function (data) { // 5 (101)  -->  '!P' | 7 (111) -> '!*P'
         var flgs = '!*pfgksc';
         var s = '';
         for (var i = 0, j = 1; i < flgs.length; i++, j *= 2) {
            s += (data & j) ? flgs[i] : '';
         }
         return s;
      }
   };

// ###################################################################

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
   data.rowCmpCols = function (coldefs) { // [ {col:1,order:asc,sortformat:fmtfct1},{col:3, order:desc, sortformat:fmtfct2},... ]  
      coldefs = _.isArray(coldefs) ? coldefs : [coldefs];
      return function (r1, r2) {
         for (var i = 0; i < coldefs.length; i++) {
            var cdef = coldefs[i];
            var bAsc = !cdef.order || cdef.order.indexOf('desc') < 0;
            var x = r1[cdef.col] ? data.util.toLower(r1[cdef.col]) : '';
            var y = r2[cdef.col] ? data.util.toLower(r2[cdef.col]) : '';
            var fmt = cdef.sortformat ? data.sortformats[cdef.sortformat] : undefined;
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

   data.filterData = function filterData(filters) { // filters [{col: col,searchtext: text, render:myrenderer},...]
      var d = [];
      for (var r = 0; r < this.length; r++) {
         if (this.rowMatch(this[r], filters)) {
            d.push(this[r]);
         }
      }
      return d;
   };

//####################################  grouping #######################
   data.isGroupingHeader = function isGroupingHeader(row, myopts) {
      return row[myopts.groupingCols.groupsort] === myopts.groupingCols.grouphead;
   };

   data.initGroups = function initGroups(myopts) { // groupingCols: {groupid:1,groupsort:0,grouphead:'HEAD'}
      myopts.groups = [];
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

   data.filterGroups = function filterGroups(myopts) {
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

   return data;
};
