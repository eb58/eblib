/* global _ */
var dlgVueTest = function (opts) {
  $('#dlgVueTest').remove();
  var vue;
  var t = "\
    <div id='dlgVueTest'>\n\
      <table id='docattr' style='width:100%'>\n\
        <tr><td>Name(*)             </td> <td><input type='text' v-model='name'></td></tr>\n\
        <tr><td>Datum(*)            </td> <td><input type='text' v-datepicker='date'></td></tr>\n\
        <tr><td>Dokumentart(*)      </td> <td><div id='doctypeid'></div></td></tr>\n\
        <tr><td>Lasche(*)           </td> <td><div id='doctabid'></div></td></tr>\n\
        <tr><td>Schlagw&ouml;rter   </td> <td><div id='keywords' ></div></td></tr>\n\
      </table>\n\
      <p><pre>data: {{$data | json 3}}</pre></p>\n\
    </div>";
  var dlg = $(t);
  var init = function (disabled) {
    vue = new Vue({
      el: '#dlgVueTest',
      data: {
        name: 'testname',
        date: '01.01.2014',
        doctypeid: 1,
        tabid: 1,
        keywords: ['Schlagwort 3']
      }
    });

    $('#doctypeid').ebdropdown({disabled: disabled}, opts.doctypes);
    $('#doctabid').ebdropdown({disabled: disabled}, opts.doctabs);
    $('#doctypeidX').attr('v-selectmenu', 'doctypeid');
    $('#doctabidX').attr('v-selectmenu', 'tabid');
    $('#keywords').ebselect(
      {values: opts.keywords,
        disabled: disabled,
        onselchange: function (o) {
          console.log("selected values:" + o.getSelectedValuesAsString());
          vue.keywords = o.getSelectedValuesAsString();
        }
      },
      vue.keywords);
    // styling
    $('#dlgVueTest').css('background-color', '#eeeee0');
    $('#dlgVueTest #docattr td:first-child()').width('25%');
    $('#dlgVueTest #docattr tr:contains(Schlagw)').height('110px').css('vertical-align', 'top');
    $('#dlgVueTest .hasDatepicker').width(disabled ? '' : '94%');
    $('#dlgVueTest img.ui-datepicker-trigger').toggle(!disabled).css('vertical-align', 'bottom');
  };
  var defopts = {
    open: function () {
      init(false);
    },
    title: 'TestDialog',
    width: 550,
    height: 470,
    closeText: 'Schlie\u00dfen',
    buttons: {
      'Beenden': function () {
        $(this).dialog("close");
      }
    }
  };
  var myopts = $.extend({}, defopts, opts || {});
  dlg.dialog(myopts);
  myopts.readonly && $('.ui-dialog button:contains(Bearbeiten)').hide();


};
