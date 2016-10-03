/* global _,jQuery,mx *//* jshint multistr: true */
(function ($) {
  "use strict";
  $.fn.ebtable = function (opts, data, hasMoreResults) {
    function log() {
      opts.debug && console.log.apply(console, [].slice.call(arguments, 0));
    }

    function translate(str) {
      return $.fn.ebtable.lang[myopts.lang][str] || str;
    }
    var dlgConfig;
    var util = {
      indexOfCol: function indexOfCol(colname) {
        return _.findIndex(myopts.columns, function (o) {
          return o.name === colname;
        });
      },
      colNameFromColid: function colNameFromColid(colid) {
        return  _.findWhere(myopts.columns, {id: colid}).name;
      },
      colColIdFromName: function colNameFromColid(colname) {
        return  _.findWhere(myopts.columns, {name: colname}).id;
      },
      colIsInvisible: function colIsInvisible(colname) {
        return _.findWhere(myopts.columns, {name: colname}).invisible;
      },
      colIsTechnical: function colIsTechnical(colname) {
        return _.findWhere(myopts.columns, {name: colname}).technical;
      },
      getRender: function getRender(colname) {
        return _.findWhere(myopts.columns, {name: colname}).render;
      },
      getMatch: function getMatch(colname) {
        var matcher = _.findWhere(myopts.columns, {name: colname}).match;
        if (!matcher)
          return $.fn.ebtable.matcher['starts-with-matches'];
        return _.isString(matcher) ? $.fn.ebtable.matcher[matcher] : matcher;
      },
      getVisibleCols: function getVisibleCols() {
        return myopts.columns.filter(function (o) {
          return !o.invisible;
        });
      },
      checkConfig: function checkConfig() {
        myopts.columns.forEach(function (coldef) { // set reasonable defaults for coldefs
          coldef.technical = coldef.technical || false;
          coldef.invisible = coldef.invisible || false;
          coldef.mandatory = coldef.mandatory || false;
          coldef.order = coldef.order || 'asc';
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
      }
    };


    var gridid = this[0].id;
    var selgridid = '#' + gridid + ' ';
    var localStorageKey = 'ebtable-' + $(document).prop('title').replace(' ', '') + '-' + gridid + '-v1.0';
    var state = {// saving/loading state
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
          colwidths: $(selgridid + 'th').map(function (i, o) {
            var id = $(o).prop('id');
            var w = $(o).width();
            var name = (_.findWhere(myopts.columns, {id: id}) || {}).name;
            log($(o).prop('id'), w, name);
            var ret = {};
            ret[name] = w;
            return ret;
          }).toArray().filter(function (o) {
            return !o.undefined;
          }).reduce(function (acc, o) {
            return o ? _.extend(acc, o) : acc;
          }, {})
        });
      },
      saveState: function saveState(s) {
        localStorage[localStorageKey] = s;
      },
      loadState: function loadState(state) {
        if (!state)
          return;
        myopts.rowsPerPage = state.rowsPerPage;
        myopts.bodyWidth = state.tableWidth;
        myopts.colorder = [];
        state.colorderByName.forEach(function (colname) {
          var n = util.indexOfCol(colname);
          if (n >= 0) {
            myopts.colorder.push(n);
          }
        });
        myopts.columns.forEach(function (coldef, idx) {
          if (!_.contains(state.colorderByName, coldef.name))
            myopts.colorder.push(idx);
          if (!_.contains(state.colwidths, coldef.name)) {
            coldef.css = 'width:' + state.colwidths[coldef.name] + 'px';
          }
        });
        state.invisibleColnames.forEach(function (colname) {
          var n = util.indexOfCol(colname);
          if (n >= 0) {
            myopts.columns[n].invisible = true;
          }
        });
      }
    };

// ##############################################################################

    var defopts = {
      columns: [],
      flags: {filter: true, pagelenctrl: true, config: true, withsorting: true},
      bodyHeight: Math.max(200, $(window).height() - 100),
      bodyWidth: Math.max(200, $(window).width() - 10),
      rowsPerPageSelectValues: [10, 25, 50, 100],
      rowsPerPage: 10,
      colorder: _.range(opts.columns.length), // [0,1,2,... ]
      selection: false,
      singleSelection: false,
      saveState: state.saveState,
      loadState: state.loadState,
      sortmaster: [], //[{col:1,order:asc,sortformat:fct1},{col:2,order:asc-fix}]
      groupdefs: {}, // {grouplabel: 0, groupcnt: 1, groupid: 2, groupsortstring: 3, groupname: 4, grouphead: 'GA', groupelem: 'GB'},
      hasMoreResults: hasMoreResults,
      jqueryuiTooltips: true,
      lang: 'de'
    };
    opts.flags = _.extend(defopts.flags, opts.flags);
    var myopts = $.extend({}, defopts, opts);
    var origData = mx(data, myopts.groupdefs);
    var tblData = mx(origData.slice());
    var pageCur = 0;
    var pageCurMax = Math.floor((tblData.length - 1) / myopts.rowsPerPage);

    function configBtn() {
      return !myopts.flags.config ? '' : '<button id ="configBtn">' + translate('Anpassen') + ' <span class = "ui-icon ui-icon-shuffle"></button>';
    }

    function tableHead() {
      var res = myopts.selection ? '<th class="selectCol"><input id="checkAll" type="checkbox"></th>' : '';
      for (var c = 0; c < myopts.columns.length; c++) {
        var coldef = myopts.columns[myopts.colorder[c]];
        if (!coldef.invisible) {
          var fld = '';
          if (myopts.flags.filter) {
            var t_inputfld = '<input type="text" id="<%=colid%>" title="<%=tooltip%>"/>';
            var t_selectfld = '<select id="<%=colid%>"><%=opts%></select>';
            var opts = (coldef.valuelist || []).reduce(function (acc, o) {
              return acc + '<option ' + o + '>' + o + '</option>';
            }, '');
            var t = coldef.valuelist ? t_selectfld : t_inputfld;
            fld = _.template(t)({colid: coldef.id, opts: opts, tooltip: coldef.tooltip});
          }
          var style = coldef.css ? ' style="' + coldef.css + '"' : '';
          var tt = '\
            <th id="<%=colid%>" <%=style%> >\n\
              <div class="sort_wrapper"><span/><%=colname%></div>\n\
              <%=fld%>\n\
             </th>';
          // &#8209; = non breakable hyphen : &#0160; = non breakable space
          res += _.template(tt)({
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
        log('Definition and Data dont match!');
        return '';
      }

      var res = '';
      var startRow = myopts.rowsPerPage * pageNr;
      var gc = myopts.groupdefs;
      for (var r = startRow; r < Math.min(startRow + myopts.rowsPerPage, tblData.length); r++) {
        var row = tblData[r];

        if (gc && row.isGroupElement && !origData.groups[tblData[r][gc.groupid]].isOpen)
          continue;

        var cls = row.isGroupElement ? 'class="group"' : '';
        cls = row.isGroupHeader ? 'class="groupheader"' : cls;
        res += '<tr>';

        var checked = !!tblData[r].selected ? ' checked="checked" ' : ' ';
        if (myopts.selection && myopts.selection.render) {
          var x = '<td ' + cls + '>' + myopts.selection.render(origData, row, checked) + '</td>';
          res += x.replace('input type', 'input id="check' + r + '"' + checked + ' type');
        } else if (myopts.selection && myopts.singleSelection) {
          res += '<td ' + cls + '><input id="check' + r + '" type="radio"' + checked + '/></td>';
        } else if (myopts.selection && !myopts.singleSelection) {
          res += '<td ' + cls + '><input id="check' + r + '" type="checkbox"' + checked + '/></td>';
        }

        var order = myopts.colorder;
        for (var c = 0; c < myopts.columns.length; c++) {
          var coldef = myopts.columns[order[c]];
          if (!coldef.invisible) {
            var xx = tblData[r][order[c]];
            var v = _.isNumber(xx) ? xx : (xx || '');
            var val = coldef.render ? coldef.render(v, row, r) : v;
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
      return '<button class="firstBtn"><span class="ui-icon ui-icon-seek-first"></button>\
              <button class="backBtn"><span  class="ui-icon ui-icon-seek-prev" ></button>\
              <button class="nextBtn"><span  class="ui-icon ui-icon-seek-next" ></button>\
              <button class="lastBtn"><span  class="ui-icon ui-icon-seek-end"  ></button>';
    }

    function infoCtrl() {
      var startRow = Math.min(myopts.rowsPerPage * pageCur + 1, tblData.length);
      var endRow = Math.min(startRow + myopts.rowsPerPage - 1, tblData.length);
      var filtered = origData.length === tblData.length ? '' : _.template(translate('(<%=len%> Eintr\u00e4ge insgesamt)'))({len: origData.length});
      var templ = _.template(translate("<%=start%> bis <%=end%> von <%=count%> Zeilen <%= filtered %>"));
      var label = templ({start: startRow, end: endRow, count: tblData.length, filtered: filtered});
      return label;
    }

    function selectRow(rowNr, row, b) { // b = true/false ~ on/off
      if (!row)
        return;
      row.selected = b;
      var gc = myopts.groupdefs;
      var groupid = row[gc.groupid];
      if (gc && groupid && row[gc.grouplabel] === gc.grouphead) {
        log('Groupheader ' + (b ? 'selected!' : 'unselected!'), groupid, row[gc.grouplabel]);
        origData.getGroupRows(gc, groupid).forEach(function (o) {
          o.selected = b;
        });
        for (var i = 0; i < tblData.length; i++) {
          if (tblData[i][gc.groupid] === groupid) {
            $(selgridid + '#check' + i).prop('checked', b);
          }
        }
      } else {
        log('Row ' + (b ? 'selected!' : 'unselected!'), rowNr);
        $(selgridid + '#check' + rowNr).prop('checked', b);
      }
      myopts.onSelection && myopts.onSelection(rowNr, row, origData);
    }

    function selectRows(event) { // select row
      log('selectRows', event);
      var checked = $(event.target).prop('checked');
      if (event.target.id === 'checkAll') {
        tblData.forEach(function (row, rowNr) {
          selectRow(rowNr, tblData[rowNr], checked);
        });
      } else {
        if (myopts.singleSelection) {
          tblData.forEach(function (row, rowNr) {
            if (row.selected)
              selectRow(rowNr, row, false);
          });
        }
        var rowNr = event.target.id.replace('check', '');
        selectRow(rowNr, tblData[rowNr], checked);
        $('#checkAll').prop('checked', false);
      }
    }

    function deselectAllRows() {
      $(selgridid + '#data input[type=checkbox]').prop('checked', false);
      if (myopts.onSelection) {
        origData.forEach(function (row, rowNr) {
          if (row.selected) {
            selectRow(rowNr, row, false);
          }
        });
      }
    }

    function showSortingIndicators() {
      var colid = util.colColIdFromName(myopts.sortcolname);
      var colidx = util.indexOfCol(myopts.sortcolname);
      var coldef = myopts.columns[colidx];
      var bAsc = coldef.order === 'asc';
      $(selgridid + 'thead div span').removeClass();
      $(selgridid + 'thead #' + colid + ' div span').addClass('ui-icon ui-icon-arrow-1-' + (bAsc ? 'n' : 's'));
    }

    function sortToggle() {
      var sortToggleS = {'desc': 'asc', 'asc': 'desc', 'desc-fix': 'desc-fix', 'asc-fix': 'asc-fix'};
      var colidx = util.indexOfCol(myopts.sortcolname);
      var coldef = myopts.columns[colidx];
      var coldefs = $.extend([], coldef.sortmaster ? coldef.sortmaster : myopts.sortmaster);
      if (_(_(coldef.sortmaster).pluck('col')).indexOf(colidx) < 0) {
        coldefs.push({col: colidx, sortformat: coldef.sortformat, order: coldef.order});
      }
      coldefs.forEach(function (o) {
        myopts.columns[o.col].order = sortToggleS[myopts.columns[o.col].order] || 'asc';
      });
    }

    function sorting(event) { // sorting
      var colid = event.currentTarget.id;
      if (colid && myopts.flags.withsorting) {
        deselectAllRows();
        myopts.sortcolname = util.colNameFromColid(colid);
        sortToggle();
        if (myopts.hasMoreResults) {
          var coldef = myopts.columns[util.indexOfCol(myopts.sortcolname)];
          var sortcrit = {};
          sortcrit[coldef.dbcol] = coldef.order;
          myopts.reloadData(sortcrit);
        } else {
          doSort();
        }
      }
    }

    function doSort() { // sorting
      if (myopts.sortcolname) {
        showSortingIndicators();
        var colidx = util.indexOfCol(myopts.sortcolname);
        var coldef = myopts.columns[colidx];
        var coldefs = $.extend([], coldef.sortmaster ? coldef.sortmaster : myopts.sortmaster);
        if (_(_(coldef.sortmaster).pluck('col')).indexOf(colidx) < 0) {
          coldefs.push({col: colidx, sortformat: coldef.sortformat, order: coldef.order});
        }
        coldefs.forEach(function (o) {
          o.order = myopts.columns[o.col].order || 'desc';
        });
        tblData = tblData.sort(tblData.rowCmpCols(coldefs, origData.groupsdata));
        pageCur = 0;
        redraw(pageCur);
        log('sorting', myopts.sortcolname);
      }
    }

    function filtering(event) { // filtering
      log('filtering', event, event.which);
      deselectAllRows();
      filterData();
      pageCur = 0;
      pageCurMax = Math.floor((tblData.length - 1) / myopts.rowsPerPage);
      redraw(pageCur);
    }

    function reloading(event) { // reloading
      if (event.which === 13 && myopts.reloadData) {
        log('reloading', event, event.which);
        var coldef = myopts.columns[util.indexOfCol(myopts.sortcolname)];
        var sortcrit = {};
        if (coldef)
          sortcrit[coldef.dbcol] = coldef.order;
        if (myopts.reloadData(sortcrit)) {
//          pageCur = 0;
//          pageCurMax = Math.floor((tblData.length - 1) / myopts.rowsPerPage);
//          redraw(pageCur);
        }
        event.preventDefault();
      }
    }

    function ignoreSorting(event) {
      event.target.focus();
      return false; // ignore - sorting
    }

// ##############################################################################

    function adjustLayout() {
      //log('>>>adjustLayout window-width=', $(window).width(), 'body-width:', $('body').width());
      //adjust();
      //$(selgridid + '#head,#data').width(Math.floor($(window).width() - 30));
      //$(selgridid + '#divdata').width($(selgridid+'#data').width() + 14);
      //$(selgridid + '#ctrlPage1').css('position', 'absolute').css('right', "5px");
      //$(selgridid + '#ctrlPage2').css('position', 'absolute').css('right', "5px");
    }

// ##############################################################################

    function filterData() {
      var filters = [];
      $(selgridid + 'thead th input[type=text],' + selgridid + 'thead th select').each(function (idx, o) {
        var val = $(o).val().trim();
        if (val) {
          var colid = $(o).attr('id');
          var colname = util.colNameFromColid(colid);
          var col = util.indexOfCol(colname);
          var ren = util.getRender(colname);
          var mat = util.getMatch(colname);
          filters.push({col: col, searchtext: $.trim(val), render: ren, match: mat});
        }
      });
      tblData = mx(origData.filterGroups(myopts.groupdefs, origData.groups));
      tblData = mx(filters.length === 0 ? tblData : tblData.filterData(filters));
      doSort();
    }

    function redraw(pageCur, withHeader) {
      $(selgridid + '#ctrlInfo').html(infoCtrl());
      $(selgridid + '#data tbody').html(tableData(pageCur));
      if (withHeader) {
        $(selgridid + 'thead tr').html(tableHead());
        $(selgridid + 'thead th').off().on('click', sorting);
        $(selgridid + 'thead input[type=text]').off().on('keypress', reloading).on('keyup', filtering).on('click', ignoreSorting);
        $(selgridid + 'thead select').off().on('change', filtering).on('click', ignoreSorting);
      }
      $(selgridid + '#data input[type=checkbox]').off().on('change', selectRows);
      $(selgridid + '#data input[type=radio]').off().on('change', selectRows);
      myopts.singleSelection && $(selgridid + '#checkAll').hide();
      myopts.afterRedraw && myopts.afterRedraw(this);
    }

    // ##############################################################################

    function initGrid(a) {
      state.loadState(localStorage[localStorageKey] ? JSON.parse(localStorage[localStorageKey]) : null);
      if (opts.getState)
        state.loadState(opts.getState());
      util.checkConfig();

      myopts.columns = myopts.columns.map(function (coldef) {
        coldef.id = coldef.name.replace(/[^\d\w]/g, '');
        return coldef;
      });

      pageCurMax = Math.floor((tblData.length - 1) / myopts.rowsPerPage);
      var tableTemplate = _.template("\
        <div class='ebtable' style='width:<%=bodyWidth%>px'>\n\
          <div class='ctrl'>\n\
            <div id='ctrlLength' style='float: left;'><%= selectLen  %></div>\n\
            <div id='ctrlConfig' style='float: left;'><%= configBtn  %></div>\n\
            <div id='ctrlPage1'  style='float: right;'><%= browseBtns %></div>\n\
          </div>\n\
          <div id='data' style='overflow-y:auto;overflow-x:auto; max-height:<%= bodyHeight %>px; width:100%'>\n\
            <table>\n\
              <thead><tr><%= head %></tr></thead>\n\
              <tbody><%= data %></tbody>\n\
            </table>\n\
          </div>\n\
          <div class='ctrl'>\n\
            <div id='ctrlInfo'  style='float: left;' class='ui-widget-content'><%= info %></div>\n\
            <div style='float: left;' class='ui-widget-content' hidden>Anzahl markierter Auftr\u00e4ge: <span id='cntSel'>0</span></div>\n\
            <div id='ctrlPage2' style='float: right;' ><%= browseBtns %></div>\n\
          </div>\n\
        </div>");

      a.html(tableTemplate({
        head: tableHead(),
        data: tableData(pageCur),
        selectLen: selectLenCtrl(),
        configBtn: configBtn(),
        browseBtns: pageBrowseCtrl(),
        info: infoCtrl(),
        bodyWidth: myopts.bodyWidth,
        bodyHeight: myopts.bodyHeight
      }));
      filterData();
      redraw(0);
    }

    initGrid(this);

    // #################################################################
    // Actions
    // #################################################################

    $(selgridid + '#lenctrl').selectmenu({change: function (event, data) {
        log('change rowsPerPage', event, data.item.value);
        myopts.rowsPerPage = Number(data.item.value);
        pageCur = 0;
        pageCurMax = Math.floor((tblData.length - 1) / myopts.rowsPerPage);
        redraw(pageCur);
        myopts.saveState && myopts.saveState(state.getStateAsJSON());
      }
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
    $(selgridid + 'thead th').off().on('click', sorting);
    $(selgridid + 'thead input[type=text]').off().on('keypress', reloading).on('keyup', filtering).on('click', ignoreSorting);
    $(selgridid + 'thead select').off().on('change', filtering).on('click', ignoreSorting);
    $(selgridid + '#data input[type=checkbox]').off().on('change', selectRows);
    $(selgridid + '#data input[type=radio]').off().on('change', selectRows);
    $(selgridid + '#configBtn').button().off().on('click', function () {
      dlgConfig(gridid);
    });
    $(selgridid + '.ebtable,' + selgridid + '.ebtable th').resizable({// resize columns
      handles: 'e',
      stop: function (evt, ui) {
        log('stopping resize!');
        myopts.saveState && myopts.saveState(state.getStateAsJSON());
        evt.stopPropagation();
      }
    });

    myopts.singleSelection && $(selgridid + '#checkAll').hide();

    $(window).on('resize', function () {
      //log('resize!!!');
      //adjustLayout();
    });

// ##########  Exports ############  
    $.extend(this, {
      toggleGroupIsOpen: function (groupid) {
        var pc = pageCur;
        origData.groups[groupid].isOpen = !origData.groups[groupid].isOpen;
        filterData();
        pageCurMax = Math.floor((tblData.length - 1) / myopts.rowsPerPage);
        pageCur = Math.min(pc, pageCurMax);
        redraw(pageCur);
      },
      groupIsOpen: function (groupName) {
        return _.property('isOpen')(origData.groups[groupName]);
      },
      getFilterValues: function getFilterValues() {
        var filter = {};
        $(selgridid + 'thead th input[type=text],' + selgridid + 'thead th select').each(function (idx, o) {
          if ($.trim($(o).val()))
            filter[o.id] = $(o).val().trim();
        });
        return filter;
      },
      setFilterValues: function setFilterValues(filter) {
        $(selgridid + 'thead th input[type=text],' + selgridid + 'thead th select').each(function (idx, o) {
          $(o).val(filter[o.id]);
        });
        filterData();
        pageCurMax = Math.floor((tblData.length - 1) / myopts.rowsPerPage);
        pageCur = 0;
        redraw(pageCur);
        return this;
      },
      getStateAsJSON: state.getStateAsJSON,
      loadState: state.loadState,
      iterateSelectedValues: function (fct) {
        tblData.filter(function (row) {
          return row.selected;
        }).forEach(fct);
      },
      getSelectedRows: function () {
        return tblData.filter(function (row) {
          return row.selected;
        });
      }
    });

    dlgConfig = function (gridid) {
      $('#' + gridid + 'configDlg').remove();
      var list = myopts.colorder.reduce(function (res, idx) {
        var t = '<li id="<%=name%>" class="ui-widget-content <%=cls%>"><%=name%></li>';
        var coldef = myopts.columns[idx];
        var cls = coldef.invisible ? 'invisible' : 'visible';
        return res + (coldef.technical || coldef.mandatory ? '' : _.template(t)({name: coldef.name, cls: cls}));
      }, '');
      var t = '\
        <div id="<%=gridid%>configDlg">\n\
          <ol id="<%=gridid%>selectable" class="ebtableSelectable"> <%= list %> </ol>\n\
        </div>';

      var dlg = $(_.template(t)({list: list, gridid: gridid}));
      var dlgopts = {
        open: function () {
          $('button:contains(Abbrechen)').text(translate('Abbrechen'));
          $('ol#' + gridid + 'selectable').sortable();
          $('#' + gridid + 'configDlg li').off('click').on('click', function (event) {
            $('#' + gridid + 'configDlg [id="' + event.target.id + '"]').toggleClass('invisible').toggleClass('visible');
            log('change visibility', event.target.id, 'now visible:', !col.invisible);
          });
        },
        position: {my: "left top", at: "left bottom", of: selgridid + '#configBtn'},
        width: 250,
        modal: true,
        resizable: true,
        closeText: 'Schlie\u00dfen',
        buttons: {
          "OK": function () {
            var colnames = [];
            $('#' + gridid + 'configDlg li.visible').each(function (idx, o) {
              myopts.columns[util.indexOfCol($(o).prop('id'))].invisible = false;
            });
            $('#' + gridid + 'configDlg li.invisible').each(function (idx, o) {
              myopts.columns[util.indexOfCol($(o).prop('id'))].invisible = true;
            });
            $('#' + gridid + 'configDlg li').each(function (idx, o) {
              colnames.push($(o).prop('id'));
            });
            myopts.colorder = myopts.columns.map(function (col, idx) {
              return col.technical || col.mandatory ? idx : util.indexOfCol(colnames.shift());
            });
            myopts.saveState && myopts.saveState(state.getStateAsJSON());
            redraw(pageCur, true);
            $(this).dialog("close");
          },
          'Abbrechen': function () {
            $(this).dialog("close");
          }
        }
      };
      dlg.dialog(dlgopts).parent().find('.ui-widget-header').hide();
    };

    return !myopts.jqueryuiTooltips ? this : this.tooltip();
  };

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

  function getFormatedDate(date) {
    var d = ('0' + date.getDate()).slice(-2);
    var m = ('0' + (date.getMonth() + 1)).slice(-2);
    var y = date.getFullYear();
    var hs = ('0' + date.getHours()).slice(-2);
    var ms = ('0' + date.getMinutes()).slice(-2);
    var ss = ('0' + date.getSeconds()).slice(-2);
    return d + '.' + m + '.' + y + ' ' + hs + ':' + ms + ':' + ss;
  }

  $.fn.ebtable.matcher = {
    'contains': function (cellData, searchTxt) {
      return cellData.indexOf(searchTxt) >= 0;
    },
    'starts-with': function (cellData, searchTxt) {
      return cellData.indexOf(searchTxt) === 0;
    },
    'matches': function (cellData, searchTxt) {
      return cellData.match(new RegExp('.*' + searchTxt, 'i'));
    },
    'starts-with-matches': function (cellData, searchTxt) {
      return cellData.match(new RegExp('^' + searchTxt.replace(/\*/g, '.*'), 'i'));
    },
    'matches-date': function (cellData, searchTxt) {
      return getFormatedDate(new Date(parseInt(cellData))).substr(10).indexOf(searchTxt) >= 0;
    },
    'matches-date-time': function (cellData, searchTxt) {
      return getFormatedDate(new Date(parseInt(cellData))).substr(16).indexOf(searchTxt) >= 0;
    },
    'matches-date-time-sec': function (cellData, searchTxt) {
      return getFormatedDate(new Date(parseInt(cellData))).indexOf(searchTxt) >= 0;
    }
  };

  $.fn.ebtable.lang = {
    'de': {
    },
    'en': {
      '(<%=len%> Eintr\u00e4ge insgesamt)': '(<%=len%> entries)',
      '<%=start%> bis <%=end%> von <%=count%>  Eintr\u00e4gen <%= filtered %>': '<%=start%> to <%=end%> of <%=count%> shown entries <%= filtered %>',
      '<%=start%> bis <%=end%> von <%=count%> Zeilen <%= filtered %>': '<%=start%> to <%=end%> of <%=count%> shown entries <%= filtered %>',
      'Anpassen': 'Configuration',
      'Abbrechen': 'Cancel'
    }
  };
})(jQuery);