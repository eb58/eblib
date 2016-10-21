/* global _, moment, products, fags, resultcategorys, resultlocations, results, datepickerOptions, reasons, product2resultcategory, reason2product, product2resultlocation, product2result */

var dlgMimaSFB = function (opts) {
  $('#dlgMimaSFB').remove();
  opts = opts || {};

  var dlgDefOpts = {
    open: function () {
      init();
    },
    title: 'Mima-SFB erstellen',
    width: 1035,
    height: 430,
    closeText: 'Schlie\u00dfen',
    buttons: {
      'OK': function () {
        computeIds();
        console.log( data );
        $(this).dialog("close");
      },
      'Beenden': function () {
        $(this).dialog("close");
      }
    }
  };

  var getListData = function (data) {
    return [{v: -1, txt: ''}].concat(data.map(function (o) {
      return {v: o.number, txt: o.number + ' ' + o.text}
    })).sort(function (a, b) {
      return a.txt === b.txt ? 0 : (a.txt < b.txt ? -1 : +1)
    });
  }

  function productsList(reasonnumber) {
    var ids = _.pluck(_.where(reason2product, {reasonid: _.findWhere(reasons, {number: reasonnumber}).id}), 'productid');
    return getListData(_.compact(ids.map(function (o) {
      return _.findWhere(products, {id: o})
    })));
  }
  function resultcategoryList(prodnumber) {
    var ids = _.pluck(_.where(product2resultcategory, {productid: _.findWhere(products, {number: prodnumber}).id}), 'resultcategoryid');
    return getListData(_.compact(ids.map(function (o) {
      return _.findWhere(resultcategorys, {id: o})
    })));
  }
  function resultlocationList(prodnumber) {
    var ids = _.pluck(_.where(product2resultlocation, {productid: _.findWhere(products, {number: prodnumber}).id}), 'resultlocationid');
    return  getListData(_.compact(ids.map(function (o) {
      return _.findWhere(resultlocations, {id: o})
    })));
  }
  function resultList(prodnumber) {
    var ids = _.pluck(_.where(product2result, {productid: _.findWhere(products, {number: prodnumber}).id}), 'resultid');
    return  getListData(_.compact(ids.map(function (o) {
      return _.findWhere(results, {id: o})
    })));
  }
  
  function computeIds(){
    data.fagid = data.fagnumber && _.findWhere(fags,{number:data.fagnumber}).id
    data.productid = data.productnumber && _.findWhere(products,{number:data.productnumber}).id
    data.resultcategoryid = data.resultcategorynumber && _.findWhere(resultcategorys,{number:data.resultcategorynumber}).id
    data.resultlocationid = data.resultlocationnumber && _.findWhere(resultlocations,{number:data.resultlocationnumber}).id
    data.resultid = data.resultnumber && _.findWhere(results,{number:data.resultnumber}).id
  }

  function cp2fagtextfield() {
    var fagnumber = $('#ddfagX').val();
    $('#tfag').val(fagnumber);
    $('#ddproduct').ebdropdown({width: '800px', change: initProductDependingFields}, productsList(fagnumber)).ebbind(data, 'productnumber');
    initProductDependingFields();
  }

  function cp2fagdd() {
    var fagnumber = $('#tfag').val();
    if (!_.findWhere(reasons, {number: fagnumber})) {
      $('#tfag').val('');
      $('#ddfagX').val(-1).selectmenu('refresh');
      initProductDependingFields();
      $.alert('Hinweis', 'Kein erlaubte Nummer für Frage des Auftragebers: ' + fagnumber);
      return;
    }
    $('#ddfagX').val(fagnumber).selectmenu('refresh');
    $('#ddproduct').ebdropdown({width: '800px', change: initProductDependingFields}, productsList(fagnumber)).ebbind(data, 'productnumber');
    initProductDependingFields();
    //console.log('cp2dd', evt.target.id, id, val, table, evt);
  }

  function initProductDependingFields() {
    var prodnumber = $('#ddproductX').val();
    if (!prodnumber || parseInt(prodnumber) < 0) prodnumber = '';
    $('#ddresultcategory').ebdropdown({width: '800px'}, resultcategoryList(prodnumber)).ebbind(data, 'resultcategorynumber');
    $('#ddresultlocation').ebdropdown({width: '800px'}, resultlocationList(prodnumber)).ebbind(data, 'resultlocationnumber');
    $('#ddresult').ebdropdown({width: '800px'}, resultList(prodnumber)).ebbind(data, 'resultnumber');
  }

  var init = function () {

    $(".positive-integer").numeric({decimal: false, negative: false});

    $('#tfag').ebbind(data, 'fagnumber').change(cp2fagdd)

    $('#ddfag').ebdropdown({width: '800px', change: cp2fagtextfield}, getListData(fags)).ebbind(data, 'fagnumber');
    $('#ddproduct').ebdropdown({width: '800px', change: initProductDependingFields}, getListData([])).ebbind(data, 'productnumber');
    initProductDependingFields()
    
    $('#begutachtungsdatum').datepicker(datepickerOptions).ebbind(data);
    $('#gutachter').ebbind(data);
    $('#bearbeitungsdauerHours').ebbind(data);
    $('#bearbeitungsdauerMins').ebbind(data);

    // actions
    $('.ui-icon-search').click(function () {
      dlgSelectExperts(function (v) {
        data.expertsid = v.userid;
        $('#gutachter').val(v.name);
        return true;
      });
    });
    $('.ui-icon-trash').click(function () {
      $('#gutachter').val(null);
    });

    // styling
    $('#dlgMimaSFB').css('background-color', '#eeeee0');
    $('#dlgMimaSFB td').css('padding', '3px 5px 3px 5px');
    $('#dlgMimaSFB #layouttable1 input').css('width', '40px');
    $('#dlgMimaSFB #layouttable1,#dlgMimaSFB #layouttable2').css('padding', '10px');
    $('#dlgMimaSFB img.ui-datepicker-trigger').css('vertical-align', 'bottom');
    $("#dlgMimaSFB #bearbeitungsdauerHours,#dlgMimaSFB #bearbeitungsdauerMins").css('width', '69px');
  };
  var dlgTemplate = ("\
    <div id='dlgMimaSFB'>\n\
      <table id='layouttable1'>\n\
        <tbody>\n\
          <tr><td>Frage Auftraggeber</td><td><input id='tfag' class='positive-integer' type='text'> </td><td><div id='ddfag'></div></td></tr>\n\
          <tr><td>Produkt           </td><td>                                                       </td><td><div id='ddproduct'></div></td></tr>\n\
          <tr><td>Erledigungsart    </td><td>                                                       </td><td><div id='ddresultcategory'></div></td></tr>\n\
          <tr><td>Erledigungsort    </td><td>                                                       </td><td><div id='ddresultlocation'></div></td></tr>\n\
          <tr><td>Ergebnis          </td><td>                                                       </td><td><div id='ddresult'></div></td></tr>\n\
        </tbody>\n\
      </table>\n\
      <table id='layouttable2'>\n\
        <tr><td>Begutachtungsdatum</td><td><input type='text' id='begutachtungsdatum'></td></tr>\n\
        <tr>\n\
          <td>Verantwortlicher Gutachter</td>\n\
          <td><input type='text' id='gutachter' disabled>\n\
            <span id='gaSearch' style='display:inline-block;' class='ui-icon ui-icon-search' title='Gutachter auswählen'></span>\n\
            <span id='gaDelete' style='display:inline-block;' class='ui-icon ui-icon-trash'  title='Gutachter entfernen'></span>\n\
          </td>\n\
        </tr>\n\
        <tr>\n\
          <td>Bearbeitungsdauer(Std/Min)</td><td><input type='text' class='positive-integer' id='bearbeitungsdauerHours'> / <input type='text' class='positive-integer' id='bearbeitungsdauerMins'></td>\n\
        </tr>\n\
      </table>\n\
    </div>");

  var data = {
    fagnumber: '270',
    begutachtungsdatum: moment().format('DD.MM.YYYY')
  };
  var dlg = $(dlgTemplate);
  dlg.dialog($.extend({}, dlgDefOpts, opts || {}));
  dlg.data = data;
  dlg.computeIds = computeIds
  return dlg;
};
