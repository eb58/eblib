var ebutils = {
  formatBytes: function (bytes, decimals) {
    if (bytes === 0)
      return '0 Byte';
    var k = 1024;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return (parseFloat((bytes / Math.pow(k, i)).toFixed(decimals || 2)) + ' ' + sizes[i]).replace('.', ',');
  }
};