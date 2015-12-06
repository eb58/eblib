var logtor = function () {
   var lev = 0;
   
   function indent(lev) { return '                              '.substring(0,lev*3); }
   
   function apply(f) {
      var logf = function () {
         console.log(indent(lev++), '>>> Begin ', f.name, 'args=', [].slice.call(arguments, 0).toString());
         var ret = f.apply(this, [].slice.call(arguments, 0));
         console.log(indent(--lev), '<<< End   ', f.name, 'ret=', ret);
         return ret;
      };
      logf.name    = f.name;
      logf.restore = function () { return f;};
      return logf;
   }
   return{
      apply: apply
   };
}();

function f1(a, b) { console.log('F1');return 'f1-' + f2(a) + f2(b);}
function f2(a) {  console.log('F2'); return '(f2-' + a + ')';}

f1 = logtor.apply(f1);
f2 = logtor.apply(f2);

f1('p1', 'p2');

f1 = f1.restore();
f2 = f2.restore();
f1('a');
