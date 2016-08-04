var ebutils = (function () {

  function formatBytes(bytes, decimals) {
    if (bytes === 0)
      return '0 Byte';
    var k = 1024;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return (parseFloat((bytes / Math.pow(k, i)).toFixed(decimals || 2)) + ' ' + sizes[i]).replace('.', ',');
  }

  function byteCount(str) {
    function fixedCharCodeAt(str, idx) {
      idx = idx || 0;
      var code = str.charCodeAt(idx);
      if (0xD800 <= code && code <= 0xDBFF) { // High surrogate (could change last hex to 0xDB7F to treat high private surrogates as single characters)
        var hi = code;
        var low = str.charCodeAt(idx + 1);
        if (isNaN(low))
          throw 'Kein g\u00fcltiges Schriftzeichen oder Speicherfehler!';
        return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
      }
      if (0xDC00 <= code && code <= 0xDFFF) { // Low surrogate
        return false;
      }
      return code;
    }

    var result = 0;
    for (var n = 0; n < str.length; n++) {
      var charCode = fixedCharCodeAt(str, n);
      if (typeof charCode === "number") {
        if (charCode < 128) {
          result = result + 1;
        } else if (charCode < 2048) {
          result = result + 2;
        } else if (charCode < 65536) {
          result = result + 3;
        } else if (charCode < 2097152) {
          result = result + 4;
        } else if (charCode < 67108864) {
          result = result + 5;
        } else {
          result = result + 6;
        }
      }
    }
    return result;
  }

  function getMimetypeByExt(ext) {
    var extToMimes = {
      'img': 'image/jpeg',
      'gif': 'image/gif',
      'png': 'image/png',
      'tif': 'image/tif',
      'tiff': 'image/tiff',
      'jpg': 'image/jpg',
      'jepg': 'image/jepg',
      'pdf': 'application/pdf',
      'txt': 'text/plain',
      'doc': 'application/msword',
      'xls': 'application/msexcel',
      'docx': 'application/vnd.openxmlformats-officedocument'
    }
    return extToMimes[ext] || 'unknown';
  }

  return {
    byteCount: byteCount,
    formatBytes: formatBytes,
    getMimeByExt: getMimetypeByExt,
  };
})();

