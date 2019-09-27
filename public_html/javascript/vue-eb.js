/* global Vue, datepickerOptions, _ */

Vue.directive.util = {
  getFullDate: function (date, isProcessDate){
    // isProcessDate === false -> '1.3.58' -> '01.03.1958' | '1.3.1958' -> '01.03.1958'
    // isProcessDate === true  -> '1.3.58' ->' 01.03.2058' | '1.3.2058' -> '01.03.2058'
    var f = function (date){
      var arr = date.split('.');
      var d = ('0' + arr[0]).slice(-2);
      var m = ('0' + arr[1]).slice(-2);
      var y = arr[2] - 0;
      y += y < 100 ? (isProcessDate ? 2000 : 1900) : 0;
      return  d + '.' + m + '.' + y;
    };
    if (date.match(/^(0?[1-9]|[12][0-9]|3[01])[\.](0?[1-9]|1[012])[\.]\d{4}$/)) {
      return date;
    }
    if (date.match(/^(0?[1-9]|[12][0-9]|3[01])[\.](0?[1-9]|1[012])[\.]\d{1,2}$/)) {
      return f(date);
    }
    return '';
  },
  datepickerOpts: function (isProcessDate){
    return {
      bind: function (){
        var vm = this.vm;
        var key = this.expression;
        var opts = _.extend({}, datepickerOptions, {
          showOn: 'button', // --> --> 'focus', 'button' or 'both'
          onClose: function (date){
            var d = Vue.directive.util.getFullDate(date, isProcessDate);
            vm.$set(key, d);
          }
        });
        $(this.el).datepicker(opts);
        $(this.el)
                .on('keyup', function (evt){
                  evt.keyCode === 13 && opts.onClose(evt.target.value);
                })
                .on('blur', function (evt){
                  opts.onClose(evt.target.value);
                })
                .on('focus', function (evt){
                  $(evt.target).select();
                });
      },
      update: function (val){
        $(this.el).datepicker('setDate', val);
      }
    }
  }
}

Vue.directive('datepicker', Vue.directive.util.datepickerOpts(false));
Vue.directive('datepicker-processdate', Vue.directive.util.datepickerOpts(true));

Vue.directive('selectmenu', {
  bind: function () {
    var vm = this.vm;
    var key = this.expression;
    const w = $(this.el).width() || "200px";
    $(this.el).selectmenu({
      width: w,
      change: function (evt, ui){
        vm.$set(key, ui.item.value);
      }});
  },
  update: function (val){
    $(this.el).selectmenu().val(val).selectmenu('refresh');
  }
});

Vue.directive('radio', {
  bind: function (){
    var vm = this.vm;
    var key = this.expression;
    $(this.el).checkboxradio().on('change', function (evt, ui){
      vm.$set(key, evt.target.id);
    });
  },
  update: function (val){
    $(this.el).prop("checked", $(this.el).val() === val).checkboxradio().checkboxradio("refresh");
  }
});

Vue.directive('ebselect', {
  bind: function (){
    var vm = this.vm;
    var key = this.expression;
    //$(this.el).ebselect({change: function (evt, ui) {vm.$set(key, ui.item.value);}});
  },
  update: function (val){
    console.log('vue ebselect', val, $(this.el));
  }
});

Vue.directive('button', {
  bind: function (){
    $(this.el).button();
  }
});
