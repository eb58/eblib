/* global top, _ */

jQuery.fn.extend({
  setCursorPosition: function (position) {
    if (this.length === 0)
      return this;
    return $(this).setSelection(position, position);
  },

  setSelection: function (selectionStart, selectionEnd) {
    if (this.length === 0)
      return this;
    var input = this[0];

    if (input.createTextRange) {
      var range = input.createTextRange();
      range.collapse(true);
      range.moveEnd('character', selectionEnd);
      range.moveStart('character', selectionStart);
      range.select();
    } else if (input.setSelectionRange) {
      input.focus();
      input.setSelectionRange(selectionStart, selectionEnd);
    }
    return this;
  }
});

function enableOnSelected(options) {
  var settings = $.extend({
    minSelected: 1
  }, options);

  var cnt = 0;

  if (settings.checkbox)
    cnt = $('input[name=' + settings.checkbox + ']:checked').size();

  var enabled = (cnt >= settings.minSelected);

  if (settings.elements)
    for (var i = 0; i < settings.elements.length; i++)
      $('#' + settings.elements[i]).prop('disabled', !enabled);
}

// ----------------------------------------------------------------------------------------
if (typeof $ !== 'undefined') {
  $.extend({
    alert: function (title, message, callback) {
      message = message || '';
      $("<div id='dlgAlert'></div>").dialog({
        open: function () {
          $('#dlgAlert').parent().css('font-size', '12px');
        },
        buttons: {
          "Ok": function () {
            $(this).dialog("close");
            callback && callback();
          }
        },
        close: function () {
          $(this).remove();
        },
        width: 400,
        title: title,
        modal: true,
        closeText: 'Schlie\u00dfen'
      }).html('<br>' + message.replace(/\n/g, '<br>'));
    },
    confirm: function (title, question, callbackYes, callbackNo) {
      question = question || '';
      $("<div id='dlgConfirm'></div>").dialog({
        open: function () {
          $('#dlgConfirm').parent().css('font-size', '12px');
        },
        buttons: {
          "Ja": function () {
            $(this).dialog("close");
            callbackYes && callbackYes();
          },
          "Nein": function () {
            $(this).dialog("close");
            callbackNo && callbackNo();
          }
        },
        close: function () {
          $(this).remove();
        },
        title: title,
        modal: true,
        width: 400,
        closeText: 'Schlie\u00dfen'
      }).html('<br>' + question.replace(/\n/g, '<br>'));
    }
  });

// ----------------------------------------------------------------------------------------
  $(document).ajaxStart(function () {
    var elems = 'html,body,input';
    $(elems).addClass('busy');
    top.frames && _.each(top.frames, function (frame, idx) {
      frame.$ && frame.$(elems).addClass('busy');
      idx === 2 && frame.frames && _.each(frame.frames, function (f) {
        f.$ && f.$(elems).addClass('busy');
      });
    });
  });

  $(document).ajaxStop(function () {
    var elems = 'html,body,input';
    $(elems).removeClass('busy');
    top.frames && _.each(top.frames, function (frame, idx) {
      frame.$ && frame.$(elems).removeClass('busy');
      idx === 2 && frame.frames && _.each(frame.frames, function (f) {
        f.$ && f.$(elems).removeClass('busy');
      });
    });
  });

  // ----------------------------------------------------------------------------------------

  function handleAjaxResult(res, opts) {
    opts = opts || {};
    opts = typeof opts === 'function' ? {cbOk: opts} : opts;

    var alrt = $.alert || function (title, msg) {
      alert(msg);
    };

    if (!res['message-type'] || res['message-type'] === 'message') {
      opts.cbOk && opts.cbOk(res);
      res['message-html'] && alrt(opts.msgtitle || 'Hinweis', res['message-html']);
    } else if (res['message-type'] === 'error') {
      opts.cbErr && opts.cbErr(res);
      alrt(opts.errortitle || 'Fehler', res['message-html']);
      return false;
    } else if (res['message-type'] === 'session') {
      alrt('Fehler', 'Ung\u00fcltige Session\n' + res['message-html']);
      return false;
    } else if (res['message-type'] === 'user') {
      alrt('Fehler', 'Ung\u00fcltiger Benutzer!\n' + +res['message-html']);
      return false;
    } else if (res['message-type']) {
      alrt('Fehler', 'Unbekannter Fehlertyp!');
      return false;
    }
    return true;
  }

}

