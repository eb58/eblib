/* global ebutils, _ */

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

    var top =
      '<div>'
      + (myopts.title.pos === 'top' ? '<span class="ebtextareatitle">' + myopts.title.text + '&nbsp;&nbsp;</span>' : '')
      + (myopts.counter.pos === 'top' ? '<span class="ebtextareacnt"><span>' : '')
      + '</div>';
    var bottom =
      '<div>'
      + (myopts.title.pos === 'bottom' ? '<span class="ebtextareatitle">' + myopts.title.text + '&nbsp;&nbsp;</span>' : '')
      + (myopts.counter.pos === 'bottom' ? '<span class="ebtextareacnt"></span>' : '')
      + '</div>';
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