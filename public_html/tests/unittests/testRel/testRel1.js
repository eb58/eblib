/* global QUnit, relationlistConverters */
QUnit.test('testset: example1', function (assert) {
  var a = [
    {id: '70', relationId: '1'},
    {id: '70', relationId: '2'},
    {id: '70', relationId: '5'},
    {id: '70', relationId: '4'},
    {id: '70', relationId: '3'},
  ];
  var b = [
    {"srcId": "70", "destList": ["1", "2", "5", "4", "3"]},
  ];
  var c = relationlistConverters.convertRelationlist(a, 'srcId', 'destList')
  assert.deepEqual(c, b);
});

QUnit.test('testset: example2', function (assert) {
  var a = [
    {id: '60', relationId: '1'},
    {id: '60', relationId: '3'},
    {id: '70', relationId: '2'},
    {id: '70', relationId: '5'},
    {id: '70', relationId: '4'},
  ];
  var b = [
    {"srcId": "60", "destList": ["1", "3"]},
    {"srcId": "70", "destList": [ "2", "5", "4"]},
  ];
  var c = relationlistConverters.convertRelationlist(a, 'srcId', 'destList')
  assert.deepEqual(c, b);
});
