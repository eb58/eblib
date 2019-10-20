/* global _, jQuery */ /* jshint multistr: true *//* jshint expr: true */
(function ($) {
    "use strict";
    $.fn.servicerenderers = function (dataServicerenderers, opts) {
        const id = this[0].id;
        const self = this;
        this.id = id;
        var ddServicerendererType;
        const defopts = {

        };
        const  myopts = $.extend({}, defopts, opts);

        const servicerendererTypes = ['Leistungserbringer', 'Krankenhaus', 'Sanit\u00e4tshaus', 'Pflegeeinrichtung']

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
            countServiceRenderers: function (x) {
                return x.reduce(function (acc, o) {
                    return (acc[o.servicerenderertype.toLowerCase()]++, acc)
                }, {
                    leistungserbringer: 0,
                    krankenhaus: 0,
                    'sanit\u00e4tshaus': 0,
                    pflegeeinrichtung: 0
                })
            },
            computeAvailableServicerendererTypes: function (servicerenderer) {
                const maxServiceRenderersForType = Object.freeze({
                    leistungserbringer: 6,
                    krankenhaus: 1,
                    'sanit\u00e4tshaus': 1,
                    pflegeeinrichtung: 1
                })

                const servicerenderersCounter = servicerendererUtils.countServiceRenderers(servicerenderer)

                return servicerendererTypes.filter(function (o) {
                    const v = o.toLowerCase()
                    return servicerenderersCounter[v] < maxServiceRenderersForType[v];
                });
            },
            showServiceRenderer: function (servicerenderer) {
                alert('ServiceRenderer' + JSON.stringify(servicerenderer));
            },
            selectServicerendererAsPreferred: function (event) {
                console.log(event.target.value);
                const selectedServicerendererId = Number(event.target.value);
                this.servicerenderers.forEach(function (servicerenderer) {
                    servicerenderer.selected = servicerenderer.servicerendererid === selectedServicerendererId
                })
            },
            addServicerenderer: function () {
                const dlgopts = {
                    // selectedType: ddServicerendererType.getSelectedValue(),
                    servicerendererTypes: servicerendererUtils.computeAvailableServicerendererTypes(dataServicerenderers),
                }
                dlgServicerendererSearch(dlgopts, function (selectedServicerenderer) {
                    dataServicerenderers.push(selectedServicerenderer)
                    init();
                    return  true; // for closing dialog
                })
            },
            deleteServicerenderer: function (servicerenderer) {
                console.log(servicerenderer)
                this.servicerenderers = this.servicerenderers.filter(function (o) {
                    return o.name !== servicerenderer.name
                });
                const servicerenderersCounter = countServiceRenderers(this.servicerenderers)
                this.servicerendererTypes = computeAvailableServicerendererTypes(this.allServicerendererTypes, servicerenderersCounter);
                this.selectedServicerendererType = undefined;
                setTimeout(function () {
                    this.selectedServicerendererType = this.servicerendererTypes.length > 0 ? this.servicerendererTypes[0].value : undefined;
                }, 0)
            },
        }

        const servicerenderers = servicerendererUtils.loadServicerenderers()
        const availableServicerendererTypes = servicerendererUtils.computeAvailableServicerendererTypes(servicerenderers);
        const selectedServicerendererType = availableServicerendererTypes[0];

        const afterRedraw = function () {
            $('#' + id + ' i.fa-trash').each(function (idx, elem) {
                $(elem).off().on('click', function (evt) {
                    var n = Number(evt.target.id.replace(/.*-/, ''));
                    dataServicerenderers.splice(n, 1);
                    initTable();
                });
            });
            $('#' + id + ' i.fa-info').each(function (idx, elem) {
                $(elem).off().on('click', function (evt) {
                    var n = Number(evt.target.id.replace(/.*-/, ''));
                    console.log('INFO', n, dataServicerenderers[n] )
                   dlgServicerendererInfo( dataServicerenderers[n] )
                });
            });
        }

        const initTable = function () {
            var renderer = {
                actions: function (data, row, r) {
                    const template = _.template(
                            '&nbsp;<i id="info-<%=id%>-<%=r%>"   class="fa fa-info    fa-2x" title="Leistungserbringer anzeigen"></i>\n\
                             &nbsp;<i id="remove-<%=id%>-<%=r%>" class="fa fa-trash fa-2x" title="Leistungserbringer entfernen"></i>');
                    return template({r: r, id: id})
                }
            };
            const tblData = dataServicerenderers.map(function (o) {
                const x = [o.servicerendererid, o.servicerenderertype, o.shortname, ''];
                x.selected = o.selected;
                return x;
            })
            const tblOpts = {
                width: '800px',
                flags: {filter: false, pagelenctrl: false, config: false, withsorting: false, clearFilterButton: false, colsResizable: false, jqueryuiTooltips: false, ctrls: false},
                columns: [
                    {name: "id", invisible: true},
                    {name: "Art", },
                    {name: "Name"},
                    {name: "", invisible: myopts.readonly, render: myopts.readonly ? null : renderer.actions}
                ],
                selectionCol: {
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
            // const availableServicerendererTypes = servicerendererUtils.computeAvailableServicerendererTypes(servicerenderers)
            // ddServicerendererType = $('#select-' + id).ebdropdown({disabled: myopts.readonly}, availableServicerendererTypes)
            $('#add-' + id).off().on('click', function () {
                console.log('ADD!!!')
                servicerendererUtils.addServicerenderer()
                init()
            })
            initTable();
        }

        const template = _.template('\
                <div class="serviverenderers">\n\
                    <!--div>\n\
                        <div id="select-<%=id%>" style="display:inline"></div>\n\
                        <div style="display:inline; vertical-align:middle" >\n\
                            <i id="add-<%=id%>" class="fa fa-plus-circle fa-2x"  title="Leistungserbringer hinzufügen"></i>\n\
                        </div>\n\
                    <div-->\n\
                    <div style="display:inline-block;">\n\
                        <div id="table-<%=id%>" style="display:inline-block; min-width:1000px"></div>\n\
                        <div style="display:inline-block; vertical-align:top" >\n\
                            <i id="add-<%=id%>" class="fa fa-plus-circle fa-2x"  title="Leistungserbringer hinzufügen"></i>\n\
                        </div>\n\
                    <div>\n\
                </div>\n');
        const s = template({id: id, options: myopts, width: myopts.width, height: myopts.height});
        this.html(s);
        init();
    }
})(jQuery);