'use strict';

let assert = require('chai').assert;
let KindaClass = require('./src');

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

    let UnnamedClass = Foo.extend();

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
        assert.strictEqual(UnnamedClass.name, 'SubFoo');
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
        assert.isTrue(foo.isInstanceOf(Foo));
        assert.isFalse(foo.isInstanceOf(Bar));
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

    test('top constructor should only be called once', function() {
      assert.strictEqual(count, 0);
      Bottom.instantiate();
      assert.strictEqual(count, 1);
      Bottom.instantiate();
      assert.strictEqual(count, 1);
    });
  });

  suite('Versioning', function() {
    test('get version number', function() {
      let A = KindaClass.extend('A');
      assert.isUndefined(A.version);
      let B = KindaClass.extend('B', '0.1.0');
      assert.strictEqual(B.version, '0.1.0');
    });

    test('isInstanceOf', function() {
      let A010 = KindaClass.extend('A', '0.1.0');
      assert.isTrue(A010.prototype.isInstanceOf(A010));

      let A015 = KindaClass.extend('A', '0.1.5');
      assert.isTrue(A010.prototype.isInstanceOf(A015));
      assert.isFalse(A015.prototype.isInstanceOf(A010));

      let B015 = KindaClass.extend('B', '0.1.5');
      assert.isFalse(A010.prototype.isInstanceOf(B015));

      let A024 = KindaClass.extend('A', '0.2.4');
      assert.isFalse(A015.prototype.isInstanceOf(A024));
      assert.isFalse(A024.prototype.isInstanceOf(A015));

      let A117 = KindaClass.extend('A', '1.1.7');
      let A141 = KindaClass.extend('A', '1.4.1');
      assert.isTrue(A117.prototype.isInstanceOf(A141));
      assert.isFalse(A141.prototype.isInstanceOf(A117));

      let A202 = KindaClass.extend('A', '2.0.2');
      assert.isFalse(A117.prototype.isInstanceOf(A202));
      assert.isFalse(A202.prototype.isInstanceOf(A117));
    });

    test('include', function() {
      let a010Constructed, a015Constructed;
      let A010 = KindaClass.extend('A', '0.1.0', function() {
        a010Constructed = true;
      });
      let A015 = KindaClass.extend('A', '0.1.5', function() {
        a015Constructed = true;
      });
      let A020 = KindaClass.extend('A', '0.2.0');

      a010Constructed = false;
      a015Constructed = false;
      (KindaClass.extend(function() {
        this.include(A010);
        this.include(A015);
      })).instantiate();
      assert.isTrue(a010Constructed);
      assert.isTrue(a015Constructed);

      a010Constructed = false;
      a015Constructed = false;
      (KindaClass.extend(function() {
        this.include(A015);
        this.include(A010);
      })).instantiate();
      assert.isTrue(a015Constructed);
      assert.isFalse(a010Constructed);

      assert.throws(function() {
        (KindaClass.extend(function() {
          this.include(A015);
          this.include(A020);
        })).instantiate();
      });
    });
  });
});
