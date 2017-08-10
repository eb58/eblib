/* global ebutils, _, jQuery*/ /* jshint multistr: true */

(function ($) {
  "use strict";

  $.fn.ebtextarea = function (opts) {
    var id = this[0].id;
    var defopts = {
      title: {text: '', fontSize: '12px', pos: 'top'},
      counter: {fontSize: '8px', pos: 'bottom'},
      nrRows: 5, // # of lines in textarea
      nrCols: 30, // # of cols in textarea
      maxByte: 1000000,
      width: '100%',
      height: '',
      disabled: false,
      maxNrOfVisibleRows: 10,
    };
    var myopts = $.extend({}, defopts, opts);

    var utils = {
      adjustVisibleHeight: function adjustVisibleHeight() {
        var $ta = $('#' + id + ' textarea');
        var cntNL = $ta.val().split('\n').length;
        if (cntNL >= $ta.prop('rows') || cntNL <= myopts.maxNrOfVisibleRows) {
          $('#' + id + ' textarea').prop('rows', Math.max(myopts.nrRows, Math.min(cntNL, myopts.maxNrOfVisibleRows)));
        }
      }
    }

    var api = {
      setTextarea: function setTextarea(s) {
        $('#' + id + ' textarea').text(s||'');
        utils.adjustVisibleHeight();
        return this;
      },
      setTextAreaCounter: function setTextAreaCounter() {
        var bc = ebutils.byteCount($('#' + id + ' textarea').val());
        $('#' + id + ' .ebtextareacnt').text('(' + bc + '/' + myopts.maxByte + ')');
      },
      disable: function disable(b) {
        $('#' + id + ' textarea').prop('disabled', b)
      },
      val: function val(s) {
        $('#' + id + ' textarea').val(s);
        setTextAreaCounter();
        return this;
      },
    }

    var top = (myopts.title && myopts.title.pos === 'top' ? '<span class="ebtextareatitle">' + myopts.title.text + '&nbsp;&nbsp;</span>' : '') + (myopts.counter && myopts.counter.pos === 'top' ? '<span class="ebtextareacnt"><span>' : '');
    var bottom = (myopts.title && myopts.title.pos === 'bottom' ? '<span class="ebtextareatitle">' + myopts.title.text + '&nbsp;&nbsp;</span>' : '') + (myopts.counter && myopts.counter.pos === 'bottom' ? '<span class="ebtextareacnt"></span>' : '');
    var s = _.template('\
      <div class="ebtextarea">\n\
        <div><%=top%></div>\n\
        <textarea rows="<%=rows%>" cols="<%=cols%>" style="<%=width%><%=height%>"></textarea>\n\
        <div><%=bottom%></div>\n\
      </div>\n')({
      rows: myopts.nrRows,
      cols: myopts.nrCols,
      top: myopts.disabled ? '' : top,
      bottom: myopts.disabled ? '' : bottom,
      width: (myopts.width ? 'width:' + myopts.width + ';' : ''),
      height: (myopts.height ? 'height:' + myopts.height + ';' : '')
    });

    if (!$('#' + id + ' textarea').length) {
      $(this).html(s);
      $('#' + id + ' textarea').prop('disabled', myopts.disabled)
      $('#' + id + ' textarea').on("keyup", function (evt) {
        var s = $('#' + id + ' textarea').val();
        var bc = ebutils.byteCount(s);
        if (bc > myopts.maxByte) {
          $.alert('Warnung', 'Maximal erlaubte Textl\u00e4nge erreicht.\nText wird abgeschnitten.');
          while ((bc = ebutils.byteCount(s)) > myopts.maxByte) {
            s = s.slice(0, -1);
          }
          $(this).val(s);
        }
        api.setTextAreaCounter();
        utils.adjustVisibleHeight()
      });
      api.setTextAreaCounter();
      utils.adjustVisibleHeight();
      myopts.title && $('#' + id + ' .ebtextareatitle').css('font-size', myopts.title.fontSize || 8);
      myopts.title && $('#' + id + ' .ebtextareatitle').css('font-weight', myopts.title.fontWeight || 'normal');
      myopts.counter && $('#' + id + '.ebtextareacnt').css('font-size', myopts.counter.fontSize || 8);
      $('#' + id + ' .ebtextarea').css({'margin': '8px 0px 0px 0px'});
    }
    return _.extend(this, api);
  };
})(jQuery);