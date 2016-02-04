/* global _ */
(function ($) {
  "use strict";
  $.fn.ebtable = function (opts, data) {
    var gridid = this[0].id;
    var selgridid = '#' + gridid + ' ';
    var translate = function translate(str) {
      var translation = $.fn.ebtable.lang[opts.lang || 'de'][str];
      return translation || str;
    };
    var ctrlHeight = '23px';
    var localStorageKey = 'ebtable-' + $(document).prop('title').replace(' ', '') + '-' + gridid;
    var util = {
      indexOfCol: function indexOfCol(colname) {
        return _.findIndex(myopts.columns, function (o) {
          return o.name === colname;
        });
      },
      colIsInvisible: function colIsInvisible(colname) {
        return _.findWhere(myopts.columns, {name: colname}).invisible;
      },
      colIsTechnical: function colIsTechnical(colname) {
        return _.findWhere(myopts.columns, {name: colname}).technical;
      },
      getVisibleCols: function getVisibleCols() {
        return _.filter(myopts.columns, function (o) {
          return !o.invisible;
        });
      },
      // saving/loading state
      saveState: function saveState() {
        localStorage[localStorageKey] = JSON.stringify({
          rowsPerPage: myopts.rowsPerPage,
          colorder: myopts.colorder,
          invisible: _.pluck(myopts.columns, 'invisible')
        });
      },
      loadState: function loadState() {
        var state = localStorage[localStorageKey] ? $.parseJSON(localStorage[localStorageKey]) : {};
        _.each(state.invisible, function (o, idx) {
          opts.columns[idx].invisible = !!o;
        });
        return state;
      },
      checkConfig: function checkConfig() {
        $.each(myopts.columns, function (idx, coldef) { // set reasonable defaults for coldefs
          coldef.technical = coldef.technical || false;
          coldef.invisible = coldef.invisible || false;
          coldef.order = coldef.order || 'asc';
        });

        if (origData[0] && origData[0].length !== myopts.columns.length) {
          alert('Data definition and column definition don\'t match!');
          localStorage[localStorageKey] = '';
          myopts = $.extend({}, defopts, opts);
        }
        if (localStorage[localStorageKey] && $.parseJSON(localStorage[localStorageKey])['colorder'].length !== myopts.columns.length) {
          alert('Column definition and LocalStorage don\'t match!');
          localStorage[localStorageKey] = '';
          myopts = $.extend({}, defopts, opts);
        }
        $.each(myopts.columns, function (idx, coldef) {
          if (coldef.technical && !coldef.invisible)
            alert(coldef.name + ": technical column must be invisble!");
        });
      }
    };
// ##############################################################################

    var defopts = {
      columns: [],
      flags: {filter: true, pagelenctrl: true, config: true},
      bodyHeight: Math.max(200, $(window).height() - 100),
      bodyWidth: Math.max(200, $(window).width() - 10),
      rowsPerPageSelectValues: [10, 25, 50, 100],
      rowsPerPage: 10,
      colorder: _.range(opts.columns.length), // [0,1,2,... ]
      selection: false,
      saveState: util.saveState,
      loadState: util.loadState,
      sortmaster: [], //[{col:1,order:asc,sortformat:fct1},{col:2,order:asc-fix}]
      groupdefs: {} // {grouplabel: 0, groupcnt: 1, groupid: 2, groupsortstring: 3, groupname: 4, grouphead: 'GA', groupelem: 'GB'},
    };
    var myopts = $.extend({}, defopts, opts, defopts.loadState());
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
        return res + (col.technical ? '' : _.template(t)({name: col.name, cls: cls}));
      }, '');
      var t = '<button id="configBtn">' + translate('Anpassen') + '</button>\n\
               <div id="' + gridid + 'configDlg">\n\
                  <ol id="' + gridid + 'selectable" class="selectable"><%=list%></ol>\n\
               </div>';
      return _.template(t)({list: list});
    }

    function tableHead() {
      var res = myopts.selection ? '<th></th>' : '';
      for (var c = 0; c < myopts.columns.length; c++) {
        var coldef = myopts.columns[myopts.colorder[c]];
        if (!coldef.invisible) {
          var t =
             '<th id="<%=colname%>">\
                <div class="sort_wrapper">\
                  <span class="ui-icon ui-icon-triangle-2-n-s"/><%=colname%>\
                </div>' +
             (myopts.flags.filter ? '<input type="text" id="<%=colname%>" title="<%=tooltip%>"/>' : '') +
             '</th>';
          res += _.template(t)({colname: coldef.name, tooltip: coldef.tooltip});
        }
      }
      return res;
    }

    function tableData(pageNr) {
      if (origData[0] && origData[0].length !== myopts.columns.length) {
        return '';
      }

      var res = '';
      var startRow = myopts.rowsPerPage * pageNr;
      var gc = myopts.groupdefs;
      for (var r = startRow; r < Math.min(startRow + myopts.rowsPerPage, tblData.length); r++) {
        var row = tblData[r];

        if (gc && row.isGroupElement && !origData.groups[tblData[r][gc.groupid]].isOpen)
          continue

        var cls = row.isGroupElement ? 'group' : '';
        cls = row.isGroupHeader ? 'groupheader' : cls;
        res += '<tr>';

        var checked = !!tblData[r].selected ? ' checked="checked" ' : ' ';
        if (myopts.selection && myopts.selection.render) {
          var x = '<td class="' + cls + '">' + myopts.selection.render(origData, row, checked) + '</td>';
          res += x.replace('input type', 'input id="check' + r + '"' + checked + ' type');
        } else if (myopts.selection) {
          res += '<td class="' + cls + '"><input id="check' + r + '" type="checkbox"' + checked + '/></td>';
        }

        var order = myopts.colorder;
        for (var c = 0; c < myopts.columns.length; c++) {
          var coldef = myopts.columns[order[c]];
          var w = coldef.width || 0;
          var style = w ? ' style="width:' + w + 'px" ' : '';
          if (!coldef.invisible) {
            var val = tblData[r][order[c]] || '';
            var render = coldef.render;
            val = render ? render(val, row) : val;
            var w = myopts.columns[order[c]].width || 0;
            var ww = w ? " width='" + w + "px'" : "";
            res += '<td class="' + cls + '"' + style + '>' + val + '</td>';
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
      var filtered = origData.length === tblData.length ? '' : _.template(translate('(gefiltert von <%=len%> Eintr\u00e4gen)'))({len: origData.length});
      var templ = _.template(translate("<%=start%> bis <%=end%> von <%=count%> Eintr\u00e4gen <%= filtered %>"));
      var label = templ({start: startRow, end: endRow, count: tblData.length, filtered: filtered});
      return label;
    }

    function selectRows(event) { // select row
      var rowNr = event.target.id.replace('check', '');
      var row = tblData[rowNr];
      if (row) {
        row.selected = $(event.target).prop('checked');
        console.log('change !', event.target.id, rowNr, row, row.selected);
        // Grouping
        var gc = myopts.groupdefs;
        if (gc && row[gc.groupid] && row[gc.grouplabel] === gc.grouphead) {
          var groupId = row[gc.groupid];
          console.log('Group', row[gc.groupid], row[gc.grouplabel]);
          for (var i = 0; i < tblData.length; i++) {
            if (tblData[i][gc.groupid] === groupId) {
              tblData[i].selected = row.selected;
              $(selgridid + '#check' + i).prop('checked', row.selected);
            }
          }
        }
      }
    }

    function sorting(event) { // sorting
      var sortToggle = {'desc': 'asc', 'asc': 'desc', 'desc-fix': 'desc-fix', 'asc-fix': 'asc-fix'};
      var colname = event.currentTarget.id;
      if (colname) {
        console.log('sorting', myopts.sortcolname);
        myopts.sortcolname = colname;
        var colidx = util.indexOfCol(myopts.sortcolname);
        var coldef = myopts.columns[colidx];
        var coldefs = $.extend([], coldef.sortmaster ? coldef.sortmaster : myopts.sortmaster);
        coldefs.push({col: colidx, sortformat: coldef.sortformat, order: coldef.order});
        $.each(coldefs, function (idx, o) {
          var c = myopts.columns[o.col];
          o.order = c.order || 'desc';
          c.order = c.order ? sortToggle[c.order] : 'asc';
        });
        var cls1 = coldef.order === 'asc' ? 'ui-icon-triangle-1-s' : 'ui-icon-triangle-1-n';
        $(selgridid + 'thead div span').removeClass('ui-icon-triangle-1-n').removeClass('ui-icon-triangle-1-s').addClass('ui-icon-triangle-2-n-s');
        $(selgridid + 'thead #' + myopts.sortcolname + ' div span').removeClass('ui-icon-triangle-2-n-s').addClass(cls1);
        doSort();
      }
    }

    function doSort() { // sorting
      if (myopts.sortcolname) {
        var colidx = util.indexOfCol(myopts.sortcolname);
        var coldef = myopts.columns[colidx];
        var coldefs = $.extend([], coldef.sortmaster ? coldef.sortmaster : myopts.sortmaster);
        coldefs.push({col: colidx, sortformat: coldef.sortformat, order: coldef.order});
        tblData = tblData.sort(tblData.rowCmpCols(coldefs, origData.groups));
        pageCur = 0;
        redraw(pageCur);
      }
    }

    function filtering(event) { // filtering
      console.log('filtering', event, event.which);
      filterData();
      pageCur = 0;
      redraw(pageCur);
    }

    function reloading(event) { // reloading
      if (event.which === 13 && myopts.reloadData) {
        console.log('reloading', event, event.which);
        myopts.reloadData();
        pageCur = 0;
        redraw(pageCur);
        event.preventDefault();
      }
    }

    function ignoreSorting(event) {
      event.target.focus();
      return false; // ignore - sorting
    }

// ##############################################################################

    function adjustLayout() {
      console.log('>>>adjustLayout window-width=', $(window).width(), 'body-width:', $('body').width());

      //adjust();
      //$(selgridid+'#head,#data').width(Math.floor($(window).width() - 30));
      //$(selgridid+'#divdata').width($(selgridid+'#data').width() + 14);
      $(selgridid + '#ctrlPage1').css('position', 'absolute').css('right', "5px");
      $(selgridid + '#ctrlPage2').css('position', 'absolute').css('right', "5px");
    }

// ##############################################################################

    function filterData() {
      var filters = [];
      $(selgridid + 'thead th input[type=text]').each(function (idx, o) {
        if ($(o).val()) {
          var colname = $(o).attr('id');
          var col = util.indexOfCol(colname);
          var render = myopts.columns[col].render;
          filters.push({col: col, searchtext: $(o).val(), render: render});
        }
      });
      tblData = mx(origData.filterGroups(myopts.groupdefs, origData.groups));
      tblData = mx(filters.length === 0 ? tblData : tblData.filterData(filters));
    }

    function redraw(pageCur, withHeader) {
      $(selgridid + '#ctrlInfo').html(infoCtrl());
      $(selgridid + '#data tbody').html(tableData(pageCur));
      $(selgridid + '#data input[type=checkbox]').on('change', selectRows);
      if (withHeader) {
        $(selgridid + 'thead tr').html(tableHead());
        $(selgridid + 'thead th:gt(0)').on('click', sorting);
        $(selgridid + 'thead input[type=text]').on('keypress', reloading).on('keyup', filtering).on('click', ignoreSorting);
      }
      adjustLayout();
    }

    // ##############################################################################

    function initGrid(a) {
      util.checkConfig();
      filterData();
      doSort();
      var tableTemplate = _.template(
         "<div class='ebtable'>\n\
                  <div class='ctrl'>\n\
                     <div id='ctrlLength' style='float: left;'><%= selectLen  %></div>\n\
                     <div id='ctrlConfig' style='float: left;'><%= configBtn  %></div>\n\
                     <div id='ctrlPage1'  style='float: right;'><%= browseBtns %></div>\n\
                  </div>\n\
                  <div id='divdata' style='overflow:auto; max-height:<%= bodyHeight %>px;'>\n\
                     <table id='data'>\n\
                        <thead><tr><%= head %></tr></thead>\n\
                        <tbody><%= data %></tbody>\n\
                     </table>\n\
                  </div>\n\
                  <div class='ctrl'>\n\
                     <div id='ctrlInfo'  style='float: left;' class='ui-widget-content'><%= infoCtrl %></div>\n\
                     <div id='ctrlPage2' style='float: right;' ><%= browseBtns %></div>\n\
                  </div>\n\
               </div>"
         );

      a.html(tableTemplate({
        head: tableHead(),
        data: tableData(pageCur),
        selectLen: selectLenCtrl(),
        configBtn: configBtn(),
        browseBtns: pageBrowseCtrl(),
        infoCtrl: infoCtrl(),
        bodyHeight: myopts.bodyHeight
      }));
      adjustLayout();
    }

    initGrid(this);

    // #################################################################
    // Actions
    // #################################################################

    $(selgridid + '#lenctrl').css('height',ctrlHeight).selectmenu({change: function (event, data) {
        console.log('change rowsPerPage', event, data.item.value);
        myopts.rowsPerPage = Number(data.item.value);
        pageCurMax = Math.floor((tblData.length - 1) / myopts.rowsPerPage);
        pageCur = 0;
        redraw(pageCur);
        myopts.saveState();
      }
    });
    $(selgridid + '.firstBtn').css('height',ctrlHeight).button().on('click', function () {
      pageCur = 0;
      redraw(pageCur);
    });
    $(selgridid + '.backBtn').css('height',ctrlHeight).button().on('click', function () {
      pageCur = Math.max(0, pageCur - 1);
      redraw(pageCur);
    });
    $(selgridid + '.nextBtn').css('height',ctrlHeight).button().on('click', function () {
      pageCur = Math.min(pageCur + 1, pageCurMax);
      redraw(pageCur);
    });
    $(selgridid + '.lastBtn').css('height',ctrlHeight).button().on('click', function () {
      pageCur = pageCurMax;
      redraw(pageCur);
    });
    $(selgridid + 'thead th:gt(0)').on('click', sorting);
    $(selgridid + 'thead input[type=text]').on('keypress', reloading).on('keyup', filtering).on('click', ignoreSorting);
    $(selgridid + '#data input[type=checkbox]').on('change', selectRows);
    $(selgridid + '#configBtn').button().css('height',ctrlHeight).on('click', function () {
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
      height: _.where(myopts.columns, {invisible: false}).length * 22 + 90,
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
            return col.technical ? idx : util.indexOfCol(colnames.shift());
          });
          myopts.saveState();
          redraw(pageCur, true);
          $(this).dialog("close");
        },
        'Abbrechen': function () {
          $(this).dialog("close");
        }
      }
    }).parent().find('.ui-widget-header').hide();

    $(window).on('resize', function () {
      console.log('resize!!!');
      adjustLayout(0);
    });

