/* global _, ebutils, doctypes, doctabs */
(function ($) {
  "use strict";
  $.fn.auftragsakte = function (akte, opts) {
    const id = this[0].id;
    const self = this;
    const valueLists = opts.valueLists || {};

    const defopts = {
      panel: 'tab-grid',
      keywords: valueLists.keywords || [],
      doctypes: valueLists.doctypes || [],
      doctabs: valueLists.doctabs || [],
      readonly: false,
    };
    const myopts = $.extend({}, defopts, opts);
    const actions = {
      dlgShowDocumentInfo: function (doc) {
        doc = _.isObject(doc) ? doc : akte.find(o => o['crypted-doc-id'] === doc).document
        const  docInfoOpts = {
          readonly: myopts.readonly,
          keywords: myopts.keywords,
          doctypes: myopts.doctypes,
          doctabs: myopts.doctabs
        };
        dlgDocAttrInfoEdit(doc, docInfoOpts, ajaxFunctions && ajaxFunctions.saveDocumentAttributes);
      },
      dlgCreateStandardschreiben: function (doc) {
        doc = _.isObject(doc) ? doc : akte.find(o => o['crypted-doc-id'] === doc);
        console.log('dlgCreateStandardschreiben', doc)
      },
    };
    const renderDeliveryStatusId = function (deliveryStatusId) {
      if (deliveryStatusId === 0 || deliveryStatusId === 1) {
        const map1 = {0: 'angefordert', 1: 'angesto\u00dfen'};
        const map2 = {0: 'yellow', 1: 'lightgreen'};
        return  _.template('<i class="fa fa-print fa-1x" title="<%=title%>" style="background-color:<%=backgroundColor%>"></i>')({
          title: 'Serverdruck ' + map1[deliveryStatusId],
          backgroundColor: map2[deliveryStatusId],
        })
      }
      return ''
    }

    const prepareAkteForTree = function (akte) {

      const mapObjectToArray = function (obj, f) {
        return Object.keys(obj).map(key => f ? f(key, obj[key]) : obj[key]);
      };
      const availableActions = {
        'checkbox': {
          renderer: function (item) {
            return  _.template('<input type="checkbox" id="<%=id%>"></i>')({
              id: 'checkbox-' + item.id,
            })
          },
        },
        'document-link': {
          renderer: function (item) {
            const doc = item.data;
            const documentLabel = _.template('<%=doctype%> - <%= docdate%> - <%= author%> - <%= docname%>')({
              doctype: doc['doc-type-text'],
              docdate: doc['doc-date'],
              author: doc['author-name'] || '',
              docname: doc.name,
            });
            return _.template('<a href="actions.showContent(\'<%=id%>\')"><%=name%></a>')({
              id: doc['crypted-doc-id'],
              name: documentLabel,
            })
          },
        },
        'show-info': {
          renderer: function (item) {
            return  _.template('<i class="fa fa-info-circle fa-1x" id="<%=id%>" title="Informationen zu Dokument"></i>')({id: item.id})
          }
        },
        'standard-schreiben': {
          renderer: function (item) {
            return  _.template('<i class="fa fa-book fa-1x" id="<%=id%>" title="Standardschreiben erstellen"></i>')({id: item.id})
          }
        },
        'serverdruck-info': {
          renderer: function (item) {
            return renderDeliveryStatusId(item.data['delivery-status-id']);
          },
        },
      };
      const computeActionsForDocument = function (doc) {
        const res = [];
        if ((myopts.mode === $.fn.auftragsakte.MODE.VERSICHTERTEN_AKTE) || (doc.removable && !myopts.readonly))
          res.push(availableActions['checkbox'])

        res.push(availableActions['show-info'])

        if (doc['doclink']) // ??? TODO ??? 
          res.push(availableActions['standard-schreiben'])

        if (doc['delivery-status-id'] !==null )
          res.push(availableActions['serverdruck-info'])

        res.push(availableActions['document-link'])

        return res;
      }

      const subtree1 = mapObjectToArray(akte
              .filter(function (o) {
                return o['source-workorder-id'] === 0
              })
              .groupBy(function (e) {
                return e['tab-name']
              }), function (key, o) {
        return {
          label: key,
          actions: myopts.readonly ? '' : [availableActions['checkbox']],
          subitems: o.map(d => ({
              label: ' ',
              actions: computeActionsForDocument(d),
              data: d,
            }))
        }
      });
      const subtree2 = mapObjectToArray(_.mapObject(akte
              .filter(function (o) {
                return o['source-workorder-id'] !== 0
              })
              .groupBy(function (o) {
                return o['source-workorder-id']
              }), function (o) {
        return o.groupBy(e => e['tab-name'])
      }), function (key, o) {
        return {
          label: key,
          actions: myopts.readonly ? '' : [availableActions['checkbox']],
          subitems: mapObjectToArray(o, function (key, o) {
            return{
              label: key,
              actions: myopts.readonly ? '' : [availableActions['checkbox']],
              subitems: o.map(function (e) {
                return {
                  label: ' ',
                  actions: computeActionsForDocument(d),
                  data: d,
                }
              })
            }
          })
        }
      });
      const tree = [];
      if (subtree1.length) {
        tree.push({
          label: 'Dokumente zum Auftrag',
          isopen: true,
          actions: myopts.readonly ? '' : [availableActions['checkbox']],
          subitems: subtree1
        })
      }
      if (subtree2.length) {
        tree.push({
          label: 'Dokumente aus fr\u00fcheren Auftr\u00e4gen',
          actions: myopts.readonly ? '' : [availableActions['checkbox']],
          subitems: subtree2
        })
      }
      return tree;
    }

    const initTree = function (akte) {

      const initActions = function () {
        $('#tree .fa-info-circle').on('click', function (evt) {
          const item = tree.itemById(evt.target.id);
          actions.dlgShowDocumentInfo(item.data['crypted-doc-id']);
        })
        $('#tree .fa-book').on('click', function (evt) {
          const item = tree.itemById(evt.target.id);
          actions.dlgCreateStandardschreiben(item.data['crypted-doc-id']);
        })
      }
      const treeopts = {
        initActions: initActions
      };
      const tree = $('#tree').ebtree(prepareAkteForTree(akte), treeopts)

      return tree;
    }

    const initGrid = function (akte) {

      const  afterRedraw = function () {
        $('#grid .fa-info-circle').on('click', function (evt) {
          actions.dlgShowDocumentInfo(evt.target.id);
        })
        $('#grid .fa-book').on('click', function (evt) {
          actions.dlgCreateStandardschreiben(evt.target.id);
        })
      }

      const renderer = {
        quelle: function (data) {
          return data || ''
        },
        name: function (data, row, r) {
          const doc = row[0];
          const link = _.template('<a href="showContent(\'<%=id%>\')"><%=name%></a>')({
            id: doc['crypted-doc-id'],
            name: doc.name
          })

          // aus altem Code:  	<c:when test="${Row['RepId'] > '0' && deliveryStatus != '0' && deliveryStatus != '1'}">  TODO!!!! wofür steht RepId
          const renderStandardschreibenErstellen = doc['delivery-status-id'] !== 0 && doc['delivery-status-id'] !== 1

          const a = _.template('<i class="fa fa-info-circle fa-1x" id="<%=id%>" title="Informationen zu Dokument" ></i>')({id: doc['crypted-doc-id']});
          const b = !renderStandardschreibenErstellen ? '' : _.template('<i class="fa fa-book fa-1x" id="<%=id%>" title="Standardschreiben erstellen"></i>')({id: doc['crypted-doc-id']});
          const c = renderDeliveryStatusId(doc['delivery-status-id']);
          return link + a + b + c;
        }
      };
      const opts = {
        sortcolname: 'Quelle',
        columns: [
          {name: "", invisible: true, technical: true},
          {name: "Name", render: renderer.name},
          {name: "Gr\u00f6\u00dfe", render: ebutils.formatBytes, width: '40px'},
          {name: "Datum", sortformat: 'date-de', width: '60px'},
          {name: "Dokumentenart"},
          {name: "Autor"},
          {name: "Lasche"},
          {name: "Quelle", render: renderer.quelle},
        ],
        rowsPerPageSelectValues: [10, 15, 25, 50],
        rowsPerPage: 10,
        selectionCol: !myopts.readonly,
        flags: {colsResizable: true},
        afterRedraw: afterRedraw,
      };
      const data = akte.map(function (d) {
        const rowData = [d, d.name, d.size, d['doc-date'], d['doc-type-text'], d['author-name'], d['tab-name'], d['source-workorder-id']]
        rowData.disabled = !d.removable && myopts.mode === $.fn.auftragsakte.MODE.AUFTRAG_AKTE;
        return rowData
      });
      const grid = $('#grid').ebtable(opts, data)

      return grid;
    }

    const init = function () {
      const grid = initGrid(akte);
      const tree = initTree(akte);
      let activePanel = myopts.panel;

      const getSelectedDocuments = function (panel) {
        return panel === 'tab-tree' ? tree.getSelectedItems() : grid.getSelectedRows().map(function (sel) {
          return sel[0].document
        });
      }

      const setSelectedDocuments = function (panel, selection) {
        const checkedCrypteddocids = _.pluck(selection, 'crypted-doc-id')
        if (panel === 'tab-tree') {
          tree.traverse(function (item) {
            if (item.data) {
              const checked = checkedCrypteddocids.includes(item.data['crypted-doc-id'])
              $('#' + item.id + ' input[type=checkbox]').prop('checked', checked)
            }
          })
        } else {
          grid.setSelectedRows(function (r) {
            return checkedCrypteddocids.includes(r[0]['crypted-doc-id']);
          });
        }
      }

      const ta = $("#tabs").tabs({
        beforeActivate: function (evt, ui) {
          const oldPanel = $(ui.oldPanel).prop('id');
          const newPanel = $(ui.newPanel).prop('id');
          const selection = getSelectedDocuments(oldPanel);
          myopts.panel = activePanel = newPanel;
          console.log(newPanel);
          setSelectedDocuments(newPanel, selection);
          return true
        },
      });
      $('#btnDelete').button().on('click', function () {
        const selection = getSelectedDocuments(activePanel)
        console.log('Delete', selection, akte);
        if (selection.length) {
          $.confirm('Frage', 'Dokumente wirklich aus Akte entfernen?', function () {
            $.ajax({
              url: 'ajax/workspace.do?action=delete-documents-from-orderfile&ajax=1',
              method: 'POST',
              data: {
                cryptedDocIds: JSON.stringify(selection.map(function (doc) {
                  return doc['crypted-doc-id']
                }))
              },
              success: function (result) {
                handleAjaxResult(result, function (data) {
                  selection.forEach(function (doc) {
                    akte = akte.filter(function (adoc) {
                      return adoc['crypted-doc-id'] !== doc['crypted-doc-id']
                    })
                  })
                  initTemplate(self);
                });
              },
            })
          })
        }
      });
      $('#btnDeleteServerPrint').button().on('click', function () {
        const selection = getSelectedDocuments(activePanel);
        console.log('filtered', selection);
        const filteredSelection = selection.filter(function(doc){
          return doc['delivery-status-id'] === 1;
        })
        console.log('filtered', filteredSelection);
        if (filteredSelection.length) {
          $.confirm('Frage', 'Wirklich aus Serverdruck entfernen?', function () {
            $.ajax({
              url: 'searchServerPrint.do?action=remove-from-serverprint-list&ajax=1',
              method: 'POST',
              data: {
                idList: JSON.stringify(filteredSelection.map(function (doc) {
                  return doc['crypted-doc-id'];
                }))
              },
              success: function (result) {
                handleAjaxResult(result, function () {
                  selection.forEach(function (doc) {
                    const adoc = akte.find(function (x) {
                      return x['crypted-doc-id'] === doc['crypted-doc-id']
                    });
                    adoc['delivery-status-id'] = null;
                  })
                  initTemplate(self);
                });
              },
            })
          });
        }
      })
      $('#btnTakeover').button().on('click', function () {
        const selection = getSelectedDocuments(activePanel)
        console.log('Übernehmen', selection, akte);
        if (selection.length) {
          $.confirm('Frage', 'Dokumente wirklich aus Akte entfernen?', function () {
            $.ajax({ //  
              url: 'ajax/workspace.do?action=assign-insurant-files-to-order&ajax=1',
              method: 'POST',
              data: {
                insurantFiles: JSON.stringify(selection.map(function (doc) {
                  return doc['crypted-doc-id']
                }))
              },
              success: function (result) {
                handleAjaxResult(result, function (data) {
                  selection.forEach(function (doc) {
                    akte = akte.filter(function (adoc) {
                      return adoc['crypted-doc-id'] !== doc['crypted-doc-id']
                    })
                  })
                  initTemplate(self);
                });
              },
            })
          })
        }
      });
      // styling
      $('#tab-tree, #tab-grid', self).css({
        padding: '3px'
      })
      return ta;
    }

    this.id = id;
    const initTemplate = function (a) {
      const t = '\
      <div id="tabs">\
        <ul>\
          <li><a href="#tab-grid">Listenansicht</a></li>\
          <li><a href="#tab-tree">Baumansicht</a></li>\
        </ul>\
        <div id="tab-grid">\
          <div id="grid"></div>\
        </div>\
        <div id="tab-tree">\
          <div id="tree"></div>\
        </div>\
      </div>\
      <%=buttons%>\
    </div>';
      let btnStr = '';
      if (!myopts.readonly) {
        btnStr = (myopts.mode === $.fn.auftragsakte.MODE.AUFTRAG_AKTE)
                ? '<button id="btnDelete">Aus Akte entfernen</button><button id="btnDeleteServerPrint">Aus Serverdruck entfernen</button>'
                : '<button id="btnTakeover">In Auftragsakte übernehmen</button>'
      }
      const s = _.template(t)({buttons: btnStr})
      a.html(s);
      const ta = init();
      $('a[href=#' + myopts.panel + ']').click()
    };
    initTemplate(this);
  }
  $.fn.auftragsakte.MODE = {
    AUFTRAG_AKTE: 1,
    VERSICHTERTEN_AKTE: 2,
  }
})(jQuery);
