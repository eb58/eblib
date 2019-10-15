/* global Vue */

Vue.component('eb-vue-dropdown', {
    props: ['options', 'value'],
    template: '<select>\n\
                <option v-for="opt in options" :value="opt.id">{{opt.text}}</options>\n\
              </select>',
    mounted: function () {
        const  vm = this
        const change = function () {
            vm.$emit('input', this.value)
        }
        const selectmenuopts = {
            change: change
        }
        $(this.$el)
                .selectmenu(selectmenuopts)
                .trigger('change')      // emit event on change.
                .val(this.value)
                .selectmenu("refresh")
    },
    watch: {
        value: function (value) {
            $(this.$el).val(value).trigger('change')
        },
        options: function () { // update options
            $(this.$el).selectmenu("refresh"); //
        }
    },
    beforeDestroy: function () {
        $(this.$el).off().selectmenu('destroy')
    }
});

Vue.component('eb-vue-date-picker', {
    template: '<input/>',
    props: ['opts', 'value'],
    mounted: function () {
        const vm = this;
        const defopts = {
            dateFormat: 'dd.mm.yy',
            changeMonth: true,
            changeYear: true,
            showOn: "button",
            buttonText: "<i class='fa fa-calendar fa-lg'></i>",
        }
        const myopts = $.extend({}, defopts, this.opts);
        $(this.$el)
                .datepicker(myopts)
                .datepicker('setDate', vm.value)
                .on('change', function () {
                    vm.$emit('input', this.value)
                });

    },
    watch: {
        value: function (value) {
            $(this.$el).val(value).trigger('change')
        },
        options: function (options) {
            $(this.$el).empty().datepicker(options)
        }
    },
    beforeDestroy: function () {
        $(this.$el).off().datepicker('destroy');
    }
});

Vue.component('eb-vue-checkbox', {
    template: '<input type="checkbox"/>',
    props: ['value'],
    mounted: function () {
        const vm = this
        $(this.$el)
                .checkboxradio({icon: false})
                .trigger('change')
                .on('change', function () {
                    vm.$emit('input', this.value)
                });
    },
    watch: {
        value: function (value) {
            $(this.$el).val(value).trigger('change')
        },
    },
    beforeDestroy: function () {
        $(this.$el).off().checkboxradio('destroy');
    }
});


Vue.component('select2', {
    props: ['options', 'value'],
    template: '<select><slot></slot></select>',
    mounted: function () {
        const vm = this
        $(this.$el)    // init select2
                .select2({data: this.options})
                .val(this.value)
                .trigger('change')      // emit event on change.
                .on('change', function () {
                    vm.$emit('input', this.value)
                })
    },
    watch: {
        value: function (value) { // update value
            $(this.$el).val(value).trigger('change')
        },
        options: function (options) { // update options
            $(this.$el).empty().select2({data: options})
        }
    },
    beforeDestroy: function () {
        $(this.$el).off().select2('destroy')
    }
})


