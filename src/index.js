'use strict';

let semver = require('semver');

let KindaClass = {
  _name: 'KindaClass',

  constructor() {},

  extend(name, version, constructor) {
    if (typeof name !== 'string') {
      constructor = version;
      version = name;
      name = 'Sub' + this._name;
    }

    if (typeof version !== 'string') {
      constructor = version;
      version = undefined;
    }

    let parent = this;
    let child = {
      _name: name,
      _version: version
    };

    // Copy class properties
    let keys = Object.getOwnPropertyNames(parent);
    for (let key of keys) {
      if (key.startsWith('_')) continue; // Don't copy property starting with a '_'
      let descriptor = Object.getOwnPropertyDescriptor(parent, key);
      Object.defineProperty(child, key, descriptor);
    }

    child.constructor = function() {
      this.include(parent);
      if (!constructor) return;
      if (typeof constructor === 'function') {
        constructor.call(this);
      } else {
        let constructorKeys = Object.getOwnPropertyNames(constructor);
        for (let key of constructorKeys) {
          let descriptor = Object.getOwnPropertyDescriptor(constructor, key);
          Object.defineProperty(this, key, descriptor);
        }
      }
    };

    return child;
  },

  get name() {
    return this._name;
  },

  get version() {
    return this._version;
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

  isClassOf(instance) {
    return !!(instance && instance.isInstanceOf && instance.isInstanceOf(this));
  },

  isKindaClass: true,

  constructPrototype() {
    let currentClass = this; // eslint-disable-line consistent-this
    let superclasses = [];

    let checkCompatibility = function(v1, v2) {
      if (semver.satisfies(v1, '^' + v2)) return true;
      if (semver.satisfies(v2, '^' + v1)) return true;
      return false;
    };

    let compareClasses = function(a, b, errorIfNotCompatible) {
      if (a.name !== b.name) return false;
      if (!a.version || !b.version) return true;
      if (!checkCompatibility(a.version, b.version)) {
        if (errorIfNotCompatible) {
          throw new Error(`class ${a.name} v${a.version} is not compatible with class ${b.name} v${b.version}`);
        }
        return false;
      }
      if (semver.lte(a.version, b.version)) return true;
      return false;
    };

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
        let isAlreadyIncluded = this.superclasses.some(superclass => {
          return compareClasses(other, superclass, true);
        });
        if (isAlreadyIncluded) return this;
        other.constructor.call(this);
        this.superclasses.push(other);
        return this;
      },

      isInstanceOf(other) {
        if (!(other && other.isKindaClass)) return false;
        if (compareClasses(this.class, other)) return true;
        return this.superclasses.some(superclass => {
          return compareClasses(superclass, other);
        });
      }
    };

    this.constructor.call(prototype);

    return prototype;
  }
};

module.exports = KindaClass;
