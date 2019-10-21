/* global _, ebutils, serviceRenderersFromSearch */
const dlgServicerendererSearch = function (opts, onTakeOverCallback) {

    var grid

    const defopts = {
        open: dlgOpen,
        close: function () {
            $(this).dialog('destroy')
        },
        title: 'Leitungserbringer ausw\u00e4hlen',
        width: 600,
        position: {my: "left top", at: "left+30 top+40", of: window},
        closeText: 'Schlie\u00dfen',
        show: {effect: "blind", duration: 200},
        hide: {effect: "blind", duration: 200},
        modal: true,
        servicerendererTypes: ['Leistungserbringer', 'Krankenhaus', 'Sanit\u00e4tshaus', 'Pflegeeinrichtung'],
        dlgContext: 'dlgServicerendererSearch',
        buttons: {
            '\u00dcbernehmen': function () {
                utils.overtake() && $(this).dialog("destroy")
            },
            'Abbrechen': function () {
                $(this).dialog("destroy")
            }
        },
    }

    const myopts = $.extend({}, defopts, opts)

    const utils = {
        getServicerenderers: function (searchCriteria) {
            var ret = serviceRenderersFromSearch
                    .filter(function (o) {
                        if (!searchCriteria.servicerenderertype)
                            return true
                        if (searchCriteria.servicerenderertype === 'Arzt/Sonstige')
                            return o.servicerenderertype === 'Arzt' || o.servicerenderertype === 'Sonstige'
                        return  o.servicerenderertype === searchCriteria.servicerenderertype
                    })
                    .filter(function (o) {
                        return !searchCriteria.shortname || o.shortname.toLowerCase().contains(searchCriteria.shortname.toLowerCase())
                    })

            $.ajax({
                url: '/ISmed/ajax/workspace.do?action=search-servicerenderer&ajax=1', // TODO !!!!!
                async: false,
                success: function (res) {
                    handleAjaxResult(res, function (res) {
                        ret = res.experts.filter(function (expert) {
                            return myopts.onlyThoseInOrgunitSpecialcase ? expert.inOrgunitSpecialcase : true
                        })
                    })
                },
                error: function (a, b, c) {
                    console.log('Error in getServicerenderers', a, b, c)
                }
            })
            return ret
        },
        getSelectedServicerenderer: function (grid) {
            if (!grid)
                return null;
            var selRows = grid.getSelectedRows()
            return selRows.length === 0 ? null : selRows[0][0]
        },
        overtake: function () {
            const v = utils.getSelectedServicerenderer(grid)
            if (!v) {
                $.alert('Hinweis', 'Bitte einen Eintrag ausw\u00e4hlen')
                return false
            }
            return onTakeOverCallback(v)
        },
    }

    function initGrid(data) {
        var optsGrid = {
            columns: [
                {name: "data", technical: true, invisible: true},
                {name: "Name"},
                {name: "Art", valuelist: [''].concat(myopts.servicerendererTypes)},
            ],
            flags: {
                arrangeColumnsButton: false,
                colsResizable: false,
                config: false
            },
            sortcolname: 'Name',
            selectionCol: {
                singleSelection: true,
                selectOnRowClick: true,
            },
            afterRedraw: styling,
        }
        const gridData = data.map(function (o) {
            return [o, o.shortname, o.servicerenderertype]
        })
        grid = $('#xxxgrid').ebtable(optsGrid, gridData)

    }


    function dlgOpen() {
        styling()

        $('#search-srr-btn').button().on('click', function () {
            const searchCriteria = {
                servicerenderertype: dd.getSelectedValue(),
                shortname: $('#search-srr-name').val()
            }
            const data = utils.getServicerenderers(searchCriteria)
            initGrid(data)
        })

        const ddopts = {
            width: '200px',
            change: function () {
                const searchCriteria = {
                    servicerenderertype: dd.getSelectedValue(),
                    shortname: $('#search-srr-name').val()
                }
                const data = utils.getServicerenderers(searchCriteria)
                initGrid(data)

            }
        }
        const dd = $('#search-srr-ddtype').ebdropdown(ddopts, myopts.servicerendererTypes)
    }


    const template = _.template("\
        <div id='dlgServicerendererSearch'>\n\
          <span style='float:right'><a href=javascript:call_help('<%=dlgContext%>')><i class='fa fa-question-circle-o fa-lg'></i> Hilfe</a></span>\n\
          <div id='searchcriteria'>\n\
            <label style='display:inline'>Art </label>\n\
            <div id='search-srr-ddtype' style='display:inline'></div>\n\
            <label>Name</label>\n\
            <input id='search-srr-name'/>\n\
          </div>\n\
          <button id='search-srr-btn'>Suchen</button>\n\
          <div id='xxxgrid'></div>\n\
        </div>")({
        dlgContext: myopts.dlgContext,
    })

    var dlg = $(template)
    dlg.dialog(myopts)
//  .keyup(function (e){ e.keyCode === 13 && utils.overtake() })
    function styling() {
        $('#dlgServicerendererSearch').css('margin-color', '#eeeee0')
        $('#dlgServicerendererSearch #searchcriteria').css('margin', '15px 2px 20px 2px')

        $('#dlgServicerendererSearch').css('background-color', '#eeeee0');
        $('#xxxgrid th, xxxgrid td').css('border-color', '#fff').css('border-style', 'solid').css('border-width', '1px')
        $('#xxxgrid #data table td').css('padding', '3px 4px 3px 4px')
        $('#dlgServicerendererSearch').parent().find('*').css('font-size', '12px')
    }
}