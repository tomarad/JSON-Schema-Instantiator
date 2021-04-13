# JSON-Schema-Instantiator
A simple tool for instantiating JSON Schemas, with Angular support!

## Installing

### Node.js

```
npm install json-schema-instantiator
```

### AngularJS

```
bower install angular-schema-instantiator
```

## Using

### Node.js
``` javascript
var instantiator = require('json-schema-instantiator');

...

var schema = {
    "type": "object",
    "properties": {
        "title": {
            "type": "string",
            "default": "Example"
        },
        "description": {
            "type": "string"
        },
        "quantity": {
            "type": "number"
        },
        "endDate": {
            "type": "string",
            "format": "date"
        }
    },
    "required": ["title"]
};

instance = instantiator.instantiate(schema);
// instance === { title: "Example", description: "", quantity: 0, endDate: "" }

instance = instantiator.instantiate(schema, {requiredPropertiesOnly: false});
// instance === { title: "Example", description: "", quantity: 0, endDate: "" }

instance = instantiator.instantiate(schema, {requiredPropertiesOnly: true});
// instance === { title: "Example" }

// Override default values for a given type with a static value
instance = instantiator.instantiate(schema, { defaults: { number: 42 } });
// instance === { title: "Example", description: "", quantity: 42, endDate: "" }

// Override default values for a given type function that returns a value
instance = instantiator.instantiate(schema, {
  defaults: {
    // Function that receives current property/val and returns a value
    string: function (val) {
      var format = val.format;

      if (format && format === "date") {
        return new Date(2021, 0, 1);
      }

      return "";
    },
  },
});
// instance === { title: "Example", description: "", quantity: 0, endDate: new Date(2021, 0, 1) }
```

### AngularJS
Add the sources to index.html:

    <script src="json-schema-instanciator/src/instantiator.js"></script>
    <script src="json-schema-instanciator/src/angular-instantiator.js"></script>

Include the module:
``` javascript
angular.module('myApp', ['schemaInstantiator'])

...
```

Inject the InstantiatorService and use it:
``` javascript
...

.controller({
    MyCtrl: ['InstantiatorService', function(Instantiator) {
        var schema = {
            type: "string",
            default: "Hello!"
        };
        
        console.log(Instantiator.instantiate(schema));
        // Hello!
    }]
})

...
```

### Note
This does not replace schema validation! Invalid schemas will yield unexpected results.
