/* global QUnit, himi */

QUnit.test('himi testset1 ', function () {
  var m = himiModel(himi);
  ok(m.getHimis().length===3, 'getHimis from Himi-Model');
  var himi = m.appendHimi();
  ok(himi.id===3, 'getHimis from Himi-Model');
  ok(m.getHimis().length===4, 'getHimis from Himi-Model');
  var qaslength = m.getHimis()[0].qas.length;
  m.appendQas(0);
  ok( qaslength+1 === m.getHimis()[0].qas.length, 'appending qas ok' ) ;
});



