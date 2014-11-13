"use strict";

var assert = require('chai').assert;
var KindaClass = require('./');

suite('KindaClass', function() {
  var Cool = KindaClass.extend('Serializable', function() {
    this.cool = 'very';
  });

  var Person = KindaClass.extend('Person', function() {
    this.include(Cool);

    this.hello = function() {
      return 'hello';
    };
  });

  test('isKindaClass', function() {
    assert.ok(Person.isKindaClass());
  });

  test('instantiate', function() {
    var mvila = Person.instantiate();
    assert.equal(mvila.getClass(), Person);
    assert.ok(mvila.isInstanceOf(Person));
  });

  test('include', function() {
    var mvila = Person.instantiate();
    assert.equal(mvila.cool, 'very');
  });
});
