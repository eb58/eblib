/* global _,$ *//* jshint expr: true */
// string-polyfills
if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
  };
}
if (!String.prototype.contains) {
  String.prototype.contains = function () {
    return String.prototype.indexOf.apply(this, arguments) !== -1;
  };
}
if (!String.prototype.startsWith) {
  String.prototype.startsWith = function (searchString, position) {
    position = position || 0;
    return this.indexOf(searchString, position) === position;
  };
}
if (!String.prototype.endsWith) {
  String.prototype.endsWith = function (searchString, position) {
    var subjectString = this.toString();
    if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
      position = subjectString.length;
    }
    position -= searchString.length;
    var lastIndex = subjectString.indexOf(searchString, position);
    return lastIndex !== -1 && lastIndex === position;
  };
}

if (typeof $ !== 'undefined')
  $.extend({
    alert: function (title, message) {
      message = message || '';
      $("<div id='dlgAlert'></div>").dialog({
        buttons: {
          "Ok": function () {
            $(this).dialog("close");
          }
        },
        close: function () {
          $(this).remove();
        },
        title: title,
        modal: true,
        closeText: 'Schlie\u00dfen'
      }).html('<br>' + message.replace(/\n/g, '<br>'));
    }
  });

if (typeof $ !== 'undefined')
  $.extend({
    confirm: function (title, question, callbackYes, callbackNo) {
      question = question || '';
      callbackYes = callbackYes || function () {
        console.log('$.confirm:please provide callback!');
      };
      $("<div id='dlgConfirm'></div>").dialog({
        buttons: {
          "Ja": function () {
            callbackYes && (callbackYes());
            $(this).dialog("close");
          },
          "Nein": function () {
            callbackNo && (callbackNo());
            $(this).dialog("close");
          }
        },
        close: function () {
          $(this).remove();
        },
        title: title,
        modal: true,
        closeText: 'Schlie\u00dfen'
      }).html('<br>' + question.replace(/\n/g, '<br>'));
    }
  });



