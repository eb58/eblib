/* global _ ,jQuery*/
(function ($) {
  "use strict";
  $.fn.ebbind = function (data, key, onChange ) {
    var id = this[0].id;
    var type = this[0].type;
    var self = this;

    key = key || id;
    if (type === 'text' || type === 'password') {
      this.val(data[key]).off().on('change', function () {
        data[key] = self.val();
        onChange && onChange(self);
        if( $(this).prop('class').contains('hasDatepicker') && data[key]==='' ) {
          data[key] = null
        }
        console.log('text changed ' + id, data[key]);
      }).on('keyup', function () {
        data[key] = self.val();
        onChange && onChange(self);
        if( $(this).prop('class').contains('hasDatepicker') && data[key]==='' ) {
          data[key] = null
        }
        console.log('text keyup ' + id, data[key]);
      });
    } else if (type === 'checkbox') {
      this.prop('checked', data[key]).off().on('click', function () {
        data[key] = self.prop('checked');
        onChange && onChange(self);
        console.log('checkbox changed ' + id, data[key] );
      });
    } else if ($('select', this).length) {
      this.setSelectedValue(data[key]).off().on("selectmenuchange", function () {
        var v = parseInt(self.getSelectedValue());
        data[key] = !_.isNaN(v) ? v : self.getSelectedValue();
        onChange && onChange(self);
        console.log('select changed ' + id, data[key]);
      });
      this.setSelectedValue(data[key]).on("change", function () {
        var v = parseInt(self.getSelectedValue());
        data[key] = !_.isNaN(v) ? v : self.getSelectedValue();
        onChange && onChange(self);
        console.log('select changed ' + id, data[key]);
      });
    } else if ($('input:radio', this).length) {
      this.val(data[key]).off().on("change", function () {
        data[key] = self.val();
        onChange && onChange(self);
        console.log('radio changed ' + id, data[key]);
      });
    } else if ($('textarea', this).length) {
      var $ta = $('textarea', this);
      this.setTextarea(data[key]).on('keyup', function () {
        data[key] = $ta.val().trim();
        onChange && onChange(self);
        console.log('textarea changed ' + id);
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
        console.log('ebselect changed ' + id, data[key]);
      });
    }
    return this;
  };
})(jQuery);