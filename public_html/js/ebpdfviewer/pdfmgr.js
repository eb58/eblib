/* global PDFJS, CONSTS, geom */
var getPdfMgr = function (pdfuri, callback, afterLoading) {
  var cache = {};
  PDFJS.disableWorker = true;
  PDFJS.disableRange = true;
  
  if( pdfuri.startsWith('data:application/pdf;base64,') ){
    pdfuri = {data: atob(pdfuri.replace('data:application/pdf;base64,',''))};
  }
  
  PDFJS.getDocument(pdfuri).then(function (doc) { // Asynchronously downloads PDF. 
    var getPageAsBase64 = function (num, callback) { // num = 0,1,2,3,...
      if (cache[num]) {
        callback(cache[num]);
      } else {
        doc.getPage(num + 1).then(function (page) {
          var viewport = page.getViewport(1.5);
          var canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          page.render({
            canvasContext: canvas.getContext('2d'),
            viewport: viewport,
          }).promise.then(function () {
            cache[num] = {data: canvas.toDataURL('image/png'), width: viewport.width, height: viewport.height};
            callback(cache[num], afterLoading);
          });
        });
      }
    };
    
    var getNumPages = function () {
      return doc.numPages;
    };

    var pdfmgr = {
      getNumPages: getNumPages,
      getPageAsBase64: getPageAsBase64
    };
    return callback(pdfmgr);
  });
};