var module = (function () {
  var aaa = 's';

  function f1() {    console.log('f1');  }
  function f2() {    console.log(aaa);  }
  function f3(s) {   aaa = s; f1();  }

  return {
    f1: f1,
    f2: f2,
    f3: f3
  };
})();