function infoDlg(dlgTitle, msg, height, width) {
  $('#dlgInfo').remove();
  var $Infodialog = $('<div id=dlgInfo></div>')
          .dialog({
            height: height == null ? 150 : height,
            width: width == null ? 300 : width,
            title: dlgTitle,
            buttons: {
              "Ok": function () {
                $(this).dialog("close");
              }
            },
            open: function () {
              $('#dlgInfo').parent().css('font-size', '12px');
            }
          });
  $Infodialog.dialog('open');
  $Infodialog.html(msg);
}

function mkDropdownList(vals, id, text, bWithNullVal) {
  bWithNullVal = bWithNullVal === undefined ? true : bWithNullVal;
  var listVals = vals.map(function (o) {
    return {v: o[id], txt: o[text]};
  });
  return bWithNullVal ? [{v: null, txt: 'keine Auswahl'}].concat(listVals) : listVals;
}

function mkDropdownList2(vals, id, number, text, bWithNullVal) {
  bWithNullVal = bWithNullVal === undefined ? true : bWithNullVal;
  var listVals = vals.map(function (o) {
    return {v: o[id], txt: o[number] + ' ' + o[text]};
  });
  return bWithNullVal ? [{v: null, txt: 'keine Auswahl'}].concat(listVals) : listVals;
}

function callDlgBearbeitungszeiten(data, readonly) {
  var ordertypeid = top.frames[2].$('#Ordertype').val();
  var reasonnumber = top.frames[2].$('#Reasonnumber').val()
  if (ordertypeid == 0) {
    ordertype = top.frames[2].__findOrdertypeReason(reasonnumber);
    if (ordertype != null && (ordertype.ordertypeid == 1 || ordertype.ordertypeid == 2))
      ordertypeid = ordertype.ordertypeid;
  }
  var defSector = "";
  if (!readonly && top.noDefaultSector4OrderProcessingTimes != 1 && reasonnumber) {
    var reasonFilterValues = new Array;
    reasonFilterValues[0] = reasonnumber;
    reasonFilterValues[1] = reasonnumber.substring(0, 2) + '*';
    reasonFilterValues[2] = reasonnumber.substring(0, 1) + '**';
    var filteredList = top.frames[2].valueLists.reason_sectorList.filter( function(o){ return reasonFilterValues.indexOf(o.reason) > -1 } );
    if (filteredList.length > 0) // vollqualifizierte FAG kommen zuerst
      defSector = filteredList[0].sectorid;
  }

  dlgOpts = {
    readonly: readonly || !top.frames[2].currentUserIsGAorKFK,
    ordertype: ordertypeid,
    zeitdata: data.handlingCosts,
    checkdata: data.checkValues,
    currentuser: top.frames[2].$('#CurrentUser').val(),
    currentusername: top.frames[2].$('#CurrentUsername').val(),
    currentvga: top.frames[2].$('#Vga').val(),
    bereicheList: top.frames[2].ddlists.bereicheList,
    defSector: defSector,
    sectorPlausi: top.plausiSector4OrderProcessingTimes == 1 ? true : false,
    callback: function (data) {
      ajaxFunctions.saveBearbeitungszeiten(data, refreshWorkingTimes(data.handlingCosts));
    }
  };
  dlgBearbeitungsZeiten(dlgOpts);
}

function refreshWorkingTimes(zeitdata) {
  var examineTime = 0;
  var otherTime = 0;
  if (zeitdata != null)
    $.each(zeitdata, function (key, objarray) {
      if (key != 'migrated') {
        objarray.forEach(function (entry) {
          examineTime += entry['examine-time'];
          otherTime += entry['classification-time'] + entry['nonencountered-time'] + entry['setup-time'];
        })
      }
    })
  top.frames[2].$('#Timetoproduceproduct').val(examineTime);
  top.frames[2].$('#Totalworkingtime').val(otherTime);
  top.objectIsChanged = true;
}

function getDate(datestring) {
  if (!datestring)
    return new Date();
  var datearr = datestring.split('.');
  if (datearr.length < 3)
    return new Date();
  return new Date(datearr[2], datearr[1]-1, datearr[0]);
}

