/* global _ ,jQuery, top.objectIsChanged = editOrder save-Flag */
(function ($) {
    "use strict";
    $.fn.ebbind = function (data, key, onChange, opts) {
        var id = this[0].id;
        var type = this[0].type;
        var self = this;

        var utils = {
            changeInputField: function () {
                data[key] = (opts && opts.marshalling) ? opts.marshalling.fromInputField(self.val()) : self.val();
                if ($(this).hasClass('hasDatepicker')) {
                    if (data[key].trim() === '')
                        data[key] = null;
                    else {
                        timeUtils.formatDate(self);
                        data[key] = self.val();
                    }
                }
                top.objectIsChanged = true;
                onChange && onChange(self);
            }
        };

        key = key || id;

        if (type === 'text' || type === 'password') {
            var val = (opts && opts.marshalling) ? opts.marshalling.toInputField(data[key]) : data[key];
            this.val(val).off().on('change', utils.changeInputField);
        } else if (type === 'checkbox') {
            this.prop('checked', data[key]).off().on('click', function () {
                data[key] = self.prop('checked');
                top.objectIsChanged = true;
                onChange && onChange(self);
            });
        } else if ($('textarea', this).length) {
            var $ta = $('textarea', this);
            this.val(data[key]).on('input', function () {
                data[key] = $ta.val().trim();
                top.objectIsChanged = true;
                onChange && onChange(self);
            });
            this.setTextAreaCounter();
        } else if ($('.tarea', this).length) {
            var text = data[key];
            if (text != null && text.length > 0 && typeof this.isQuill == 'function' && this.isQuill()) {
                if (text.indexOf("<p>") != 0) {
                    text = "<p>" + text + "</p>";
                    top.objectIsChanged = true;
                }
            }
            this.val(text);
            this.setTextAreaCounter();
        } else if ($('select', this).length) {
            this.setSelectedValue(data[key]).off().on("selectmenuchange", function () {
                if (opts && opts.typeOfId && opts.typeOfId === "String")
                    data[key] = self.getSelectedValue();
                else {
                    var v = parseInt(self.getSelectedValue());
                    data[key] = !_.isNaN(v) ? v : self.getSelectedValue();
                }
                top.objectIsChanged = true;
                onChange && onChange(self);
            });
            this.setSelectedValue(data[key]).on("change", function () {
                if (opts && opts.typeOfId && opts.typeOfId === "String")
                    data[key] = self.getSelectedValue();
                else {
                    var v = parseInt(self.getSelectedValue());
                    data[key] = !_.isNaN(v) ? v : self.getSelectedValue();
                }
                top.objectIsChanged = true;
                onChange && onChange(self);
            });
        } else if ($('input:radio', this).length) {
            this.val(data[key]).off().on("change", function () {
                data[key] = self.val();
                top.objectIsChanged = true;
                onChange && onChange(self);
            });
        } else if ($('.ebselect', this).length) {
            var $sel = $('input:checkbox', this);
            data[key] && data[key].forEach(function (v) {
                top.objectIsChanged = true;
                onChange && onChange(self);
                if (_.isNumber(v)) {
                    $($sel[v]).prop('checked', true);
                } else {
                    $('#' + v.replace(/ /g, ''), self).prop('checked', true);
                }
            });
            $sel.off().on('click', function () {
                data[key] = self.getSelectedValuesAsString();
                top.objectIsChanged = true;
                onChange && onChange(self);
            });
        } else if ($('.ebcombined', this).length) {
            var $sel = $('input', this);
            data[key] && data[key].forEach(function (v) {
                top.objectIsChanged = true;
                onChange && onChange(self);
                if (_.isNumber(v)) {
                    $($sel[v]).prop('checked', true);
                } else {
                    $('#' + v.replace(/ /g, ''), self).prop('checked', true);
                }
            });
            $sel.off().on('click', function () {
                data[key] = self.getSelectedValuesAsString();
                top.objectIsChanged = true;
                onChange && onChange(self);
            });
        }
        return this;
    };
})(jQuery);