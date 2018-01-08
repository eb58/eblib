/* global _ */

var icdUtils = (function () {
  'use strict';
  if( typeof gIcddata !== 'undefined' ){
    sessionStorage['icddata'] = JSON.stringify(gIcddata);
  }
  var icddata = sessionStorage['icddata'] ? JSON.parse(sessionStorage['icddata']) : null; 

  function getIcdData() {
    if (icddata )  {
      return icddata;
    }
    $.ajax({
      url: "ajax/workspace/workorder.do?action=icd-codes&ajax=1  ",
      async: false,
      success: function (result) {
        handleAjaxResult(result, function (data) {
          icddata = data.result.map(function (icd) { return [icd.id, icd.text, icd.code]; });
          sessionStorage['icddata'] = JSON.stringify(icddata);
        });
      }
    });
    return icddata;
  }

  function getIcdCodeFromNumber(code) {
    var x = _.find(icdUtils.getIcdData(), function (o) { return o[2] === code; });
    return x ? {id: x[0], text: x[1], code: x[2]} : null;
  }

  function checkIcdCodeNumber(codenumber) {
    return !!_.find(icdUtils.getIcdData(), function (o) { return o[2] === codenumber; });
  }
  // api
  return {
    getIcdData: getIcdData,
    getIcdCodeFromNumber: getIcdCodeFromNumber,
    checkIcdCodeNumber: checkIcdCodeNumber,
  };
})();