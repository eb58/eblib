/* global _, $ */
var ebviewer = (function () {

  function getPositionFromUserPrefs() {
    var res = {};
    $.ajax({
      async: false,
      url: "ajaxUserPreference.do",
      data: {action: "read", name: "docWindowPos"},
      success: function (result) {
        res = result.error ? {} : {x: result.x, y: result.y};
      }
    });
    return res;
  }

  function view(docurl, ext, opts) {
    opts = opts || {};
    var defopts = {
      width: 700, /* width of document window */
      height: 1000, /* height of document window */
      resizable: true, /* should the document window be resizable? */
      dependent: true, /* does the document window depend on its opener? */
      name: opts.crypteddocid ? "doc_" + opts.crypteddocid : docurl, /* internal document window name */
      x: -1, /* x-coordinate for fixed window position (-1 = not fixed) */
      y: -1, /* y-coordinate for fixed window position (-1 = not fixed) */
      fixPosition: false /* true = fixed position is retrieved from user preferences */
    };
    var pos = opts.fixPosition && getPositionFromUserPrefs ? getPositionFromUserPrefs() : {};
    var myopts = $.extend({}, defopts, opts, pos);
    var params = _.template(
      "width=<%=w%>px,height=<%=h%>px,dependent=<%=d%>,resizable=<%=r%>,title=no,status=no,location=no,menubar=no,toolbar=no,scrollbars=no,directories=no")
      ({w: myopts.width, h: myopts.height, d: myopts.dependent ? "yes" : "no", r: myopts.resizable ? "yes" : "no"});
    if (myopts.x !== -1 && myopts.y !== -1)
      params += ",left=" + myopts.x + "px,top=" + myopts.y + "px";

    return window.open("/js/ebviewer/ebviewer.html?" + docurl + '|' + ext + '|' + myopts.width + '|' + myopts.height, '', params);
  }
  return {
    view: view
  };
})();