/* global _ */
(function ($) {
  "use strict";
  $.fn.ebtable = function (opts, data, hasMoreResults) {
    var gridid = this[0].id;
    var selgridid = '#' + gridid + ' ';
    var translate = function translate(str) {
      var translation = $.fn.ebtable.lang[opts.lang || 'de'][str];
      return translation || str;
    };
    var ctrlHeight = '24px';
    var localStorageKey = 'ebtable-' + $(document).prop('title').replace(' ', '') + '-' + gridid + '-v1.0';
    var state = {// saving/loading state
      getStateAsJSON: function () {
        return JSON.stringify({
          rowsPerPage: myopts.rowsPerPage,
          colorderByName: _.map(myopts.colorder, function (idx) {
            return myopts.columns[idx].name;
          }),
          invisibleColnames: _.reduce(myopts.columns, function (acc, o) {
            if (o.invisible && !o.technical)
              acc.push(o.name);
            return acc;
          }, [])
        });
      },
      saveState: function saveState(s) {
        localStorage[localStorageKey] = s;
      },
      loadState: function loadState(s) {
        if (!s)
          return;
        var state = s;
        myopts.rowsPerPage = state.rowsPerPage;
        myopts.colorder = [];
        _.each(state.colorderByName, function (colname) {
          var n = util.indexOfCol(colname);
          if (n >= 0) {
            myopts.colorder.push(n);
          }
        });
        _.each(myopts.columns, function (coldef, idx) {
          if (!_.contains(state.colorderByName, coldef.name))
            myopts.colorder.push(idx);
        });
        _.each(state.invisibleColnames, function (colname) {
          var n = util.indexOfCol(colname);
          if (n >= 0) {
            myopts.columns[n].invisible = true;
          }
        });
      }
    };
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
        return _.filter(myopts.columns, function (o) {
          return !o.invisible;
        });
      },
      checkConfig: function checkConfig() {
        $.each(myopts.columns, function (idx, coldef) { // set reasonable defaults for coldefs
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
        if (ls && ls['colorder'] && ls['colorder'].length !== myopts.columns.length) {
          alert('Column definition and LocalStorage don\'t match!');
          localStorage[localStorageKey] = '';
          myopts = $.extend({}, defopts, opts);
        }
        $.each(myopts.columns, function (idx, coldef) {
          if (coldef.technical && !coldef.invisible)
            alert(coldef.name + ": technical column must be invisble!");
          if (coldef.mandatory && coldef.invisible)
            alert(coldef.name + ": mandatory column must be visble!");
        });
      }
    };
// ##############################################################################

    var defopts = {
      columns: [],
      flags: {filter: true, pagelenctrl: true, config: true, withsorting: true },
      bodyHeight: Math.max(200, $(window).height() - 100),
      bodyWidth: Math.max(200, $(window).width() - 10),
      rowsPerPageSelectValues: [10, 25, 50, 100],
      rowsPerPage: 10,
      colorder: _.range(opts.columns.length), // [0,1,2,... ]
      selection: false,
      saveState: state.saveState,
      loadState: state.loadState,
      sortmaster: [], //[{col:1,order:asc,sortformat:fct1},{col:2,order:asc-fix}]
      groupdefs: {}, // {grouplabel: 0, groupcnt: 1, groupid: 2, groupsortstring: 3, groupname: 4, grouphead: 'GA', groupelem: 'GB'},
      hasMoreResults: hasMoreResults
    };
    opts.flags = _.extend( defopts.flags, opts.flags );
    var myopts = $.extend({}, defopts, opts);
    var origData = mx(data, myopts.groupdefs);
    var tblData = mx(origData.slice());
    var pageCur = 0;
    var pageCurMax = Math.floor((tblData.length - 1) / myopts.rowsPerPage);

    function configBtn() {
      if (!myopts.flags.config)
        return '';
      var list = _.reduce(myopts.colorder, function (res, idx) {
        var t = '<li id="<%=name%>" class="ui-widget-content <%=cls%>"><%=name%></li>';
        var col = myopts.columns[idx];
        var cls = col.invisible ? 'invisible' : 'visible';
        return res + (col.technical || col.mandatory ? '' : _.template(t)({name: col.name, cls: cls}));
      }, '');
      var t = '<button id="configBtn">' + translate('Anpassen') + '</button>\n\
               <div id="' + gridid + 'configDlg">\n\
                  <ol id="' + gridid + 'selectable" class="selectable"><%=list%></ol>\n\
               </div>';
      return _.template(t)({list: list});
    }

    function tableHead() {
      var res = myopts.selection ? '<th><input id="checkAll" type="checkbox"></th>' : '';
      for (var c = 0; c < myopts.columns.length; c++) {
        var coldef = myopts.columns[myopts.colorder[c]];
        if (!coldef.invisible) {
          var t = '\
            <th id="<%=colid%>">\
              <div class="sort_wrapper">\
                <span/><%=colname%>\
              </div>'
                  + (myopts.flags.filter ? '<input type="text" id="<%=colid%>" title="<%=tooltip%>"/>' : '') +
                  '</th>';
          // &#8209; = non breakable hyphen
          res += _.template(t)({colname: coldef.name.replace('-', '&#8209;'), colid: coldef.id, tooltip: coldef.tooltip});
        }
      }
      return res;
    }

    function tableData(pageNr) {
      if (origData[0] && origData[0].length !== myopts.columns.length) {
        console.log('Definition and Data dont match!');
        return '';
      }

      var res = '';
      var startRow = myopts.rowsPerPage * pageNr;
      var gc = myopts.groupdefs;
      for (var r = startRow; r < Math.min(startRow + myopts.rowsPerPage, tblData.length); r++) {
        var row = tblData[r];

        if (gc && row.isGroupElement && !origData.groups[tblData[r][gc.groupid]].isOpen)
          continue

        var cls = row.isGroupElement ? 'class="group"' : '';
        cls = row.isGroupHeader ? 'class="groupheader"' : cls;
        res += '<tr>';

        var checked = !!tblData[r].selected ? ' checked="checked" ' : ' ';
        if (myopts.selection && myopts.selection.render) {
          var x = '<td ' + cls + '>' + myopts.selection.render(origData, row, checked) + '</td>';
          res += x.replace('input type', 'input id="check' + r + '"' + checked + ' type');
        } else if (myopts.selection) {
          res += '<td ' + cls + '><input id="check' + r + '" type="checkbox"' + checked + '/></td>';
        }

        var order = myopts.colorder;
        for (var c = 0; c < myopts.columns.length; c++) {
          var coldef = myopts.columns[order[c]];
          if (!coldef.invisible) {
            var x = tblData[r][order[c]];
            var v = _.isNumber(x) ? x : (x || '');
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
        return;
      var options = '';
      $.each(myopts.rowsPerPageSelectValues, function (idx, o) {
        var selected = o === myopts.rowsPerPage ? 'selected' : '';
        options += '<option value="' + o + '" ' + selected + '>' + o + '</option>\n';
      });
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
        console.log('Groupheader ' + (b ? 'selected!' : 'unselected!'), groupid, row[gc.grouplabel]);
        _.each(origData.getGroupRows(gc, groupid), function (o) {
          o.selected = b;
        });
        for (var i = 0; i < tblData.length; i++) {
          if (tblData[i][gc.groupid] === groupid) {
            $(selgridid + '#check' + i).prop('checked', b);
          }
        }
      } else {
        console.log('Row ' + (b ? 'selected!' : 'unselected!'), rowNr);
        $(selgridid + '#check' + rowNr).prop('checked', b);
      }
      myopts.onSelection && myopts.onSelection(rowNr, row, origData);
    }

    function selectRows(event) { // select row
      var checked = $(event.target).prop('checked');
      if (event.target.id === 'checkAll') {
        _.each(tblData, function (row, rowNr) {
          selectRow(rowNr, tblData[rowNr], checked);
        });
      } else {
        var rowNr = event.target.id.replace('check', '');
        selectRow(rowNr, tblData[rowNr], checked);
        $('#checkAll').prop('checked', false);
      }
    }

    function deselectRows() {
      $(selgridid + '#data input[type=checkbox]').prop('checked', false);
      if (myopts.onSelection) {
        _.each(origData, function (row, rowNr) {
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
      $(selgridid + 'thead #' + colid + ' div span').addClass('ui-icon ui-icon-triangle-1-' + (bAsc ? 'n' : 's'));
    }

    function sortToggle() {
      var sortToggleS = {'desc': 'asc', 'asc': 'desc', 'desc-fix': 'desc-fix', 'asc-fix': 'asc-fix'};
      var colidx = util.indexOfCol(myopts.sortcolname);
      var coldef = myopts.columns[colidx];
      var coldefs = $.extend([], coldef.sortmaster ? coldef.sortmaster : myopts.sortmaster);
      if (_(_(coldef.sortmaster).pluck('col')).indexOf(colidx) < 0) {
        coldefs.push({col: colidx, sortformat: coldef.sortformat, order: coldef.order});
      }
      $.each(coldefs, function (idx, o) {
        myopts.columns[o.col].order = sortToggleS[myopts.columns[o.col].order] || 'asc';
      });
    }

    function sorting(event) { // sorting
      var colid = event.currentTarget.id;
      if (colid && myopts.flags.withsorting ) {
        deselectRows();
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
        $.each(coldefs, function (idx, o) {
          o.order = myopts.columns[o.col].order || 'desc';
        });
        tblData = tblData.sort(tblData.rowCmpCols(coldefs, origData.groupsdata));
        pageCur = 0;
        redraw(pageCur);
        console.log('sorting', myopts.sortcolname);
      }
    }

    function filtering(event) { // filtering
      console.log('filtering', event, event.which);
      deselectRows();
      filterData();
      pageCur = 0;
      pageCurMax = Math.floor((tblData.length - 1) / myopts.rowsPerPage);
      redraw(pageCur);
    }

    function reloading(event) { // reloading
      if (event.which === 13 && myopts.reloadData) {
        console.log('reloading', event, event.which);
        var coldef = myopts.columns[util.indexOfCol(myopts.sortcolname)];
        var sortcrit = {};
        sortcrit[coldef.dbcol] = coldef.order;
        if (myopts.reloadData(sortcrit)) {
          pageCur = 0;
          pageCurMax = Math.floor((tblData.length - 1) / myopts.rowsPerPage);
          redraw(pageCur);
          event.preventDefault();
        }
      }
    }

    function ignoreSorting(event) {
      event.target.focus();
      return false; // ignore - sorting
    }

// ##############################################################################

    function adjustLayout() {
      //console.log('>>>adjustLayout window-width=', $(window).width(), 'body-width:', $('body').width());
      //adjust();
      //$(selgridid + '#head,#data').width(Math.floor($(window).width() - 30));
      //$(selgridid + '#divdata').width($(selgridid+'#data').width() + 14);
      //$(selgridid + '#ctrlPage1').css('position', 'absolute').css('right', "5px");
      //$(selgridid + '#ctrlPage2').css('position', 'absolute').css('right', "5px");
    }

// ##############################################################################

    function filterData() {
      var filters = [];
      $(selgridid + 'thead th input[type=text]').each(function (idx, o) {
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
      $(selgridid + '#data input[type=checkbox]').off().on('change', selectRows);
      if (withHeader) {
        $(selgridid + 'thead tr').html(tableHead());
        $(selgridid + 'thead th').off().on('click', sorting);
        $(selgridid + 'thead input[type=text]').off().on('keypress', reloading).on('keyup', filtering).on('click', ignoreSorting);
      }
      if (myopts.singleSelection) {
        $(selgridid + 'input[type=checkbox').off().on('click', function (event) {
          $(selgridid + 'input[type=checkbox').prop('checked', false);
          $(event.currentTarget).prop('checked', true);
        });
      }
      //adjustLayout();
    }

    // ##############################################################################

    function initGrid(a) {
      state.loadState(localStorage[localStorageKey] ? JSON.parse(localStorage[localStorageKey]) : null);
      if (opts.getState)
        state.loadState(opts.getState());
      util.checkConfig();

      _.each(myopts.columns, function (cdef) {
        cdef.id = cdef.name.replace(/[^\d\w]/g, '');
      });
      filterData();
      pageCurMax = Math.floor((tblData.length - 1) / myopts.rowsPerPage);
      var tableTemplate = _.template("\
        <div class='ebtable'>\n\
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
        bodyHeight: myopts.bodyHeight
      }));
      doSort();
    }

    initGrid(this);

    // #################################################################
    // Actions
    // #################################################################

    $(selgridid + '#lenctrl').selectmenu({change: function (event, data) {
        console.log('change rowsPerPage', event, data.item.value);
        myopts.rowsPerPage = Number(data.item.value);
        pageCur = 0;
        pageCurMax = Math.floor((tblData.length - 1) / myopts.rowsPerPage);
        redraw(pageCur);
        myopts.saveState(state.getStateAsJSON());
      }
    });
    $(selgridid + '#lenctrl~span').css('height', '21px');
    $(selgridid + '.firstBtn').css('height', ctrlHeight).button().on('click', function () {
      pageCur = 0;
      redraw(pageCur);
    });
    $(selgridid + '.backBtn').css('height', ctrlHeight).button().on('click', function () {
      pageCur = Math.max(0, pageCur - 1);
      redraw(pageCur);
    });
    $(selgridid + '.nextBtn').css('height', ctrlHeight).button().on('click', function () {
      pageCur = Math.min(pageCur + 1, pageCurMax);
      redraw(pageCur);
    });
    $(selgridid + '.lastBtn').css('height', ctrlHeight).button().on('click', function () {
      pageCur = pageCurMax;
      redraw(pageCur);
    });
    $(selgridid + 'thead th').off().on('click', sorting);
    $(selgridid + 'thead input[type=text]').off().on('keypress', reloading).on('keyup', filtering).on('click', ignoreSorting);
    $(selgridid + '#data input[type=checkbox]').off().on('change', selectRows);
    $(selgridid + '#configBtn').button().css('height', ctrlHeight).off().on('click', function () {
      $('#' + gridid + 'selectable').sortable();
      $('#' + gridid + 'configDlg').dialog('open');
      $('#' + gridid + 'configDlg li').off('click').on('click', function (event) {
        var col = myopts.columns[util.indexOfCol(event.target.id)];
        col.invisible = !col.invisible;
        $('#' + gridid + 'configDlg [id="' + event.target.id + '"]').toggleClass('invisible').toggleClass('visible');
        console.log('change visibility', event.target.id, 'now visible:', !col.invisible);
      });
    });
    $('#' + gridid + 'configDlg').dialog({
      create: function () {
        $('button span:contains(Abbrechen)').text(translate('Abbrechen'));
      },
      position: {my: "left top", at: "left bottom", of: selgridid + '#configBtn'},
      autoOpen: false,
      height: _.where(myopts.columns, {technical: false, mandatory: false}).length * 23 + 90,
      width: 250,
      modal: true,
      resizable: true,
      buttons: {
        "OK": function () {
          var colnames = [];
          $('#' + gridid + 'configDlg li').each(function (idx, o) {
            colnames.push($(o).prop('id'));
          });
          myopts.colorder = _.map(myopts.columns, function (col, idx) {
            return col.technical || col.mandatory ? idx : util.indexOfCol(colnames.shift());
          });
          myopts.saveState(state.getStateAsJSON());
          redraw(pageCur, true);
          $(this).dialog("close");
        },
        'Abbrechen': function () {
          $(this).dialog("close");
        }
      }
    }).parent().find('.ui-widget-header').hide();
    if (myopts.singleSelection) {
      $('input[type=checkbox').on('click', function (o) {
        $('input[type=checkbox').prop('checked', false);
        $(o.currentTarget).prop('checked', true);
      });
    }

    $(window).on('resize', function () {
      console.log('resize!!!');
      //adjustLayout();
    });

// ##########  Exports ############  
    $.extend(this, {
      toggleGroupIsOpen: function (groupid) {
        origData.groups[groupid].isOpen = !origData.groups[groupid].isOpen;
        filterData();
        var pc = pageCur;
        doSort();
        pageCurMax = Math.floor((tblData.length - 1) / myopts.rowsPerPage);
        pageCur = Math.min(pc, pageCurMax);
        redraw(0);
        redraw(pageCur);
      },
      groupIsOpen: function (groupName) {
        return _.property('isOpen')(origData.groups[groupName]);
      },
      getFilterValues: function getFilterValues() {
        var filter = {};
        $(selgridid + 'thead th input[type="text"')
                .filter(function (idx, elem) {
                  return $(elem).val().trim() !== '';
                })
                .each(function (idx, elem) {
                  filter[elem.id] = $(elem).val().trim();
                });
        return filter;
      },
      setFilterValues: function setFilterValues(filter) {
        $(selgridid + 'thead th input[type="text"').each(function (i, o) {
          $(selgridid + '#' + o.id + ' input').val(filter[o.id]);
        });
        filterData();
        pageCurMax = Math.floor((tblData.length - 1) / myopts.rowsPerPage);
        pageCur = 0;
        redraw(pageCur);
        return this;
      },
      getStateAsJSON: state.getStateAsJSON,
      loadState: state.loadState
    });
    return this.tooltip();
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
    'datetime-sec-de': function (a) { // '01.01.2013 12:36'  -->  '201301011236' 
      var d = a.match(/^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2}):(\d{2})$/);
      return d ? (d[3] + d[2] + d[1] + d[4] + d[5] + d[6]) : '';
    },
    'scientific': function (a) { // '1e+3'  -->  '1000' 
      return parseFloat(a);
    }
  };

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
    }
  };

  $.fn.ebtable.lang = {
    'de': {
    },
    'en': {
      '(<%=len%> Eintr\u00e4ge insgesamt)':
              '(<%=len%> entries)',
      '<%=start%> bis <%=end%> von <%=count%>  Eintr\u00e4gen <%= filtered %>':
              '<%=start%> to <%=end%> of <%=count%> shown entries <%= filtered %>',
      'Anpassen':
              'Configuration',
      'Abbrechen':
              'Cancel'
    }
  };
})(jQuery);