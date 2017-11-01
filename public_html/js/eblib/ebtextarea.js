/* global ebutils, _, jQuery*/ /* jshint multistr: true */
(function ($) {
  'use strict';
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
      margin: '8px 0px 0px 0px',
      charsNotAllowed: /[^\S\n\r\t\x20-\xFF]+/,
      boilerplates: null, // {  
      //{
      //  pos:'top',  
      //  items:{ 
      //    1: { name: 'item1', text:'Das ist ein superlanger Text ....' }
      //    2: { name: 'item2', text:'Das ist noch ein superlangerer Text ....' }
      //  ];
      //};
    };
    var myopts = $.extend({}, defopts, opts);

    var utils = {
      adjustVisibleHeight: function adjustVisibleHeight() {
        var $ta = $('#' + id + ' textarea');
        var cntNL = $ta.val().split('\n').length;
        if (cntNL >= $ta.prop('rows') || cntNL <= myopts.maxNrOfVisibleRows) {
          $('#' + id + ' textarea').prop('rows', Math.max(myopts.nrRows, Math.min(cntNL, myopts.maxNrOfVisibleRows)));
        }
      },
      handleChanges: function () {
        var ta = $('#' + id + ' textarea');
        var s = ta.val();
        var msg = '';

        if (s.match(myopts.charsNotAllowed)) {
          s = s.replace(myopts.charsNotAllowed, '');
          ta.val(s);
        }

        var bc = ebutils.byteCount(s);
        if (bc > myopts.maxByte) {
          while ((bc = ebutils.byteCount(s)) > myopts.maxByte) {
            s = s.slice(0, -Math.max(1, Math.floor((bc - myopts.maxByte) / 2)));
          }
          ta.val(s);
          msg += 'Maximal erlaubte Textl\u00e4nge erreicht.\nText wurde abgeschnitten.\n\n';
        }

        msg && $.alert('Warnung', msg);
        api.setTextAreaCounter();
        utils.adjustVisibleHeight()
      }
    }

    var api = {
      setTextAreaCounter: function setTextAreaCounter() {
        var bc = ebutils.byteCount($('#' + id + ' textarea').val());
        $('#' + id + ' .ebtextareacnt').text('(' + bc + '/' + myopts.maxByte + ')');
      },
      disable: function disable(b) {
        $('#' + id + ' textarea').prop('disabled', b)
      },
      val: function val(s) {
        $('#' + id + ' textarea').val(s || '');
        api.setTextAreaCounter();
        utils.adjustVisibleHeight();
        return this;
      },
    }

    var top =
      (myopts.title && myopts.title.pos === 'top' ? '<span class="ebtextareatitle">' + myopts.title.text + '&nbsp;</span>' : '') +
      (myopts.counter && myopts.counter.pos === 'top' ? '<span class="ebtextareacnt"></span>' : '') +
      (myopts.boilerplates && myopts.boilerplates.pos === 'top' ? '&nbsp;<i class="ebtextareaboilerplates fa fa-plus-circle" style="font-size: ' + (myopts.boilerplates['font-size'] || '8px') + ';"></i>' : '');

    var bottom =
      (myopts.title && myopts.title.pos === 'bottom' ? '<span class="ebtextareatitle">' + myopts.title.text + '&nbsp;&nbsp;</span>' : '') +
      (myopts.counter && myopts.counter.pos === 'bottom' ? '<span class="ebtextareacnt"></span>' : '') +
      (myopts.boilerplates && myopts.boilerplates.pos === 'bottom' ? '&nbsp;<i class="ebtextareaboilerplates fa fa-plus-circle" style="font-size: ' + (myopts.boilerplates['font-size'] || '8px') + ';"></i>' : '');

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
      $('#' + id + ' textarea')
        .off()
        .on('keyup', utils.handleChanges)
        .on('paste', utils.handleChanges);
      
      myopts.boilerplates && $.contextMenu({
        selector: '#' + id + ' .ebtextareaboilerplates',
        trigger: 'left',
        callback: function (key) {
          $('#' + id + ' textarea').val( myopts.boilerplates.items[key].text);
          utils.handleChanges()
        },
        items: myopts.boilerplates.items
      });
      api.setTextAreaCounter();
      utils.adjustVisibleHeight();
      myopts.title && $('#' + id + ' .ebtextareatitle').css('font-size', myopts.title.fontSize || 8);
      myopts.title && $('#' + id + ' .ebtextareatitle').css('font-weight', myopts.title.fontWeight || 'normal');
      myopts.counter && $('#' + id + ' .ebtextareacnt').css('font-size', myopts.counter.fontSize || 8);
      $('#' + id + ' .ebtextarea').css({'margin': myopts.margin});
    }
    return _.extend(this, api);
  };
})(jQuery);