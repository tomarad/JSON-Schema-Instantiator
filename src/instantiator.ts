// The JSON Object that defines the default values of certain types.
var typesInstantiator = {
  string: '',
  number: 0,
  integer: 0,
  null: null,
  boolean: false, // Always stay positive?
  object: {}
};

type InstanciatorTypes = keyof typeof typesInstantiator;

/**
 * Checks whether a variable is a primitive.
 * @param obj - an object.
 * @returns {boolean}
 */
function isPrimitive(obj) {
  var type = obj.type;

  return typesInstantiator[type] !== undefined;
}

/**
 * Checks whether a property is on required array.
 * @param property - the property to check.
 * @param requiredArray - the required array
 * @returns {boolean}
 */
function isPropertyRequired(property, requiredArray) {
  var found = false;
  requiredArray = requiredArray || [];
  for (var requiredProperty of requiredArray) {
    if (requiredProperty === property) {
      found = true;
    }
  }
  return found;
}

function shouldVisit(property, obj, options) {
  return (
    !options.requiredPropertiesOnly || (options.requiredPropertiesOnly && isPropertyRequired(property, obj.required))
  );
}

/**
 * Instantiate a primitive.
 * @param {Object} val - The object that represents the primitive.
 * @param {String} val.type
 * @param {Any} [val.default]
 * @param {Object.<string, any>} [defaults]
 * @returns {*}
 */
function instantiatePrimitive(val, defaults) {
  defaults = defaults || {};

  var type = val.type;

  // Support for default values in the JSON Schema.
  if (Object.prototype.hasOwnProperty.call(val, 'default')) {
    return val.default;
  }

  // Support for provided default values.
  if (Object.prototype.hasOwnProperty.call(defaults, type)) {
    if (typeof defaults[type] === 'function') {
      return defaults[type](val);
    }
    return defaults[type];
  }

  return typesInstantiator[type];
}

function instantiateArray(val, visit, defaults) {
  defaults = defaults || {};

  var type = val.type;

  // Support for default values in the JSON Schema.
  if (Object.prototype.hasOwnProperty.call(val, 'default')) {
    return val.default;
  }

  // Support for provided default values.
  if (Object.prototype.hasOwnProperty.call(defaults, type)) {
    if (typeof defaults[type] === 'function') {
      return defaults[type](val);
    }

    return defaults[type];
  }

  var result = [];
  var len = 0;
  if (val.minItems || val.minItems > 0) {
    len = val.minItems;
  }

  // Instantiate 'len' items.
  for (var i = 0; i < len; i++) {
    visit(val.items, i, result);
  }

  return result;
}

/**
 * Checks whether a variable is an enum.
 * @param obj - an object.
 * @returns {boolean}
 */
function isEnum(obj) {
  return Object.prototype.toString.call(obj.enum) === '[object Array]';
}

/**
 * Checks whether a variable is an array.
 * @param obj - an object.
 * @returns {boolean}
 */
function isArray(obj) {
  return Array.isArray(obj);
}

/**
 * Extracts the type of the object.
 * If the type is an array, set type to first in list of types.
 * If obj.type is not overridden, it will fail the isPrimitive check.
 * Which internally also checks obj.type.
 * @param obj - An object.
 */
function getObjectType(obj) {
  // Check if type is array of types.
  if (isArray(obj.type)) {
    obj.type = obj.type[0];
  }
  if (obj.type) {
    return obj.type;
  }
  if (obj.const !== undefined) {
    return 'const';
  }
  return undefined;
}

/**
 * Instantiate an enum.
 * @param val - The object that represents the primitive.
 * @returns {*}
 */
function instantiateEnum(val) {
  // Support for default values in the JSON Schema.
  if (val.default) {
    return val.default;
  }
  if (!val.enum.length) {
    return undefined;
  }
  return val.enum[0];
}

/**
 * Finds a definition in a schema.
 * Useful for finding references.
 *
 * @param schema    The full schema object.
 * @param ref       The reference to find.
 * @return {*}      The object representing the ref.
 */
function findDefinition(schema, ref) {
  var propertyPath = ref.split('/').slice(1); // Ignore the #/uri at the beginning.
  var currentProperty = propertyPath.splice(0, 1)[0];
  var currentValue = schema;

  while (currentProperty) {
    currentValue = currentValue[currentProperty];
    currentProperty = propertyPath.splice(0, 1)[0];
  }

  return currentValue;
}

/**
 * The main function.
 * Calls sub-objects recursively, depth first, using the sub-function 'visit'.
 *
 * @param {Object} schema - The schema to instantiate.
 * @param {Object} [options]
 * @param {Boolean} [options.requiredPropertiesOnly]
 * @param {Object.<string, any>} [options.defaults]
 * @returns {*}
 */
export function instantiate(
  schema: object,
  options: {
    defaults?: Record<InstanciatorTypes, any>;
    requiredPropertiesOnly?: boolean;
  } = {}
) {
  /**
   * Visits each sub-object using recursion.
   * If it reaches a primitive, instantiate it.
   * @param obj - The object that represents the schema.
   * @param name - The name of the current object.
   * @param data - The instance data that represents the current object.
   */
  function visit(obj, name, data) {
    if (!obj) {
      return;
    }

    var type = getObjectType(obj);

    // We want non-primitives objects (primitive === object w/o properties).
    if (type === 'object' && obj.properties) {
      data[name] = data[name] || {};

      // Visit each property.
      for (var property in obj.properties) {
        if (Object.prototype.hasOwnProperty.call(obj.properties, property)) {
          if (shouldVisit(property, obj, options)) {
            visit(obj.properties[property], property, data[name]);
          }
        }
      }
    } else if (obj.allOf) {
      for (var i = 0; i < obj.allOf.length; i++) {
        visit(obj.allOf[i], name, data);
      }
    } else if (obj.$ref) {
      obj = findDefinition(schema, obj.$ref);
      visit(obj, name, data);
    } else if (type === 'array') {
      data[name] = instantiateArray(obj, visit, options.defaults);
    } else if (isEnum(obj)) {
      data[name] = instantiateEnum(obj);
    } else if (isPrimitive(obj)) {
      data[name] = instantiatePrimitive(obj, options.defaults);
    } else if (type === 'const') {
      data[name] = obj.const;
    }
  }

  var data = { __temp__: null };
  visit(schema, '__temp__', data);
  return data['__temp__'];
}

export default instantiate;
