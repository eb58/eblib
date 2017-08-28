/* global _ */

var icdUtils = (function () {
  'use strict';

  function getIcdData() {
    if (sessionStorage['icddata']) {
      return JSON.parse(sessionStorage['icddata']);
    }
    $.ajax({
      url: "ajax/workspace/workorder.do?action=icd-codes&ajax=1  ",
      async: false,
      success: function (result) {
        handleAjaxResult(result, function (data) {
          sessionStorage['icddata'] = JSON.stringify(data.result.map(function (icd) {
            return [icd.id, icd.text, icd.code];
          }));
        });
      }
    });
    return JSON.parse(sessionStorage['icddata']);
  }

  function getIcdCodeFromNumber(code) {
    var x = _.find(icddata, function (o) {
      return o[2] === code;
    });
    return x ? {id: x[0], text: x[1]} : null;
  }
  // api
  return {
    getIcdData: getIcdData,
    getIcdCodeFromNumber: getIcdCodeFromNumber,
  };
})();
