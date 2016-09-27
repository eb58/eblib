/* global Vue, datepickerOptions, _ */

Vue.directive('datepicker', {
  bind: function () {
    var vm = this.vm;
    var key = this.expression;
    var opts = _.extend( {}, datepickerOptions, {
      showOn: 'both', // --> 'focus' and 'button'
      onClose: function (date) {vm.$set(key, date.match(/^(0?[1-9]|[12][0-9]|3[01])[\/\-\.](0?[1-9]|1[012])[\/\-\.]\d{4}$/) ? date : ''); }
    });
    $(this.el).datepicker(opts);
  },
  update: function (val) {
    $(this.el).datepicker('setDate', val);
  }
});

Vue.directive('selectmenu', {
  bind: function () {
    var vm = this.vm;
    var key = this.expression;
    $(this.el).selectmenu({change: function (evt, ui) {vm.$set(key, ui.item.value);}});
  },
  update: function (val) {
    $(this.el).selectmenu().val(val).selectmenu('refresh');
  }
});

Vue.directive('ebselect', {
  bind: function () {
    var vm = this.vm;
    var key = this.expression;
    //$(this.el).ebselect({change: function (evt, ui) {vm.$set(key, ui.item.value);}});
  },
  update: function (val) {
    console.log( 'vue ebselect', val, $(this.el));
  }
});

Vue.directive('button', {
  bind: function () {
    $(this.el).button();
  }
});
