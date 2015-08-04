'use strict';

let semver = require('semver');
let pkg = require('../package.json');

let KindaClass = {
  _name: 'KindaClass',
  _version: pkg.version,
  isKindaClass: true
};

KindaClass.constructor = function() {};

KindaClass.extend = function(name, version, constructor) {
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
};

Object.defineProperty(KindaClass, 'name', {
  get() {
    return this._name;
  }
});

Object.defineProperty(KindaClass, 'version', {
  get() {
    return this._version;
  }
});

Object.defineProperty(KindaClass, 'prototype', {
  get() {
    if (!this._prototype) {
      this._prototype = this.constructPrototype();
    }
    return this._prototype;
  }
});

KindaClass.instantiate = function() {
  return Object.create(this.prototype);
};

KindaClass.isClassOf = function(instance) {
  return !!(instance && instance.isInstanceOf && instance.isInstanceOf(this));
};

KindaClass.constructPrototype = function() {
  let currentClass = this;
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

  let prototype = {};

  Object.defineProperty(prototype, 'class', {
    get() {
      return currentClass;
    }
  });

  Object.defineProperty(prototype, 'superclasses', {
    get() {
      return superclasses;
    }
  });

  Object.defineProperty(prototype, 'prototype', {
    get() {
      return prototype;
    }
  });

  prototype.include = function(other) {
    let isAlreadyIncluded = this.superclasses.some(superclass => {
      return compareClasses(other, superclass, true);
    });
    if (isAlreadyIncluded) return this;
    other.constructor.call(this);
    this.superclasses.push(other);
    return this;
  };

  prototype.isInstanceOf = function(other) {
    if (!(other && other.isKindaClass)) return false;
    if (compareClasses(this.class, other)) return true;
    return this.superclasses.some(superclass => {
      return compareClasses(superclass, other);
    });
  };

  this.constructor.call(prototype);

  return prototype;
};

module.exports = KindaClass;
