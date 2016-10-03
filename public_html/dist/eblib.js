/* global _ ,jQuery*/

(function ($) {
  "use strict";
  $.fn.ebbind = function (data, m) {
    var id = this[0].id;
    var type = this[0].type;
    var self = this;
    var $x;

    m = m || id;
    if (type === 'text' || type === 'password') {
      this.val(data[m]).on('change', function () {
        data[m] = self.val();
        console.log('changed ' + id, data[m], data);
      }).on('keyup', function () {
        data[m] = self.val();
        console.log('changed ' + id, self, data[m], data);
      });
    } else if (type === 'checkbox') {
      this.prop('checked', data[m]).on('click', function () {
        data[m] = self.prop('checked');
        console.log('changed ' + id, data[m], data);
      });
    } else if ($('select', this).length) {
      this.setSelectedValue(data[m]).on("selectmenuchange", function () {
        data[m] = self.getSelectedValue();
        console.log('select changed ' + id, data[m], data);
      });
    } else if ($('input:radio', this).length) {
      this.val(data[m]).on("change", function () {
        data[m] = self.val();
        console.log('radio changed ' + id, data[m], data);
      });
    } else if ($('textarea', this).length) {
      $x = $('textarea', this);
      $x.val(data[m], this).on('keyup', function () {
        data[m] = $x.val();
        console.log('textarea changed ' + id, data[m], data);
      });
      this.setTextAreaCounter();
    } else if ($('.ebselect', this).length) {
      $x = $('input:checkbox', this);
      if (data[m]) {
        data[m].forEach(function (v) {
          if (_.isNumber(v)) {
            $($x[v]).prop('checked', true);
          } else {
            $('#' + v.replace(/ /g, ''), self).prop('checked', true);
          }
        });
      }
      $x.on('click', function () {
        data[m] = self.getSelectedValuesAsString();
        console.log('textarea changed ' + id, data[m], data);
      });
    }
    return this;
  };
})(jQuery);

/*################################################*/

/* global _,jQuery *//* jshint expr: true */
(function ($) {
  $.fn.ebdropdown = function (opts, values, selected) {
    // values = ['val1', 'val2', 'val3' ];
    // values = [{v:1, txt:'val1'}, {v:2, txt:'val2'} ];
    if( !this || !this[0] ){
      return;
    }
    var id = this[0].id;
    var defopts = {
      id: id + 'X',
      width: '100%',
      disabled: false,
      jqueryui: true,
      change: function (evt, ui) {}
    };
    var myopts = $.extend({}, defopts, opts);
    var idX = '#' + myopts.id;
    
    var setSelectedValue = function (v) {
      if (v) {
        var cmp = '' + (v.txt || v.v || v);
        $(idX + ' option').filter(function (i, o) {
          if (v.txt){
            return $(o).text() === v.txt;
          }else if (v.v){
            return $(o).val() === v.v;
          }else{
            return $(o).text() === cmp || $(o).val() === cmp;
          }
        }).prop("selected", "selected");
        myopts.jqueryui && $(idX).selectmenu().selectmenu('refresh');
      }
      return this;
    };
    var getSelectedValue = function () {
      var v = $(idX).val();
      return v && v !== 'null' ? v : null;
    };

    var init = function init(a) {
      var options = _.map(values, function (o) {
        var val = typeof o.txt !== 'undefined' ? ' value=' + o.v : '';
        var txt = typeof o.txt !== 'undefined' ? o.txt : o;
        return '<option' + val + '>' + txt + '</option>';
      }).join('\n');
      var t = _.template('<select id="<%=id%>" name="<%=id%>" size="1"><%= o %> </select>');
      a.html(t({id: myopts.id, w: myopts.width, o: options}));
      setSelectedValue(selected);
      if (myopts.jqueryui) {
        $(idX).selectmenu().selectmenu(myopts);
        myopts.disabled && $(idX).selectmenu('disable');
      } else {
        myopts.disabled && $(idX).prop('disabled', true);
        $(idX).change(myopts.change).width(myopts.width);
      }
    };
    init(this);
    this.setSelectedValue = setSelectedValue;
    this.getSelectedValue = getSelectedValue;
    return this;
  };
})(jQuery);


/*################################################*/

/* global _,jQuery */
/*jshint multistr: true */
(function ($) {
  "use strict";
  $.fn.eblist = function (opts, vals) { 
    var id = this[0].id;
    var defopts = {
      height: Math.min(100, 50 * vals.length),
      width: 400
    };
    var myopts = $.extend({}, defopts, opts);

    (function(a) {
      var options = _.reduce(vals, function (acc, o) {
        return acc + _.template('<li><%=val%></li>')({val: o });
      }, '');

      var s = _.template('\n\
            <div class="eblist" style="height:<%=height%>px; width:<%=width%>px;">\n\
              <ul> <%=options%> </ul>\n\
            </div>\n')({options: options, width: myopts.width, height: myopts.height});
      a.html(s);
    })(this);

    this.id = id;
    return this;
  };
})(jQuery);

