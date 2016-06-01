var _ = require('underscore');
var Domain = require('..');
require('should');
var data = require('./.data');

function resolve(p, c, d) {
  return Domain(JSON.stringify(p))
    .resolve(c, d);
}

function make(ts) {
  _.each(ts, (t) => {
    if (t.r === Error) {
      var crash = false;
      try {
        resolve(t.p, t.c, t.d);
      }
      catch (e) {
        crash = true;
      }
      finally {
        crash.should.equal(true);
      }
    }
    else if (_.isFunction(t.r)) {
      t.r(resolve(t.p, t.c, t.d)).should.equal(true);
    }
    else {
      t.r.should.equal(resolve(t.p, t.c, t.d));
    }
  });
}
describe('Domain', () => {
  _.each(data, (v, k) => {
    it('checks ' + k, () => make(v));
  });
});
