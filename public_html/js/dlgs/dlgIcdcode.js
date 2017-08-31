/* global _ */
var dlgIcd = function (icddata, onTakeOverCallback, opts) {
  var matcher = {
    contains: function (cellData, searchtxt) {
      return cellData.toLowerCase().indexOf(searchtxt.toLowerCase()) >= 0;
    }
  };
  var getValues = function () {
    var code = $('td:nth-child(2)', $('#dlgIcd tr:has(input:checked)')).text();
    var text = $('td:nth-child(3)', $('#dlgIcd tr:has(input:checked)')).text();
    var id = (_.findWhere(icddata, {2: code}) || [])[0];
    return {code: code, text: text, id: id};
  };

  var tblopts = {
    flags: {filter: true, pagelenctrl: false, config: false},
    columns: [
      {name: "icdid", invisible: true},
      {name: "Text", match: matcher.contains},
      {name: "Code", match: matcher.contains}
    ],
    selectionCol: { singleSelection: true, selectOnRowClick: true },
    colorder: [0, 2, 1],
    afterRedraw: style
  };
  $('#dlgIcd').remove();
  var dlg = $("\
    <div id='dlgIcd'>\n\
       <div id='icdgrid'></div>\n\
    </div>");
  var defopts = {
    open: function ( ) {
      _.each(icddata, function (x) {
        x.selected = false;
      });
      $('#dlgIcd #icdgrid').ebtable(tblopts, icddata).setFilterValues({Code: opts ? opts.icdCode : '', Text: opts ? opts.icdText : ''});
      $('#dlgIcd #Code').focus().select();
      style();
    },
    title: 'ICD-Code w\u00e4hlen',
    width: 800, height: 530,
    closeText: 'Schlie\u00dfen',
    modal: true,
    buttons: {
      '\u00dcbernehmen': function () {
        var v = getValues();
        if (onTakeOverCallback(v.code, v.text, v.id)) {
          $(this).dialog("close");
        }
      },
      'Abbrechen': function () {
        $(this).dialog("close");
      }
    }
  };
  var myopts = $.extend({}, defopts, opts);

  dlg.dialog(myopts).keyup(function (e) {
    if (e.keyCode === 13) {
      var v = getValues();
      if (onTakeOverCallback(v.code, v.text, v.id)) {
        $(this).dialog("close");
      }
    }
  });
  //  Styling
  function style() {
    $('#dlgIcd').css('background-color', '#eeeee0');
    $('#dlgIcd th, #dlgIcd td').css('border-color', '#fff').css('border-style', 'solid').css('border-width', '1px');
    $('#dlgIcd th:nth-child(1)').css('width', '20px');
    $('#dlgIcd th:nth-child(2)').css('width', '60px');
    $('#dlgIcd input#Code').css('width', '80%');
    $('#dlgIcd input#Text').css('width', '97%');
    $('#dlgIcd .ctrl:has(#ctrlLength)').remove();
    $('#dlgIcd .ebtable #data input[type=radio]').width('20px');
    $('#dlgIcd').parent().find('*').css('font-size', '12px');
  }
};