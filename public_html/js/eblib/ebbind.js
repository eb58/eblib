/* global _ ,jQuery, eblogger*/
(function ($) {
  "use strict";
  $.fn.ebbind = function (data, key, onChange) {
    var log = typeof eblogger === 'undefined' ? function () { return {} } : eblogger().log;
    var id = this[0].id;
    var type = this[0].type;
    var self = this;

    var utils = {
      changeInputField: function () {
        data[key] = self.val();
        onChange && onChange(self);
        if ($(this).prop('class').contains('hasDatepicker') && data[key].trim() === '') {
          data[key] = null;
        }
        log('input text changed ' + id, data[key]);
      }
    };

    key = key || id;
    if (type === 'text' || type === 'password') {
      this.val(data[key])
        .off()
        .on('input', utils.changeInputField)
        .on('change', utils.changeInputField);
    } else if (type === 'checkbox') {
      this.prop('checked', data[key]).off().on('click', function () {
        data[key] = self.prop('checked');
        onChange && onChange(self);
        log('checkbox changed ' + id, data[key]);
      });
    } else if ($('select', this).length) {
      this.setSelectedValue(data[key]).off().on("selectmenuchange", function () {
        var v = parseInt(self.getSelectedValue());
        data[key] = !_.isNaN(v) ? v : self.getSelectedValue();
        onChange && onChange(self);
        log('select changed ' + id, data[key]);
      });
      this.setSelectedValue(data[key]).on("change", function () {
        var v = parseInt(self.getSelectedValue());
        data[key] = !_.isNaN(v) ? v : self.getSelectedValue();
        onChange && onChange(self);
        log('select changed ' + id, data[key]);
      });
    } else if ($('input:radio', this).length) {
      this.val(data[key]).off().on("change", function () {
        data[key] = self.val();
        onChange && onChange(self);
        log('radio changed ' + id, data[key]);
      });
    } else if ($('textarea', this).length) {
      var $ta = $('textarea', this);
      this.val(data[key]).on('input', function () {
        data[key] = $ta.val().trim();
        onChange && onChange(self);
        log('input to textarea --- id:' + id);
      });
      this.setTextAreaCounter();
    } else if ($('.ebselect', this).length) {
      var $sel = $('input:checkbox', this);
      data[key] && data[key].forEach(function (v) {
        onChange && onChange(self);
        if (_.isNumber(v)) {
          $($sel[v]).prop('checked', true);
        } else {
          $('#' + v.replace(/ /g, ''), self).prop('checked', true);
        }
      });
      $sel.off().on('click', function () {
        data[key] = self.getSelectedValuesAsString();
        onChange && onChange(self);
        log('ebselect changed ' + id, data[key]);
      });
    }
    return this;
  };
})(jQuery);