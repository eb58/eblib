var relationlistConverters = {
  convertRelationlist: function convertRelationlist(arr, src, dst) {
//  Example:
//  var arr = [
//    {id: '60', relationId: '1'},
//    {id: '60', relationId: '2'},
//    {id: '70', relationId: '5'},
//    {id: '70', relationId: '4'},
//    {id: '70', relationId: '3'},
//  ];
//  src = 'srcId'
//  dst = 'destList'
//  --> 
//  [
//    {"srcId": "60", "destList": ["1", "2"]},
//    {"srcId": "70", "destList": ["5", "4", "3"]}
//  ]

    var grp = arr.reduce(function (acc, r) {
      if (!acc[r.id])
        (acc[r.id] = []);
      acc[r.id].push(r.relationId);
      return acc;
    }, {});
    return _.keys(grp).map(function (key) {
      var o = {};
      o[src] = key;
      o[dst] = grp[key]
      return o;
    });
  },
};
