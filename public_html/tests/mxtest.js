/* global QUnit, mx */

QUnit.test('testset0 Array functions', function (assert) {
   var m = mx([['11', '12', '13'],['31', '32', '33'], ['21', '22', '23']]);
   assert.deepEqual(m.length,3);
   assert.deepEqual(m.sort(), [['11', '12', '13'], ['21', '22', '23'],['31', '32', '33']]);
   
   var cmp = m.rowCmpCols([{col: 1, order:'desc'}]);
   assert.deepEqual(m.sort(cmp), [['31', '32', '33'], ['21', '22', '23'],['11', '12', '13']]);
  
   var m = mx([['11', '12', '13'], ['31', '32', '33'], ['21', '22', '23']]);
   assert.deepEqual(m.sort(m.rowCmpCols([{col: 1, order:'asc'}])), [['11', '12', '13'], ['21', '22', '23'], ['31', '32', '33']]);
   
   var m = mx([['01.01.2011'], ['01.01.2015'], ['01.01.2013'], ['01.01.2001']]);
   assert.deepEqual(m.sort(m.rowCmpCols([{col: 0, order:'asc', format:'date-de'}])), [['01.01.2001'], ['01.01.2011'], ['01.01.2013'], ['01.01.2015']]);
});

QUnit.test('testset1 easy ones', function (assert) {
   assert.notEqual(mx(2, 2), mx(2, 2));
   assert.deepEqual(mx(2, 2), [[], []]);
   assert.deepEqual(mx(2, 2).fill(1), [[1, 1], [1, 1]]);
   assert.deepEqual(mx(2, 3).zero(), [[0, 0, 0], [0, 0, 0]]);
   assert.deepEqual(mx([[1, 2, 3], [4, 5, 6], [7, 8, 9]]), [[1, 2, 3], [4, 5, 6], [7, 8, 9]]);

   var m = mx(2, 2).fill([1, 2, 3, 4]);
   assert.deepEqual(m, [[1, 2], [3, 4]]);
   assert.deepEqual(m.col(0), [1, 3]);
   assert.deepEqual(m.col(1), [2, 4]);

   var m = mx(3, 3).fill([1, 2, 3, 4, 5, 6, 7, 8, 9]);
   assert.deepEqual(m.rows([1, 2]), [[4, 5, 6], [7, 8, 9]]);
   assert.deepEqual(m.rows([0]), [[1, 2, 3]]);
   assert.deepEqual(m.rows([0, 2]), [[1, 2, 3], [7, 8, 9]]);

   assert.deepEqual(m.withoutRows([1, 2]), [[1, 2, 3]]);
   assert.deepEqual(m.withoutRows([0]), [[4, 5, 6], [7, 8, 9]]);
   assert.deepEqual(m.withoutRows([0, 2]), [[4, 5, 6]]);

   var m = mx([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
   assert.deepEqual(m.withoutRows([0, 2]), [[4, 5, 6]]);
   assert.deepEqual(m.withoutRows(function (row) {
      return row[0] === 4;
   }), [[1, 2, 3], [7, 8, 9]]);

   var m = mx([['11', '12', '13'], ['21', '22', '23'], ['31', '32', '33']]);
   assert.deepEqual(m.withoutRows([0, 2]), [['21', '22', '23']]);
   assert.deepEqual(m.withoutRows(function (row) {
      return row[0] === '21';
   }), [['11', '12', '13'], ['31', '32', '33']]);

});


