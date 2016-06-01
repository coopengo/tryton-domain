/* jshint -W069 */
var _ = require('underscore');
var checkLeaf = function (target) {
  return function (vals) {
    var res = true;
    _.each(_.keys(target), (k) => {
      if (target[k] !== vals[k]) {
        res = false;
      }
    });
    return res;
  };
};
exports.simple = [{
  p: ['name', '=', 'Foo'],
  c: null,
  d: {
    name: 'Foo'
  },
  r: true
}, {
  p: ['name', '=', 'Foo'],
  c: null,
  d: {
    name: 'Not Foo'
  },
  r: false
}, {
  p: ['name', '=', 'Foo'],
  c: null,
  d: {},
  r: checkLeaf({
    f: 'name',
    op: '=',
    v: 'Foo'
  })
}];
exports.and = [{
  p: [
    ['name', '=', 'Foo'],
    ['code', '=', 'bar']
  ],
  c: null,
  d: {
    name: 'Foo',
    code: 'bar'
  },
  r: true
}, {
  p: [
    ['name', '=', 'Foo'],
    ['code', '=', 'bar']
  ],
  c: null,
  d: {
    name: 'not Foo',
    code: 'bar'
  },
  r: false
}, {
  p: [
    ['name', '=', 'Foo'],
    ['code', '=', 'bar']
  ],
  c: null,
  d: {
    name: 'Foo',
    code: 'not bar'
  },
  r: false
}, {
  p: ['AND', ['name', '=', 'Foo'],
    ['code', '=', 'bar']
  ],
  c: null,
  d: {
    name: 'not Foo',
    code: 'bar'
  },
  r: false
}, {
  p: ['AND', ['name', '=', 'Foo'],
    ['code', '=', 'bar']
  ],
  c: null,
  d: {
    code: 'bar'
  },
  r: checkLeaf({
    f: 'name',
    op: '=',
    v: 'Foo'
  })
}];
exports.or = [{
  p: ['OR', ['name', '=', 'Foo'],
    ['code', '=', 'bar']
  ],
  c: null,
  d: {
    name: 'Foo',
    code: 'bar'
  },
  r: true
}, {
  p: ['OR', ['name', '=', 'Foo'],
    ['code', '=', 'bar']
  ],
  c: null,
  d: {
    name: 'not Foo',
    code: 'bar'
  },
  r: true
}, {
  p: ['OR', ['name', '=', 'Foo'],
    ['code', '=', 'bar']
  ],
  c: null,
  d: {
    name: 'Foo',
    code: 'not bar'
  },
  r: true
}, {
  p: ['OR', ['name', '=', 'Foo'],
    ['code', '=', 'bar']
  ],
  c: null,
  d: {
    name: 'not Foo',
    code: 'not bar'
  },
  r: false
}, {
  p: ['OR', ['name', '=', 'Foo'],
    ['code', '=', 'bar']
  ],
  c: null,
  d: {
    name: 'not Foo'
  },
  r: checkLeaf({
    f: 'code',
    op: '=',
    v: 'bar',
    k: undefined
  })
}];
var complex_domain = [
  ['name', '=', 'Foo'], {
    __class__: 'If',
    c: {
      __class__: 'Equal',
      s1: {
        __class__: 'Eval',
        v: 'code',
        d: 'foo'
      },
      s2: 'honey'
    },
    t: ['id', '=', 10],
    e: ['id', '=', 20]
  }
];
exports.pyson = [{
  p: ['name', '=', {
    __class__: 'Eval',
    v: 'code'
  }],
  c: {
    'code': 'foo'
  },
  d: {},
  r: checkLeaf({
    f: 'name',
    op: '=',
    v: 'foo'
  })
}, {
  p: complex_domain,
  c: {
    'code': 'honey'
  },
  d: {
    name: 'Foo'
  },
  r: checkLeaf({
    f: 'id',
    op: '=',
    v: 10
  }),
}, {
  p: complex_domain,
  c: {},
  d: {
    name: 'Foo'
  },
  r: checkLeaf({
    f: 'id',
    op: '=',
    v: 20
  })
}, {
  p: complex_domain,
  c: {},
  d: {},
  r: function (vals) {
    if (vals.constructor.name !== 'AndDomain') {
      return false;
    }
    if (!checkLeaf({
        f: 'name',
        op: '=',
        v: 'Foo'
      })(vals.s[0])) {
      return false;
    }
    if (!checkLeaf({
        f: 'id',
        op: '=',
        v: 20
      })(vals.s[1])) {
      return false;
    }
    return true;
  }
}];
