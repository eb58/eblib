/* global _, $ */
var ebviewer = (function () {

  function getPositionFromUserPrefs() {
    var res = {};
    $.ajax({
      async: false,
      url: "ajaxUserPreference.do?ajax=1",
      data: {action: "read", name: "docWindowPos"},
      success: function (result) {
        handleAjaxResult(result, function () {
          res = {x: result.x, y: result.y};
        });
      }
    });
    return res;
  }

  function view(docurl, name, ext, info, opts) {
    opts = opts || {};
    var defopts = {
      width: 800,
      height: 1000,
      resizable: true,
      dependent: true, /* does the document window depend on its opener? */
      name: opts.crypteddocid ? "doc_" + opts.crypteddocid : docurl, /* internal document window name */
      x: -1, /* for fixed window position (-1 = not fixed) */
      y: -1, /* fixed window position (-1 = not fixed) */
      fixPosition: true /* true = fixed position is retrieved from user preferences */
    };
    var myopts = $.extend({}, defopts, opts );
    var myopts = $.extend({}, myopts, myopts.fixPosition && getPositionFromUserPrefs ? getPositionFromUserPrefs() : {x: -1, y: -1});
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
    return window.open("ebviewer.jsp?" + docurl + '|' + name + '|' +  ext + '|' + info +'|'  , '', params);
  }

  return {
    view: view
  };
})();