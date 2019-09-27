/* global jQuery*/
(function ($) {
  (function () {
    var module = (function () {
      return {
        f1: function f1() {
          console.log("plugin1-f1");
          return this;
        },
        f2: function f2() {
          console.log("plugin1-f2");
        }
      };
    })();
    $.extend($.fn, module);
    return this;
  })();
  (function () {
    var x = {
      f2: function f2() {
        console.log("plugin2-f2");
        return this;
      },
      f3: function f3() {
        console.log("plugin2-f3");
        return this;
      }
    };
    $.extend($.fn, x);
    return this;
  })();
}(jQuery));