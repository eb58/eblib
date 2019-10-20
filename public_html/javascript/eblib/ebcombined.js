/* global _, jQuery */ /* jshint multistr: true *//* jshint expr: true */
(function ($) {
    "use strict";
    $.fn.ebCombined = function (opts) {
        const id = this[0].id;
        const self = this;
        let ddField = null;
        this.id = id;

        const getSelection = function (evt) {
            if (evt.target.id.contains('in-')) {
                return opts.ddData.find(function (o) {
                    return '' + o.code === '' + evt.target.value;
                }) || {v: null, txt: '', code: ''}
            }
            if (evt.target.id.contains('dd-')) {
                return opts.ddData.find(function (o) {
                    return '' + o.v === '' + evt.target.value;
                })
            }
        }
        const handlers = {
            onChange: function (evt, items) {
                console.log('ebCombined onChange', evt.target.value, items);
                const selectedOption = getSelection(evt);
                if (!items) {
                    ddField.setSelectedValue(selectedOption)
                } else {
                    $('#in-' + id).val(selectedOption.code)
                }
                opts.onChange && opts.onChange(selectedOption);
            },
            onBlur: function (evt) {
                const val = evt.target.value;
                console.log('ebCombined onBlur', val);
                const selectedOption = getSelection(evt);
                ddField.setSelectedValue(selectedOption)
                $('#in-' + id).val(selectedOption.code)
                opts.onChange && opts.onChange(selectedOption);
            }
        };

        const defopts = {
            inputWidth: '50px',
            ddWidth: '300px'
        }
        const myopts = $.extend({}, defopts, opts);

       const init = function () {
            const selected = opts.ddData.find(function (o) {
                return o.v === myopts.selected
            })

            ddField = $('#dd-' + id).ebdropdown({
                change: handlers.onChange,
                width: myopts.ddWidth,
            }, opts.ddData, myopts.selected)
            $('#in-' + id)
                    .width(myopts.inputWidth)
                    .on('input', handlers.onChange)
                    .on('blur', handlers.onBlur)
                    .val(selected ? selected.code : ' ')
        }

        (function (a) {
            const template = _.template(
                    '<div class="ebcombined">\n\
                        <input id="in-<%=id%>" type="text"/>\n\
                        <div   id="dd-<%=id%>" style="display:inline"> </div>\n\
                    </div>\n');
            const s = template({id: id, options: myopts, width: myopts.width, height: myopts.height});
            a.html(s);
            init();
        })(this);
    }
}
)(jQuery);

