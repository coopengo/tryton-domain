var _ = require('underscore');
var moment = require('moment');
require('tryton-base')(_, moment);
var Domain = require('./domain.js');
//
function create(desc) {
  return Domain.instantiate(JSON.parse(desc));
}
//
// exports
module.exports = create;