/*################################################*/

/* global _, jQuery*/
/*jshint multistr: true */
(function ($) {
  "use strict";
  $.fn.ebradio = function (opts, vals, choice) {
    var id = this[0].id;
    var defopts = {
      vertical: false,
      width: 400,
      icon: false
    };
    var myopts = $.extend({}, defopts, opts);

    (function (a) {
      var options = _.reduce(vals, function (acc, o) {
        return acc + _.template('<label><input type="radio" id="<%=val%>" name="<%=name%>"><%=val%></label><%=vertical%>')
                ({name: id, val: o, vertical: myopts.vertical ? '<br>' : ''});
      }, '');

      var s = _.template('\
            <div class="ebradio">\n\
              <%=options%>\n\
            </div>\n')({options: options});
      a.html(s);
    })(this);
    $('#' + id + " input").checkboxradio(myopts);
    this.id = id;
    this.val = function val(choice) {
      if (_.isString(choice) || _.isNumber(choice)) {
        $('#' + id + ' #' + choice).prop('checked', true).checkboxradio("refresh");
        return this;
      } else{
        return $('#' + id + ' input:radio:checked').prop('id');
      }
    };
    return this;
  };
})(jQuery);

/*################################################*/

/* global _, jQuery */ /* jshint multistr: true *//* jshint expr: true */
(function ($) {
  "use strict";
  $.fn.ebselect = function (opts, selected) {  
    // selected = 
    //  [1,3]  
    // or 
    //  ['Keyword1', 'Keyword3'] 
    // or  
    //  [
    //   {v: 9, txt: 'Besonderheit1'},
    //   {v: 2, txt: 'Besonderheit2'},
    //   {v: 6, txt: 'Besonderheit3'}
    //  ]
    selected = selected || [];
    var id = this[0].id;
    var self = this;
    var defopts = {
      height: Math.min(100, 50 * opts.values.length),
      width: 400,
      values: [{v: '1', txt: 'test1'}, {v: '2', txt: 'test2'}], //  just an example for docu
      onselchange: function (o) {
        console.log("selected values:" + o.getSelectedValues());
      }
    };
    var myopts = $.extend({}, defopts, opts);

    this.id = id;
    myopts.values = _.map(myopts.values, function (key, val) {
      return _.isString(key) ? {v: val, txt: key} : key;
    });
    if( selected.length ){
      if( _.isNumber(selected[0]) ){
        _.each(myopts.values, function (val) { val.selected = _.indexOf(selected, val.v) >= 0; }); 
      }else{
        _.each(myopts.values, function (val) { val.selected = _.indexOf(selected, val.txt) >= 0; }); 
      }
    }

    (function (a) {
      var options = _.reduce(myopts.values, function (acc, o) {
        var isselected = o.selected ? 'checked="checked"' : '';
        return acc + _.template('\
               <li>\
                 <input type="checkbox" id="<%=id%>" value="<%=value%>" <%=isselected%> /><%=txt%>\n\
               </li>')({id: o.txt.replace(/ /g,''), value: o.v, isselected: isselected, txt: o.txt});
      }, '');
      var s = _.template('\
            <div class="ebselect" style="height:<%=height%>px; width:<%=width%>px;">\n\
              <ul> <%=options%> </ul>\n\
            </div>\n')({options: options, width: myopts.width, height: myopts.height});
      a.html(s);
      myopts.disabled && $('#' + id + ' input' ).prop('disabled', true);
    })(this);

    this.getSelectedValues = function getSelectedValues() {
      return _.pluck($('#' + id + ' .ebselect input:checked'), 'value');
    };
    this.getSelectedValuesAsString = function getSelectedValues() {
      return _.map(this.getSelectedValues(), function (o, idx) {
        return _.findWhere(myopts.values,{v:parseInt(o)}).txt;
      });
    };
    $('#' + id + ' .ebselect input').on('change', function () {
      myopts.onselchange(self);
    });
    myopts.onselchange(this);
    return this;
  };
})(jQuery);

/*################################################*/

/* global _,jQuery,mx *//* jshint multistr: true */ /* jshint expr: true */
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
      myopts.afterRedraw && myopts.afterRedraw($(gridid));
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

/*################################################*/

/* global ebutils, _, jQuery*/ /* jshint multistr: true */

