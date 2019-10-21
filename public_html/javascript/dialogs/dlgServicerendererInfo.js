/* global _, ebutils, serviceRenderersFromSearch */
const dlgServicerendererInfo = function (opts) {

    const defopts = {
        open: dlgOpen,
        close: function () {
            $(this).dialog('destroy')
        },
        title: 'Leitungserbringer',
        width: 600,
        closeText: 'Schlie\u00dfen',
        modal: true,
        buttons: {
            'Ok': function () {
                $(this).dialog("destroy")
            }
        },
    }

    const myopts = $.extend({}, defopts, opts)

    const utils = {
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
        <div id='dlgServicerendererInfo'>\n\
          <span style='float:right'><a href=javascript:call_help('<%=context%>')><i class='fa fa-question-circle-o fa-lg'></i> Hilfe</a></span>\n\
          <h2>Info Leistungserbringer</h2>\m\
        </div>")({
        context: myopts.dlgContext,
    }
    )

    var dlg = $(template)
    dlg.dialog(myopts)
//  .keyup(function (e){ e.keyCode === 13 && utils.overtake() })
    function styling() {
        $('#dlgServicerendererInfo').css('margin-color', '#eeeee0')
        $('#dlgServicerendererInfo #searchcriteria').css('margin', '15px 2px 20px 2px')

        $('#dlgServicerendererInfo').css('background-color', '#eeeee0');
        $('#xxxgrid th, xxxgrid td').css('border-color', '#fff').css('border-style', 'solid').css('border-width', '1px')
        $('#xxxgrid #data table td').css('padding', '3px 4px 3px 4px')
        $('#dlgServicerendererInfo').parent().find('*').css('font-size', '12px')
    }
}