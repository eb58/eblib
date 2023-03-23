/* global eblogger */

typeof eblogger === "undefined" && (eblogger = function () {
});

test('testset: eblogger CONSTANTS', function () {
    ok(eblogger.LEVEL.FATAL === 0);
    ok(eblogger.LEVEL.ERROR === 1);
    ok(eblogger.LEVEL.WARN === 2);
    ok(eblogger.LEVEL.INFO === 3);
    ok(eblogger.LEVEL.DEBUG === 4);
    ok(eblogger.LEVEL.TRACE === 5);
});

test('testset: eblogger test levels', function () {
    // default level is info
    var log = eblogger();
    ok(log.fatal('TEST'));
    ok(log.error('TEST'));
    ok(log.warn('TEST'));
    ok(log.info('TEST'));
    ok(log.debug('TEST').length === 0);
    ok(log.trace('TEST').length === 0);

    var log = eblogger({level: eblogger.LEVEL.ERROR});
    ok(log.fatal('TEST'));
    ok(log.error('TEST'));
    ok(log.info('TEST').length === 0);
    ok(log.warn('TEST').length === 0);
    ok(log.debug('TEST').length === 0);
    ok(log.trace('TEST').length === 0);
});

test('testset: eblogger test message pattern', function () {
    // default pattern pattern: '[<%=t%>] <%=d%><%=f%> : <%=m%>',

    equal(eblogger({pattern: ''}).info('TEST'), '');

    ok(eblogger({pattern: '<%=d%>'}).info('').indexOf(new Date().getFullYear() + '-') >= 0);

    equal(eblogger({pattern: '<%=t%>'}).info(''), 'INFO ');
    equal(eblogger({pattern: '<%=f%>'}).info(''), '');
    equal(eblogger({pattern: '<%=m%>'}).info('theMessage'), 'theMessage');

    equal(eblogger({pattern: '<%=f%>', func: 'functionName'}).info(''), 'functionName');
    equal(eblogger({pattern: '<%=t%>: <%=m%>'}).info('theMessage'), 'INFO : theMessage');
    equal(eblogger({
        pattern: '<%=t%> <%=f%>: <%=m%>',
        func: 'functionName'
    }).info('theMessage'), 'INFO  functionName: theMessage');
});


test('testset: eblogger test date pattern', function () {
    // default pattern:     '[<%=t%>] <%=d%><%=f%> : <%=m%>',
    // default datepattern: '<%=y%>-<%=m%>-<%=d%> <%=hour%>:<%=min%>:<%=sec%>',
    var dt = new Date();
    var y = new Date().getFullYear();
    var m = ('0' + (dt.getMonth() + 1)).slice(-2);
    var d = ('0' + (dt.getDay() + 1)).slice(-2);

    equal(eblogger({datepattern: ''}).info('TEST'), '[INFO ]  : TEST', 'Datepattern empty');
    equal(eblogger({datepattern: '<%=y%>'}).info('TEST'), '[INFO ] ' + y + ' : TEST',);
    equal(eblogger({datepattern: '<%=m%>'}).info('TEST'), '[INFO ] ' + m + ' : TEST');
    equal(eblogger({datepattern: '<%=d%>'}).info('TEST'), '[INFO ] ' + d + ' : TEST');
    equal(eblogger({datepattern: '<%=d%>.<%=m%>.<%=y%>'}).info('TEST'), '[INFO ] ' + d + '.' + m + '.' + y + ' : TEST');
});

test('testset: eblogger test late evaluation', function () {
    var x;

    x = false, eblogger().info(() => {
        x = true;
    });
    ok(x === true, 'lamba called');
    x = false, eblogger().debug(() => {
        x = true;
    });
    ok(x === false, 'lamba not called');

});
