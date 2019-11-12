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
      $('#' + id + ' #date-of-birth-' + opts.idx ).datepicker(datepickerOptions).ebbind(pflegeperson, 'date-of-birth');
      $('#' + id + ' #title').ebbind(pflegeperson);
      $('#' + id + ' #country-id-' + opts.idx).ebdropdown({disabled: readonly, width: '200px'}, valueLists.countryList).ebbind(pflegeperson, 'country-id');
      $('#' + id + ' #zip').ebbind(pflegeperson);
      $('#' + id + ' #city').ebbind(pflegeperson);
      $('#' + id + ' #street').ebbind(pflegeperson);
      $('#' + id + ' #phone').ebbind(pflegeperson);
      $('#' + id + ' #is-family-member').ebbind(pflegeperson);
      $('#' + id + ' #caring-hours-per-week-' +  opts.idx).ebdropdown({disabled: readonly, width: '250px'}, valueLists.caringTimes).ebbind(pflegeperson, 'caring-hours-per-week');
      $('#' + id + ' #caring-days-per-week').ebbind(pflegeperson).numeric({decimal: false, negative: false})
      // 
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
              <td><input id='date-of-birth-<%=personid%>'/></td>
              <td>Titel</td>
              <td><input id='title'/></td>
            </tr>
            <tr>
              <td>Straße</td>
              <td><input id='street'/></td>
              <td>Ort</td>
              <td>
                <div style='display:inline-table'>
                  <span id='country-id-<%=personid%>' style='display: table-cell'></span>
                  <input id='zip' style='width:40px; display: table-cell; margin: 0 3px 0 3px' />
                  <input id='city' style='width:200px; display: table-cell' />
                </div>
              </td>
            </tr>
            <tr>
              <td>Telefon</td>
              <td><input id='phone'/></td>
              <td>Angehöriger</td>
              <td><input type='checkbox' id='is-family-member'/></td>
            </tr>
            <tr>
              <td>Pflegezeit pro Woche </td>
              <td><div id='caring-hours-per-week-<%=personid%>'></div></td>
              <td>Pflegetage pro Woche </td>
              <td><input id='caring-days-per-week'/></td>
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
