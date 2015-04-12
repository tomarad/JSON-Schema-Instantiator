# JSON-Schema-Instantiator

## How to use
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
},
    instance = instantiator.instantiate(schema);
    
    // instance === { title: "Example" }
```
