/* global _ */
(function ($) {
  "use strict";
  $.fn.ebxxx = function (opts, data) {
    var id = this[0].id;
    var defopts = {
      fields: {
        user: {type: 'input', label: 'User:'},
        pwd: {type: 'input', label: 'Password:'}
      }
    };
    var myopts = $.extend({}, defopts, opts);
    var init = function init(a) {
      var res = _.reduce(_.keys(myopts.fields), function (acc, name) {
        var o = myopts.fields[name];
        console.log(o);
        return acc + _.template('<%=label%><input type="text" id="<%=id%>" />')({id: name, label: o.label});
      }, '');
      a.html(res);
    }(this);
    this.id = id;
    _.each(_.keys(myopts.fields), function (name) {
      $('#' + name).on('keyup', function (event, a, b) {
        myopts.fields[event.target.id].value = event.target.value;
      });
    });
    return this;
  };
})(jQuery);

//###############################################################################################################

(function ($) {
  "use strict";
  $.fn.ebbind = function (data, m) {
    var id = this[0].id;
    var type = this[0].type;
    this.id = id;
    var self = this;

    m = m || this.id.replace('#', '');
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
      this.setValue(data[m]).on("change", function () {
        data[m] = self.getValue();
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
    return this;
  };
})(jQuery);


