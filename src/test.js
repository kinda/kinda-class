'use strict';

let assert = require('chai').assert;
let KindaClass = require('./');

suite('KindaClass', function() {
  suite('Simple classes hierarchy', function() {
    let Foo = KindaClass.extend('Foo', function() {
      this.cool = 'very';
    });

    Foo.hello = 'Hello';
    Foo._bye = 'Bye';

    let Bar = Foo.extend('Bar', function() {
      this.isCold = function() {
        return this.cool === 'very' ? 'yes' : 'no';
      };
    });

    let Baz = KindaClass.extend('Baz', function() {
      this.include(Bar);
    });

    suite('Class methods', function() {
      test('extend', function() {
        assert.strictEqual(Bar.hello, 'Hello');
        assert.isUndefined(Bar._bye);
      });

      test('instantiate', function() {
        let bar = Bar.instantiate();
        assert.strictEqual(bar.cool, 'very');
        assert.isFunction(bar.isCold);
      });

      test('get name', function() {
        assert.strictEqual(Foo.name, 'Foo');
      });

      test('get prototype', function() {
        let bar = Bar.instantiate();
        assert.strictEqual(Bar.prototype.isCold, bar.isCold);
      });

      test('isClassOf', function() {
        let baz = Baz.instantiate();
        assert.isTrue(Baz.isClassOf(baz));
        assert.isTrue(Bar.isClassOf(baz));
        assert.isTrue(Foo.isClassOf(baz));
        assert.isTrue(KindaClass.isClassOf(baz));
        let Qux = KindaClass.extend('Qux');
        assert.isFalse(Qux.isClassOf(baz));
      });

      test('isKindaClass', function() {
        assert.isTrue(Bar.isKindaClass);
      });
    });

    suite('Instance methods', function() {
      test('include', function() {
        let baz = Baz.instantiate();
        assert.strictEqual(baz.cool, 'very');
        assert.isFunction(baz.isCold);
      });

      test('get class', function() {
        let foo = Foo.instantiate();
        assert.strictEqual(foo.class, Foo);
      });

      test('get superclasses', function() {
        let foo = Foo.instantiate();
        assert.deepEqual(foo.superclasses, [KindaClass]);
        let bar = Bar.instantiate();
        assert.deepEqual(bar.superclasses, [KindaClass, Foo]);
        let baz = Baz.instantiate();
        assert.deepEqual(baz.superclasses, [KindaClass, Foo, Bar]);
      });

      test('get prototype', function() {
        let bar = Bar.instantiate();
        assert.strictEqual(Bar.prototype.isCold, bar.isCold);
      });

      test('isInstanceOf', function() {
        let foo = Foo.instantiate();
        assert.ok(foo.isInstanceOf(Foo));
      });
    });
  });

  suite('Object constructor', function() {
    test('simple class', function() {
      let French = KindaClass.extend('French', {
        hello: 'Bonjour',
        bye: 'Au revoir'
      });

      assert.strictEqual(French.prototype.hello, 'Bonjour');
      assert.strictEqual(French.prototype.bye, 'Au revoir');
    });
  });

  suite('Name conflict', function() {
    test('extend a class with the same name', function() {
      let Person = KindaClass.extend('Person', function() {
        this.isNice = 'yes';
        this.isCool = 'yes';
      });

      Person = Person.extend('Person', function() {
        this.isCool = 'absolutely';
      });

      let person = Person.instantiate();
      assert.strictEqual(person.isNice, 'yes');
      assert.strictEqual(person.isCool, 'absolutely');

      Person = Person.extend('Person', function() {
        this.isCool = 'definitely';
      });

      person = Person.instantiate();
      assert.strictEqual(person.isNice, 'yes');
      assert.strictEqual(person.isCool, 'definitely');
    });
  });

  suite('Diamond problem', function() {
    let count = 0;

    let Top = KindaClass.extend('Top', function() {
      count++;
    });

    let Left = Top.extend('Left');

    let Right = Top.extend('Right');

    let Bottom = Top.extend('Bottom', function() {
      this.include(Left);
      this.include(Right);
    });

    test('Top constructor should only be called once', function() {
      assert.strictEqual(count, 0);
      Bottom.instantiate();
      assert.strictEqual(count, 1);
      Bottom.instantiate();
      assert.strictEqual(count, 1);
    });
  });
});
