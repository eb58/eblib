/* global _,jQuery,mx *//* jshint multistr: true */ /* jshint expr: true */

(function ($) {
  "use strict";
  var sessionStorageKey = 'ebtable-' + $(document).prop('title').replace(' ', '') + '-v1.0';

  var dlgConfig = function (opts) {
    var t = '\
        <div id="<%=gridid%>configDlg">\n\
          <ol id="<%=gridid%>selectable" class="ebtableSelectable"> <%= list %> </ol>\n\
        </div>';
    var dlg = $(_.template(t)({list: opts.list, gridid: opts.gridid}));
    var dlgopts = {
      open: function () {
        $('button:contains(Abbrechen)').text(opts.cancelstring);
        $('ol#' + opts.gridid + 'selectable').sortable();
        $('#' + opts.gridid + 'configDlg li').off('click').on('click', function (event) {
          $('#' + opts.gridid + 'configDlg [id="' + event.target.id + '"]').toggleClass('invisible').toggleClass('visible');
        });
      },
      position: {my: "left top", at: "left bottom", of: opts.anchor},
      width: 250,
      modal: true,
      resizable: true,
      buttons: {
        "OK": function () {
          opts.callBack();
          $(this).dialog("destroy");
        },
        'Abbrechen': function () {
          $(this).dialog("destroy");
        }
      }
    };
    dlg.dialog(dlgopts).parent().find('.ui-widget-header').hide();
  };

  //###########################################################################################################

  $.fn.ebtable = function (opts, data, hasMoreResults) {

    var stateUtil = {// saving/loading state
      getStateAsJSON: function () {
        return JSON.stringify({
          bodyWidth: $(selgridid + '.ebtable').width(),
          rowsPerPage: myopts.rowsPerPage,
          colorderByName: myopts.colorder.map(function (idx) {
            return myopts.columns[idx].name;
          }),
          invisibleColnames: myopts.columns.reduce(function (acc, o) {
            if (o.invisible && !o.technical)
              acc.push(o.name);
            return acc;
          }, []),
          colwidths: util.getColWidths()
        });
      },
      saveState: function saveState(s) {
        localStorage[localStorageKey] = stateUtil.getStateAsJSON();
      },
      getState: function getState() {
        return localStorage[localStorageKey] ? JSON.parse(localStorage[localStorageKey]) : null;
      },
      loadState: function loadState(state) {
        if (!state)
          return;
        myopts.rowsPerPage = state.rowsPerPage;
        myopts.colorder = [];
        state.colorderByName.forEach(function (colname) {
          var n = util.colIdxFromName(colname);
          if (n >= 0) {
            myopts.colorder.push(n);
          }
        });
        myopts.columns.forEach(function (coldef, idx) {
          if (!_.contains(state.colorderByName, coldef.name))
            myopts.colorder.push(idx);
        });
        myopts.bodyWidth = state.bodyWidth;
        myopts.colwidths = state.colwidths;
        state.invisibleColnames.forEach(function (colname) {
          var n = util.colIdxFromName(colname);
          if (n >= 0) {
            myopts.columns[n].invisible = true;
          }
        });
      }
    };

    var sessionStateUtil = (function () {// saving/loading state
      var saveSessionState = function () {
        var sortcolidx = util.colIdxFromName(myopts.sortcolname);
        sessionStorage[sessionStorageKey] = JSON.stringify({
          pageCur: self.getPageCur(),
          sortcolname: myopts.sortcolname,
          sortdirection: myopts.columns[sortcolidx].sortorder,
          filters: filteringFcts.getFilterValues(),
          openGroups: getOpenGroups()
        });
      };
      return {// api
        saveSessionState: saveSessionState
      };
    })();

    // ##############################################################################

    var util = {
      translate: function translate(str) {
        return $.fn.ebtable.lang[myopts.lang][str] || str;
      },
      log: function log() {
        opts.debug && console.log.apply(console, [].slice.call(arguments, 0));
      },
      colIdxFromName: function colIdxFromName(colname) {
        return _.findIndex(myopts.columns, function (o) {
          return o.name === colname;
        });
      },
      colDefFromName: function (colname) {
        return _.findWhere(myopts.columns, {name: colname});
      },
      colIdFromName: function colNameFromId(colname) {
        return util.colDefFromName(colname).id;
      },
      colNameFromId: function colNameFromId(colid) {
        return  (_.findWhere(myopts.columns, {id: colid}) || {}).name;
      },
      colIsInvisible: function colIsInvisible(colname) {
        return util.colDefFromName(colname).invisible;
      },
      colIsTechnical: function colIsTechnical(colname) {
        return util.colDefFromName(colname).technical;
      },
      getRender: function getRender(colname) {
        return util.colDefFromName(colname).render;
      },
      getMatch: function getMatch(colname) {
        var matcher = util.colDefFromName(colname).match;
        if (!matcher)
          return $.fn.ebtable.matcher['starts-with-matches'];
        return _.isString(matcher) ? $.fn.ebtable.matcher[matcher] : matcher;
      },
      getVisibleCols: function getVisibleCols() {
        return myopts.columns.filter(function (o) {
          return !o.invisible;
        });
      },
      checkConfig: function checkConfig(myopts,origData) {
        myopts.columns.forEach(function (coldef) { // set reasonable defaults for coldefs
          coldef.technical = coldef.technical || false;
          coldef.invisible = coldef.invisible || false;
          coldef.mandatory = coldef.mandatory || false;
          coldef.sortorder = coldef.sortorder || 'asc';
        });
        if (origData[0] && origData[0].length !== myopts.columns.length) {
          alert('Data definition and column definition don\'t match!');
          localStorage[localStorageKey] = '';
          myopts = $.extend({}, defopts, opts);
        }
        var ls = localStorage[localStorageKey];
        if (ls && ls.colorder && ls.colorder.length !== myopts.columns.length) {
          alert('Column definition and LocalStorage don\'t match!');
          localStorage[localStorageKey] = '';
          myopts = $.extend({}, defopts, opts);
        }
        myopts.columns.forEach(function (coldef) {
          if (coldef.technical && !coldef.invisible)
            alert(coldef.name + ": technical column must be invisble!");
          if (coldef.mandatory && coldef.invisible)
            alert(coldef.name + ": mandatory column must be visble!");
        });
      },
      getColWidths: function getColWidths() {
        return $(selgridid + 'th').toArray().map(function (o) {
          var id = $(o).prop('id');
          var w = Math.max(20, $(o).width());
          var name = util.colNameFromId(id);
          util.log($(o).prop('id'), w, name);
          var ret = {name: name, w: w};
          return ret;
        }).filter(function (o) {
          return o.name;
        });
      }
    };

    // ##############################################################################

    var selectionFcts = {
      selectRow: function selectRow(rowNr, row, b) { // b = true/false ~ on/off
        if (!row)
          return;
        row.selected = b;
        var gc = myopts.groupdefs;
        var groupid = row[gc.groupid];
        if (gc && groupid && row[gc.grouplabel] === gc.grouphead) {
          util.log('Groupheader ' + (b ? 'selected!' : 'unselected!'), groupid, row[gc.grouplabel]);
          origData.getGroupRows(gc, groupid).forEach(function (o) {
            o.selected = b;
          });
          for (var i = 0; i < tblData.length; i++) {
            if (tblData[i][gc.groupid] === groupid) {
              $(selgridid + '#check' + i).prop('checked', b);
            }
          }
        } else {
          util.log('Row ' + (b ? 'selected!' : 'unselected!'), rowNr);
          $(selgridid + '#check' + rowNr).prop('checked', b);
        }
        myopts.selectionCol && myopts.selectionCol.onSelection && myopts.selectionCol.onSelection(rowNr, row, origData);
      },
      selectRows: function selectRows(event) { // select row
        util.log('selectRows', event);
        var checked = $(event.target).prop('checked');
        if (event.target.id === 'checkAll') {
          tblData.forEach(function (row, rowNr) {
            selectionFcts.selectRow(rowNr, tblData[rowNr], checked);
          });
        } else {
          if (myopts.selectionCol && myopts.selectionCol.singleSelection) {
            tblData.forEach(function (row, rowNr) {
              if (row.selected)
                selectionFcts.selectRow(rowNr, row, false);
            });
          }
          var rowNr = event.target.id.replace('check', '');
          selectionFcts.selectRow(rowNr, tblData[rowNr], checked);
          $(selgridid + '#checkAll').prop('checked', false);
        }
      },
      deselectAllRows: function deselectAllRows() {
        if (myopts.selectionCol && myopts.selectionCol.onSelection) {
          origData.forEach(function (row, rowNr) {
            if (row.selected) {
              selectionFcts.selectRow(rowNr, row, false);
            }
          });
        }
        $(selgridid + '#data input[type=checkbox]').prop('checked', false);
        origData.forEach(function (row) {
          row.selected = false;
        });
      },
      iterateSelectedValues: function iterateSelectedValues(fct) {
        tblData.filter(function (row) {
          return row.selected;
        }).forEach(fct);
      },
      getSelectedRows: function getSelectedRows() {
        return tblData.filter(function (row) {
          return row.selected;
        });
      },
      unselect: function unselect() {
        tblData.forEach(function (row) {
          row.selected = false;
        });
        redraw(pageCur);
      }
    };

    var sortingFcts = {
      showSortingIndicators: function showSortingIndicators() {
        var colid = util.colIdFromName(myopts.sortcolname);
        var colidx = util.colIdxFromName(myopts.sortcolname);
        var coldef = myopts.columns[colidx];
        var bAsc = coldef.sortorder === 'asc';
        $(selgridid + 'thead div span').removeClass();
        $(selgridid + 'thead #' + colid + ' div span').addClass('ui-icon ui-icon-arrow-1-' + (bAsc ? 'n' : 's'));
      },
      getSortState: function getSortState() {
        var colidx = util.colIdxFromName(myopts.sortcolname);
        var coldef = myopts.columns[colidx];
        var coldefs = $.extend([], coldef.sortmaster || myopts.sortmaster);
        if (_(_(coldef.sortmaster).pluck('col')).indexOf(colidx) < 0) {
          coldefs.push({col: colidx, sortorder: coldef.sortorder});
        }
        return coldefs;
      },
      sortToggle: function sortToggle() {
        var sortToggleS = {'desc': 'asc', 'asc': 'desc', 'desc-fix': 'desc-fix', 'asc-fix': 'asc-fix'};
        sortingFcts.getSortState().forEach(function (o) {
          myopts.columns[o.col].sortorder = sortToggleS[myopts.columns[o.col].sortorder] || 'asc';
        });
      },
      sorting: function sorting(event) { // sorting
        var colid = event.currentTarget.id;
        if (colid && myopts.flags.withsorting) {
          selectionFcts.deselectAllRows();
          myopts.sortcolname = util.colNameFromId(colid);
          sortingFcts.sortToggle();
          if (myopts.hasMoreResults && myopts.reloadData) {
            myopts.reloadData();
          } else {
            sortingFcts.doSort();
            pageCur = 0;
            redraw(pageCur);
          }
        }
      },
      doSort: function doSort() { // sorting
        if (myopts.sortcolname) {
          sortingFcts.showSortingIndicators();
          var colidx = util.colIdxFromName(myopts.sortcolname);
          var coldef = myopts.columns[colidx];
          var coldefs = $.extend([], coldef.sortmaster ? coldef.sortmaster : myopts.sortmaster);
          if (_(_(coldef.sortmaster).pluck('col')).indexOf(colidx) < 0) {
            coldefs.push({col: colidx, sortformat: coldef.sortformat, sortorder: coldef.sortorder});
          }
          coldefs.forEach(function (o) {
            o.sortorder = myopts.columns[o.col].sortorder || 'desc';
          });
          tblData = tblData.sort(tblData.rowCmpCols(coldefs, origData.groupsdata));
          util.log('sorting', myopts.sortcolname);
        }
      }
    };

    var filteringFcts = {
      getFilterValues: function getFilterValues() {
        var filter = {};
        $(selgridid + 'thead th input[type=text],' + selgridid + 'thead th select').each(function (idx, o) {
          if ($.trim($(o).val()))
            filter[o.id] = $(o).val().trim();
        });
        return filter;
      },
      setFilterValues: function setFilterValues(filter, n) {
        n = n || 0;
        if (_.keys(filter).length === 0)
          return this;
        $(selgridid + 'thead th input[type=text],' + selgridid + 'thead th select').each(function (idx, o) {
          $(o).val(filter[o.id]);
        });
        filteringFcts.filterData();
        pageCurMax = Math.floor(Math.max(0, tblData.length - 1) / myopts.rowsPerPage);
        pageCur = n;
        redraw(pageCur);
        return this;
      },
      filterData: function filterData() {
        var filters = [];
        $(selgridid + 'thead th input[type=text],' + selgridid + 'thead th select').each(function (idx, o) {
          var val = $(o).val();
          if (val && val.trim()) {
            var colid = $(o).attr('id');
            var colname = util.colNameFromId(colid);
            var col = util.colIdxFromName(colname);
            var ren = util.getRender(colname);
            var mat = util.getMatch(colname);
            filters.push({col: col, searchtext: val.trim(), render: ren, match: mat});
          }
        });
        tblData = mx(origData.filterGroups(myopts.groupdefs, origData.groupsdata));
        tblData = mx(tblData.filterData(filters));
        pageCurMax = Math.floor(Math.max(0, tblData.length - 1) / myopts.rowsPerPage);
        sortingFcts.doSort();
      },
      filtering: function filtering(event) { // filtering
        util.log('filtering', event);
        selectionFcts.deselectAllRows();
        filteringFcts.filterData();
        pageCur = 0;
        redraw(pageCur);
      }
    };

    // ##############################################################################

    var defopts = {
      columns: [],
      flags: {
        filter: true,
        pagelenctrl: true,
        config: true,
        withsorting: true,
        clearFilter: false,
        colsResizable: false,
        jqueryuiTooltips: true,
      },
      bodyHeight: Math.max(200, $(window).height() - 100),
      bodyWidth: '',
      rowsPerPageSelectValues: [10, 25, 50, 100],
      rowsPerPage: 10,
      pageCur: 0,
      colorder: _.range(opts.columns.length), // [0,1,2,... ]
      selectionCol: false, // or true or  { singleSelection = true/false,  render = function(origData, row, checked)....  }
      saveState: stateUtil.saveState,
      loadState: stateUtil.loadState,
      getState: stateUtil.getState,
      sortmaster: [], //[{col:1,sortorder:asc,sortformat:fct1},{col:2,sortorder:asc-fix}]
      groupdefs: {}, // {grouplabel: 0, groupcnt: 1, groupid: 2, groupsortstring: 3, groupname: 4, grouphead: 'GA', groupelem: 'GB'},
      openGroups: [],
      hasMoreResults: hasMoreResults,
      clickOnRowHandler: function (rowData, row) { // just for docu
        //util.log(rowData, row);
      },
      lang: 'de'
    };

    { // trimming opts param
      opts.flags = _.extend(defopts.flags, opts.flags);
      opts.saveState = opts.saveState || opts.flags.colsResizable;
      opts.saveState = typeof opts.saveState === 'boolean' && opts.saveState ? stateUtil.saveState : opts.saveState;
      opts.colwidths = [];
    }

    var gridid = this[0].id;
    var self = this;
    var selgridid = '#' + gridid + ' ';
    var localStorageKey = 'ebtable-' + $(document).prop('title').replace(' ', '') + '-' + gridid + '-v1.0';
    var myopts = $.extend({}, defopts, opts);
    var origData = mx(data, myopts.groupdefs);
    myopts.openGroups.forEach(function(gid){
      origData.groupsdata[gid].isOpen=true;
    });
    var tblData = origData;
    var pageCurMax = Math.floor(Math.max(0, origData.length - 1) / myopts.rowsPerPage);
    var pageCur = Math.min(Math.max(0, myopts.pageCur), pageCurMax);
    util.checkConfig(myopts,origData);

    if (myopts.saveState && myopts.getState) {
      myopts.loadState(myopts.getState());
    }
    myopts.columns.forEach(function (coldef) {
      coldef.id = coldef.name.replace(/[^\d\w]/g, '');
    });
    initGrid(this);
    initActions();

    function getOpenGroups() {
      return _.reduce(origData.groupsdata, function (acc, val, key) {
        if (val.isOpen){
          acc.push(parseInt(key));
        }
        return acc;
      }, []);
    }

    function initGrid(a) {
      var tableTemplate = _.template("\
        <div class='ebtable'>\n\
          <div class='ctrl'>\n\
            <div id='ctrlLength' style='float: left;'><%= selectLen  %></div>\n\
            <div id='ctrlConfig' style='float: left;'><%= configBtn  %></div>\n\
            <div id='ctrlClearFilter' style='float: left;'><%= clearFilter  %></div>\n\
            <div id='ctrlPage1'  style='float: right;'><%= browseBtns %></div>\n\
          </div>\n\
          <div id='data' style='overflow-y:auto;overflow-x:auto; max-height:<%= bodyHeight %>px; width:100%'>\n\
            <table <%= tblClass %>>\n\
              <thead><tr><%= head %></tr></thead>\n\
              <tbody><%= data %></tbody>\n\
            </table>\n\
          </div>\n\
          <div class='ctrl'>\n\
            <div id='ctrlInfo'    style='float: left;' class='ui-widget-content'><%= info %></div>\n\
            <div id='ctrlAddInfo' style='float: left;' class='ui-widget-content' hidden><%= addInfo %></div>\n\
            <div id='ctrlPage2'   style='float: right;' ><%= browseBtns %></div>\n\
          </div>\n\
        </div>");
      a.html(tableTemplate({
        head: tableHead(),
        data: '',//tableData(pageCur),
        selectLen: selectLenCtrl(),
        configBtn: configBtn(),
        clearFilter: clearFilterBtn(),
        browseBtns: pageBrowseCtrl(),
        info: ctrlInfo(),
        addInfo: ctrlAddInfo(),
        bodyWidth: myopts.bodyWidth,
        bodyHeight: myopts.bodyHeight,
        tblClass: myopts.flags.colsResizable ? 'class="ebtablefix"' : ''
      }));
      filteringFcts.filterData();
      redraw(pageCur);

      myopts.colwidths && myopts.colwidths.forEach(function (o) {
        var id = util.colIdFromName(o.name);
        $(selgridid + 'table th#' + id).width(o.w);
      });
    }

    function configBtn() {
      return myopts.flags.config ? '<button id="configBtn">' + util.translate('Anpassen') + ' <span class="ui-icon ui-icon-shuffle"></button>' : '';
    }

    function clearFilterBtn() {
      return myopts.flags.filter && myopts.flags.clearFilter ? '<button id="clearFilterBtn"><span class="ui-icon ui-icon-minus" title="' + util.translate('Alle Filter entfernen') + '"></button>' : '';
    }

    function tableHead() {
      var res = myopts.selectionCol ? '<th class="selectCol"><input id="checkAll" type="checkbox"></th>' : '';
      for (var c = 0; c < myopts.columns.length; c++) {
        var coldef = myopts.columns[myopts.colorder[c]];
        if (!coldef.invisible) {
          var fld = '';
          if (myopts.flags.filter) {
            var t_inputfld = '<input type="text" id="<%=colid%>" value="<%=filter%> "title="<%=tooltip%>"/>';
            var t_selectfld = '<select id="<%=colid%>" value="<%=filter%>"><%=opts%></select>';
            var opts = (coldef.valuelist || []).reduce(function (acc, o) {
              return acc + '<option>' + o + '</option>\n';
            }, '');
            var t = coldef.valuelist ? t_selectfld : t_inputfld;
            fld = _.template(t)({colid: coldef.id, opts: opts, tooltip: coldef.tooltip, filter: coldef.filter});
          }
          var style = coldef.css ? ' style="' + coldef.css + '"' : '';
          var hdrTemplate = '\
            <th id="<%=colid%>" <%=style%> >\n\
              <div style="display:inline-flex" ><%=colname%><span style="float:left"></span></div>\n\
              <div><%=fld%></div>\n\
             </th>';
          // &#8209; = non breakable hyphen : &#0160; = non breakable space
          res += _.template(hdrTemplate)({
            colname: coldef.name.replace(/-/g, '&#8209;').replace(/ /g, '&#0160;'),
            colid: coldef.id,
            fld: fld,
            style: style,
            tooltip: coldef.tooltip
          });
        }
      }
      return res;
    }

    function tableData(pageNr) {
      if (origData[0] && origData[0].length !== myopts.columns.length) {
        util.log('Definition and Data dont match!');
        return '';
      }

      var res = '';
      var startRow = myopts.rowsPerPage * pageNr;
      var gc = myopts.groupdefs;
      for (var r = startRow; r < Math.min(startRow + myopts.rowsPerPage, tblData.length); r++) {
        var row = tblData[r];
        if (gc && row.isGroupElement && !origData.groupsdata[tblData[r][gc.groupid]].isOpen)
          continue;
        var cls = row.isGroupElement ? 'class="group"' : '';
        cls = row.isGroupHeader ? 'class="groupheader"' : cls;
        res += '<tr>';
        var checked = !!tblData[r].selected ? ' checked="checked" ' : ' ';
        if (myopts.selectionCol) {
          if (myopts.selectionCol.render) {
            var x = '<td ' + cls + '>' + myopts.selectionCol.render(origData, row, checked) + '</td>';
            res += x.replace('input type', 'input id="check' + r + '"' + checked + ' type');
          } else if (myopts.selectionCol.singleSelection) {
            res += '<td ' + cls + '><input id="check' + r + '" type="radio"' + checked + '/></td>';
          } else if (!myopts.selectionCol.singleSelection) {
            res += '<td ' + cls + '><input id="check' + r + '" type="checkbox"' + checked + '/></td>';
          }
        }

        var colorder = myopts.colorder;
        for (var c = 0; c < myopts.columns.length; c++) {
          var coldef = myopts.columns[colorder[c]];
          if (!coldef.invisible) {
            var xx = tblData[r][colorder[c]];
            var v = _.isNumber(xx) ? xx : (xx || '');
            var val = coldef.render ? coldef.render(v, row, r, origData) : v;
            var style = coldef.css ? ' style="' + coldef.css + '"' : '';
            res += '<td ' + cls + style + '>' + val + '</td>';
          }
        }
        res += '</tr>\n';
      }
      return res;
    }

    function selectLenCtrl() {
      if (!myopts.flags.pagelenctrl)
        return '';
      var options = myopts.rowsPerPageSelectValues.reduce(function (acc, o) {
        var selected = o === myopts.rowsPerPage ? 'selected' : '';
        return acc + '<option value="' + o + '" ' + selected + '>' + o + '</option>\n';
      }, '');
      return '<select id="lenctrl">\n' + options + '</select>\n';
    }

    function pageBrowseCtrl() {
      return '<button class="firstBtn"><span class="ui-icon ui-icon-seek-first"/></button>\
              <button class="backBtn"><span  class="ui-icon ui-icon-seek-prev" /></button>\
              <button class="nextBtn"><span  class="ui-icon ui-icon-seek-next" /></button>\
              <button class="lastBtn"><span  class="ui-icon ui-icon-seek-end"  /></button>';
    }

    function ctrlInfo() {
      var startRow = Math.min(myopts.rowsPerPage * pageCur + 1, tblData.length);
      var endRow = Math.min(startRow + myopts.rowsPerPage - 1, tblData.length);
      var filtered = origData.length === tblData.length ? '' : _.template(util.translate('(<%=len%> Eintr\u00e4ge insgesamt)'))({len: origData.length});
      var templ = _.template(util.translate("<%=start%> bis <%=end%> von <%=count%> Zeilen <%= filtered %>"));
      var label = templ({start: startRow, end: endRow, count: tblData.length, filtered: filtered});
      return label;
    }

    function ctrlAddInfo() {
      return (myopts.addInfo && myopts.addInfo(myopts)) || '';
    }

    function reloading(event) { // reloading on <CR> in filter fields
      if (event.which === 13 && myopts.reloadData) {
        util.log('reloading', event, event.which);
        myopts.reloadData();
        event.preventDefault();
      }
    }

    function ignoreSorting(event) {
      event.target.focus();
      return false; // ignore - sorting
    }

    function redraw(pageCur, withHeader) {
      if (withHeader) {
        $(selgridid + 'thead tr').html(tableHead());
        initHeaderActions();
      }
      $(selgridid + '.ebtable').width(myopts.bodyWidth);
      $(selgridid + '#ctrlInfo').html(ctrlInfo());
      $(selgridid + '#ctrlAddInfo').html(ctrlAddInfo());
      $(selgridid + '#data tbody').html(tableData(pageCur));
      $(selgridid + '#data input[type=checkbox]').off().on('change', selectionFcts.selectRows);
      $(selgridid + '#data input[type=radio]').off().on('change', selectionFcts.selectRows);
      myopts.selectionCol && myopts.selectionCol.singleSelection && $(selgridid + '#checkAll').hide();
      myopts.afterRedraw && myopts.afterRedraw($(gridid));
    }

    // #################################################################
    // Actions
    // #################################################################

    function initHeaderActions() {
      $(selgridid + 'thead th').off().on('click', sortingFcts.sorting);
      $(selgridid + 'thead input[type=text]').off().on('keypress', reloading).on('keyup', filteringFcts.filtering).on('click', ignoreSorting);
      $(selgridid + 'thead select').off().on('change', filteringFcts.filtering).on('click', ignoreSorting);
      if (myopts.flags.colsResizable) {
        $(selgridid + '.ebtable').resizable({
          handles: 'e',
          minWidth: 200,
          stop: function (evt, ui) {
            myopts.saveState();
            myopts.bodyWidth = ui.size.width;
          }});
        $(selgridid + '.ebtable th').slice(myopts.selectionCol ? 1 : 0).resizable({
          handles: 'e',
          minWidth: 20,
          stop: myopts.saveState
        });
      }
    }

    function initActions() {
      $(selgridid + '#lenctrl').selectmenu({change: function (event, data) {
          util.log('change rowsPerPage', event, data.item.value);
          myopts.rowsPerPage = Number(data.item.value);
          pageCur = 0;
          pageCurMax = Math.floor(Math.max(0, tblData.length - 1) / myopts.rowsPerPage);
          redraw(pageCur);
          myopts.saveState && myopts.saveState();
        }
      });
      $(selgridid + '#configBtn').button().off().on('click', function () {
        var t = '<li id="<%=name%>" class="ui-widget-content <%=cls%>"><%=name%></li>';
        var list = myopts.colorder.reduce(function (acc, idx) {
          var coldef = myopts.columns[idx];
          return acc + (coldef.technical || coldef.mandatory ? '' : _.template(t)({name: coldef.name, cls: coldef.invisible ? 'invisible' : 'visible'}));
        }, '');
        var dlgopts = {
          list: list,
          gridid: gridid,
          cancelstring: util.translate('Abbrechen'),
          anchor: '#' + gridid + ' #configBtn',
          callBack: function () {
            $('#' + gridid + 'configDlg li.visible').each(function (idx, o) {
              myopts.columns[util.colIdxFromName($(o).prop('id'))].invisible = false;
            });
            $('#' + gridid + 'configDlg li.invisible').each(function (idx, o) {
              myopts.columns[util.colIdxFromName($(o).prop('id'))].invisible = true;
            });
            var colnames = [];
            $('#' + gridid + 'configDlg li').each(function (idx, o) {
              colnames.push($(o).prop('id'));
            });
            myopts.colorder = myopts.columns.map(function (col, idx) {
              return col.technical || col.mandatory ? idx : util.colIdxFromName(colnames.shift());
            });
            myopts.saveState && myopts.saveState();
            $('#' + gridid).ebtable(opts, data, hasMoreResults);
          }
        };
        dlgConfig(dlgopts);
      });
      $(selgridid + '.firstBtn').button().on('click', function () {
        pageCur = 0;
        redraw(pageCur);
      });
      $(selgridid + '.backBtn').button().on('click', function () {
        pageCur = Math.max(0, pageCur - 1);
        redraw(pageCur);
      });
      $(selgridid + '.nextBtn').button().on('click', function () {
        pageCur = Math.min(pageCur + 1, pageCurMax);
        redraw(pageCur);
      });
      $(selgridid + '.lastBtn').button().on('click', function () {
        pageCur = pageCurMax;
        redraw(pageCur);
      });
      $(selgridid + '#clearFilterBtn').button().off().on('click', function () {
        $(selgridid + 'thead input[type=text]').val('');
        filteringFcts.filtering();
      });
      $(selgridid + ' table tbody tr').off().on('click', function () {
        var rowData = tblData[ pageCur * myopts.rowsPerPage + $(this).index()];
        myopts.clickOnRowHandler(rowData, $(this));
      });
      $(selgridid + '#data input[type=checkbox]', selgridid + '#data input[type=radio]').off().on('change', selectionFcts.selectRows);
      $(selgridid + '.ctrl').off().on('dblclick', function (evt) {
        $(selgridid + '#data table').removeClass('ebtablefix');
        $(selgridid + '#data table th').removeAttr('style');
        var colWidths = util.getColWidths();
        colWidths && colWidths.forEach(function (o) {
          var id = util.colIdFromName(o.name);
          $(selgridid + 'table th#' + id).width(o.w);
        });
        $(selgridid + '#data table').addClass('ebtablefix');
        stateUtil.saveState();
      });

      initHeaderActions();
    }

// ##########  Exports ############  
    this.util = util;
    $.extend(this, {
      getFilterValues: filteringFcts.getFilterValues,
      setFilterValues: filteringFcts.setFilterValues,
      iterateSelectedValues: selectionFcts.iterateSelectedValues,
      getSelectedRows: selectionFcts.getSelectedRows,
      unselect: selectionFcts.unselect,
      saveSessionState: sessionStateUtil.saveSessionState,

      toggleGroupIsOpen: function (groupid) {
        origData.groupsdata[groupid].isOpen = !origData.groupsdata[groupid].isOpen;
        filteringFcts.filterData();
        pageCur = Math.min(pageCur, pageCurMax);
        redraw(pageCur);
      },
      groupIsOpen: function (groupid) {
        return _.property('isOpen')(origData.groupsdata[groupid]);
      },
      setSortColname: function (colname) {
        myopts.sortcolname = colname;
      },
      getSortColname: function () {
        return myopts.sortcolname;
      },
      getPageCur: function () {
        return pageCur;
      }
    });
    return !myopts.flags.jqueryuiTooltips ? this : this.tooltip();
  };

  // ##########  sortformats ############  

  $.fn.ebtable.sortformats = {
    'date-de': function (a) { // '01.01.2013' -->   '20130101' 
      var d = a.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
      return d ? (d[3] + d[2] + d[1]) : '';
    },
    'datetime-de': function (a) { // '01.01.2013 12:36'  -->  '201301011236' 
      var d = a.match(/^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})$/);
      return d ? (d[3] + d[2] + d[1] + d[4] + d[5]) : '';
    },
    'datetime-sec-de': function (a) { // '01.01.2013 12:36:59'  -->  '20130101123659' 
      var d = a.match(/^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2}):(\d{2})$/);
      return d ? (d[3] + d[2] + d[1] + d[4] + d[5] + d[6]) : '';
    },
    'scientific': function (a) { // '1e+3'  -->  '1000' 
      return parseFloat(a);
    }
  };

  // ##########  matcher ############ 

  $.fn.ebtable.matcher = {
    util: {
      getFormatedDate: function getFormatedDate(date) {
        var d = ('0' + date.getDate()).slice(-2);
        var m = ('0' + (date.getMonth() + 1)).slice(-2);
        var y = date.getFullYear();
        var hs = ('0' + date.getHours()).slice(-2);
        var ms = ('0' + date.getMinutes()).slice(-2);
        var ss = ('0' + date.getSeconds()).slice(-2);
        return d + '.' + m + '.' + y + ' ' + hs + ':' + ms + ':' + ss;
      }
    },
    'contains': function (cellData, searchTxt) {
      return cellData.toLowerCase().indexOf(searchTxt.toLowerCase()) >= 0;
    },
    'starts-with': function (cellData, searchTxt) {
      return cellData.toLowerCase().indexOf(searchTxt.toLowerCase()) === 0;
    },
    'matches': function (cellData, searchTxt) {
      return cellData.match(new RegExp('.*' + searchTxt, 'i'));
    },
    'starts-with-matches': function (cellData, searchTxt) {
      return cellData.match(new RegExp('^' + searchTxt.replace(/\*/g, '.*'), 'i'));
    },
    'matches-date': function (cellData, searchTxt) {
      return $.fn.ebtable.matcher.util.getFormatedDate(new Date(parseInt(cellData))).substr(10).indexOf(searchTxt) >= 0;
    },
    'matches-date-time': function (cellData, searchTxt) {
      return $.fn.ebtable.matcher.util.getFormatedDate(new Date(parseInt(cellData))).substr(16).indexOf(searchTxt) >= 0;
    },
    'matches-date-time-sec': function (cellData, searchTxt) {
      return $.fn.ebtable.matcher.util.getFormatedDate(new Date(parseInt(cellData))).indexOf(searchTxt) >= 0;
    }
  };

  // ##########  langs ############ 
  $.fn.ebtable.lang = {
    'de': {
    },
    'en': {
      '(<%=len%> Eintr\u00e4ge insgesamt)': '(<%=len%> entries)',
      '<%=start%> bis <%=end%> von <%=count%> Zeilen <%= filtered %>': '<%=start%> to <%=end%> of <%=count%> shown entries <%= filtered %>',
      'Anpassen': 'Configuration',
      'Alle Filter entfernen': 'Remove all filter',
      'Abbrechen': 'Cancel'
    }
  };

  $.fn.ebtable.loadSessionState = function () {
    var x = sessionStorage[sessionStorageKey];
    return x ? JSON.parse(x) : {};
  };

})(jQuery);