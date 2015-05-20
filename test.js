var assert = require('chai').assert;
var KindaClass = require('./');

suite('KindaClass', function() {
  suite('Simple classes hierarchy', function() {
    var Foo = KindaClass.extend('Foo', function() {
      this.cool = 'very';
    });

    Foo.hello = 'Hello';
    Foo._bye = 'Bye';

    var Bar = Foo.extend('Bar', function() {
      this.isCold = function() {
        return this.cool === 'very' ? 'yes' : 'no';
      };
    });

    var Baz = KindaClass.extend('Baz', function() {
      this.include(Bar);
    });

    suite('Class methods', function() {
      test('extend', function() {
        assert.strictEqual(Bar.hello, 'Hello');
        assert.isUndefined(Bar._bye);
      });

      test('instantiate', function() {
        var bar = Bar.instantiate();
        assert.strictEqual(bar.cool, 'very');
        assert.isFunction(bar.isCold);
      });

      test('get name', function() {
        assert.strictEqual(Foo.name, 'Foo');
      });

      test('get prototype', function() {
        var bar = Bar.instantiate();
        assert.strictEqual(Bar.prototype.isCold, bar.isCold);
      });

      test('isKindaClass', function() {
        assert.isTrue(Bar.isKindaClass);
      });
    });

    suite('Instance methods', function() {
      test('include', function() {
        var baz = Baz.instantiate();
        assert.strictEqual(baz.cool, 'very');
        assert.isFunction(baz.isCold);
      });

      test('get class', function() {
        var foo = Foo.instantiate();
        assert.strictEqual(foo.class, Foo);
      });

      test('get superclasses', function() {
        var foo = Foo.instantiate();
        assert.deepEqual(foo.superclasses, [KindaClass]);
        var bar = Bar.instantiate();
        assert.deepEqual(bar.superclasses, [Foo, KindaClass]);
        var baz = Baz.instantiate();
        assert.deepEqual(baz.superclasses, [KindaClass, Bar, Foo]);
      });

      test('get prototype', function() {
        var bar = Bar.instantiate();
        assert.strictEqual(Bar.prototype.isCold, bar.isCold);
      });

      test('isInstanceOf', function() {
        var foo = Foo.instantiate();
        assert.ok(foo.isInstanceOf(Foo));
      });
    });
  });

  suite('Diamond problem', function() {
    var count = 0;

    var Top = KindaClass.extend('Top', function() {
      count++;
    });

    var Left = Top.extend('Left');

    var Right = Top.extend('Right');

    var Bottom = Top.extend('Bottom', function() {
      this.include(Left);
      this.include(Right);
    });

    test('Top constructor should only be called once', function() {
      assert.strictEqual(count, 0);
      var bottom1 = Bottom.instantiate();
      assert.strictEqual(count, 1);
      var bottom2 = Bottom.instantiate();
      assert.strictEqual(count, 1);
    });
  });
});
