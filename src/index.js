'use strict';

let KindaClass = {
  _name: 'KindaClass',

  constructor() {},

  extend(name, constructor) {
    if (typeof name !== 'string' || !name) {
      throw new Error('class name is required');
    }

    let parent = this; // eslint-disable-line consistent-this
    let child = {};

    // Copy class properties
    let keys = Object.getOwnPropertyNames(parent);
    for (let key of keys) {
      if (key.startsWith('_')) continue; // Don't copy property starting with a '_'
      let descriptor = Object.getOwnPropertyDescriptor(parent, key);
      Object.defineProperty(child, key, descriptor);
    }

    child._name = name;

    child.constructor = function() {
      this.include(parent);
      if (constructor) constructor.call(this);
    };

    return child;
  },

  get name() {
    return this._name;
  },

  get prototype() {
    if (!this._prototype) {
      this._prototype = this.constructPrototype();
    }
    return this._prototype;
  },

  instantiate() {
    return Object.create(this.prototype);
  },

  isKindaClass: true,

  constructPrototype() {
    let currentClass = this; // eslint-disable-line consistent-this
    let superclasses = [];

    let prototype = {
      get class() {
        return currentClass;
      },

      get superclasses() {
        return superclasses;
      },

      get prototype() {
        return prototype;
      },

      include(other) {
        if (superclasses.indexOf(other) !== -1) return this;
        superclasses.push(other);
        other.constructor.call(this);
        return this;
      },

      isInstanceOf(klass) {
        return klass === currentClass || superclasses.indexOf(klass) !== -1;
      }
    };

    this.constructor.call(prototype);

    return prototype;
  }
};

module.exports = KindaClass;
