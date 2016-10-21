/* global _ ,jQuery*/

(function ($) {
  "use strict";
  $.fn.ebbind = function (data, m) {
    var id = this[0].id;
    var type = this[0].type;
    var self = this;
    var $x;

    m = m || id;
    if (type === 'text' || type === 'password') {
      this.val(data[m]).off().on('change', function () {
        data[m] = self.val();
        console.log('changed ' + id, data[m], data);
      }).on('keyup', function () {
        data[m] = self.val();
        console.log('changed ' + id, self, data[m], data);
      });
    } else if (type === 'checkbox') {
      this.prop('checked', data[m]).off().on('click', function () {
        data[m] = self.prop('checked');
        console.log('changed ' + id, data[m], data);
      });
    } else if ($('select', this).length) {
      this.setSelectedValue(data[m]).off().on("selectmenuchange", function () {
        data[m] = self.getSelectedValue();
        console.log('select changed ' + id, data[m], data);
      });
    } else if ($('input:radio', this).length) {
      this.val(data[m]).off().on("change", function () {
        data[m] = self.val();
        console.log('radio changed ' + id, data[m], data);
      });
    } else if ($('textarea', this).length) {
      $x = $('textarea', this);
      $x.val(data[m], this).off().on('keyup', function () {
        data[m] = $x.val();
        console.log('textarea changed ' + id, data[m], data);
      });
      this.setTextAreaCounter();
    } else if ($('.ebselect', this).length) {
      $x = $('input:checkbox', this);
      if (data[m]) {
        data[m].forEach(function (v) {
          if (_.isNumber(v)) {
            $($x[v]).prop('checked', true);
          } else {
            $('#' + v.replace(/ /g, ''), self).prop('checked', true);
          }
        });
      }
      $x.off().on('click', function () {
        data[m] = self.getSelectedValuesAsString();
        console.log('textarea changed ' + id, data[m], data);
      });
    }
    return this;
  };
})(jQuery);