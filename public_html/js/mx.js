/* global _ */

var mx = function mx(nr, nc) { // nr Zeilen, nc Spalten
   var data = _.map( _.range(nr),function(){ return []; } ); // [ [], [], [], ..., [] ] 
 
   data.fill = function (val) {
      val = val || 0;
      var n=0;
      for (var r = 0; r < nr; r++) {
         for (var c = 0; c < nc; c++)
            data[r][c] = _.isArray(val)? val[n++] : val;
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
      return _.clone(data[r]);
   };

   data.col = function (n) {
      return _.map( _.range(data.length),function(r){ return data[r][n]; } );
   };
   return data;   
}