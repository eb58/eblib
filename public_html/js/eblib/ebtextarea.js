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
      textmodules: null, //{
//        'font-size': '12px',
//        pos: 'bottom',
//        textmoduleNames: {
//          1: 'Testbaustein1',
//          2: 'Testbaustein2',
//        },
//        textmoduleContents: {
//          1: 'Damit Ihr indess erkennt, woh',
//          2: 'Dagegen tadelt und hasst man mit Recht Den, ',
//        },
//      },
    };
    var myopts = $.extend({}, defopts, opts);
    var tm = myopts.textmodules;

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
        utils.adjustVisibleHeight();
      },
    };
    var textmoduleHelpers = {
      getContentsFromServer: function (url, id) {
        if (sessionStorage['textmodulesContent:' + id]) {
          return sessionStorage['textmodulesContent:' + id];
        }
        $.ajax({
          dataType: "json",
          async: false,
          url: url,
          data: {id: id},
          success: function (data) {
            sessionStorage['textmodulesContent:' + id ] = _.isString(data.result) ? data.result : _.find(data, {id: Number(id)}).content;
          }
        });
        return sessionStorage['textmodulesContent:' + id];
      },
    };

    var api = {
      setTextAreaCounter: function setTextAreaCounter() {
        var bc = ebutils.byteCount($('#' + id + ' textarea').val());
        $('#' + id + ' .ebtextareacnt').text('(' + bc + '/' + myopts.maxByte + ')');
      },
      disable: function disable(b) {
        $('#' + id + ' textarea').prop('disabled', b);
        $('#' + id + ' .ebtextareatextmodules').toggle(!b);
      },
      val: function val(s) {
        $('#' + id + ' textarea').val(s || '');
        api.setTextAreaCounter();
        utils.adjustVisibleHeight();
        return this;
      },
    };

    var top =
      (myopts.title && myopts.title.pos === 'top' ? '<span class="ebtextareatitle">' + myopts.title.text + '&nbsp;</span>' : '') +
      (tm && tm.pos === 'top' ? '&nbsp;<i class="ebtextareatextmodules fa fa-bars" title="Textbausteine einf&uuml;gen" style="font-size: ' + (tm['font-size'] || '8px') + ';"></i>&nbsp;' : '') +
      (myopts.counter && myopts.counter.pos === 'top' ? '<span class="ebtextareacnt"></span>' : '');
    var bottom =
      (myopts.title && myopts.title.pos === 'bottom' ? '<span class="ebtextareatitle">' + myopts.title.text + '&nbsp;</span>' : '') +
      (tm && tm.pos === 'bottom' ? '&nbsp;<i class="ebtextareatextmodules fa fa-bars" title="Textbausteine einf&uuml;gen" style="font-size: ' + (tm['font-size'] || '8px') + ';"></i>&nbsp;' : '') +
      (myopts.counter && myopts.counter.pos === 'bottom' ? '<span class="ebtextareacnt"></span>' : '');
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
      $('#' + id + ' textarea').prop('disabled', myopts.disabled);
      $('#' + id + ' textarea')
        .off()
        .on('keyup', utils.handleChanges)
        .on('paste', utils.handleChanges);

      tm && tm.textmoduleNames && tm.textmoduleNames.length && $.contextMenu({
        selector: '#' + id + ' .ebtextareatextmodules',
        trigger: 'left',
        callback: function (key) {
          if (_.isString(tm.textmoduleContents)) { // it's an url!!
            $('#' + id + ' textarea').val(textmoduleHelpers.getContentsFromServer(tm.textmoduleContents, key));
          } else if (_.isFunction(tm.textmoduleContents)) {
            $('#' + id + ' textarea').val(tm.textmoduleContents(Number(key)));
          } else if (_.isArray(tm.textmoduleContents)) {
            $('#' + id + ' textarea').val(_.find(tm.textmoduleContents, {id: Number(key)}).content);
          }
          $('#' + id + ' textarea').trigger("keyup");
          utils.handleChanges();
        },
        items: tm.textmoduleNames.reduce(function (acc, item) {
          acc[item.id] = {name: item.name};
          return acc;
        }, {})
      });

      api.setTextAreaCounter();
      utils.adjustVisibleHeight();

      // styling
      $('#' + id + ' .ebtextarea').css({'margin': myopts.margin});
      myopts.title && $('#' + id + ' .ebtextareatitle').css('font-size', myopts.title.fontSize || 8);
      myopts.title && $('#' + id + ' .ebtextareatitle').css('font-weight', myopts.title.fontWeight || 'normal');
      myopts.counter && $('#' + id + ' .ebtextareacnt').css('font-size', myopts.counter.fontSize || 8);
      tm && $('#' + id + '.context-menu-item').css('font-size', '8px');
      tm && $('#' + id + '.context-menu-item span').css('font-size', '8px');
    }
    return _.extend(this, api);
  };
})(jQuery);