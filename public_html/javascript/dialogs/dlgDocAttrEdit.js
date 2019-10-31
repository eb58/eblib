/* global doctypes, doctabs, _, datepickerOptions */
var dlgDocAttrEdit = function (file, fileAttr, opts, cbfct) {
  $('#dlgDocAttrEdit').remove();

  var checkAttr = function (attr) {
    var ret = '';
    ret += attr.docname.trim() ? '' : 'Name muss vergeben werden.\n';
    ret += attr.docdate.trim() ? '' : 'Datum muss vergeben werden.\n';
    ret += !!attr.doctypeId ? '' : 'Dokumentart muss vergeben werden.\n';
    ret += !!attr.doctabId ? '' : 'Lasche muss vergeben werden.\n';
    return ret ? 'Fehlende Werte!\n\n' + ret : '';
  };

  var ddDoctypes, ddDoctabs, selKeywords;
  var optsKeywords = {width: '300px', height: '150', values: opts.keywords || [], onselchange: function () {}};

  var dlg = $("\
      <div id='dlgDocAttrEdit'>\n\
        <div id='docattr' style='height:470px; border:1px solid #ddd; margin:3px 3px 3px 3px; padding:2px 2px 2px 2px'>\n\
          <table style='width:100%'>\n\
            <tr><td>Dateiname           </td><td><span id='docname-with-ext'></span></td></tr>\n\
            <tr><td>Name(*)             </td><td><input type='text' id='docname'></td></tr>\n\
            <tr><td>Datum(*)            </td><td><input type='text' id='docdate'></td></tr>\n\
            <tr><td>Dokumentart(*)      </td><td><div id='doctype'></div></td></tr>\n\
            <tr><td>Lasche(*)           </td><td><div id='doctab'></div></td></tr>\n\
            <tr><td>Dokument von        </td><td><input type='text' id='autor'></td></tr>\n\
            <tr><td>Schlagw&ouml;rter   </td><td><div id='keywords'></div></td></tr>\n\
            <tr><td>Bemerkung           </td><td><textarea id='bemerkung'/></td></tr>\n\
          </table>\n\
        </div>\n\
      </div>");

  var defopts = {
    open: function ( ) {
      $('#dlgDocAttrEdit #docname-with-ext').text(fileAttr.docname + '.' + fileAttr.docext );
      $('#dlgDocAttrEdit #docdate').datepicker(datepickerOptions);
      $('#dlgDocAttrEdit #docname').val(fileAttr.docname);
      $('#dlgDocAttrEdit #docdate').val(fileAttr.docdate);
      $('#dlgDocAttrEdit #autor').val(fileAttr.autor);
      $('#dlgDocAttrEdit #bemerkung').val(fileAttr.bemerkung);
      ddDoctypes = $('#dlgDocAttrEdit #doctype').ebdropdown({width: '300px'}, doctypes, fileAttr.doctypeId);
      ddDoctabs = $('#dlgDocAttrEdit #doctab').ebdropdown({width: '300px'}, doctabs, fileAttr.doctabId);
      selKeywords = $("#dlgDocAttrEdit #keywords").ebselect(optsKeywords, fileAttr.keywords);
    },
    title: 'Attribute',
    width: 450, height: 490,
    modal: true,
    closeText: 'Schlie\u00dfen',
    buttons: {
      '\u00dcbernehmen': function () {
        fileAttr.docname = $('#dlgDocAttrEdit #docname').val();
        fileAttr.docext = file.name.split('.').reverse()[0];
        fileAttr.docdate = $('#dlgDocAttrEdit #docdate').val();
        fileAttr.doctypeId = parseInt(ddDoctypes.getSelectedValue());
        fileAttr.doctabId = parseInt(ddDoctabs.getSelectedValue());
        fileAttr.autor = $('#dlgDocAttrEdit #autor').val();
        fileAttr.keywords = selKeywords.getSelectedValuesAsString();
        fileAttr.bemerkung = $('#dlgDocAttrEdit #bemerkung').val();
        var errorTxt = checkAttr(fileAttr);
        if (errorTxt)
          $.alert('Warnung', errorTxt);
        else {
          if (cbfct) {
            var self = $(this);
            cbfct(file, fileAttr, function () {
              self.dialog("close");
            });
          } else {
            (console.log('Default callback --- just logging'), 
            $(this).dialog("close"))
          }
        }
      },
      'Abbrechen': function () {
        $(this).dialog("close");
      }
    }
  };
  var myopts = $.extend({}, defopts);
  dlg.dialog(myopts);

  // styling
  $('#dlgDocAttrEdit').css('background-color', '#eeeee0').height('490px');
  $('#dlgDocAttrEdit').parent().css('font-size', '12px');
  $('#dlgDocAttrEdit #docname').width('96%')
  $('#dlgDocAttrEdit #docdate').width('50%')
  $('#dlgDocAttrEdit #keywords input:checkbox').width('20px');
  $('#dlgDocAttrEdit tr:has(.ebselect)').height(153);
  $('#dlgDocAttrEdit .ebselect').css('border-color', '#dfdfdf');
  $('.ui-dialog ul.ui-menu').css('max-height', '520px');
};