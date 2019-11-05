/* global _, jQuery */ /* jshint multistr: true *//* jshint expr: true */
(function ($) {
  "use strict";
  $.fn.componentPflegepersonen = function (pflegepersonen, opts) {
    const id = this[0].id;
    const self = this;

    const defopts = {
      disabled: false
    };

    const myopts = $.extend({}, defopts, opts);

    const init = function () {
      pflegepersonen.forEach(function (p, idx) {
        const elemid = '#' + id + ' #pflegeperson-' + idx;
        $(elemid).componentPflegeperson(p, {
          disabled: myopts.disabled,
          idx: idx
        });
        $('#del-pflegeperson-' + idx).on('click', function () {
          console.log('click', idx);
          pflegepersonen.splice(idx, 1)
          x(self)
        })
      });
    };

    const styling = function () {
      $('.pflegeperson').css({
        border: "1px solid #cfcfee",
        margin: "3px 0 3px 0",
      })
    };

    this.id = id;
    const x = function (a) {
      const list = pflegepersonen.length === 0 ? 'Keine Pflegepesonen vorhanden' : pflegepersonen.map(function (p, idx) {
        return _.template('\
          <div style="display:inline-table" class="pflegeperson">\
            <div style="display: table-cell" id="pflegeperson-<%=idx%>"></div>\
            <i style="display: table-cell" class="fa fa-trash fa-2x" title="Pflegeperson löschen" id="del-pflegeperson-<%=idx%>"></i>\
          </div>')({idx: idx})
      });
      a.html('<div>' + list + '</div>');
      init();
      styling();
    };
    x(this);

  }
}(jQuery));