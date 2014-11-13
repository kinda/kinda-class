"use strict";

var assert = require('chai').assert;
var KindaClass = require('./');

suite('KindaClass', function() {
  var Foo = KindaClass.extend('Foo', function() {
    this.cool = 'very';
  });

  var Bar = KindaClass.extend('Bar', function() {
    this.include(Foo);

    this.isCold = function() {
      if(this.cool === 'very') return 'yes';
      return 'no';
    };
  });

  test('extend', function() {
      for(var key in Bar) {
        if(key.substr(0,1) !== '_' && !Bar.hasOwnProperty(key)) {
          assert.equal(Bar[key], Foo[key], 'All properties in class Foo should be in class Bar');
        }
      }
  });

  suite('constructPrototype', function() {
    test('include', function() {
      var bar = Bar.instantiate();
      assert.equal(bar.cool, 'very', 'Bar should have the properties which include from Foo');
    });

    test('getClass', function() {
      var foo = Foo.instantiate();
      assert.equal(foo.getClass(), Foo, "Class of instance should be equal to the class who instantiate it");
    });

    test('getPrototype', function() {
      // TODO
    });

    test('isInstanceOf', function() {
      var foo = Foo.instantiate();
      assert.ok(foo.isInstanceOf(Foo));
    });
  });

  test('getPrototype', function() {
    var foo = Foo.instantiate();
    var bar = Bar.instantiate();
    assert.equal(foo.getPrototype(), bar.getPrototype());
  });

  test('instantiate', function() {
    var bar = Bar.instantiate();
    assert.equal(bar.getClass(), Bar);
    assert.ok(bar.isInstanceOf(Bar));
  });

  test('isKindaClass', function() {
    assert.ok(Bar.isKindaClass());
  });
});
