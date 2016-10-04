/* global _, $ */
//  2-dimensional array -- m(atri)x
var mx = function mx(m, groupdef) {  //groupdef see below 
  var basicapi = {
    zero: function zero() {
      return m.fill(0);
    },
    row: function row(n) {
      return m[n];
    },
    rows: function rows(p) { // p = predicate-function or arr [1,4,5]
      return m.filter(function (r, idx) {
        return _.isFunction(p) ? p(m[r]) : _.indexOf(p, idx) >= 0;
      });
    },
    withoutRows: function withoutRows(p) { // p = predicate-function or arr
      return m.filter(function (r, idx) {
        return _.isFunction(p) ? !p(r) : _.indexOf(p, idx) < 0;
      });
    },
    col: function col(n) {
      return _.range(m.length).map(function (r) {
        return m[r][n];
      });
    },
    cols: function (arr) {
      var res = [];
      for (var r = 0; r < m.length; r++) {
        var row = m[r];
        var nrow = [];
        for (var c = 0; c < row.length; c++) {
          if (_.indexOf(arr, c) >= 0)
            nrow.push(row[c]);
        }
        res.push(nrow);
      }
      return res;
    },
    withoutCols: function (arr) {
      var res = [];
      for (var r = 0; r < m.length; r++) {
        var row = m[r];
        var nrow = [];
        for (var c = 0; c < row.length; c++) {
          if (_.indexOf(arr, c) < 0)
            nrow.push(row[c]);
        }
        res.push(nrow);
      }
      return res;
    }
  };

//####################################  filtering #######################
  var filtering = (function () {
    var fcts = {
      rowMatch: function rowMatch(filters) {
        return function (row) {
          filters = _.isArray(filters) ? filters : [filters];
          var b = true;
          for (var i = 0; i < filters.length && b; i++) {
            var f = filters[i];
            var cellData = $.trim(row[f.col]);
            var matchfct = f.match || $.fn.ebtable.matcher['starts-with-matches'];
            b = b && matchfct(cellData, f.searchtext, row);
          }
          return b;
        };
      },
      filterData: function filterData(filters) { // filters [{col: col, searchtext: text, render:myrenderer},...]
        return this.filter(fcts.rowMatch(filters));
      }
    };
    return {
      filterData: fcts.filterData
    };
  })();

//####################################  grouping #######################
  var grouping = (function () {
    // // groupdefs  ~ {grouplabel: 0, groupcnt: 1, groupid: 2, groupsortstring: 3, groupname: 4, grouphead: 'GA', groupelem: 'GB'}
    var fcts = {
      normalizeGroupId: function (id) {
        return id <= 0 ? 0 : id;
      },
      isGroupingHeader: function isGroupingHeader(row, groupdefs) {
        return row[groupdefs.grouplabel] === groupdefs.grouphead;
      },
      initGroups: function initGroups(groupdefs) {
        if (!groupdefs.groupid)
          return;
        var groups = {}, row, r, groupId;
        for ( r = 0; r < this.length; r++) {
          row = this[r];
          groupId = fcts.normalizeGroupId(row[groupdefs.groupid]);
          row.isGroupHeader = row[groupdefs.grouplabel] === groupdefs.grouphead;
          row.isGroupElement = groupId && !row.isGroupHeader;
          if (groupId && !groups[groupId]) {
            groups[groupId] = {isOpen: false, name: $.trim(row[groupdefs.groupname])};
          }
        }
        for ( r = 0; r < this.length; r++) {
          row = this[r];
          groupId = fcts.normalizeGroupId(row[groupdefs.groupid]);
          row[groupdefs.groupsortstring] = groupId ? (groups[groupId].name + ' ' + groupId) : row[groupdefs.groupname];
        }
        this.groups = groups;
        return this;
      },
      filterGroups: function filterGroups(groupdefs, groups) {
        return _.filter(this, function (row) {
          var groupId = fcts.normalizeGroupId((row[groupdefs.groupid]));
          return(!groupId || fcts.isGroupingHeader(row, groupdefs) || groups[groupId].isOpen);
        });
      },
      getGroupRows: function getGroupRows(groupdefs, groupid) {
        return _.filter(this, function (row) {
          return row[groupdefs.groupid] === groupid;
        });
      }
    };
    return {
      initGroups: fcts.initGroups,
      filterGroups: fcts.filterGroups,
      getGroupRows: fcts.getGroupRows
    };
  })();

  //####################################  sorting #######################
  var sorting = (function () {
    var fcts = {
      toLower: function toLower(o) {
        return _.isString(o) ? o.toLowerCase() : o;
      },
      prepareItem: function prepareItem(row, col, fmt, groups, order) {
        var v = row[col] || '';
        return fcts.toLower(fmt ? fmt(v, row, groups, order) : v);
      },
      rowCmpCols: function rowCmpCols(coldefs, groups) {
        coldefs = _.isArray(coldefs) ? coldefs : [coldefs]; // [ {col:1,order:asc,sortformat:fmtfct1},{col:3, order:desc, sortformat:fmtfct2},... ]  
        return function (r1, r2) {
          for (var i = 0; i < coldefs.length; i++) {
            var cdef = coldefs[i];
            var fmt = cdef.sortformat ? $.fn.ebtable.sortformats[cdef.sortformat] : undefined;
            var x = fcts.prepareItem(r1, cdef.col, fmt, groups, cdef.order);
            var y = fcts.prepareItem(r2, cdef.col, fmt, groups, cdef.order);
            var ret = (x < y) ? -1 : ((x > y) ? 1 : 0);
            //console.log(i, 'ret', ret, "x:", x, " y:", y);
            if (ret !== 0) {
              var bAsc = !cdef.order || cdef.order.indexOf('desc') < 0;
              return bAsc ? ret : -ret;
            }
          }
          return 0;
        };
      }
    };
    return {
      rowCmpCols: fcts.rowCmpCols
    };
  })();
  //####################################  pageing #######################
  var pageing = (function () {
    var page = 0;
    var pageSize = 10; // fcts.setPageSize(10);
    var pageMax = Math.floor((this.length - 1) / pageSize);

    var fcts = {
      setPageSize: function (n) {
        page = 0;
        pageSize = n;
        pageMax = Math.floor((this.length - 1) / n);
      },
      getCurPageData: function () {
        var startRow = pageSize * page;
        return this.rows(_.range(startRow, startRow + pageSize));
      }
    };
    return {
      pageFirst: function pageFirst() {
        page = 0;
      },
      pagePrev: function pagePrev() {
        page = Math.max(0, page - 1);
      },
      pageNext: function pageNext() {
        page = Math.min(page + 1, pageMax);
      },
      pageLast: function pageLast() {
        page = pageMax;
      },
      setPageSize: fcts.setPageSize,
      getCurPageData: fcts.getCurPageData
    };
  })();
  //#####################################################################

  var res = _.extend(m, basicapi, sorting, filtering, grouping);
  if (groupdef)
    res.initGroups(groupdef);
  return res;
};