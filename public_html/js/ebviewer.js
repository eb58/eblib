/* global _, $ */

var ebviewer = (function () {

  function getPositionFromUserPrefs() {
    $.ajax({
      url: "/ISmed/ajaxUserPreference.do",
      async: false,
      data: {action: "read", name: "docWindowPos"},
      success: function (result) {
        return result.error ? {} : {x: result.x, y: result.y};
      },
      error: function () {
        console.log("user preference ajax error");
      }
    });
  }

  function view(docurl, ext, opts) {
    opts = opts || {};
    var defopts = {
      width: 800, /* width of document window */
      height: 900, /* height of document window */
      resizable: true, /* should the document window be resizable? */
      dependent: true, /* does the document window depend on its opener? */
      name: opts.crypteddocid ? "doc_" + opts.crypteddocid : docurl, /* internal document window name */
      x: -1, /* x-coordinate for fixed window position (-1 = not fixed) */
      y: -1, /* y-coordinate for fixed window position (-1 = not fixed) */
      fixPosition: false /* true = fixed position is retrieved from user preferences */
    };
    var myopts = $.extend({}, defopts, opts);
    myopts = $.extend(myopts, myopts.fixPosition && getPositionFromUserPrefs ? getPositionFromUserPrefs() : {});

    var params =
            _.template("width=<%=w%>px,height=<%=h%>px,dependent=<%=d%>,resizable=<%=r%>,status=0,location=0,menubar=0,toolbar=0")
            ({w: myopts.width, h: myopts.height, d: myopts.dependent ? "yes" : "no", r: myopts.resizable ? "1" : "0"});
    if (myopts.x !== -1 && myopts.y !== -1)
      params += ",left=" + myopts.x + "px,top=" + myopts.y + "px";

    return window.open("ebviewer.html?" + docurl + '|' + ext, '', params);
  }
  return {
    view: view
  };
})();