// ##########  Exports ############  
    $.extend(this, {
      toggleGroupIsOpen: function (groupid) {
        origData.groups[groupid].isOpen = !origData.groups[groupid].isOpen;
        filterData();
        doSort();
        pageCurMax = Math.floor((tblData.length - 1) / myopts.rowsPerPage);
        redraw(0);
        redraw(pageCur);
      },
      groupIsOpen: function (groupName) {
        return _.property('isOpen')(origData.groups[groupName]);
      },
      getFilterValues: function getFilterValues() {
        var filter = {};
        $(selgridid + 'thead th input[type="text"').each(function (idx, elem) {
          var val = $(elem).val().trim();
          if (val) {
            filter[elem.id] = val;
          }
        });
        return filter;
      },
      setFilterValues: function setFilterValues(filter) {
        $(selgridid + 'thead th input[type="text"').each(function (i, o) {
          $(selgridid + '#' + o.id + ' input').val(filter[o.id]);
        });
        return this;
      }
    });
    return this.tooltip();
  };

  $.fn.ebtable.sortformats = {
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

  $.fn.ebtable.lang = {
    'de': {
    },
    'en': {
      '(gefiltert von <%=len%> Eintr\u00e4gen)':
         '(filters from <%=len%> entries)',
      '<%=start%> bis <%=end%> von <%=count%> Eintr\u00e4gen <%= filtered %>':
         '<%=start%> to <%=end%> of <%=count%> entries <%= filtered %>',
      'Anpassen':
         'Configuration',
      'Abbrechen':
         'Cancel'
    }
  };

})(jQuery);