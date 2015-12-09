/* global QUnit, mx */

QUnit.test('testset1 easy ones', function (assert) {
   assert.notEqual(mx(2, 2), mx(2, 2));
   assert.deepEqual(mx(2, 2), [[], []]);
   assert.deepEqual(mx(2, 2).fill(1), [[1, 1], [1, 1]]);
   assert.deepEqual(mx(2, 3).zero(), [[0, 0, 0], [0, 0, 0]]);
   assert.deepEqual(mx([[1,2,3],[4,5,6],[7,8,9]]), [[1,2,3],[4,5,6],[7,8,9]]);
   
   var m = mx(2,2).fill([1,2,3,4]);
   assert.deepEqual(m,[[1,2],[3,4]]);
   assert.deepEqual(m.col(0),[1,3]);
   assert.deepEqual(m.col(1),[2,4]);
   
   var m = mx(3,3).fill([1,2,3,4,5,6,7,8,9]);
   assert.deepEqual(m.rows([1,2]),[[4,5,6],[7,8,9]]);
   assert.deepEqual(m.rows([0]),[[1,2,3]]);
   assert.deepEqual(m.rows([0,2]),[[1,2,3],[7,8,9]]);

   assert.deepEqual(m.withoutRows([1,2]),[[1,2,3]]);
   assert.deepEqual(m.withoutRows([0]),[[4,5,6],[7,8,9]]);
   assert.deepEqual(m.withoutRows([0,2]),[[4,5,6]]);

   var m3 = mx([[1,2,3],[4,5,6],[7,8,9]]);
   assert.deepEqual(m3.withoutRows([0,2]),[[4,5,6]]);
   assert.deepEqual(m3.withoutRows(function(row){return row[0] === 4;}),[[1,2,3],[7,8,9]]);

   var m3 = mx([['11','12','13'],['21','22','23'],['31','32','33']]);
   assert.deepEqual(m3.withoutRows([0,2]),[['21','22','23']]);
   assert.deepEqual(m3.withoutRows(function(row){return row[0] === '21';}),[['11','12','13'],['31','32','33']]);

});


