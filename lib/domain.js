var _ = require('underscore');
var pyson = require('tryton-pyson');

function Domain() {}
Domain.instantiate = function (desc) {
  if (desc instanceof Domain) {
    return desc;
  }
  if (_.isArray(desc)) {
    if (_.isArray(desc[0])) {
      if (_.size(desc) === 1) {
        return Domain.instantiate(desc[0]);
      }
      else {
        return new AndDomain(desc);
      }
    }
    else if (_.size(desc) === 1) {
      return Domain.instantiate(desc[0]);
    }
    else if (desc[0] === 'AND') {
      return Domain.instantiate(desc.slice(1));
    }
    else if (desc[0] === 'OR') {
      return new OrDomain(desc.slice(1));
    }
    else {
      return new LeafDomain(desc);
    }
  } else {
     return new LeafDomain(desc);
  }
};
Domain.prototype.resolve = function () {
  _.raise('not implemented');
};
Domain.prototype.or = function (other) {
  return new OrDomain([this, other]);
};
Domain.prototype.and = function (other) {
  return new AndDomain([this, other]);
};

function LeafDomain(f, op, v, k) {
  if (f instanceof pyson) {
    this.pyson = f;
  }
  else if (_.isObject(f) && !_.isUndefined(f['__class__'])) {
    this.pyson = pyson(JSON.stringify(f));
  }
  else if (_.isArray(f)) {
    this.f = f[0];
    this.op = f[1];
    this.v = f[2];
    if (_.size(f) === 4) {
      this.k = f[3];
    }
  }
  else {
    this.f = f;
    this.op = op;
    this.v = v;
    this.k = k;
  }
  if (_.isObject(this.op) && !_.isUndefined(this.op['__class__'])) {
    this.op = pyson(JSON.stringify(this.op));
  }
  if (_.isObject(this.v) && !_.isUndefined(this.v['__class__'])) {
    this.v = pyson(JSON.stringify(this.v));
  }
}
_.inherit(LeafDomain, Domain);
LeafDomain.prototype.operators = {
  '=': function (a, b) {
    return _.isEqual(a, b);
  },
  '!=': function (a, b) {
    return !_.isEqual(a, b);
  },
  '>': function (a, b) {
    return (a > b);
  },
  '<': function (a, b) {
    return (a < b);
  },
  '<=': function (a, b) {
    return (a <= b);
  },
  '>=': function (a, b) {
    return (a >= b);
  },
  'in': function (a, b) {
    return (_.indexOf(b, a) !== -1);
  },
  'not in': function (a, b) {
    return (_.indexOf(b, a) === -1);
  },
  // Those operators are not supported (yet ?)
  'like': function () {
    return true;
  },
  'ilike': function () {
    return true;
  },
  'not like': function () {
    return true;
  },
  'not ilike': function () {
    return true;
  },
  'child_of': function () {
    return true;
  },
  'not child_of': function () {
    return true;
  }
};
LeafDomain.prototype.resolve = function (context, data) {
  if (!_.isUndefined(this.pyson)) {
    // pyson
    var solved = this.pyson.resolve(context);
    var solved_domain = Domain.instantiate(solved);
    if (solved === this.pyson) {
      // No modification, nothing to do
      return solved_domain;
    }
    else {
      return solved_domain.resolve(context, data);
    }
  }
  var unsolvable = false;
  var v = this.v;
  if (v instanceof pyson.Pyson) {
    v = v.resolve(context);
  }
  var op = this.op;
  if (op instanceof pyson.Pyson) {
    op = op.resolve(context);
    if (_.isUndefined(LeafDomain.operators(op))) {
      unsolvable = false;
    }
  }
  var f = data[this.f];
  if (_.isUndefined(f)) {
    f = this.f;
    unsolvable = true;
  }
  if (unsolvable) {
    return new LeafDomain(f, op, v);
  }
  return this.operators[op](f, v);
};

function AOMixin(s) {
  _.assert(s.length >= 2, '<2 statements');
  this.s = _.map(s, (st) => {
    return Domain.instantiate(st);
  });
}
_.inherit(AOMixin, Domain);

function AndDomain(desc) {
  AOMixin.call(this, desc);
}
_.inherit(AndDomain, AOMixin);
AndDomain.prototype.resolve = function (context, data) {
  var failed = _.map(this.s, (st) => {
      return st.resolve(context, data);
    })
    .filter((x) => {
      return (x !== true);
    });
  if (_.size(failed) === 0) {
    return true;
  }
  var remaining = _.filter(failed, (st) => {
    return (st !== false);
  });
  if (_.size(failed) !== _.size(remaining)) {
    return false;
  }
  if (_.size(remaining) === 1) {
    return Domain.instantiate(remaining);
  }
  return new AndDomain(remaining);
};

function OrDomain(desc) {
  AOMixin.call(this, desc);
}
_.inherit(OrDomain, AOMixin);
OrDomain.prototype.resolve = function (context, data) {
  var failed = _.map(this.s, (st) => {
      return st.resolve(context, data);
    })
    .filter((x) => {
      return (x !== true);
    });
  if (_.size(failed) !== _.size(this.s)) {
    return true;
  }
  var remaining = _.filter(failed, (st) => {
    return (st !== false);
  });
  if (_.size(remaining) === 0) {
    return false;
  }
  if (_.size(remaining) === 1) {
    return Domain.instantiate(remaining);
  }
  return new OrDomain(remaining);
};
//
// exports
module.exports = Domain;
