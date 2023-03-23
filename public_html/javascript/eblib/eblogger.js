/* global _ */
const eblogger_ = function (opts) {

    var defopts = {
        onlog: console.log,
        level: eblogger_.LEVEL.INFO,
        datepattern: '<%=y%>-<%=m%>-<%=d%> <%=hour%>:<%=min%>:<%=sec%>',
        pattern: '[<%=t%>] <%=d%><%=f%> : <%=m%>',
        widthOfLevelString: 5
    };
    var myopts = _.extend(defopts, opts);

    var utils = {
        formatedTimestamp: function () {
            var dt = new Date();
            return _.template(myopts.datepattern)({
                y: dt.getFullYear(),
                m: ('0' + (dt.getMonth() + 1)).slice(-2),
                d: ('0' + (dt.getDay() + 1)).slice(-2),
                hour: ('0' + (dt.getHours() + 1)).slice(-2),
                min: ('0' + (dt.getMinutes() + 1)).slice(-2),
                sec: ('0' + (dt.getSeconds() + 1)).slice(-2),
                msec: ('0' + (dt.getMilliseconds() + 1)).slice(-2)
            });
        }
    };

    var levelStrings = Object.keys(eblogger_.LEVEL).map(function (s) { // ~ ['FATAL', 'ERROR', 'WARN ', 'INFO ', 'DEBUG', 'TRACE']
        return (s + '  ').slice(0, 5);
    });

    function log(lev) {
        return function (msg) {
            if (lev <= myopts.level) {
                var type = levelStrings[lev] || '????';
                var date = utils.formatedTimestamp();
                var func = myopts.func || '';
                var mesg = typeof msg === 'string' ? msg : msg();
                var line = _.template(myopts.pattern)({d: date, t: type, f: func, m: mesg});
                myopts.onlog(line);
                return line;
            }
            return '';
        };
    }

    return {
        fatal: log(eblogger_.LEVEL.FATAL),
        error: log(eblogger_.LEVEL.ERROR),
        warn: log(eblogger_.LEVEL.WARN),
        info: log(eblogger_.LEVEL.INFO),
        debug: log(eblogger_.LEVEL.DEBUG),
        trace: log(eblogger_.LEVEL.TRACE),
        LEVEL: {FATAL: 0, ERROR: 1, WARN: 2, INFO: 3, DEBUG: 4, TRACE: 5}
    };
};
eblogger_.LEVEL = {FATAL: 0, ERROR: 1, WARN: 2, INFO: 3, DEBUG: 4, TRACE: 5};

var eblogger = eblogger_;
