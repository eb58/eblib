(function ($) {
  "use strict";
  $.fn.componentPflegeperson = function (pflegeperson, opts) {
    const id = this[0].id;
    const self = this;

    const defopts = {
    };

    const myopts = $.extend({}, defopts, opts);

    const init = function () {
      $('#' + id + ' #firstname').ebbind(pflegeperson);
      $('#' + id + ' #lastname').ebbind(pflegeperson);
      $('#' + id + ' #birthday-' + opts.idx ).datepicker(datepickerOptions).ebbind(pflegeperson, 'birthday');
      $('#' + id + ' #title').ebbind(pflegeperson);
      $('#' + id + ' #countrycode-' + opts.idx).ebdropdown({disabled: readonly, width: '200px'}, valueLists.countryList).ebbind(pflegeperson, 'countrycode');
      $('#' + id + ' #zipcode').ebbind(pflegeperson);
      $('#' + id + ' #city').ebbind(pflegeperson);
      $('#' + id + ' #street').ebbind(pflegeperson);
      $('#' + id + ' #telefon').ebbind(pflegeperson);
      $('#' + id + ' #isAngehoeriger').ebbind(pflegeperson);
      $('#' + id + ' #caringPerWeek-' +  opts.idx).ebdropdown({disabled: readonly, width: '250px'}, valueLists.caringTimes).ebbind(pflegeperson, 'caringPerWeek');
      $('#' + id + ' #caringDaysPerWeek').ebbind(pflegeperson).numeric({decimal: false, negative: false})
      $('#' + id + ' input').prop('disabled', readonly)
    }

    const styling = function () {
      $('#' + id + ' #layout td:nth(0)').css('width', '150px')
      $('#' + id + ' #layout td:nth(1)').css('width', '250px')
      $('#' + id + ' #layout td:nth(2)').css('width', '150px')
      $('#' + id + ' #layout td:nth(3)').css('width', '470px')
    }

    this.id = id;
    (function (a) {
      const template = `
        <div>
          <table id='layout'>
            <tr>
              <td>Name</td>
              <td><input id='lastname'/></td>
              <td>Vorname</td>
              <td><input  id='firstname'/></td>
            </tr>
            <tr>
              <td>Geburtstag</td>
              <td><input id='birthday-<%=personid%>'/></td>
              <td>Titel</td>
              <td><input id='title'/></td>
            </tr>
            <tr>
              <td>Straße</td>
              <td><input id='street'/></td>
              <td>Ort</td>
              <td>
                <div style='display:inline-table'>
                  <span id='countrycode-<%=personid%>' style='display: table-cell'></span>
                  <input id='zipcode' style='width:40px; display: table-cell; margin: 0 3px 0 3px' />
                  <input id='city' style='width:200px; display: table-cell' />
                </div>
              </td>
            </tr>
            <tr>
              <td>Telefon</td>
              <td><input id='telefon'/></td>
              <td>Angehöriger</td>
              <td><input type='checkbox' id='isAngehoeriger'/></td>
            </tr>
            <tr>
              <td>Pflegezeit pro Woche </td>
              <td><div id='caringPerWeek-<%=personid%>'></div></td>
              <td>Pflegetage pro Woche </td>
              <td><input id='caringDaysPerWeek'/></td>
            </tr>
          </table>
        </div>`;
      a.html(_.template(template)({
        personid: opts.idx,
      }));
      init();
      styling();
    })(this);
  }
})(jQuery);
