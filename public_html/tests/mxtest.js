/* global QUnit, mx */

QUnit.test('testset1 easy ones', function (assert) {
   assert.notEqual(mx(2, 2), mx(2, 2));
   assert.deepEqual(mx(2, 2), [[], []]);
   assert.deepEqual(mx(2, 2).fill(1), [[1, 1], [1, 1]]);
   assert.deepEqual(mx(2, 3).zero(), [[0, 0, 0], [0, 0, 0]]);
   
   var m = mx(2,2).fill([1,2,3,4]);
   assert.deepEqual(m,[[1,2],[3,4]]);
   assert.deepEqual(m.col(0),[1,3]);
   assert.deepEqual(m.col(1),[2,4]);
});


