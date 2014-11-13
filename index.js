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
  * Function for construct the prototype
  */
  constructPrototype: function() {
    var currentClass = this;
    var includedClasses = [];
    var prototype = {

      /**
       * Get reference of class
       */
      getClass: function() {
        return currentClass;
      },

      /**
       * Get construct prototype object of class
       */
      getPrototype: function() {
        return prototype;
      },

      /**
       * Include an other class (mixin).
       * @param {object} other - The class to include.
       */
      include: function(other) {
        if (includedClasses.indexOf(other) !== -1) return;
        includedClasses.push(other);
        other.constructor.call(this);
        return this;
      },

      /**
       * Check if klass is a subclass
       * @param {object} klass - the klass object for check
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
   * Function for get the construct prototype of class
   */
  getPrototype: function() {
    if (!this._prototype) {
      this._prototype = this.constructPrototype();
    }
    return this._prototype;
  },

  /**
   * create an instance from prototype object
   */
  instantiate: function() {
    return Object.create(this.getPrototype());
  },

  /**
   * flag this is KindaClass object
   */
  isKindaClass: function() { return true; }
}

module.exports = KindaClass;
