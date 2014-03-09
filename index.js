"use strict";

var util = require('util');

var Kinda = {
  name: 'Kinda',

  constructor: function() {},

  extend: function(name, constructor) {
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
        // console.log(other.name + ' included');
        includedClasses.push(other);
        other.constructor.call(this);
        return this;
      },
      isInstanceOf: function(klass) {
        return klass === currentClass ||
          includedClasses.indexOf(klass) !== -1;
      }//,
      // inspect: function() {
      //   return this.toJSON ? util.inspect(this.toJSON()) : this;
      // }
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

  create: function() {
    var instance = Object.create(this.getPrototype());
    if (instance.init)
      instance.init.apply(instance, arguments);
    return instance;
  },

  isKindaClass: function() { return true; }
}

module.exports = Kinda;
