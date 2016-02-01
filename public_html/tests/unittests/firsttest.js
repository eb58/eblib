test('testset0 QUnit setup ok!', function () {
   ok(true);
//   function isEven(val) {return val % 2 === 0;   }
//   ok(isEven(0), 'Zero is an even number');
//   ok(isEven(2), 'So is two');
//   ok(isEven(-4), 'So is negative four');
//   ok(!isEven(1), 'One is not an even number');
//   ok(!isEven(-7), 'Neither is negative seven');
});

var switchProto = {
   isOn: function isOn() {
      return this.state;
   },
   toggle: function toggle() {
      this.state = !this.state;
      return this;
   },
   state: false
};
var switch1 = Object.create(switchProto);
var switch2 = Object.create(switchProto);

test('Object.create', function () {
   ok(switch1.toggle().isOn(),
      '.toggle() works.'
      );
   ok(!switch2.isOn(),
      'instance safe.'
      );
});


