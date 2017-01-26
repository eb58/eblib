test('testset: QUnit setup ok!', function () {
  ok(true);
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

test('testset: Object.create', function () {
  ok(switch1.toggle().isOn(),
    '.toggle() works.'
    );
  ok(!switch2.isOn(),
    'instance safe.'
    );
});


