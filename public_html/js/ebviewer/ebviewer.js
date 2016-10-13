/* global _, $ */
var ebviewer = (function () {

  function getPositionFromUserPrefs() {
    var res = {};
    $.ajax({
      async: false,
      url: "ajaxUserPreference.do",
      data: {action: "read", name: "docWindowPos"},
      success: function (result) {
        res = result.x && result.y ? {x: result.x, y: result.y} : {};
      }
    });
    return res;
  }

  function view(docurl, ext, opts) {
    opts = opts || {};
    var defopts = {
      width: 700,
      height: 1100,
      resizable: true,
      dependent: true, /* does the document window depend on its opener? */
      name: opts.crypteddocid ? "doc_" + opts.crypteddocid : docurl, /* internal document window name */
      x: -1, /* for fixed window position (-1 = not fixed) */
      y: -1, /*fixed window position (-1 = not fixed) */
      fixPosition: false /* true = fixed position is retrieved from user preferences */
    };
    var pos = opts.fixPosition && getPositionFromUserPrefs ? getPositionFromUserPrefs() : {x: -1, y: -1};
    var myopts = $.extend({}, defopts, opts, pos);
    var params = _.template(
      "width=<%=w%>px,\n\
      height=<%=h%>px,\n\
      dependent=<%=d%>,\n\
      resizable=<%=r%>,\n\
      left=<%=l%>,\n\
      top=<%=t%>,\n\
      title=no,\n\
      status=no,\n\
      location=no,\n\
      menubar=no,\n\
      toolbar=no,\n\
      scrollbars=no,\n\
      directories=no"
      )({
      w: myopts.width,
      h: myopts.height,
      d: myopts.dependent ? "yes" : "no",
      r: myopts.resizable ? "yes" : "no",
      l: myopts.x,
      t: myopts.y
    });
    return window.open("/js/ebviewer/ebviewer.html?" + docurl + '|' + ext + '|' + myopts.width + '|' + myopts.height, '', params);
  }

  return {
    view: view
  };
})();