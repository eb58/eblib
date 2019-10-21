/* global _, jQuery */ /* jshint multistr: true *//* jshint expr: true */
(function ($) {
    "use strict";
    $.fn.servicerenderers = function (dataServicerenderers, opts) {
        const id = this[0].id;
        const self = this;
        this.id = id;
        const defopts = {
            readonly: false,
        };
        const  myopts = $.extend({}, defopts, opts);
        const servicerendererTypes = ['Arzt/Sonstige', 'Krankenhaus', 'Sanit\u00e4tshaus', 'Pflegeeinrichtung']

        const servicerendererUtils = {
            loadServicerenderers: function () {
                let servicerenderers = dataServicerenderers;
                false && $.ajax({
                    url: '/ISmed/ajax/workspace.do?action=load-servicerenderers&ajax=1',
                    async: false,
                    success: function (result) {
                        handleAjaxResult(result, function () {
                            console.log('load-servicerenderers', result.data)
                            servicerenderers = result.data;
                        });
                    },
                    error: function (a, b, c) {
                        console.log('Fehler beim Laden der LEs', a, b, c);
                    }
                })
                return servicerenderers;
            },
            findSelectedServiceRenderer: function (servicerenderers) {
                return servicerenderers.find(function (o) {
                    return o.selected
                });
            },
            getSelectedServicerendererId: function () {
                const selectedServicerenderer = servicerendererUtils.findSelectedServiceRenderer(servicerenderers)
                return selectedServicerenderer ? selectedServicerenderer.servicerendererid : undefined;
            },
            countServiceRenderers: function (sr) {
                return sr.reduce(function (acc, o) {
                    return (acc[o.servicerenderertype.toLowerCase()]++, acc)
                }, {
                    arzt: 0,
                    sonstige: 0,
                    krankenhaus: 0,
                    'sanit\u00e4tshaus': 0,
                    pflegeeinrichtung: 0
                })
            },
            computeAvailableServicerendererTypes: function (servicerenderers) {
                const maxServiceRenderersForType = Object.freeze({
                    'arzt/sonstige': 2,
                    krankenhaus: 1,
                    'sanit\u00e4tshaus': 1,
                    pflegeeinrichtung: 1
                })

                const cnt = servicerendererUtils.countServiceRenderers(servicerenderers)
                const counter = {
                    'arzt/sonstige': cnt.arzt + cnt.sonstige,
                    krankenhaus: cnt.krankenhaus,
                    'sanit\u00e4tshaus': cnt['sanit\u00e4tshaus'],
                    pflegeeinrichtung: cnt.pflegeeinrichtung
                }

                return servicerendererTypes.filter(function (o) {
                    const v = o.toLowerCase()
                    return counter[v] < maxServiceRenderersForType[v];
                });
            },
            addServicerenderer: function () {
                const dlgopts = {
                    servicerendererTypes: servicerendererUtils.computeAvailableServicerendererTypes(dataServicerenderers),
                }
                dlgServicerendererSearch(dlgopts, function (selectedServicerenderer) {
                    if (dataServicerenderers.find(function (sr) {
                        return sr.servicerendererid === selectedServicerenderer.servicerendererid
                    })) {
                        $.alert('Warnung', 'Leistungserbringer ist schon in Liste vorhanden!')
                        return false
                    }
                    dataServicerenderers.push(selectedServicerenderer)
                    init();
                    return  true; // for closing dialog
                })
            },
        }

        const servicerenderers = servicerendererUtils.loadServicerenderers()

        const afterRedraw = function () {
            $('#' + id + ' i.fa-trash').each(function (idx, elem) {
                $(elem).off().on('click', function (evt) {
                    var n = Number(evt.target.id.replace(/.*-/, ''));
                    dataServicerenderers.splice(n, 1);
                    init();
                });
            });
            $('#' + id + ' i.fa-info').each(function (idx, elem) {
                $(elem).off().on('click', function (evt) {
                    var n = Number(evt.target.id.replace(/.*-/, ''));
                    console.log('INFO', n, dataServicerenderers[n])
                    dlgServicerendererInfo(dataServicerenderers[n])
                });
            });
        }

        const initTable = function () {
            var renderer = {
                servicerenderertype: function (data) {
                    return data === 'Arzt' || data === 'Sonstige' ? 'Arzt/Sonstige' : data;
                },
                showIfSelected: function(data,row,r){
                  return data ? '&nbsp;&nbsp;<i class="fa fa-thumbs-up fa-2x" title="Bevorzugter Leistungserbringer"></i>': '';  
                },
                actions: function (data, row, r) {
                    const template = _.template(
                            '&nbsp;<i id="info-<%=id%>-<%=r%>"   class="fa fa-info  fa-2x" title="Leistungserbringer anzeigen"></i>' +
                            (myopts.readonly ? '' : '&nbsp;<i id="remove-<%=id%>-<%=r%>" class="fa fa-trash fa-2x" title="Leistungserbringer entfernen"></i>'));
                    return template({r: r, id: id})
                }
            };
            const tblData = dataServicerenderers
                    .sort(function (a, b) {
                        const sortOrder = {
                            'arzt/sonstige': 1,
                            krankenhaus: 2,
                            'sanit\u00e4tshaus': 3,
                            pflegeeinrichtung: 4
                        };
                        return sortOrder[a.servicerenderertype] - sortOrder[b.servicerenderertype]
                    })
                    .map(function (o) {
                        const x = [o.servicerendererid, o.selected, o.servicerenderertype, o.shortname, ''];
                        x.selected = o.selected;
                        return x;
                    })
            const tblOpts = {
                width: '800px',
                flags: {filter: false, pagelenctrl: false, config: false, withsorting: false, clearFilterButton: false, colsResizable: false, jqueryuiTooltips: false, ctrls: false},
                columns: [
                    {name: "id", invisible: true},
                    {name: "  ", invisible: !myopts.readonly, render: renderer.showIfSelected},
                    {name: "Art", render: renderer.servicerenderertype},
                    {name: "Name"},
                    {name: "",  render: renderer.actions}
                ],
                selectionCol: myopts.readonly ? null : {
                    singleSelection: true,
                    selectOnRowClick: true,
                    onSelection: function (rowNr, row, origData, b) {
                        dataServicerenderers.forEach(function (o) {
                            o.selected = o.servicerendererid === row[0] && b
                        })
                    },
                },
                afterRedraw: afterRedraw,
            };
            $('#table-' + id).ebtable(tblOpts, tblData);
        }
        const init = function () {
            const availableServicerendererTypes = servicerendererUtils.computeAvailableServicerendererTypes(servicerenderers)
            const visible = availableServicerendererTypes.length > 0

            $('#select-' + id).toggle(visible)
            $('#' + id + ' .fa-plus-circle').toggle(visible)
            if (visible) {
                $('#select-' + id).ebdropdown({disabled: myopts.readonly, width: 300}, availableServicerendererTypes)
                $('#' + id + ' .fa-plus-circle')
                        .off()
                        .on('click', function () {
                            servicerendererUtils.addServicerenderer()
                            init()
                        })
            }
            initTable();
        }

        const ctrlTemplate = _.template('                    \n\
                    <div id="ctrl">\n\
                        <div id="select-<%=id%>" style="display:inline"></div>\n\
                        <div style="display:inline; vertical-align:middle" >\n\
                            <i class="fa fa-plus-circle fa-2x"  title="Leistungserbringer hinzufügen"></i>\n\
                        </div>\n\
                    <div>')({id: id});
        const template = _.template('\
                <div class="serviverenderers">\n\
                    <%=ctrl%>\n\
                    <div id="table-<%=id%>"> </div>\n\
                </div>\n');
        const s = template({id: id, ctrl: myopts.readonly ? '' : ctrlTemplate});
        this.html(s);
        init();
    }
})(jQuery);