var ajaxFunctions = {
  showAuftragInfo: function showAuftragInfo(wid, name) {
    $.ajax({
      url: "khbasket2.do?ajax=1",
      data: {action: "basket-info", workorderid: wid},
      success: function (result) {
        handleAjaxResult(result, function (data) {
          dlgOrderInfo({wid: wid, name: name}, data);
        });
      },
      error: function (a, b, c) {
        console.log('showAuftragInfo Error', a, b, c);
      }
    });
  },
  showInsurantComment: function showInsurantComment(wid, name) {
    $.ajax({
      url: "khbasket2.do?ajax=1",
      data: {action: "insurant-comments", workorderid: wid},
      success: function (result) {
        handleAjaxResult(result, function (data) {
          dlgInsurantInfo({wid: wid, name: name}, data);
        });
      },
      error: function (a, b, c) {
        console.log('showInsurantComment Error', a, b, c);
      }
    });
  },
  releaseCheck4NewerIMDocs: function releaseCheck4NewerIMDocs(workorderids) {
    var localres = -1;
    $.ajax({
      url: 'ajax/workspace/workorder.do?action=releasecheck-orders-with-newdocs&ajax=1',
      data: {workorderids: workorderids},
      async: false,
      success: function (result) {
        handleAjaxResult(result, function (data) {
          localres = 0;
          if (result.orders.length > 0) {
            var n = 0;
            var msg = "Hinweis/Frage\nSeit der letzten Auftrags\u00fcbergabe an den Verantwortlichen Gutachter sind neue externe Dokumente eingetroffen!\n";
            msg += "Wollen Sie die Auftragsfreigabe fortsetzen (mit 'OK') oder f\u00fcr die Bearbeitung der neuen Dokumente abbrechen?\n";
            for (n; n < result.orders.length; n++)
              msg += '\n' + result.orders[n];
            if (!confirm(msg)) {
              console.log('Freigabe abgebrochen');
              localres = 1;
            }
          }
        });
      },
      error: function (a, b, c) {
        console.log('releaseCheck4NewerIMDocs Error', a, b, c);
      }
    });
    return localres;
  },
  setFirstDocRequested: function setFirstDocRequested(workorderid, escalationdate, reason) {
    $.ajax({
      url: "ajax/workspace/workorder.do?action=set-first-doc-requested&ajax=1",
      data: {
        workorderid: workorderid,
        escalationdate: escalationdate,
        reason: reason
      },
      success: function (result) {
        handleAjaxResult(result, function (data) {
          console.log('setFirstDocRequested', data);
        });
      },
      error: function (request, status, error) {
        console.log('setFirstDocRequested Error', error, request, status);
      }
    });
  },
  setOrderfileAccessProt: function setOrderfileAccessProt(workorderid, accessreason) {
    $.ajax({
      url: "ajax/workspace/workorder.do?action=set-orderfile-access-prot&ajax=1",
      data: {
        workorderid: workorderid,
        accessreason: accessreason
      },
      success: function (result) {
        handleAjaxResult(result, function (data) {
          console.log('setOrderfileAccessProt', data);
        });
      },
      error: function (request, status, error) {
        console.log('setOrderfileAccessProt Error', error, request, status);
      }
    });
  },
  setCompetenceHelpdesk: function setCompetenceHelpdesk(workorderids, bbsno) {
    $.ajax({
      url: "khbasket2.do?action=set-competence-helpdesk&ajax=1",
      data: {
        workorderids: workorderids,
        bbsno: bbsno
      },
      success: function (result) {
        handleAjaxResult(result, function (data) {
          console.log('setCompetenceHelpdesk', data);
          $.alert('Ergebnis', 'Beratungsstelle bei ' + data.result + (data.result > 1 ? ' Auftr\u00e4gen' : ' Auftrag') + ' ge\u00e4ndert.');
          grid.unselect();
        });
      },
      error: function (request, status, error) {
        console.log('setCompetenceHelpdesk Error', error, request, status);
      }
    });
  },
  getTextmoduleNames: function (tabname) {
    var textmodulesNames = 'textmodulesNames-' + tabname;
    if (sessionStorage[textmodulesNames]) {
      return JSON.parse(sessionStorage[textmodulesNames]);
    }
    $.ajax({
      dataType: "json",
      async: false,
      data: {tabname: tabname},
      url: 'ajax/workspace/workorder.do?action=get-textmodules&ajax=1',
      success: function (data) {
        handleAjaxResult(data, function (data) {
          if (!data['message-type'] && !data['message-html']) {
            var tmdata = data.result.map(function(row) { return {id: row.id, field: row.targetField, desc: row.shortDesc}; });
            sessionStorage[textmodulesNames] = JSON.stringify(tmdata);
            return tmdata;
          }
        });
      },
      error: function (request, status, error) {
        console.log('getTextmoduleNames Error', error, request, status);
      }
    });
    return JSON.parse(sessionStorage[textmodulesNames]);
  },
  checkIsEmployee: function checkIsEmployee(insuranceno, callback) {
    $.ajax({
      url: "ajax/workspace/workorder.do?action=insurant-is-employee&ajax=1",
      async: false,
      data: {insuranceno: insuranceno},
      success: function (result) {
        handleAjaxResult(result, callback);
      },
      error: function (request, status, error) {
        console.log('checkIsEmployee Error', error, request, status);
      }
    });
  },
  mimaStatusForInsuredperson: function mimaStatusForInsuredperson(ipid, callback) {
    $.ajax({
      url: "mima.do?action=mimastatus-for-insuredperson&ajax=1",
      data: {search: JSON.stringify(ipid)},
      method: "POST",
      success: function (mimaMarker) {
        handleAjaxResult(mimaMarker, callback)
      },
      error: function (request, status, error) {
        console.log('mimaStatusForInsuredperson Error', error, request, status);
      }
    });
  },
  searchMimaForInsuredperson: function searchMimaForInsuredperson(insuredperson, callback) {
    var searchCrit = {
      selection: 2,
      filter: {
        ipLastname: insuredperson.lastname,
        ipFirstname: insuredperson.firstname,
        ipDateOfBirth: insuredperson.dateofbirth,
        ipInsuranceno: insuredperson.insuranceno
      }
    };
    $.ajax({
      url: "mima.do?action=search&ajax=1",
      data: {search: JSON.stringify(searchCrit)},
      method: "POST",
      success: function (result) {
        handleAjaxResult(result, callback);
      },
      error: function (request, status, error) {
        console.log(request, status, error);
      }
    });
  },
  getBearbeitungszeiten: function getBearbeitungszeiten( onDataReceived ) {
    $.ajax({
      url: "ajax/workspace.do?action=load-handling-costs&ajax=1",
      method: "POST",
      success: function (data) {
        handleAjaxResult(data, function(data){
          onDataReceived(data);
        });
      },
      error: function (request, status, error) {
        console.log('getBearbeitungszeiten Error', error, request, status);
      }
    });
  },
  saveBearbeitungszeiten: function saveBearbeitungszeiten(data, callback) {
    $.ajax({
      url: "ajax/workspace.do?action=save-handling-costs&ajax=1",
      async: false,
      data: {data: JSON.stringify(data)},
      type: "POST",
      success: function (result) {
        var opts = { 
          cbOk : callback,
          errortitle: 'Fehler beim Speichern'
        };
        handleAjaxResult(result, opts);
      },
      error: function (request, status, error) {
        console.log(request, status, error);
        ret = 'ERROR';
      }
    });
  },
  searchDispoRules: function searchDispoRules(searchParams, callback) {
    $.ajax({
      url: "ajax/dispositionrules.do?zipbase64json=1&action=search-rules&ajax=1",
      method: "POST",
      async: false,
      data: {filter: JSON.stringify(searchParams)},
      success: function (result) {
        handleAjaxResult(result, function(result){
          var jsonuncompresseddata = pako.ungzip(atob(result.data), { to: 'string' });
          var rules = JSON.parse(jsonuncompresseddata).result;
          callback(rules);
        });
      },
      error: function (request, status, error) {
        $.alert('Fehler', 'Serverrequest (dispositionrules search-rules) fehlgeschlagen\n' + error + '; ' + request + '; ' + status);
      }
    });
  },
  deleteDispoRule: function deleteDispoRule(ruleId, callback) {
    $.ajax({
      url: "ajax/dispositionrules.do?action=delete-rule&ajax=1",
      method: "POST",
      async: false,
      data: {ruleid: ruleId},
      success: function (result) {
        var opts = { 
          cbOk : callback(ruleId),
          errortitle: 'Fehler beim L\u00f6schen'
        };
        handleAjaxResult(result, opts);
      },
      error: function (request, status, error) {
        $.alert('Fehler', 'Serverrequest (dispositionrules delete-rule) fehlgeschlagen\n' + error + '; ' + request + '; ' + status);
      }
    });
  }  ,
  getDispoRule: function getDispoRule(ruleId, callback) {
    $.ajax({
      url: "ajax/dispositionrules.do?action=load-rule&ajax=1",
      method: "POST",
      async: false,
      data: {ruleid: ruleId},
      success: function (result) {
        handleAjaxResult(result, function(result){
          var rule = result.result;
          callback(rule);
        });
      },
      error: function (request, status, error) {
        $.alert('Fehler', 'Serverrequest (dispositionrules load-rule) fehlgeschlagen\n' + error + '; ' + request + '; ' + status);
      }
    });
  },
  saveDispoRule: function saveDispoRule(currRule, callback) {
    $.ajax({
      url: "ajax/dispositionrules.do?action=save-or-update-rule&ajax=1",
      method: "POST",
      async: false,
      data: {rule: JSON.stringify(currRule)},
      success: function (result) {
        var opts = { 
          cbOk : callback,
          errortitle: 'Fehler beim Speichern'
        };
        handleAjaxResult(result, opts);
      },
      error: function (request, status, error) {
        $.alert('Fehler', 'Serverrequest (dispositionrules save-or-update-rule) fehlgeschlagen\n' + error + '; ' + request + '; ' + status);
      }
    });
  },
  autoSave: function autoSave(getData) {
    console.log(Date() + ": > autoSave()");
    var data = getData();
    $.ajax({
      url: "ajax/workspace.do?action=auto-save-ws-data&ajax=1",
      data: {data: JSON.stringify(data)},
      method: "POST",
      success: function (result) {
        handleAjaxResult(result, {cbErr: function () {
          }, errortitle: 'Fehler beim Auto-Speichern'});
      },
      error: function (request, status, error) {
        console.log('autoSave Error', error, request, status);
      }
    });
    console.log(Date() + ": < autoSave()");
  }
};

