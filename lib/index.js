var _ = require('underscore');
require('tryton-base')(_);
var Domain = require('./domain.js');
//
function create(desc) {
  return Domain.instantiate(JSON.parse(desc));
}
//
// exports
module.exports = create;
