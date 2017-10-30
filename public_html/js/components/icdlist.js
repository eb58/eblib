/* global _, jQuery, datepickerOptions, icdUtils */ /* jshint multistr: true *//* jshint expr: true */
(function ($) {
  "use strict";
  $.fn.icdlist = function (icds, opts) {
    var id = this[0].id;

//	- effective = false -> Vorangegangene Diagnosen
//	- effective = true 
//		- icdForAssoc = true  -> ZUS  die eine Diagnose oben auf Reiter
//		- icdForAssoc = true oder false -> AU
//		- icd is founding = true oder false -> AU

    var predefinedFilters = {
      ZU: [{col: 2, searchtext: '0'}, {col: 3, searchtext: '0'}], // ZUS unten 'Vorangegangen Diagnosen'          : effective:false,
      ZO: [{col: 2, searchtext: '1'}, {col: 3, searchtext: '1'}], // ZUS oben  'Diagnose zur ZusammenhÃ¤ngigkeit'  : effective:true, icdForAssoc:true
      AU: [{col: 2, searchtext: '1'}], // Au                                                                      : effective:true, icdForAssoc:egal 
    };

    var invisibleColumns = {
      ZU: [7],
      ZO: [5, 7],
      AU: [1, 2, 5, 6],
    };

    var defopts = {
      additem: true,
      disable: false,
      isDta: true,
      type: 'AU', // ZUSoben, ZUSunten
      predefinedFilters: predefinedFilters['AU'],
    };
    var myopts = $.extend({}, defopts, opts);
    myopts.predefinedFilters = predefinedFilters[myopts.type];

    var tbldata;

    function initTable(icds) {

      if (myopts.type === 'ZO') {
        var validIcds4ZO = icds.filter(function (icd) {
          return icd.effective && icd.icdForAssoc;
        });
        if (myopts.isDta) {
          $('#' + id + ' .fa-plus-circle').hide();
          if (validIcds4ZO.length > 0 && validIcds4ZO[0].digital) {
            myopts.disable = true;
          }
        }
        if (validIcds4ZO.length > 0) {
          $('#' + id + ' .fa-plus-circle').hide();
        } else {
          $('#' + id + ' .fa-plus-circle').show();
        }
      }
      if (myopts.type === 'ZU' && myopts.isDta) {
        $('#' + id + ' .fa-plus-circle').hide();
      }

      tbldata = icds.map(function (icd, idx) {
        return [
          idx,
          icd,
          icd['effective'] ? '1' : '0',
          icd['icdForAssoc'] ? '1' : '0',
          icd['icd-code-id'],
          icd['begin'],
          icd['end'],
          icd['icd-code-number'],
          icd['text'],
          icd['associated'],
          icd['servicerenderer-fullname'],
          icd['founding'],
          'trash'
        ];
      });

      $('#icd' + id + 'grid').ebtable(tblopts, tbldata);

      $('#' + id + ' .fa-plus-circle').off().on('click', function () {
        var icdForAssoc = myopts.type === 'ZO';
        var effective = myopts.type !== 'ZU';
        var newicd = {
          'icd-code-id': null,
          'icd-code-number': null,
          'text': null,
          'digital': false,
          'icdForAssoc': icdForAssoc,
          'effective': effective,
          'begin': null,
          'end': null,
          'associated': false,
          'servicerenderer-fullname': '',
          'founding': false
        };
        icds.push(newicd);
        initTable(icds);
      });
    }

    var afterRedraw = function () {
      $('#' + id + ' .datum').datepicker(datepickerOptions).each(function (idx, elem) {
        $(elem).off().on('change', function (evt) {
          var arr = evt.target.id.split('-');
          var type = arr[0].contains('audatefrom') ? 'begin' : 'end';
          var rownr = Number(arr[1]);
          var icd = icds[rownr];
          icd[type] = $(elem).val();
          tbldata[rownr] = $(elem).val();
        });
      });
      $('#' + id + ' .diagnosecode').each(function (idx, elem) {
        $(elem).off().on('blur', function (evt) {
          var icdCodeNumber = evt.target.value.trim().toUpperCase();
          if (!icdCodeNumber)
            return;
          var n = Number(evt.target.id.replace(/.*-/, ''));
          var icdCode = icdUtils.getIcdCodeFromNumber(icdCodeNumber);
          if (icdCode) {
            icds[n] = icds[n] || {'icd-code-id': null, 'icd-code-number': null, digital: false};
            icds[n]['icd-code-id'] = icdCode.id;
            icds[n]['icd-code-number'] = icdCodeNumber;
            icds[n]['text'] = icdCodeNumber === '---.-' ? ('#' + id + 'icdtext-' + n).val() : icdCode.text;
            $('#' + id + 'icdtext-' + n).val(icdCode.text);
          }
        });
      });
      $('#' + id + ' i.fa-search').each(function (idx, elem) {
        $(elem).off().on('click', function (evt) {
          var n = Number(evt.target.id.replace(/.*-/, ''));
          dlgIcd( icdUtils.getIcdData(), function (code, text, icdid) {
            icds[n] = icds[n] || {'icd-code-id': null, 'icd-code-number': null, digital: false};
            icds[n]['icd-code-id'] = icdid;
            icds[n]['icd-code-number'] = code;
            icds[n]['text'] = code === '---.-' ? $('#icdtext' + n).val() : text;
            $('#' + id + 'icdcode-' + n).val(icds[n]['icd-code-number']);
            $('#' + id + 'icdtext-' + n).val(icds[n]['text']);
            return true;
          }, {
            icdCode: $('#' + id + 'icdcode-' + n).val(),
            icdText: $('#' + id + 'icdtext-' + n).val(),
          }
          );
        });
      });
      $('#' + id + ' .diagnosetext').each(function (idx, elem) {
        $(elem).off().on('change', function (evt) {
          var n = Number(evt.target.id.replace(/.*-/, ''));
          icds[n]['text'] = $(elem).val();
        });
      });
      $('#' + id + ' .arzt').each(function (idx, elem) {
        $(elem).off().on('change', function (evt) {
          var n = Number(evt.target.id.replace(/.*-/, ''));
          icds[n]['servicerenderer-fullname'] = $(elem).val();
        });
      });
      $('#' + id + ' .zshg').each(function (idx, elem) {
        $(elem).off().on('click', function (evt) {
          var n = Number(evt.target.id.replace(/.*-/,''));
          icds[n]['associated'] = $(elem).prop('checked');
        });
      });
      $('#' + id + ' .founding').each(function (idx, elem) {
        $(elem).off().on('click', function (evt) {
          var n = Number(evt.target.id.replace(/.*-/,''));
          icds[n]['founding'] = $(elem).prop('checked');
        });
      });
      $('#' + id + ' i.fa-trash-o').each(function (idx, elem) {
        $(elem).off().on('click', function (evt) {
          var n = Number(evt.target.id.replace(/.*-/, ''));
          icds.splice(n, 1);
          initTable(icds);
        });
      });
      $('#icd' + id + 'grid .ebtable td:nth-child(1) input').css('width', '66%');
      $('#icd' + id + 'grid .ebtable td:nth-child(2) input').css('width', '66%');
      $('#icd' + id + 'grid .ebtable td:nth-child(3) input').css('width', '70%');
      $('#icd' + id + 'grid .ebtable td:nth-child(4) input').css('width', '99%');
      $('#icd' + id + 'grid .ebtable td:nth-child(5) input').css('width', '99%');
      $('#icd' + id + 'grid .ebtable td:nth-child(6) input').css('width', '99%');
      $('#icd' + id + 'grid .ebtable td:nth-child(7) input').css('width', '40%');
      $('#icd' + id + 'grid .ebtable td:nth-child(1)').css('width', '105px');
      $('#icd' + id + 'grid .ebtable td:nth-child(2)').css('width', '105px');
      $('#icd' + id + 'grid .ebtable td:nth-child(3)').css('width', '90px');
      $('#icd' + id + 'grid .ebtable td:nth-child(5)').css('width', '50px');
      $('#icd' + id + 'grid .ebtable td:nth-child(7)').css('width', '16px');
      $('#icd' + id + 'grid .ebtable td:nth-child(8)').css('width', '16px');
      $('#icd' + id + 'grid .ebtable .ctrl').hide();

      var invisCols = invisibleColumns[myopts.type];
      invisCols.forEach(function (col) {
        $('#icd' + id + 'grid .ebtable th:nth-child(' + col + ')').css('display', 'none');
        $('#icd' + id + 'grid .ebtable td:nth-child(' + col + ')').css('display', 'none');
      });

      if (myopts.disable) {
        $('#' + id + ' input').prop('disabled', true);
        $('#' + id + ' img.ui-datepicker-trigger').hide();
      }
      if (myopts.type === 'ZU' && myopts.isDta && !myopts.readonly) {
        $('#' + id + ' input').prop('disabled', true);
        $('#' + id + ' input:checkbox').prop('disabled', false);
        $('#' + id + ' img.ui-datepicker-trigger').hide();
      }
    };

    var renderer = {
      audatefrom: function (data, row) {
        return '<input class="datum" type="text" id="' + id + 'audatefrom-' + row[0] + '" value="' + data + '">';
      },
      audateuntil: function (data, row) {
        return '<input class="datum" type="text" id="' + id + 'audateuntil-' + row[0] + '" value="' + data + '">';
      },
      diagnose: function (data, row) {
        return '<input class="diagnosecode" type="text" id="' + id + 'icdcode-' + row[0] + '" value="' + data + '">' + (myopts.disable || row[1].digital ? '' : '&nbsp;<i id="icdsearch-' + row[0] + '" class="fa fa-search fa-lg"></i>');
      },
      diagnosetext: function (data, row) {
        return '<input class="diagnosetext" type="text" id="' + id + 'icdtext-' + row[0] + '" value="' + data + '">';
      },
      zshg: function (data, row) {
        return '<input class="zshg" type="checkbox" id="' + id + 'zshg-' + row[0] + '" ' +  (data ?' checked="true"':'') + '">';
      },
      founding: function (data, row) {
        return '<input class="founding" type="checkbox" id="' + id + 'founding-' + row[0] + '" ' +  (data ?' checked="true"':'') + '">';
      },
      arzt: function (data, row) {
        return '<input class="arzt" type="text" id="' + id + 'arzt-' + row[0] + '" value="' + data + '">';
      },
      trash: function (data, row) {
        var isZusAU = myopts.type === 'AU' && row[1].effective && row[1].icdForAssoc;
        return row[1].digital || myopts.disable || isZusAU ? '<span>&nbsp;</span>' : '&nbsp;<i id="' + id + 'icdtrash-' + row[0] + '" class="fa fa-trash-o fa-lg"></i>';
      },
    };

    var tblopts = {
      flags: {filter: false, pagelenctrl: false, config: false, withsorting: false},
      columns: [
        {name: 'idx', invisible: true},
        {name: 'icd', invisible: true},
        {name: 'effective', invisible: true},
        {name: 'icdForAssoc', invisible: true},
        {name: 'icdcode', invisible: true},
        {name: 'AU seit', render: renderer.audatefrom},
        {name: 'AU bis', render: renderer.audateuntil},
        {name: 'Code', render: renderer.diagnose},
        {name: 'Diagnosetext', render: renderer.diagnosetext},
        {name: 'Zshg', render: renderer.zshg},
        {name: 'Arzt', render: renderer.arzt},
        {name: 'AU begr\u00fcndend', render: renderer.founding},
        {name: '', render: renderer.trash},
      ],
      afterRedraw: afterRedraw,
      predefinedFilters: myopts.predefinedFilters,
    };

    this.id = id;
    (function (a) {
      var addBtn = myopts.disable || (myopts.type !== 'AU' && myopts.isDta) ? '' : '<i class="fa fa-plus-circle fa-lg"></i>';
      var s = _.template('\
        <div>\n\
          <div id="icd<%=id%>grid"></div>\n\
          <%=addBtn%>\n\
        </div>\n')({id: id, addBtn: addBtn});
      a.html(s);
      initTable(icds);
    })(this);

    afterRedraw();
  };
})(jQuery);