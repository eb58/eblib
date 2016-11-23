/* global _ *//* jshint multistr: true */
var dlgTestEbselect = function (opts) {
  opts = opts || {};
  $('#dlgTestEbselect').remove();
  var select;
  var dlg = $("\
    <div id='dlgTestEbselect'>\n\
       <div id='select'></div>\n\
    </div>");
  var defopts = {
    open: function ( ) {
      var selopts = {
        values: ['Schlagwort 1', 'Schlagwort 2', 'Schlagwort 3', 'Schlagwort 4', 'Schlagwort 5'],
        onselchange: function (select) {
          console.log('xx', select.getSelectedValues().join());
        }
      };
      select = $("#select").ebselect(selopts, ['Schlagwort 1', 'Schlagwort 4']);
      styling();
    },
    title: opts.title || 'TEST',
    width: 800,
    height: 520,
    closeText: 'Schlie\u00dfen',
    modal: true,
    buttons: {
      'OK': function () {
        console.log('yy', select.getSelectedValues().join());
        //$(this).dialog("close");
      },
      'Abbrechen': function () {
        $(this).dialog("close");
      }
    }
  };
  var myopts = $.extend({}, defopts, opts);
  dlg.dialog(myopts);
  //  Styling
  function styling() {
    $('#dlgTestEbselect').css('background-color', '#eeeee0');
  }
};