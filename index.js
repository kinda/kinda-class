"use strict";

var KindaClass = {
  name: 'KindaClass',

  constructor: function() {},

  /**
   * Create a subclass.
   * @param {string} name - The name of the subclass to create.
   * @param {function} constructor - The code to run to define the subclass.
   */
  extend: function(name, constructor) {
    if (typeof name !== 'string' || !name)
      throw new Error('class name is required');
    var parent = this;
    var child = {};
    // Copy class properties
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

  /**
  * Construct the prototype.
  * @private
  */
  constructPrototype: function() {
    var currentClass = this;
    var includedClasses = [];
    var prototype = {
      /**
       * Get the class
       */
      getClass: function() {
        return currentClass;
      },

      /**
       * Get the prototype.
       */
      getPrototype: function() {
        return prototype;
      },

      /**
       * Include another class (mixin).
       * @param {Object} other - The class to include.
       */
      include: function(other) {
        if (includedClasses.indexOf(other) !== -1) return;
        includedClasses.push(other);
        other.constructor.call(this);
        return this;
      },

      /**
       * Check if something is an instance of a class.
       * @param {Object} klass - a class.
       */
      isInstanceOf: function(klass) {
        return klass === currentClass ||
          includedClasses.indexOf(klass) !== -1;
      }
    };

    this.constructor.call(prototype);
    return prototype;
  },

  /**
   * Get (or create if it doesn't exist) the prototype of a class.
   */
  getPrototype: function() {
    if (!this._prototype) {
      this._prototype = this.constructPrototype();
    }
    return this._prototype;
  },

  /**
   * Create an instance.
   */
  instantiate: function() {
    return Object.create(this.getPrototype());
  },

  /**
   * A way to test if something is a KindaClass.
   */
  isKindaClass: function() { return true; }
}

module.exports = KindaClass;
