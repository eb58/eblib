/* global _ */

var mx = function mx(p1, p2) { // nr #rows, nc #cols OR  p1 = 2-dimensional array
   var data = _.isArray(p1) ? p1 : _.map(_.range(p1), function () {
      return [];
   }), // [ [], [], [], ..., [] ] 
      nr = _.isArray(p1) ? p1.length : p1,
      nc = _.isArray(p1) ? p1[0].length : p2;


   data.fill = function (val) {
      val = val || 0;
      var n = 0;
      for (var r = 0; r < nr; r++) {
         for (var c = 0; c < nc; c++) {
            data[r][c] = _.isArray(val) ? val[n++] : val;
         }
      }
      return this;
   };

   data.zero = function () {
      return data.fill(0);
   };

   data.row = function (n) {
      return _.clone(data[n]);
   };

   data.rows = function (arr) {
      var d = [];
      for (var r = 0; r < nr; r++) {
         if (_.indexOf(arr, r) >= 0)
            d.push(_.clone(data[r]));
      }
      return d;
   };

   data.withoutRows = function (p) { // pred-function or arr
      var d = [];
      for (var r = 0; r < nr; r++) {
         if (_.isFunction(p)? !p(data[r]) : _.indexOf(p, r) < 0)
            d.push(_.clone(data[r]));
      }
      return d;
   };

   data.col = function (n) {
      return _.map(_.range(data.length), function (r) {
         return data[r][n];
      });
   };
   return data;
};