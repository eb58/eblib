/* global _ */

(function ($) {
  "use strict";
  $.fn.ebbind = function (data, m) {
    var id = this[0].id;
    var type = this[0].type;
    var self = this;

    m = m || id;
    if (type === 'text' || type === 'password'  ) {
      this.val(data[m]).on('change', function () {
        data[m] = self.val();
        console.log('changed ' + id, data[m], data);
      }).on('keyup', function () {
        data[m] = self.val();
        console.log('changed ' + id, self, data[m], data);
      });
    }
    if (type === 'checkbox') {
      this.prop('checked', data[m]).on('click', function () {
        data[m] = self.prop('checked');
        console.log('changed ' + id, data[m], data);
      });
    }
    if ($('select', this).length) {
      this.setSelectedValue(data[m]).on("selectmenuchange", function () {
        data[m] = self.getSelectedValue();
        console.log('select changed ' + id, data[m], data);
      });
    }
    if ($('input:radio', this).length) {
      this.val(data[m]).on("change", function () {
        data[m] = self.val();
        console.log('radio changed ' + id, data[m], data);
      });
    }
    if ($('textarea', this).length) {
      var $x = $('textarea',this);
      $x.val(data[m],this).on('keyup', function () {
        data[m] = $x.val();
        console.log('textarea changed ' + id, data[m], data);
      });
      this.setTextAreaCounter();
    }
    if ($('.ebselect', this).length) {
      var $x = $('input:checkbox',this);
      data[m].forEach(function(v){
        if( _.isNumber(v) ){ 
          $($x[v]).prop('checked', true );
        }else{
          $('#'+v, self).prop('checked', true );
        }
      });
      $x.on('click', function () {
        data[m] = self.getSelectedValuesAsString();
        console.log('textarea changed ' + id, data[m], data);
      });
    }
    return this;
  };
})(jQuery);


