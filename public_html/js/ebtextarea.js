/* global ebutils */

(function ($) {
  "use strict";

  function setTextAreaCounter(o, maxByte) {
    var bc = ebutils.byteCount($(o).val());
    $(o).parent().find('.cnt').text('(' + bc + '/' + maxByte + ')');
  }

  $.fn.ebtextarea = function (opts) {
    var id = this[0].id;
    var defopts = {
      title: '',
      titleFontSize: '12px',
      counterFontSize: '8px',
      titlePos: 'top', // 'bottom'
      counterPos: 'bottom' //  'bottom'
    };
    var myopts = $.extend({}, defopts, opts);

    //this.id = id;
    var maxByte = $(this).attr('maxlen');
    $(this).wrap('<div id="ebtextarea-' + id + '"></div>');
    myopts.counterPos === 'top' && $('#ebtextarea-' + id).prepend('<div class="cnt"></div>');
    myopts.counterPos === 'bottom' && $('#ebtextarea-' + id).append('<div class="cnt"></div>');
    myopts.titlePos === 'top' && $('#ebtextarea-' + id).prepend('<div class="title">' + myopts.title + '</div>');
    myopts.titlePos === 'bottom' && $('#ebtextarea-' + id).append('<div class="title">' + myopts.title + '</div>');
    $(this).on("keyup", function () {
      var s = $(this).val();
      var bc = ebutils.byteCount(s);
      if (bc > maxByte) {
        $.alert('Warnung', 'Maximal erlaubte Textl\u00e4nge erreicht.\nText wird abgeschnitten.');
        while ((bc = ebutils.byteCount(s)) > maxByte) {
          s = s.slice(0, -1);
        }
        $(this).val(s);
      }
      setTextAreaCounter(this, maxByte)
    });
    setTextAreaCounter(this, maxByte);
    $(this).parent().find('.cnt').css('font-size', myopts.counterFontSize);
    $(this).parent().find('.title').css('font-size', myopts.titleFontSize);
    return this;
  };
})(jQuery);        