var timeUtils = {
  getFullDate: function (date, isProcessDate){
    // isProcessDate === false -> '1.3.58' -> '01.03.1958' | '1.3.1958' -> '01.03.1958'
    // isProcessDate === true  -> '1.3.58' ->' 01.03.2058' | '1.3.2058' -> '01.03.2058'
    var f = function (date){
      var arr = date.split('.');
      var d = ('0' + arr[0]).slice(-2);
      var m = ('0' + arr[1]).slice(-2);
      var y = arr[2] - 0;
      y += y < 100 ? (isProcessDate ? 2000 : 1900) : 0;
      return  d + '.' + m + '.' + y;
    };
    if (date.match(/^(0?[1-9]|[12][0-9]|3[01])[\.](0?[1-9]|1[012])[\.]\d{4}$/)) {
      return date;
    }
    if (date.match(/^(0?[1-9]|[12][0-9]|3[01])[\.](0?[1-9]|1[012])[\.]\d{1,2}$/)) {
      return f(date);
    }
    return '';
  },
  convertZeitenString2Minutes: function (v) {
    var arr = v.split(':').reverse();  // 'H:M' -> ['<M>', '<H>']    ~   '2:15' -> ['15', '2'] 
    return Number(arr[0]) + Number(arr[1] || '0') * 60;
  },
  convertMinutes2ZeitenString: function (v) {
    if (_.isNaN(v)) 
      v = 0;
    var m = v % 60;
    return Math.floor(v / 60) + ':' + (m < 10 ? '0' : '') + m;
  },
  checkFormat4Zeiten: function (o) {
    return function () {
      var v = $(o).val();
      
      if (v.indexOf(':') > -1) {
        var arr = v.split(':').reverse();  // 'H:M' -> ['<M>', '<H>']    ~   '2:15' -> ['15', '2'] 
        if (arr[0].length > 2) {
          $(o).val('');
          return;
        }
        v = Number(arr[1]) * 60 + Number(arr[0])
      }

      // Normalize
      $(o).val(timeUtils.convertMinutes2ZeitenString(v));
    };
  },
  formatDate: function (o) {
    $(o).val(timeUtils.getFullDate($(o).val(), true));
  }
};

var autoSaveTimer = null;
function startAutoSaveTimer(getData) {
  window.clearInterval(autoSaveTimer);
  if (top.AutoSaveIntervall === undefined || _.isNaN(top.AutoSaveIntervall) || top.AutoSaveIntervall <= 0)
    return;
  var interval = (top.AutoSaveIntervall < 10 ? 10 : top.AutoSaveIntervall) * 60000;
  autoSaveTimer = window.setInterval(ajaxFunctions.autoSave, interval, getData);
}


