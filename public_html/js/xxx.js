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
