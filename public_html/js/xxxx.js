/* global _ */
(function ($) {
  "use strict";
  $.fn.xxxx = function (opts, data) {
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
  $.fn.ebinput = function (opts, data, m) {
    var id = this[0].id;
    var type = this[0].type;
    this.id = id;

    m = m || id.replace('#', '');
    if (type === 'text' || type === 'password') {
      $(this).val(data[m]);
      $(this).keyup(function () {
        data[m] = $(this).val();
        console.log('changed ' + id, data[m], data);
      });
    }
    if ($('select',this).length) {
      var self = this;
      this.setSelectedValue(data[m]);
      $( '#' + id ).on( "selectmenuchange", function( event, ui ) {
        data[m] = self.getSelectedValue();
        console.log('changed ' + id, data[m], data);
        
      } );
    }
    if ($('textarea',this).length) {
      $('#' + id + ' textarea').val(data[m])
      $('#' + id + ' textarea').keyup(function () {
        data[m] = $('#' + id + ' textarea').val();
        console.log('changed ' + id, data[m], data);
      });
      this.setTextAreaCounter();
    }
    return this;
  };
})(jQuery);


