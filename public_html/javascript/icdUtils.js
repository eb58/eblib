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

  function getIcdCodeObjectById(id) {
    var x = _.find(icdUtils.getIcdData(), function (o) { return o[0] === id; });
    return x ? {id: x[0], text: x[1], code: x[2]} : null;
  }
  
  function getIcdCodeObjectByCode(icdCode) {
    var x = _.find(icdUtils.getIcdData(), function (o) { return o[2] === icdCode; });
    return x ? {id: x[0], text: x[1], code: x[2]} : null;
  }

  function checkIcdCode(icdCode) {
    return !!_.find(icdUtils.getIcdData(), function (o) { return o[2] === icdCode; });
  }
  // api
  return {
    getIcdData: getIcdData,
    getIcdCodeObjectById: getIcdCodeObjectById,
    getIcdCodeObjectByCode: getIcdCodeObjectByCode,
    checkIcdCode: checkIcdCode,
  };
})();