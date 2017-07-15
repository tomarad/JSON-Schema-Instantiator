var expect = require('chai').expect;

var instantiate = require('../src/instantiator').instantiate;

var schema, expected, result;

describe('Primitives', function() {

  it('should instantiate string', function() {
    schema = {
      'type': 'string'
    };
    result = instantiate(schema);
    expected = "";
    expect(result).to.deep.equal(expected);
  });

  it('should instantiate number', function() {
    schema = {
      'type': 'number'
    };
    result = instantiate(schema);
    expected = 0;
    expect(result).to.deep.equal(expected);
  });

  it('should instantiate boolean', function() {
    schema = {
      'type': 'boolean'
    };
    result = instantiate(schema);
    expected = false;
    expect(result).to.deep.equal(expected);
  });

  it('should instantiate null', function() {
    schema = {
      'type': 'null'
    };
    result = instantiate(schema);
    expected = null;
    expect(result).to.deep.equal(expected);
  });

  it('should use default property', function() {
    schema = {
      'type': 'number',
      'default': 100
    };
    result = instantiate(schema);
    expected = 100;
    expect(result).to.deep.equal(expected);
  });

  it('should support array of types', function() {
    schema = {
      'type': ['string', 'null']
    };
    result = instantiate(schema);
    expected = '';
    expect(result).to.deep.equal(expected);
  });
});


describe('Objects', function() {
  it('should instantiate object without properties', function() {
    schema = {
      'type': 'object'
    };
    result = instantiate(schema);
    expected = {};
    expect(result).to.deep.equal(expected);
  });

  it('should instantiate object with property', function() {
    schema = {
      'type': 'object',
      'properties': {
        'title': {
          'type': 'string',
        }
      }
    };
    result = instantiate(schema);
    expected = {
      'title': ''
    };
    expect(result).to.deep.equal(expected);
  });

  it('should instantiate object with property with default value', function() {
    schema = {
      'type': 'object',
      'properties': {
        'title': {
          'type': 'string',
          'default': 'Example'
        }
      }
    };
    result = instantiate(schema);
    expected = {
      'title': 'Example'
    };
    expect(result).to.deep.equal(expected);
  });

  it('should instantiate object with more than one property', function() {
    schema = {
      'type': 'object',
      'properties': {
        'title': {
          'type': 'string',
          'default': 'Example'
        },
        'amount': {
          'type': 'number',
          'default': 10
        }
      }
    };
    result = instantiate(schema);
    expected = {
      'title': 'Example',
      'amount': 10
    };
    expect(result).to.deep.equal(expected);
  });
});

describe('AllOf', function() {
  it('should instantiate schema with allOf', function() {
    schema = {
      'allOf': [
        {
          'type': 'object',
          'properties': {
            'title': {
              'type': 'string'
            }
          }
        },
        {
          'type': 'object',
          'properties': {
            'amount': {
              'type': 'number',
              'default': 1
            }
          }
        }
      ]
    };
    result = instantiate(schema);
    expected = {
      'title': '',
      'amount': 1
    };
    expect(result).to.deep.equal(expected);
  });
});
    
describe('Options', function() {
  it('should instantiate object without properties', function() {
    schema = {
      'type': 'object'
    };
    result = instantiate(schema, {requiredPropertiesOnly: true});
    expected = {};
    expect(result).to.deep.equal(expected);
  });

  it('should instantiate object without property', function() {
    schema = {
      'type': 'object',
      'properties': {
        'title': {
          'type': 'string',
        }
      }
    };
    result = instantiate(schema, {requiredPropertiesOnly: true});
    expected = {};
    expect(result).to.deep.equal(expected);
  });
    
  it('should instantiate object with only property', function() {
    schema = {
      'type': 'object',
      'properties': {
        'title': {
          'type': 'string',
        },
        'description': {
          'type': 'string'
        }
      },
      'required': ['title']
    };
    result = instantiate(schema, {requiredPropertiesOnly: true});
    expected = {
      'title': ''
    };
    expect(result).to.deep.equal(expected);
  });
    
  it('should instantiate object with all properties', function() {
    schema = {
      'type': 'object',
      'properties': {
        'title': {
          'type': 'string',
        },
        'description': {
          'type': 'string'
        }
      },
      'required': ['title']
    };
    result = instantiate(schema, {requiredPropertiesOnly: false});
    expected = {
      'title': '',
      'description': ''
    };
    expect(result).to.deep.equal(expected);
  });

  it('should instantiate object with all properties when empty options', function() {
    schema = {
      'type': 'object',
      'properties': {
        'title': {
          'type': 'string',
        },
        'description': {
          'type': 'string'
        }
      },
      'required': ['title']
    };
    result = instantiate(schema, {});
    expected = {
      'title': '',
      'description': ''
    };
    expect(result).to.deep.equal(expected);
  });
  it('should instantiate object with an empty array', function () {
    expected = {
      'todos': []
    };
    schema = {
      'title': 'todo',
      'type': 'object',
      'properties': {
        'todos': {
          'type': 'array',
          'items': {
            'type': 'integer'
          }
        }
      },
      'required': ['todos']
    };
    result = instantiate(schema, {});

    expect(result).to.deep.equal(expected);
  });

  it('should instantiate object with an array using minItems', function () {
    expected = {
      'todos': [0,0]
    };
    schema = {
      'title': 'todo',
      'type': 'object',
      'properties': {
        'todos': {
          'type': 'array',
          'items': {
            'type': 'integer'
          },
          'minItems': 2
        }
      },
      'required': ['todos']
    };
    result = instantiate(schema, {});

    expect(result).to.deep.equal(expected);
  });
});
