/* global _, jQuery */ /* jshint multistr: true *//* jshint expr: true */
(function ($) {
  "use strict";
  $.fn.ebselect = function (opts, selected) {  
    // selected = 
    //  [1,3]  
    // or 
    //  ['Keyword1', 'Keyword3'] 
    // or  
    //  [
    //   {v: 9, txt: 'Besonderheit1'},
    //   {v: 2, txt: 'Besonderheit2'},
    //   {v: 6, txt: 'Besonderheit3'}
    //  ]
    selected = selected || [];
    var id = this[0].id;
    var self = this;
    var defopts = {
      height: Math.min(100, 50 * opts.values.length),
      width: 400,
      values: [{v: '1', txt: 'test1'}, {v: '2', txt: 'test2'}], //  just an example for docu
      onselchange: function (o) {
        console.log("selected values:" + o.getSelectedValues());
      }
    };
    var myopts = $.extend({}, defopts, opts);

    this.id = id;
    myopts.values = _.map(myopts.values, function (key, val) {
      return _.isString(key) ? {v: val, txt: key} : key;
    });
    if( selected.length ){
      if( _.isNumber(selected[0]) ){
        _.each(myopts.values, function (val) { val.selected = _.indexOf(selected, val.v) >= 0; }); 
      }else{
        _.each(myopts.values, function (val) { val.selected = _.indexOf(selected, val.txt) >= 0; }); 
      }
    }

    (function (a) {
      var options = _.reduce(myopts.values, function (acc, o) {
        var isselected = o.selected ? 'checked="checked"' : '';
        return acc + _.template('\
               <li>\
                 <input type="checkbox" id="<%=id%>" value="<%=value%>" <%=isselected%> /><%=txt%>\n\
               </li>')({id: o.txt.replace(/ /g,''), value: o.v, isselected: isselected, txt: o.txt});
      }, '');
      var s = _.template('\
            <div class="ebselect" style="height:<%=height%>px; width:<%=width%>px;">\n\
              <ul> <%=options%> </ul>\n\
            </div>\n')({options: options, width: myopts.width, height: myopts.height});
      a.html(s);
      myopts.disabled && $('#' + id + ' input' ).prop('disabled', true);
    })(this);

    this.getSelectedValues = function getSelectedValues() {
      return _.pluck($('.ebselect input:checked',self), 'value');
    };
    this.getSelectedValuesAsString = function getSelectedValues() {
      return _.map(this.getSelectedValues(), function (o, idx) {
        return _.findWhere(myopts.values,{v:parseInt(o)}).txt;
      });
    };
    $('.ebselect input',self).on('change', function () {
      myopts.onselchange(self);
    });
    myopts.onselchange(this);
    return this;
  };
})(jQuery);