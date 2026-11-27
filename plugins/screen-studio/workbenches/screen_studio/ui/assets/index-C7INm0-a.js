(function () {
  const t = document.createElement("link").relList;
  if (t && t.supports && t.supports("modulepreload")) return;
  for (const l of document.querySelectorAll('link[rel="modulepreload"]')) r(l);
  new MutationObserver((l) => {
    for (const o of l)
      if (o.type === "childList")
        for (const i of o.addedNodes)
          i.tagName === "LINK" && i.rel === "modulepreload" && r(i);
  }).observe(document, { childList: !0, subtree: !0 });
  function n(l) {
    const o = {};
    return (
      l.integrity && (o.integrity = l.integrity),
      l.referrerPolicy && (o.referrerPolicy = l.referrerPolicy),
      l.crossOrigin === "use-credentials"
        ? (o.credentials = "include")
        : l.crossOrigin === "anonymous"
          ? (o.credentials = "omit")
          : (o.credentials = "same-origin"),
      o
    );
  }
  function r(l) {
    if (l.ep) return;
    l.ep = !0;
    const o = n(l);
    fetch(l.href, o);
  }
})();
function Ud(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default")
    ? e.default
    : e;
}
var iu = { exports: {} },
  eo = {},
  su = { exports: {} },
  Q = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var Yr = Symbol.for("react.element"),
  Vd = Symbol.for("react.portal"),
  Hd = Symbol.for("react.fragment"),
  Wd = Symbol.for("react.strict_mode"),
  Bd = Symbol.for("react.profiler"),
  Xd = Symbol.for("react.provider"),
  Yd = Symbol.for("react.context"),
  Qd = Symbol.for("react.forward_ref"),
  Kd = Symbol.for("react.suspense"),
  Gd = Symbol.for("react.memo"),
  Zd = Symbol.for("react.lazy"),
  Bs = Symbol.iterator;
function Jd(e) {
  return e === null || typeof e != "object"
    ? null
    : ((e = (Bs && e[Bs]) || e["@@iterator"]),
      typeof e == "function" ? e : null);
}
var au = {
    isMounted: function () {
      return !1;
    },
    enqueueForceUpdate: function () {},
    enqueueReplaceState: function () {},
    enqueueSetState: function () {},
  },
  uu = Object.assign,
  cu = {};
function lr(e, t, n) {
  ((this.props = e),
    (this.context = t),
    (this.refs = cu),
    (this.updater = n || au));
}
lr.prototype.isReactComponent = {};
lr.prototype.setState = function (e, t) {
  if (typeof e != "object" && typeof e != "function" && e != null)
    throw Error(
      "setState(...): takes an object of state variables to update or a function which returns an object of state variables.",
    );
  this.updater.enqueueSetState(this, e, t, "setState");
};
lr.prototype.forceUpdate = function (e) {
  this.updater.enqueueForceUpdate(this, e, "forceUpdate");
};
function du() {}
du.prototype = lr.prototype;
function Vi(e, t, n) {
  ((this.props = e),
    (this.context = t),
    (this.refs = cu),
    (this.updater = n || au));
}
var Hi = (Vi.prototype = new du());
Hi.constructor = Vi;
uu(Hi, lr.prototype);
Hi.isPureReactComponent = !0;
var Xs = Array.isArray,
  fu = Object.prototype.hasOwnProperty,
  Wi = { current: null },
  pu = { key: !0, ref: !0, __self: !0, __source: !0 };
function mu(e, t, n) {
  var r,
    l = {},
    o = null,
    i = null;
  if (t != null)
    for (r in (t.ref !== void 0 && (i = t.ref),
    t.key !== void 0 && (o = "" + t.key),
    t))
      fu.call(t, r) && !pu.hasOwnProperty(r) && (l[r] = t[r]);
  var u = arguments.length - 2;
  if (u === 1) l.children = n;
  else if (1 < u) {
    for (var s = Array(u), d = 0; d < u; d++) s[d] = arguments[d + 2];
    l.children = s;
  }
  if (e && e.defaultProps)
    for (r in ((u = e.defaultProps), u)) l[r] === void 0 && (l[r] = u[r]);
  return {
    $$typeof: Yr,
    type: e,
    key: o,
    ref: i,
    props: l,
    _owner: Wi.current,
  };
}
function qd(e, t) {
  return {
    $$typeof: Yr,
    type: e.type,
    key: t,
    ref: e.ref,
    props: e.props,
    _owner: e._owner,
  };
}
function Bi(e) {
  return typeof e == "object" && e !== null && e.$$typeof === Yr;
}
function ef(e) {
  var t = { "=": "=0", ":": "=2" };
  return (
    "$" +
    e.replace(/[=:]/g, function (n) {
      return t[n];
    })
  );
}
var Ys = /\/+/g;
function wo(e, t) {
  return typeof e == "object" && e !== null && e.key != null
    ? ef("" + e.key)
    : t.toString(36);
}
function vl(e, t, n, r, l) {
  var o = typeof e;
  (o === "undefined" || o === "boolean") && (e = null);
  var i = !1;
  if (e === null) i = !0;
  else
    switch (o) {
      case "string":
      case "number":
        i = !0;
        break;
      case "object":
        switch (e.$$typeof) {
          case Yr:
          case Vd:
            i = !0;
        }
    }
  if (i)
    return (
      (i = e),
      (l = l(i)),
      (e = r === "" ? "." + wo(i, 0) : r),
      Xs(l)
        ? ((n = ""),
          e != null && (n = e.replace(Ys, "$&/") + "/"),
          vl(l, t, n, "", function (d) {
            return d;
          }))
        : l != null &&
          (Bi(l) &&
            (l = qd(
              l,
              n +
                (!l.key || (i && i.key === l.key)
                  ? ""
                  : ("" + l.key).replace(Ys, "$&/") + "/") +
                e,
            )),
          t.push(l)),
      1
    );
  if (((i = 0), (r = r === "" ? "." : r + ":"), Xs(e)))
    for (var u = 0; u < e.length; u++) {
      o = e[u];
      var s = r + wo(o, u);
      i += vl(o, t, n, s, l);
    }
  else if (((s = Jd(e)), typeof s == "function"))
    for (e = s.call(e), u = 0; !(o = e.next()).done;)
      ((o = o.value), (s = r + wo(o, u++)), (i += vl(o, t, n, s, l)));
  else if (o === "object")
    throw (
      (t = String(e)),
      Error(
        "Objects are not valid as a React child (found: " +
          (t === "[object Object]"
            ? "object with keys {" + Object.keys(e).join(", ") + "}"
            : t) +
          "). If you meant to render a collection of children, use an array instead.",
      )
    );
  return i;
}
function tl(e, t, n) {
  if (e == null) return e;
  var r = [],
    l = 0;
  return (
    vl(e, r, "", "", function (o) {
      return t.call(n, o, l++);
    }),
    r
  );
}
function tf(e) {
  if (e._status === -1) {
    var t = e._result;
    ((t = t()),
      t.then(
        function (n) {
          (e._status === 0 || e._status === -1) &&
            ((e._status = 1), (e._result = n));
        },
        function (n) {
          (e._status === 0 || e._status === -1) &&
            ((e._status = 2), (e._result = n));
        },
      ),
      e._status === -1 && ((e._status = 0), (e._result = t)));
  }
  if (e._status === 1) return e._result.default;
  throw e._result;
}
var Ue = { current: null },
  xl = { transition: null },
  nf = {
    ReactCurrentDispatcher: Ue,
    ReactCurrentBatchConfig: xl,
    ReactCurrentOwner: Wi,
  };
function hu() {
  throw Error("act(...) is not supported in production builds of React.");
}
Q.Children = {
  map: tl,
  forEach: function (e, t, n) {
    tl(
      e,
      function () {
        t.apply(this, arguments);
      },
      n,
    );
  },
  count: function (e) {
    var t = 0;
    return (
      tl(e, function () {
        t++;
      }),
      t
    );
  },
  toArray: function (e) {
    return (
      tl(e, function (t) {
        return t;
      }) || []
    );
  },
  only: function (e) {
    if (!Bi(e))
      throw Error(
        "React.Children.only expected to receive a single React element child.",
      );
    return e;
  },
};
Q.Component = lr;
Q.Fragment = Hd;
Q.Profiler = Bd;
Q.PureComponent = Vi;
Q.StrictMode = Wd;
Q.Suspense = Kd;
Q.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = nf;
Q.act = hu;
Q.cloneElement = function (e, t, n) {
  if (e == null)
    throw Error(
      "React.cloneElement(...): The argument must be a React element, but you passed " +
        e +
        ".",
    );
  var r = uu({}, e.props),
    l = e.key,
    o = e.ref,
    i = e._owner;
  if (t != null) {
    if (
      (t.ref !== void 0 && ((o = t.ref), (i = Wi.current)),
      t.key !== void 0 && (l = "" + t.key),
      e.type && e.type.defaultProps)
    )
      var u = e.type.defaultProps;
    for (s in t)
      fu.call(t, s) &&
        !pu.hasOwnProperty(s) &&
        (r[s] = t[s] === void 0 && u !== void 0 ? u[s] : t[s]);
  }
  var s = arguments.length - 2;
  if (s === 1) r.children = n;
  else if (1 < s) {
    u = Array(s);
    for (var d = 0; d < s; d++) u[d] = arguments[d + 2];
    r.children = u;
  }
  return { $$typeof: Yr, type: e.type, key: l, ref: o, props: r, _owner: i };
};
Q.createContext = function (e) {
  return (
    (e = {
      $$typeof: Yd,
      _currentValue: e,
      _currentValue2: e,
      _threadCount: 0,
      Provider: null,
      Consumer: null,
      _defaultValue: null,
      _globalName: null,
    }),
    (e.Provider = { $$typeof: Xd, _context: e }),
    (e.Consumer = e)
  );
};
Q.createElement = mu;
Q.createFactory = function (e) {
  var t = mu.bind(null, e);
  return ((t.type = e), t);
};
Q.createRef = function () {
  return { current: null };
};
Q.forwardRef = function (e) {
  return { $$typeof: Qd, render: e };
};
Q.isValidElement = Bi;
Q.lazy = function (e) {
  return { $$typeof: Zd, _payload: { _status: -1, _result: e }, _init: tf };
};
Q.memo = function (e, t) {
  return { $$typeof: Gd, type: e, compare: t === void 0 ? null : t };
};
Q.startTransition = function (e) {
  var t = xl.transition;
  xl.transition = {};
  try {
    e();
  } finally {
    xl.transition = t;
  }
};
Q.unstable_act = hu;
Q.useCallback = function (e, t) {
  return Ue.current.useCallback(e, t);
};
Q.useContext = function (e) {
  return Ue.current.useContext(e);
};
Q.useDebugValue = function () {};
Q.useDeferredValue = function (e) {
  return Ue.current.useDeferredValue(e);
};
Q.useEffect = function (e, t) {
  return Ue.current.useEffect(e, t);
};
Q.useId = function () {
  return Ue.current.useId();
};
Q.useImperativeHandle = function (e, t, n) {
  return Ue.current.useImperativeHandle(e, t, n);
};
Q.useInsertionEffect = function (e, t) {
  return Ue.current.useInsertionEffect(e, t);
};
Q.useLayoutEffect = function (e, t) {
  return Ue.current.useLayoutEffect(e, t);
};
Q.useMemo = function (e, t) {
  return Ue.current.useMemo(e, t);
};
Q.useReducer = function (e, t, n) {
  return Ue.current.useReducer(e, t, n);
};
Q.useRef = function (e) {
  return Ue.current.useRef(e);
};
Q.useState = function (e) {
  return Ue.current.useState(e);
};
Q.useSyncExternalStore = function (e, t, n) {
  return Ue.current.useSyncExternalStore(e, t, n);
};
Q.useTransition = function () {
  return Ue.current.useTransition();
};
Q.version = "18.3.1";
su.exports = Q;
var Gt = su.exports;
const N = Ud(Gt);
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var rf = Gt,
  lf = Symbol.for("react.element"),
  of = Symbol.for("react.fragment"),
  sf = Object.prototype.hasOwnProperty,
  af = rf.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,
  uf = { key: !0, ref: !0, __self: !0, __source: !0 };
function gu(e, t, n) {
  var r,
    l = {},
    o = null,
    i = null;
  (n !== void 0 && (o = "" + n),
    t.key !== void 0 && (o = "" + t.key),
    t.ref !== void 0 && (i = t.ref));
  for (r in t) sf.call(t, r) && !uf.hasOwnProperty(r) && (l[r] = t[r]);
  if (e && e.defaultProps)
    for (r in ((t = e.defaultProps), t)) l[r] === void 0 && (l[r] = t[r]);
  return {
    $$typeof: lf,
    type: e,
    key: o,
    ref: i,
    props: l,
    _owner: af.current,
  };
}
eo.Fragment = of;
eo.jsx = gu;
eo.jsxs = gu;
iu.exports = eo;
var a = iu.exports,
  Xo = {},
  yu = { exports: {} },
  tt = {},
  vu = { exports: {} },
  xu = {};
/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ (function (e) {
  function t(E, D) {
    var I = E.length;
    E.push(D);
    e: for (; 0 < I;) {
      var k = (I - 1) >>> 1,
        L = E[k];
      if (0 < l(L, D)) ((E[k] = D), (E[I] = L), (I = k));
      else break e;
    }
  }
  function n(E) {
    return E.length === 0 ? null : E[0];
  }
  function r(E) {
    if (E.length === 0) return null;
    var D = E[0],
      I = E.pop();
    if (I !== D) {
      E[0] = I;
      e: for (var k = 0, L = E.length, te = L >>> 1; k < te;) {
        var re = 2 * (k + 1) - 1,
          We = E[re],
          xe = re + 1,
          Fe = E[xe];
        if (0 > l(We, I))
          xe < L && 0 > l(Fe, We)
            ? ((E[k] = Fe), (E[xe] = I), (k = xe))
            : ((E[k] = We), (E[re] = I), (k = re));
        else if (xe < L && 0 > l(Fe, I)) ((E[k] = Fe), (E[xe] = I), (k = xe));
        else break e;
      }
    }
    return D;
  }
  function l(E, D) {
    var I = E.sortIndex - D.sortIndex;
    return I !== 0 ? I : E.id - D.id;
  }
  if (typeof performance == "object" && typeof performance.now == "function") {
    var o = performance;
    e.unstable_now = function () {
      return o.now();
    };
  } else {
    var i = Date,
      u = i.now();
    e.unstable_now = function () {
      return i.now() - u;
    };
  }
  var s = [],
    d = [],
    m = 1,
    g = null,
    h = 3,
    v = !1,
    w = !1,
    x = !1,
    F = typeof setTimeout == "function" ? setTimeout : null,
    f = typeof clearTimeout == "function" ? clearTimeout : null,
    c = typeof setImmediate < "u" ? setImmediate : null;
  typeof navigator < "u" &&
    navigator.scheduling !== void 0 &&
    navigator.scheduling.isInputPending !== void 0 &&
    navigator.scheduling.isInputPending.bind(navigator.scheduling);
  function p(E) {
    for (var D = n(d); D !== null;) {
      if (D.callback === null) r(d);
      else if (D.startTime <= E)
        (r(d), (D.sortIndex = D.expirationTime), t(s, D));
      else break;
      D = n(d);
    }
  }
  function y(E) {
    if (((x = !1), p(E), !w))
      if (n(s) !== null) ((w = !0), P(S));
      else {
        var D = n(d);
        D !== null && B(y, D.startTime - E);
      }
  }
  function S(E, D) {
    ((w = !1), x && ((x = !1), f(j), (j = -1)), (v = !0));
    var I = h;
    try {
      for (
        p(D), g = n(s);
        g !== null && (!(g.expirationTime > D) || (E && !A()));
      ) {
        var k = g.callback;
        if (typeof k == "function") {
          ((g.callback = null), (h = g.priorityLevel));
          var L = k(g.expirationTime <= D);
          ((D = e.unstable_now()),
            typeof L == "function" ? (g.callback = L) : g === n(s) && r(s),
            p(D));
        } else r(s);
        g = n(s);
      }
      if (g !== null) var te = !0;
      else {
        var re = n(d);
        (re !== null && B(y, re.startTime - D), (te = !1));
      }
      return te;
    } finally {
      ((g = null), (h = I), (v = !1));
    }
  }
  var _ = !1,
    T = null,
    j = -1,
    U = 5,
    b = -1;
  function A() {
    return !(e.unstable_now() - b < U);
  }
  function J() {
    if (T !== null) {
      var E = e.unstable_now();
      b = E;
      var D = !0;
      try {
        D = T(!0, E);
      } finally {
        D ? X() : ((_ = !1), (T = null));
      }
    } else _ = !1;
  }
  var X;
  if (typeof c == "function")
    X = function () {
      c(J);
    };
  else if (typeof MessageChannel < "u") {
    var ce = new MessageChannel(),
      He = ce.port2;
    ((ce.port1.onmessage = J),
      (X = function () {
        He.postMessage(null);
      }));
  } else
    X = function () {
      F(J, 0);
    };
  function P(E) {
    ((T = E), _ || ((_ = !0), X()));
  }
  function B(E, D) {
    j = F(function () {
      E(e.unstable_now());
    }, D);
  }
  ((e.unstable_IdlePriority = 5),
    (e.unstable_ImmediatePriority = 1),
    (e.unstable_LowPriority = 4),
    (e.unstable_NormalPriority = 3),
    (e.unstable_Profiling = null),
    (e.unstable_UserBlockingPriority = 2),
    (e.unstable_cancelCallback = function (E) {
      E.callback = null;
    }),
    (e.unstable_continueExecution = function () {
      w || v || ((w = !0), P(S));
    }),
    (e.unstable_forceFrameRate = function (E) {
      0 > E || 125 < E
        ? console.error(
            "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported",
          )
        : (U = 0 < E ? Math.floor(1e3 / E) : 5);
    }),
    (e.unstable_getCurrentPriorityLevel = function () {
      return h;
    }),
    (e.unstable_getFirstCallbackNode = function () {
      return n(s);
    }),
    (e.unstable_next = function (E) {
      switch (h) {
        case 1:
        case 2:
        case 3:
          var D = 3;
          break;
        default:
          D = h;
      }
      var I = h;
      h = D;
      try {
        return E();
      } finally {
        h = I;
      }
    }),
    (e.unstable_pauseExecution = function () {}),
    (e.unstable_requestPaint = function () {}),
    (e.unstable_runWithPriority = function (E, D) {
      switch (E) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          E = 3;
      }
      var I = h;
      h = E;
      try {
        return D();
      } finally {
        h = I;
      }
    }),
    (e.unstable_scheduleCallback = function (E, D, I) {
      var k = e.unstable_now();
      switch (
        (typeof I == "object" && I !== null
          ? ((I = I.delay), (I = typeof I == "number" && 0 < I ? k + I : k))
          : (I = k),
        E)
      ) {
        case 1:
          var L = -1;
          break;
        case 2:
          L = 250;
          break;
        case 5:
          L = 1073741823;
          break;
        case 4:
          L = 1e4;
          break;
        default:
          L = 5e3;
      }
      return (
        (L = I + L),
        (E = {
          id: m++,
          callback: D,
          priorityLevel: E,
          startTime: I,
          expirationTime: L,
          sortIndex: -1,
        }),
        I > k
          ? ((E.sortIndex = I),
            t(d, E),
            n(s) === null &&
              E === n(d) &&
              (x ? (f(j), (j = -1)) : (x = !0), B(y, I - k)))
          : ((E.sortIndex = L), t(s, E), w || v || ((w = !0), P(S))),
        E
      );
    }),
    (e.unstable_shouldYield = A),
    (e.unstable_wrapCallback = function (E) {
      var D = h;
      return function () {
        var I = h;
        h = D;
        try {
          return E.apply(this, arguments);
        } finally {
          h = I;
        }
      };
    }));
})(xu);
vu.exports = xu;
var cf = vu.exports;
/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var df = Gt,
  et = cf;
function C(e) {
  for (
    var t = "https://reactjs.org/docs/error-decoder.html?invariant=" + e, n = 1;
    n < arguments.length;
    n++
  )
    t += "&args[]=" + encodeURIComponent(arguments[n]);
  return (
    "Minified React error #" +
    e +
    "; visit " +
    t +
    " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
  );
}
var wu = new Set(),
  Tr = {};
function Cn(e, t) {
  (Zn(e, t), Zn(e + "Capture", t));
}
function Zn(e, t) {
  for (Tr[e] = t, e = 0; e < t.length; e++) wu.add(t[e]);
}
var Lt = !(
    typeof window > "u" ||
    typeof window.document > "u" ||
    typeof window.document.createElement > "u"
  ),
  Yo = Object.prototype.hasOwnProperty,
  ff =
    /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,
  Qs = {},
  Ks = {};
function pf(e) {
  return Yo.call(Ks, e)
    ? !0
    : Yo.call(Qs, e)
      ? !1
      : ff.test(e)
        ? (Ks[e] = !0)
        : ((Qs[e] = !0), !1);
}
function mf(e, t, n, r) {
  if (n !== null && n.type === 0) return !1;
  switch (typeof t) {
    case "function":
    case "symbol":
      return !0;
    case "boolean":
      return r
        ? !1
        : n !== null
          ? !n.acceptsBooleans
          : ((e = e.toLowerCase().slice(0, 5)), e !== "data-" && e !== "aria-");
    default:
      return !1;
  }
}
function hf(e, t, n, r) {
  if (t === null || typeof t > "u" || mf(e, t, n, r)) return !0;
  if (r) return !1;
  if (n !== null)
    switch (n.type) {
      case 3:
        return !t;
      case 4:
        return t === !1;
      case 5:
        return isNaN(t);
      case 6:
        return isNaN(t) || 1 > t;
    }
  return !1;
}
function Ve(e, t, n, r, l, o, i) {
  ((this.acceptsBooleans = t === 2 || t === 3 || t === 4),
    (this.attributeName = r),
    (this.attributeNamespace = l),
    (this.mustUseProperty = n),
    (this.propertyName = e),
    (this.type = t),
    (this.sanitizeURL = o),
    (this.removeEmptyString = i));
}
var be = {};
"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style"
  .split(" ")
  .forEach(function (e) {
    be[e] = new Ve(e, 0, !1, e, null, !1, !1);
  });
[
  ["acceptCharset", "accept-charset"],
  ["className", "class"],
  ["htmlFor", "for"],
  ["httpEquiv", "http-equiv"],
].forEach(function (e) {
  var t = e[0];
  be[t] = new Ve(t, 1, !1, e[1], null, !1, !1);
});
["contentEditable", "draggable", "spellCheck", "value"].forEach(function (e) {
  be[e] = new Ve(e, 2, !1, e.toLowerCase(), null, !1, !1);
});
[
  "autoReverse",
  "externalResourcesRequired",
  "focusable",
  "preserveAlpha",
].forEach(function (e) {
  be[e] = new Ve(e, 2, !1, e, null, !1, !1);
});
"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope"
  .split(" ")
  .forEach(function (e) {
    be[e] = new Ve(e, 3, !1, e.toLowerCase(), null, !1, !1);
  });
["checked", "multiple", "muted", "selected"].forEach(function (e) {
  be[e] = new Ve(e, 3, !0, e, null, !1, !1);
});
["capture", "download"].forEach(function (e) {
  be[e] = new Ve(e, 4, !1, e, null, !1, !1);
});
["cols", "rows", "size", "span"].forEach(function (e) {
  be[e] = new Ve(e, 6, !1, e, null, !1, !1);
});
["rowSpan", "start"].forEach(function (e) {
  be[e] = new Ve(e, 5, !1, e.toLowerCase(), null, !1, !1);
});
var Xi = /[\-:]([a-z])/g;
function Yi(e) {
  return e[1].toUpperCase();
}
"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height"
  .split(" ")
  .forEach(function (e) {
    var t = e.replace(Xi, Yi);
    be[t] = new Ve(t, 1, !1, e, null, !1, !1);
  });
"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type"
  .split(" ")
  .forEach(function (e) {
    var t = e.replace(Xi, Yi);
    be[t] = new Ve(t, 1, !1, e, "http://www.w3.org/1999/xlink", !1, !1);
  });
["xml:base", "xml:lang", "xml:space"].forEach(function (e) {
  var t = e.replace(Xi, Yi);
  be[t] = new Ve(t, 1, !1, e, "http://www.w3.org/XML/1998/namespace", !1, !1);
});
["tabIndex", "crossOrigin"].forEach(function (e) {
  be[e] = new Ve(e, 1, !1, e.toLowerCase(), null, !1, !1);
});
be.xlinkHref = new Ve(
  "xlinkHref",
  1,
  !1,
  "xlink:href",
  "http://www.w3.org/1999/xlink",
  !0,
  !1,
);
["src", "href", "action", "formAction"].forEach(function (e) {
  be[e] = new Ve(e, 1, !1, e.toLowerCase(), null, !0, !0);
});
function Qi(e, t, n, r) {
  var l = be.hasOwnProperty(t) ? be[t] : null;
  (l !== null
    ? l.type !== 0
    : r ||
      !(2 < t.length) ||
      (t[0] !== "o" && t[0] !== "O") ||
      (t[1] !== "n" && t[1] !== "N")) &&
    (hf(t, n, l, r) && (n = null),
    r || l === null
      ? pf(t) && (n === null ? e.removeAttribute(t) : e.setAttribute(t, "" + n))
      : l.mustUseProperty
        ? (e[l.propertyName] = n === null ? (l.type === 3 ? !1 : "") : n)
        : ((t = l.attributeName),
          (r = l.attributeNamespace),
          n === null
            ? e.removeAttribute(t)
            : ((l = l.type),
              (n = l === 3 || (l === 4 && n === !0) ? "" : "" + n),
              r ? e.setAttributeNS(r, t, n) : e.setAttribute(t, n))));
}
var Ot = df.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
  nl = Symbol.for("react.element"),
  Rn = Symbol.for("react.portal"),
  Ln = Symbol.for("react.fragment"),
  Ki = Symbol.for("react.strict_mode"),
  Qo = Symbol.for("react.profiler"),
  ku = Symbol.for("react.provider"),
  Su = Symbol.for("react.context"),
  Gi = Symbol.for("react.forward_ref"),
  Ko = Symbol.for("react.suspense"),
  Go = Symbol.for("react.suspense_list"),
  Zi = Symbol.for("react.memo"),
  Wt = Symbol.for("react.lazy"),
  Nu = Symbol.for("react.offscreen"),
  Gs = Symbol.iterator;
function ur(e) {
  return e === null || typeof e != "object"
    ? null
    : ((e = (Gs && e[Gs]) || e["@@iterator"]),
      typeof e == "function" ? e : null);
}
var pe = Object.assign,
  ko;
function yr(e) {
  if (ko === void 0)
    try {
      throw Error();
    } catch (n) {
      var t = n.stack.trim().match(/\n( *(at )?)/);
      ko = (t && t[1]) || "";
    }
  return (
    `
` +
    ko +
    e
  );
}
var So = !1;
function No(e, t) {
  if (!e || So) return "";
  So = !0;
  var n = Error.prepareStackTrace;
  Error.prepareStackTrace = void 0;
  try {
    if (t)
      if (
        ((t = function () {
          throw Error();
        }),
        Object.defineProperty(t.prototype, "props", {
          set: function () {
            throw Error();
          },
        }),
        typeof Reflect == "object" && Reflect.construct)
      ) {
        try {
          Reflect.construct(t, []);
        } catch (d) {
          var r = d;
        }
        Reflect.construct(e, [], t);
      } else {
        try {
          t.call();
        } catch (d) {
          r = d;
        }
        e.call(t.prototype);
      }
    else {
      try {
        throw Error();
      } catch (d) {
        r = d;
      }
      e();
    }
  } catch (d) {
    if (d && r && typeof d.stack == "string") {
      for (
        var l = d.stack.split(`
`),
          o = r.stack.split(`
`),
          i = l.length - 1,
          u = o.length - 1;
        1 <= i && 0 <= u && l[i] !== o[u];
      )
        u--;
      for (; 1 <= i && 0 <= u; i--, u--)
        if (l[i] !== o[u]) {
          if (i !== 1 || u !== 1)
            do
              if ((i--, u--, 0 > u || l[i] !== o[u])) {
                var s =
                  `
` + l[i].replace(" at new ", " at ");
                return (
                  e.displayName &&
                    s.includes("<anonymous>") &&
                    (s = s.replace("<anonymous>", e.displayName)),
                  s
                );
              }
            while (1 <= i && 0 <= u);
          break;
        }
    }
  } finally {
    ((So = !1), (Error.prepareStackTrace = n));
  }
  return (e = e ? e.displayName || e.name : "") ? yr(e) : "";
}
function gf(e) {
  switch (e.tag) {
    case 5:
      return yr(e.type);
    case 16:
      return yr("Lazy");
    case 13:
      return yr("Suspense");
    case 19:
      return yr("SuspenseList");
    case 0:
    case 2:
    case 15:
      return ((e = No(e.type, !1)), e);
    case 11:
      return ((e = No(e.type.render, !1)), e);
    case 1:
      return ((e = No(e.type, !0)), e);
    default:
      return "";
  }
}
function Zo(e) {
  if (e == null) return null;
  if (typeof e == "function") return e.displayName || e.name || null;
  if (typeof e == "string") return e;
  switch (e) {
    case Ln:
      return "Fragment";
    case Rn:
      return "Portal";
    case Qo:
      return "Profiler";
    case Ki:
      return "StrictMode";
    case Ko:
      return "Suspense";
    case Go:
      return "SuspenseList";
  }
  if (typeof e == "object")
    switch (e.$$typeof) {
      case Su:
        return (e.displayName || "Context") + ".Consumer";
      case ku:
        return (e._context.displayName || "Context") + ".Provider";
      case Gi:
        var t = e.render;
        return (
          (e = e.displayName),
          e ||
            ((e = t.displayName || t.name || ""),
            (e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef")),
          e
        );
      case Zi:
        return (
          (t = e.displayName || null),
          t !== null ? t : Zo(e.type) || "Memo"
        );
      case Wt:
        ((t = e._payload), (e = e._init));
        try {
          return Zo(e(t));
        } catch {}
    }
  return null;
}
function yf(e) {
  var t = e.type;
  switch (e.tag) {
    case 24:
      return "Cache";
    case 9:
      return (t.displayName || "Context") + ".Consumer";
    case 10:
      return (t._context.displayName || "Context") + ".Provider";
    case 18:
      return "DehydratedFragment";
    case 11:
      return (
        (e = t.render),
        (e = e.displayName || e.name || ""),
        t.displayName || (e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef")
      );
    case 7:
      return "Fragment";
    case 5:
      return t;
    case 4:
      return "Portal";
    case 3:
      return "Root";
    case 6:
      return "Text";
    case 16:
      return Zo(t);
    case 8:
      return t === Ki ? "StrictMode" : "Mode";
    case 22:
      return "Offscreen";
    case 12:
      return "Profiler";
    case 21:
      return "Scope";
    case 13:
      return "Suspense";
    case 19:
      return "SuspenseList";
    case 25:
      return "TracingMarker";
    case 1:
    case 0:
    case 17:
    case 2:
    case 14:
    case 15:
      if (typeof t == "function") return t.displayName || t.name || null;
      if (typeof t == "string") return t;
  }
  return null;
}
function on(e) {
  switch (typeof e) {
    case "boolean":
    case "number":
    case "string":
    case "undefined":
      return e;
    case "object":
      return e;
    default:
      return "";
  }
}
function ju(e) {
  var t = e.type;
  return (
    (e = e.nodeName) &&
    e.toLowerCase() === "input" &&
    (t === "checkbox" || t === "radio")
  );
}
function vf(e) {
  var t = ju(e) ? "checked" : "value",
    n = Object.getOwnPropertyDescriptor(e.constructor.prototype, t),
    r = "" + e[t];
  if (
    !e.hasOwnProperty(t) &&
    typeof n < "u" &&
    typeof n.get == "function" &&
    typeof n.set == "function"
  ) {
    var l = n.get,
      o = n.set;
    return (
      Object.defineProperty(e, t, {
        configurable: !0,
        get: function () {
          return l.call(this);
        },
        set: function (i) {
          ((r = "" + i), o.call(this, i));
        },
      }),
      Object.defineProperty(e, t, { enumerable: n.enumerable }),
      {
        getValue: function () {
          return r;
        },
        setValue: function (i) {
          r = "" + i;
        },
        stopTracking: function () {
          ((e._valueTracker = null), delete e[t]);
        },
      }
    );
  }
}
function rl(e) {
  e._valueTracker || (e._valueTracker = vf(e));
}
function Cu(e) {
  if (!e) return !1;
  var t = e._valueTracker;
  if (!t) return !0;
  var n = t.getValue(),
    r = "";
  return (
    e && (r = ju(e) ? (e.checked ? "true" : "false") : e.value),
    (e = r),
    e !== n ? (t.setValue(e), !0) : !1
  );
}
function Tl(e) {
  if (((e = e || (typeof document < "u" ? document : void 0)), typeof e > "u"))
    return null;
  try {
    return e.activeElement || e.body;
  } catch {
    return e.body;
  }
}
function Jo(e, t) {
  var n = t.checked;
  return pe({}, t, {
    defaultChecked: void 0,
    defaultValue: void 0,
    value: void 0,
    checked: n ?? e._wrapperState.initialChecked,
  });
}
function Zs(e, t) {
  var n = t.defaultValue == null ? "" : t.defaultValue,
    r = t.checked != null ? t.checked : t.defaultChecked;
  ((n = on(t.value != null ? t.value : n)),
    (e._wrapperState = {
      initialChecked: r,
      initialValue: n,
      controlled:
        t.type === "checkbox" || t.type === "radio"
          ? t.checked != null
          : t.value != null,
    }));
}
function Mu(e, t) {
  ((t = t.checked), t != null && Qi(e, "checked", t, !1));
}
function qo(e, t) {
  Mu(e, t);
  var n = on(t.value),
    r = t.type;
  if (n != null)
    r === "number"
      ? ((n === 0 && e.value === "") || e.value != n) && (e.value = "" + n)
      : e.value !== "" + n && (e.value = "" + n);
  else if (r === "submit" || r === "reset") {
    e.removeAttribute("value");
    return;
  }
  (t.hasOwnProperty("value")
    ? ei(e, t.type, n)
    : t.hasOwnProperty("defaultValue") && ei(e, t.type, on(t.defaultValue)),
    t.checked == null &&
      t.defaultChecked != null &&
      (e.defaultChecked = !!t.defaultChecked));
}
function Js(e, t, n) {
  if (t.hasOwnProperty("value") || t.hasOwnProperty("defaultValue")) {
    var r = t.type;
    if (!(
      (r !== "submit" && r !== "reset") ||
      (t.value !== void 0 && t.value !== null)
    ))
      return;
    ((t = "" + e._wrapperState.initialValue),
      n || t === e.value || (e.value = t),
      (e.defaultValue = t));
  }
  ((n = e.name),
    n !== "" && (e.name = ""),
    (e.defaultChecked = !!e._wrapperState.initialChecked),
    n !== "" && (e.name = n));
}
function ei(e, t, n) {
  (t !== "number" || Tl(e.ownerDocument) !== e) &&
    (n == null
      ? (e.defaultValue = "" + e._wrapperState.initialValue)
      : e.defaultValue !== "" + n && (e.defaultValue = "" + n));
}
var vr = Array.isArray;
function Bn(e, t, n, r) {
  if (((e = e.options), t)) {
    t = {};
    for (var l = 0; l < n.length; l++) t["$" + n[l]] = !0;
    for (n = 0; n < e.length; n++)
      ((l = t.hasOwnProperty("$" + e[n].value)),
        e[n].selected !== l && (e[n].selected = l),
        l && r && (e[n].defaultSelected = !0));
  } else {
    for (n = "" + on(n), t = null, l = 0; l < e.length; l++) {
      if (e[l].value === n) {
        ((e[l].selected = !0), r && (e[l].defaultSelected = !0));
        return;
      }
      t !== null || e[l].disabled || (t = e[l]);
    }
    t !== null && (t.selected = !0);
  }
}
function ti(e, t) {
  if (t.dangerouslySetInnerHTML != null) throw Error(C(91));
  return pe({}, t, {
    value: void 0,
    defaultValue: void 0,
    children: "" + e._wrapperState.initialValue,
  });
}
function qs(e, t) {
  var n = t.value;
  if (n == null) {
    if (((n = t.children), (t = t.defaultValue), n != null)) {
      if (t != null) throw Error(C(92));
      if (vr(n)) {
        if (1 < n.length) throw Error(C(93));
        n = n[0];
      }
      t = n;
    }
    (t == null && (t = ""), (n = t));
  }
  e._wrapperState = { initialValue: on(n) };
}
function Eu(e, t) {
  var n = on(t.value),
    r = on(t.defaultValue);
  (n != null &&
    ((n = "" + n),
    n !== e.value && (e.value = n),
    t.defaultValue == null && e.defaultValue !== n && (e.defaultValue = n)),
    r != null && (e.defaultValue = "" + r));
}
function ea(e) {
  var t = e.textContent;
  t === e._wrapperState.initialValue && t !== "" && t !== null && (e.value = t);
}
function Pu(e) {
  switch (e) {
    case "svg":
      return "http://www.w3.org/2000/svg";
    case "math":
      return "http://www.w3.org/1998/Math/MathML";
    default:
      return "http://www.w3.org/1999/xhtml";
  }
}
function ni(e, t) {
  return e == null || e === "http://www.w3.org/1999/xhtml"
    ? Pu(t)
    : e === "http://www.w3.org/2000/svg" && t === "foreignObject"
      ? "http://www.w3.org/1999/xhtml"
      : e;
}
var ll,
  zu = (function (e) {
    return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction
      ? function (t, n, r, l) {
          MSApp.execUnsafeLocalFunction(function () {
            return e(t, n, r, l);
          });
        }
      : e;
  })(function (e, t) {
    if (e.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in e)
      e.innerHTML = t;
    else {
      for (
        ll = ll || document.createElement("div"),
          ll.innerHTML = "<svg>" + t.valueOf().toString() + "</svg>",
          t = ll.firstChild;
        e.firstChild;
      )
        e.removeChild(e.firstChild);
      for (; t.firstChild;) e.appendChild(t.firstChild);
    }
  });
function br(e, t) {
  if (t) {
    var n = e.firstChild;
    if (n && n === e.lastChild && n.nodeType === 3) {
      n.nodeValue = t;
      return;
    }
  }
  e.textContent = t;
}
var kr = {
    animationIterationCount: !0,
    aspectRatio: !0,
    borderImageOutset: !0,
    borderImageSlice: !0,
    borderImageWidth: !0,
    boxFlex: !0,
    boxFlexGroup: !0,
    boxOrdinalGroup: !0,
    columnCount: !0,
    columns: !0,
    flex: !0,
    flexGrow: !0,
    flexPositive: !0,
    flexShrink: !0,
    flexNegative: !0,
    flexOrder: !0,
    gridArea: !0,
    gridRow: !0,
    gridRowEnd: !0,
    gridRowSpan: !0,
    gridRowStart: !0,
    gridColumn: !0,
    gridColumnEnd: !0,
    gridColumnSpan: !0,
    gridColumnStart: !0,
    fontWeight: !0,
    lineClamp: !0,
    lineHeight: !0,
    opacity: !0,
    order: !0,
    orphans: !0,
    tabSize: !0,
    widows: !0,
    zIndex: !0,
    zoom: !0,
    fillOpacity: !0,
    floodOpacity: !0,
    stopOpacity: !0,
    strokeDasharray: !0,
    strokeDashoffset: !0,
    strokeMiterlimit: !0,
    strokeOpacity: !0,
    strokeWidth: !0,
  },
  xf = ["Webkit", "ms", "Moz", "O"];
Object.keys(kr).forEach(function (e) {
  xf.forEach(function (t) {
    ((t = t + e.charAt(0).toUpperCase() + e.substring(1)), (kr[t] = kr[e]));
  });
});
function Tu(e, t, n) {
  return t == null || typeof t == "boolean" || t === ""
    ? ""
    : n || typeof t != "number" || t === 0 || (kr.hasOwnProperty(e) && kr[e])
      ? ("" + t).trim()
      : t + "px";
}
function bu(e, t) {
  e = e.style;
  for (var n in t)
    if (t.hasOwnProperty(n)) {
      var r = n.indexOf("--") === 0,
        l = Tu(n, t[n], r);
      (n === "float" && (n = "cssFloat"), r ? e.setProperty(n, l) : (e[n] = l));
    }
}
var wf = pe(
  { menuitem: !0 },
  {
    area: !0,
    base: !0,
    br: !0,
    col: !0,
    embed: !0,
    hr: !0,
    img: !0,
    input: !0,
    keygen: !0,
    link: !0,
    meta: !0,
    param: !0,
    source: !0,
    track: !0,
    wbr: !0,
  },
);
function ri(e, t) {
  if (t) {
    if (wf[e] && (t.children != null || t.dangerouslySetInnerHTML != null))
      throw Error(C(137, e));
    if (t.dangerouslySetInnerHTML != null) {
      if (t.children != null) throw Error(C(60));
      if (
        typeof t.dangerouslySetInnerHTML != "object" ||
        !("__html" in t.dangerouslySetInnerHTML)
      )
        throw Error(C(61));
    }
    if (t.style != null && typeof t.style != "object") throw Error(C(62));
  }
}
function li(e, t) {
  if (e.indexOf("-") === -1) return typeof t.is == "string";
  switch (e) {
    case "annotation-xml":
    case "color-profile":
    case "font-face":
    case "font-face-src":
    case "font-face-uri":
    case "font-face-format":
    case "font-face-name":
    case "missing-glyph":
      return !1;
    default:
      return !0;
  }
}
var oi = null;
function Ji(e) {
  return (
    (e = e.target || e.srcElement || window),
    e.correspondingUseElement && (e = e.correspondingUseElement),
    e.nodeType === 3 ? e.parentNode : e
  );
}
var ii = null,
  Xn = null,
  Yn = null;
function ta(e) {
  if ((e = Gr(e))) {
    if (typeof ii != "function") throw Error(C(280));
    var t = e.stateNode;
    t && ((t = oo(t)), ii(e.stateNode, e.type, t));
  }
}
function _u(e) {
  Xn ? (Yn ? Yn.push(e) : (Yn = [e])) : (Xn = e);
}
function Ru() {
  if (Xn) {
    var e = Xn,
      t = Yn;
    if (((Yn = Xn = null), ta(e), t)) for (e = 0; e < t.length; e++) ta(t[e]);
  }
}
function Lu(e, t) {
  return e(t);
}
function Iu() {}
var jo = !1;
function Fu(e, t, n) {
  if (jo) return e(t, n);
  jo = !0;
  try {
    return Lu(e, t, n);
  } finally {
    ((jo = !1), (Xn !== null || Yn !== null) && (Iu(), Ru()));
  }
}
function _r(e, t) {
  var n = e.stateNode;
  if (n === null) return null;
  var r = oo(n);
  if (r === null) return null;
  n = r[t];
  e: switch (t) {
    case "onClick":
    case "onClickCapture":
    case "onDoubleClick":
    case "onDoubleClickCapture":
    case "onMouseDown":
    case "onMouseDownCapture":
    case "onMouseMove":
    case "onMouseMoveCapture":
    case "onMouseUp":
    case "onMouseUpCapture":
    case "onMouseEnter":
      ((r = !r.disabled) ||
        ((e = e.type),
        (r = !(
          e === "button" ||
          e === "input" ||
          e === "select" ||
          e === "textarea"
        ))),
        (e = !r));
      break e;
    default:
      e = !1;
  }
  if (e) return null;
  if (n && typeof n != "function") throw Error(C(231, t, typeof n));
  return n;
}
var si = !1;
if (Lt)
  try {
    var cr = {};
    (Object.defineProperty(cr, "passive", {
      get: function () {
        si = !0;
      },
    }),
      window.addEventListener("test", cr, cr),
      window.removeEventListener("test", cr, cr));
  } catch {
    si = !1;
  }
function kf(e, t, n, r, l, o, i, u, s) {
  var d = Array.prototype.slice.call(arguments, 3);
  try {
    t.apply(n, d);
  } catch (m) {
    this.onError(m);
  }
}
var Sr = !1,
  bl = null,
  _l = !1,
  ai = null,
  Sf = {
    onError: function (e) {
      ((Sr = !0), (bl = e));
    },
  };
function Nf(e, t, n, r, l, o, i, u, s) {
  ((Sr = !1), (bl = null), kf.apply(Sf, arguments));
}
function jf(e, t, n, r, l, o, i, u, s) {
  if ((Nf.apply(this, arguments), Sr)) {
    if (Sr) {
      var d = bl;
      ((Sr = !1), (bl = null));
    } else throw Error(C(198));
    _l || ((_l = !0), (ai = d));
  }
}
function Mn(e) {
  var t = e,
    n = e;
  if (e.alternate) for (; t.return;) t = t.return;
  else {
    e = t;
    do ((t = e), t.flags & 4098 && (n = t.return), (e = t.return));
    while (e);
  }
  return t.tag === 3 ? n : null;
}
function Du(e) {
  if (e.tag === 13) {
    var t = e.memoizedState;
    if (
      (t === null && ((e = e.alternate), e !== null && (t = e.memoizedState)),
      t !== null)
    )
      return t.dehydrated;
  }
  return null;
}
function na(e) {
  if (Mn(e) !== e) throw Error(C(188));
}
function Cf(e) {
  var t = e.alternate;
  if (!t) {
    if (((t = Mn(e)), t === null)) throw Error(C(188));
    return t !== e ? null : e;
  }
  for (var n = e, r = t; ;) {
    var l = n.return;
    if (l === null) break;
    var o = l.alternate;
    if (o === null) {
      if (((r = l.return), r !== null)) {
        n = r;
        continue;
      }
      break;
    }
    if (l.child === o.child) {
      for (o = l.child; o;) {
        if (o === n) return (na(l), e);
        if (o === r) return (na(l), t);
        o = o.sibling;
      }
      throw Error(C(188));
    }
    if (n.return !== r.return) ((n = l), (r = o));
    else {
      for (var i = !1, u = l.child; u;) {
        if (u === n) {
          ((i = !0), (n = l), (r = o));
          break;
        }
        if (u === r) {
          ((i = !0), (r = l), (n = o));
          break;
        }
        u = u.sibling;
      }
      if (!i) {
        for (u = o.child; u;) {
          if (u === n) {
            ((i = !0), (n = o), (r = l));
            break;
          }
          if (u === r) {
            ((i = !0), (r = o), (n = l));
            break;
          }
          u = u.sibling;
        }
        if (!i) throw Error(C(189));
      }
    }
    if (n.alternate !== r) throw Error(C(190));
  }
  if (n.tag !== 3) throw Error(C(188));
  return n.stateNode.current === n ? e : t;
}
function Ou(e) {
  return ((e = Cf(e)), e !== null ? Au(e) : null);
}
function Au(e) {
  if (e.tag === 5 || e.tag === 6) return e;
  for (e = e.child; e !== null;) {
    var t = Au(e);
    if (t !== null) return t;
    e = e.sibling;
  }
  return null;
}
var $u = et.unstable_scheduleCallback,
  ra = et.unstable_cancelCallback,
  Mf = et.unstable_shouldYield,
  Ef = et.unstable_requestPaint,
  ve = et.unstable_now,
  Pf = et.unstable_getCurrentPriorityLevel,
  qi = et.unstable_ImmediatePriority,
  Uu = et.unstable_UserBlockingPriority,
  Rl = et.unstable_NormalPriority,
  zf = et.unstable_LowPriority,
  Vu = et.unstable_IdlePriority,
  to = null,
  Mt = null;
function Tf(e) {
  if (Mt && typeof Mt.onCommitFiberRoot == "function")
    try {
      Mt.onCommitFiberRoot(to, e, void 0, (e.current.flags & 128) === 128);
    } catch {}
}
var vt = Math.clz32 ? Math.clz32 : Rf,
  bf = Math.log,
  _f = Math.LN2;
function Rf(e) {
  return ((e >>>= 0), e === 0 ? 32 : (31 - ((bf(e) / _f) | 0)) | 0);
}
var ol = 64,
  il = 4194304;
function xr(e) {
  switch (e & -e) {
    case 1:
      return 1;
    case 2:
      return 2;
    case 4:
      return 4;
    case 8:
      return 8;
    case 16:
      return 16;
    case 32:
      return 32;
    case 64:
    case 128:
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
      return e & 4194240;
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
    case 67108864:
      return e & 130023424;
    case 134217728:
      return 134217728;
    case 268435456:
      return 268435456;
    case 536870912:
      return 536870912;
    case 1073741824:
      return 1073741824;
    default:
      return e;
  }
}
function Ll(e, t) {
  var n = e.pendingLanes;
  if (n === 0) return 0;
  var r = 0,
    l = e.suspendedLanes,
    o = e.pingedLanes,
    i = n & 268435455;
  if (i !== 0) {
    var u = i & ~l;
    u !== 0 ? (r = xr(u)) : ((o &= i), o !== 0 && (r = xr(o)));
  } else ((i = n & ~l), i !== 0 ? (r = xr(i)) : o !== 0 && (r = xr(o)));
  if (r === 0) return 0;
  if (
    t !== 0 &&
    t !== r &&
    !(t & l) &&
    ((l = r & -r), (o = t & -t), l >= o || (l === 16 && (o & 4194240) !== 0))
  )
    return t;
  if ((r & 4 && (r |= n & 16), (t = e.entangledLanes), t !== 0))
    for (e = e.entanglements, t &= r; 0 < t;)
      ((n = 31 - vt(t)), (l = 1 << n), (r |= e[n]), (t &= ~l));
  return r;
}
function Lf(e, t) {
  switch (e) {
    case 1:
    case 2:
    case 4:
      return t + 250;
    case 8:
    case 16:
    case 32:
    case 64:
    case 128:
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
      return t + 5e3;
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
    case 67108864:
      return -1;
    case 134217728:
    case 268435456:
    case 536870912:
    case 1073741824:
      return -1;
    default:
      return -1;
  }
}
function If(e, t) {
  for (
    var n = e.suspendedLanes,
      r = e.pingedLanes,
      l = e.expirationTimes,
      o = e.pendingLanes;
    0 < o;
  ) {
    var i = 31 - vt(o),
      u = 1 << i,
      s = l[i];
    (s === -1
      ? (!(u & n) || u & r) && (l[i] = Lf(u, t))
      : s <= t && (e.expiredLanes |= u),
      (o &= ~u));
  }
}
function ui(e) {
  return (
    (e = e.pendingLanes & -1073741825),
    e !== 0 ? e : e & 1073741824 ? 1073741824 : 0
  );
}
function Hu() {
  var e = ol;
  return ((ol <<= 1), !(ol & 4194240) && (ol = 64), e);
}
function Co(e) {
  for (var t = [], n = 0; 31 > n; n++) t.push(e);
  return t;
}
function Qr(e, t, n) {
  ((e.pendingLanes |= t),
    t !== 536870912 && ((e.suspendedLanes = 0), (e.pingedLanes = 0)),
    (e = e.eventTimes),
    (t = 31 - vt(t)),
    (e[t] = n));
}
function Ff(e, t) {
  var n = e.pendingLanes & ~t;
  ((e.pendingLanes = t),
    (e.suspendedLanes = 0),
    (e.pingedLanes = 0),
    (e.expiredLanes &= t),
    (e.mutableReadLanes &= t),
    (e.entangledLanes &= t),
    (t = e.entanglements));
  var r = e.eventTimes;
  for (e = e.expirationTimes; 0 < n;) {
    var l = 31 - vt(n),
      o = 1 << l;
    ((t[l] = 0), (r[l] = -1), (e[l] = -1), (n &= ~o));
  }
}
function es(e, t) {
  var n = (e.entangledLanes |= t);
  for (e = e.entanglements; n;) {
    var r = 31 - vt(n),
      l = 1 << r;
    ((l & t) | (e[r] & t) && (e[r] |= t), (n &= ~l));
  }
}
var ee = 0;
function Wu(e) {
  return (
    (e &= -e),
    1 < e ? (4 < e ? (e & 268435455 ? 16 : 536870912) : 4) : 1
  );
}
var Bu,
  ts,
  Xu,
  Yu,
  Qu,
  ci = !1,
  sl = [],
  Zt = null,
  Jt = null,
  qt = null,
  Rr = new Map(),
  Lr = new Map(),
  Xt = [],
  Df =
    "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(
      " ",
    );
function la(e, t) {
  switch (e) {
    case "focusin":
    case "focusout":
      Zt = null;
      break;
    case "dragenter":
    case "dragleave":
      Jt = null;
      break;
    case "mouseover":
    case "mouseout":
      qt = null;
      break;
    case "pointerover":
    case "pointerout":
      Rr.delete(t.pointerId);
      break;
    case "gotpointercapture":
    case "lostpointercapture":
      Lr.delete(t.pointerId);
  }
}
function dr(e, t, n, r, l, o) {
  return e === null || e.nativeEvent !== o
    ? ((e = {
        blockedOn: t,
        domEventName: n,
        eventSystemFlags: r,
        nativeEvent: o,
        targetContainers: [l],
      }),
      t !== null && ((t = Gr(t)), t !== null && ts(t)),
      e)
    : ((e.eventSystemFlags |= r),
      (t = e.targetContainers),
      l !== null && t.indexOf(l) === -1 && t.push(l),
      e);
}
function Of(e, t, n, r, l) {
  switch (t) {
    case "focusin":
      return ((Zt = dr(Zt, e, t, n, r, l)), !0);
    case "dragenter":
      return ((Jt = dr(Jt, e, t, n, r, l)), !0);
    case "mouseover":
      return ((qt = dr(qt, e, t, n, r, l)), !0);
    case "pointerover":
      var o = l.pointerId;
      return (Rr.set(o, dr(Rr.get(o) || null, e, t, n, r, l)), !0);
    case "gotpointercapture":
      return (
        (o = l.pointerId),
        Lr.set(o, dr(Lr.get(o) || null, e, t, n, r, l)),
        !0
      );
  }
  return !1;
}
function Ku(e) {
  var t = hn(e.target);
  if (t !== null) {
    var n = Mn(t);
    if (n !== null) {
      if (((t = n.tag), t === 13)) {
        if (((t = Du(n)), t !== null)) {
          ((e.blockedOn = t),
            Qu(e.priority, function () {
              Xu(n);
            }));
          return;
        }
      } else if (t === 3 && n.stateNode.current.memoizedState.isDehydrated) {
        e.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null;
        return;
      }
    }
  }
  e.blockedOn = null;
}
function wl(e) {
  if (e.blockedOn !== null) return !1;
  for (var t = e.targetContainers; 0 < t.length;) {
    var n = di(e.domEventName, e.eventSystemFlags, t[0], e.nativeEvent);
    if (n === null) {
      n = e.nativeEvent;
      var r = new n.constructor(n.type, n);
      ((oi = r), n.target.dispatchEvent(r), (oi = null));
    } else return ((t = Gr(n)), t !== null && ts(t), (e.blockedOn = n), !1);
    t.shift();
  }
  return !0;
}
function oa(e, t, n) {
  wl(e) && n.delete(t);
}
function Af() {
  ((ci = !1),
    Zt !== null && wl(Zt) && (Zt = null),
    Jt !== null && wl(Jt) && (Jt = null),
    qt !== null && wl(qt) && (qt = null),
    Rr.forEach(oa),
    Lr.forEach(oa));
}
function fr(e, t) {
  e.blockedOn === t &&
    ((e.blockedOn = null),
    ci ||
      ((ci = !0),
      et.unstable_scheduleCallback(et.unstable_NormalPriority, Af)));
}
function Ir(e) {
  function t(l) {
    return fr(l, e);
  }
  if (0 < sl.length) {
    fr(sl[0], e);
    for (var n = 1; n < sl.length; n++) {
      var r = sl[n];
      r.blockedOn === e && (r.blockedOn = null);
    }
  }
  for (
    Zt !== null && fr(Zt, e),
      Jt !== null && fr(Jt, e),
      qt !== null && fr(qt, e),
      Rr.forEach(t),
      Lr.forEach(t),
      n = 0;
    n < Xt.length;
    n++
  )
    ((r = Xt[n]), r.blockedOn === e && (r.blockedOn = null));
  for (; 0 < Xt.length && ((n = Xt[0]), n.blockedOn === null);)
    (Ku(n), n.blockedOn === null && Xt.shift());
}
var Qn = Ot.ReactCurrentBatchConfig,
  Il = !0;
function $f(e, t, n, r) {
  var l = ee,
    o = Qn.transition;
  Qn.transition = null;
  try {
    ((ee = 1), ns(e, t, n, r));
  } finally {
    ((ee = l), (Qn.transition = o));
  }
}
function Uf(e, t, n, r) {
  var l = ee,
    o = Qn.transition;
  Qn.transition = null;
  try {
    ((ee = 4), ns(e, t, n, r));
  } finally {
    ((ee = l), (Qn.transition = o));
  }
}
function ns(e, t, n, r) {
  if (Il) {
    var l = di(e, t, n, r);
    if (l === null) (Io(e, t, r, Fl, n), la(e, r));
    else if (Of(l, e, t, n, r)) r.stopPropagation();
    else if ((la(e, r), t & 4 && -1 < Df.indexOf(e))) {
      for (; l !== null;) {
        var o = Gr(l);
        if (
          (o !== null && Bu(o),
          (o = di(e, t, n, r)),
          o === null && Io(e, t, r, Fl, n),
          o === l)
        )
          break;
        l = o;
      }
      l !== null && r.stopPropagation();
    } else Io(e, t, r, null, n);
  }
}
var Fl = null;
function di(e, t, n, r) {
  if (((Fl = null), (e = Ji(r)), (e = hn(e)), e !== null))
    if (((t = Mn(e)), t === null)) e = null;
    else if (((n = t.tag), n === 13)) {
      if (((e = Du(t)), e !== null)) return e;
      e = null;
    } else if (n === 3) {
      if (t.stateNode.current.memoizedState.isDehydrated)
        return t.tag === 3 ? t.stateNode.containerInfo : null;
      e = null;
    } else t !== e && (e = null);
  return ((Fl = e), null);
}
function Gu(e) {
  switch (e) {
    case "cancel":
    case "click":
    case "close":
    case "contextmenu":
    case "copy":
    case "cut":
    case "auxclick":
    case "dblclick":
    case "dragend":
    case "dragstart":
    case "drop":
    case "focusin":
    case "focusout":
    case "input":
    case "invalid":
    case "keydown":
    case "keypress":
    case "keyup":
    case "mousedown":
    case "mouseup":
    case "paste":
    case "pause":
    case "play":
    case "pointercancel":
    case "pointerdown":
    case "pointerup":
    case "ratechange":
    case "reset":
    case "resize":
    case "seeked":
    case "submit":
    case "touchcancel":
    case "touchend":
    case "touchstart":
    case "volumechange":
    case "change":
    case "selectionchange":
    case "textInput":
    case "compositionstart":
    case "compositionend":
    case "compositionupdate":
    case "beforeblur":
    case "afterblur":
    case "beforeinput":
    case "blur":
    case "fullscreenchange":
    case "focus":
    case "hashchange":
    case "popstate":
    case "select":
    case "selectstart":
      return 1;
    case "drag":
    case "dragenter":
    case "dragexit":
    case "dragleave":
    case "dragover":
    case "mousemove":
    case "mouseout":
    case "mouseover":
    case "pointermove":
    case "pointerout":
    case "pointerover":
    case "scroll":
    case "toggle":
    case "touchmove":
    case "wheel":
    case "mouseenter":
    case "mouseleave":
    case "pointerenter":
    case "pointerleave":
      return 4;
    case "message":
      switch (Pf()) {
        case qi:
          return 1;
        case Uu:
          return 4;
        case Rl:
        case zf:
          return 16;
        case Vu:
          return 536870912;
        default:
          return 16;
      }
    default:
      return 16;
  }
}
var Qt = null,
  rs = null,
  kl = null;
function Zu() {
  if (kl) return kl;
  var e,
    t = rs,
    n = t.length,
    r,
    l = "value" in Qt ? Qt.value : Qt.textContent,
    o = l.length;
  for (e = 0; e < n && t[e] === l[e]; e++);
  var i = n - e;
  for (r = 1; r <= i && t[n - r] === l[o - r]; r++);
  return (kl = l.slice(e, 1 < r ? 1 - r : void 0));
}
function Sl(e) {
  var t = e.keyCode;
  return (
    "charCode" in e
      ? ((e = e.charCode), e === 0 && t === 13 && (e = 13))
      : (e = t),
    e === 10 && (e = 13),
    32 <= e || e === 13 ? e : 0
  );
}
function al() {
  return !0;
}
function ia() {
  return !1;
}
function nt(e) {
  function t(n, r, l, o, i) {
    ((this._reactName = n),
      (this._targetInst = l),
      (this.type = r),
      (this.nativeEvent = o),
      (this.target = i),
      (this.currentTarget = null));
    for (var u in e)
      e.hasOwnProperty(u) && ((n = e[u]), (this[u] = n ? n(o) : o[u]));
    return (
      (this.isDefaultPrevented = (
        o.defaultPrevented != null ? o.defaultPrevented : o.returnValue === !1
      )
        ? al
        : ia),
      (this.isPropagationStopped = ia),
      this
    );
  }
  return (
    pe(t.prototype, {
      preventDefault: function () {
        this.defaultPrevented = !0;
        var n = this.nativeEvent;
        n &&
          (n.preventDefault
            ? n.preventDefault()
            : typeof n.returnValue != "unknown" && (n.returnValue = !1),
          (this.isDefaultPrevented = al));
      },
      stopPropagation: function () {
        var n = this.nativeEvent;
        n &&
          (n.stopPropagation
            ? n.stopPropagation()
            : typeof n.cancelBubble != "unknown" && (n.cancelBubble = !0),
          (this.isPropagationStopped = al));
      },
      persist: function () {},
      isPersistent: al,
    }),
    t
  );
}
var or = {
    eventPhase: 0,
    bubbles: 0,
    cancelable: 0,
    timeStamp: function (e) {
      return e.timeStamp || Date.now();
    },
    defaultPrevented: 0,
    isTrusted: 0,
  },
  ls = nt(or),
  Kr = pe({}, or, { view: 0, detail: 0 }),
  Vf = nt(Kr),
  Mo,
  Eo,
  pr,
  no = pe({}, Kr, {
    screenX: 0,
    screenY: 0,
    clientX: 0,
    clientY: 0,
    pageX: 0,
    pageY: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    getModifierState: os,
    button: 0,
    buttons: 0,
    relatedTarget: function (e) {
      return e.relatedTarget === void 0
        ? e.fromElement === e.srcElement
          ? e.toElement
          : e.fromElement
        : e.relatedTarget;
    },
    movementX: function (e) {
      return "movementX" in e
        ? e.movementX
        : (e !== pr &&
            (pr && e.type === "mousemove"
              ? ((Mo = e.screenX - pr.screenX), (Eo = e.screenY - pr.screenY))
              : (Eo = Mo = 0),
            (pr = e)),
          Mo);
    },
    movementY: function (e) {
      return "movementY" in e ? e.movementY : Eo;
    },
  }),
  sa = nt(no),
  Hf = pe({}, no, { dataTransfer: 0 }),
  Wf = nt(Hf),
  Bf = pe({}, Kr, { relatedTarget: 0 }),
  Po = nt(Bf),
  Xf = pe({}, or, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }),
  Yf = nt(Xf),
  Qf = pe({}, or, {
    clipboardData: function (e) {
      return "clipboardData" in e ? e.clipboardData : window.clipboardData;
    },
  }),
  Kf = nt(Qf),
  Gf = pe({}, or, { data: 0 }),
  aa = nt(Gf),
  Zf = {
    Esc: "Escape",
    Spacebar: " ",
    Left: "ArrowLeft",
    Up: "ArrowUp",
    Right: "ArrowRight",
    Down: "ArrowDown",
    Del: "Delete",
    Win: "OS",
    Menu: "ContextMenu",
    Apps: "ContextMenu",
    Scroll: "ScrollLock",
    MozPrintableKey: "Unidentified",
  },
  Jf = {
    8: "Backspace",
    9: "Tab",
    12: "Clear",
    13: "Enter",
    16: "Shift",
    17: "Control",
    18: "Alt",
    19: "Pause",
    20: "CapsLock",
    27: "Escape",
    32: " ",
    33: "PageUp",
    34: "PageDown",
    35: "End",
    36: "Home",
    37: "ArrowLeft",
    38: "ArrowUp",
    39: "ArrowRight",
    40: "ArrowDown",
    45: "Insert",
    46: "Delete",
    112: "F1",
    113: "F2",
    114: "F3",
    115: "F4",
    116: "F5",
    117: "F6",
    118: "F7",
    119: "F8",
    120: "F9",
    121: "F10",
    122: "F11",
    123: "F12",
    144: "NumLock",
    145: "ScrollLock",
    224: "Meta",
  },
  qf = {
    Alt: "altKey",
    Control: "ctrlKey",
    Meta: "metaKey",
    Shift: "shiftKey",
  };
function ep(e) {
  var t = this.nativeEvent;
  return t.getModifierState ? t.getModifierState(e) : (e = qf[e]) ? !!t[e] : !1;
}
function os() {
  return ep;
}
var tp = pe({}, Kr, {
    key: function (e) {
      if (e.key) {
        var t = Zf[e.key] || e.key;
        if (t !== "Unidentified") return t;
      }
      return e.type === "keypress"
        ? ((e = Sl(e)), e === 13 ? "Enter" : String.fromCharCode(e))
        : e.type === "keydown" || e.type === "keyup"
          ? Jf[e.keyCode] || "Unidentified"
          : "";
    },
    code: 0,
    location: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    repeat: 0,
    locale: 0,
    getModifierState: os,
    charCode: function (e) {
      return e.type === "keypress" ? Sl(e) : 0;
    },
    keyCode: function (e) {
      return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
    },
    which: function (e) {
      return e.type === "keypress"
        ? Sl(e)
        : e.type === "keydown" || e.type === "keyup"
          ? e.keyCode
          : 0;
    },
  }),
  np = nt(tp),
  rp = pe({}, no, {
    pointerId: 0,
    width: 0,
    height: 0,
    pressure: 0,
    tangentialPressure: 0,
    tiltX: 0,
    tiltY: 0,
    twist: 0,
    pointerType: 0,
    isPrimary: 0,
  }),
  ua = nt(rp),
  lp = pe({}, Kr, {
    touches: 0,
    targetTouches: 0,
    changedTouches: 0,
    altKey: 0,
    metaKey: 0,
    ctrlKey: 0,
    shiftKey: 0,
    getModifierState: os,
  }),
  op = nt(lp),
  ip = pe({}, or, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }),
  sp = nt(ip),
  ap = pe({}, no, {
    deltaX: function (e) {
      return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
    },
    deltaY: function (e) {
      return "deltaY" in e
        ? e.deltaY
        : "wheelDeltaY" in e
          ? -e.wheelDeltaY
          : "wheelDelta" in e
            ? -e.wheelDelta
            : 0;
    },
    deltaZ: 0,
    deltaMode: 0,
  }),
  up = nt(ap),
  cp = [9, 13, 27, 32],
  is = Lt && "CompositionEvent" in window,
  Nr = null;
Lt && "documentMode" in document && (Nr = document.documentMode);
var dp = Lt && "TextEvent" in window && !Nr,
  Ju = Lt && (!is || (Nr && 8 < Nr && 11 >= Nr)),
  ca = " ",
  da = !1;
function qu(e, t) {
  switch (e) {
    case "keyup":
      return cp.indexOf(t.keyCode) !== -1;
    case "keydown":
      return t.keyCode !== 229;
    case "keypress":
    case "mousedown":
    case "focusout":
      return !0;
    default:
      return !1;
  }
}
function ec(e) {
  return ((e = e.detail), typeof e == "object" && "data" in e ? e.data : null);
}
var In = !1;
function fp(e, t) {
  switch (e) {
    case "compositionend":
      return ec(t);
    case "keypress":
      return t.which !== 32 ? null : ((da = !0), ca);
    case "textInput":
      return ((e = t.data), e === ca && da ? null : e);
    default:
      return null;
  }
}
function pp(e, t) {
  if (In)
    return e === "compositionend" || (!is && qu(e, t))
      ? ((e = Zu()), (kl = rs = Qt = null), (In = !1), e)
      : null;
  switch (e) {
    case "paste":
      return null;
    case "keypress":
      if (!(t.ctrlKey || t.altKey || t.metaKey) || (t.ctrlKey && t.altKey)) {
        if (t.char && 1 < t.char.length) return t.char;
        if (t.which) return String.fromCharCode(t.which);
      }
      return null;
    case "compositionend":
      return Ju && t.locale !== "ko" ? null : t.data;
    default:
      return null;
  }
}
var mp = {
  color: !0,
  date: !0,
  datetime: !0,
  "datetime-local": !0,
  email: !0,
  month: !0,
  number: !0,
  password: !0,
  range: !0,
  search: !0,
  tel: !0,
  text: !0,
  time: !0,
  url: !0,
  week: !0,
};
function fa(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return t === "input" ? !!mp[e.type] : t === "textarea";
}
function tc(e, t, n, r) {
  (_u(r),
    (t = Dl(t, "onChange")),
    0 < t.length &&
      ((n = new ls("onChange", "change", null, n, r)),
      e.push({ event: n, listeners: t })));
}
var jr = null,
  Fr = null;
function hp(e) {
  fc(e, 0);
}
function ro(e) {
  var t = On(e);
  if (Cu(t)) return e;
}
function gp(e, t) {
  if (e === "change") return t;
}
var nc = !1;
if (Lt) {
  var zo;
  if (Lt) {
    var To = "oninput" in document;
    if (!To) {
      var pa = document.createElement("div");
      (pa.setAttribute("oninput", "return;"),
        (To = typeof pa.oninput == "function"));
    }
    zo = To;
  } else zo = !1;
  nc = zo && (!document.documentMode || 9 < document.documentMode);
}
function ma() {
  jr && (jr.detachEvent("onpropertychange", rc), (Fr = jr = null));
}
function rc(e) {
  if (e.propertyName === "value" && ro(Fr)) {
    var t = [];
    (tc(t, Fr, e, Ji(e)), Fu(hp, t));
  }
}
function yp(e, t, n) {
  e === "focusin"
    ? (ma(), (jr = t), (Fr = n), jr.attachEvent("onpropertychange", rc))
    : e === "focusout" && ma();
}
function vp(e) {
  if (e === "selectionchange" || e === "keyup" || e === "keydown")
    return ro(Fr);
}
function xp(e, t) {
  if (e === "click") return ro(t);
}
function wp(e, t) {
  if (e === "input" || e === "change") return ro(t);
}
function kp(e, t) {
  return (e === t && (e !== 0 || 1 / e === 1 / t)) || (e !== e && t !== t);
}
var wt = typeof Object.is == "function" ? Object.is : kp;
function Dr(e, t) {
  if (wt(e, t)) return !0;
  if (typeof e != "object" || e === null || typeof t != "object" || t === null)
    return !1;
  var n = Object.keys(e),
    r = Object.keys(t);
  if (n.length !== r.length) return !1;
  for (r = 0; r < n.length; r++) {
    var l = n[r];
    if (!Yo.call(t, l) || !wt(e[l], t[l])) return !1;
  }
  return !0;
}
function ha(e) {
  for (; e && e.firstChild;) e = e.firstChild;
  return e;
}
function ga(e, t) {
  var n = ha(e);
  e = 0;
  for (var r; n;) {
    if (n.nodeType === 3) {
      if (((r = e + n.textContent.length), e <= t && r >= t))
        return { node: n, offset: t - e };
      e = r;
    }
    e: {
      for (; n;) {
        if (n.nextSibling) {
          n = n.nextSibling;
          break e;
        }
        n = n.parentNode;
      }
      n = void 0;
    }
    n = ha(n);
  }
}
function lc(e, t) {
  return e && t
    ? e === t
      ? !0
      : e && e.nodeType === 3
        ? !1
        : t && t.nodeType === 3
          ? lc(e, t.parentNode)
          : "contains" in e
            ? e.contains(t)
            : e.compareDocumentPosition
              ? !!(e.compareDocumentPosition(t) & 16)
              : !1
    : !1;
}
function oc() {
  for (var e = window, t = Tl(); t instanceof e.HTMLIFrameElement;) {
    try {
      var n = typeof t.contentWindow.location.href == "string";
    } catch {
      n = !1;
    }
    if (n) e = t.contentWindow;
    else break;
    t = Tl(e.document);
  }
  return t;
}
function ss(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return (
    t &&
    ((t === "input" &&
      (e.type === "text" ||
        e.type === "search" ||
        e.type === "tel" ||
        e.type === "url" ||
        e.type === "password")) ||
      t === "textarea" ||
      e.contentEditable === "true")
  );
}
function Sp(e) {
  var t = oc(),
    n = e.focusedElem,
    r = e.selectionRange;
  if (
    t !== n &&
    n &&
    n.ownerDocument &&
    lc(n.ownerDocument.documentElement, n)
  ) {
    if (r !== null && ss(n)) {
      if (
        ((t = r.start),
        (e = r.end),
        e === void 0 && (e = t),
        "selectionStart" in n)
      )
        ((n.selectionStart = t),
          (n.selectionEnd = Math.min(e, n.value.length)));
      else if (
        ((e = ((t = n.ownerDocument || document) && t.defaultView) || window),
        e.getSelection)
      ) {
        e = e.getSelection();
        var l = n.textContent.length,
          o = Math.min(r.start, l);
        ((r = r.end === void 0 ? o : Math.min(r.end, l)),
          !e.extend && o > r && ((l = r), (r = o), (o = l)),
          (l = ga(n, o)));
        var i = ga(n, r);
        l &&
          i &&
          (e.rangeCount !== 1 ||
            e.anchorNode !== l.node ||
            e.anchorOffset !== l.offset ||
            e.focusNode !== i.node ||
            e.focusOffset !== i.offset) &&
          ((t = t.createRange()),
          t.setStart(l.node, l.offset),
          e.removeAllRanges(),
          o > r
            ? (e.addRange(t), e.extend(i.node, i.offset))
            : (t.setEnd(i.node, i.offset), e.addRange(t)));
      }
    }
    for (t = [], e = n; (e = e.parentNode);)
      e.nodeType === 1 &&
        t.push({ element: e, left: e.scrollLeft, top: e.scrollTop });
    for (typeof n.focus == "function" && n.focus(), n = 0; n < t.length; n++)
      ((e = t[n]),
        (e.element.scrollLeft = e.left),
        (e.element.scrollTop = e.top));
  }
}
var Np = Lt && "documentMode" in document && 11 >= document.documentMode,
  Fn = null,
  fi = null,
  Cr = null,
  pi = !1;
function ya(e, t, n) {
  var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
  pi ||
    Fn == null ||
    Fn !== Tl(r) ||
    ((r = Fn),
    "selectionStart" in r && ss(r)
      ? (r = { start: r.selectionStart, end: r.selectionEnd })
      : ((r = (
          (r.ownerDocument && r.ownerDocument.defaultView) ||
          window
        ).getSelection()),
        (r = {
          anchorNode: r.anchorNode,
          anchorOffset: r.anchorOffset,
          focusNode: r.focusNode,
          focusOffset: r.focusOffset,
        })),
    (Cr && Dr(Cr, r)) ||
      ((Cr = r),
      (r = Dl(fi, "onSelect")),
      0 < r.length &&
        ((t = new ls("onSelect", "select", null, t, n)),
        e.push({ event: t, listeners: r }),
        (t.target = Fn))));
}
function ul(e, t) {
  var n = {};
  return (
    (n[e.toLowerCase()] = t.toLowerCase()),
    (n["Webkit" + e] = "webkit" + t),
    (n["Moz" + e] = "moz" + t),
    n
  );
}
var Dn = {
    animationend: ul("Animation", "AnimationEnd"),
    animationiteration: ul("Animation", "AnimationIteration"),
    animationstart: ul("Animation", "AnimationStart"),
    transitionend: ul("Transition", "TransitionEnd"),
  },
  bo = {},
  ic = {};
Lt &&
  ((ic = document.createElement("div").style),
  "AnimationEvent" in window ||
    (delete Dn.animationend.animation,
    delete Dn.animationiteration.animation,
    delete Dn.animationstart.animation),
  "TransitionEvent" in window || delete Dn.transitionend.transition);
function lo(e) {
  if (bo[e]) return bo[e];
  if (!Dn[e]) return e;
  var t = Dn[e],
    n;
  for (n in t) if (t.hasOwnProperty(n) && n in ic) return (bo[e] = t[n]);
  return e;
}
var sc = lo("animationend"),
  ac = lo("animationiteration"),
  uc = lo("animationstart"),
  cc = lo("transitionend"),
  dc = new Map(),
  va =
    "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(
      " ",
    );
function an(e, t) {
  (dc.set(e, t), Cn(t, [e]));
}
for (var _o = 0; _o < va.length; _o++) {
  var Ro = va[_o],
    jp = Ro.toLowerCase(),
    Cp = Ro[0].toUpperCase() + Ro.slice(1);
  an(jp, "on" + Cp);
}
an(sc, "onAnimationEnd");
an(ac, "onAnimationIteration");
an(uc, "onAnimationStart");
an("dblclick", "onDoubleClick");
an("focusin", "onFocus");
an("focusout", "onBlur");
an(cc, "onTransitionEnd");
Zn("onMouseEnter", ["mouseout", "mouseover"]);
Zn("onMouseLeave", ["mouseout", "mouseover"]);
Zn("onPointerEnter", ["pointerout", "pointerover"]);
Zn("onPointerLeave", ["pointerout", "pointerover"]);
Cn(
  "onChange",
  "change click focusin focusout input keydown keyup selectionchange".split(
    " ",
  ),
);
Cn(
  "onSelect",
  "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(
    " ",
  ),
);
Cn("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]);
Cn(
  "onCompositionEnd",
  "compositionend focusout keydown keypress keyup mousedown".split(" "),
);
Cn(
  "onCompositionStart",
  "compositionstart focusout keydown keypress keyup mousedown".split(" "),
);
Cn(
  "onCompositionUpdate",
  "compositionupdate focusout keydown keypress keyup mousedown".split(" "),
);
var wr =
    "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
      " ",
    ),
  Mp = new Set("cancel close invalid load scroll toggle".split(" ").concat(wr));
function xa(e, t, n) {
  var r = e.type || "unknown-event";
  ((e.currentTarget = n), jf(r, t, void 0, e), (e.currentTarget = null));
}
function fc(e, t) {
  t = (t & 4) !== 0;
  for (var n = 0; n < e.length; n++) {
    var r = e[n],
      l = r.event;
    r = r.listeners;
    e: {
      var o = void 0;
      if (t)
        for (var i = r.length - 1; 0 <= i; i--) {
          var u = r[i],
            s = u.instance,
            d = u.currentTarget;
          if (((u = u.listener), s !== o && l.isPropagationStopped())) break e;
          (xa(l, u, d), (o = s));
        }
      else
        for (i = 0; i < r.length; i++) {
          if (
            ((u = r[i]),
            (s = u.instance),
            (d = u.currentTarget),
            (u = u.listener),
            s !== o && l.isPropagationStopped())
          )
            break e;
          (xa(l, u, d), (o = s));
        }
    }
  }
  if (_l) throw ((e = ai), (_l = !1), (ai = null), e);
}
function ie(e, t) {
  var n = t[vi];
  n === void 0 && (n = t[vi] = new Set());
  var r = e + "__bubble";
  n.has(r) || (pc(t, e, 2, !1), n.add(r));
}
function Lo(e, t, n) {
  var r = 0;
  (t && (r |= 4), pc(n, e, r, t));
}
var cl = "_reactListening" + Math.random().toString(36).slice(2);
function Or(e) {
  if (!e[cl]) {
    ((e[cl] = !0),
      wu.forEach(function (n) {
        n !== "selectionchange" && (Mp.has(n) || Lo(n, !1, e), Lo(n, !0, e));
      }));
    var t = e.nodeType === 9 ? e : e.ownerDocument;
    t === null || t[cl] || ((t[cl] = !0), Lo("selectionchange", !1, t));
  }
}
function pc(e, t, n, r) {
  switch (Gu(t)) {
    case 1:
      var l = $f;
      break;
    case 4:
      l = Uf;
      break;
    default:
      l = ns;
  }
  ((n = l.bind(null, t, n, e)),
    (l = void 0),
    !si ||
      (t !== "touchstart" && t !== "touchmove" && t !== "wheel") ||
      (l = !0),
    r
      ? l !== void 0
        ? e.addEventListener(t, n, { capture: !0, passive: l })
        : e.addEventListener(t, n, !0)
      : l !== void 0
        ? e.addEventListener(t, n, { passive: l })
        : e.addEventListener(t, n, !1));
}
function Io(e, t, n, r, l) {
  var o = r;
  if (!(t & 1) && !(t & 2) && r !== null)
    e: for (;;) {
      if (r === null) return;
      var i = r.tag;
      if (i === 3 || i === 4) {
        var u = r.stateNode.containerInfo;
        if (u === l || (u.nodeType === 8 && u.parentNode === l)) break;
        if (i === 4)
          for (i = r.return; i !== null;) {
            var s = i.tag;
            if (
              (s === 3 || s === 4) &&
              ((s = i.stateNode.containerInfo),
              s === l || (s.nodeType === 8 && s.parentNode === l))
            )
              return;
            i = i.return;
          }
        for (; u !== null;) {
          if (((i = hn(u)), i === null)) return;
          if (((s = i.tag), s === 5 || s === 6)) {
            r = o = i;
            continue e;
          }
          u = u.parentNode;
        }
      }
      r = r.return;
    }
  Fu(function () {
    var d = o,
      m = Ji(n),
      g = [];
    e: {
      var h = dc.get(e);
      if (h !== void 0) {
        var v = ls,
          w = e;
        switch (e) {
          case "keypress":
            if (Sl(n) === 0) break e;
          case "keydown":
          case "keyup":
            v = np;
            break;
          case "focusin":
            ((w = "focus"), (v = Po));
            break;
          case "focusout":
            ((w = "blur"), (v = Po));
            break;
          case "beforeblur":
          case "afterblur":
            v = Po;
            break;
          case "click":
            if (n.button === 2) break e;
          case "auxclick":
          case "dblclick":
          case "mousedown":
          case "mousemove":
          case "mouseup":
          case "mouseout":
          case "mouseover":
          case "contextmenu":
            v = sa;
            break;
          case "drag":
          case "dragend":
          case "dragenter":
          case "dragexit":
          case "dragleave":
          case "dragover":
          case "dragstart":
          case "drop":
            v = Wf;
            break;
          case "touchcancel":
          case "touchend":
          case "touchmove":
          case "touchstart":
            v = op;
            break;
          case sc:
          case ac:
          case uc:
            v = Yf;
            break;
          case cc:
            v = sp;
            break;
          case "scroll":
            v = Vf;
            break;
          case "wheel":
            v = up;
            break;
          case "copy":
          case "cut":
          case "paste":
            v = Kf;
            break;
          case "gotpointercapture":
          case "lostpointercapture":
          case "pointercancel":
          case "pointerdown":
          case "pointermove":
          case "pointerout":
          case "pointerover":
          case "pointerup":
            v = ua;
        }
        var x = (t & 4) !== 0,
          F = !x && e === "scroll",
          f = x ? (h !== null ? h + "Capture" : null) : h;
        x = [];
        for (var c = d, p; c !== null;) {
          p = c;
          var y = p.stateNode;
          if (
            (p.tag === 5 &&
              y !== null &&
              ((p = y),
              f !== null && ((y = _r(c, f)), y != null && x.push(Ar(c, y, p)))),
            F)
          )
            break;
          c = c.return;
        }
        0 < x.length &&
          ((h = new v(h, w, null, n, m)), g.push({ event: h, listeners: x }));
      }
    }
    if (!(t & 7)) {
      e: {
        if (
          ((h = e === "mouseover" || e === "pointerover"),
          (v = e === "mouseout" || e === "pointerout"),
          h &&
            n !== oi &&
            (w = n.relatedTarget || n.fromElement) &&
            (hn(w) || w[It]))
        )
          break e;
        if (
          (v || h) &&
          ((h =
            m.window === m
              ? m
              : (h = m.ownerDocument)
                ? h.defaultView || h.parentWindow
                : window),
          v
            ? ((w = n.relatedTarget || n.toElement),
              (v = d),
              (w = w ? hn(w) : null),
              w !== null &&
                ((F = Mn(w)), w !== F || (w.tag !== 5 && w.tag !== 6)) &&
                (w = null))
            : ((v = null), (w = d)),
          v !== w)
        ) {
          if (
            ((x = sa),
            (y = "onMouseLeave"),
            (f = "onMouseEnter"),
            (c = "mouse"),
            (e === "pointerout" || e === "pointerover") &&
              ((x = ua),
              (y = "onPointerLeave"),
              (f = "onPointerEnter"),
              (c = "pointer")),
            (F = v == null ? h : On(v)),
            (p = w == null ? h : On(w)),
            (h = new x(y, c + "leave", v, n, m)),
            (h.target = F),
            (h.relatedTarget = p),
            (y = null),
            hn(m) === d &&
              ((x = new x(f, c + "enter", w, n, m)),
              (x.target = p),
              (x.relatedTarget = F),
              (y = x)),
            (F = y),
            v && w)
          )
            t: {
              for (x = v, f = w, c = 0, p = x; p; p = bn(p)) c++;
              for (p = 0, y = f; y; y = bn(y)) p++;
              for (; 0 < c - p;) ((x = bn(x)), c--);
              for (; 0 < p - c;) ((f = bn(f)), p--);
              for (; c--;) {
                if (x === f || (f !== null && x === f.alternate)) break t;
                ((x = bn(x)), (f = bn(f)));
              }
              x = null;
            }
          else x = null;
          (v !== null && wa(g, h, v, x, !1),
            w !== null && F !== null && wa(g, F, w, x, !0));
        }
      }
      e: {
        if (
          ((h = d ? On(d) : window),
          (v = h.nodeName && h.nodeName.toLowerCase()),
          v === "select" || (v === "input" && h.type === "file"))
        )
          var S = gp;
        else if (fa(h))
          if (nc) S = wp;
          else {
            S = vp;
            var _ = yp;
          }
        else
          (v = h.nodeName) &&
            v.toLowerCase() === "input" &&
            (h.type === "checkbox" || h.type === "radio") &&
            (S = xp);
        if (S && (S = S(e, d))) {
          tc(g, S, n, m);
          break e;
        }
        (_ && _(e, h, d),
          e === "focusout" &&
            (_ = h._wrapperState) &&
            _.controlled &&
            h.type === "number" &&
            ei(h, "number", h.value));
      }
      switch (((_ = d ? On(d) : window), e)) {
        case "focusin":
          (fa(_) || _.contentEditable === "true") &&
            ((Fn = _), (fi = d), (Cr = null));
          break;
        case "focusout":
          Cr = fi = Fn = null;
          break;
        case "mousedown":
          pi = !0;
          break;
        case "contextmenu":
        case "mouseup":
        case "dragend":
          ((pi = !1), ya(g, n, m));
          break;
        case "selectionchange":
          if (Np) break;
        case "keydown":
        case "keyup":
          ya(g, n, m);
      }
      var T;
      if (is)
        e: {
          switch (e) {
            case "compositionstart":
              var j = "onCompositionStart";
              break e;
            case "compositionend":
              j = "onCompositionEnd";
              break e;
            case "compositionupdate":
              j = "onCompositionUpdate";
              break e;
          }
          j = void 0;
        }
      else
        In
          ? qu(e, n) && (j = "onCompositionEnd")
          : e === "keydown" && n.keyCode === 229 && (j = "onCompositionStart");
      (j &&
        (Ju &&
          n.locale !== "ko" &&
          (In || j !== "onCompositionStart"
            ? j === "onCompositionEnd" && In && (T = Zu())
            : ((Qt = m),
              (rs = "value" in Qt ? Qt.value : Qt.textContent),
              (In = !0))),
        (_ = Dl(d, j)),
        0 < _.length &&
          ((j = new aa(j, e, null, n, m)),
          g.push({ event: j, listeners: _ }),
          T ? (j.data = T) : ((T = ec(n)), T !== null && (j.data = T)))),
        (T = dp ? fp(e, n) : pp(e, n)) &&
          ((d = Dl(d, "onBeforeInput")),
          0 < d.length &&
            ((m = new aa("onBeforeInput", "beforeinput", null, n, m)),
            g.push({ event: m, listeners: d }),
            (m.data = T))));
    }
    fc(g, t);
  });
}
function Ar(e, t, n) {
  return { instance: e, listener: t, currentTarget: n };
}
function Dl(e, t) {
  for (var n = t + "Capture", r = []; e !== null;) {
    var l = e,
      o = l.stateNode;
    (l.tag === 5 &&
      o !== null &&
      ((l = o),
      (o = _r(e, n)),
      o != null && r.unshift(Ar(e, o, l)),
      (o = _r(e, t)),
      o != null && r.push(Ar(e, o, l))),
      (e = e.return));
  }
  return r;
}
function bn(e) {
  if (e === null) return null;
  do e = e.return;
  while (e && e.tag !== 5);
  return e || null;
}
function wa(e, t, n, r, l) {
  for (var o = t._reactName, i = []; n !== null && n !== r;) {
    var u = n,
      s = u.alternate,
      d = u.stateNode;
    if (s !== null && s === r) break;
    (u.tag === 5 &&
      d !== null &&
      ((u = d),
      l
        ? ((s = _r(n, o)), s != null && i.unshift(Ar(n, s, u)))
        : l || ((s = _r(n, o)), s != null && i.push(Ar(n, s, u)))),
      (n = n.return));
  }
  i.length !== 0 && e.push({ event: t, listeners: i });
}
var Ep = /\r\n?/g,
  Pp = /\u0000|\uFFFD/g;
function ka(e) {
  return (typeof e == "string" ? e : "" + e)
    .replace(
      Ep,
      `
`,
    )
    .replace(Pp, "");
}
function dl(e, t, n) {
  if (((t = ka(t)), ka(e) !== t && n)) throw Error(C(425));
}
function Ol() {}
var mi = null,
  hi = null;
function gi(e, t) {
  return (
    e === "textarea" ||
    e === "noscript" ||
    typeof t.children == "string" ||
    typeof t.children == "number" ||
    (typeof t.dangerouslySetInnerHTML == "object" &&
      t.dangerouslySetInnerHTML !== null &&
      t.dangerouslySetInnerHTML.__html != null)
  );
}
var yi = typeof setTimeout == "function" ? setTimeout : void 0,
  zp = typeof clearTimeout == "function" ? clearTimeout : void 0,
  Sa = typeof Promise == "function" ? Promise : void 0,
  Tp =
    typeof queueMicrotask == "function"
      ? queueMicrotask
      : typeof Sa < "u"
        ? function (e) {
            return Sa.resolve(null).then(e).catch(bp);
          }
        : yi;
function bp(e) {
  setTimeout(function () {
    throw e;
  });
}
function Fo(e, t) {
  var n = t,
    r = 0;
  do {
    var l = n.nextSibling;
    if ((e.removeChild(n), l && l.nodeType === 8))
      if (((n = l.data), n === "/$")) {
        if (r === 0) {
          (e.removeChild(l), Ir(t));
          return;
        }
        r--;
      } else (n !== "$" && n !== "$?" && n !== "$!") || r++;
    n = l;
  } while (n);
  Ir(t);
}
function en(e) {
  for (; e != null; e = e.nextSibling) {
    var t = e.nodeType;
    if (t === 1 || t === 3) break;
    if (t === 8) {
      if (((t = e.data), t === "$" || t === "$!" || t === "$?")) break;
      if (t === "/$") return null;
    }
  }
  return e;
}
function Na(e) {
  e = e.previousSibling;
  for (var t = 0; e;) {
    if (e.nodeType === 8) {
      var n = e.data;
      if (n === "$" || n === "$!" || n === "$?") {
        if (t === 0) return e;
        t--;
      } else n === "/$" && t++;
    }
    e = e.previousSibling;
  }
  return null;
}
var ir = Math.random().toString(36).slice(2),
  Ct = "__reactFiber$" + ir,
  $r = "__reactProps$" + ir,
  It = "__reactContainer$" + ir,
  vi = "__reactEvents$" + ir,
  _p = "__reactListeners$" + ir,
  Rp = "__reactHandles$" + ir;
function hn(e) {
  var t = e[Ct];
  if (t) return t;
  for (var n = e.parentNode; n;) {
    if ((t = n[It] || n[Ct])) {
      if (
        ((n = t.alternate),
        t.child !== null || (n !== null && n.child !== null))
      )
        for (e = Na(e); e !== null;) {
          if ((n = e[Ct])) return n;
          e = Na(e);
        }
      return t;
    }
    ((e = n), (n = e.parentNode));
  }
  return null;
}
function Gr(e) {
  return (
    (e = e[Ct] || e[It]),
    !e || (e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3) ? null : e
  );
}
function On(e) {
  if (e.tag === 5 || e.tag === 6) return e.stateNode;
  throw Error(C(33));
}
function oo(e) {
  return e[$r] || null;
}
var xi = [],
  An = -1;
function un(e) {
  return { current: e };
}
function se(e) {
  0 > An || ((e.current = xi[An]), (xi[An] = null), An--);
}
function oe(e, t) {
  (An++, (xi[An] = e.current), (e.current = t));
}
var sn = {},
  Ie = un(sn),
  Ye = un(!1),
  wn = sn;
function Jn(e, t) {
  var n = e.type.contextTypes;
  if (!n) return sn;
  var r = e.stateNode;
  if (r && r.__reactInternalMemoizedUnmaskedChildContext === t)
    return r.__reactInternalMemoizedMaskedChildContext;
  var l = {},
    o;
  for (o in n) l[o] = t[o];
  return (
    r &&
      ((e = e.stateNode),
      (e.__reactInternalMemoizedUnmaskedChildContext = t),
      (e.__reactInternalMemoizedMaskedChildContext = l)),
    l
  );
}
function Qe(e) {
  return ((e = e.childContextTypes), e != null);
}
function Al() {
  (se(Ye), se(Ie));
}
function ja(e, t, n) {
  if (Ie.current !== sn) throw Error(C(168));
  (oe(Ie, t), oe(Ye, n));
}
function mc(e, t, n) {
  var r = e.stateNode;
  if (((t = t.childContextTypes), typeof r.getChildContext != "function"))
    return n;
  r = r.getChildContext();
  for (var l in r) if (!(l in t)) throw Error(C(108, yf(e) || "Unknown", l));
  return pe({}, n, r);
}
function $l(e) {
  return (
    (e =
      ((e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext) || sn),
    (wn = Ie.current),
    oe(Ie, e),
    oe(Ye, Ye.current),
    !0
  );
}
function Ca(e, t, n) {
  var r = e.stateNode;
  if (!r) throw Error(C(169));
  (n
    ? ((e = mc(e, t, wn)),
      (r.__reactInternalMemoizedMergedChildContext = e),
      se(Ye),
      se(Ie),
      oe(Ie, e))
    : se(Ye),
    oe(Ye, n));
}
var Tt = null,
  io = !1,
  Do = !1;
function hc(e) {
  Tt === null ? (Tt = [e]) : Tt.push(e);
}
function Lp(e) {
  ((io = !0), hc(e));
}
function cn() {
  if (!Do && Tt !== null) {
    Do = !0;
    var e = 0,
      t = ee;
    try {
      var n = Tt;
      for (ee = 1; e < n.length; e++) {
        var r = n[e];
        do r = r(!0);
        while (r !== null);
      }
      ((Tt = null), (io = !1));
    } catch (l) {
      throw (Tt !== null && (Tt = Tt.slice(e + 1)), $u(qi, cn), l);
    } finally {
      ((ee = t), (Do = !1));
    }
  }
  return null;
}
var $n = [],
  Un = 0,
  Ul = null,
  Vl = 0,
  it = [],
  st = 0,
  kn = null,
  bt = 1,
  _t = "";
function pn(e, t) {
  (($n[Un++] = Vl), ($n[Un++] = Ul), (Ul = e), (Vl = t));
}
function gc(e, t, n) {
  ((it[st++] = bt), (it[st++] = _t), (it[st++] = kn), (kn = e));
  var r = bt;
  e = _t;
  var l = 32 - vt(r) - 1;
  ((r &= ~(1 << l)), (n += 1));
  var o = 32 - vt(t) + l;
  if (30 < o) {
    var i = l - (l % 5);
    ((o = (r & ((1 << i) - 1)).toString(32)),
      (r >>= i),
      (l -= i),
      (bt = (1 << (32 - vt(t) + l)) | (n << l) | r),
      (_t = o + e));
  } else ((bt = (1 << o) | (n << l) | r), (_t = e));
}
function as(e) {
  e.return !== null && (pn(e, 1), gc(e, 1, 0));
}
function us(e) {
  for (; e === Ul;)
    ((Ul = $n[--Un]), ($n[Un] = null), (Vl = $n[--Un]), ($n[Un] = null));
  for (; e === kn;)
    ((kn = it[--st]),
      (it[st] = null),
      (_t = it[--st]),
      (it[st] = null),
      (bt = it[--st]),
      (it[st] = null));
}
var qe = null,
  Je = null,
  ue = !1,
  yt = null;
function yc(e, t) {
  var n = at(5, null, null, 0);
  ((n.elementType = "DELETED"),
    (n.stateNode = t),
    (n.return = e),
    (t = e.deletions),
    t === null ? ((e.deletions = [n]), (e.flags |= 16)) : t.push(n));
}
function Ma(e, t) {
  switch (e.tag) {
    case 5:
      var n = e.type;
      return (
        (t =
          t.nodeType !== 1 || n.toLowerCase() !== t.nodeName.toLowerCase()
            ? null
            : t),
        t !== null
          ? ((e.stateNode = t), (qe = e), (Je = en(t.firstChild)), !0)
          : !1
      );
    case 6:
      return (
        (t = e.pendingProps === "" || t.nodeType !== 3 ? null : t),
        t !== null ? ((e.stateNode = t), (qe = e), (Je = null), !0) : !1
      );
    case 13:
      return (
        (t = t.nodeType !== 8 ? null : t),
        t !== null
          ? ((n = kn !== null ? { id: bt, overflow: _t } : null),
            (e.memoizedState = {
              dehydrated: t,
              treeContext: n,
              retryLane: 1073741824,
            }),
            (n = at(18, null, null, 0)),
            (n.stateNode = t),
            (n.return = e),
            (e.child = n),
            (qe = e),
            (Je = null),
            !0)
          : !1
      );
    default:
      return !1;
  }
}
function wi(e) {
  return (e.mode & 1) !== 0 && (e.flags & 128) === 0;
}
function ki(e) {
  if (ue) {
    var t = Je;
    if (t) {
      var n = t;
      if (!Ma(e, t)) {
        if (wi(e)) throw Error(C(418));
        t = en(n.nextSibling);
        var r = qe;
        t && Ma(e, t)
          ? yc(r, n)
          : ((e.flags = (e.flags & -4097) | 2), (ue = !1), (qe = e));
      }
    } else {
      if (wi(e)) throw Error(C(418));
      ((e.flags = (e.flags & -4097) | 2), (ue = !1), (qe = e));
    }
  }
}
function Ea(e) {
  for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13;)
    e = e.return;
  qe = e;
}
function fl(e) {
  if (e !== qe) return !1;
  if (!ue) return (Ea(e), (ue = !0), !1);
  var t;
  if (
    ((t = e.tag !== 3) &&
      !(t = e.tag !== 5) &&
      ((t = e.type),
      (t = t !== "head" && t !== "body" && !gi(e.type, e.memoizedProps))),
    t && (t = Je))
  ) {
    if (wi(e)) throw (vc(), Error(C(418)));
    for (; t;) (yc(e, t), (t = en(t.nextSibling)));
  }
  if ((Ea(e), e.tag === 13)) {
    if (((e = e.memoizedState), (e = e !== null ? e.dehydrated : null), !e))
      throw Error(C(317));
    e: {
      for (e = e.nextSibling, t = 0; e;) {
        if (e.nodeType === 8) {
          var n = e.data;
          if (n === "/$") {
            if (t === 0) {
              Je = en(e.nextSibling);
              break e;
            }
            t--;
          } else (n !== "$" && n !== "$!" && n !== "$?") || t++;
        }
        e = e.nextSibling;
      }
      Je = null;
    }
  } else Je = qe ? en(e.stateNode.nextSibling) : null;
  return !0;
}
function vc() {
  for (var e = Je; e;) e = en(e.nextSibling);
}
function qn() {
  ((Je = qe = null), (ue = !1));
}
function cs(e) {
  yt === null ? (yt = [e]) : yt.push(e);
}
var Ip = Ot.ReactCurrentBatchConfig;
function mr(e, t, n) {
  if (
    ((e = n.ref), e !== null && typeof e != "function" && typeof e != "object")
  ) {
    if (n._owner) {
      if (((n = n._owner), n)) {
        if (n.tag !== 1) throw Error(C(309));
        var r = n.stateNode;
      }
      if (!r) throw Error(C(147, e));
      var l = r,
        o = "" + e;
      return t !== null &&
        t.ref !== null &&
        typeof t.ref == "function" &&
        t.ref._stringRef === o
        ? t.ref
        : ((t = function (i) {
            var u = l.refs;
            i === null ? delete u[o] : (u[o] = i);
          }),
          (t._stringRef = o),
          t);
    }
    if (typeof e != "string") throw Error(C(284));
    if (!n._owner) throw Error(C(290, e));
  }
  return e;
}
function pl(e, t) {
  throw (
    (e = Object.prototype.toString.call(t)),
    Error(
      C(
        31,
        e === "[object Object]"
          ? "object with keys {" + Object.keys(t).join(", ") + "}"
          : e,
      ),
    )
  );
}
function Pa(e) {
  var t = e._init;
  return t(e._payload);
}
function xc(e) {
  function t(f, c) {
    if (e) {
      var p = f.deletions;
      p === null ? ((f.deletions = [c]), (f.flags |= 16)) : p.push(c);
    }
  }
  function n(f, c) {
    if (!e) return null;
    for (; c !== null;) (t(f, c), (c = c.sibling));
    return null;
  }
  function r(f, c) {
    for (f = new Map(); c !== null;)
      (c.key !== null ? f.set(c.key, c) : f.set(c.index, c), (c = c.sibling));
    return f;
  }
  function l(f, c) {
    return ((f = ln(f, c)), (f.index = 0), (f.sibling = null), f);
  }
  function o(f, c, p) {
    return (
      (f.index = p),
      e
        ? ((p = f.alternate),
          p !== null
            ? ((p = p.index), p < c ? ((f.flags |= 2), c) : p)
            : ((f.flags |= 2), c))
        : ((f.flags |= 1048576), c)
    );
  }
  function i(f) {
    return (e && f.alternate === null && (f.flags |= 2), f);
  }
  function u(f, c, p, y) {
    return c === null || c.tag !== 6
      ? ((c = Wo(p, f.mode, y)), (c.return = f), c)
      : ((c = l(c, p)), (c.return = f), c);
  }
  function s(f, c, p, y) {
    var S = p.type;
    return S === Ln
      ? m(f, c, p.props.children, y, p.key)
      : c !== null &&
          (c.elementType === S ||
            (typeof S == "object" &&
              S !== null &&
              S.$$typeof === Wt &&
              Pa(S) === c.type))
        ? ((y = l(c, p.props)), (y.ref = mr(f, c, p)), (y.return = f), y)
        : ((y = zl(p.type, p.key, p.props, null, f.mode, y)),
          (y.ref = mr(f, c, p)),
          (y.return = f),
          y);
  }
  function d(f, c, p, y) {
    return c === null ||
      c.tag !== 4 ||
      c.stateNode.containerInfo !== p.containerInfo ||
      c.stateNode.implementation !== p.implementation
      ? ((c = Bo(p, f.mode, y)), (c.return = f), c)
      : ((c = l(c, p.children || [])), (c.return = f), c);
  }
  function m(f, c, p, y, S) {
    return c === null || c.tag !== 7
      ? ((c = xn(p, f.mode, y, S)), (c.return = f), c)
      : ((c = l(c, p)), (c.return = f), c);
  }
  function g(f, c, p) {
    if ((typeof c == "string" && c !== "") || typeof c == "number")
      return ((c = Wo("" + c, f.mode, p)), (c.return = f), c);
    if (typeof c == "object" && c !== null) {
      switch (c.$$typeof) {
        case nl:
          return (
            (p = zl(c.type, c.key, c.props, null, f.mode, p)),
            (p.ref = mr(f, null, c)),
            (p.return = f),
            p
          );
        case Rn:
          return ((c = Bo(c, f.mode, p)), (c.return = f), c);
        case Wt:
          var y = c._init;
          return g(f, y(c._payload), p);
      }
      if (vr(c) || ur(c))
        return ((c = xn(c, f.mode, p, null)), (c.return = f), c);
      pl(f, c);
    }
    return null;
  }
  function h(f, c, p, y) {
    var S = c !== null ? c.key : null;
    if ((typeof p == "string" && p !== "") || typeof p == "number")
      return S !== null ? null : u(f, c, "" + p, y);
    if (typeof p == "object" && p !== null) {
      switch (p.$$typeof) {
        case nl:
          return p.key === S ? s(f, c, p, y) : null;
        case Rn:
          return p.key === S ? d(f, c, p, y) : null;
        case Wt:
          return ((S = p._init), h(f, c, S(p._payload), y));
      }
      if (vr(p) || ur(p)) return S !== null ? null : m(f, c, p, y, null);
      pl(f, p);
    }
    return null;
  }
  function v(f, c, p, y, S) {
    if ((typeof y == "string" && y !== "") || typeof y == "number")
      return ((f = f.get(p) || null), u(c, f, "" + y, S));
    if (typeof y == "object" && y !== null) {
      switch (y.$$typeof) {
        case nl:
          return (
            (f = f.get(y.key === null ? p : y.key) || null),
            s(c, f, y, S)
          );
        case Rn:
          return (
            (f = f.get(y.key === null ? p : y.key) || null),
            d(c, f, y, S)
          );
        case Wt:
          var _ = y._init;
          return v(f, c, p, _(y._payload), S);
      }
      if (vr(y) || ur(y)) return ((f = f.get(p) || null), m(c, f, y, S, null));
      pl(c, y);
    }
    return null;
  }
  function w(f, c, p, y) {
    for (
      var S = null, _ = null, T = c, j = (c = 0), U = null;
      T !== null && j < p.length;
      j++
    ) {
      T.index > j ? ((U = T), (T = null)) : (U = T.sibling);
      var b = h(f, T, p[j], y);
      if (b === null) {
        T === null && (T = U);
        break;
      }
      (e && T && b.alternate === null && t(f, T),
        (c = o(b, c, j)),
        _ === null ? (S = b) : (_.sibling = b),
        (_ = b),
        (T = U));
    }
    if (j === p.length) return (n(f, T), ue && pn(f, j), S);
    if (T === null) {
      for (; j < p.length; j++)
        ((T = g(f, p[j], y)),
          T !== null &&
            ((c = o(T, c, j)),
            _ === null ? (S = T) : (_.sibling = T),
            (_ = T)));
      return (ue && pn(f, j), S);
    }
    for (T = r(f, T); j < p.length; j++)
      ((U = v(T, f, j, p[j], y)),
        U !== null &&
          (e && U.alternate !== null && T.delete(U.key === null ? j : U.key),
          (c = o(U, c, j)),
          _ === null ? (S = U) : (_.sibling = U),
          (_ = U)));
    return (
      e &&
        T.forEach(function (A) {
          return t(f, A);
        }),
      ue && pn(f, j),
      S
    );
  }
  function x(f, c, p, y) {
    var S = ur(p);
    if (typeof S != "function") throw Error(C(150));
    if (((p = S.call(p)), p == null)) throw Error(C(151));
    for (
      var _ = (S = null), T = c, j = (c = 0), U = null, b = p.next();
      T !== null && !b.done;
      j++, b = p.next()
    ) {
      T.index > j ? ((U = T), (T = null)) : (U = T.sibling);
      var A = h(f, T, b.value, y);
      if (A === null) {
        T === null && (T = U);
        break;
      }
      (e && T && A.alternate === null && t(f, T),
        (c = o(A, c, j)),
        _ === null ? (S = A) : (_.sibling = A),
        (_ = A),
        (T = U));
    }
    if (b.done) return (n(f, T), ue && pn(f, j), S);
    if (T === null) {
      for (; !b.done; j++, b = p.next())
        ((b = g(f, b.value, y)),
          b !== null &&
            ((c = o(b, c, j)),
            _ === null ? (S = b) : (_.sibling = b),
            (_ = b)));
      return (ue && pn(f, j), S);
    }
    for (T = r(f, T); !b.done; j++, b = p.next())
      ((b = v(T, f, j, b.value, y)),
        b !== null &&
          (e && b.alternate !== null && T.delete(b.key === null ? j : b.key),
          (c = o(b, c, j)),
          _ === null ? (S = b) : (_.sibling = b),
          (_ = b)));
    return (
      e &&
        T.forEach(function (J) {
          return t(f, J);
        }),
      ue && pn(f, j),
      S
    );
  }
  function F(f, c, p, y) {
    if (
      (typeof p == "object" &&
        p !== null &&
        p.type === Ln &&
        p.key === null &&
        (p = p.props.children),
      typeof p == "object" && p !== null)
    ) {
      switch (p.$$typeof) {
        case nl:
          e: {
            for (var S = p.key, _ = c; _ !== null;) {
              if (_.key === S) {
                if (((S = p.type), S === Ln)) {
                  if (_.tag === 7) {
                    (n(f, _.sibling),
                      (c = l(_, p.props.children)),
                      (c.return = f),
                      (f = c));
                    break e;
                  }
                } else if (
                  _.elementType === S ||
                  (typeof S == "object" &&
                    S !== null &&
                    S.$$typeof === Wt &&
                    Pa(S) === _.type)
                ) {
                  (n(f, _.sibling),
                    (c = l(_, p.props)),
                    (c.ref = mr(f, _, p)),
                    (c.return = f),
                    (f = c));
                  break e;
                }
                n(f, _);
                break;
              } else t(f, _);
              _ = _.sibling;
            }
            p.type === Ln
              ? ((c = xn(p.props.children, f.mode, y, p.key)),
                (c.return = f),
                (f = c))
              : ((y = zl(p.type, p.key, p.props, null, f.mode, y)),
                (y.ref = mr(f, c, p)),
                (y.return = f),
                (f = y));
          }
          return i(f);
        case Rn:
          e: {
            for (_ = p.key; c !== null;) {
              if (c.key === _)
                if (
                  c.tag === 4 &&
                  c.stateNode.containerInfo === p.containerInfo &&
                  c.stateNode.implementation === p.implementation
                ) {
                  (n(f, c.sibling),
                    (c = l(c, p.children || [])),
                    (c.return = f),
                    (f = c));
                  break e;
                } else {
                  n(f, c);
                  break;
                }
              else t(f, c);
              c = c.sibling;
            }
            ((c = Bo(p, f.mode, y)), (c.return = f), (f = c));
          }
          return i(f);
        case Wt:
          return ((_ = p._init), F(f, c, _(p._payload), y));
      }
      if (vr(p)) return w(f, c, p, y);
      if (ur(p)) return x(f, c, p, y);
      pl(f, p);
    }
    return (typeof p == "string" && p !== "") || typeof p == "number"
      ? ((p = "" + p),
        c !== null && c.tag === 6
          ? (n(f, c.sibling), (c = l(c, p)), (c.return = f), (f = c))
          : (n(f, c), (c = Wo(p, f.mode, y)), (c.return = f), (f = c)),
        i(f))
      : n(f, c);
  }
  return F;
}
var er = xc(!0),
  wc = xc(!1),
  Hl = un(null),
  Wl = null,
  Vn = null,
  ds = null;
function fs() {
  ds = Vn = Wl = null;
}
function ps(e) {
  var t = Hl.current;
  (se(Hl), (e._currentValue = t));
}
function Si(e, t, n) {
  for (; e !== null;) {
    var r = e.alternate;
    if (
      ((e.childLanes & t) !== t
        ? ((e.childLanes |= t), r !== null && (r.childLanes |= t))
        : r !== null && (r.childLanes & t) !== t && (r.childLanes |= t),
      e === n)
    )
      break;
    e = e.return;
  }
}
function Kn(e, t) {
  ((Wl = e),
    (ds = Vn = null),
    (e = e.dependencies),
    e !== null &&
      e.firstContext !== null &&
      (e.lanes & t && (Xe = !0), (e.firstContext = null)));
}
function ct(e) {
  var t = e._currentValue;
  if (ds !== e)
    if (((e = { context: e, memoizedValue: t, next: null }), Vn === null)) {
      if (Wl === null) throw Error(C(308));
      ((Vn = e), (Wl.dependencies = { lanes: 0, firstContext: e }));
    } else Vn = Vn.next = e;
  return t;
}
var gn = null;
function ms(e) {
  gn === null ? (gn = [e]) : gn.push(e);
}
function kc(e, t, n, r) {
  var l = t.interleaved;
  return (
    l === null ? ((n.next = n), ms(t)) : ((n.next = l.next), (l.next = n)),
    (t.interleaved = n),
    Ft(e, r)
  );
}
function Ft(e, t) {
  e.lanes |= t;
  var n = e.alternate;
  for (n !== null && (n.lanes |= t), n = e, e = e.return; e !== null;)
    ((e.childLanes |= t),
      (n = e.alternate),
      n !== null && (n.childLanes |= t),
      (n = e),
      (e = e.return));
  return n.tag === 3 ? n.stateNode : null;
}
var Bt = !1;
function hs(e) {
  e.updateQueue = {
    baseState: e.memoizedState,
    firstBaseUpdate: null,
    lastBaseUpdate: null,
    shared: { pending: null, interleaved: null, lanes: 0 },
    effects: null,
  };
}
function Sc(e, t) {
  ((e = e.updateQueue),
    t.updateQueue === e &&
      (t.updateQueue = {
        baseState: e.baseState,
        firstBaseUpdate: e.firstBaseUpdate,
        lastBaseUpdate: e.lastBaseUpdate,
        shared: e.shared,
        effects: e.effects,
      }));
}
function Rt(e, t) {
  return {
    eventTime: e,
    lane: t,
    tag: 0,
    payload: null,
    callback: null,
    next: null,
  };
}
function tn(e, t, n) {
  var r = e.updateQueue;
  if (r === null) return null;
  if (((r = r.shared), K & 2)) {
    var l = r.pending;
    return (
      l === null ? (t.next = t) : ((t.next = l.next), (l.next = t)),
      (r.pending = t),
      Ft(e, n)
    );
  }
  return (
    (l = r.interleaved),
    l === null ? ((t.next = t), ms(r)) : ((t.next = l.next), (l.next = t)),
    (r.interleaved = t),
    Ft(e, n)
  );
}
function Nl(e, t, n) {
  if (
    ((t = t.updateQueue), t !== null && ((t = t.shared), (n & 4194240) !== 0))
  ) {
    var r = t.lanes;
    ((r &= e.pendingLanes), (n |= r), (t.lanes = n), es(e, n));
  }
}
function za(e, t) {
  var n = e.updateQueue,
    r = e.alternate;
  if (r !== null && ((r = r.updateQueue), n === r)) {
    var l = null,
      o = null;
    if (((n = n.firstBaseUpdate), n !== null)) {
      do {
        var i = {
          eventTime: n.eventTime,
          lane: n.lane,
          tag: n.tag,
          payload: n.payload,
          callback: n.callback,
          next: null,
        };
        (o === null ? (l = o = i) : (o = o.next = i), (n = n.next));
      } while (n !== null);
      o === null ? (l = o = t) : (o = o.next = t);
    } else l = o = t;
    ((n = {
      baseState: r.baseState,
      firstBaseUpdate: l,
      lastBaseUpdate: o,
      shared: r.shared,
      effects: r.effects,
    }),
      (e.updateQueue = n));
    return;
  }
  ((e = n.lastBaseUpdate),
    e === null ? (n.firstBaseUpdate = t) : (e.next = t),
    (n.lastBaseUpdate = t));
}
function Bl(e, t, n, r) {
  var l = e.updateQueue;
  Bt = !1;
  var o = l.firstBaseUpdate,
    i = l.lastBaseUpdate,
    u = l.shared.pending;
  if (u !== null) {
    l.shared.pending = null;
    var s = u,
      d = s.next;
    ((s.next = null), i === null ? (o = d) : (i.next = d), (i = s));
    var m = e.alternate;
    m !== null &&
      ((m = m.updateQueue),
      (u = m.lastBaseUpdate),
      u !== i &&
        (u === null ? (m.firstBaseUpdate = d) : (u.next = d),
        (m.lastBaseUpdate = s)));
  }
  if (o !== null) {
    var g = l.baseState;
    ((i = 0), (m = d = s = null), (u = o));
    do {
      var h = u.lane,
        v = u.eventTime;
      if ((r & h) === h) {
        m !== null &&
          (m = m.next =
            {
              eventTime: v,
              lane: 0,
              tag: u.tag,
              payload: u.payload,
              callback: u.callback,
              next: null,
            });
        e: {
          var w = e,
            x = u;
          switch (((h = t), (v = n), x.tag)) {
            case 1:
              if (((w = x.payload), typeof w == "function")) {
                g = w.call(v, g, h);
                break e;
              }
              g = w;
              break e;
            case 3:
              w.flags = (w.flags & -65537) | 128;
            case 0:
              if (
                ((w = x.payload),
                (h = typeof w == "function" ? w.call(v, g, h) : w),
                h == null)
              )
                break e;
              g = pe({}, g, h);
              break e;
            case 2:
              Bt = !0;
          }
        }
        u.callback !== null &&
          u.lane !== 0 &&
          ((e.flags |= 64),
          (h = l.effects),
          h === null ? (l.effects = [u]) : h.push(u));
      } else
        ((v = {
          eventTime: v,
          lane: h,
          tag: u.tag,
          payload: u.payload,
          callback: u.callback,
          next: null,
        }),
          m === null ? ((d = m = v), (s = g)) : (m = m.next = v),
          (i |= h));
      if (((u = u.next), u === null)) {
        if (((u = l.shared.pending), u === null)) break;
        ((h = u),
          (u = h.next),
          (h.next = null),
          (l.lastBaseUpdate = h),
          (l.shared.pending = null));
      }
    } while (!0);
    if (
      (m === null && (s = g),
      (l.baseState = s),
      (l.firstBaseUpdate = d),
      (l.lastBaseUpdate = m),
      (t = l.shared.interleaved),
      t !== null)
    ) {
      l = t;
      do ((i |= l.lane), (l = l.next));
      while (l !== t);
    } else o === null && (l.shared.lanes = 0);
    ((Nn |= i), (e.lanes = i), (e.memoizedState = g));
  }
}
function Ta(e, t, n) {
  if (((e = t.effects), (t.effects = null), e !== null))
    for (t = 0; t < e.length; t++) {
      var r = e[t],
        l = r.callback;
      if (l !== null) {
        if (((r.callback = null), (r = n), typeof l != "function"))
          throw Error(C(191, l));
        l.call(r);
      }
    }
}
var Zr = {},
  Et = un(Zr),
  Ur = un(Zr),
  Vr = un(Zr);
function yn(e) {
  if (e === Zr) throw Error(C(174));
  return e;
}
function gs(e, t) {
  switch ((oe(Vr, t), oe(Ur, e), oe(Et, Zr), (e = t.nodeType), e)) {
    case 9:
    case 11:
      t = (t = t.documentElement) ? t.namespaceURI : ni(null, "");
      break;
    default:
      ((e = e === 8 ? t.parentNode : t),
        (t = e.namespaceURI || null),
        (e = e.tagName),
        (t = ni(t, e)));
  }
  (se(Et), oe(Et, t));
}
function tr() {
  (se(Et), se(Ur), se(Vr));
}
function Nc(e) {
  yn(Vr.current);
  var t = yn(Et.current),
    n = ni(t, e.type);
  t !== n && (oe(Ur, e), oe(Et, n));
}
function ys(e) {
  Ur.current === e && (se(Et), se(Ur));
}
var de = un(0);
function Xl(e) {
  for (var t = e; t !== null;) {
    if (t.tag === 13) {
      var n = t.memoizedState;
      if (
        n !== null &&
        ((n = n.dehydrated), n === null || n.data === "$?" || n.data === "$!")
      )
        return t;
    } else if (t.tag === 19 && t.memoizedProps.revealOrder !== void 0) {
      if (t.flags & 128) return t;
    } else if (t.child !== null) {
      ((t.child.return = t), (t = t.child));
      continue;
    }
    if (t === e) break;
    for (; t.sibling === null;) {
      if (t.return === null || t.return === e) return null;
      t = t.return;
    }
    ((t.sibling.return = t.return), (t = t.sibling));
  }
  return null;
}
var Oo = [];
function vs() {
  for (var e = 0; e < Oo.length; e++)
    Oo[e]._workInProgressVersionPrimary = null;
  Oo.length = 0;
}
var jl = Ot.ReactCurrentDispatcher,
  Ao = Ot.ReactCurrentBatchConfig,
  Sn = 0,
  fe = null,
  Ne = null,
  Ee = null,
  Yl = !1,
  Mr = !1,
  Hr = 0,
  Fp = 0;
function _e() {
  throw Error(C(321));
}
function xs(e, t) {
  if (t === null) return !1;
  for (var n = 0; n < t.length && n < e.length; n++)
    if (!wt(e[n], t[n])) return !1;
  return !0;
}
function ws(e, t, n, r, l, o) {
  if (
    ((Sn = o),
    (fe = t),
    (t.memoizedState = null),
    (t.updateQueue = null),
    (t.lanes = 0),
    (jl.current = e === null || e.memoizedState === null ? $p : Up),
    (e = n(r, l)),
    Mr)
  ) {
    o = 0;
    do {
      if (((Mr = !1), (Hr = 0), 25 <= o)) throw Error(C(301));
      ((o += 1),
        (Ee = Ne = null),
        (t.updateQueue = null),
        (jl.current = Vp),
        (e = n(r, l)));
    } while (Mr);
  }
  if (
    ((jl.current = Ql),
    (t = Ne !== null && Ne.next !== null),
    (Sn = 0),
    (Ee = Ne = fe = null),
    (Yl = !1),
    t)
  )
    throw Error(C(300));
  return e;
}
function ks() {
  var e = Hr !== 0;
  return ((Hr = 0), e);
}
function jt() {
  var e = {
    memoizedState: null,
    baseState: null,
    baseQueue: null,
    queue: null,
    next: null,
  };
  return (Ee === null ? (fe.memoizedState = Ee = e) : (Ee = Ee.next = e), Ee);
}
function dt() {
  if (Ne === null) {
    var e = fe.alternate;
    e = e !== null ? e.memoizedState : null;
  } else e = Ne.next;
  var t = Ee === null ? fe.memoizedState : Ee.next;
  if (t !== null) ((Ee = t), (Ne = e));
  else {
    if (e === null) throw Error(C(310));
    ((Ne = e),
      (e = {
        memoizedState: Ne.memoizedState,
        baseState: Ne.baseState,
        baseQueue: Ne.baseQueue,
        queue: Ne.queue,
        next: null,
      }),
      Ee === null ? (fe.memoizedState = Ee = e) : (Ee = Ee.next = e));
  }
  return Ee;
}
function Wr(e, t) {
  return typeof t == "function" ? t(e) : t;
}
function $o(e) {
  var t = dt(),
    n = t.queue;
  if (n === null) throw Error(C(311));
  n.lastRenderedReducer = e;
  var r = Ne,
    l = r.baseQueue,
    o = n.pending;
  if (o !== null) {
    if (l !== null) {
      var i = l.next;
      ((l.next = o.next), (o.next = i));
    }
    ((r.baseQueue = l = o), (n.pending = null));
  }
  if (l !== null) {
    ((o = l.next), (r = r.baseState));
    var u = (i = null),
      s = null,
      d = o;
    do {
      var m = d.lane;
      if ((Sn & m) === m)
        (s !== null &&
          (s = s.next =
            {
              lane: 0,
              action: d.action,
              hasEagerState: d.hasEagerState,
              eagerState: d.eagerState,
              next: null,
            }),
          (r = d.hasEagerState ? d.eagerState : e(r, d.action)));
      else {
        var g = {
          lane: m,
          action: d.action,
          hasEagerState: d.hasEagerState,
          eagerState: d.eagerState,
          next: null,
        };
        (s === null ? ((u = s = g), (i = r)) : (s = s.next = g),
          (fe.lanes |= m),
          (Nn |= m));
      }
      d = d.next;
    } while (d !== null && d !== o);
    (s === null ? (i = r) : (s.next = u),
      wt(r, t.memoizedState) || (Xe = !0),
      (t.memoizedState = r),
      (t.baseState = i),
      (t.baseQueue = s),
      (n.lastRenderedState = r));
  }
  if (((e = n.interleaved), e !== null)) {
    l = e;
    do ((o = l.lane), (fe.lanes |= o), (Nn |= o), (l = l.next));
    while (l !== e);
  } else l === null && (n.lanes = 0);
  return [t.memoizedState, n.dispatch];
}
function Uo(e) {
  var t = dt(),
    n = t.queue;
  if (n === null) throw Error(C(311));
  n.lastRenderedReducer = e;
  var r = n.dispatch,
    l = n.pending,
    o = t.memoizedState;
  if (l !== null) {
    n.pending = null;
    var i = (l = l.next);
    do ((o = e(o, i.action)), (i = i.next));
    while (i !== l);
    (wt(o, t.memoizedState) || (Xe = !0),
      (t.memoizedState = o),
      t.baseQueue === null && (t.baseState = o),
      (n.lastRenderedState = o));
  }
  return [o, r];
}
function jc() {}
function Cc(e, t) {
  var n = fe,
    r = dt(),
    l = t(),
    o = !wt(r.memoizedState, l);
  if (
    (o && ((r.memoizedState = l), (Xe = !0)),
    (r = r.queue),
    Ss(Pc.bind(null, n, r, e), [e]),
    r.getSnapshot !== t || o || (Ee !== null && Ee.memoizedState.tag & 1))
  ) {
    if (
      ((n.flags |= 2048),
      Br(9, Ec.bind(null, n, r, l, t), void 0, null),
      Pe === null)
    )
      throw Error(C(349));
    Sn & 30 || Mc(n, t, l);
  }
  return l;
}
function Mc(e, t, n) {
  ((e.flags |= 16384),
    (e = { getSnapshot: t, value: n }),
    (t = fe.updateQueue),
    t === null
      ? ((t = { lastEffect: null, stores: null }),
        (fe.updateQueue = t),
        (t.stores = [e]))
      : ((n = t.stores), n === null ? (t.stores = [e]) : n.push(e)));
}
function Ec(e, t, n, r) {
  ((t.value = n), (t.getSnapshot = r), zc(t) && Tc(e));
}
function Pc(e, t, n) {
  return n(function () {
    zc(t) && Tc(e);
  });
}
function zc(e) {
  var t = e.getSnapshot;
  e = e.value;
  try {
    var n = t();
    return !wt(e, n);
  } catch {
    return !0;
  }
}
function Tc(e) {
  var t = Ft(e, 1);
  t !== null && xt(t, e, 1, -1);
}
function ba(e) {
  var t = jt();
  return (
    typeof e == "function" && (e = e()),
    (t.memoizedState = t.baseState = e),
    (e = {
      pending: null,
      interleaved: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: Wr,
      lastRenderedState: e,
    }),
    (t.queue = e),
    (e = e.dispatch = Ap.bind(null, fe, e)),
    [t.memoizedState, e]
  );
}
function Br(e, t, n, r) {
  return (
    (e = { tag: e, create: t, destroy: n, deps: r, next: null }),
    (t = fe.updateQueue),
    t === null
      ? ((t = { lastEffect: null, stores: null }),
        (fe.updateQueue = t),
        (t.lastEffect = e.next = e))
      : ((n = t.lastEffect),
        n === null
          ? (t.lastEffect = e.next = e)
          : ((r = n.next), (n.next = e), (e.next = r), (t.lastEffect = e))),
    e
  );
}
function bc() {
  return dt().memoizedState;
}
function Cl(e, t, n, r) {
  var l = jt();
  ((fe.flags |= e),
    (l.memoizedState = Br(1 | t, n, void 0, r === void 0 ? null : r)));
}
function so(e, t, n, r) {
  var l = dt();
  r = r === void 0 ? null : r;
  var o = void 0;
  if (Ne !== null) {
    var i = Ne.memoizedState;
    if (((o = i.destroy), r !== null && xs(r, i.deps))) {
      l.memoizedState = Br(t, n, o, r);
      return;
    }
  }
  ((fe.flags |= e), (l.memoizedState = Br(1 | t, n, o, r)));
}
function _a(e, t) {
  return Cl(8390656, 8, e, t);
}
function Ss(e, t) {
  return so(2048, 8, e, t);
}
function _c(e, t) {
  return so(4, 2, e, t);
}
function Rc(e, t) {
  return so(4, 4, e, t);
}
function Lc(e, t) {
  if (typeof t == "function")
    return (
      (e = e()),
      t(e),
      function () {
        t(null);
      }
    );
  if (t != null)
    return (
      (e = e()),
      (t.current = e),
      function () {
        t.current = null;
      }
    );
}
function Ic(e, t, n) {
  return (
    (n = n != null ? n.concat([e]) : null),
    so(4, 4, Lc.bind(null, t, e), n)
  );
}
function Ns() {}
function Fc(e, t) {
  var n = dt();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && xs(t, r[1])
    ? r[0]
    : ((n.memoizedState = [e, t]), e);
}
function Dc(e, t) {
  var n = dt();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && xs(t, r[1])
    ? r[0]
    : ((e = e()), (n.memoizedState = [e, t]), e);
}
function Oc(e, t, n) {
  return Sn & 21
    ? (wt(n, t) || ((n = Hu()), (fe.lanes |= n), (Nn |= n), (e.baseState = !0)),
      t)
    : (e.baseState && ((e.baseState = !1), (Xe = !0)), (e.memoizedState = n));
}
function Dp(e, t) {
  var n = ee;
  ((ee = n !== 0 && 4 > n ? n : 4), e(!0));
  var r = Ao.transition;
  Ao.transition = {};
  try {
    (e(!1), t());
  } finally {
    ((ee = n), (Ao.transition = r));
  }
}
function Ac() {
  return dt().memoizedState;
}
function Op(e, t, n) {
  var r = rn(e);
  if (
    ((n = {
      lane: r,
      action: n,
      hasEagerState: !1,
      eagerState: null,
      next: null,
    }),
    $c(e))
  )
    Uc(t, n);
  else if (((n = kc(e, t, n, r)), n !== null)) {
    var l = $e();
    (xt(n, e, r, l), Vc(n, t, r));
  }
}
function Ap(e, t, n) {
  var r = rn(e),
    l = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null };
  if ($c(e)) Uc(t, l);
  else {
    var o = e.alternate;
    if (
      e.lanes === 0 &&
      (o === null || o.lanes === 0) &&
      ((o = t.lastRenderedReducer), o !== null)
    )
      try {
        var i = t.lastRenderedState,
          u = o(i, n);
        if (((l.hasEagerState = !0), (l.eagerState = u), wt(u, i))) {
          var s = t.interleaved;
          (s === null
            ? ((l.next = l), ms(t))
            : ((l.next = s.next), (s.next = l)),
            (t.interleaved = l));
          return;
        }
      } catch {
      } finally {
      }
    ((n = kc(e, t, l, r)),
      n !== null && ((l = $e()), xt(n, e, r, l), Vc(n, t, r)));
  }
}
function $c(e) {
  var t = e.alternate;
  return e === fe || (t !== null && t === fe);
}
function Uc(e, t) {
  Mr = Yl = !0;
  var n = e.pending;
  (n === null ? (t.next = t) : ((t.next = n.next), (n.next = t)),
    (e.pending = t));
}
function Vc(e, t, n) {
  if (n & 4194240) {
    var r = t.lanes;
    ((r &= e.pendingLanes), (n |= r), (t.lanes = n), es(e, n));
  }
}
var Ql = {
    readContext: ct,
    useCallback: _e,
    useContext: _e,
    useEffect: _e,
    useImperativeHandle: _e,
    useInsertionEffect: _e,
    useLayoutEffect: _e,
    useMemo: _e,
    useReducer: _e,
    useRef: _e,
    useState: _e,
    useDebugValue: _e,
    useDeferredValue: _e,
    useTransition: _e,
    useMutableSource: _e,
    useSyncExternalStore: _e,
    useId: _e,
    unstable_isNewReconciler: !1,
  },
  $p = {
    readContext: ct,
    useCallback: function (e, t) {
      return ((jt().memoizedState = [e, t === void 0 ? null : t]), e);
    },
    useContext: ct,
    useEffect: _a,
    useImperativeHandle: function (e, t, n) {
      return (
        (n = n != null ? n.concat([e]) : null),
        Cl(4194308, 4, Lc.bind(null, t, e), n)
      );
    },
    useLayoutEffect: function (e, t) {
      return Cl(4194308, 4, e, t);
    },
    useInsertionEffect: function (e, t) {
      return Cl(4, 2, e, t);
    },
    useMemo: function (e, t) {
      var n = jt();
      return (
        (t = t === void 0 ? null : t),
        (e = e()),
        (n.memoizedState = [e, t]),
        e
      );
    },
    useReducer: function (e, t, n) {
      var r = jt();
      return (
        (t = n !== void 0 ? n(t) : t),
        (r.memoizedState = r.baseState = t),
        (e = {
          pending: null,
          interleaved: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: e,
          lastRenderedState: t,
        }),
        (r.queue = e),
        (e = e.dispatch = Op.bind(null, fe, e)),
        [r.memoizedState, e]
      );
    },
    useRef: function (e) {
      var t = jt();
      return ((e = { current: e }), (t.memoizedState = e));
    },
    useState: ba,
    useDebugValue: Ns,
    useDeferredValue: function (e) {
      return (jt().memoizedState = e);
    },
    useTransition: function () {
      var e = ba(!1),
        t = e[0];
      return ((e = Dp.bind(null, e[1])), (jt().memoizedState = e), [t, e]);
    },
    useMutableSource: function () {},
    useSyncExternalStore: function (e, t, n) {
      var r = fe,
        l = jt();
      if (ue) {
        if (n === void 0) throw Error(C(407));
        n = n();
      } else {
        if (((n = t()), Pe === null)) throw Error(C(349));
        Sn & 30 || Mc(r, t, n);
      }
      l.memoizedState = n;
      var o = { value: n, getSnapshot: t };
      return (
        (l.queue = o),
        _a(Pc.bind(null, r, o, e), [e]),
        (r.flags |= 2048),
        Br(9, Ec.bind(null, r, o, n, t), void 0, null),
        n
      );
    },
    useId: function () {
      var e = jt(),
        t = Pe.identifierPrefix;
      if (ue) {
        var n = _t,
          r = bt;
        ((n = (r & ~(1 << (32 - vt(r) - 1))).toString(32) + n),
          (t = ":" + t + "R" + n),
          (n = Hr++),
          0 < n && (t += "H" + n.toString(32)),
          (t += ":"));
      } else ((n = Fp++), (t = ":" + t + "r" + n.toString(32) + ":"));
      return (e.memoizedState = t);
    },
    unstable_isNewReconciler: !1,
  },
  Up = {
    readContext: ct,
    useCallback: Fc,
    useContext: ct,
    useEffect: Ss,
    useImperativeHandle: Ic,
    useInsertionEffect: _c,
    useLayoutEffect: Rc,
    useMemo: Dc,
    useReducer: $o,
    useRef: bc,
    useState: function () {
      return $o(Wr);
    },
    useDebugValue: Ns,
    useDeferredValue: function (e) {
      var t = dt();
      return Oc(t, Ne.memoizedState, e);
    },
    useTransition: function () {
      var e = $o(Wr)[0],
        t = dt().memoizedState;
      return [e, t];
    },
    useMutableSource: jc,
    useSyncExternalStore: Cc,
    useId: Ac,
    unstable_isNewReconciler: !1,
  },
  Vp = {
    readContext: ct,
    useCallback: Fc,
    useContext: ct,
    useEffect: Ss,
    useImperativeHandle: Ic,
    useInsertionEffect: _c,
    useLayoutEffect: Rc,
    useMemo: Dc,
    useReducer: Uo,
    useRef: bc,
    useState: function () {
      return Uo(Wr);
    },
    useDebugValue: Ns,
    useDeferredValue: function (e) {
      var t = dt();
      return Ne === null ? (t.memoizedState = e) : Oc(t, Ne.memoizedState, e);
    },
    useTransition: function () {
      var e = Uo(Wr)[0],
        t = dt().memoizedState;
      return [e, t];
    },
    useMutableSource: jc,
    useSyncExternalStore: Cc,
    useId: Ac,
    unstable_isNewReconciler: !1,
  };
function ht(e, t) {
  if (e && e.defaultProps) {
    ((t = pe({}, t)), (e = e.defaultProps));
    for (var n in e) t[n] === void 0 && (t[n] = e[n]);
    return t;
  }
  return t;
}
function Ni(e, t, n, r) {
  ((t = e.memoizedState),
    (n = n(r, t)),
    (n = n == null ? t : pe({}, t, n)),
    (e.memoizedState = n),
    e.lanes === 0 && (e.updateQueue.baseState = n));
}
var ao = {
  isMounted: function (e) {
    return (e = e._reactInternals) ? Mn(e) === e : !1;
  },
  enqueueSetState: function (e, t, n) {
    e = e._reactInternals;
    var r = $e(),
      l = rn(e),
      o = Rt(r, l);
    ((o.payload = t),
      n != null && (o.callback = n),
      (t = tn(e, o, l)),
      t !== null && (xt(t, e, l, r), Nl(t, e, l)));
  },
  enqueueReplaceState: function (e, t, n) {
    e = e._reactInternals;
    var r = $e(),
      l = rn(e),
      o = Rt(r, l);
    ((o.tag = 1),
      (o.payload = t),
      n != null && (o.callback = n),
      (t = tn(e, o, l)),
      t !== null && (xt(t, e, l, r), Nl(t, e, l)));
  },
  enqueueForceUpdate: function (e, t) {
    e = e._reactInternals;
    var n = $e(),
      r = rn(e),
      l = Rt(n, r);
    ((l.tag = 2),
      t != null && (l.callback = t),
      (t = tn(e, l, r)),
      t !== null && (xt(t, e, r, n), Nl(t, e, r)));
  },
};
function Ra(e, t, n, r, l, o, i) {
  return (
    (e = e.stateNode),
    typeof e.shouldComponentUpdate == "function"
      ? e.shouldComponentUpdate(r, o, i)
      : t.prototype && t.prototype.isPureReactComponent
        ? !Dr(n, r) || !Dr(l, o)
        : !0
  );
}
function Hc(e, t, n) {
  var r = !1,
    l = sn,
    o = t.contextType;
  return (
    typeof o == "object" && o !== null
      ? (o = ct(o))
      : ((l = Qe(t) ? wn : Ie.current),
        (r = t.contextTypes),
        (o = (r = r != null) ? Jn(e, l) : sn)),
    (t = new t(n, o)),
    (e.memoizedState = t.state !== null && t.state !== void 0 ? t.state : null),
    (t.updater = ao),
    (e.stateNode = t),
    (t._reactInternals = e),
    r &&
      ((e = e.stateNode),
      (e.__reactInternalMemoizedUnmaskedChildContext = l),
      (e.__reactInternalMemoizedMaskedChildContext = o)),
    t
  );
}
function La(e, t, n, r) {
  ((e = t.state),
    typeof t.componentWillReceiveProps == "function" &&
      t.componentWillReceiveProps(n, r),
    typeof t.UNSAFE_componentWillReceiveProps == "function" &&
      t.UNSAFE_componentWillReceiveProps(n, r),
    t.state !== e && ao.enqueueReplaceState(t, t.state, null));
}
function ji(e, t, n, r) {
  var l = e.stateNode;
  ((l.props = n), (l.state = e.memoizedState), (l.refs = {}), hs(e));
  var o = t.contextType;
  (typeof o == "object" && o !== null
    ? (l.context = ct(o))
    : ((o = Qe(t) ? wn : Ie.current), (l.context = Jn(e, o))),
    (l.state = e.memoizedState),
    (o = t.getDerivedStateFromProps),
    typeof o == "function" && (Ni(e, t, o, n), (l.state = e.memoizedState)),
    typeof t.getDerivedStateFromProps == "function" ||
      typeof l.getSnapshotBeforeUpdate == "function" ||
      (typeof l.UNSAFE_componentWillMount != "function" &&
        typeof l.componentWillMount != "function") ||
      ((t = l.state),
      typeof l.componentWillMount == "function" && l.componentWillMount(),
      typeof l.UNSAFE_componentWillMount == "function" &&
        l.UNSAFE_componentWillMount(),
      t !== l.state && ao.enqueueReplaceState(l, l.state, null),
      Bl(e, n, l, r),
      (l.state = e.memoizedState)),
    typeof l.componentDidMount == "function" && (e.flags |= 4194308));
}
function nr(e, t) {
  try {
    var n = "",
      r = t;
    do ((n += gf(r)), (r = r.return));
    while (r);
    var l = n;
  } catch (o) {
    l =
      `
Error generating stack: ` +
      o.message +
      `
` +
      o.stack;
  }
  return { value: e, source: t, stack: l, digest: null };
}
function Vo(e, t, n) {
  return { value: e, source: null, stack: n ?? null, digest: t ?? null };
}
function Ci(e, t) {
  try {
    console.error(t.value);
  } catch (n) {
    setTimeout(function () {
      throw n;
    });
  }
}
var Hp = typeof WeakMap == "function" ? WeakMap : Map;
function Wc(e, t, n) {
  ((n = Rt(-1, n)), (n.tag = 3), (n.payload = { element: null }));
  var r = t.value;
  return (
    (n.callback = function () {
      (Gl || ((Gl = !0), (Ii = r)), Ci(e, t));
    }),
    n
  );
}
function Bc(e, t, n) {
  ((n = Rt(-1, n)), (n.tag = 3));
  var r = e.type.getDerivedStateFromError;
  if (typeof r == "function") {
    var l = t.value;
    ((n.payload = function () {
      return r(l);
    }),
      (n.callback = function () {
        Ci(e, t);
      }));
  }
  var o = e.stateNode;
  return (
    o !== null &&
      typeof o.componentDidCatch == "function" &&
      (n.callback = function () {
        (Ci(e, t),
          typeof r != "function" &&
            (nn === null ? (nn = new Set([this])) : nn.add(this)));
        var i = t.stack;
        this.componentDidCatch(t.value, {
          componentStack: i !== null ? i : "",
        });
      }),
    n
  );
}
function Ia(e, t, n) {
  var r = e.pingCache;
  if (r === null) {
    r = e.pingCache = new Hp();
    var l = new Set();
    r.set(t, l);
  } else ((l = r.get(t)), l === void 0 && ((l = new Set()), r.set(t, l)));
  l.has(n) || (l.add(n), (e = r0.bind(null, e, t, n)), t.then(e, e));
}
function Fa(e) {
  do {
    var t;
    if (
      ((t = e.tag === 13) &&
        ((t = e.memoizedState), (t = t !== null ? t.dehydrated !== null : !0)),
      t)
    )
      return e;
    e = e.return;
  } while (e !== null);
  return null;
}
function Da(e, t, n, r, l) {
  return e.mode & 1
    ? ((e.flags |= 65536), (e.lanes = l), e)
    : (e === t
        ? (e.flags |= 65536)
        : ((e.flags |= 128),
          (n.flags |= 131072),
          (n.flags &= -52805),
          n.tag === 1 &&
            (n.alternate === null
              ? (n.tag = 17)
              : ((t = Rt(-1, 1)), (t.tag = 2), tn(n, t, 1))),
          (n.lanes |= 1)),
      e);
}
var Wp = Ot.ReactCurrentOwner,
  Xe = !1;
function Ae(e, t, n, r) {
  t.child = e === null ? wc(t, null, n, r) : er(t, e.child, n, r);
}
function Oa(e, t, n, r, l) {
  n = n.render;
  var o = t.ref;
  return (
    Kn(t, l),
    (r = ws(e, t, n, r, o, l)),
    (n = ks()),
    e !== null && !Xe
      ? ((t.updateQueue = e.updateQueue),
        (t.flags &= -2053),
        (e.lanes &= ~l),
        Dt(e, t, l))
      : (ue && n && as(t), (t.flags |= 1), Ae(e, t, r, l), t.child)
  );
}
function Aa(e, t, n, r, l) {
  if (e === null) {
    var o = n.type;
    return typeof o == "function" &&
      !bs(o) &&
      o.defaultProps === void 0 &&
      n.compare === null &&
      n.defaultProps === void 0
      ? ((t.tag = 15), (t.type = o), Xc(e, t, o, r, l))
      : ((e = zl(n.type, null, r, t, t.mode, l)),
        (e.ref = t.ref),
        (e.return = t),
        (t.child = e));
  }
  if (((o = e.child), !(e.lanes & l))) {
    var i = o.memoizedProps;
    if (
      ((n = n.compare), (n = n !== null ? n : Dr), n(i, r) && e.ref === t.ref)
    )
      return Dt(e, t, l);
  }
  return (
    (t.flags |= 1),
    (e = ln(o, r)),
    (e.ref = t.ref),
    (e.return = t),
    (t.child = e)
  );
}
function Xc(e, t, n, r, l) {
  if (e !== null) {
    var o = e.memoizedProps;
    if (Dr(o, r) && e.ref === t.ref)
      if (((Xe = !1), (t.pendingProps = r = o), (e.lanes & l) !== 0))
        e.flags & 131072 && (Xe = !0);
      else return ((t.lanes = e.lanes), Dt(e, t, l));
  }
  return Mi(e, t, n, r, l);
}
function Yc(e, t, n) {
  var r = t.pendingProps,
    l = r.children,
    o = e !== null ? e.memoizedState : null;
  if (r.mode === "hidden")
    if (!(t.mode & 1))
      ((t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }),
        oe(Wn, Ze),
        (Ze |= n));
    else {
      if (!(n & 1073741824))
        return (
          (e = o !== null ? o.baseLanes | n : n),
          (t.lanes = t.childLanes = 1073741824),
          (t.memoizedState = {
            baseLanes: e,
            cachePool: null,
            transitions: null,
          }),
          (t.updateQueue = null),
          oe(Wn, Ze),
          (Ze |= e),
          null
        );
      ((t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }),
        (r = o !== null ? o.baseLanes : n),
        oe(Wn, Ze),
        (Ze |= r));
    }
  else
    (o !== null ? ((r = o.baseLanes | n), (t.memoizedState = null)) : (r = n),
      oe(Wn, Ze),
      (Ze |= r));
  return (Ae(e, t, l, n), t.child);
}
function Qc(e, t) {
  var n = t.ref;
  ((e === null && n !== null) || (e !== null && e.ref !== n)) &&
    ((t.flags |= 512), (t.flags |= 2097152));
}
function Mi(e, t, n, r, l) {
  var o = Qe(n) ? wn : Ie.current;
  return (
    (o = Jn(t, o)),
    Kn(t, l),
    (n = ws(e, t, n, r, o, l)),
    (r = ks()),
    e !== null && !Xe
      ? ((t.updateQueue = e.updateQueue),
        (t.flags &= -2053),
        (e.lanes &= ~l),
        Dt(e, t, l))
      : (ue && r && as(t), (t.flags |= 1), Ae(e, t, n, l), t.child)
  );
}
function $a(e, t, n, r, l) {
  if (Qe(n)) {
    var o = !0;
    $l(t);
  } else o = !1;
  if ((Kn(t, l), t.stateNode === null))
    (Ml(e, t), Hc(t, n, r), ji(t, n, r, l), (r = !0));
  else if (e === null) {
    var i = t.stateNode,
      u = t.memoizedProps;
    i.props = u;
    var s = i.context,
      d = n.contextType;
    typeof d == "object" && d !== null
      ? (d = ct(d))
      : ((d = Qe(n) ? wn : Ie.current), (d = Jn(t, d)));
    var m = n.getDerivedStateFromProps,
      g =
        typeof m == "function" ||
        typeof i.getSnapshotBeforeUpdate == "function";
    (g ||
      (typeof i.UNSAFE_componentWillReceiveProps != "function" &&
        typeof i.componentWillReceiveProps != "function") ||
      ((u !== r || s !== d) && La(t, i, r, d)),
      (Bt = !1));
    var h = t.memoizedState;
    ((i.state = h),
      Bl(t, r, i, l),
      (s = t.memoizedState),
      u !== r || h !== s || Ye.current || Bt
        ? (typeof m == "function" && (Ni(t, n, m, r), (s = t.memoizedState)),
          (u = Bt || Ra(t, n, u, r, h, s, d))
            ? (g ||
                (typeof i.UNSAFE_componentWillMount != "function" &&
                  typeof i.componentWillMount != "function") ||
                (typeof i.componentWillMount == "function" &&
                  i.componentWillMount(),
                typeof i.UNSAFE_componentWillMount == "function" &&
                  i.UNSAFE_componentWillMount()),
              typeof i.componentDidMount == "function" && (t.flags |= 4194308))
            : (typeof i.componentDidMount == "function" && (t.flags |= 4194308),
              (t.memoizedProps = r),
              (t.memoizedState = s)),
          (i.props = r),
          (i.state = s),
          (i.context = d),
          (r = u))
        : (typeof i.componentDidMount == "function" && (t.flags |= 4194308),
          (r = !1)));
  } else {
    ((i = t.stateNode),
      Sc(e, t),
      (u = t.memoizedProps),
      (d = t.type === t.elementType ? u : ht(t.type, u)),
      (i.props = d),
      (g = t.pendingProps),
      (h = i.context),
      (s = n.contextType),
      typeof s == "object" && s !== null
        ? (s = ct(s))
        : ((s = Qe(n) ? wn : Ie.current), (s = Jn(t, s))));
    var v = n.getDerivedStateFromProps;
    ((m =
      typeof v == "function" ||
      typeof i.getSnapshotBeforeUpdate == "function") ||
      (typeof i.UNSAFE_componentWillReceiveProps != "function" &&
        typeof i.componentWillReceiveProps != "function") ||
      ((u !== g || h !== s) && La(t, i, r, s)),
      (Bt = !1),
      (h = t.memoizedState),
      (i.state = h),
      Bl(t, r, i, l));
    var w = t.memoizedState;
    u !== g || h !== w || Ye.current || Bt
      ? (typeof v == "function" && (Ni(t, n, v, r), (w = t.memoizedState)),
        (d = Bt || Ra(t, n, d, r, h, w, s) || !1)
          ? (m ||
              (typeof i.UNSAFE_componentWillUpdate != "function" &&
                typeof i.componentWillUpdate != "function") ||
              (typeof i.componentWillUpdate == "function" &&
                i.componentWillUpdate(r, w, s),
              typeof i.UNSAFE_componentWillUpdate == "function" &&
                i.UNSAFE_componentWillUpdate(r, w, s)),
            typeof i.componentDidUpdate == "function" && (t.flags |= 4),
            typeof i.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024))
          : (typeof i.componentDidUpdate != "function" ||
              (u === e.memoizedProps && h === e.memoizedState) ||
              (t.flags |= 4),
            typeof i.getSnapshotBeforeUpdate != "function" ||
              (u === e.memoizedProps && h === e.memoizedState) ||
              (t.flags |= 1024),
            (t.memoizedProps = r),
            (t.memoizedState = w)),
        (i.props = r),
        (i.state = w),
        (i.context = s),
        (r = d))
      : (typeof i.componentDidUpdate != "function" ||
          (u === e.memoizedProps && h === e.memoizedState) ||
          (t.flags |= 4),
        typeof i.getSnapshotBeforeUpdate != "function" ||
          (u === e.memoizedProps && h === e.memoizedState) ||
          (t.flags |= 1024),
        (r = !1));
  }
  return Ei(e, t, n, r, o, l);
}
function Ei(e, t, n, r, l, o) {
  Qc(e, t);
  var i = (t.flags & 128) !== 0;
  if (!r && !i) return (l && Ca(t, n, !1), Dt(e, t, o));
  ((r = t.stateNode), (Wp.current = t));
  var u =
    i && typeof n.getDerivedStateFromError != "function" ? null : r.render();
  return (
    (t.flags |= 1),
    e !== null && i
      ? ((t.child = er(t, e.child, null, o)), (t.child = er(t, null, u, o)))
      : Ae(e, t, u, o),
    (t.memoizedState = r.state),
    l && Ca(t, n, !0),
    t.child
  );
}
function Kc(e) {
  var t = e.stateNode;
  (t.pendingContext
    ? ja(e, t.pendingContext, t.pendingContext !== t.context)
    : t.context && ja(e, t.context, !1),
    gs(e, t.containerInfo));
}
function Ua(e, t, n, r, l) {
  return (qn(), cs(l), (t.flags |= 256), Ae(e, t, n, r), t.child);
}
var Pi = { dehydrated: null, treeContext: null, retryLane: 0 };
function zi(e) {
  return { baseLanes: e, cachePool: null, transitions: null };
}
function Gc(e, t, n) {
  var r = t.pendingProps,
    l = de.current,
    o = !1,
    i = (t.flags & 128) !== 0,
    u;
  if (
    ((u = i) ||
      (u = e !== null && e.memoizedState === null ? !1 : (l & 2) !== 0),
    u
      ? ((o = !0), (t.flags &= -129))
      : (e === null || e.memoizedState !== null) && (l |= 1),
    oe(de, l & 1),
    e === null)
  )
    return (
      ki(t),
      (e = t.memoizedState),
      e !== null && ((e = e.dehydrated), e !== null)
        ? (t.mode & 1
            ? e.data === "$!"
              ? (t.lanes = 8)
              : (t.lanes = 1073741824)
            : (t.lanes = 1),
          null)
        : ((i = r.children),
          (e = r.fallback),
          o
            ? ((r = t.mode),
              (o = t.child),
              (i = { mode: "hidden", children: i }),
              !(r & 1) && o !== null
                ? ((o.childLanes = 0), (o.pendingProps = i))
                : (o = fo(i, r, 0, null)),
              (e = xn(e, r, n, null)),
              (o.return = t),
              (e.return = t),
              (o.sibling = e),
              (t.child = o),
              (t.child.memoizedState = zi(n)),
              (t.memoizedState = Pi),
              e)
            : js(t, i))
    );
  if (((l = e.memoizedState), l !== null && ((u = l.dehydrated), u !== null)))
    return Bp(e, t, i, r, u, l, n);
  if (o) {
    ((o = r.fallback), (i = t.mode), (l = e.child), (u = l.sibling));
    var s = { mode: "hidden", children: r.children };
    return (
      !(i & 1) && t.child !== l
        ? ((r = t.child),
          (r.childLanes = 0),
          (r.pendingProps = s),
          (t.deletions = null))
        : ((r = ln(l, s)), (r.subtreeFlags = l.subtreeFlags & 14680064)),
      u !== null ? (o = ln(u, o)) : ((o = xn(o, i, n, null)), (o.flags |= 2)),
      (o.return = t),
      (r.return = t),
      (r.sibling = o),
      (t.child = r),
      (r = o),
      (o = t.child),
      (i = e.child.memoizedState),
      (i =
        i === null
          ? zi(n)
          : {
              baseLanes: i.baseLanes | n,
              cachePool: null,
              transitions: i.transitions,
            }),
      (o.memoizedState = i),
      (o.childLanes = e.childLanes & ~n),
      (t.memoizedState = Pi),
      r
    );
  }
  return (
    (o = e.child),
    (e = o.sibling),
    (r = ln(o, { mode: "visible", children: r.children })),
    !(t.mode & 1) && (r.lanes = n),
    (r.return = t),
    (r.sibling = null),
    e !== null &&
      ((n = t.deletions),
      n === null ? ((t.deletions = [e]), (t.flags |= 16)) : n.push(e)),
    (t.child = r),
    (t.memoizedState = null),
    r
  );
}
function js(e, t) {
  return (
    (t = fo({ mode: "visible", children: t }, e.mode, 0, null)),
    (t.return = e),
    (e.child = t)
  );
}
function ml(e, t, n, r) {
  return (
    r !== null && cs(r),
    er(t, e.child, null, n),
    (e = js(t, t.pendingProps.children)),
    (e.flags |= 2),
    (t.memoizedState = null),
    e
  );
}
function Bp(e, t, n, r, l, o, i) {
  if (n)
    return t.flags & 256
      ? ((t.flags &= -257), (r = Vo(Error(C(422)))), ml(e, t, i, r))
      : t.memoizedState !== null
        ? ((t.child = e.child), (t.flags |= 128), null)
        : ((o = r.fallback),
          (l = t.mode),
          (r = fo({ mode: "visible", children: r.children }, l, 0, null)),
          (o = xn(o, l, i, null)),
          (o.flags |= 2),
          (r.return = t),
          (o.return = t),
          (r.sibling = o),
          (t.child = r),
          t.mode & 1 && er(t, e.child, null, i),
          (t.child.memoizedState = zi(i)),
          (t.memoizedState = Pi),
          o);
  if (!(t.mode & 1)) return ml(e, t, i, null);
  if (l.data === "$!") {
    if (((r = l.nextSibling && l.nextSibling.dataset), r)) var u = r.dgst;
    return (
      (r = u),
      (o = Error(C(419))),
      (r = Vo(o, r, void 0)),
      ml(e, t, i, r)
    );
  }
  if (((u = (i & e.childLanes) !== 0), Xe || u)) {
    if (((r = Pe), r !== null)) {
      switch (i & -i) {
        case 4:
          l = 2;
          break;
        case 16:
          l = 8;
          break;
        case 64:
        case 128:
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
        case 67108864:
          l = 32;
          break;
        case 536870912:
          l = 268435456;
          break;
        default:
          l = 0;
      }
      ((l = l & (r.suspendedLanes | i) ? 0 : l),
        l !== 0 &&
          l !== o.retryLane &&
          ((o.retryLane = l), Ft(e, l), xt(r, e, l, -1)));
    }
    return (Ts(), (r = Vo(Error(C(421)))), ml(e, t, i, r));
  }
  return l.data === "$?"
    ? ((t.flags |= 128),
      (t.child = e.child),
      (t = l0.bind(null, e)),
      (l._reactRetry = t),
      null)
    : ((e = o.treeContext),
      (Je = en(l.nextSibling)),
      (qe = t),
      (ue = !0),
      (yt = null),
      e !== null &&
        ((it[st++] = bt),
        (it[st++] = _t),
        (it[st++] = kn),
        (bt = e.id),
        (_t = e.overflow),
        (kn = t)),
      (t = js(t, r.children)),
      (t.flags |= 4096),
      t);
}
function Va(e, t, n) {
  e.lanes |= t;
  var r = e.alternate;
  (r !== null && (r.lanes |= t), Si(e.return, t, n));
}
function Ho(e, t, n, r, l) {
  var o = e.memoizedState;
  o === null
    ? (e.memoizedState = {
        isBackwards: t,
        rendering: null,
        renderingStartTime: 0,
        last: r,
        tail: n,
        tailMode: l,
      })
    : ((o.isBackwards = t),
      (o.rendering = null),
      (o.renderingStartTime = 0),
      (o.last = r),
      (o.tail = n),
      (o.tailMode = l));
}
function Zc(e, t, n) {
  var r = t.pendingProps,
    l = r.revealOrder,
    o = r.tail;
  if ((Ae(e, t, r.children, n), (r = de.current), r & 2))
    ((r = (r & 1) | 2), (t.flags |= 128));
  else {
    if (e !== null && e.flags & 128)
      e: for (e = t.child; e !== null;) {
        if (e.tag === 13) e.memoizedState !== null && Va(e, n, t);
        else if (e.tag === 19) Va(e, n, t);
        else if (e.child !== null) {
          ((e.child.return = e), (e = e.child));
          continue;
        }
        if (e === t) break e;
        for (; e.sibling === null;) {
          if (e.return === null || e.return === t) break e;
          e = e.return;
        }
        ((e.sibling.return = e.return), (e = e.sibling));
      }
    r &= 1;
  }
  if ((oe(de, r), !(t.mode & 1))) t.memoizedState = null;
  else
    switch (l) {
      case "forwards":
        for (n = t.child, l = null; n !== null;)
          ((e = n.alternate),
            e !== null && Xl(e) === null && (l = n),
            (n = n.sibling));
        ((n = l),
          n === null
            ? ((l = t.child), (t.child = null))
            : ((l = n.sibling), (n.sibling = null)),
          Ho(t, !1, l, n, o));
        break;
      case "backwards":
        for (n = null, l = t.child, t.child = null; l !== null;) {
          if (((e = l.alternate), e !== null && Xl(e) === null)) {
            t.child = l;
            break;
          }
          ((e = l.sibling), (l.sibling = n), (n = l), (l = e));
        }
        Ho(t, !0, n, null, o);
        break;
      case "together":
        Ho(t, !1, null, null, void 0);
        break;
      default:
        t.memoizedState = null;
    }
  return t.child;
}
function Ml(e, t) {
  !(t.mode & 1) &&
    e !== null &&
    ((e.alternate = null), (t.alternate = null), (t.flags |= 2));
}
function Dt(e, t, n) {
  if (
    (e !== null && (t.dependencies = e.dependencies),
    (Nn |= t.lanes),
    !(n & t.childLanes))
  )
    return null;
  if (e !== null && t.child !== e.child) throw Error(C(153));
  if (t.child !== null) {
    for (
      e = t.child, n = ln(e, e.pendingProps), t.child = n, n.return = t;
      e.sibling !== null;
    )
      ((e = e.sibling),
        (n = n.sibling = ln(e, e.pendingProps)),
        (n.return = t));
    n.sibling = null;
  }
  return t.child;
}
function Xp(e, t, n) {
  switch (t.tag) {
    case 3:
      (Kc(t), qn());
      break;
    case 5:
      Nc(t);
      break;
    case 1:
      Qe(t.type) && $l(t);
      break;
    case 4:
      gs(t, t.stateNode.containerInfo);
      break;
    case 10:
      var r = t.type._context,
        l = t.memoizedProps.value;
      (oe(Hl, r._currentValue), (r._currentValue = l));
      break;
    case 13:
      if (((r = t.memoizedState), r !== null))
        return r.dehydrated !== null
          ? (oe(de, de.current & 1), (t.flags |= 128), null)
          : n & t.child.childLanes
            ? Gc(e, t, n)
            : (oe(de, de.current & 1),
              (e = Dt(e, t, n)),
              e !== null ? e.sibling : null);
      oe(de, de.current & 1);
      break;
    case 19:
      if (((r = (n & t.childLanes) !== 0), e.flags & 128)) {
        if (r) return Zc(e, t, n);
        t.flags |= 128;
      }
      if (
        ((l = t.memoizedState),
        l !== null &&
          ((l.rendering = null), (l.tail = null), (l.lastEffect = null)),
        oe(de, de.current),
        r)
      )
        break;
      return null;
    case 22:
    case 23:
      return ((t.lanes = 0), Yc(e, t, n));
  }
  return Dt(e, t, n);
}
var Jc, Ti, qc, ed;
Jc = function (e, t) {
  for (var n = t.child; n !== null;) {
    if (n.tag === 5 || n.tag === 6) e.appendChild(n.stateNode);
    else if (n.tag !== 4 && n.child !== null) {
      ((n.child.return = n), (n = n.child));
      continue;
    }
    if (n === t) break;
    for (; n.sibling === null;) {
      if (n.return === null || n.return === t) return;
      n = n.return;
    }
    ((n.sibling.return = n.return), (n = n.sibling));
  }
};
Ti = function () {};
qc = function (e, t, n, r) {
  var l = e.memoizedProps;
  if (l !== r) {
    ((e = t.stateNode), yn(Et.current));
    var o = null;
    switch (n) {
      case "input":
        ((l = Jo(e, l)), (r = Jo(e, r)), (o = []));
        break;
      case "select":
        ((l = pe({}, l, { value: void 0 })),
          (r = pe({}, r, { value: void 0 })),
          (o = []));
        break;
      case "textarea":
        ((l = ti(e, l)), (r = ti(e, r)), (o = []));
        break;
      default:
        typeof l.onClick != "function" &&
          typeof r.onClick == "function" &&
          (e.onclick = Ol);
    }
    ri(n, r);
    var i;
    n = null;
    for (d in l)
      if (!r.hasOwnProperty(d) && l.hasOwnProperty(d) && l[d] != null)
        if (d === "style") {
          var u = l[d];
          for (i in u) u.hasOwnProperty(i) && (n || (n = {}), (n[i] = ""));
        } else
          d !== "dangerouslySetInnerHTML" &&
            d !== "children" &&
            d !== "suppressContentEditableWarning" &&
            d !== "suppressHydrationWarning" &&
            d !== "autoFocus" &&
            (Tr.hasOwnProperty(d)
              ? o || (o = [])
              : (o = o || []).push(d, null));
    for (d in r) {
      var s = r[d];
      if (
        ((u = l != null ? l[d] : void 0),
        r.hasOwnProperty(d) && s !== u && (s != null || u != null))
      )
        if (d === "style")
          if (u) {
            for (i in u)
              !u.hasOwnProperty(i) ||
                (s && s.hasOwnProperty(i)) ||
                (n || (n = {}), (n[i] = ""));
            for (i in s)
              s.hasOwnProperty(i) &&
                u[i] !== s[i] &&
                (n || (n = {}), (n[i] = s[i]));
          } else (n || (o || (o = []), o.push(d, n)), (n = s));
        else
          d === "dangerouslySetInnerHTML"
            ? ((s = s ? s.__html : void 0),
              (u = u ? u.__html : void 0),
              s != null && u !== s && (o = o || []).push(d, s))
            : d === "children"
              ? (typeof s != "string" && typeof s != "number") ||
                (o = o || []).push(d, "" + s)
              : d !== "suppressContentEditableWarning" &&
                d !== "suppressHydrationWarning" &&
                (Tr.hasOwnProperty(d)
                  ? (s != null && d === "onScroll" && ie("scroll", e),
                    o || u === s || (o = []))
                  : (o = o || []).push(d, s));
    }
    n && (o = o || []).push("style", n);
    var d = o;
    (t.updateQueue = d) && (t.flags |= 4);
  }
};
ed = function (e, t, n, r) {
  n !== r && (t.flags |= 4);
};
function hr(e, t) {
  if (!ue)
    switch (e.tailMode) {
      case "hidden":
        t = e.tail;
        for (var n = null; t !== null;)
          (t.alternate !== null && (n = t), (t = t.sibling));
        n === null ? (e.tail = null) : (n.sibling = null);
        break;
      case "collapsed":
        n = e.tail;
        for (var r = null; n !== null;)
          (n.alternate !== null && (r = n), (n = n.sibling));
        r === null
          ? t || e.tail === null
            ? (e.tail = null)
            : (e.tail.sibling = null)
          : (r.sibling = null);
    }
}
function Re(e) {
  var t = e.alternate !== null && e.alternate.child === e.child,
    n = 0,
    r = 0;
  if (t)
    for (var l = e.child; l !== null;)
      ((n |= l.lanes | l.childLanes),
        (r |= l.subtreeFlags & 14680064),
        (r |= l.flags & 14680064),
        (l.return = e),
        (l = l.sibling));
  else
    for (l = e.child; l !== null;)
      ((n |= l.lanes | l.childLanes),
        (r |= l.subtreeFlags),
        (r |= l.flags),
        (l.return = e),
        (l = l.sibling));
  return ((e.subtreeFlags |= r), (e.childLanes = n), t);
}
function Yp(e, t, n) {
  var r = t.pendingProps;
  switch ((us(t), t.tag)) {
    case 2:
    case 16:
    case 15:
    case 0:
    case 11:
    case 7:
    case 8:
    case 12:
    case 9:
    case 14:
      return (Re(t), null);
    case 1:
      return (Qe(t.type) && Al(), Re(t), null);
    case 3:
      return (
        (r = t.stateNode),
        tr(),
        se(Ye),
        se(Ie),
        vs(),
        r.pendingContext &&
          ((r.context = r.pendingContext), (r.pendingContext = null)),
        (e === null || e.child === null) &&
          (fl(t)
            ? (t.flags |= 4)
            : e === null ||
              (e.memoizedState.isDehydrated && !(t.flags & 256)) ||
              ((t.flags |= 1024), yt !== null && (Oi(yt), (yt = null)))),
        Ti(e, t),
        Re(t),
        null
      );
    case 5:
      ys(t);
      var l = yn(Vr.current);
      if (((n = t.type), e !== null && t.stateNode != null))
        (qc(e, t, n, r, l),
          e.ref !== t.ref && ((t.flags |= 512), (t.flags |= 2097152)));
      else {
        if (!r) {
          if (t.stateNode === null) throw Error(C(166));
          return (Re(t), null);
        }
        if (((e = yn(Et.current)), fl(t))) {
          ((r = t.stateNode), (n = t.type));
          var o = t.memoizedProps;
          switch (((r[Ct] = t), (r[$r] = o), (e = (t.mode & 1) !== 0), n)) {
            case "dialog":
              (ie("cancel", r), ie("close", r));
              break;
            case "iframe":
            case "object":
            case "embed":
              ie("load", r);
              break;
            case "video":
            case "audio":
              for (l = 0; l < wr.length; l++) ie(wr[l], r);
              break;
            case "source":
              ie("error", r);
              break;
            case "img":
            case "image":
            case "link":
              (ie("error", r), ie("load", r));
              break;
            case "details":
              ie("toggle", r);
              break;
            case "input":
              (Zs(r, o), ie("invalid", r));
              break;
            case "select":
              ((r._wrapperState = { wasMultiple: !!o.multiple }),
                ie("invalid", r));
              break;
            case "textarea":
              (qs(r, o), ie("invalid", r));
          }
          (ri(n, o), (l = null));
          for (var i in o)
            if (o.hasOwnProperty(i)) {
              var u = o[i];
              i === "children"
                ? typeof u == "string"
                  ? r.textContent !== u &&
                    (o.suppressHydrationWarning !== !0 &&
                      dl(r.textContent, u, e),
                    (l = ["children", u]))
                  : typeof u == "number" &&
                    r.textContent !== "" + u &&
                    (o.suppressHydrationWarning !== !0 &&
                      dl(r.textContent, u, e),
                    (l = ["children", "" + u]))
                : Tr.hasOwnProperty(i) &&
                  u != null &&
                  i === "onScroll" &&
                  ie("scroll", r);
            }
          switch (n) {
            case "input":
              (rl(r), Js(r, o, !0));
              break;
            case "textarea":
              (rl(r), ea(r));
              break;
            case "select":
            case "option":
              break;
            default:
              typeof o.onClick == "function" && (r.onclick = Ol);
          }
          ((r = l), (t.updateQueue = r), r !== null && (t.flags |= 4));
        } else {
          ((i = l.nodeType === 9 ? l : l.ownerDocument),
            e === "http://www.w3.org/1999/xhtml" && (e = Pu(n)),
            e === "http://www.w3.org/1999/xhtml"
              ? n === "script"
                ? ((e = i.createElement("div")),
                  (e.innerHTML = "<script><\/script>"),
                  (e = e.removeChild(e.firstChild)))
                : typeof r.is == "string"
                  ? (e = i.createElement(n, { is: r.is }))
                  : ((e = i.createElement(n)),
                    n === "select" &&
                      ((i = e),
                      r.multiple
                        ? (i.multiple = !0)
                        : r.size && (i.size = r.size)))
              : (e = i.createElementNS(e, n)),
            (e[Ct] = t),
            (e[$r] = r),
            Jc(e, t, !1, !1),
            (t.stateNode = e));
          e: {
            switch (((i = li(n, r)), n)) {
              case "dialog":
                (ie("cancel", e), ie("close", e), (l = r));
                break;
              case "iframe":
              case "object":
              case "embed":
                (ie("load", e), (l = r));
                break;
              case "video":
              case "audio":
                for (l = 0; l < wr.length; l++) ie(wr[l], e);
                l = r;
                break;
              case "source":
                (ie("error", e), (l = r));
                break;
              case "img":
              case "image":
              case "link":
                (ie("error", e), ie("load", e), (l = r));
                break;
              case "details":
                (ie("toggle", e), (l = r));
                break;
              case "input":
                (Zs(e, r), (l = Jo(e, r)), ie("invalid", e));
                break;
              case "option":
                l = r;
                break;
              case "select":
                ((e._wrapperState = { wasMultiple: !!r.multiple }),
                  (l = pe({}, r, { value: void 0 })),
                  ie("invalid", e));
                break;
              case "textarea":
                (qs(e, r), (l = ti(e, r)), ie("invalid", e));
                break;
              default:
                l = r;
            }
            (ri(n, l), (u = l));
            for (o in u)
              if (u.hasOwnProperty(o)) {
                var s = u[o];
                o === "style"
                  ? bu(e, s)
                  : o === "dangerouslySetInnerHTML"
                    ? ((s = s ? s.__html : void 0), s != null && zu(e, s))
                    : o === "children"
                      ? typeof s == "string"
                        ? (n !== "textarea" || s !== "") && br(e, s)
                        : typeof s == "number" && br(e, "" + s)
                      : o !== "suppressContentEditableWarning" &&
                        o !== "suppressHydrationWarning" &&
                        o !== "autoFocus" &&
                        (Tr.hasOwnProperty(o)
                          ? s != null && o === "onScroll" && ie("scroll", e)
                          : s != null && Qi(e, o, s, i));
              }
            switch (n) {
              case "input":
                (rl(e), Js(e, r, !1));
                break;
              case "textarea":
                (rl(e), ea(e));
                break;
              case "option":
                r.value != null && e.setAttribute("value", "" + on(r.value));
                break;
              case "select":
                ((e.multiple = !!r.multiple),
                  (o = r.value),
                  o != null
                    ? Bn(e, !!r.multiple, o, !1)
                    : r.defaultValue != null &&
                      Bn(e, !!r.multiple, r.defaultValue, !0));
                break;
              default:
                typeof l.onClick == "function" && (e.onclick = Ol);
            }
            switch (n) {
              case "button":
              case "input":
              case "select":
              case "textarea":
                r = !!r.autoFocus;
                break e;
              case "img":
                r = !0;
                break e;
              default:
                r = !1;
            }
          }
          r && (t.flags |= 4);
        }
        t.ref !== null && ((t.flags |= 512), (t.flags |= 2097152));
      }
      return (Re(t), null);
    case 6:
      if (e && t.stateNode != null) ed(e, t, e.memoizedProps, r);
      else {
        if (typeof r != "string" && t.stateNode === null) throw Error(C(166));
        if (((n = yn(Vr.current)), yn(Et.current), fl(t))) {
          if (
            ((r = t.stateNode),
            (n = t.memoizedProps),
            (r[Ct] = t),
            (o = r.nodeValue !== n) && ((e = qe), e !== null))
          )
            switch (e.tag) {
              case 3:
                dl(r.nodeValue, n, (e.mode & 1) !== 0);
                break;
              case 5:
                e.memoizedProps.suppressHydrationWarning !== !0 &&
                  dl(r.nodeValue, n, (e.mode & 1) !== 0);
            }
          o && (t.flags |= 4);
        } else
          ((r = (n.nodeType === 9 ? n : n.ownerDocument).createTextNode(r)),
            (r[Ct] = t),
            (t.stateNode = r));
      }
      return (Re(t), null);
    case 13:
      if (
        (se(de),
        (r = t.memoizedState),
        e === null ||
          (e.memoizedState !== null && e.memoizedState.dehydrated !== null))
      ) {
        if (ue && Je !== null && t.mode & 1 && !(t.flags & 128))
          (vc(), qn(), (t.flags |= 98560), (o = !1));
        else if (((o = fl(t)), r !== null && r.dehydrated !== null)) {
          if (e === null) {
            if (!o) throw Error(C(318));
            if (
              ((o = t.memoizedState),
              (o = o !== null ? o.dehydrated : null),
              !o)
            )
              throw Error(C(317));
            o[Ct] = t;
          } else
            (qn(),
              !(t.flags & 128) && (t.memoizedState = null),
              (t.flags |= 4));
          (Re(t), (o = !1));
        } else (yt !== null && (Oi(yt), (yt = null)), (o = !0));
        if (!o) return t.flags & 65536 ? t : null;
      }
      return t.flags & 128
        ? ((t.lanes = n), t)
        : ((r = r !== null),
          r !== (e !== null && e.memoizedState !== null) &&
            r &&
            ((t.child.flags |= 8192),
            t.mode & 1 &&
              (e === null || de.current & 1 ? je === 0 && (je = 3) : Ts())),
          t.updateQueue !== null && (t.flags |= 4),
          Re(t),
          null);
    case 4:
      return (
        tr(),
        Ti(e, t),
        e === null && Or(t.stateNode.containerInfo),
        Re(t),
        null
      );
    case 10:
      return (ps(t.type._context), Re(t), null);
    case 17:
      return (Qe(t.type) && Al(), Re(t), null);
    case 19:
      if ((se(de), (o = t.memoizedState), o === null)) return (Re(t), null);
      if (((r = (t.flags & 128) !== 0), (i = o.rendering), i === null))
        if (r) hr(o, !1);
        else {
          if (je !== 0 || (e !== null && e.flags & 128))
            for (e = t.child; e !== null;) {
              if (((i = Xl(e)), i !== null)) {
                for (
                  t.flags |= 128,
                    hr(o, !1),
                    r = i.updateQueue,
                    r !== null && ((t.updateQueue = r), (t.flags |= 4)),
                    t.subtreeFlags = 0,
                    r = n,
                    n = t.child;
                  n !== null;
                )
                  ((o = n),
                    (e = r),
                    (o.flags &= 14680066),
                    (i = o.alternate),
                    i === null
                      ? ((o.childLanes = 0),
                        (o.lanes = e),
                        (o.child = null),
                        (o.subtreeFlags = 0),
                        (o.memoizedProps = null),
                        (o.memoizedState = null),
                        (o.updateQueue = null),
                        (o.dependencies = null),
                        (o.stateNode = null))
                      : ((o.childLanes = i.childLanes),
                        (o.lanes = i.lanes),
                        (o.child = i.child),
                        (o.subtreeFlags = 0),
                        (o.deletions = null),
                        (o.memoizedProps = i.memoizedProps),
                        (o.memoizedState = i.memoizedState),
                        (o.updateQueue = i.updateQueue),
                        (o.type = i.type),
                        (e = i.dependencies),
                        (o.dependencies =
                          e === null
                            ? null
                            : {
                                lanes: e.lanes,
                                firstContext: e.firstContext,
                              })),
                    (n = n.sibling));
                return (oe(de, (de.current & 1) | 2), t.child);
              }
              e = e.sibling;
            }
          o.tail !== null &&
            ve() > rr &&
            ((t.flags |= 128), (r = !0), hr(o, !1), (t.lanes = 4194304));
        }
      else {
        if (!r)
          if (((e = Xl(i)), e !== null)) {
            if (
              ((t.flags |= 128),
              (r = !0),
              (n = e.updateQueue),
              n !== null && ((t.updateQueue = n), (t.flags |= 4)),
              hr(o, !0),
              o.tail === null && o.tailMode === "hidden" && !i.alternate && !ue)
            )
              return (Re(t), null);
          } else
            2 * ve() - o.renderingStartTime > rr &&
              n !== 1073741824 &&
              ((t.flags |= 128), (r = !0), hr(o, !1), (t.lanes = 4194304));
        o.isBackwards
          ? ((i.sibling = t.child), (t.child = i))
          : ((n = o.last),
            n !== null ? (n.sibling = i) : (t.child = i),
            (o.last = i));
      }
      return o.tail !== null
        ? ((t = o.tail),
          (o.rendering = t),
          (o.tail = t.sibling),
          (o.renderingStartTime = ve()),
          (t.sibling = null),
          (n = de.current),
          oe(de, r ? (n & 1) | 2 : n & 1),
          t)
        : (Re(t), null);
    case 22:
    case 23:
      return (
        zs(),
        (r = t.memoizedState !== null),
        e !== null && (e.memoizedState !== null) !== r && (t.flags |= 8192),
        r && t.mode & 1
          ? Ze & 1073741824 && (Re(t), t.subtreeFlags & 6 && (t.flags |= 8192))
          : Re(t),
        null
      );
    case 24:
      return null;
    case 25:
      return null;
  }
  throw Error(C(156, t.tag));
}
function Qp(e, t) {
  switch ((us(t), t.tag)) {
    case 1:
      return (
        Qe(t.type) && Al(),
        (e = t.flags),
        e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null
      );
    case 3:
      return (
        tr(),
        se(Ye),
        se(Ie),
        vs(),
        (e = t.flags),
        e & 65536 && !(e & 128) ? ((t.flags = (e & -65537) | 128), t) : null
      );
    case 5:
      return (ys(t), null);
    case 13:
      if (
        (se(de), (e = t.memoizedState), e !== null && e.dehydrated !== null)
      ) {
        if (t.alternate === null) throw Error(C(340));
        qn();
      }
      return (
        (e = t.flags),
        e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null
      );
    case 19:
      return (se(de), null);
    case 4:
      return (tr(), null);
    case 10:
      return (ps(t.type._context), null);
    case 22:
    case 23:
      return (zs(), null);
    case 24:
      return null;
    default:
      return null;
  }
}
var hl = !1,
  Le = !1,
  Kp = typeof WeakSet == "function" ? WeakSet : Set,
  R = null;
function Hn(e, t) {
  var n = e.ref;
  if (n !== null)
    if (typeof n == "function")
      try {
        n(null);
      } catch (r) {
        ge(e, t, r);
      }
    else n.current = null;
}
function bi(e, t, n) {
  try {
    n();
  } catch (r) {
    ge(e, t, r);
  }
}
var Ha = !1;
function Gp(e, t) {
  if (((mi = Il), (e = oc()), ss(e))) {
    if ("selectionStart" in e)
      var n = { start: e.selectionStart, end: e.selectionEnd };
    else
      e: {
        n = ((n = e.ownerDocument) && n.defaultView) || window;
        var r = n.getSelection && n.getSelection();
        if (r && r.rangeCount !== 0) {
          n = r.anchorNode;
          var l = r.anchorOffset,
            o = r.focusNode;
          r = r.focusOffset;
          try {
            (n.nodeType, o.nodeType);
          } catch {
            n = null;
            break e;
          }
          var i = 0,
            u = -1,
            s = -1,
            d = 0,
            m = 0,
            g = e,
            h = null;
          t: for (;;) {
            for (
              var v;
              g !== n || (l !== 0 && g.nodeType !== 3) || (u = i + l),
                g !== o || (r !== 0 && g.nodeType !== 3) || (s = i + r),
                g.nodeType === 3 && (i += g.nodeValue.length),
                (v = g.firstChild) !== null;
            )
              ((h = g), (g = v));
            for (;;) {
              if (g === e) break t;
              if (
                (h === n && ++d === l && (u = i),
                h === o && ++m === r && (s = i),
                (v = g.nextSibling) !== null)
              )
                break;
              ((g = h), (h = g.parentNode));
            }
            g = v;
          }
          n = u === -1 || s === -1 ? null : { start: u, end: s };
        } else n = null;
      }
    n = n || { start: 0, end: 0 };
  } else n = null;
  for (hi = { focusedElem: e, selectionRange: n }, Il = !1, R = t; R !== null;)
    if (((t = R), (e = t.child), (t.subtreeFlags & 1028) !== 0 && e !== null))
      ((e.return = t), (R = e));
    else
      for (; R !== null;) {
        t = R;
        try {
          var w = t.alternate;
          if (t.flags & 1024)
            switch (t.tag) {
              case 0:
              case 11:
              case 15:
                break;
              case 1:
                if (w !== null) {
                  var x = w.memoizedProps,
                    F = w.memoizedState,
                    f = t.stateNode,
                    c = f.getSnapshotBeforeUpdate(
                      t.elementType === t.type ? x : ht(t.type, x),
                      F,
                    );
                  f.__reactInternalSnapshotBeforeUpdate = c;
                }
                break;
              case 3:
                var p = t.stateNode.containerInfo;
                p.nodeType === 1
                  ? (p.textContent = "")
                  : p.nodeType === 9 &&
                    p.documentElement &&
                    p.removeChild(p.documentElement);
                break;
              case 5:
              case 6:
              case 4:
              case 17:
                break;
              default:
                throw Error(C(163));
            }
        } catch (y) {
          ge(t, t.return, y);
        }
        if (((e = t.sibling), e !== null)) {
          ((e.return = t.return), (R = e));
          break;
        }
        R = t.return;
      }
  return ((w = Ha), (Ha = !1), w);
}
function Er(e, t, n) {
  var r = t.updateQueue;
  if (((r = r !== null ? r.lastEffect : null), r !== null)) {
    var l = (r = r.next);
    do {
      if ((l.tag & e) === e) {
        var o = l.destroy;
        ((l.destroy = void 0), o !== void 0 && bi(t, n, o));
      }
      l = l.next;
    } while (l !== r);
  }
}
function uo(e, t) {
  if (
    ((t = t.updateQueue), (t = t !== null ? t.lastEffect : null), t !== null)
  ) {
    var n = (t = t.next);
    do {
      if ((n.tag & e) === e) {
        var r = n.create;
        n.destroy = r();
      }
      n = n.next;
    } while (n !== t);
  }
}
function _i(e) {
  var t = e.ref;
  if (t !== null) {
    var n = e.stateNode;
    switch (e.tag) {
      case 5:
        e = n;
        break;
      default:
        e = n;
    }
    typeof t == "function" ? t(e) : (t.current = e);
  }
}
function td(e) {
  var t = e.alternate;
  (t !== null && ((e.alternate = null), td(t)),
    (e.child = null),
    (e.deletions = null),
    (e.sibling = null),
    e.tag === 5 &&
      ((t = e.stateNode),
      t !== null &&
        (delete t[Ct], delete t[$r], delete t[vi], delete t[_p], delete t[Rp])),
    (e.stateNode = null),
    (e.return = null),
    (e.dependencies = null),
    (e.memoizedProps = null),
    (e.memoizedState = null),
    (e.pendingProps = null),
    (e.stateNode = null),
    (e.updateQueue = null));
}
function nd(e) {
  return e.tag === 5 || e.tag === 3 || e.tag === 4;
}
function Wa(e) {
  e: for (;;) {
    for (; e.sibling === null;) {
      if (e.return === null || nd(e.return)) return null;
      e = e.return;
    }
    for (
      e.sibling.return = e.return, e = e.sibling;
      e.tag !== 5 && e.tag !== 6 && e.tag !== 18;
    ) {
      if (e.flags & 2 || e.child === null || e.tag === 4) continue e;
      ((e.child.return = e), (e = e.child));
    }
    if (!(e.flags & 2)) return e.stateNode;
  }
}
function Ri(e, t, n) {
  var r = e.tag;
  if (r === 5 || r === 6)
    ((e = e.stateNode),
      t
        ? n.nodeType === 8
          ? n.parentNode.insertBefore(e, t)
          : n.insertBefore(e, t)
        : (n.nodeType === 8
            ? ((t = n.parentNode), t.insertBefore(e, n))
            : ((t = n), t.appendChild(e)),
          (n = n._reactRootContainer),
          n != null || t.onclick !== null || (t.onclick = Ol)));
  else if (r !== 4 && ((e = e.child), e !== null))
    for (Ri(e, t, n), e = e.sibling; e !== null;)
      (Ri(e, t, n), (e = e.sibling));
}
function Li(e, t, n) {
  var r = e.tag;
  if (r === 5 || r === 6)
    ((e = e.stateNode), t ? n.insertBefore(e, t) : n.appendChild(e));
  else if (r !== 4 && ((e = e.child), e !== null))
    for (Li(e, t, n), e = e.sibling; e !== null;)
      (Li(e, t, n), (e = e.sibling));
}
var ze = null,
  gt = !1;
function Ht(e, t, n) {
  for (n = n.child; n !== null;) (rd(e, t, n), (n = n.sibling));
}
function rd(e, t, n) {
  if (Mt && typeof Mt.onCommitFiberUnmount == "function")
    try {
      Mt.onCommitFiberUnmount(to, n);
    } catch {}
  switch (n.tag) {
    case 5:
      Le || Hn(n, t);
    case 6:
      var r = ze,
        l = gt;
      ((ze = null),
        Ht(e, t, n),
        (ze = r),
        (gt = l),
        ze !== null &&
          (gt
            ? ((e = ze),
              (n = n.stateNode),
              e.nodeType === 8 ? e.parentNode.removeChild(n) : e.removeChild(n))
            : ze.removeChild(n.stateNode)));
      break;
    case 18:
      ze !== null &&
        (gt
          ? ((e = ze),
            (n = n.stateNode),
            e.nodeType === 8
              ? Fo(e.parentNode, n)
              : e.nodeType === 1 && Fo(e, n),
            Ir(e))
          : Fo(ze, n.stateNode));
      break;
    case 4:
      ((r = ze),
        (l = gt),
        (ze = n.stateNode.containerInfo),
        (gt = !0),
        Ht(e, t, n),
        (ze = r),
        (gt = l));
      break;
    case 0:
    case 11:
    case 14:
    case 15:
      if (
        !Le &&
        ((r = n.updateQueue), r !== null && ((r = r.lastEffect), r !== null))
      ) {
        l = r = r.next;
        do {
          var o = l,
            i = o.destroy;
          ((o = o.tag),
            i !== void 0 && (o & 2 || o & 4) && bi(n, t, i),
            (l = l.next));
        } while (l !== r);
      }
      Ht(e, t, n);
      break;
    case 1:
      if (
        !Le &&
        (Hn(n, t),
        (r = n.stateNode),
        typeof r.componentWillUnmount == "function")
      )
        try {
          ((r.props = n.memoizedProps),
            (r.state = n.memoizedState),
            r.componentWillUnmount());
        } catch (u) {
          ge(n, t, u);
        }
      Ht(e, t, n);
      break;
    case 21:
      Ht(e, t, n);
      break;
    case 22:
      n.mode & 1
        ? ((Le = (r = Le) || n.memoizedState !== null), Ht(e, t, n), (Le = r))
        : Ht(e, t, n);
      break;
    default:
      Ht(e, t, n);
  }
}
function Ba(e) {
  var t = e.updateQueue;
  if (t !== null) {
    e.updateQueue = null;
    var n = e.stateNode;
    (n === null && (n = e.stateNode = new Kp()),
      t.forEach(function (r) {
        var l = o0.bind(null, e, r);
        n.has(r) || (n.add(r), r.then(l, l));
      }));
  }
}
function mt(e, t) {
  var n = t.deletions;
  if (n !== null)
    for (var r = 0; r < n.length; r++) {
      var l = n[r];
      try {
        var o = e,
          i = t,
          u = i;
        e: for (; u !== null;) {
          switch (u.tag) {
            case 5:
              ((ze = u.stateNode), (gt = !1));
              break e;
            case 3:
              ((ze = u.stateNode.containerInfo), (gt = !0));
              break e;
            case 4:
              ((ze = u.stateNode.containerInfo), (gt = !0));
              break e;
          }
          u = u.return;
        }
        if (ze === null) throw Error(C(160));
        (rd(o, i, l), (ze = null), (gt = !1));
        var s = l.alternate;
        (s !== null && (s.return = null), (l.return = null));
      } catch (d) {
        ge(l, t, d);
      }
    }
  if (t.subtreeFlags & 12854)
    for (t = t.child; t !== null;) (ld(t, e), (t = t.sibling));
}
function ld(e, t) {
  var n = e.alternate,
    r = e.flags;
  switch (e.tag) {
    case 0:
    case 11:
    case 14:
    case 15:
      if ((mt(t, e), Nt(e), r & 4)) {
        try {
          (Er(3, e, e.return), uo(3, e));
        } catch (x) {
          ge(e, e.return, x);
        }
        try {
          Er(5, e, e.return);
        } catch (x) {
          ge(e, e.return, x);
        }
      }
      break;
    case 1:
      (mt(t, e), Nt(e), r & 512 && n !== null && Hn(n, n.return));
      break;
    case 5:
      if (
        (mt(t, e),
        Nt(e),
        r & 512 && n !== null && Hn(n, n.return),
        e.flags & 32)
      ) {
        var l = e.stateNode;
        try {
          br(l, "");
        } catch (x) {
          ge(e, e.return, x);
        }
      }
      if (r & 4 && ((l = e.stateNode), l != null)) {
        var o = e.memoizedProps,
          i = n !== null ? n.memoizedProps : o,
          u = e.type,
          s = e.updateQueue;
        if (((e.updateQueue = null), s !== null))
          try {
            (u === "input" && o.type === "radio" && o.name != null && Mu(l, o),
              li(u, i));
            var d = li(u, o);
            for (i = 0; i < s.length; i += 2) {
              var m = s[i],
                g = s[i + 1];
              m === "style"
                ? bu(l, g)
                : m === "dangerouslySetInnerHTML"
                  ? zu(l, g)
                  : m === "children"
                    ? br(l, g)
                    : Qi(l, m, g, d);
            }
            switch (u) {
              case "input":
                qo(l, o);
                break;
              case "textarea":
                Eu(l, o);
                break;
              case "select":
                var h = l._wrapperState.wasMultiple;
                l._wrapperState.wasMultiple = !!o.multiple;
                var v = o.value;
                v != null
                  ? Bn(l, !!o.multiple, v, !1)
                  : h !== !!o.multiple &&
                    (o.defaultValue != null
                      ? Bn(l, !!o.multiple, o.defaultValue, !0)
                      : Bn(l, !!o.multiple, o.multiple ? [] : "", !1));
            }
            l[$r] = o;
          } catch (x) {
            ge(e, e.return, x);
          }
      }
      break;
    case 6:
      if ((mt(t, e), Nt(e), r & 4)) {
        if (e.stateNode === null) throw Error(C(162));
        ((l = e.stateNode), (o = e.memoizedProps));
        try {
          l.nodeValue = o;
        } catch (x) {
          ge(e, e.return, x);
        }
      }
      break;
    case 3:
      if (
        (mt(t, e), Nt(e), r & 4 && n !== null && n.memoizedState.isDehydrated)
      )
        try {
          Ir(t.containerInfo);
        } catch (x) {
          ge(e, e.return, x);
        }
      break;
    case 4:
      (mt(t, e), Nt(e));
      break;
    case 13:
      (mt(t, e),
        Nt(e),
        (l = e.child),
        l.flags & 8192 &&
          ((o = l.memoizedState !== null),
          (l.stateNode.isHidden = o),
          !o ||
            (l.alternate !== null && l.alternate.memoizedState !== null) ||
            (Es = ve())),
        r & 4 && Ba(e));
      break;
    case 22:
      if (
        ((m = n !== null && n.memoizedState !== null),
        e.mode & 1 ? ((Le = (d = Le) || m), mt(t, e), (Le = d)) : mt(t, e),
        Nt(e),
        r & 8192)
      ) {
        if (
          ((d = e.memoizedState !== null),
          (e.stateNode.isHidden = d) && !m && e.mode & 1)
        )
          for (R = e, m = e.child; m !== null;) {
            for (g = R = m; R !== null;) {
              switch (((h = R), (v = h.child), h.tag)) {
                case 0:
                case 11:
                case 14:
                case 15:
                  Er(4, h, h.return);
                  break;
                case 1:
                  Hn(h, h.return);
                  var w = h.stateNode;
                  if (typeof w.componentWillUnmount == "function") {
                    ((r = h), (n = h.return));
                    try {
                      ((t = r),
                        (w.props = t.memoizedProps),
                        (w.state = t.memoizedState),
                        w.componentWillUnmount());
                    } catch (x) {
                      ge(r, n, x);
                    }
                  }
                  break;
                case 5:
                  Hn(h, h.return);
                  break;
                case 22:
                  if (h.memoizedState !== null) {
                    Ya(g);
                    continue;
                  }
              }
              v !== null ? ((v.return = h), (R = v)) : Ya(g);
            }
            m = m.sibling;
          }
        e: for (m = null, g = e; ;) {
          if (g.tag === 5) {
            if (m === null) {
              m = g;
              try {
                ((l = g.stateNode),
                  d
                    ? ((o = l.style),
                      typeof o.setProperty == "function"
                        ? o.setProperty("display", "none", "important")
                        : (o.display = "none"))
                    : ((u = g.stateNode),
                      (s = g.memoizedProps.style),
                      (i =
                        s != null && s.hasOwnProperty("display")
                          ? s.display
                          : null),
                      (u.style.display = Tu("display", i))));
              } catch (x) {
                ge(e, e.return, x);
              }
            }
          } else if (g.tag === 6) {
            if (m === null)
              try {
                g.stateNode.nodeValue = d ? "" : g.memoizedProps;
              } catch (x) {
                ge(e, e.return, x);
              }
          } else if (
            ((g.tag !== 22 && g.tag !== 23) ||
              g.memoizedState === null ||
              g === e) &&
            g.child !== null
          ) {
            ((g.child.return = g), (g = g.child));
            continue;
          }
          if (g === e) break e;
          for (; g.sibling === null;) {
            if (g.return === null || g.return === e) break e;
            (m === g && (m = null), (g = g.return));
          }
          (m === g && (m = null),
            (g.sibling.return = g.return),
            (g = g.sibling));
        }
      }
      break;
    case 19:
      (mt(t, e), Nt(e), r & 4 && Ba(e));
      break;
    case 21:
      break;
    default:
      (mt(t, e), Nt(e));
  }
}
function Nt(e) {
  var t = e.flags;
  if (t & 2) {
    try {
      e: {
        for (var n = e.return; n !== null;) {
          if (nd(n)) {
            var r = n;
            break e;
          }
          n = n.return;
        }
        throw Error(C(160));
      }
      switch (r.tag) {
        case 5:
          var l = r.stateNode;
          r.flags & 32 && (br(l, ""), (r.flags &= -33));
          var o = Wa(e);
          Li(e, o, l);
          break;
        case 3:
        case 4:
          var i = r.stateNode.containerInfo,
            u = Wa(e);
          Ri(e, u, i);
          break;
        default:
          throw Error(C(161));
      }
    } catch (s) {
      ge(e, e.return, s);
    }
    e.flags &= -3;
  }
  t & 4096 && (e.flags &= -4097);
}
function Zp(e, t, n) {
  ((R = e), od(e));
}
function od(e, t, n) {
  for (var r = (e.mode & 1) !== 0; R !== null;) {
    var l = R,
      o = l.child;
    if (l.tag === 22 && r) {
      var i = l.memoizedState !== null || hl;
      if (!i) {
        var u = l.alternate,
          s = (u !== null && u.memoizedState !== null) || Le;
        u = hl;
        var d = Le;
        if (((hl = i), (Le = s) && !d))
          for (R = l; R !== null;)
            ((i = R),
              (s = i.child),
              i.tag === 22 && i.memoizedState !== null
                ? Qa(l)
                : s !== null
                  ? ((s.return = i), (R = s))
                  : Qa(l));
        for (; o !== null;) ((R = o), od(o), (o = o.sibling));
        ((R = l), (hl = u), (Le = d));
      }
      Xa(e);
    } else
      l.subtreeFlags & 8772 && o !== null ? ((o.return = l), (R = o)) : Xa(e);
  }
}
function Xa(e) {
  for (; R !== null;) {
    var t = R;
    if (t.flags & 8772) {
      var n = t.alternate;
      try {
        if (t.flags & 8772)
          switch (t.tag) {
            case 0:
            case 11:
            case 15:
              Le || uo(5, t);
              break;
            case 1:
              var r = t.stateNode;
              if (t.flags & 4 && !Le)
                if (n === null) r.componentDidMount();
                else {
                  var l =
                    t.elementType === t.type
                      ? n.memoizedProps
                      : ht(t.type, n.memoizedProps);
                  r.componentDidUpdate(
                    l,
                    n.memoizedState,
                    r.__reactInternalSnapshotBeforeUpdate,
                  );
                }
              var o = t.updateQueue;
              o !== null && Ta(t, o, r);
              break;
            case 3:
              var i = t.updateQueue;
              if (i !== null) {
                if (((n = null), t.child !== null))
                  switch (t.child.tag) {
                    case 5:
                      n = t.child.stateNode;
                      break;
                    case 1:
                      n = t.child.stateNode;
                  }
                Ta(t, i, n);
              }
              break;
            case 5:
              var u = t.stateNode;
              if (n === null && t.flags & 4) {
                n = u;
                var s = t.memoizedProps;
                switch (t.type) {
                  case "button":
                  case "input":
                  case "select":
                  case "textarea":
                    s.autoFocus && n.focus();
                    break;
                  case "img":
                    s.src && (n.src = s.src);
                }
              }
              break;
            case 6:
              break;
            case 4:
              break;
            case 12:
              break;
            case 13:
              if (t.memoizedState === null) {
                var d = t.alternate;
                if (d !== null) {
                  var m = d.memoizedState;
                  if (m !== null) {
                    var g = m.dehydrated;
                    g !== null && Ir(g);
                  }
                }
              }
              break;
            case 19:
            case 17:
            case 21:
            case 22:
            case 23:
            case 25:
              break;
            default:
              throw Error(C(163));
          }
        Le || (t.flags & 512 && _i(t));
      } catch (h) {
        ge(t, t.return, h);
      }
    }
    if (t === e) {
      R = null;
      break;
    }
    if (((n = t.sibling), n !== null)) {
      ((n.return = t.return), (R = n));
      break;
    }
    R = t.return;
  }
}
function Ya(e) {
  for (; R !== null;) {
    var t = R;
    if (t === e) {
      R = null;
      break;
    }
    var n = t.sibling;
    if (n !== null) {
      ((n.return = t.return), (R = n));
      break;
    }
    R = t.return;
  }
}
function Qa(e) {
  for (; R !== null;) {
    var t = R;
    try {
      switch (t.tag) {
        case 0:
        case 11:
        case 15:
          var n = t.return;
          try {
            uo(4, t);
          } catch (s) {
            ge(t, n, s);
          }
          break;
        case 1:
          var r = t.stateNode;
          if (typeof r.componentDidMount == "function") {
            var l = t.return;
            try {
              r.componentDidMount();
            } catch (s) {
              ge(t, l, s);
            }
          }
          var o = t.return;
          try {
            _i(t);
          } catch (s) {
            ge(t, o, s);
          }
          break;
        case 5:
          var i = t.return;
          try {
            _i(t);
          } catch (s) {
            ge(t, i, s);
          }
      }
    } catch (s) {
      ge(t, t.return, s);
    }
    if (t === e) {
      R = null;
      break;
    }
    var u = t.sibling;
    if (u !== null) {
      ((u.return = t.return), (R = u));
      break;
    }
    R = t.return;
  }
}
var Jp = Math.ceil,
  Kl = Ot.ReactCurrentDispatcher,
  Cs = Ot.ReactCurrentOwner,
  ut = Ot.ReactCurrentBatchConfig,
  K = 0,
  Pe = null,
  Se = null,
  Te = 0,
  Ze = 0,
  Wn = un(0),
  je = 0,
  Xr = null,
  Nn = 0,
  co = 0,
  Ms = 0,
  Pr = null,
  Be = null,
  Es = 0,
  rr = 1 / 0,
  zt = null,
  Gl = !1,
  Ii = null,
  nn = null,
  gl = !1,
  Kt = null,
  Zl = 0,
  zr = 0,
  Fi = null,
  El = -1,
  Pl = 0;
function $e() {
  return K & 6 ? ve() : El !== -1 ? El : (El = ve());
}
function rn(e) {
  return e.mode & 1
    ? K & 2 && Te !== 0
      ? Te & -Te
      : Ip.transition !== null
        ? (Pl === 0 && (Pl = Hu()), Pl)
        : ((e = ee),
          e !== 0 || ((e = window.event), (e = e === void 0 ? 16 : Gu(e.type))),
          e)
    : 1;
}
function xt(e, t, n, r) {
  if (50 < zr) throw ((zr = 0), (Fi = null), Error(C(185)));
  (Qr(e, n, r),
    (!(K & 2) || e !== Pe) &&
      (e === Pe && (!(K & 2) && (co |= n), je === 4 && Yt(e, Te)),
      Ke(e, r),
      n === 1 && K === 0 && !(t.mode & 1) && ((rr = ve() + 500), io && cn())));
}
function Ke(e, t) {
  var n = e.callbackNode;
  If(e, t);
  var r = Ll(e, e === Pe ? Te : 0);
  if (r === 0)
    (n !== null && ra(n), (e.callbackNode = null), (e.callbackPriority = 0));
  else if (((t = r & -r), e.callbackPriority !== t)) {
    if ((n != null && ra(n), t === 1))
      (e.tag === 0 ? Lp(Ka.bind(null, e)) : hc(Ka.bind(null, e)),
        Tp(function () {
          !(K & 6) && cn();
        }),
        (n = null));
    else {
      switch (Wu(r)) {
        case 1:
          n = qi;
          break;
        case 4:
          n = Uu;
          break;
        case 16:
          n = Rl;
          break;
        case 536870912:
          n = Vu;
          break;
        default:
          n = Rl;
      }
      n = pd(n, id.bind(null, e));
    }
    ((e.callbackPriority = t), (e.callbackNode = n));
  }
}
function id(e, t) {
  if (((El = -1), (Pl = 0), K & 6)) throw Error(C(327));
  var n = e.callbackNode;
  if (Gn() && e.callbackNode !== n) return null;
  var r = Ll(e, e === Pe ? Te : 0);
  if (r === 0) return null;
  if (r & 30 || r & e.expiredLanes || t) t = Jl(e, r);
  else {
    t = r;
    var l = K;
    K |= 2;
    var o = ad();
    (Pe !== e || Te !== t) && ((zt = null), (rr = ve() + 500), vn(e, t));
    do
      try {
        t0();
        break;
      } catch (u) {
        sd(e, u);
      }
    while (!0);
    (fs(),
      (Kl.current = o),
      (K = l),
      Se !== null ? (t = 0) : ((Pe = null), (Te = 0), (t = je)));
  }
  if (t !== 0) {
    if (
      (t === 2 && ((l = ui(e)), l !== 0 && ((r = l), (t = Di(e, l)))), t === 1)
    )
      throw ((n = Xr), vn(e, 0), Yt(e, r), Ke(e, ve()), n);
    if (t === 6) Yt(e, r);
    else {
      if (
        ((l = e.current.alternate),
        !(r & 30) &&
          !qp(l) &&
          ((t = Jl(e, r)),
          t === 2 && ((o = ui(e)), o !== 0 && ((r = o), (t = Di(e, o)))),
          t === 1))
      )
        throw ((n = Xr), vn(e, 0), Yt(e, r), Ke(e, ve()), n);
      switch (((e.finishedWork = l), (e.finishedLanes = r), t)) {
        case 0:
        case 1:
          throw Error(C(345));
        case 2:
          mn(e, Be, zt);
          break;
        case 3:
          if (
            (Yt(e, r), (r & 130023424) === r && ((t = Es + 500 - ve()), 10 < t))
          ) {
            if (Ll(e, 0) !== 0) break;
            if (((l = e.suspendedLanes), (l & r) !== r)) {
              ($e(), (e.pingedLanes |= e.suspendedLanes & l));
              break;
            }
            e.timeoutHandle = yi(mn.bind(null, e, Be, zt), t);
            break;
          }
          mn(e, Be, zt);
          break;
        case 4:
          if ((Yt(e, r), (r & 4194240) === r)) break;
          for (t = e.eventTimes, l = -1; 0 < r;) {
            var i = 31 - vt(r);
            ((o = 1 << i), (i = t[i]), i > l && (l = i), (r &= ~o));
          }
          if (
            ((r = l),
            (r = ve() - r),
            (r =
              (120 > r
                ? 120
                : 480 > r
                  ? 480
                  : 1080 > r
                    ? 1080
                    : 1920 > r
                      ? 1920
                      : 3e3 > r
                        ? 3e3
                        : 4320 > r
                          ? 4320
                          : 1960 * Jp(r / 1960)) - r),
            10 < r)
          ) {
            e.timeoutHandle = yi(mn.bind(null, e, Be, zt), r);
            break;
          }
          mn(e, Be, zt);
          break;
        case 5:
          mn(e, Be, zt);
          break;
        default:
          throw Error(C(329));
      }
    }
  }
  return (Ke(e, ve()), e.callbackNode === n ? id.bind(null, e) : null);
}
function Di(e, t) {
  var n = Pr;
  return (
    e.current.memoizedState.isDehydrated && (vn(e, t).flags |= 256),
    (e = Jl(e, t)),
    e !== 2 && ((t = Be), (Be = n), t !== null && Oi(t)),
    e
  );
}
function Oi(e) {
  Be === null ? (Be = e) : Be.push.apply(Be, e);
}
function qp(e) {
  for (var t = e; ;) {
    if (t.flags & 16384) {
      var n = t.updateQueue;
      if (n !== null && ((n = n.stores), n !== null))
        for (var r = 0; r < n.length; r++) {
          var l = n[r],
            o = l.getSnapshot;
          l = l.value;
          try {
            if (!wt(o(), l)) return !1;
          } catch {
            return !1;
          }
        }
    }
    if (((n = t.child), t.subtreeFlags & 16384 && n !== null))
      ((n.return = t), (t = n));
    else {
      if (t === e) break;
      for (; t.sibling === null;) {
        if (t.return === null || t.return === e) return !0;
        t = t.return;
      }
      ((t.sibling.return = t.return), (t = t.sibling));
    }
  }
  return !0;
}
function Yt(e, t) {
  for (
    t &= ~Ms,
      t &= ~co,
      e.suspendedLanes |= t,
      e.pingedLanes &= ~t,
      e = e.expirationTimes;
    0 < t;
  ) {
    var n = 31 - vt(t),
      r = 1 << n;
    ((e[n] = -1), (t &= ~r));
  }
}
function Ka(e) {
  if (K & 6) throw Error(C(327));
  Gn();
  var t = Ll(e, 0);
  if (!(t & 1)) return (Ke(e, ve()), null);
  var n = Jl(e, t);
  if (e.tag !== 0 && n === 2) {
    var r = ui(e);
    r !== 0 && ((t = r), (n = Di(e, r)));
  }
  if (n === 1) throw ((n = Xr), vn(e, 0), Yt(e, t), Ke(e, ve()), n);
  if (n === 6) throw Error(C(345));
  return (
    (e.finishedWork = e.current.alternate),
    (e.finishedLanes = t),
    mn(e, Be, zt),
    Ke(e, ve()),
    null
  );
}
function Ps(e, t) {
  var n = K;
  K |= 1;
  try {
    return e(t);
  } finally {
    ((K = n), K === 0 && ((rr = ve() + 500), io && cn()));
  }
}
function jn(e) {
  Kt !== null && Kt.tag === 0 && !(K & 6) && Gn();
  var t = K;
  K |= 1;
  var n = ut.transition,
    r = ee;
  try {
    if (((ut.transition = null), (ee = 1), e)) return e();
  } finally {
    ((ee = r), (ut.transition = n), (K = t), !(K & 6) && cn());
  }
}
function zs() {
  ((Ze = Wn.current), se(Wn));
}
function vn(e, t) {
  ((e.finishedWork = null), (e.finishedLanes = 0));
  var n = e.timeoutHandle;
  if ((n !== -1 && ((e.timeoutHandle = -1), zp(n)), Se !== null))
    for (n = Se.return; n !== null;) {
      var r = n;
      switch ((us(r), r.tag)) {
        case 1:
          ((r = r.type.childContextTypes), r != null && Al());
          break;
        case 3:
          (tr(), se(Ye), se(Ie), vs());
          break;
        case 5:
          ys(r);
          break;
        case 4:
          tr();
          break;
        case 13:
          se(de);
          break;
        case 19:
          se(de);
          break;
        case 10:
          ps(r.type._context);
          break;
        case 22:
        case 23:
          zs();
      }
      n = n.return;
    }
  if (
    ((Pe = e),
    (Se = e = ln(e.current, null)),
    (Te = Ze = t),
    (je = 0),
    (Xr = null),
    (Ms = co = Nn = 0),
    (Be = Pr = null),
    gn !== null)
  ) {
    for (t = 0; t < gn.length; t++)
      if (((n = gn[t]), (r = n.interleaved), r !== null)) {
        n.interleaved = null;
        var l = r.next,
          o = n.pending;
        if (o !== null) {
          var i = o.next;
          ((o.next = l), (r.next = i));
        }
        n.pending = r;
      }
    gn = null;
  }
  return e;
}
function sd(e, t) {
  do {
    var n = Se;
    try {
      if ((fs(), (jl.current = Ql), Yl)) {
        for (var r = fe.memoizedState; r !== null;) {
          var l = r.queue;
          (l !== null && (l.pending = null), (r = r.next));
        }
        Yl = !1;
      }
      if (
        ((Sn = 0),
        (Ee = Ne = fe = null),
        (Mr = !1),
        (Hr = 0),
        (Cs.current = null),
        n === null || n.return === null)
      ) {
        ((je = 1), (Xr = t), (Se = null));
        break;
      }
      e: {
        var o = e,
          i = n.return,
          u = n,
          s = t;
        if (
          ((t = Te),
          (u.flags |= 32768),
          s !== null && typeof s == "object" && typeof s.then == "function")
        ) {
          var d = s,
            m = u,
            g = m.tag;
          if (!(m.mode & 1) && (g === 0 || g === 11 || g === 15)) {
            var h = m.alternate;
            h
              ? ((m.updateQueue = h.updateQueue),
                (m.memoizedState = h.memoizedState),
                (m.lanes = h.lanes))
              : ((m.updateQueue = null), (m.memoizedState = null));
          }
          var v = Fa(i);
          if (v !== null) {
            ((v.flags &= -257),
              Da(v, i, u, o, t),
              v.mode & 1 && Ia(o, d, t),
              (t = v),
              (s = d));
            var w = t.updateQueue;
            if (w === null) {
              var x = new Set();
              (x.add(s), (t.updateQueue = x));
            } else w.add(s);
            break e;
          } else {
            if (!(t & 1)) {
              (Ia(o, d, t), Ts());
              break e;
            }
            s = Error(C(426));
          }
        } else if (ue && u.mode & 1) {
          var F = Fa(i);
          if (F !== null) {
            (!(F.flags & 65536) && (F.flags |= 256),
              Da(F, i, u, o, t),
              cs(nr(s, u)));
            break e;
          }
        }
        ((o = s = nr(s, u)),
          je !== 4 && (je = 2),
          Pr === null ? (Pr = [o]) : Pr.push(o),
          (o = i));
        do {
          switch (o.tag) {
            case 3:
              ((o.flags |= 65536), (t &= -t), (o.lanes |= t));
              var f = Wc(o, s, t);
              za(o, f);
              break e;
            case 1:
              u = s;
              var c = o.type,
                p = o.stateNode;
              if (
                !(o.flags & 128) &&
                (typeof c.getDerivedStateFromError == "function" ||
                  (p !== null &&
                    typeof p.componentDidCatch == "function" &&
                    (nn === null || !nn.has(p))))
              ) {
                ((o.flags |= 65536), (t &= -t), (o.lanes |= t));
                var y = Bc(o, u, t);
                za(o, y);
                break e;
              }
          }
          o = o.return;
        } while (o !== null);
      }
      cd(n);
    } catch (S) {
      ((t = S), Se === n && n !== null && (Se = n = n.return));
      continue;
    }
    break;
  } while (!0);
}
function ad() {
  var e = Kl.current;
  return ((Kl.current = Ql), e === null ? Ql : e);
}
function Ts() {
  ((je === 0 || je === 3 || je === 2) && (je = 4),
    Pe === null || (!(Nn & 268435455) && !(co & 268435455)) || Yt(Pe, Te));
}
function Jl(e, t) {
  var n = K;
  K |= 2;
  var r = ad();
  (Pe !== e || Te !== t) && ((zt = null), vn(e, t));
  do
    try {
      e0();
      break;
    } catch (l) {
      sd(e, l);
    }
  while (!0);
  if ((fs(), (K = n), (Kl.current = r), Se !== null)) throw Error(C(261));
  return ((Pe = null), (Te = 0), je);
}
function e0() {
  for (; Se !== null;) ud(Se);
}
function t0() {
  for (; Se !== null && !Mf();) ud(Se);
}
function ud(e) {
  var t = fd(e.alternate, e, Ze);
  ((e.memoizedProps = e.pendingProps),
    t === null ? cd(e) : (Se = t),
    (Cs.current = null));
}
function cd(e) {
  var t = e;
  do {
    var n = t.alternate;
    if (((e = t.return), t.flags & 32768)) {
      if (((n = Qp(n, t)), n !== null)) {
        ((n.flags &= 32767), (Se = n));
        return;
      }
      if (e !== null)
        ((e.flags |= 32768), (e.subtreeFlags = 0), (e.deletions = null));
      else {
        ((je = 6), (Se = null));
        return;
      }
    } else if (((n = Yp(n, t, Ze)), n !== null)) {
      Se = n;
      return;
    }
    if (((t = t.sibling), t !== null)) {
      Se = t;
      return;
    }
    Se = t = e;
  } while (t !== null);
  je === 0 && (je = 5);
}
function mn(e, t, n) {
  var r = ee,
    l = ut.transition;
  try {
    ((ut.transition = null), (ee = 1), n0(e, t, n, r));
  } finally {
    ((ut.transition = l), (ee = r));
  }
  return null;
}
function n0(e, t, n, r) {
  do Gn();
  while (Kt !== null);
  if (K & 6) throw Error(C(327));
  n = e.finishedWork;
  var l = e.finishedLanes;
  if (n === null) return null;
  if (((e.finishedWork = null), (e.finishedLanes = 0), n === e.current))
    throw Error(C(177));
  ((e.callbackNode = null), (e.callbackPriority = 0));
  var o = n.lanes | n.childLanes;
  if (
    (Ff(e, o),
    e === Pe && ((Se = Pe = null), (Te = 0)),
    (!(n.subtreeFlags & 2064) && !(n.flags & 2064)) ||
      gl ||
      ((gl = !0),
      pd(Rl, function () {
        return (Gn(), null);
      })),
    (o = (n.flags & 15990) !== 0),
    n.subtreeFlags & 15990 || o)
  ) {
    ((o = ut.transition), (ut.transition = null));
    var i = ee;
    ee = 1;
    var u = K;
    ((K |= 4),
      (Cs.current = null),
      Gp(e, n),
      ld(n, e),
      Sp(hi),
      (Il = !!mi),
      (hi = mi = null),
      (e.current = n),
      Zp(n),
      Ef(),
      (K = u),
      (ee = i),
      (ut.transition = o));
  } else e.current = n;
  if (
    (gl && ((gl = !1), (Kt = e), (Zl = l)),
    (o = e.pendingLanes),
    o === 0 && (nn = null),
    Tf(n.stateNode),
    Ke(e, ve()),
    t !== null)
  )
    for (r = e.onRecoverableError, n = 0; n < t.length; n++)
      ((l = t[n]), r(l.value, { componentStack: l.stack, digest: l.digest }));
  if (Gl) throw ((Gl = !1), (e = Ii), (Ii = null), e);
  return (
    Zl & 1 && e.tag !== 0 && Gn(),
    (o = e.pendingLanes),
    o & 1 ? (e === Fi ? zr++ : ((zr = 0), (Fi = e))) : (zr = 0),
    cn(),
    null
  );
}
function Gn() {
  if (Kt !== null) {
    var e = Wu(Zl),
      t = ut.transition,
      n = ee;
    try {
      if (((ut.transition = null), (ee = 16 > e ? 16 : e), Kt === null))
        var r = !1;
      else {
        if (((e = Kt), (Kt = null), (Zl = 0), K & 6)) throw Error(C(331));
        var l = K;
        for (K |= 4, R = e.current; R !== null;) {
          var o = R,
            i = o.child;
          if (R.flags & 16) {
            var u = o.deletions;
            if (u !== null) {
              for (var s = 0; s < u.length; s++) {
                var d = u[s];
                for (R = d; R !== null;) {
                  var m = R;
                  switch (m.tag) {
                    case 0:
                    case 11:
                    case 15:
                      Er(8, m, o);
                  }
                  var g = m.child;
                  if (g !== null) ((g.return = m), (R = g));
                  else
                    for (; R !== null;) {
                      m = R;
                      var h = m.sibling,
                        v = m.return;
                      if ((td(m), m === d)) {
                        R = null;
                        break;
                      }
                      if (h !== null) {
                        ((h.return = v), (R = h));
                        break;
                      }
                      R = v;
                    }
                }
              }
              var w = o.alternate;
              if (w !== null) {
                var x = w.child;
                if (x !== null) {
                  w.child = null;
                  do {
                    var F = x.sibling;
                    ((x.sibling = null), (x = F));
                  } while (x !== null);
                }
              }
              R = o;
            }
          }
          if (o.subtreeFlags & 2064 && i !== null) ((i.return = o), (R = i));
          else
            e: for (; R !== null;) {
              if (((o = R), o.flags & 2048))
                switch (o.tag) {
                  case 0:
                  case 11:
                  case 15:
                    Er(9, o, o.return);
                }
              var f = o.sibling;
              if (f !== null) {
                ((f.return = o.return), (R = f));
                break e;
              }
              R = o.return;
            }
        }
        var c = e.current;
        for (R = c; R !== null;) {
          i = R;
          var p = i.child;
          if (i.subtreeFlags & 2064 && p !== null) ((p.return = i), (R = p));
          else
            e: for (i = c; R !== null;) {
              if (((u = R), u.flags & 2048))
                try {
                  switch (u.tag) {
                    case 0:
                    case 11:
                    case 15:
                      uo(9, u);
                  }
                } catch (S) {
                  ge(u, u.return, S);
                }
              if (u === i) {
                R = null;
                break e;
              }
              var y = u.sibling;
              if (y !== null) {
                ((y.return = u.return), (R = y));
                break e;
              }
              R = u.return;
            }
        }
        if (
          ((K = l), cn(), Mt && typeof Mt.onPostCommitFiberRoot == "function")
        )
          try {
            Mt.onPostCommitFiberRoot(to, e);
          } catch {}
        r = !0;
      }
      return r;
    } finally {
      ((ee = n), (ut.transition = t));
    }
  }
  return !1;
}
function Ga(e, t, n) {
  ((t = nr(n, t)),
    (t = Wc(e, t, 1)),
    (e = tn(e, t, 1)),
    (t = $e()),
    e !== null && (Qr(e, 1, t), Ke(e, t)));
}
function ge(e, t, n) {
  if (e.tag === 3) Ga(e, e, n);
  else
    for (; t !== null;) {
      if (t.tag === 3) {
        Ga(t, e, n);
        break;
      } else if (t.tag === 1) {
        var r = t.stateNode;
        if (
          typeof t.type.getDerivedStateFromError == "function" ||
          (typeof r.componentDidCatch == "function" &&
            (nn === null || !nn.has(r)))
        ) {
          ((e = nr(n, e)),
            (e = Bc(t, e, 1)),
            (t = tn(t, e, 1)),
            (e = $e()),
            t !== null && (Qr(t, 1, e), Ke(t, e)));
          break;
        }
      }
      t = t.return;
    }
}
function r0(e, t, n) {
  var r = e.pingCache;
  (r !== null && r.delete(t),
    (t = $e()),
    (e.pingedLanes |= e.suspendedLanes & n),
    Pe === e &&
      (Te & n) === n &&
      (je === 4 || (je === 3 && (Te & 130023424) === Te && 500 > ve() - Es)
        ? vn(e, 0)
        : (Ms |= n)),
    Ke(e, t));
}
function dd(e, t) {
  t === 0 &&
    (e.mode & 1
      ? ((t = il), (il <<= 1), !(il & 130023424) && (il = 4194304))
      : (t = 1));
  var n = $e();
  ((e = Ft(e, t)), e !== null && (Qr(e, t, n), Ke(e, n)));
}
function l0(e) {
  var t = e.memoizedState,
    n = 0;
  (t !== null && (n = t.retryLane), dd(e, n));
}
function o0(e, t) {
  var n = 0;
  switch (e.tag) {
    case 13:
      var r = e.stateNode,
        l = e.memoizedState;
      l !== null && (n = l.retryLane);
      break;
    case 19:
      r = e.stateNode;
      break;
    default:
      throw Error(C(314));
  }
  (r !== null && r.delete(t), dd(e, n));
}
var fd;
fd = function (e, t, n) {
  if (e !== null)
    if (e.memoizedProps !== t.pendingProps || Ye.current) Xe = !0;
    else {
      if (!(e.lanes & n) && !(t.flags & 128)) return ((Xe = !1), Xp(e, t, n));
      Xe = !!(e.flags & 131072);
    }
  else ((Xe = !1), ue && t.flags & 1048576 && gc(t, Vl, t.index));
  switch (((t.lanes = 0), t.tag)) {
    case 2:
      var r = t.type;
      (Ml(e, t), (e = t.pendingProps));
      var l = Jn(t, Ie.current);
      (Kn(t, n), (l = ws(null, t, r, e, l, n)));
      var o = ks();
      return (
        (t.flags |= 1),
        typeof l == "object" &&
        l !== null &&
        typeof l.render == "function" &&
        l.$$typeof === void 0
          ? ((t.tag = 1),
            (t.memoizedState = null),
            (t.updateQueue = null),
            Qe(r) ? ((o = !0), $l(t)) : (o = !1),
            (t.memoizedState =
              l.state !== null && l.state !== void 0 ? l.state : null),
            hs(t),
            (l.updater = ao),
            (t.stateNode = l),
            (l._reactInternals = t),
            ji(t, r, e, n),
            (t = Ei(null, t, r, !0, o, n)))
          : ((t.tag = 0), ue && o && as(t), Ae(null, t, l, n), (t = t.child)),
        t
      );
    case 16:
      r = t.elementType;
      e: {
        switch (
          (Ml(e, t),
          (e = t.pendingProps),
          (l = r._init),
          (r = l(r._payload)),
          (t.type = r),
          (l = t.tag = s0(r)),
          (e = ht(r, e)),
          l)
        ) {
          case 0:
            t = Mi(null, t, r, e, n);
            break e;
          case 1:
            t = $a(null, t, r, e, n);
            break e;
          case 11:
            t = Oa(null, t, r, e, n);
            break e;
          case 14:
            t = Aa(null, t, r, ht(r.type, e), n);
            break e;
        }
        throw Error(C(306, r, ""));
      }
      return t;
    case 0:
      return (
        (r = t.type),
        (l = t.pendingProps),
        (l = t.elementType === r ? l : ht(r, l)),
        Mi(e, t, r, l, n)
      );
    case 1:
      return (
        (r = t.type),
        (l = t.pendingProps),
        (l = t.elementType === r ? l : ht(r, l)),
        $a(e, t, r, l, n)
      );
    case 3:
      e: {
        if ((Kc(t), e === null)) throw Error(C(387));
        ((r = t.pendingProps),
          (o = t.memoizedState),
          (l = o.element),
          Sc(e, t),
          Bl(t, r, null, n));
        var i = t.memoizedState;
        if (((r = i.element), o.isDehydrated))
          if (
            ((o = {
              element: r,
              isDehydrated: !1,
              cache: i.cache,
              pendingSuspenseBoundaries: i.pendingSuspenseBoundaries,
              transitions: i.transitions,
            }),
            (t.updateQueue.baseState = o),
            (t.memoizedState = o),
            t.flags & 256)
          ) {
            ((l = nr(Error(C(423)), t)), (t = Ua(e, t, r, n, l)));
            break e;
          } else if (r !== l) {
            ((l = nr(Error(C(424)), t)), (t = Ua(e, t, r, n, l)));
            break e;
          } else
            for (
              Je = en(t.stateNode.containerInfo.firstChild),
                qe = t,
                ue = !0,
                yt = null,
                n = wc(t, null, r, n),
                t.child = n;
              n;
            )
              ((n.flags = (n.flags & -3) | 4096), (n = n.sibling));
        else {
          if ((qn(), r === l)) {
            t = Dt(e, t, n);
            break e;
          }
          Ae(e, t, r, n);
        }
        t = t.child;
      }
      return t;
    case 5:
      return (
        Nc(t),
        e === null && ki(t),
        (r = t.type),
        (l = t.pendingProps),
        (o = e !== null ? e.memoizedProps : null),
        (i = l.children),
        gi(r, l) ? (i = null) : o !== null && gi(r, o) && (t.flags |= 32),
        Qc(e, t),
        Ae(e, t, i, n),
        t.child
      );
    case 6:
      return (e === null && ki(t), null);
    case 13:
      return Gc(e, t, n);
    case 4:
      return (
        gs(t, t.stateNode.containerInfo),
        (r = t.pendingProps),
        e === null ? (t.child = er(t, null, r, n)) : Ae(e, t, r, n),
        t.child
      );
    case 11:
      return (
        (r = t.type),
        (l = t.pendingProps),
        (l = t.elementType === r ? l : ht(r, l)),
        Oa(e, t, r, l, n)
      );
    case 7:
      return (Ae(e, t, t.pendingProps, n), t.child);
    case 8:
      return (Ae(e, t, t.pendingProps.children, n), t.child);
    case 12:
      return (Ae(e, t, t.pendingProps.children, n), t.child);
    case 10:
      e: {
        if (
          ((r = t.type._context),
          (l = t.pendingProps),
          (o = t.memoizedProps),
          (i = l.value),
          oe(Hl, r._currentValue),
          (r._currentValue = i),
          o !== null)
        )
          if (wt(o.value, i)) {
            if (o.children === l.children && !Ye.current) {
              t = Dt(e, t, n);
              break e;
            }
          } else
            for (o = t.child, o !== null && (o.return = t); o !== null;) {
              var u = o.dependencies;
              if (u !== null) {
                i = o.child;
                for (var s = u.firstContext; s !== null;) {
                  if (s.context === r) {
                    if (o.tag === 1) {
                      ((s = Rt(-1, n & -n)), (s.tag = 2));
                      var d = o.updateQueue;
                      if (d !== null) {
                        d = d.shared;
                        var m = d.pending;
                        (m === null
                          ? (s.next = s)
                          : ((s.next = m.next), (m.next = s)),
                          (d.pending = s));
                      }
                    }
                    ((o.lanes |= n),
                      (s = o.alternate),
                      s !== null && (s.lanes |= n),
                      Si(o.return, n, t),
                      (u.lanes |= n));
                    break;
                  }
                  s = s.next;
                }
              } else if (o.tag === 10) i = o.type === t.type ? null : o.child;
              else if (o.tag === 18) {
                if (((i = o.return), i === null)) throw Error(C(341));
                ((i.lanes |= n),
                  (u = i.alternate),
                  u !== null && (u.lanes |= n),
                  Si(i, n, t),
                  (i = o.sibling));
              } else i = o.child;
              if (i !== null) i.return = o;
              else
                for (i = o; i !== null;) {
                  if (i === t) {
                    i = null;
                    break;
                  }
                  if (((o = i.sibling), o !== null)) {
                    ((o.return = i.return), (i = o));
                    break;
                  }
                  i = i.return;
                }
              o = i;
            }
        (Ae(e, t, l.children, n), (t = t.child));
      }
      return t;
    case 9:
      return (
        (l = t.type),
        (r = t.pendingProps.children),
        Kn(t, n),
        (l = ct(l)),
        (r = r(l)),
        (t.flags |= 1),
        Ae(e, t, r, n),
        t.child
      );
    case 14:
      return (
        (r = t.type),
        (l = ht(r, t.pendingProps)),
        (l = ht(r.type, l)),
        Aa(e, t, r, l, n)
      );
    case 15:
      return Xc(e, t, t.type, t.pendingProps, n);
    case 17:
      return (
        (r = t.type),
        (l = t.pendingProps),
        (l = t.elementType === r ? l : ht(r, l)),
        Ml(e, t),
        (t.tag = 1),
        Qe(r) ? ((e = !0), $l(t)) : (e = !1),
        Kn(t, n),
        Hc(t, r, l),
        ji(t, r, l, n),
        Ei(null, t, r, !0, e, n)
      );
    case 19:
      return Zc(e, t, n);
    case 22:
      return Yc(e, t, n);
  }
  throw Error(C(156, t.tag));
};
function pd(e, t) {
  return $u(e, t);
}
function i0(e, t, n, r) {
  ((this.tag = e),
    (this.key = n),
    (this.sibling =
      this.child =
      this.return =
      this.stateNode =
      this.type =
      this.elementType =
        null),
    (this.index = 0),
    (this.ref = null),
    (this.pendingProps = t),
    (this.dependencies =
      this.memoizedState =
      this.updateQueue =
      this.memoizedProps =
        null),
    (this.mode = r),
    (this.subtreeFlags = this.flags = 0),
    (this.deletions = null),
    (this.childLanes = this.lanes = 0),
    (this.alternate = null));
}
function at(e, t, n, r) {
  return new i0(e, t, n, r);
}
function bs(e) {
  return ((e = e.prototype), !(!e || !e.isReactComponent));
}
function s0(e) {
  if (typeof e == "function") return bs(e) ? 1 : 0;
  if (e != null) {
    if (((e = e.$$typeof), e === Gi)) return 11;
    if (e === Zi) return 14;
  }
  return 2;
}
function ln(e, t) {
  var n = e.alternate;
  return (
    n === null
      ? ((n = at(e.tag, t, e.key, e.mode)),
        (n.elementType = e.elementType),
        (n.type = e.type),
        (n.stateNode = e.stateNode),
        (n.alternate = e),
        (e.alternate = n))
      : ((n.pendingProps = t),
        (n.type = e.type),
        (n.flags = 0),
        (n.subtreeFlags = 0),
        (n.deletions = null)),
    (n.flags = e.flags & 14680064),
    (n.childLanes = e.childLanes),
    (n.lanes = e.lanes),
    (n.child = e.child),
    (n.memoizedProps = e.memoizedProps),
    (n.memoizedState = e.memoizedState),
    (n.updateQueue = e.updateQueue),
    (t = e.dependencies),
    (n.dependencies =
      t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }),
    (n.sibling = e.sibling),
    (n.index = e.index),
    (n.ref = e.ref),
    n
  );
}
function zl(e, t, n, r, l, o) {
  var i = 2;
  if (((r = e), typeof e == "function")) bs(e) && (i = 1);
  else if (typeof e == "string") i = 5;
  else
    e: switch (e) {
      case Ln:
        return xn(n.children, l, o, t);
      case Ki:
        ((i = 8), (l |= 8));
        break;
      case Qo:
        return (
          (e = at(12, n, t, l | 2)),
          (e.elementType = Qo),
          (e.lanes = o),
          e
        );
      case Ko:
        return ((e = at(13, n, t, l)), (e.elementType = Ko), (e.lanes = o), e);
      case Go:
        return ((e = at(19, n, t, l)), (e.elementType = Go), (e.lanes = o), e);
      case Nu:
        return fo(n, l, o, t);
      default:
        if (typeof e == "object" && e !== null)
          switch (e.$$typeof) {
            case ku:
              i = 10;
              break e;
            case Su:
              i = 9;
              break e;
            case Gi:
              i = 11;
              break e;
            case Zi:
              i = 14;
              break e;
            case Wt:
              ((i = 16), (r = null));
              break e;
          }
        throw Error(C(130, e == null ? e : typeof e, ""));
    }
  return (
    (t = at(i, n, t, l)),
    (t.elementType = e),
    (t.type = r),
    (t.lanes = o),
    t
  );
}
function xn(e, t, n, r) {
  return ((e = at(7, e, r, t)), (e.lanes = n), e);
}
function fo(e, t, n, r) {
  return (
    (e = at(22, e, r, t)),
    (e.elementType = Nu),
    (e.lanes = n),
    (e.stateNode = { isHidden: !1 }),
    e
  );
}
function Wo(e, t, n) {
  return ((e = at(6, e, null, t)), (e.lanes = n), e);
}
function Bo(e, t, n) {
  return (
    (t = at(4, e.children !== null ? e.children : [], e.key, t)),
    (t.lanes = n),
    (t.stateNode = {
      containerInfo: e.containerInfo,
      pendingChildren: null,
      implementation: e.implementation,
    }),
    t
  );
}
function a0(e, t, n, r, l) {
  ((this.tag = t),
    (this.containerInfo = e),
    (this.finishedWork =
      this.pingCache =
      this.current =
      this.pendingChildren =
        null),
    (this.timeoutHandle = -1),
    (this.callbackNode = this.pendingContext = this.context = null),
    (this.callbackPriority = 0),
    (this.eventTimes = Co(0)),
    (this.expirationTimes = Co(-1)),
    (this.entangledLanes =
      this.finishedLanes =
      this.mutableReadLanes =
      this.expiredLanes =
      this.pingedLanes =
      this.suspendedLanes =
      this.pendingLanes =
        0),
    (this.entanglements = Co(0)),
    (this.identifierPrefix = r),
    (this.onRecoverableError = l),
    (this.mutableSourceEagerHydrationData = null));
}
function _s(e, t, n, r, l, o, i, u, s) {
  return (
    (e = new a0(e, t, n, u, s)),
    t === 1 ? ((t = 1), o === !0 && (t |= 8)) : (t = 0),
    (o = at(3, null, null, t)),
    (e.current = o),
    (o.stateNode = e),
    (o.memoizedState = {
      element: r,
      isDehydrated: n,
      cache: null,
      transitions: null,
      pendingSuspenseBoundaries: null,
    }),
    hs(o),
    e
  );
}
function u0(e, t, n) {
  var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
  return {
    $$typeof: Rn,
    key: r == null ? null : "" + r,
    children: e,
    containerInfo: t,
    implementation: n,
  };
}
function md(e) {
  if (!e) return sn;
  e = e._reactInternals;
  e: {
    if (Mn(e) !== e || e.tag !== 1) throw Error(C(170));
    var t = e;
    do {
      switch (t.tag) {
        case 3:
          t = t.stateNode.context;
          break e;
        case 1:
          if (Qe(t.type)) {
            t = t.stateNode.__reactInternalMemoizedMergedChildContext;
            break e;
          }
      }
      t = t.return;
    } while (t !== null);
    throw Error(C(171));
  }
  if (e.tag === 1) {
    var n = e.type;
    if (Qe(n)) return mc(e, n, t);
  }
  return t;
}
function hd(e, t, n, r, l, o, i, u, s) {
  return (
    (e = _s(n, r, !0, e, l, o, i, u, s)),
    (e.context = md(null)),
    (n = e.current),
    (r = $e()),
    (l = rn(n)),
    (o = Rt(r, l)),
    (o.callback = t ?? null),
    tn(n, o, l),
    (e.current.lanes = l),
    Qr(e, l, r),
    Ke(e, r),
    e
  );
}
function po(e, t, n, r) {
  var l = t.current,
    o = $e(),
    i = rn(l);
  return (
    (n = md(n)),
    t.context === null ? (t.context = n) : (t.pendingContext = n),
    (t = Rt(o, i)),
    (t.payload = { element: e }),
    (r = r === void 0 ? null : r),
    r !== null && (t.callback = r),
    (e = tn(l, t, i)),
    e !== null && (xt(e, l, i, o), Nl(e, l, i)),
    i
  );
}
function ql(e) {
  if (((e = e.current), !e.child)) return null;
  switch (e.child.tag) {
    case 5:
      return e.child.stateNode;
    default:
      return e.child.stateNode;
  }
}
function Za(e, t) {
  if (((e = e.memoizedState), e !== null && e.dehydrated !== null)) {
    var n = e.retryLane;
    e.retryLane = n !== 0 && n < t ? n : t;
  }
}
function Rs(e, t) {
  (Za(e, t), (e = e.alternate) && Za(e, t));
}
function c0() {
  return null;
}
var gd =
  typeof reportError == "function"
    ? reportError
    : function (e) {
        console.error(e);
      };
function Ls(e) {
  this._internalRoot = e;
}
mo.prototype.render = Ls.prototype.render = function (e) {
  var t = this._internalRoot;
  if (t === null) throw Error(C(409));
  po(e, t, null, null);
};
mo.prototype.unmount = Ls.prototype.unmount = function () {
  var e = this._internalRoot;
  if (e !== null) {
    this._internalRoot = null;
    var t = e.containerInfo;
    (jn(function () {
      po(null, e, null, null);
    }),
      (t[It] = null));
  }
};
function mo(e) {
  this._internalRoot = e;
}
mo.prototype.unstable_scheduleHydration = function (e) {
  if (e) {
    var t = Yu();
    e = { blockedOn: null, target: e, priority: t };
    for (var n = 0; n < Xt.length && t !== 0 && t < Xt[n].priority; n++);
    (Xt.splice(n, 0, e), n === 0 && Ku(e));
  }
};
function Is(e) {
  return !(!e || (e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11));
}
function ho(e) {
  return !(
    !e ||
    (e.nodeType !== 1 &&
      e.nodeType !== 9 &&
      e.nodeType !== 11 &&
      (e.nodeType !== 8 || e.nodeValue !== " react-mount-point-unstable "))
  );
}
function Ja() {}
function d0(e, t, n, r, l) {
  if (l) {
    if (typeof r == "function") {
      var o = r;
      r = function () {
        var d = ql(i);
        o.call(d);
      };
    }
    var i = hd(t, r, e, 0, null, !1, !1, "", Ja);
    return (
      (e._reactRootContainer = i),
      (e[It] = i.current),
      Or(e.nodeType === 8 ? e.parentNode : e),
      jn(),
      i
    );
  }
  for (; (l = e.lastChild);) e.removeChild(l);
  if (typeof r == "function") {
    var u = r;
    r = function () {
      var d = ql(s);
      u.call(d);
    };
  }
  var s = _s(e, 0, !1, null, null, !1, !1, "", Ja);
  return (
    (e._reactRootContainer = s),
    (e[It] = s.current),
    Or(e.nodeType === 8 ? e.parentNode : e),
    jn(function () {
      po(t, s, n, r);
    }),
    s
  );
}
function go(e, t, n, r, l) {
  var o = n._reactRootContainer;
  if (o) {
    var i = o;
    if (typeof l == "function") {
      var u = l;
      l = function () {
        var s = ql(i);
        u.call(s);
      };
    }
    po(t, i, e, l);
  } else i = d0(n, t, e, l, r);
  return ql(i);
}
Bu = function (e) {
  switch (e.tag) {
    case 3:
      var t = e.stateNode;
      if (t.current.memoizedState.isDehydrated) {
        var n = xr(t.pendingLanes);
        n !== 0 &&
          (es(t, n | 1), Ke(t, ve()), !(K & 6) && ((rr = ve() + 500), cn()));
      }
      break;
    case 13:
      (jn(function () {
        var r = Ft(e, 1);
        if (r !== null) {
          var l = $e();
          xt(r, e, 1, l);
        }
      }),
        Rs(e, 1));
  }
};
ts = function (e) {
  if (e.tag === 13) {
    var t = Ft(e, 134217728);
    if (t !== null) {
      var n = $e();
      xt(t, e, 134217728, n);
    }
    Rs(e, 134217728);
  }
};
Xu = function (e) {
  if (e.tag === 13) {
    var t = rn(e),
      n = Ft(e, t);
    if (n !== null) {
      var r = $e();
      xt(n, e, t, r);
    }
    Rs(e, t);
  }
};
Yu = function () {
  return ee;
};
Qu = function (e, t) {
  var n = ee;
  try {
    return ((ee = e), t());
  } finally {
    ee = n;
  }
};
ii = function (e, t, n) {
  switch (t) {
    case "input":
      if ((qo(e, n), (t = n.name), n.type === "radio" && t != null)) {
        for (n = e; n.parentNode;) n = n.parentNode;
        for (
          n = n.querySelectorAll(
            "input[name=" + JSON.stringify("" + t) + '][type="radio"]',
          ),
            t = 0;
          t < n.length;
          t++
        ) {
          var r = n[t];
          if (r !== e && r.form === e.form) {
            var l = oo(r);
            if (!l) throw Error(C(90));
            (Cu(r), qo(r, l));
          }
        }
      }
      break;
    case "textarea":
      Eu(e, n);
      break;
    case "select":
      ((t = n.value), t != null && Bn(e, !!n.multiple, t, !1));
  }
};
Lu = Ps;
Iu = jn;
var f0 = { usingClientEntryPoint: !1, Events: [Gr, On, oo, _u, Ru, Ps] },
  gr = {
    findFiberByHostInstance: hn,
    bundleType: 0,
    version: "18.3.1",
    rendererPackageName: "react-dom",
  },
  p0 = {
    bundleType: gr.bundleType,
    version: gr.version,
    rendererPackageName: gr.rendererPackageName,
    rendererConfig: gr.rendererConfig,
    overrideHookState: null,
    overrideHookStateDeletePath: null,
    overrideHookStateRenamePath: null,
    overrideProps: null,
    overridePropsDeletePath: null,
    overridePropsRenamePath: null,
    setErrorHandler: null,
    setSuspenseHandler: null,
    scheduleUpdate: null,
    currentDispatcherRef: Ot.ReactCurrentDispatcher,
    findHostInstanceByFiber: function (e) {
      return ((e = Ou(e)), e === null ? null : e.stateNode);
    },
    findFiberByHostInstance: gr.findFiberByHostInstance || c0,
    findHostInstancesForRefresh: null,
    scheduleRefresh: null,
    scheduleRoot: null,
    setRefreshHandler: null,
    getCurrentFiber: null,
    reconcilerVersion: "18.3.1-next-f1338f8080-20240426",
  };
if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
  var yl = __REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!yl.isDisabled && yl.supportsFiber)
    try {
      ((to = yl.inject(p0)), (Mt = yl));
    } catch {}
}
tt.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = f0;
tt.createPortal = function (e, t) {
  var n = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
  if (!Is(t)) throw Error(C(200));
  return u0(e, t, null, n);
};
tt.createRoot = function (e, t) {
  if (!Is(e)) throw Error(C(299));
  var n = !1,
    r = "",
    l = gd;
  return (
    t != null &&
      (t.unstable_strictMode === !0 && (n = !0),
      t.identifierPrefix !== void 0 && (r = t.identifierPrefix),
      t.onRecoverableError !== void 0 && (l = t.onRecoverableError)),
    (t = _s(e, 1, !1, null, null, n, !1, r, l)),
    (e[It] = t.current),
    Or(e.nodeType === 8 ? e.parentNode : e),
    new Ls(t)
  );
};
tt.findDOMNode = function (e) {
  if (e == null) return null;
  if (e.nodeType === 1) return e;
  var t = e._reactInternals;
  if (t === void 0)
    throw typeof e.render == "function"
      ? Error(C(188))
      : ((e = Object.keys(e).join(",")), Error(C(268, e)));
  return ((e = Ou(t)), (e = e === null ? null : e.stateNode), e);
};
tt.flushSync = function (e) {
  return jn(e);
};
tt.hydrate = function (e, t, n) {
  if (!ho(t)) throw Error(C(200));
  return go(null, e, t, !0, n);
};
tt.hydrateRoot = function (e, t, n) {
  if (!Is(e)) throw Error(C(405));
  var r = (n != null && n.hydratedSources) || null,
    l = !1,
    o = "",
    i = gd;
  if (
    (n != null &&
      (n.unstable_strictMode === !0 && (l = !0),
      n.identifierPrefix !== void 0 && (o = n.identifierPrefix),
      n.onRecoverableError !== void 0 && (i = n.onRecoverableError)),
    (t = hd(t, null, e, 1, n ?? null, l, !1, o, i)),
    (e[It] = t.current),
    Or(e),
    r)
  )
    for (e = 0; e < r.length; e++)
      ((n = r[e]),
        (l = n._getVersion),
        (l = l(n._source)),
        t.mutableSourceEagerHydrationData == null
          ? (t.mutableSourceEagerHydrationData = [n, l])
          : t.mutableSourceEagerHydrationData.push(n, l));
  return new mo(t);
};
tt.render = function (e, t, n) {
  if (!ho(t)) throw Error(C(200));
  return go(null, e, t, !1, n);
};
tt.unmountComponentAtNode = function (e) {
  if (!ho(e)) throw Error(C(40));
  return e._reactRootContainer
    ? (jn(function () {
        go(null, null, e, !1, function () {
          ((e._reactRootContainer = null), (e[It] = null));
        });
      }),
      !0)
    : !1;
};
tt.unstable_batchedUpdates = Ps;
tt.unstable_renderSubtreeIntoContainer = function (e, t, n, r) {
  if (!ho(n)) throw Error(C(200));
  if (e == null || e._reactInternals === void 0) throw Error(C(38));
  return go(e, t, n, !1, r);
};
tt.version = "18.3.1-next-f1338f8080-20240426";
function yd() {
  if (!(
    typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" ||
    typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"
  ))
    try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(yd);
    } catch (e) {
      console.error(e);
    }
}
(yd(), (yu.exports = tt));
var m0 = yu.exports,
  qa = m0;
((Xo.createRoot = qa.createRoot), (Xo.hydrateRoot = qa.hydrateRoot));
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const h0 = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(),
  vd = (...e) =>
    e
      .filter((t, n, r) => !!t && t.trim() !== "" && r.indexOf(t) === n)
      .join(" ")
      .trim();
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var g0 = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const y0 = Gt.forwardRef(
  (
    {
      color: e = "currentColor",
      size: t = 24,
      strokeWidth: n = 2,
      absoluteStrokeWidth: r,
      className: l = "",
      children: o,
      iconNode: i,
      ...u
    },
    s,
  ) =>
    Gt.createElement(
      "svg",
      {
        ref: s,
        ...g0,
        width: t,
        height: t,
        stroke: e,
        strokeWidth: r ? (Number(n) * 24) / Number(t) : n,
        className: vd("lucide", l),
        ...u,
      },
      [
        ...i.map(([d, m]) => Gt.createElement(d, m)),
        ...(Array.isArray(o) ? o : [o]),
      ],
    ),
);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const W = (e, t) => {
  const n = Gt.forwardRef(({ className: r, ...l }, o) =>
    Gt.createElement(y0, {
      ref: o,
      iconNode: t,
      className: vd(`lucide-${h0(e)}`, r),
      ...l,
    }),
  );
  return ((n.displayName = `${e}`), n);
};
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const v0 = W("Activity", [
  [
    "path",
    {
      d: "M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",
      key: "169zse",
    },
  ],
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const xd = W("AppWindow", [
  [
    "rect",
    { x: "2", y: "4", width: "20", height: "16", rx: "2", key: "izxlao" },
  ],
  ["path", { d: "M10 4v4", key: "pp8u80" }],
  ["path", { d: "M2 8h20", key: "d11cs7" }],
  ["path", { d: "M6 4v4", key: "1svtjw" }],
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const wd = W("Camera", [
  [
    "path",
    {
      d: "M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z",
      key: "1tc9qg",
    },
  ],
  ["circle", { cx: "12", cy: "13", r: "3", key: "1vg3eu" }],
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const kd = W("Check", [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const x0 = W("ChevronDown", [
  ["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }],
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const w0 = W("CircleCheck", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }],
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const k0 = W("CircleDot", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["circle", { cx: "12", cy: "12", r: "1", key: "41hilf" }],
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Sd = W("Crosshair", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["line", { x1: "22", x2: "18", y1: "12", y2: "12", key: "l9bcsi" }],
  ["line", { x1: "6", x2: "2", y1: "12", y2: "12", key: "13hhkx" }],
  ["line", { x1: "12", x2: "12", y1: "6", y2: "2", key: "10w3f3" }],
  ["line", { x1: "12", x2: "12", y1: "22", y2: "18", key: "15g9kq" }],
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const S0 = W("Download", [
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }],
  ["polyline", { points: "7 10 12 15 17 10", key: "2ggqvy" }],
  ["line", { x1: "12", x2: "12", y1: "15", y2: "3", key: "1vk2je" }],
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Nd = W("Gauge", [
  ["path", { d: "m12 14 4-4", key: "9kzdfg" }],
  ["path", { d: "M3.34 19a10 10 0 1 1 17.32 0", key: "19p75a" }],
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const N0 = W("LoaderCircle", [
  ["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }],
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const j0 = W("Maximize2", [
  ["polyline", { points: "15 3 21 3 21 9", key: "mznyad" }],
  ["polyline", { points: "9 21 3 21 3 15", key: "1avn1i" }],
  ["line", { x1: "21", x2: "14", y1: "3", y2: "10", key: "ota7mn" }],
  ["line", { x1: "3", x2: "10", y1: "21", y2: "14", key: "1atl0r" }],
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const C0 = W("MicOff", [
  ["line", { x1: "2", x2: "22", y1: "2", y2: "22", key: "a6p6uj" }],
  ["path", { d: "M18.89 13.23A7.12 7.12 0 0 0 19 12v-2", key: "80xlxr" }],
  ["path", { d: "M5 10v2a7 7 0 0 0 12 5", key: "p2k8kg" }],
  ["path", { d: "M15 9.34V5a3 3 0 0 0-5.68-1.33", key: "1gzdoj" }],
  ["path", { d: "M9 9v3a3 3 0 0 0 5.12 2.12", key: "r2i35w" }],
  ["line", { x1: "12", x2: "12", y1: "19", y2: "22", key: "x3vr5v" }],
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const jd = W("Mic", [
  [
    "path",
    {
      d: "M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z",
      key: "131961",
    },
  ],
  ["path", { d: "M19 10v2a7 7 0 0 1-14 0v-2", key: "1vc78b" }],
  ["line", { x1: "12", x2: "12", y1: "19", y2: "22", key: "x3vr5v" }],
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Cd = W("Monitor", [
  [
    "rect",
    { width: "20", height: "14", x: "2", y: "3", rx: "2", key: "48i651" },
  ],
  ["line", { x1: "8", x2: "16", y1: "21", y2: "21", key: "1svkeh" }],
  ["line", { x1: "12", x2: "12", y1: "17", y2: "21", key: "vw1qmm" }],
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const M0 = W("MousePointerClick", [
  ["path", { d: "M14 4.1 12 6", key: "ita8i4" }],
  ["path", { d: "m5.1 8-2.9-.8", key: "1go3kf" }],
  ["path", { d: "m6 12-1.9 2", key: "mnht97" }],
  ["path", { d: "M7.2 2.2 8 5.1", key: "1cfko1" }],
  [
    "path",
    {
      d: "M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z",
      key: "s0h3yz",
    },
  ],
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const E0 = W("MousePointer", [
  ["path", { d: "M12.586 12.586 19 19", key: "ea5xo7" }],
  [
    "path",
    {
      d: "M3.688 3.037a.497.497 0 0 0-.651.651l6.5 15.999a.501.501 0 0 0 .947-.062l1.569-6.083a2 2 0 0 1 1.448-1.479l6.124-1.579a.5.5 0 0 0 .063-.947z",
      key: "277e5u",
    },
  ],
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const P0 = W("Move", [
  ["path", { d: "M12 2v20", key: "t6zp3m" }],
  ["path", { d: "m15 19-3 3-3-3", key: "11eu04" }],
  ["path", { d: "m19 9 3 3-3 3", key: "1mg7y2" }],
  ["path", { d: "M2 12h20", key: "9i4pu4" }],
  ["path", { d: "m5 9-3 3 3 3", key: "j64kie" }],
  ["path", { d: "m9 5 3-3 3 3", key: "l8vdw6" }],
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const z0 = W("Palette", [
  [
    "circle",
    { cx: "13.5", cy: "6.5", r: ".5", fill: "currentColor", key: "1okk4w" },
  ],
  [
    "circle",
    { cx: "17.5", cy: "10.5", r: ".5", fill: "currentColor", key: "f64h9f" },
  ],
  [
    "circle",
    { cx: "8.5", cy: "7.5", r: ".5", fill: "currentColor", key: "fotxhn" },
  ],
  [
    "circle",
    { cx: "6.5", cy: "12.5", r: ".5", fill: "currentColor", key: "qy21gx" },
  ],
  [
    "path",
    {
      d: "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z",
      key: "12rzf8",
    },
  ],
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const T0 = W("Pause", [
  [
    "rect",
    { x: "14", y: "4", width: "4", height: "16", rx: "1", key: "zuxfzm" },
  ],
  [
    "rect",
    { x: "6", y: "4", width: "4", height: "16", rx: "1", key: "1okwgv" },
  ],
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const b0 = W("Play", [
  ["polygon", { points: "6 3 20 12 6 21 6 3", key: "1oa8hb" }],
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const _0 = W("Plus", [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "M12 5v14", key: "s699le" }],
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const R0 = W("RefreshCw", [
  [
    "path",
    { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8", key: "v9h5vc" },
  ],
  ["path", { d: "M21 3v5h-5", key: "1q7to0" }],
  [
    "path",
    { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16", key: "3uifl3" },
  ],
  ["path", { d: "M8 16H3v5", key: "1cv678" }],
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const L0 = W("RotateCcw", [
  [
    "path",
    { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" },
  ],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }],
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const I0 = W("Scan", [
  ["path", { d: "M3 7V5a2 2 0 0 1 2-2h2", key: "aa7l1z" }],
  ["path", { d: "M17 3h2a2 2 0 0 1 2 2v2", key: "4qcy5o" }],
  ["path", { d: "M21 17v2a2 2 0 0 1-2 2h-2", key: "6vwrx8" }],
  ["path", { d: "M7 21H5a2 2 0 0 1-2-2v-2", key: "ioqczr" }],
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const eu = W("Scissors", [
  ["circle", { cx: "6", cy: "6", r: "3", key: "1lh9wr" }],
  ["path", { d: "M8.12 8.12 12 12", key: "1alkpv" }],
  ["path", { d: "M20 4 8.12 15.88", key: "xgtan2" }],
  ["circle", { cx: "6", cy: "18", r: "3", key: "fqmcym" }],
  ["path", { d: "M14.8 14.8 20 20", key: "ptml3r" }],
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const F0 = W("Settings", [
  [
    "path",
    {
      d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",
      key: "1qme2f",
    },
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }],
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const D0 = W("ShieldAlert", [
  [
    "path",
    {
      d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      key: "oel41y",
    },
  ],
  ["path", { d: "M12 8v4", key: "1got3b" }],
  ["path", { d: "M12 16h.01", key: "1drbdi" }],
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const O0 = W("Smartphone", [
  [
    "rect",
    {
      width: "14",
      height: "20",
      x: "5",
      y: "2",
      rx: "2",
      ry: "2",
      key: "1yt0o3",
    },
  ],
  ["path", { d: "M12 18h.01", key: "mhygvu" }],
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Fs = W("Sparkles", [
  [
    "path",
    {
      d: "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",
      key: "4pj2yx",
    },
  ],
  ["path", { d: "M20 3v4", key: "1olli1" }],
  ["path", { d: "M22 5h-4", key: "1gvqau" }],
  ["path", { d: "M4 17v2", key: "vumght" }],
  ["path", { d: "M5 18H3", key: "zchphs" }],
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Md = W("Square", [
  [
    "rect",
    { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" },
  ],
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const tu = W("Trash2", [
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6", key: "4alrt4" }],
  ["path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2", key: "v07s0e" }],
  ["line", { x1: "10", x2: "10", y1: "11", y2: "17", key: "1uufr5" }],
  ["line", { x1: "14", x2: "14", y1: "11", y2: "17", key: "xtxkd" }],
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const A0 = W("Undo2", [
  ["path", { d: "M9 14 4 9l5-5", key: "102s5s" }],
  [
    "path",
    {
      d: "M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11",
      key: "f3b9sd",
    },
  ],
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const $0 = W("Upload", [
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }],
  ["polyline", { points: "17 8 12 3 7 8", key: "t8dd8p" }],
  ["line", { x1: "12", x2: "12", y1: "3", y2: "15", key: "widbto" }],
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const U0 = W("VideoOff", [
  [
    "path",
    {
      d: "M10.66 6H14a2 2 0 0 1 2 2v2.5l5.248-3.062A.5.5 0 0 1 22 7.87v8.196",
      key: "w8jjjt",
    },
  ],
  [
    "path",
    {
      d: "M16 16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2",
      key: "1xawa7",
    },
  ],
  ["path", { d: "m2 2 20 20", key: "1ooewy" }],
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ed = W("Video", [
  [
    "path",
    {
      d: "m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5",
      key: "ftymec",
    },
  ],
  [
    "rect",
    { x: "2", y: "6", width: "14", height: "12", rx: "2", key: "158x01" },
  ],
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const V0 = W("Volume2", [
  [
    "path",
    {
      d: "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",
      key: "uqj9uw",
    },
  ],
  ["path", { d: "M16 9a5 5 0 0 1 0 6", key: "1q6k2b" }],
  ["path", { d: "M19.364 18.364a9 9 0 0 0 0-12.728", key: "ijwkga" }],
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const H0 = W("VolumeX", [
  [
    "path",
    {
      d: "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",
      key: "uqj9uw",
    },
  ],
  ["line", { x1: "22", x2: "16", y1: "9", y2: "15", key: "1ewh16" }],
  ["line", { x1: "16", x2: "22", y1: "9", y2: "15", key: "5ykzw1" }],
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ds = W("X", [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }],
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const nu = W("ZoomIn", [
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
  ["line", { x1: "21", x2: "16.65", y1: "21", y2: "16.65", key: "13gj7c" }],
  ["line", { x1: "11", x2: "11", y1: "8", y2: "14", key: "1vmskp" }],
  ["line", { x1: "8", x2: "14", y1: "11", y2: "11", key: "durymu" }],
]);
function ru() {
  const t = [
      { t: 0, x: 0.5, y: 0.52 },
      { t: 900, x: 0.16, y: 0.26 },
      { t: 1250, x: 0.16, y: 0.26, click: !0 },
      { t: 2400, x: 0.16, y: 0.36, click: !0 },
      { t: 3800, x: 0.56, y: 0.42 },
      { t: 4300, x: 0.62, y: 0.46, click: !0 },
      { t: 5600, x: 0.68, y: 0.48 },
      { t: 6800, x: 0.84, y: 0.18 },
      { t: 7200, x: 0.84, y: 0.18, click: !0 },
      { t: 8400, x: 0.52, y: 0.56, click: !0 },
      { t: 10200, x: 0.48, y: 0.72 },
      { t: 12e3, x: 0.5, y: 0.5 },
    ],
    n = [],
    r = 16;
  for (let o = 0; o <= 12 * 1e3; o += r) {
    let i = 0;
    for (; i < t.length - 2 && t[i + 1].t < o;) i++;
    const u = t[i],
      s = t[i + 1],
      d = Math.max(1, s.t - u.t),
      m = Math.max(0, Math.min(1, (o - u.t) / d)),
      g = m * m * (3 - 2 * m),
      h = u.x + (s.x - u.x) * g,
      v = u.y + (s.y - u.y) * g;
    n.push({
      t: o,
      x: Number(h.toFixed(4)),
      y: Number(v.toFixed(4)),
      type: "move",
      button: 0,
    });
  }
  for (const o of t)
    o.click &&
      (n.push({ t: o.t, x: o.x, y: o.y, type: "down", button: 0 }),
      n.push({ t: o.t + 120, x: o.x, y: o.y, type: "up", button: 0 }));
  return (
    n.sort((o, i) => o.t - i.t),
    {
      duration: 12,
      mouseEvents: n,
      zoomSegments: [
        {
          id: "demo-zoom-1",
          startTime: 1,
          endTime: 3.3,
          scale: 2.1,
          targetX: 0.18,
          targetY: 0.31,
          mode: "follow-cursor",
          label: "侧边栏导航特写",
        },
        {
          id: "demo-zoom-2",
          startTime: 4.1,
          endTime: 6.1,
          scale: 1.95,
          targetX: 0.62,
          targetY: 0.46,
          mode: "follow-cursor",
          label: "核心增长图表聚焦",
        },
        {
          id: "demo-zoom-3",
          startTime: 6.9,
          endTime: 9.5,
          scale: 2.25,
          targetX: 0.82,
          targetY: 0.22,
          mode: "follow-cursor",
          label: "右上角一键发布交互",
        },
      ],
    }
  );
}
function W0(e, t, n, r) {
  (e.save(), (e.fillStyle = "#0f1117"), e.fillRect(0, 0, t, n));
  const l = t * 0.21;
  ((e.fillStyle = "#151821"),
    e.fillRect(0, 0, l, n),
    (e.strokeStyle = "#252a38"),
    (e.lineWidth = 1),
    e.beginPath(),
    e.moveTo(l, 0),
    e.lineTo(l, n),
    e.stroke(),
    (e.fillStyle = "#6366f1"),
    e.beginPath(),
    e.roundRect(t * 0.025, n * 0.06, t * 0.03, t * 0.03, 8),
    e.fill(),
    (e.fillStyle = "#f8fafc"),
    (e.font = `600 ${Math.round(t * 0.014)}px -apple-system, BlinkMacSystemFont, sans-serif`),
    e.fillText("Acme Cloud Studio", t * 0.065, n * 0.088));
  const o = [
      { label: "Overview", y: 0.18 },
      { label: "Realtime Analytics", y: 0.26 },
      { label: "Growth Campaigns", y: 0.36 },
      { label: "API Keys & Webhooks", y: 0.46 },
      { label: "Team Settings", y: 0.56 },
    ],
    i = r < 2.2 ? 1 : r < 3.8 ? 2 : 1;
  (o.forEach((c, p) => {
    const y = n * c.y,
      S = p === i;
    (S &&
      ((e.fillStyle = "rgba(99, 102, 241, 0.18)"),
      e.beginPath(),
      e.roundRect(t * 0.018, y - n * 0.032, l - t * 0.036, n * 0.058, 10),
      e.fill(),
      (e.strokeStyle = "rgba(99, 102, 241, 0.5)"),
      e.stroke()),
      (e.fillStyle = S ? "#a5b4fc" : "#94a3b8"),
      (e.font = `${S ? "600" : "500"} ${Math.round(t * 0.0115)}px -apple-system, BlinkMacSystemFont, sans-serif`),
      e.fillText(c.label, t * 0.035, y + n * 0.004));
  }),
    (e.fillStyle = "#f8fafc"),
    (e.font = `700 ${Math.round(t * 0.02)}px -apple-system, BlinkMacSystemFont, sans-serif`),
    e.fillText(
      i === 2 ? "Growth Campaigns · Q4 Launch" : "Realtime Product Telemetry",
      l + t * 0.04,
      n * 0.15,
    ));
  const u = t * 0.76,
    s = n * 0.135,
    d = t * 0.16,
    m = n * 0.075,
    g = r >= 7.15 && r <= 9.8;
  ((e.fillStyle = g ? "#10b981" : "#6366f1"),
    e.beginPath(),
    e.roundRect(u, s, d, m, 10),
    e.fill(),
    (e.fillStyle = "#ffffff"),
    (e.font = `600 ${Math.round(t * 0.012)}px -apple-system, BlinkMacSystemFont, sans-serif`),
    e.fillText(
      g ? "✓ Production Live" : "⚡ Deploy v2.4",
      u + t * 0.025,
      s + m * 0.62,
    ),
    [
      { title: "ACTIVE USERS", val: "128,490", delta: "+24.8%", x: 0.25 },
      { title: "CONVERSION RATE", val: "6.84%", delta: "+1.42%", x: 0.49 },
      { title: "LATENCY (P95)", val: "18.2 ms", delta: "-6.4 ms", x: 0.73 },
    ].forEach((c, p) => {
      const y = t * c.x,
        S = n * 0.26,
        _ = t * 0.21,
        T = n * 0.21,
        j = p === 1 && r >= 4.2 && r <= 6.2;
      ((e.fillStyle = j ? "#1e2436" : "#161923"),
        e.beginPath(),
        e.roundRect(y, S, _, T, 14),
        e.fill(),
        (e.strokeStyle = j ? "#6366f1" : "#262b3c"),
        (e.lineWidth = j ? 2 : 1),
        e.stroke(),
        (e.fillStyle = "#94a3b8"),
        (e.font = `600 ${Math.round(t * 0.0095)}px -apple-system, BlinkMacSystemFont, sans-serif`),
        e.fillText(c.title, y + t * 0.018, S + n * 0.055),
        (e.fillStyle = "#f8fafc"),
        (e.font = `700 ${Math.round(t * 0.022)}px -apple-system, BlinkMacSystemFont, sans-serif`),
        e.fillText(c.val, y + t * 0.018, S + n * 0.13),
        (e.fillStyle = "#34d399"),
        (e.font = `600 ${Math.round(t * 0.011)}px -apple-system, BlinkMacSystemFont, sans-serif`),
        e.fillText(c.delta, y + t * 0.018, S + n * 0.175));
    }));
  const v = t * 0.25,
    w = n * 0.52,
    x = t * 0.69,
    F = n * 0.39;
  ((e.fillStyle = "#161923"),
    e.beginPath(),
    e.roundRect(v, w, x, F, 16),
    e.fill(),
    (e.strokeStyle = "#262b3c"),
    (e.lineWidth = 1),
    e.stroke(),
    e.save(),
    e.beginPath());
  const f = 24;
  for (let c = 0; c <= f; c++) {
    const p = v + t * 0.03 + (c / f) * (x - t * 0.06),
      y =
        Math.sin(c * 0.45 + r * 1.8) * (F * 0.16) +
        Math.cos(c * 0.22 - r * 0.9) * (F * 0.1),
      S = w + F * 0.56 - (c / f) * (F * 0.18) + y;
    c === 0 ? e.moveTo(p, S) : e.lineTo(p, S);
  }
  if (
    ((e.strokeStyle = "#818cf8"),
    (e.lineWidth = 3.5),
    e.stroke(),
    e.restore(),
    r >= 7.25 && r <= 9.35)
  ) {
    ((e.fillStyle = "rgba(9, 11, 17, 0.68)"), e.fillRect(0, 0, t, n));
    const c = t * 0.36,
      p = n * 0.32,
      y = (t - c) / 2,
      S = (n - p) / 2;
    ((e.fillStyle = "#1b2030"),
      e.beginPath(),
      e.roundRect(y, S, c, p, 18),
      e.fill(),
      (e.strokeStyle = "#6366f1"),
      (e.lineWidth = 2),
      e.stroke(),
      (e.fillStyle = "#f8fafc"),
      (e.font = `700 ${Math.round(t * 0.016)}px -apple-system, BlinkMacSystemFont, sans-serif`),
      e.fillText("Confirm Production Rollout", y + t * 0.03, S + n * 0.09),
      (e.fillStyle = "#94a3b8"),
      (e.font = `400 ${Math.round(t * 0.011)}px -apple-system, BlinkMacSystemFont, sans-serif`),
      e.fillText(
        "All 14 edge regions passed health checks.",
        y + t * 0.03,
        S + n * 0.15,
      ));
    const _ = r >= 8.4;
    ((e.fillStyle = _ ? "#10b981" : "#4f46e5"),
      e.beginPath(),
      e.roundRect(y + t * 0.03, S + n * 0.2, c - t * 0.06, n * 0.075, 10),
      e.fill(),
      (e.fillStyle = "#ffffff"),
      (e.font = `600 ${Math.round(t * 0.012)}px -apple-system, BlinkMacSystemFont, sans-serif`),
      e.fillText(
        _ ? "✓ Deployed Successfully!" : "Confirm & Ship Now",
        y + t * 0.11,
        S + n * 0.248,
      ));
  }
  e.restore();
}
const Ai = [
    {
      id: "sequoia-twilight",
      name: "Sequoia 暮光紫",
      stops: ["#312e81", "#6d28d9", "#ec4899"],
      angle: 135,
    },
    {
      id: "sonoma-horizon",
      name: "Sonoma 极光蓝",
      stops: ["#0f172a", "#1d4ed8", "#06b6d4"],
      angle: 125,
    },
    {
      id: "ventura-sunset",
      name: "Ventura 琥珀橙",
      stops: ["#7c2d12", "#ea580c", "#facc15"],
      angle: 140,
    },
    {
      id: "emerald-glow",
      name: "翡翠森林",
      stops: ["#064e3b", "#059669", "#34d399"],
      angle: 135,
    },
    {
      id: "obsidian-pro",
      name: "黑曜石深空",
      stops: ["#09090b", "#18181b", "#27272a"],
      angle: 145,
    },
    {
      id: "cotton-candy",
      name: "柔和霓虹",
      stops: ["#4f46e5", "#a855f7", "#f43f5e"],
      angle: 120,
    },
    {
      id: "minimal-silver",
      name: "极简银灰",
      stops: ["#334155", "#64748b", "#94a3b8"],
      angle: 135,
    },
    {
      id: "custom-solid",
      name: "自定义纯色",
      stops: ["#1e1b4b", "#1e1b4b", "#1e1b4b"],
      angle: 0,
    },
  ],
  $i = {
    mellow: { stiffness: 90, damping: 19, label: "柔和 (Mellow)" },
    smooth: { stiffness: 150, damping: 24, label: "丝滑 (Smooth)" },
    snappy: { stiffness: 240, damping: 29, label: "灵动 (Snappy)" },
    instant: { stiffness: 450, damping: 42, label: "快速 (Rapid)" },
  };
function _n(e, t, n, r, l, o) {
  const i = Math.min(o, 0.05),
    u = -r * (e - n),
    s = -l * t,
    d = u + s,
    m = t + d * i;
  return { value: e + m * i, velocity: m };
}
function lu(e, t) {
  const n = e.filter((i) => i.type === "down");
  if (n.length === 0) return [];
  const r = [],
    l = 0.25,
    o = 1.65;
  for (let i = 0; i < n.length; i++) {
    const u = n[i],
      s = u.t / 1e3,
      d = Math.max(0, Number((s - l).toFixed(2))),
      m = Math.min(Math.max(t, s + 1), Number((s + o).toFixed(2))),
      g = r[r.length - 1];
    g && d <= g.endTime + 0.35
      ? ((g.endTime = Math.max(g.endTime, m)),
        Math.hypot(u.x - g.targetX, u.y - g.targetY) > 0.14
          ? (g.mode = "follow-cursor")
          : ((g.targetX = Number(((g.targetX + u.x) / 2).toFixed(3))),
            (g.targetY = Number(((g.targetY + u.y) / 2).toFixed(3)))))
      : r.push({
          id: `zoom-${Date.now()}-${i}`,
          startTime: d,
          endTime: Math.max(d + 0.8, m),
          scale: 2,
          targetX: Number(u.x.toFixed(3)),
          targetY: Number(u.y.toFixed(3)),
          mode: "follow-cursor",
          label: `自动缩放 #${r.length + 1}`,
        });
  }
  return r;
}
function Ui(e, t) {
  if (!e || e.length === 0)
    return {
      x: 0.5,
      y: 0.5,
      isPressed: !1,
      recentClickAgeMs: null,
      clickX: 0.5,
      clickY: 0.5,
    };
  const n = t * 1e3;
  let r = 0,
    l = e.length - 1;
  for (; r < l;) {
    const v = (r + l + 1) >> 1;
    e[v].t <= n ? (r = v) : (l = v - 1);
  }
  const o = e[r],
    i = e[Math.min(e.length - 1, r + 1)];
  let u = o.x,
    s = o.y;
  if (i && i.t > o.t && n >= o.t && n <= i.t) {
    const v = (n - o.t) / (i.t - o.t);
    ((u = o.x + (i.x - o.x) * v), (s = o.y + (i.y - o.y) * v));
  }
  let d = null,
    m = u,
    g = s,
    h = !1;
  for (let v = r; v >= 0; v--) {
    const w = n - e[v].t;
    if (w > 600) break;
    if (e[v].type === "down" && w >= 0) {
      ((d = w), (m = e[v].x), (g = e[v].y), w < 160 && (h = !0));
      break;
    }
  }
  return {
    x: u,
    y: s,
    isPressed: h,
    recentClickAgeMs: d,
    clickX: m,
    clickY: g,
  };
}
function ou() {
  return {
    scale: 1,
    scaleVel: 0,
    focusX: 0.5,
    focusXVel: 0,
    focusY: 0.5,
    focusYVel: 0,
    cursorX: 0.5,
    cursorXVel: 0,
    cursorY: 0.5,
    cursorYVel: 0,
    webcamScale: 1,
    webcamScaleVel: 0,
  };
}
function B0(e, t = 1920, n = 1080) {
  switch (e) {
    case "16:9":
      return { width: 1920, height: 1080 };
    case "9:16":
      return { width: 1080, height: 1920 };
    case "1:1":
      return { width: 1440, height: 1440 };
    case "4:3":
      return { width: 1600, height: 1200 };
    case "original":
    default: {
      const r = t / Math.max(1, n),
        l = 1920,
        o = Math.round(l / r);
      return { width: l, height: o };
    }
  }
}
function X0(e) {
  const {
    ctx: t,
    canvasW: n,
    canvasH: r,
    videoEl: l,
    webcamEl: o,
    isDemoMode: i,
    timeSec: u,
    config: s,
    springState: d,
    mouseEvents: m,
    areaCrop: g,
  } = e;
  (t.save(), t.clearRect(0, 0, n, r));
  const h = Ai.find((ne) => ne.id === s.wallpaperId) || Ai[0];
  if (s.wallpaperId === "custom-solid")
    ((t.fillStyle = s.customColor || "#1e1b4b"), t.fillRect(0, 0, n, r));
  else {
    const ne = (h.angle * Math.PI) / 180,
      Ce = n / 2,
      we = r / 2,
      le = Math.hypot(n, r) / 2,
      ye = t.createLinearGradient(
        Ce - Math.cos(ne) * le,
        we - Math.sin(ne) * le,
        Ce + Math.cos(ne) * le,
        we + Math.sin(ne) * le,
      );
    (ye.addColorStop(0, h.stops[0]),
      ye.addColorStop(0.52, h.stops[1]),
      ye.addColorStop(1, h.stops[2]),
      (t.fillStyle = ye),
      t.fillRect(0, 0, n, r));
    const q = t.createRadialGradient(
      n * 0.25,
      r * 0.2,
      10,
      n * 0.5,
      r * 0.5,
      n * 0.75,
    );
    (q.addColorStop(0, "rgba(255, 255, 255, 0.10)"),
      q.addColorStop(1, "rgba(0, 0, 0, 0.18)"),
      (t.fillStyle = q),
      t.fillRect(0, 0, n, r));
  }
  const v = !i && l && l.videoWidth > 0 ? l.videoWidth : 1920,
    w = !i && l && l.videoHeight > 0 ? l.videoHeight : 1080,
    x = g ? Math.max(64, v * g.w) : v,
    F = g ? Math.max(64, w * g.h) : w,
    f = Math.min(n, r) / 1080,
    c = s.padding * f,
    p = Math.max(100, n - c * 2),
    y = Math.max(100, r - c * 2),
    S = s.macosHeader ? Math.round(36 * f) : 0,
    _ = x / Math.max(1, F),
    T = Math.max(60, y - S),
    j = p / T;
  let U = p,
    b = T;
  _ > j ? (b = p / _) : (U = T * _);
  const A = U,
    J = b + S,
    X = (n - A) / 2,
    ce = (r - J) / 2,
    He = s.borderRadius * f,
    P = Math.max(1, d.scale),
    B = Math.max(0, Math.min(1, d.focusX)),
    E = Math.max(0, Math.min(1, d.focusY));
  t.save();
  const D = X + B * A,
    I = ce + E * J,
    k = n / 2,
    L = r / 2,
    te = Math.min(1, Math.max(0, (P - 1) / 0.85)),
    re = k + (k - D) * (P - 1) * te,
    We = L + (L - I) * (P - 1) * te;
  if (
    (t.translate(re, We),
    t.scale(P, P),
    t.translate(-k, -L),
    s.motionBlur &&
      Math.abs(d.scaleVel) > 0.35 &&
      (t.shadowColor = "rgba(99, 102, 241, 0.18)"),
    s.shadowIntensity > 0 && s.padding > 0)
  ) {
    t.save();
    const ne = (s.shadowIntensity / 100) * 0.68;
    ((t.shadowColor = `rgba(0, 0, 0, ${ne.toFixed(2)})`),
      (t.shadowBlur = (s.shadowIntensity * 0.9 + 18) * f),
      (t.shadowOffsetX = 0),
      (t.shadowOffsetY = (s.shadowIntensity * 0.28 + 10) * f),
      (t.fillStyle = "#090a0f"),
      t.beginPath(),
      t.roundRect(X, ce, A, J, He),
      t.fill(),
      t.restore());
  }
  if (
    (t.save(),
    t.beginPath(),
    t.roundRect(X, ce, A, J, He),
    t.clip(),
    s.macosHeader)
  ) {
    ((t.fillStyle = "#181a20"), t.fillRect(X, ce, A, S));
    const ne = ce + S / 2,
      Ce = Math.max(4, 6.2 * f);
    (["#ff5f56", "#ffbd2e", "#27c93f"].forEach((le, ye) => {
      ((t.fillStyle = le),
        t.beginPath(),
        t.arc(X + (20 + ye * 20) * f, ne, Ce, 0, Math.PI * 2),
        t.fill());
    }),
      (t.strokeStyle = "rgba(255, 255, 255, 0.07)"),
      (t.lineWidth = 1),
      t.beginPath(),
      t.moveTo(X, ce + S),
      t.lineTo(X + A, ce + S),
      t.stroke());
  }
  const xe = ce + S;
  if (!i && l && l.readyState >= 2)
    if (g) {
      const ne = g.x * v,
        Ce = g.y * w,
        we = g.w * v,
        le = g.h * w;
      t.drawImage(l, ne, Ce, we, le, X, xe, U, b);
    } else t.drawImage(l, X, xe, U, b);
  else (t.save(), t.translate(X, xe), W0(t, U, b, u), t.restore());
  const Fe = Ui(m, u),
    yo = X + (s.smoothCursorMove ? d.cursorX : Fe.x) * U,
    Jr = xe + (s.smoothCursorMove ? d.cursorY : Fe.y) * b;
  if (s.showClickRipple && Fe.recentClickAgeMs !== null) {
    const ne = Math.min(1, Fe.recentClickAgeMs / 520),
      Ce = (10 + ne * 44) * f,
      we = (1 - ne) * 0.78,
      le = X + Fe.clickX * U,
      ye = xe + Fe.clickY * b;
    (t.save(),
      (t.strokeStyle = `rgba(99, 102, 241, ${we.toFixed(3)})`),
      (t.lineWidth = 3.2 * f),
      t.beginPath(),
      t.arc(le, ye, Ce, 0, Math.PI * 2),
      t.stroke(),
      (t.fillStyle = `rgba(129, 140, 248, ${(we * 0.28).toFixed(3)})`),
      t.beginPath(),
      t.arc(le, ye, Ce * 0.55, 0, Math.PI * 2),
      t.fill(),
      t.restore());
  }
  if (s.cursorScale > 0 && m.length > 0) {
    const ne = Fe.isPressed ? 0.84 : 1,
      Ce = s.cursorScale * ne * f * 1.35;
    (t.save(),
      t.translate(yo, Jr),
      t.scale(Ce, Ce),
      (t.shadowColor = "rgba(0, 0, 0, 0.55)"),
      (t.shadowBlur = 8),
      (t.shadowOffsetX = 1),
      (t.shadowOffsetY = 3),
      t.beginPath(),
      t.moveTo(0, 0),
      t.lineTo(0, 19),
      t.lineTo(4.6, 14.8),
      t.lineTo(8.1, 22.5),
      t.lineTo(11.1, 21.1),
      t.lineTo(7.6, 13.5),
      t.lineTo(13.8, 13.5),
      t.closePath(),
      (t.fillStyle = "#111827"),
      t.fill(),
      (t.lineWidth = 1.6),
      (t.strokeStyle = "#ffffff"),
      t.stroke(),
      t.restore());
  }
  if (
    (t.restore(),
    s.insetBorder &&
      s.padding > 0 &&
      (t.save(),
      (t.strokeStyle = "rgba(255, 255, 255, 0.22)"),
      (t.lineWidth = Math.max(1, 1.5 * f)),
      t.beginPath(),
      t.roundRect(X, ce, A, J, He),
      t.stroke(),
      t.restore()),
    t.restore(),
    s.webcamEnabled && o && o.readyState >= 2)
  ) {
    const ne = s.webcamSize * f,
      Ce = s.webcamShrinkOnZoom ? d.webcamScale : 1,
      we = ne * (s.webcamShape === "rounded" ? 1.28 : 1) * Ce,
      le = ne * Ce,
      ye = Math.max(28 * f, c * 0.55);
    let q = n - we - ye,
      Ge = r - le - ye;
    if (
      (s.webcamCorner === "bottom-left"
        ? ((q = ye), (Ge = r - le - ye))
        : s.webcamCorner === "top-right"
          ? ((q = n - we - ye), (Ge = ye))
          : s.webcamCorner === "top-left" && ((q = ye), (Ge = ye)),
      t.save(),
      (t.shadowColor = "rgba(0, 0, 0, 0.55)"),
      (t.shadowBlur = 24 * f),
      (t.shadowOffsetY = 8 * f),
      t.beginPath(),
      s.webcamShape === "circle")
    )
      t.arc(q + we / 2, Ge + le / 2, le / 2, 0, Math.PI * 2);
    else {
      const zn = s.webcamShape === "rounded" ? 24 * f : 10 * f;
      t.roundRect(q, Ge, we, le, zn);
    }
    ((t.fillStyle = "#000"), t.fill(), t.clip());
    const G = o.videoWidth || 640,
      rt = o.videoHeight || 480,
      At = G / rt,
      $t = we / le;
    let En = 0,
      Pn = 0,
      dn = G,
      Pt = rt;
    if (
      (At > $t
        ? ((dn = rt * $t), (En = (G - dn) / 2))
        : ((Pt = G / $t), (Pn = (rt - Pt) / 2)),
      t.translate(q + we, Ge),
      t.scale(-1, 1),
      t.drawImage(o, En, Pn, dn, Pt, 0, 0, we, le),
      t.restore(),
      t.save(),
      (t.strokeStyle = "rgba(255, 255, 255, 0.35)"),
      (t.lineWidth = 2.2 * f),
      t.beginPath(),
      s.webcamShape === "circle")
    )
      t.arc(q + we / 2, Ge + le / 2, le / 2, 0, Math.PI * 2);
    else {
      const zn = s.webcamShape === "rounded" ? 24 * f : 10 * f;
      t.roundRect(q, Ge, we, le, zn);
    }
    (t.stroke(), t.restore());
  }
  return (
    t.restore(),
    {
      canvasW: n,
      canvasH: r,
      frameX: X,
      frameY: ce + S,
      frameW: U,
      frameH: b,
      scale: P,
      focusX: B,
      focusY: E,
    }
  );
}
const Y0 = ({
    duration: e,
    currentTime: t,
    trimStart: n,
    trimEnd: r,
    isPlaying: l,
    clipSegments: o,
    selectedClipId: i,
    zoomSegments: u,
    selectedSegmentId: s,
    mouseEvents: d,
    onSeek: m,
    onTogglePlay: g,
    onTrimChange: h,
    onSelectClip: v,
    onSplitClipAtPlayhead: w,
    onUpdateClip: x,
    onDeleteOrRestoreClip: F,
    onResetClips: f,
    onSelectSegment: c,
    onAddSegment: p,
    onUpdateSegment: y,
    onDeleteSegment: S,
    onRegenerateAutoZoom: _,
  }) => {
    const T = N.useRef(null),
      [j, U] = N.useState(null),
      b = Math.max(0.5, e),
      A = u.find((P) => P.id === s) || null,
      J = o.find((P) => P.id === i) || null,
      X = N.useMemo(() => d.filter((P) => P.type === "down"), [d]),
      ce = N.useCallback(
        (P) => {
          if (!T.current) return 0;
          const B = T.current.getBoundingClientRect(),
            E = Math.max(0, Math.min(1, (P - B.left) / Math.max(1, B.width)));
          return Number((E * b).toFixed(2));
        },
        [b],
      );
    N.useEffect(() => {
      if (!j) return;
      const P = (E) => {
          if (!T.current) return;
          const D = T.current.getBoundingClientRect(),
            I = ((E.clientX - j.initialX) / Math.max(1, D.width)) * b;
          if (j.type === "playhead") m(ce(E.clientX));
          else if (j.type === "trim-left") {
            const k = Math.max(0, Math.min(r - 0.5, j.initialStart + I));
            h(Number(k.toFixed(2)), r);
          } else if (j.type === "trim-right") {
            const k = Math.min(b, Math.max(n + 0.5, j.initialEnd + I));
            h(n, Number(k.toFixed(2)));
          } else if (j.segId) {
            const k = j.initialEnd - j.initialStart;
            if (j.type === "seg-move") {
              const L = Math.max(0, Math.min(b - k, j.initialStart + I));
              y(j.segId, {
                startTime: Number(L.toFixed(2)),
                endTime: Number((L + k).toFixed(2)),
              });
            } else if (j.type === "seg-left") {
              const L = Math.max(
                0,
                Math.min(j.initialEnd - 0.4, j.initialStart + I),
              );
              y(j.segId, { startTime: Number(L.toFixed(2)) });
            } else if (j.type === "seg-right") {
              const L = Math.min(
                b,
                Math.max(j.initialStart + 0.4, j.initialEnd + I),
              );
              y(j.segId, { endTime: Number(L.toFixed(2)) });
            }
          }
        },
        B = () => U(null);
      return (
        window.addEventListener("mousemove", P),
        window.addEventListener("mouseup", B),
        () => {
          (window.removeEventListener("mousemove", P),
            window.removeEventListener("mouseup", B));
        }
      );
    }, [j, b, n, r, ce, m, h, y]);
    const He = (P) => {
      const B = Math.floor(P / 60),
        E = (P % 60).toFixed(1).padStart(4, "0");
      return `${B}:${E}`;
    };
    return a.jsxs("div", {
      className:
        "h-60 bg-[#12141a] border-t border-[#232733] flex flex-col px-4 py-2.5 select-none",
      children: [
        a.jsxs("div", {
          className: "flex items-center justify-between mb-2.5 gap-2",
          children: [
            a.jsxs("div", {
              className: "flex items-center gap-2",
              children: [
                a.jsx("button", {
                  onClick: g,
                  className:
                    "flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition shadow",
                  title: l ? "暂停 (Space)" : "播放 (Space)",
                  children: l
                    ? a.jsx(T0, { className: "w-4 h-4" })
                    : a.jsx(b0, { className: "w-4 h-4 ml-0.5" }),
                }),
                a.jsx("button", {
                  onClick: () => m(n),
                  className:
                    "flex items-center justify-center w-8 h-8 rounded-lg bg-[#1c2029] hover:bg-[#252a36] text-zinc-300 transition",
                  title: "回到起点",
                  children: a.jsx(L0, { className: "w-3.5 h-3.5" }),
                }),
                a.jsxs("div", {
                  className:
                    "text-xs font-mono bg-[#181b23] border border-[#262b38] px-2.5 py-1 rounded-md text-zinc-300",
                  children: [
                    a.jsx("span", {
                      className: "text-indigo-400 font-semibold",
                      children: He(t),
                    }),
                    a.jsx("span", {
                      className: "text-zinc-500 mx-1",
                      children: "/",
                    }),
                    a.jsx("span", { children: He(b) }),
                  ],
                }),
                a.jsxs("button", {
                  onClick: w,
                  className:
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-xs font-semibold text-amber-300 transition",
                  title: "在当前播放帧位置一刀切分视频轨道 (快捷键 S)",
                  children: [
                    a.jsx(eu, { className: "w-3.5 h-3.5 text-amber-400" }),
                    "在此帧切分 (Split · S)",
                  ],
                }),
                o.length > 1 &&
                  a.jsxs("button", {
                    onClick: f,
                    className:
                      "flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[#191c24] hover:bg-[#222733] border border-[#2a3040] text-[11px] text-zinc-400 hover:text-zinc-200 transition",
                    title: "合并还原所有切分片段",
                    children: [a.jsx(A0, { className: "w-3 h-3" }), "还原切分"],
                  }),
              ],
            }),
            J
              ? a.jsxs("div", {
                  className:
                    "flex items-center gap-3 bg-[#172026] border border-emerald-500/40 px-3 py-1 rounded-lg text-xs",
                  children: [
                    a.jsxs("span", {
                      className:
                        "text-emerald-300 font-medium flex items-center gap-1",
                      children: [
                        a.jsx(Nd, { className: "w-3.5 h-3.5" }),
                        "片段 (",
                        J.startTime.toFixed(1),
                        "s - ",
                        J.endTime.toFixed(1),
                        "s)",
                      ],
                    }),
                    a.jsx("div", {
                      className:
                        "flex items-center gap-1 bg-[#10161b] p-0.5 rounded border border-emerald-500/25",
                      children: [0.5, 1, 1.5, 2, 3, 4].map((P) =>
                        a.jsxs(
                          "button",
                          {
                            onClick: () => x(J.id, { speed: P }),
                            className: `px-1.5 py-0.5 rounded text-[11px] font-mono transition ${J.speed === P ? "bg-emerald-600 text-white font-semibold" : "text-zinc-400 hover:text-zinc-200"}`,
                            children: [P, "x"],
                          },
                          P,
                        ),
                      ),
                    }),
                    a.jsxs("button", {
                      onClick: () => F(J.id),
                      className: `px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 transition ${J.deleted ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30"}`,
                      title: "删除该切分片段后，播放与导出会自动跳过这段时间",
                      children: [
                        a.jsx(tu, { className: "w-3 h-3" }),
                        J.deleted ? "恢复此片段" : "跳过/删除此片段",
                      ],
                    }),
                  ],
                })
              : A
                ? a.jsxs("div", {
                    className:
                      "flex items-center gap-3 bg-[#191d26] border border-indigo-500/40 px-3 py-1 rounded-lg text-xs",
                    children: [
                      a.jsxs("span", {
                        className:
                          "text-indigo-300 font-medium flex items-center gap-1",
                        children: [
                          a.jsx(nu, { className: "w-3.5 h-3.5" }),
                          "缩放 (",
                          A.startTime.toFixed(1),
                          "s - ",
                          A.endTime.toFixed(1),
                          "s)",
                        ],
                      }),
                      a.jsxs("div", {
                        className: "flex items-center gap-1.5",
                        children: [
                          a.jsx("span", {
                            className: "text-zinc-400",
                            children: "倍率",
                          }),
                          a.jsx("input", {
                            type: "range",
                            min: 1.2,
                            max: 3.2,
                            step: 0.05,
                            value: A.scale,
                            onChange: (P) =>
                              y(A.id, { scale: parseFloat(P.target.value) }),
                            className: "w-20 accent-indigo-500 cursor-pointer",
                          }),
                          a.jsxs("span", {
                            className: "font-mono text-indigo-300 w-9",
                            children: [A.scale.toFixed(1), "x"],
                          }),
                        ],
                      }),
                      a.jsxs("div", {
                        className:
                          "flex items-center gap-1 bg-[#12151c] p-0.5 rounded border border-[#272c3a]",
                        children: [
                          a.jsx("button", {
                            onClick: () => y(A.id, { mode: "follow-cursor" }),
                            className: `px-2 py-0.5 rounded text-[11px] transition ${A.mode === "follow-cursor" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-zinc-200"}`,
                            children: "跟随光标",
                          }),
                          a.jsxs("button", {
                            onClick: () => y(A.id, { mode: "manual" }),
                            className: `px-2 py-0.5 rounded text-[11px] transition flex items-center gap-1 ${A.mode === "manual" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-zinc-200"}`,
                            title: "点击上方预览画面可直接指定固定缩放焦点",
                            children: [
                              a.jsx(Sd, { className: "w-3 h-3" }),
                              "固定焦点",
                            ],
                          }),
                        ],
                      }),
                      a.jsx("button", {
                        onClick: () => S(A.id),
                        className:
                          "text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-500/10 transition",
                        title: "删除此缩放块 (Delete)",
                        children: a.jsx(tu, { className: "w-3.5 h-3.5" }),
                      }),
                    ],
                  })
                : a.jsxs("div", {
                    className: "text-xs text-zinc-400 truncate",
                    children: [
                      "按 ",
                      a.jsx("span", {
                        className: "text-amber-300 font-mono",
                        children: "S",
                      }),
                      " 键在当前帧切分视频并单独调节片段倍速 · 点击绿色片段调倍速 · 点击紫色块调缩放",
                    ],
                  }),
            a.jsxs("div", {
              className: "flex items-center gap-2 shrink-0",
              children: [
                a.jsxs("button", {
                  onClick: p,
                  className:
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1e222d] hover:bg-[#272c3a] border border-[#2e3446] text-xs font-medium text-zinc-200 transition",
                  children: [
                    a.jsx(_0, { className: "w-3.5 h-3.5 text-indigo-400" }),
                    "添加缩放",
                  ],
                }),
                a.jsxs("button", {
                  onClick: _,
                  className:
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-xs font-medium text-indigo-300 transition",
                  title: "根据录制的鼠标点击事件重新自动生成平滑缩放块",
                  children: [
                    a.jsx(Fs, { className: "w-3.5 h-3.5 text-indigo-400" }),
                    "智能缩放",
                  ],
                }),
              ],
            }),
          ],
        }),
        a.jsxs("div", {
          ref: T,
          onMouseDown: (P) => {
            P.target.dataset.stopTrack ||
              (m(ce(P.clientX)),
              U({
                type: "playhead",
                initialX: P.clientX,
                initialStart: 0,
                initialEnd: 0,
              }));
          },
          className:
            "relative flex-1 bg-[#0d0f14] border border-[#222632] rounded-xl overflow-hidden flex flex-col justify-between px-0 py-2 cursor-pointer",
          children: [
            a.jsx("div", {
              className:
                "relative h-5 border-b border-[#1c202b] flex items-center text-[10px] font-mono text-zinc-500 pointer-events-none",
              children: Array.from({ length: 11 }).map((P, B) => {
                const E = B * 10,
                  D = ((b * B) / 10).toFixed(1);
                return a.jsxs(
                  "div",
                  {
                    style: { left: `${E}%` },
                    className:
                      "absolute top-0 bottom-0 flex flex-col items-start",
                    children: [
                      a.jsx("div", {
                        className: "h-1.5 border-l border-zinc-700",
                      }),
                      a.jsxs("span", { className: "ml-1", children: [D, "s"] }),
                    ],
                  },
                  B,
                );
              }),
            }),
            a.jsxs("div", {
              className:
                "relative h-12 my-1 mx-0 flex items-center bg-[#10131b]",
              children: [
                o.map((P, B) => {
                  const E = (P.startTime / b) * 100,
                    D = Math.max(0.8, ((P.endTime - P.startTime) / b) * 100),
                    I = P.id === i;
                  return a.jsxs(
                    "div",
                    {
                      "data-stop-track": "true",
                      onClick: (k) => {
                        (k.stopPropagation(), c(null), v(P.id));
                      },
                      style: { left: `${E}%`, width: `${D}%` },
                      className: `absolute top-1 bottom-1 rounded-md border transition flex items-center justify-between px-2.5 overflow-hidden ${P.deleted ? "bg-rose-950/30 border-rose-500/30 opacity-45 line-through" : I ? "bg-emerald-500/30 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.28)] z-10" : "bg-emerald-500/18 border-emerald-500/40 hover:bg-emerald-500/25"}`,
                      children: [
                        a.jsxs("div", {
                          className:
                            "flex items-center gap-1.5 text-xs font-medium text-emerald-200 truncate pointer-events-none",
                          children: [
                            a.jsx(eu, {
                              className: "w-3 h-3 text-emerald-400 shrink-0",
                            }),
                            a.jsxs("span", {
                              className: "truncate",
                              children: [
                                "片段 #",
                                B + 1,
                                " (",
                                P.startTime.toFixed(1),
                                "s-",
                                P.endTime.toFixed(1),
                                "s)",
                              ],
                            }),
                          ],
                        }),
                        a.jsx("div", {
                          className:
                            "flex items-center gap-1.5 shrink-0 pointer-events-none",
                          children: P.deleted
                            ? a.jsx("span", {
                                className:
                                  "px-1.5 py-0.5 rounded bg-rose-500/30 text-rose-200 text-[10px] font-semibold",
                                children: "已跳过",
                              })
                            : a.jsxs("span", {
                                className: `px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${P.speed !== 1 ? "bg-amber-400 text-black" : "bg-black/40 text-emerald-300 border border-emerald-500/30"}`,
                                children: [P.speed, "x 倍速"],
                              }),
                        }),
                      ],
                    },
                    P.id,
                  );
                }),
                X.map((P, B) => {
                  const E = Math.max(0, Math.min(100, (P.t / 1e3 / b) * 100));
                  return a.jsx(
                    "div",
                    {
                      style: { left: `${E}%` },
                      title: `鼠标点击 @ ${(P.t / 1e3).toFixed(2)}s`,
                      className:
                        "absolute top-1.5 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24] pointer-events-none z-20",
                    },
                    B,
                  );
                }),
                a.jsx("div", {
                  "data-stop-track": "true",
                  onMouseDown: (P) => {
                    (P.stopPropagation(),
                      U({
                        type: "trim-left",
                        initialX: P.clientX,
                        initialStart: n,
                        initialEnd: r,
                      }));
                  },
                  style: { left: `${(n / b) * 100}%` },
                  className:
                    "absolute top-0 bottom-0 w-2 bg-emerald-400 hover:bg-emerald-300 cursor-ew-resize z-20 flex items-center justify-center rounded-l",
                  title: "拖拽裁切整段起点",
                  children: a.jsx("div", {
                    className: "w-0.5 h-4 bg-black/70 rounded",
                  }),
                }),
                a.jsx("div", {
                  "data-stop-track": "true",
                  onMouseDown: (P) => {
                    (P.stopPropagation(),
                      U({
                        type: "trim-right",
                        initialX: P.clientX,
                        initialStart: n,
                        initialEnd: r,
                      }));
                  },
                  style: { left: `calc(${(r / b) * 100}% - 8px)` },
                  className:
                    "absolute top-0 bottom-0 w-2 bg-emerald-400 hover:bg-emerald-300 cursor-ew-resize z-20 flex items-center justify-center rounded-r",
                  title: "拖拽裁切整段终点",
                  children: a.jsx("div", {
                    className: "w-0.5 h-4 bg-black/70 rounded",
                  }),
                }),
              ],
            }),
            a.jsxs("div", {
              className:
                "relative h-12 bg-[#12151e] border-t border-[#1d2130] flex items-center",
              children: [
                a.jsx("span", {
                  className:
                    "ml-3 text-[11px] text-zinc-500 pointer-events-none",
                  children: "ZOOM 镜头轨道",
                }),
                u.map((P) => {
                  const B = (P.startTime / b) * 100,
                    E = Math.max(1.5, ((P.endTime - P.startTime) / b) * 100),
                    D = P.id === s;
                  return a.jsxs(
                    "div",
                    {
                      "data-stop-track": "true",
                      onMouseDown: (I) => {
                        (I.stopPropagation(),
                          v(null),
                          c(P.id),
                          U({
                            type: "seg-move",
                            segId: P.id,
                            initialX: I.clientX,
                            initialStart: P.startTime,
                            initialEnd: P.endTime,
                          }));
                      },
                      style: { left: `${B}%`, width: `${E}%` },
                      className: `absolute top-1.5 bottom-1.5 rounded-lg border transition flex items-center justify-between px-2 cursor-grab active:cursor-grabbing ${D ? "bg-indigo-600/45 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.35)] z-10" : "bg-indigo-500/25 border-indigo-500/50 hover:bg-indigo-500/35"}`,
                      children: [
                        a.jsx("div", {
                          "data-stop-track": "true",
                          onMouseDown: (I) => {
                            (I.stopPropagation(),
                              v(null),
                              c(P.id),
                              U({
                                type: "seg-left",
                                segId: P.id,
                                initialX: I.clientX,
                                initialStart: P.startTime,
                                initialEnd: P.endTime,
                              }));
                          },
                          className:
                            "absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-indigo-300/50 rounded-l-lg",
                        }),
                        a.jsxs("div", {
                          className:
                            "flex items-center gap-1.5 overflow-hidden pointer-events-none",
                          children: [
                            a.jsx(nu, {
                              className: "w-3.5 h-3.5 text-indigo-300 shrink-0",
                            }),
                            a.jsxs("span", {
                              className:
                                "text-[11px] font-semibold text-indigo-100 truncate",
                              children: [
                                P.scale.toFixed(1),
                                "x · ",
                                P.mode === "follow-cursor"
                                  ? "跟随鼠标"
                                  : "固定焦点",
                              ],
                            }),
                          ],
                        }),
                        a.jsx("div", {
                          "data-stop-track": "true",
                          onMouseDown: (I) => {
                            (I.stopPropagation(),
                              v(null),
                              c(P.id),
                              U({
                                type: "seg-right",
                                segId: P.id,
                                initialX: I.clientX,
                                initialStart: P.startTime,
                                initialEnd: P.endTime,
                              }));
                          },
                          className:
                            "absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-indigo-300/50 rounded-r-lg",
                        }),
                      ],
                    },
                    P.id,
                  );
                }),
              ],
            }),
            a.jsx("div", {
              style: { left: `${(t / b) * 100}%` },
              className:
                "absolute top-0 bottom-0 w-0.5 bg-rose-500 pointer-events-none z-30",
              children: a.jsx("div", {
                className:
                  "w-3 h-3 -ml-[5px] bg-rose-500 rotate-45 rounded-xs shadow",
              }),
            }),
          ],
        }),
      ],
    });
  },
  Q0 = ({
    config: e,
    hasWebcamStream: t,
    onChange: n,
    onToggleWebcamDevice: r,
  }) =>
    a.jsxs("aside", {
      className:
        "w-80 bg-[#12141a] border-l border-[#232733] flex flex-col overflow-y-auto p-4 space-y-6 select-none",
      children: [
        a.jsxs("section", {
          className: "space-y-3",
          children: [
            a.jsxs("div", {
              className: "flex items-center justify-between",
              children: [
                a.jsxs("h3", {
                  className:
                    "text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5",
                  children: [
                    a.jsx(z0, { className: "w-3.5 h-3.5 text-indigo-400" }),
                    "画布背景 (Wallpaper)",
                  ],
                }),
                a.jsx("span", {
                  className: "text-[11px] text-zinc-500",
                  children: "macOS Presets",
                }),
              ],
            }),
            a.jsx("div", {
              className: "grid grid-cols-4 gap-2",
              children: Ai.map((l) => {
                const o = e.wallpaperId === l.id,
                  i =
                    l.id === "custom-solid"
                      ? { background: e.customColor }
                      : {
                          background: `linear-gradient(${l.angle}deg, ${l.stops[0]}, ${l.stops[1]}, ${l.stops[2]})`,
                        };
                return a.jsx(
                  "button",
                  {
                    onClick: () => n({ wallpaperId: l.id }),
                    title: l.name,
                    style: i,
                    className: `h-11 rounded-lg border transition relative overflow-hidden ${o ? "border-white ring-2 ring-indigo-500/70 scale-[1.03]" : "border-white/15 hover:border-white/40"}`,
                    children: a.jsx("span", {
                      className: "sr-only",
                      children: l.name,
                    }),
                  },
                  l.id,
                );
              }),
            }),
            e.wallpaperId === "custom-solid" &&
              a.jsxs("div", {
                className:
                  "flex items-center justify-between bg-[#181b23] px-3 py-2 rounded-lg border border-[#262b38]",
                children: [
                  a.jsx("span", {
                    className: "text-xs text-zinc-300",
                    children: "自定义背景色",
                  }),
                  a.jsx("input", {
                    type: "color",
                    value: e.customColor,
                    onChange: (l) => n({ customColor: l.target.value }),
                    className:
                      "w-7 h-7 rounded cursor-pointer bg-transparent border-0",
                  }),
                ],
              }),
          ],
        }),
        a.jsxs("section", {
          className: "space-y-3 pt-2 border-t border-[#1e222d]",
          children: [
            a.jsxs("h3", {
              className:
                "text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5",
              children: [
                a.jsx(j0, { className: "w-3.5 h-3.5 text-indigo-400" }),
                "边框与比例 (Frame & Aspect)",
              ],
            }),
            a.jsx("div", {
              className:
                "grid grid-cols-5 gap-1.5 bg-[#181b23] p-1 rounded-lg border border-[#242936]",
              children: ["16:9", "9:16", "1:1", "4:3", "original"].map((l) =>
                a.jsx(
                  "button",
                  {
                    onClick: () => n({ aspectRatio: l }),
                    className: `py-1 rounded text-[11px] font-medium transition ${e.aspectRatio === l ? "bg-indigo-600 text-white shadow" : "text-zinc-400 hover:text-zinc-200"}`,
                    children: l === "original" ? "原比例" : l,
                  },
                  l,
                ),
              ),
            }),
            a.jsxs("div", {
              className: "space-y-2.5 text-xs",
              children: [
                a.jsxs("div", {
                  children: [
                    a.jsxs("div", {
                      className: "flex justify-between text-zinc-400 mb-1",
                      children: [
                        a.jsx("span", { children: "内边距 (Padding)" }),
                        a.jsxs("span", {
                          className: "font-mono text-zinc-300",
                          children: [e.padding, "px"],
                        }),
                      ],
                    }),
                    a.jsx("input", {
                      type: "range",
                      min: 0,
                      max: 160,
                      value: e.padding,
                      onChange: (l) => n({ padding: Number(l.target.value) }),
                      className: "w-full accent-indigo-500 cursor-pointer",
                    }),
                  ],
                }),
                a.jsxs("div", {
                  children: [
                    a.jsxs("div", {
                      className: "flex justify-between text-zinc-400 mb-1",
                      children: [
                        a.jsx("span", { children: "画面圆角 (Corner Radius)" }),
                        a.jsxs("span", {
                          className: "font-mono text-zinc-300",
                          children: [e.borderRadius, "px"],
                        }),
                      ],
                    }),
                    a.jsx("input", {
                      type: "range",
                      min: 0,
                      max: 44,
                      value: e.borderRadius,
                      onChange: (l) =>
                        n({ borderRadius: Number(l.target.value) }),
                      className: "w-full accent-indigo-500 cursor-pointer",
                    }),
                  ],
                }),
                a.jsxs("div", {
                  children: [
                    a.jsxs("div", {
                      className: "flex justify-between text-zinc-400 mb-1",
                      children: [
                        a.jsx("span", { children: "立体阴影 (Shadow Depth)" }),
                        a.jsxs("span", {
                          className: "font-mono text-zinc-300",
                          children: [e.shadowIntensity, "%"],
                        }),
                      ],
                    }),
                    a.jsx("input", {
                      type: "range",
                      min: 0,
                      max: 100,
                      value: e.shadowIntensity,
                      onChange: (l) =>
                        n({ shadowIntensity: Number(l.target.value) }),
                      className: "w-full accent-indigo-500 cursor-pointer",
                    }),
                  ],
                }),
              ],
            }),
            a.jsxs("div", {
              className: "grid grid-cols-2 gap-2 pt-1",
              children: [
                a.jsxs("label", {
                  className:
                    "flex items-center gap-2 text-xs text-zinc-300 bg-[#181b23] px-2.5 py-2 rounded-lg border border-[#242936] cursor-pointer",
                  children: [
                    a.jsx("input", {
                      type: "checkbox",
                      checked: e.insetBorder,
                      onChange: (l) => n({ insetBorder: l.target.checked }),
                      className: "accent-indigo-500 rounded",
                    }),
                    a.jsx("span", { children: "玻璃高光边" }),
                  ],
                }),
                a.jsxs("label", {
                  className:
                    "flex items-center gap-2 text-xs text-zinc-300 bg-[#181b23] px-2.5 py-2 rounded-lg border border-[#242936] cursor-pointer",
                  children: [
                    a.jsx("input", {
                      type: "checkbox",
                      checked: e.macosHeader,
                      onChange: (l) => n({ macosHeader: l.target.checked }),
                      className: "accent-indigo-500 rounded",
                    }),
                    a.jsx("span", { children: "macOS 顶栏" }),
                  ],
                }),
              ],
            }),
          ],
        }),
        a.jsxs("section", {
          className: "space-y-3 pt-2 border-t border-[#1e222d]",
          children: [
            a.jsxs("h3", {
              className:
                "text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5",
              children: [
                a.jsx(Fs, { className: "w-3.5 h-3.5 text-indigo-400" }),
                "弹簧物理推镜 (Spring Physics)",
              ],
            }),
            a.jsx("div", {
              className: "grid grid-cols-2 gap-1.5",
              children: Object.keys($i).map((l) =>
                a.jsx(
                  "button",
                  {
                    onClick: () => n({ springPreset: l }),
                    className: `px-2.5 py-1.5 rounded-lg border text-xs font-medium transition text-left ${e.springPreset === l ? "bg-indigo-600/25 border-indigo-500 text-indigo-200" : "bg-[#181b23] border-[#242936] text-zinc-400 hover:text-zinc-200"}`,
                    children: $i[l].label,
                  },
                  l,
                ),
              ),
            }),
          ],
        }),
        a.jsxs("section", {
          className: "space-y-3 pt-2 border-t border-[#1e222d]",
          children: [
            a.jsxs("h3", {
              className:
                "text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5",
              children: [
                a.jsx(E0, { className: "w-3.5 h-3.5 text-indigo-400" }),
                "光标与点击动效 (Cursor & Ripple)",
              ],
            }),
            a.jsxs("div", {
              className: "space-y-2 text-xs",
              children: [
                a.jsxs("div", {
                  className: "flex justify-between text-zinc-400",
                  children: [
                    a.jsx("span", { children: "平滑光标大小 (Custom Cursor)" }),
                    a.jsx("span", {
                      className: "font-mono text-zinc-300",
                      children:
                        e.cursorScale === 0
                          ? "关闭"
                          : `${e.cursorScale.toFixed(1)}x`,
                    }),
                  ],
                }),
                a.jsx("input", {
                  type: "range",
                  min: 0,
                  max: 2.5,
                  step: 0.1,
                  value: e.cursorScale,
                  onChange: (l) =>
                    n({ cursorScale: parseFloat(l.target.value) }),
                  className: "w-full accent-indigo-500 cursor-pointer",
                }),
              ],
            }),
            a.jsxs("div", {
              className: "grid grid-cols-2 gap-2",
              children: [
                a.jsxs("label", {
                  className:
                    "flex items-center gap-2 text-xs text-zinc-300 bg-[#181b23] px-2.5 py-2 rounded-lg border border-[#242936] cursor-pointer",
                  children: [
                    a.jsx("input", {
                      type: "checkbox",
                      checked: e.showClickRipple,
                      onChange: (l) => n({ showClickRipple: l.target.checked }),
                      className: "accent-indigo-500 rounded",
                    }),
                    a.jsx("span", { children: "点击波纹环" }),
                  ],
                }),
                a.jsxs("label", {
                  className:
                    "flex items-center gap-2 text-xs text-zinc-300 bg-[#181b23] px-2.5 py-2 rounded-lg border border-[#242936] cursor-pointer",
                  children: [
                    a.jsx("input", {
                      type: "checkbox",
                      checked: e.smoothCursorMove,
                      onChange: (l) =>
                        n({ smoothCursorMove: l.target.checked }),
                      className: "accent-indigo-500 rounded",
                    }),
                    a.jsx("span", { children: "轨迹物理平滑" }),
                  ],
                }),
              ],
            }),
          ],
        }),
        a.jsxs("section", {
          className: "space-y-3 pt-2 border-t border-[#1e222d]",
          children: [
            a.jsxs("div", {
              className: "flex items-center justify-between",
              children: [
                a.jsxs("h3", {
                  className:
                    "text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5",
                  children: [
                    a.jsx(wd, { className: "w-3.5 h-3.5 text-indigo-400" }),
                    "摄像头画中画 (Webcam PiP)",
                  ],
                }),
                a.jsx("button", {
                  onClick: r,
                  className: `px-2 py-0.5 rounded text-[11px] font-medium transition ${t ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-[#1c202a] text-zinc-300 border border-[#2b3140] hover:bg-[#252a37]"}`,
                  children: t ? "已开启摄像头" : "开启摄像头",
                }),
              ],
            }),
            t &&
              a.jsxs("div", {
                className: "space-y-2.5 text-xs",
                children: [
                  a.jsx("div", {
                    className:
                      "grid grid-cols-4 gap-1 bg-[#181b23] p-1 rounded-lg border border-[#242936]",
                    children: [
                      ["bottom-right", "右下"],
                      ["bottom-left", "左下"],
                      ["top-right", "右上"],
                      ["top-left", "左上"],
                    ].map(([l, o]) =>
                      a.jsx(
                        "button",
                        {
                          onClick: () => n({ webcamCorner: l }),
                          className: `py-1 rounded text-[11px] transition ${e.webcamCorner === l ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-zinc-200"}`,
                          children: o,
                        },
                        l,
                      ),
                    ),
                  }),
                  a.jsx("div", {
                    className:
                      "grid grid-cols-3 gap-1 bg-[#181b23] p-1 rounded-lg border border-[#242936]",
                    children: [
                      ["circle", "圆形"],
                      ["rounded", "横版圆角"],
                      ["square", "方角"],
                    ].map(([l, o]) =>
                      a.jsx(
                        "button",
                        {
                          onClick: () => n({ webcamShape: l }),
                          className: `py-1 rounded text-[11px] transition ${e.webcamShape === l ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-zinc-200"}`,
                          children: o,
                        },
                        l,
                      ),
                    ),
                  }),
                  a.jsxs("div", {
                    children: [
                      a.jsxs("div", {
                        className: "flex justify-between text-zinc-400 mb-1",
                        children: [
                          a.jsx("span", { children: "画中画尺寸" }),
                          a.jsxs("span", {
                            className: "font-mono text-zinc-300",
                            children: [e.webcamSize, "px"],
                          }),
                        ],
                      }),
                      a.jsx("input", {
                        type: "range",
                        min: 120,
                        max: 340,
                        value: e.webcamSize,
                        onChange: (l) =>
                          n({ webcamSize: Number(l.target.value) }),
                        className: "w-full accent-indigo-500 cursor-pointer",
                      }),
                    ],
                  }),
                  a.jsxs("label", {
                    className:
                      "flex items-center gap-2 text-xs text-zinc-300 bg-[#181b23] px-2.5 py-2 rounded-lg border border-[#242936] cursor-pointer",
                    children: [
                      a.jsx("input", {
                        type: "checkbox",
                        checked: e.webcamShrinkOnZoom,
                        onChange: (l) =>
                          n({ webcamShrinkOnZoom: l.target.checked }),
                        className: "accent-indigo-500 rounded",
                      }),
                      a.jsx("span", { children: "镜头放大时自动缩小避让" }),
                    ],
                  }),
                ],
              }),
          ],
        }),
        a.jsxs("section", {
          className: "space-y-2.5 pt-2 border-t border-[#1e222d]",
          children: [
            a.jsxs("h3", {
              className:
                "text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5",
              children: [
                a.jsx(Nd, { className: "w-3.5 h-3.5 text-indigo-400" }),
                "播放与导出倍速 (Speed)",
              ],
            }),
            a.jsx("div", {
              className:
                "grid grid-cols-4 gap-1.5 bg-[#181b23] p-1 rounded-lg border border-[#242936]",
              children: [1, 1.25, 1.5, 2].map((l) =>
                a.jsxs(
                  "button",
                  {
                    onClick: () => n({ playbackSpeed: l }),
                    className: `py-1 rounded text-xs font-mono transition ${e.playbackSpeed === l ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-zinc-200"}`,
                    children: [l, "x"],
                  },
                  l,
                ),
              ),
            }),
          ],
        }),
      ],
    }),
  K0 = ({
    isOpen: e,
    sources: t,
    loading: n,
    error: r,
    micEnabled: l,
    webcamEnabled: o,
    onRefresh: i,
    onToggleMic: u,
    onToggleWebcam: s,
    onSelectSourceAndRecord: d,
    onBrowserFallbackRecord: m,
    onClose: g,
  }) => {
    const [h, v] = N.useState("screen");
    if (!e) return null;
    const w = t.filter((x) => (h === "screen" ? x.isScreen : !x.isScreen));
    return a.jsx("div", {
      className:
        "fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-6 select-none",
      children: a.jsxs("div", {
        className:
          "w-full max-w-3xl bg-[#14171f] border border-[#282d3e] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]",
        children: [
          a.jsxs("div", {
            className:
              "flex items-center justify-between px-6 py-4 border-b border-[#222634]",
            children: [
              a.jsxs("div", {
                children: [
                  a.jsxs("h2", {
                    className:
                      "text-base font-semibold text-zinc-100 flex items-center gap-2",
                    children: [
                      a.jsx(k0, {
                        className: "w-4 h-4 text-rose-500 animate-pulse",
                      }),
                      "选择录制目标 (自动启用 macOS 原生鼠标点击追踪)",
                    ],
                  }),
                  a.jsx("p", {
                    className: "text-xs text-zinc-400 mt-0.5",
                    children:
                      "录制期间你在屏幕上的每次鼠标点击都会被原生 Swift 追踪器捕获并自动生成丝滑缩放镜头",
                  }),
                ],
              }),
              a.jsx("button", {
                onClick: g,
                className:
                  "p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-[#1f2430] transition",
                children: a.jsx(Ds, { className: "w-4 h-4" }),
              }),
            ],
          }),
          a.jsxs("div", {
            className:
              "flex items-center justify-between px-6 py-3 bg-[#101219] border-b border-[#1f2330]",
            children: [
              a.jsxs("div", {
                className: "flex items-center gap-2",
                children: [
                  a.jsxs("button", {
                    onClick: () => v("screen"),
                    className: `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${h === "screen" ? "bg-indigo-600 text-white" : "bg-[#1a1e29] text-zinc-400 hover:text-zinc-200"}`,
                    children: [
                      a.jsx(Cd, { className: "w-3.5 h-3.5" }),
                      "整个屏幕 (",
                      t.filter((x) => x.isScreen).length,
                      ")",
                    ],
                  }),
                  a.jsxs("button", {
                    onClick: () => v("window"),
                    className: `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${h === "window" ? "bg-indigo-600 text-white" : "bg-[#1a1e29] text-zinc-400 hover:text-zinc-200"}`,
                    children: [
                      a.jsx(xd, { className: "w-3.5 h-3.5" }),
                      "应用窗口 (",
                      t.filter((x) => !x.isScreen).length,
                      ")",
                    ],
                  }),
                  a.jsx("button", {
                    onClick: i,
                    className:
                      "p-1.5 rounded-lg bg-[#1a1e29] hover:bg-[#232836] text-zinc-300 transition",
                    title: "刷新列表",
                    children: a.jsx(R0, {
                      className: `w-3.5 h-3.5 ${n ? "animate-spin" : ""}`,
                    }),
                  }),
                ],
              }),
              a.jsxs("div", {
                className: "flex items-center gap-2",
                children: [
                  a.jsxs("button", {
                    onClick: u,
                    className: `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${l ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300" : "bg-[#181b24] border-[#262b38] text-zinc-400"}`,
                    children: [
                      a.jsx(jd, { className: "w-3.5 h-3.5" }),
                      l ? "麦克风已开启" : "麦克风关闭",
                    ],
                  }),
                  a.jsxs("button", {
                    onClick: s,
                    className: `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${o ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300" : "bg-[#181b24] border-[#262b38] text-zinc-400"}`,
                    children: [
                      a.jsx(wd, { className: "w-3.5 h-3.5" }),
                      o ? "摄像头画中画开启" : "摄像头关闭",
                    ],
                  }),
                ],
              }),
            ],
          }),
          a.jsxs("div", {
            className: "p-6 overflow-y-auto flex-1",
            children: [
              r &&
                a.jsxs("div", {
                  className:
                    "mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start justify-between gap-4",
                  children: [
                    a.jsxs("div", {
                      className: "flex items-start gap-2.5",
                      children: [
                        a.jsx(D0, {
                          className: "w-4 h-4 text-amber-400 shrink-0 mt-0.5",
                        }),
                        a.jsxs("div", {
                          children: [
                            a.jsxs("div", {
                              className: "font-semibold mb-1",
                              children: ["提示：", r],
                            }),
                            a.jsx("div", {
                              className: "text-amber-300/80",
                              children:
                                "若 macOS 尚未向 Electron 授予屏幕录制权限，可前往「系统设置 → 隐私与安全性 → 屏幕与系统音频录制」开启，或者点击右侧按钮使用系统级选择器。",
                            }),
                          ],
                        }),
                      ],
                    }),
                    a.jsx("button", {
                      onClick: m,
                      className:
                        "px-3 py-1.5 rounded-lg bg-amber-500 text-black font-semibold shrink-0 hover:bg-amber-400 transition",
                      children: "调用系统录制选择器",
                    }),
                  ],
                }),
              n
                ? a.jsx("div", {
                    className:
                      "h-52 flex items-center justify-center text-sm text-zinc-400",
                    children: "正在读取 macOS 桌面与窗口画面源...",
                  })
                : w.length === 0
                  ? a.jsxs("div", {
                      className:
                        "h-52 flex flex-col items-center justify-center gap-3 text-sm text-zinc-400",
                      children: [
                        a.jsxs("span", {
                          children: [
                            "未找到可用的",
                            h === "screen" ? "屏幕" : "窗口",
                            "源",
                          ],
                        }),
                        a.jsx("button", {
                          onClick: m,
                          className:
                            "px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition",
                          children: "直接调起系统屏幕选择器开始录制",
                        }),
                      ],
                    })
                  : a.jsx("div", {
                      className: "grid grid-cols-3 gap-4",
                      children: w.map((x) =>
                        a.jsxs(
                          "button",
                          {
                            onClick: () => d(x),
                            className:
                              "group bg-[#1a1e29] hover:bg-[#222736] border border-[#2a3042] hover:border-indigo-500 rounded-xl p-2.5 text-left transition flex flex-col",
                            children: [
                              a.jsxs("div", {
                                className:
                                  "relative aspect-video bg-black rounded-lg overflow-hidden mb-2.5 border border-white/5",
                                children: [
                                  a.jsx("img", {
                                    src: x.thumbnail,
                                    alt: x.name,
                                    className:
                                      "w-full h-full object-cover group-hover:scale-[1.03] transition duration-200",
                                  }),
                                  a.jsx("div", {
                                    className:
                                      "absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/20 transition flex items-center justify-center",
                                    children: a.jsx("span", {
                                      className:
                                        "opacity-0 group-hover:opacity-100 px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-semibold shadow-lg transition",
                                      children: "点击立即开始录制",
                                    }),
                                  }),
                                ],
                              }),
                              a.jsxs("div", {
                                className: "flex items-center gap-2",
                                children: [
                                  x.appIcon &&
                                    a.jsx("img", {
                                      src: x.appIcon,
                                      alt: "",
                                      className: "w-4 h-4 rounded shrink-0",
                                    }),
                                  a.jsx("span", {
                                    className:
                                      "text-xs font-medium text-zinc-200 truncate",
                                    children: x.name,
                                  }),
                                ],
                              }),
                            ],
                          },
                          x.id,
                        ),
                      ),
                    }),
            ],
          }),
        ],
      }),
    });
  },
  G0 = () => {
    var I;
    const [e, t] = N.useState("display"),
      [n, r] = N.useState(!1),
      [l, o] = N.useState(!1),
      [i, u] = N.useState(!1),
      [s, d] = N.useState([]),
      [m, g] = N.useState(""),
      [h, v] = N.useState(null),
      [w, x] = N.useState(!1),
      [F, f] = N.useState(!1),
      [c, p] = N.useState(!1),
      [y, S] = N.useState(!1),
      [_, T] = N.useState(0),
      [j, U] = N.useState(0);
    N.useEffect(() => {
      ((document.body.style.background = "transparent"),
        (document.documentElement.style.background = "transparent"));
    }, []);
    const b = N.useCallback(async () => {
      var L;
      if (!((L = window.studioAPI) != null && L.getSources)) return;
      const k = await window.studioAPI.getSources();
      if (Array.isArray(k)) {
        d(k);
        const te = k.find((re) => re.isScreen);
        te && !m && g(te.id);
      }
    }, [m]);
    (N.useEffect(() => {
      b();
    }, [b]),
      N.useEffect(() => {
        var k;
        if ((k = window.studioAPI) != null && k.onAreaSelected)
          return window.studioAPI.onAreaSelected((L) => {
            L && v(L);
          });
      }, []),
      N.useEffect(() => {
        var k;
        if ((k = window.studioAPI) != null && k.onMouseEvent)
          return window.studioAPI.onMouseEvent((L) => {
            L.type === "down" && U((te) => te + 1);
          });
      }, []),
      N.useEffect(() => {
        if (!y) {
          T(0);
          return;
        }
        const k = window.setInterval(() => T((L) => L + 1), 1e3);
        return () => clearInterval(k);
      }, [y]),
      N.useEffect(() => {
        var L;
        const k = !y && (w || F || c);
        (L = window.studioAPI) == null || L.setHudExpanded(k);
      }, [y, w, F, c]));
    const A = async (k) => {
        var L, te, re;
        if ((t(k), x(!1), f(!1), p(!1), k === "display")) {
          (v(null),
            await ((L = window.studioAPI) == null ? void 0 : L.clearMask()));
          const We = s.find((xe) => xe.isScreen);
          We && g(We.id);
        } else
          k === "window"
            ? (v(null),
              await ((te = window.studioAPI) == null ? void 0 : te.clearMask()),
              await b(),
              x(!0))
            : k === "area"
              ? await ((re = window.studioAPI) == null
                  ? void 0
                  : re.openAreaSelector(null))
              : k === "device" && f(!0);
      },
      J = async () => {
        var te;
        (x(!1), f(!1), p(!1), U(0), S(!0));
        const k = s.find((re) => re.isScreen),
          L = e === "window" && m ? m : (k == null ? void 0 : k.id) || m;
        await ((te = window.studioAPI) == null
          ? void 0
          : te.hudStartRecord({
              mode: e,
              sourceId: L,
              areaCrop: e === "area" || e === "device" ? h : null,
              cameraEnabled: n,
              micEnabled: l,
              systemAudioEnabled: i,
            }));
      },
      X = async () => {
        var k, L;
        (S(!1),
          await ((k = window.studioAPI) == null ? void 0 : k.clearMask()),
          await ((L = window.studioAPI) == null ? void 0 : L.hudStopRecord()));
      },
      ce = s.filter((k) => !k.isScreen),
      He =
        ((I = ce.find((k) => k.id === m)) == null ? void 0 : I.name) ||
        "选择窗口",
      P = (k) => {
        const L = Math.floor(k / 60)
            .toString()
            .padStart(2, "0"),
          te = (k % 60).toString().padStart(2, "0");
        return `${L}:${te}`;
      },
      B = N.useRef({ active: !1, moved: !1, lastScreenX: 0, lastScreenY: 0 });
    N.useEffect(() => {
      const k = (te) => {
          var xe;
          if (!B.current.active) return;
          const re = te.screenX - B.current.lastScreenX,
            We = te.screenY - B.current.lastScreenY;
          (Math.abs(re) > 1 || Math.abs(We) > 1) &&
            ((B.current.moved = !0),
            (B.current.lastScreenX = te.screenX),
            (B.current.lastScreenY = te.screenY),
            (xe = window.studioAPI) == null || xe.moveHud(re, We));
        },
        L = () => {
          B.current.active = !1;
        };
      return (
        window.addEventListener("mousemove", k),
        window.addEventListener("mouseup", L),
        () => {
          (window.removeEventListener("mousemove", k),
            window.removeEventListener("mouseup", L));
        }
      );
    }, []);
    const E = (k) => {
        k.button === 0 &&
          (B.current = {
            active: !0,
            moved: !1,
            lastScreenX: k.screenX,
            lastScreenY: k.screenY,
          });
      },
      D = (k) => {
        B.current.moved &&
          (k.stopPropagation(), k.preventDefault(), (B.current.moved = !1));
      };
    return y
      ? a.jsx("div", {
          className:
            "w-screen h-screen flex items-end justify-center select-none bg-transparent overflow-hidden",
          children: a.jsxs("div", {
            onMouseDown: E,
            onClickCapture: D,
            className:
              "h-[68px] w-full px-5 rounded-2xl bg-[#323236]/95 backdrop-blur-2xl border border-rose-500/40 flex items-center justify-between text-zinc-100 cursor-grab active:cursor-grabbing",
            children: [
              a.jsxs("div", {
                className: "flex items-center gap-3",
                children: [
                  a.jsx("span", {
                    className: "w-3 h-3 rounded-full bg-rose-500 animate-ping",
                  }),
                  a.jsxs("span", {
                    className: "text-xs font-semibold text-white",
                    children: [
                      "正在录制 (",
                      e.toUpperCase(),
                      h ? ` · ${h.pxW}×${h.pxH}` : "",
                      ")",
                    ],
                  }),
                  a.jsx("span", {
                    className:
                      "text-xs font-mono bg-black/40 px-2.5 py-1 rounded-lg text-rose-300 border border-white/10",
                    children: P(_),
                  }),
                  a.jsxs("span", {
                    className:
                      "text-xs text-zinc-300 flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg",
                    children: [
                      a.jsx(M0, { className: "w-3.5 h-3.5 text-amber-400" }),
                      "已捕获 ",
                      j,
                      " 次点击自动缩放",
                    ],
                  }),
                ],
              }),
              a.jsx("div", {
                className: "flex items-center gap-2.5 app-no-drag",
                children: a.jsxs("button", {
                  onClick: X,
                  className:
                    "h-10 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-2 transition",
                  children: [
                    a.jsx(Md, { className: "w-3.5 h-3.5 fill-white" }),
                    a.jsx("span", { children: "完成并停止录制 (Stop)" }),
                  ],
                }),
              }),
            ],
          }),
        })
      : a.jsxs("div", {
          className:
            "w-screen h-screen flex flex-col justify-end items-center select-none bg-transparent overflow-hidden",
          children: [
            w &&
              a.jsx("div", {
                className:
                  "mb-2 w-[520px] max-h-44 overflow-y-auto bg-[#2b2b2e]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-3 grid grid-cols-3 gap-2.5 app-no-drag",
                children:
                  ce.length === 0
                    ? a.jsx("div", {
                        className:
                          "col-span-3 text-center py-6 text-xs text-zinc-300",
                        children:
                          "未检测到独立窗口，请先打开目标应用或使用 Display / Area 模式",
                      })
                    : ce.map((k) =>
                        a.jsxs(
                          "button",
                          {
                            onClick: () => {
                              (g(k.id), x(!1));
                            },
                            className: `p-2 rounded-xl border text-left transition flex flex-col gap-1.5 ${m === k.id ? "bg-white/15 border-white/50" : "bg-black/25 border-white/10 hover:border-white/30"}`,
                            children: [
                              a.jsx("img", {
                                src: k.thumbnail,
                                alt: k.name,
                                className:
                                  "w-full h-16 object-cover rounded-lg bg-black",
                              }),
                              a.jsx("span", {
                                className:
                                  "text-[11px] text-zinc-100 truncate font-medium",
                                children: k.name,
                              }),
                            ],
                          },
                          k.id,
                        ),
                      ),
              }),
            F &&
              a.jsxs("div", {
                className:
                  "mb-2 w-80 bg-[#2b2b2e]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-2.5 flex flex-col gap-1 app-no-drag",
                children: [
                  a.jsx("div", {
                    className:
                      "text-[11px] text-zinc-400 px-2.5 py-1 font-medium",
                    children: "选择移动设备画幅框选录制 (Device Frame Area)",
                  }),
                  [
                    { label: "iPhone 16 Pro (9:16 竖屏)", w: 430, h: 764 },
                    { label: "iPad Air (4:3 平板)", w: 820, h: 615 },
                    { label: "社交媒体方形 (1:1)", w: 680, h: 680 },
                  ].map((k) =>
                    a.jsxs(
                      "button",
                      {
                        onClick: async () => {
                          var L;
                          (f(!1),
                            await ((L = window.studioAPI) == null
                              ? void 0
                              : L.openAreaSelector({ w: k.w, h: k.h })));
                        },
                        className:
                          "flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/10 text-xs text-zinc-100 transition",
                        children: [
                          a.jsx("span", { children: k.label }),
                          a.jsxs("span", {
                            className: "text-[11px] font-mono text-zinc-400",
                            children: [k.w, "×", k.h],
                          }),
                        ],
                      },
                      k.label,
                    ),
                  ),
                ],
              }),
            c &&
              a.jsxs("div", {
                className:
                  "mb-2 w-72 bg-[#2b2b2e]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-3 text-xs text-zinc-200 space-y-2 app-no-drag",
                children: [
                  a.jsxs("div", {
                    className: "flex items-center justify-between py-1",
                    children: [
                      a.jsx("span", {
                        children: "原生 Swift 鼠标点击自动缩放",
                      }),
                      a.jsxs("span", {
                        className:
                          "text-emerald-400 flex items-center gap-1 font-medium",
                        children: [
                          a.jsx(kd, { className: "w-3.5 h-3.5" }),
                          " 已启用",
                        ],
                      }),
                    ],
                  }),
                  a.jsxs("div", {
                    className:
                      "flex items-center justify-between py-1 border-t border-white/10",
                    children: [
                      a.jsx("span", { children: "最高帧率目标" }),
                      a.jsx("span", {
                        className: "font-mono text-zinc-300",
                        children: "60 FPS",
                      }),
                    ],
                  }),
                  a.jsx("button", {
                    onClick: () => {
                      var k;
                      return (k = window.studioAPI) == null
                        ? void 0
                        : k.closeHud(!0);
                    },
                    className:
                      "w-full mt-1 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-center text-zinc-100 font-medium transition",
                    children: "返回主编辑器窗口",
                  }),
                ],
              }),
            a.jsxs("div", {
              onMouseDown: E,
              onClickCapture: D,
              className:
                "h-[68px] w-full px-3.5 rounded-2xl bg-[#48484b]/95 backdrop-blur-2xl border border-white/15 flex items-center justify-between text-zinc-100 whitespace-nowrap cursor-grab active:cursor-grabbing",
              children: [
                a.jsx("button", {
                  onClick: () => {
                    var k;
                    return (k = window.studioAPI) == null
                      ? void 0
                      : k.closeHud(!0);
                  },
                  title: "关闭悬浮录制条并返回编辑器",
                  className:
                    "w-7 h-7 rounded-full bg-white hover:bg-zinc-200 text-[#333] flex items-center justify-center transition app-no-drag shrink-0",
                  children: a.jsx(Ds, { className: "w-4 h-4 stroke-[2.8]" }),
                }),
                a.jsx("div", { className: "h-8 w-px bg-white/15 shrink-0" }),
                a.jsxs("div", {
                  className: "flex items-center gap-1 app-no-drag shrink-0",
                  children: [
                    a.jsxs("button", {
                      onClick: () => A("display"),
                      className: `w-14 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition ${e === "display" ? "bg-white/18 text-white" : "text-zinc-300 hover:bg-white/10 hover:text-white"}`,
                      children: [
                        a.jsx(Cd, { className: "w-4 h-4 stroke-[2]" }),
                        a.jsx("span", {
                          className: "text-[11px] font-medium leading-none",
                          children: "Display",
                        }),
                      ],
                    }),
                    a.jsxs("button", {
                      onClick: () => A("window"),
                      title: e === "window" ? He : "选择单个应用窗口录制",
                      className: `w-14 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition ${e === "window" ? "bg-white/18 text-white" : "text-zinc-300 hover:bg-white/10 hover:text-white"}`,
                      children: [
                        a.jsx(xd, { className: "w-4 h-4 stroke-[2]" }),
                        a.jsx("span", {
                          className: "text-[11px] font-medium leading-none",
                          children: "Window",
                        }),
                      ],
                    }),
                    a.jsxs("button", {
                      onClick: () => A("area"),
                      title: h
                        ? `已框选区域: ${h.pxW}×${h.pxH}`
                        : "在桌面上拖拽框选自定义区域录制",
                      className: `w-14 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition ${e === "area" ? "bg-white/18 text-white" : "text-zinc-300 hover:bg-white/10 hover:text-white"}`,
                      children: [
                        a.jsx(I0, { className: "w-4 h-4 stroke-[2]" }),
                        a.jsx("span", {
                          className: "text-[11px] font-medium leading-none",
                          children: "Area",
                        }),
                      ],
                    }),
                    a.jsxs("button", {
                      onClick: () => A("device"),
                      className: `w-14 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition ${e === "device" ? "bg-white/18 text-white" : "text-zinc-300 hover:bg-white/10 hover:text-white"}`,
                      children: [
                        a.jsx(O0, { className: "w-4 h-4 stroke-[2]" }),
                        a.jsx("span", {
                          className: "text-[11px] font-medium leading-none",
                          children: "Device",
                        }),
                      ],
                    }),
                  ],
                }),
                a.jsx("div", { className: "h-8 w-px bg-white/15 shrink-0" }),
                a.jsxs("div", {
                  className: "flex items-center gap-1 app-no-drag shrink-0",
                  children: [
                    a.jsxs("button", {
                      onClick: () => r((k) => !k),
                      className: `px-2.5 py-2 rounded-xl flex items-center gap-1.5 text-xs font-medium transition ${n ? "bg-white/18 text-white" : "text-zinc-300 hover:bg-white/10 hover:text-zinc-100"}`,
                      children: [
                        n
                          ? a.jsx(Ed, {
                              className: "w-4 h-4 text-emerald-400 shrink-0",
                            })
                          : a.jsx(U0, {
                              className: "w-4 h-4 text-zinc-400 shrink-0",
                            }),
                        a.jsx("span", {
                          children: n ? "Camera On" : "No camera",
                        }),
                      ],
                    }),
                    a.jsxs("button", {
                      onClick: () => o((k) => !k),
                      className: `px-2.5 py-2 rounded-xl flex items-center gap-1.5 text-xs font-medium transition ${l ? "bg-white/18 text-white" : "text-zinc-300 hover:bg-white/10 hover:text-zinc-100"}`,
                      children: [
                        l
                          ? a.jsx(jd, {
                              className: "w-4 h-4 text-emerald-400 shrink-0",
                            })
                          : a.jsx(C0, {
                              className: "w-4 h-4 text-zinc-400 shrink-0",
                            }),
                        a.jsx("span", {
                          children: l ? "Mic On" : "No microphone",
                        }),
                      ],
                    }),
                    a.jsxs("button", {
                      onClick: () => u((k) => !k),
                      className: `px-2.5 py-2 rounded-xl flex items-center gap-1.5 text-xs font-medium transition ${i ? "bg-white/18 text-white" : "text-zinc-300 hover:bg-white/10 hover:text-zinc-100"}`,
                      children: [
                        i
                          ? a.jsx(V0, {
                              className: "w-4 h-4 text-emerald-400 shrink-0",
                            })
                          : a.jsx(H0, {
                              className: "w-4 h-4 text-zinc-400 shrink-0",
                            }),
                        a.jsx("span", {
                          children: i ? "Audio On" : "No system audio",
                        }),
                      ],
                    }),
                  ],
                }),
                a.jsx("div", { className: "h-8 w-px bg-white/15 shrink-0" }),
                a.jsxs("div", {
                  className: "flex items-center gap-1.5 app-no-drag shrink-0",
                  children: [
                    a.jsxs("button", {
                      onClick: () => p((k) => !k),
                      className:
                        "p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 flex items-center gap-0.5 transition shrink-0",
                      title: "录制设置",
                      children: [
                        a.jsx(F0, { className: "w-4 h-4 shrink-0" }),
                        a.jsx(x0, { className: "w-3 h-3 shrink-0" }),
                      ],
                    }),
                    a.jsxs("button", {
                      onClick: J,
                      className:
                        "h-9 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 transition",
                      children: [
                        a.jsx("span", {
                          className:
                            "w-2.5 h-2.5 rounded-full bg-white shrink-0",
                        }),
                        a.jsx("span", { children: "Record" }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        });
  },
  Z0 = () => {
    const e = N.useMemo(() => {
        const s = window.location.hash || "",
          d = s.indexOf("?"),
          m = window.innerWidth || 1470,
          g = window.innerHeight || 956;
        if (d !== -1) {
          const w = new URLSearchParams(s.slice(d + 1)),
            x = Number(w.get("w")) || 800,
            F = Number(w.get("h")) || 600;
          return {
            x: Math.round((m - x) / 2),
            y: Math.round((g - F) / 2),
            w: x,
            h: F,
          };
        }
        const h = Math.round(m * 0.56),
          v = Math.round(g * 0.58);
        return {
          x: Math.round((m - h) / 2),
          y: Math.round((g - v) / 2),
          w: h,
          h: v,
        };
      }, []),
      [t, n] = N.useState(e),
      [r, l] = N.useState(null),
      o = N.useRef({ mouseX: 0, mouseY: 0, x: 0, y: 0, w: 0, h: 0 });
    N.useEffect(() => {
      ((document.body.style.background = "transparent"),
        (document.documentElement.style.background = "transparent"));
      const s = (d) => {
        var m;
        d.key === "Escape"
          ? (m = window.studioAPI) == null || m.confirmArea(null)
          : d.key === "Enter" && i();
      };
      return (
        window.addEventListener("keydown", s),
        () => window.removeEventListener("keydown", s)
      );
    });
    const i = () => {
        var g;
        const s = Math.max(1, window.innerWidth),
          d = Math.max(1, window.innerHeight),
          m = {
            x: Number((t.x / s).toFixed(4)),
            y: Number((t.y / d).toFixed(4)),
            w: Number((t.w / s).toFixed(4)),
            h: Number((t.h / d).toFixed(4)),
            pxW: Math.round(t.w),
            pxH: Math.round(t.h),
          };
        (g = window.studioAPI) == null || g.confirmArea(m);
      },
      u = () => {
        var s;
        (s = window.studioAPI) == null || s.confirmArea(null);
      };
    return (
      N.useEffect(() => {
        if (!r) return;
        const s = (m) => {
            const g = m.clientX - o.current.mouseX,
              h = m.clientY - o.current.mouseY,
              v = window.innerWidth,
              w = window.innerHeight;
            if (r === "draw") {
              const x = Math.min(o.current.mouseX, m.clientX),
                F = Math.min(o.current.mouseY, m.clientY),
                f = Math.max(120, Math.abs(m.clientX - o.current.mouseX)),
                c = Math.max(90, Math.abs(m.clientY - o.current.mouseY));
              n({ x, y: F, w: f, h: c });
            } else if (r === "move") {
              const x = Math.max(0, Math.min(v - o.current.w, o.current.x + g)),
                F = Math.max(0, Math.min(w - o.current.h, o.current.y + h));
              n((f) => ({ ...f, x, y: F }));
            } else if (r === "se") {
              const x = Math.max(
                  140,
                  Math.min(v - o.current.x, o.current.w + g),
                ),
                F = Math.max(100, Math.min(w - o.current.y, o.current.h + h));
              n((f) => ({ ...f, w: x, h: F }));
            } else if (r === "nw") {
              const x = Math.max(
                  0,
                  Math.min(o.current.x + o.current.w - 140, o.current.x + g),
                ),
                F = Math.max(
                  0,
                  Math.min(o.current.y + o.current.h - 100, o.current.y + h),
                ),
                f = o.current.w - (x - o.current.x),
                c = o.current.h - (F - o.current.y);
              n({ x, y: F, w: f, h: c });
            } else if (r === "ne") {
              const x = Math.max(
                  0,
                  Math.min(o.current.y + o.current.h - 100, o.current.y + h),
                ),
                F = Math.max(140, Math.min(v - o.current.x, o.current.w + g)),
                f = o.current.h - (x - o.current.y);
              n((c) => ({ ...c, y: x, w: F, h: f }));
            } else if (r === "sw") {
              const x = Math.max(
                  0,
                  Math.min(o.current.x + o.current.w - 140, o.current.x + g),
                ),
                F = o.current.w - (x - o.current.x),
                f = Math.max(100, Math.min(w - o.current.y, o.current.h + h));
              n((c) => ({ ...c, x, w: F, h: f }));
            }
          },
          d = () => l(null);
        return (
          window.addEventListener("mousemove", s),
          window.addEventListener("mouseup", d),
          () => {
            (window.removeEventListener("mousemove", s),
              window.removeEventListener("mouseup", d));
          }
        );
      }, [r]),
      a.jsxs("div", {
        onMouseDown: (s) => {
          s.target.dataset.handle ||
            ((o.current = {
              mouseX: s.clientX,
              mouseY: s.clientY,
              x: s.clientX,
              y: s.clientY,
              w: 0,
              h: 0,
            }),
            l("draw"));
        },
        className: "fixed inset-0 cursor-crosshair select-none overflow-hidden",
        children: [
          a.jsx("div", {
            className:
              "fixed top-6 left-1/2 -translate-x-1/2 z-30 bg-[#1e1e22]/90 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-full text-xs text-zinc-100 shadow-2xl pointer-events-none flex items-center gap-2",
            children: a.jsx("span", {
              children:
                "拖拽画面任意位置重新拉框 · 拖动四角调整大小 · 按 Enter 确认选区",
            }),
          }),
          a.jsxs("div", {
            "data-handle": "move",
            onMouseDown: (s) => {
              (s.stopPropagation(),
                (o.current = { mouseX: s.clientX, mouseY: s.clientY, ...t }),
                l("move"));
            },
            style: {
              left: t.x,
              top: t.y,
              width: t.w,
              height: t.h,
              boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.56)",
            },
            className:
              "absolute border-2 border-dashed border-white rounded-xl cursor-move flex items-center justify-center",
            children: [
              a.jsxs("div", {
                "data-handle": "true",
                onMouseDown: (s) => s.stopPropagation(),
                className:
                  "bg-[#252529]/95 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-2.5 shadow-2xl flex items-center gap-3 cursor-default",
                children: [
                  a.jsxs("div", {
                    className:
                      "flex items-center gap-1.5 text-xs font-mono text-white",
                    children: [
                      a.jsx(P0, { className: "w-3.5 h-3.5 text-indigo-400" }),
                      a.jsxs("span", {
                        children: [
                          Math.round(t.w),
                          " × ",
                          Math.round(t.h),
                          " px",
                        ],
                      }),
                    ],
                  }),
                  a.jsx("div", { className: "h-4 w-px bg-white/15" }),
                  a.jsx("div", {
                    className: "flex items-center gap-1 text-[11px]",
                    children: [
                      { label: "16:9", r: 16 / 9 },
                      { label: "9:16", r: 9 / 16 },
                      { label: "1:1", r: 1 },
                    ].map((s) =>
                      a.jsx(
                        "button",
                        {
                          onClick: () => {
                            const d = Math.round(t.w / s.r);
                            n((m) => ({
                              ...m,
                              h: Math.min(window.innerHeight - 40, d),
                            }));
                          },
                          className:
                            "px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-zinc-200 transition",
                          children: s.label,
                        },
                        s.label,
                      ),
                    ),
                  }),
                  a.jsx("div", { className: "h-4 w-px bg-white/15" }),
                  a.jsxs("button", {
                    onClick: i,
                    className:
                      "px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 shadow transition",
                    children: [
                      a.jsx(kd, { className: "w-3.5 h-3.5" }),
                      "确认区域",
                    ],
                  }),
                  a.jsx("button", {
                    onClick: u,
                    className:
                      "p-1 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-300 transition",
                    title: "取消 (Esc)",
                    children: a.jsx(Ds, { className: "w-3.5 h-3.5" }),
                  }),
                ],
              }),
              ["nw", "ne", "sw", "se"].map((s) => {
                const d =
                  s === "nw"
                    ? "-top-2 -left-2 cursor-nwse-resize"
                    : s === "ne"
                      ? "-top-2 -right-2 cursor-nesw-resize"
                      : s === "sw"
                        ? "-bottom-2 -left-2 cursor-nesw-resize"
                        : "-bottom-2 -right-2 cursor-nwse-resize";
                return a.jsx(
                  "div",
                  {
                    "data-handle": s,
                    onMouseDown: (m) => {
                      (m.stopPropagation(),
                        (o.current = {
                          mouseX: m.clientX,
                          mouseY: m.clientY,
                          ...t,
                        }),
                        l(s));
                    },
                    className: `absolute w-4 h-4 rounded-full bg-white border-2 border-indigo-600 shadow ${d}`,
                  },
                  s,
                );
              }),
            ],
          }),
        ],
      })
    );
  },
  J0 = () => {
    N.useEffect(() => {
      ((document.body.style.background = "transparent"),
        (document.documentElement.style.background = "transparent"));
    }, []);
    const e = N.useMemo(() => {
      const t = window.location.hash || "",
        n = t.indexOf("?"),
        r = n !== -1 ? new URLSearchParams(t.slice(n + 1)) : null,
        l = Number((r == null ? void 0 : r.get("x")) ?? 0.15),
        o = Number((r == null ? void 0 : r.get("y")) ?? 0.15),
        i = Number((r == null ? void 0 : r.get("w")) ?? 0.7),
        u = Number((r == null ? void 0 : r.get("h")) ?? 0.7);
      return {
        left: `${(l * 100).toFixed(2)}%`,
        top: `${(o * 100).toFixed(2)}%`,
        width: `${(i * 100).toFixed(2)}%`,
        height: `${(u * 100).toFixed(2)}%`,
      };
    }, []);
    return a.jsx("div", {
      className:
        "fixed inset-0 pointer-events-none overflow-hidden select-none",
      children: a.jsx("div", {
        style: {
          left: e.left,
          top: e.top,
          width: e.width,
          height: e.height,
          boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.52)",
        },
        className: "absolute rounded-lg border border-dashed border-white/65",
      }),
    });
  },
  q0 = {
    wallpaperId: "sequoia-twilight",
    customColor: "#1e1b4b",
    padding: 68,
    borderRadius: 20,
    shadowIntensity: 78,
    insetBorder: !0,
    macosHeader: !0,
    aspectRatio: "16:9",
    springPreset: "smooth",
    playbackSpeed: 1,
    cursorScale: 1.4,
    showClickRipple: !0,
    smoothCursorMove: !0,
    motionBlur: !0,
    webcamEnabled: !1,
    webcamCorner: "bottom-right",
    webcamShape: "circle",
    webcamSize: 210,
    webcamShrinkOnZoom: !0,
  };
function em() {
  const [e, t] = N.useState(() => window.location.hash || "#studio");
  return (
    N.useEffect(() => {
      const n = () => t(window.location.hash || "#studio");
      return (
        window.addEventListener("hashchange", n),
        () => window.removeEventListener("hashchange", n)
      );
    }, []),
    e.startsWith("#hud")
      ? a.jsx(G0, {})
      : e.startsWith("#area")
        ? a.jsx(Z0, {})
        : e.startsWith("#mask")
          ? a.jsx(J0, {})
          : a.jsx(tm, {})
  );
}
function tm() {
  var $s, Us, Vs, Hs;
  const e = N.useMemo(() => ru(), []),
    [t, n] = N.useState(q0),
    [r, l] = N.useState(!0),
    [o, i] = N.useState(null),
    [u, s] = N.useState(null),
    d = N.useRef(null);
  d.current = u;
  const [m, g] = N.useState(e.duration),
    [h, v] = N.useState(0),
    [w, x] = N.useState(0),
    [F, f] = N.useState(e.duration),
    [c, p] = N.useState(!0),
    [y, S] = N.useState(() => [
      { id: "clip-initial", startTime: 0, endTime: e.duration, speed: 1 },
    ]),
    [_, T] = N.useState(null),
    [j, U] = N.useState(e.mouseEvents),
    [b, A] = N.useState(e.zoomSegments),
    [J, X] = N.useState(
      (($s = e.zoomSegments[0]) == null ? void 0 : $s.id) || null,
    ),
    [ce, He] = N.useState(!1),
    [P, B] = N.useState([]),
    [E, D] = N.useState(!1),
    [I, k] = N.useState(null),
    [L, te] = N.useState(!1),
    [re, We] = N.useState(!1),
    [xe, Fe] = N.useState(0),
    [yo, Jr] = N.useState(0),
    [ne, Ce] = N.useState(!1),
    [we, le] = N.useState(0),
    [ye, q] = N.useState(
      "已加载交互演示工程 — 可直接播放体验弹簧缩放，或点击左上角「新录制」捕获真实屏幕与全局鼠标点击",
    ),
    Ge = N.useRef(null),
    G = N.useRef(null),
    rt = N.useRef(null),
    At = N.useRef(null),
    $t = N.useRef(null),
    En = N.useRef([]),
    Pn = N.useRef([]),
    dn = N.useRef(0),
    Pt = N.useRef(ou()),
    zn = N.useRef(null),
    sr = N.useRef(0);
  sr.current = h;
  const qr = N.useCallback((M) => {
      n((z) => ({ ...z, ...M }));
    }, []),
    ar = N.useCallback(async () => {
      if (At.current) {
        (At.current.getTracks().forEach((M) => M.stop()),
          (At.current = null),
          rt.current && (rt.current.srcObject = null),
          qr({ webcamEnabled: !1 }));
        return;
      }
      try {
        const M = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
          audio: !1,
        });
        ((At.current = M),
          rt.current && ((rt.current.srcObject = M), await rt.current.play()),
          qr({ webcamEnabled: !0 }));
      } catch (M) {
        q(
          `摄像头开启失败: ${(M == null ? void 0 : M.message) || "请检查权限"}`,
        );
      }
    }, [qr]);
  (N.useEffect(() => {
    var z;
    return (z = window.studioAPI) != null && z.onMouseEvent
      ? window.studioAPI.onMouseEvent(($) => {
          $.type === "down" && Jr((H) => H + 1);
        })
      : void 0;
  }, []),
    N.useEffect(() => {
      if (!re) {
        Fe(0);
        return;
      }
      const M = window.setInterval(() => {
        Fe((z) => z + 1);
      }, 1e3);
      return () => clearInterval(M);
    }, [re]));
  const vo = N.useCallback(() => {
      const M = Number(sr.current.toFixed(2)),
        z = y.find((V) => M > V.startTime + 0.25 && M < V.endTime - 0.25);
      if (!z) {
        q(
          "请先将红色播放指针移动到片段中间位置（距离边缘大于 0.25 秒）再执行切分",
        );
        return;
      }
      const $ = { ...z, endTime: M },
        H = {
          id: `clip-${Date.now()}`,
          startTime: M,
          endTime: z.endTime,
          speed: z.speed,
          deleted: z.deleted,
        };
      (S((V) =>
        V.flatMap((Y) => (Y.id === z.id ? [$, H] : [Y])).sort(
          (Y, O) => Y.startTime - O.startTime,
        ),
      ),
        X(null),
        T(H.id),
        q(
          `已在 ${M.toFixed(2)}s 处切分视频！现在可在下方工具栏为切出的片段单独设置 0.5x~4x 倍速或跳过该段`,
        ));
    }, [y]),
    Pd = N.useCallback((M, z) => {
      S(($) => $.map((H) => (H.id === M ? { ...H, ...z } : H)));
    }, []),
    zd = N.useCallback((M) => {
      S((z) => z.map(($) => ($.id === M ? { ...$, deleted: !$.deleted } : $)));
    }, []),
    Td = N.useCallback(() => {
      (S([
        { id: `clip-reset-${Date.now()}`, startTime: 0, endTime: m, speed: 1 },
      ]),
        T(null),
        q("已合并还原所有切分片段"));
    }, [m]);
  (N.useEffect(() => {
    const M = (z) => {
      var $;
      ["INPUT", "TEXTAREA"].includes(
        ($ = z.target) == null ? void 0 : $.tagName,
      ) ||
        (z.code === "Space"
          ? (z.preventDefault(), p((H) => !H))
          : z.code === "KeyS" && !z.metaKey && !z.ctrlKey
            ? (z.preventDefault(), vo())
            : (z.code === "Backspace" || z.code === "Delete") &&
              J &&
              (A((H) => H.filter((V) => V.id !== J)), X(null)));
    };
    return (
      window.addEventListener("keydown", M),
      () => window.removeEventListener("keydown", M)
    );
  }, [J, vo]),
    N.useEffect(() => {
      let M = 0,
        z = performance.now();
      const $ = (H) => {
        const V = Math.min(0.05, (H - z) / 1e3);
        z = H;
        let Y = sr.current;
        if (c && !re && !ne) {
          const pt = y.find((Oe) => Y >= Oe.startTime && Y < Oe.endTime);
          if (pt && pt.deleted) {
            const Oe = y.find(
              (St) => St.startTime >= pt.endTime && !St.deleted,
            );
            ((Y = Oe ? Oe.startTime : w),
              !r && G.current && (G.current.currentTime = Y));
          } else {
            const Oe = (pt ? pt.speed : 1) * t.playbackSpeed,
              St = Math.max(0.25, Math.min(8, Oe));
            !r && G.current
              ? ((G.current.playbackRate = St),
                (Y = G.current.currentTime),
                (Y >= F || G.current.ended) &&
                  ((G.current.currentTime = w),
                  (Y = w),
                  G.current.play().catch(() => {})))
              : ((Y += V * St), Y >= F && (Y = w));
          }
          ((sr.current = Y), v(Y));
        }
        const O = b.find((pt) => Y >= pt.startTime && Y <= pt.endTime) || null,
          Z = Ui(j, Y),
          ke = O ? O.scale : 1,
          me = O ? (O.mode === "follow-cursor" ? Z.x : O.targetX) : 0.5,
          lt = O ? (O.mode === "follow-cursor" ? Z.y : O.targetY) : 0.5,
          { stiffness: ae, damping: De } = $i[t.springPreset],
          he = Pt.current,
          ot = _n(he.scale, he.scaleVel, ke, ae, De, V),
          Ut = _n(he.focusX, he.focusXVel, me, ae, De, V),
          kt = _n(he.focusY, he.focusYVel, lt, ae, De, V),
          ft = _n(he.cursorX, he.cursorXVel, Z.x, 380, 34, V),
          Me = _n(he.cursorY, he.cursorYVel, Z.y, 380, 34, V),
          Tn = O && t.webcamShrinkOnZoom ? 0.76 : 1,
          Ws = _n(he.webcamScale, he.webcamScaleVel, Tn, ae, De, V);
        Pt.current = {
          scale: ot.value,
          scaleVel: ot.velocity,
          focusX: Ut.value,
          focusXVel: Ut.velocity,
          focusY: kt.value,
          focusYVel: kt.velocity,
          cursorX: ft.value,
          cursorXVel: ft.velocity,
          cursorY: Me.value,
          cursorYVel: Me.velocity,
          webcamScale: Ws.value,
          webcamScaleVel: Ws.velocity,
        };
        const Vt = Ge.current;
        if (Vt) {
          const pt = Vt.getContext("2d");
          if (pt) {
            const Oe = G.current,
              St = B0(
                t.aspectRatio,
                (Oe == null ? void 0 : Oe.videoWidth) || 1920,
                (Oe == null ? void 0 : Oe.videoHeight) || 1080,
              );
            ((Vt.width !== St.width || Vt.height !== St.height) &&
              ((Vt.width = St.width), (Vt.height = St.height)),
              (zn.current = X0({
                ctx: pt,
                canvasW: Vt.width,
                canvasH: Vt.height,
                videoEl: Oe,
                webcamEl: rt.current,
                isDemoMode: r,
                timeSec: Y,
                config: t,
                springState: Pt.current,
                mouseEvents: j,
                areaCrop: u,
              })));
          }
        }
        M = requestAnimationFrame($);
      };
      return ((M = requestAnimationFrame($)), () => cancelAnimationFrame(M));
    }, [c, re, ne, r, w, F, t, y, b, j, u]));
  const el = N.useCallback(
      (M) => {
        const z = Math.max(0, Math.min(m, M));
        ((sr.current = z),
          v(z),
          !r && G.current && (G.current.currentTime = z));
      },
      [m, r],
    ),
    bd = N.useCallback(() => {
      p((M) => {
        const z = !M;
        return (
          !r &&
            G.current &&
            (z ? G.current.play().catch(() => {}) : G.current.pause()),
          z
        );
      });
    }, [r]),
    Os = N.useCallback(async () => {
      var M, z;
      if ((M = window.studioAPI) != null && M.openHud) {
        await window.studioAPI.openHud(!0);
        return;
      }
      if (
        (He(!0), D(!0), k(null), (z = window.studioAPI) != null && z.getSources)
      ) {
        const $ = await window.studioAPI.getSources();
        (D(!1), Array.isArray($) ? B($) : (B([]), k($.error)));
      } else (D(!1), B([]));
    }, []),
    fn = N.useCallback(
      async (M, z) => {
        var Y;
        (He(!1),
          p(!1),
          Jr(0),
          s(z || null),
          (d.current = z || null),
          (En.current = []),
          (Pn.current = []),
          (dn.current = performance.now()),
          (Y = window.studioAPI) != null && Y.startMouseTracker
            ? await window.studioAPI.startMouseTracker()
            : fetch("../api/tracker/start", { method: "POST" }).catch(
                () => {},
              ));
        const $ = (O) => {
          Pn.current.push({
            t: performance.now() - dn.current,
            x: Math.max(
              0,
              Math.min(1, O.clientX / Math.max(1, window.innerWidth)),
            ),
            y: Math.max(
              0,
              Math.min(1, O.clientY / Math.max(1, window.innerHeight)),
            ),
            type:
              O.type === "mousedown"
                ? "down"
                : O.type === "mouseup"
                  ? "up"
                  : "move",
            button: O.button,
          });
        };
        (window.addEventListener("mousemove", $),
          window.addEventListener("mousedown", $));
        const H = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
            ? "video/webm;codecs=vp9"
            : "video/webm",
          V = new MediaRecorder(M, { mimeType: H, videoBitsPerSecond: 12e6 });
        ((V.ondataavailable = (O) => {
          O.data && O.data.size > 0 && En.current.push(O.data);
        }),
          (V.onstop = async () => {
            var Ut, kt, ft;
            (window.removeEventListener("mousemove", $),
              window.removeEventListener("mousedown", $),
              M.getTracks().forEach((Me) => Me.stop()),
              (Ut = window.studioAPI) != null &&
                Ut.clearMask &&
                (await window.studioAPI.clearMask()));
            const O = Math.max(1.5, (performance.now() - dn.current) / 1e3);
            let Z = Pn.current;
            if ((kt = window.studioAPI) != null && kt.stopMouseTracker) {
              const Me = await window.studioAPI.stopMouseTracker();
              Me.ok && Me.events && Me.events.length > 0 && (Z = Me.events);
            } else
              try {
                const Me = await fetch("../api/tracker/stop", {
                  method: "POST",
                });
                if (Me.ok) {
                  const Tn = await Me.json();
                  Tn.ok && Tn.events && Tn.events.length > 0 && (Z = Tn.events);
                }
              } catch {}
            const ke = d.current;
            ke &&
              ke.w > 0.05 &&
              ke.h > 0.05 &&
              (Z = Z.map((Me) => ({
                ...Me,
                x: Math.max(0, Math.min(1, (Me.x - ke.x) / ke.w)),
                y: Math.max(0, Math.min(1, (Me.y - ke.y) / ke.h)),
              })));
            const me = new Blob(En.current, { type: H }),
              lt = URL.createObjectURL(me);
            (o && URL.revokeObjectURL(o), i(lt), l(!1), We(!1));
            const ae = Number(O.toFixed(2));
            (g(ae),
              x(0),
              f(ae),
              v(0),
              S([
                {
                  id: `clip-${Date.now()}`,
                  startTime: 0,
                  endTime: ae,
                  speed: 1,
                },
              ]),
              T(null),
              U(Z));
            const De = lu(Z, O);
            (A(De), X(((ft = De[0]) == null ? void 0 : ft.id) || null));
            const he = Z.filter((Me) => Me.type === "down").length,
              ot = ke ? ` · 区域裁剪 ${ke.pxW}×${ke.pxH}` : "";
            (q(
              `录制完成 (${O.toFixed(1)}s${ot}) — 原生追踪到 ${he} 次鼠标点击，已自动生成 ${De.length} 个丝滑缩放镜头`,
            ),
              setTimeout(() => {
                G.current &&
                  ((G.current.src = lt),
                  (G.current.currentTime = 0),
                  G.current.play().catch(() => {}),
                  p(!0));
              }, 120));
          }),
          ($t.current = V),
          V.start(200),
          We(!0),
          q(
            "正在录制屏幕与全局鼠标轨迹... 在任意软件中点击鼠标都会自动生成缩放关键帧",
          ));
      },
      [o],
    ),
    _d = N.useCallback(
      async (M) => {
        try {
          const z = await navigator.mediaDevices.getUserMedia({
            audio: !1,
            video: {
              mandatory: {
                chromeMediaSource: "desktop",
                chromeMediaSourceId: M.id,
                maxWidth: 3840,
                maxHeight: 2160,
                maxFrameRate: 60,
              },
            },
          });
          if (L)
            try {
              (
                await navigator.mediaDevices.getUserMedia({
                  audio: !0,
                  video: !1,
                })
              )
                .getAudioTracks()
                .forEach((H) => z.addTrack(H));
            } catch {}
          await fn(z);
        } catch (z) {
          k(
            (z == null ? void 0 : z.message) ||
              "无法启动指定源录制，请尝试调用系统屏幕选择器",
          );
        }
      },
      [L, fn],
    ),
    As = N.useCallback(async () => {
      try {
        const M = await navigator.mediaDevices.getDisplayMedia({
          video: { frameRate: 60 },
          audio: L,
        });
        await fn(M);
      } catch (M) {
        k((M == null ? void 0 : M.message) || "已取消屏幕录制选择");
      }
    }, [L, fn]),
    xo = N.useCallback(() => {
      var M, z;
      ((z = (M = window.studioAPI) == null ? void 0 : M.clearMask) == null ||
        z.call(M),
        $t.current && $t.current.state !== "inactive" && $t.current.stop());
    }, []);
  N.useEffect(() => {
    var $, H;
    if (!(($ = window.studioAPI) != null && $.onCommandStartRecord)) return;
    const M = window.studioAPI.onCommandStartRecord(async (V) => {
        var Y;
        try {
          (te(V.micEnabled),
            V.cameraEnabled && !At.current
              ? await ar()
              : !V.cameraEnabled && At.current && (await ar()));
          let O = V.sourceId;
          if (!O && (Y = window.studioAPI) != null && Y.getSources) {
            const Z = await window.studioAPI.getSources();
            Array.isArray(Z) &&
              Z.length > 0 &&
              (O = (Z.find((me) => me.isScreen) || Z[0]).id);
          }
          if (O) {
            const Z = await navigator.mediaDevices.getUserMedia({
              audio: !1,
              video: {
                mandatory: {
                  chromeMediaSource: "desktop",
                  chromeMediaSourceId: O,
                  maxWidth: 3840,
                  maxHeight: 2160,
                  maxFrameRate: 60,
                },
              },
            });
            if (V.micEnabled)
              try {
                (
                  await navigator.mediaDevices.getUserMedia({
                    audio: !0,
                    video: !1,
                  })
                )
                  .getAudioTracks()
                  .forEach((me) => Z.addTrack(me));
              } catch {}
            await fn(Z, V.areaCrop || null);
          } else {
            const Z = await navigator.mediaDevices.getDisplayMedia({
              video: { frameRate: 60 },
              audio: V.micEnabled,
            });
            await fn(Z, V.areaCrop || null);
          }
        } catch (O) {
          q(
            `从悬浮工具栏启动录制失败: ${(O == null ? void 0 : O.message) || "请检查录制权限"}`,
          );
        }
      }),
      z =
        (H = window.studioAPI) != null && H.onCommandStopRecord
          ? window.studioAPI.onCommandStopRecord(() => {
              xo();
            })
          : () => {};
    return () => {
      (M(), z());
    };
  }, [xo, ar, fn]);
  const Rd = N.useCallback(
      (M) => {
        var H;
        const z = (H = M.target.files) == null ? void 0 : H[0];
        if (!z) return;
        const $ = URL.createObjectURL(z);
        (o && URL.revokeObjectURL(o),
          i($),
          l(!1),
          U([]),
          A([]),
          X(null),
          G.current &&
            ((G.current.src = $),
            (G.current.onloadedmetadata = () => {
              var O, Z;
              const V = Number(
                Math.max(
                  1,
                  ((O = G.current) == null ? void 0 : O.duration) || 10,
                ).toFixed(2),
              );
              (g(V),
                x(0),
                f(V),
                v(0),
                S([
                  {
                    id: `clip-${Date.now()}`,
                    startTime: 0,
                    endTime: V,
                    speed: 1,
                  },
                ]),
                T(null));
              const Y = {
                id: `zoom-${Date.now()}`,
                startTime: Number((V * 0.2).toFixed(2)),
                endTime: Number(Math.min(V, V * 0.55).toFixed(2)),
                scale: 1.9,
                targetX: 0.5,
                targetY: 0.5,
                mode: "manual",
              };
              (A([Y]),
                X(Y.id),
                (Z = G.current) == null || Z.play().catch(() => {}),
                p(!0),
                q(
                  `已导入视频「${z.name}」— 点击画面任意位置可设置缩放焦点，或在下方时间轴添加缩放块`,
                ));
            })));
      },
      [o],
    ),
    Ld = N.useCallback(
      (M) => {
        const z = Ge.current,
          $ = zn.current;
        if (!z || !$) return;
        const H = z.getBoundingClientRect(),
          V = ((M.clientX - H.left) / Math.max(1, H.width)) * z.width,
          Y = ((M.clientY - H.top) / Math.max(1, H.height)) * z.height,
          O = Math.max(
            0.05,
            Math.min(0.95, (V - $.frameX) / Math.max(1, $.frameW)),
          ),
          Z = Math.max(
            0.05,
            Math.min(0.95, (Y - $.frameY) / Math.max(1, $.frameH)),
          ),
          ke =
            b.find((me) => h >= me.startTime && h <= me.endTime) ||
            b.find((me) => me.id === J);
        if (ke)
          (A((me) =>
            me.map((lt) =>
              lt.id === ke.id
                ? {
                    ...lt,
                    mode: "manual",
                    targetX: Number(O.toFixed(3)),
                    targetY: Number(Z.toFixed(3)),
                  }
                : lt,
            ),
          ),
            X(ke.id),
            q(
              `已将缩放焦点更新至 (${Math.round(O * 100)}%, ${Math.round(Z * 100)}%)`,
            ));
        else {
          const me = Math.max(0, Number((h - 0.2).toFixed(2))),
            lt = Math.min(m, Number((me + 2.2).toFixed(2))),
            ae = {
              id: `zoom-${Date.now()}`,
              startTime: me,
              endTime: Math.max(me + 0.6, lt),
              scale: 2,
              targetX: Number(O.toFixed(3)),
              targetY: Number(Z.toFixed(3)),
              mode: "manual",
            };
          (A((De) => [...De, ae].sort((he, ot) => he.startTime - ot.startTime)),
            X(ae.id),
            q(
              `已在 ${me.toFixed(1)}s 处新建缩放块，焦点位于 (${Math.round(O * 100)}%, ${Math.round(Z * 100)}%)`,
            ));
        }
      },
      [h, m, J, b],
    ),
    Id = N.useCallback(() => {
      const M = Math.max(0, Number(h.toFixed(2))),
        z = Math.min(m, Number((M + 2).toFixed(2))),
        $ = Ui(j, h),
        H = {
          id: `zoom-${Date.now()}`,
          startTime: M,
          endTime: Math.max(M + 0.6, z),
          scale: 2,
          targetX: Number($.x.toFixed(3)),
          targetY: Number($.y.toFixed(3)),
          mode: j.length > 0 ? "follow-cursor" : "manual",
        };
      (A((V) => [...V, H].sort((Y, O) => Y.startTime - O.startTime)), X(H.id));
    }, [h, m, j]),
    Fd = N.useCallback((M, z) => {
      A(($) => $.map((H) => (H.id === M ? { ...H, ...z } : H)));
    }, []),
    Dd = N.useCallback(
      (M) => {
        (A((z) => z.filter(($) => $.id !== M)), J === M && X(null));
      },
      [J],
    ),
    Od = N.useCallback(() => {
      var z;
      if (j.length === 0) {
        q("当前视频无系统鼠标轨迹数据，可点击预览画面直接手动添加缩放焦点");
        return;
      }
      const M = lu(j, m);
      (A(M),
        X(((z = M[0]) == null ? void 0 : z.id) || null),
        q(`已根据鼠标点击事件重新生成 ${M.length} 个自动缩放区间`));
    }, [j, m]),
    Ad = N.useCallback(() => {
      var z;
      const M = ru();
      (l(!0),
        g(M.duration),
        x(0),
        f(M.duration),
        v(0),
        S([{ id: "clip-demo", startTime: 0, endTime: M.duration, speed: 1 }]),
        T(null),
        U(M.mouseEvents),
        A(M.zoomSegments),
        X(((z = M.zoomSegments[0]) == null ? void 0 : z.id) || null),
        p(!0),
        q("已恢复内置交互演示工程"));
    }, []),
    $d = N.useCallback(async () => {
      const M = Ge.current;
      if (!M || ne) return;
      (Ce(!0), le(0), p(!1));
      const z = M.captureStream(60),
        $ = MediaRecorder.isTypeSupported("video/mp4;codecs=avc1"),
        H = $
          ? "video/mp4;codecs=avc1"
          : MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
            ? "video/webm;codecs=vp9"
            : "video/webm",
        V = $ ? "mp4" : "webm",
        Y = [],
        O = new MediaRecorder(z, { mimeType: H, videoBitsPerSecond: 16e6 });
      O.ondataavailable = (ae) => {
        ae.data && ae.data.size > 0 && Y.push(ae.data);
      };
      const Z = Math.max(0.5, F - w);
      (el(w),
        (Pt.current = ou()),
        await new Promise((ae) => setTimeout(ae, 120)),
        O.start(100),
        p(!0),
        !r &&
          G.current &&
          ((G.current.currentTime = w), G.current.play().catch(() => {})));
      const ke = performance.now(),
        me = (Z / t.playbackSpeed) * 1e3,
        lt = window.setInterval(async () => {
          const ae = performance.now() - ke,
            De = Math.min(99, Math.round((ae / me) * 100));
          (le(De), ae >= me && (clearInterval(lt), O.stop()));
        }, 80);
      O.onstop = async () => {
        var De;
        (Ce(!1), le(100));
        const ae = new Blob(Y, { type: H });
        if ((De = window.studioAPI) != null && De.saveVideo) {
          const he = await ae.arrayBuffer(),
            ot = await window.studioAPI.saveVideo(he, V);
          !ot.canceled && ot.filePath
            ? q(`视频已成功导出至: ${ot.filePath}`)
            : q("已取消导出保存");
        } else {
          try {
            const ot = await ae.arrayBuffer(),
              Ut = await fetch(`../api/export?ext=${V}`, {
                method: "POST",
                headers: { "Content-Type": "application/octet-stream" },
                body: ot,
              });
            if (Ut.ok) {
              const kt = await Ut.json();
              if (kt.downloadUrl) {
                const ft = document.createElement("a");
                ((ft.href = kt.downloadUrl),
                  (ft.download = kt.fileName || `ScreenStudio-Export.${V}`),
                  document.body.appendChild(ft),
                  ft.click(),
                  ft.remove(),
                  q(`视频已导出保存 (${kt.fileName})`));
                return;
              }
            }
          } catch {}
          const he = document.createElement("a");
          ((he.href = URL.createObjectURL(ae)),
            (he.download = `ScreenStudio-Export.${V}`),
            he.click(),
            q("视频已合成并开始下载"));
        }
      };
    }, [t.playbackSpeed, el, r, ne, F, w]);
  return a.jsxs("div", {
    className:
      "h-screen w-screen flex flex-col bg-[#0c0d10] text-zinc-100 overflow-hidden select-none",
    children: [
      a.jsx("video", {
        ref: G,
        className: "hidden",
        playsInline: !0,
        muted: !1,
      }),
      a.jsx("video", {
        ref: rt,
        className: "hidden",
        playsInline: !0,
        muted: !0,
      }),
      a.jsxs("header", {
        className: `h-13 bg-[#12141a] border-b border-[#222632] flex items-center justify-between ${(Us = window.studioAPI) != null && Us.isDesktopApp ? "pl-20" : "pl-4"} pr-4 py-2.5 app-drag-region shrink-0`,
        children: [
          a.jsxs("div", {
            className: "flex items-center gap-3 app-no-drag",
            children: [
              a.jsxs("div", {
                className: "flex items-center gap-2",
                children: [
                  a.jsx("div", {
                    className:
                      "w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow",
                    children: a.jsx(Fs, { className: "w-4 h-4 text-white" }),
                  }),
                  a.jsx("div", {
                    children: a.jsxs("div", {
                      className:
                        "text-xs font-bold tracking-tight text-white flex items-center gap-1.5",
                      children: [
                        "Screen Studio",
                        a.jsx("span", {
                          className:
                            "text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium",
                          children: "macOS Native Tracker",
                        }),
                      ],
                    }),
                  }),
                ],
              }),
              a.jsx("div", { className: "h-4 w-px bg-[#262b38] mx-1" }),
              re
                ? a.jsxs("button", {
                    onClick: xo,
                    className:
                      "flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold animate-pulse shadow-lg transition",
                    children: [
                      a.jsx(Md, { className: "w-3.5 h-3.5 fill-white" }),
                      "停止录制 (",
                      xe,
                      "s · 已捕获 ",
                      yo,
                      " 次点击)",
                    ],
                  })
                : a.jsx("div", {
                    className: "flex items-center gap-2",
                    children: a.jsxs("button", {
                      onClick:
                        (Vs = window.studioAPI) != null && Vs.isDesktopApp
                          ? Os
                          : As,
                      className:
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition",
                      children: [
                        a.jsx(Ed, { className: "w-3.5 h-3.5" }),
                        (Hs = window.studioAPI) != null && Hs.isDesktopApp
                          ? "桌面悬浮录制条 (Display / Window / Area / Device)"
                          : "在当前标签页直接录制 (连动原生鼠标追踪)",
                      ],
                    }),
                  }),
              a.jsxs("label", {
                className:
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1b1f2a] hover:bg-[#242937] border border-[#2c3242] text-xs font-medium text-zinc-200 cursor-pointer transition",
                children: [
                  a.jsx($0, { className: "w-3.5 h-3.5 text-indigo-400" }),
                  "导入视频",
                  a.jsx("input", {
                    type: "file",
                    accept: "video/*",
                    onChange: Rd,
                    className: "hidden",
                  }),
                ],
              }),
              !r &&
                a.jsx("button", {
                  onClick: Ad,
                  className:
                    "px-2.5 py-1.5 rounded-lg bg-[#181b24] hover:bg-[#212632] text-xs text-zinc-400 hover:text-zinc-200 transition",
                  children: "切回演示工程",
                }),
            ],
          }),
          ye &&
            a.jsxs("div", {
              className:
                "hidden xl:flex items-center gap-1.5 bg-[#171a22] border border-[#252a37] px-3 py-1 rounded-full text-[11px] text-zinc-300 max-w-md truncate",
              children: [
                a.jsx(w0, {
                  className: "w-3.5 h-3.5 text-emerald-400 shrink-0",
                }),
                a.jsx("span", { className: "truncate", children: ye }),
              ],
            }),
          a.jsx("div", {
            className: "flex items-center gap-2.5 app-no-drag",
            children: a.jsx("button", {
              onClick: $d,
              disabled: ne || re,
              className:
                "flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow transition",
              children: ne
                ? a.jsxs(a.Fragment, {
                    children: [
                      a.jsx(N0, { className: "w-3.5 h-3.5 animate-spin" }),
                      "正在渲染导出 (",
                      we,
                      "%)",
                    ],
                  })
                : a.jsxs(a.Fragment, {
                    children: [
                      a.jsx(S0, { className: "w-3.5 h-3.5" }),
                      "导出高清视频",
                    ],
                  }),
            }),
          }),
        ],
      }),
      a.jsxs("div", {
        className: "flex-1 flex min-h-0 overflow-hidden",
        children: [
          a.jsxs("main", {
            className:
              "flex-1 flex flex-col items-center justify-center p-6 bg-[#0b0d12] relative overflow-hidden",
            children: [
              a.jsx("div", {
                className:
                  "relative w-full h-full flex items-center justify-center",
                children: a.jsx("canvas", {
                  ref: Ge,
                  onClick: Ld,
                  title: "点击画面任意位置可直接设置或新建固定缩放焦点",
                  className:
                    "max-w-full max-h-full object-contain rounded-xl shadow-[0_25px_70px_rgba(0,0,0,0.75)] border border-white/10 cursor-crosshair",
                }),
              }),
              a.jsxs("div", {
                className:
                  "absolute bottom-3 left-4 flex items-center gap-3 bg-[#14171f]/90 backdrop-blur border border-[#262b3a] px-3 py-1.5 rounded-lg text-[11px] text-zinc-400 pointer-events-none",
                children: [
                  a.jsxs("span", {
                    className:
                      "flex items-center gap-1 text-indigo-300 font-medium",
                    children: [
                      a.jsx(Sd, { className: "w-3.5 h-3.5" }),
                      "画布点选对焦：点击预览画面任意位置即可将镜头聚焦到该处",
                    ],
                  }),
                  a.jsx("span", { children: "·" }),
                  a.jsxs("span", {
                    className: "flex items-center gap-1",
                    children: [
                      a.jsx(v0, { className: "w-3.5 h-3.5 text-emerald-400" }),
                      "弹簧状态：",
                      Math.abs(Pt.current.scale - 1) > 0.05
                        ? "特写推镜中"
                        : "全局画面",
                    ],
                  }),
                ],
              }),
            ],
          }),
          a.jsx(Q0, {
            config: t,
            hasWebcamStream: t.webcamEnabled,
            onChange: qr,
            onToggleWebcamDevice: ar,
          }),
        ],
      }),
      a.jsx(Y0, {
        duration: m,
        currentTime: h,
        trimStart: w,
        trimEnd: F,
        isPlaying: c,
        clipSegments: y,
        selectedClipId: _,
        zoomSegments: b,
        selectedSegmentId: J,
        mouseEvents: j,
        onSeek: el,
        onTogglePlay: bd,
        onTrimChange: (M, z) => {
          (x(M), f(z), (h < M || h > z) && el(M));
        },
        onSelectClip: T,
        onSplitClipAtPlayhead: vo,
        onUpdateClip: Pd,
        onDeleteOrRestoreClip: zd,
        onResetClips: Td,
        onSelectSegment: X,
        onAddSegment: Id,
        onUpdateSegment: Fd,
        onDeleteSegment: Dd,
        onRegenerateAutoZoom: Od,
      }),
      a.jsx(K0, {
        isOpen: ce,
        sources: P,
        loading: E,
        error: I,
        micEnabled: L,
        webcamEnabled: t.webcamEnabled,
        onRefresh: Os,
        onToggleMic: () => te((M) => !M),
        onToggleWebcam: ar,
        onSelectSourceAndRecord: _d,
        onBrowserFallbackRecord: As,
        onClose: () => He(!1),
      }),
    ],
  });
}
Xo.createRoot(document.getElementById("root")).render(
  a.jsx(N.StrictMode, { children: a.jsx(em, {}) }),
);
