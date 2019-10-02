/* global Vue */

Vue.component('select2', {
  props: ['options', 'value'],
  template: '<select><slot></slot></select>',
  mounted: function (){
    var vm = this
    $(this.$el)
            .select2({data: this.options})
            .val(this.value)
            .trigger('change')
            .on('change', function (){
              vm.$emit('input', this.value)
            })
  },
  watch: {
    value: function (value){
      $(this.$el).val(value).trigger('change')
    },
    options: function (options){ // update options
      $(this.$el).empty().select2({data: options})
    }
  },
  destroyed: function (){
    $(this.$el).off().select2('destroy')
  }
})

Vue.component('eb-vue-date-picker', {
  template: '<input/>',
  props: ['value'],
  mounted: function (){
    var vm = this
    const opts = {
      dateFormat: this.dateFormat,
      changeMonth: true,
      changeYear: true,
      showOn: "button",
      buttonText: "<i class='fa fa-calendar fa-lg'></i>"
    }
    $(this.$el)
            .datepicker(opts)
            .trigger('change')
            .on('change', function (){
              vm.$emit('input', this.value)
            });
  },
  watch: {
    value: function (value){
      $(this.$el).val(value).trigger('change')
    },
    options: function (options){
      $(this.$el).empty().datepicker(options)
    }
  },
  beforeDestroy: function (){
    $(this.$el).off().datepicker('hide').datepicker('destroy');
  }
});

Vue.component('eb-vue-checkbox', {
  template: '<input type="checkbox"/>',
  props: ['value'],
  mounted: function (){
    var vm = this
    $(this.$el)
            .checkboxradio({
              icon: false
            })
            .trigger('change')
            .on('change', function (){
              vm.$emit('input', this.value)
            });
  },
  watch: {
    value: function (value){
      $(this.$el).val(value).trigger('change')
    },
  },
  beforeDestroy: function (){
    $(this.$el).off().checkboxradio('destroy');
  }
});

Vue.component('eb-vue-dropdown', {
  props: ['options', 'value'],
  template: '<select><slot></slot></select>',
  mounted: function (){
    var vm = this
    $(this.$el)
            .selectmenu({
               change:vm.$emit('input', this.value)
            })
            .val(this.value)
            .trigger('change')
            .on('change', function (){
              vm.$emit('input', this.value)
            })
  },
  watch: {
    value: function (value){
      $(this.$el).val(value).trigger('change')
    },
  },
  destroyed: function (){
    $(this.$el).off().selectmenu('destroy')
  }
});



