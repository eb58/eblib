/* global _, datepickerOptions, utils */
const dlgDocAttrInfoEdit = function (docHandle, opts, saveCallback) {
  $('#dlgDocAttrInfoEdit').remove();
  const dlgFunc = function (docattr, opts, saveCallback) {
    const s = "\
      <div id='dlgDocAttrInfoEdit'>\n\
        <table id='docattr' style='width:100%'>\n\
          <tr><td>Name             </td> <td><input type='text' id='name'></td></tr>\n" +
            "<tr><td>Datum            </td> <td><input type='text' id='date'></td></tr>\n\
          <tr><td>Dokumentart      </td> <td><div id='doctypeid'></div></td></tr>\n\
          <tr><td>Lasche           </td> <td><div id='tabid'></div></td></tr>\n" +
            " <tr><td>Dokument von     </td> <td><input type='text' id='author'></td></tr>\n\
          <tr><td>Bemerkung        </td> <td><input id='note'></td></tr>\n\
          <tr><tr>\n\
          <tr><td>Schlagw&ouml;rter</td> <td><div id='keywords'></div></td></tr>\n\
          <tr><tr>\n" +
            " <tr><td>Erfasser         </td> <td><%=registrationusername%></td><tr>\n\
          <tr><td>Erfasst am       </td> <td><%=receptiondate%></td><tr>\n\
          <tr><td>Externe Id       </td> <td><%=externalid%></td><tr>\n\
     </table>\n\
    </div>\n";
    const t = _.template(s);
    const dlg = $(t({
      registrationusername: docattr.registrationusername,
      receptiondate: docattr.receptiondate,
      externalid: docattr.externalid || ''
    }));
    const init = function (disabled) {
      // binding data
      $('#dlgDocAttrInfoEdit #name').ebbind(docattr).prop('disabled', disabled);
      $('#dlgDocAttrInfoEdit #date').datepicker(datepickerOptions).ebbind(docattr).prop('disabled', disabled);
      $('#dlgDocAttrInfoEdit #doctypeid').ebdropdown({disabled: disabled}, opts.doctypes).ebbind(docattr);
      $('#dlgDocAttrInfoEdit #tabid').ebdropdown({disabled: disabled}, opts.doctabs).ebbind(docattr);
      $('#dlgDocAttrInfoEdit #keywords').ebselect({values: opts.keywords, disabled: disabled}).ebbind(docattr);
      $('#dlgDocAttrInfoEdit #author').ebbind(docattr).prop('disabled', disabled);
      $('#dlgDocAttrInfoEdit #note').ebbind(docattr).prop('disabled', disabled);
      // styling
      $('#dlgDocAttrInfoEdit').css('background-color', '#eeeee0');
      $('#dlgDocAttrInfoEdit').parent().find('*').css('font-size', '12px');
      $('#dlgDocAttrInfoEdit #docattr td:first-child()').width('25%');
      $('#dlgDocAttrInfoEdit #docattr tr:contains(Schlagw)').height('110px').css('vertical-align', 'top');
      $('#dlgDocAttrInfoEdit .hasDatepicker').width('80px');
      $('#dlgDocAttrInfoEdit img.ui-datepicker-trigger').toggle(!disabled).css('vertical-align', 'bottom');
      $('#dlgDocAttrInfoEdit .ebselect input').width('15px');
      $('#dlgDocAttrInfoEdit #doctypeidX-button').width('95%');
      $('#dlgDocAttrInfoEdit #tabidX-button').width('95%');
      $('#dlgDocAttrInfoEdit #keywords .ebselect').width('100%');
      $('#dlgDocAttrInfoEdit #name').width('100%');
      $('#dlgDocAttrInfoEdit #author').width('100%');
      $('#dlgDocAttrInfoEdit #note').width('100%');
      $('.ui-dialog button:contains(Bearbeiten)').toggle(disabled);
      $('.ui-dialog button:contains(Speichern)').toggle(!disabled);
      $('.ui-dialog ul.ui-menu').css('max-height', '520px');
    };
    const defopts = {
      open: function () {
        init(true);
      },
      title: 'Informationen zum Dokument',
      width: 600,
      height: 490,
      closeText: 'Schlie\u00dfen',
      modal: true,
      buttons: {
        'Bearbeiten': function () {
          init(false);
          $('.ui-dialog button:contains(Speichern)').show();
        },
        'Speichern': function () {
          const ndocattr = _.extend({}, docattr);
          saveCallback(ndocattr);
          init(true);
          $('.ui-dialog button:contains(Speichern)').hide();
        },
        'Beenden': function () {
          $(this).dialog("destroy");
        }
      }
    };
    const myopts = $.extend({}, defopts, opts || {});
    dlg.dialog(myopts);
    myopts.readonly && $('.ui-dialog button:contains(Bearbeiten)').hide();
  };

  const formatName = function (o) {
    return o ? utils.concat(o.lastname, o.firstname) : '';
  }

  if (_.isObject(docHandle)) {
    const doc = docHandle;
    const doctype = doc.docType || doc.doctype;
    const docattr = _.extend({}, doc, {date: doc.docdate, doctypeid: doctype.doctypeid, tabid: doc.tab.tabid, registrationusername: formatName(doc.registrationuser)});
    dlgFunc(docattr, opts, saveCallback);
  } else {
    const crypteddocid = docHandle;
    $.ajax({
      url: "mima.do?action=docinfo&crypteddocid=" + crypteddocid + "&ajax=1",
      success: function (result) {
        handleAjaxResult(result, function (result) {
          const docInfo = result['doc-info'];
          const docType = docInfo.docType || docInfo.doctype;
          const docAttr = _.extend({}, docInfo, {date: docInfo.docdate, doctypeid: docType.doctypeid, tabid: docInfo.tab.tabid, registrationusername: formatName(docInfo.registrationuser)});
          opts.readonly = opts.readonly || !docInfo.removable;
          dlgFunc(docAttr, opts, saveCallback);
        });
      },
      error: function (a, b, c) {
        console.log('Fehler bei docinfo', a, b, c);
      }
    });
  }
};

