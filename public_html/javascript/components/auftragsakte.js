/* global _, ebutils, doctypes, doctabs */
(function ($) {
  "use strict";
  $.fn.auftragsakte = function (akte, opts) {
    const id = this[0].id;
    const self = this;
    const defopts = {};
    const myopts = $.extend({}, defopts, opts);
    const actions = {
      dlgShowDocumentInfo: function (doc) {
        doc = _.isObject(doc) ? doc : akte.find(o => o['crypted-doc-id'] === doc).document
        const  docInfoOpts = {
          readonly: false,
          keywords: doc.keywords || [],
          doctypes: doctypes,
          doctabs: doctabs
        };
        dlgDocAttrInfoEdit(doc, docInfoOpts);
      },
      dlgCreateStandardschreiben: function (doc) {
        doc = _.isObject(doc) ? doc : akte.find(o => o['crypted-doc-id'] === doc).document
        console.log('dlgCreateStandardschreiben', doc)
      },
    };
    const renderDeliveryStatus = function (deliveryStatus) {
      if (deliveryStatus === 1 || deliveryStatus === 2) {
        const map1 = {1: 'angefordert', 2: 'angesto\u00dfen'};
        const map2 = {1: 'yellow', 2: 'lightgreen'};
        return  _.template('<i class="fa fa-print fa-1x" title="<%=title%>" style="background-color:<%=backgroundColor%>"></i>')({
          title: 'Serverdruck ' + map1[deliveryStatus],
          backgroundColor: map2[deliveryStatus],
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
              doctype: doc.docType.doctypetext,
              docdate: doc.docdate,
              author: doc.author || '',
              docname: doc.name,
            });
            return _.template('<a href="actions.showContent(\'<%=id%>\')"><%=name%></a>')({
              id: doc.crypteddocid,
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
            return renderDeliveryStatus(item.data['delivery-status']);
          },
        },
      };
      const computeActionsForDocument = function (doc) {
        const res = [];
        if (doc.removable)
          res.push(availableActions['checkbox'])

        res.push(availableActions['show-info'])

        if (doc['doclink']) // ??? TODO ??? 
          res.push(availableActions['standard-schreiben'])

        if (doc['delivery-status'])
          res.push(availableActions['serverdruck-info'])

        res.push(availableActions['document-link'])

        return res;
      }

      const subtree1 = mapObjectToArray(akte
              .filter(function (o) {
                return o['source-workorder-id'] === 0
              })
              .groupBy(function (e) {
                return e.document.tab.name
              }), function (key, o) {
        return {
          label: key,
          actions: [availableActions['checkbox']],
          subitems: o.map(e => ({
              label: ' ',
              actions: computeActionsForDocument(e.document),
              data: e.document
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
        return o.groupBy(e => e.document.tab.name)
      }), function (key, o) {
        return {
          label: key,
          actions: [availableActions['checkbox']],
          subitems: mapObjectToArray(o, function (key, o) {
            return{
              label: key,
              actions: [availableActions['checkbox']],
              subitems: o.map(function (e) {
                return {
                  label: ' ',
                  actions: computeActionsForDocument(e.document),
                  data: e.document,
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
          actions: [availableActions['checkbox']],
          subitems: subtree1
        })
      }
      if (subtree2.length) {
        tree.push({
          label: 'Dokumente aus früheren Aufträgen',
          actions: [availableActions['checkbox']],
          subitems: subtree2
        })
      }
      return tree;
    }

    const initTree = function (akte) {

      const initActions = function () {
        $('#tree .fa-info-circle').on('click', function (evt) {
          const item = tree.itemById(evt.target.id);
          actions.dlgShowDocumentInfo(item.data.crypteddocid);
        })
        $('#tree .fa-book').on('click', function (evt) {
          const item = tree.itemById(evt.target.id);
          actions.dlgCreateStandardschreiben(item.data.crypteddocid);
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
          const doc = row[0].document;
          const link = _.template('<a href="showContent(\'<%=id%>\')"><%=name%></a>')({
            id: doc.crypteddocid,
            name: doc.name
          })

          const a = _.template('<i class="fa fa-info-circle fa-1x" id="<%=id%>" title="Informationen zu Dokument" ></i>')({id: doc.crypteddocid});
          const b = !doc['doclink'] ? '' : _.template('<i class="fa fa-book fa-1x" id="<%=id%>" title="Standardschreiben erstellen"></i>')({id: doc.crypteddocid});
          const c = renderDeliveryStatus(doc['delivery-status']);
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
        selectionCol: true,
        flags: {colsResizable: true},
        afterRedraw: afterRedraw,
      };
      const data = akte.map(function (o) {
        const d = o.document;
        const rowData = [o, d.name, d.docsize, d.docdate, d.docType.doctypetext, d.author, d.tab.name, o['source-workorder-id']]
        rowData.disabled = !d.removable;
        return rowData
      });
      const grid = $('#grid').ebtable(opts, data)

      return grid;
    }

    const init = function () {
      const grid = initGrid(akte);
      const tree = initTree(akte);
      let activePanel = 'grid';
      const getSelectedDocuments = function (panel) {
        return panel === 'tab-tree' ? tree.getSelectedItems() : grid.getSelectedRows().map(function (sel) {
          return sel[0].document
        });
      }
      const setSelectedDocuments = function (panel, selection) {
        const checkedCrypteddocids = _.pluck(selection, 'crypteddocid')
        if (panel === 'tab-tree') {
          tree.traverse(function (item) {
            if (item.data) {
              const checked = checkedCrypteddocids.includes(item.data.crypteddocid)
              $('#' + item.id + ' input[type=checkbox]').prop('checked', checked)
            }
          })
        } else {
          grid.setSelectedRows(function (r) {
            return checkedCrypteddocids.includes(r[0]['crypted-doc-id']);
          });
        }
      }

      $("#tabs").tabs({
        beforeActivate: function (evt, ui) {
          const oldPanel = $(ui.oldPanel).prop('id');
          const newPanel = $(ui.newPanel).prop('id');
          const selection = getSelectedDocuments(oldPanel);
          // selection.length || confirm('Warnung. Sie haben Dokumente selektiert. Wirklich Ansicht wechseln?');
          setSelectedDocuments(newPanel, selection);
          return true
        },
      });
      $('#btnDelete').button().on('click', function () {
        const selection = getSelectedDocuments(activePanel)
        console.log('Delete', selection);
      });
      $('#btnDeleteServerPrint').button().on('click', function () {
        const selection = getSelectedDocuments(activePanel)
        console.log(selection);
      });
    }

    this.id = id;
    (function (a) {
      const s = '\
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
      <button id="btnDelete">Aus Akte entfernen</button>\
      <button id="btnDeleteServerPrint">Aus Serverdruck entfernen</button>\
    </div>';
      a.html(s);
      init()
    })(this);
  }
})(jQuery);