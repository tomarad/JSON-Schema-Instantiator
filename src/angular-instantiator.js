'use strict';

angular.module('schemaInstantiator', [])

  .service('InstantiatorService', function InstantiatorService() {
    this.instantiate = instantiate;
  });
