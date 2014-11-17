"use strict";

var assert = require('chai').assert;
var KindaClass = require('./');

suite('KindaClass', function() {
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

  suite('class methods', function() {
    test('extend', function() {
      assert.equal(Bar.hello, 'Hello');
      assert.isUndefined(Bar._bye);
    });

    test('instantiate', function() {
      var bar = Bar.instantiate();
      assert.equal(bar.cool, 'very');
      assert.isFunction(bar.isCold);
    });

    test('getPrototype', function() {
      var bar = Bar.instantiate();
      assert.equal(Bar.getPrototype().isCold, bar.isCold);
    });

    test('isKindaClass', function() {
      assert.ok(Bar.isKindaClass());
    });
  });

  suite('instance methods', function() {
    test('include', function() {
      var baz = Baz.instantiate();
      assert.equal(baz.cool, 'very');
      assert.isFunction(baz.isCold);
    });

    test('getClass', function() {
      var foo = Foo.instantiate();
      assert.equal(foo.getClass(), Foo);
    });

    test('getPrototype', function() {
      var bar = Bar.instantiate();
      assert.equal(Bar.getPrototype().isCold, bar.isCold);
    });

    test('isInstanceOf', function() {
      var foo = Foo.instantiate();
      assert.ok(foo.isInstanceOf(Foo));
    });
  });
});
