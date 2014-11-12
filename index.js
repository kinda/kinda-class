"use strict";

var KindaClass = {
  name: 'KindaClass',

  constructor: function() {},

  extend: function(name, constructor) {
    if (typeof name !== 'string' || !name)
      throw new Error('class name is required');
    var parent = this;
    var child = {};
    for (var key in parent) {
      if (key.substr(0, 1) !== '_' && parent.hasOwnProperty(key))
          child[key] = parent[key];
    }
    child.name = name;
    child.constructor = function() {
      this.include(parent);
      if (constructor) constructor.call(this);
    }
    return child;
  },

  constructPrototype: function() {
    var currentClass = this;
    var includedClasses = [];
    var prototype = {
      getClass: function() {
        return currentClass;
      },
      getPrototype: function() {
        return prototype;
      },
      include: function(other) {
        if (includedClasses.indexOf(other) !== -1) return;
        includedClasses.push(other);
        other.constructor.call(this);
        return this;
      },
      isInstanceOf: function(klass) {
        return klass === currentClass ||
          includedClasses.indexOf(klass) !== -1;
      }
    };
    this.constructor.call(prototype);
    return prototype;
  },

  getPrototype: function() {
    if (!this._prototype) {
      this._prototype = this.constructPrototype();
    }
    return this._prototype;
  },

  instantiate: function() {
    return Object.create(this.getPrototype());
  },

  isKindaClass: function() { return true; }
}

module.exports = KindaClass;
