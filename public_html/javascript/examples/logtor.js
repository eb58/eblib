/* global _ */
const logtor = (function () {
  'use esversion: 6';
  let lev = 0;
  const blanks = n => _.range(n).map(()=> ' ').join(' ');
  const blanks100 = blanks(100);
  const indent = lev => blanks100.substring(0, lev * 3);
  
  function apply(f) {
    const logf = function () {
      const start = new Date().getTime();
      console.log(indent(lev++), '>', f.name, 'args=', [].slice.call(arguments, 0).toString());
      const ret = f.apply(this, [].slice.call(arguments, 0));
      console.log(indent(--lev), '<', f.name, 'ret=', ret, 'time', Date().getTime() - start);
      return ret;
    };
    logf.name = f.name;
    logf.restore = function () {
      return f;
    };
    return logf;
  }
  return{
    apply: apply
  };
})();

// ----------  some tests  ---------------

function f1(a, b) {
  console.log('F1');
  return 'f1-' + f2(a) + f2(b);
}
function f2(a) {
  console.log('F2');
  return '(f2-' + a + ')';
}

const fib = n => n < 2 ? 1 : fib(n - 1) + fib(n - 2);

//f1 = logtor.apply(f1);
//f2 = logtor.apply(f2);
//
//f1('p1', 'p2');
//
//f1 = f1.restore();
//f2 = f2.restore();
//f1('a');

var n = 6;
console.log('RES1', fib(n));
fib = logtor.apply(fib);
console.log('RESMEM2', fib(n));
fib = fib.restore();
fib = logtor.apply(_.memoize(fib));
console.log('RES3', fib(n));
