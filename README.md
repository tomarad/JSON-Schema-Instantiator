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
        }
    }
},  instance = instantiator.instantiate(schema);
    
    // instance === { title: "Example" }
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

