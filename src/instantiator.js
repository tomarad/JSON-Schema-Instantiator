var typesInstantiator = {
  'string': '',
  'number': 0,
  'integer': 0,
  'null': null,
  'boolean': false, // Always stay positive?,
  'object': { }
};

function isPrimitive(obj) {
  var type = obj.type;

  return typesInstantiator[type] !== undefined;
}

function instantiatePrimitive(val) {
  var type = val.type;

  if (val.default) {
    return val.default;
  }

  return typesInstantiator[type];
}

function instantiate(schema) {

  function visit(obj, name, data) {
    if (!obj) {
      return;
    }

    var type = obj.type;
    // We want non-primitives objects (primitive === object w/o properties).
    if (type === 'object' && obj.properties) {
      data[name] = { };

      for (var property in obj.properties) {
        if (obj.properties.hasOwnProperty(property)) {
          visit(obj.properties[property], property, data[name]);
        }
      }
    } else if (type === 'array') {
      data[name] = [];
      var len = 1;
      if (obj.minItems) {
        len = obj.minItems;
      }

      for (var i = 0; i < len; i++) {
        visit(obj.items, i, data[name]);
      }

    } else if (isPrimitive(obj)) {
      data[name] = instantiatePrimitive(obj);
    }
  }

  var data = {};
  visit(schema, 'kek', data);
  return data['kek'];
}

module.exports = {
  instantiate: instantiate
};
