/* global _, jQuery */ /* jshint multistr: true *//* jshint expr: true */
(function ($) {
  "use strict";
  $.fn.ebselect2 = function (opts) {
    const id = this[0].id;
    const self = this;
    const defopts = {
      multiple: true,
      height: Math.min(100, 50 * opts.values.length),
      width: 400,
      values: [{v: '1', txt: 'test1'}, {v: '2', txt: 'test2'}], //  just an example for docu
      selected: [],
      disabled: false,
      onChange: function (o) {
        console.log("ebselect2 -- selected values:" + o.getSelectedValues());
      }
    };
    const myopts = $.extend({}, defopts, opts);

    this.id = id;

    myopts.values = myopts.values.map(function (key, val) {
      return _.isString(key) ? {v: val, txt: key} : key;
    });

    if (myopts.selected) {
      // selected =  [1,3]  
      // or 
      // selected =  ['Keyword1', 'Keyword3'] 
      // or  
      // selected =  [
      //   {v: 9, txt: 'Besonderheit1'},
      //   {v: 2, txt: 'Besonderheit2'},
      //   {v: 6, txt: 'Besonderheit3'}
      //  ]
      if (_.isString(myopts.selected[0])) {
        myopts.selected = myopts.selected.map(function (string) {
          const x = myopts.values.find(value => value.txt === string);
          return x ? x.v : 'undefined'
        });
      } else if (_.isObject(myopts.selected[0])) {
        myopts.selected = myopts.selected.map(function (o) {
          return o.v;
        });
      }
    }

    const init = function (a) {

      const api = {
        getSelectedValues: function () {
          return selectField.select2('data').map(function (o) {
            return _.isNumber(o.id) ? Number(o.id): o.id;
          })
          return selectField;
        },
        setSelectedValues: function (values) {
          selectField.val(values);
          selectField.trigger('change');
          return selectField;
        }
      };

      const options = myopts.values.map(function (o) {
        const val = typeof o.txt !== 'undefined' ? ' value=' + o.v : '';
        const txt = typeof o.txt !== 'undefined' ? o.txt : o;
        return '<option' + val + '>' + txt + '</option>';
      }).join('\n');
      const t = _.template('<select id="<%=id%>" name="<%=id%>" <%=multiple%>><%= o %> </select>');
      const s = t({
        id: id + 'X',
        o: options,
        multiple: myopts.multiple ? 'multiple' : '',
      });
      a.html(s);
      const selectField = $('#' + id + 'X').select2({language: 'de', width: myopts.width});
      myopts.selected && api.setSelectedValues(myopts.selected);
      selectField.prop('disabled', myopts.disabled)
      selectField.on("change", myopts.onChange );
      return api;
    };

    const api = init(this);

    return _.extend({}, this, api);
  };
})(jQuery);