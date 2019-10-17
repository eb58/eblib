/* global _, mx */
var dlgInsurantInfo = function (opts, data) {
  $('#dlgInsurantInfo').remove();
  var dlg = $('\
      <div id="dlgInsurantInfo">\n\
        <div id="hintList"></div>\n\
      </div>');
  var defopts = {
    open: function ( ) {
      var renderLine = function (txt) {
        return txt.replace(/ /g, '\u00a0');
      };
      var commentopts = {
        columns: [
          {name: "Verfasser", render: renderLine},
          {name: "Hinweis"},
          {name: "Datum", render:  renderLine}
        ],
        bodyHeight: 300,
        rowsPerPage: 1000,
        flags: {filter: false, config: false}
      };
      var tblData = mx(data.insurantComments.map(function (o) {
        return _.values(o);
      })).cols([1, 2, 3]);
      $('#hintList').ebtable(commentopts, tblData);
      $('#hintList .ctrl').hide();
    },
    title: 'Hinweise zum Versicherten - ' + opts.name + ' (' + opts.wid + ')',
    height: 300, width: 600,
    closeText: 'Schlie\u00dfen',
    modal: true,
    buttons: {
      'Abbrechen': function () {
        $(this).dialog("destroy");
      }
    }
  };
  var myDlgOpts = $.extend({}, defopts, opts);
  dlg.dialog(myDlgOpts);
  // styling
  $('#dlgInsurantInfo').css('background-color', '#eeeee0');
  $('#dlgInsurantInfo').parent().find('*').css('font-size', '12px');
};