(function ($) {
  "use strict";

  $.fn.ebtextarea = function (opts) {
    var id = this[0].id;
    var defopts = {
      title: {text: 'Test', fontSize: '12px', pos: 'top'},
      counter: {fontSize: '8px', pos: 'bottom'},
      nrRows: 5, // # of lines in textarea
      nrCols: 30, // # of cols in textarea
      maxByte: 1000000
    };
    var myopts = $.extend({}, defopts, opts);

    var setTextAreaCounter = function () {
      var bc = ebutils.byteCount($('#' + id + ' textarea').val());
      $('#' + id + ' .ebtextareacnt').text('(' + bc + '/' + myopts.maxByte + ')');
    };

    var top = '<div>' + (myopts.title.pos === 'top' ? '<span class="ebtextareatitle">' + myopts.title.text + '&nbsp;&nbsp;</span>' : '') + (myopts.counter.pos === 'top' ? '<span class="ebtextareacnt"><span>' : '') + '</div>';
    var bottom = '<div>' + (myopts.title.pos === 'bottom' ? '<span class="ebtextareatitle">' + myopts.title.text + '&nbsp;&nbsp;</span>' : '') + (myopts.counter.pos === 'bottom' ? '<span class="ebtextareacnt"></span>' : '') + '</div>';
    var s = _.template('\
      <div class="ebtextarea">\n\
        <%=top%>\n\
        <textarea rows="<%=rows%>" cols="<%=cols%>"></textarea>\n\
        <%=bottom%>\n\
      </div>\n')({rows: myopts.nrRows, cols: myopts.nrCols, top: top, bottom: bottom});

    $(this).html(s);
    $('#' + id + ' textarea').on("keyup", function () {
      var s = $('#' + id + ' textarea').val();
      var bc = ebutils.byteCount(s);
      if (bc > myopts.maxByte) {
        $.alert('Warnung', 'Maximal erlaubte Textl\u00e4nge erreicht.\nText wird abgeschnitten.');
        while ((bc = ebutils.byteCount(s)) > myopts.maxByte) {
          s = s.slice(0, -1);
        }
        $(this).val(s);
      }
      setTextAreaCounter();
    });
    setTextAreaCounter();
    $('#' + id + ' .ebtextareatitle').css('font-size', myopts.counter.fontSize);
    $('#' + id + ' .ebtextareacnt').css('font-size', myopts.counter.fontSize);
    this.setTextAreaCounter = setTextAreaCounter;
    return this;
  };
})(jQuery);        

/*################################################*/

var ebutils = (function () {
  "use strict";
  function formatBytes(bytes, decimals) {
    if (bytes === 0)
      return '0 Byte';
    var k = 1024;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return (parseFloat((bytes / Math.pow(k, i)).toFixed(decimals || 2)) + ' ' + sizes[i]).replace('.', ',');
  }

  function byteCount(str) {
    function fixedCharCodeAt(str, idx) {
      idx = idx || 0;
      var code = str.charCodeAt(idx);
      if (0xD800 <= code && code <= 0xDBFF) { // High surrogate (could change last hex to 0xDB7F to treat high private surrogates as single characters)
        var hi = code;
        var low = str.charCodeAt(idx + 1);
        if (isNaN(low))
          throw 'Kein g\u00fcltiges Schriftzeichen oder Speicherfehler!';
        return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
      }
      if (0xDC00 <= code && code <= 0xDFFF) { // Low surrogate
        return false;
      }
      return code;
    }

    var result = 0;
    for (var n = 0; n < str.length; n++) {
      var charCode = fixedCharCodeAt(str, n);
      if (typeof charCode === "number") {
        if (charCode < 128) {
          result = result + 1;
        } else if (charCode < 2048) {
          result = result + 2;
        } else if (charCode < 65536) {
          result = result + 3;
        } else if (charCode < 2097152) {
          result = result + 4;
        } else if (charCode < 67108864) {
          result = result + 5;
        } else {
          result = result + 6;
        }
      }
    }
    return result;
  }

  function getMimetypeByExt(ext) {
    var extToMimes = {
      'img': 'image/jpeg',
      'gif': 'image/gif',
      'png': 'image/png',
      'tif': 'image/tif',
      'tiff': 'image/tiff',
      'jpg': 'image/jpg',
      'jepg': 'image/jepg',
      'pdf': 'application/pdf',
      'txt': 'text/plain',
      'doc': 'application/msword',
      'xls': 'application/msexcel',
      'docx': 'application/vnd.openxmlformats-officedocument'
    };
    return extToMimes[ext] || 'unknown';
  }

  return {
    byteCount: byteCount,
    formatBytes: formatBytes,
    getMimeByExt: getMimetypeByExt,
  };
})();



/*################################################*/

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
