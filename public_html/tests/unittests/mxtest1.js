/* global QUnit, mx */
$.fn.ebtable.sortformats = {
  'date-de': function (a) { // '01.01.2013' -->   '20130101' 
    var d = a.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    return d ? (d[3] + d[2] + d[1]) : '';
  },
  'datetime-de': function (a) { // '01.01.2013 12:36'  -->  '201301011236' 
    var d = a.match(/^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2}):(\d{2})$/);
    return d ? (d[3] + d[2] + d[1] + d[4] + d[5]) : '';
  },
  'scientific': function (a) { // '1e+3'  -->  '1000' 
    return parseFloat(a);
  }
};

QUnit.test('testset1 easy ones', function (assert) {
  assert.deepEqual(mx([[1, 2, 3], [4, 5, 6], [7, 8, 9]]), [[1, 2, 3], [4, 5, 6], [7, 8, 9]]);

  var m = mx([[1, 2], [3, 4]]);
  assert.deepEqual(m, [[1, 2], [3, 4]]);
  assert.deepEqual(m.col(0), [1, 3]);
  assert.deepEqual(m.col(1), [2, 4]);

  var m = mx([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
  assert.deepEqual(m.rows([1, 2]), [[4, 5, 6], [7, 8, 9]]);
  assert.deepEqual(m.rows([0]), [[1, 2, 3]]);
  assert.deepEqual(m.rows([0, 2]), [[1, 2, 3], [7, 8, 9]]);

  assert.deepEqual(m.withoutRows([1, 2]), [[1, 2, 3]]);
  assert.deepEqual(m.withoutRows([0]), [[4, 5, 6], [7, 8, 9]]);
  assert.deepEqual(m.withoutRows([0, 2]), [[4, 5, 6]]);
  assert.deepEqual(m.cols([0, 1]), [[1, 2], [4, 5], [7, 8]]);
  assert.deepEqual(m.withoutCols([0, 1]), [[3], [6], [9]]);

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

QUnit.test('testset2 Array sorting functions', function (assert) {
  var m = mx([['11', '12', '13'], ['31', '32', '33'], ['21', '22', '23']]);
  assert.deepEqual(m.length, 3);
  assert.deepEqual(m.sort(), [['11', '12', '13'], ['21', '22', '23'], ['31', '32', '33']]);
  assert.deepEqual(m.sort(m.rowCmpCols({col: 1, order: 'desc'})), [['31', '32', '33'], ['21', '22', '23'], ['11', '12', '13']]);
  assert.deepEqual(m.sort(m.rowCmpCols({col: 1, order: 'asc'})), [['11', '12', '13'], ['21', '22', '23'], ['31', '32', '33']]);
  assert.deepEqual(m.sort(m.rowCmpCols({col: 3, order: 'asc'})), [['11', '12', '13'], ['21', '22', '23'], ['31', '32', '33']]);

  var m = mx([['04.01.2011'], ['01.01.2015'], ['03.01.2013'], ['17.01.2001']]);
  assert.deepEqual(m.sort(m.rowCmpCols({col: 0, order: 'asc', sortformat: 'date-de'})), [['17.01.2001'], ['04.01.2011'], ['03.01.2013'], ['01.01.2015']]);
  assert.deepEqual(m.sort(m.rowCmpCols({col: 0, order: 'desc', sortformat: 'date-de'})), [['01.01.2015'], ['03.01.2013'], ['04.01.2011'], ['17.01.2001']]);
});

QUnit.test('testset3 Array filtering functions', function (assert) {
  var m = mx([['test', '01.01.2011'], ['', '01.01.2015'], ['', '01.01.2013'], ['testA', '01.01.2001']]);
  assert.deepEqual(m.filterData({col: 0, searchtext: 'te'}), [['test', '01.01.2011'], ['testA', '01.01.2001']]);

});

