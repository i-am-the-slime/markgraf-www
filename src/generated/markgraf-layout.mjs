// ../markgraf/output/Control.Apply/foreign.js
var arrayApply = function(fs) {
  return function(xs) {
    var l = fs.length;
    var k = xs.length;
    var result = new Array(l * k);
    var n = 0;
    for (var i = 0; i < l; i++) {
      var f = fs[i];
      for (var j = 0; j < k; j++) {
        result[n++] = f(xs[j]);
      }
    }
    return result;
  };
};

// ../markgraf/output/Control.Semigroupoid/index.js
var semigroupoidFn = {
  compose: function(f) {
    return function(g) {
      return function(x) {
        return f(g(x));
      };
    };
  }
};

// ../markgraf/output/Control.Category/index.js
var identity = function(dict) {
  return dict.identity;
};
var categoryFn = {
  identity: function(x) {
    return x;
  },
  Semigroupoid0: function() {
    return semigroupoidFn;
  }
};

// ../markgraf/output/Data.Boolean/index.js
var otherwise = true;

// ../markgraf/output/Data.Function/index.js
var flip = function(f) {
  return function(b) {
    return function(a) {
      return f(a)(b);
    };
  };
};
var $$const = function(a) {
  return function(v) {
    return a;
  };
};

// ../markgraf/output/Data.Functor/foreign.js
var arrayMap = function(f) {
  return function(arr) {
    var l = arr.length;
    var result = new Array(l);
    for (var i = 0; i < l; i++) {
      result[i] = f(arr[i]);
    }
    return result;
  };
};

// ../markgraf/output/Data.Unit/foreign.js
var unit = void 0;

// ../markgraf/output/Type.Proxy/index.js
var $$Proxy = /* @__PURE__ */ (function() {
  function $$Proxy2() {
  }
  ;
  $$Proxy2.value = new $$Proxy2();
  return $$Proxy2;
})();

// ../markgraf/output/Data.Functor/index.js
var map = function(dict) {
  return dict.map;
};
var mapFlipped = function(dictFunctor) {
  var map112 = map(dictFunctor);
  return function(fa) {
    return function(f) {
      return map112(f)(fa);
    };
  };
};
var $$void = function(dictFunctor) {
  return map(dictFunctor)($$const(unit));
};
var voidLeft = function(dictFunctor) {
  var map112 = map(dictFunctor);
  return function(f) {
    return function(x) {
      return map112($$const(x))(f);
    };
  };
};
var functorArray = {
  map: arrayMap
};

// ../markgraf/output/Control.Apply/index.js
var identity2 = /* @__PURE__ */ identity(categoryFn);
var applyArray = {
  apply: arrayApply,
  Functor0: function() {
    return functorArray;
  }
};
var apply = function(dict) {
  return dict.apply;
};
var applyFirst = function(dictApply) {
  var apply1 = apply(dictApply);
  var map31 = map(dictApply.Functor0());
  return function(a) {
    return function(b) {
      return apply1(map31($$const)(a))(b);
    };
  };
};
var applySecond = function(dictApply) {
  var apply1 = apply(dictApply);
  var map31 = map(dictApply.Functor0());
  return function(a) {
    return function(b) {
      return apply1(map31($$const(identity2))(a))(b);
    };
  };
};

// ../markgraf/output/Control.Applicative/index.js
var pure = function(dict) {
  return dict.pure;
};
var when = function(dictApplicative) {
  var pure14 = pure(dictApplicative);
  return function(v) {
    return function(v1) {
      if (v) {
        return v1;
      }
      ;
      if (!v) {
        return pure14(unit);
      }
      ;
      throw new Error("Failed pattern match at Control.Applicative (line 63, column 1 - line 63, column 63): " + [v.constructor.name, v1.constructor.name]);
    };
  };
};
var applicativeArray = {
  pure: function(x) {
    return [x];
  },
  Apply0: function() {
    return applyArray;
  }
};

// ../markgraf/output/Control.Bind/foreign.js
var arrayBind = typeof Array.prototype.flatMap === "function" ? function(arr) {
  return function(f) {
    return arr.flatMap(f);
  };
} : function(arr) {
  return function(f) {
    var result = [];
    var l = arr.length;
    for (var i = 0; i < l; i++) {
      var xs = f(arr[i]);
      var k = xs.length;
      for (var j = 0; j < k; j++) {
        result.push(xs[j]);
      }
    }
    return result;
  };
};

// ../markgraf/output/Control.Bind/index.js
var identity3 = /* @__PURE__ */ identity(categoryFn);
var discard = function(dict) {
  return dict.discard;
};
var bindArray = {
  bind: arrayBind,
  Apply0: function() {
    return applyArray;
  }
};
var bind = function(dict) {
  return dict.bind;
};
var bindFlipped = function(dictBind) {
  return flip(bind(dictBind));
};
var discardUnit = {
  discard: function(dictBind) {
    return bind(dictBind);
  }
};
var join = function(dictBind) {
  var bind110 = bind(dictBind);
  return function(m) {
    return bind110(m)(identity3);
  };
};

// ../markgraf/output/Data.Array/foreign.js
var rangeImpl = function(start, end) {
  var step2 = start > end ? -1 : 1;
  var result = new Array(step2 * (end - start) + 1);
  var i = start, n = 0;
  while (i !== end) {
    result[n++] = i;
    i += step2;
  }
  result[n] = i;
  return result;
};
var replicateFill = function(count, value) {
  if (count < 1) {
    return [];
  }
  var result = new Array(count);
  return result.fill(value);
};
var replicatePolyfill = function(count, value) {
  var result = [];
  var n = 0;
  for (var i = 0; i < count; i++) {
    result[n++] = value;
  }
  return result;
};
var replicateImpl = typeof Array.prototype.fill === "function" ? replicateFill : replicatePolyfill;
var fromFoldableImpl = /* @__PURE__ */ (function() {
  function Cons3(head5, tail3) {
    this.head = head5;
    this.tail = tail3;
  }
  var emptyList = {};
  function curryCons(head5) {
    return function(tail3) {
      return new Cons3(head5, tail3);
    };
  }
  function listToArray(list) {
    var result = [];
    var count = 0;
    var xs = list;
    while (xs !== emptyList) {
      result[count++] = xs.head;
      xs = xs.tail;
    }
    return result;
  }
  return function(foldr4, xs) {
    return listToArray(foldr4(curryCons)(emptyList)(xs));
  };
})();
var length = function(xs) {
  return xs.length;
};
var unconsImpl = function(empty8, next3, xs) {
  return xs.length === 0 ? empty8({}) : next3(xs[0])(xs.slice(1));
};
var indexImpl = function(just, nothing, xs, i) {
  return i < 0 || i >= xs.length ? nothing : just(xs[i]);
};
var findMapImpl = function(nothing, isJust2, f, xs) {
  for (var i = 0; i < xs.length; i++) {
    var result = f(xs[i]);
    if (isJust2(result)) return result;
  }
  return nothing;
};
var findIndexImpl = function(just, nothing, f, xs) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (f(xs[i])) return just(i);
  }
  return nothing;
};
var findLastIndexImpl = function(just, nothing, f, xs) {
  for (var i = xs.length - 1; i >= 0; i--) {
    if (f(xs[i])) return just(i);
  }
  return nothing;
};
var _insertAt = function(just, nothing, i, a, l) {
  if (i < 0 || i > l.length) return nothing;
  var l1 = l.slice();
  l1.splice(i, 0, a);
  return just(l1);
};
var _deleteAt = function(just, nothing, i, l) {
  if (i < 0 || i >= l.length) return nothing;
  var l1 = l.slice();
  l1.splice(i, 1);
  return just(l1);
};
var _updateAt = function(just, nothing, i, a, l) {
  if (i < 0 || i >= l.length) return nothing;
  var l1 = l.slice();
  l1[i] = a;
  return just(l1);
};
var reverse = function(l) {
  return l.slice().reverse();
};
var concat = function(xss) {
  if (xss.length <= 1e4) {
    return Array.prototype.concat.apply([], xss);
  }
  var result = [];
  for (var i = 0, l = xss.length; i < l; i++) {
    var xs = xss[i];
    for (var j = 0, m = xs.length; j < m; j++) {
      result.push(xs[j]);
    }
  }
  return result;
};
var filterImpl = function(f, xs) {
  return xs.filter(f);
};
var sortByImpl = /* @__PURE__ */ (function() {
  function mergeFromTo(compare23, fromOrdering, xs1, xs2, from2, to2) {
    var mid2;
    var i;
    var j;
    var k;
    var x;
    var y;
    var c;
    mid2 = from2 + (to2 - from2 >> 1);
    if (mid2 - from2 > 1) mergeFromTo(compare23, fromOrdering, xs2, xs1, from2, mid2);
    if (to2 - mid2 > 1) mergeFromTo(compare23, fromOrdering, xs2, xs1, mid2, to2);
    i = from2;
    j = mid2;
    k = from2;
    while (i < mid2 && j < to2) {
      x = xs2[i];
      y = xs2[j];
      c = fromOrdering(compare23(x)(y));
      if (c > 0) {
        xs1[k++] = y;
        ++j;
      } else {
        xs1[k++] = x;
        ++i;
      }
    }
    while (i < mid2) {
      xs1[k++] = xs2[i++];
    }
    while (j < to2) {
      xs1[k++] = xs2[j++];
    }
  }
  return function(compare23, fromOrdering, xs) {
    var out;
    if (xs.length < 2) return xs;
    out = xs.slice(0);
    mergeFromTo(compare23, fromOrdering, out, xs.slice(0), 0, xs.length);
    return out;
  };
})();
var sliceImpl = function(s, e, l) {
  return l.slice(s, e);
};
var zipWithImpl = function(f, xs, ys) {
  var l = xs.length < ys.length ? xs.length : ys.length;
  var result = new Array(l);
  for (var i = 0; i < l; i++) {
    result[i] = f(xs[i])(ys[i]);
  }
  return result;
};
var anyImpl = function(p, xs) {
  var len = xs.length;
  for (var i = 0; i < len; i++) {
    if (p(xs[i])) return true;
  }
  return false;
};
var allImpl = function(p, xs) {
  var len = xs.length;
  for (var i = 0; i < len; i++) {
    if (!p(xs[i])) return false;
  }
  return true;
};
var unsafeIndexImpl = function(xs, n) {
  return xs[n];
};

// ../markgraf/output/Data.Semigroup/foreign.js
var concatArray = function(xs) {
  return function(ys) {
    if (xs.length === 0) return ys;
    if (ys.length === 0) return xs;
    return xs.concat(ys);
  };
};

// ../markgraf/output/Data.Symbol/index.js
var reflectSymbol = function(dict) {
  return dict.reflectSymbol;
};

// ../markgraf/output/Record.Unsafe/foreign.js
var unsafeGet = function(label) {
  return function(rec) {
    return rec[label];
  };
};

// ../markgraf/output/Data.Semigroup/index.js
var semigroupArray = {
  append: concatArray
};
var append = function(dict) {
  return dict.append;
};

// ../markgraf/output/Control.Alt/index.js
var alt = function(dict) {
  return dict.alt;
};

// ../markgraf/output/Control.Lazy/index.js
var defer = function(dict) {
  return dict.defer;
};

// ../markgraf/output/Control.Monad/index.js
var ap = function(dictMonad) {
  var bind20 = bind(dictMonad.Bind1());
  var pure9 = pure(dictMonad.Applicative0());
  return function(f) {
    return function(a) {
      return bind20(f)(function(f$prime) {
        return bind20(a)(function(a$prime) {
          return pure9(f$prime(a$prime));
        });
      });
    };
  };
};

// ../markgraf/output/Data.Bounded/foreign.js
var topInt = 2147483647;
var bottomInt = -2147483648;
var topChar = String.fromCharCode(65535);
var bottomChar = String.fromCharCode(0);
var topNumber = Number.POSITIVE_INFINITY;
var bottomNumber = Number.NEGATIVE_INFINITY;

// ../markgraf/output/Data.Ord/foreign.js
var unsafeCompareImpl = function(lt) {
  return function(eq28) {
    return function(gt) {
      return function(x) {
        return function(y) {
          return x < y ? lt : x === y ? eq28 : gt;
        };
      };
    };
  };
};
var ordIntImpl = unsafeCompareImpl;
var ordNumberImpl = unsafeCompareImpl;
var ordStringImpl = unsafeCompareImpl;
var ordCharImpl = unsafeCompareImpl;

// ../markgraf/output/Data.Eq/foreign.js
var refEq = function(r1) {
  return function(r2) {
    return r1 === r2;
  };
};
var eqBooleanImpl = refEq;
var eqIntImpl = refEq;
var eqNumberImpl = refEq;
var eqCharImpl = refEq;
var eqStringImpl = refEq;
var eqArrayImpl = function(f) {
  return function(xs) {
    return function(ys) {
      if (xs.length !== ys.length) return false;
      for (var i = 0; i < xs.length; i++) {
        if (!f(xs[i])(ys[i])) return false;
      }
      return true;
    };
  };
};

// ../markgraf/output/Data.Eq/index.js
var eqString = {
  eq: eqStringImpl
};
var eqRowNil = {
  eqRecord: function(v) {
    return function(v1) {
      return function(v2) {
        return true;
      };
    };
  }
};
var eqRecord = function(dict) {
  return dict.eqRecord;
};
var eqRec = function() {
  return function(dictEqRecord) {
    return {
      eq: eqRecord(dictEqRecord)($$Proxy.value)
    };
  };
};
var eqNumber = {
  eq: eqNumberImpl
};
var eqInt = {
  eq: eqIntImpl
};
var eqChar = {
  eq: eqCharImpl
};
var eqBoolean = {
  eq: eqBooleanImpl
};
var eq = function(dict) {
  return dict.eq;
};
var eq2 = /* @__PURE__ */ eq(eqBoolean);
var eqArray = function(dictEq) {
  return {
    eq: eqArrayImpl(eq(dictEq))
  };
};
var eqRowCons = function(dictEqRecord) {
  var eqRecord1 = eqRecord(dictEqRecord);
  return function() {
    return function(dictIsSymbol) {
      var reflectSymbol2 = reflectSymbol(dictIsSymbol);
      return function(dictEq) {
        var eq34 = eq(dictEq);
        return {
          eqRecord: function(v) {
            return function(ra) {
              return function(rb) {
                var tail3 = eqRecord1($$Proxy.value)(ra)(rb);
                var key = reflectSymbol2($$Proxy.value);
                var get4 = unsafeGet(key);
                return eq34(get4(ra))(get4(rb)) && tail3;
              };
            };
          }
        };
      };
    };
  };
};
var notEq = function(dictEq) {
  var eq34 = eq(dictEq);
  return function(x) {
    return function(y) {
      return eq2(eq34(x)(y))(false);
    };
  };
};

// ../markgraf/output/Data.Ordering/index.js
var LT = /* @__PURE__ */ (function() {
  function LT2() {
  }
  ;
  LT2.value = new LT2();
  return LT2;
})();
var GT = /* @__PURE__ */ (function() {
  function GT2() {
  }
  ;
  GT2.value = new GT2();
  return GT2;
})();
var EQ = /* @__PURE__ */ (function() {
  function EQ2() {
  }
  ;
  EQ2.value = new EQ2();
  return EQ2;
})();
var eqOrdering = {
  eq: function(v) {
    return function(v1) {
      if (v instanceof LT && v1 instanceof LT) {
        return true;
      }
      ;
      if (v instanceof GT && v1 instanceof GT) {
        return true;
      }
      ;
      if (v instanceof EQ && v1 instanceof EQ) {
        return true;
      }
      ;
      return false;
    };
  }
};

// ../markgraf/output/Data.Ring/foreign.js
var intSub = function(x) {
  return function(y) {
    return x - y | 0;
  };
};

// ../markgraf/output/Data.Semiring/foreign.js
var intAdd = function(x) {
  return function(y) {
    return x + y | 0;
  };
};
var intMul = function(x) {
  return function(y) {
    return x * y | 0;
  };
};
var numAdd = function(n1) {
  return function(n2) {
    return n1 + n2;
  };
};
var numMul = function(n1) {
  return function(n2) {
    return n1 * n2;
  };
};

// ../markgraf/output/Data.Semiring/index.js
var zero = function(dict) {
  return dict.zero;
};
var semiringNumber = {
  add: numAdd,
  zero: 0,
  mul: numMul,
  one: 1
};
var semiringInt = {
  add: intAdd,
  zero: 0,
  mul: intMul,
  one: 1
};
var one = function(dict) {
  return dict.one;
};
var mul = function(dict) {
  return dict.mul;
};
var add = function(dict) {
  return dict.add;
};

// ../markgraf/output/Data.Ring/index.js
var sub = function(dict) {
  return dict.sub;
};
var ringInt = {
  sub: intSub,
  Semiring0: function() {
    return semiringInt;
  }
};
var negate = function(dictRing) {
  var sub1 = sub(dictRing);
  var zero3 = zero(dictRing.Semiring0());
  return function(a) {
    return sub1(zero3)(a);
  };
};

// ../markgraf/output/Data.Ord/index.js
var eqRec2 = /* @__PURE__ */ eqRec();
var notEq2 = /* @__PURE__ */ notEq(eqOrdering);
var ordString = /* @__PURE__ */ (function() {
  return {
    compare: ordStringImpl(LT.value)(EQ.value)(GT.value),
    Eq0: function() {
      return eqString;
    }
  };
})();
var ordRecordNil = {
  compareRecord: function(v) {
    return function(v1) {
      return function(v2) {
        return EQ.value;
      };
    };
  },
  EqRecord0: function() {
    return eqRowNil;
  }
};
var ordNumber = /* @__PURE__ */ (function() {
  return {
    compare: ordNumberImpl(LT.value)(EQ.value)(GT.value),
    Eq0: function() {
      return eqNumber;
    }
  };
})();
var ordInt = /* @__PURE__ */ (function() {
  return {
    compare: ordIntImpl(LT.value)(EQ.value)(GT.value),
    Eq0: function() {
      return eqInt;
    }
  };
})();
var ordChar = /* @__PURE__ */ (function() {
  return {
    compare: ordCharImpl(LT.value)(EQ.value)(GT.value),
    Eq0: function() {
      return eqChar;
    }
  };
})();
var compareRecord = function(dict) {
  return dict.compareRecord;
};
var ordRecord = function() {
  return function(dictOrdRecord) {
    var eqRec1 = eqRec2(dictOrdRecord.EqRecord0());
    return {
      compare: compareRecord(dictOrdRecord)($$Proxy.value),
      Eq0: function() {
        return eqRec1;
      }
    };
  };
};
var compare = function(dict) {
  return dict.compare;
};
var comparing = function(dictOrd) {
  var compare32 = compare(dictOrd);
  return function(f) {
    return function(x) {
      return function(y) {
        return compare32(f(x))(f(y));
      };
    };
  };
};
var greaterThanOrEq = function(dictOrd) {
  var compare32 = compare(dictOrd);
  return function(a1) {
    return function(a2) {
      var v = compare32(a1)(a2);
      if (v instanceof LT) {
        return false;
      }
      ;
      return true;
    };
  };
};
var max = function(dictOrd) {
  var compare32 = compare(dictOrd);
  return function(x) {
    return function(y) {
      var v = compare32(x)(y);
      if (v instanceof LT) {
        return y;
      }
      ;
      if (v instanceof EQ) {
        return x;
      }
      ;
      if (v instanceof GT) {
        return x;
      }
      ;
      throw new Error("Failed pattern match at Data.Ord (line 181, column 3 - line 184, column 12): " + [v.constructor.name]);
    };
  };
};
var min = function(dictOrd) {
  var compare32 = compare(dictOrd);
  return function(x) {
    return function(y) {
      var v = compare32(x)(y);
      if (v instanceof LT) {
        return x;
      }
      ;
      if (v instanceof EQ) {
        return x;
      }
      ;
      if (v instanceof GT) {
        return y;
      }
      ;
      throw new Error("Failed pattern match at Data.Ord (line 172, column 3 - line 175, column 12): " + [v.constructor.name]);
    };
  };
};
var ordRecordCons = function(dictOrdRecord) {
  var compareRecord1 = compareRecord(dictOrdRecord);
  var eqRowCons2 = eqRowCons(dictOrdRecord.EqRecord0())();
  return function() {
    return function(dictIsSymbol) {
      var reflectSymbol2 = reflectSymbol(dictIsSymbol);
      var eqRowCons1 = eqRowCons2(dictIsSymbol);
      return function(dictOrd) {
        var compare32 = compare(dictOrd);
        var eqRowCons22 = eqRowCons1(dictOrd.Eq0());
        return {
          compareRecord: function(v) {
            return function(ra) {
              return function(rb) {
                var key = reflectSymbol2($$Proxy.value);
                var left = compare32(unsafeGet(key)(ra))(unsafeGet(key)(rb));
                var $95 = notEq2(left)(EQ.value);
                if ($95) {
                  return left;
                }
                ;
                return compareRecord1($$Proxy.value)(ra)(rb);
              };
            };
          },
          EqRecord0: function() {
            return eqRowCons22;
          }
        };
      };
    };
  };
};
var clamp = function(dictOrd) {
  var min16 = min(dictOrd);
  var max111 = max(dictOrd);
  return function(low) {
    return function(hi) {
      return function(x) {
        return min16(hi)(max111(low)(x));
      };
    };
  };
};
var abs = function(dictOrd) {
  var greaterThanOrEq1 = greaterThanOrEq(dictOrd);
  return function(dictRing) {
    var zero3 = zero(dictRing.Semiring0());
    var negate1 = negate(dictRing);
    return function(x) {
      var $99 = greaterThanOrEq1(x)(zero3);
      if ($99) {
        return x;
      }
      ;
      return negate1(x);
    };
  };
};

// ../markgraf/output/Data.Bounded/index.js
var top = function(dict) {
  return dict.top;
};
var boundedInt = {
  top: topInt,
  bottom: bottomInt,
  Ord0: function() {
    return ordInt;
  }
};
var boundedChar = {
  top: topChar,
  bottom: bottomChar,
  Ord0: function() {
    return ordChar;
  }
};
var bottom = function(dict) {
  return dict.bottom;
};

// ../markgraf/output/Data.Show/foreign.js
var showIntImpl = function(n) {
  return n.toString();
};
var showCharImpl = function(c) {
  var code = c.charCodeAt(0);
  if (code < 32 || code === 127) {
    switch (c) {
      case "\x07":
        return "'\\a'";
      case "\b":
        return "'\\b'";
      case "\f":
        return "'\\f'";
      case "\n":
        return "'\\n'";
      case "\r":
        return "'\\r'";
      case "	":
        return "'\\t'";
      case "\v":
        return "'\\v'";
    }
    return "'\\" + code.toString(10) + "'";
  }
  return c === "'" || c === "\\" ? "'\\" + c + "'" : "'" + c + "'";
};
var showStringImpl = function(s) {
  var l = s.length;
  return '"' + s.replace(
    /[\0-\x1F\x7F"\\]/g,
    // eslint-disable-line no-control-regex
    function(c, i) {
      switch (c) {
        case '"':
        case "\\":
          return "\\" + c;
        case "\x07":
          return "\\a";
        case "\b":
          return "\\b";
        case "\f":
          return "\\f";
        case "\n":
          return "\\n";
        case "\r":
          return "\\r";
        case "	":
          return "\\t";
        case "\v":
          return "\\v";
      }
      var k = i + 1;
      var empty8 = k < l && s[k] >= "0" && s[k] <= "9" ? "\\&" : "";
      return "\\" + c.charCodeAt(0).toString(10) + empty8;
    }
  ) + '"';
};

// ../markgraf/output/Data.Show/index.js
var showString = {
  show: showStringImpl
};
var showInt = {
  show: showIntImpl
};
var showChar = {
  show: showCharImpl
};
var show = function(dict) {
  return dict.show;
};

// ../markgraf/output/Data.Maybe/index.js
var identity4 = /* @__PURE__ */ identity(categoryFn);
var Nothing = /* @__PURE__ */ (function() {
  function Nothing2() {
  }
  ;
  Nothing2.value = new Nothing2();
  return Nothing2;
})();
var Just = /* @__PURE__ */ (function() {
  function Just2(value0) {
    this.value0 = value0;
  }
  ;
  Just2.create = function(value0) {
    return new Just2(value0);
  };
  return Just2;
})();
var maybe = function(v) {
  return function(v1) {
    return function(v2) {
      if (v2 instanceof Nothing) {
        return v;
      }
      ;
      if (v2 instanceof Just) {
        return v1(v2.value0);
      }
      ;
      throw new Error("Failed pattern match at Data.Maybe (line 237, column 1 - line 237, column 51): " + [v.constructor.name, v1.constructor.name, v2.constructor.name]);
    };
  };
};
var isNothing = /* @__PURE__ */ maybe(true)(/* @__PURE__ */ $$const(false));
var isJust = /* @__PURE__ */ maybe(false)(/* @__PURE__ */ $$const(true));
var functorMaybe = {
  map: function(v) {
    return function(v1) {
      if (v1 instanceof Just) {
        return new Just(v(v1.value0));
      }
      ;
      return Nothing.value;
    };
  }
};
var map2 = /* @__PURE__ */ map(functorMaybe);
var fromMaybe = function(a) {
  return maybe(a)(identity4);
};
var fromJust = function() {
  return function(v) {
    if (v instanceof Just) {
      return v.value0;
    }
    ;
    throw new Error("Failed pattern match at Data.Maybe (line 288, column 1 - line 288, column 46): " + [v.constructor.name]);
  };
};
var eqMaybe = function(dictEq) {
  var eq28 = eq(dictEq);
  return {
    eq: function(x) {
      return function(y) {
        if (x instanceof Nothing && y instanceof Nothing) {
          return true;
        }
        ;
        if (x instanceof Just && y instanceof Just) {
          return eq28(x.value0)(y.value0);
        }
        ;
        return false;
      };
    }
  };
};
var ordMaybe = function(dictOrd) {
  var compare23 = compare(dictOrd);
  var eqMaybe1 = eqMaybe(dictOrd.Eq0());
  return {
    compare: function(x) {
      return function(y) {
        if (x instanceof Nothing && y instanceof Nothing) {
          return EQ.value;
        }
        ;
        if (x instanceof Nothing) {
          return LT.value;
        }
        ;
        if (y instanceof Nothing) {
          return GT.value;
        }
        ;
        if (x instanceof Just && y instanceof Just) {
          return compare23(x.value0)(y.value0);
        }
        ;
        throw new Error("Failed pattern match at Data.Maybe (line 0, column 0 - line 0, column 0): " + [x.constructor.name, y.constructor.name]);
      };
    },
    Eq0: function() {
      return eqMaybe1;
    }
  };
};
var applyMaybe = {
  apply: function(v) {
    return function(v1) {
      if (v instanceof Just) {
        return map2(v.value0)(v1);
      }
      ;
      if (v instanceof Nothing) {
        return Nothing.value;
      }
      ;
      throw new Error("Failed pattern match at Data.Maybe (line 67, column 1 - line 69, column 30): " + [v.constructor.name, v1.constructor.name]);
    };
  },
  Functor0: function() {
    return functorMaybe;
  }
};
var bindMaybe = {
  bind: function(v) {
    return function(v1) {
      if (v instanceof Just) {
        return v1(v.value0);
      }
      ;
      if (v instanceof Nothing) {
        return Nothing.value;
      }
      ;
      throw new Error("Failed pattern match at Data.Maybe (line 125, column 1 - line 127, column 28): " + [v.constructor.name, v1.constructor.name]);
    };
  },
  Apply0: function() {
    return applyMaybe;
  }
};
var applicativeMaybe = /* @__PURE__ */ (function() {
  return {
    pure: Just.create,
    Apply0: function() {
      return applyMaybe;
    }
  };
})();
var altMaybe = {
  alt: function(v) {
    return function(v1) {
      if (v instanceof Nothing) {
        return v1;
      }
      ;
      return v;
    };
  },
  Functor0: function() {
    return functorMaybe;
  }
};

// ../markgraf/output/Data.Either/index.js
var Left = /* @__PURE__ */ (function() {
  function Left2(value0) {
    this.value0 = value0;
  }
  ;
  Left2.create = function(value0) {
    return new Left2(value0);
  };
  return Left2;
})();
var Right = /* @__PURE__ */ (function() {
  function Right2(value0) {
    this.value0 = value0;
  }
  ;
  Right2.create = function(value0) {
    return new Right2(value0);
  };
  return Right2;
})();
var functorEither = {
  map: function(f) {
    return function(m) {
      if (m instanceof Left) {
        return new Left(m.value0);
      }
      ;
      if (m instanceof Right) {
        return new Right(f(m.value0));
      }
      ;
      throw new Error("Failed pattern match at Data.Either (line 0, column 0 - line 0, column 0): " + [m.constructor.name]);
    };
  }
};
var map3 = /* @__PURE__ */ map(functorEither);
var either = function(v) {
  return function(v1) {
    return function(v2) {
      if (v2 instanceof Left) {
        return v(v2.value0);
      }
      ;
      if (v2 instanceof Right) {
        return v1(v2.value0);
      }
      ;
      throw new Error("Failed pattern match at Data.Either (line 208, column 1 - line 208, column 64): " + [v.constructor.name, v1.constructor.name, v2.constructor.name]);
    };
  };
};
var applyEither = {
  apply: function(v) {
    return function(v1) {
      if (v instanceof Left) {
        return new Left(v.value0);
      }
      ;
      if (v instanceof Right) {
        return map3(v.value0)(v1);
      }
      ;
      throw new Error("Failed pattern match at Data.Either (line 70, column 1 - line 72, column 30): " + [v.constructor.name, v1.constructor.name]);
    };
  },
  Functor0: function() {
    return functorEither;
  }
};
var bindEither = {
  bind: /* @__PURE__ */ either(function(e) {
    return function(v) {
      return new Left(e);
    };
  })(function(a) {
    return function(f) {
      return f(a);
    };
  }),
  Apply0: function() {
    return applyEither;
  }
};
var applicativeEither = /* @__PURE__ */ (function() {
  return {
    pure: Right.create,
    Apply0: function() {
      return applyEither;
    }
  };
})();
var monadEither = {
  Applicative0: function() {
    return applicativeEither;
  },
  Bind1: function() {
    return bindEither;
  }
};

// ../markgraf/output/Data.Identity/index.js
var Identity = function(x) {
  return x;
};
var functorIdentity = {
  map: function(f) {
    return function(m) {
      return f(m);
    };
  }
};
var applyIdentity = {
  apply: function(v) {
    return function(v1) {
      return v(v1);
    };
  },
  Functor0: function() {
    return functorIdentity;
  }
};
var bindIdentity = {
  bind: function(v) {
    return function(f) {
      return f(v);
    };
  },
  Apply0: function() {
    return applyIdentity;
  }
};
var applicativeIdentity = {
  pure: Identity,
  Apply0: function() {
    return applyIdentity;
  }
};
var monadIdentity = {
  Applicative0: function() {
    return applicativeIdentity;
  },
  Bind1: function() {
    return bindIdentity;
  }
};

// ../markgraf/output/Data.EuclideanRing/foreign.js
var intDegree = function(x) {
  return Math.min(Math.abs(x), 2147483647);
};
var intDiv = function(x) {
  return function(y) {
    if (y === 0) return 0;
    return y > 0 ? Math.floor(x / y) : -Math.floor(x / -y);
  };
};
var intMod = function(x) {
  return function(y) {
    if (y === 0) return 0;
    var yy = Math.abs(y);
    return (x % yy + yy) % yy;
  };
};

// ../markgraf/output/Data.CommutativeRing/index.js
var commutativeRingInt = {
  Ring0: function() {
    return ringInt;
  }
};

// ../markgraf/output/Data.EuclideanRing/index.js
var mod = function(dict) {
  return dict.mod;
};
var euclideanRingInt = {
  degree: intDegree,
  div: intDiv,
  mod: intMod,
  CommutativeRing0: function() {
    return commutativeRingInt;
  }
};
var div = function(dict) {
  return dict.div;
};

// ../markgraf/output/Data.Monoid/index.js
var mempty = function(dict) {
  return dict.mempty;
};

// ../markgraf/output/Control.Monad.Rec.Class/index.js
var Loop = /* @__PURE__ */ (function() {
  function Loop2(value0) {
    this.value0 = value0;
  }
  ;
  Loop2.create = function(value0) {
    return new Loop2(value0);
  };
  return Loop2;
})();
var Done = /* @__PURE__ */ (function() {
  function Done2(value0) {
    this.value0 = value0;
  }
  ;
  Done2.create = function(value0) {
    return new Done2(value0);
  };
  return Done2;
})();
var tailRecM = function(dict) {
  return dict.tailRecM;
};
var tailRec = function(f) {
  var go = function($copy_v) {
    var $tco_done = false;
    var $tco_result;
    function $tco_loop(v) {
      if (v instanceof Loop) {
        $copy_v = f(v.value0);
        return;
      }
      ;
      if (v instanceof Done) {
        $tco_done = true;
        return v.value0;
      }
      ;
      throw new Error("Failed pattern match at Control.Monad.Rec.Class (line 103, column 3 - line 103, column 25): " + [v.constructor.name]);
    }
    ;
    while (!$tco_done) {
      $tco_result = $tco_loop($copy_v);
    }
    ;
    return $tco_result;
  };
  return function($85) {
    return go(f($85));
  };
};
var monadRecIdentity = {
  tailRecM: function(f) {
    var runIdentity = function(v) {
      return v;
    };
    var $86 = tailRec(function($88) {
      return runIdentity(f($88));
    });
    return function($87) {
      return Identity($86($87));
    };
  },
  Monad0: function() {
    return monadIdentity;
  }
};
var bifunctorStep = {
  bimap: function(v) {
    return function(v1) {
      return function(v2) {
        if (v2 instanceof Loop) {
          return new Loop(v(v2.value0));
        }
        ;
        if (v2 instanceof Done) {
          return new Done(v1(v2.value0));
        }
        ;
        throw new Error("Failed pattern match at Control.Monad.Rec.Class (line 33, column 1 - line 35, column 34): " + [v.constructor.name, v1.constructor.name, v2.constructor.name]);
      };
    };
  }
};

// ../markgraf/output/Control.Monad.ST.Internal/foreign.js
var map_ = function(f) {
  return function(a) {
    return function() {
      return f(a());
    };
  };
};
var pure_ = function(a) {
  return function() {
    return a;
  };
};
var bind_ = function(a) {
  return function(f) {
    return function() {
      return f(a())();
    };
  };
};
var foreach = function(as) {
  return function(f) {
    return function() {
      for (var i = 0, l = as.length; i < l; i++) {
        f(as[i])();
      }
    };
  };
};
function newSTRef(val) {
  return function() {
    return { value: val };
  };
}
var read2 = function(ref) {
  return function() {
    return ref.value;
  };
};
var modifyImpl2 = function(f) {
  return function(ref) {
    return function() {
      var t = f(ref.value);
      ref.value = t.state;
      return t.value;
    };
  };
};
var write2 = function(a) {
  return function(ref) {
    return function() {
      return ref.value = a;
    };
  };
};

// ../markgraf/output/Control.Monad.ST.Internal/index.js
var $runtime_lazy = function(name2, moduleName, init3) {
  var state2 = 0;
  var val;
  return function(lineNumber) {
    if (state2 === 2) return val;
    if (state2 === 1) throw new ReferenceError(name2 + " was needed before it finished initializing (module " + moduleName + ", line " + lineNumber + ")", moduleName, lineNumber);
    state2 = 1;
    val = init3();
    state2 = 2;
    return val;
  };
};
var modify$prime = modifyImpl2;
var modify = function(f) {
  return modify$prime(function(s) {
    var s$prime = f(s);
    return {
      state: s$prime,
      value: s$prime
    };
  });
};
var functorST = {
  map: map_
};
var monadST = {
  Applicative0: function() {
    return applicativeST;
  },
  Bind1: function() {
    return bindST;
  }
};
var bindST = {
  bind: bind_,
  Apply0: function() {
    return $lazy_applyST(0);
  }
};
var applicativeST = {
  pure: pure_,
  Apply0: function() {
    return $lazy_applyST(0);
  }
};
var $lazy_applyST = /* @__PURE__ */ $runtime_lazy("applyST", "Control.Monad.ST.Internal", function() {
  return {
    apply: ap(monadST),
    Functor0: function() {
      return functorST;
    }
  };
});

// ../markgraf/output/Data.Array.ST/foreign.js
function newSTArray() {
  return [];
}
function unsafeFreezeThawImpl(xs) {
  return xs;
}
var unsafeFreezeImpl = unsafeFreezeThawImpl;
var unsafeThawImpl = unsafeFreezeThawImpl;
function copyImpl(xs) {
  return xs.slice();
}
var thawImpl = copyImpl;
var pushImpl = function(a, xs) {
  return xs.push(a);
};

// ../markgraf/output/Control.Monad.ST.Uncurried/foreign.js
var runSTFn1 = function runSTFn12(fn) {
  return function(a) {
    return function() {
      return fn(a);
    };
  };
};
var runSTFn2 = function runSTFn22(fn) {
  return function(a) {
    return function(b) {
      return function() {
        return fn(a, b);
      };
    };
  };
};

// ../markgraf/output/Data.Array.ST/index.js
var unsafeThaw = /* @__PURE__ */ runSTFn1(unsafeThawImpl);
var unsafeFreeze = /* @__PURE__ */ runSTFn1(unsafeFreezeImpl);
var thaw = /* @__PURE__ */ runSTFn1(thawImpl);
var withArray = function(f) {
  return function(xs) {
    return function __do() {
      var result = thaw(xs)();
      f(result)();
      return unsafeFreeze(result)();
    };
  };
};
var push = /* @__PURE__ */ runSTFn2(pushImpl);

// ../markgraf/output/Data.HeytingAlgebra/foreign.js
var boolConj = function(b1) {
  return function(b2) {
    return b1 && b2;
  };
};
var boolDisj = function(b1) {
  return function(b2) {
    return b1 || b2;
  };
};
var boolNot = function(b) {
  return !b;
};

// ../markgraf/output/Data.HeytingAlgebra/index.js
var not = function(dict) {
  return dict.not;
};
var ff = function(dict) {
  return dict.ff;
};
var disj = function(dict) {
  return dict.disj;
};
var heytingAlgebraBoolean = {
  ff: false,
  tt: true,
  implies: function(a) {
    return function(b) {
      return disj(heytingAlgebraBoolean)(not(heytingAlgebraBoolean)(a))(b);
    };
  },
  conj: boolConj,
  disj: boolDisj,
  not: boolNot
};

// ../markgraf/output/Data.Array.ST.Iterator/index.js
var map4 = /* @__PURE__ */ map(functorST);
var not2 = /* @__PURE__ */ not(heytingAlgebraBoolean);
var $$void2 = /* @__PURE__ */ $$void(functorST);
var Iterator = /* @__PURE__ */ (function() {
  function Iterator2(value0, value1) {
    this.value0 = value0;
    this.value1 = value1;
  }
  ;
  Iterator2.create = function(value0) {
    return function(value1) {
      return new Iterator2(value0, value1);
    };
  };
  return Iterator2;
})();
var peek = function(v) {
  return function __do() {
    var i = read2(v.value1)();
    return v.value0(i);
  };
};
var next = function(v) {
  return function __do() {
    var i = read2(v.value1)();
    modify(function(v1) {
      return v1 + 1 | 0;
    })(v.value1)();
    return v.value0(i);
  };
};
var pushWhile = function(p) {
  return function(iter) {
    return function(array) {
      return function __do() {
        var $$break = newSTRef(false)();
        while (map4(not2)(read2($$break))()) {
          (function __do2() {
            var mx = peek(iter)();
            if (mx instanceof Just && p(mx.value0)) {
              push(mx.value0)(array)();
              return $$void2(next(iter))();
            }
            ;
            return $$void2(write2(true)($$break))();
          })();
        }
        ;
        return {};
      };
    };
  };
};
var iterator = function(f) {
  return map4(Iterator.create(f))(newSTRef(0));
};
var iterate = function(iter) {
  return function(f) {
    return function __do() {
      var $$break = newSTRef(false)();
      while (map4(not2)(read2($$break))()) {
        (function __do2() {
          var mx = next(iter)();
          if (mx instanceof Just) {
            return f(mx.value0)();
          }
          ;
          if (mx instanceof Nothing) {
            return $$void2(write2(true)($$break))();
          }
          ;
          throw new Error("Failed pattern match at Data.Array.ST.Iterator (line 42, column 5 - line 44, column 47): " + [mx.constructor.name]);
        })();
      }
      ;
      return {};
    };
  };
};

// ../markgraf/output/Data.Foldable/foreign.js
var foldrArray = function(f) {
  return function(init3) {
    return function(xs) {
      var acc = init3;
      var len = xs.length;
      for (var i = len - 1; i >= 0; i--) {
        acc = f(xs[i])(acc);
      }
      return acc;
    };
  };
};
var foldlArray = function(f) {
  return function(init3) {
    return function(xs) {
      var acc = init3;
      var len = xs.length;
      for (var i = 0; i < len; i++) {
        acc = f(acc)(xs[i]);
      }
      return acc;
    };
  };
};

// ../markgraf/output/Control.Plus/index.js
var empty = function(dict) {
  return dict.empty;
};

// ../markgraf/output/Data.Tuple/index.js
var Tuple = /* @__PURE__ */ (function() {
  function Tuple2(value0, value1) {
    this.value0 = value0;
    this.value1 = value1;
  }
  ;
  Tuple2.create = function(value0) {
    return function(value1) {
      return new Tuple2(value0, value1);
    };
  };
  return Tuple2;
})();
var snd = function(v) {
  return v.value1;
};
var fst = function(v) {
  return v.value0;
};
var eqTuple = function(dictEq) {
  var eq28 = eq(dictEq);
  return function(dictEq1) {
    var eq114 = eq(dictEq1);
    return {
      eq: function(x) {
        return function(y) {
          return eq28(x.value0)(y.value0) && eq114(x.value1)(y.value1);
        };
      }
    };
  };
};
var ordTuple = function(dictOrd) {
  var compare23 = compare(dictOrd);
  var eqTuple1 = eqTuple(dictOrd.Eq0());
  return function(dictOrd1) {
    var compare110 = compare(dictOrd1);
    var eqTuple22 = eqTuple1(dictOrd1.Eq0());
    return {
      compare: function(x) {
        return function(y) {
          var v = compare23(x.value0)(y.value0);
          if (v instanceof LT) {
            return LT.value;
          }
          ;
          if (v instanceof GT) {
            return GT.value;
          }
          ;
          return compare110(x.value1)(y.value1);
        };
      },
      Eq0: function() {
        return eqTuple22;
      }
    };
  };
};

// ../markgraf/output/Data.Bifunctor/index.js
var identity5 = /* @__PURE__ */ identity(categoryFn);
var bimap = function(dict) {
  return dict.bimap;
};
var lmap = function(dictBifunctor) {
  var bimap1 = bimap(dictBifunctor);
  return function(f) {
    return bimap1(f)(identity5);
  };
};
var bifunctorEither = {
  bimap: function(v) {
    return function(v1) {
      return function(v2) {
        if (v2 instanceof Left) {
          return new Left(v(v2.value0));
        }
        ;
        if (v2 instanceof Right) {
          return new Right(v1(v2.value0));
        }
        ;
        throw new Error("Failed pattern match at Data.Bifunctor (line 38, column 1 - line 40, column 36): " + [v.constructor.name, v1.constructor.name, v2.constructor.name]);
      };
    };
  }
};

// ../markgraf/output/Data.Monoid.Disj/index.js
var Disj = function(x) {
  return x;
};
var semigroupDisj = function(dictHeytingAlgebra) {
  var disj2 = disj(dictHeytingAlgebra);
  return {
    append: function(v) {
      return function(v1) {
        return disj2(v)(v1);
      };
    }
  };
};
var monoidDisj = function(dictHeytingAlgebra) {
  var semigroupDisj1 = semigroupDisj(dictHeytingAlgebra);
  return {
    mempty: ff(dictHeytingAlgebra),
    Semigroup0: function() {
      return semigroupDisj1;
    }
  };
};

// ../markgraf/output/Unsafe.Coerce/foreign.js
var unsafeCoerce2 = function(x) {
  return x;
};

// ../markgraf/output/Safe.Coerce/index.js
var coerce = function() {
  return unsafeCoerce2;
};

// ../markgraf/output/Data.Newtype/index.js
var coerce2 = /* @__PURE__ */ coerce();
var unwrap = function() {
  return coerce2;
};
var unwrap1 = /* @__PURE__ */ unwrap();
var un = function() {
  return function(v) {
    return unwrap1;
  };
};
var alaF = function() {
  return function() {
    return function() {
      return function() {
        return function(v) {
          return coerce2;
        };
      };
    };
  };
};

// ../markgraf/output/Data.Foldable/index.js
var alaF2 = /* @__PURE__ */ alaF()()()();
var foldr = function(dict) {
  return dict.foldr;
};
var traverse_ = function(dictApplicative) {
  var applySecond4 = applySecond(dictApplicative.Apply0());
  var pure9 = pure(dictApplicative);
  return function(dictFoldable) {
    var foldr22 = foldr(dictFoldable);
    return function(f) {
      return foldr22(function($454) {
        return applySecond4(f($454));
      })(pure9(unit));
    };
  };
};
var foldl = function(dict) {
  return dict.foldl;
};
var sum = function(dictFoldable) {
  var foldl28 = foldl(dictFoldable);
  return function(dictSemiring) {
    return foldl28(add(dictSemiring))(zero(dictSemiring));
  };
};
var foldMapDefaultR = function(dictFoldable) {
  var foldr22 = foldr(dictFoldable);
  return function(dictMonoid) {
    var append27 = append(dictMonoid.Semigroup0());
    var mempty2 = mempty(dictMonoid);
    return function(f) {
      return foldr22(function(x) {
        return function(acc) {
          return append27(f(x))(acc);
        };
      })(mempty2);
    };
  };
};
var foldableArray = {
  foldr: foldrArray,
  foldl: foldlArray,
  foldMap: function(dictMonoid) {
    return foldMapDefaultR(foldableArray)(dictMonoid);
  }
};
var foldMap = function(dict) {
  return dict.foldMap;
};
var foldM = function(dictFoldable) {
  var foldl28 = foldl(dictFoldable);
  return function(dictMonad) {
    var bind20 = bind(dictMonad.Bind1());
    var pure9 = pure(dictMonad.Applicative0());
    return function(f) {
      return function(b0) {
        return foldl28(function(b) {
          return function(a) {
            return bind20(b)(flip(f)(a));
          };
        })(pure9(b0));
      };
    };
  };
};
var any = function(dictFoldable) {
  var foldMap22 = foldMap(dictFoldable);
  return function(dictHeytingAlgebra) {
    return alaF2(Disj)(foldMap22(monoidDisj(dictHeytingAlgebra)));
  };
};

// ../markgraf/output/Data.Function.Uncurried/foreign.js
var mkFn5 = function(fn) {
  return function(a, b, c, d, e) {
    return fn(a)(b)(c)(d)(e);
  };
};
var runFn2 = function(fn) {
  return function(a) {
    return function(b) {
      return fn(a, b);
    };
  };
};
var runFn3 = function(fn) {
  return function(a) {
    return function(b) {
      return function(c) {
        return fn(a, b, c);
      };
    };
  };
};
var runFn4 = function(fn) {
  return function(a) {
    return function(b) {
      return function(c) {
        return function(d) {
          return fn(a, b, c, d);
        };
      };
    };
  };
};
var runFn5 = function(fn) {
  return function(a) {
    return function(b) {
      return function(c) {
        return function(d) {
          return function(e) {
            return fn(a, b, c, d, e);
          };
        };
      };
    };
  };
};

// ../markgraf/output/Data.FunctorWithIndex/foreign.js
var mapWithIndexArray = function(f) {
  return function(xs) {
    var l = xs.length;
    var result = Array(l);
    for (var i = 0; i < l; i++) {
      result[i] = f(i)(xs[i]);
    }
    return result;
  };
};

// ../markgraf/output/Data.FunctorWithIndex/index.js
var mapWithIndex = function(dict) {
  return dict.mapWithIndex;
};
var functorWithIndexArray = {
  mapWithIndex: mapWithIndexArray,
  Functor0: function() {
    return functorArray;
  }
};

// ../markgraf/output/Data.Unfoldable/foreign.js
var unfoldrArrayImpl = function(isNothing2) {
  return function(fromJust6) {
    return function(fst2) {
      return function(snd2) {
        return function(f) {
          return function(b) {
            var result = [];
            var value = b;
            while (true) {
              var maybe2 = f(value);
              if (isNothing2(maybe2)) return result;
              var tuple = fromJust6(maybe2);
              result.push(fst2(tuple));
              value = snd2(tuple);
            }
          };
        };
      };
    };
  };
};

// ../markgraf/output/Data.Unfoldable1/foreign.js
var unfoldr1ArrayImpl = function(isNothing2) {
  return function(fromJust6) {
    return function(fst2) {
      return function(snd2) {
        return function(f) {
          return function(b) {
            var result = [];
            var value = b;
            while (true) {
              var tuple = f(value);
              result.push(fst2(tuple));
              var maybe2 = snd2(tuple);
              if (isNothing2(maybe2)) return result;
              value = fromJust6(maybe2);
            }
          };
        };
      };
    };
  };
};

// ../markgraf/output/Data.Unfoldable1/index.js
var fromJust2 = /* @__PURE__ */ fromJust();
var unfoldable1Array = {
  unfoldr1: /* @__PURE__ */ unfoldr1ArrayImpl(isNothing)(fromJust2)(fst)(snd)
};

// ../markgraf/output/Data.Unfoldable/index.js
var fromJust3 = /* @__PURE__ */ fromJust();
var unfoldr = function(dict) {
  return dict.unfoldr;
};
var unfoldableArray = {
  unfoldr: /* @__PURE__ */ unfoldrArrayImpl(isNothing)(fromJust3)(fst)(snd),
  Unfoldable10: function() {
    return unfoldable1Array;
  }
};

// ../markgraf/output/Data.Array/index.js
var $$void3 = /* @__PURE__ */ $$void(functorST);
var apply2 = /* @__PURE__ */ apply(applyMaybe);
var map5 = /* @__PURE__ */ map(functorMaybe);
var map1 = /* @__PURE__ */ map(functorArray);
var map22 = /* @__PURE__ */ map(functorST);
var fromJust4 = /* @__PURE__ */ fromJust();
var when2 = /* @__PURE__ */ when(applicativeST);
var notEq3 = /* @__PURE__ */ notEq(eqOrdering);
var append2 = /* @__PURE__ */ append(semigroupArray);
var zipWith = /* @__PURE__ */ runFn3(zipWithImpl);
var zip = /* @__PURE__ */ (function() {
  return zipWith(Tuple.create);
})();
var updateAt = /* @__PURE__ */ (function() {
  return runFn5(_updateAt)(Just.create)(Nothing.value);
})();
var unsafeIndex = function() {
  return runFn2(unsafeIndexImpl);
};
var unsafeIndex1 = /* @__PURE__ */ unsafeIndex();
var uncons = /* @__PURE__ */ (function() {
  return runFn3(unconsImpl)($$const(Nothing.value))(function(x) {
    return function(xs) {
      return new Just({
        head: x,
        tail: xs
      });
    };
  });
})();
var sortBy = function(comp) {
  return runFn3(sortByImpl)(comp)(function(v) {
    if (v instanceof GT) {
      return 1;
    }
    ;
    if (v instanceof EQ) {
      return 0;
    }
    ;
    if (v instanceof LT) {
      return -1 | 0;
    }
    ;
    throw new Error("Failed pattern match at Data.Array (line 897, column 38 - line 900, column 11): " + [v.constructor.name]);
  });
};
var sortWith = function(dictOrd) {
  var comparing3 = comparing(dictOrd);
  return function(f) {
    return sortBy(comparing3(f));
  };
};
var sortWith1 = /* @__PURE__ */ sortWith(ordInt);
var sort = function(dictOrd) {
  var compare23 = compare(dictOrd);
  return function(xs) {
    return sortBy(compare23)(xs);
  };
};
var snoc = function(xs) {
  return function(x) {
    return withArray(push(x))(xs)();
  };
};
var slice = /* @__PURE__ */ runFn3(sliceImpl);
var take = function(n) {
  return function(xs) {
    var $152 = n < 1;
    if ($152) {
      return [];
    }
    ;
    return slice(0)(n)(xs);
  };
};
var singleton2 = function(a) {
  return [a];
};
var replicate = /* @__PURE__ */ runFn2(replicateImpl);
var range2 = /* @__PURE__ */ runFn2(rangeImpl);
var $$null = function(xs) {
  return length(xs) === 0;
};
var mapWithIndex2 = /* @__PURE__ */ mapWithIndex(functorWithIndexArray);
var insertAt = /* @__PURE__ */ (function() {
  return runFn5(_insertAt)(Just.create)(Nothing.value);
})();
var init = function(xs) {
  if ($$null(xs)) {
    return Nothing.value;
  }
  ;
  if (otherwise) {
    return new Just(slice(0)(length(xs) - 1 | 0)(xs));
  }
  ;
  throw new Error("Failed pattern match at Data.Array (line 351, column 1 - line 351, column 45): " + [xs.constructor.name]);
};
var index = /* @__PURE__ */ (function() {
  return runFn4(indexImpl)(Just.create)(Nothing.value);
})();
var last = function(xs) {
  return index(xs)(length(xs) - 1 | 0);
};
var unsnoc = function(xs) {
  return apply2(map5(function(v) {
    return function(v1) {
      return {
        init: v,
        last: v1
      };
    };
  })(init(xs)))(last(xs));
};
var modifyAt = function(i) {
  return function(f) {
    return function(xs) {
      var go = function(x) {
        return updateAt(i)(f(x))(xs);
      };
      return maybe(Nothing.value)(go)(index(xs)(i));
    };
  };
};
var span = function(p) {
  return function(arr) {
    var go = function($copy_i) {
      var $tco_done = false;
      var $tco_result;
      function $tco_loop(i) {
        var v = index(arr)(i);
        if (v instanceof Just) {
          var $156 = p(v.value0);
          if ($156) {
            $copy_i = i + 1 | 0;
            return;
          }
          ;
          $tco_done = true;
          return new Just(i);
        }
        ;
        if (v instanceof Nothing) {
          $tco_done = true;
          return Nothing.value;
        }
        ;
        throw new Error("Failed pattern match at Data.Array (line 1035, column 5 - line 1037, column 25): " + [v.constructor.name]);
      }
      ;
      while (!$tco_done) {
        $tco_result = $tco_loop($copy_i);
      }
      ;
      return $tco_result;
    };
    var breakIndex = go(0);
    if (breakIndex instanceof Just && breakIndex.value0 === 0) {
      return {
        init: [],
        rest: arr
      };
    }
    ;
    if (breakIndex instanceof Just) {
      return {
        init: slice(0)(breakIndex.value0)(arr),
        rest: slice(breakIndex.value0)(length(arr))(arr)
      };
    }
    ;
    if (breakIndex instanceof Nothing) {
      return {
        init: arr,
        rest: []
      };
    }
    ;
    throw new Error("Failed pattern match at Data.Array (line 1022, column 3 - line 1028, column 30): " + [breakIndex.constructor.name]);
  };
};
var takeWhile = function(p) {
  return function(xs) {
    return span(p)(xs).init;
  };
};
var head = function(xs) {
  return index(xs)(0);
};
var nubBy = function(comp) {
  return function(xs) {
    var indexedAndSorted = sortBy(function(x) {
      return function(y) {
        return comp(snd(x))(snd(y));
      };
    })(mapWithIndex2(Tuple.create)(xs));
    var v = head(indexedAndSorted);
    if (v instanceof Nothing) {
      return [];
    }
    ;
    if (v instanceof Just) {
      return map1(snd)(sortWith1(fst)((function __do() {
        var result = unsafeThaw(singleton2(v.value0))();
        foreach(indexedAndSorted)(function(v1) {
          return function __do2() {
            var lst = map22(/* @__PURE__ */ (function() {
              var $183 = function($185) {
                return fromJust4(last($185));
              };
              return function($184) {
                return snd($183($184));
              };
            })())(unsafeFreeze(result))();
            return when2(notEq3(comp(lst)(v1.value1))(EQ.value))($$void3(push(v1)(result)))();
          };
        })();
        return unsafeFreeze(result)();
      })()));
    }
    ;
    throw new Error("Failed pattern match at Data.Array (line 1115, column 17 - line 1123, column 28): " + [v.constructor.name]);
  };
};
var nub = function(dictOrd) {
  return nubBy(compare(dictOrd));
};
var groupBy = function(op) {
  return function(xs) {
    return (function __do() {
      var result = newSTArray();
      var iter = iterator(function(v) {
        return index(xs)(v);
      })();
      iterate(iter)(function(x) {
        return $$void3(function __do2() {
          var sub1 = newSTArray();
          push(x)(sub1)();
          pushWhile(op(x))(iter)(sub1)();
          var grp = unsafeFreeze(sub1)();
          return push(grp)(result)();
        });
      })();
      return unsafeFreeze(result)();
    })();
  };
};
var group = function(dictEq) {
  var eq28 = eq(dictEq);
  return function(xs) {
    return groupBy(eq28)(xs);
  };
};
var fromFoldable = function(dictFoldable) {
  return runFn2(fromFoldableImpl)(foldr(dictFoldable));
};
var foldl2 = /* @__PURE__ */ foldl(foldableArray);
var findMap = /* @__PURE__ */ (function() {
  return runFn4(findMapImpl)(Nothing.value)(isJust);
})();
var findLastIndex = /* @__PURE__ */ (function() {
  return runFn4(findLastIndexImpl)(Just.create)(Nothing.value);
})();
var findIndex = /* @__PURE__ */ (function() {
  return runFn4(findIndexImpl)(Just.create)(Nothing.value);
})();
var find2 = function(f) {
  return function(xs) {
    return map5(unsafeIndex1(xs))(findIndex(f)(xs));
  };
};
var filter = /* @__PURE__ */ runFn2(filterImpl);
var elemIndex = function(dictEq) {
  var eq28 = eq(dictEq);
  return function(x) {
    return findIndex(function(v) {
      return eq28(v)(x);
    });
  };
};
var elem2 = function(dictEq) {
  var elemIndex1 = elemIndex(dictEq);
  return function(a) {
    return function(arr) {
      return isJust(elemIndex1(a)(arr));
    };
  };
};
var dropWhile = function(p) {
  return function(xs) {
    return span(p)(xs).rest;
  };
};
var dropEnd = function(n) {
  return function(xs) {
    return take(length(xs) - n | 0)(xs);
  };
};
var drop = function(n) {
  return function(xs) {
    var $173 = n < 1;
    if ($173) {
      return xs;
    }
    ;
    return slice(n)(length(xs))(xs);
  };
};
var deleteAt = /* @__PURE__ */ (function() {
  return runFn4(_deleteAt)(Just.create)(Nothing.value);
})();
var cons = function(x) {
  return function(xs) {
    return append2([x])(xs);
  };
};
var concatMap = /* @__PURE__ */ flip(/* @__PURE__ */ bind(bindArray));
var mapMaybe = function(f) {
  return concatMap((function() {
    var $189 = maybe([])(singleton2);
    return function($190) {
      return $189(f($190));
    };
  })());
};
var catMaybes = /* @__PURE__ */ mapMaybe(/* @__PURE__ */ identity(categoryFn));
var any2 = /* @__PURE__ */ runFn2(anyImpl);
var all2 = /* @__PURE__ */ runFn2(allImpl);

// ../markgraf/output/Data.FoldableWithIndex/index.js
var foldrWithIndex = function(dict) {
  return dict.foldrWithIndex;
};

// ../markgraf/output/Data.List.Types/index.js
var Nil = /* @__PURE__ */ (function() {
  function Nil3() {
  }
  ;
  Nil3.value = new Nil3();
  return Nil3;
})();
var Cons = /* @__PURE__ */ (function() {
  function Cons3(value0, value1) {
    this.value0 = value0;
    this.value1 = value1;
  }
  ;
  Cons3.create = function(value0) {
    return function(value1) {
      return new Cons3(value0, value1);
    };
  };
  return Cons3;
})();
var foldableList = {
  foldr: function(f) {
    return function(b) {
      var rev = (function() {
        var go = function($copy_v) {
          return function($copy_v1) {
            var $tco_var_v = $copy_v;
            var $tco_done = false;
            var $tco_result;
            function $tco_loop(v, v1) {
              if (v1 instanceof Nil) {
                $tco_done = true;
                return v;
              }
              ;
              if (v1 instanceof Cons) {
                $tco_var_v = new Cons(v1.value0, v);
                $copy_v1 = v1.value1;
                return;
              }
              ;
              throw new Error("Failed pattern match at Data.List.Types (line 107, column 7 - line 107, column 23): " + [v.constructor.name, v1.constructor.name]);
            }
            ;
            while (!$tco_done) {
              $tco_result = $tco_loop($tco_var_v, $copy_v1);
            }
            ;
            return $tco_result;
          };
        };
        return go(Nil.value);
      })();
      var $284 = foldl(foldableList)(flip(f))(b);
      return function($285) {
        return $284(rev($285));
      };
    };
  },
  foldl: function(f) {
    var go = function($copy_b) {
      return function($copy_v) {
        var $tco_var_b = $copy_b;
        var $tco_done1 = false;
        var $tco_result;
        function $tco_loop(b, v) {
          if (v instanceof Nil) {
            $tco_done1 = true;
            return b;
          }
          ;
          if (v instanceof Cons) {
            $tco_var_b = f(b)(v.value0);
            $copy_v = v.value1;
            return;
          }
          ;
          throw new Error("Failed pattern match at Data.List.Types (line 111, column 12 - line 113, column 30): " + [v.constructor.name]);
        }
        ;
        while (!$tco_done1) {
          $tco_result = $tco_loop($tco_var_b, $copy_v);
        }
        ;
        return $tco_result;
      };
    };
    return go;
  },
  foldMap: function(dictMonoid) {
    var append27 = append(dictMonoid.Semigroup0());
    var mempty2 = mempty(dictMonoid);
    return function(f) {
      return foldl(foldableList)(function(acc) {
        var $286 = append27(acc);
        return function($287) {
          return $286(f($287));
        };
      })(mempty2);
    };
  }
};

// ../markgraf/output/Data.Map.Internal/index.js
var $runtime_lazy2 = function(name2, moduleName, init3) {
  var state2 = 0;
  var val;
  return function(lineNumber) {
    if (state2 === 2) return val;
    if (state2 === 1) throw new ReferenceError(name2 + " was needed before it finished initializing (module " + moduleName + ", line " + lineNumber + ")", moduleName, lineNumber);
    state2 = 1;
    val = init3();
    state2 = 2;
    return val;
  };
};
var Leaf = /* @__PURE__ */ (function() {
  function Leaf3() {
  }
  ;
  Leaf3.value = new Leaf3();
  return Leaf3;
})();
var Node = /* @__PURE__ */ (function() {
  function Node2(value0, value1, value2, value3, value4, value5) {
    this.value0 = value0;
    this.value1 = value1;
    this.value2 = value2;
    this.value3 = value3;
    this.value4 = value4;
    this.value5 = value5;
  }
  ;
  Node2.create = function(value0) {
    return function(value1) {
      return function(value2) {
        return function(value3) {
          return function(value4) {
            return function(value5) {
              return new Node2(value0, value1, value2, value3, value4, value5);
            };
          };
        };
      };
    };
  };
  return Node2;
})();
var IterLeaf = /* @__PURE__ */ (function() {
  function IterLeaf2() {
  }
  ;
  IterLeaf2.value = new IterLeaf2();
  return IterLeaf2;
})();
var IterEmit = /* @__PURE__ */ (function() {
  function IterEmit2(value0, value1, value2) {
    this.value0 = value0;
    this.value1 = value1;
    this.value2 = value2;
  }
  ;
  IterEmit2.create = function(value0) {
    return function(value1) {
      return function(value2) {
        return new IterEmit2(value0, value1, value2);
      };
    };
  };
  return IterEmit2;
})();
var IterNode = /* @__PURE__ */ (function() {
  function IterNode2(value0, value1) {
    this.value0 = value0;
    this.value1 = value1;
  }
  ;
  IterNode2.create = function(value0) {
    return function(value1) {
      return new IterNode2(value0, value1);
    };
  };
  return IterNode2;
})();
var Split = /* @__PURE__ */ (function() {
  function Split2(value0, value1, value2) {
    this.value0 = value0;
    this.value1 = value1;
    this.value2 = value2;
  }
  ;
  Split2.create = function(value0) {
    return function(value1) {
      return function(value2) {
        return new Split2(value0, value1, value2);
      };
    };
  };
  return Split2;
})();
var SplitLast = /* @__PURE__ */ (function() {
  function SplitLast2(value0, value1, value2) {
    this.value0 = value0;
    this.value1 = value1;
    this.value2 = value2;
  }
  ;
  SplitLast2.create = function(value0) {
    return function(value1) {
      return function(value2) {
        return new SplitLast2(value0, value1, value2);
      };
    };
  };
  return SplitLast2;
})();
var unsafeNode = function(k, v, l, r) {
  if (l instanceof Leaf) {
    if (r instanceof Leaf) {
      return new Node(1, 1, k, v, l, r);
    }
    ;
    if (r instanceof Node) {
      return new Node(1 + r.value0 | 0, 1 + r.value1 | 0, k, v, l, r);
    }
    ;
    throw new Error("Failed pattern match at Data.Map.Internal (line 702, column 5 - line 706, column 39): " + [r.constructor.name]);
  }
  ;
  if (l instanceof Node) {
    if (r instanceof Leaf) {
      return new Node(1 + l.value0 | 0, 1 + l.value1 | 0, k, v, l, r);
    }
    ;
    if (r instanceof Node) {
      return new Node(1 + (function() {
        var $280 = l.value0 > r.value0;
        if ($280) {
          return l.value0;
        }
        ;
        return r.value0;
      })() | 0, (1 + l.value1 | 0) + r.value1 | 0, k, v, l, r);
    }
    ;
    throw new Error("Failed pattern match at Data.Map.Internal (line 708, column 5 - line 712, column 68): " + [r.constructor.name]);
  }
  ;
  throw new Error("Failed pattern match at Data.Map.Internal (line 700, column 32 - line 712, column 68): " + [l.constructor.name]);
};
var toMapIter = /* @__PURE__ */ (function() {
  return flip(IterNode.create)(IterLeaf.value);
})();
var stepWith = function(f) {
  return function(next3) {
    return function(done) {
      var go = function($copy_v) {
        var $tco_done = false;
        var $tco_result;
        function $tco_loop(v) {
          if (v instanceof IterLeaf) {
            $tco_done = true;
            return done(unit);
          }
          ;
          if (v instanceof IterEmit) {
            $tco_done = true;
            return next3(v.value0, v.value1, v.value2);
          }
          ;
          if (v instanceof IterNode) {
            $copy_v = f(v.value1)(v.value0);
            return;
          }
          ;
          throw new Error("Failed pattern match at Data.Map.Internal (line 940, column 8 - line 946, column 20): " + [v.constructor.name]);
        }
        ;
        while (!$tco_done) {
          $tco_result = $tco_loop($copy_v);
        }
        ;
        return $tco_result;
      };
      return go;
    };
  };
};
var size = function(v) {
  if (v instanceof Leaf) {
    return 0;
  }
  ;
  if (v instanceof Node) {
    return v.value1;
  }
  ;
  throw new Error("Failed pattern match at Data.Map.Internal (line 618, column 8 - line 620, column 24): " + [v.constructor.name]);
};
var singleton4 = function(k) {
  return function(v) {
    return new Node(1, 1, k, v, Leaf.value, Leaf.value);
  };
};
var unsafeBalancedNode = /* @__PURE__ */ (function() {
  var height = function(v) {
    if (v instanceof Leaf) {
      return 0;
    }
    ;
    if (v instanceof Node) {
      return v.value0;
    }
    ;
    throw new Error("Failed pattern match at Data.Map.Internal (line 757, column 12 - line 759, column 26): " + [v.constructor.name]);
  };
  var rotateLeft = function(k, v, l, rk, rv, rl, rr) {
    if (rl instanceof Node && rl.value0 > height(rr)) {
      return unsafeNode(rl.value2, rl.value3, unsafeNode(k, v, l, rl.value4), unsafeNode(rk, rv, rl.value5, rr));
    }
    ;
    return unsafeNode(rk, rv, unsafeNode(k, v, l, rl), rr);
  };
  var rotateRight = function(k, v, lk, lv, ll, lr, r) {
    if (lr instanceof Node && height(ll) <= lr.value0) {
      return unsafeNode(lr.value2, lr.value3, unsafeNode(lk, lv, ll, lr.value4), unsafeNode(k, v, lr.value5, r));
    }
    ;
    return unsafeNode(lk, lv, ll, unsafeNode(k, v, lr, r));
  };
  return function(k, v, l, r) {
    if (l instanceof Leaf) {
      if (r instanceof Leaf) {
        return singleton4(k)(v);
      }
      ;
      if (r instanceof Node && r.value0 > 1) {
        return rotateLeft(k, v, l, r.value2, r.value3, r.value4, r.value5);
      }
      ;
      return unsafeNode(k, v, l, r);
    }
    ;
    if (l instanceof Node) {
      if (r instanceof Node) {
        if (r.value0 > (l.value0 + 1 | 0)) {
          return rotateLeft(k, v, l, r.value2, r.value3, r.value4, r.value5);
        }
        ;
        if (l.value0 > (r.value0 + 1 | 0)) {
          return rotateRight(k, v, l.value2, l.value3, l.value4, l.value5, r);
        }
        ;
      }
      ;
      if (r instanceof Leaf && l.value0 > 1) {
        return rotateRight(k, v, l.value2, l.value3, l.value4, l.value5, r);
      }
      ;
      return unsafeNode(k, v, l, r);
    }
    ;
    throw new Error("Failed pattern match at Data.Map.Internal (line 717, column 40 - line 738, column 34): " + [l.constructor.name]);
  };
})();
var $lazy_unsafeSplit = /* @__PURE__ */ $runtime_lazy2("unsafeSplit", "Data.Map.Internal", function() {
  return function(comp, k, m) {
    if (m instanceof Leaf) {
      return new Split(Nothing.value, Leaf.value, Leaf.value);
    }
    ;
    if (m instanceof Node) {
      var v = comp(k)(m.value2);
      if (v instanceof LT) {
        var v1 = $lazy_unsafeSplit(793)(comp, k, m.value4);
        return new Split(v1.value0, v1.value1, unsafeBalancedNode(m.value2, m.value3, v1.value2, m.value5));
      }
      ;
      if (v instanceof GT) {
        var v1 = $lazy_unsafeSplit(796)(comp, k, m.value5);
        return new Split(v1.value0, unsafeBalancedNode(m.value2, m.value3, m.value4, v1.value1), v1.value2);
      }
      ;
      if (v instanceof EQ) {
        return new Split(new Just(m.value3), m.value4, m.value5);
      }
      ;
      throw new Error("Failed pattern match at Data.Map.Internal (line 791, column 5 - line 799, column 30): " + [v.constructor.name]);
    }
    ;
    throw new Error("Failed pattern match at Data.Map.Internal (line 787, column 34 - line 799, column 30): " + [m.constructor.name]);
  };
});
var unsafeSplit = /* @__PURE__ */ $lazy_unsafeSplit(786);
var $lazy_unsafeSplitLast = /* @__PURE__ */ $runtime_lazy2("unsafeSplitLast", "Data.Map.Internal", function() {
  return function(k, v, l, r) {
    if (r instanceof Leaf) {
      return new SplitLast(k, v, l);
    }
    ;
    if (r instanceof Node) {
      var v1 = $lazy_unsafeSplitLast(779)(r.value2, r.value3, r.value4, r.value5);
      return new SplitLast(v1.value0, v1.value1, unsafeBalancedNode(k, v, l, v1.value2));
    }
    ;
    throw new Error("Failed pattern match at Data.Map.Internal (line 776, column 37 - line 780, column 57): " + [r.constructor.name]);
  };
});
var unsafeSplitLast = /* @__PURE__ */ $lazy_unsafeSplitLast(775);
var unsafeJoinNodes = function(v, v1) {
  if (v instanceof Leaf) {
    return v1;
  }
  ;
  if (v instanceof Node) {
    var v2 = unsafeSplitLast(v.value2, v.value3, v.value4, v.value5);
    return unsafeBalancedNode(v2.value0, v2.value1, v2.value2, v1);
  }
  ;
  throw new Error("Failed pattern match at Data.Map.Internal (line 764, column 25 - line 768, column 38): " + [v.constructor.name, v1.constructor.name]);
};
var $lazy_unsafeDifference = /* @__PURE__ */ $runtime_lazy2("unsafeDifference", "Data.Map.Internal", function() {
  return function(comp, l, r) {
    if (l instanceof Leaf) {
      return Leaf.value;
    }
    ;
    if (r instanceof Leaf) {
      return l;
    }
    ;
    if (r instanceof Node) {
      var v = unsafeSplit(comp, r.value2, l);
      var l$prime = $lazy_unsafeDifference(841)(comp, v.value1, r.value4);
      var r$prime = $lazy_unsafeDifference(842)(comp, v.value2, r.value5);
      return unsafeJoinNodes(l$prime, r$prime);
    }
    ;
    throw new Error("Failed pattern match at Data.Map.Internal (line 836, column 39 - line 843, column 33): " + [l.constructor.name, r.constructor.name]);
  };
});
var unsafeDifference = /* @__PURE__ */ $lazy_unsafeDifference(835);
var $lazy_unsafeIntersectionWith = /* @__PURE__ */ $runtime_lazy2("unsafeIntersectionWith", "Data.Map.Internal", function() {
  return function(comp, app, l, r) {
    if (l instanceof Leaf) {
      return Leaf.value;
    }
    ;
    if (r instanceof Leaf) {
      return Leaf.value;
    }
    ;
    if (r instanceof Node) {
      var v = unsafeSplit(comp, r.value2, l);
      var l$prime = $lazy_unsafeIntersectionWith(825)(comp, app, v.value1, r.value4);
      var r$prime = $lazy_unsafeIntersectionWith(826)(comp, app, v.value2, r.value5);
      if (v.value0 instanceof Just) {
        return unsafeBalancedNode(r.value2, app(v.value0.value0)(r.value3), l$prime, r$prime);
      }
      ;
      if (v.value0 instanceof Nothing) {
        return unsafeJoinNodes(l$prime, r$prime);
      }
      ;
      throw new Error("Failed pattern match at Data.Map.Internal (line 827, column 5 - line 831, column 37): " + [v.value0.constructor.name]);
    }
    ;
    throw new Error("Failed pattern match at Data.Map.Internal (line 820, column 49 - line 831, column 37): " + [l.constructor.name, r.constructor.name]);
  };
});
var unsafeIntersectionWith = /* @__PURE__ */ $lazy_unsafeIntersectionWith(819);
var $lazy_unsafeUnionWith = /* @__PURE__ */ $runtime_lazy2("unsafeUnionWith", "Data.Map.Internal", function() {
  return function(comp, app, l, r) {
    if (l instanceof Leaf) {
      return r;
    }
    ;
    if (r instanceof Leaf) {
      return l;
    }
    ;
    if (r instanceof Node) {
      var v = unsafeSplit(comp, r.value2, l);
      var l$prime = $lazy_unsafeUnionWith(809)(comp, app, v.value1, r.value4);
      var r$prime = $lazy_unsafeUnionWith(810)(comp, app, v.value2, r.value5);
      if (v.value0 instanceof Just) {
        return unsafeBalancedNode(r.value2, app(v.value0.value0)(r.value3), l$prime, r$prime);
      }
      ;
      if (v.value0 instanceof Nothing) {
        return unsafeBalancedNode(r.value2, r.value3, l$prime, r$prime);
      }
      ;
      throw new Error("Failed pattern match at Data.Map.Internal (line 811, column 5 - line 815, column 46): " + [v.value0.constructor.name]);
    }
    ;
    throw new Error("Failed pattern match at Data.Map.Internal (line 804, column 42 - line 815, column 46): " + [l.constructor.name, r.constructor.name]);
  };
});
var unsafeUnionWith = /* @__PURE__ */ $lazy_unsafeUnionWith(803);
var unionWith = function(dictOrd) {
  var compare23 = compare(dictOrd);
  return function(app) {
    return function(m1) {
      return function(m2) {
        return unsafeUnionWith(compare23, app, m1, m2);
      };
    };
  };
};
var union = function(dictOrd) {
  return unionWith(dictOrd)($$const);
};
var member = function(dictOrd) {
  var compare23 = compare(dictOrd);
  return function(k) {
    var go = function($copy_v) {
      var $tco_done = false;
      var $tco_result;
      function $tco_loop(v) {
        if (v instanceof Leaf) {
          $tco_done = true;
          return false;
        }
        ;
        if (v instanceof Node) {
          var v1 = compare23(k)(v.value2);
          if (v1 instanceof LT) {
            $copy_v = v.value4;
            return;
          }
          ;
          if (v1 instanceof GT) {
            $copy_v = v.value5;
            return;
          }
          ;
          if (v1 instanceof EQ) {
            $tco_done = true;
            return true;
          }
          ;
          throw new Error("Failed pattern match at Data.Map.Internal (line 459, column 7 - line 462, column 19): " + [v1.constructor.name]);
        }
        ;
        throw new Error("Failed pattern match at Data.Map.Internal (line 456, column 8 - line 462, column 19): " + [v.constructor.name]);
      }
      ;
      while (!$tco_done) {
        $tco_result = $tco_loop($copy_v);
      }
      ;
      return $tco_result;
    };
    return go;
  };
};
var mapMaybeWithKey = function(dictOrd) {
  return function(f) {
    var go = function(v) {
      if (v instanceof Leaf) {
        return Leaf.value;
      }
      ;
      if (v instanceof Node) {
        var v2 = f(v.value2)(v.value3);
        if (v2 instanceof Just) {
          return unsafeBalancedNode(v.value2, v2.value0, go(v.value4), go(v.value5));
        }
        ;
        if (v2 instanceof Nothing) {
          return unsafeJoinNodes(go(v.value4), go(v.value5));
        }
        ;
        throw new Error("Failed pattern match at Data.Map.Internal (line 661, column 7 - line 665, column 47): " + [v2.constructor.name]);
      }
      ;
      throw new Error("Failed pattern match at Data.Map.Internal (line 658, column 8 - line 665, column 47): " + [v.constructor.name]);
    };
    return go;
  };
};
var lookup = function(dictOrd) {
  var compare23 = compare(dictOrd);
  return function(k) {
    var go = function($copy_v) {
      var $tco_done = false;
      var $tco_result;
      function $tco_loop(v) {
        if (v instanceof Leaf) {
          $tco_done = true;
          return Nothing.value;
        }
        ;
        if (v instanceof Node) {
          var v1 = compare23(k)(v.value2);
          if (v1 instanceof LT) {
            $copy_v = v.value4;
            return;
          }
          ;
          if (v1 instanceof GT) {
            $copy_v = v.value5;
            return;
          }
          ;
          if (v1 instanceof EQ) {
            $tco_done = true;
            return new Just(v.value3);
          }
          ;
          throw new Error("Failed pattern match at Data.Map.Internal (line 283, column 7 - line 286, column 22): " + [v1.constructor.name]);
        }
        ;
        throw new Error("Failed pattern match at Data.Map.Internal (line 280, column 8 - line 286, column 22): " + [v.constructor.name]);
      }
      ;
      while (!$tco_done) {
        $tco_result = $tco_loop($copy_v);
      }
      ;
      return $tco_result;
    };
    return go;
  };
};
var iterMapL = /* @__PURE__ */ (function() {
  var go = function($copy_iter) {
    return function($copy_v) {
      var $tco_var_iter = $copy_iter;
      var $tco_done = false;
      var $tco_result;
      function $tco_loop(iter, v) {
        if (v instanceof Leaf) {
          $tco_done = true;
          return iter;
        }
        ;
        if (v instanceof Node) {
          if (v.value5 instanceof Leaf) {
            $tco_var_iter = new IterEmit(v.value2, v.value3, iter);
            $copy_v = v.value4;
            return;
          }
          ;
          $tco_var_iter = new IterEmit(v.value2, v.value3, new IterNode(v.value5, iter));
          $copy_v = v.value4;
          return;
        }
        ;
        throw new Error("Failed pattern match at Data.Map.Internal (line 951, column 13 - line 958, column 48): " + [v.constructor.name]);
      }
      ;
      while (!$tco_done) {
        $tco_result = $tco_loop($tco_var_iter, $copy_v);
      }
      ;
      return $tco_result;
    };
  };
  return go;
})();
var stepAscCps = /* @__PURE__ */ stepWith(iterMapL);
var stepUnfoldr = /* @__PURE__ */ (function() {
  var step2 = function(k, v, next3) {
    return new Just(new Tuple(new Tuple(k, v), next3));
  };
  return stepAscCps(step2)(function(v) {
    return Nothing.value;
  });
})();
var toUnfoldable = function(dictUnfoldable) {
  var $784 = unfoldr(dictUnfoldable)(stepUnfoldr);
  return function($785) {
    return $784(toMapIter($785));
  };
};
var isEmpty = function(v) {
  if (v instanceof Leaf) {
    return true;
  }
  ;
  return false;
};
var intersectionWith = function(dictOrd) {
  var compare23 = compare(dictOrd);
  return function(app) {
    return function(m1) {
      return function(m2) {
        return unsafeIntersectionWith(compare23, app, m1, m2);
      };
    };
  };
};
var intersection = function(dictOrd) {
  return intersectionWith(dictOrd)($$const);
};
var insertWith = function(dictOrd) {
  var compare23 = compare(dictOrd);
  return function(app) {
    return function(k) {
      return function(v) {
        var go = function(v1) {
          if (v1 instanceof Leaf) {
            return singleton4(k)(v);
          }
          ;
          if (v1 instanceof Node) {
            var v2 = compare23(k)(v1.value2);
            if (v2 instanceof LT) {
              return unsafeBalancedNode(v1.value2, v1.value3, go(v1.value4), v1.value5);
            }
            ;
            if (v2 instanceof GT) {
              return unsafeBalancedNode(v1.value2, v1.value3, v1.value4, go(v1.value5));
            }
            ;
            if (v2 instanceof EQ) {
              return new Node(v1.value0, v1.value1, k, app(v1.value3)(v), v1.value4, v1.value5);
            }
            ;
            throw new Error("Failed pattern match at Data.Map.Internal (line 486, column 7 - line 489, column 44): " + [v2.constructor.name]);
          }
          ;
          throw new Error("Failed pattern match at Data.Map.Internal (line 483, column 8 - line 489, column 44): " + [v1.constructor.name]);
        };
        return go;
      };
    };
  };
};
var insert = function(dictOrd) {
  var compare23 = compare(dictOrd);
  return function(k) {
    return function(v) {
      var go = function(v1) {
        if (v1 instanceof Leaf) {
          return singleton4(k)(v);
        }
        ;
        if (v1 instanceof Node) {
          var v2 = compare23(k)(v1.value2);
          if (v2 instanceof LT) {
            return unsafeBalancedNode(v1.value2, v1.value3, go(v1.value4), v1.value5);
          }
          ;
          if (v2 instanceof GT) {
            return unsafeBalancedNode(v1.value2, v1.value3, v1.value4, go(v1.value5));
          }
          ;
          if (v2 instanceof EQ) {
            return new Node(v1.value0, v1.value1, k, v, v1.value4, v1.value5);
          }
          ;
          throw new Error("Failed pattern match at Data.Map.Internal (line 471, column 7 - line 474, column 35): " + [v2.constructor.name]);
        }
        ;
        throw new Error("Failed pattern match at Data.Map.Internal (line 468, column 8 - line 474, column 35): " + [v1.constructor.name]);
      };
      return go;
    };
  };
};
var functorMap = {
  map: function(f) {
    var go = function(v) {
      if (v instanceof Leaf) {
        return Leaf.value;
      }
      ;
      if (v instanceof Node) {
        return new Node(v.value0, v.value1, v.value2, f(v.value3), go(v.value4), go(v.value5));
      }
      ;
      throw new Error("Failed pattern match at Data.Map.Internal (line 147, column 10 - line 150, column 39): " + [v.constructor.name]);
    };
    return go;
  }
};
var foldableMap = {
  foldr: function(f) {
    return function(z) {
      var $lazy_go = $runtime_lazy2("go", "Data.Map.Internal", function() {
        return function(m$prime, z$prime) {
          if (m$prime instanceof Leaf) {
            return z$prime;
          }
          ;
          if (m$prime instanceof Node) {
            return $lazy_go(172)(m$prime.value4, f(m$prime.value3)($lazy_go(172)(m$prime.value5, z$prime)));
          }
          ;
          throw new Error("Failed pattern match at Data.Map.Internal (line 169, column 26 - line 172, column 43): " + [m$prime.constructor.name]);
        };
      });
      var go = $lazy_go(169);
      return function(m) {
        return go(m, z);
      };
    };
  },
  foldl: function(f) {
    return function(z) {
      var $lazy_go = $runtime_lazy2("go", "Data.Map.Internal", function() {
        return function(z$prime, m$prime) {
          if (m$prime instanceof Leaf) {
            return z$prime;
          }
          ;
          if (m$prime instanceof Node) {
            return $lazy_go(178)(f($lazy_go(178)(z$prime, m$prime.value4))(m$prime.value3), m$prime.value5);
          }
          ;
          throw new Error("Failed pattern match at Data.Map.Internal (line 175, column 26 - line 178, column 43): " + [m$prime.constructor.name]);
        };
      });
      var go = $lazy_go(175);
      return function(m) {
        return go(z, m);
      };
    };
  },
  foldMap: function(dictMonoid) {
    var mempty2 = mempty(dictMonoid);
    var append115 = append(dictMonoid.Semigroup0());
    return function(f) {
      var go = function(v) {
        if (v instanceof Leaf) {
          return mempty2;
        }
        ;
        if (v instanceof Node) {
          return append115(go(v.value4))(append115(f(v.value3))(go(v.value5)));
        }
        ;
        throw new Error("Failed pattern match at Data.Map.Internal (line 181, column 10 - line 184, column 28): " + [v.constructor.name]);
      };
      return go;
    };
  }
};
var foldableWithIndexMap = {
  foldrWithIndex: function(f) {
    return function(z) {
      var $lazy_go = $runtime_lazy2("go", "Data.Map.Internal", function() {
        return function(m$prime, z$prime) {
          if (m$prime instanceof Leaf) {
            return z$prime;
          }
          ;
          if (m$prime instanceof Node) {
            return $lazy_go(192)(m$prime.value4, f(m$prime.value2)(m$prime.value3)($lazy_go(192)(m$prime.value5, z$prime)));
          }
          ;
          throw new Error("Failed pattern match at Data.Map.Internal (line 189, column 26 - line 192, column 45): " + [m$prime.constructor.name]);
        };
      });
      var go = $lazy_go(189);
      return function(m) {
        return go(m, z);
      };
    };
  },
  foldlWithIndex: function(f) {
    return function(z) {
      var $lazy_go = $runtime_lazy2("go", "Data.Map.Internal", function() {
        return function(z$prime, m$prime) {
          if (m$prime instanceof Leaf) {
            return z$prime;
          }
          ;
          if (m$prime instanceof Node) {
            return $lazy_go(198)(f(m$prime.value2)($lazy_go(198)(z$prime, m$prime.value4))(m$prime.value3), m$prime.value5);
          }
          ;
          throw new Error("Failed pattern match at Data.Map.Internal (line 195, column 26 - line 198, column 45): " + [m$prime.constructor.name]);
        };
      });
      var go = $lazy_go(195);
      return function(m) {
        return go(z, m);
      };
    };
  },
  foldMapWithIndex: function(dictMonoid) {
    var mempty2 = mempty(dictMonoid);
    var append115 = append(dictMonoid.Semigroup0());
    return function(f) {
      var go = function(v) {
        if (v instanceof Leaf) {
          return mempty2;
        }
        ;
        if (v instanceof Node) {
          return append115(go(v.value4))(append115(f(v.value2)(v.value3))(go(v.value5)));
        }
        ;
        throw new Error("Failed pattern match at Data.Map.Internal (line 201, column 10 - line 204, column 30): " + [v.constructor.name]);
      };
      return go;
    };
  },
  Foldable0: function() {
    return foldableMap;
  }
};
var keys = /* @__PURE__ */ (function() {
  return foldrWithIndex(foldableWithIndexMap)(function(k) {
    return function(v) {
      return function(acc) {
        return new Cons(k, acc);
      };
    };
  })(Nil.value);
})();
var values = /* @__PURE__ */ (function() {
  return foldr(foldableMap)(Cons.create)(Nil.value);
})();
var empty2 = /* @__PURE__ */ (function() {
  return Leaf.value;
})();
var fromFoldable2 = function(dictOrd) {
  var insert113 = insert(dictOrd);
  return function(dictFoldable) {
    return foldl(dictFoldable)(function(m) {
      return function(v) {
        return insert113(v.value0)(v.value1)(m);
      };
    })(empty2);
  };
};
var difference = function(dictOrd) {
  var compare23 = compare(dictOrd);
  return function(m1) {
    return function(m2) {
      return unsafeDifference(compare23, m1, m2);
    };
  };
};
var $$delete = function(dictOrd) {
  var compare23 = compare(dictOrd);
  return function(k) {
    var go = function(v) {
      if (v instanceof Leaf) {
        return Leaf.value;
      }
      ;
      if (v instanceof Node) {
        var v1 = compare23(k)(v.value2);
        if (v1 instanceof LT) {
          return unsafeBalancedNode(v.value2, v.value3, go(v.value4), v.value5);
        }
        ;
        if (v1 instanceof GT) {
          return unsafeBalancedNode(v.value2, v.value3, v.value4, go(v.value5));
        }
        ;
        if (v1 instanceof EQ) {
          return unsafeJoinNodes(v.value4, v.value5);
        }
        ;
        throw new Error("Failed pattern match at Data.Map.Internal (line 498, column 7 - line 501, column 43): " + [v1.constructor.name]);
      }
      ;
      throw new Error("Failed pattern match at Data.Map.Internal (line 495, column 8 - line 501, column 43): " + [v.constructor.name]);
    };
    return go;
  };
};
var alter = function(dictOrd) {
  var compare23 = compare(dictOrd);
  return function(f) {
    return function(k) {
      return function(m) {
        var v = unsafeSplit(compare23, k, m);
        var v2 = f(v.value0);
        if (v2 instanceof Nothing) {
          return unsafeJoinNodes(v.value1, v.value2);
        }
        ;
        if (v2 instanceof Just) {
          return unsafeBalancedNode(k, v2.value0, v.value1, v.value2);
        }
        ;
        throw new Error("Failed pattern match at Data.Map.Internal (line 514, column 3 - line 518, column 41): " + [v2.constructor.name]);
      };
    };
  };
};

// ../markgraf/output/Data.String.Common/foreign.js
var split = function(sep) {
  return function(s) {
    return s.split(sep);
  };
};
var trim = function(s) {
  return s.trim();
};
var joinWith = function(s) {
  return function(xs) {
    return xs.join(s);
  };
};

// ../markgraf/output/Data.String.Common/index.js
var $$null2 = function(s) {
  return s === "";
};

// ../markgraf/output/Data.Int/foreign.js
var fromNumberImpl = function(just) {
  return function(nothing) {
    return function(n) {
      return (n | 0) === n ? just(n) : nothing;
    };
  };
};
var toNumber = function(n) {
  return n;
};
var fromStringAsImpl = function(just) {
  return function(nothing) {
    return function(radix) {
      var digits;
      if (radix < 11) {
        digits = "[0-" + (radix - 1).toString() + "]";
      } else if (radix === 11) {
        digits = "[0-9a]";
      } else {
        digits = "[0-9a-" + String.fromCharCode(86 + radix) + "]";
      }
      var pattern = new RegExp("^[\\+\\-]?" + digits + "+$", "i");
      return function(s) {
        if (pattern.test(s)) {
          var i = parseInt(s, radix);
          return (i | 0) === i ? just(i) : nothing;
        } else {
          return nothing;
        }
      };
    };
  };
};

// ../markgraf/output/Data.Number/foreign.js
var isFiniteImpl = isFinite;
var abs2 = Math.abs;
var ceil = Math.ceil;
var pow = function(n) {
  return function(p) {
    return Math.pow(n, p);
  };
};
var sqrt = Math.sqrt;

// ../markgraf/output/Data.Int/index.js
var top2 = /* @__PURE__ */ top(boundedInt);
var bottom2 = /* @__PURE__ */ bottom(boundedInt);
var fromStringAs = /* @__PURE__ */ (function() {
  return fromStringAsImpl(Just.create)(Nothing.value);
})();
var fromString = /* @__PURE__ */ fromStringAs(10);
var fromNumber = /* @__PURE__ */ (function() {
  return fromNumberImpl(Just.create)(Nothing.value);
})();
var unsafeClamp = function(x) {
  if (!isFiniteImpl(x)) {
    return 0;
  }
  ;
  if (x >= toNumber(top2)) {
    return top2;
  }
  ;
  if (x <= toNumber(bottom2)) {
    return bottom2;
  }
  ;
  if (otherwise) {
    return fromMaybe(0)(fromNumber(x));
  }
  ;
  throw new Error("Failed pattern match at Data.Int (line 72, column 1 - line 72, column 29): " + [x.constructor.name]);
};
var ceil2 = function($40) {
  return unsafeClamp(ceil($40));
};

// ../markgraf/output/Data.List/index.js
var map6 = /* @__PURE__ */ map(functorMaybe);
var bimap2 = /* @__PURE__ */ bimap(bifunctorStep);
var uncons2 = function(v) {
  if (v instanceof Nil) {
    return Nothing.value;
  }
  ;
  if (v instanceof Cons) {
    return new Just({
      head: v.value0,
      tail: v.value1
    });
  }
  ;
  throw new Error("Failed pattern match at Data.List (line 259, column 1 - line 259, column 66): " + [v.constructor.name]);
};
var toUnfoldable2 = function(dictUnfoldable) {
  return unfoldr(dictUnfoldable)(function(xs) {
    return map6(function(rec) {
      return new Tuple(rec.head, rec.tail);
    })(uncons2(xs));
  });
};
var reverse2 = /* @__PURE__ */ (function() {
  var go = function($copy_v) {
    return function($copy_v1) {
      var $tco_var_v = $copy_v;
      var $tco_done = false;
      var $tco_result;
      function $tco_loop(v, v1) {
        if (v1 instanceof Nil) {
          $tco_done = true;
          return v;
        }
        ;
        if (v1 instanceof Cons) {
          $tco_var_v = new Cons(v1.value0, v);
          $copy_v1 = v1.value1;
          return;
        }
        ;
        throw new Error("Failed pattern match at Data.List (line 368, column 3 - line 368, column 19): " + [v.constructor.name, v1.constructor.name]);
      }
      ;
      while (!$tco_done) {
        $tco_result = $tco_loop($tco_var_v, $copy_v1);
      }
      ;
      return $tco_result;
    };
  };
  return go(Nil.value);
})();
var manyRec = function(dictMonadRec) {
  var bind110 = bind(dictMonadRec.Monad0().Bind1());
  var tailRecM3 = tailRecM(dictMonadRec);
  return function(dictAlternative) {
    var Alt0 = dictAlternative.Plus1().Alt0();
    var alt5 = alt(Alt0);
    var map112 = map(Alt0.Functor0());
    var pure9 = pure(dictAlternative.Applicative0());
    return function(p) {
      var go = function(acc) {
        return bind110(alt5(map112(Loop.create)(p))(pure9(new Done(unit))))(function(aa) {
          return pure9(bimap2(function(v) {
            return new Cons(v, acc);
          })(function(v) {
            return reverse2(acc);
          })(aa));
        });
      };
      return tailRecM3(go)(Nil.value);
    };
  };
};

// ../markgraf/output/Data.Set/index.js
var coerce3 = /* @__PURE__ */ coerce();
var foldMap2 = /* @__PURE__ */ foldMap(foldableList);
var foldl3 = /* @__PURE__ */ foldl(foldableList);
var foldr2 = /* @__PURE__ */ foldr(foldableList);
var $$Set = function(x) {
  return x;
};
var union2 = function(dictOrd) {
  return coerce3(union(dictOrd));
};
var toList = function(v) {
  return keys(v);
};
var toUnfoldable3 = function(dictUnfoldable) {
  var $96 = toUnfoldable2(dictUnfoldable);
  return function($97) {
    return $96(toList($97));
  };
};
var size2 = /* @__PURE__ */ coerce3(size);
var singleton5 = function(a) {
  return singleton4(a)(unit);
};
var semigroupSet = function(dictOrd) {
  return {
    append: union2(dictOrd)
  };
};
var member2 = function(dictOrd) {
  return coerce3(member(dictOrd));
};
var isEmpty2 = /* @__PURE__ */ coerce3(isEmpty);
var intersection2 = function(dictOrd) {
  return coerce3(intersection(dictOrd));
};
var insert2 = function(dictOrd) {
  var insert113 = insert(dictOrd);
  return function(a) {
    return function(v) {
      return insert113(a)(unit)(v);
    };
  };
};
var fromMap = $$Set;
var foldableSet = {
  foldMap: function(dictMonoid) {
    var foldMap12 = foldMap2(dictMonoid);
    return function(f) {
      var $98 = foldMap12(f);
      return function($99) {
        return $98(toList($99));
      };
    };
  },
  foldl: function(f) {
    return function(x) {
      var $100 = foldl3(f)(x);
      return function($101) {
        return $100(toList($101));
      };
    };
  },
  foldr: function(f) {
    return function(x) {
      var $102 = foldr2(f)(x);
      return function($103) {
        return $102(toList($103));
      };
    };
  }
};
var empty3 = empty2;
var fromFoldable3 = function(dictFoldable) {
  var foldl28 = foldl(dictFoldable);
  return function(dictOrd) {
    var insert113 = insert2(dictOrd);
    return foldl28(function(m) {
      return function(a) {
        return insert113(a)(m);
      };
    })(empty3);
  };
};
var difference2 = function(dictOrd) {
  return coerce3(difference(dictOrd));
};
var $$delete2 = function(dictOrd) {
  return coerce3($$delete(dictOrd));
};

// ../markgraf/output/Data.String.CodeUnits/foreign.js
var fromCharArray = function(a) {
  return a.join("");
};
var toCharArray = function(s) {
  return s.split("");
};
var singleton6 = function(c) {
  return c;
};
var length2 = function(s) {
  return s.length;
};
var take2 = function(n) {
  return function(s) {
    return s.substr(0, n);
  };
};
var drop2 = function(n) {
  return function(s) {
    return s.substring(n);
  };
};
var splitAt = function(i) {
  return function(s) {
    return { before: s.substring(0, i), after: s.substring(i) };
  };
};

// ../markgraf/output/Data.String.Unsafe/foreign.js
var charAt = function(i) {
  return function(s) {
    if (i >= 0 && i < s.length) return s.charAt(i);
    throw new Error("Data.String.Unsafe.charAt: Invalid index.");
  };
};

// ../markgraf/output/Data.String.CodeUnits/index.js
var stripPrefix = function(v) {
  return function(str) {
    var v1 = splitAt(length2(v))(str);
    var $20 = v1.before === v;
    if ($20) {
      return new Just(v1.after);
    }
    ;
    return Nothing.value;
  };
};

// ../markgraf/output/Control.Monad.Error.Class/index.js
var throwError = function(dict) {
  return dict.throwError;
};

// ../markgraf/output/Control.Monad.State.Class/index.js
var state = function(dict) {
  return dict.state;
};
var put = function(dictMonadState) {
  var state1 = state(dictMonadState);
  return function(s) {
    return state1(function(v) {
      return new Tuple(unit, s);
    });
  };
};
var modify_ = function(dictMonadState) {
  var state1 = state(dictMonadState);
  return function(f) {
    return state1(function(s) {
      return new Tuple(unit, f(s));
    });
  };
};
var get = function(dictMonadState) {
  return state(dictMonadState)(function(s) {
    return new Tuple(s, s);
  });
};

// ../markgraf/output/Control.Monad.State.Trans/index.js
var functorStateT = function(dictFunctor) {
  var map31 = map(dictFunctor);
  return {
    map: function(f) {
      return function(v) {
        return function(s) {
          return map31(function(v1) {
            return new Tuple(f(v1.value0), v1.value1);
          })(v(s));
        };
      };
    }
  };
};
var monadStateT = function(dictMonad) {
  return {
    Applicative0: function() {
      return applicativeStateT(dictMonad);
    },
    Bind1: function() {
      return bindStateT(dictMonad);
    }
  };
};
var bindStateT = function(dictMonad) {
  var bind20 = bind(dictMonad.Bind1());
  return {
    bind: function(v) {
      return function(f) {
        return function(s) {
          return bind20(v(s))(function(v1) {
            var v3 = f(v1.value0);
            return v3(v1.value1);
          });
        };
      };
    },
    Apply0: function() {
      return applyStateT(dictMonad);
    }
  };
};
var applyStateT = function(dictMonad) {
  var functorStateT1 = functorStateT(dictMonad.Bind1().Apply0().Functor0());
  return {
    apply: ap(monadStateT(dictMonad)),
    Functor0: function() {
      return functorStateT1;
    }
  };
};
var applicativeStateT = function(dictMonad) {
  var pure9 = pure(dictMonad.Applicative0());
  return {
    pure: function(a) {
      return function(s) {
        return pure9(new Tuple(a, s));
      };
    },
    Apply0: function() {
      return applyStateT(dictMonad);
    }
  };
};
var monadStateStateT = function(dictMonad) {
  var pure9 = pure(dictMonad.Applicative0());
  var monadStateT1 = monadStateT(dictMonad);
  return {
    state: function(f) {
      return function($206) {
        return pure9(f($206));
      };
    },
    Monad0: function() {
      return monadStateT1;
    }
  };
};

// ../markgraf/output/Control.Monad.State/index.js
var evalState = function(v) {
  return function(s) {
    var v1 = v(s);
    return v1.value0;
  };
};

// ../markgraf/output/Data.Lazy/foreign.js
var defer2 = function(thunk) {
  var v = null;
  return function() {
    if (thunk === void 0) return v;
    v = thunk();
    thunk = void 0;
    return v;
  };
};
var force = function(l) {
  return l();
};

// ../markgraf/output/Data.Array.NonEmpty.Internal/index.js
var foldableNonEmptyArray = foldableArray;

// ../markgraf/output/Data.Enum/foreign.js
function toCharCode(c) {
  return c.charCodeAt(0);
}
function fromCharCode(c) {
  return String.fromCharCode(c);
}

// ../markgraf/output/Data.Enum/index.js
var bottom1 = /* @__PURE__ */ bottom(boundedChar);
var top1 = /* @__PURE__ */ top(boundedChar);
var toEnum = function(dict) {
  return dict.toEnum;
};
var fromEnum = function(dict) {
  return dict.fromEnum;
};
var toEnumWithDefaults = function(dictBoundedEnum) {
  var toEnum1 = toEnum(dictBoundedEnum);
  var fromEnum1 = fromEnum(dictBoundedEnum);
  var bottom22 = bottom(dictBoundedEnum.Bounded0());
  return function(low) {
    return function(high) {
      return function(x) {
        var v = toEnum1(x);
        if (v instanceof Just) {
          return v.value0;
        }
        ;
        if (v instanceof Nothing) {
          var $140 = x < fromEnum1(bottom22);
          if ($140) {
            return low;
          }
          ;
          return high;
        }
        ;
        throw new Error("Failed pattern match at Data.Enum (line 158, column 33 - line 160, column 62): " + [v.constructor.name]);
      };
    };
  };
};
var defaultSucc = function(toEnum$prime) {
  return function(fromEnum$prime) {
    return function(a) {
      return toEnum$prime(fromEnum$prime(a) + 1 | 0);
    };
  };
};
var defaultPred = function(toEnum$prime) {
  return function(fromEnum$prime) {
    return function(a) {
      return toEnum$prime(fromEnum$prime(a) - 1 | 0);
    };
  };
};
var charToEnum = function(v) {
  if (v >= toCharCode(bottom1) && v <= toCharCode(top1)) {
    return new Just(fromCharCode(v));
  }
  ;
  return Nothing.value;
};
var enumChar = {
  succ: /* @__PURE__ */ defaultSucc(charToEnum)(toCharCode),
  pred: /* @__PURE__ */ defaultPred(charToEnum)(toCharCode),
  Ord0: function() {
    return ordChar;
  }
};
var boundedEnumChar = /* @__PURE__ */ (function() {
  return {
    cardinality: toCharCode(top1) - toCharCode(bottom1) | 0,
    toEnum: charToEnum,
    fromEnum: toCharCode,
    Bounded0: function() {
      return boundedChar;
    },
    Enum1: function() {
      return enumChar;
    }
  };
})();

// ../markgraf/output/Foreign.Object/foreign.js
function toArrayWithKey(f) {
  return function(m) {
    var r = [];
    for (var k in m) {
      if (hasOwnProperty.call(m, k)) {
        r.push(f(k)(m[k]));
      }
    }
    return r;
  };
}
var keys2 = Object.keys || toArrayWithKey(function(k) {
  return function() {
    return k;
  };
});

// ../markgraf/output/JS.BigInt/foreign.js
var fromStringImpl2 = (just) => (nothing) => (s) => {
  try {
    var x = BigInt(s);
    return just(x);
  } catch (err) {
    return nothing;
  }
};
var fromNumberImpl2 = (just) => (nothing) => (n) => {
  try {
    var x = BigInt(n);
    return just(x);
  } catch (err) {
    return nothing;
  }
};
var fromInt = (n) => BigInt(n);
var toNumber2 = (n) => Number(n);
var biAdd = (x) => (y) => x + y;
var biMul = (x) => (y) => x * y;
var biSub = (x) => (y) => x - y;
var biZero = 0n;
var biOne = 1n;
var xor = (x) => (y) => x ^ y;
var and2 = (x) => (y) => x & y;
var shl = (x) => (n) => x << n;
var shr = (x) => (n) => x >> n;
var biEquals = (x) => (y) => x == y;
var biCompare = (x) => (y) => {
  if (x === y) return 0;
  else if (x > y) return 1;
  else return -1;
};

// ../markgraf/output/JS.BigInt/index.js
var semiringBigInt = {
  add: biAdd,
  zero: biZero,
  mul: biMul,
  one: biOne
};
var ringBigInt = {
  sub: biSub,
  Semiring0: function() {
    return semiringBigInt;
  }
};
var eqBigInt = {
  eq: biEquals
};
var ordBigInt = {
  compare: function(x) {
    return function(y) {
      var v = biCompare(x)(y);
      if (v === 1) {
        return GT.value;
      }
      ;
      if (v === 0) {
        return EQ.value;
      }
      ;
      return LT.value;
    };
  },
  Eq0: function() {
    return eqBigInt;
  }
};
var fromString2 = /* @__PURE__ */ (function() {
  return fromStringImpl2(Just.create)(Nothing.value);
})();
var fromNumber2 = /* @__PURE__ */ (function() {
  return fromNumberImpl2(Just.create)(Nothing.value);
})();

// ../markgraf/output/Markgraf.Grid/index.js
var ordTuple2 = /* @__PURE__ */ ordTuple(ordNumber)(ordNumber);
var eqTuple2 = /* @__PURE__ */ eqTuple(eqNumber)(eqNumber);
var un2 = /* @__PURE__ */ un();
var GridSize = function(x) {
  return x;
};
var GridPos = function(x) {
  return x;
};
var ordGridPos = ordTuple2;
var eqGridSize = eqTuple2;
var sizeW = function(s) {
  var v = un2(GridSize)(s);
  return v.value0;
};
var sizeH = function(s) {
  var v = un2(GridSize)(s);
  return v.value1;
};
var gridY = function(p) {
  var v = un2(GridPos)(p);
  return v.value1;
};
var gridX = function(p) {
  var v = un2(GridPos)(p);
  return v.value0;
};
var manhattan = function(a) {
  return function(b) {
    return abs2(gridX(a) - gridX(b)) + abs2(gridY(a) - gridY(b));
  };
};
var overlaps = function(r1) {
  return function(r2) {
    var y2 = gridY(r2.pos);
    var y1 = gridY(r1.pos);
    var x2 = gridX(r2.pos);
    var x1 = gridX(r1.pos);
    var w2 = sizeW(r2.size);
    var w1 = sizeW(r1.size);
    var xOverlap = x1 < x2 + w2 && x2 < x1 + w1;
    var h2 = sizeH(r2.size);
    var h1 = sizeH(r1.size);
    var yOverlap = y1 < y2 + h2 && y2 < y1 + h1;
    return xOverlap && yOverlap;
  };
};

// ../markgraf/output/Markgraf.Graph/index.js
var North = /* @__PURE__ */ (function() {
  function North2() {
  }
  ;
  North2.value = new North2();
  return North2;
})();
var South = /* @__PURE__ */ (function() {
  function South2() {
  }
  ;
  South2.value = new South2();
  return South2;
})();
var East = /* @__PURE__ */ (function() {
  function East2() {
  }
  ;
  East2.value = new East2();
  return East2;
})();
var West = /* @__PURE__ */ (function() {
  function West2() {
  }
  ;
  West2.value = new West2();
  return West2;
})();
var Rectangle = /* @__PURE__ */ (function() {
  function Rectangle2() {
  }
  ;
  Rectangle2.value = new Rectangle2();
  return Rectangle2;
})();
var Cylinder = /* @__PURE__ */ (function() {
  function Cylinder2() {
  }
  ;
  Cylinder2.value = new Cylinder2();
  return Cylinder2;
})();
var Parallelogram = /* @__PURE__ */ (function() {
  function Parallelogram2() {
  }
  ;
  Parallelogram2.value = new Parallelogram2();
  return Parallelogram2;
})();
var Diamond = /* @__PURE__ */ (function() {
  function Diamond2() {
  }
  ;
  Diamond2.value = new Diamond2();
  return Diamond2;
})();
var Ellipse = /* @__PURE__ */ (function() {
  function Ellipse2() {
  }
  ;
  Ellipse2.value = new Ellipse2();
  return Ellipse2;
})();
var Document = /* @__PURE__ */ (function() {
  function Document2() {
  }
  ;
  Document2.value = new Document2();
  return Document2;
})();
var Cloud = /* @__PURE__ */ (function() {
  function Cloud2() {
  }
  ;
  Cloud2.value = new Cloud2();
  return Cloud2;
})();
var PortId = function(x) {
  return x;
};
var NodeId = function(x) {
  return x;
};
var FirstLayer = /* @__PURE__ */ (function() {
  function FirstLayer2() {
  }
  ;
  FirstLayer2.value = new FirstLayer2();
  return FirstLayer2;
})();
var LastLayer = /* @__PURE__ */ (function() {
  function LastLayer2() {
  }
  ;
  LastLayer2.value = new LastLayer2();
  return LastLayer2;
})();
var SpecificLayer = /* @__PURE__ */ (function() {
  function SpecificLayer2(value0) {
    this.value0 = value0;
  }
  ;
  SpecificLayer2.create = function(value0) {
    return new SpecificLayer2(value0);
  };
  return SpecificLayer2;
})();
var Label = function(x) {
  return x;
};
var EdgeId = function(x) {
  return x;
};
var Horizontal = /* @__PURE__ */ (function() {
  function Horizontal2() {
  }
  ;
  Horizontal2.value = new Horizontal2();
  return Horizontal2;
})();
var Vertical = /* @__PURE__ */ (function() {
  function Vertical2() {
  }
  ;
  Vertical2.value = new Vertical2();
  return Vertical2;
})();
var Start = /* @__PURE__ */ (function() {
  function Start2() {
  }
  ;
  Start2.value = new Start2();
  return Start2;
})();
var Center = /* @__PURE__ */ (function() {
  function Center2() {
  }
  ;
  Center2.value = new Center2();
  return Center2;
})();
var End = /* @__PURE__ */ (function() {
  function End2() {
  }
  ;
  End2.value = new End2();
  return End2;
})();
var AlignGroup = /* @__PURE__ */ (function() {
  function AlignGroup2(value0) {
    this.value0 = value0;
  }
  ;
  AlignGroup2.create = function(value0) {
    return new AlignGroup2(value0);
  };
  return AlignGroup2;
})();
var SameLayer = /* @__PURE__ */ (function() {
  function SameLayer2(value0) {
    this.value0 = value0;
  }
  ;
  SameLayer2.create = function(value0) {
    return new SameLayer2(value0);
  };
  return SameLayer2;
})();
var LayerConstraint = /* @__PURE__ */ (function() {
  function LayerConstraint2(value0) {
    this.value0 = value0;
  }
  ;
  LayerConstraint2.create = function(value0) {
    return new LayerConstraint2(value0);
  };
  return LayerConstraint2;
})();
var OrderConstraint = /* @__PURE__ */ (function() {
  function OrderConstraint2(value0) {
    this.value0 = value0;
  }
  ;
  OrderConstraint2.create = function(value0) {
    return new OrderConstraint2(value0);
  };
  return OrderConstraint2;
})();
var RelativePosition = /* @__PURE__ */ (function() {
  function RelativePosition2(value0) {
    this.value0 = value0;
  }
  ;
  RelativePosition2.create = function(value0) {
    return new RelativePosition2(value0);
  };
  return RelativePosition2;
})();
var ordPortId = ordString;
var ordNodeId = ordString;
var ordEdgeId = ordString;
var eqSide = {
  eq: function(x) {
    return function(y) {
      if (x instanceof North && y instanceof North) {
        return true;
      }
      ;
      if (x instanceof South && y instanceof South) {
        return true;
      }
      ;
      if (x instanceof East && y instanceof East) {
        return true;
      }
      ;
      if (x instanceof West && y instanceof West) {
        return true;
      }
      ;
      return false;
    };
  }
};
var ordSide = {
  compare: function(x) {
    return function(y) {
      if (x instanceof North && y instanceof North) {
        return EQ.value;
      }
      ;
      if (x instanceof North) {
        return LT.value;
      }
      ;
      if (y instanceof North) {
        return GT.value;
      }
      ;
      if (x instanceof South && y instanceof South) {
        return EQ.value;
      }
      ;
      if (x instanceof South) {
        return LT.value;
      }
      ;
      if (y instanceof South) {
        return GT.value;
      }
      ;
      if (x instanceof East && y instanceof East) {
        return EQ.value;
      }
      ;
      if (x instanceof East) {
        return LT.value;
      }
      ;
      if (y instanceof East) {
        return GT.value;
      }
      ;
      if (x instanceof West && y instanceof West) {
        return EQ.value;
      }
      ;
      throw new Error("Failed pattern match at Markgraf.Graph (line 0, column 0 - line 0, column 0): " + [x.constructor.name, y.constructor.name]);
    };
  },
  Eq0: function() {
    return eqSide;
  }
};
var eqPortId = eqString;
var eqNodeId = eqString;
var eqEdgeId = eqString;
var parseShape = function(s) {
  if (s === "rectangle") {
    return new Just(Rectangle.value);
  }
  ;
  if (s === "rect") {
    return new Just(Rectangle.value);
  }
  ;
  if (s === "cylinder") {
    return new Just(Cylinder.value);
  }
  ;
  if (s === "cyl") {
    return new Just(Cylinder.value);
  }
  ;
  if (s === "parallelogram") {
    return new Just(Parallelogram.value);
  }
  ;
  if (s === "diamond") {
    return new Just(Diamond.value);
  }
  ;
  if (s === "ellipse") {
    return new Just(Ellipse.value);
  }
  ;
  if (s === "document") {
    return new Just(Document.value);
  }
  ;
  if (s === "doc") {
    return new Just(Document.value);
  }
  ;
  if (s === "cloud") {
    return new Just(Cloud.value);
  }
  ;
  return Nothing.value;
};
var documentWaveDrop = 0.05;
var cylinderBottomDrop = 5;
var cloudHatRatio = 0.38;
var silhouetteOverflow = function(shape) {
  return function(_w) {
    return function(h) {
      var none = {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      };
      if (shape instanceof Cloud) {
        return {
          bottom: none.bottom,
          left: none.left,
          right: none.right,
          top: h * cloudHatRatio
        };
      }
      ;
      if (shape instanceof Cylinder) {
        return {
          top: none.top,
          left: none.left,
          right: none.right,
          bottom: cylinderBottomDrop
        };
      }
      ;
      if (shape instanceof Document) {
        return {
          top: none.top,
          left: none.left,
          right: none.right,
          bottom: h * documentWaveDrop
        };
      }
      ;
      return none;
    };
  };
};

// ../markgraf/output/Markgraf.Animation.Spec/index.js
var append3 = /* @__PURE__ */ append(/* @__PURE__ */ semigroupSet(ordNodeId));
var append1 = /* @__PURE__ */ append(/* @__PURE__ */ semigroupSet(ordEdgeId));
var foldr3 = /* @__PURE__ */ foldr(foldableArray);
var map12 = /* @__PURE__ */ map(functorArray);
var difference4 = /* @__PURE__ */ difference2(ordNodeId);
var difference1 = /* @__PURE__ */ difference2(ordEdgeId);
var intersection3 = /* @__PURE__ */ intersection2(ordNodeId);
var intersection1 = /* @__PURE__ */ intersection2(ordEdgeId);
var Animated = /* @__PURE__ */ (function() {
  function Animated2() {
  }
  ;
  Animated2.value = new Animated2();
  return Animated2;
})();
var StaticStill = /* @__PURE__ */ (function() {
  function StaticStill2() {
  }
  ;
  StaticStill2.value = new StaticStill2();
  return StaticStill2;
})();
var TitleCard = /* @__PURE__ */ (function() {
  function TitleCard2() {
  }
  ;
  TitleCard2.value = new TitleCard2();
  return TitleCard2;
})();
var KeyframeId = function(x) {
  return x;
};
var First2 = /* @__PURE__ */ (function() {
  function First3() {
  }
  ;
  First3.value = new First3();
  return First3;
})();
var After = /* @__PURE__ */ (function() {
  function After2(value0) {
    this.value0 = value0;
  }
  ;
  After2.create = function(value0) {
    return new After2(value0);
  };
  return After2;
})();
var With = /* @__PURE__ */ (function() {
  function With2(value0) {
    this.value0 = value0;
  }
  ;
  With2.create = function(value0) {
    return new With2(value0);
  };
  return With2;
})();
var At = /* @__PURE__ */ (function() {
  function At2(value0) {
    this.value0 = value0;
  }
  ;
  At2.create = function(value0) {
    return new At2(value0);
  };
  return At2;
})();
var Forward = /* @__PURE__ */ (function() {
  function Forward2() {
  }
  ;
  Forward2.value = new Forward2();
  return Forward2;
})();
var Backward = /* @__PURE__ */ (function() {
  function Backward2() {
  }
  ;
  Backward2.value = new Backward2();
  return Backward2;
})();
var SendToken = /* @__PURE__ */ (function() {
  function SendToken2(value0) {
    this.value0 = value0;
  }
  ;
  SendToken2.create = function(value0) {
    return new SendToken2(value0);
  };
  return SendToken2;
})();
var FillNodeWithoutTransition = /* @__PURE__ */ (function() {
  function FillNodeWithoutTransition2(value0) {
    this.value0 = value0;
  }
  ;
  FillNodeWithoutTransition2.create = function(value0) {
    return new FillNodeWithoutTransition2(value0);
  };
  return FillNodeWithoutTransition2;
})();
var Structural = /* @__PURE__ */ (function() {
  function Structural2(value0) {
    this.value0 = value0;
  }
  ;
  Structural2.create = function(value0) {
    return new Structural2(value0);
  };
  return Structural2;
})();
var DataFlow = /* @__PURE__ */ (function() {
  function DataFlow2(value0) {
    this.value0 = value0;
  }
  ;
  DataFlow2.create = function(value0) {
    return new DataFlow2(value0);
  };
  return DataFlow2;
})();
var EnterNode = /* @__PURE__ */ (function() {
  function EnterNode2(value0) {
    this.value0 = value0;
  }
  ;
  EnterNode2.create = function(value0) {
    return new EnterNode2(value0);
  };
  return EnterNode2;
})();
var ExitNode = /* @__PURE__ */ (function() {
  function ExitNode2() {
  }
  ;
  ExitNode2.value = new ExitNode2();
  return ExitNode2;
})();
var Hold = /* @__PURE__ */ (function() {
  function Hold3(value0) {
    this.value0 = value0;
  }
  ;
  Hold3.create = function(value0) {
    return new Hold3(value0);
  };
  return Hold3;
})();
var Interiors = function(x) {
  return x;
};
var ordKeyframeId = ordString;
var fromFoldable6 = /* @__PURE__ */ fromFoldable2(ordKeyframeId)(foldableArray);
var ordEventId = ordString;
var eqKeyframeKind = {
  eq: function(x) {
    return function(y) {
      if (x instanceof Animated && y instanceof Animated) {
        return true;
      }
      ;
      if (x instanceof StaticStill && y instanceof StaticStill) {
        return true;
      }
      ;
      if (x instanceof TitleCard && y instanceof TitleCard) {
        return true;
      }
      ;
      return false;
    };
  }
};
var eqKeyframeId = eqString;
var eqEventId = eqString;
var eq6 = /* @__PURE__ */ eq(eqEventId);
var eqSchedule = {
  eq: function(x) {
    return function(y) {
      if (x instanceof First2 && y instanceof First2) {
        return true;
      }
      ;
      if (x instanceof After && y instanceof After) {
        return eq6(x.value0)(y.value0);
      }
      ;
      if (x instanceof With && y instanceof With) {
        return eq6(x.value0)(y.value0);
      }
      ;
      if (x instanceof At && y instanceof At) {
        return x.value0 === y.value0;
      }
      ;
      return false;
    };
  }
};
var union4 = function(animation) {
  var step2 = function(kf) {
    return function(acc) {
      return {
        nodes: append3(kf.nodes)(acc.nodes),
        edges: append1(kf.edges)(acc.edges)
      };
    };
  };
  return foldr3(step2)({
    nodes: empty3,
    edges: empty3
  })(animation.keyframes);
};
var keyframeById = function(animation) {
  var indexed = function(kf) {
    return new Tuple(kf.id, kf);
  };
  return fromFoldable6(map12(indexed)(animation.keyframes));
};
var delta = function(from2) {
  return function(to2) {
    return {
      entering: {
        nodes: difference4(to2.nodes)(from2.nodes),
        edges: difference1(to2.edges)(from2.edges)
      },
      leaving: {
        nodes: difference4(from2.nodes)(to2.nodes),
        edges: difference1(from2.edges)(to2.edges)
      },
      surviving: {
        nodes: intersection3(from2.nodes)(to2.nodes),
        edges: intersection1(from2.edges)(to2.edges)
      }
    };
  };
};

// ../markgraf/output/Markgraf.AutoSize/index.js
var un3 = /* @__PURE__ */ un();
var mapFlipped2 = /* @__PURE__ */ mapFlipped(functorArray);
var foldl4 = /* @__PURE__ */ foldl(foldableArray);
var div2 = /* @__PURE__ */ div(euclideanRingInt);
var max3 = /* @__PURE__ */ max(ordInt);
var min3 = /* @__PURE__ */ min(ordInt);
var notEq4 = /* @__PURE__ */ notEq(eqGridSize);
var max1 = /* @__PURE__ */ max(ordNumber);
var lookup4 = /* @__PURE__ */ lookup(ordNodeId);
var map7 = /* @__PURE__ */ map(functorArray);
var trimEnds = function(s) {
  var chars = toCharArray(s);
  var trimLeft = dropWhile(function(v) {
    return v === " ";
  })(chars);
  var trimRight = dropWhile(function(v) {
    return v === " ";
  })(reverse(trimLeft));
  return fromCharArray(reverse(trimRight));
};
var resolveLabel = function(node) {
  if (node.label instanceof Just) {
    return node.label.value0;
  }
  ;
  if (node.label instanceof Nothing) {
    return un3(NodeId)(node.id);
  }
  ;
  throw new Error("Failed pattern match at Markgraf.AutoSize (line 104, column 21 - line 106, column 31): " + [node.label.constructor.name]);
};
var isBreakChar = function(c) {
  return c === " " || (c === "-" || (c === "_" || c === "."));
};
var lastBreakIndex = function(chars) {
  var go = function(acc) {
    return function(v) {
      var $38 = v.value0 > 0 && isBreakChar(v.value1);
      if ($38) {
        return new Just(v.value0);
      }
      ;
      return acc;
    };
  };
  return foldl4(go)(Nothing.value)(mapWithIndex2(Tuple.create)(chars));
};
var wrapLine = function(maxW) {
  return function(text) {
    if (maxW <= 0) {
      return [text];
    }
    ;
    if (length2(text) <= maxW) {
      return [text];
    }
    ;
    if (otherwise) {
      var window = take(maxW)(toCharArray(text));
      var v = lastBreakIndex(window);
      if (v instanceof Just) {
        var ch = fromMaybe(" ")(index(window)(v.value0));
        var takeN = (function() {
          var $44 = ch === " ";
          if ($44) {
            return v.value0;
          }
          ;
          return v.value0 + 1 | 0;
        })();
        var dropN = v.value0 + 1 | 0;
        var line = trimEnds(take2(takeN)(text));
        var rest = trimEnds(drop2(dropN)(text));
        var $45 = rest === "";
        if ($45) {
          return [line];
        }
        ;
        return cons(line)(wrapLine(maxW)(rest));
      }
      ;
      if (v instanceof Nothing) {
        var line = take2(maxW)(text);
        var rest = drop2(maxW)(text);
        var $47 = rest === "";
        if ($47) {
          return [line];
        }
        ;
        return cons(line)(wrapLine(maxW)(rest));
      }
      ;
      throw new Error("Failed pattern match at Markgraf.AutoSize (line 127, column 7 - line 140, column 48): " + [v.constructor.name]);
    }
    ;
    throw new Error("Failed pattern match at Markgraf.AutoSize (line 121, column 1 - line 121, column 42): " + [maxW.constructor.name, text.constructor.name]);
  };
};
var wrapText = function(maxW) {
  return function(text) {
    return concatMap(wrapLine(maxW))(split("\n")(text));
  };
};
var gridWidthForChars = function(cellW) {
  return function(chars) {
    return div2((chars + 2 | 0) + cellW | 0)(cellW);
  };
};
var gridHeightForLines = function(cellH) {
  return function(numLines) {
    return max3(1)(div2(numLines + cellH | 0)(cellH));
  };
};
var defaultAutoSizeConfig = {
  cellW: 7,
  cellH: 3,
  maxLineWidth: 20
};
var autoSize = function(cfg) {
  return function(graph) {
    var resolved = mapFlipped2(graph.nodes)(function(n) {
      return new Tuple(resolveLabel(n), n);
    });
    var maxLabelLen = foldl4(function(mx) {
      return function(v) {
        return max3(mx)(length2(v.value0));
      };
    })(0)(resolved);
    var stdCharWidth = min3(cfg.maxLineWidth)(maxLabelLen);
    var stdGridW = max3(1)(gridWidthForChars(cfg.cellW)(stdCharWidth));
    var stdInterior = (stdGridW * cfg.cellW | 0) - 1 | 0;
    var sizedNodes = mapFlipped2(resolved)(function(v) {
      var $52 = notEq4(v.value1.size)(new Tuple(1, 1));
      if ($52) {
        return v.value1;
      }
      ;
      var lines = wrapText(stdInterior)(v.value0);
      var numLines = length(lines);
      var longestLine = foldl4(function(mx) {
        return function(l) {
          return max3(mx)(length2(l));
        };
      })(0)(lines);
      var baseGridW = (function() {
        if (v.value1.shape instanceof Cylinder) {
          return max3(1)(gridWidthForChars(cfg.cellW)(longestLine));
        }
        ;
        return stdGridW;
      })();
      var gridW = (function() {
        var $54 = longestLine > stdInterior;
        if ($54) {
          return gridWidthForChars(cfg.cellW)(longestLine);
        }
        ;
        return baseGridW;
      })();
      var shapeExtraH = (function() {
        if (v.value1.shape instanceof Cylinder) {
          return 1;
        }
        ;
        if (v.value1.shape instanceof Document) {
          return 1;
        }
        ;
        return 0;
      })();
      var gridH = gridHeightForLines(cfg.cellH)(numLines) + shapeExtraH | 0;
      return {
        id: v.value1.id,
        label: v.value1.label,
        ports: v.value1.ports,
        shape: v.value1.shape,
        size: new Tuple(toNumber(gridW), toNumber(gridH))
      };
    });
    return {
      edges: graph.edges,
      constraints: graph.constraints,
      nodes: sizedNodes
    };
  };
};
var applyMeasuredWidths = function(cellPx2) {
  return function(widths) {
    return function(graph) {
      var grown = function(padding) {
        return function(size4) {
          return function(px) {
            var neededCells = max3(1)(ceil2((px + padding) / cellPx2));
            var newW = max1(sizeW(size4))(toNumber(neededCells));
            return new Tuple(newW, sizeH(size4));
          };
        };
      };
      var paddingFor = function(n) {
        if (n.shape instanceof Cylinder) {
          return 0;
        }
        ;
        return 32;
      };
      var adjust = function(n) {
        var v = lookup4(n.id)(widths);
        if (v instanceof Nothing) {
          return n;
        }
        ;
        if (v instanceof Just) {
          return {
            id: n.id,
            shape: n.shape,
            label: n.label,
            ports: n.ports,
            size: grown(paddingFor(n))(n.size)(v.value0)
          };
        }
        ;
        throw new Error("Failed pattern match at Markgraf.AutoSize (line 95, column 14 - line 97, column 59): " + [v.constructor.name]);
      };
      return {
        edges: graph.edges,
        constraints: graph.constraints,
        nodes: map7(adjust)(graph.nodes)
      };
    };
  };
};

// ../markgraf/output/Data.String.CodePoints/foreign.js
var hasArrayFrom = typeof Array.from === "function";
var hasStringIterator = typeof Symbol !== "undefined" && Symbol != null && typeof Symbol.iterator !== "undefined" && typeof String.prototype[Symbol.iterator] === "function";
var hasFromCodePoint = typeof String.prototype.fromCodePoint === "function";
var hasCodePointAt = typeof String.prototype.codePointAt === "function";
var _unsafeCodePointAt0 = function(fallback) {
  return hasCodePointAt ? function(str) {
    return str.codePointAt(0);
  } : fallback;
};
var _codePointAt = function(fallback) {
  return function(Just2) {
    return function(Nothing2) {
      return function(unsafeCodePointAt02) {
        return function(index3) {
          return function(str) {
            var length6 = str.length;
            if (index3 < 0 || index3 >= length6) return Nothing2;
            if (hasStringIterator) {
              var iter = str[Symbol.iterator]();
              for (var i = index3; ; --i) {
                var o = iter.next();
                if (o.done) return Nothing2;
                if (i === 0) return Just2(unsafeCodePointAt02(o.value));
              }
            }
            return fallback(index3)(str);
          };
        };
      };
    };
  };
};
var _singleton = function(fallback) {
  return hasFromCodePoint ? String.fromCodePoint : fallback;
};
var _take = function(fallback) {
  return function(n) {
    if (hasStringIterator) {
      return function(str) {
        var accum = "";
        var iter = str[Symbol.iterator]();
        for (var i = 0; i < n; ++i) {
          var o = iter.next();
          if (o.done) return accum;
          accum += o.value;
        }
        return accum;
      };
    }
    return fallback(n);
  };
};
var _toCodePointArray = function(fallback) {
  return function(unsafeCodePointAt02) {
    if (hasArrayFrom) {
      return function(str) {
        return Array.from(str, unsafeCodePointAt02);
      };
    }
    return fallback;
  };
};

// ../markgraf/output/Data.String.CodePoints/index.js
var $runtime_lazy3 = function(name2, moduleName, init3) {
  var state2 = 0;
  var val;
  return function(lineNumber) {
    if (state2 === 2) return val;
    if (state2 === 1) throw new ReferenceError(name2 + " was needed before it finished initializing (module " + moduleName + ", line " + lineNumber + ")", moduleName, lineNumber);
    state2 = 1;
    val = init3();
    state2 = 2;
    return val;
  };
};
var fromEnum2 = /* @__PURE__ */ fromEnum(boundedEnumChar);
var map8 = /* @__PURE__ */ map(functorMaybe);
var unfoldr2 = /* @__PURE__ */ unfoldr(unfoldableArray);
var div3 = /* @__PURE__ */ div(euclideanRingInt);
var mod2 = /* @__PURE__ */ mod(euclideanRingInt);
var compare2 = /* @__PURE__ */ compare(ordInt);
var unsurrogate = function(lead) {
  return function(trail) {
    return (((lead - 55296 | 0) * 1024 | 0) + (trail - 56320 | 0) | 0) + 65536 | 0;
  };
};
var isTrail = function(cu) {
  return 56320 <= cu && cu <= 57343;
};
var isLead = function(cu) {
  return 55296 <= cu && cu <= 56319;
};
var uncons5 = function(s) {
  var v = length2(s);
  if (v === 0) {
    return Nothing.value;
  }
  ;
  if (v === 1) {
    return new Just({
      head: fromEnum2(charAt(0)(s)),
      tail: ""
    });
  }
  ;
  var cu1 = fromEnum2(charAt(1)(s));
  var cu0 = fromEnum2(charAt(0)(s));
  var $43 = isLead(cu0) && isTrail(cu1);
  if ($43) {
    return new Just({
      head: unsurrogate(cu0)(cu1),
      tail: drop2(2)(s)
    });
  }
  ;
  return new Just({
    head: cu0,
    tail: drop2(1)(s)
  });
};
var unconsButWithTuple = function(s) {
  return map8(function(v) {
    return new Tuple(v.head, v.tail);
  })(uncons5(s));
};
var toCodePointArrayFallback = function(s) {
  return unfoldr2(unconsButWithTuple)(s);
};
var unsafeCodePointAt0Fallback = function(s) {
  var cu0 = fromEnum2(charAt(0)(s));
  var $47 = isLead(cu0) && length2(s) > 1;
  if ($47) {
    var cu1 = fromEnum2(charAt(1)(s));
    var $48 = isTrail(cu1);
    if ($48) {
      return unsurrogate(cu0)(cu1);
    }
    ;
    return cu0;
  }
  ;
  return cu0;
};
var unsafeCodePointAt0 = /* @__PURE__ */ _unsafeCodePointAt0(unsafeCodePointAt0Fallback);
var toCodePointArray = /* @__PURE__ */ _toCodePointArray(toCodePointArrayFallback)(unsafeCodePointAt0);
var length5 = function($74) {
  return length(toCodePointArray($74));
};
var fromCharCode2 = /* @__PURE__ */ (function() {
  var $75 = toEnumWithDefaults(boundedEnumChar)(bottom(boundedChar))(top(boundedChar));
  return function($76) {
    return singleton6($75($76));
  };
})();
var singletonFallback = function(v) {
  if (v <= 65535) {
    return fromCharCode2(v);
  }
  ;
  var lead = div3(v - 65536 | 0)(1024) + 55296 | 0;
  var trail = mod2(v - 65536 | 0)(1024) + 56320 | 0;
  return fromCharCode2(lead) + fromCharCode2(trail);
};
var singleton9 = /* @__PURE__ */ _singleton(singletonFallback);
var takeFallback = function(v) {
  return function(v1) {
    if (v < 1) {
      return "";
    }
    ;
    var v2 = uncons5(v1);
    if (v2 instanceof Just) {
      return singleton9(v2.value0.head) + takeFallback(v - 1 | 0)(v2.value0.tail);
    }
    ;
    return v1;
  };
};
var take4 = /* @__PURE__ */ _take(takeFallback);
var eqCodePoint = {
  eq: function(x) {
    return function(y) {
      return x === y;
    };
  }
};
var ordCodePoint = {
  compare: function(x) {
    return function(y) {
      return compare2(x)(y);
    };
  },
  Eq0: function() {
    return eqCodePoint;
  }
};
var codePointAtFallback = function($copy_n) {
  return function($copy_s) {
    var $tco_var_n = $copy_n;
    var $tco_done = false;
    var $tco_result;
    function $tco_loop(n, s) {
      var v = uncons5(s);
      if (v instanceof Just) {
        var $66 = n === 0;
        if ($66) {
          $tco_done = true;
          return new Just(v.value0.head);
        }
        ;
        $tco_var_n = n - 1 | 0;
        $copy_s = v.value0.tail;
        return;
      }
      ;
      $tco_done = true;
      return Nothing.value;
    }
    ;
    while (!$tco_done) {
      $tco_result = $tco_loop($tco_var_n, $copy_s);
    }
    ;
    return $tco_result;
  };
};
var codePointAt = function(v) {
  return function(v1) {
    if (v < 0) {
      return Nothing.value;
    }
    ;
    if (v === 0 && v1 === "") {
      return Nothing.value;
    }
    ;
    if (v === 0) {
      return new Just(unsafeCodePointAt0(v1));
    }
    ;
    return _codePointAt(codePointAtFallback)(Just.create)(Nothing.value)(unsafeCodePointAt0)(v)(v1);
  };
};
var boundedCodePoint = {
  bottom: 0,
  top: 1114111,
  Ord0: function() {
    return ordCodePoint;
  }
};
var boundedEnumCodePoint = /* @__PURE__ */ (function() {
  return {
    cardinality: 1114111 + 1 | 0,
    fromEnum: function(v) {
      return v;
    },
    toEnum: function(n) {
      if (n >= 0 && n <= 1114111) {
        return new Just(n);
      }
      ;
      if (otherwise) {
        return Nothing.value;
      }
      ;
      throw new Error("Failed pattern match at Data.String.CodePoints (line 63, column 1 - line 68, column 26): " + [n.constructor.name]);
    },
    Bounded0: function() {
      return boundedCodePoint;
    },
    Enum1: function() {
      return $lazy_enumCodePoint(0);
    }
  };
})();
var $lazy_enumCodePoint = /* @__PURE__ */ $runtime_lazy3("enumCodePoint", "Data.String.CodePoints", function() {
  return {
    succ: defaultSucc(toEnum(boundedEnumCodePoint))(fromEnum(boundedEnumCodePoint)),
    pred: defaultPred(toEnum(boundedEnumCodePoint))(fromEnum(boundedEnumCodePoint)),
    Ord0: function() {
      return ordCodePoint;
    }
  };
});

// ../markgraf/output/Markgraf.Layout.DummyNodes/index.js
var un4 = /* @__PURE__ */ un();
var lookup5 = /* @__PURE__ */ lookup(ordNodeId);
var append4 = /* @__PURE__ */ append(semigroupArray);
var mapFlipped3 = /* @__PURE__ */ mapFlipped(functorArray);
var show2 = /* @__PURE__ */ show(showInt);
var foldl5 = /* @__PURE__ */ foldl(foldableArray);
var isDummy = function(nid) {
  return take4(3)(un4(NodeId)(nid)) === "$d:";
};
var insertDummies = function(nodeLayer) {
  return function(edges) {
    return function(layers) {
      var processEdge = function(acc) {
        return function(edge) {
          var fromLayer = fromMaybe(0)(lookup5(edge.from.node)(nodeLayer));
          var toLayer = fromMaybe(0)(lookup5(edge.to.node)(nodeLayer));
          var span3 = toLayer - fromLayer | 0;
          var $14 = span3 <= 1;
          if ($14) {
            return {
              layers: acc.layers,
              edges: append4(acc.edges)([edge]),
              chains: append4(acc.chains)([{
                edgeId: edge.id,
                nodes: [edge.from.node, edge.to.node]
              }])
            };
          }
          ;
          var edgeKey2 = un4(EdgeId)(edge.id);
          var dummyIds = mapFlipped3(range2(1)(span3 - 1 | 0))(function(i) {
            return "$d:" + (edgeKey2 + (":" + show2(i)));
          });
          var allIds = append4([edge.from.node])(append4(dummyIds)([edge.to.node]));
          var newEdges = zipWith(function(a) {
            return function(b) {
              return {
                id: edgeKey2 + (":" + (un4(NodeId)(a) + ("->" + un4(NodeId)(b)))),
                from: {
                  node: a,
                  port: edge.from.port
                },
                to: {
                  node: b,
                  port: edge.to.port
                },
                label: Nothing.value
              };
            };
          })(allIds)(drop(1)(allIds));
          var newLayers = foldl5(function(ls) {
            return function(v) {
              var layerIdx = fromLayer + v.value0 | 0;
              return fromMaybe(ls)(modifyAt(layerIdx)(function(l) {
                return append4(l)([v.value1]);
              })(ls));
            };
          })(acc.layers)(zipWith(Tuple.create)(range2(1)(span3 - 1 | 0))(dummyIds));
          return {
            layers: newLayers,
            edges: append4(acc.edges)(newEdges),
            chains: append4(acc.chains)([{
              edgeId: edge.id,
              nodes: allIds
            }])
          };
        };
      };
      return foldl5(processEdge)({
        layers,
        edges: [],
        chains: []
      })(edges);
    };
  };
};

// ../markgraf/output/Markgraf.EdgeRouting.PortAssignment/index.js
var mapFlipped4 = /* @__PURE__ */ mapFlipped(functorArray);
var append5 = /* @__PURE__ */ append(semigroupArray);
var foldl6 = /* @__PURE__ */ foldl(foldableArray);
var fromFoldable7 = /* @__PURE__ */ fromFoldable2(ordEdgeId)(foldableArray);
var insert6 = /* @__PURE__ */ insert(ordNodeId);
var compare3 = /* @__PURE__ */ compare(ordInt);
var lookup6 = /* @__PURE__ */ lookup(ordNodeId);
var eq12 = /* @__PURE__ */ eq(eqPortId);
var un5 = /* @__PURE__ */ un();
var lookup1 = /* @__PURE__ */ lookup(ordEdgeId);
var eq22 = /* @__PURE__ */ eq(eqSide);
var compare12 = /* @__PURE__ */ compare(ordNumber);
var lookup22 = /* @__PURE__ */ lookup(/* @__PURE__ */ ordTuple(ordEdgeId)(ordSide));
var abs3 = /* @__PURE__ */ abs(ordInt)(ringInt);
var sideExit = function(side) {
  return function(p) {
    var top3 = gridY(p.position);
    var left = gridX(p.position);
    var right = left + sizeW(p.size);
    var cy = top3 * 2 + sizeH(p.size);
    var cx = left * 2 + sizeW(p.size);
    var bot = top3 + sizeH(p.size);
    if (side instanceof South) {
      return new Tuple(cx, bot * 2);
    }
    ;
    if (side instanceof North) {
      return new Tuple(cx, top3 * 2);
    }
    ;
    if (side instanceof East) {
      return new Tuple(right * 2, cy);
    }
    ;
    if (side instanceof West) {
      return new Tuple(left * 2, cy);
    }
    ;
    throw new Error("Failed pattern match at Markgraf.EdgeRouting.PortAssignment (line 345, column 19 - line 349, column 29): " + [side.constructor.name]);
  };
};
var sideEntry = sideExit;
var scaleFactor = 4;
var nodeSpan = function(side) {
  return function(p) {
    var sf3 = toNumber(scaleFactor);
    if (side instanceof South) {
      return {
        lo: gridX(p.position) * sf3,
        hi: (gridX(p.position) + sizeW(p.size)) * sf3
      };
    }
    ;
    if (side instanceof North) {
      return {
        lo: gridX(p.position) * sf3,
        hi: (gridX(p.position) + sizeW(p.size)) * sf3
      };
    }
    ;
    if (side instanceof East) {
      return {
        lo: gridY(p.position) * sf3,
        hi: (gridY(p.position) + sizeH(p.size)) * sf3
      };
    }
    ;
    if (side instanceof West) {
      return {
        lo: gridY(p.position) * sf3,
        hi: (gridY(p.position) + sizeH(p.size)) * sf3
      };
    }
    ;
    throw new Error("Failed pattern match at Markgraf.EdgeRouting.PortAssignment (line 319, column 19 - line 323, column 84): " + [side.constructor.name]);
  };
};
var isVerticalExit = function(v) {
  if (v instanceof South) {
    return true;
  }
  ;
  if (v instanceof North) {
    return true;
  }
  ;
  return false;
};
var isVerticalEntry = function(v) {
  if (v instanceof North) {
    return true;
  }
  ;
  if (v instanceof South) {
    return true;
  }
  ;
  return false;
};
var isHorizontalExit = function(v) {
  if (v instanceof East) {
    return true;
  }
  ;
  if (v instanceof West) {
    return true;
  }
  ;
  return false;
};
var isHorizontalEntry = function(v) {
  if (v instanceof East) {
    return true;
  }
  ;
  if (v instanceof West) {
    return true;
  }
  ;
  return false;
};
var groupEdgesBy = function(dictOrd) {
  var insertWith13 = insertWith(dictOrd);
  return function(keyFn) {
    return foldl6(function(m) {
      return function(e) {
        return insertWith13(append5)(keyFn(e))([e])(m);
      };
    })(empty2);
  };
};
var groupEdgesBy1 = /* @__PURE__ */ groupEdgesBy(ordNodeId);
var exitToward = function(v) {
  return function(v1) {
    return function(v2) {
      if (v2 instanceof South) {
        return v1 > v;
      }
      ;
      if (v2 instanceof North) {
        return v1 < v;
      }
      ;
      if (v2 instanceof East) {
        return v1 > v;
      }
      ;
      if (v2 instanceof West) {
        return v1 < v;
      }
      ;
      throw new Error("Failed pattern match at Markgraf.EdgeRouting.PortAssignment (line 406, column 1 - line 406, column 50): " + [v.constructor.name, v1.constructor.name, v2.constructor.name]);
    };
  };
};
var entryToward = function(v) {
  return function(v1) {
    return function(v2) {
      if (v2 instanceof East) {
        return v > v1;
      }
      ;
      if (v2 instanceof West) {
        return v < v1;
      }
      ;
      if (v2 instanceof North) {
        return v < v1;
      }
      ;
      if (v2 instanceof South) {
        return v > v1;
      }
      ;
      throw new Error("Failed pattern match at Markgraf.EdgeRouting.PortAssignment (line 415, column 1 - line 415, column 51): " + [v.constructor.name, v1.constructor.name, v2.constructor.name]);
    };
  };
};
var orthoBends = function(fromSide) {
  return function(toSide) {
    return function(v) {
      return function(v1) {
        var straight = (function() {
          var v2 = new Tuple(fromSide, toSide);
          if (v2.value0 instanceof South && v2.value1 instanceof North) {
            return v.value0 === v1.value0 && v1.value1 > v.value1;
          }
          ;
          if (v2.value0 instanceof North && v2.value1 instanceof South) {
            return v.value0 === v1.value0 && v1.value1 < v.value1;
          }
          ;
          if (v2.value0 instanceof East && v2.value1 instanceof West) {
            return v.value1 === v1.value1 && v1.value0 > v.value0;
          }
          ;
          if (v2.value0 instanceof West && v2.value1 instanceof East) {
            return v.value1 === v1.value1 && v1.value0 < v.value0;
          }
          ;
          return false;
        })();
        var corner1 = isVerticalExit(fromSide) && (isHorizontalEntry(toSide) && (exitToward(v.value1)(v1.value1)(fromSide) && entryToward(v.value0)(v1.value0)(toSide)));
        var corner2 = isHorizontalExit(fromSide) && (isVerticalEntry(toSide) && (exitToward(v.value0)(v1.value0)(fromSide) && entryToward(v.value1)(v1.value1)(toSide)));
        if (straight) {
          return 0;
        }
        ;
        var $109 = corner1 || corner2;
        if ($109) {
          return 1;
        }
        ;
        return 2;
      };
    };
  };
};
var distributeAlongSide = function(span3) {
  return function(sorted) {
    var width = span3.hi - span3.lo;
    var centre = (span3.lo + span3.hi) / 2;
    var v = length(sorted);
    if (v === 0) {
      return empty2;
    }
    ;
    if (v === 1) {
      return fromFoldable7(mapFlipped4(sorted)(function(eid) {
        return new Tuple(eid, centre);
      }));
    }
    ;
    return fromFoldable7(mapWithIndex2(function(i) {
      return function(eid) {
        return new Tuple(eid, span3.lo + toNumber(i + 1 | 0) * width / toNumber(v + 1 | 0));
      };
    })(sorted));
  };
};
var assignPorts = function(edges) {
  return function(placements) {
    return function(portMap) {
      return function(chains) {
        return function(portOffsets) {
          var targetGroups = groupEdgesBy1(function(e) {
            return e.to.node;
          })(edges);
          var spanAwareBends = function(from2) {
            return function(to2) {
              return function(src) {
                return function(tgt) {
                  var checkSpanOverlap = function(side) {
                    return function(src$prime) {
                      return function(tgt$prime) {
                        return function(exit$prime) {
                          return function(entry$prime) {
                            var srcSpan = nodeSpan(side)(src$prime);
                            var tgtSpan = nodeSpan(side)(tgt$prime);
                            var hasOverlap = srcSpan.lo < tgtSpan.hi && tgtSpan.lo < srcSpan.hi;
                            var dirOk = (function() {
                              var v2 = new Tuple(from2, to2);
                              if (v2.value0 instanceof South && v2.value1 instanceof North) {
                                return entry$prime.value1 > exit$prime.value1;
                              }
                              ;
                              if (v2.value0 instanceof North && v2.value1 instanceof South) {
                                return entry$prime.value1 < exit$prime.value1;
                              }
                              ;
                              if (v2.value0 instanceof East && v2.value1 instanceof West) {
                                return entry$prime.value0 > exit$prime.value0;
                              }
                              ;
                              if (v2.value0 instanceof West && v2.value1 instanceof East) {
                                return entry$prime.value0 < exit$prime.value0;
                              }
                              ;
                              return false;
                            })();
                            var $128 = hasOverlap && dirOk;
                            if ($128) {
                              return 0;
                            }
                            ;
                            return orthoBends(from2)(to2)(exit$prime)(entry$prime);
                          };
                        };
                      };
                    };
                  };
                  var exit = sideExit(from2)(src);
                  var entry = sideEntry(to2)(tgt);
                  var base = orthoBends(from2)(to2)(exit)(entry);
                  var $137 = base > 0;
                  if ($137) {
                    var v = new Tuple(from2, to2);
                    if (v.value0 instanceof South && v.value1 instanceof North) {
                      return checkSpanOverlap(South.value)(src)(tgt)(exit)(entry);
                    }
                    ;
                    if (v.value0 instanceof North && v.value1 instanceof South) {
                      return checkSpanOverlap(North.value)(src)(tgt)(exit)(entry);
                    }
                    ;
                    if (v.value0 instanceof East && v.value1 instanceof West) {
                      return checkSpanOverlap(East.value)(src)(tgt)(exit)(entry);
                    }
                    ;
                    if (v.value0 instanceof West && v.value1 instanceof East) {
                      return checkSpanOverlap(West.value)(src)(tgt)(exit)(entry);
                    }
                    ;
                    return base;
                  }
                  ;
                  return base;
                };
              };
            };
          };
          var sourceGroups = groupEdgesBy1(function(e) {
            return e.from.node;
          })(edges);
          var sidePenalty = function(v) {
            return function(v1) {
              if (v instanceof South && v1 instanceof North) {
                return 0;
              }
              ;
              if (v instanceof North && v1 instanceof South) {
                return 0;
              }
              ;
              if (v instanceof East && v1 instanceof West) {
                return 5;
              }
              ;
              if (v instanceof West && v1 instanceof East) {
                return 5;
              }
              ;
              return 15;
            };
          };
          var posOnSide = function(side) {
            return function(p) {
              return function(x) {
                var sfN = toNumber(scaleFactor);
                if (side instanceof South) {
                  return new Tuple(x, (gridY(p.position) + sizeH(p.size)) * sfN);
                }
                ;
                if (side instanceof North) {
                  return new Tuple(x, gridY(p.position) * sfN);
                }
                ;
                if (side instanceof East) {
                  return new Tuple((gridX(p.position) + sizeW(p.size)) * sfN, x);
                }
                ;
                if (side instanceof West) {
                  return new Tuple(gridX(p.position) * sfN, x);
                }
                ;
                throw new Error("Failed pattern match at Markgraf.EdgeRouting.PortAssignment (line 257, column 24 - line 261, column 42): " + [side.constructor.name]);
              };
            };
          };
          var posMap = foldl6(function(m) {
            return function(p) {
              return insert6(p.node)(p)(m);
            };
          })(empty2)(placements);
          var portToFineGrid = function(placement) {
            return function(port) {
              var sfN = toNumber(scaleFactor);
              if (port.side instanceof North) {
                return new Tuple(gridX(placement.position) * sfN + toNumber(port.offset) * sfN, gridY(placement.position) * sfN);
              }
              ;
              if (port.side instanceof South) {
                return new Tuple(gridX(placement.position) * sfN + toNumber(port.offset) * sfN, (gridY(placement.position) + sizeH(placement.size)) * sfN);
              }
              ;
              if (port.side instanceof East) {
                return new Tuple((gridX(placement.position) + sizeW(placement.size)) * sfN, gridY(placement.position) * sfN + toNumber(port.offset) * sfN);
              }
              ;
              if (port.side instanceof West) {
                return new Tuple(gridX(placement.position) * sfN, gridY(placement.position) * sfN + toNumber(port.offset) * sfN);
              }
              ;
              throw new Error("Failed pattern match at Markgraf.EdgeRouting.PortAssignment (line 275, column 35 - line 279, column 114): " + [port.side.constructor.name]);
            };
          };
          var pickBestSides = function(src) {
            return function(tgt) {
              var candidates = [new Tuple(South.value, North.value), new Tuple(East.value, North.value), new Tuple(West.value, North.value), new Tuple(South.value, East.value), new Tuple(South.value, West.value), new Tuple(North.value, South.value), new Tuple(North.value, East.value), new Tuple(North.value, West.value), new Tuple(East.value, South.value), new Tuple(West.value, South.value), new Tuple(East.value, West.value), new Tuple(West.value, East.value)];
              var scored = mapFlipped4(candidates)(function(v2) {
                return {
                  from: v2.value0,
                  to: v2.value1,
                  score: (spanAwareBends(v2.value0)(v2.value1)(src)(tgt) * 10 | 0) + sidePenalty(v2.value0)(v2.value1) | 0
                };
              });
              var v = head(sortBy(function(a) {
                return function(b) {
                  return compare3(a.score)(b.score);
                };
              })(scored));
              if (v instanceof Just) {
                return {
                  from: v.value0.from,
                  to: v.value0.to
                };
              }
              ;
              if (v instanceof Nothing) {
                return {
                  from: South.value,
                  to: North.value
                };
              }
              ;
              throw new Error("Failed pattern match at Markgraf.EdgeRouting.PortAssignment (line 147, column 5 - line 149, column 44): " + [v.constructor.name]);
            };
          };
          var dummyCentreX = function(chain) {
            var sfN = toNumber(scaleFactor);
            var v = index(chain.nodes)(1);
            if (v instanceof Nothing) {
              return Nothing.value;
            }
            ;
            if (v instanceof Just) {
              var v1 = lookup6(v.value0)(posMap);
              if (v1 instanceof Nothing) {
                return Nothing.value;
              }
              ;
              if (v1 instanceof Just) {
                return new Just(gridX(v1.value0.position) * sfN + sizeW(v1.value0.size) * sfN / 2);
              }
              ;
              throw new Error("Failed pattern match at Markgraf.EdgeRouting.PortAssignment (line 83, column 16 - line 85, column 73): " + [v1.constructor.name]);
            }
            ;
            throw new Error("Failed pattern match at Markgraf.EdgeRouting.PortAssignment (line 81, column 24 - line 85, column 73): " + [v.constructor.name]);
          };
          var defaultPos = function(side) {
            return function(p) {
              var sfN = toNumber(scaleFactor);
              if (side instanceof South) {
                return new Tuple(gridX(p.position) * sfN + sizeW(p.size) * sfN / 2, (gridY(p.position) + sizeH(p.size)) * sfN);
              }
              ;
              if (side instanceof North) {
                return new Tuple(gridX(p.position) * sfN + sizeW(p.size) * sfN / 2, gridY(p.position) * sfN);
              }
              ;
              if (side instanceof East) {
                return new Tuple((gridX(p.position) + sizeW(p.size)) * sfN, gridY(p.position) * sfN + sizeH(p.size) * sfN / 2);
              }
              ;
              if (side instanceof West) {
                return new Tuple(gridX(p.position) * sfN, gridY(p.position) * sfN + sizeH(p.size) * sfN / 2);
              }
              ;
              throw new Error("Failed pattern match at Markgraf.EdgeRouting.PortAssignment (line 266, column 23 - line 270, column 92): " + [side.constructor.name]);
            };
          };
          var explicitPort = function(nodeId) {
            return function(portId) {
              return function(fallbackSide) {
                var v = lookup6(nodeId)(posMap);
                if (v instanceof Nothing) {
                  return new Tuple(0, 0);
                }
                ;
                if (v instanceof Just) {
                  var v1 = lookup6(nodeId)(portMap);
                  if (v1 instanceof Nothing) {
                    return defaultPos(fallbackSide)(v.value0);
                  }
                  ;
                  if (v1 instanceof Just) {
                    var v2 = find2(function(p) {
                      return eq12(p.id)(portId);
                    })(v1.value0);
                    if (v2 instanceof Nothing) {
                      return defaultPos(fallbackSide)(v.value0);
                    }
                    ;
                    if (v2 instanceof Just) {
                      return portToFineGrid(v.value0)(v2.value0);
                    }
                    ;
                    throw new Error("Failed pattern match at Markgraf.EdgeRouting.PortAssignment (line 222, column 21 - line 224, column 51): " + [v2.constructor.name]);
                  }
                  ;
                  throw new Error("Failed pattern match at Markgraf.EdgeRouting.PortAssignment (line 220, column 23 - line 224, column 51): " + [v1.constructor.name]);
                }
                ;
                throw new Error("Failed pattern match at Markgraf.EdgeRouting.PortAssignment (line 218, column 45 - line 224, column 51): " + [v.constructor.name]);
              };
            };
          };
          var chainSegmentIds = function(chain) {
            return zipWith(function(a) {
              return function(b) {
                return un5(EdgeId)(chain.edgeId) + (":" + (un5(NodeId)(a) + ("->" + un5(NodeId)(b))));
              };
            })(chain.nodes)(drop(1)(chain.nodes));
          };
          var trunkEntries = function(chain) {
            if (length(chain.nodes) <= 2) {
              return [];
            }
            ;
            if (otherwise) {
              var v = dummyCentreX(chain);
              if (v instanceof Nothing) {
                return [];
              }
              ;
              if (v instanceof Just) {
                return mapFlipped4(chainSegmentIds(chain))(function(sid) {
                  return new Tuple(sid, v.value0);
                });
              }
              ;
              throw new Error("Failed pattern match at Markgraf.EdgeRouting.PortAssignment (line 73, column 19 - line 75, column 63): " + [v.constructor.name]);
            }
            ;
            throw new Error("Failed pattern match at Markgraf.EdgeRouting.PortAssignment (line 71, column 3 - line 75, column 63): " + [chain.constructor.name]);
          };
          var trunkXBySegId = fromFoldable7(concatMap(trunkEntries)(chains));
          var bestSides = function(edge) {
            var v = new Tuple(lookup6(edge.from.node)(posMap), lookup6(edge.to.node)(posMap));
            if (v.value0 instanceof Just && v.value1 instanceof Just) {
              return pickBestSides(v.value0.value0)(v.value1.value0);
            }
            ;
            return {
              from: South.value,
              to: North.value
            };
          };
          var sidesMap = fromFoldable7(mapFlipped4(edges)(function(e) {
            return new Tuple(e.id, bestSides(e));
          }));
          var axisCenter = function(side) {
            return function(p) {
              var sfN = toNumber(scaleFactor);
              if (side instanceof South) {
                return gridX(p.position) * sfN + sizeW(p.size) * sfN / 2;
              }
              ;
              if (side instanceof North) {
                return gridX(p.position) * sfN + sizeW(p.size) * sfN / 2;
              }
              ;
              if (side instanceof East) {
                return gridY(p.position) * sfN + sizeH(p.size) * sfN / 2;
              }
              ;
              if (side instanceof West) {
                return gridY(p.position) * sfN + sizeH(p.size) * sfN / 2;
              }
              ;
              throw new Error("Failed pattern match at Markgraf.EdgeRouting.PortAssignment (line 209, column 23 - line 213, column 62): " + [side.constructor.name]);
            };
          };
          var srcOrder = function(side) {
            return function(e) {
              var v = lookup6(e.to.node)(posMap);
              if (v instanceof Nothing) {
                return 0;
              }
              ;
              if (v instanceof Just) {
                return axisCenter(side)(v.value0);
              }
              ;
              throw new Error("Failed pattern match at Markgraf.EdgeRouting.PortAssignment (line 198, column 21 - line 200, column 32): " + [v.constructor.name]);
            };
          };
          var tgtOrder = function(side) {
            return function(e) {
              var v = lookup6(e.from.node)(posMap);
              if (v instanceof Nothing) {
                return 0;
              }
              ;
              if (v instanceof Just) {
                return axisCenter(side)(v.value0);
              }
              ;
              throw new Error("Failed pattern match at Markgraf.EdgeRouting.PortAssignment (line 204, column 21 - line 206, column 32): " + [v.constructor.name]);
            };
          };
          var autoPort = function(side) {
            return function(nodeId) {
              return function(edgeId) {
                return function(groups) {
                  return function(orderFn) {
                    return function(sideExtract) {
                      var sfN = toNumber(scaleFactor);
                      var fallback = function(placement) {
                        var allSiblings = fromMaybe([])(lookup6(nodeId)(groups));
                        var siblings = filter(function(e) {
                          var v2 = lookup1(e.id)(sidesMap);
                          if (v2 instanceof Just) {
                            return eq22(sideExtract(v2.value0))(side);
                          }
                          ;
                          if (v2 instanceof Nothing) {
                            return true;
                          }
                          ;
                          throw new Error("Failed pattern match at Markgraf.EdgeRouting.PortAssignment (line 245, column 15 - line 247, column 32): " + [v2.constructor.name]);
                        })(allSiblings);
                        var span3 = nodeSpan(side)(placement);
                        var sorted = sortBy(function(a) {
                          return function(b) {
                            return compare12(orderFn(side)(a))(orderFn(side)(b));
                          };
                        })(siblings);
                        var positions = distributeAlongSide(span3)(mapFlipped4(sorted)(function(v2) {
                          return v2.id;
                        }));
                        var x = fromMaybe((span3.lo + span3.hi) / 2)(lookup1(edgeId)(positions));
                        return posOnSide(side)(placement)(x);
                      };
                      var v = lookup6(nodeId)(posMap);
                      if (v instanceof Nothing) {
                        return new Tuple(0, 0);
                      }
                      ;
                      if (v instanceof Just) {
                        var v1 = lookup22(new Tuple(edgeId, side))(portOffsets);
                        if (v1 instanceof Just) {
                          return posOnSide(side)(v.value0)(gridX(v.value0.position) * sfN + v1.value0);
                        }
                        ;
                        if (v1 instanceof Nothing) {
                          return fallback(v.value0);
                        }
                        ;
                        throw new Error("Failed pattern match at Markgraf.EdgeRouting.PortAssignment (line 235, column 23 - line 237, column 36): " + [v1.constructor.name]);
                      }
                      ;
                      throw new Error("Failed pattern match at Markgraf.EdgeRouting.PortAssignment (line 233, column 60 - line 237, column 36): " + [v.constructor.name]);
                    };
                  };
                };
              };
            };
          };
          var assignSlots2 = function(targets) {
            return function(availableSlots) {
              var nearestSlot = function(target) {
                return function(slots) {
                  return head(sortBy(function(a) {
                    return function(b) {
                      return compare3(abs3(a - target | 0))(abs3(b - target | 0));
                    };
                  })(slots));
                };
              };
              var go = function(acc) {
                return function(t) {
                  var v = nearestSlot(t.target)(acc.available);
                  if (v instanceof Nothing) {
                    return {
                      available: acc.available,
                      result: append5(acc.result)([{
                        id: t.id,
                        x: t.target
                      }])
                    };
                  }
                  ;
                  if (v instanceof Just) {
                    return {
                      available: filter(function(v2) {
                        return v2 !== v.value0;
                      })(acc.available),
                      result: append5(acc.result)([{
                        id: t.id,
                        x: v.value0
                      }])
                    };
                  }
                  ;
                  throw new Error("Failed pattern match at Markgraf.EdgeRouting.PortAssignment (line 286, column 16 - line 288, column 124): " + [v.constructor.name]);
                };
              };
              return (function(v) {
                return v.result;
              })(foldl6(go)({
                available: availableSlots,
                result: []
              })(targets));
            };
          };
          var assignEdge = function(edge) {
            var v = new Tuple(edge.from.port, edge.to.port);
            if (v.value0 instanceof Just && v.value1 instanceof Just) {
              return {
                edge,
                fromPos: explicitPort(edge.from.node)(v.value0.value0)(South.value),
                toPos: explicitPort(edge.to.node)(v.value1.value0)(North.value),
                fromSide: South.value,
                toSide: North.value
              };
            }
            ;
            var sides = bestSides(edge);
            return {
              edge,
              fromPos: autoPort(sides.from)(edge.from.node)(edge.id)(sourceGroups)(srcOrder)(function(v1) {
                return v1.from;
              }),
              toPos: autoPort(sides.to)(edge.to.node)(edge.id)(targetGroups)(tgtOrder)(function(v1) {
                return v1.to;
              }),
              fromSide: sides.from,
              toSide: sides.to
            };
          };
          var natural = mapFlipped4(edges)(assignEdge);
          var applyTrunkOverride = function(a) {
            var v = lookup1(a.edge.id)(trunkXBySegId);
            if (v instanceof Nothing) {
              return a;
            }
            ;
            if (v instanceof Just) {
              return {
                edge: a.edge,
                fromSide: a.fromSide,
                toSide: a.toSide,
                fromPos: (function() {
                  var $196 = isDummy(a.edge.from.node);
                  if ($196) {
                    return new Tuple(v.value0, a.fromPos.value1);
                  }
                  ;
                  return a.fromPos;
                })(),
                toPos: (function() {
                  var $197 = isDummy(a.edge.to.node);
                  if ($197) {
                    return new Tuple(v.value0, a.toPos.value1);
                  }
                  ;
                  return a.toPos;
                })()
              };
            }
            ;
            throw new Error("Failed pattern match at Markgraf.EdgeRouting.PortAssignment (line 94, column 26 - line 102, column 10): " + [v.constructor.name]);
          };
          return mapFlipped4(natural)(applyTrunkOverride);
        };
      };
    };
  };
};

// ../markgraf/output/Markgraf.EdgeRouting.HyperEdges/index.js
var foldl7 = /* @__PURE__ */ foldl(foldableArray);
var insertWith2 = /* @__PURE__ */ insertWith(ordInt);
var add2 = /* @__PURE__ */ add(semiringInt);
var fromFoldable8 = /* @__PURE__ */ fromFoldable2(ordInt)(foldableArray);
var mapFlipped5 = /* @__PURE__ */ mapFlipped(functorArray);
var append6 = /* @__PURE__ */ append(semigroupArray);
var map9 = /* @__PURE__ */ map(functorArray);
var lookup7 = /* @__PURE__ */ lookup(ordInt);
var max4 = /* @__PURE__ */ max(ordInt);
var insert7 = /* @__PURE__ */ insert(ordInt);
var compare4 = /* @__PURE__ */ compare(ordInt);
var un6 = /* @__PURE__ */ un();
var min4 = /* @__PURE__ */ min(ordNumber);
var max12 = /* @__PURE__ */ max(ordNumber);
var sort2 = /* @__PURE__ */ sort(ordNumber);
var insert1 = /* @__PURE__ */ insert(ordNodeId);
var mapFlipped1 = /* @__PURE__ */ mapFlipped(functorMaybe);
var lookup12 = /* @__PURE__ */ lookup(ordNodeId);
var compare13 = /* @__PURE__ */ compare(/* @__PURE__ */ ordTuple(ordInt)(ordInt));
var min1 = /* @__PURE__ */ min(ordInt);
var toUnfoldable6 = /* @__PURE__ */ toUnfoldable(unfoldableArray);
var elem3 = /* @__PURE__ */ elem2(eqEdgeId);
var bind2 = /* @__PURE__ */ bind(bindArray);
var identity6 = /* @__PURE__ */ identity(categoryFn);
var elem1 = /* @__PURE__ */ elem2(eqInt);
var bind1 = /* @__PURE__ */ bind(bindMaybe);
var lookup23 = /* @__PURE__ */ lookup(ordString);
var insert22 = /* @__PURE__ */ insert(ordString);
var eq13 = /* @__PURE__ */ eq(/* @__PURE__ */ eqMaybe(eqInt));
var fromFoldable1 = /* @__PURE__ */ fromFoldable(foldableList);
var pure2 = /* @__PURE__ */ pure(applicativeArray);
var compare22 = /* @__PURE__ */ compare(ordNumber);
var insert32 = /* @__PURE__ */ insert(ordEdgeId);
var lookup32 = /* @__PURE__ */ lookup(ordEdgeId);
var Regular = /* @__PURE__ */ (function() {
  function Regular2() {
  }
  ;
  Regular2.value = new Regular2();
  return Regular2;
})();
var Critical = /* @__PURE__ */ (function() {
  function Critical2() {
  }
  ;
  Critical2.value = new Critical2();
  return Critical2;
})();
var isCritical = function(v) {
  if (v instanceof Critical) {
    return true;
  }
  ;
  if (v instanceof Regular) {
    return false;
  }
  ;
  throw new Error("Failed pattern match at Markgraf.EdgeRouting.HyperEdges (line 60, column 1 - line 60, column 33): " + [v.constructor.name]);
};
var assignSlots = function(assignments) {
  return function(placements) {
    var trunkTargetX = function(a) {
      return fst(a.toPos);
    };
    var trunkSourceX = function(a) {
      return fst(a.fromPos);
    };
    var topologicalNumbering = function(input) {
      var initialInDegree = foldl7(function(m) {
        return function(d) {
          return insertWith2(add2)(d.tgt)(1)(m);
        };
      })(empty2)(input.deps);
      var initial2 = {
        slots: fromFoldable8(mapFlipped5(input.segments)(function(s) {
          return new Tuple(s.id, 0);
        })),
        inDegree: initialInDegree,
        adj: foldl7(function(m) {
          return function(d) {
            return insertWith2(append6)(d.src)([d.tgt])(m);
          };
        })(empty2)(input.deps),
        queue: map9(function(v) {
          return v.id;
        })(filter(function(s) {
          return 0 === fromMaybe(0)(lookup7(s.id)(initialInDegree));
        })(input.segments))
      };
      var advance = function(srcSlot) {
        return function(st) {
          return function(tgtId) {
            var prevTgtSlot = fromMaybe(0)(lookup7(tgtId)(st.slots));
            var newSlot = max4(prevTgtSlot)(srcSlot + 1 | 0);
            var prevIn = fromMaybe(0)(lookup7(tgtId)(st.inDegree));
            var nextIn = prevIn - 1 | 0;
            var nextQueue = (function() {
              var $128 = nextIn === 0;
              if ($128) {
                return append6(st.queue)([tgtId]);
              }
              ;
              return st.queue;
            })();
            return {
              adj: st.adj,
              slots: insert7(tgtId)(newSlot)(st.slots),
              inDegree: insert7(tgtId)(nextIn)(st.inDegree),
              queue: nextQueue
            };
          };
        };
      };
      var drain = function($copy_st) {
        var $tco_done = false;
        var $tco_result;
        function $tco_loop(st) {
          var v = uncons(st.queue);
          if (v instanceof Nothing) {
            $tco_done = true;
            return st;
          }
          ;
          if (v instanceof Just) {
            var nslot = fromMaybe(0)(lookup7(v.value0.head)(st.slots));
            var outs = fromMaybe([])(lookup7(v.value0.head)(st.adj));
            var st$prime = foldl7(advance(nslot))({
              slots: st.slots,
              inDegree: st.inDegree,
              adj: st.adj,
              queue: v.value0.tail
            })(outs);
            $copy_st = st$prime;
            return;
          }
          ;
          throw new Error("Failed pattern match at Markgraf.EdgeRouting.HyperEdges (line 801, column 16 - line 807, column 18): " + [v.constructor.name]);
        }
        ;
        while (!$tco_done) {
          $tco_result = $tco_loop($copy_st);
        }
        ;
        return $tco_result;
      };
      var finalState = drain(initial2);
      var assignSlot = function(seg) {
        return {
          id: seg.id,
          incoming: seg.incoming,
          mark: seg.mark,
          members: seg.members,
          outgoing: seg.outgoing,
          splitBy: seg.splitBy,
          splitPartner: seg.splitPartner,
          slot: fromMaybe(0)(lookup7(seg.id)(finalState.slots))
        };
      };
      var result = sortBy(function(a) {
        return function(b) {
          return compare4(a.slot)(b.slot);
        };
      })(mapFlipped5(input.segments)(assignSlot));
      return result;
    };
    var segmentKey = function(a) {
      var srcId = un6(NodeId)(a.edge.from.node);
      var pidStr = (function() {
        if (a.edge.from.port instanceof Just) {
          return un6(PortId)(a.edge.from.port.value0);
        }
        ;
        if (a.edge.from.port instanceof Nothing) {
          return "_auto_" + un6(EdgeId)(a.edge.id);
        }
        ;
        throw new Error("Failed pattern match at Markgraf.EdgeRouting.HyperEdges (line 267, column 16 - line 269, column 51): " + [a.edge.from.port.constructor.name]);
      })();
      return srcId + ("|" + pidStr);
    };
    var segStart = function(s) {
      return min4(foldl7(min4)(1e18)(s.incoming))(foldl7(min4)(1e18)(s.outgoing));
    };
    var segEnd = function(s) {
      return max12(foldl7(max12)(-1e18)(s.incoming))(foldl7(max12)(-1e18)(s.outgoing));
    };
    var segLength = function(s) {
      return segEnd(s) - segStart(s);
    };
    var representsHyperedge = function(s) {
      return (length(s.incoming) + length(s.outgoing) | 0) > 2;
    };
    var recomputeExtent = function(s) {
      return {
        id: s.id,
        members: s.members,
        slot: s.slot,
        mark: s.mark,
        splitBy: s.splitBy,
        splitPartner: s.splitPartner,
        incoming: sort2(s.incoming),
        outgoing: sort2(s.outgoing)
      };
    };
    var placedByNode = foldl7(function(m) {
      return function(p) {
        return insert1(p.node)(p)(m);
      };
    })(empty2)(placements);
    var orderOfNode = function(nid) {
      return mapFlipped1(lookup12(nid)(placedByNode))(function(v) {
        return v.order;
      });
    };
    var nubNear = function(eps) {
      return function(xs) {
        var step2 = function(acc) {
          return function(x) {
            if (acc.prev instanceof Just && x - acc.prev.value0 < eps) {
              return acc;
            }
            ;
            return {
              prev: new Just(x),
              out: append6(acc.out)([x])
            };
          };
        };
        return foldl7(step2)({
          prev: Nothing.value,
          out: []
        })(xs).out;
      };
    };
    var markOf = function(m) {
      return function(k) {
        return fromMaybe(0)(lookup7(k)(m));
      };
    };
    var layerOfNode = function(nid) {
      return mapFlipped1(lookup12(nid)(placedByNode))(function(v) {
        return v.layer;
      });
    };
    var orderedAssignments = (function() {
      var keyOf = function(a) {
        return new Tuple(fromMaybe(1e6)(layerOfNode(a.edge.from.node)), fromMaybe(1e6)(orderOfNode(a.edge.from.node)));
      };
      var compareByLayerOrder = function(a) {
        return function(b) {
          return compare13(keyOf(a))(keyOf(b));
        };
      };
      return sortBy(compareByLayerOrder)(assignments);
    })();
    var isStraightSegment = function(s) {
      return segLength(s) < 1e-3;
    };
    var isBetterArea = function(cur) {
      return function(curR) {
        return function(best) {
          return function(bestR) {
            if (curR.crossings < bestR.crossings) {
              return true;
            }
            ;
            if (curR.crossings > bestR.crossings) {
              return false;
            }
            ;
            if (curR.deps < bestR.deps) {
              return true;
            }
            ;
            if (curR.deps > bestR.deps) {
              return false;
            }
            ;
            if (otherwise) {
              return cur.size > best.size;
            }
            ;
            throw new Error("Failed pattern match at Markgraf.EdgeRouting.HyperEdges (line 529, column 3 - line 534, column 15): " + [cur.constructor.name, curR.constructor.name, best.constructor.name, bestR.constructor.name]);
          };
        };
      };
    };
    var insertSorted2 = function(v) {
      return function(xs) {
        return append6(takeWhile(function(v1) {
          return v1 < v;
        })(xs))(append6([v])(dropWhile(function(v1) {
          return v1 <= v;
        })(xs)));
      };
    };
    var insertManyAt = function(idx) {
      return function(items) {
        return function(xs) {
          return append6(take(idx)(xs))(append6(items)(drop(idx)(xs)));
        };
      };
    };
    var useArea = function(freeAreas) {
      return function(usedIndex) {
        return function(critThreshold) {
          var v = index(freeAreas)(usedIndex);
          if (v instanceof Nothing) {
            return freeAreas;
          }
          ;
          if (v instanceof Just) {
            var withoutOld = fromMaybe(freeAreas)(deleteAt(usedIndex)(freeAreas));
            var $142 = v.value0.size / 2 < critThreshold;
            if ($142) {
              return withoutOld;
            }
            ;
            var oldCentre = (v.value0.startPosition + v.value0.endPosition) / 2;
            var newEnd1 = oldCentre - critThreshold;
            var newStart2 = oldCentre + critThreshold;
            var part1 = (function() {
              var $143 = v.value0.startPosition <= newEnd1;
              if ($143) {
                return [{
                  startPosition: v.value0.startPosition,
                  endPosition: newEnd1,
                  size: newEnd1 - v.value0.startPosition
                }];
              }
              ;
              return [];
            })();
            var part2 = (function() {
              var $144 = newStart2 <= v.value0.endPosition;
              if ($144) {
                return [{
                  startPosition: newStart2,
                  endPosition: v.value0.endPosition,
                  size: v.value0.endPosition - newStart2
                }];
              }
              ;
              return [];
            })();
            return insertManyAt(usedIndex)(append6(part1)(part2))(withoutOld);
          }
          ;
          throw new Error("Failed pattern match at Markgraf.EdgeRouting.HyperEdges (line 606, column 47 - line 623, column 59): " + [v.constructor.name]);
        };
      };
    };
    var gapIndex = function(a) {
      var v = new Tuple(layerOfNode(a.edge.from.node), layerOfNode(a.edge.to.node));
      if (v.value0 instanceof Just && (v.value1 instanceof Just && v.value0.value0 !== v.value1.value0)) {
        return new Just(min1(v.value0.value0)(v.value1.value0));
      }
      ;
      return Nothing.value;
    };
    var grouped = (function() {
      var groupOne = function(acc) {
        return function(a) {
          var v = gapIndex(a);
          if (v instanceof Just) {
            return insertWith2(append6)(v.value0)([a])(acc);
          }
          ;
          if (v instanceof Nothing) {
            return acc;
          }
          ;
          throw new Error("Failed pattern match at Markgraf.EdgeRouting.HyperEdges (line 141, column 22 - line 143, column 21): " + [v.constructor.name]);
        };
      };
      return toUnfoldable6(foldl7(groupOne)(empty2)(orderedAssignments));
    })();
    var gapBounds = function(segs) {
      var memberIds = concatMap(function(v) {
        return v.members;
      })(segs);
      var memberAssigns = filter(function(a) {
        return elem3(a.edge.id)(memberIds);
      })(assignments);
      var srcYs = mapFlipped5(memberAssigns)(function(a) {
        return snd(a.fromPos);
      });
      var tgtYs = mapFlipped5(memberAssigns)(function(a) {
        return snd(a.toPos);
      });
      var top3 = foldl7(max12)(-1e18)(srcYs);
      var bot = foldl7(min4)(1e18)(tgtYs);
      var $153 = top3 > bot;
      if ($153) {
        return {
          gapTop: bot,
          gapBottom: top3
        };
      }
      ;
      return {
        gapTop: top3,
        gapBottom: bot
      };
    };
    var findFreeAreas = function(segs) {
      return function(critThreshold) {
        var pair = function(lo) {
          return function(hi) {
            if (hi - lo >= 2 * critThreshold) {
              return new Just({
                startPosition: lo + critThreshold,
                endPosition: hi - critThreshold,
                size: hi - lo - 2 * critThreshold
              });
            }
            ;
            if (otherwise) {
              return Nothing.value;
            }
            ;
            throw new Error("Failed pattern match at Markgraf.EdgeRouting.HyperEdges (line 638, column 5 - line 644, column 28): " + [lo.constructor.name, hi.constructor.name]);
          };
        };
        var raw = append6(bind2(segs)(function(s) {
          return s.incoming;
        }))(bind2(segs)(function(s) {
          return s.outgoing;
        }));
        var sorted = sort2(raw);
        return mapMaybe(identity6)(zipWith(pair)(sorted)(drop(1)(sorted)));
      };
    };
    var decideWhichSegmentsToSplit = function(deps) {
      return function(segMap0) {
        var step2 = function(acc) {
          return function(dep) {
            var $156 = elem1(dep.src)(acc.decisions) || elem1(dep.tgt)(acc.decisions);
            if ($156) {
              return acc;
            }
            ;
            var v = new Tuple(lookup7(dep.src)(acc.segMap), lookup7(dep.tgt)(acc.segMap));
            if (v.value0 instanceof Just && v.value1 instanceof Just) {
              var pickTarget = representsHyperedge(v.value0.value0) && !representsHyperedge(v.value1.value0);
              var toSplit = (function() {
                if (pickTarget) {
                  return v.value1.value0;
                }
                ;
                return v.value0.value0;
              })();
              var causing = (function() {
                if (pickTarget) {
                  return v.value0.value0;
                }
                ;
                return v.value1.value0;
              })();
              var updated = {
                id: toSplit.id,
                incoming: toSplit.incoming,
                mark: toSplit.mark,
                members: toSplit.members,
                outgoing: toSplit.outgoing,
                slot: toSplit.slot,
                splitPartner: toSplit.splitPartner,
                splitBy: new Just(causing.id)
              };
              return {
                decisions: append6(acc.decisions)([toSplit.id]),
                segMap: insert7(toSplit.id)(updated)(acc.segMap)
              };
            }
            ;
            return acc;
          };
        };
        return foldl7(step2)({
          decisions: [],
          segMap: segMap0
        })(deps);
      };
    };
    var countCrossings2 = function(posis) {
      return function(start) {
        return function(end) {
          return foldl7(function(acc) {
            return function(p) {
              var $164 = p > end;
              if ($164) {
                return acc;
              }
              ;
              var $165 = p >= start;
              if ($165) {
                return acc + 1 | 0;
              }
              ;
              return acc;
            };
          })(0)(posis);
        };
      };
    };
    var countCrossingsBetween = function(left) {
      return function(right) {
        return countCrossings2(left.outgoing)(segStart(right))(segEnd(right)) + countCrossings2(right.incoming)(segStart(left))(segEnd(left)) | 0;
      };
    };
    var updateBothOrderings = function(acc) {
      return function(s1) {
        return function(s2) {
          var c12 = countCrossingsBetween(s1)(s2);
          var c21 = countCrossingsBetween(s2)(s1);
          var $166 = c12 === c21;
          if ($166) {
            var $167 = c12 > 0;
            if ($167) {
              return {
                deps: acc.deps + 2 | 0,
                crossings: acc.crossings + c12 | 0
              };
            }
            ;
            return acc;
          }
          ;
          return {
            deps: acc.deps + 1 | 0,
            crossings: acc.crossings + min1(c12)(c21) | 0
          };
        };
      };
    };
    var rateAgainst = function(segMap) {
      return function(splitSeg) {
        return function(splitPartner) {
          return function(pickId) {
            return function(acc) {
              return function(dep) {
                var v = lookup7(pickId(dep))(segMap);
                if (v instanceof Nothing) {
                  return acc;
                }
                ;
                if (v instanceof Just) {
                  var acc$prime = updateBothOrderings(acc)(splitSeg)(v.value0);
                  return updateBothOrderings(acc$prime)(splitPartner)(v.value0);
                }
                ;
                throw new Error("Failed pattern match at Markgraf.EdgeRouting.HyperEdges (line 574, column 61 - line 578, column 50): " + [v.constructor.name]);
              };
            };
          };
        };
      };
    };
    var rateArea = function(seg) {
      return function(origDeps) {
        return function(segMap) {
          return function(area) {
            var centre = (area.startPosition + area.endPosition) / 2;
            var splitSeg = {
              id: seg.id,
              incoming: seg.incoming,
              mark: seg.mark,
              members: seg.members,
              slot: seg.slot,
              splitBy: seg.splitBy,
              splitPartner: seg.splitPartner,
              outgoing: [centre]
            };
            var splitPartner = {
              id: seg.id,
              mark: seg.mark,
              members: seg.members,
              outgoing: seg.outgoing,
              slot: seg.slot,
              splitBy: seg.splitBy,
              splitPartner: seg.splitPartner,
              incoming: [centre]
            };
            var incoming = filter(function(d) {
              return d.tgt === seg.id;
            })(origDeps);
            var outgoing = filter(function(d) {
              return d.src === seg.id;
            })(origDeps);
            var acc0 = {
              crossings: 0,
              deps: 0
            };
            var acc1 = foldl7(rateAgainst(segMap)(splitSeg)(splitPartner)(function(v2) {
              return v2.src;
            }))(acc0)(incoming);
            var acc2 = foldl7(rateAgainst(segMap)(splitSeg)(splitPartner)(function(v2) {
              return v2.tgt;
            }))(acc1)(outgoing);
            var v = bind1(seg.splitBy)(function(sid) {
              return lookup7(sid)(segMap);
            });
            if (v instanceof Just) {
              return {
                deps: acc2.deps + 2 | 0,
                crossings: (acc2.crossings + countCrossingsBetween(splitSeg)(v.value0) | 0) + countCrossingsBetween(v.value0)(splitPartner) | 0
              };
            }
            ;
            if (v instanceof Nothing) {
              return acc2;
            }
            ;
            throw new Error("Failed pattern match at Markgraf.EdgeRouting.HyperEdges (line 557, column 5 - line 564, column 22): " + [v.constructor.name]);
          };
        };
      };
    };
    var conflictThreshold = 0.5 * 2.5 * toNumber(scaleFactor);
    var countConflictsCrit = function(critThreshold) {
      return function(posis1) {
        return function(posis2) {
          var walk = function($copy_a) {
            return function($copy_b) {
              return function($copy_acc) {
                var $tco_var_a = $copy_a;
                var $tco_var_b = $copy_b;
                var $tco_done1 = false;
                var $tco_result;
                function $tco_loop(a, b, acc) {
                  if (acc.critical) {
                    $tco_done1 = true;
                    return acc;
                  }
                  ;
                  if (otherwise) {
                    var v = new Tuple(uncons(a), uncons(b));
                    if (v.value0 instanceof Just && v.value1 instanceof Just) {
                      var near = function(c) {
                        return v.value0.value0.head > v.value1.value0.head - c && v.value0.value0.head < v.value1.value0.head + c;
                      };
                      var acc$prime = (function() {
                        var $176 = near(critThreshold);
                        if ($176) {
                          return {
                            conflicts: acc.conflicts,
                            critical: true
                          };
                        }
                        ;
                        var $177 = near(conflictThreshold);
                        if ($177) {
                          return {
                            critical: acc.critical,
                            conflicts: acc.conflicts + 1 | 0
                          };
                        }
                        ;
                        return acc;
                      })();
                      if (acc$prime.critical) {
                        $tco_done1 = true;
                        return acc$prime;
                      }
                      ;
                      var $179 = v.value0.value0.head <= v.value1.value0.head;
                      if ($179) {
                        $tco_var_a = v.value0.value0.tail;
                        $tco_var_b = b;
                        $copy_acc = acc$prime;
                        return;
                      }
                      ;
                      $tco_var_a = a;
                      $tco_var_b = v.value1.value0.tail;
                      $copy_acc = acc$prime;
                      return;
                    }
                    ;
                    $tco_done1 = true;
                    return acc;
                  }
                  ;
                  throw new Error("Failed pattern match at Markgraf.EdgeRouting.HyperEdges (line 332, column 5 - line 346, column 19): " + [a.constructor.name, b.constructor.name, acc.constructor.name]);
                }
                ;
                while (!$tco_done1) {
                  $tco_result = $tco_loop($tco_var_a, $tco_var_b, $copy_acc);
                }
                ;
                return $tco_result;
              };
            };
          };
          return walk(posis1)(posis2)({
            conflicts: 0,
            critical: false
          });
        };
      };
    };
    var minimumHorizontalSegmentDistance = function(segs) {
      var scan = function(acc) {
        return function(x) {
          if (acc.prev instanceof Nothing) {
            return {
              prev: new Just(x),
              mn: acc.mn
            };
          }
          ;
          if (acc.prev instanceof Just) {
            return {
              prev: new Just(x),
              mn: min4(acc.mn)(x - acc.prev.value0)
            };
          }
          ;
          throw new Error("Failed pattern match at Markgraf.EdgeRouting.HyperEdges (line 858, column 18 - line 860, column 57): " + [acc.prev.constructor.name]);
        };
      };
      var raw = append6(bind2(segs)(function(s) {
        return s.incoming;
      }))(bind2(segs)(function(s) {
        return s.outgoing;
      }));
      var sorted = nubNear(1e-9)(sort2(raw));
      var $190 = length(sorted) < 2;
      if ($190) {
        return conflictThreshold;
      }
      ;
      return foldl7(scan)({
        prev: Nothing.value,
        mn: 1e18
      })(sorted).mn;
    };
    var dependencyBetween = function(critThreshold) {
      return function(he1) {
        return function(he2) {
          var $191 = isStraightSegment(he1) || isStraightSegment(he2);
          if ($191) {
            return [];
          }
          ;
          var cr1 = countConflictsCrit(critThreshold)(he1.outgoing)(he2.incoming);
          var cr2 = countConflictsCrit(critThreshold)(he2.outgoing)(he1.incoming);
          var $192 = cr1.critical || cr2.critical;
          if ($192) {
            return append6((function() {
              if (cr1.critical) {
                return [{
                  src: he2.id,
                  tgt: he1.id,
                  weight: 1,
                  kind: Critical.value
                }];
              }
              ;
              return [];
            })())((function() {
              if (cr2.critical) {
                return [{
                  src: he1.id,
                  tgt: he2.id,
                  weight: 1,
                  kind: Critical.value
                }];
              }
              ;
              return [];
            })());
          }
          ;
          var s1 = segStart(he1);
          var e1 = segEnd(he1);
          var s2 = segStart(he2);
          var e2 = segEnd(he2);
          var crossings1 = countCrossings2(he1.outgoing)(s2)(e2) + countCrossings2(he2.incoming)(s1)(e1) | 0;
          var crossings2 = countCrossings2(he2.outgoing)(s1)(e1) + countCrossings2(he1.incoming)(s2)(e2) | 0;
          var depValue1 = (1 * cr1.conflicts | 0) + (16 * crossings1 | 0) | 0;
          var depValue2 = (1 * cr2.conflicts | 0) + (16 * crossings2 | 0) | 0;
          var $195 = depValue1 < depValue2;
          if ($195) {
            return [{
              src: he1.id,
              tgt: he2.id,
              weight: depValue2 - depValue1 | 0,
              kind: Regular.value
            }];
          }
          ;
          var $196 = depValue1 > depValue2;
          if ($196) {
            return [{
              src: he2.id,
              tgt: he1.id,
              weight: depValue1 - depValue2 | 0,
              kind: Regular.value
            }];
          }
          ;
          var $197 = depValue1 > 0;
          if ($197) {
            return [{
              src: he1.id,
              tgt: he2.id,
              weight: 0,
              kind: Regular.value
            }, {
              src: he2.id,
              tgt: he1.id,
              weight: 0,
              kind: Regular.value
            }];
          }
          ;
          return [];
        };
      };
    };
    var computeMarks = function(segs) {
      return function(deps) {
        var weight = function(m) {
          return function(k) {
            return fromMaybe(0)(lookup7(k)(m));
          };
        };
        var removeSegment = function(sid) {
          return function(mark) {
            return function(advance) {
              return function(st) {
                var outDeps = fromMaybe([])(lookup7(sid)(st.depsBySrc));
                var inDeps = fromMaybe([])(lookup7(sid)(st.depsByTgt));
                var inWeight$prime = foldl7(function(m) {
                  return function(d) {
                    return insertWith2(add2)(d.tgt)(-d.weight | 0)(m);
                  };
                })(st.inWeight)(outDeps);
                var outWeight$prime = foldl7(function(m) {
                  return function(d) {
                    return insertWith2(add2)(d.src)(-d.weight | 0)(m);
                  };
                })(st.outWeight)(inDeps);
                return advance({
                  depsBySrc: st.depsBySrc,
                  depsByTgt: st.depsByTgt,
                  nextSource: st.nextSource,
                  nextSink: st.nextSink,
                  remaining: filter(function(v1) {
                    return v1 !== sid;
                  })(st.remaining),
                  marks: insert7(sid)(mark)(st.marks),
                  inWeight: inWeight$prime,
                  outWeight: outWeight$prime
                });
              };
            };
          };
        };
        var pickMaxOutflow = function(st) {
          var outflow = function(sid) {
            return weight(st.outWeight)(sid) - weight(st.inWeight)(sid) | 0;
          };
          var sorted = sortBy(function(a) {
            return function(b) {
              return compare4(outflow(b))(outflow(a));
            };
          })(st.remaining);
          var v = head(sorted);
          if (v instanceof Nothing) {
            return st;
          }
          ;
          if (v instanceof Just) {
            return removeSegment(v.value0)(st.nextSource)(function(s) {
              return {
                depsBySrc: s.depsBySrc,
                depsByTgt: s.depsByTgt,
                inWeight: s.inWeight,
                marks: s.marks,
                outWeight: s.outWeight,
                remaining: s.remaining,
                nextSink: s.nextSink,
                nextSource: s.nextSource + 1 | 0
              };
            })(st);
          }
          ;
          throw new Error("Failed pattern match at Markgraf.EdgeRouting.HyperEdges (line 754, column 25 - line 757, column 87): " + [v.constructor.name]);
        };
        var n = length(segs);
        var initial2 = {
          remaining: mapFlipped5(segs)(function(s) {
            return s.id;
          }),
          marks: empty2,
          inWeight: foldl7(function(m) {
            return function(d) {
              return insertWith2(add2)(d.tgt)(d.weight)(m);
            };
          })(empty2)(deps),
          outWeight: foldl7(function(m) {
            return function(d) {
              return insertWith2(add2)(d.src)(d.weight)(m);
            };
          })(empty2)(deps),
          depsBySrc: foldl7(function(m) {
            return function(d) {
              return insertWith2(append6)(d.src)([d])(m);
            };
          })(empty2)(deps),
          depsByTgt: foldl7(function(m) {
            return function(d) {
              return insertWith2(append6)(d.tgt)([d])(m);
            };
          })(empty2)(deps),
          nextSink: n - 1 | 0,
          nextSource: n + 1 | 0
        };
        var finalize2 = function(st) {
          return mapFlipped5(segs)(function(seg) {
            var raw = fromMaybe(seg.id)(lookup7(seg.id)(st.marks));
            var shifted = (function() {
              var $200 = raw < n;
              if ($200) {
                return (raw + n | 0) + 1 | 0;
              }
              ;
              return raw;
            })();
            return {
              id: seg.id,
              incoming: seg.incoming,
              members: seg.members,
              outgoing: seg.outgoing,
              slot: seg.slot,
              splitBy: seg.splitBy,
              splitPartner: seg.splitPartner,
              mark: shifted
            };
          });
        };
        var drainSources = function($copy_st) {
          var $tco_done2 = false;
          var $tco_result;
          function $tco_loop(st) {
            var v = find2(function(sid) {
              return weight(st.inWeight)(sid) === 0;
            })(st.remaining);
            if (v instanceof Nothing) {
              $tco_done2 = true;
              return st;
            }
            ;
            if (v instanceof Just) {
              $copy_st = removeSegment(v.value0)(st.nextSource)(function(s) {
                return {
                  depsBySrc: s.depsBySrc,
                  depsByTgt: s.depsByTgt,
                  inWeight: s.inWeight,
                  marks: s.marks,
                  outWeight: s.outWeight,
                  remaining: s.remaining,
                  nextSink: s.nextSink,
                  nextSource: s.nextSource + 1 | 0
                };
              })(st);
              return;
            }
            ;
            throw new Error("Failed pattern match at Markgraf.EdgeRouting.HyperEdges (line 749, column 23 - line 752, column 102): " + [v.constructor.name]);
          }
          ;
          while (!$tco_done2) {
            $tco_result = $tco_loop($copy_st);
          }
          ;
          return $tco_result;
        };
        var drainSinks = function($copy_st) {
          var $tco_done3 = false;
          var $tco_result;
          function $tco_loop(st) {
            var v = find2(function(sid) {
              return weight(st.outWeight)(sid) === 0;
            })(st.remaining);
            if (v instanceof Nothing) {
              $tco_done3 = true;
              return st;
            }
            ;
            if (v instanceof Just) {
              $copy_st = removeSegment(v.value0)(st.nextSink)(function(s) {
                return {
                  nextSource: s.nextSource,
                  depsBySrc: s.depsBySrc,
                  depsByTgt: s.depsByTgt,
                  inWeight: s.inWeight,
                  marks: s.marks,
                  outWeight: s.outWeight,
                  remaining: s.remaining,
                  nextSink: s.nextSink - 1 | 0
                };
              })(st);
              return;
            }
            ;
            throw new Error("Failed pattern match at Markgraf.EdgeRouting.HyperEdges (line 744, column 21 - line 747, column 94): " + [v.constructor.name]);
          }
          ;
          while (!$tco_done3) {
            $tco_result = $tco_loop($copy_st);
          }
          ;
          return $tco_result;
        };
        var go = function($copy_st) {
          var $tco_done4 = false;
          var $tco_result;
          function $tco_loop(st) {
            var v = drainSinks(st);
            var v1 = drainSources(v);
            var $207 = $$null(v1.remaining);
            if ($207) {
              $tco_done4 = true;
              return finalize2(v1);
            }
            ;
            $copy_st = pickMaxOutflow(v1);
            return;
          }
          ;
          while (!$tco_done4) {
            $tco_result = $tco_loop($copy_st);
          }
          ;
          return $tco_result;
        };
        return go(initial2);
      };
    };
    var chooseBestArea = function(seg) {
      return function(origDeps) {
        return function(segMap) {
          return function(candidates) {
            var pickBetter = function(acc) {
              return function(r) {
                var $208 = isBetterArea(r.c.a)(r.rating)(acc.c.a)(acc.rating);
                if ($208) {
                  return r;
                }
                ;
                return acc;
              };
            };
            var dummyRating = {
              crossings: 1e6,
              deps: 1e6
            };
            var v = head(candidates);
            if (v instanceof Nothing) {
              return {
                i: 0,
                a: {
                  startPosition: 0,
                  endPosition: 0,
                  size: 0
                }
              };
            }
            ;
            if (v instanceof Just) {
              if (length(candidates) === 1) {
                return v.value0;
              }
              ;
              if (otherwise) {
                var rated = mapFlipped5(candidates)(function(c) {
                  return {
                    c,
                    rating: rateArea(seg)(origDeps)(segMap)(c.a)
                  };
                });
                var best = foldl7(pickBetter)(fromMaybe({
                  c: v.value0,
                  rating: dummyRating
                })(head(rated)))(rated);
                return best.c;
              }
              ;
            }
            ;
            throw new Error("Failed pattern match at Markgraf.EdgeRouting.HyperEdges (line 510, column 51 - line 522, column 17): " + [v.constructor.name]);
          };
        };
      };
    };
    var computePositionToSplit = function(seg) {
      return function(origDeps) {
        return function(segMap) {
          return function(freeAreas) {
            return function(critThreshold) {
              var segStartC = segStart(seg);
              var segEndC = segEnd(seg);
              var possible = filter(function(r) {
                return r.a.startPosition <= segEndC && r.a.endPosition >= segStartC;
              })(mapWithIndex2(function(i) {
                return function(a) {
                  return {
                    i,
                    a
                  };
                };
              })(freeAreas));
              if (possible.length === 0) {
                return {
                  position: (segStartC + segEndC) / 2,
                  freeAreas
                };
              }
              ;
              var best = chooseBestArea(seg)(origDeps)(segMap)(possible);
              var position2 = (best.a.startPosition + best.a.endPosition) / 2;
              var freeAreas$prime = useArea(freeAreas)(best.i)(critThreshold);
              return {
                position: position2,
                freeAreas: freeAreas$prime
              };
            };
          };
        };
      };
    };
    var splitOne = function(critThreshold) {
      return function(origDeps) {
        return function(seg) {
          return function(st) {
            var positionResult = computePositionToSplit(seg)(origDeps)(st.segMap)(st.freeAreas)(critThreshold);
            var halfA = {
              id: seg.id,
              incoming: seg.incoming,
              mark: seg.mark,
              members: seg.members,
              slot: seg.slot,
              splitBy: seg.splitBy,
              outgoing: [positionResult.position],
              splitPartner: new Just(st.nextId)
            };
            var halfARecomputed = recomputeExtent(halfA);
            var halfB = {
              id: st.nextId,
              members: seg.members,
              incoming: [positionResult.position],
              outgoing: seg.outgoing,
              slot: 0,
              mark: 0,
              splitBy: Nothing.value,
              splitPartner: new Just(seg.id)
            };
            var halfBRecomputed = recomputeExtent(halfB);
            var segMap$prime = insert7(halfBRecomputed.id)(halfBRecomputed)(insert7(halfARecomputed.id)(halfARecomputed)(st.segMap));
            return {
              segMap: segMap$prime,
              freeAreas: positionResult.freeAreas,
              nextId: st.nextId + 1 | 0
            };
          };
        };
      };
    };
    var chainCriticalsFor = function(segMap) {
      return function(seg) {
        var v = new Tuple(seg.splitBy, seg.splitPartner);
        var v1 = function(v2) {
          return [];
        };
        if (v.value0 instanceof Just && v.value1 instanceof Just) {
          var $213 = isJust(lookup7(v.value1.value0)(segMap));
          if ($213) {
            var $214 = isJust(lookup7(v.value0.value0)(segMap));
            if ($214) {
              return [{
                src: seg.id,
                tgt: v.value0.value0,
                weight: 1,
                kind: Critical.value
              }, {
                src: v.value0.value0,
                tgt: v.value1.value0,
                weight: 1,
                kind: Critical.value
              }];
            }
            ;
            return v1(true);
          }
          ;
          return v1(true);
        }
        ;
        return v1(true);
      };
    };
    var buildSegments = function(assigns) {
      var numberIds = function(segs) {
        return mapWithIndex2(function(i) {
          return function(s) {
            return {
              incoming: s.incoming,
              mark: s.mark,
              members: s.members,
              outgoing: s.outgoing,
              slot: s.slot,
              splitBy: s.splitBy,
              splitPartner: s.splitPartner,
              id: i
            };
          };
        })(segs);
      };
      var addOne = function(acc) {
        return function(a) {
          var key = segmentKey(a);
          var inX = trunkSourceX(a);
          var outX = trunkTargetX(a);
          var v = lookup23(key)(acc.entries);
          if (v instanceof Nothing) {
            return {
              entries: insert22(key)({
                id: 0,
                members: [a.edge.id],
                incoming: [inX],
                outgoing: [outX],
                slot: 0,
                mark: 0,
                splitBy: Nothing.value,
                splitPartner: Nothing.value
              })(acc.entries),
              order: append6(acc.order)([key])
            };
          }
          ;
          if (v instanceof Just) {
            return {
              order: acc.order,
              entries: insert22(key)({
                id: v.value0.id,
                mark: v.value0.mark,
                slot: v.value0.slot,
                splitBy: v.value0.splitBy,
                splitPartner: v.value0.splitPartner,
                members: append6(v.value0.members)([a.edge.id]),
                incoming: insertSorted2(inX)(v.value0.incoming),
                outgoing: insertSorted2(outX)(v.value0.outgoing)
              })(acc.entries)
            };
          }
          ;
          throw new Error("Failed pattern match at Markgraf.EdgeRouting.HyperEdges (line 233, column 7 - line 257, column 12): " + [v.constructor.name]);
        };
      };
      var seeded = foldl7(addOne)({
        entries: empty2,
        order: []
      })(assigns);
      var ordered = mapMaybe(function(k) {
        return lookup23(k)(seeded.entries);
      })(seeded.order);
      return numberIds(ordered);
    };
    var breakNonCriticalCycles = function(input) {
      var marked = computeMarks(input.segments)(input.deps);
      var markMap = fromFoldable8(mapFlipped5(marked)(function(s) {
        return new Tuple(s.id, s.mark);
      }));
      var rewrite = function(d) {
        if (isCritical(d.kind)) {
          return new Just(d);
        }
        ;
        if (markOf(markMap)(d.src) > markOf(markMap)(d.tgt)) {
          var $222 = d.weight === 0;
          if ($222) {
            return Nothing.value;
          }
          ;
          return new Just({
            src: d.tgt,
            tgt: d.src,
            weight: d.weight,
            kind: d.kind
          });
        }
        ;
        if (otherwise) {
          return new Just(d);
        }
        ;
        throw new Error("Failed pattern match at Markgraf.EdgeRouting.HyperEdges (line 712, column 5 - line 717, column 27): " + [d.constructor.name]);
      };
      return {
        segments: marked,
        deps: mapMaybe(rewrite)(input.deps)
      };
    };
    var arePartners = function(a) {
      return function(b) {
        return eq13(a.splitPartner)(new Just(b.id)) || eq13(b.splitPartner)(new Just(a.id));
      };
    };
    var regenerateDeps = function(critThreshold) {
      return function(_origDeps) {
        return function(segMap) {
          var allSegs = fromFoldable1(values(segMap));
          var n = length(allSegs);
          var pairs = bind2(range2(0)(n - 2 | 0))(function(i) {
            return bind2(range2(i + 1 | 0)(n - 1 | 0))(function(j) {
              return pure2(new Tuple(i, j));
            });
          });
          var regular = bind2(pairs)(function(v) {
            var v1 = new Tuple(index(allSegs)(v.value0), index(allSegs)(v.value1));
            if (v1.value0 instanceof Just && v1.value1 instanceof Just) {
              if (arePartners(v1.value0.value0)(v1.value1.value0)) {
                return [];
              }
              ;
              if (otherwise) {
                return dependencyBetween(critThreshold)(v1.value0.value0)(v1.value1.value0);
              }
              ;
            }
            ;
            return [];
          });
          var chainDeps = bind2(allSegs)(chainCriticalsFor(segMap));
          return append6(regular)(chainDeps);
        };
      };
    };
    var splitSegments = function(critThreshold) {
      return function(cycleDeps) {
        return function(input) {
          var segMap0 = fromFoldable8(mapFlipped5(input.segments)(function(s) {
            return new Tuple(s.id, s);
          }));
          var decisions = decideWhichSegmentsToSplit(cycleDeps)(segMap0);
          var freeAreas0 = findFreeAreas(input.segments)(critThreshold);
          var ordered = sortBy(function(a) {
            return function(b) {
              return compare22(segLength(a))(segLength(b));
            };
          })(mapMaybe(function(sid) {
            return lookup7(sid)(decisions.segMap);
          })(decisions.decisions));
          var nextId0 = length(input.segments);
          var result = foldl7(function(st) {
            return function(seg) {
              return splitOne(critThreshold)(input.deps)(seg)(st);
            };
          })({
            segMap: decisions.segMap,
            freeAreas: freeAreas0,
            nextId: nextId0
          })(ordered);
          var allSegs = fromFoldable1(values(result.segMap));
          var regenerated = regenerateDeps(critThreshold)(input.deps)(result.segMap);
          return {
            segments: allSegs,
            deps: regenerated
          };
        };
      };
    };
    var breakCriticalCycles = function(critThreshold) {
      return function(input) {
        var critDeps = filter(function(d) {
          return isCritical(d.kind);
        })(input.deps);
        var $231 = length(critDeps) < 2;
        if ($231) {
          return input;
        }
        ;
        var marked = computeMarks(input.segments)(critDeps);
        var markMap = fromFoldable8(mapFlipped5(marked)(function(s) {
          return new Tuple(s.id, s.mark);
        }));
        var leftward = filter(function(d) {
          return markOf(markMap)(d.src) > markOf(markMap)(d.tgt);
        })(critDeps);
        var $232 = $$null(leftward);
        if ($232) {
          return input;
        }
        ;
        return splitSegments(critThreshold)(leftward)(input);
      };
    };
    var addDependencies = function(critThreshold) {
      return function(segs) {
        var pairs = function(total) {
          return bind2(range2(0)(total - 2 | 0))(function(i) {
            return bind2(range2(i + 1 | 0)(total - 1 | 0))(function(j) {
              return pure2(new Tuple(i, j));
            });
          });
        };
        var pairDeps = function(v) {
          var v1 = new Tuple(index(segs)(v.value0), index(segs)(v.value1));
          if (v1.value0 instanceof Just && v1.value1 instanceof Just) {
            return dependencyBetween(critThreshold)(v1.value0.value0)(v1.value1.value0);
          }
          ;
          return [];
        };
        var n = length(segs);
        var deps = concatMap(pairDeps)(pairs(n));
        return {
          segments: segs,
          deps
        };
      };
    };
    var slotsForGap = function(v) {
      return function(assigns) {
        var segments0 = buildSegments(assigns);
        var $241 = $$null(segments0);
        if ($241) {
          return [];
        }
        ;
        var critThreshold = 0.2 * minimumHorizontalSegmentDistance(segments0);
        var withDeps = addDependencies(critThreshold)(segments0);
        var postSplit = breakCriticalCycles(critThreshold)(withDeps);
        var acyclic = breakNonCriticalCycles(postSplit);
        var numbered = topologicalNumbering(acyclic);
        var total = 1 + foldl7(function(m) {
          return function(seg) {
            return max4(m)(seg.slot);
          };
        })(0)(numbered) | 0;
        var v1 = gapBounds(numbered);
        var segById = fromFoldable8(mapFlipped5(numbered)(function(s) {
          return new Tuple(s.id, s);
        }));
        var isTrailingHalf = function(s) {
          if (s.splitPartner instanceof Just) {
            var v2 = lookup7(s.splitPartner.value0)(segById);
            if (v2 instanceof Just && isJust(v2.value0.splitBy)) {
              return true;
            }
            ;
            return false;
          }
          ;
          if (s.splitPartner instanceof Nothing) {
            return false;
          }
          ;
          throw new Error("Failed pattern match at Markgraf.EdgeRouting.HyperEdges (line 190, column 28 - line 194, column 27): " + [s.splitPartner.constructor.name]);
        };
        var useful = filter(function($270) {
          return !isTrailingHalf($270);
        })(numbered);
        return concat(mapFlipped5(useful)(function(seg) {
          return mapFlipped5(seg.members)(function(eid) {
            var partnerInfo = (function() {
              if (seg.splitPartner instanceof Just) {
                var v2 = lookup7(seg.splitPartner.value0)(segById);
                if (v2 instanceof Just) {
                  return new Just({
                    slot: v2.value0.slot,
                    splitX: fromMaybe(0)(head(v2.value0.incoming))
                  });
                }
                ;
                if (v2 instanceof Nothing) {
                  return Nothing.value;
                }
                ;
                throw new Error("Failed pattern match at Markgraf.EdgeRouting.HyperEdges (line 201, column 31 - line 203, column 39): " + [v2.constructor.name]);
              }
              ;
              if (seg.splitPartner instanceof Nothing) {
                return Nothing.value;
              }
              ;
              throw new Error("Failed pattern match at Markgraf.EdgeRouting.HyperEdges (line 200, column 31 - line 204, column 37): " + [seg.splitPartner.constructor.name]);
            })();
            return new Tuple(eid, {
              slot: seg.slot,
              slotCount: total,
              gapTop: v1.gapTop,
              gapBottom: v1.gapBottom,
              partner: partnerInfo
            });
          });
        }));
      };
    };
    var mergeGap = function(acc) {
      return function(v) {
        return foldl7(function(m) {
          return function(v1) {
            return insert32(v1.value0)(v1.value1)(m);
          };
        })(acc)(slotsForGap(v.value0)(v.value1));
      };
    };
    return foldl7(mergeGap)(empty2)(grouped);
  };
};
var slotCountByGap = function(assignments) {
  return function(placements) {
    var slots = assignSlots(assignments)(placements);
    var placedByNode = foldl7(function(m) {
      return function(p) {
        return insert1(p.node)(p)(m);
      };
    })(empty2)(placements);
    var layerOfNode = function(nid) {
      return mapFlipped1(lookup12(nid)(placedByNode))(function(v) {
        return v.layer;
      });
    };
    var gapIndex = function(a) {
      var v = new Tuple(layerOfNode(a.edge.from.node), layerOfNode(a.edge.to.node));
      if (v.value0 instanceof Just && (v.value1 instanceof Just && v.value0.value0 !== v.value1.value0)) {
        return new Just(min1(v.value0.value0)(v.value1.value0));
      }
      ;
      return Nothing.value;
    };
    var perEdge = function(acc) {
      return function(a) {
        var v = new Tuple(gapIndex(a), lookup32(a.edge.id)(slots));
        if (v.value0 instanceof Just && v.value1 instanceof Just) {
          return insert7(v.value0.value0)(v.value1.value0.slotCount)(acc);
        }
        ;
        return acc;
      };
    };
    return foldl7(perEdge)(empty2)(assignments);
  };
};

// ../markgraf/output/Markgraf.Result/index.js
var H = /* @__PURE__ */ (function() {
  function H2() {
  }
  ;
  H2.value = new H2();
  return H2;
})();
var V = /* @__PURE__ */ (function() {
  function V2() {
  }
  ;
  V2.value = new V2();
  return V2;
})();
var eqDirection = {
  eq: function(x) {
    return function(y) {
      if (x instanceof H && y instanceof H) {
        return true;
      }
      ;
      if (x instanceof V && y instanceof V) {
        return true;
      }
      ;
      return false;
    };
  }
};

// ../markgraf/output/Markgraf.EdgeRouting.Orthogonal/index.js
var any3 = /* @__PURE__ */ any(foldableArray)(heytingAlgebraBoolean);
var min5 = /* @__PURE__ */ min(ordNumber);
var max5 = /* @__PURE__ */ max(ordNumber);
var eq3 = /* @__PURE__ */ eq(eqDirection);
var append7 = /* @__PURE__ */ append(semigroupArray);
var bind3 = /* @__PURE__ */ bind(bindMaybe);
var alt2 = /* @__PURE__ */ alt(altMaybe);
var compare5 = /* @__PURE__ */ compare(ordNumber);
var mapFlipped6 = /* @__PURE__ */ mapFlipped(functorArray);
var vLineIntersects = function(y1) {
  return function(y2) {
    return function(x) {
      return function(r) {
        return x >= r.x && (x < r.x + r.w && (y2 > r.y && y1 < r.y + r.h));
      };
    };
  };
};
var vSegCrossesRect = function(y1) {
  return function(y2) {
    return function(x) {
      return function(rects) {
        return any3(vLineIntersects(y1)(y2)(x))(rects);
      };
    };
  };
};
var vSegCrossesAny = function(obstacles) {
  return function(y1) {
    return function(y2) {
      return function(x) {
        return vSegCrossesRect(min5(y1)(y2))(max5(y1)(y2))(x)(obstacles);
      };
    };
  };
};
var stepAway = function(side) {
  return function(v) {
    if (side instanceof South) {
      return new Tuple(v.value0, v.value1 + 4);
    }
    ;
    if (side instanceof North) {
      return new Tuple(v.value0, v.value1 - 4);
    }
    ;
    if (side instanceof East) {
      return new Tuple(v.value0 + 4, v.value1);
    }
    ;
    if (side instanceof West) {
      return new Tuple(v.value0 - 4, v.value1);
    }
    ;
    throw new Error("Failed pattern match at Markgraf.EdgeRouting.Orthogonal (line 423, column 26 - line 427, column 25): " + [side.constructor.name]);
  };
};
var sideDir = function(v) {
  if (v instanceof South) {
    return V.value;
  }
  ;
  if (v instanceof North) {
    return V.value;
  }
  ;
  if (v instanceof East) {
    return H.value;
  }
  ;
  if (v instanceof West) {
    return H.value;
  }
  ;
  throw new Error("Failed pattern match at Markgraf.EdgeRouting.Orthogonal (line 429, column 1 - line 429, column 29): " + [v.constructor.name]);
};
var sf = /* @__PURE__ */ toNumber(scaleFactor);
var segmentsToObstacles = /* @__PURE__ */ (function() {
  var segToRect = function(seg) {
    if (seg.direction instanceof H) {
      var y = gridY(seg.start);
      var x1 = min5(gridX(seg.start))(gridX(seg.end));
      var x2 = max5(gridX(seg.start))(gridX(seg.end));
      return [{
        x: x1,
        y: y - 1,
        w: x2 - x1,
        h: 2
      }];
    }
    ;
    if (seg.direction instanceof V) {
      var x = gridX(seg.start);
      var y1 = min5(gridY(seg.start))(gridY(seg.end));
      var y2 = max5(gridY(seg.start))(gridY(seg.end));
      return [{
        x: x - 1,
        y: y1,
        w: 2,
        h: y2 - y1
      }];
    }
    ;
    throw new Error("Failed pattern match at Markgraf.EdgeRouting.Orthogonal (line 481, column 19 - line 491, column 52): " + [seg.direction.constructor.name]);
  };
  return concatMap(segToRect);
})();
var removeZeroLength = /* @__PURE__ */ (function() {
  var abs4 = function(n) {
    var $64 = n < 0;
    if ($64) {
      return -n;
    }
    ;
    return n;
  };
  var nearlyEq = function(a) {
    return function(b) {
      return abs4(gridX(a) - gridX(b)) < 1e-6 && abs4(gridY(a) - gridY(b)) < 1e-6;
    };
  };
  return filter(function(s) {
    return !nearlyEq(s.start)(s.end);
  });
})();
var mergeSegments = function(entry) {
  return function(middle) {
    return function(exit) {
      var v = uncons(middle);
      if (v instanceof Nothing) {
        return [{
          start: entry.start,
          end: exit.end,
          direction: entry.direction
        }];
      }
      ;
      if (v instanceof Just) {
        var front = (function() {
          var $66 = eq3(v.value0.head.direction)(entry.direction);
          if ($66) {
            return [{
              start: entry.start,
              end: v.value0.head.end,
              direction: entry.direction
            }];
          }
          ;
          return [entry, v.value0.head];
        })();
        var v1 = unsnoc(v.value0.tail);
        if (v1 instanceof Nothing) {
          var v2 = last(front);
          if (v2 instanceof Just && eq3(v2.value0.direction)(exit.direction)) {
            return append7(dropEnd(1)(front))([{
              start: v2.value0.start,
              end: exit.end,
              direction: exit.direction
            }]);
          }
          ;
          return append7(front)([exit]);
        }
        ;
        if (v1 instanceof Just) {
          var $70 = eq3(v1.value0.last.direction)(exit.direction);
          if ($70) {
            return append7(front)(append7(v1.value0.init)([{
              start: v1.value0.last.start,
              end: exit.end,
              direction: exit.direction
            }]));
          }
          ;
          return append7(front)(append7(v.value0.tail)([exit]));
        }
        ;
        throw new Error("Failed pattern match at Markgraf.EdgeRouting.Orthogonal (line 444, column 5 - line 451, column 39): " + [v1.constructor.name]);
      }
      ;
      throw new Error("Failed pattern match at Markgraf.EdgeRouting.Orthogonal (line 437, column 35 - line 451, column 39): " + [v.constructor.name]);
    };
  };
};
var mergeCollinear = function(segs) {
  var sameDirection = function(a) {
    return function(b) {
      return eq3(a.direction)(b.direction) && (function() {
        if (a.direction instanceof H) {
          return gridX(a.end) - gridX(a.start) >= 0 === gridX(b.end) - gridX(b.start) >= 0;
        }
        ;
        if (a.direction instanceof V) {
          return gridY(a.end) - gridY(a.start) >= 0 === gridY(b.end) - gridY(b.start) >= 0;
        }
        ;
        throw new Error("Failed pattern match at Markgraf.EdgeRouting.Orthogonal (line 324, column 53 - line 326, column 86): " + [a.direction.constructor.name]);
      })();
    };
  };
  var collapse = function(current) {
    return function(rest) {
      var v2 = uncons(rest);
      if (v2 instanceof Nothing) {
        return [current];
      }
      ;
      if (v2 instanceof Just) {
        if (sameDirection(current)(v2.value0.head)) {
          return collapse({
            start: current.start,
            end: v2.value0.head.end,
            direction: current.direction
          })(v2.value0.tail);
        }
        ;
        if (otherwise) {
          return cons(current)(collapse(v2.value0.head)(v2.value0.tail));
        }
        ;
      }
      ;
      throw new Error("Failed pattern match at Markgraf.EdgeRouting.Orthogonal (line 316, column 27 - line 322, column 46): " + [v2.constructor.name]);
    };
  };
  var v = uncons(segs);
  if (v instanceof Nothing) {
    return [];
  }
  ;
  if (v instanceof Just) {
    return collapse(v.value0.head)(v.value0.tail);
  }
  ;
  throw new Error("Failed pattern match at Markgraf.EdgeRouting.Orthogonal (line 312, column 23 - line 314, column 44): " + [v.constructor.name]);
};
var iabs = function(n) {
  var $86 = n < 0;
  if ($86) {
    return -n;
  }
  ;
  return n;
};
var hLineIntersects = function(x1) {
  return function(x2) {
    return function(y) {
      return function(r) {
        return y >= r.y && (y < r.y + r.h && (x2 > r.x && x1 < r.x + r.w));
      };
    };
  };
};
var hSegCrossesRect = function(x1) {
  return function(x2) {
    return function(y) {
      return function(rects) {
        return any3(hLineIntersects(x1)(x2)(y))(rects);
      };
    };
  };
};
var hSegCrossesAny = function(obstacles) {
  return function(x1) {
    return function(x2) {
      return function(y) {
        return hSegCrossesRect(min5(x1)(x2))(max5(x1)(x2))(y)(obstacles);
      };
    };
  };
};
var simplifyPair = function(obstacles) {
  return function(segs) {
    return function(idx) {
      return function(n) {
        var vClear = function(x) {
          return function(y1) {
            return function(y2) {
              return !vSegCrossesAny(obstacles)(min5(y1)(y2))(max5(y1)(y2))(x);
            };
          };
        };
        var suffix = drop(idx + 2 | 0)(segs);
        var prefix2 = take(idx)(segs);
        var tryV = function(sx) {
          return function(sy) {
            return function(ex$prime) {
              return function(ey$prime) {
                return function(firstOk) {
                  return function(lastOk) {
                    return function(start) {
                      return function(end) {
                        if (sx === ex$prime && (firstOk(V.value) && (lastOk(V.value) && vClear(sx)(sy)(ey$prime)))) {
                          return new Just(append7(prefix2)(append7([{
                            start,
                            end,
                            direction: V.value
                          }])(suffix)));
                        }
                        ;
                        if (otherwise) {
                          return Nothing.value;
                        }
                        ;
                        throw new Error("Failed pattern match at Markgraf.EdgeRouting.Orthogonal (line 410, column 3 - line 413, column 26): " + [sx.constructor.name, sy.constructor.name, ex$prime.constructor.name, ey$prime.constructor.name, firstOk.constructor.name, lastOk.constructor.name, start.constructor.name, end.constructor.name]);
                      };
                    };
                  };
                };
              };
            };
          };
        };
        var isLast = (idx + 1 | 0) === (n - 1 | 0);
        var isFirst = idx === 0;
        var hClear = function(y) {
          return function(x1) {
            return function(x2) {
              return !hSegCrossesAny(obstacles)(min5(x1)(x2))(max5(x1)(x2))(y);
            };
          };
        };
        var tryH = function(sx) {
          return function(sy) {
            return function(ex$prime) {
              return function(ey$prime) {
                return function(firstOk) {
                  return function(lastOk) {
                    return function(start) {
                      return function(end) {
                        if (sy === ey$prime && (firstOk(H.value) && (lastOk(H.value) && hClear(sy)(sx)(ex$prime)))) {
                          return new Just(append7(prefix2)(append7([{
                            start,
                            end,
                            direction: H.value
                          }])(suffix)));
                        }
                        ;
                        if (otherwise) {
                          return Nothing.value;
                        }
                        ;
                        throw new Error("Failed pattern match at Markgraf.EdgeRouting.Orthogonal (line 415, column 3 - line 418, column 26): " + [sx.constructor.name, sy.constructor.name, ex$prime.constructor.name, ey$prime.constructor.name, firstOk.constructor.name, lastOk.constructor.name, start.constructor.name, end.constructor.name]);
                      };
                    };
                  };
                };
              };
            };
          };
        };
        return bind3(index(segs)(idx))(function(s0) {
          return bind3(index(segs)(idx + 1 | 0))(function(s1) {
            var sx = gridX(s0.start);
            var sy = gridY(s0.start);
            var ex$prime = gridX(s1.end);
            var ey$prime = gridY(s1.end);
            var firstOk = function(d) {
              return !isFirst || eq3(s0.direction)(d);
            };
            var lastOk = function(d) {
              return !isLast || eq3(s1.direction)(d);
            };
            return alt2(tryV(sx)(sy)(ex$prime)(ey$prime)(firstOk)(lastOk)(s0.start)(s1.end))(tryH(sx)(sy)(ex$prime)(ey$prime)(firstOk)(lastOk)(s0.start)(s1.end));
          });
        });
      };
    };
  };
};
var trySimplifyPairOnce = function(obstacles) {
  return function(segs) {
    var n = length(segs);
    var go = function($copy_idx) {
      var $tco_done = false;
      var $tco_result;
      function $tco_loop(idx) {
        if ((idx + 1 | 0) >= n) {
          $tco_done = true;
          return segs;
        }
        ;
        if (otherwise) {
          var v = simplifyPair(obstacles)(segs)(idx)(n);
          if (v instanceof Just) {
            $tco_done = true;
            return v.value0;
          }
          ;
          if (v instanceof Nothing) {
            $copy_idx = idx + 1 | 0;
            return;
          }
          ;
          throw new Error("Failed pattern match at Markgraf.EdgeRouting.Orthogonal (line 385, column 19 - line 387, column 32): " + [v.constructor.name]);
        }
        ;
        throw new Error("Failed pattern match at Markgraf.EdgeRouting.Orthogonal (line 383, column 3 - line 387, column 32): " + [idx.constructor.name]);
      }
      ;
      while (!$tco_done) {
        $tco_result = $tco_loop($copy_idx);
      }
      ;
      return $tco_result;
    };
    return go(0);
  };
};
var simplifyTriple = function(obstacles) {
  return function(segs) {
    return function(idx) {
      return function(n) {
        var vClear = function(x) {
          return function(y1) {
            return function(y2) {
              return !vSegCrossesAny(obstacles)(min5(y1)(y2))(max5(y1)(y2))(x);
            };
          };
        };
        var suffix = drop(idx + 3 | 0)(segs);
        var prefix2 = take(idx)(segs);
        var isLast = (idx + 2 | 0) === (n - 1 | 0);
        var isFirst = idx === 0;
        var hClear = function(y) {
          return function(x1) {
            return function(x2) {
              return !hSegCrossesAny(obstacles)(min5(x1)(x2))(max5(x1)(x2))(y);
            };
          };
        };
        var tryHV = function(sx) {
          return function(sy) {
            return function(ex$prime) {
              return function(ey$prime) {
                return function(firstOk) {
                  return function(lastOk) {
                    return function(start) {
                      return function(end) {
                        if (firstOk(H.value) && (lastOk(V.value) && (hClear(sy)(sx)(ex$prime) && vClear(ex$prime)(sy)(ey$prime)))) {
                          var corner = new Tuple(ex$prime, sy);
                          return new Just(append7(prefix2)(append7([{
                            start,
                            end: corner,
                            direction: H.value
                          }, {
                            start: corner,
                            end,
                            direction: V.value
                          }])(suffix)));
                        }
                        ;
                        if (otherwise) {
                          return Nothing.value;
                        }
                        ;
                        throw new Error("Failed pattern match at Markgraf.EdgeRouting.Orthogonal (line 373, column 3 - line 377, column 26): " + [sx.constructor.name, sy.constructor.name, ex$prime.constructor.name, ey$prime.constructor.name, firstOk.constructor.name, lastOk.constructor.name, start.constructor.name, end.constructor.name]);
                      };
                    };
                  };
                };
              };
            };
          };
        };
        var tryStraight = function(sx) {
          return function(sy) {
            return function(ex$prime) {
              return function(ey$prime) {
                return function(firstOk) {
                  return function(lastOk) {
                    return function(start) {
                      return function(end) {
                        if (sx === ex$prime && (firstOk(V.value) && (lastOk(V.value) && vClear(sx)(sy)(ey$prime)))) {
                          return new Just(append7(prefix2)(append7([{
                            start,
                            end,
                            direction: V.value
                          }])(suffix)));
                        }
                        ;
                        if (sy === ey$prime && (firstOk(H.value) && (lastOk(H.value) && hClear(sy)(sx)(ex$prime)))) {
                          return new Just(append7(prefix2)(append7([{
                            start,
                            end,
                            direction: H.value
                          }])(suffix)));
                        }
                        ;
                        if (otherwise) {
                          return Nothing.value;
                        }
                        ;
                        throw new Error("Failed pattern match at Markgraf.EdgeRouting.Orthogonal (line 360, column 3 - line 365, column 26): " + [sx.constructor.name, sy.constructor.name, ex$prime.constructor.name, ey$prime.constructor.name, firstOk.constructor.name, lastOk.constructor.name, start.constructor.name, end.constructor.name]);
                      };
                    };
                  };
                };
              };
            };
          };
        };
        var tryVH = function(sx) {
          return function(sy) {
            return function(ex$prime) {
              return function(ey$prime) {
                return function(firstOk) {
                  return function(lastOk) {
                    return function(start) {
                      return function(end) {
                        if (firstOk(V.value) && (lastOk(H.value) && (vClear(sx)(sy)(ey$prime) && hClear(ey$prime)(sx)(ex$prime)))) {
                          var corner = new Tuple(sx, ey$prime);
                          return new Just(append7(prefix2)(append7([{
                            start,
                            end: corner,
                            direction: V.value
                          }, {
                            start: corner,
                            end,
                            direction: H.value
                          }])(suffix)));
                        }
                        ;
                        if (otherwise) {
                          return Nothing.value;
                        }
                        ;
                        throw new Error("Failed pattern match at Markgraf.EdgeRouting.Orthogonal (line 367, column 3 - line 371, column 26): " + [sx.constructor.name, sy.constructor.name, ex$prime.constructor.name, ey$prime.constructor.name, firstOk.constructor.name, lastOk.constructor.name, start.constructor.name, end.constructor.name]);
                      };
                    };
                  };
                };
              };
            };
          };
        };
        return bind3(index(segs)(idx))(function(s0) {
          return bind3(index(segs)(idx + 2 | 0))(function(s2) {
            var sx = gridX(s0.start);
            var sy = gridY(s0.start);
            var ex$prime = gridX(s2.end);
            var ey$prime = gridY(s2.end);
            var firstOk = function(d) {
              return !isFirst || eq3(s0.direction)(d);
            };
            var lastOk = function(d) {
              return !isLast || eq3(s2.direction)(d);
            };
            return alt2(tryStraight(sx)(sy)(ex$prime)(ey$prime)(firstOk)(lastOk)(s0.start)(s2.end))(alt2(tryVH(sx)(sy)(ex$prime)(ey$prime)(firstOk)(lastOk)(s0.start)(s2.end))(tryHV(sx)(sy)(ex$prime)(ey$prime)(firstOk)(lastOk)(s0.start)(s2.end)));
          });
        });
      };
    };
  };
};
var trySimplifyOnce = function(obstacles) {
  return function(segs) {
    var n = length(segs);
    var go = function($copy_idx) {
      var $tco_done = false;
      var $tco_result;
      function $tco_loop(idx) {
        if ((idx + 2 | 0) >= n) {
          $tco_done = true;
          return segs;
        }
        ;
        if (otherwise) {
          var v = simplifyTriple(obstacles)(segs)(idx)(n);
          if (v instanceof Just) {
            $tco_done = true;
            return v.value0;
          }
          ;
          if (v instanceof Nothing) {
            $copy_idx = idx + 1 | 0;
            return;
          }
          ;
          throw new Error("Failed pattern match at Markgraf.EdgeRouting.Orthogonal (line 334, column 19 - line 336, column 32): " + [v.constructor.name]);
        }
        ;
        throw new Error("Failed pattern match at Markgraf.EdgeRouting.Orthogonal (line 332, column 3 - line 336, column 32): " + [idx.constructor.name]);
      }
      ;
      while (!$tco_done) {
        $tco_result = $tco_loop($copy_idx);
      }
      ;
      return $tco_result;
    };
    return go(0);
  };
};
var simplifySegments = function(obstacles) {
  var go = function($copy_segs) {
    var $tco_done = false;
    var $tco_result;
    function $tco_loop(segs) {
      var afterTriples = trySimplifyOnce(obstacles)(segs);
      var afterPairs = trySimplifyPairOnce(obstacles)(afterTriples);
      var simplified = mergeCollinear(removeZeroLength(afterPairs));
      var $133 = length(simplified) < length(segs);
      if ($133) {
        $copy_segs = simplified;
        return;
      }
      ;
      $tco_done = true;
      return simplified;
    }
    ;
    while (!$tco_done) {
      $tco_result = $tco_loop($copy_segs);
    }
    ;
    return $tco_result;
  };
  return function($226) {
    return go(mergeCollinear(removeZeroLength($226)));
  };
};
var findGapBeforeBlockH = function(obstacles) {
  return function(y) {
    return function(x1) {
      return function(x2) {
        var minX = min5(x1)(x2);
        var maxX = max5(x1)(x2);
        var blockers = filter(function(r) {
          return y >= r.y && (y < r.y + r.h && (r.x + r.w > minX && r.x < maxX));
        })(obstacles);
        var goingRight = x2 > x1;
        if (goingRight) {
          var v = head(sortBy(function(a) {
            return function(b) {
              return compare5(a.x)(b.x);
            };
          })(blockers));
          if (v instanceof Just) {
            return v.value0.x - 1;
          }
          ;
          if (v instanceof Nothing) {
            return (x1 + x2) / 2;
          }
          ;
          throw new Error("Failed pattern match at Markgraf.EdgeRouting.Orthogonal (line 233, column 22 - line 235, column 31): " + [v.constructor.name]);
        }
        ;
        var v = head(sortBy(function(a) {
          return function(b) {
            return compare5(b.x)(a.x);
          };
        })(mapFlipped6(blockers)(function(r) {
          return {
            h: r.h,
            w: r.w,
            y: r.y,
            x: r.x + r.w
          };
        })));
        if (v instanceof Just) {
          return v.value0.x + 1;
        }
        ;
        if (v instanceof Nothing) {
          return (x1 + x2) / 2;
        }
        ;
        throw new Error("Failed pattern match at Markgraf.EdgeRouting.Orthogonal (line 236, column 8 - line 238, column 31): " + [v.constructor.name]);
      };
    };
  };
};
var findGapBeforeBlock = function(obstacles) {
  return function(x) {
    return function(y1) {
      return function(y2) {
        var minY = min5(y1)(y2);
        var maxY = max5(y1)(y2);
        var blockers = filter(function(r) {
          return x >= r.x && (x < r.x + r.w && (r.y + r.h > minY && r.y < maxY));
        })(obstacles);
        var goingDown = y2 > y1;
        if (goingDown) {
          var v = head(sortBy(function(a) {
            return function(b) {
              return compare5(a.y)(b.y);
            };
          })(blockers));
          if (v instanceof Just) {
            return v.value0.y - 1;
          }
          ;
          if (v instanceof Nothing) {
            return (y1 + y2) / 2;
          }
          ;
          throw new Error("Failed pattern match at Markgraf.EdgeRouting.Orthogonal (line 181, column 21 - line 183, column 31): " + [v.constructor.name]);
        }
        ;
        var v = head(sortBy(function(a) {
          return function(b) {
            return compare5(b.y)(a.y);
          };
        })(mapFlipped6(blockers)(function(r) {
          return {
            h: r.h,
            w: r.w,
            x: r.x,
            y: r.y + r.h
          };
        })));
        if (v instanceof Just) {
          return v.value0.y + 1;
        }
        ;
        if (v instanceof Nothing) {
          return (y1 + y2) / 2;
        }
        ;
        throw new Error("Failed pattern match at Markgraf.EdgeRouting.Orthogonal (line 184, column 8 - line 186, column 31): " + [v.constructor.name]);
      };
    };
  };
};
var findGapAfterBlockH = function(obstacles) {
  return function(y) {
    return function(x1) {
      return function(x2) {
        var minX = min5(x1)(x2);
        var maxX = max5(x1)(x2);
        var blockers = filter(function(r) {
          return y >= r.y && (y < r.y + r.h && (r.x + r.w > minX && r.x < maxX));
        })(obstacles);
        var goingRight = x2 > x1;
        if (goingRight) {
          var v = head(sortBy(function(a) {
            return function(b) {
              return compare5(b.x)(a.x);
            };
          })(mapFlipped6(blockers)(function(r) {
            return {
              h: r.h,
              w: r.w,
              y: r.y,
              x: r.x + r.w
            };
          })));
          if (v instanceof Just) {
            return v.value0.x;
          }
          ;
          if (v instanceof Nothing) {
            return (x1 + x2) / 2;
          }
          ;
          throw new Error("Failed pattern match at Markgraf.EdgeRouting.Orthogonal (line 246, column 22 - line 248, column 31): " + [v.constructor.name]);
        }
        ;
        var v = head(sortBy(function(a) {
          return function(b) {
            return compare5(a.x)(b.x);
          };
        })(blockers));
        if (v instanceof Just) {
          return v.value0.x - 1;
        }
        ;
        if (v instanceof Nothing) {
          return (x1 + x2) / 2;
        }
        ;
        throw new Error("Failed pattern match at Markgraf.EdgeRouting.Orthogonal (line 249, column 8 - line 251, column 31): " + [v.constructor.name]);
      };
    };
  };
};
var findGapAfterBlock = function(obstacles) {
  return function(x) {
    return function(y1) {
      return function(y2) {
        var minY = min5(y1)(y2);
        var maxY = max5(y1)(y2);
        var blockers = filter(function(r) {
          return x >= r.x && (x < r.x + r.w && (r.y + r.h > minY && r.y < maxY));
        })(obstacles);
        var goingDown = y2 > y1;
        if (goingDown) {
          var v = head(sortBy(function(a) {
            return function(b) {
              return compare5(b.y)(a.y);
            };
          })(mapFlipped6(blockers)(function(r) {
            return {
              h: r.h,
              w: r.w,
              x: r.x,
              y: r.y + r.h
            };
          })));
          if (v instanceof Just) {
            return v.value0.y;
          }
          ;
          if (v instanceof Nothing) {
            return (y1 + y2) / 2;
          }
          ;
          throw new Error("Failed pattern match at Markgraf.EdgeRouting.Orthogonal (line 195, column 21 - line 197, column 31): " + [v.constructor.name]);
        }
        ;
        var v = head(sortBy(function(a) {
          return function(b) {
            return compare5(a.y)(b.y);
          };
        })(blockers));
        if (v instanceof Just) {
          return v.value0.y - 1;
        }
        ;
        if (v instanceof Nothing) {
          return (y1 + y2) / 2;
        }
        ;
        throw new Error("Failed pattern match at Markgraf.EdgeRouting.Orthogonal (line 198, column 8 - line 200, column 31): " + [v.constructor.name]);
      };
    };
  };
};
var findClearChannel = function($copy_crosses) {
  return function($copy_mid) {
    return function($copy_offset) {
      var $tco_var_crosses = $copy_crosses;
      var $tco_var_mid = $copy_mid;
      var $tco_done = false;
      var $tco_result;
      function $tco_loop(crosses, mid2, offset) {
        if (offset > 100) {
          $tco_done = true;
          return mid2;
        }
        ;
        if (!crosses(mid2 + offset)) {
          $tco_done = true;
          return mid2 + offset;
        }
        ;
        if (!crosses(mid2 - offset)) {
          $tco_done = true;
          return mid2 - offset;
        }
        ;
        if (otherwise) {
          $tco_var_crosses = crosses;
          $tco_var_mid = mid2;
          $copy_offset = offset + 1;
          return;
        }
        ;
        throw new Error("Failed pattern match at Markgraf.EdgeRouting.Orthogonal (line 285, column 1 - line 285, column 70): " + [crosses.constructor.name, mid2.constructor.name, offset.constructor.name]);
      }
      ;
      while (!$tco_done) {
        $tco_result = $tco_loop($tco_var_crosses, $tco_var_mid, $copy_offset);
      }
      ;
      return $tco_result;
    };
  };
};
var pickChannelX = function(obstacles) {
  return function(y1) {
    return function(y2) {
      return function(x1) {
        return function(x2) {
          var minY = min5(y1)(y2);
          var maxY = max5(y1)(y2);
          var crosses = function(x) {
            return vSegCrossesRect(minY)(maxY)(x)(obstacles);
          };
          var $157 = !crosses(x1);
          if ($157) {
            return x1;
          }
          ;
          var $158 = !crosses(x2);
          if ($158) {
            return x2;
          }
          ;
          var mid2 = (x1 + x2) / 2;
          var $159 = !crosses(mid2);
          if ($159) {
            return mid2;
          }
          ;
          return findClearChannel(crosses)(mid2)(1);
        };
      };
    };
  };
};
var pickChannelY = function(obstacles) {
  return function(x1) {
    return function(x2) {
      return function(y1) {
        return function(y2) {
          var minX = min5(x1)(x2);
          var maxX = max5(x1)(x2);
          var crosses = function(y) {
            return hSegCrossesRect(minX)(maxX)(y)(obstacles);
          };
          var $160 = !crosses(y1);
          if ($160) {
            return y1;
          }
          ;
          var $161 = !crosses(y2);
          if ($161) {
            return y2;
          }
          ;
          var mid2 = (y1 + y2) / 2;
          var $162 = !crosses(mid2);
          if ($162) {
            return mid2;
          }
          ;
          return findClearChannel(crosses)(mid2)(1);
        };
      };
    };
  };
};
var detourClearance = 4;
var pickDetourX = function(obstacles) {
  return function(y1) {
    return function(y2) {
      return function(x) {
        var minY = min5(y1)(y2);
        var maxY = max5(y1)(y2);
        var blockers = filter(function(r) {
          return x >= r.x && (x < r.x + r.w && (r.y + r.h > minY && r.y < maxY));
        })(obstacles);
        var rightEdge = foldl2(function(acc) {
          return function(r) {
            return max5(acc)(r.x + r.w + detourClearance);
          };
        })(x + detourClearance)(blockers);
        var leftEdge = foldl2(function(acc) {
          return function(r) {
            return min5(acc)(r.x - detourClearance);
          };
        })(x - detourClearance)(blockers);
        var $163 = iabs(rightEdge - x) <= iabs(leftEdge - x);
        if ($163) {
          return rightEdge;
        }
        ;
        return leftEdge;
      };
    };
  };
};
var pickDetourY = function(obstacles) {
  return function(x1) {
    return function(x2) {
      return function(y) {
        var minX = min5(x1)(x2);
        var maxX = max5(x1)(x2);
        var blockers = filter(function(r) {
          return y >= r.y && (y < r.y + r.h && (r.x + r.w > minX && r.x < maxX));
        })(obstacles);
        var bottomEdge = foldl2(function(acc) {
          return function(r) {
            return max5(acc)(r.y + r.h + detourClearance);
          };
        })(y + detourClearance)(blockers);
        var topEdge = foldl2(function(acc) {
          return function(r) {
            return min5(acc)(r.y - detourClearance);
          };
        })(y - detourClearance)(blockers);
        var $164 = iabs(bottomEdge - y) <= iabs(topEdge - y);
        if ($164) {
          return bottomEdge;
        }
        ;
        return topEdge;
      };
    };
  };
};
var findRouteSlot = function(slotY2) {
  return function(nodeObstacles) {
    return function(obstacles) {
      return function(fromSide) {
        return function(v) {
          return function(toSide) {
            return function(v1) {
              var v2 = stepAway(fromSide)(new Tuple(v.value0, v.value1));
              var v3 = stepAway(toSide)(new Tuple(v1.value0, v1.value1));
              var vStraightClear = function(x) {
                return function(y1) {
                  return function(y2) {
                    return !vSegCrossesAny(nodeObstacles)(min5(y1)(y2))(max5(y1)(y2))(x);
                  };
                };
              };
              var vClear = function(x) {
                return function(y1) {
                  return function(y2) {
                    return !vSegCrossesAny(obstacles)(min5(y1)(y2))(max5(y1)(y2))(x);
                  };
                };
              };
              var straight = function(dir) {
                return function(x1) {
                  return function(y1) {
                    return function(x2) {
                      return function(y2) {
                        return [{
                          start: new Tuple(x1, y1),
                          end: new Tuple(x2, y2),
                          direction: dir
                        }];
                      };
                    };
                  };
                };
              };
              var slotChannelY = function(x1) {
                return function(x2) {
                  return function(y1) {
                    return function(y2) {
                      if (slotY2 instanceof Just && !hSegCrossesAny(obstacles)(min5(x1)(x2))(max5(x1)(x2))(slotY2.value0)) {
                        return slotY2.value0;
                      }
                      ;
                      return pickChannelY(nodeObstacles)(x1)(x2)(y1)(y2);
                    };
                  };
                };
              };
              var vhv = function(x1) {
                return function(y1) {
                  return function(x2) {
                    return function(y2) {
                      if (x1 === x2) {
                        var detourX = pickDetourX(nodeObstacles)(y1)(y2)(x1);
                        var midY1 = findGapBeforeBlock(nodeObstacles)(x1)(y1)(y2);
                        var midY2 = findGapAfterBlock(nodeObstacles)(x1)(y1)(y2);
                        return [{
                          start: new Tuple(x1, y1),
                          end: new Tuple(x1, midY1),
                          direction: V.value
                        }, {
                          start: new Tuple(x1, midY1),
                          end: new Tuple(detourX, midY1),
                          direction: H.value
                        }, {
                          start: new Tuple(detourX, midY1),
                          end: new Tuple(detourX, midY2),
                          direction: V.value
                        }, {
                          start: new Tuple(detourX, midY2),
                          end: new Tuple(x2, midY2),
                          direction: H.value
                        }, {
                          start: new Tuple(x2, midY2),
                          end: new Tuple(x2, y2),
                          direction: V.value
                        }];
                      }
                      ;
                      if (otherwise) {
                        var midY = slotChannelY(x1)(x2)(y1)(y2);
                        return [{
                          start: new Tuple(x1, y1),
                          end: new Tuple(x1, midY),
                          direction: V.value
                        }, {
                          start: new Tuple(x1, midY),
                          end: new Tuple(x2, midY),
                          direction: H.value
                        }, {
                          start: new Tuple(x2, midY),
                          end: new Tuple(x2, y2),
                          direction: V.value
                        }];
                      }
                      ;
                      throw new Error("Failed pattern match at Markgraf.EdgeRouting.Orthogonal (line 135, column 3 - line 152, column 10): " + [x1.constructor.name, y1.constructor.name, x2.constructor.name, y2.constructor.name]);
                    };
                  };
                };
              };
              var hvh = function(x1) {
                return function(y1) {
                  return function(x2) {
                    return function(y2) {
                      if (y1 === y2) {
                        var detourY = pickDetourY(nodeObstacles)(x1)(x2)(y1);
                        var midX1 = findGapBeforeBlockH(nodeObstacles)(y1)(x1)(x2);
                        var midX2 = findGapAfterBlockH(nodeObstacles)(y1)(x1)(x2);
                        return [{
                          start: new Tuple(x1, y1),
                          end: new Tuple(midX1, y1),
                          direction: H.value
                        }, {
                          start: new Tuple(midX1, y1),
                          end: new Tuple(midX1, detourY),
                          direction: V.value
                        }, {
                          start: new Tuple(midX1, detourY),
                          end: new Tuple(midX2, detourY),
                          direction: H.value
                        }, {
                          start: new Tuple(midX2, detourY),
                          end: new Tuple(midX2, y2),
                          direction: V.value
                        }, {
                          start: new Tuple(midX2, y2),
                          end: new Tuple(x2, y2),
                          direction: H.value
                        }];
                      }
                      ;
                      if (otherwise) {
                        var midX = pickChannelX(nodeObstacles)(y1)(y2)(x1)(x2);
                        return [{
                          start: new Tuple(x1, y1),
                          end: new Tuple(midX, y1),
                          direction: H.value
                        }, {
                          start: new Tuple(midX, y1),
                          end: new Tuple(midX, y2),
                          direction: V.value
                        }, {
                          start: new Tuple(midX, y2),
                          end: new Tuple(x2, y2),
                          direction: H.value
                        }];
                      }
                      ;
                      throw new Error("Failed pattern match at Markgraf.EdgeRouting.Orthogonal (line 156, column 3 - line 172, column 10): " + [x1.constructor.name, y1.constructor.name, x2.constructor.name, y2.constructor.name]);
                    };
                  };
                };
              };
              var hStraightClear = function(y) {
                return function(x1) {
                  return function(x2) {
                    return !hSegCrossesAny(nodeObstacles)(min5(x1)(x2))(max5(x1)(x2))(y);
                  };
                };
              };
              var hClear = function(y) {
                return function(x1) {
                  return function(x2) {
                    return !hSegCrossesAny(obstacles)(min5(x1)(x2))(max5(x1)(x2))(y);
                  };
                };
              };
              var hThenV = function(x1) {
                return function(y1) {
                  return function(x2) {
                    return function(y2) {
                      if (hClear(y1)(x1)(x2) && vClear(x2)(y1)(y2)) {
                        return [{
                          start: new Tuple(x1, y1),
                          end: new Tuple(x2, y1),
                          direction: H.value
                        }, {
                          start: new Tuple(x2, y1),
                          end: new Tuple(x2, y2),
                          direction: V.value
                        }];
                      }
                      ;
                      if (otherwise) {
                        var midX = pickChannelX(nodeObstacles)(y1)(y2)(x1)(x2);
                        return [{
                          start: new Tuple(x1, y1),
                          end: new Tuple(midX, y1),
                          direction: H.value
                        }, {
                          start: new Tuple(midX, y1),
                          end: new Tuple(midX, y2),
                          direction: V.value
                        }, {
                          start: new Tuple(midX, y2),
                          end: new Tuple(x2, y2),
                          direction: H.value
                        }];
                      }
                      ;
                      throw new Error("Failed pattern match at Markgraf.EdgeRouting.Orthogonal (line 120, column 3 - line 130, column 10): " + [x1.constructor.name, y1.constructor.name, x2.constructor.name, y2.constructor.name]);
                    };
                  };
                };
              };
              var vThenH = function(x1) {
                return function(y1) {
                  return function(x2) {
                    return function(y2) {
                      if (vClear(x1)(y1)(y2) && hClear(y2)(x1)(x2)) {
                        return [{
                          start: new Tuple(x1, y1),
                          end: new Tuple(x1, y2),
                          direction: V.value
                        }, {
                          start: new Tuple(x1, y2),
                          end: new Tuple(x2, y2),
                          direction: H.value
                        }];
                      }
                      ;
                      if (otherwise) {
                        var midY = slotChannelY(x1)(x2)(y1)(y2);
                        return [{
                          start: new Tuple(x1, y1),
                          end: new Tuple(x1, midY),
                          direction: V.value
                        }, {
                          start: new Tuple(x1, midY),
                          end: new Tuple(x2, midY),
                          direction: H.value
                        }, {
                          start: new Tuple(x2, midY),
                          end: new Tuple(x2, y2),
                          direction: V.value
                        }];
                      }
                      ;
                      throw new Error("Failed pattern match at Markgraf.EdgeRouting.Orthogonal (line 106, column 3 - line 116, column 10): " + [x1.constructor.name, y1.constructor.name, x2.constructor.name, y2.constructor.name]);
                    };
                  };
                };
              };
              var route = (function() {
                var v4 = new Tuple(fromSide, toSide);
                if (v4.value0 instanceof South && v4.value1 instanceof North) {
                  if (v2.value0 === v3.value0 && vStraightClear(v2.value0)(v2.value1)(v3.value1)) {
                    return straight(V.value)(v2.value0)(v2.value1)(v3.value0)(v3.value1);
                  }
                  ;
                  if (otherwise) {
                    return vhv(v2.value0)(v2.value1)(v3.value0)(v3.value1);
                  }
                  ;
                }
                ;
                if (v4.value0 instanceof North && v4.value1 instanceof South) {
                  if (v2.value0 === v3.value0 && vStraightClear(v2.value0)(v2.value1)(v3.value1)) {
                    return straight(V.value)(v2.value0)(v2.value1)(v3.value0)(v3.value1);
                  }
                  ;
                  if (otherwise) {
                    return vhv(v2.value0)(v2.value1)(v3.value0)(v3.value1);
                  }
                  ;
                }
                ;
                if (v4.value0 instanceof East && v4.value1 instanceof West) {
                  if (v2.value1 === v3.value1 && hStraightClear(v2.value1)(v2.value0)(v3.value0)) {
                    return straight(H.value)(v2.value0)(v2.value1)(v3.value0)(v3.value1);
                  }
                  ;
                  if (otherwise) {
                    return hvh(v2.value0)(v2.value1)(v3.value0)(v3.value1);
                  }
                  ;
                }
                ;
                if (v4.value0 instanceof West && v4.value1 instanceof East) {
                  if (v2.value1 === v3.value1 && hStraightClear(v2.value1)(v2.value0)(v3.value0)) {
                    return straight(H.value)(v2.value0)(v2.value1)(v3.value0)(v3.value1);
                  }
                  ;
                  if (otherwise) {
                    return hvh(v2.value0)(v2.value1)(v3.value0)(v3.value1);
                  }
                  ;
                }
                ;
                if (v4.value0 instanceof South && v4.value1 instanceof East) {
                  return vThenH(v2.value0)(v2.value1)(v3.value0)(v3.value1);
                }
                ;
                if (v4.value0 instanceof South && v4.value1 instanceof West) {
                  return vThenH(v2.value0)(v2.value1)(v3.value0)(v3.value1);
                }
                ;
                if (v4.value0 instanceof North && v4.value1 instanceof East) {
                  return vThenH(v2.value0)(v2.value1)(v3.value0)(v3.value1);
                }
                ;
                if (v4.value0 instanceof North && v4.value1 instanceof West) {
                  return vThenH(v2.value0)(v2.value1)(v3.value0)(v3.value1);
                }
                ;
                if (v4.value0 instanceof East && v4.value1 instanceof North) {
                  return hThenV(v2.value0)(v2.value1)(v3.value0)(v3.value1);
                }
                ;
                if (v4.value0 instanceof East && v4.value1 instanceof South) {
                  return hThenV(v2.value0)(v2.value1)(v3.value0)(v3.value1);
                }
                ;
                if (v4.value0 instanceof West && v4.value1 instanceof North) {
                  return hThenV(v2.value0)(v2.value1)(v3.value0)(v3.value1);
                }
                ;
                if (v4.value0 instanceof West && v4.value1 instanceof South) {
                  return hThenV(v2.value0)(v2.value1)(v3.value0)(v3.value1);
                }
                ;
                return vhv(v2.value0)(v2.value1)(v3.value0)(v3.value1);
              })();
              var exitDir = sideDir(fromSide);
              var exitSeg = {
                start: new Tuple(v.value0, v.value1),
                end: new Tuple(v2.value0, v2.value1),
                direction: exitDir
              };
              var entryDir = sideDir(toSide);
              var entrySeg = {
                start: new Tuple(v3.value0, v3.value1),
                end: new Tuple(v1.value0, v1.value1),
                direction: entryDir
              };
              var fullRoute = (function() {
                var $217 = v2.value0 === v3.value0 && v2.value1 === v3.value1;
                if ($217) {
                  return [{
                    start: new Tuple(v.value0, v.value1),
                    end: new Tuple(v1.value0, v1.value1),
                    direction: exitDir
                  }];
                }
                ;
                return mergeSegments(exitSeg)(route)(entrySeg);
              })();
              return fullRoute;
            };
          };
        };
      };
    };
  };
};
var buildObstacleMap = /* @__PURE__ */ (function() {
  var toRect = function(p) {
    var x = gridX(p.position) * sf;
    var y = gridY(p.position) * sf;
    var w = sizeW(p.size) * sf;
    var h = sizeH(p.size) * sf;
    return {
      x: x - 2,
      y: y - 2,
      w: w + 4,
      h: h + 4
    };
  };
  return map(functorArray)(toRect);
})();

// ../markgraf/output/Markgraf.EdgeRouting/index.js
var bind4 = /* @__PURE__ */ bind(bindMaybe);
var lookup8 = /* @__PURE__ */ lookup(ordEdgeId);
var foldl8 = /* @__PURE__ */ foldl(foldableArray);
var insert8 = /* @__PURE__ */ insert(ordNodeId);
var lookup13 = /* @__PURE__ */ lookup(ordNodeId);
var insertWith3 = /* @__PURE__ */ insertWith(ordNodeId);
var append8 = /* @__PURE__ */ append(semigroupArray);
var mapFlipped7 = /* @__PURE__ */ mapFlipped(functorArray);
var toUnfoldable7 = /* @__PURE__ */ toUnfoldable(unfoldableArray);
var compare6 = /* @__PURE__ */ compare(ordInt);
var compare14 = /* @__PURE__ */ compare(ordNumber);
var eq4 = /* @__PURE__ */ eq(eqNodeId);
var map10 = /* @__PURE__ */ map(functorMaybe);
var notEq5 = /* @__PURE__ */ notEq(/* @__PURE__ */ eqMaybe(/* @__PURE__ */ eqRec()(/* @__PURE__ */ eqRowCons(/* @__PURE__ */ eqRowCons(/* @__PURE__ */ eqRowCons(/* @__PURE__ */ eqRowCons(eqRowNil)()({
  reflectSymbol: function() {
    return "y";
  }
})(eqNumber))()({
  reflectSymbol: function() {
    return "x";
  }
})(eqNumber))()({
  reflectSymbol: function() {
    return "w";
  }
})(eqNumber))()({
  reflectSymbol: function() {
    return "h";
  }
})(eqNumber))));
var slotY = function(info) {
  return function(slotIdx) {
    var scaledSlotGap = 2.5 * toNumber(scaleFactor);
    var scaledNodePad = 1 * toNumber(scaleFactor);
    return info.gapTop + scaledNodePad + toNumber(slotIdx) * scaledSlotGap;
  };
};
var splitInfoFor = function(slotMap) {
  return function(a) {
    return bind4(lookup8(a.edge.id)(slotMap))(function(info) {
      return bind4(info.partner)(function(partner) {
        return new Just({
          slot1Y: slotY(info)(info.slot),
          splitX: partner.splitX,
          slot2Y: slotY(info)(partner.slot)
        });
      });
    });
  };
};
var scaleFactor2 = scaleFactor;
var routeSelfLoops = function(selfLoops) {
  return function(placements) {
    var posMap = foldl8(function(m) {
      return function(p) {
        return insert8(p.node)(p)(m);
      };
    })(empty2)(placements);
    var gridPos = function(v) {
      return new Tuple(v.value0, v.value1);
    };
    var selfLoopPath = function(placement) {
      return function(idx) {
        return function(total) {
          return function(edge) {
            var sf3 = toNumber(scaleFactor);
            var x = gridX(placement.position) * sf3;
            var y = gridY(placement.position) * sf3;
            var w = sizeW(placement.size) * sf3;
            var h = sizeH(placement.size) * sf3;
            var bumpOut = sf3 * 2.5 * toNumber(idx + 1 | 0);
            var denom = toNumber((2 * total | 0) + 1 | 0);
            var exitY = y + h * toNumber(total - idx | 0) / denom;
            var entryY = y + h * toNumber((total + 1 | 0) + idx | 0) / denom;
            var exitPort = new Tuple(x, exitY);
            var entryPort = new Tuple(x, entryY);
            var outerX = x - bumpOut;
            var segs = [{
              start: gridPos(exitPort),
              end: gridPos(new Tuple(outerX, exitY)),
              direction: H.value
            }, {
              start: gridPos(new Tuple(outerX, exitY)),
              end: gridPos(new Tuple(outerX, entryY)),
              direction: V.value
            }, {
              start: gridPos(new Tuple(outerX, entryY)),
              end: gridPos(entryPort),
              direction: H.value
            }];
            return {
              edge: edge.id,
              segments: segs,
              bends: zipWith(function(a) {
                return function(v) {
                  return a.end;
                };
              })(segs)(drop(1)(segs)),
              bendType: [],
              jumps: [],
              reversed: false
            };
          };
        };
      };
    };
    var perNode = function(v) {
      return function(entry) {
        var v1 = lookup13(entry.node)(posMap);
        if (v1 instanceof Nothing) {
          return [];
        }
        ;
        if (v1 instanceof Just) {
          return mapWithIndex2(function(i) {
            return function(e) {
              return selfLoopPath(v1.value0)(i)(length(entry.edges))(e);
            };
          })(entry.edges);
        }
        ;
        throw new Error("Failed pattern match at Markgraf.EdgeRouting (line 72, column 21 - line 74, column 109): " + [v1.constructor.name]);
      };
    };
    var byNode2 = foldl8(function(m) {
      return function(e) {
        return insertWith3(append8)(e.from.node)([e])(m);
      };
    })(empty2)(selfLoops);
    var grouped = mapFlipped7(toUnfoldable7(byNode2))(function(v) {
      return {
        node: v.value0,
        edges: v.value1
      };
    });
    return concat(mapWithIndex2(perNode)(grouped));
  };
};
var orderForRouting = function(assignments) {
  return function(placements) {
    var posMap = foldl8(function(m) {
      return function(p) {
        return insert8(p.node)(p)(m);
      };
    })(empty2)(placements);
    var xOf = function(nid) {
      var v = lookup13(nid)(posMap);
      if (v instanceof Nothing) {
        return 0;
      }
      ;
      if (v instanceof Just) {
        return gridX(v.value0.position);
      }
      ;
      throw new Error("Failed pattern match at Markgraf.EdgeRouting (line 196, column 13 - line 198, column 31): " + [v.constructor.name]);
    };
    var layerOf2 = function(nid) {
      var v = lookup13(nid)(posMap);
      if (v instanceof Nothing) {
        return 0;
      }
      ;
      if (v instanceof Just) {
        return v.value0.layer;
      }
      ;
      throw new Error("Failed pattern match at Markgraf.EdgeRouting (line 191, column 17 - line 193, column 22): " + [v.constructor.name]);
    };
    var comparator = function(a) {
      return function(b) {
        var la = layerOf2(a.edge.from.node);
        var lb = layerOf2(b.edge.from.node);
        var v = compare6(la)(lb);
        if (v instanceof EQ) {
          var xa = xOf(a.edge.from.node);
          var xb = xOf(b.edge.from.node);
          var v1 = compare14(xa)(xb);
          if (v1 instanceof EQ) {
            return compare14(xOf(a.edge.to.node))(xOf(b.edge.to.node));
          }
          ;
          return v1;
        }
        ;
        return v;
      };
    };
    return sortBy(comparator)(assignments);
  };
};
var nodeToRect = function(p) {
  var sf3 = toNumber(scaleFactor);
  var x = gridX(p.position) * sf3;
  var y = gridY(p.position) * sf3;
  var w = sizeW(p.size) * sf3;
  var h = sizeH(p.size) * sf3;
  return {
    x: x - 2,
    y: y - 2,
    w: w + 4,
    h: h + 4
  };
};
var isSelfLoop = function(e) {
  return eq4(e.from.node)(e.to.node);
};
var findBends = function(segments) {
  return zipWith(function(a) {
    return function(_b) {
      return a.end;
    };
  })(segments)(drop(1)(segments));
};
var routeOne = function(slotY$prime) {
  return function(nodeObstacles) {
    return function(obstacles) {
      return function(assignment) {
        var raw = findRouteSlot(slotY$prime)(nodeObstacles)(obstacles)(assignment.fromSide)(assignment.fromPos)(assignment.toSide)(assignment.toPos);
        var segments = simplifySegments(obstacles)(raw);
        var bends = findBends(segments);
        return {
          edge: assignment.edge.id,
          segments,
          bends,
          bendType: [],
          jumps: [],
          reversed: false
        };
      };
    };
  };
};
var routeSplit = function(split3) {
  return function(_nodeObstacles) {
    return function(_obstacles) {
      return function(assignment) {
        var segs = [{
          start: new Tuple(assignment.fromPos.value0, assignment.fromPos.value1),
          end: new Tuple(assignment.fromPos.value0, split3.slot1Y),
          direction: V.value
        }, {
          start: new Tuple(assignment.fromPos.value0, split3.slot1Y),
          end: new Tuple(split3.splitX, split3.slot1Y),
          direction: H.value
        }, {
          start: new Tuple(split3.splitX, split3.slot1Y),
          end: new Tuple(split3.splitX, split3.slot2Y),
          direction: V.value
        }, {
          start: new Tuple(split3.splitX, split3.slot2Y),
          end: new Tuple(assignment.toPos.value0, split3.slot2Y),
          direction: H.value
        }, {
          start: new Tuple(assignment.toPos.value0, split3.slot2Y),
          end: new Tuple(assignment.toPos.value0, assignment.toPos.value1),
          direction: V.value
        }];
        return {
          edge: assignment.edge.id,
          segments: segs,
          bends: findBends(segs),
          bendType: [],
          jumps: [],
          reversed: false
        };
      };
    };
  };
};
var filteredFor = function(a) {
  return function(obstacles) {
    return function(posMap) {
      var srcRect = map10(nodeToRect)(lookup13(a.edge.from.node)(posMap));
      var dstRect = map10(nodeToRect)(lookup13(a.edge.to.node)(posMap));
      return filter(function(r) {
        return notEq5(new Just(r))(srcRect) && notEq5(new Just(r))(dstRect);
      })(obstacles);
    };
  };
};
var channelYFor = function(slotMap) {
  return function(a) {
    return bind4(lookup8(a.edge.id)(slotMap))(function(info) {
      return new Just(slotY(info)(info.slot));
    });
  };
};
var routeAll = function(edges) {
  return function(placements) {
    return function(portMap) {
      return function(chains) {
        return function(portOffsets) {
          var selfLoops = filter(isSelfLoop)(edges);
          var selfLoopPaths = routeSelfLoops(selfLoops)(placements);
          var regularEdges = filter(function($88) {
            return !isSelfLoop($88);
          })(edges);
          var posMap = foldl8(function(m) {
            return function(p) {
              return insert8(p.node)(p)(m);
            };
          })(empty2)(placements);
          var nodeObstacles = buildObstacleMap(placements);
          var assignments = assignPorts(regularEdges)(placements)(portMap)(chains)(portOffsets);
          var ordered = orderForRouting(assignments)(placements);
          var slotMap = assignSlots(assignments)(placements);
          var routeNext = function(acc) {
            return function(a) {
              var filteredNodeObs = filteredFor(a)(nodeObstacles)(posMap);
              var allObstacles = append8(filteredNodeObs)(acc.edgeObstacles);
              var path = (function() {
                var v = splitInfoFor(slotMap)(a);
                if (v instanceof Just) {
                  return routeSplit(v.value0)(filteredNodeObs)(allObstacles)(a);
                }
                ;
                if (v instanceof Nothing) {
                  return routeOne(channelYFor(slotMap)(a))(filteredNodeObs)(allObstacles)(a);
                }
                ;
                throw new Error("Failed pattern match at Markgraf.EdgeRouting (line 43, column 14 - line 45, column 83): " + [v.constructor.name]);
              })();
              var newEdgeObs = segmentsToObstacles(path.segments);
              return {
                results: append8(acc.results)([path]),
                edgeObstacles: append8(acc.edgeObstacles)(newEdgeObs)
              };
            };
          };
          return append8(selfLoopPaths)((function(v) {
            return v.results;
          })(foldl8(routeNext)({
            results: [],
            edgeObstacles: []
          })(ordered)));
        };
      };
    };
  };
};

// ../markgraf/output/Markgraf.Aesthetics/index.js
var foldl9 = /* @__PURE__ */ foldl(foldableArray);
var max6 = /* @__PURE__ */ max(ordNumber);
var nodeOverlapCount = function(nodes) {
  var len = length(nodes);
  var countOverlaps = function($copy_i) {
    return function($copy_acc) {
      var $tco_var_i = $copy_i;
      var $tco_done = false;
      var $tco_result;
      function $tco_loop(i, acc) {
        if (i >= len) {
          $tco_done = true;
          return acc;
        }
        ;
        if (otherwise) {
          var countInner = function($copy_j) {
            return function($copy_acc$prime) {
              var $tco_var_j = $copy_j;
              var $tco_done1 = false;
              var $tco_result2;
              function $tco_loop2(j, acc$prime) {
                if (j >= len) {
                  $tco_done1 = true;
                  return acc$prime;
                }
                ;
                if (otherwise) {
                  var v = index(nodes)(i);
                  if (v instanceof Nothing) {
                    $tco_done1 = true;
                    return acc$prime;
                  }
                  ;
                  if (v instanceof Just) {
                    var v1 = index(nodes)(j);
                    if (v1 instanceof Nothing) {
                      $tco_var_j = j + 1 | 0;
                      $copy_acc$prime = acc$prime;
                      return;
                    }
                    ;
                    if (v1 instanceof Just) {
                      var rectB = {
                        pos: v1.value0.position,
                        size: v1.value0.size
                      };
                      var rectA = {
                        pos: v.value0.position,
                        size: v.value0.size
                      };
                      $tco_var_j = j + 1 | 0;
                      $copy_acc$prime = (function() {
                        var $13 = overlaps(rectA)(rectB);
                        if ($13) {
                          return acc$prime + 1 | 0;
                        }
                        ;
                        return acc$prime;
                      })();
                      return;
                    }
                    ;
                    throw new Error("Failed pattern match at Markgraf.Aesthetics (line 40, column 25 - line 47, column 89): " + [v1.constructor.name]);
                  }
                  ;
                  throw new Error("Failed pattern match at Markgraf.Aesthetics (line 38, column 25 - line 47, column 89): " + [v.constructor.name]);
                }
                ;
                throw new Error("Failed pattern match at Markgraf.Aesthetics (line 35, column 9 - line 35, column 40): " + [j.constructor.name, acc$prime.constructor.name]);
              }
              ;
              while (!$tco_done1) {
                $tco_result2 = $tco_loop2($tco_var_j, $copy_acc$prime);
              }
              ;
              return $tco_result2;
            };
          };
          $tco_var_i = i + 1 | 0;
          $copy_acc = countInner(i + 1 | 0)(acc);
          return;
        }
        ;
        throw new Error("Failed pattern match at Markgraf.Aesthetics (line 30, column 3 - line 30, column 37): " + [i.constructor.name, acc.constructor.name]);
      }
      ;
      while (!$tco_done) {
        $tco_result = $tco_loop($tco_var_i, $copy_acc);
      }
      ;
      return $tco_result;
    };
  };
  return countOverlaps(0)(0);
};
var edgeLength = function(path) {
  return foldl9(function(acc) {
    return function(seg) {
      return acc + manhattan(seg.start)(seg.end);
    };
  })(0)(path.segments);
};
var bendCount = function(edges) {
  return foldl9(function(acc) {
    return function(e) {
      return acc + length(e.bends) | 0;
    };
  })(0)(edges);
};
var allMetrics = function(nodes) {
  return function(edges) {
    return function(violations) {
      return {
        crossingCount: foldl9(function(acc) {
          return function(e) {
            return acc + length(e.jumps) | 0;
          };
        })(0)(edges),
        bendCount: bendCount(edges),
        totalEdgeLength: foldl9(function(acc) {
          return function(e) {
            return acc + edgeLength(e);
          };
        })(0)(edges),
        maxEdgeLength: foldl9(function(acc) {
          return function(e) {
            return max6(acc)(edgeLength(e));
          };
        })(0)(edges),
        nodeOverlapCount: nodeOverlapCount(nodes),
        constraintViolations: violations,
        jumpCount: foldl9(function(acc) {
          return function(e) {
            return acc + length(e.jumps) | 0;
          };
        })(0)(edges)
      };
    };
  };
};

// ../markgraf/output/Markgraf.Compaction.OneD/index.js
var lookup9 = /* @__PURE__ */ lookup(ordInt);
var insert9 = /* @__PURE__ */ insert(ordInt);
var foldl10 = /* @__PURE__ */ foldl(foldableArray);
var insertWith4 = /* @__PURE__ */ insertWith(ordInt);
var append9 = /* @__PURE__ */ append(semigroupArray);
var map11 = /* @__PURE__ */ map(functorMap);
var elem4 = /* @__PURE__ */ elem2(eqInt);
var eqMaybe2 = /* @__PURE__ */ eqMaybe(eqInt);
var notEq1 = /* @__PURE__ */ notEq(eqMaybe2);
var eq5 = /* @__PURE__ */ eq(eqMaybe2);
var LEFT = /* @__PURE__ */ (function() {
  function LEFT2() {
  }
  ;
  LEFT2.value = new LEFT2();
  return LEFT2;
})();
var RIGHT = /* @__PURE__ */ (function() {
  function RIGHT2() {
  }
  ;
  RIGHT2.value = new RIGHT2();
  return RIGHT2;
})();
var UP = /* @__PURE__ */ (function() {
  function UP2() {
  }
  ;
  UP2.value = new UP2();
  return UP2;
})();
var DOWN = /* @__PURE__ */ (function() {
  function DOWN2() {
  }
  ;
  DOWN2.value = new DOWN2();
  return DOWN2;
})();
var UNDEFINED = /* @__PURE__ */ (function() {
  function UNDEFINED2() {
  }
  ;
  UNDEFINED2.value = new UNDEFINED2();
  return UNDEFINED2;
})();
var eqDirection2 = {
  eq: function(x) {
    return function(y) {
      if (x instanceof LEFT && y instanceof LEFT) {
        return true;
      }
      ;
      if (x instanceof RIGHT && y instanceof RIGHT) {
        return true;
      }
      ;
      if (x instanceof UP && y instanceof UP) {
        return true;
      }
      ;
      if (x instanceof DOWN && y instanceof DOWN) {
        return true;
      }
      ;
      if (x instanceof UNDEFINED && y instanceof UNDEFINED) {
        return true;
      }
      ;
      return false;
    };
  }
};
var eq14 = /* @__PURE__ */ eq(eqDirection2);
var ordDirection = {
  compare: function(x) {
    return function(y) {
      if (x instanceof LEFT && y instanceof LEFT) {
        return EQ.value;
      }
      ;
      if (x instanceof LEFT) {
        return LT.value;
      }
      ;
      if (y instanceof LEFT) {
        return GT.value;
      }
      ;
      if (x instanceof RIGHT && y instanceof RIGHT) {
        return EQ.value;
      }
      ;
      if (x instanceof RIGHT) {
        return LT.value;
      }
      ;
      if (y instanceof RIGHT) {
        return GT.value;
      }
      ;
      if (x instanceof UP && y instanceof UP) {
        return EQ.value;
      }
      ;
      if (x instanceof UP) {
        return LT.value;
      }
      ;
      if (y instanceof UP) {
        return GT.value;
      }
      ;
      if (x instanceof DOWN && y instanceof DOWN) {
        return EQ.value;
      }
      ;
      if (x instanceof DOWN) {
        return LT.value;
      }
      ;
      if (y instanceof DOWN) {
        return GT.value;
      }
      ;
      if (x instanceof UNDEFINED && y instanceof UNDEFINED) {
        return EQ.value;
      }
      ;
      throw new Error("Failed pattern match at Markgraf.Compaction.OneD (line 0, column 0 - line 0, column 0): " + [x.constructor.name, y.constructor.name]);
    };
  },
  Eq0: function() {
    return eqDirection2;
  }
};
var member3 = /* @__PURE__ */ member2(ordDirection);
var zeroVec = {
  x: 0,
  y: 0
};
var updateCNode = function(nid) {
  return function(f) {
    return function(g) {
      var v = lookup9(nid)(g.cNodes);
      if (v instanceof Nothing) {
        return g;
      }
      ;
      if (v instanceof Just) {
        return {
          cNodeOrder: g.cNodeOrder,
          cGroups: g.cGroups,
          cGroupOrder: g.cGroupOrder,
          supportedDirections: g.supportedDirections,
          predefinedHorizontalConstraints: g.predefinedHorizontalConstraints,
          predefinedVerticalConstraints: g.predefinedVerticalConstraints,
          nextCNodeId: g.nextCNodeId,
          nextCGroupId: g.nextCGroupId,
          cNodes: insert9(nid)(f(v.value0))(g.cNodes)
        };
      }
      ;
      throw new Error("Failed pattern match at Markgraf.Compaction.OneD (line 378, column 23 - line 380, column 55): " + [v.constructor.name]);
    };
  };
};
var updateCGroup = function(gid) {
  return function(f) {
    return function(g) {
      var v = lookup9(gid)(g.cGroups);
      if (v instanceof Nothing) {
        return g;
      }
      ;
      if (v instanceof Just) {
        return {
          cNodes: g.cNodes,
          cNodeOrder: g.cNodeOrder,
          cGroupOrder: g.cGroupOrder,
          supportedDirections: g.supportedDirections,
          predefinedHorizontalConstraints: g.predefinedHorizontalConstraints,
          predefinedVerticalConstraints: g.predefinedVerticalConstraints,
          nextCNodeId: g.nextCNodeId,
          nextCGroupId: g.nextCGroupId,
          cGroups: insert9(gid)(f(v.value0))(g.cGroups)
        };
      }
      ;
      throw new Error("Failed pattern match at Markgraf.Compaction.OneD (line 390, column 24 - line 392, column 61): " + [v.constructor.name]);
    };
  };
};
var supports = function(d) {
  return function(g) {
    return member3(d)(g.supportedDirections);
  };
};
var snapshotHitboxes = function(g) {
  var snap = function(acc) {
    return function(nid) {
      return updateCNode(nid)(function(n) {
        return {
          id: n.id,
          origin: n.origin,
          kind: n.kind,
          cGroup: n.cGroup,
          cGroupOffset: n.cGroupOffset,
          hitbox: n.hitbox,
          constraints: n.constraints,
          startPos: n.startPos,
          ignoreSpacing: n.ignoreSpacing,
          hitboxPreCompaction: n.hitbox
        };
      })(acc);
    };
  };
  return foldl10(snap)(g)(g.cNodeOrder);
};
var setSpacingsHandler = function(h) {
  return function(s) {
    return {
      cGraph: s.cGraph,
      direction: s.direction,
      compactionAlgorithm: s.compactionAlgorithm,
      constraintAlgorithm: s.constraintAlgorithm,
      lockFun: s.lockFun,
      finished: s.finished,
      spacingsHandler: h
    };
  };
};
var setConstraintAlgorithm = function(a) {
  return function(s) {
    return {
      cGraph: s.cGraph,
      direction: s.direction,
      compactionAlgorithm: s.compactionAlgorithm,
      spacingsHandler: s.spacingsHandler,
      lockFun: s.lockFun,
      finished: s.finished,
      constraintAlgorithm: new Just(a)
    };
  };
};
var setCompactionAlgorithm = function(a) {
  return function(s) {
    return {
      cGraph: s.cGraph,
      direction: s.direction,
      constraintAlgorithm: s.constraintAlgorithm,
      spacingsHandler: s.spacingsHandler,
      lockFun: s.lockFun,
      finished: s.finished,
      compactionAlgorithm: new Just(a)
    };
  };
};
var runConstraintAlgorithm = function(v) {
  return v;
};
var runCompactionAlgorithm = function(v) {
  return v;
};
var reverseConstraintsGraph = function(g) {
  var collect = function(m) {
    return function(nid) {
      var v = lookup9(nid)(g.cNodes);
      if (v instanceof Nothing) {
        return m;
      }
      ;
      if (v instanceof Just) {
        return foldl10(function(acc) {
          return function(inc) {
            return insertWith4(append9)(inc)([nid])(acc);
          };
        })(m)(v.value0.constraints);
      }
      ;
      throw new Error("Failed pattern match at Markgraf.Compaction.OneD (line 748, column 19 - line 753, column 20): " + [v.constructor.name]);
    };
  };
  var reversed = foldl10(collect)(empty2)(g.cNodeOrder);
  return foldl10(function(acc) {
    return function(nid) {
      return updateCNode(nid)(function(v) {
        return {
          id: v.id,
          origin: v.origin,
          kind: v.kind,
          cGroup: v.cGroup,
          cGroupOffset: v.cGroupOffset,
          hitbox: v.hitbox,
          hitboxPreCompaction: v.hitboxPreCompaction,
          startPos: v.startPos,
          ignoreSpacing: v.ignoreSpacing,
          constraints: fromMaybe([])(lookup9(nid)(reversed))
        };
      })(acc);
    };
  })(g)(g.cNodeOrder);
};
var quadOr = function(a) {
  return function(b) {
    return {
      left: a.left || b.left,
      right: a.right || b.right,
      up: a.up || b.up,
      down: a.down || b.down
    };
  };
};
var setCNodeIgnoreSpacing = function(nid) {
  return function(q) {
    return updateCNode(nid)(function(n) {
      return {
        id: n.id,
        origin: n.origin,
        kind: n.kind,
        cGroup: n.cGroup,
        cGroupOffset: n.cGroupOffset,
        hitbox: n.hitbox,
        hitboxPreCompaction: n.hitboxPreCompaction,
        constraints: n.constraints,
        startPos: n.startPos,
        ignoreSpacing: quadOr(n.ignoreSpacing)(q)
      };
    });
  };
};
var newCGraph = function(dirs) {
  return {
    cNodes: empty2,
    cNodeOrder: [],
    cGroups: empty2,
    cGroupOrder: [],
    supportedDirections: dirs,
    predefinedHorizontalConstraints: [],
    predefinedVerticalConstraints: [],
    nextCNodeId: 0,
    nextCGroupId: 0
  };
};
var negInfinity = /* @__PURE__ */ (function() {
  return -1e308;
})();
var resetCompactionFields = function(g0) {
  var resetNode = function(acc) {
    return function(nid) {
      return updateCNode(nid)(function(v) {
        return {
          id: v.id,
          origin: v.origin,
          kind: v.kind,
          cGroup: v.cGroup,
          cGroupOffset: v.cGroupOffset,
          hitbox: v.hitbox,
          hitboxPreCompaction: v.hitboxPreCompaction,
          constraints: v.constraints,
          ignoreSpacing: v.ignoreSpacing,
          startPos: negInfinity
        };
      })(acc);
    };
  };
  var resetGroup = function(acc) {
    return function(gid) {
      return updateCGroup(gid)(function(grp) {
        return {
          id: grp.id,
          master: grp.master,
          cNodes: grp.cNodes,
          startPos: grp.startPos,
          incomingConstraints: grp.incomingConstraints,
          outDegreeReal: grp.outDegreeReal,
          reference: grp.reference,
          delta: grp.delta,
          deltaNormalized: grp.deltaNormalized,
          outDegree: grp.outDegreeReal
        };
      })(acc);
    };
  };
  var g1 = foldl10(resetGroup)(g0)(g0.cGroupOrder);
  return foldl10(resetNode)(g1)(g1.cNodeOrder);
};
var mapGraph = function(f) {
  return function(s) {
    return {
      direction: s.direction,
      compactionAlgorithm: s.compactionAlgorithm,
      constraintAlgorithm: s.constraintAlgorithm,
      spacingsHandler: s.spacingsHandler,
      lockFun: s.lockFun,
      finished: s.finished,
      cGraph: f(s.cGraph)
    };
  };
};
var mapAllNodes = function(f) {
  return function(g) {
    return {
      cNodeOrder: g.cNodeOrder,
      cGroups: g.cGroups,
      cGroupOrder: g.cGroupOrder,
      supportedDirections: g.supportedDirections,
      predefinedHorizontalConstraints: g.predefinedHorizontalConstraints,
      predefinedVerticalConstraints: g.predefinedVerticalConstraints,
      nextCNodeId: g.nextCNodeId,
      nextCGroupId: g.nextCGroupId,
      cNodes: map11(f)(g.cNodes)
    };
  };
};
var lookupCNode = function(nid) {
  return function(g) {
    return lookup9(nid)(g.cNodes);
  };
};
var isHorizontalDir = function(v) {
  if (v instanceof LEFT) {
    return true;
  }
  ;
  if (v instanceof RIGHT) {
    return true;
  }
  ;
  return false;
};
var fuzzyTolerance = 1e-4;
var fuzzyLt = function(a) {
  return function(b) {
    return b - a > fuzzyTolerance;
  };
};
var fuzzyEq = function(a) {
  return function(b) {
    return abs2(a - b) <= fuzzyTolerance;
  };
};
var emptyQuadruplet = {
  left: false,
  right: false,
  up: false,
  down: false
};
var defaultSpacingsHandler = {
  horizontalSpacing: function(v) {
    return function(v1) {
      return 0;
    };
  },
  verticalSpacing: function(v) {
    return function(v1) {
      return 0;
    };
  }
};
var clearConstraints = function(g) {
  return mapAllNodes(function(v) {
    return {
      id: v.id,
      origin: v.origin,
      kind: v.kind,
      cGroup: v.cGroup,
      cGroupOffset: v.cGroupOffset,
      hitbox: v.hitbox,
      hitboxPreCompaction: v.hitboxPreCompaction,
      startPos: v.startPos,
      ignoreSpacing: v.ignoreSpacing,
      constraints: []
    };
  })(g);
};
var calculateGroupOffsetsGraph = function(g) {
  var pickLeftMostReference = function(nodes) {
    return function(acc) {
      var step2 = function(bestId) {
        return function(nid) {
          var v = lookup9(nid)(acc.cNodes);
          if (v instanceof Nothing) {
            return bestId;
          }
          ;
          if (v instanceof Just) {
            if (bestId instanceof Nothing) {
              return new Just(nid);
            }
            ;
            if (bestId instanceof Just) {
              var v1 = lookup9(bestId.value0)(acc.cNodes);
              if (v1 instanceof Nothing) {
                return new Just(nid);
              }
              ;
              if (v1 instanceof Just) {
                var $136 = v.value0.hitbox.x < v1.value0.hitbox.x;
                if ($136) {
                  return new Just(nid);
                }
                ;
                return new Just(bestId.value0);
              }
              ;
              throw new Error("Failed pattern match at Markgraf.Compaction.OneD (line 596, column 23 - line 598, column 77): " + [v1.constructor.name]);
            }
            ;
            throw new Error("Failed pattern match at Markgraf.Compaction.OneD (line 594, column 19 - line 598, column 77): " + [bestId.constructor.name]);
          }
          ;
          throw new Error("Failed pattern match at Markgraf.Compaction.OneD (line 592, column 25 - line 598, column 77): " + [v.constructor.name]);
        };
      };
      return foldl10(step2)(Nothing.value)(nodes);
    };
  };
  var offsetOne = function(refNode) {
    return function(acc) {
      return function(nid) {
        return updateCNode(nid)(function(n) {
          return {
            id: n.id,
            origin: n.origin,
            kind: n.kind,
            cGroup: n.cGroup,
            hitbox: n.hitbox,
            hitboxPreCompaction: n.hitboxPreCompaction,
            constraints: n.constraints,
            startPos: n.startPos,
            ignoreSpacing: n.ignoreSpacing,
            cGroupOffset: {
              x: n.hitbox.x - refNode.hitbox.x,
              y: n.hitbox.y - refNode.hitbox.y
            }
          };
        })(acc);
      };
    };
  };
  var computeOne = function(acc) {
    return function(gid) {
      var v = lookup9(gid)(acc.cGroups);
      if (v instanceof Nothing) {
        return acc;
      }
      ;
      if (v instanceof Just) {
        var refId = pickLeftMostReference(v.value0.cNodes)(acc);
        var acc1 = updateCGroup(gid)(function(v12) {
          return {
            id: v12.id,
            master: v12.master,
            cNodes: v12.cNodes,
            startPos: v12.startPos,
            incomingConstraints: v12.incomingConstraints,
            outDegree: v12.outDegree,
            outDegreeReal: v12.outDegreeReal,
            delta: v12.delta,
            deltaNormalized: v12.deltaNormalized,
            reference: refId
          };
        })(acc);
        if (refId instanceof Nothing) {
          return acc1;
        }
        ;
        if (refId instanceof Just) {
          var v1 = lookup9(refId.value0)(acc1.cNodes);
          if (v1 instanceof Nothing) {
            return acc1;
          }
          ;
          if (v1 instanceof Just) {
            return foldl10(offsetOne(v1.value0))(acc1)(v.value0.cNodes);
          }
          ;
          throw new Error("Failed pattern match at Markgraf.Compaction.OneD (line 586, column 21 - line 588, column 68): " + [v1.constructor.name]);
        }
        ;
        throw new Error("Failed pattern match at Markgraf.Compaction.OneD (line 584, column 7 - line 588, column 68): " + [refId.constructor.name]);
      }
      ;
      throw new Error("Failed pattern match at Markgraf.Compaction.OneD (line 579, column 24 - line 588, column 68): " + [v.constructor.name]);
    };
  };
  return foldl10(computeOne)(g)(g.cGroupOrder);
};
var mirrorHitboxes = function(g) {
  var mirrorOne = function(n) {
    return {
      cGroup: n.cGroup,
      cGroupOffset: n.cGroupOffset,
      constraints: n.constraints,
      hitboxPreCompaction: n.hitboxPreCompaction,
      id: n.id,
      ignoreSpacing: n.ignoreSpacing,
      kind: n.kind,
      origin: n.origin,
      startPos: n.startPos,
      hitbox: {
        width: n.hitbox.width,
        height: n.hitbox.height,
        y: n.hitbox.y,
        x: -n.hitbox.x - n.hitbox.width
      }
    };
  };
  return calculateGroupOffsetsGraph(mapAllNodes(mirrorOne)(g));
};
var transposeHitboxes = function(g) {
  var transposeOne = function(n) {
    return {
      cGroup: n.cGroup,
      constraints: n.constraints,
      hitboxPreCompaction: n.hitboxPreCompaction,
      id: n.id,
      ignoreSpacing: n.ignoreSpacing,
      kind: n.kind,
      origin: n.origin,
      startPos: n.startPos,
      hitbox: {
        x: n.hitbox.y,
        y: n.hitbox.x,
        width: n.hitbox.height,
        height: n.hitbox.width
      },
      cGroupOffset: {
        x: n.cGroupOffset.y,
        y: n.cGroupOffset.x
      }
    };
  };
  return calculateGroupOffsetsGraph(mapAllNodes(transposeOne)(g));
};
var calculateConstraintsForCGroups = function(g0) {
  var rollEdge = function(gid) {
    return function(acc) {
      return function(incId) {
        var v = lookup9(incId)(acc.cNodes);
        if (v instanceof Nothing) {
          return acc;
        }
        ;
        if (v instanceof Just) {
          if (v.value0.cGroup instanceof Just && v.value0.cGroup.value0 !== gid) {
            var acc1 = updateCGroup(gid)(function(grp) {
              var $148 = elem4(incId)(grp.incomingConstraints);
              if ($148) {
                return grp;
              }
              ;
              return {
                id: grp.id,
                master: grp.master,
                cNodes: grp.cNodes,
                startPos: grp.startPos,
                outDegree: grp.outDegree,
                outDegreeReal: grp.outDegreeReal,
                reference: grp.reference,
                delta: grp.delta,
                deltaNormalized: grp.deltaNormalized,
                incomingConstraints: append9(grp.incomingConstraints)([incId])
              };
            })(acc);
            return updateCGroup(v.value0.cGroup.value0)(function(grp) {
              return {
                id: grp.id,
                master: grp.master,
                cNodes: grp.cNodes,
                startPos: grp.startPos,
                incomingConstraints: grp.incomingConstraints,
                reference: grp.reference,
                delta: grp.delta,
                deltaNormalized: grp.deltaNormalized,
                outDegree: grp.outDegree + 1 | 0,
                outDegreeReal: grp.outDegreeReal + 1 | 0
              };
            })(acc1);
          }
          ;
          return acc;
        }
        ;
        throw new Error("Failed pattern match at Markgraf.Compaction.OneD (line 712, column 28 - line 730, column 15): " + [v.constructor.name]);
      };
    };
  };
  var rollUp = function(acc) {
    return function(nid) {
      var v = lookup9(nid)(acc.cNodes);
      if (v instanceof Nothing) {
        return acc;
      }
      ;
      if (v instanceof Just) {
        if (v.value0.cGroup instanceof Nothing) {
          return acc;
        }
        ;
        if (v.value0.cGroup instanceof Just) {
          return foldl10(rollEdge(v.value0.cGroup.value0))(acc)(v.value0.constraints);
        }
        ;
        throw new Error("Failed pattern match at Markgraf.Compaction.OneD (line 708, column 15 - line 710, column 57): " + [v.value0.cGroup.constructor.name]);
      }
      ;
      throw new Error("Failed pattern match at Markgraf.Compaction.OneD (line 706, column 20 - line 710, column 57): " + [v.constructor.name]);
    };
  };
  var resetGroup = function(acc) {
    return function(gid) {
      return updateCGroup(gid)(function(v) {
        return {
          id: v.id,
          master: v.master,
          cNodes: v.cNodes,
          startPos: v.startPos,
          reference: v.reference,
          delta: v.delta,
          deltaNormalized: v.deltaNormalized,
          outDegree: 0,
          outDegreeReal: 0,
          incomingConstraints: []
        };
      })(acc);
    };
  };
  var g1 = foldl10(resetGroup)(g0)(g0.cGroupOrder);
  return foldl10(rollUp)(g1)(g1.cNodeOrder);
};
var reverseConstraints = function(s0) {
  var g1 = reverseConstraintsGraph(s0.cGraph);
  var g2 = foldl10(function(acc) {
    return function(nid) {
      return updateCNode(nid)(function(v) {
        return {
          id: v.id,
          origin: v.origin,
          kind: v.kind,
          cGroup: v.cGroup,
          cGroupOffset: v.cGroupOffset,
          hitbox: v.hitbox,
          hitboxPreCompaction: v.hitboxPreCompaction,
          constraints: v.constraints,
          ignoreSpacing: v.ignoreSpacing,
          startPos: negInfinity
        };
      })(acc);
    };
  })(g1)(g1.cNodeOrder);
  var g3 = calculateConstraintsForCGroups(g2);
  return {
    direction: s0.direction,
    compactionAlgorithm: s0.compactionAlgorithm,
    constraintAlgorithm: s0.constraintAlgorithm,
    spacingsHandler: s0.spacingsHandler,
    lockFun: s0.lockFun,
    finished: s0.finished,
    cGraph: g3
  };
};
var applyPredefinedConstraints = function(dir) {
  return function(g) {
    var addPair = function(acc) {
      return function(v) {
        if (eq14(dir)(LEFT.value) || eq14(dir)(UP.value)) {
          return updateCNode(v.value0)(function(n) {
            return {
              id: n.id,
              origin: n.origin,
              kind: n.kind,
              cGroup: n.cGroup,
              cGroupOffset: n.cGroupOffset,
              hitbox: n.hitbox,
              hitboxPreCompaction: n.hitboxPreCompaction,
              startPos: n.startPos,
              ignoreSpacing: n.ignoreSpacing,
              constraints: append9(n.constraints)([v.value1])
            };
          })(acc);
        }
        ;
        if (otherwise) {
          return updateCNode(v.value1)(function(n) {
            return {
              id: n.id,
              origin: n.origin,
              kind: n.kind,
              cGroup: n.cGroup,
              cGroupOffset: n.cGroupOffset,
              hitbox: n.hitbox,
              hitboxPreCompaction: n.hitboxPreCompaction,
              startPos: n.startPos,
              ignoreSpacing: n.ignoreSpacing,
              constraints: append9(n.constraints)([v.value0])
            };
          })(acc);
        }
        ;
        throw new Error("Failed pattern match at Markgraf.Compaction.OneD (line 688, column 3 - line 690, column 87): " + [acc.constructor.name, v.constructor.name]);
      };
    };
    var pairs = (function() {
      var $159 = isHorizontalDir(dir);
      if ($159) {
        return g.predefinedHorizontalConstraints;
      }
      ;
      return g.predefinedVerticalConstraints;
    })();
    return foldl10(addPair)(g)(pairs);
  };
};
var calculateConstraints = function(s0) {
  var g1 = clearConstraints(s0.cGraph);
  var g2 = applyPredefinedConstraints(s0.direction)(g1);
  var s1 = {
    compactionAlgorithm: s0.compactionAlgorithm,
    constraintAlgorithm: s0.constraintAlgorithm,
    direction: s0.direction,
    finished: s0.finished,
    lockFun: s0.lockFun,
    spacingsHandler: s0.spacingsHandler,
    cGraph: g2
  };
  var g3 = (function() {
    if (s1.constraintAlgorithm instanceof Nothing) {
      return s1.cGraph;
    }
    ;
    if (s1.constraintAlgorithm instanceof Just) {
      return runConstraintAlgorithm(s1.constraintAlgorithm.value0)(s1);
    }
    ;
    throw new Error("Failed pattern match at Markgraf.Compaction.OneD (line 671, column 10 - line 673, column 48): " + [s1.constraintAlgorithm.constructor.name]);
  })();
  var s2 = {
    compactionAlgorithm: s1.compactionAlgorithm,
    constraintAlgorithm: s1.constraintAlgorithm,
    direction: s1.direction,
    finished: s1.finished,
    lockFun: s1.lockFun,
    spacingsHandler: s1.spacingsHandler,
    cGraph: g3
  };
  return mapGraph(calculateConstraintsForCGroups)(s2);
};
var applyTransition = function(oldDir) {
  return function(newDir) {
    return function(s0) {
      var s1 = {
        cGraph: s0.cGraph,
        compactionAlgorithm: s0.compactionAlgorithm,
        constraintAlgorithm: s0.constraintAlgorithm,
        finished: s0.finished,
        lockFun: s0.lockFun,
        spacingsHandler: s0.spacingsHandler,
        direction: newDir
      };
      if (oldDir instanceof UNDEFINED) {
        if (newDir instanceof LEFT) {
          return calculateConstraints(s1);
        }
        ;
        if (newDir instanceof RIGHT) {
          return calculateConstraints(mapGraph(mirrorHitboxes)(s1));
        }
        ;
        if (newDir instanceof UP) {
          return calculateConstraints(mapGraph(transposeHitboxes)(s1));
        }
        ;
        if (newDir instanceof DOWN) {
          return calculateConstraints(mapGraph(function($189) {
            return mirrorHitboxes(transposeHitboxes($189));
          })(s1));
        }
        ;
        return s1;
      }
      ;
      if (oldDir instanceof LEFT) {
        if (newDir instanceof RIGHT) {
          return reverseConstraints(mapGraph(mirrorHitboxes)(s1));
        }
        ;
        if (newDir instanceof UP) {
          return calculateConstraints(mapGraph(transposeHitboxes)(s1));
        }
        ;
        if (newDir instanceof DOWN) {
          return calculateConstraints(mapGraph(function($190) {
            return mirrorHitboxes(transposeHitboxes($190));
          })(s1));
        }
        ;
        return s1;
      }
      ;
      if (oldDir instanceof RIGHT) {
        if (newDir instanceof LEFT) {
          return reverseConstraints(mapGraph(mirrorHitboxes)(s1));
        }
        ;
        if (newDir instanceof UP) {
          return calculateConstraints(mapGraph(function($191) {
            return transposeHitboxes(mirrorHitboxes($191));
          })(s1));
        }
        ;
        if (newDir instanceof DOWN) {
          return calculateConstraints(mapGraph(function($192) {
            return mirrorHitboxes(transposeHitboxes(mirrorHitboxes($192)));
          })(s1));
        }
        ;
        return s1;
      }
      ;
      if (oldDir instanceof UP) {
        if (newDir instanceof LEFT) {
          return calculateConstraints(mapGraph(transposeHitboxes)(s1));
        }
        ;
        if (newDir instanceof RIGHT) {
          return calculateConstraints(mapGraph(function($193) {
            return mirrorHitboxes(transposeHitboxes($193));
          })(s1));
        }
        ;
        if (newDir instanceof DOWN) {
          return reverseConstraints(mapGraph(mirrorHitboxes)(s1));
        }
        ;
        return s1;
      }
      ;
      if (oldDir instanceof DOWN) {
        if (newDir instanceof LEFT) {
          return calculateConstraints(mapGraph(function($194) {
            return transposeHitboxes(mirrorHitboxes($194));
          })(s1));
        }
        ;
        if (newDir instanceof RIGHT) {
          return calculateConstraints(mapGraph(function($195) {
            return mirrorHitboxes(transposeHitboxes(mirrorHitboxes($195)));
          })(s1));
        }
        ;
        if (newDir instanceof UP) {
          return reverseConstraints(mapGraph(mirrorHitboxes)(s1));
        }
        ;
        return s1;
      }
      ;
      throw new Error("Failed pattern match at Markgraf.Compaction.OneD (line 512, column 3 - line 540, column 14): " + [oldDir.constructor.name]);
    };
  };
};
var changeDirection = function(dir) {
  return function(s) {
    if (s.finished) {
      return s;
    }
    ;
    if (!supports(dir)(s.cGraph)) {
      return s;
    }
    ;
    if (eq14(dir)(s.direction)) {
      return s;
    }
    ;
    if (otherwise) {
      return applyTransition(s.direction)(dir)(s);
    }
    ;
    throw new Error("Failed pattern match at Markgraf.Compaction.OneD (line 502, column 1 - line 502, column 69): " + [dir.constructor.name, s.constructor.name]);
  };
};
var compact = function(s0) {
  if (s0.finished) {
    return s0;
  }
  ;
  if (otherwise) {
    var s1 = (function() {
      var $171 = eq14(s0.direction)(UNDEFINED.value);
      if ($171) {
        return changeDirection(LEFT.value)(s0);
      }
      ;
      return s0;
    })();
    var g2 = resetCompactionFields(s1.cGraph);
    var s2 = {
      compactionAlgorithm: s1.compactionAlgorithm,
      constraintAlgorithm: s1.constraintAlgorithm,
      direction: s1.direction,
      finished: s1.finished,
      lockFun: s1.lockFun,
      spacingsHandler: s1.spacingsHandler,
      cGraph: g2
    };
    if (s2.compactionAlgorithm instanceof Nothing) {
      return s2;
    }
    ;
    if (s2.compactionAlgorithm instanceof Just) {
      return runCompactionAlgorithm(s2.compactionAlgorithm.value0)(s2);
    }
    ;
    throw new Error("Failed pattern match at Markgraf.Compaction.OneD (line 490, column 7 - line 492, column 50): " + [s2.compactionAlgorithm.constructor.name]);
  }
  ;
  throw new Error("Failed pattern match at Markgraf.Compaction.OneD (line 483, column 1 - line 483, column 48): " + [s0.constructor.name]);
};
var finish = function(s) {
  var v = changeDirection(LEFT.value)(s);
  return {
    cGraph: v.cGraph,
    direction: v.direction,
    compactionAlgorithm: v.compactionAlgorithm,
    constraintAlgorithm: v.constraintAlgorithm,
    spacingsHandler: v.spacingsHandler,
    lockFun: v.lockFun,
    finished: true
  };
};
var allCNodes = function(g) {
  return mapMaybe(function(nid) {
    return lookup9(nid)(g.cNodes);
  })(g.cNodeOrder);
};
var allCGroups = function(g) {
  return mapMaybe(function(gid) {
    return lookup9(gid)(g.cGroups);
  })(g.cGroupOrder);
};
var addCNodeToGroup = function(nid) {
  return function(gid) {
    return function(g) {
      var v = new Tuple(lookup9(nid)(g.cNodes), lookup9(gid)(g.cGroups));
      if (v.value0 instanceof Just && v.value1 instanceof Just) {
        var $175 = isJust(v.value0.value0.cGroup) && notEq1(v.value0.value0.cGroup)(new Just(gid));
        if ($175) {
          return g;
        }
        ;
        var n$prime = {
          cGroupOffset: v.value0.value0.cGroupOffset,
          constraints: v.value0.value0.constraints,
          hitbox: v.value0.value0.hitbox,
          hitboxPreCompaction: v.value0.value0.hitboxPreCompaction,
          id: v.value0.value0.id,
          ignoreSpacing: v.value0.value0.ignoreSpacing,
          kind: v.value0.value0.kind,
          origin: v.value0.value0.origin,
          startPos: v.value0.value0.startPos,
          cGroup: new Just(gid)
        };
        var grp$prime = {
          delta: v.value1.value0.delta,
          deltaNormalized: v.value1.value0.deltaNormalized,
          id: v.value1.value0.id,
          incomingConstraints: v.value1.value0.incomingConstraints,
          master: v.value1.value0.master,
          outDegree: v.value1.value0.outDegree,
          outDegreeReal: v.value1.value0.outDegreeReal,
          startPos: v.value1.value0.startPos,
          cNodes: (function() {
            var $176 = elem4(nid)(v.value1.value0.cNodes);
            if ($176) {
              return v.value1.value0.cNodes;
            }
            ;
            return append9(v.value1.value0.cNodes)([nid]);
          })(),
          reference: (function() {
            if (v.value1.value0.reference instanceof Nothing) {
              return new Just(nid);
            }
            ;
            if (v.value1.value0.reference instanceof Just) {
              return new Just(v.value1.value0.reference.value0);
            }
            ;
            throw new Error("Failed pattern match at Markgraf.Compaction.OneD (line 347, column 25 - line 349, column 31): " + [v.value1.value0.reference.constructor.name]);
          })()
        };
        return {
          cNodeOrder: g.cNodeOrder,
          cGroupOrder: g.cGroupOrder,
          supportedDirections: g.supportedDirections,
          predefinedHorizontalConstraints: g.predefinedHorizontalConstraints,
          predefinedVerticalConstraints: g.predefinedVerticalConstraints,
          nextCNodeId: g.nextCNodeId,
          nextCGroupId: g.nextCGroupId,
          cNodes: insert9(nid)(n$prime)(g.cNodes),
          cGroups: insert9(gid)(grp$prime)(g.cGroups)
        };
      }
      ;
      return g;
    };
  };
};
var addCNode = function(spec) {
  return function(g) {
    var n = {
      id: g.nextCNodeId,
      origin: spec.origin,
      kind: spec.kind,
      cGroup: Nothing.value,
      cGroupOffset: zeroVec,
      hitbox: spec.hitbox,
      hitboxPreCompaction: spec.hitbox,
      constraints: [],
      startPos: negInfinity,
      ignoreSpacing: emptyQuadruplet
    };
    return {
      id: g.nextCNodeId,
      graph: {
        cGroups: g.cGroups,
        cGroupOrder: g.cGroupOrder,
        supportedDirections: g.supportedDirections,
        predefinedHorizontalConstraints: g.predefinedHorizontalConstraints,
        predefinedVerticalConstraints: g.predefinedVerticalConstraints,
        nextCGroupId: g.nextCGroupId,
        cNodes: insert9(g.nextCNodeId)(n)(g.cNodes),
        cNodeOrder: append9(g.cNodeOrder)([g.nextCNodeId]),
        nextCNodeId: g.nextCNodeId + 1 | 0
      }
    };
  };
};
var addCGroup = function(spec) {
  return function(g) {
    var grp = {
      id: g.nextCGroupId,
      master: spec.master,
      cNodes: [],
      startPos: negInfinity,
      incomingConstraints: [],
      outDegree: 0,
      outDegreeReal: 0,
      reference: Nothing.value,
      delta: 0,
      deltaNormalized: 0
    };
    var g1 = {
      cNodeOrder: g.cNodeOrder,
      cNodes: g.cNodes,
      nextCNodeId: g.nextCNodeId,
      predefinedHorizontalConstraints: g.predefinedHorizontalConstraints,
      predefinedVerticalConstraints: g.predefinedVerticalConstraints,
      supportedDirections: g.supportedDirections,
      cGroups: insert9(g.nextCGroupId)(grp)(g.cGroups),
      cGroupOrder: append9(g.cGroupOrder)([g.nextCGroupId]),
      nextCGroupId: g.nextCGroupId + 1 | 0
    };
    var g2 = foldl10(function(acc) {
      return function(nid) {
        return addCNodeToGroup(nid)(g.nextCGroupId)(acc);
      };
    })(g1)(spec.nodes);
    return {
      id: g.nextCGroupId,
      graph: g2
    };
  };
};
var wrapPlainNodesInSingletonGroups = function(g0) {
  var wrapOne = function(acc) {
    return function(nid) {
      var v = lookup9(nid)(acc.cNodes);
      if (v instanceof Just && eq5(v.value0.cGroup)(Nothing.value)) {
        return addCGroup({
          master: Nothing.value,
          nodes: [nid]
        })(acc).graph;
      }
      ;
      return acc;
    };
  };
  return foldl10(wrapOne)(g0)(g0.cNodeOrder);
};
var newOneD = function(g0) {
  var g1 = calculateGroupOffsetsGraph(g0);
  var g2 = wrapPlainNodesInSingletonGroups(g1);
  var g3 = snapshotHitboxes(g2);
  return {
    cGraph: g3,
    direction: UNDEFINED.value,
    compactionAlgorithm: Nothing.value,
    constraintAlgorithm: Nothing.value,
    spacingsHandler: defaultSpacingsHandler,
    lockFun: Nothing.value,
    finished: false
  };
};

// ../markgraf/output/Markgraf.Compaction.EdgeAwareScanlineConstraints/index.js
var eq7 = /* @__PURE__ */ eq(/* @__PURE__ */ eqMaybe(eqString));
var max7 = /* @__PURE__ */ max(ordNumber);
var compare7 = /* @__PURE__ */ compare(/* @__PURE__ */ ordTuple(ordNumber)(ordInt));
var eq15 = /* @__PURE__ */ eq(eqOrdering);
var map13 = /* @__PURE__ */ map(functorMaybe);
var insert12 = /* @__PURE__ */ insert(ordInt);
var compare15 = /* @__PURE__ */ compare(ordNumber);
var foldl11 = /* @__PURE__ */ foldl(foldableArray);
var append10 = /* @__PURE__ */ append(semigroupArray);
var toUnfoldable8 = /* @__PURE__ */ toUnfoldable(unfoldableArray);
var insertWith5 = /* @__PURE__ */ insertWith(ordInt);
var eq32 = /* @__PURE__ */ eq(/* @__PURE__ */ eqMaybe(/* @__PURE__ */ eqMaybe(eqInt)));
var lookup10 = /* @__PURE__ */ lookup(ordInt);
var bind5 = /* @__PURE__ */ bind(bindArray);
var sortKey = function(n) {
  return new Tuple(n.hitbox.x + n.hitbox.width / 2, n.id);
};
var smallEpsilon = 0.01;
var isVS = function(n) {
  return eq7(n.kind)(new Just("vs"));
};
var isLNode = function(n) {
  return !isVS(n);
};
var epsilon = 0.5;
var inflateBy = function(edgeEdgeSpacing) {
  return max7(0)(edgeEdgeSpacing / 2 - epsilon);
};
var compareNode = function(a) {
  return function(b) {
    return compare7(sortKey(a))(sortKey(b));
  };
};
var higherNeighbour = function(n) {
  return function(arr) {
    return find2(function(m) {
      return eq15(compareNode(n)(m))(LT.value);
    })(arr);
  };
};
var insertSorted = function(n) {
  return function(arr) {
    var v = findIndex(function(m) {
      return eq15(compareNode(n)(m))(LT.value);
    })(arr);
    if (v instanceof Just) {
      return fromMaybe(arr)(insertAt(v.value0)(n)(arr));
    }
    ;
    if (v instanceof Nothing) {
      return snoc(arr)(n);
    }
    ;
    throw new Error("Failed pattern match at Markgraf.Compaction.EdgeAwareScanlineConstraints (line 287, column 22 - line 289, column 26): " + [v.constructor.name]);
  };
};
var lowerNeighbour = function(n) {
  return function(arr) {
    return last(filter(function(m) {
      return eq15(compareNode(m)(n))(LT.value);
    })(arr));
  };
};
var insert10 = function(st) {
  return function(node) {
    var intervals$prime = insertSorted(node)(st.intervals);
    var leftCandId = map13(function(v) {
      return v.id;
    })(lowerNeighbour(node)(intervals$prime));
    var rightNeighbour = higherNeighbour(node)(intervals$prime);
    var cand$prime = insert12(node.id)(leftCandId)(st.cand);
    var cand$prime$prime = (function() {
      if (rightNeighbour instanceof Just) {
        return insert12(rightNeighbour.value0.id)(new Just(node.id))(cand$prime);
      }
      ;
      if (rightNeighbour instanceof Nothing) {
        return cand$prime;
      }
      ;
      throw new Error("Failed pattern match at Markgraf.Compaction.EdgeAwareScanlineConstraints (line 246, column 14 - line 248, column 23): " + [rightNeighbour.constructor.name]);
    })();
    return {
      constraints: st.constraints,
      intervals: intervals$prime,
      cand: cand$prime$prime
    };
  };
};
var cmpEvent = function(p1) {
  return function(p2) {
    var yOf = function(p) {
      if (p.low) {
        return p.node.hitbox.y;
      }
      ;
      return p.node.hitbox.y + p.node.hitbox.height;
    };
    var v = compare15(yOf(p1))(yOf(p2));
    if (v instanceof EQ) {
      if (!p1.low && p2.low) {
        return LT.value;
      }
      ;
      if (p1.low && !p2.low) {
        return GT.value;
      }
      ;
      return EQ.value;
    }
    ;
    return v;
  };
};
var clearConstraints2 = function(g) {
  var reset = function(acc) {
    return function(n) {
      return updateCNode(n.id)(function(v) {
        return {
          id: v.id,
          origin: v.origin,
          kind: v.kind,
          cGroup: v.cGroup,
          cGroupOffset: v.cGroupOffset,
          hitbox: v.hitbox,
          hitboxPreCompaction: v.hitboxPreCompaction,
          startPos: v.startPos,
          ignoreSpacing: v.ignoreSpacing,
          constraints: []
        };
      })(acc);
    };
  };
  return foldl11(reset)(g)(allCNodes(g));
};
var applyConstraints = function(m) {
  return function(g) {
    var step2 = function(acc) {
      return function(v) {
        var v1 = lookupCNode(v.value0)(acc);
        if (v1 instanceof Just) {
          return updateCNode(v.value0)(function(n) {
            return {
              id: n.id,
              origin: n.origin,
              kind: n.kind,
              cGroup: n.cGroup,
              cGroupOffset: n.cGroupOffset,
              hitbox: n.hitbox,
              hitboxPreCompaction: n.hitboxPreCompaction,
              startPos: n.startPos,
              ignoreSpacing: n.ignoreSpacing,
              constraints: append10(n.constraints)(v.value1)
            };
          })(acc);
        }
        ;
        if (v1 instanceof Nothing) {
          return acc;
        }
        ;
        throw new Error("Failed pattern match at Markgraf.Compaction.EdgeAwareScanlineConstraints (line 311, column 28 - line 313, column 19): " + [v1.constructor.name]);
      };
    };
    return foldl11(step2)(g)(toUnfoldable8(m));
  };
};
var alterHitbox = function(spacing) {
  return function(n) {
    if (isVS(n)) {
      var $66 = !n.ignoreSpacing.up;
      if ($66) {
        return {
          id: n.id,
          origin: n.origin,
          kind: n.kind,
          cGroup: n.cGroup,
          cGroupOffset: n.cGroupOffset,
          hitboxPreCompaction: n.hitboxPreCompaction,
          constraints: n.constraints,
          startPos: n.startPos,
          ignoreSpacing: n.ignoreSpacing,
          hitbox: {
            x: n.hitbox.x,
            width: n.hitbox.width,
            y: n.hitbox.y - spacing - smallEpsilon,
            height: n.hitbox.height + spacing + smallEpsilon
          }
        };
      }
      ;
      var $67 = !n.ignoreSpacing.down;
      if ($67) {
        return {
          id: n.id,
          origin: n.origin,
          kind: n.kind,
          cGroup: n.cGroup,
          cGroupOffset: n.cGroupOffset,
          hitboxPreCompaction: n.hitboxPreCompaction,
          constraints: n.constraints,
          startPos: n.startPos,
          ignoreSpacing: n.ignoreSpacing,
          hitbox: {
            x: n.hitbox.x,
            y: n.hitbox.y,
            width: n.hitbox.width,
            height: n.hitbox.height + spacing + smallEpsilon
          }
        };
      }
      ;
      return n;
    }
    ;
    if (otherwise) {
      return {
        id: n.id,
        origin: n.origin,
        kind: n.kind,
        cGroup: n.cGroup,
        cGroupOffset: n.cGroupOffset,
        hitboxPreCompaction: n.hitboxPreCompaction,
        constraints: n.constraints,
        startPos: n.startPos,
        ignoreSpacing: n.ignoreSpacing,
        hitbox: {
          x: n.hitbox.x,
          width: n.hitbox.width,
          y: n.hitbox.y - spacing,
          height: n.hitbox.height + 2 * spacing
        }
      };
    }
    ;
    throw new Error("Failed pattern match at Markgraf.Compaction.EdgeAwareScanlineConstraints (line 123, column 1 - line 123, column 54): " + [spacing.constructor.name, n.constructor.name]);
  };
};
var inflateAll = function(spacing) {
  return function(g) {
    return function(filt) {
      var step2 = function(acc) {
        return function(n) {
          if (filt(n)) {
            return updateCNode(n.id)(alterHitbox(spacing))(acc);
          }
          ;
          if (otherwise) {
            return acc;
          }
          ;
          throw new Error("Failed pattern match at Markgraf.Compaction.EdgeAwareScanlineConstraints (line 119, column 3 - line 121, column 22): " + [acc.constructor.name, n.constructor.name]);
        };
      };
      return foldl11(step2)(g)(allCNodes(g));
    };
  };
};
var inflateGroups = function(spacing) {
  return function(g) {
    var alterVSInGroup = function(n) {
      if (n.ignoreSpacing.up) {
        return {
          ignoreSpacing: n.ignoreSpacing,
          cGroup: n.cGroup,
          cGroupOffset: n.cGroupOffset,
          constraints: n.constraints,
          hitboxPreCompaction: n.hitboxPreCompaction,
          id: n.id,
          kind: n.kind,
          origin: n.origin,
          startPos: n.startPos,
          hitbox: {
            width: n.hitbox.width,
            x: n.hitbox.x,
            y: n.hitbox.y + spacing + smallEpsilon,
            height: n.hitbox.height - spacing - smallEpsilon
          }
        };
      }
      ;
      if (n.ignoreSpacing.down) {
        return {
          ignoreSpacing: n.ignoreSpacing,
          cGroup: n.cGroup,
          cGroupOffset: n.cGroupOffset,
          constraints: n.constraints,
          hitboxPreCompaction: n.hitboxPreCompaction,
          id: n.id,
          kind: n.kind,
          origin: n.origin,
          startPos: n.startPos,
          hitbox: {
            y: n.hitbox.y,
            width: n.hitbox.width,
            x: n.hitbox.x,
            height: n.hitbox.height - spacing - smallEpsilon
          }
        };
      }
      ;
      if (otherwise) {
        return n;
      }
      ;
      throw new Error("Failed pattern match at Markgraf.Compaction.EdgeAwareScanlineConstraints (line 165, column 3 - line 176, column 20): " + [n.constructor.name]);
    };
    var alterVSMember = function(master) {
      return function(acc) {
        return function(cid) {
          var $71 = cid === master;
          if ($71) {
            return acc;
          }
          ;
          return updateCNode(cid)(alterVSInGroup)(acc);
        };
      };
    };
    var alterAllInGroup = function(acc) {
      return function(members) {
        return function(master) {
          var acc1 = updateCNode(master)(alterHitbox(spacing))(acc);
          var $72 = length(members) <= 1;
          if ($72) {
            return acc1;
          }
          ;
          return foldl11(alterVSMember(master))(acc1)(members);
        };
      };
    };
    var alterGroup = function(acc) {
      return function(grp) {
        if (grp.master instanceof Nothing) {
          var v = head(grp.cNodes);
          if (v instanceof Just) {
            return alterAllInGroup(acc)(grp.cNodes)(v.value0);
          }
          ;
          if (v instanceof Nothing) {
            return acc;
          }
          ;
          throw new Error("Failed pattern match at Markgraf.Compaction.EdgeAwareScanlineConstraints (line 151, column 16 - line 153, column 21): " + [v.constructor.name]);
        }
        ;
        if (grp.master instanceof Just) {
          return alterAllInGroup(acc)(grp.cNodes)(grp.master.value0);
        }
        ;
        throw new Error("Failed pattern match at Markgraf.Compaction.EdgeAwareScanlineConstraints (line 150, column 24 - line 154, column 51): " + [grp.master.constructor.name]);
      };
    };
    return foldl11(alterGroup)(g)(allCGroups(g));
  };
};
var addConstraint = function(from2) {
  return function(to2) {
    return insertWith5(append10)(from2)([to2]);
  };
};
var $$delete4 = function(st) {
  return function(node) {
    var differentGroup = function(a) {
      return function(b) {
        if (a.cGroup instanceof Just && b.cGroup instanceof Just) {
          return a.cGroup.value0 !== b.cGroup.value0;
        }
        ;
        return false;
      };
    };
    var left = lowerNeighbour(node)(st.intervals);
    var right = higherNeighbour(node)(st.intervals);
    var c1 = (function() {
      if (left instanceof Just && (eq32(lookup10(node.id)(st.cand))(new Just(new Just(left.value0.id))) && differentGroup(left.value0)(node))) {
        return addConstraint(left.value0.id)(node.id)(st.constraints);
      }
      ;
      return st.constraints;
    })();
    var c2 = (function() {
      if (right instanceof Just && (eq32(lookup10(right.value0.id)(st.cand))(new Just(new Just(node.id))) && differentGroup(node)(right.value0))) {
        return addConstraint(node.id)(right.value0.id)(c1);
      }
      ;
      return c1;
    })();
    return {
      cand: st.cand,
      constraints: c2,
      intervals: filter(function(m) {
        return m.id !== node.id;
      })(st.intervals)
    };
  };
};
var handle = function(st) {
  return function(ev) {
    if (ev.low) {
      return insert10(st)(ev.node);
    }
    ;
    if (otherwise) {
      return $$delete4(st)(ev.node);
    }
    ;
    throw new Error("Failed pattern match at Markgraf.Compaction.EdgeAwareScanlineConstraints (line 231, column 1 - line 231, column 54): " + [st.constructor.name, ev.constructor.name]);
  };
};
var sweepConstraints = function(filt) {
  return function(g) {
    var twoEvents = function(n) {
      return [{
        node: n,
        low: true
      }, {
        node: n,
        low: false
      }];
    };
    var initial2 = {
      intervals: [],
      cand: empty2,
      constraints: empty2
    };
    var included = filter(filt)(allCNodes(g));
    var events = sortBy(cmpEvent)(bind5(included)(twoEvents));
    var result = foldl11(handle)(initial2)(events);
    return result.constraints;
  };
};
var sweepInto = function(base) {
  return function(filt) {
    return function(inflated) {
      return applyConstraints(sweepConstraints(filt)(inflated))(base);
    };
  };
};
var edgeAwareOrthogonal = function(edgeEdgeSpacing) {
  return function(g0) {
    var inflate = inflateBy(edgeEdgeSpacing);
    var g1 = sweepInto(g0)(isVS)(inflateAll(inflate)(g0)(isVS));
    var g2 = sweepInto(g1)(isLNode)(inflateAll(inflate)(g1)(isLNode));
    return sweepInto(g2)(function(v) {
      return true;
    })(inflateGroups(inflate)(g2));
  };
};
var edgeAwareScanlineConstraints = function(edgeEdgeSpacing) {
  return function(st) {
    return edgeAwareOrthogonal(edgeEdgeSpacing)(clearConstraints2(st.cGraph));
  };
};

// ../markgraf/output/Markgraf.NetworkSimplex/index.js
var member4 = /* @__PURE__ */ member2(ordInt);
var insert11 = /* @__PURE__ */ insert2(ordInt);
var append11 = /* @__PURE__ */ append(semigroupArray);
var foldl12 = /* @__PURE__ */ foldl(foldableArray);
var add3 = /* @__PURE__ */ add(semiringInt);
var mapFlipped8 = /* @__PURE__ */ mapFlipped(functorArray);
var min6 = /* @__PURE__ */ min(ordInt);
var lookup11 = /* @__PURE__ */ lookup(ordInt);
var insert13 = /* @__PURE__ */ insert(ordInt);
var fromFoldable9 = /* @__PURE__ */ fromFoldable(foldableSet);
var fromFoldable12 = /* @__PURE__ */ fromFoldable3(foldableArray);
var ordRecord2 = /* @__PURE__ */ ordRecord();
var ordRecordCons2 = /* @__PURE__ */ ordRecordCons(/* @__PURE__ */ ordRecordCons(ordRecordNil)()({
  reflectSymbol: function() {
    return "weight";
  }
})(ordNumber))()({
  reflectSymbol: function() {
    return "tgt";
  }
});
var srcIsSymbol = {
  reflectSymbol: function() {
    return "src";
  }
};
var eidIsSymbol = {
  reflectSymbol: function() {
    return "eid";
  }
};
var deltaIsSymbol = {
  reflectSymbol: function() {
    return "delta";
  }
};
var $$delete5 = /* @__PURE__ */ $$delete2(ordInt);
var max8 = /* @__PURE__ */ max(ordInt);
var removeSubtreesThreshold = 40;
var removeSubtrees = function(dictOrd) {
  var eq28 = eq(dictOrd.Eq0());
  var member18 = member2(dictOrd);
  var insert29 = insert(dictOrd);
  var lookup118 = lookup(dictOrd);
  var insert34 = insert2(dictOrd);
  var insertWith13 = insertWith(dictOrd);
  return function(nodes) {
    return function(edges) {
      var findIncidentEdge = function(leaf2) {
        return function(st) {
          return find2(function(e) {
            return !member4(e.eid)(st.removedEdges) && (eq28(e.src)(leaf2) || eq28(e.tgt)(leaf2));
          })(edges);
        };
      };
      var drain = function($copy_st) {
        var $tco_done = false;
        var $tco_result;
        function $tco_loop(st) {
          var v = uncons(st.queue);
          if (v instanceof Nothing) {
            $tco_done = true;
            return st;
          }
          ;
          if (v instanceof Just) {
            var $193 = member18(v.value0.head)(st.removedNodes);
            if ($193) {
              $copy_st = {
                removedNodes: st.removedNodes,
                removedEdges: st.removedEdges,
                degree: st.degree,
                record: st.record,
                queue: v.value0.tail
              };
              return;
            }
            ;
            var v1 = findIncidentEdge(v.value0.head)(st);
            if (v1 instanceof Nothing) {
              $copy_st = {
                removedNodes: st.removedNodes,
                removedEdges: st.removedEdges,
                degree: st.degree,
                record: st.record,
                queue: v.value0.tail
              };
              return;
            }
            ;
            if (v1 instanceof Just) {
              var neighbour = (function() {
                var $195 = eq28(v1.value0.src)(v.value0.head);
                if ($195) {
                  return v1.value0.tgt;
                }
                ;
                return v1.value0.src;
              })();
              var viaSrc = eq28(v1.value0.src)(v.value0.head);
              var st$prime = {
                degree: insert29(neighbour)(fromMaybe(0)(lookup118(neighbour)(st.degree)) - 1 | 0)(st.degree),
                removedNodes: insert34(v.value0.head)(st.removedNodes),
                removedEdges: insert11(v1.value0.eid)(st.removedEdges),
                record: append11(st.record)([{
                  node: v.value0.head,
                  neighbour,
                  viaSrc
                }]),
                queue: v.value0.tail
              };
              var nDeg = fromMaybe(0)(lookup118(neighbour)(st$prime.degree));
              var $196 = nDeg === 1 && !member18(neighbour)(st$prime.removedNodes);
              if ($196) {
                $copy_st = {
                  removedNodes: st$prime.removedNodes,
                  removedEdges: st$prime.removedEdges,
                  degree: st$prime.degree,
                  record: st$prime.record,
                  queue: append11(st$prime.queue)([neighbour])
                };
                return;
              }
              ;
              $copy_st = st$prime;
              return;
            }
            ;
            throw new Error("Failed pattern match at Markgraf.NetworkSimplex (line 140, column 12 - line 155, column 25): " + [v1.constructor.name]);
          }
          ;
          throw new Error("Failed pattern match at Markgraf.NetworkSimplex (line 136, column 14 - line 155, column 25): " + [v.constructor.name]);
        }
        ;
        while (!$tco_done) {
          $tco_result = $tco_loop($copy_st);
        }
        ;
        return $tco_result;
      };
      var degree0 = foldl12(function(m) {
        return function(e) {
          return insertWith13(add3)(e.src)(1)(insertWith13(add3)(e.tgt)(1)(m));
        };
      })(empty2)(edges);
      var initialLeaves = filter(function(n) {
        return fromMaybe(0)(lookup118(n)(degree0)) === 1;
      })(nodes);
      var drained = drain({
        degree: degree0,
        removedNodes: empty3,
        removedEdges: empty3,
        record: [],
        queue: initialLeaves
      });
      return {
        coreNodes: filter(function(n) {
          return !member18(n)(drained.removedNodes);
        })(nodes),
        coreEdges: filter(function(e) {
          return !member4(e.eid)(drained.removedEdges);
        })(edges),
        removed: drained.record
      };
    };
  };
};
var reattachSubtrees = function(dictOrd) {
  var lookup118 = lookup(dictOrd);
  var insert29 = insert(dictOrd);
  return function(record) {
    return function(coreLayer) {
      var step2 = function(layers) {
        return function(r) {
          var neighbourLayer = fromMaybe(0)(lookup118(r.neighbour)(layers));
          var myLayer = (function() {
            if (r.viaSrc) {
              return neighbourLayer - 1 | 0;
            }
            ;
            return neighbourLayer + 1 | 0;
          })();
          return insert29(r.node)(myLayer)(layers);
        };
      };
      return foldl12(step2)(coreLayer)(reverse(record));
    };
  };
};
var lookupPo = function(dictOrd) {
  var lookup118 = lookup(dictOrd);
  return function(st) {
    return function(n) {
      return fromMaybe(0)(lookup118(n)(st.poID));
    };
  };
};
var lookupLow = function(dictOrd) {
  var lookup118 = lookup(dictOrd);
  return function(st) {
    return function(n) {
      return fromMaybe(0)(lookup118(n)(st.lowestPoID));
    };
  };
};
var layerOf = function(dictOrd) {
  var lookup118 = lookup(dictOrd);
  return function(st) {
    return function(n) {
      return fromMaybe(0)(lookup118(n)(st.layer));
    };
  };
};
var tightTreeDFS = function(dictOrd) {
  var member18 = member2(dictOrd);
  var eq28 = eq(dictOrd.Eq0());
  var layerOf1 = layerOf(dictOrd);
  var insert29 = insert2(dictOrd);
  return function(edges) {
    return function(root) {
      return function(st) {
        var visit = function(acc) {
          return function(e) {
            var $202 = member4(e.eid)(acc.st.edgeVisited);
            if ($202) {
              return acc;
            }
            ;
            var st1 = {
              treeNode: acc.st.treeNode,
              treeEdge: acc.st.treeEdge,
              cutvalue: acc.st.cutvalue,
              layer: acc.st.layer,
              lowestPoID: acc.st.lowestPoID,
              poID: acc.st.poID,
              postOrder: acc.st.postOrder,
              edgeVisited: insert11(e.eid)(acc.st.edgeVisited)
            };
            var current = (function() {
              var $203 = member18(e.src)(st1.treeNode) && !member18(e.tgt)(st1.treeNode);
              if ($203) {
                return e.src;
              }
              ;
              var $204 = member18(e.tgt)(st1.treeNode) && !member18(e.src)(st1.treeNode);
              if ($204) {
                return e.tgt;
              }
              ;
              return e.src;
            })();
            var other = (function() {
              var $205 = eq28(e.src)(current);
              if ($205) {
                return e.tgt;
              }
              ;
              return e.src;
            })();
            var $206 = member4(e.eid)(st1.treeEdge);
            if ($206) {
              var $207 = member18(other)(st1.treeNode);
              if ($207) {
                return {
                  count: acc.count,
                  st: st1
                };
              }
              ;
              var r = tightTreeDFS(dictOrd)(edges)(other)(st1);
              return {
                count: acc.count + r.count | 0,
                st: r.st
              };
            }
            ;
            var $208 = !member18(other)(st1.treeNode) && e.delta === (layerOf1(st1)(e.tgt) - layerOf1(st1)(e.src) | 0);
            if ($208) {
              var st2 = {
                cutvalue: st1.cutvalue,
                edgeVisited: st1.edgeVisited,
                layer: st1.layer,
                lowestPoID: st1.lowestPoID,
                poID: st1.poID,
                postOrder: st1.postOrder,
                treeNode: st1.treeNode,
                treeEdge: insert11(e.eid)(st1.treeEdge)
              };
              var r = tightTreeDFS(dictOrd)(edges)(other)(st2);
              return {
                count: acc.count + r.count | 0,
                st: r.st
              };
            }
            ;
            return {
              count: acc.count,
              st: st1
            };
          };
        };
        var st$prime = {
          cutvalue: st.cutvalue,
          edgeVisited: st.edgeVisited,
          layer: st.layer,
          lowestPoID: st.lowestPoID,
          poID: st.poID,
          postOrder: st.postOrder,
          treeEdge: st.treeEdge,
          treeNode: insert29(root)(st.treeNode)
        };
        var connected = filter(function(e) {
          return (eq28(e.src)(root) || eq28(e.tgt)(root)) && !member4(e.eid)(st$prime.edgeVisited);
        })(edges);
        return foldl12(visit)({
          count: 1,
          st: st$prime
        })(connected);
      };
    };
  };
};
var isInHead = function(dictOrd) {
  var lookupPo1 = lookupPo(dictOrd);
  var lookupLow1 = lookupLow(dictOrd);
  return function(st) {
    return function(node) {
      return function(leave) {
        var srcPo = lookupPo1(st)(leave.src);
        var tgtPo = lookupPo1(st)(leave.tgt);
        var srcLow = lookupLow1(st)(leave.src);
        var tgtLow = lookupLow1(st)(leave.tgt);
        var nodePo = lookupPo1(st)(node);
        var $209 = srcLow <= nodePo && (nodePo <= srcPo && (tgtLow <= nodePo && nodePo <= tgtPo));
        if ($209) {
          return srcPo >= tgtPo;
        }
        ;
        return srcPo < tgtPo;
      };
    };
  };
};
var initialState = function(dictOrd) {
  var fromFoldable212 = fromFoldable2(dictOrd)(foldableArray);
  return function(nodes) {
    return {
      layer: fromFoldable212(mapFlipped8(nodes)(function(n) {
        return new Tuple(n, 0);
      })),
      treeNode: empty3,
      treeEdge: empty3,
      poID: empty2,
      lowestPoID: empty2,
      cutvalue: empty2,
      postOrder: 1,
      edgeVisited: empty3
    };
  };
};
var infInt = 1e9;
var minimalSlack = function(dictOrd) {
  var member18 = member2(dictOrd);
  var layerOf1 = layerOf(dictOrd);
  return function(edges) {
    return function(st) {
      var scan = function(acc) {
        return function(e) {
          var s = member18(e.src)(st.treeNode);
          var t = member18(e.tgt)(st.treeNode);
          var $210 = s === t;
          if ($210) {
            return acc;
          }
          ;
          var slack = (layerOf1(st)(e.tgt) - layerOf1(st)(e.src) | 0) - e.delta | 0;
          var $211 = slack < acc.slack;
          if ($211) {
            return {
              edge: new Just(e),
              slack
            };
          }
          ;
          return acc;
        };
      };
      return foldl12(scan)({
        edge: Nothing.value,
        slack: infInt
      })(edges).edge;
    };
  };
};
var normalise = function(dictOrd) {
  var lookup118 = lookup(dictOrd);
  var fromFoldable212 = fromFoldable2(dictOrd)(foldableArray);
  return function(nodes) {
    return function(layers) {
      var lo = foldl12(function(m) {
        return function(n) {
          return min6(m)(fromMaybe(0)(lookup118(n)(layers)));
        };
      })(infInt)(nodes);
      return fromFoldable212(mapFlipped8(nodes)(function(n) {
        return new Tuple(n, fromMaybe(0)(lookup118(n)(layers)) - lo | 0);
      }));
    };
  };
};
var postorderDFS = function(dictOrd) {
  var eq28 = eq(dictOrd.Eq0());
  var insert29 = insert(dictOrd);
  return function(edges) {
    return function(node) {
      return function(st0) {
        var visit = function(acc) {
          return function(e) {
            var st1 = {
              cutvalue: acc.st.cutvalue,
              layer: acc.st.layer,
              lowestPoID: acc.st.lowestPoID,
              poID: acc.st.poID,
              postOrder: acc.st.postOrder,
              treeEdge: acc.st.treeEdge,
              treeNode: acc.st.treeNode,
              edgeVisited: insert11(e.eid)(acc.st.edgeVisited)
            };
            var other = (function() {
              var $212 = eq28(e.src)(node);
              if ($212) {
                return e.tgt;
              }
              ;
              return e.src;
            })();
            var r = postorderDFS(dictOrd)(edges)(other)(st1);
            return {
              lowest: min6(acc.lowest)(r.lowest),
              st: r.st
            };
          };
        };
        var connected = filter(function(e) {
          return member4(e.eid)(st0.treeEdge) && ((eq28(e.src)(node) || eq28(e.tgt)(node)) && !member4(e.eid)(st0.edgeVisited));
        })(edges);
        var result = foldl12(visit)({
          lowest: infInt,
          st: st0
        })(connected);
        var lowest$prime = min6(result.lowest)(result.st.postOrder);
        var st$prime = {
          cutvalue: result.st.cutvalue,
          edgeVisited: result.st.edgeVisited,
          layer: result.st.layer,
          treeEdge: result.st.treeEdge,
          treeNode: result.st.treeNode,
          poID: insert29(node)(result.st.postOrder)(result.st.poID),
          lowestPoID: insert29(node)(lowest$prime)(result.st.lowestPoID),
          postOrder: result.st.postOrder + 1 | 0
        };
        return {
          lowest: lowest$prime,
          st: st$prime
        };
      };
    };
  };
};
var postorderTraversal$prime = function(dictOrd) {
  var postorderDFS1 = postorderDFS(dictOrd);
  return function(nodes) {
    return function(edges) {
      return function(st) {
        var v = head(nodes);
        if (v instanceof Nothing) {
          return st;
        }
        ;
        if (v instanceof Just) {
          var stCleared = {
            cutvalue: st.cutvalue,
            layer: st.layer,
            treeEdge: st.treeEdge,
            treeNode: st.treeNode,
            edgeVisited: empty3,
            postOrder: 1,
            poID: empty2,
            lowestPoID: empty2
          };
          return postorderDFS1(edges)(v.value0)(stCleared).st;
        }
        ;
        throw new Error("Failed pattern match at Markgraf.NetworkSimplex (line 294, column 38 - line 298, column 43): " + [v.constructor.name]);
      };
    };
  };
};
var incidentTreeEdges = function(dictOrd) {
  var eq28 = eq(dictOrd.Eq0());
  return function(edges) {
    return function(st) {
      return function(node) {
        return filter(function(e) {
          return member4(e.eid)(st.treeEdge) && (eq28(e.src)(node) || eq28(e.tgt)(node));
        })(edges);
      };
    };
  };
};
var fuzzyStZero = /* @__PURE__ */ (function() {
  return -1e-10;
})();
var leaveEdge = function(edges) {
  return function(st) {
    return find2(function(e) {
      return member4(e.eid)(st.treeEdge) && fromMaybe(0)(lookup11(e.eid)(st.cutvalue)) < fuzzyStZero;
    })(edges);
  };
};
var expandTightTree = function(dictOrd) {
  var tightTreeDFS1 = tightTreeDFS(dictOrd);
  var minimalSlack1 = minimalSlack(dictOrd);
  var layerOf1 = layerOf(dictOrd);
  var member18 = member2(dictOrd);
  var insert29 = insert(dictOrd);
  return function(nodes) {
    return function(edges) {
      return function(st) {
        var v = head(nodes);
        if (v instanceof Nothing) {
          return st;
        }
        ;
        if (v instanceof Just) {
          var stCleared = {
            cutvalue: st.cutvalue,
            layer: st.layer,
            lowestPoID: st.lowestPoID,
            poID: st.poID,
            postOrder: st.postOrder,
            edgeVisited: empty3,
            treeNode: empty3,
            treeEdge: empty3
          };
          var result = tightTreeDFS1(edges)(v.value0)(stCleared);
          var $216 = result.count >= length(nodes);
          if ($216) {
            return result.st;
          }
          ;
          var v1 = minimalSlack1(edges)(result.st);
          if (v1 instanceof Nothing) {
            return result.st;
          }
          ;
          if (v1 instanceof Just) {
            var slack = (layerOf1(result.st)(v1.value0.tgt) - layerOf1(result.st)(v1.value0.src) | 0) - v1.value0.delta | 0;
            var actualSlack = (function() {
              var $218 = member18(v1.value0.tgt)(result.st.treeNode);
              if ($218) {
                return -slack | 0;
              }
              ;
              return slack;
            })();
            var shifted = {
              cutvalue: result.st.cutvalue,
              edgeVisited: result.st.edgeVisited,
              lowestPoID: result.st.lowestPoID,
              poID: result.st.poID,
              postOrder: result.st.postOrder,
              treeEdge: result.st.treeEdge,
              treeNode: result.st.treeNode,
              layer: foldl12(function(m) {
                return function(nd) {
                  var $219 = member18(nd)(result.st.treeNode);
                  if ($219) {
                    return insert29(nd)(layerOf1(result.st)(nd) + actualSlack | 0)(m);
                  }
                  ;
                  return m;
                };
              })(result.st.layer)(nodes)
            };
            return expandTightTree(dictOrd)(nodes)(edges)(shifted);
          }
          ;
          throw new Error("Failed pattern match at Markgraf.NetworkSimplex (line 233, column 10 - line 248, column 44): " + [v1.constructor.name]);
        }
        ;
        throw new Error("Failed pattern match at Markgraf.NetworkSimplex (line 227, column 34 - line 248, column 44): " + [v.constructor.name]);
      };
    };
  };
};
var enterEdge = function(dictOrd) {
  var isInHead1 = isInHead(dictOrd);
  var layerOf1 = layerOf(dictOrd);
  return function(edges) {
    return function(leave) {
      return function(st) {
        var scan = function(acc) {
          return function(e) {
            var $222 = isInHead1(st)(e.src)(leave) && !isInHead1(st)(e.tgt)(leave);
            if ($222) {
              var s = (layerOf1(st)(e.tgt) - layerOf1(st)(e.src) | 0) - e.delta | 0;
              var $223 = s < acc.slack;
              if ($223) {
                return {
                  edge: new Just(e),
                  slack: s
                };
              }
              ;
              return acc;
            }
            ;
            return acc;
          };
        };
        return foldl12(scan)({
          edge: Nothing.value,
          slack: infInt
        })(edges).edge;
      };
    };
  };
};
var computeCutvalue = function(dictOrd) {
  var eq28 = eq(dictOrd.Eq0());
  return function(edges) {
    return function(st) {
      return function(node) {
        return function(toDetermine) {
          var connected = filter(function(e) {
            return e.eid !== toDetermine.eid && (eq28(e.src)(node) || eq28(e.tgt)(node));
          })(edges);
          var accumulate = function(val) {
            return function(e) {
              var isTreeEdge = (function() {
                var v = lookup11(e.eid)(st.cutvalue);
                if (v instanceof Just) {
                  return true;
                }
                ;
                if (v instanceof Nothing) {
                  return false;
                }
                ;
                throw new Error("Failed pattern match at Markgraf.NetworkSimplex (line 379, column 20 - line 381, column 25): " + [v.constructor.name]);
              })();
              if (isTreeEdge) {
                var cv = fromMaybe(0)(lookup11(e.eid)(st.cutvalue));
                var $227 = eq28(toDetermine.src)(e.src) || eq28(toDetermine.tgt)(e.tgt);
                if ($227) {
                  return val - (cv - e.weight);
                }
                ;
                return val + (cv - e.weight);
              }
              ;
              var $228 = eq28(node)(toDetermine.src);
              if ($228) {
                var $229 = eq28(e.src)(node);
                if ($229) {
                  return val + e.weight;
                }
                ;
                return val - e.weight;
              }
              ;
              var $230 = eq28(e.src)(node);
              if ($230) {
                return val - e.weight;
              }
              ;
              return val + e.weight;
            };
          };
          return foldl12(accumulate)(toDetermine.weight)(connected);
        };
      };
    };
  };
};
var drainLeaf = function(dictOrd) {
  var lookup118 = lookup(dictOrd);
  var insert29 = insert(dictOrd);
  var eq28 = eq(dictOrd.Eq0());
  var computeCutvalue1 = computeCutvalue(dictOrd);
  return function(edges) {
    return function(acc) {
      return function(startNode) {
        var removeFrom = function(n) {
          return function(e) {
            return function(m) {
              var v = lookup118(n)(m);
              if (v instanceof Just) {
                return insert29(n)(filter(function(x) {
                  return x.eid !== e.eid;
                })(v.value0))(m);
              }
              ;
              if (v instanceof Nothing) {
                return m;
              }
              ;
              throw new Error("Failed pattern match at Markgraf.NetworkSimplex (line 359, column 22 - line 361, column 17): " + [v.constructor.name]);
            };
          };
        };
        var go = function($copy_st) {
          return function($copy_node) {
            var $tco_var_st = $copy_st;
            var $tco_done = false;
            var $tco_result;
            function $tco_loop(st, node) {
              var v = fromMaybe([])(lookup118(node)(st.unknown));
              if (v.length === 1) {
                var other = (function() {
                  var $234 = eq28(v[0].src)(node);
                  if ($234) {
                    return v[0].tgt;
                  }
                  ;
                  return v[0].src;
                })();
                var value = computeCutvalue1(edges)(st)(node)(v[0]);
                var unknown$prime = removeFrom(node)(v[0])(removeFrom(other)(v[0])(st.unknown));
                var cutvalue$prime = insert13(v[0].eid)(value)(st.cutvalue);
                $tco_var_st = {
                  unknown: unknown$prime,
                  cutvalue: cutvalue$prime
                };
                $copy_node = other;
                return;
              }
              ;
              $tco_done = true;
              return st;
            }
            ;
            while (!$tco_done) {
              $tco_result = $tco_loop($tco_var_st, $copy_node);
            }
            ;
            return $tco_result;
          };
        };
        return go(acc)(startNode);
      };
    };
  };
};
var cutvalues = function(dictOrd) {
  var fromFoldable212 = fromFoldable12(ordRecord2(ordRecordCons(ordRecordCons(ordRecordCons(ordRecordCons2(dictOrd))()(srcIsSymbol)(dictOrd))()(eidIsSymbol)(ordInt))()(deltaIsSymbol)(ordInt)));
  var incidentTreeEdges1 = incidentTreeEdges(dictOrd);
  var fromFoldable310 = fromFoldable2(dictOrd)(foldableArray);
  var lookup118 = lookup(dictOrd);
  var drainLeaf1 = drainLeaf(dictOrd);
  return function(nodes) {
    return function(edges) {
      return function(st0) {
        var unknownInit = mapFlipped8(nodes)(function(n) {
          return new Tuple(n, fromFoldable9(fromFoldable212(incidentTreeEdges1(edges)(st0)(n))));
        });
        var initSt = {
          unknown: fromFoldable310(unknownInit),
          cutvalue: empty2
        };
        var leafs = filter(function(n) {
          return length(fromMaybe([])(lookup118(n)(initSt.unknown))) === 1;
        })(nodes);
        var $$final = foldl12(drainLeaf1(edges))(initSt)(leafs);
        return {
          layer: st0.layer,
          treeNode: st0.treeNode,
          treeEdge: st0.treeEdge,
          poID: st0.poID,
          lowestPoID: st0.lowestPoID,
          postOrder: st0.postOrder,
          edgeVisited: st0.edgeVisited,
          cutvalue: $$final.cutvalue
        };
      };
    };
  };
};
var exchange = function(dictOrd) {
  var layerOf1 = layerOf(dictOrd);
  var isInHead1 = isInHead(dictOrd);
  var insert29 = insert(dictOrd);
  var postorderTraversal$prime1 = postorderTraversal$prime(dictOrd);
  var cutvalues1 = cutvalues(dictOrd);
  return function(nodes) {
    return function(edges) {
      return function(leave) {
        return function(enter) {
          return function(st) {
            var st1 = {
              cutvalue: st.cutvalue,
              edgeVisited: st.edgeVisited,
              layer: st.layer,
              lowestPoID: st.lowestPoID,
              poID: st.poID,
              postOrder: st.postOrder,
              treeNode: st.treeNode,
              treeEdge: insert11(enter.eid)($$delete5(leave.eid)(st.treeEdge))
            };
            var delta0 = (layerOf1(st1)(enter.tgt) - layerOf1(st1)(enter.src) | 0) - enter.delta | 0;
            var delta2 = (function() {
              var $236 = isInHead1(st1)(enter.tgt)(leave);
              if ($236) {
                return delta0;
              }
              ;
              return -delta0 | 0;
            })();
            var st2 = {
              cutvalue: st1.cutvalue,
              edgeVisited: st1.edgeVisited,
              lowestPoID: st1.lowestPoID,
              poID: st1.poID,
              postOrder: st1.postOrder,
              treeEdge: st1.treeEdge,
              treeNode: st1.treeNode,
              layer: foldl12(function(m) {
                return function(nd) {
                  var $237 = !isInHead1(st1)(nd)(leave);
                  if ($237) {
                    return insert29(nd)(layerOf1(st1)(nd) + delta2 | 0)(m);
                  }
                  ;
                  return m;
                };
              })(st1.layer)(nodes)
            };
            var st3 = postorderTraversal$prime1(nodes)(edges)(st2);
            return cutvalues1(nodes)(edges)(st3);
          };
        };
      };
    };
  };
};
var optimiseLoop = function(dictOrd) {
  var enterEdge1 = enterEdge(dictOrd);
  var exchange1 = exchange(dictOrd);
  return function(iterLimit) {
    return function(nodes) {
      return function(edges) {
        return function(st) {
          var go = function($copy_v) {
            return function($copy_v1) {
              var $tco_var_v = $copy_v;
              var $tco_done = false;
              var $tco_result;
              function $tco_loop(v, v1) {
                if (v === 0) {
                  $tco_done = true;
                  return v1;
                }
                ;
                var v2 = leaveEdge(edges)(v1);
                if (v2 instanceof Nothing) {
                  $tco_done = true;
                  return v1;
                }
                ;
                if (v2 instanceof Just) {
                  var v3 = enterEdge1(edges)(v2.value0)(v1);
                  if (v3 instanceof Nothing) {
                    $tco_done = true;
                    return v1;
                  }
                  ;
                  if (v3 instanceof Just) {
                    $tco_var_v = v - 1 | 0;
                    $copy_v1 = exchange1(nodes)(edges)(v2.value0)(v3.value0)(v1);
                    return;
                  }
                  ;
                  throw new Error("Failed pattern match at Markgraf.NetworkSimplex (line 399, column 19 - line 401, column 68): " + [v3.constructor.name]);
                }
                ;
                throw new Error("Failed pattern match at Markgraf.NetworkSimplex (line 397, column 12 - line 401, column 68): " + [v2.constructor.name]);
              }
              ;
              while (!$tco_done) {
                $tco_result = $tco_loop($tco_var_v, $copy_v1);
              }
              ;
              return $tco_result;
            };
          };
          return go(iterLimit)(st);
        };
      };
    };
  };
};
var feasibleTree = function(dictOrd) {
  var cutvalues1 = cutvalues(dictOrd);
  var postorderTraversal$prime1 = postorderTraversal$prime(dictOrd);
  var expandTightTree1 = expandTightTree(dictOrd);
  return function(nodes) {
    return function(edges) {
      return function(st0) {
        return cutvalues1(nodes)(edges)(postorderTraversal$prime1(nodes)(edges)(expandTightTree1(nodes)(edges)(st0)));
      };
    };
  };
};
var byNode = function(dictOrd) {
  var insertWith13 = insertWith(dictOrd);
  return function(keyFn) {
    return foldl12(function(m) {
      return function(e) {
        return insertWith13(append11)(keyFn(e))([e])(m);
      };
    })(empty2);
  };
};
var layeringTopological = function(dictOrd) {
  var lookup118 = lookup(dictOrd);
  var layerOf1 = layerOf(dictOrd);
  var insert29 = insert(dictOrd);
  var byNode1 = byNode(dictOrd);
  var fromFoldable212 = fromFoldable2(dictOrd)(foldableArray);
  return function(nodes) {
    return function(edges) {
      return function(st0) {
        var go = function($copy_outs) {
          return function($copy_incident) {
            return function($copy_queue) {
              return function($copy_st) {
                var $tco_var_outs = $copy_outs;
                var $tco_var_incident = $copy_incident;
                var $tco_var_queue = $copy_queue;
                var $tco_done = false;
                var $tco_result;
                function $tco_loop(outs, incident, queue, st) {
                  var v = uncons(queue);
                  if (v instanceof Nothing) {
                    $tco_done = true;
                    return st;
                  }
                  ;
                  if (v instanceof Just) {
                    var myOuts = fromMaybe([])(lookup118(v.value0.head)(outs));
                    var layN = layerOf1(st)(v.value0.head);
                    var v1 = foldl12(function(acc) {
                      return function(e) {
                        var tgtLayer = max8(layerOf1(acc.st)(e.tgt))(layN + e.delta | 0);
                        var stNext = {
                          cutvalue: acc.st.cutvalue,
                          edgeVisited: acc.st.edgeVisited,
                          lowestPoID: acc.st.lowestPoID,
                          poID: acc.st.poID,
                          postOrder: acc.st.postOrder,
                          treeEdge: acc.st.treeEdge,
                          treeNode: acc.st.treeNode,
                          layer: insert29(e.tgt)(tgtLayer)(acc.st.layer)
                        };
                        var nextIncident = fromMaybe(0)(lookup118(e.tgt)(acc.incident)) - 1 | 0;
                        var incidentNext = insert29(e.tgt)(nextIncident)(acc.incident);
                        var queueNext = (function() {
                          var $245 = nextIncident === 0;
                          if ($245) {
                            return append11(acc.queue)([e.tgt]);
                          }
                          ;
                          return acc.queue;
                        })();
                        return {
                          st: stNext,
                          incident: incidentNext,
                          queue: queueNext
                        };
                      };
                    })({
                      st,
                      incident,
                      queue: v.value0.tail
                    })(myOuts);
                    $tco_var_outs = outs;
                    $tco_var_incident = v1.incident;
                    $tco_var_queue = v1.queue;
                    $copy_st = v1.st;
                    return;
                  }
                  ;
                  throw new Error("Failed pattern match at Markgraf.NetworkSimplex (line 202, column 31 - line 219, column 35): " + [v.constructor.name]);
                }
                ;
                while (!$tco_done) {
                  $tco_result = $tco_loop($tco_var_outs, $tco_var_incident, $tco_var_queue, $copy_st);
                }
                ;
                return $tco_result;
              };
            };
          };
        };
        var outgoing = byNode1(function(v) {
          return v.src;
        })(edges);
        var incoming = byNode1(function(v) {
          return v.tgt;
        })(edges);
        var initIncident = mapFlipped8(nodes)(function(n) {
          return new Tuple(n, length(fromMaybe([])(lookup118(n)(incoming))));
        });
        var incidentMap0 = fromFoldable212(initIncident);
        var sources = filter(function(n) {
          return fromMaybe(0)(lookup118(n)(incidentMap0)) === 0;
        })(nodes);
        return go(outgoing)(incidentMap0)(sources)(st0);
      };
    };
  };
};
var runSimplexCore = function(dictOrd) {
  var initialState1 = initialState(dictOrd);
  var layeringTopological1 = layeringTopological(dictOrd);
  var feasibleTree1 = feasibleTree(dictOrd);
  var optimiseLoop1 = optimiseLoop(dictOrd);
  return function(nodes) {
    return function(edges) {
      var st0 = initialState1(nodes);
      var st1 = layeringTopological1(nodes)(edges)(st0);
      var $253 = $$null(edges);
      if ($253) {
        return st1.layer;
      }
      ;
      var st2 = feasibleTree1(nodes)(edges)(st1);
      var iterLimit = 4 * length(nodes) | 0;
      var st3 = optimiseLoop1(iterLimit)(nodes)(edges)(st2);
      return st3.layer;
    };
  };
};
var runNetworkSimplex = function(dictOrd) {
  var normalise1 = normalise(dictOrd);
  var runSimplexCore1 = runSimplexCore(dictOrd);
  var removeSubtrees1 = removeSubtrees(dictOrd);
  var reattachSubtrees1 = reattachSubtrees(dictOrd);
  return function(nodes) {
    return function(edges) {
      if ($$null(nodes)) {
        return empty2;
      }
      ;
      if (length(nodes) < removeSubtreesThreshold) {
        return normalise1(nodes)(runSimplexCore1(nodes)(edges));
      }
      ;
      if (otherwise) {
        var pruned = removeSubtrees1(nodes)(edges);
        var coreLayer = runSimplexCore1(pruned.coreNodes)(pruned.coreEdges);
        var merged = reattachSubtrees1(pruned.removed)(coreLayer);
        return normalise1(nodes)(merged);
      }
      ;
      throw new Error("Failed pattern match at Markgraf.NetworkSimplex (line 82, column 1 - line 82, column 80): " + [nodes.constructor.name, edges.constructor.name]);
    };
  };
};

// ../markgraf/output/Markgraf.Compaction.NetworkSimplexCompaction/index.js
var append12 = /* @__PURE__ */ append(semigroupArray);
var add4 = /* @__PURE__ */ add(semiringInt);
var lookup14 = /* @__PURE__ */ lookup(ordInt);
var foldl13 = /* @__PURE__ */ foldl(foldableArray);
var max9 = /* @__PURE__ */ max(ordInt);
var eq8 = /* @__PURE__ */ eq(/* @__PURE__ */ eqMaybe(eqInt));
var insertWith6 = /* @__PURE__ */ insertWith(ordInt);
var runNetworkSimplex2 = /* @__PURE__ */ runNetworkSimplex(ordInt);
var separationWeight = 1;
var pushEdge = function(e) {
  return function(s) {
    var nEdge = {
      src: e.src,
      tgt: e.tgt,
      delta: e.delta,
      weight: e.weight,
      eid: s.nextEid
    };
    return {
      nodes: s.nodes,
      nextNodeId: s.nextNodeId,
      edges: append12(s.edges)([nEdge]),
      nextEid: s.nextEid + 1 | 0
    };
  };
};
var intToNum = toNumber;
var writeNode = function(layers) {
  return function(g) {
    return function(cNode) {
      if (cNode.cGroup instanceof Nothing) {
        return g;
      }
      ;
      if (cNode.cGroup instanceof Just) {
        var layer = intToNum(fromMaybe(0)(lookup14(cNode.cGroup.value0)(layers)));
        return updateCNode(cNode.id)(function(n) {
          return {
            id: n.id,
            origin: n.origin,
            kind: n.kind,
            cGroup: n.cGroup,
            cGroupOffset: n.cGroupOffset,
            hitboxPreCompaction: n.hitboxPreCompaction,
            constraints: n.constraints,
            startPos: n.startPos,
            ignoreSpacing: n.ignoreSpacing,
            hitbox: {
              y: n.hitbox.y,
              width: n.hitbox.width,
              height: n.hitbox.height,
              x: layer + n.cGroupOffset.x
            }
          };
        })(g);
      }
      ;
      throw new Error("Failed pattern match at Markgraf.Compaction.NetworkSimplexCompaction (line 219, column 28 - line 225, column 8): " + [cNode.cGroup.constructor.name]);
    };
  };
};
var edgeWeight = 100;
var chooseSpacing = function(st) {
  return function(cNode) {
    return function(incNode) {
      var $28 = isHorizontalDir(st.direction);
      if ($28) {
        return st.spacingsHandler.horizontalSpacing(cNode)(incNode);
      }
      ;
      return st.spacingsHandler.verticalSpacing(cNode)(incNode);
    };
  };
};
var applyLayers = function(layers) {
  return function(st) {
    var cg$prime = foldl13(writeNode(layers))(st.cGraph)(allCNodes(st.cGraph));
    return {
      direction: st.direction,
      compactionAlgorithm: st.compactionAlgorithm,
      constraintAlgorithm: st.constraintAlgorithm,
      spacingsHandler: st.spacingsHandler,
      lockFun: st.lockFun,
      finished: st.finished,
      cGraph: cg$prime
    };
  };
};
var addHelperPair = function(cNode) {
  return function(incNode) {
    return function(cg) {
      return function(incCg) {
        return function(s) {
          var offsetDelta = ceil2(incNode.cGroupOffset.x - cNode.cGroupOffset.x);
          var s1 = {
            edges: s.edges,
            nextEid: s.nextEid,
            nodes: append12(s.nodes)([s.nextNodeId]),
            nextNodeId: s.nextNodeId + 1 | 0
          };
          var s2 = pushEdge({
            src: s.nextNodeId,
            tgt: cg,
            delta: max9(0)(offsetDelta),
            weight: separationWeight
          })(s1);
          return pushEdge({
            src: s.nextNodeId,
            tgt: incCg,
            delta: max9(0)(-offsetDelta | 0),
            weight: separationWeight
          })(s2);
        };
      };
    };
  };
};
var placeEdge = function(hooks) {
  return function(st) {
    return function(cNode) {
      return function(incNode) {
        return function(cg) {
          return function(incCg) {
            return function(s) {
              var spacing = chooseSpacing(st)(cNode)(incNode);
              var rawDelta = cNode.cGroupOffset.x + cNode.hitbox.width + spacing - incNode.cGroupOffset.x;
              var delta2 = max9(0)(ceil2(rawDelta));
              var $29 = hooks.sameEdgeVerticalSegments(cNode)(incNode);
              if ($29) {
                return addHelperPair(cNode)(incNode)(cg)(incCg)(s);
              }
              ;
              var weight = (function() {
                var $30 = hooks.vsLNodePair(cNode)(incNode);
                if ($30) {
                  return 2;
                }
                ;
                return separationWeight;
              })();
              return pushEdge({
                src: cg,
                tgt: incCg,
                delta: delta2,
                weight
              })(s);
            };
          };
        };
      };
    };
  };
};
var addSeparation = function(hooks) {
  return function(st) {
    return function(cNode) {
      return function(s) {
        return function(incId) {
          var v = lookupCNode(incId)(st.cGraph);
          if (v instanceof Nothing) {
            return s;
          }
          ;
          if (v instanceof Just) {
            var $32 = eq8(cNode.cGroup)(v.value0.cGroup);
            if ($32) {
              return s;
            }
            ;
            if (cNode.cGroup instanceof Just && v.value0.cGroup instanceof Just) {
              return placeEdge(hooks)(st)(cNode)(v.value0)(cNode.cGroup.value0)(v.value0.cGroup.value0)(s);
            }
            ;
            return s;
          }
          ;
          throw new Error("Failed pattern match at Markgraf.Compaction.NetworkSimplexCompaction (line 138, column 40 - line 144, column 16): " + [v.constructor.name]);
        };
      };
    };
  };
};
var addSeparationsForNode = function(hooks) {
  return function(st) {
    return function(s) {
      return function(cNode) {
        return foldl13(addSeparation(hooks)(st)(cNode))(s)(cNode.constraints);
      };
    };
  };
};
var addExtraEdge = function(s) {
  return function(e) {
    return pushEdge({
      src: e.srcGroup,
      tgt: e.tgtGroup,
      delta: e.delta,
      weight: e.weight
    })(s);
  };
};
var addArtificialSource = function(s) {
  var incoming = foldl13(function(m) {
    return function(e) {
      return insertWith6(add4)(e.tgt)(1)(m);
    };
  })(empty2)(s.edges);
  var sources = filter(function(n) {
    return fromMaybe(0)(lookup14(n)(incoming)) === 0;
  })(s.nodes);
  var $38 = length(sources) <= 1;
  if ($38) {
    return s;
  }
  ;
  var s1 = {
    edges: s.edges,
    nextEid: s.nextEid,
    nodes: append12(s.nodes)([s.nextNodeId]),
    nextNodeId: s.nextNodeId + 1 | 0
  };
  return foldl13(function(acc) {
    return function(src) {
      return pushEdge({
        src: s.nextNodeId,
        tgt: src,
        delta: 1,
        weight: 0
      })(acc);
    };
  })(s1)(sources);
};
var build2 = function(hooks) {
  return function(st) {
    var s0 = {
      nodes: st.cGraph.cGroupOrder,
      edges: [],
      nextNodeId: st.cGraph.nextCGroupId,
      nextEid: 0
    };
    var s1 = foldl13(addSeparationsForNode(hooks)(st))(s0)(allCNodes(st.cGraph));
    var s2 = foldl13(addExtraEdge)(s1)(hooks.edgeLengthEdges(st.cGraph));
    var s3 = addArtificialSource(s2);
    return {
      nodes: s3.nodes,
      edges: s3.edges
    };
  };
};
var networkSimplexCompaction = function(hooks) {
  return function(st) {
    var built = build2(hooks)(st);
    var layers = runNetworkSimplex2(built.nodes)(built.edges);
    return applyLayers(layers)(st);
  };
};

// ../markgraf/output/Markgraf.Compaction.VerticalSegment/index.js
var min7 = /* @__PURE__ */ min(ordNumber);
var max10 = /* @__PURE__ */ max(ordNumber);
var append13 = /* @__PURE__ */ append(semigroupArray);
var compare8 = /* @__PURE__ */ compare(ordNumber);
var newVerticalSegment = function(vid) {
  return function(bend1) {
    return function(bend2) {
      return function(mGroupParent) {
        return function(edgeId) {
          return {
            id: vid,
            representedEdges: [edgeId],
            affectedBends: [bend1, bend2],
            hitbox: {
              x: min7(gridX(bend1))(gridX(bend2)),
              y: min7(gridY(bend1))(gridY(bend2)),
              width: abs2(gridX(bend1) - gridX(bend2)),
              height: abs2(gridY(bend1) - gridY(bend2))
            },
            ignoreSpacing: emptyQuadruplet,
            potentialGroupParents: (function() {
              if (mGroupParent instanceof Nothing) {
                return [];
              }
              ;
              if (mGroupParent instanceof Just) {
                return [mGroupParent.value0];
              }
              ;
              throw new Error("Failed pattern match at Markgraf.Compaction.VerticalSegment (line 63, column 28 - line 65, column 22): " + [mGroupParent.constructor.name]);
            })(),
            aPort: Nothing.value
          };
        };
      };
    };
  };
};
var joinWith2 = function(survivor) {
  return function(other) {
    var newX = min7(survivor.hitbox.x)(other.hitbox.x);
    var newY = min7(survivor.hitbox.y)(other.hitbox.y);
    var maxX = max10(survivor.hitbox.x + survivor.hitbox.width)(other.hitbox.x + other.hitbox.width);
    var maxY = max10(survivor.hitbox.y + survivor.hitbox.height)(other.hitbox.y + other.hitbox.height);
    return {
      id: survivor.id,
      representedEdges: append13(survivor.representedEdges)(other.representedEdges),
      affectedBends: append13(survivor.affectedBends)(other.affectedBends),
      potentialGroupParents: append13(survivor.potentialGroupParents)(other.potentialGroupParents),
      hitbox: {
        x: newX,
        y: newY,
        width: maxX - newX,
        height: maxY - newY
      },
      ignoreSpacing: quadOr(survivor.ignoreSpacing)(other.ignoreSpacing),
      aPort: (function() {
        if (survivor.aPort instanceof Just) {
          return survivor.aPort;
        }
        ;
        if (survivor.aPort instanceof Nothing) {
          return other.aPort;
        }
        ;
        throw new Error("Failed pattern match at Markgraf.Compaction.VerticalSegment (line 91, column 15 - line 93, column 31): " + [survivor.aPort.constructor.name]);
      })()
    };
  };
};
var intersects = function(a) {
  return function(b) {
    return fuzzyEq(a.hitbox.x)(b.hitbox.x) && (!fuzzyLt(a.hitbox.y + a.hitbox.height)(b.hitbox.y) && !fuzzyLt(b.hitbox.y + b.hitbox.height)(a.hitbox.y));
  };
};
var compareVS = function(a) {
  return function(b) {
    if (fuzzyEq(a.hitbox.x)(b.hitbox.x)) {
      return compare8(a.hitbox.y)(b.hitbox.y);
    }
    ;
    if (a.hitbox.x < b.hitbox.x) {
      return LT.value;
    }
    ;
    if (otherwise) {
      return GT.value;
    }
    ;
    throw new Error("Failed pattern match at Markgraf.Compaction.VerticalSegment (line 98, column 1 - line 98, column 60): " + [a.constructor.name, b.constructor.name]);
  };
};

// ../markgraf/output/Markgraf.Compaction.LGraphToCGraphTransformer/index.js
var fromFoldable10 = /* @__PURE__ */ fromFoldable2(ordEdgeId)(foldableArray);
var mapFlipped9 = /* @__PURE__ */ mapFlipped(functorArray);
var lookup15 = /* @__PURE__ */ lookup(ordEdgeId);
var fromFoldable13 = /* @__PURE__ */ fromFoldable3(foldableArray);
var fromFoldable22 = /* @__PURE__ */ fromFoldable13(/* @__PURE__ */ ordTuple(ordNodeId)(/* @__PURE__ */ ordMaybe(ordPortId)));
var compare9 = /* @__PURE__ */ compare(ordInt);
var bind6 = /* @__PURE__ */ bind(bindMaybe);
var lookup16 = /* @__PURE__ */ lookup(ordNodeId);
var eq9 = /* @__PURE__ */ eq(eqPortId);
var foldl14 = /* @__PURE__ */ foldl(foldableArray);
var insertWith7 = /* @__PURE__ */ insertWith(ordEdgeId);
var append14 = /* @__PURE__ */ append(semigroupArray);
var insert14 = /* @__PURE__ */ insert(ordInt);
var fromFoldable32 = /* @__PURE__ */ fromFoldable13(ordDirection);
var insert15 = /* @__PURE__ */ insert(ordNodeId);
var insertWith1 = /* @__PURE__ */ insertWith(ordNodeId);
var insert23 = /* @__PURE__ */ insert(ordGridPos);
var elem5 = /* @__PURE__ */ elem2(eqEdgeId);
var eq16 = /* @__PURE__ */ eq(eqNodeId);
var bind12 = /* @__PURE__ */ bind(bindArray);
var lookup24 = /* @__PURE__ */ lookup(ordGridPos);
var mapFlipped12 = /* @__PURE__ */ mapFlipped(functorMaybe);
var NodeOrigin = /* @__PURE__ */ (function() {
  function NodeOrigin2(value0) {
    this.value0 = value0;
  }
  ;
  NodeOrigin2.create = function(value0) {
    return new NodeOrigin2(value0);
  };
  return NodeOrigin2;
})();
var SegmentOrigin = /* @__PURE__ */ (function() {
  function SegmentOrigin2(value0) {
    this.value0 = value0;
  }
  ;
  SegmentOrigin2.create = function(value0) {
    return new SegmentOrigin2(value0);
  };
  return SegmentOrigin2;
})();
var vsLockFor = function(allEdges) {
  return function(representedEdges) {
    var byId = fromFoldable10(mapFlipped9(allEdges)(function(e) {
      return new Tuple(e.id, e);
    }));
    var myEdges = mapMaybe(function(eid) {
      return lookup15(eid)(byId);
    })(representedEdges);
    var incSize = size2(fromFoldable22(mapFlipped9(myEdges)(function(e) {
      return new Tuple(e.from.node, e.from.port);
    })));
    var outSize = size2(fromFoldable22(mapFlipped9(myEdges)(function(e) {
      return new Tuple(e.to.node, e.to.port);
    })));
    var v = compare9(incSize)(outSize);
    if (v instanceof LT) {
      return {
        up: emptyQuadruplet.up,
        down: emptyQuadruplet.down,
        left: true,
        right: false
      };
    }
    ;
    if (v instanceof GT) {
      return {
        up: emptyQuadruplet.up,
        down: emptyQuadruplet.down,
        left: false,
        right: true
      };
    }
    ;
    if (v instanceof EQ) {
      return emptyQuadruplet;
    }
    ;
    throw new Error("Failed pattern match at Markgraf.Compaction.LGraphToCGraphTransformer (line 345, column 39 - line 348, column 24): " + [v.constructor.name]);
  };
};
var verticalSegmentsOnPath = function(p) {
  var asVertical = function(seg) {
    if (seg.direction instanceof V) {
      return new Just({
        start: seg.start,
        end: seg.end
      });
    }
    ;
    if (seg.direction instanceof H) {
      return Nothing.value;
    }
    ;
    throw new Error("Failed pattern match at Markgraf.Compaction.LGraphToCGraphTransformer (line 200, column 20 - line 202, column 19): " + [seg.direction.constructor.name]);
  };
  return mapMaybe(asVertical)(p.segments);
};
var setFacing = function(info) {
  return function(q) {
    if (info.down) {
      return {
        left: q.left,
        right: q.right,
        up: q.up,
        down: true
      };
    }
    ;
    return {
      left: q.left,
      right: q.right,
      down: q.down,
      up: true
    };
  };
};
var portSide = function(dflt) {
  return function(portsMap) {
    return function(node) {
      return function(mPortId) {
        return fromMaybe(dflt)(bind6(mPortId)(function(pid) {
          return bind6(lookup16(node)(portsMap))(function(ports) {
            return bind6(find2(function(pt) {
              return eq9(pt.id)(pid);
            })(ports))(function(p) {
              return new Just(p.side);
            });
          });
        }));
      };
    };
  };
};
var placeMerged = function(allEdges) {
  return function(out) {
    return function(vs) {
      var added = addCNode({
        origin: new Just(new SegmentOrigin(vs)),
        kind: new Just("vs"),
        hitbox: vs.hitbox
      })(out.cGraph);
      var cgWithFlags = setCNodeIgnoreSpacing(added.id)(vs.ignoreSpacing)(added.graph);
      var cg$prime = (function() {
        var v = head(vs.potentialGroupParents);
        if (v instanceof Just) {
          var v1 = lookupCNode(v.value0)(cgWithFlags);
          if (v1 instanceof Just) {
            if (v1.value0.cGroup instanceof Just) {
              return addCNodeToGroup(added.id)(v1.value0.cGroup.value0)(cgWithFlags);
            }
            ;
            if (v1.value0.cGroup instanceof Nothing) {
              return cgWithFlags;
            }
            ;
            throw new Error("Failed pattern match at Markgraf.Compaction.LGraphToCGraphTransformer (line 327, column 24 - line 329, column 33): " + [v1.value0.cGroup.constructor.name]);
          }
          ;
          if (v1 instanceof Nothing) {
            return cgWithFlags;
          }
          ;
          throw new Error("Failed pattern match at Markgraf.Compaction.LGraphToCGraphTransformer (line 326, column 24 - line 330, column 31): " + [v1.constructor.name]);
        }
        ;
        if (v instanceof Nothing) {
          return addCGroup({
            master: new Just(added.id),
            nodes: [added.id]
          })(cgWithFlags).graph;
        }
        ;
        throw new Error("Failed pattern match at Markgraf.Compaction.LGraphToCGraphTransformer (line 325, column 11 - line 331, column 94): " + [v.constructor.name]);
      })();
      return {
        nodeToC: out.nodeToC,
        cGraph: cg$prime,
        edgeToCs: foldl14(function(m) {
          return function(eid) {
            return insertWith7(append14)(eid)([added.id])(m);
          };
        })(out.edgeToCs)(vs.representedEdges),
        lockMap: insert14(added.id)(vsLockFor(allEdges)(vs.representedEdges))(out.lockMap)
      };
    };
  };
};
var nsSide = function(v) {
  if (v instanceof North) {
    return true;
  }
  ;
  if (v instanceof South) {
    return true;
  }
  ;
  return false;
};
var nodeLockFor = function(difference6) {
  if (difference6 < 0) {
    return {
      right: emptyQuadruplet.right,
      up: emptyQuadruplet.up,
      down: emptyQuadruplet.down,
      left: true
    };
  }
  ;
  if (difference6 > 0) {
    return {
      left: emptyQuadruplet.left,
      up: emptyQuadruplet.up,
      down: emptyQuadruplet.down,
      right: true
    };
  }
  ;
  if (otherwise) {
    return emptyQuadruplet;
  }
  ;
  throw new Error("Failed pattern match at Markgraf.Compaction.LGraphToCGraphTransformer (line 128, column 1 - line 128, column 33): " + [difference6.constructor.name]);
};
var movedY = function(y) {
  return function(p) {
    return new Tuple(gridX(p), y);
  };
};
var mkPos = function(x) {
  return function(y) {
    return new Tuple(x, y);
  };
};
var mergeAndPlace = function(allEdges) {
  return function(segments) {
    return function(out) {
      var step2 = function(st) {
        return function(next3) {
          var $105 = intersects(st.survivor)(next3);
          if ($105) {
            return {
              merged: st.merged,
              survivor: joinWith2(st.survivor)(next3)
            };
          }
          ;
          return {
            survivor: next3,
            merged: append14(st.merged)([st.survivor])
          };
        };
      };
      var v = uncons(sortBy(compareVS)(segments));
      if (v instanceof Nothing) {
        return out;
      }
      ;
      if (v instanceof Just) {
        var result = foldl14(step2)({
          survivor: v.value0.head,
          merged: []
        })(v.value0.tail);
        var $$final = append14(result.merged)([result.survivor]);
        return foldl14(placeMerged(allEdges))(out)($$final);
      }
      ;
      throw new Error("Failed pattern match at Markgraf.Compaction.LGraphToCGraphTransformer (line 303, column 39 - line 308, column 43): " + [v.constructor.name]);
    };
  };
};
var initial = function(v) {
  return {
    cGraph: newCGraph(fromFoldable32([UNDEFINED.value, LEFT.value, RIGHT.value])),
    nodeToC: empty2,
    edgeToCs: empty2,
    lockMap: empty2
  };
};
var hitboxFor = function(np) {
  var sf3 = toNumber(scaleFactor2);
  return {
    x: gridX(np.position) * sf3,
    y: gridY(np.position) * sf3,
    width: sizeW(np.size) * sf3,
    height: sizeH(np.size) * sf3
  };
};
var transformNodes = function(degrees) {
  return function(nodes) {
    return function(out) {
      var placeNode = function(acc) {
        return function(np) {
          var added = addCNode({
            origin: new Just(new NodeOrigin(np.node)),
            kind: Nothing.value,
            hitbox: hitboxFor(np)
          })(acc.cGraph);
          var group4 = addCGroup({
            master: new Just(added.id),
            nodes: [added.id]
          })(added.graph);
          var v = fromMaybe(new Tuple(0, 0))(lookup16(np.node)(degrees));
          var lock = nodeLockFor(v.value0 - v.value1 | 0);
          return {
            edgeToCs: acc.edgeToCs,
            cGraph: group4.graph,
            nodeToC: insert15(np.node)(added.id)(acc.nodeToC),
            lockMap: insert14(added.id)(lock)(acc.lockMap)
          };
        };
      };
      return foldl14(placeNode)(out)(nodes);
    };
  };
};
var flagFor = function(hb) {
  return function(bend) {
    return function(q) {
      if (gridY(bend) < hb.y) {
        return {
          left: q.left,
          right: q.right,
          up: q.up,
          down: true
        };
      }
      ;
      if (gridY(bend) > hb.y + hb.height) {
        return {
          left: q.left,
          right: q.right,
          down: q.down,
          up: true
        };
      }
      ;
      if (otherwise) {
        return {
          left: q.left,
          right: q.right,
          up: true,
          down: true
        };
      }
      ;
      throw new Error("Failed pattern match at Markgraf.Compaction.LGraphToCGraphTransformer (line 238, column 1 - line 238, column 55): " + [hb.constructor.name, bend.constructor.name, q.constructor.name]);
    };
  };
};
var emptyIgnore = emptyQuadruplet;
var edgeDegrees = function(edges) {
  var addPair = function(v) {
    return function(v1) {
      return new Tuple(v.value0 + v1.value0 | 0, v.value1 + v1.value1 | 0);
    };
  };
  var tally = function(acc) {
    return function(e) {
      return insertWith1(addPair)(e.to.node)(new Tuple(1, 0))(insertWith1(addPair)(e.from.node)(new Tuple(0, 1))(acc));
    };
  };
  return foldl14(tally)(empty2)(edges);
};
var collectNodeXs = function(cg) {
  var step2 = function(m) {
    return function(n) {
      if (n.origin instanceof Just && n.origin.value0 instanceof NodeOrigin) {
        return insert15(n.origin.value0.value0)(n.hitbox.x)(m);
      }
      ;
      return m;
    };
  };
  return foldl14(step2)(empty2)(allCNodes(cg));
};
var collectNodeDeltas = function(cg) {
  var step2 = function(m) {
    return function(n) {
      if (n.origin instanceof Just && n.origin.value0 instanceof NodeOrigin) {
        return insert15(n.origin.value0.value0)(n.hitbox.x - n.hitboxPreCompaction.x)(m);
      }
      ;
      return m;
    };
  };
  return foldl14(step2)(empty2)(allCNodes(cg));
};
var collectBendDeltas = function(cg) {
  var step2 = function(m) {
    return function(n) {
      if (n.origin instanceof Just && n.origin.value0 instanceof SegmentOrigin) {
        var dx = n.hitbox.x - n.hitboxPreCompaction.x;
        return foldl14(function(acc) {
          return function(b) {
            return insert23(b)(dx)(acc);
          };
        })(m)(n.origin.value0.value0.affectedBends);
      }
      ;
      return m;
    };
  };
  return foldl14(step2)(empty2)(allCNodes(cg));
};
var buildRoutedEdges = function(input) {
  var edgeById = fromFoldable10(mapFlipped9(input.edges)(function(e) {
    return new Tuple(e.id, e);
  }));
  var pair = function(p) {
    return bind6(lookup15(p.edge)(edgeById))(function(e) {
      var v = (function() {
        if (p.reversed) {
          return new Tuple(e.to.node, new Tuple(e.to.port, new Tuple(e.from.node, e.from.port)));
        }
        ;
        return new Tuple(e.from.node, new Tuple(e.from.port, new Tuple(e.to.node, e.to.port)));
      })();
      return new Just({
        edgeId: p.edge,
        src: v.value0,
        tgt: v.value1.value1.value0,
        srcSide: portSide(East.value)(input.ports)(v.value0)(v.value1.value0),
        tgtSide: portSide(West.value)(input.ports)(v.value1.value1.value0)(v.value1.value1.value1),
        path: p
      });
    });
  };
  return mapMaybe(pair)(input.paths);
};
var buildHooks = function(out) {
  return function(routedEdges) {
    var vsLNodePair = function(a) {
      return function(b) {
        if (a.origin instanceof Just && (a.origin.value0 instanceof SegmentOrigin && (b.origin instanceof Just && b.origin.value0 instanceof NodeOrigin))) {
          return true;
        }
        ;
        if (a.origin instanceof Just && (a.origin.value0 instanceof NodeOrigin && (b.origin instanceof Just && b.origin.value0 instanceof SegmentOrigin))) {
          return true;
        }
        ;
        return false;
      };
    };
    var sameEdgeVerticalSegments = function(a) {
      return function(b) {
        if (a.origin instanceof Just && (a.origin.value0 instanceof SegmentOrigin && (b.origin instanceof Just && b.origin.value0 instanceof SegmentOrigin))) {
          return any2(function(e) {
            return elem5(e)(b.origin.value0.value0.representedEdges);
          })(a.origin.value0.value0.representedEdges);
        }
        ;
        return false;
      };
    };
    var edgesForLEdge = function(re) {
      if (eq16(re.src)(re.tgt)) {
        return [];
      }
      ;
      if (nsSide(re.srcSide) && nsSide(re.tgtSide)) {
        return [];
      }
      ;
      if (otherwise) {
        var mTgtN = lookup16(re.tgt)(out.nodeToC);
        var mTgtCN = bind6(mTgtN)(function(nid) {
          return lookupCNode(nid)(out.cGraph);
        });
        var mSrcN = lookup16(re.src)(out.nodeToC);
        var mSrcCN = bind6(mSrcN)(function(nid) {
          return lookupCNode(nid)(out.cGraph);
        });
        var mainEdge = bind6(mSrcCN)(function(srcCN) {
          return bind6(mTgtCN)(function(tgtCN) {
            return bind6(srcCN.cGroup)(function(sg) {
              return bind6(tgtCN.cGroup)(function(tg) {
                return new Just({
                  srcGroup: sg,
                  tgtGroup: tg,
                  delta: 0,
                  weight: edgeWeight
                });
              });
            });
          });
        });
        var invertedEdge = function(pred2) {
          return function(mk) {
            return function(vsCN) {
              return bind6(mSrcCN)(function(srcCN) {
                return bind6(srcCN.cGroup)(function(sg) {
                  return bind6(vsCN.cGroup)(function(vsg) {
                    return bind6((function() {
                      var $156 = pred2(vsCN.hitbox.x) && vsg !== sg;
                      if ($156) {
                        return new Just(unit);
                      }
                      ;
                      return Nothing.value;
                    })())(function() {
                      return new Just(mk(vsg)(sg));
                    });
                  });
                });
              });
            };
          };
        };
        var edgeVSCNodes = mapMaybe(function(nid) {
          return lookupCNode(nid)(out.cGraph);
        })(fromMaybe([])(lookup15(re.edgeId)(out.edgeToCs)));
        var invertedSourceEdges = (function() {
          if (mSrcCN instanceof Just && re.srcSide instanceof West) {
            var toSrc = function(vsGroup) {
              return function(sg) {
                return {
                  srcGroup: vsGroup,
                  tgtGroup: sg,
                  delta: 1,
                  weight: edgeWeight
                };
              };
            };
            return mapMaybe(invertedEdge(function(vsX) {
              return vsX < mSrcCN.value0.hitbox.x;
            })(toSrc))(edgeVSCNodes);
          }
          ;
          return [];
        })();
        var invertedTargetEdges = (function() {
          if (mSrcCN instanceof Just && re.tgtSide instanceof East) {
            var fromSrc = function(vsGroup) {
              return function(sg) {
                return {
                  srcGroup: sg,
                  tgtGroup: vsGroup,
                  delta: 1,
                  weight: edgeWeight
                };
              };
            };
            return mapMaybe(invertedEdge(function(vsX) {
              return vsX > mSrcCN.value0.hitbox.x;
            })(fromSrc))(edgeVSCNodes);
          }
          ;
          return [];
        })();
        if (mainEdge instanceof Nothing) {
          return [];
        }
        ;
        if (mainEdge instanceof Just) {
          return append14([mainEdge.value0])(append14(invertedSourceEdges)(invertedTargetEdges));
        }
        ;
        throw new Error("Failed pattern match at Markgraf.Compaction.LGraphToCGraphTransformer (line 436, column 9 - line 438, column 78): " + [mainEdge.constructor.name]);
      }
      ;
      throw new Error("Failed pattern match at Markgraf.Compaction.LGraphToCGraphTransformer (line 431, column 3 - line 431, column 49): " + [re.constructor.name]);
    };
    var extraEdges = bind12(routedEdges)(edgesForLEdge);
    return {
      sameEdgeVerticalSegments,
      vsLNodePair,
      edgeLengthEdges: function(v) {
        return extraEdges;
      }
    };
  };
};
var applyLayout = function(cg) {
  return function(input) {
    var shiftX = function(dx) {
      return function(p) {
        return mkPos(gridX(p) + dx)(gridY(p));
      };
    };
    var sf3 = toNumber(scaleFactor2);
    var nodeXs = collectNodeXs(cg);
    var nodeDeltas = collectNodeDeltas(cg);
    var edgeEndpoints = fromFoldable10(mapFlipped9(input.edges)(function(e) {
      return new Tuple(e.id, new Tuple(e.from.node, e.to.node));
    }));
    var bendsFromSegments = function(segs) {
      return zipWith(function(s) {
        return function(v) {
          return s.end;
        };
      })(segs)(drop(1)(segs));
    };
    var bendDeltas = collectBendDeltas(cg);
    var bendDx = function(p) {
      return fromMaybe(0)(lookup24(p)(bendDeltas));
    };
    var shiftOne = function(firstDx) {
      return function(lastDx) {
        return function(n) {
          return function(i) {
            return function(seg) {
              if (seg.direction instanceof V) {
                var dx = (function() {
                  if (i === 0) {
                    return firstDx;
                  }
                  ;
                  if (i === (n - 1 | 0)) {
                    return lastDx;
                  }
                  ;
                  if (otherwise) {
                    return bendDx(seg.start);
                  }
                  ;
                  throw new Error("Failed pattern match at Markgraf.Compaction.LGraphToCGraphTransformer (line 540, column 9 - line 543, column 41): ");
                })();
                return {
                  direction: seg.direction,
                  start: shiftX(dx)(seg.start),
                  end: shiftX(dx)(seg.end)
                };
              }
              ;
              if (seg.direction instanceof H) {
                var ds = (function() {
                  if (i === 0) {
                    return firstDx;
                  }
                  ;
                  if (otherwise) {
                    return bendDx(seg.start);
                  }
                  ;
                  throw new Error("Failed pattern match at Markgraf.Compaction.LGraphToCGraphTransformer (line 547, column 9 - line 549, column 41): ");
                })();
                var de = (function() {
                  if (i === (n - 1 | 0)) {
                    return lastDx;
                  }
                  ;
                  if (otherwise) {
                    return bendDx(seg.end);
                  }
                  ;
                  throw new Error("Failed pattern match at Markgraf.Compaction.LGraphToCGraphTransformer (line 550, column 9 - line 552, column 39): ");
                })();
                return {
                  direction: seg.direction,
                  start: shiftX(ds)(seg.start),
                  end: shiftX(de)(seg.end)
                };
              }
              ;
              throw new Error("Failed pattern match at Markgraf.Compaction.LGraphToCGraphTransformer (line 537, column 37 - line 553, column 67): " + [seg.direction.constructor.name]);
            };
          };
        };
      };
    };
    var shiftSegments = function(reversed) {
      return function(eid) {
        return function(segments) {
          var v = lookup15(eid)(edgeEndpoints);
          if (v instanceof Nothing) {
            return segments;
          }
          ;
          if (v instanceof Just) {
            var srcD = fromMaybe(0)(lookup16(v.value0.value0)(nodeDeltas));
            var tgtD = fromMaybe(0)(lookup16(v.value0.value1)(nodeDeltas));
            var firstDx = (function() {
              if (reversed) {
                return tgtD;
              }
              ;
              return srcD;
            })();
            var lastDx = (function() {
              if (reversed) {
                return srcD;
              }
              ;
              return tgtD;
            })();
            var n = length(segments);
            return mapWithIndex2(shiftOne(firstDx)(lastDx)(n))(segments);
          }
          ;
          throw new Error("Failed pattern match at Markgraf.Compaction.LGraphToCGraphTransformer (line 527, column 41 - line 535, column 58): " + [v.constructor.name]);
        };
      };
    };
    var shiftPath = function(ep) {
      var segments$prime = shiftSegments(ep.reversed)(ep.edge)(ep.segments);
      return {
        edge: ep.edge,
        reversed: ep.reversed,
        bendType: ep.bendType,
        jumps: ep.jumps,
        segments: segments$prime,
        bends: bendsFromSegments(segments$prime)
      };
    };
    return {
      nodes: mapFlipped9(input.nodes)(function(np) {
        var v = lookup16(np.node)(nodeXs);
        if (v instanceof Just) {
          return {
            layer: np.layer,
            node: np.node,
            order: np.order,
            size: np.size,
            position: mkPos(v.value0 / sf3)(gridY(np.position))
          };
        }
        ;
        if (v instanceof Nothing) {
          return np;
        }
        ;
        throw new Error("Failed pattern match at Markgraf.Compaction.LGraphToCGraphTransformer (line 502, column 7 - line 504, column 22): " + [v.constructor.name]);
      }),
      edges: mapFlipped9(input.paths)(shiftPath)
    };
  };
};
var applyLastRegularFlags = function(v) {
  return function(v1) {
    return function(v2) {
      if (v1 instanceof Nothing) {
        return v;
      }
      ;
      if (v1 instanceof Just) {
        return {
          id: v.id,
          representedEdges: v.representedEdges,
          affectedBends: v.affectedBends,
          hitbox: v.hitbox,
          potentialGroupParents: v.potentialGroupParents,
          aPort: v.aPort,
          ignoreSpacing: flagFor(v1.value0)(v2)(v.ignoreSpacing)
        };
      }
      ;
      throw new Error("Failed pattern match at Markgraf.Compaction.LGraphToCGraphTransformer (line 234, column 1 - line 234, column 85): " + [v.constructor.name, v1.constructor.name, v2.constructor.name]);
    };
  };
};
var applyFirstRegularFlags = function(v) {
  return function(v1) {
    return function(v2) {
      if (v1 instanceof Nothing) {
        return v;
      }
      ;
      if (v1 instanceof Just) {
        return {
          id: v.id,
          representedEdges: v.representedEdges,
          affectedBends: v.affectedBends,
          hitbox: v.hitbox,
          potentialGroupParents: v.potentialGroupParents,
          aPort: v.aPort,
          ignoreSpacing: flagFor(v1.value0)(v2)(v.ignoreSpacing)
        };
      }
      ;
      throw new Error("Failed pattern match at Markgraf.Compaction.LGraphToCGraphTransformer (line 228, column 1 - line 228, column 86): " + [v.constructor.name, v1.constructor.name, v2.constructor.name]);
    };
  };
};
var placeSeg = function(e) {
  return function(mSrcHB) {
    return function(mTgtHB) {
      return function(lastIdx) {
        return function(s) {
          return function(v) {
            var isFirst = v.value0 === 0;
            var isLast = v.value0 === lastIdx;
            var vs0 = newVerticalSegment(s.nextId)(v.value1.start)(v.value1.end)(Nothing.value)(e.edgeId);
            var vs1 = (function() {
              if (isFirst) {
                return applyFirstRegularFlags(vs0)(mSrcHB)(v.value1.end);
              }
              ;
              return vs0;
            })();
            var vs2 = (function() {
              if (isLast) {
                return applyLastRegularFlags(vs1)(mTgtHB)(v.value1.start);
              }
              ;
              return vs1;
            })();
            return {
              nextId: s.nextId + 1 | 0,
              segments: append14(s.segments)([vs2])
            };
          };
        };
      };
    };
  };
};
var anchorY = function(hb) {
  return function(info) {
    if (info.down) {
      return hb.y;
    }
    ;
    return hb.y + hb.height;
  };
};
var appendSourceNS = function(e) {
  return function(nid) {
    return function(hb) {
      return function(firstSeg) {
        return function(info) {
          return function(s) {
            var anchor = anchorY(hb)(info);
            var vs = (function() {
              var v = newVerticalSegment(s.nextId)(firstSeg.start)(movedY(anchor)(firstSeg.start))(new Just(nid))(e.edgeId);
              return {
                affectedBends: v.affectedBends,
                hitbox: v.hitbox,
                id: v.id,
                potentialGroupParents: v.potentialGroupParents,
                representedEdges: v.representedEdges,
                aPort: new Just({
                  node: e.src,
                  side: info.side
                }),
                ignoreSpacing: setFacing(info)(emptyIgnore)
              };
            })();
            return {
              nextId: s.nextId + 1 | 0,
              segments: append14(s.segments)([vs])
            };
          };
        };
      };
    };
  };
};
var appendTargetNS = function(e) {
  return function(nid) {
    return function(hb) {
      return function(lastSeg) {
        return function(info) {
          return function(s) {
            var anchor = anchorY(hb)(info);
            var vs = (function() {
              var v = newVerticalSegment(s.nextId)(lastSeg.end)(movedY(anchor)(lastSeg.end))(new Just(nid))(e.edgeId);
              return {
                affectedBends: v.affectedBends,
                hitbox: v.hitbox,
                id: v.id,
                potentialGroupParents: v.potentialGroupParents,
                representedEdges: v.representedEdges,
                aPort: new Just({
                  node: e.tgt,
                  side: info.side
                }),
                ignoreSpacing: setFacing(info)(emptyIgnore)
              };
            })();
            return {
              nextId: s.nextId + 1 | 0,
              segments: append14(s.segments)([vs])
            };
          };
        };
      };
    };
  };
};
var collectForEdge = function(v) {
  return function(v1) {
    return function(v2) {
      if (eq16(v2.src)(v2.tgt)) {
        return v1;
      }
      ;
      var mSrcId = lookup16(v2.src)(v.nodeToC);
      var mTgtId = lookup16(v2.tgt)(v.nodeToC);
      var mSrcHB = bind6(mSrcId)(function(nid) {
        return mapFlipped12(lookupCNode(nid)(v.cGraph))(function(v3) {
          return v3.hitbox;
        });
      });
      var mTgtHB = bind6(mTgtId)(function(nid) {
        return mapFlipped12(lookupCNode(nid)(v.cGraph))(function(v3) {
          return v3.hitbox;
        });
      });
      var verticals = verticalSegmentsOnPath(v2.path);
      var lastIdx = length(verticals) - 1 | 0;
      var placed = foldl14(placeSeg(v2)(mSrcHB)(mTgtHB)(lastIdx))(v1)(mapWithIndex2(function(i) {
        return function(seg) {
          return new Tuple(i, seg);
        };
      })(verticals));
      var afterSrcNS = (function() {
        var v52 = head(verticals);
        if (v2.srcSide instanceof North && (v52 instanceof Just && (mSrcId instanceof Just && mSrcHB instanceof Just))) {
          return appendSourceNS(v2)(mSrcId.value0)(mSrcHB.value0)(v52.value0)({
            side: North.value,
            down: true
          })(placed);
        }
        ;
        if (v2.srcSide instanceof South && (v52 instanceof Just && (mSrcId instanceof Just && mSrcHB instanceof Just))) {
          return appendSourceNS(v2)(mSrcId.value0)(mSrcHB.value0)(v52.value0)({
            side: South.value,
            down: false
          })(placed);
        }
        ;
        return placed;
      })();
      var v5 = last(verticals);
      if (v2.tgtSide instanceof North && (v5 instanceof Just && (mTgtId instanceof Just && mTgtHB instanceof Just))) {
        return appendTargetNS(v2)(mTgtId.value0)(mTgtHB.value0)(v5.value0)({
          side: North.value,
          down: true
        })(afterSrcNS);
      }
      ;
      if (v2.tgtSide instanceof South && (v5 instanceof Just && (mTgtId instanceof Just && mTgtHB instanceof Just))) {
        return appendTargetNS(v2)(mTgtId.value0)(mTgtHB.value0)(v5.value0)({
          side: South.value,
          down: false
        })(afterSrcNS);
      }
      ;
      return afterSrcNS;
    };
  };
};
var collectSegments = function(edges) {
  return function(out) {
    return (function(v) {
      return v.segments;
    })(foldl14(collectForEdge(out))({
      nextId: 0,
      segments: []
    })(edges));
  };
};
var transformEdges = function(allEdges) {
  return function(routed) {
    return function(out) {
      return mergeAndPlace(allEdges)(collectSegments(routed)(out))(out);
    };
  };
};
var transform = function(input) {
  var degrees = edgeDegrees(input.edges);
  var withNodes = transformNodes(degrees)(input.nodes)(initial(input));
  var routed = buildRoutedEdges(input);
  return transformEdges(input.edges)(routed)(withNodes);
};

// ../markgraf/output/Markgraf.Compaction.HorizontalGraphCompactor/index.js
var mapFlipped10 = /* @__PURE__ */ mapFlipped(functorArray);
var eq10 = /* @__PURE__ */ eq(/* @__PURE__ */ eqMaybe(eqString));
var NodeNode = /* @__PURE__ */ (function() {
  function NodeNode2() {
  }
  ;
  NodeNode2.value = new NodeNode2();
  return NodeNode2;
})();
var EdgeNode = /* @__PURE__ */ (function() {
  function EdgeNode2() {
  }
  ;
  EdgeNode2.value = new EdgeNode2();
  return EdgeNode2;
})();
var EdgeEdge = /* @__PURE__ */ (function() {
  function EdgeEdge2() {
  }
  ;
  EdgeEdge2.value = new EdgeEdge2();
  return EdgeEdge2;
})();
var EdgeLength = /* @__PURE__ */ (function() {
  function EdgeLength2() {
  }
  ;
  EdgeLength2.value = new EdgeLength2();
  return EdgeLength2;
})();
var swapSize = function(g) {
  return new Tuple(sizeH(g), sizeW(g));
};
var swapPos = function(g) {
  return new Tuple(gridY(g), gridX(g));
};
var swapNode = function(np) {
  return {
    node: np.node,
    layer: np.layer,
    order: np.order,
    position: swapPos(np.position),
    size: swapSize(np.size)
  };
};
var swapDir = function(v) {
  if (v instanceof H) {
    return V.value;
  }
  ;
  if (v instanceof V) {
    return H.value;
  }
  ;
  throw new Error("Failed pattern match at Markgraf.Compaction.HorizontalGraphCompactor (line 220, column 1 - line 220, column 38): " + [v.constructor.name]);
};
var swapSegment = function(s) {
  return {
    start: swapPos(s.start),
    end: swapPos(s.end),
    direction: swapDir(s.direction)
  };
};
var swapPath = function(p) {
  return {
    edge: p.edge,
    bendType: p.bendType,
    jumps: p.jumps,
    reversed: p.reversed,
    segments: mapFlipped10(p.segments)(swapSegment),
    bends: mapFlipped10(p.bends)(swapPos)
  };
};
var swapInput = function(i) {
  return {
    nodes: mapFlipped10(i.nodes)(swapNode),
    edges: i.edges,
    paths: mapFlipped10(i.paths)(swapPath),
    ports: i.ports
  };
};
var swapOutput = function(o) {
  return {
    nodes: mapFlipped10(o.nodes)(swapNode),
    edges: mapFlipped10(o.edges)(swapPath)
  };
};
var spacingFor = function(spacings) {
  return function(v) {
    if (v instanceof NodeNode) {
      return spacings.nodeNode;
    }
    ;
    if (v instanceof EdgeNode) {
      return spacings.edgeNode;
    }
    ;
    if (v instanceof EdgeEdge) {
      return spacings.edgeEdge;
    }
    ;
    throw new Error("Failed pattern match at Markgraf.Compaction.HorizontalGraphCompactor (line 178, column 23 - line 181, column 32): " + [v.constructor.name]);
  };
};
var defaultBetweenLayersSpacings = {
  nodeNode: 8,
  edgeNode: 4,
  edgeEdge: 10
};
var classify = function(a) {
  return function(b) {
    var isVS2 = function(n) {
      return eq10(n.kind)(new Just("vs"));
    };
    var v = isVS2(b);
    var v1 = isVS2(a);
    if (v1 && v) {
      return EdgeEdge.value;
    }
    ;
    if (v1 && !v) {
      return EdgeNode.value;
    }
    ;
    if (!v1 && v) {
      return EdgeNode.value;
    }
    ;
    if (!v1 && !v) {
      return NodeNode.value;
    }
    ;
    throw new Error("Failed pattern match at Markgraf.Compaction.HorizontalGraphCompactor (line 166, column 16 - line 170, column 27): " + [v1.constructor.name, v.constructor.name]);
  };
};
var specialSpacings = function(spacings) {
  return function(hooks) {
    var pairSpacing = function(a) {
      return function(b) {
        return spacingFor(spacings)(classify(a)(b));
      };
    };
    var horizontalSpacing = function(a) {
      return function(b) {
        if (hooks.sameEdgeVerticalSegments(a)(b)) {
          return 0;
        }
        ;
        if (a.ignoreSpacing.right || b.ignoreSpacing.left) {
          return 0;
        }
        ;
        if (otherwise) {
          return pairSpacing(a)(b);
        }
        ;
        throw new Error("Failed pattern match at Markgraf.Compaction.HorizontalGraphCompactor (line 146, column 3 - line 149, column 34): " + [a.constructor.name, b.constructor.name]);
      };
    };
    var facingVerticalIgnored = function(a) {
      return function(b) {
        if (a.hitbox.y <= b.hitbox.y) {
          return a.ignoreSpacing.down || b.ignoreSpacing.up;
        }
        ;
        if (otherwise) {
          return a.ignoreSpacing.up || b.ignoreSpacing.down;
        }
        ;
        throw new Error("Failed pattern match at Markgraf.Compaction.HorizontalGraphCompactor (line 156, column 3 - line 158, column 61): " + [a.constructor.name, b.constructor.name]);
      };
    };
    var verticalSpacing = function(a) {
      return function(b) {
        if (hooks.sameEdgeVerticalSegments(a)(b)) {
          return 1;
        }
        ;
        if (facingVerticalIgnored(a)(b)) {
          return 0;
        }
        ;
        if (otherwise) {
          return pairSpacing(a)(b);
        }
        ;
        throw new Error("Failed pattern match at Markgraf.Compaction.HorizontalGraphCompactor (line 151, column 3 - line 154, column 34): " + [a.constructor.name, b.constructor.name]);
      };
    };
    return {
      horizontalSpacing,
      verticalSpacing
    };
  };
};
var algorithmFor = function(v) {
  return function(hooks) {
    return networkSimplexCompaction(hooks);
  };
};
var compactPostRouting = function(strategy) {
  return function(spacings) {
    return function(input) {
      var swapped = swapInput(input);
      var out = transform(swapped);
      var routed = buildRoutedEdges(swapped);
      var hooks = buildHooks(out)(routed);
      var state0 = setCompactionAlgorithm(algorithmFor(strategy)(hooks))(setConstraintAlgorithm(edgeAwareScanlineConstraints(spacings.edgeEdge))(setSpacingsHandler(specialSpacings(spacings)(hooks))(newOneD(out.cGraph))));
      var compacted = finish(compact(state0)).cGraph;
      var applied = applyLayout(compacted)({
        nodes: swapped.nodes,
        edges: swapped.edges,
        paths: swapped.paths
      });
      return swapOutput(applied);
    };
  };
};

// ../markgraf/output/Markgraf.EdgeRouting.LineJump/index.js
var min8 = /* @__PURE__ */ min(ordNumber);
var max11 = /* @__PURE__ */ max(ordNumber);
var bind7 = /* @__PURE__ */ bind(bindArray);
var eq11 = /* @__PURE__ */ eq(eqDirection);
var notEq12 = /* @__PURE__ */ notEq(eqEdgeId);
var append15 = /* @__PURE__ */ append(semigroupArray);
var mid = function(a) {
  return function(b) {
    return (a + b) / 2;
  };
};
var findVOverlap = function(seg) {
  return function(other) {
    return function(crossingEdge) {
      if (gridX(seg.start) !== gridX(other.start)) {
        return Nothing.value;
      }
      ;
      if (otherwise) {
        var segMinY = min8(gridY(seg.start))(gridY(seg.end));
        var segMaxY = max11(gridY(seg.start))(gridY(seg.end));
        var otherMinY = min8(gridY(other.start))(gridY(other.end));
        var otherMaxY = max11(gridY(other.start))(gridY(other.end));
        var overlapStart = max11(segMinY)(otherMinY);
        var overlapEnd = min8(segMaxY)(otherMaxY);
        var $17 = overlapStart < overlapEnd;
        if ($17) {
          return new Just({
            position: new Tuple(gridX(seg.start), mid(overlapStart)(overlapEnd)),
            crossingEdge
          });
        }
        ;
        return Nothing.value;
      }
      ;
      throw new Error("Failed pattern match at Markgraf.EdgeRouting.LineJump (line 72, column 1 - line 72, column 71): " + [seg.constructor.name, other.constructor.name, crossingEdge.constructor.name]);
    };
  };
};
var findHOverlap = function(seg) {
  return function(other) {
    return function(crossingEdge) {
      if (gridY(seg.start) !== gridY(other.start)) {
        return Nothing.value;
      }
      ;
      if (otherwise) {
        var segMinX = min8(gridX(seg.start))(gridX(seg.end));
        var segMaxX = max11(gridX(seg.start))(gridX(seg.end));
        var otherMinX = min8(gridX(other.start))(gridX(other.end));
        var otherMaxX = max11(gridX(other.start))(gridX(other.end));
        var overlapStart = max11(segMinX)(otherMinX);
        var overlapEnd = min8(segMaxX)(otherMaxX);
        var $21 = overlapStart < overlapEnd;
        if ($21) {
          return new Just({
            position: new Tuple(mid(overlapStart)(overlapEnd), gridY(seg.start)),
            crossingEdge
          });
        }
        ;
        return Nothing.value;
      }
      ;
      throw new Error("Failed pattern match at Markgraf.EdgeRouting.LineJump (line 55, column 1 - line 55, column 71): " + [seg.constructor.name, other.constructor.name, crossingEdge.constructor.name]);
    };
  };
};
var findOverlap = function(seg) {
  return function(other) {
    return function(crossingEdge) {
      if (seg.direction instanceof H) {
        return findHOverlap(seg)(other)(crossingEdge);
      }
      ;
      if (seg.direction instanceof V) {
        return findVOverlap(seg)(other)(crossingEdge);
      }
      ;
      throw new Error("Failed pattern match at Markgraf.EdgeRouting.LineJump (line 51, column 38 - line 53, column 43): " + [seg.direction.constructor.name]);
    };
  };
};
var findOverlapJumps = function(pathIdx) {
  return function(path) {
    return function(allPaths) {
      var laterPaths = drop(pathIdx + 1 | 0)(allPaths);
      return bind7(path.segments)(function(seg) {
        return bind7(laterPaths)(function(other) {
          return mapMaybe(function(otherSeg) {
            return findOverlap(seg)(otherSeg)(other.edge);
          })(filter(function(s) {
            return eq11(s.direction)(seg.direction);
          })(other.segments));
        });
      });
    };
  };
};
var findCrossing = function(hSeg) {
  return function(vSeg) {
    return function(crossingEdge) {
      var hY = gridY(hSeg.start);
      var hMinX = min8(gridX(hSeg.start))(gridX(hSeg.end));
      var hMaxX = max11(gridX(hSeg.start))(gridX(hSeg.end));
      var vX = gridX(vSeg.start);
      var vMinY = min8(gridY(vSeg.start))(gridY(vSeg.end));
      var vMaxY = max11(gridY(vSeg.start))(gridY(vSeg.end));
      var $23 = vX > hMinX && (vX < hMaxX && (hY > vMinY && hY < vMaxY));
      if ($23) {
        return new Just({
          position: new Tuple(vX, hY),
          crossingEdge
        });
      }
      ;
      return Nothing.value;
    };
  };
};
var findPerpendicularJumps = function(path) {
  return function(otherPaths) {
    var hSegments = filter(function(s) {
      return eq11(s.direction)(H.value);
    })(path.segments);
    return bind7(hSegments)(function(hSeg) {
      return bind7(otherPaths)(function(other) {
        return mapMaybe(function(vSeg) {
          return findCrossing(hSeg)(vSeg)(other.edge);
        })(filter(function(s) {
          return eq11(s.direction)(V.value);
        })(other.segments));
      });
    });
  };
};
var findJumpsForPath = function(pathIdx) {
  return function(path) {
    return function(allPaths) {
      var otherPaths = filter(function(p) {
        return notEq12(p.edge)(path.edge);
      })(allPaths);
      var perpendicular = findPerpendicularJumps(path)(otherPaths);
      var overlaps2 = findOverlapJumps(pathIdx)(path)(allPaths);
      return append15(perpendicular)(overlaps2);
    };
  };
};
var detectJumps = function(paths) {
  return mapWithIndex2(function(i) {
    return function(path) {
      return {
        bendType: path.bendType,
        bends: path.bends,
        edge: path.edge,
        reversed: path.reversed,
        segments: path.segments,
        jumps: findJumpsForPath(i)(path)(paths)
      };
    };
  })(paths);
};

// ../markgraf/output/Data.Map/index.js
var keys3 = /* @__PURE__ */ (function() {
  var $38 = $$void(functorMap);
  return function($39) {
    return fromMap($38($39));
  };
})();

// ../markgraf/output/Markgraf.Layout.PortDistribution/index.js
var ordTuple3 = /* @__PURE__ */ ordTuple(ordEdgeId)(ordSide);
var lookup17 = /* @__PURE__ */ lookup(ordTuple3);
var fromFoldable11 = /* @__PURE__ */ fromFoldable2(ordNodeId)(foldableArray);
var mapFlipped11 = /* @__PURE__ */ mapFlipped(functorArray);
var lookup18 = /* @__PURE__ */ lookup(ordNodeId);
var compare10 = /* @__PURE__ */ compare(ordInt);
var fromFoldable14 = /* @__PURE__ */ fromFoldable2(ordTuple3)(foldableArray);
var toUnfoldable9 = /* @__PURE__ */ toUnfoldable(unfoldableArray);
var foldl15 = /* @__PURE__ */ foldl(foldableArray);
var eq17 = /* @__PURE__ */ eq(eqNodeId);
var insertWith8 = /* @__PURE__ */ insertWith(ordNodeId);
var append16 = /* @__PURE__ */ append(semigroupArray);
var union5 = /* @__PURE__ */ union(ordTuple3);
var offsetFor = function(offsets) {
  return function(eid) {
    return function(side) {
      return function(fallback) {
        return fromMaybe(fallback)(lookup17(new Tuple(eid, side))(offsets));
      };
    };
  };
};
var distributePorts = function(layers) {
  return function(edges) {
    return function(sizeMap) {
      var ownerOnSide = function(v) {
        return function(v1) {
          if (v instanceof South) {
            return new Just(v1.from.node);
          }
          ;
          if (v instanceof North) {
            return new Just(v1.to.node);
          }
          ;
          return Nothing.value;
        };
      };
      var orderIndex = fromFoldable11(concat(mapFlipped11(layers)(function(layer) {
        return mapWithIndex2(function(i) {
          return function(n) {
            return new Tuple(n, i);
          };
        })(layer);
      })));
      var otherOrder = function(v) {
        return function(v1) {
          if (v instanceof South) {
            return fromMaybe(0)(lookup18(v1.to.node)(orderIndex));
          }
          ;
          if (v instanceof North) {
            return fromMaybe(0)(lookup18(v1.from.node)(orderIndex));
          }
          ;
          return 0;
        };
      };
      var offsetsForNode = function(side) {
        return function(nid) {
          return function(es) {
            var width = (function() {
              var v = lookup18(nid)(sizeMap);
              if (v instanceof Just) {
                return sizeW(v.value0);
              }
              ;
              if (v instanceof Nothing) {
                var $31 = isDummy(nid);
                if ($31) {
                  return 0;
                }
                ;
                return 1;
              }
              ;
              throw new Error("Failed pattern match at Markgraf.Layout.PortDistribution (line 101, column 13 - line 103, column 50): " + [v.constructor.name]);
            })();
            var span3 = {
              lo: 0,
              hi: width
            };
            var sorted = sortBy(function(a) {
              return function(b) {
                return compare10(otherOrder(side)(a))(otherOrder(side)(b));
              };
            })(es);
            var distributed = distributeAlongSide(span3)(mapFlipped11(sorted)(function(v) {
              return v.id;
            }));
            return fromFoldable14(mapFlipped11(toUnfoldable9(distributed))(function(v) {
              return new Tuple(new Tuple(v.value0, side), v.value1);
            }));
          };
        };
      };
      var layerIndex = fromFoldable11(concat(mapWithIndex2(function(i) {
        return function(layer) {
          return mapFlipped11(layer)(function(n) {
            return new Tuple(n, i);
          });
        };
      })(layers)));
      var groupOnSide = function(side) {
        return foldl15(function(m) {
          return function(e) {
            var $35 = eq17(e.from.node)(e.to.node);
            if ($35) {
              return m;
            }
            ;
            var v = ownerOnSide(side)(e);
            if (v instanceof Just) {
              return insertWith8(append16)(v.value0)([e])(m);
            }
            ;
            if (v instanceof Nothing) {
              return m;
            }
            ;
            throw new Error("Failed pattern match at Markgraf.Layout.PortDistribution (line 71, column 14 - line 73, column 23): " + [v.constructor.name]);
          };
        })(empty2)(edges);
      };
      var perSideMap = function(side) {
        return foldl15(function(acc) {
          return function(v) {
            return union5(offsetsForNode(side)(v.value0)(v.value1))(acc);
          };
        })(empty2)(toUnfoldable9(groupOnSide(side)));
      };
      return union5(perSideMap(North.value))(perSideMap(South.value));
    };
  };
};

// ../markgraf/output/Markgraf.Layout.CoordAssignment/index.js
var foldl16 = /* @__PURE__ */ foldl(foldableArray);
var insertWith9 = /* @__PURE__ */ insertWith(ordNodeId);
var add5 = /* @__PURE__ */ add(semiringInt);
var fromFoldable15 = /* @__PURE__ */ fromFoldable3(foldableArray)(ordNodeId);
var append17 = /* @__PURE__ */ append(semigroupArray);
var map14 = /* @__PURE__ */ map(functorArray);
var fromFoldable16 = /* @__PURE__ */ fromFoldable(foldableList);
var toUnfoldable10 = /* @__PURE__ */ toUnfoldable3(unfoldableArray);
var lookup19 = /* @__PURE__ */ lookup(ordNodeId);
var min9 = /* @__PURE__ */ min(ordNumber);
var max13 = /* @__PURE__ */ max(ordNumber);
var insert16 = /* @__PURE__ */ insert(ordNodeId);
var map15 = /* @__PURE__ */ map(functorMap);
var foldl17 = /* @__PURE__ */ foldl(foldableList);
var eq23 = /* @__PURE__ */ eq(eqNodeId);
var bind8 = /* @__PURE__ */ bind(bindMaybe);
var eq33 = /* @__PURE__ */ eq(eqPortId);
var fromFoldable23 = /* @__PURE__ */ fromFoldable2(ordNodeId)(foldableArray);
var elem6 = /* @__PURE__ */ elem2(eqNodeId);
var alter2 = /* @__PURE__ */ alter(ordNodeId);
var nub3 = /* @__PURE__ */ nub(ordNodeId);
var mapFlipped13 = /* @__PURE__ */ mapFlipped(functorArray);
var notEq6 = /* @__PURE__ */ notEq(eqNodeId);
var join2 = /* @__PURE__ */ join(bindMaybe);
var toUnfoldable1 = /* @__PURE__ */ toUnfoldable(unfoldableArray);
var div1 = /* @__PURE__ */ div(euclideanRingInt);
var mapMaybeWithKey2 = /* @__PURE__ */ mapMaybeWithKey(ordNodeId);
var max14 = /* @__PURE__ */ max(ordInt);
var lookup110 = /* @__PURE__ */ lookup(ordInt);
var compare11 = /* @__PURE__ */ compare(ordNumber);
var mapFlipped14 = /* @__PURE__ */ mapFlipped(functorMaybe);
var compare16 = /* @__PURE__ */ compare(ordInt);
var mod3 = /* @__PURE__ */ mod(euclideanRingInt);
var fromFoldable33 = /* @__PURE__ */ fromFoldable(foldableSet);
var sort3 = /* @__PURE__ */ sort(ordNumber);
var union6 = /* @__PURE__ */ union(ordNodeId);
var VDown = /* @__PURE__ */ (function() {
  function VDown2() {
  }
  ;
  VDown2.value = new VDown2();
  return VDown2;
})();
var VUp = /* @__PURE__ */ (function() {
  function VUp2() {
  }
  ;
  VUp2.value = new VUp2();
  return VUp2;
})();
var ForwardPhase = /* @__PURE__ */ (function() {
  function ForwardPhase2() {
  }
  ;
  ForwardPhase2.value = new ForwardPhase2();
  return ForwardPhase2;
})();
var StackPhase = /* @__PURE__ */ (function() {
  function StackPhase2() {
  }
  ;
  StackPhase2.value = new StackPhase2();
  return StackPhase2;
})();
var HRight = /* @__PURE__ */ (function() {
  function HRight2() {
  }
  ;
  HRight2.value = new HRight2();
  return HRight2;
})();
var HLeft = /* @__PURE__ */ (function() {
  function HLeft2() {
  }
  ;
  HLeft2.value = new HLeft2();
  return HLeft2;
})();
var ordMarkedEdge = ordString;
var insert17 = /* @__PURE__ */ insert2(ordMarkedEdge);
var member5 = /* @__PURE__ */ member2(ordMarkedEdge);
var sf2 = 4;
var placeClasses = function(classEdges) {
  return function(sinkMap) {
    return function(vdir) {
      var indegMap = foldl16(function(m) {
        return function(e) {
          return insertWith9(add5)(e.tgt)(1)(m);
        };
      })(empty2)(classEdges);
      var allSinks = fromFoldable15(append17(map14(function(v) {
        return v.src;
      })(classEdges))(append17(map14(function(v) {
        return v.tgt;
      })(classEdges))(fromFoldable16(values(sinkMap)))));
      var allSinkArr = toUnfoldable10(allSinks);
      var initialSinks = filter(function(s) {
        return fromMaybe(0)(lookup19(s)(indegMap)) === 0;
      })(allSinkArr);
      var adjMap = foldl16(function(m) {
        return function(e) {
          return insertWith9(append17)(e.src)([{
            target: e.tgt,
            sep: e.sep
          }])(m);
        };
      })(empty2)(classEdges);
      var propagate = function($copy_queue) {
        return function($copy_indeg) {
          return function($copy_result) {
            var $tco_var_queue = $copy_queue;
            var $tco_var_indeg = $copy_indeg;
            var $tco_done = false;
            var $tco_result;
            function $tco_loop(queue, indeg, result) {
              var v = uncons(queue);
              if (v instanceof Nothing) {
                $tco_done = true;
                return result;
              }
              ;
              if (v instanceof Just) {
                var nShift = fromMaybe(0)(lookup19(v.value0.head)(result));
                var outEdges = fromMaybe([])(lookup19(v.value0.head)(adjMap));
                var v1 = foldl16(function(acc) {
                  return function(e) {
                    var tgtShift = lookup19(e.target)(acc.result);
                    var proposed = nShift + e.sep;
                    var newShift = (function() {
                      if (tgtShift instanceof Nothing) {
                        return proposed;
                      }
                      ;
                      if (tgtShift instanceof Just) {
                        if (vdir instanceof VDown) {
                          return min9(tgtShift.value0)(proposed);
                        }
                        ;
                        if (vdir instanceof VUp) {
                          return max13(tgtShift.value0)(proposed);
                        }
                        ;
                        throw new Error("Failed pattern match at Markgraf.Layout.CoordAssignment (line 1354, column 31 - line 1356, column 44): " + [vdir.constructor.name]);
                      }
                      ;
                      throw new Error("Failed pattern match at Markgraf.Layout.CoordAssignment (line 1352, column 28 - line 1356, column 44): " + [tgtShift.constructor.name]);
                    })();
                    var newIndeg = fromMaybe(0)(lookup19(e.target)(acc.indeg)) - 1 | 0;
                    var indeg$prime$prime = insert16(e.target)(newIndeg)(acc.indeg);
                    var q = (function() {
                      var $184 = newIndeg === 0;
                      if ($184) {
                        return append17(acc.newQueue)([e.target]);
                      }
                      ;
                      return acc.newQueue;
                    })();
                    return {
                      newQueue: q,
                      result: insert16(e.target)(newShift)(acc.result),
                      indeg: indeg$prime$prime
                    };
                  };
                })({
                  newQueue: [],
                  result,
                  indeg
                })(outEdges);
                $tco_var_queue = append17(v.value0.tail)(v1.newQueue);
                $tco_var_indeg = v1.indeg;
                $copy_result = v1.result;
                return;
              }
              ;
              throw new Error("Failed pattern match at Markgraf.Layout.CoordAssignment (line 1341, column 34 - line 1364, column 50): " + [v.constructor.name]);
            }
            ;
            while (!$tco_done) {
              $tco_result = $tco_loop($tco_var_queue, $tco_var_indeg, $copy_result);
            }
            ;
            return $tco_result;
          };
        };
      };
      var shifts = propagate(initialSinks)(indegMap)(foldl16(function(m) {
        return function(s) {
          return insert16(s)(0)(m);
        };
      })(empty2)(allSinkArr));
      return shifts;
    };
  };
};
var normalizeLayout = function(m) {
  var vals = fromFoldable16(values(m));
  var minX = foldl16(min9)(999999)(vals);
  var $192 = minX === 0 || length(vals) === 0;
  if ($192) {
    return m;
  }
  ;
  return map15(function(x) {
    return x - minX;
  })(m);
};
var layoutSize = function(m) {
  var vals = values(m);
  var mn = foldl17(min9)(999999)(vals);
  var mx = foldl17(max13)(-999999)(vals);
  return mx - mn;
};
var getBlockRing = function(aligned) {
  return function(rootId) {
    var go = function($copy_current) {
      return function($copy_acc) {
        var $tco_var_current = $copy_current;
        var $tco_done = false;
        var $tco_result;
        function $tco_loop(current, acc) {
          if (eq23(current)(rootId)) {
            $tco_done = true;
            return acc;
          }
          ;
          if (otherwise) {
            $tco_var_current = fromMaybe(rootId)(lookup19(current)(aligned.align));
            $copy_acc = append17(acc)([current]);
            return;
          }
          ;
          throw new Error("Failed pattern match at Markgraf.Layout.CoordAssignment (line 1203, column 3 - line 1205, column 94): " + [current.constructor.name, acc.constructor.name]);
        }
        ;
        while (!$tco_done) {
          $tco_result = $tco_loop($tco_var_current, $copy_acc);
        }
        ;
        return $tco_result;
      };
    };
    return go(fromMaybe(rootId)(lookup19(rootId)(aligned.align)))([rootId]);
  };
};
var horizontalCompactionDiag = function(cfg) {
  return function(ni) {
    return function(layers) {
      return function(sizeMap) {
        return function(portMap) {
          return function(edges) {
            return function(portOffsets) {
              return function(innerShift) {
                return function(aligned) {
                  return function(vdir) {
                    return function(hdir) {
                      var thresholdPortOffsetX = function(e) {
                        return function(node) {
                          return function(side) {
                            var width = sizeW(fromMaybe(new Tuple(1, 1))(lookup19(node)(sizeMap)));
                            var explicitPortX = bind8((function() {
                              var v = eq23(e.to.node)(node);
                              var v1 = eq23(e.from.node)(node);
                              if (v1) {
                                return e.from.port;
                              }
                              ;
                              if (v) {
                                return e.to.port;
                              }
                              ;
                              return Nothing.value;
                            })())(function(pid) {
                              return bind8(lookup19(node)(portMap))(function(ports) {
                                return bind8(find2(function(pp) {
                                  return eq33(pp.id)(pid);
                                })(ports))(function(p) {
                                  return new Just(toNumber(p.offset) * toNumber(sf2));
                                });
                              });
                            });
                            var centre = width / 2;
                            var resolved = (function() {
                              if (explicitPortX instanceof Just) {
                                return explicitPortX.value0;
                              }
                              ;
                              if (explicitPortX instanceof Nothing) {
                                return offsetFor(portOffsets)(e.id)(side)(centre);
                              }
                              ;
                              throw new Error("Failed pattern match at Markgraf.Layout.CoordAssignment (line 993, column 16 - line 995, column 56): " + [explicitPortX.constructor.name]);
                            })();
                            if (side instanceof North) {
                              return resolved;
                            }
                            ;
                            if (side instanceof South) {
                              return resolved;
                            }
                            ;
                            return 0;
                          };
                        };
                      };
                      var sideOfEndpoint = function(e) {
                        return function(node) {
                          var isSource = eq23(e.from.node)(node);
                          var v = new Tuple(isSource, hdir);
                          if (v.value0 && v.value1 instanceof HRight) {
                            return South.value;
                          }
                          ;
                          if (v.value0 && v.value1 instanceof HLeft) {
                            return North.value;
                          }
                          ;
                          if (!v.value0 && v.value1 instanceof HRight) {
                            return North.value;
                          }
                          ;
                          if (!v.value0 && v.value1 instanceof HLeft) {
                            return South.value;
                          }
                          ;
                          throw new Error("Failed pattern match at Markgraf.Layout.CoordAssignment (line 1124, column 5 - line 1128, column 30): " + [v.constructor.name]);
                        };
                      };
                      var sideForOther = function(isRoot) {
                        var v = new Tuple(isRoot, hdir);
                        if (v.value0 && v.value1 instanceof HRight) {
                          return South.value;
                        }
                        ;
                        if (v.value0 && v.value1 instanceof HLeft) {
                          return North.value;
                        }
                        ;
                        if (!v.value0 && v.value1 instanceof HRight) {
                          return North.value;
                        }
                        ;
                        if (!v.value0 && v.value1 instanceof HLeft) {
                          return South.value;
                        }
                        ;
                        throw new Error("Failed pattern match at Markgraf.Layout.CoordAssignment (line 974, column 25 - line 978, column 28): " + [v.constructor.name]);
                      };
                      var sideForCurrent = function(isRoot) {
                        var v = new Tuple(isRoot, hdir);
                        if (v.value0 && v.value1 instanceof HRight) {
                          return North.value;
                        }
                        ;
                        if (v.value0 && v.value1 instanceof HLeft) {
                          return South.value;
                        }
                        ;
                        if (!v.value0 && v.value1 instanceof HRight) {
                          return South.value;
                        }
                        ;
                        if (!v.value0 && v.value1 instanceof HLeft) {
                          return North.value;
                        }
                        ;
                        throw new Error("Failed pattern match at Markgraf.Layout.CoordAssignment (line 967, column 27 - line 971, column 28): " + [v.constructor.name]);
                      };
                      var shiftBlockX = function(blockRoot) {
                        return function(delta2) {
                          return function(x) {
                            var bump = function(m) {
                              return function(v) {
                                return insert16(v)(fromMaybe(0)(lookup19(v)(m)) + delta2)(m);
                              };
                            };
                            return foldl16(bump)(x)(getBlockRing(aligned)(blockRoot));
                          };
                        };
                      };
                      var rootOf = function(nid) {
                        return fromMaybe(nid)(lookup19(nid)(aligned.root));
                      };
                      var otherNode = function(e) {
                        return function(nid) {
                          var $227 = eq23(e.from.node)(nid);
                          if ($227) {
                            return e.to.node;
                          }
                          ;
                          return e.from.node;
                        };
                      };
                      var orderedLayers = (function() {
                        if (hdir instanceof HRight) {
                          return layers;
                        }
                        ;
                        if (hdir instanceof HLeft) {
                          return reverse(layers);
                        }
                        ;
                        throw new Error("Failed pattern match at Markgraf.Layout.CoordAssignment (line 629, column 19 - line 631, column 30): " + [hdir.constructor.name]);
                      })();
                      var nodeW = function(nid) {
                        return sizeW(fromMaybe(new Tuple(1, 1))(lookup19(nid)(sizeMap)));
                      };
                      var layerNodeIndex = function(n) {
                        return fromMaybe(-1 | 0)(lookup19(n)(ni.nodeIndex));
                      };
                      var layerIndexOf = fromFoldable23(concat(mapWithIndex2(function(li) {
                        return function(layer) {
                          return map14(function(n) {
                            return new Tuple(n, li);
                          })(layer);
                        };
                      })(layers)));
                      var layerOf2 = function(nid) {
                        return fromMaybe(-1 | 0)(lookup19(nid)(layerIndexOf));
                      };
                      var layerArrayOf = function(nid) {
                        return fromMaybe([])(index(layers)(layerOf2(nid)));
                      };
                      var lowerNeighbor = function(n) {
                        return index(layerArrayOf(n))(layerNodeIndex(n) + 1 | 0);
                      };
                      var upperNeighbor = function(n) {
                        return index(layerArrayOf(n))(layerNodeIndex(n) - 1 | 0);
                      };
                      var innerShiftOf = function(nid) {
                        return fromMaybe(0)(lookup19(nid)(innerShift));
                      };
                      var infNeg = -1e18;
                      var isFiniteThresh = function(t) {
                        if (vdir instanceof VDown) {
                          return t > infNeg;
                        }
                        ;
                        if (vdir instanceof VUp) {
                          return t < 1e18;
                        }
                        ;
                        throw new Error("Failed pattern match at Markgraf.Layout.CoordAssignment (line 864, column 22 - line 866, column 22): " + [vdir.constructor.name]);
                      };
                      var gapStep = function(neighborOf) {
                        return function(gapOf) {
                          return function(avail) {
                            return function(current) {
                              var v = neighborOf(current);
                              if (v instanceof Nothing) {
                                return avail;
                              }
                              ;
                              if (v instanceof Just) {
                                return min9(avail)(gapOf(current)(v.value0));
                              }
                              ;
                              throw new Error("Failed pattern match at Markgraf.Layout.CoordAssignment (line 1177, column 44 - line 1179, column 56): " + [v.constructor.name]);
                            };
                          };
                        };
                      };
                      var findNodeLayer = function(nid) {
                        return function(lrs) {
                          return fromMaybe([])(find2(function(layer) {
                            return elem6(nid)(layer);
                          })(lrs));
                        };
                      };
                      var spacingBetween = function(a) {
                        return function(b) {
                          if (isDummy(a) && isDummy(b)) {
                            return 10;
                          }
                          ;
                          if (isDummy(a) || isDummy(b)) {
                            return 10;
                          }
                          ;
                          if (otherwise) {
                            return toNumber(cfg.nodeGap);
                          }
                          ;
                          throw new Error("Failed pattern match at Markgraf.Layout.CoordAssignment (line 749, column 3 - line 749, column 47): " + [a.constructor.name, b.constructor.name]);
                        };
                      };
                      var checkSpaceBelow = function(blockRoot) {
                        return function(delta2) {
                          return function(x) {
                            var minMaxBelow = function(current) {
                              return function(neighbor) {
                                var curX = fromMaybe(0)(lookup19(current)(x));
                                var nbrX = fromMaybe(0)(lookup19(neighbor)(x));
                                var maxXcurrent = curX + innerShiftOf(current) + nodeW(current);
                                var minXneighbor = nbrX + innerShiftOf(neighbor);
                                return minXneighbor - (maxXcurrent + spacingBetween(current)(neighbor));
                              };
                            };
                            return foldl16(gapStep(lowerNeighbor)(minMaxBelow))(delta2)(getBlockRing(aligned)(blockRoot));
                          };
                        };
                      };
                      var checkSpaceAbove = function(blockRoot) {
                        return function(delta2) {
                          return function(x) {
                            var minMaxAbove = function(current) {
                              return function(neighbor) {
                                var curX = fromMaybe(0)(lookup19(current)(x));
                                var nbrX = fromMaybe(0)(lookup19(neighbor)(x));
                                var minXcurrent = curX + innerShiftOf(current);
                                var maxXneighbor = nbrX + innerShiftOf(neighbor) + nodeW(neighbor);
                                return minXcurrent - (maxXneighbor + spacingBetween(current)(neighbor));
                              };
                            };
                            return foldl16(gapStep(upperNeighbor)(minMaxAbove))(delta2)(getBlockRing(aligned)(blockRoot));
                          };
                        };
                      };
                      var appendBy = function(keyOf) {
                        return function(m) {
                          return function(e) {
                            return alter2(function(v) {
                              return new Just(append17(fromMaybe([])(v))([e]));
                            })(keyOf(e))(m);
                          };
                        };
                      };
                      var incomingByNode = foldl16(appendBy(function(v) {
                        return v.to.node;
                      }))(empty2)(edges);
                      var outgoingByNode = foldl16(appendBy(function(v) {
                        return v.from.node;
                      }))(empty2)(edges);
                      var allNodes = concat(layers);
                      var blockOd = (function() {
                        var bumpOd = function(m) {
                          return function(v) {
                            var r = rootOf(v);
                            var $234 = eq23(v)(r);
                            if ($234) {
                              return m;
                            }
                            ;
                            return alter2(function(b) {
                              return new Just(fromMaybe(true)(b) && isDummy(v));
                            })(r)(m);
                          };
                        };
                        var allRoots = nub3(fromFoldable16(values(aligned.root)));
                        var initialOd = fromFoldable23(mapFlipped13(allRoots)(function(r) {
                          return new Tuple(r, true);
                        }));
                        return foldl16(bumpOd)(initialOd)(allNodes);
                      })();
                      var pickEdge = function(pp) {
                        return function(st) {
                          var freeRoot = rootOf(pp.free);
                          var onlyDummies = fromMaybe(true)(lookup19(freeRoot)(blockOd));
                          var step2 = function(acc) {
                            return function(e) {
                              if (acc.edge instanceof Just) {
                                return acc;
                              }
                              ;
                              if (acc.edge instanceof Nothing) {
                                var isSelfLoop2 = eq23(e.from.node)(e.to.node);
                                var sameLayer = layerOf2(e.from.node) === layerOf2(e.to.node);
                                var skipSameLayer = !onlyDummies && (!isSelfLoop2 && sameLayer);
                                var skipSu = fromMaybe(false)(lookup19(freeRoot)(st.su));
                                var $237 = skipSameLayer || skipSu;
                                if ($237) {
                                  return acc;
                                }
                                ;
                                var other = otherNode(e)(pp.free);
                                var otherRoot = rootOf(other);
                                var isFinished = fromMaybe(false)(lookup19(otherRoot)(st.blockFinished));
                                var differentBlock = notEq6(otherRoot)(freeRoot);
                                var $238 = differentBlock && isFinished;
                                if ($238) {
                                  return {
                                    edge: new Just(e),
                                    hasEdges: true
                                  };
                                }
                                ;
                                return {
                                  edge: acc.edge,
                                  hasEdges: acc.hasEdges || differentBlock
                                };
                              }
                              ;
                              throw new Error("Failed pattern match at Markgraf.Layout.CoordAssignment (line 935, column 18 - line 956, column 65): " + [acc.edge.constructor.name]);
                            };
                          };
                          var candidates = (function() {
                            var v = new Tuple(pp.isRoot, hdir);
                            if (v.value0 && v.value1 instanceof HRight) {
                              return fromMaybe([])(lookup19(pp.free)(incomingByNode));
                            }
                            ;
                            if (v.value0 && v.value1 instanceof HLeft) {
                              return fromMaybe([])(lookup19(pp.free)(outgoingByNode));
                            }
                            ;
                            if (!v.value0 && v.value1 instanceof HRight) {
                              return fromMaybe([])(lookup19(pp.free)(outgoingByNode));
                            }
                            ;
                            if (!v.value0 && v.value1 instanceof HLeft) {
                              return fromMaybe([])(lookup19(pp.free)(incomingByNode));
                            }
                            ;
                            throw new Error("Failed pattern match at Markgraf.Layout.CoordAssignment (line 929, column 18 - line 933, column 68): " + [v.constructor.name]);
                          })();
                          return foldl16(step2)({
                            edge: Nothing.value,
                            hasEdges: false
                          })(candidates);
                        };
                      };
                      var getBound = function(rootId) {
                        return function(currentNode) {
                          return function(isRoot) {
                            return function(st) {
                              var invalid = (function() {
                                if (vdir instanceof VDown) {
                                  return infNeg;
                                }
                                ;
                                if (vdir instanceof VUp) {
                                  return 1e18;
                                }
                                ;
                                throw new Error("Failed pattern match at Markgraf.Layout.CoordAssignment (line 876, column 17 - line 878, column 22): " + [vdir.constructor.name]);
                              })();
                              var pp = {
                                free: currentNode,
                                isRoot
                              };
                              var res = pickEdge(pp)(st);
                              if (res.edge instanceof Nothing) {
                                if (res.hasEdges) {
                                  return {
                                    thresh: invalid,
                                    state: {
                                      x: st.x,
                                      sink: st.sink,
                                      classEdges: st.classEdges,
                                      su: st.su,
                                      blockFinished: st.blockFinished,
                                      queue: append17(st.queue)([pp])
                                    }
                                  };
                                }
                                ;
                                return {
                                  thresh: invalid,
                                  state: st
                                };
                              }
                              ;
                              if (res.edge instanceof Just) {
                                var other = otherNode(res.edge.value0)(currentNode);
                                var otherRoot = rootOf(other);
                                var otherY = fromMaybe(0)(join2(lookup19(otherRoot)(st.x)));
                                var curPortOff = thresholdPortOffsetX(res.edge.value0)(currentNode)(sideForCurrent(isRoot));
                                var otherPortOff = thresholdPortOffsetX(res.edge.value0)(other)(sideForOther(isRoot));
                                var threshold = otherY + innerShiftOf(other) + otherPortOff - innerShiftOf(currentNode) - curPortOff;
                                var st$prime = {
                                  blockFinished: st.blockFinished,
                                  classEdges: st.classEdges,
                                  queue: st.queue,
                                  sink: st.sink,
                                  x: st.x,
                                  su: insert16(rootOf(res.edge.value0.from.node))(true)(insert16(rootOf(res.edge.value0.to.node))(true)(st.su))
                                };
                                return {
                                  thresh: threshold,
                                  state: st$prime
                                };
                              }
                              ;
                              throw new Error("Failed pattern match at Markgraf.Layout.CoordAssignment (line 881, column 5 - line 909, column 42): " + [res.edge.constructor.name]);
                            };
                          };
                        };
                      };
                      var calculateThresholdSimple = function(rootId) {
                        return function(currentNode) {
                          return function(oldThresh) {
                            return function(st) {
                              var isRoot = eq23(currentNode)(rootId);
                              var isLast = eq23(fromMaybe(currentNode)(lookup19(currentNode)(aligned.align)))(rootId);
                              var $252 = !(isRoot || isLast);
                              if ($252) {
                                return {
                                  thresh: oldThresh,
                                  state: st
                                };
                              }
                              ;
                              var r1 = (function() {
                                var $253 = isRoot && !isFiniteThresh(oldThresh);
                                if ($253) {
                                  return getBound(rootId)(currentNode)(true)(st);
                                }
                                ;
                                return {
                                  thresh: oldThresh,
                                  state: st
                                };
                              })();
                              var $254 = !isFiniteThresh(r1.thresh) && isLast;
                              if ($254) {
                                return getBound(rootId)(currentNode)(false)(r1.state);
                              }
                              ;
                              return r1;
                            };
                          };
                        };
                      };
                      var processBlockNode = function(rootId) {
                        return function(acc) {
                          return function(currentNode) {
                            var currentIdx = fromMaybe(0)(lookup19(currentNode)(ni.nodeIndex));
                            var layer = findNodeLayer(currentNode)(orderedLayers);
                            var layerSize = length(layer);
                            var hasNeighbor = (function() {
                              if (vdir instanceof VDown) {
                                return currentIdx > 0;
                              }
                              ;
                              if (vdir instanceof VUp) {
                                return currentIdx < (layerSize - 1 | 0);
                              }
                              ;
                              throw new Error("Failed pattern match at Markgraf.Layout.CoordAssignment (line 761, column 21 - line 763, column 42): " + [vdir.constructor.name]);
                            })();
                            var $256 = !hasNeighbor;
                            if ($256) {
                              var v = calculateThresholdSimple(rootId)(currentNode)(acc.thresh)(acc.st);
                              return {
                                initial: acc.initial,
                                st: v.state,
                                thresh: v.thresh
                              };
                            }
                            ;
                            var neighborIdx = (function() {
                              if (vdir instanceof VDown) {
                                return currentIdx - 1 | 0;
                              }
                              ;
                              if (vdir instanceof VUp) {
                                return currentIdx + 1 | 0;
                              }
                              ;
                              throw new Error("Failed pattern match at Markgraf.Layout.CoordAssignment (line 773, column 23 - line 775, column 32): " + [vdir.constructor.name]);
                            })();
                            var v = index(layer)(neighborIdx);
                            if (v instanceof Nothing) {
                              return acc;
                            }
                            ;
                            if (v instanceof Just) {
                              var neighborRoot = fromMaybe(v.value0)(lookup19(v.value0)(aligned.root));
                              var st1 = placeBlock(neighborRoot)(acc.st);
                              var v1 = calculateThresholdSimple(rootId)(currentNode)(acc.thresh)(st1);
                              var curSink = fromMaybe(rootId)(lookup19(rootId)(v1.state.sink));
                              var st2 = (function() {
                                var $263 = eq23(curSink)(rootId);
                                if ($263) {
                                  return {
                                    blockFinished: v1.state.blockFinished,
                                    classEdges: v1.state.classEdges,
                                    queue: v1.state.queue,
                                    su: v1.state.su,
                                    x: v1.state.x,
                                    sink: insert16(rootId)(fromMaybe(neighborRoot)(lookup19(neighborRoot)(v1.state.sink)))(v1.state.sink)
                                  };
                                }
                                ;
                                return v1.state;
                              })();
                              var neighborSink = fromMaybe(neighborRoot)(lookup19(neighborRoot)(st2.sink));
                              var rootSink = fromMaybe(rootId)(lookup19(rootId)(st2.sink));
                              var $264 = eq23(rootSink)(neighborSink);
                              if ($264) {
                                var neighborRootX = fromMaybe(0)(join2(lookup19(neighborRoot)(st2.x)));
                                var currentRootX = fromMaybe(0)(join2(lookup19(rootId)(st2.x)));
                                var spacing = spacingBetween(currentNode)(v.value0);
                                var dShift = innerShiftOf(v.value0) - innerShiftOf(currentNode);
                                if (vdir instanceof VDown) {
                                  var newPos = neighborRootX + dShift + nodeW(v.value0) + spacing;
                                  var newClamped = max13(newPos)(v1.thresh);
                                  var finalPos = (function() {
                                    if (acc.initial) {
                                      return newClamped;
                                    }
                                    ;
                                    return max13(currentRootX)(newClamped);
                                  })();
                                  return {
                                    st: {
                                      sink: st2.sink,
                                      classEdges: st2.classEdges,
                                      su: st2.su,
                                      blockFinished: st2.blockFinished,
                                      queue: st2.queue,
                                      x: insert16(rootId)(new Just(finalPos))(st2.x)
                                    },
                                    initial: false,
                                    thresh: v1.thresh
                                  };
                                }
                                ;
                                if (vdir instanceof VUp) {
                                  var newPos = neighborRootX + dShift - spacing - nodeW(currentNode);
                                  var newClamped = min9(newPos)(v1.thresh);
                                  var finalPos = (function() {
                                    if (acc.initial) {
                                      return newClamped;
                                    }
                                    ;
                                    return min9(currentRootX)(newClamped);
                                  })();
                                  return {
                                    st: {
                                      sink: st2.sink,
                                      classEdges: st2.classEdges,
                                      su: st2.su,
                                      blockFinished: st2.blockFinished,
                                      queue: st2.queue,
                                      x: insert16(rootId)(new Just(finalPos))(st2.x)
                                    },
                                    initial: false,
                                    thresh: v1.thresh
                                  };
                                }
                                ;
                                throw new Error("Failed pattern match at Markgraf.Layout.CoordAssignment (line 804, column 13 - line 820, column 107): " + [vdir.constructor.name]);
                              }
                              ;
                              var neighborRootX = fromMaybe(0)(join2(lookup19(neighborRoot)(st2.x)));
                              var currentRootX = fromMaybe(0)(join2(lookup19(rootId)(st2.x)));
                              var spacing = toNumber(cfg.nodeGap);
                              var dShift = innerShiftOf(currentNode) - innerShiftOf(v.value0);
                              var sep = (function() {
                                if (vdir instanceof VDown) {
                                  return currentRootX + dShift - neighborRootX - nodeW(v.value0) - spacing;
                                }
                                ;
                                if (vdir instanceof VUp) {
                                  return currentRootX + dShift + nodeW(currentNode) + spacing - neighborRootX;
                                }
                                ;
                                throw new Error("Failed pattern match at Markgraf.Layout.CoordAssignment (line 834, column 21 - line 836, column 91): " + [vdir.constructor.name]);
                              })();
                              var newEdge = {
                                src: rootSink,
                                tgt: neighborSink,
                                sep
                              };
                              return {
                                st: {
                                  x: st2.x,
                                  sink: st2.sink,
                                  su: st2.su,
                                  blockFinished: st2.blockFinished,
                                  queue: st2.queue,
                                  classEdges: append17(st2.classEdges)([newEdge])
                                },
                                initial: acc.initial,
                                thresh: v1.thresh
                              };
                            }
                            ;
                            throw new Error("Failed pattern match at Markgraf.Layout.CoordAssignment (line 776, column 7 - line 838, column 110): " + [v.constructor.name]);
                          };
                        };
                      };
                      var placeBlock = function(rootId) {
                        return function(state2) {
                          var v = join2(lookup19(rootId)(state2.x));
                          if (v instanceof Just) {
                            return state2;
                          }
                          ;
                          if (v instanceof Nothing) {
                            var state0 = {
                              blockFinished: state2.blockFinished,
                              classEdges: state2.classEdges,
                              queue: state2.queue,
                              sink: state2.sink,
                              su: state2.su,
                              x: insert16(rootId)(new Just(0))(state2.x)
                            };
                            var blockNodes = getBlockRing(aligned)(rootId);
                            var initThresh = (function() {
                              if (vdir instanceof VDown) {
                                return infNeg;
                              }
                              ;
                              if (vdir instanceof VUp) {
                                return 1e18;
                              }
                              ;
                              throw new Error("Failed pattern match at Markgraf.Layout.CoordAssignment (line 724, column 22 - line 726, column 24): " + [vdir.constructor.name]);
                            })();
                            var result = foldl16(processBlockNode(rootId))({
                              st: state0,
                              initial: true,
                              thresh: initThresh
                            })(blockNodes);
                            return {
                              x: result.st.x,
                              sink: result.st.sink,
                              classEdges: result.st.classEdges,
                              su: result.st.su,
                              queue: result.st.queue,
                              blockFinished: insert16(rootId)(true)(result.st.blockFinished)
                            };
                          }
                          ;
                          throw new Error("Failed pattern match at Markgraf.Layout.CoordAssignment (line 718, column 29 - line 728, column 81): " + [v.constructor.name]);
                        };
                      };
                      var initSink = fromFoldable23(mapFlipped13(allNodes)(function(n) {
                        return new Tuple(n, n);
                      }));
                      var placed = foldl16(function(st) {
                        return function(layer) {
                          var nodes = (function() {
                            if (vdir instanceof VDown) {
                              return layer;
                            }
                            ;
                            if (vdir instanceof VUp) {
                              return reverse(layer);
                            }
                            ;
                            throw new Error("Failed pattern match at Markgraf.Layout.CoordAssignment (line 673, column 19 - line 675, column 35): " + [vdir.constructor.name]);
                          })();
                          return foldl16(function(st$prime) {
                            return function(nid) {
                              var rootId = rootOf(nid);
                              var $276 = eq23(rootId)(nid);
                              if ($276) {
                                return placeBlock(rootId)(st$prime);
                              }
                              ;
                              return st$prime;
                            };
                          })(st)(nodes);
                        };
                      })({
                        x: fromFoldable23(mapFlipped13(allNodes)(function(n) {
                          return new Tuple(n, Nothing.value);
                        })),
                        sink: initSink,
                        classEdges: [],
                        su: empty2,
                        blockFinished: empty2,
                        queue: []
                      })(orderedLayers);
                      var classShifts = placeClasses(placed.classEdges)(placed.sink)(vdir);
                      var nodeX0 = (function() {
                        var nodeX0Of = function(nid) {
                          var rootId = rootOf(nid);
                          var rx = fromMaybe(0)(join2(lookup19(rootId)(placed.x)));
                          var sinkId = fromMaybe(rootId)(lookup19(rootId)(placed.sink));
                          var ss = fromMaybe(0)(lookup19(sinkId)(classShifts));
                          return rx + ss;
                        };
                        return fromFoldable23(mapFlipped13(allNodes)(function(nid) {
                          return new Tuple(nid, nodeX0Of(nid));
                        }));
                      })();
                      var absPortX = function(e) {
                        return function(node) {
                          return function(side) {
                            return function(x) {
                              var nx = fromMaybe(0)(lookup19(node)(x));
                              return nx + innerShiftOf(node) + thresholdPortOffsetX(e)(node)(side);
                            };
                          };
                        };
                      };
                      var postProcess = function(queue) {
                        return function(suInit) {
                          return function(initX) {
                            var processEdge = function(baseEntry) {
                              return function(pp) {
                                return function(e) {
                                  return function(x) {
                                    var v = (function() {
                                      var $277 = eq23(e.from.node)(pp.free);
                                      if ($277) {
                                        return new Tuple(e.from.node, e.to.node);
                                      }
                                      ;
                                      return new Tuple(e.to.node, e.from.node);
                                    })();
                                    var blockSide = sideOfEndpoint(e)(v.value0);
                                    var fixSide = sideOfEndpoint(e)(v.value1);
                                    var blockPos = absPortX(e)(v.value0)(blockSide)(x);
                                    var fixPos = absPortX(e)(v.value1)(fixSide)(x);
                                    var delta2 = blockPos - fixPos;
                                    var blockRoot = rootOf(v.value0);
                                    var entry0 = {
                                      avail: baseEntry.avail,
                                      shift: baseEntry.shift,
                                      candCount: baseEntry.candCount,
                                      freeSu: baseEntry.freeSu,
                                      hasEdges: baseEntry.hasEdges,
                                      phase: baseEntry.phase,
                                      ppFree: baseEntry.ppFree,
                                      ppIsRoot: baseEntry.ppIsRoot,
                                      edgeId: new Just(e.id),
                                      delta: delta2
                                    };
                                    var $279 = delta2 > 0 && delta2 < 1e300;
                                    if ($279) {
                                      var avail = checkSpaceAbove(blockRoot)(delta2)(x);
                                      var shift = (function() {
                                        var $280 = avail > 0;
                                        if ($280) {
                                          return -avail;
                                        }
                                        ;
                                        return 0;
                                      })();
                                      var x$prime = (function() {
                                        var $281 = avail > 0;
                                        if ($281) {
                                          return shiftBlockX(blockRoot)(shift)(x);
                                        }
                                        ;
                                        return x;
                                      })();
                                      return {
                                        x: x$prime,
                                        moved: avail > 0,
                                        entry: {
                                          delta: entry0.delta,
                                          edgeId: entry0.edgeId,
                                          candCount: entry0.candCount,
                                          freeSu: entry0.freeSu,
                                          hasEdges: entry0.hasEdges,
                                          phase: entry0.phase,
                                          ppFree: entry0.ppFree,
                                          ppIsRoot: entry0.ppIsRoot,
                                          avail,
                                          shift
                                        }
                                      };
                                    }
                                    ;
                                    var $282 = delta2 < 0 && -delta2 < 1e300;
                                    if ($282) {
                                      var avail = checkSpaceBelow(blockRoot)(-delta2)(x);
                                      var shift = (function() {
                                        var $283 = avail > 0;
                                        if ($283) {
                                          return avail;
                                        }
                                        ;
                                        return 0;
                                      })();
                                      var x$prime = (function() {
                                        var $284 = avail > 0;
                                        if ($284) {
                                          return shiftBlockX(blockRoot)(shift)(x);
                                        }
                                        ;
                                        return x;
                                      })();
                                      return {
                                        x: x$prime,
                                        moved: avail > 0,
                                        entry: {
                                          delta: entry0.delta,
                                          edgeId: entry0.edgeId,
                                          candCount: entry0.candCount,
                                          freeSu: entry0.freeSu,
                                          hasEdges: entry0.hasEdges,
                                          phase: entry0.phase,
                                          ppFree: entry0.ppFree,
                                          ppIsRoot: entry0.ppIsRoot,
                                          avail,
                                          shift
                                        }
                                      };
                                    }
                                    ;
                                    return {
                                      x,
                                      moved: false,
                                      entry: entry0
                                    };
                                  };
                                };
                              };
                            };
                            var emptyAcc = {
                              x: initX,
                              su: suInit,
                              stack: [],
                              trace: []
                            };
                            var candidateCount = function(pp) {
                              return length((function() {
                                var v = new Tuple(pp.isRoot, hdir);
                                if (v.value0 && v.value1 instanceof HRight) {
                                  return fromMaybe([])(lookup19(pp.free)(incomingByNode));
                                }
                                ;
                                if (v.value0 && v.value1 instanceof HLeft) {
                                  return fromMaybe([])(lookup19(pp.free)(outgoingByNode));
                                }
                                ;
                                if (!v.value0 && v.value1 instanceof HRight) {
                                  return fromMaybe([])(lookup19(pp.free)(outgoingByNode));
                                }
                                ;
                                if (!v.value0 && v.value1 instanceof HLeft) {
                                  return fromMaybe([])(lookup19(pp.free)(incomingByNode));
                                }
                                ;
                                throw new Error("Failed pattern match at Markgraf.Layout.CoordAssignment (line 1080, column 18 - line 1084, column 73): " + [v.constructor.name]);
                              })());
                            };
                            var blockFinishedAll = fromFoldable23(mapFlipped13(nub3(fromFoldable16(values(aligned.root))))(function(r) {
                              return new Tuple(r, true);
                            }));
                            var step2 = function(phase) {
                              return function(pp) {
                                return function(x) {
                                  return function(su) {
                                    var stForPick = {
                                      x: empty2,
                                      sink: empty2,
                                      classEdges: [],
                                      su,
                                      blockFinished: blockFinishedAll,
                                      queue: []
                                    };
                                    var res = pickEdge(pp)(stForPick);
                                    var freeRoot = rootOf(pp.free);
                                    var freeSu = fromMaybe(false)(lookup19(freeRoot)(su));
                                    var candCount = candidateCount(pp);
                                    var baseEntry = {
                                      phase,
                                      ppFree: pp.free,
                                      ppIsRoot: pp.isRoot,
                                      edgeId: Nothing.value,
                                      delta: 0,
                                      avail: 0,
                                      shift: 0,
                                      freeSu,
                                      hasEdges: res.hasEdges,
                                      candCount
                                    };
                                    if (res.edge instanceof Nothing) {
                                      return {
                                        x,
                                        moved: false,
                                        entry: baseEntry
                                      };
                                    }
                                    ;
                                    if (res.edge instanceof Just) {
                                      return processEdge(baseEntry)(pp)(res.edge.value0)(x);
                                    }
                                    ;
                                    throw new Error("Failed pattern match at Markgraf.Layout.CoordAssignment (line 1072, column 7 - line 1074, column 47): " + [res.edge.constructor.name]);
                                  };
                                };
                              };
                            };
                            var drainOne = function(phase) {
                              return function(acc) {
                                return function(pp) {
                                  var res = step2(phase)(pp)(acc.x)(acc.su);
                                  var acc$prime = {
                                    su: acc.su,
                                    stack: acc.stack,
                                    x: res.x,
                                    trace: append17(acc.trace)([res.entry])
                                  };
                                  if (res.moved) {
                                    return acc$prime;
                                  }
                                  ;
                                  return {
                                    su: acc$prime.su,
                                    trace: acc$prime.trace,
                                    x: acc$prime.x,
                                    stack: append17(acc$prime.stack)([pp])
                                  };
                                };
                              };
                            };
                            var forwardResult = foldl16(drainOne(ForwardPhase.value))(emptyAcc)(queue);
                            var leftoverResult = foldl16(drainOne(StackPhase.value))({
                              x: forwardResult.x,
                              su: forwardResult.su,
                              trace: forwardResult.trace,
                              stack: []
                            })(reverse(forwardResult.stack));
                            return {
                              x: leftoverResult.x,
                              trace: leftoverResult.trace
                            };
                          };
                        };
                      };
                      var ppResult = postProcess(placed.queue)(placed.su)(nodeX0);
                      return {
                        x: ppResult.x,
                        queue: placed.queue,
                        trace: ppResult.trace
                      };
                    };
                  };
                };
              };
            };
          };
        };
      };
    };
  };
};
var horizontalCompaction = function(cfg) {
  return function(ni) {
    return function(layers) {
      return function(sizeMap) {
        return function(portMap) {
          return function(edges) {
            return function(portOffsets) {
              return function(innerShift) {
                return function(aligned) {
                  return function(vdir) {
                    return function(hdir) {
                      return horizontalCompactionDiag(cfg)(ni)(layers)(sizeMap)(portMap)(edges)(portOffsets)(innerShift)(aligned)(vdir)(hdir).x;
                    };
                  };
                };
              };
            };
          };
        };
      };
    };
  };
};
var insideBlockShift = function(aligned) {
  return function(portMap) {
    return function(fineSizeMap) {
      return function(edges) {
        return function(portOffsets) {
          return function(hdir) {
            var roots = nub3(fromFoldable16(values(aligned.root)));
            var orient = function(e) {
              return function(v) {
                return function(v1) {
                  return {
                    source: e.from.node,
                    sourceSide: South.value,
                    target: e.to.node,
                    targetSide: North.value
                  };
                };
              };
            };
            var findEdge = function(a) {
              return function(b) {
                return find2(function(e) {
                  return eq23(e.from.node)(a) && eq23(e.to.node)(b) || eq23(e.from.node)(b) && eq23(e.to.node)(a);
                })(edges);
              };
            };
            var explicitPortX = function(e) {
              return function(node) {
                return bind8((function() {
                  var v = eq23(e.to.node)(node);
                  var v1 = eq23(e.from.node)(node);
                  if (v1) {
                    return e.from.port;
                  }
                  ;
                  if (v) {
                    return e.to.port;
                  }
                  ;
                  return Nothing.value;
                })())(function(pid) {
                  return bind8(lookup19(node)(portMap))(function(ports) {
                    return bind8(find2(function(pp) {
                      return eq33(pp.id)(pid);
                    })(ports))(function(p) {
                      return new Just(toNumber(p.offset) * toNumber(sf2));
                    });
                  });
                });
              };
            };
            var edgePortX = function(e) {
              return function(node) {
                return function(side) {
                  var width = sizeW(fromMaybe(new Tuple(1, 1))(lookup19(node)(fineSizeMap)));
                  var centre = width / 2;
                  var resolved = (function() {
                    var v = explicitPortX(e)(node);
                    if (v instanceof Just) {
                      return v.value0;
                    }
                    ;
                    if (v instanceof Nothing) {
                      return offsetFor(portOffsets)(e.id)(side)(centre);
                    }
                    ;
                    throw new Error("Failed pattern match at Markgraf.Layout.CoordAssignment (line 1310, column 16 - line 1312, column 56): " + [v.constructor.name]);
                  })();
                  if (side instanceof North) {
                    return resolved;
                  }
                  ;
                  if (side instanceof South) {
                    return resolved;
                  }
                  ;
                  return 0;
                };
              };
            };
            var portPosDiff = function(prev) {
              return function(nxt) {
                var v = findEdge(prev)(nxt);
                if (v instanceof Nothing) {
                  return 0;
                }
                ;
                if (v instanceof Just) {
                  var v1 = orient(v.value0)(prev)(nxt);
                  var prevSide = (function() {
                    var $306 = eq23(v1.source)(prev);
                    if ($306) {
                      return v1.sourceSide;
                    }
                    ;
                    return v1.targetSide;
                  })();
                  var nxtSide = (function() {
                    var $307 = eq23(v1.source)(nxt);
                    if ($307) {
                      return v1.sourceSide;
                    }
                    ;
                    return v1.targetSide;
                  })();
                  var prevX = edgePortX(v.value0)(prev)(prevSide);
                  var nxtX = edgePortX(v.value0)(nxt)(nxtSide);
                  return prevX - nxtX;
                }
                ;
                throw new Error("Failed pattern match at Markgraf.Layout.CoordAssignment (line 1267, column 26 - line 1275, column 19): " + [v.constructor.name]);
              };
            };
            var stepThrough = function($copy_acc) {
              return function($copy_shift) {
                return function($copy_prev) {
                  return function($copy_rest) {
                    var $tco_var_acc = $copy_acc;
                    var $tco_var_shift = $copy_shift;
                    var $tco_var_prev = $copy_prev;
                    var $tco_done = false;
                    var $tco_result;
                    function $tco_loop(acc, shift, prev, rest) {
                      var v = uncons(rest);
                      if (v instanceof Nothing) {
                        $tco_done = true;
                        return acc;
                      }
                      ;
                      if (v instanceof Just) {
                        var portDiff = portPosDiff(prev)(v.value0.head);
                        var nextShift = shift + portDiff;
                        $tco_var_acc = insert16(v.value0.head)(nextShift)(acc);
                        $tco_var_shift = nextShift;
                        $tco_var_prev = v.value0.head;
                        $copy_rest = v.value0.tail;
                        return;
                      }
                      ;
                      throw new Error("Failed pattern match at Markgraf.Layout.CoordAssignment (line 1258, column 37 - line 1263, column 66): " + [v.constructor.name]);
                    }
                    ;
                    while (!$tco_done) {
                      $tco_result = $tco_loop($tco_var_acc, $tco_var_shift, $tco_var_prev, $copy_rest);
                    }
                    ;
                    return $tco_result;
                  };
                };
              };
            };
            var walk = function(acc) {
              return function(shift) {
                return function(current) {
                  return function(ring) {
                    var v = uncons(ring);
                    if (v instanceof Nothing) {
                      return insert16(current)(shift)(acc);
                    }
                    ;
                    if (v instanceof Just) {
                      return stepThrough(insert16(v.value0.head)(shift)(acc))(shift)(v.value0.head)(v.value0.tail);
                    }
                    ;
                    throw new Error("Failed pattern match at Markgraf.Layout.CoordAssignment (line 1253, column 33 - line 1256, column 62): " + [v.constructor.name]);
                  };
                };
              };
            };
            var shiftBlock = function(acc) {
              return function(root) {
                var ring = getBlockRing(aligned)(root);
                var walked = walk(empty2)(0)(root)(ring);
                var spaceAbove = foldl16(function(m) {
                  return function(v) {
                    return max13(m)(-v.value1);
                  };
                })(0)(toUnfoldable1(walked));
                return foldl16(function(a) {
                  return function(v) {
                    return insert16(v.value0)(v.value1 + spaceAbove)(a);
                  };
                })(acc)(toUnfoldable1(walked));
              };
            };
            return foldl16(shiftBlock)(empty2)(roots);
          };
        };
      };
    };
  };
};
var edgeKey = function(v) {
  return function(v1) {
    return v + ("\u2192" + v1);
  };
};
var markConflicts = function(ni) {
  return function(layers) {
    var isInnerSegment = function(_ni) {
      return function(node) {
        return function(_layerI) {
          return isDummy(node) && all2(isDummy)(fromMaybe([])(lookup19(node)(ni.preds)));
        };
      };
    };
    var markRange = function(marked) {
      return function(lowerLayer) {
        return function(_upperLayer) {
          return function(k0) {
            return function(k1) {
              return function(upToL) {
                return function(layerI) {
                  return foldl16(function(m) {
                    return function(ll) {
                      var vl = fromMaybe("")(index(lowerLayer)(ll));
                      var $331 = isInnerSegment(ni)(vl)(layerI);
                      if ($331) {
                        return m;
                      }
                      ;
                      return foldl16(function(m$prime) {
                        return function(pred$prime) {
                          var k = fromMaybe(0)(lookup19(pred$prime)(ni.nodeIndex));
                          var $332 = k < k0 || k > k1;
                          if ($332) {
                            return insert17(edgeKey(pred$prime)(vl))(m$prime);
                          }
                          ;
                          return m$prime;
                        };
                      })(m)(fromMaybe([])(lookup19(vl)(ni.preds)));
                    };
                  })(marked)(range2(0)(upToL));
                };
              };
            };
          };
        };
      };
    };
    var scanLower = function($copy_marked) {
      return function($copy_lowerLayer) {
        return function($copy_upperLayer) {
          return function($copy_upperSize) {
            return function($copy_layerI) {
              return function($copy_k0) {
                return function($copy_l) {
                  var $tco_var_marked = $copy_marked;
                  var $tco_var_lowerLayer = $copy_lowerLayer;
                  var $tco_var_upperLayer = $copy_upperLayer;
                  var $tco_var_upperSize = $copy_upperSize;
                  var $tco_var_layerI = $copy_layerI;
                  var $tco_var_k0 = $copy_k0;
                  var $tco_done = false;
                  var $tco_result;
                  function $tco_loop(marked, lowerLayer, upperLayer, upperSize, layerI, k0, l) {
                    var lowerSize = length(lowerLayer);
                    var $333 = l >= lowerSize;
                    if ($333) {
                      $tco_done = true;
                      return marked;
                    }
                    ;
                    var vl = fromMaybe("")(index(lowerLayer)(l));
                    var isLast = l === (lowerSize - 1 | 0);
                    var isInner = isInnerSegment(ni)(vl)(layerI);
                    var $334 = isLast || isInner;
                    if ($334) {
                      var k1 = (function() {
                        if (isInner) {
                          var v = head(fromMaybe([])(lookup19(vl)(ni.preds)));
                          if (v instanceof Just) {
                            return fromMaybe(upperSize - 1 | 0)(lookup19(v.value0)(ni.nodeIndex));
                          }
                          ;
                          if (v instanceof Nothing) {
                            return upperSize - 1 | 0;
                          }
                          ;
                          throw new Error("Failed pattern match at Markgraf.Layout.CoordAssignment (line 470, column 15 - line 472, column 41): " + [v.constructor.name]);
                        }
                        ;
                        return upperSize - 1 | 0;
                      })();
                      var marked$prime = markRange(marked)(lowerLayer)(upperLayer)(k0)(k1)(l)(layerI);
                      $tco_var_marked = marked$prime;
                      $tco_var_lowerLayer = lowerLayer;
                      $tco_var_upperLayer = upperLayer;
                      $tco_var_upperSize = upperSize;
                      $tco_var_layerI = layerI;
                      $tco_var_k0 = k1;
                      $copy_l = l + 1 | 0;
                      return;
                    }
                    ;
                    $tco_var_marked = marked;
                    $tco_var_lowerLayer = lowerLayer;
                    $tco_var_upperLayer = upperLayer;
                    $tco_var_upperSize = upperSize;
                    $tco_var_layerI = layerI;
                    $tco_var_k0 = k0;
                    $copy_l = l + 1 | 0;
                    return;
                  }
                  ;
                  while (!$tco_done) {
                    $tco_result = $tco_loop($tco_var_marked, $tco_var_lowerLayer, $tco_var_upperLayer, $tco_var_upperSize, $tco_var_layerI, $tco_var_k0, $copy_l);
                  }
                  ;
                  return $tco_result;
                };
              };
            };
          };
        };
      };
    };
    var markLayer = function(marked) {
      return function(i) {
        var upperLayer = fromMaybe([])(index(layers)(i));
        var lowerLayer = fromMaybe([])(index(layers)(i + 1 | 0));
        var upperSize = length(upperLayer);
        return scanLower(marked)(lowerLayer)(upperLayer)(upperSize)(i)(0)(0);
      };
    };
    var $338 = length(layers) < 3;
    if ($338) {
      return empty3;
    }
    ;
    return foldl16(markLayer)(empty3)(range2(1)(length(layers) - 2 | 0));
  };
};
var verticalAlignment = function(ni) {
  return function(layers) {
    return function(markedEdges) {
      return function(vdir) {
        return function(hdir) {
          var tryAlign = function(nid) {
            return function(neighbors) {
              return function(st) {
                return function(m) {
                  var selfAlign = fromMaybe(nid)(lookup19(nid)(st.align));
                  var $339 = notEq6(selfAlign)(nid);
                  if ($339) {
                    return st;
                  }
                  ;
                  var v = index(neighbors)(m);
                  if (v instanceof Nothing) {
                    return st;
                  }
                  ;
                  if (v instanceof Just) {
                    var uIdx = fromMaybe(0)(lookup19(v.value0)(ni.nodeIndex));
                    var isMarked = member5(edgeKey(v.value0)(nid))(markedEdges) || member5(edgeKey(nid)(v.value0))(markedEdges);
                    var canAlign = !isMarked && (function() {
                      if (vdir instanceof VDown) {
                        return st.r < uIdx;
                      }
                      ;
                      if (vdir instanceof VUp) {
                        return st.r > uIdx;
                      }
                      ;
                      throw new Error("Failed pattern match at Markgraf.Layout.CoordAssignment (line 580, column 38 - line 582, column 31): " + [vdir.constructor.name]);
                    })();
                    if (canAlign) {
                      var uRoot = fromMaybe(v.value0)(lookup19(v.value0)(st.root));
                      return {
                        root: insert16(nid)(uRoot)(st.root),
                        align: insert16(v.value0)(nid)(insert16(nid)(uRoot)(st.align)),
                        r: uIdx
                      };
                    }
                    ;
                    return st;
                  }
                  ;
                  throw new Error("Failed pattern match at Markgraf.Layout.CoordAssignment (line 572, column 10 - line 589, column 16): " + [v.constructor.name]);
                };
              };
            };
          };
          var processNode = function(_layerNodes) {
            return function(state2) {
              return function(nid) {
                var neighbors = (function() {
                  if (hdir instanceof HRight) {
                    return fromMaybe([])(lookup19(nid)(ni.preds));
                  }
                  ;
                  if (hdir instanceof HLeft) {
                    return fromMaybe([])(lookup19(nid)(ni.succs));
                  }
                  ;
                  throw new Error("Failed pattern match at Markgraf.Layout.CoordAssignment (line 555, column 19 - line 557, column 54): " + [hdir.constructor.name]);
                })();
                var d = length(neighbors);
                var $345 = d === 0;
                if ($345) {
                  return state2;
                }
                ;
                var low = div1(d - 1 | 0)(2);
                var high = div1(d)(2);
                var range3 = (function() {
                  if (vdir instanceof VDown) {
                    return range2(low)(high);
                  }
                  ;
                  if (vdir instanceof VUp) {
                    return reverse(range2(low)(high));
                  }
                  ;
                  throw new Error("Failed pattern match at Markgraf.Layout.CoordAssignment (line 564, column 17 - line 566, column 46): " + [vdir.constructor.name]);
                })();
                return foldl16(tryAlign(nid)(neighbors))(state2)(range3);
              };
            };
          };
          var processLayer = function(acc) {
            return function(layer) {
              var nodes = (function() {
                if (vdir instanceof VDown) {
                  return layer;
                }
                ;
                if (vdir instanceof VUp) {
                  return reverse(layer);
                }
                ;
                throw new Error("Failed pattern match at Markgraf.Layout.CoordAssignment (line 543, column 15 - line 545, column 31): " + [vdir.constructor.name]);
              })();
              var initR = (function() {
                if (vdir instanceof VDown) {
                  return -1 | 0;
                }
                ;
                if (vdir instanceof VUp) {
                  return 999999;
                }
                ;
                throw new Error("Failed pattern match at Markgraf.Layout.CoordAssignment (line 547, column 15 - line 549, column 22): " + [vdir.constructor.name]);
              })();
              var s = foldl16(processNode(nodes))({
                root: acc.root,
                align: acc.align,
                r: initR
              })(nodes);
              return {
                root: s.root,
                align: s.align
              };
            };
          };
          var orderedLayers = (function() {
            if (hdir instanceof HRight) {
              return layers;
            }
            ;
            if (hdir instanceof HLeft) {
              return reverse(layers);
            }
            ;
            throw new Error("Failed pattern match at Markgraf.Layout.CoordAssignment (line 535, column 19 - line 537, column 30): " + [hdir.constructor.name]);
          })();
          var allNodes = concat(layers);
          var initAlign = fromFoldable23(mapFlipped13(allNodes)(function(n) {
            return new Tuple(n, n);
          }));
          var initRoot = fromFoldable23(mapFlipped13(allNodes)(function(n) {
            return new Tuple(n, n);
          }));
          var $$final = foldl16(processLayer)({
            root: initRoot,
            align: initAlign
          })(orderedLayers);
          return {
            root: $$final.root,
            align: $$final.align
          };
        };
      };
    };
  };
};
var runLayout = function(cfg) {
  return function(ni) {
    return function(layers) {
      return function(sizeMap) {
        return function(portMap) {
          return function(edges) {
            return function(portOffsets) {
              return function(markedEdges) {
                return function(vdir) {
                  return function(hdir) {
                    var aligned = verticalAlignment(ni)(layers)(markedEdges)(vdir)(hdir);
                    var innerShift = insideBlockShift(aligned)(portMap)(sizeMap)(edges)(portOffsets)(hdir);
                    var xCoords = horizontalCompaction(cfg)(ni)(layers)(sizeMap)(portMap)(edges)(portOffsets)(innerShift)(aligned)(vdir)(hdir);
                    var withShift = mapMaybeWithKey2(function(nid) {
                      return function(x) {
                        return new Just(x + fromMaybe(0)(lookup19(nid)(innerShift)));
                      };
                    })(xCoords);
                    return withShift;
                  };
                };
              };
            };
          };
        };
      };
    };
  };
};
var cumulativeYWithGaps = function(gaps) {
  return function(heights) {
    var layerY = function(i) {
      return function(v) {
        return foldl16(function(acc) {
          return function(j) {
            return acc + fromMaybe(1)(index(heights)(j)) + fromMaybe(0)(index(gaps)(j));
          };
        })(0)(take(i)(range2(0)(length(heights) - 1 | 0)));
      };
    };
    return mapWithIndex2(layerY)(heights);
  };
};
var computeLayerGaps = function(cfg) {
  return function(layers) {
    return function(_sizeMap) {
      return function(portMap) {
        return function(edges) {
          return function(chains) {
            return function(provisionalFor) {
              var numGaps = max14(0)(length(layers) - 1 | 0);
              var baseGap = toNumber(cfg.layerGap);
              var provisional = provisionalFor(replicate(numGaps)(baseGap));
              var assignments = assignPorts(edges)(provisional)(portMap)(chains)(empty2);
              var slots = slotCountByGap(assignments)(provisional);
              var gapWidth = function(gapIdx) {
                var v = lookup110(gapIdx)(slots);
                if (v instanceof Just && v.value0 > 0) {
                  return max13(baseGap)(2 * 1 + toNumber(v.value0 - 1 | 0) * 2.5);
                }
                ;
                return baseGap;
              };
              return mapFlipped13(range2(0)(numGaps - 1 | 0))(gapWidth);
            };
          };
        };
      };
    };
  };
};
var checkOrderConstraint = function(_cfg) {
  return function(layers) {
    return function(sizeMap) {
      return function(coords) {
        var step2 = function(acc) {
          return function(nid) {
            var $352 = !acc.ok;
            if ($352) {
              return acc;
            }
            ;
            var x = fromMaybe(0)(lookup19(nid)(coords));
            var w = sizeW(fromMaybe(new Tuple(1, 1))(lookup19(nid)(sizeMap)));
            var bot = x + w;
            var $353 = x + 1e-4 > acc.pos && bot + 1e-4 > acc.pos;
            if ($353) {
              return {
                ok: true,
                pos: bot
              };
            }
            ;
            return {
              ok: false,
              pos: acc.pos
            };
          };
        };
        var layerFeasible = function(layer) {
          var bottom3 = -1e18;
          return foldl16(step2)({
            ok: true,
            pos: bottom3
          })(layer).ok;
        };
        return all2(layerFeasible)(layers);
      };
    };
  };
};
var smallestFeasible = function(cfg) {
  return function(layers) {
    return function(sizeMap) {
      return function(candidates) {
        var feasible = filter(checkOrderConstraint(cfg)(layers)(sizeMap))(candidates);
        var sized = mapFlipped13(feasible)(function(l) {
          return {
            l,
            w: layoutSize(l)
          };
        });
        var sorted = sortBy(function(a) {
          return function(b) {
            return compare11(a.w)(b.w);
          };
        })(sized);
        return mapFlipped14(head(sorted))(function(v) {
          return v.l;
        });
      };
    };
  };
};
var buildNeighborhood = function(layers) {
  return function(edges) {
    var rawSuccs = foldl16(function(m) {
      return function(e) {
        return insertWith9(append17)(e.from.node)([e.to.node])(m);
      };
    })(empty2)(edges);
    var rawPreds = foldl16(function(m) {
      return function(e) {
        return insertWith9(append17)(e.to.node)([e.from.node])(m);
      };
    })(empty2)(edges);
    var nodeIndex = fromFoldable23(concat(mapFlipped13(layers)(mapWithIndex2(function(i) {
      return function(nid) {
        return new Tuple(nid, i);
      };
    }))));
    var idx = function(nid) {
      return fromMaybe(0)(lookup19(nid)(nodeIndex));
    };
    var sortByIdx = function(arr) {
      return sortBy(function(a) {
        return function(b) {
          return compare16(idx(a))(idx(b));
        };
      })(arr);
    };
    var preds = map15(sortByIdx)(rawPreds);
    var succs = map15(sortByIdx)(rawSuccs);
    return {
      preds,
      succs,
      nodeIndex
    };
  };
};
var balanceLayouts = function(sizeMap) {
  return function(layouts) {
    var sized = mapWithIndex2(function(i) {
      return function(l) {
        return {
          i,
          l,
          w: layoutSize(l)
        };
      };
    })(layouts);
    var refIdx = (function() {
      var v = head(sortBy(function(a) {
        return function(b) {
          return compare11(a.w)(b.w);
        };
      })(sized));
      if (v instanceof Just) {
        return v.value0.i;
      }
      ;
      if (v instanceof Nothing) {
        return 0;
      }
      ;
      throw new Error("Failed pattern match at Markgraf.Layout.CoordAssignment (line 1391, column 12 - line 1393, column 17): " + [v.constructor.name]);
    })();
    var nodeW = function(nid) {
      return sizeW(fromMaybe(new Tuple(1, 1))(lookup19(nid)(sizeMap)));
    };
    var minVal = function(m) {
      return foldl17(min9)(999999)(values(m));
    };
    var refMin = (function() {
      var v = index(layouts)(refIdx);
      if (v instanceof Just) {
        return minVal(v.value0);
      }
      ;
      if (v instanceof Nothing) {
        return 0;
      }
      ;
      throw new Error("Failed pattern match at Markgraf.Layout.CoordAssignment (line 1394, column 12 - line 1396, column 19): " + [v.constructor.name]);
    })();
    var maxVal = function(m) {
      return foldl16(function(acc) {
        return function(v) {
          return max13(acc)(v.value1 + nodeW(v.value0));
        };
      })(-999999)(toUnfoldable1(m));
    };
    var refMax = (function() {
      var v = index(layouts)(refIdx);
      if (v instanceof Just) {
        return maxVal(v.value0);
      }
      ;
      if (v instanceof Nothing) {
        return 0;
      }
      ;
      throw new Error("Failed pattern match at Markgraf.Layout.CoordAssignment (line 1397, column 12 - line 1399, column 19): " + [v.constructor.name]);
    })();
    var shifts = mapWithIndex2(function(i) {
      return function(l) {
        var $363 = mod3(i)(2) === 0;
        if ($363) {
          return refMin - minVal(l);
        }
        ;
        return refMax - maxVal(l);
      };
    })(layouts);
    var shifted = zipWith(function(l) {
      return function(s) {
        return map15(function(v) {
          return v + s;
        })(l);
      };
    })(layouts)(shifts);
    var allKeys = nub3(concat(mapFlipped13(shifted)(function(m) {
      return fromFoldable33(keys3(m));
    })));
    var balanced = foldl16(function(acc) {
      return function(k) {
        var vals = sort3(mapMaybe(lookup19(k))(shifted));
        var med = (function() {
          var v = length(vals);
          if (v === 4) {
            var v1 = new Tuple(index(vals)(1), index(vals)(2));
            if (v1.value0 instanceof Just && v1.value1 instanceof Just) {
              return (v1.value0.value0 + v1.value1.value0) / 2;
            }
            ;
            return 0;
          }
          ;
          var v1 = head(vals);
          if (v1 instanceof Just) {
            return v1.value0;
          }
          ;
          if (v1 instanceof Nothing) {
            return 0;
          }
          ;
          throw new Error("Failed pattern match at Markgraf.Layout.CoordAssignment (line 1411, column 18 - line 1413, column 29): " + [v1.constructor.name]);
        })();
        return insert16(k)(med)(acc);
      };
    })(empty2)(allKeys);
    return normalizeLayout(balanced);
  };
};
var assignFine = function(cfg) {
  return function(layers) {
    return function(sizeMap) {
      return function(portMap) {
        return function(edges) {
          return function(portOffsets) {
            var ni = buildNeighborhood(layers)(edges);
            var markedEdges = markConflicts(ni)(layers);
            var fineCfg = {
              nodeGap: cfg.nodeGap * sf2 | 0,
              layerGap: cfg.layerGap
            };
            var dummySizes = fromFoldable23(mapFlipped13(filter(isDummy)(concat(layers)))(function(nid) {
              return new Tuple(nid, new Tuple(1, 1));
            }));
            var fineSizeMap = union6(dummySizes)(map15(function(v) {
              return new Tuple(v.value0 * toNumber(sf2), v.value1);
            })(sizeMap));
            var layout1 = runLayout(fineCfg)(ni)(layers)(fineSizeMap)(portMap)(edges)(portOffsets)(markedEdges)(VDown.value)(HRight.value);
            var layout2 = runLayout(fineCfg)(ni)(layers)(fineSizeMap)(portMap)(edges)(portOffsets)(markedEdges)(VUp.value)(HRight.value);
            var layout3 = runLayout(fineCfg)(ni)(layers)(fineSizeMap)(portMap)(edges)(portOffsets)(markedEdges)(VDown.value)(HLeft.value);
            var layout4 = runLayout(fineCfg)(ni)(layers)(fineSizeMap)(portMap)(edges)(portOffsets)(markedEdges)(VUp.value)(HLeft.value);
            var layouts = [layout1, layout2, layout3, layout4];
            var balanced = balanceLayouts(fineSizeMap)(layouts);
            var coords = (function() {
              var $389 = checkOrderConstraint(fineCfg)(layers)(fineSizeMap)(balanced);
              if ($389) {
                return balanced;
              }
              ;
              var v = smallestFeasible(fineCfg)(layers)(fineSizeMap)(layouts);
              if (v instanceof Just) {
                return v.value0;
              }
              ;
              if (v instanceof Nothing) {
                return fromMaybe(empty2)(head(layouts));
              }
              ;
              throw new Error("Failed pattern match at Markgraf.Layout.CoordAssignment (line 361, column 10 - line 363, column 52): " + [v.constructor.name]);
            })();
            return coords;
          };
        };
      };
    };
  };
};
var applyRelative = function(placements) {
  return function(anchor) {
    return function(target) {
      return function(offset) {
        var anchorPos = findMap(function(p) {
          var $392 = eq23(p.node)(anchor);
          if ($392) {
            return new Just(p.position);
          }
          ;
          return Nothing.value;
        })(placements);
        if (anchorPos instanceof Nothing) {
          return placements;
        }
        ;
        if (anchorPos instanceof Just) {
          return mapFlipped13(placements)(function(p) {
            var $394 = eq23(p.node)(target);
            if ($394) {
              return {
                layer: p.layer,
                node: p.node,
                order: p.order,
                size: p.size,
                position: new Tuple(gridX(anchorPos.value0) + gridX(offset), gridY(anchorPos.value0) + gridY(offset))
              };
            }
            ;
            return p;
          });
        }
        ;
        throw new Error("Failed pattern match at Markgraf.Layout.CoordAssignment (line 1514, column 3 - line 1519, column 13): " + [anchorPos.constructor.name]);
      };
    };
  };
};
var alignNodes = function(placements) {
  return function(groupNodes) {
    return function(axis) {
      return function(alignment) {
        var groupPlacements = filter(function(p) {
          return elem6(p.node)(groupNodes);
        })(placements);
        var coord = (function() {
          var v = new Tuple(axis, alignment);
          if (v.value0 instanceof Vertical && v.value1 instanceof Start) {
            return foldl16(function(mn) {
              return function(p) {
                return min9(mn)(gridX(p.position));
              };
            })(99999)(groupPlacements);
          }
          ;
          if (v.value0 instanceof Vertical && v.value1 instanceof End) {
            return foldl16(function(mx) {
              return function(p) {
                return max13(mx)(gridX(p.position));
              };
            })(0)(groupPlacements);
          }
          ;
          if (v.value0 instanceof Vertical && v.value1 instanceof Center) {
            var total = foldl16(function(s) {
              return function(p) {
                return s + gridX(p.position);
              };
            })(0)(groupPlacements);
            var $401 = length(groupPlacements) === 0;
            if ($401) {
              return 0;
            }
            ;
            return total / toNumber(length(groupPlacements));
          }
          ;
          if (v.value0 instanceof Horizontal && v.value1 instanceof Start) {
            return foldl16(function(mn) {
              return function(p) {
                return min9(mn)(gridY(p.position));
              };
            })(99999)(groupPlacements);
          }
          ;
          if (v.value0 instanceof Horizontal && v.value1 instanceof End) {
            return foldl16(function(mx) {
              return function(p) {
                return max13(mx)(gridY(p.position));
              };
            })(0)(groupPlacements);
          }
          ;
          if (v.value0 instanceof Horizontal && v.value1 instanceof Center) {
            var total = foldl16(function(s) {
              return function(p) {
                return s + gridY(p.position);
              };
            })(0)(groupPlacements);
            var $408 = length(groupPlacements) === 0;
            if ($408) {
              return 0;
            }
            ;
            return total / toNumber(length(groupPlacements));
          }
          ;
          throw new Error("Failed pattern match at Markgraf.Layout.CoordAssignment (line 1493, column 13 - line 1503, column 103): " + [v.constructor.name]);
        })();
        return mapFlipped13(placements)(function(p) {
          var $411 = elem6(p.node)(groupNodes);
          if ($411) {
            if (axis instanceof Vertical) {
              return {
                layer: p.layer,
                node: p.node,
                order: p.order,
                size: p.size,
                position: new Tuple(coord, gridY(p.position))
              };
            }
            ;
            if (axis instanceof Horizontal) {
              return {
                layer: p.layer,
                node: p.node,
                order: p.order,
                size: p.size,
                position: new Tuple(gridX(p.position), coord)
              };
            }
            ;
            throw new Error("Failed pattern match at Markgraf.Layout.CoordAssignment (line 1506, column 7 - line 1508, column 75): " + [axis.constructor.name]);
          }
          ;
          return p;
        });
      };
    };
  };
};
var applyConstraints2 = function(constraints) {
  return function(placements) {
    var applyOne = function(ps) {
      return function(v) {
        if (v instanceof AlignGroup) {
          return alignNodes(ps)(v.value0.nodes)(v.value0.axis)(v.value0.alignment);
        }
        ;
        if (v instanceof RelativePosition) {
          return applyRelative(ps)(v.value0.anchor)(v.value0.target)(v.value0.offset);
        }
        ;
        return ps;
      };
    };
    return foldl16(applyOne)(placements)(constraints);
  };
};
var assign = function(cfg) {
  return function(constraints) {
    return function(layers) {
      return function(sizeMap) {
        return function(portMap) {
          return function(edges) {
            return function(chains) {
              return function(portOffsets) {
                var layerHeights = mapFlipped13(layers)(function(layer) {
                  return foldl16(function(h) {
                    return function(nid) {
                      return max13(h)(sizeH(fromMaybe(new Tuple(1, 1))(lookup19(nid)(sizeMap))));
                    };
                  })(1)(layer);
                });
                var fine = assignFine(cfg)(layers)(sizeMap)(portMap)(edges)(portOffsets);
                var buildProvisional = function(perGapWidths) {
                  var provisionalLayerYs = cumulativeYWithGaps(perGapWidths)(layerHeights);
                  return concat(mapWithIndex2(function(layerIdx) {
                    return function(layer) {
                      return mapWithIndex2(function(orderIdx) {
                        return function(nodeId) {
                          var dummyDefault = new Tuple(0, 1);
                          var realDefault = new Tuple(1, 1);
                          var fallback = (function() {
                            var $423 = isDummy(nodeId);
                            if ($423) {
                              return dummyDefault;
                            }
                            ;
                            return realDefault;
                          })();
                          var size4 = fromMaybe(fallback)(lookup19(nodeId)(sizeMap));
                          var fineX = fromMaybe(0)(lookup19(nodeId)(fine));
                          var x = fineX / toNumber(sf2);
                          var y = fromMaybe(0)(index(provisionalLayerYs)(layerIdx));
                          return {
                            node: nodeId,
                            position: new Tuple(x, y),
                            size: size4,
                            layer: layerIdx,
                            order: orderIdx
                          };
                        };
                      })(layer);
                    };
                  })(layers));
                };
                var perGapLayerGaps = computeLayerGaps(cfg)(layers)(sizeMap)(portMap)(edges)(chains)(buildProvisional);
                var layerYs = cumulativeYWithGaps(perGapLayerGaps)(layerHeights);
                var result = concat(mapWithIndex2(function(layerIdx) {
                  return function(layer) {
                    return mapWithIndex2(function(orderIdx) {
                      return function(nodeId) {
                        var dummyDefault = new Tuple(0, 1);
                        var realDefault = new Tuple(1, 1);
                        var fallback = (function() {
                          var $424 = isDummy(nodeId);
                          if ($424) {
                            return dummyDefault;
                          }
                          ;
                          return realDefault;
                        })();
                        var size4 = fromMaybe(fallback)(lookup19(nodeId)(sizeMap));
                        var fineX = fromMaybe(0)(lookup19(nodeId)(fine));
                        var x = fineX / toNumber(sf2);
                        var y = fromMaybe(0)(index(layerYs)(layerIdx));
                        return {
                          node: nodeId,
                          position: new Tuple(x, y),
                          size: size4,
                          layer: layerIdx,
                          order: orderIdx
                        };
                      };
                    })(layer);
                  };
                })(layers));
                return applyConstraints2(constraints)(result);
              };
            };
          };
        };
      };
    };
  };
};

// ../markgraf/output/Markgraf.Layout.JavaRandom/index.js
var one2 = /* @__PURE__ */ one(semiringBigInt);
var greaterThanOrEq2 = /* @__PURE__ */ greaterThanOrEq(ordBigInt);
var sub2 = /* @__PURE__ */ sub(ringBigInt);
var zero2 = /* @__PURE__ */ zero(semiringBigInt);
var add6 = /* @__PURE__ */ add(semiringBigInt);
var mul2 = /* @__PURE__ */ mul(semiringBigInt);
var append18 = /* @__PURE__ */ append(semigroupArray);
var foldl18 = /* @__PURE__ */ foldl(foldableArray);
var compare17 = /* @__PURE__ */ compare(ordNumber);
var mapFlipped15 = /* @__PURE__ */ mapFlipped(functorArray);
var twoPow32 = /* @__PURE__ */ shl(one2)(/* @__PURE__ */ fromInt(32));
var twoPow31 = /* @__PURE__ */ shl(one2)(/* @__PURE__ */ fromInt(31));
var toSignedI32 = function(b) {
  var $27 = greaterThanOrEq2(b)(twoPow31);
  if ($27) {
    return sub2(b)(twoPow32);
  }
  ;
  return b;
};
var numToBigInt = function(n) {
  return fromMaybe(zero2)(fromNumber2(n));
};
var multiplier = /* @__PURE__ */ fromMaybe(zero2)(/* @__PURE__ */ fromString2("25214903917"));
var mask48 = /* @__PURE__ */ sub2(/* @__PURE__ */ shl(one2)(/* @__PURE__ */ fromInt(48)))(one2);
var mkRandomBI = function(seed) {
  return and2(xor(seed)(multiplier))(mask48);
};
var mkRandom = function(seed) {
  return mkRandomBI(numToBigInt(seed));
};
var increment = /* @__PURE__ */ fromInt(11);
var next2 = function(bits) {
  return function(v) {
    var s$prime = and2(add6(mul2(v)(multiplier))(increment))(mask48);
    var shifted = shr(s$prime)(fromInt(48 - bits | 0));
    var result = fromMaybe(0)(fromNumber(toNumber2(shifted)));
    return new Tuple(result, s$prime);
  };
};
var nextBoolean = function(r) {
  var v = next2(1)(r);
  return new Tuple(v.value0 !== 0, v.value1);
};
var nextDouble = function(r) {
  var v = next2(26)(r);
  var v1 = next2(27)(v.value1);
  var combined = toNumber(v.value0) * pow(2)(27) + toNumber(v1.value0);
  return new Tuple(combined / pow(2)(53), v1.value1);
};
var randomShuffle = function(r0) {
  return function(xs) {
    var step2 = function(v2) {
      return function(v1) {
        var v22 = nextDouble(v2.finalR);
        return {
          rs: append18(v2.rs)([v22.value0]),
          finalR: v22.value1
        };
      };
    };
    var v = foldl18(step2)({
      rs: [],
      finalR: r0
    })(xs);
    var keyed = zipWith(function(x) {
      return function(k) {
        return {
          x,
          k
        };
      };
    })(xs)(v.rs);
    var sorted = sortBy(function(a) {
      return function(b) {
        return compare17(a.k)(b.k);
      };
    })(keyed);
    return new Tuple(mapFlipped15(sorted)(function(v1) {
      return v1.x;
    }), v.finalR);
  };
};
var nextLongBI = function(v) {
  var s1 = and2(add6(mul2(v)(multiplier))(increment))(mask48);
  var high32 = shr(s1)(fromInt(16));
  var s2 = and2(add6(mul2(s1)(multiplier))(increment))(mask48);
  var low32 = shr(s2)(fromInt(16));
  var signedHigh = toSignedI32(high32);
  var signedLow = toSignedI32(low32);
  var combined = add6(mul2(signedHigh)(twoPow32))(signedLow);
  return new Tuple(combined, s2);
};

// ../markgraf/output/Markgraf.Layout.CrossingMin/index.js
var bind9 = /* @__PURE__ */ bind(bindMaybe);
var eq18 = /* @__PURE__ */ eq(eqNodeId);
var lookup20 = /* @__PURE__ */ lookup(ordEdgeId);
var member6 = /* @__PURE__ */ member(ordNodeId);
var compare18 = /* @__PURE__ */ compare(ordInt);
var append19 = /* @__PURE__ */ append(semigroupArray);
var fromFoldable17 = /* @__PURE__ */ fromFoldable2(ordEdgeId)(foldableArray);
var foldl19 = /* @__PURE__ */ foldl(foldableArray);
var lookup111 = /* @__PURE__ */ lookup(ordNodeId);
var fromFoldable18 = /* @__PURE__ */ fromFoldable2(ordNodeId)(foldableArray);
var eq19 = /* @__PURE__ */ eq(/* @__PURE__ */ eqArray(eqNodeId));
var pure3 = /* @__PURE__ */ pure(applicativeMaybe);
var compare19 = /* @__PURE__ */ compare(ordNumber);
var div4 = /* @__PURE__ */ div(euclideanRingInt);
var elemIndex2 = /* @__PURE__ */ elemIndex(eqNodeId);
var sum2 = /* @__PURE__ */ sum(foldableArray)(semiringNumber);
var mapFlipped16 = /* @__PURE__ */ mapFlipped(functorArray);
var insert18 = /* @__PURE__ */ insert2(ordNodeId);
var max15 = /* @__PURE__ */ max(ordInt);
var member1 = /* @__PURE__ */ member2(ordNodeId);
var mapFlipped17 = /* @__PURE__ */ mapFlipped(functorMaybe);
var swap = function(i) {
  return function(j) {
    return function(arr) {
      return bind9(index(arr)(i))(function(vi) {
        return bind9(index(arr)(j))(function(vj) {
          return bind9(updateAt(i)(vj)(arr))(function(arr$prime) {
            return updateAt(j)(vi)(arr$prime);
          });
        });
      });
    };
  };
};
var outputRanks = function(refLayer) {
  return function(_refPos) {
    return function(freePos) {
      return function(edges) {
        return function(edgeIdx) {
          var originatesAt = function(n) {
            return function(e) {
              return eq18(e.from.node)(n);
            };
          };
          var keyOf = function(e) {
            return fromMaybe(1e6)(lookup20(e.id)(edgeIdx));
          };
          var inFree = function(e) {
            return member6(e.to.node)(freePos);
          };
          var perNode = function(acc) {
            return function(nodeId) {
              var outE = filter(inFree)(filter(originatesAt(nodeId))(edges));
              var sorted = sortBy(function(a) {
                return function(b) {
                  return compare18(keyOf(a))(keyOf(b));
                };
              })(outE);
              var k = length(sorted);
              var newRanks = mapWithIndex2(function(j) {
                return function(e) {
                  return new Tuple(e.id, toNumber((acc.rankSum + j | 0) + 1 | 0));
                };
              })(sorted);
              return {
                ranks: append19(acc.ranks)(newRanks),
                rankSum: acc.rankSum + k | 0
              };
            };
          };
          return fromFoldable17(foldl19(perNode)({
            ranks: [],
            rankSum: 0
          })(refLayer).ranks);
        };
      };
    };
  };
};
var orderConstraintsOf = /* @__PURE__ */ mapMaybe(function(v) {
  if (v instanceof OrderConstraint) {
    return new Just({
      before: v.value0.before,
      after: v.value0.after
    });
  }
  ;
  return Nothing.value;
});
var inputRanks = function(refLayer) {
  return function(_refPos) {
    return function(freePos) {
      return function(edges) {
        return function(edgeIdx) {
          var terminatesAt = function(n) {
            return function(e) {
              return eq18(e.to.node)(n);
            };
          };
          var sourcePosOf = function(e) {
            return fromMaybe(-1 | 0)(lookup111(e.from.node)(freePos));
          };
          var keyOf = function(e) {
            return fromMaybe(1e6)(lookup20(e.id)(edgeIdx));
          };
          var inFree = function(e) {
            return member6(e.from.node)(freePos);
          };
          var compareDesc = function(a) {
            return function(b) {
              var v = compare18(sourcePosOf(b))(sourcePosOf(a));
              if (v instanceof EQ) {
                return compare18(keyOf(a))(keyOf(b));
              }
              ;
              return v;
            };
          };
          var perNode = function(acc) {
            return function(nodeId) {
              var inE = filter(inFree)(filter(terminatesAt(nodeId))(edges));
              var sorted = sortBy(compareDesc)(inE);
              var k = length(sorted);
              var newRanks = mapWithIndex2(function(j) {
                return function(e) {
                  return new Tuple(e.id, toNumber((acc.rankSum + k | 0) - j | 0));
                };
              })(sorted);
              return {
                ranks: append19(acc.ranks)(newRanks),
                rankSum: acc.rankSum + k | 0
              };
            };
          };
          return fromFoldable17(foldl19(perNode)({
            ranks: [],
            rankSum: 0
          })(refLayer).ranks);
        };
      };
    };
  };
};
var countCrossings = function(layer1) {
  return function(layer2) {
    return function(edges) {
      var countPairs = function(pairs) {
        var n = length(pairs);
        return foldl19(function(acc) {
          return function(i) {
            return foldl19(function(acc2) {
              return function(j) {
                var v = new Tuple(index(pairs)(i), index(pairs)(j));
                if (v.value0 instanceof Just && v.value1 instanceof Just) {
                  var $81 = ((v.value0.value0.value0 - v.value1.value0.value0 | 0) * (v.value0.value0.value1 - v.value1.value0.value1 | 0) | 0) < 0;
                  if ($81) {
                    return acc2 + 1 | 0;
                  }
                  ;
                  return acc2;
                }
                ;
                return acc2;
              };
            })(acc)(range2(i + 1 | 0)(n - 1 | 0));
          };
        })(0)(range2(0)(n - 2 | 0));
      };
      var posA = fromFoldable18(mapWithIndex2(function(i) {
        return function(n) {
          return new Tuple(n, i);
        };
      })(layer1));
      var posB = fromFoldable18(mapWithIndex2(function(i) {
        return function(n) {
          return new Tuple(n, i);
        };
      })(layer2));
      var relevant = mapMaybe(function(e) {
        var v = new Tuple(lookup111(e.from.node)(posA), lookup111(e.to.node)(posB));
        if (v.value0 instanceof Just && v.value1 instanceof Just) {
          return new Just(new Tuple(v.value0.value0, v.value1.value0));
        }
        ;
        var v1 = new Tuple(lookup111(e.from.node)(posB), lookup111(e.to.node)(posA));
        if (v1.value0 instanceof Just && v1.value1 instanceof Just) {
          return new Just(new Tuple(v1.value1.value0, v1.value0.value0));
        }
        ;
        return Nothing.value;
      })(edges);
      return countPairs(relevant);
    };
  };
};
var greedySwitch = function(layer) {
  return function(refLayer) {
    return function(edges) {
      return function(orderConstraintss) {
        var violatesOrder = function(before) {
          return function(after) {
            return any2(function(c) {
              return eq18(c.before)(before) && eq18(c.after)(after);
            })(orderConstraintss);
          };
        };
        var doesSwitchReduceCrossings = function(cur) {
          return function(swapped) {
            return countCrossings(refLayer)(swapped)(edges) < countCrossings(refLayer)(cur)(edges);
          };
        };
        var sweepDownward = function($copy_cur) {
          return function($copy_upperIdx) {
            var $tco_var_cur = $copy_cur;
            var $tco_done = false;
            var $tco_result;
            function $tco_loop(cur, upperIdx) {
              if (upperIdx >= (length(cur) - 1 | 0)) {
                $tco_done = true;
                return cur;
              }
              ;
              if (otherwise) {
                var v = new Tuple(index(cur)(upperIdx), index(cur)(upperIdx + 1 | 0));
                if (v.value0 instanceof Just && v.value1 instanceof Just) {
                  var $103 = violatesOrder(v.value0.value0)(v.value1.value0);
                  if ($103) {
                    $tco_var_cur = cur;
                    $copy_upperIdx = upperIdx + 1 | 0;
                    return;
                  }
                  ;
                  var swapped = fromMaybe(cur)(bind9(updateAt(upperIdx)(v.value1.value0)(cur))(function(s1) {
                    return updateAt(upperIdx + 1 | 0)(v.value0.value0)(s1);
                  }));
                  var $104 = doesSwitchReduceCrossings(cur)(swapped);
                  if ($104) {
                    $tco_var_cur = swapped;
                    $copy_upperIdx = upperIdx + 1 | 0;
                    return;
                  }
                  ;
                  $tco_var_cur = cur;
                  $copy_upperIdx = upperIdx + 1 | 0;
                  return;
                }
                ;
                $tco_done = true;
                return cur;
              }
              ;
              throw new Error("Failed pattern match at Markgraf.Layout.CrossingMin (line 512, column 3 - line 524, column 17): " + [cur.constructor.name, upperIdx.constructor.name]);
            }
            ;
            while (!$tco_done) {
              $tco_result = $tco_loop($tco_var_cur, $copy_upperIdx);
            }
            ;
            return $tco_result;
          };
        };
        var continueSwitching = function($copy_cur) {
          var $tco_done1 = false;
          var $tco_result;
          function $tco_loop(cur) {
            var next3 = sweepDownward(cur)(0);
            var $109 = eq19(next3)(cur);
            if ($109) {
              $tco_done1 = true;
              return cur;
            }
            ;
            $copy_cur = next3;
            return;
          }
          ;
          while (!$tco_done1) {
            $tco_result = $tco_loop($copy_cur);
          }
          ;
          return $tco_result;
        };
        return continueSwitching(layer);
      };
    };
  };
};
var countAllCrossings = function(layers) {
  return function(edges) {
    var addPair = function(total) {
      return function(i) {
        return fromMaybe(total)(bind9(index(layers)(i))(function(a) {
          return bind9(index(layers)(i + 1 | 0))(function(b) {
            return pure3(total + countCrossings(a)(b)(edges) | 0);
          });
        }));
      };
    };
    return foldl19(addPair)(0)(range2(0)(length(layers) - 2 | 0));
  };
};
var collectionsSortBarycenter = /* @__PURE__ */ (function() {
  var cmp = function(a) {
    return function(b) {
      return compare19(a.key)(b.key);
    };
  };
  var insertionRun = function(arr0) {
    var inner = function($copy_arr) {
      return function($copy_j) {
        var $tco_var_arr = $copy_arr;
        var $tco_done = false;
        var $tco_result;
        function $tco_loop(arr, j) {
          var v = new Tuple(index(arr)(j - 1 | 0), index(arr)(j));
          if (v.value0 instanceof Just && (v.value1 instanceof Just && j > 0)) {
            var v1 = cmp(v.value0.value0)(v.value1.value0);
            if (v1 instanceof GT) {
              var v2 = swap(j - 1 | 0)(j)(arr);
              if (v2 instanceof Just) {
                $tco_var_arr = v2.value0;
                $copy_j = j - 1 | 0;
                return;
              }
              ;
              if (v2 instanceof Nothing) {
                $tco_done = true;
                return arr;
              }
              ;
              throw new Error("Failed pattern match at Markgraf.Layout.CrossingMin (line 338, column 17 - line 340, column 27): " + [v2.constructor.name]);
            }
            ;
            $tco_done = true;
            return arr;
          }
          ;
          $tco_done = true;
          return arr;
        }
        ;
        while (!$tco_done) {
          $tco_result = $tco_loop($tco_var_arr, $copy_j);
        }
        ;
        return $tco_result;
      };
    };
    var outer = function(arr) {
      return function(i) {
        return inner(arr)(i);
      };
    };
    return foldl19(outer)(arr0)(range2(1)(length(arr0) - 1 | 0));
  };
  var merge = function(left) {
    return function(right) {
      var go = function($copy_acc) {
        return function($copy_i) {
          return function($copy_j) {
            var $tco_var_acc = $copy_acc;
            var $tco_var_i = $copy_i;
            var $tco_done1 = false;
            var $tco_result;
            function $tco_loop(acc, i, j) {
              var v = new Tuple(index(left)(i), index(right)(j));
              if (v.value0 instanceof Just && v.value1 instanceof Just) {
                var v1 = cmp(v.value0.value0)(v.value1.value0);
                if (v1 instanceof GT) {
                  $tco_var_acc = snoc(acc)(v.value1.value0);
                  $tco_var_i = i;
                  $copy_j = j + 1 | 0;
                  return;
                }
                ;
                $tco_var_acc = snoc(acc)(v.value0.value0);
                $tco_var_i = i + 1 | 0;
                $copy_j = j;
                return;
              }
              ;
              if (v.value0 instanceof Just && v.value1 instanceof Nothing) {
                $tco_done1 = true;
                return append19(acc)(drop(i)(left));
              }
              ;
              if (v.value0 instanceof Nothing) {
                $tco_done1 = true;
                return append19(acc)(drop(j)(right));
              }
              ;
              throw new Error("Failed pattern match at Markgraf.Layout.CrossingMin (line 348, column 18 - line 354, column 44): " + [v.constructor.name]);
            }
            ;
            while (!$tco_done1) {
              $tco_result = $tco_loop($tco_var_acc, $tco_var_i, $copy_j);
            }
            ;
            return $tco_result;
          };
        };
      };
      return go([])(0)(0);
    };
  };
  var mergeSort = function(arr) {
    if (length(arr) < 7) {
      return insertionRun(arr);
    }
    ;
    if (otherwise) {
      var mid2 = div4(length(arr))(2);
      var left = mergeSort(slice(0)(mid2)(arr));
      var right = mergeSort(slice(mid2)(length(arr))(arr));
      return merge(left)(right);
    }
    ;
    throw new Error("Failed pattern match at Markgraf.Layout.CrossingMin (line 322, column 3 - line 328, column 25): " + [arr.constructor.name]);
  };
  return mergeSort;
})();
var minimize = function(cfg) {
  return function(layers) {
    return function(edges) {
      var orderConstraintss = orderConstraintsOf(cfg.constraints);
      var initialRandom = (function() {
        var rootRandom = mkRandom(1);
        var v = nextLongBI(rootRandom);
        var afterReset = mkRandomBI(v.value0);
        return afterReset;
      })();
      var initialFirstTry = !isEmpty(cfg.modelOrder);
      var fillInUnknownBarycenters = function(nodes) {
        var nextDefined = function($copy_startIdx) {
          return function($copy_fallback) {
            var $tco_var_startIdx = $copy_startIdx;
            var $tco_done = false;
            var $tco_result;
            function $tco_loop(startIdx, fallback) {
              var v = index(nodes)(startIdx);
              if (v instanceof Nothing) {
                $tco_done = true;
                return fallback;
              }
              ;
              if (v instanceof Just) {
                if (v.value0.key instanceof Just) {
                  $tco_done = true;
                  return v.value0.key.value0;
                }
                ;
                if (v.value0.key instanceof Nothing) {
                  $tco_var_startIdx = startIdx + 1 | 0;
                  $copy_fallback = fallback;
                  return;
                }
                ;
                throw new Error("Failed pattern match at Markgraf.Layout.CrossingMin (line 279, column 20 - line 281, column 55): " + [v.value0.key.constructor.name]);
              }
              ;
              throw new Error("Failed pattern match at Markgraf.Layout.CrossingMin (line 277, column 37 - line 281, column 55): " + [v.constructor.name]);
            }
            ;
            while (!$tco_done) {
              $tco_result = $tco_loop($tco_var_startIdx, $copy_fallback);
            }
            ;
            return $tco_result;
          };
        };
        var walk = function($copy_i) {
          return function($copy_lastValue) {
            return function($copy_acc) {
              var $tco_var_i = $copy_i;
              var $tco_var_lastValue = $copy_lastValue;
              var $tco_done1 = false;
              var $tco_result;
              function $tco_loop(i, lastValue, acc) {
                var v = index(nodes)(i);
                if (v instanceof Nothing) {
                  $tco_done1 = true;
                  return acc;
                }
                ;
                if (v instanceof Just) {
                  if (v.value0.key instanceof Just) {
                    $tco_var_i = i + 1 | 0;
                    $tco_var_lastValue = v.value0.key.value0;
                    $copy_acc = append19(acc)([{
                      n: v.value0.n,
                      key: v.value0.key.value0,
                      origIdx: v.value0.origIdx
                    }]);
                    return;
                  }
                  ;
                  if (v.value0.key instanceof Nothing) {
                    var nextV = nextDefined(i + 1 | 0)(lastValue + 1);
                    var v1 = (lastValue + nextV) / 2;
                    $tco_var_i = i + 1 | 0;
                    $tco_var_lastValue = v1;
                    $copy_acc = append19(acc)([{
                      n: v.value0.n,
                      key: v1,
                      origIdx: v.value0.origIdx
                    }]);
                    return;
                  }
                  ;
                  throw new Error("Failed pattern match at Markgraf.Layout.CrossingMin (line 269, column 20 - line 275, column 83): " + [v.value0.key.constructor.name]);
                }
                ;
                throw new Error("Failed pattern match at Markgraf.Layout.CrossingMin (line 267, column 28 - line 275, column 83): " + [v.constructor.name]);
              }
              ;
              while (!$tco_done1) {
                $tco_result = $tco_loop($tco_var_i, $tco_var_lastValue, $copy_acc);
              }
              ;
              return $tco_result;
            };
          };
        };
        return walk(0)(-1)([]);
      };
      var enforceOrder = function(layer) {
        var applyOne = function(arr) {
          return function(v) {
            var v1 = new Tuple(elemIndex2(v.before)(arr), elemIndex2(v.after)(arr));
            if (v1.value0 instanceof Just && (v1.value1 instanceof Just && v1.value0.value0 > v1.value1.value0)) {
              var without = fromMaybe(arr)(deleteAt(v1.value0.value0)(arr));
              return fromMaybe(without)(insertAt(v1.value1.value0)(v.before)(without));
            }
            ;
            return arr;
          };
        };
        return foldl19(applyOne)(layer)(orderConstraintss);
      };
      var edgeIdx = fromFoldable17(mapWithIndex2(function(i) {
        return function(e) {
          return new Tuple(e.id, i);
        };
      })(edges));
      var sortByBarycenter = function(curLayer) {
        return function(refLayer) {
          return function(forward) {
            return function(r0) {
              var refPos = fromFoldable18(mapWithIndex2(function(i) {
                return function(n) {
                  return new Tuple(n, i);
                };
              })(refLayer));
              var freePos = fromFoldable18(mapWithIndex2(function(i) {
                return function(n) {
                  return new Tuple(n, i);
                };
              })(curLayer));
              var ranks = (function() {
                if (forward) {
                  return outputRanks(refLayer)(refPos)(freePos)(edges)(edgeIdx);
                }
                ;
                return inputRanks(refLayer)(refPos)(freePos)(edges)(edgeIdx);
              })();
              var stepBary = function(acc) {
                return function(v) {
                  var connecting = (function() {
                    if (forward) {
                      return filter(function(e) {
                        return eq18(e.to.node)(v.value1) && member6(e.from.node)(refPos);
                      })(edges);
                    }
                    ;
                    return filter(function(e) {
                      return eq18(e.from.node)(v.value1) && member6(e.to.node)(refPos);
                    })(edges);
                  })();
                  var rs = mapMaybe(function(e) {
                    return lookup20(e.id)(ranks);
                  })(connecting);
                  var $154 = $$null(rs);
                  if ($154) {
                    return {
                      r: acc.r,
                      items: append19(acc.items)([{
                        n: v.value1,
                        key: Nothing.value,
                        origIdx: v.value0
                      }])
                    };
                  }
                  ;
                  var v1 = next2(24)(acc.r);
                  var jitter = toNumber(v1.value0) * 5960464477539063e-23 * 0.07000000029802322 - 0.03500000014901161;
                  var key = (sum2(rs) + jitter) / toNumber(length(rs));
                  return {
                    items: append19(acc.items)([{
                      n: v.value1,
                      key: new Just(key),
                      origIdx: v.value0
                    }]),
                    r: v1.value1
                  };
                };
              };
              var barysAndRandom = foldl19(stepBary)({
                items: [],
                r: r0
              })(mapWithIndex2(Tuple.create)(curLayer));
              var filled = fillInUnknownBarycenters(barysAndRandom.items);
              var sorted = mapFlipped16(collectionsSortBarycenter(filled))(function(v) {
                return v.n;
              });
              return new Tuple(enforceOrder(sorted), barysAndRandom.r);
            };
          };
        };
      };
      var sweepReducingCrossings = function(ls) {
        return function(forward) {
          return function(r0) {
            var step2 = function(v) {
              return function(i) {
                return fromMaybe(new Tuple(v.value0, v.value1))((function() {
                  var refIdx = (function() {
                    if (forward) {
                      return i - 1 | 0;
                    }
                    ;
                    return i + 1 | 0;
                  })();
                  return bind9(index(v.value0)(refIdx))(function(refLayer) {
                    return bind9(index(v.value0)(i))(function(curLayer) {
                      var v1 = sortByBarycenter(curLayer)(refLayer)(forward)(v.value1);
                      var switched = greedySwitch(v1.value0)(refLayer)(edges)(orderConstraintss);
                      return bind9(updateAt(i)(switched)(v.value0))(function(acc$prime) {
                        return pure3(new Tuple(acc$prime, v1.value1));
                      });
                    });
                  });
                })());
              };
            };
            var n = length(ls);
            var indices = (function() {
              if (forward) {
                return range2(1)(n - 1 | 0);
              }
              ;
              return reverse(range2(0)(n - 2 | 0));
            })();
            return foldl19(step2)(new Tuple(ls, r0))(indices);
          };
        };
      };
      var countAll = function(ls) {
        return countAllCrossings(ls)(edges);
      };
      var connectedNodes = foldl19(function(s) {
        return function(e) {
          return insert18(e.from.node)(insert18(e.to.node)(s));
        };
      })(empty3)(edges);
      var setFirstLayerOrder = function(isForwardSweep) {
        return function(ls) {
          return function(r0) {
            var startIdx = (function() {
              if (isForwardSweep) {
                return 0;
              }
              ;
              return max15(0)(length(ls) - 1 | 0);
            })();
            var isConnected = function(n) {
              return member1(n)(connectedNodes);
            };
            var mergeBack = function(original) {
              return function(shuffled) {
                var step2 = function(v2) {
                  return function(n) {
                    var $172 = !isConnected(n);
                    if ($172) {
                      return {
                        idx: v2.idx,
                        result: append19(v2.result)([n])
                      };
                    }
                    ;
                    var v12 = index(shuffled)(v2.idx);
                    if (v12 instanceof Just) {
                      return {
                        idx: v2.idx + 1 | 0,
                        result: append19(v2.result)([v12.value0])
                      };
                    }
                    ;
                    if (v12 instanceof Nothing) {
                      return {
                        idx: v2.idx,
                        result: append19(v2.result)([n])
                      };
                    }
                    ;
                    throw new Error("Failed pattern match at Markgraf.Layout.CrossingMin (line 169, column 14 - line 171, column 54): " + [v12.constructor.name]);
                  };
                };
                return (function(v2) {
                  return v2.result;
                })(foldl19(step2)({
                  idx: 0,
                  result: []
                })(original));
              };
            };
            var v = index(ls)(startIdx);
            if (v instanceof Just && length(v.value0) > 1) {
              var connected = filter(isConnected)(v.value0);
              var $178 = length(connected) > 1;
              if ($178) {
                var v1 = randomShuffle(r0)(connected);
                var reassembled = mergeBack(v.value0)(v1.value0);
                var withOrder = enforceOrder(reassembled);
                return fromMaybe(new Tuple(ls, r0))(mapFlipped17(updateAt(startIdx)(withOrder)(ls))(function(v2) {
                  return new Tuple(v2, v1.value1);
                }));
              }
              ;
              return new Tuple(ls, r0);
            }
            ;
            return new Tuple(ls, r0);
          };
        };
      };
      var minimizeCrossingsWithCounter = function(r0) {
        return function(firstTry) {
          return function(secondTry) {
            var converge = function($copy_cur) {
              return function($copy_dir) {
                return function($copy_oldCross) {
                  return function($copy_r) {
                    var $tco_var_cur = $copy_cur;
                    var $tco_var_dir = $copy_dir;
                    var $tco_var_oldCross = $copy_oldCross;
                    var $tco_done2 = false;
                    var $tco_result;
                    function $tco_loop(cur, dir, oldCross, r) {
                      var $183 = oldCross === 0;
                      if ($183) {
                        $tco_done2 = true;
                        return {
                          layout: cur,
                          crossings: 0,
                          random: r
                        };
                      }
                      ;
                      var v3 = sweepReducingCrossings(cur)(dir)(r);
                      var newCross = countAll(v3.value0);
                      var $185 = newCross < oldCross;
                      if ($185) {
                        $tco_var_cur = v3.value0;
                        $tco_var_dir = !dir;
                        $tco_var_oldCross = newCross;
                        $copy_r = v3.value1;
                        return;
                      }
                      ;
                      $tco_done2 = true;
                      return {
                        layout: cur,
                        crossings: oldCross,
                        random: v3.value1
                      };
                    }
                    ;
                    while (!$tco_done2) {
                      $tco_result = $tco_loop($tco_var_cur, $tco_var_dir, $tco_var_oldCross, $copy_r);
                    }
                    ;
                    return $tco_result;
                  };
                };
              };
            };
            var v = nextBoolean(r0);
            var strategyIsNone = isEmpty(cfg.modelOrder);
            var useOverride = (firstTry || secondTry) && !strategyIsNone;
            var isForwardSweep = (function() {
              if (useOverride) {
                return firstTry;
              }
              ;
              return v.value0;
            })();
            var v1 = (function() {
              var $190 = !strategyIsNone;
              if ($190) {
                return new Tuple(layers, v.value1);
              }
              ;
              return setFirstLayerOrder(isForwardSweep)(layers)(v.value1);
            })();
            var v2 = sweepReducingCrossings(v1.value0)(isForwardSweep)(v1.value1);
            var initialCross = countAll(v2.value0);
            return converge(v2.value0)(!isForwardSweep)(initialCross)(v2.value1);
          };
        };
      };
      var runIteration = function(acc) {
        return function(v) {
          if (acc.result.crossings === 0) {
            return acc;
          }
          ;
          if (otherwise) {
            var res = minimizeCrossingsWithCounter(acc.result.random)(acc.firstTry)(acc.secondTry);
            var nextResult = (function() {
              var $201 = res.crossings < acc.result.crossings;
              if ($201) {
                return {
                  layout: res.layout,
                  crossings: res.crossings,
                  random: res.random
                };
              }
              ;
              return {
                crossings: acc.result.crossings,
                layout: acc.result.layout,
                random: res.random
              };
            })();
            var secondAfter = (function() {
              if (acc.secondTry) {
                return false;
              }
              ;
              return acc.secondTry;
            })();
            var v1 = (function() {
              if (acc.firstTry) {
                return new Tuple(false, true);
              }
              ;
              return new Tuple(acc.firstTry, secondAfter);
            })();
            return {
              result: nextResult,
              firstTry: v1.value0,
              secondTry: v1.value1
            };
          }
          ;
          throw new Error("Failed pattern match at Markgraf.Layout.CrossingMin (line 95, column 3 - line 107, column 78): " + [acc.constructor.name, v.constructor.name]);
        };
      };
      var best = (function() {
        var seed = {
          result: {
            layout: layers,
            crossings: 1e9,
            random: initialRandom
          },
          firstTry: initialFirstTry,
          secondTry: false
        };
        return foldl19(runIteration)(seed)(range2(1)(cfg.iterations)).result;
      })();
      var $207 = length(layers) <= 0 || cfg.iterations <= 0;
      if ($207) {
        return layers;
      }
      ;
      return best.layout;
    };
  };
};

// ../markgraf/output/Markgraf.Layout.CycleRemoval/index.js
var eq20 = /* @__PURE__ */ eq(eqNodeId);
var member7 = /* @__PURE__ */ member(ordNodeId);
var lookup21 = /* @__PURE__ */ lookup(ordNodeId);
var insert19 = /* @__PURE__ */ insert(ordNodeId);
var elem7 = /* @__PURE__ */ elem2(eqNodeId);
var append20 = /* @__PURE__ */ append(semigroupArray);
var notEq7 = /* @__PURE__ */ notEq(eqNodeId);
var foldl20 = /* @__PURE__ */ foldl(foldableArray);
var member12 = /* @__PURE__ */ member2(ordNodeId);
var insert110 = /* @__PURE__ */ insert2(ordNodeId);
var $$delete6 = /* @__PURE__ */ $$delete2(ordNodeId);
var ordTuple4 = /* @__PURE__ */ ordTuple(ordNodeId)(ordNodeId);
var insert24 = /* @__PURE__ */ insert2(ordTuple4);
var add7 = /* @__PURE__ */ add(semiringInt);
var compare20 = /* @__PURE__ */ compare(ordInt);
var nub4 = /* @__PURE__ */ nub(ordNodeId);
var mapFlipped18 = /* @__PURE__ */ mapFlipped(functorArray);
var insertWith10 = /* @__PURE__ */ insertWith(ordNodeId);
var fromFoldable19 = /* @__PURE__ */ fromFoldable2(ordNodeId)(foldableArray);
var member22 = /* @__PURE__ */ member2(ordTuple4);
var DepthFirst = /* @__PURE__ */ (function() {
  function DepthFirst2() {
  }
  ;
  DepthFirst2.value = new DepthFirst2();
  return DepthFirst2;
})();
var Greedy = /* @__PURE__ */ (function() {
  function Greedy2() {
  }
  ;
  Greedy2.value = new Greedy2();
  return Greedy2;
})();
var updateNeighborsGreedy = function(edges) {
  return function(node) {
    return function(st) {
      var visit = function(acc) {
        return function(e) {
          var $60 = eq20(e.from.node)(e.to.node);
          if ($60) {
            return acc;
          }
          ;
          var $61 = eq20(e.from.node)(node) && !member7(e.to.node)(acc.marks);
          if ($61) {
            var inT = fromMaybe(0)(lookup21(e.to.node)(acc.inDeg)) - 1 | 0;
            var inDeg$prime = insert19(e.to.node)(inT)(acc.inDeg);
            var outT = fromMaybe(0)(lookup21(e.to.node)(acc.outDeg));
            var $62 = inT <= 0 && (outT > 0 && !elem7(e.to.node)(acc.sources));
            if ($62) {
              return {
                marks: acc.marks,
                outDeg: acc.outDeg,
                sinks: acc.sinks,
                nextLeft: acc.nextLeft,
                nextRight: acc.nextRight,
                remaining: acc.remaining,
                inDeg: inDeg$prime,
                sources: append20(acc.sources)([e.to.node])
              };
            }
            ;
            return {
              marks: acc.marks,
              outDeg: acc.outDeg,
              sources: acc.sources,
              sinks: acc.sinks,
              nextLeft: acc.nextLeft,
              nextRight: acc.nextRight,
              remaining: acc.remaining,
              inDeg: inDeg$prime
            };
          }
          ;
          var $63 = eq20(e.to.node)(node) && !member7(e.from.node)(acc.marks);
          if ($63) {
            var outS = fromMaybe(0)(lookup21(e.from.node)(acc.outDeg)) - 1 | 0;
            var outDeg$prime = insert19(e.from.node)(outS)(acc.outDeg);
            var inS = fromMaybe(0)(lookup21(e.from.node)(acc.inDeg));
            var $64 = outS <= 0 && (inS > 0 && !elem7(e.from.node)(acc.sinks));
            if ($64) {
              return {
                inDeg: acc.inDeg,
                marks: acc.marks,
                sources: acc.sources,
                nextLeft: acc.nextLeft,
                nextRight: acc.nextRight,
                remaining: acc.remaining,
                outDeg: outDeg$prime,
                sinks: append20(acc.sinks)([e.from.node])
              };
            }
            ;
            return {
              inDeg: acc.inDeg,
              marks: acc.marks,
              sinks: acc.sinks,
              sources: acc.sources,
              nextLeft: acc.nextLeft,
              nextRight: acc.nextRight,
              remaining: acc.remaining,
              outDeg: outDeg$prime
            };
          }
          ;
          return acc;
        };
      };
      var st1 = {
        inDeg: st.inDeg,
        marks: st.marks,
        nextLeft: st.nextLeft,
        nextRight: st.nextRight,
        outDeg: st.outDeg,
        sinks: st.sinks,
        sources: st.sources,
        remaining: filter(function(v1) {
          return notEq7(v1)(node);
        })(st.remaining)
      };
      return foldl20(visit)(st1)(edges);
    };
  };
};
var reverseEdge = function(e) {
  return {
    id: e.id,
    label: e.label,
    from: e.to,
    to: e.from
  };
};
var layerHints = /* @__PURE__ */ (function() {
  var go = function(acc) {
    return function(v) {
      if (v instanceof LayerConstraint && v.value0.pin instanceof SpecificLayer) {
        return insert19(v.value0.node)(v.value0.pin.value0)(acc);
      }
      ;
      if (v instanceof LayerConstraint && v.value0.pin instanceof FirstLayer) {
        return insert19(v.value0.node)(0)(acc);
      }
      ;
      if (v instanceof LayerConstraint && v.value0.pin instanceof LastLayer) {
        return insert19(v.value0.node)(99999)(acc);
      }
      ;
      return acc;
    };
  };
  return foldl20(go)(empty2);
})();
var isHintReversed = function(hints) {
  return function(fromNode) {
    return function(toNode2) {
      var v = new Tuple(lookup21(fromNode)(hints), lookup21(toNode2)(hints));
      if (v.value0 instanceof Just && v.value1 instanceof Just) {
        return v.value0.value0 > v.value1.value0;
      }
      ;
      return false;
    };
  };
};
var visitNode = function(hints) {
  return function(adj) {
    return function(node) {
      return function(state2) {
        if (member12(node)(state2.visited)) {
          return state2;
        }
        ;
        if (member12(node)(state2.visiting)) {
          return state2;
        }
        ;
        if (otherwise) {
          var state$prime = {
            backEdges: state2.backEdges,
            visited: state2.visited,
            visiting: insert110(node)(state2.visiting)
          };
          var children = fromMaybe([])(lookup21(node)(adj));
          var state$prime$prime = foldl20(visitEdge(hints)(adj)(node))(state$prime)(children);
          return {
            backEdges: state$prime$prime.backEdges,
            visiting: $$delete6(node)(state$prime$prime.visiting),
            visited: insert110(node)(state$prime$prime.visited)
          };
        }
        ;
        throw new Error("Failed pattern match at Markgraf.Layout.CycleRemoval (line 213, column 1 - line 213, column 91): " + [hints.constructor.name, adj.constructor.name, node.constructor.name, state2.constructor.name]);
      };
    };
  };
};
var visitEdge = function(hints) {
  return function(adj) {
    return function(fromNode) {
      return function(state2) {
        return function(toNode2) {
          if (isHintReversed(hints)(fromNode)(toNode2)) {
            return {
              visiting: state2.visiting,
              visited: state2.visited,
              backEdges: insert24(new Tuple(fromNode, toNode2))(state2.backEdges)
            };
          }
          ;
          if (member12(toNode2)(state2.visiting)) {
            return {
              visiting: state2.visiting,
              visited: state2.visited,
              backEdges: insert24(new Tuple(fromNode, toNode2))(state2.backEdges)
            };
          }
          ;
          if (member12(toNode2)(state2.visited)) {
            return state2;
          }
          ;
          if (otherwise) {
            return visitNode(hints)(adj)(toNode2)(state2);
          }
          ;
          throw new Error("Failed pattern match at Markgraf.Layout.CycleRemoval (line 223, column 1 - line 223, column 101): " + [hints.constructor.name, adj.constructor.name, fromNode.constructor.name, state2.constructor.name, toNode2.constructor.name]);
        };
      };
    };
  };
};
var findBackEdgesGreedy = function(hints) {
  return function(modelIdx) {
    return function(edges) {
      var shiftNegative = function(total2) {
        return function(marks) {
          return function(ns) {
            var shiftBase = total2 + 1 | 0;
            var shift = function(m) {
              return function(n) {
                var v = lookup21(n)(m);
                if (v instanceof Just && v.value0 < 0) {
                  return insert19(n)(v.value0 + shiftBase | 0)(m);
                }
                ;
                return m;
              };
            };
            return foldl20(shift)(marks)(ns);
          };
        };
      };
      var pickMaxOutflow = function(st2) {
        var outflow = function(n) {
          return fromMaybe(0)(lookup21(n)(st2.outDeg)) - fromMaybe(0)(lookup21(n)(st2.inDeg)) | 0;
        };
        var orderOf = function(n) {
          return fromMaybe(1e6)(lookup21(n)(modelIdx));
        };
        var compareNodes = function(a) {
          return function(b) {
            var v = compare20(outflow(b))(outflow(a));
            if (v instanceof EQ) {
              return compare20(orderOf(a))(orderOf(b));
            }
            ;
            return v;
          };
        };
        var sorted = sortBy(compareNodes)(st2.remaining);
        return head(sorted);
      };
      var drainAll = function($copy_st) {
        var $tco_done = false;
        var $tco_result;
        function $tco_loop(st2) {
          var v = uncons(st2.sinks);
          if (v instanceof Just) {
            var st$prime = {
              inDeg: st2.inDeg,
              nextLeft: st2.nextLeft,
              outDeg: st2.outDeg,
              remaining: st2.remaining,
              sources: st2.sources,
              sinks: v.value0.tail,
              marks: insert19(v.value0.head)(st2.nextRight)(st2.marks),
              nextRight: st2.nextRight - 1 | 0
            };
            $copy_st = updateNeighborsGreedy(edges)(v.value0.head)(st$prime);
            return;
          }
          ;
          if (v instanceof Nothing) {
            var v1 = uncons(st2.sources);
            if (v1 instanceof Just) {
              var st$prime = {
                inDeg: st2.inDeg,
                nextRight: st2.nextRight,
                outDeg: st2.outDeg,
                remaining: st2.remaining,
                sinks: st2.sinks,
                sources: v1.value0.tail,
                marks: insert19(v1.value0.head)(st2.nextLeft)(st2.marks),
                nextLeft: st2.nextLeft + 1 | 0
              };
              $copy_st = updateNeighborsGreedy(edges)(v1.value0.head)(st$prime);
              return;
            }
            ;
            if (v1 instanceof Nothing) {
              var v2 = pickMaxOutflow(st2);
              if (v2 instanceof Nothing) {
                $tco_done = true;
                return st2;
              }
              ;
              if (v2 instanceof Just) {
                var st$prime = {
                  inDeg: st2.inDeg,
                  nextRight: st2.nextRight,
                  outDeg: st2.outDeg,
                  sinks: st2.sinks,
                  sources: st2.sources,
                  remaining: filter(function(v4) {
                    return notEq7(v4)(v2.value0);
                  })(st2.remaining),
                  marks: insert19(v2.value0)(st2.nextLeft)(st2.marks),
                  nextLeft: st2.nextLeft + 1 | 0
                };
                $copy_st = updateNeighborsGreedy(edges)(v2.value0)(st$prime);
                return;
              }
              ;
              throw new Error("Failed pattern match at Markgraf.Layout.CycleRemoval (line 98, column 18 - line 107, column 58): " + [v2.constructor.name]);
            }
            ;
            throw new Error("Failed pattern match at Markgraf.Layout.CycleRemoval (line 94, column 16 - line 107, column 58): " + [v1.constructor.name]);
          }
          ;
          throw new Error("Failed pattern match at Markgraf.Layout.CycleRemoval (line 90, column 17 - line 107, column 58): " + [v.constructor.name]);
        }
        ;
        while (!$tco_done) {
          $tco_result = $tco_loop($copy_st);
        }
        ;
        return $tco_result;
      };
      var collectBackEdges = function(hs) {
        return function(marks) {
          return function(es) {
            return foldl20(function(acc) {
              return function(e) {
                var $103 = eq20(e.from.node)(e.to.node);
                if ($103) {
                  return acc;
                }
                ;
                var $104 = isHintReversed(hs)(e.from.node)(e.to.node);
                if ($104) {
                  return insert24(new Tuple(e.from.node, e.to.node))(acc);
                }
                ;
                var v = new Tuple(lookup21(e.from.node)(marks), lookup21(e.to.node)(marks));
                if (v.value0 instanceof Just && (v.value1 instanceof Just && v.value0.value0 > v.value1.value0)) {
                  return insert24(new Tuple(e.from.node, e.to.node))(acc);
                }
                ;
                return acc;
              };
            })(empty3)(es);
          };
        };
      };
      var allNodes = nub4(append20(mapFlipped18(edges)(function(e) {
        return e.from.node;
      }))(mapFlipped18(edges)(function(e) {
        return e.to.node;
      })));
      var nonSelfEdges = filter(function(e) {
        return notEq7(e.from.node)(e.to.node);
      })(edges);
      var inDeg0 = foldl20(function(m) {
        return function(e) {
          return insertWith10(add7)(e.to.node)(1)(m);
        };
      })(empty2)(nonSelfEdges);
      var outDeg0 = foldl20(function(m) {
        return function(e) {
          return insertWith10(add7)(e.from.node)(1)(m);
        };
      })(empty2)(nonSelfEdges);
      var sourcesInit = filter(function(n) {
        return fromMaybe(0)(lookup21(n)(inDeg0)) === 0;
      })(allNodes);
      var sinksInit = filter(function(n) {
        return fromMaybe(0)(lookup21(n)(outDeg0)) === 0;
      })(allNodes);
      var st = drainAll({
        remaining: filter(function(n) {
          return !elem7(n)(sourcesInit) && !elem7(n)(sinksInit);
        })(allNodes),
        marks: empty2,
        inDeg: inDeg0,
        outDeg: outDeg0,
        sources: sourcesInit,
        sinks: sinksInit,
        nextLeft: 1,
        nextRight: -1 | 0
      });
      var total = length(allNodes);
      var shifted = shiftNegative(total)(st.marks)(allNodes);
      return collectBackEdges(hints)(shifted)(edges);
    };
  };
};
var buildAdj = /* @__PURE__ */ foldl20(function(m) {
  return function(e) {
    return insertWith10(append20)(e.from.node)([e.to.node])(m);
  };
})(empty2);
var findBackEdges = function(hints) {
  return function(edges) {
    var adj = buildAdj(edges);
    var allNodes = nub4(append20(mapFlipped18(edges)(function(v) {
      return v.from.node;
    }))(mapFlipped18(edges)(function(v) {
      return v.to.node;
    })));
    var hasIncoming = foldl20(function(s) {
      return function(e) {
        return insert110(e.to.node)(s);
      };
    })(empty3)(edges);
    var sources = filter(function(n) {
      return !member12(n)(hasIncoming);
    })(allNodes);
    var nonSources = filter(function(n) {
      return member12(n)(hasIncoming);
    })(allNodes);
    var result = foldl20(function(acc) {
      return function(node) {
        return visitNode(hints)(adj)(node)(acc);
      };
    })({
      visiting: empty3,
      visited: empty3,
      backEdges: empty3
    })(append20(sources)(nonSources));
    return result.backEdges;
  };
};
var makeAcyclicWithOrder = function(strat) {
  return function(modelOrder) {
    return function(constraints) {
      return function(edges) {
        var modelIdx = fromFoldable19(mapWithIndex2(function(i) {
          return function(n) {
            return new Tuple(n, i);
          };
        })(modelOrder));
        var hints = layerHints(constraints);
        var backEdges = (function() {
          if (strat instanceof DepthFirst) {
            return findBackEdges(hints)(edges);
          }
          ;
          if (strat instanceof Greedy) {
            return findBackEdgesGreedy(hints)(modelIdx)(edges);
          }
          ;
          throw new Error("Failed pattern match at Markgraf.Layout.CycleRemoval (line 50, column 17 - line 52, column 57): " + [strat.constructor.name]);
        })();
        var resultEdges = mapFlipped18(edges)(function(e) {
          var key = new Tuple(e.from.node, e.to.node);
          var $111 = member22(key)(backEdges);
          if ($111) {
            return reverseEdge(e);
          }
          ;
          return e;
        });
        return {
          edges: resultEdges,
          reversedEdges: backEdges
        };
      };
    };
  };
};

// ../markgraf/output/Markgraf.Layout.LayerAssignment.NetworkSimplex/index.js
var foldl21 = /* @__PURE__ */ foldl(foldableList);
var max16 = /* @__PURE__ */ max(ordInt);
var add8 = /* @__PURE__ */ add(semiringInt);
var map16 = /* @__PURE__ */ map(functorMap);
var append21 = /* @__PURE__ */ append(semigroupArray);
var foldl110 = /* @__PURE__ */ foldl(foldableArray);
var fromFoldable20 = /* @__PURE__ */ fromFoldable3(foldableArray)(ordNodeId);
var member8 = /* @__PURE__ */ member2(ordNodeId);
var runNetworkSimplex3 = /* @__PURE__ */ runNetworkSimplex(ordNodeId);
var insertWith11 = /* @__PURE__ */ insertWith(ordNodeId);
var insert20 = /* @__PURE__ */ insert2(ordNodeId);
var lookup25 = /* @__PURE__ */ lookup(ordNodeId);
var eq110 = /* @__PURE__ */ eq(eqNodeId);
var min10 = /* @__PURE__ */ min(ordInt);
var lookup112 = /* @__PURE__ */ lookup(ordInt);
var insert111 = /* @__PURE__ */ insert(ordInt);
var insert25 = /* @__PURE__ */ insert(ordNodeId);
var eq24 = /* @__PURE__ */ eq(/* @__PURE__ */ eqMaybe(eqInt));
var fromFoldable110 = /* @__PURE__ */ fromFoldable2(ordInt)(foldableArray);
var mapFlipped19 = /* @__PURE__ */ mapFlipped(functorArray);
var union7 = /* @__PURE__ */ union(ordNodeId);
var toNEdges = /* @__PURE__ */ mapWithIndex2(function(i) {
  return function(e) {
    return {
      src: e.src,
      tgt: e.tgt,
      delta: 1,
      weight: 1,
      eid: i
    };
  };
});
var stackVertically = function(comps) {
  var shiftOne = function(acc) {
    return function(comp) {
      var maxLayer = foldl21(max16)(0)(values(comp));
      var height = maxLayer + 1 | 0;
      var shifted = (function() {
        var $41 = acc.base === 0;
        if ($41) {
          return comp;
        }
        ;
        return map16(function(v) {
          return v + acc.base | 0;
        })(comp);
      })();
      return {
        base: acc.base + height | 0,
        result: append21(acc.result)([shifted])
      };
    };
  };
  return (function(v) {
    return v.result;
  })(foldl110(shiftOne)({
    base: 0,
    result: []
  })(comps));
};
var runOnComponent = function(compNodes) {
  return function(rawEdges) {
    var nodeSet = fromFoldable20(compNodes);
    var edgesInComp = filter(function(e) {
      return member8(e.src)(nodeSet) && member8(e.tgt)(nodeSet);
    })(rawEdges);
    return runNetworkSimplex3(compNodes)(toNEdges(edgesInComp));
  };
};
var connectedComponents = function(nodes) {
  return function(rawEdges) {
    var adj = foldl110(function(m) {
      return function(e) {
        var m$prime = insertWith11(append21)(e.src)([e.tgt])(m);
        return insertWith11(append21)(e.tgt)([e.src])(m$prime);
      };
    })(empty2)(rawEdges);
    var expand = function($copy_stack) {
      return function($copy_visited) {
        return function($copy_acc) {
          var $tco_var_stack = $copy_stack;
          var $tco_var_visited = $copy_visited;
          var $tco_done = false;
          var $tco_result;
          function $tco_loop(stack, visited, acc) {
            var v = uncons(stack);
            if (v instanceof Nothing) {
              $tco_done = true;
              return {
                nodes: acc
              };
            }
            ;
            if (v instanceof Just) {
              var $43 = member8(v.value0.head)(visited);
              if ($43) {
                $tco_var_stack = v.value0.tail;
                $tco_var_visited = visited;
                $copy_acc = acc;
                return;
              }
              ;
              var visited$prime = insert20(v.value0.head)(visited);
              var neighbours = fromMaybe([])(lookup25(v.value0.head)(adj));
              $tco_var_stack = append21(v.value0.tail)(neighbours);
              $tco_var_visited = visited$prime;
              $copy_acc = append21(acc)([v.value0.head]);
              return;
            }
            ;
            throw new Error("Failed pattern match at Markgraf.Layout.LayerAssignment.NetworkSimplex (line 94, column 30 - line 101, column 60): " + [v.constructor.name]);
          }
          ;
          while (!$tco_done) {
            $tco_result = $tco_loop($tco_var_stack, $tco_var_visited, $copy_acc);
          }
          ;
          return $tco_result;
        };
      };
    };
    var visit = function(st) {
      return function(node) {
        if (member8(node)(st.visited)) {
          return st;
        }
        ;
        if (otherwise) {
          var comp = expand([node])(st.visited)([]);
          return {
            visited: foldl110(function(s) {
              return function(n) {
                return insert20(n)(s);
              };
            })(st.visited)(comp.nodes),
            components: append21(st.components)([comp.nodes])
          };
        }
        ;
        throw new Error("Failed pattern match at Markgraf.Layout.LayerAssignment.NetworkSimplex (line 85, column 3 - line 92, column 12): " + [st.constructor.name, node.constructor.name]);
      };
    };
    var result = foldl110(visit)({
      visited: empty3,
      components: []
    })(nodes);
    return result.components;
  };
};
var balance = function(nodes) {
  return function(edges) {
    return function(layers0) {
      var minimalSpan = function(n) {
        return function(es) {
          return function(ls) {
            var layerOfL = function(m) {
              return fromMaybe(0)(lookup25(m)(ls));
            };
            var r = foldl110(function(acc) {
              return function(e) {
                var $49 = eq110(e.tgt)(n);
                if ($49) {
                  var s = layerOfL(n) - layerOfL(e.src) | 0;
                  return {
                    mOut: acc.mOut,
                    mIn: min10(acc.mIn)(s)
                  };
                }
                ;
                var $50 = eq110(e.src)(n);
                if ($50) {
                  var s = layerOfL(e.tgt) - layerOfL(n) | 0;
                  return {
                    mIn: acc.mIn,
                    mOut: min10(acc.mOut)(s)
                  };
                }
                ;
                return acc;
              };
            })({
              mIn: 1e9,
              mOut: 1e9
            })(es);
            var mIn = (function() {
              var $51 = r.mIn === 1e9;
              if ($51) {
                return -1 | 0;
              }
              ;
              return r.mIn;
            })();
            var mOut = (function() {
              var $52 = r.mOut === 1e9;
              if ($52) {
                return -1 | 0;
              }
              ;
              return r.mOut;
            })();
            return new Tuple(mIn, mOut);
          };
        };
      };
      var tryMove = function(n) {
        return function(inDeg) {
          return function(outDeg) {
            return function(es) {
              return function(acc) {
                var inD = fromMaybe(0)(lookup25(n)(inDeg));
                var outD = fromMaybe(0)(lookup25(n)(outDeg));
                var $53 = inD !== outD || inD === 0;
                if ($53) {
                  return acc;
                }
                ;
                var curLayer = fromMaybe(0)(lookup25(n)(acc.layers));
                var v = minimalSpan(n)(es)(acc.layers);
                var $55 = v.value0 < 0 || v.value1 < 0;
                if ($55) {
                  return acc;
                }
                ;
                var lo = (curLayer - v.value0 | 0) + 1 | 0;
                var hi = (curLayer + v.value1 | 0) - 1 | 0;
                var $56 = hi < lo;
                if ($56) {
                  return acc;
                }
                ;
                var candidates = range2(lo)(hi);
                var v1 = foldl110(function(b) {
                  return function(i) {
                    var f = fromMaybe(0)(lookup112(i)(acc.filling));
                    var $57 = f < b.bestFill;
                    if ($57) {
                      return {
                        best: i,
                        bestFill: f
                      };
                    }
                    ;
                    return b;
                  };
                })({
                  best: curLayer,
                  bestFill: fromMaybe(0)(lookup112(curLayer)(acc.filling))
                })(candidates);
                var $59 = v1.best === curLayer;
                if ($59) {
                  return acc;
                }
                ;
                var curFill = fromMaybe(0)(lookup112(curLayer)(acc.filling));
                var filling$prime = insert111(curLayer)(curFill - 1 | 0)(insert111(v1.best)(v1.bestFill + 1 | 0)(acc.filling));
                return {
                  layers: insert25(n)(v1.best)(acc.layers),
                  filling: filling$prime
                };
              };
            };
          };
        };
      };
      var countAt = function(l) {
        return function(ls) {
          return foldl110(function(c) {
            return function(k) {
              var $64 = eq24(lookup25(k)(ls))(new Just(l));
              if ($64) {
                return c + 1 | 0;
              }
              ;
              return c;
            };
          })(0)(nodes);
        };
      };
      var byNodeCount = function(keyFn) {
        return foldl110(function(m) {
          return function(e) {
            return insertWith11(add8)(keyFn(e))(1)(m);
          };
        })(empty2);
      };
      var highest = foldl110(function(m) {
        return function(n) {
          return max16(m)(fromMaybe(0)(lookup25(n)(layers0)));
        };
      })(0)(nodes);
      var filling0 = fromFoldable110(mapFlipped19(range2(0)(highest))(function(i) {
        return new Tuple(i, countAt(i)(layers0));
      }));
      var inDegree = byNodeCount(function(v) {
        return v.tgt;
      })(edges);
      var outDegree = byNodeCount(function(v) {
        return v.src;
      })(edges);
      var result = foldl110(function(acc) {
        return function(n) {
          return tryMove(n)(inDegree)(outDegree)(edges)(acc);
        };
      })({
        layers: layers0,
        filling: filling0
      })(nodes);
      return result.layers;
    };
  };
};
var networkSimplex = function(nodes) {
  return function(rawEdges) {
    var components = connectedComponents(nodes)(rawEdges);
    var perComponent = mapFlipped19(components)(function(cn) {
      return runOnComponent(cn)(rawEdges);
    });
    var stacked = stackVertically(perComponent);
    var merged = foldl110(union7)(empty2)(stacked);
    var allEdges = toNEdges(rawEdges);
    return balance(nodes)(allEdges)(merged);
  };
};

// ../markgraf/output/Markgraf.Layout.LayerAssignment/index.js
var lookup26 = /* @__PURE__ */ lookup(ordNodeId);
var foldl22 = /* @__PURE__ */ foldl(foldableArray);
var max17 = /* @__PURE__ */ max(ordInt);
var insert21 = /* @__PURE__ */ insert(ordNodeId);
var foldl111 = /* @__PURE__ */ foldl(foldableList);
var mapFlipped20 = /* @__PURE__ */ mapFlipped(functorArray);
var eq21 = /* @__PURE__ */ eq(/* @__PURE__ */ eqMaybe(eqInt));
var eq111 = /* @__PURE__ */ eq(eqNodeId);
var toUnfoldable11 = /* @__PURE__ */ toUnfoldable(unfoldableArray);
var notEq8 = /* @__PURE__ */ notEq(eqNodeId);
var map17 = /* @__PURE__ */ map(functorMap);
var insertWith12 = /* @__PURE__ */ insertWith(ordNodeId);
var append22 = /* @__PURE__ */ append(semigroupArray);
var LongestPath = /* @__PURE__ */ (function() {
  function LongestPath2() {
  }
  ;
  LongestPath2.value = new LongestPath2();
  return LongestPath2;
})();
var NetworkSimplex = /* @__PURE__ */ (function() {
  function NetworkSimplex2() {
  }
  ;
  NetworkSimplex2.value = new NetworkSimplex2();
  return NetworkSimplex2;
})();
var unifySameLayers = function(groups) {
  return function(ranks) {
    var unifyGroup = function(r) {
      return function(group4) {
        var layers = mapMaybe(function(n) {
          return lookup26(n)(r);
        })(group4);
        var targetLayer = foldl22(max17)(0)(layers);
        return foldl22(function(r$prime) {
          return function(n) {
            return insert21(n)(targetLayer)(r$prime);
          };
        })(r)(group4);
      };
    };
    return foldl22(unifyGroup)(ranks)(groups);
  };
};
var toLayers = function(inputOrder) {
  return function(ranks) {
    var maxLayer = foldl111(max17)(0)(values(ranks));
    var layers = mapFlipped20(range2(0)(maxLayer))(function(l) {
      return filter(function(n) {
        return eq21(lookup26(n)(ranks))(new Just(l));
      })(inputOrder);
    });
    return {
      layers,
      nodeLayer: ranks
    };
  };
};
var sameLayerGroups = /* @__PURE__ */ mapMaybe(function(v) {
  if (v instanceof SameLayer) {
    return new Just(v.value0.nodes);
  }
  ;
  return Nothing.value;
});
var networkSimplexRanks = function(edges) {
  return function(allNodeIds) {
    return function(pinned) {
      var knownNodes = foldl22(function(s) {
        return function(n) {
          return insert21(n)(true)(s);
        };
      })(empty2)(allNodeIds);
      var filterEdge = function(e) {
        var $31 = eq111(e.from.node)(e.to.node);
        if ($31) {
          return Nothing.value;
        }
        ;
        var $32 = !fromMaybe(false)(lookup26(e.from.node)(knownNodes));
        if ($32) {
          return Nothing.value;
        }
        ;
        var $33 = !fromMaybe(false)(lookup26(e.to.node)(knownNodes));
        if ($33) {
          return Nothing.value;
        }
        ;
        return new Just({
          src: e.from.node,
          tgt: e.to.node
        });
      };
      var rawEdges = mapMaybe(filterEdge)(edges);
      var applyPins = function(r) {
        return foldl22(function(m) {
          return function(v) {
            return insert21(v.value0)(v.value1)(m);
          };
        })(r)(toUnfoldable11(pinned));
      };
      return applyPins(networkSimplex(allNodeIds)(rawEdges));
    };
  };
};
var longestPath = function(adj) {
  return function(_revAdj) {
    return function(allNodes) {
      return function(pinned) {
        var visit = function(acc) {
          return function(node) {
            var v = lookup26(node)(acc);
            if (v instanceof Just) {
              return acc;
            }
            ;
            if (v instanceof Nothing) {
              var children = filter(function(v1) {
                return notEq8(v1)(node);
              })(fromMaybe([])(lookup26(node)(adj)));
              var acc$prime = foldl22(visit)(acc)(children);
              var childHeights = mapMaybe(function(c) {
                return lookup26(c)(acc$prime);
              })(children);
              var h = 1 + foldl22(max17)(0)(childHeights) | 0;
              return insert21(node)(h)(acc$prime);
            }
            ;
            throw new Error("Failed pattern match at Markgraf.Layout.LayerAssignment (line 65, column 20 - line 72, column 27): " + [v.constructor.name]);
          };
        };
        var heights = foldl22(visit)(empty2)(allNodes);
        var totalLayers = foldl111(max17)(1)(values(heights));
        var ranks = map17(function(h) {
          return totalLayers - h | 0;
        })(heights);
        var applyPins = function(r) {
          return foldl22(function(m) {
            return function(v) {
              return insert21(v.value0)(v.value1)(m);
            };
          })(r)(toUnfoldable11(pinned));
        };
        return applyPins(ranks);
      };
    };
  };
};
var layerPins = /* @__PURE__ */ (function() {
  var go = function(acc) {
    return function(v) {
      if (v instanceof LayerConstraint && v.value0.pin instanceof SpecificLayer) {
        return insert21(v.value0.node)(v.value0.pin.value0)(acc);
      }
      ;
      if (v instanceof LayerConstraint && v.value0.pin instanceof FirstLayer) {
        return insert21(v.value0.node)(0)(acc);
      }
      ;
      return acc;
    };
  };
  return foldl22(go)(empty2);
})();
var buildRevAdj = /* @__PURE__ */ foldl22(function(m) {
  return function(e) {
    return insertWith12(append22)(e.to.node)([e.from.node])(m);
  };
})(empty2);
var buildAdj2 = /* @__PURE__ */ foldl22(function(m) {
  return function(e) {
    return insertWith12(append22)(e.from.node)([e.to.node])(m);
  };
})(empty2);
var assignLayersWith = function(strat) {
  return function(constraints) {
    return function(edges) {
      return function(allNodeIds) {
        var adj = buildAdj2(edges);
        var revAdj = buildRevAdj(edges);
        var pinned = layerPins(constraints);
        var ranks = (function() {
          if (strat instanceof LongestPath) {
            return longestPath(adj)(revAdj)(allNodeIds)(pinned);
          }
          ;
          if (strat instanceof NetworkSimplex) {
            return networkSimplexRanks(edges)(allNodeIds)(pinned);
          }
          ;
          throw new Error("Failed pattern match at Markgraf.Layout.LayerAssignment (line 37, column 13 - line 39, column 68): " + [strat.constructor.name]);
        })();
        var sameGroups = sameLayerGroups(constraints);
        var ranks$prime = unifySameLayers(sameGroups)(ranks);
        return toLayers(allNodeIds)(ranks$prime);
      };
    };
  };
};

// ../markgraf/output/Markgraf.Layout/index.js
var fromFoldable21 = /* @__PURE__ */ fromFoldable2(ordString)(foldableArray);
var mapFlipped21 = /* @__PURE__ */ mapFlipped(functorArray);
var un7 = /* @__PURE__ */ un();
var lookup27 = /* @__PURE__ */ lookup(ordEdgeId);
var member9 = /* @__PURE__ */ member2(/* @__PURE__ */ ordTuple(ordNodeId)(ordNodeId));
var notEq9 = /* @__PURE__ */ notEq(eqNodeId);
var lookup113 = /* @__PURE__ */ lookup(ordString);
var foldl23 = /* @__PURE__ */ foldl(foldableArray);
var max18 = /* @__PURE__ */ max(ordNumber);
var fromFoldable111 = /* @__PURE__ */ fromFoldable2(ordNodeId)(foldableArray);
var fromFoldable24 = /* @__PURE__ */ fromFoldable2(ordEdgeId)(foldableArray);
var toFineSize = /* @__PURE__ */ map(functorMap)(function(v) {
  return new Tuple(v.value0 * 4, v.value1);
});
var reverseSegments = /* @__PURE__ */ (function() {
  var flipEnds = function(s) {
    return {
      start: s.end,
      end: s.start,
      direction: s.direction
    };
  };
  var $56 = map(functorArray)(flipEnds);
  return function($57) {
    return reverse($56($57));
  };
})();
var emptyPath = function(eid) {
  return {
    edge: eid,
    segments: [],
    bends: [],
    bendType: [],
    jumps: [],
    reversed: false
  };
};
var stitchChains = function(chains) {
  return function(reversedSet) {
    return function(originalKeyById) {
      return function(segmentPaths) {
        var pathBySegId = fromFoldable21(mapFlipped21(segmentPaths)(function(p) {
          return new Tuple(un7(EdgeId)(p.edge), p);
        }));
        var isReversed = function(eid) {
          var v = lookup27(eid)(originalKeyById);
          if (v instanceof Just) {
            return member9(v.value0)(reversedSet);
          }
          ;
          if (v instanceof Nothing) {
            return false;
          }
          ;
          throw new Error("Failed pattern match at Markgraf.Layout (line 221, column 20 - line 223, column 21): " + [v.constructor.name]);
        };
        var chainIsReversed = function(chain) {
          var v = head(chain.nodes);
          var v1 = lookup27(chain.edgeId)(originalKeyById);
          if (v1 instanceof Just && v instanceof Just) {
            return notEq9(v.value0)(v1.value0.value0);
          }
          ;
          return false;
        };
        var stitchOne = function(chain) {
          if (length(chain.nodes) <= 2) {
            var v = lookup113(un7(EdgeId)(chain.edgeId))(pathBySegId);
            if (v instanceof Just) {
              var r = chainIsReversed(chain);
              var oriented = (function() {
                if (r) {
                  return reverseSegments(v.value0.segments);
                }
                ;
                return v.value0.segments;
              })();
              var segs = mergeCollinear(removeZeroLength(oriented));
              return {
                bendType: v.value0.bendType,
                jumps: v.value0.jumps,
                edge: chain.edgeId,
                segments: segs,
                bends: zipWith(function(s) {
                  return function(v2) {
                    return s.end;
                  };
                })(segs)(drop(1)(segs)),
                reversed: r
              };
            }
            ;
            if (v instanceof Nothing) {
              return emptyPath(chain.edgeId);
            }
            ;
            throw new Error("Failed pattern match at Markgraf.Layout (line 233, column 35 - line 239, column 42): " + [v.constructor.name]);
          }
          ;
          if (otherwise) {
            var segIds = zipWith(function(a) {
              return function(b) {
                return un7(EdgeId)(chain.edgeId) + (":" + (un7(NodeId)(a) + ("->" + un7(NodeId)(b))));
              };
            })(chain.nodes)(drop(1)(chain.nodes));
            var segPaths = mapMaybe(function(sid) {
              return lookup113(sid)(pathBySegId);
            })(segIds);
            var raw = concatMap(function(v2) {
              return v2.segments;
            })(segPaths);
            var r = chainIsReversed(chain);
            var oriented = (function() {
              if (r) {
                return reverseSegments(raw);
              }
              ;
              return raw;
            })();
            var merged = mergeCollinear(removeZeroLength(oriented));
            return {
              edge: chain.edgeId,
              segments: merged,
              bends: zipWith(function(s) {
                return function(v2) {
                  return s.end;
                };
              })(merged)(drop(1)(merged)),
              bendType: [],
              jumps: [],
              reversed: r
            };
          }
          ;
          throw new Error("Failed pattern match at Markgraf.Layout (line 232, column 3 - line 253, column 10): " + [chain.constructor.name]);
        };
        return mapFlipped21(chains)(stitchOne);
      };
    };
  };
};
var dummyPlaceholder = {
  layers: [],
  edges: [],
  chains: []
};
var defaultConfig = /* @__PURE__ */ (function() {
  return {
    nodeGap: 3,
    layerGap: 2,
    iterations: 8,
    maxGapCount: 2,
    layerer: NetworkSimplex.value,
    cycleBreaker: Greedy.value,
    compactPostRouting: true,
    compactionSpacings: defaultBetweenLayersSpacings
  };
})();
var boundingBox = function(placements) {
  var maxX = foldl23(function(mx) {
    return function(p) {
      return max18(mx)(gridX(p.position) + sizeW(p.size));
    };
  })(0)(placements);
  var maxY = foldl23(function(my) {
    return function(p) {
      return max18(my)(gridY(p.position) + sizeH(p.size));
    };
  })(0)(placements);
  return {
    pos: new Tuple(0, 0),
    size: new Tuple(maxX, maxY)
  };
};
var finalize = function(cfg) {
  return function(graph) {
    return function(pipeline) {
      var portMap = fromFoldable111(mapFlipped21(graph.nodes)(function(n) {
        return new Tuple(n.id, n.ports);
      }));
      var sizeMap = fromFoldable111(mapFlipped21(graph.nodes)(function(n) {
        return new Tuple(n.id, n.size);
      }));
      var regularDummyEdges = filter(function(e) {
        return notEq9(e.from.node)(e.to.node);
      })(pipeline.withDummies.edges);
      var portOffsets = distributePorts(pipeline.ordered)(regularDummyEdges)(toFineSize(sizeMap));
      var realPlacements = filter(function(p) {
        return !isDummy(p.node);
      })(pipeline.placements);
      var segmentPaths = routeAll(pipeline.withDummies.edges)(pipeline.placements)(portMap)(pipeline.withDummies.chains)(portOffsets);
      var originalKeyById = fromFoldable24(mapFlipped21(graph.edges)(function(e) {
        return new Tuple(e.id, new Tuple(e.from.node, e.to.node));
      }));
      var stitched = stitchChains(pipeline.withDummies.chains)(pipeline.acyclic.reversedEdges)(originalKeyById)(segmentPaths);
      var compacted = (function() {
        if (cfg.compactPostRouting) {
          return compactPostRouting(EdgeLength.value)(cfg.compactionSpacings)({
            nodes: realPlacements,
            edges: graph.edges,
            paths: stitched,
            ports: portMap
          });
        }
        ;
        return {
          nodes: realPlacements,
          edges: stitched
        };
      })();
      var simplified = mapFlipped21(compacted.edges)(function(p) {
        var segs = mergeCollinear(removeZeroLength(p.segments));
        return {
          bendType: p.bendType,
          edge: p.edge,
          jumps: p.jumps,
          reversed: p.reversed,
          segments: segs,
          bends: zipWith(function(s) {
            return function(v1) {
              return s.end;
            };
          })(segs)(drop(1)(segs))
        };
      });
      var withJumps = detectJumps(simplified);
      var metrics = allMetrics(compacted.nodes)(withJumps)(0);
      var bbox2 = boundingBox(compacted.nodes);
      return {
        nodes: compacted.nodes,
        edges: withJumps,
        boundingBox: bbox2,
        metrics
      };
    };
  };
};
var fromCoords = function(cfg) {
  return function(graph) {
    return function(pipeline) {
      var sizeMap = fromFoldable111(mapFlipped21(graph.nodes)(function(n) {
        return new Tuple(n.id, n.size);
      }));
      var portMap = fromFoldable111(mapFlipped21(graph.nodes)(function(n) {
        return new Tuple(n.id, n.ports);
      }));
      var portOffsets = distributePorts(pipeline.ordered)(pipeline.withDummies.edges)(toFineSize(sizeMap));
      var placements = assign({
        nodeGap: cfg.nodeGap,
        layerGap: cfg.layerGap
      })(graph.constraints)(pipeline.ordered)(sizeMap)(portMap)(pipeline.withDummies.edges)(pipeline.withDummies.chains)(portOffsets);
      var pipeline$prime = {
        acyclic: pipeline.acyclic,
        layered: pipeline.layered,
        ordered: pipeline.ordered,
        withDummies: pipeline.withDummies,
        placements
      };
      var result = finalize(cfg)(graph)(pipeline$prime);
      return {
        pipeline: pipeline$prime,
        result
      };
    };
  };
};
var fromCrossMin = function(cfg) {
  return function(graph) {
    return function(pipeline) {
      var modelOrder = fromFoldable111(mapWithIndex2(function(i) {
        return function(n) {
          return new Tuple(n.id, i);
        };
      })(graph.nodes));
      var ordered = minimize({
        iterations: cfg.iterations,
        constraints: graph.constraints,
        modelOrder
      })(pipeline.withDummies.layers)(pipeline.withDummies.edges);
      var pipeline$prime = {
        acyclic: pipeline.acyclic,
        layered: pipeline.layered,
        placements: pipeline.placements,
        withDummies: pipeline.withDummies,
        ordered
      };
      return fromCoords(cfg)(graph)(pipeline$prime);
    };
  };
};
var fromDummies = function(cfg) {
  return function(graph) {
    return function(pipeline) {
      var withDummies = insertDummies(pipeline.layered.nodeLayer)(pipeline.acyclic.edges)(pipeline.layered.layers);
      var pipeline$prime = {
        acyclic: pipeline.acyclic,
        layered: pipeline.layered,
        ordered: pipeline.ordered,
        placements: pipeline.placements,
        withDummies
      };
      return fromCrossMin(cfg)(graph)(pipeline$prime);
    };
  };
};
var full = function(cfg) {
  return function(graph) {
    var allNodeIds = mapFlipped21(graph.nodes)(function(v) {
      return v.id;
    });
    var acyclic = makeAcyclicWithOrder(cfg.cycleBreaker)(allNodeIds)(graph.constraints)(graph.edges);
    var layered = assignLayersWith(cfg.layerer)(graph.constraints)(acyclic.edges)(allNodeIds);
    var pipeline = {
      acyclic,
      layered,
      withDummies: dummyPlaceholder,
      ordered: [],
      placements: []
    };
    return fromDummies(cfg)(graph)(pipeline);
  };
};
var layout = function(cfg) {
  return function(graph) {
    return full(cfg)(graph).result;
  };
};

// ../markgraf/output/Markgraf.ShapeBoundary/index.js
var min11 = /* @__PURE__ */ min(ordNumber);
var TopSide = /* @__PURE__ */ (function() {
  function TopSide2() {
  }
  ;
  TopSide2.value = new TopSide2();
  return TopSide2;
})();
var BottomSide = /* @__PURE__ */ (function() {
  function BottomSide2() {
  }
  ;
  BottomSide2.value = new BottomSide2();
  return BottomSide2;
})();
var LeftSide = /* @__PURE__ */ (function() {
  function LeftSide2() {
  }
  ;
  LeftSide2.value = new LeftSide2();
  return LeftSide2;
})();
var RightSide = /* @__PURE__ */ (function() {
  function RightSide2() {
  }
  ;
  RightSide2.value = new RightSide2();
  return RightSide2;
})();
var sq = function(x) {
  return x * x;
};
var cylinderRy = function(b) {
  return min11(b.h * 0.12)(b.w * 0.2);
};
var clamp01 = /* @__PURE__ */ clamp(ordNumber)(0)(1);
var ellipseY = function(b) {
  return function(sign2) {
    return function(x) {
      var ry = cylinderRy(b);
      var rx = b.w / 2;
      var cy = (function() {
        var $19 = sign2 < 0;
        if ($19) {
          return b.y + ry;
        }
        ;
        return b.y + b.h - ry;
      })();
      var cx = b.x + rx;
      var normX = (x - cx) / rx;
      return cy + sign2 * ry * sqrt(clamp01(1 - sq(normX)));
    };
  };
};
var shapeBoundary = function($copy_v) {
  return function($copy_v1) {
    return function($copy_v2) {
      return function($copy_v3) {
        var $tco_var_v = $copy_v;
        var $tco_var_v1 = $copy_v1;
        var $tco_var_v2 = $copy_v2;
        var $tco_done = false;
        var $tco_result;
        function $tco_loop(v, v1, v2, v3) {
          if (v instanceof Rectangle && v2 instanceof TopSide) {
            $tco_done = true;
            return v1.y;
          }
          ;
          if (v instanceof Rectangle && v2 instanceof BottomSide) {
            $tco_done = true;
            return v1.y + v1.h;
          }
          ;
          if (v instanceof Rectangle && v2 instanceof LeftSide) {
            $tco_done = true;
            return v1.x;
          }
          ;
          if (v instanceof Rectangle && v2 instanceof RightSide) {
            $tco_done = true;
            return v1.x + v1.w;
          }
          ;
          if (v instanceof Cylinder && v2 instanceof TopSide) {
            $tco_done = true;
            return ellipseY(v1)(-1)(v3);
          }
          ;
          if (v instanceof Cylinder && v2 instanceof BottomSide) {
            $tco_done = true;
            return ellipseY(v1)(1)(v3);
          }
          ;
          if (v instanceof Cylinder && v2 instanceof LeftSide) {
            $tco_done = true;
            return v1.x;
          }
          ;
          if (v instanceof Cylinder && v2 instanceof RightSide) {
            $tco_done = true;
            return v1.x + v1.w;
          }
          ;
          $tco_var_v = Rectangle.value;
          $tco_var_v1 = v1;
          $tco_var_v2 = v2;
          $copy_v3 = v3;
          return;
        }
        ;
        while (!$tco_done) {
          $tco_result = $tco_loop($tco_var_v, $tco_var_v1, $tco_var_v2, $copy_v3);
        }
        ;
        return $tco_result;
      };
    };
  };
};
var absN = function(n) {
  var $24 = n < 0;
  if ($24) {
    return -n;
  }
  ;
  return n;
};
var sideOfPoint = function(b) {
  return function(p) {
    var dTop = absN(p.y - b.y);
    var dRight = absN(p.x - (b.x + b.w));
    var dLeft = absN(p.x - b.x);
    var dBot = absN(p.y - (b.y + b.h));
    var pick = (function() {
      if (dTop <= dBot && (dTop <= dLeft && dTop <= dRight)) {
        return TopSide.value;
      }
      ;
      if (dBot <= dLeft && dBot <= dRight) {
        return BottomSide.value;
      }
      ;
      if (dLeft <= dRight) {
        return LeftSide.value;
      }
      ;
      if (otherwise) {
        return RightSide.value;
      }
      ;
      throw new Error("Failed pattern match at Markgraf.ShapeBoundary (line 70, column 3 - line 74, column 28): ");
    })();
    return pick;
  };
};

// ../markgraf/output/Markgraf.Animation.Layout.FromELK/index.js
var toUnfoldable12 = /* @__PURE__ */ toUnfoldable(unfoldableArray);
var map18 = /* @__PURE__ */ map(functorMaybe);
var bind10 = /* @__PURE__ */ bind(bindMaybe);
var lookup28 = /* @__PURE__ */ lookup(ordEdgeId);
var lookup114 = /* @__PURE__ */ lookup(ordNodeId);
var fromFoldable25 = /* @__PURE__ */ fromFoldable2(ordEdgeId)(foldableArray);
var mapFlipped22 = /* @__PURE__ */ mapFlipped(functorArray);
var un8 = /* @__PURE__ */ un();
var eq25 = /* @__PURE__ */ eq(eqEdgeId);
var member10 = /* @__PURE__ */ member2(ordNodeId);
var member13 = /* @__PURE__ */ member2(ordEdgeId);
var fromFoldable26 = /* @__PURE__ */ fromFoldable3(foldableArray);
var fromFoldable34 = /* @__PURE__ */ fromFoldable26(ordNodeId);
var map19 = /* @__PURE__ */ map(functorArray);
var fromFoldable42 = /* @__PURE__ */ fromFoldable(foldableSet);
var fromFoldable52 = /* @__PURE__ */ fromFoldable26(ordEdgeId);
var append23 = /* @__PURE__ */ append(semigroupArray);
var fromFoldable62 = /* @__PURE__ */ fromFoldable2(ordNodeId)(foldableArray);
var trimEdgesToShapes = function(edgeEnds) {
  return function(layout2) {
    var within = function(lo) {
      return function(span3) {
        return function(v) {
          return v >= lo - 0.5 && v <= lo + span3 + 0.5;
        };
      };
    };
    var snap = function(np) {
      return function(p) {
        var box = {
          x: np.x,
          y: np.y,
          w: np.w,
          h: np.h
        };
        var side = sideOfPoint(box)(p);
        if (side instanceof TopSide) {
          return {
            x: p.x,
            y: shapeBoundary(np.shape)(box)(TopSide.value)(p.x)
          };
        }
        ;
        if (side instanceof BottomSide) {
          return {
            x: p.x,
            y: shapeBoundary(np.shape)(box)(BottomSide.value)(p.x)
          };
        }
        ;
        if (side instanceof LeftSide) {
          return {
            y: p.y,
            x: shapeBoundary(np.shape)(box)(LeftSide.value)(p.y)
          };
        }
        ;
        if (side instanceof RightSide) {
          return {
            y: p.y,
            x: shapeBoundary(np.shape)(box)(RightSide.value)(p.y)
          };
        }
        ;
        throw new Error("Failed pattern match at Markgraf.Animation.Layout.FromELK (line 414, column 5 - line 418, column 70): " + [side.constructor.name]);
      };
    };
    var pairs = toUnfoldable12(layout2.edges);
    var neighbourOf = function(rest) {
      return map18(function(v) {
        return v.head;
      })(uncons(rest));
    };
    var lastNeighbour = function(rest) {
      return map18(function(v) {
        return v.last;
      })(unsnoc(rest));
    };
    var absDiff = function(a) {
      return function(b) {
        var $95 = a > b;
        if ($95) {
          return a - b;
        }
        ;
        return b - a;
      };
    };
    var aligned = function(a) {
      return function(b) {
        return absDiff(a)(b) < 0.5;
      };
    };
    var snapToward = function(np) {
      return function(neighbour) {
        return function(p) {
          var box = {
            x: np.x,
            y: np.y,
            w: np.w,
            h: np.h
          };
          var approachSide = function(n) {
            if (aligned(n.x)(p.x) && within(box.x)(box.w)(p.x)) {
              var $97 = n.y >= box.y + box.h;
              if ($97) {
                return new Just(BottomSide.value);
              }
              ;
              var $98 = n.y <= box.y;
              if ($98) {
                return new Just(TopSide.value);
              }
              ;
              return Nothing.value;
            }
            ;
            if (aligned(n.y)(p.y) && within(box.y)(box.h)(p.y)) {
              var $99 = n.x >= box.x + box.w;
              if ($99) {
                return new Just(RightSide.value);
              }
              ;
              var $100 = n.x <= box.x;
              if ($100) {
                return new Just(LeftSide.value);
              }
              ;
              return Nothing.value;
            }
            ;
            if (otherwise) {
              return Nothing.value;
            }
            ;
            throw new Error("Failed pattern match at Markgraf.Animation.Layout.FromELK (line 396, column 5 - line 405, column 28): " + [n.constructor.name]);
          };
          var v = bind10(neighbour)(approachSide);
          if (v instanceof Just && v.value0 instanceof TopSide) {
            return {
              x: p.x,
              y: shapeBoundary(np.shape)(box)(TopSide.value)(p.x)
            };
          }
          ;
          if (v instanceof Just && v.value0 instanceof BottomSide) {
            return {
              x: p.x,
              y: shapeBoundary(np.shape)(box)(BottomSide.value)(p.x)
            };
          }
          ;
          if (v instanceof Just && v.value0 instanceof LeftSide) {
            return {
              y: p.y,
              x: shapeBoundary(np.shape)(box)(LeftSide.value)(p.y)
            };
          }
          ;
          if (v instanceof Just && v.value0 instanceof RightSide) {
            return {
              y: p.y,
              x: shapeBoundary(np.shape)(box)(RightSide.value)(p.y)
            };
          }
          ;
          if (v instanceof Nothing) {
            return snap(np)(p);
          }
          ;
          throw new Error("Failed pattern match at Markgraf.Animation.Layout.FromELK (line 388, column 31 - line 393, column 25): " + [v.constructor.name]);
        };
      };
    };
    var trimSource = function(v) {
      return function(v1) {
        if (v instanceof Nothing) {
          return v1;
        }
        ;
        if (v instanceof Just) {
          var v2 = uncons(v1);
          if (v2 instanceof Nothing) {
            return v1;
          }
          ;
          if (v2 instanceof Just) {
            return cons(snapToward(v.value0)(neighbourOf(v2.value0.tail))(v2.value0.head))(v2.value0.tail);
          }
          ;
          throw new Error("Failed pattern match at Markgraf.Animation.Layout.FromELK (line 366, column 31 - line 368, column 79): " + [v2.constructor.name]);
        }
        ;
        throw new Error("Failed pattern match at Markgraf.Animation.Layout.FromELK (line 365, column 3 - line 365, column 33): " + [v.constructor.name, v1.constructor.name]);
      };
    };
    var trimTarget = function(v) {
      return function(v1) {
        if (v instanceof Nothing) {
          return v1;
        }
        ;
        if (v instanceof Just) {
          var v2 = unsnoc(v1);
          if (v2 instanceof Nothing) {
            return v1;
          }
          ;
          if (v2 instanceof Just) {
            return snoc(v2.value0.init)(snapToward(v.value0)(lastNeighbour(v2.value0.init))(v2.value0.last));
          }
          ;
          throw new Error("Failed pattern match at Markgraf.Animation.Layout.FromELK (line 371, column 31 - line 373, column 81): " + [v2.constructor.name]);
        }
        ;
        throw new Error("Failed pattern match at Markgraf.Animation.Layout.FromELK (line 370, column 3 - line 370, column 33): " + [v.constructor.name, v1.constructor.name]);
      };
    };
    var trimEdge = function(eid) {
      return function(path) {
        var v = lookup28(eid)(edgeEnds);
        if (v instanceof Nothing) {
          return path;
        }
        ;
        if (v instanceof Just) {
          return trimTarget(lookup114(v.value0.value1)(layout2.nodes))(trimSource(lookup114(v.value0.value0)(layout2.nodes))(path));
        }
        ;
        throw new Error("Failed pattern match at Markgraf.Animation.Layout.FromELK (line 359, column 23 - line 363, column 55): " + [v.constructor.name]);
      };
    };
    var trimmed = fromFoldable25(mapFlipped22(pairs)(function(v) {
      return new Tuple(v.value0, trimEdge(v.value0)(v.value1));
    }));
    return {
      nodes: layout2.nodes,
      chipExtras: layout2.chipExtras,
      edgeLabels: layout2.edgeLabels,
      edges: trimmed
    };
  };
};
var setDiff = function(dictOrd) {
  var difference6 = difference2(dictOrd);
  return function(a) {
    return function(b) {
      return difference6(a)(b);
    };
  };
};
var setDiff1 = /* @__PURE__ */ setDiff(ordNodeId);
var setDiff2 = /* @__PURE__ */ setDiff(ordEdgeId);
var resolveLabel2 = function(n) {
  if (n.label instanceof Just) {
    return n.label.value0;
  }
  ;
  if (n.label instanceof Nothing) {
    return un8(NodeId)(n.id);
  }
  ;
  throw new Error("Failed pattern match at Markgraf.Animation.Layout.FromELK (line 241, column 18 - line 243, column 28): " + [n.label.constructor.name]);
};
var resolveEdge = function(anim) {
  return function(inferred) {
    return function(eid) {
      var v = find2(function(e) {
        return eq25(e.id)(eid);
      })(anim.graph.edges);
      if (v instanceof Just) {
        return new Just(v.value0);
      }
      ;
      if (v instanceof Nothing) {
        return lookup28(eid)(inferred);
      }
      ;
      throw new Error("Failed pattern match at Markgraf.Animation.Layout.FromELK (line 302, column 33 - line 304, column 35): " + [v.constructor.name]);
    };
  };
};
var posOf = function(sf3) {
  return function(labels) {
    return function(shapes) {
      return function(np) {
        return {
          x: gridX(np.position) * sf3,
          y: gridY(np.position) * sf3,
          w: sizeW(np.size) * sf3,
          h: sizeH(np.size) * sf3,
          label: (function() {
            var v = lookup114(np.node)(labels);
            if (v instanceof Just) {
              return v.value0;
            }
            ;
            if (v instanceof Nothing) {
              return un8(NodeId)(np.node);
            }
            ;
            throw new Error("Failed pattern match at Markgraf.Animation.Layout.FromELK (line 326, column 12 - line 328, column 35): " + [v.constructor.name]);
          })(),
          shape: fromMaybe(Rectangle.value)(lookup114(np.node)(shapes))
        };
      };
    };
  };
};
var placeholderNode = function(nid) {
  return {
    id: nid,
    size: new Tuple(1, 1),
    ports: [],
    label: new Just(un8(NodeId)(nid)),
    shape: Rectangle.value
  };
};
var nodeEntry = function(sf3) {
  return function(labels) {
    return function(shapes) {
      return function(np) {
        return new Tuple(np.node, posOf(sf3)(labels)(shapes)(np));
      };
    };
  };
};
var inferredEdge = function(s) {
  return {
    id: s.edge,
    from: {
      node: s.from,
      port: Nothing.value
    },
    to: {
      node: s.to,
      port: Nothing.value
    },
    label: Nothing.value
  };
};
var inferEdgesFromScenes = function(anim) {
  var sendData = function(ev) {
    if (ev.kind instanceof SendToken) {
      return new Just(ev.kind.value0);
    }
    ;
    return Nothing.value;
  };
  var sceneSends = function(v) {
    if (v instanceof DataFlow) {
      return mapMaybe(sendData)(v.value0.events);
    }
    ;
    return [];
  };
  var asEdge = function(s) {
    return new Just(new Tuple(s.edge, inferredEdge(s)));
  };
  return fromFoldable25(mapMaybe(asEdge)(concatMap(sceneSends)(anim.scenes)));
};
var unionGraph = function(anim) {
  var unionIds = union4(anim);
  var inferred = inferEdgesFromScenes(anim);
  var includedNodes = filter(function(n) {
    return member10(n.id)(unionIds.nodes);
  })(anim.graph.nodes);
  var includedEdges = filter(function(e) {
    return member13(e.id)(unionIds.edges);
  })(anim.graph.edges);
  var declaredNodeIds = fromFoldable34(map19(function(v) {
    return v.id;
  })(includedNodes));
  var missingNodes = setDiff1(unionIds.nodes)(declaredNodeIds);
  var syntheticNodes = map19(placeholderNode)(fromFoldable42(missingNodes));
  var declaredEdgeIds = fromFoldable52(map19(function(v) {
    return v.id;
  })(includedEdges));
  var missingEdges = setDiff2(unionIds.edges)(declaredEdgeIds);
  var syntheticEdges = mapMaybe(resolveEdge(anim)(inferred))(fromFoldable42(missingEdges));
  return {
    nodes: append23(includedNodes)(syntheticNodes),
    edges: append23(includedEdges)(syntheticEdges),
    constraints: anim.graph.constraints
  };
};
var gridPosToPoint = function(sf3) {
  return function(gp) {
    return {
      x: gridX(gp) * sf3,
      y: gridY(gp) * sf3
    };
  };
};
var pathOf = function(sf3) {
  return function(ep) {
    var v = uncons(ep.segments);
    if (v instanceof Nothing) {
      return [];
    }
    ;
    if (v instanceof Just) {
      return cons(gridPosToPoint(sf3)(v.value0.head.start))(map19((function() {
        var $176 = gridPosToPoint(sf3);
        return function($177) {
          return $176((function(v1) {
            return v1.end;
          })($177));
        };
      })())(cons(v.value0.head)(v.value0.tail)));
    }
    ;
    throw new Error("Failed pattern match at Markgraf.Animation.Layout.FromELK (line 336, column 16 - line 340, column 61): " + [v.constructor.name]);
  };
};
var edgeEntry = function(sf3) {
  return function(ep) {
    return new Tuple(ep.edge, pathOf(sf3)(ep));
  };
};
var fromLayoutResultWithLabels = function(scale) {
  return function(labels) {
    return function(shapes) {
      return function(result) {
        var nodeSf = toNumber(scaleFactor2) * scale;
        return {
          nodes: fromFoldable62(map19(nodeEntry(nodeSf)(labels)(shapes))(result.nodes)),
          edges: fromFoldable25(map19(edgeEntry(scale))(result.edges)),
          chipExtras: empty2,
          edgeLabels: empty2
        };
      };
    };
  };
};
var defaultPixelScale = 8;
var cellPx = /* @__PURE__ */ (function() {
  return toNumber(scaleFactor2) * defaultPixelScale;
})();
var layoutFromAnimationWith = function(widths) {
  return function(anim) {
    var base = autoSize(defaultAutoSizeConfig)(unionGraph(anim));
    var sized = applyMeasuredWidths(cellPx)(widths)(base);
    var edgeEnds = fromFoldable25(mapFlipped22(sized.edges)(function(e) {
      return new Tuple(e.id, new Tuple(e.from.node, e.to.node));
    }));
    var edgeLabels = fromFoldable25(mapMaybe(function(e) {
      return map18(function(l) {
        return new Tuple(e.id, l);
      })(e.label);
    })(sized.edges));
    var labels = fromFoldable62(mapFlipped22(sized.nodes)(function(n) {
      return new Tuple(n.id, resolveLabel2(n));
    }));
    var result = layout(defaultConfig)(sized);
    var shapes = fromFoldable62(mapFlipped22(sized.nodes)(function(n) {
      return new Tuple(n.id, n.shape);
    }));
    var v = trimEdgesToShapes(edgeEnds)(fromLayoutResultWithLabels(defaultPixelScale)(labels)(shapes)(result));
    return {
      nodes: v.nodes,
      edges: v.edges,
      chipExtras: v.chipExtras,
      edgeLabels
    };
  };
};
var layoutFromAnimation = /* @__PURE__ */ layoutFromAnimationWith(empty2);

// ../markgraf/output/Markgraf.Animation.Layout/index.js
var map20 = /* @__PURE__ */ map(functorArray);
var sum3 = /* @__PURE__ */ sum(foldableArray)(semiringNumber);
var clamp2 = /* @__PURE__ */ clamp(ordNumber);
var max19 = /* @__PURE__ */ max(ordNumber);
var min12 = /* @__PURE__ */ min(ordNumber);
var foldl24 = /* @__PURE__ */ foldl(foldableArray);
var fromFoldable35 = /* @__PURE__ */ fromFoldable(foldableList);
var append110 = /* @__PURE__ */ append(semigroupArray);
var lookup29 = /* @__PURE__ */ lookup(ordNodeId);
var un9 = /* @__PURE__ */ un();
var Placement = function(x) {
  return x;
};
var InteriorTrees = function(x) {
  return x;
};
var eqPlacement = {
  eq: function(x) {
    return function(y) {
      return x.scale === y.scale && x.tx === y.tx && x.ty === y.ty;
    };
  }
};
var silhouetteCorners = function(np) {
  var over2 = silhouetteOverflow(np.shape)(np.w)(np.h);
  return [{
    x: np.x - over2.left,
    y: np.y - over2.top
  }, {
    x: np.x + np.w + over2.right,
    y: np.y + np.h + over2.bottom
  }];
};
var pointAt = function(path) {
  return function(t) {
    var segLen = function(a) {
      return function(b) {
        var dy = b.y - a.y;
        var dx = b.x - a.x;
        return sqrt(dx * dx + dy * dy);
      };
    };
    var mkSeg = function(a) {
      return function(b) {
        return {
          a,
          b,
          len: segLen(a)(b)
        };
      };
    };
    var segs = zipWith(mkSeg)(path)(drop(1)(path));
    var total = sum3(map20(function(v2) {
      return v2.len;
    })(segs));
    var target = clamp2(0)(total)(t * total);
    var lerpPt = function(a) {
      return function(b) {
        return function(u) {
          return {
            x: a.x + (b.x - a.x) * u,
            y: a.y + (b.y - a.y) * u
          };
        };
      };
    };
    var walk = function($copy_arr) {
      return function($copy_remaining) {
        return function($copy_fallback) {
          var $tco_var_arr = $copy_arr;
          var $tco_var_remaining = $copy_remaining;
          var $tco_done = false;
          var $tco_result;
          function $tco_loop(arr, remaining, fallback) {
            var v2 = uncons(arr);
            if (v2 instanceof Nothing) {
              var v1 = last(path);
              if (v1 instanceof Just) {
                $tco_done = true;
                return v1.value0;
              }
              ;
              if (v1 instanceof Nothing) {
                $tco_done = true;
                return fallback;
              }
              ;
              throw new Error("Failed pattern match at Markgraf.Animation.Layout (line 62, column 16 - line 64, column 26): " + [v1.constructor.name]);
            }
            ;
            if (v2 instanceof Just) {
              if (remaining <= v2.value0.head.len) {
                $tco_done = true;
                return lerpPt(v2.value0.head.a)(v2.value0.head.b)((function() {
                  var $130 = v2.value0.head.len <= 0;
                  if ($130) {
                    return 0;
                  }
                  ;
                  return remaining / v2.value0.head.len;
                })());
              }
              ;
              if (otherwise) {
                $tco_var_arr = v2.value0.tail;
                $tco_var_remaining = remaining - v2.value0.head.len;
                $copy_fallback = fallback;
                return;
              }
              ;
            }
            ;
            throw new Error("Failed pattern match at Markgraf.Animation.Layout (line 61, column 33 - line 68, column 62): " + [v2.constructor.name]);
          }
          ;
          while (!$tco_done) {
            $tco_result = $tco_loop($tco_var_arr, $tco_var_remaining, $copy_fallback);
          }
          ;
          return $tco_result;
        };
      };
    };
    var v = head(path);
    if (v instanceof Nothing) {
      return Nothing.value;
    }
    ;
    if (v instanceof Just) {
      return new Just(walk(segs)(target)(v.value0));
    }
    ;
    throw new Error("Failed pattern match at Markgraf.Animation.Layout (line 49, column 18 - line 51, column 46): " + [v.constructor.name]);
  };
};
var placementInsetRatio = 0.15;
var placementEpsilon = 1;
var placeBBox = function(v) {
  return function(b) {
    return {
      x: b.x * v.scale + v.tx,
      y: b.y * v.scale + v.ty,
      w: b.w * v.scale,
      h: b.h * v.scale
    };
  };
};
var pathLength = function(path) {
  var dist = function(a) {
    return function(b) {
      var dy = b.y - a.y;
      var dx = b.x - a.x;
      return sqrt(dx * dx + dy * dy);
    };
  };
  return sum3(zipWith(dist)(path)(drop(1)(path)));
};
var tokenDotAt = function(path) {
  return function(sourceCenter) {
    return function(targetCenter) {
      return function(raw) {
        return function(holds) {
          var pathStart = fromMaybe(sourceCenter)(head(path));
          var pathEnd = fromMaybe(targetCenter)(last(path));
          var motionFrac = max19(0.05)(1 - holds.pre - holds.post);
          var progress = (function() {
            var $138 = raw < holds.pre;
            if ($138) {
              return 0;
            }
            ;
            var $139 = raw > 1 - holds.post;
            if ($139) {
              return 1;
            }
            ;
            return (raw - holds.pre) / motionFrac;
          })();
          var lerpPt = function(a) {
            return function(b) {
              return function(u) {
                return {
                  x: a.x + (b.x - a.x) * u,
                  y: a.y + (b.y - a.y) * u
                };
              };
            };
          };
          var absN2 = function(n) {
            var $140 = n < 0;
            if ($140) {
              return -n;
            }
            ;
            return n;
          };
          var manhattanIn = 2 * (absN2(pathEnd.x - targetCenter.x) + absN2(pathEnd.y - targetCenter.y));
          var manhattanOut = 2 * (absN2(pathStart.x - sourceCenter.x) + absN2(pathStart.y - sourceCenter.y));
          var totalDist = manhattanOut + pathLength(path) + manhattanIn;
          var morphInStart = (function() {
            var $141 = totalDist <= 1e-4;
            if ($141) {
              return 1;
            }
            ;
            return 1 - manhattanIn / totalDist;
          })();
          var morphOutEnd = (function() {
            var $142 = totalDist <= 1e-4;
            if ($142) {
              return 0;
            }
            ;
            return manhattanOut / totalDist;
          })();
          var $143 = progress <= morphOutEnd;
          if ($143) {
            return lerpPt(sourceCenter)(pathStart)((function() {
              var $144 = morphOutEnd <= 1e-4;
              if ($144) {
                return 1;
              }
              ;
              return progress / morphOutEnd;
            })());
          }
          ;
          var $145 = progress >= morphInStart;
          if ($145) {
            return lerpPt(pathEnd)(targetCenter)((function() {
              var $146 = morphInStart >= 1;
              if ($146) {
                return 0;
              }
              ;
              return (progress - morphInStart) / (1 - morphInStart);
            })());
          }
          ;
          return fromMaybe(pathStart)(pointAt(path)((progress - morphOutEnd) / max19(1e-4)(morphInStart - morphOutEnd)));
        };
      };
    };
  };
};
var insetFor = function(np) {
  return max19(4)(placementInsetRatio * min12(np.w)(np.h));
};
var placementFor = function(cb) {
  return function(np) {
    var inset = insetFor(np);
    var childW = max19(placementEpsilon)(cb.w);
    var childH = max19(placementEpsilon)(cb.h);
    var availW = max19(placementEpsilon)(np.w - 2 * inset);
    var availH = max19(placementEpsilon)(np.h - 2 * inset);
    var scale = min12(availW / childW)(availH / childH);
    var fitH = childH * scale;
    var fitW = childW * scale;
    var tx = np.x + inset + (availW - fitW) / 2 - cb.x * scale;
    var ty = np.y + inset + (availH - fitH) / 2 - cb.y * scale;
    return {
      scale,
      tx,
      ty
    };
  };
};
var identityPlacement = {
  scale: 1,
  tx: 0,
  ty: 0
};
var composePlacement = function(v) {
  return function(v1) {
    return {
      scale: v.scale * v1.scale,
      tx: v.scale * v1.tx + v.tx,
      ty: v.scale * v1.ty + v.ty
    };
  };
};
var bbox = function(layout2) {
  var nodeCorners = concatMap(silhouetteCorners)(fromFoldable35(values(layout2.nodes)));
  var initial2 = function(p) {
    return {
      minX: p.x,
      minY: p.y,
      maxX: p.x,
      maxY: p.y
    };
  };
  var finalize2 = function(r) {
    return {
      x: r.minX,
      y: r.minY,
      w: r.maxX - r.minX,
      h: r.maxY - r.minY
    };
  };
  var extend2 = function(acc) {
    return function(p) {
      return {
        minX: min12(acc.minX)(p.x),
        minY: min12(acc.minY)(p.y),
        maxX: max19(acc.maxX)(p.x),
        maxY: max19(acc.maxY)(p.y)
      };
    };
  };
  var edgePoints = concat(fromFoldable35(values(layout2.edges)));
  var collapse = function(ps) {
    var v = uncons(ps);
    if (v instanceof Nothing) {
      return {
        x: 0,
        y: 0,
        w: 0,
        h: 0
      };
    }
    ;
    if (v instanceof Just) {
      return finalize2(foldl24(extend2)(initial2(v.value0.head))(v.value0.tail));
    }
    ;
    throw new Error("Failed pattern match at Markgraf.Animation.Layout (line 255, column 17 - line 257, column 71): " + [v.constructor.name]);
  };
  var chipPoints = concat(fromFoldable35(values(layout2.chipExtras)));
  var points = append110(nodeCorners)(append110(edgePoints)(chipPoints));
  return collapse(points);
};
var composedPlacement = function(root) {
  return function(path) {
    var degenerateRect = {
      x: 0,
      y: 0,
      w: placementEpsilon,
      h: placementEpsilon,
      label: "",
      shape: Rectangle.value
    };
    var parentRectFor = function(parent) {
      return function(head5) {
        return fromMaybe(degenerateRect)(lookup29(head5)(parent.layout.nodes));
      };
    };
    var go = function($copy_parent) {
      return function($copy_segs) {
        return function($copy_acc) {
          var $tco_var_parent = $copy_parent;
          var $tco_var_segs = $copy_segs;
          var $tco_done = false;
          var $tco_result;
          function $tco_loop(parent, segs, acc) {
            var v = uncons(segs);
            if (v instanceof Nothing) {
              $tco_done = true;
              return acc;
            }
            ;
            if (v instanceof Just) {
              var v1 = lookup29(v.value0.head)(un9(InteriorTrees)(parent.interiors));
              if (v1 instanceof Nothing) {
                $tco_done = true;
                return acc;
              }
              ;
              if (v1 instanceof Just) {
                $tco_var_parent = v1.value0;
                $tco_var_segs = v.value0.tail;
                $copy_acc = composePlacement(acc)(placementFor(bbox(v1.value0.layout))(parentRectFor(parent)(v.value0.head)));
                return;
              }
              ;
              throw new Error("Failed pattern match at Markgraf.Animation.Layout (line 189, column 28 - line 193, column 96): " + [v1.constructor.name]);
            }
            ;
            throw new Error("Failed pattern match at Markgraf.Animation.Layout (line 187, column 24 - line 193, column 96): " + [v.constructor.name]);
          }
          ;
          while (!$tco_done) {
            $tco_result = $tco_loop($tco_var_parent, $tco_var_segs, $copy_acc);
          }
          ;
          return $tco_result;
        };
      };
    };
    return go(root)(path)(identityPlacement);
  };
};
var applyPlacement = function(v) {
  return function(pt) {
    return {
      x: pt.x * v.scale + v.tx,
      y: pt.y * v.scale + v.ty
    };
  };
};

// ../markgraf/output/Markgraf.Animation.Camera.Focus/index.js
var append24 = /* @__PURE__ */ append(/* @__PURE__ */ semigroupSet(ordNodeId));
var min13 = /* @__PURE__ */ min(ordNumber);
var max20 = /* @__PURE__ */ max(ordNumber);
var foldl25 = /* @__PURE__ */ foldl(foldableArray);
var lookup115 = /* @__PURE__ */ lookup(ordEdgeId);
var member11 = /* @__PURE__ */ member2(ordNodeId);
var fromFoldable27 = /* @__PURE__ */ fromFoldable3(foldableArray);
var fromFoldable112 = /* @__PURE__ */ fromFoldable27(ordNodeId);
var fromFoldable28 = /* @__PURE__ */ fromFoldable(foldableSet);
var fromFoldable36 = /* @__PURE__ */ fromFoldable27(ordEdgeId);
var toUnfoldable13 = /* @__PURE__ */ toUnfoldable(unfoldableArray);
var append111 = /* @__PURE__ */ append(semigroupArray);
var notEq10 = /* @__PURE__ */ notEq(/* @__PURE__ */ eqRec()(/* @__PURE__ */ eqRowCons(/* @__PURE__ */ eqRowCons(eqRowNil)()({
  reflectSymbol: function() {
    return "y";
  }
})(eqNumber))()({
  reflectSymbol: function() {
    return "x";
  }
})(eqNumber)));
var map21 = /* @__PURE__ */ map(functorMaybe);
var lookup210 = /* @__PURE__ */ lookup(ordNodeId);
var bindFlipped2 = /* @__PURE__ */ bindFlipped(bindMaybe);
var fromFoldable43 = /* @__PURE__ */ fromFoldable2(ordEdgeId)(foldableArray);
var map110 = /* @__PURE__ */ map(functorArray);
var union8 = /* @__PURE__ */ union(ordEdgeId);
var pathBBox = function(path) {
  var init3 = function(p) {
    return {
      minX: p.x,
      minY: p.y,
      maxX: p.x,
      maxY: p.y
    };
  };
  var finish2 = function(r) {
    return {
      x: r.minX,
      y: r.minY,
      w: r.maxX - r.minX,
      h: r.maxY - r.minY
    };
  };
  var extend2 = function(acc) {
    return function(p) {
      return {
        minX: min13(acc.minX)(p.x),
        minY: min13(acc.minY)(p.y),
        maxX: max20(acc.maxX)(p.x),
        maxY: max20(acc.maxY)(p.y)
      };
    };
  };
  var v = uncons(path);
  if (v instanceof Nothing) {
    return {
      x: 0,
      y: 0,
      w: 0,
      h: 0
    };
  }
  ;
  if (v instanceof Just) {
    return finish2(foldl25(extend2)(init3(v.value0.head))(v.value0.tail));
  }
  ;
  throw new Error("Failed pattern match at Markgraf.Animation.Camera.Focus (line 219, column 17 - line 221, column 64): " + [v.constructor.name]);
};
var pointsBBox = function(pts) {
  var v = uncons(pts);
  if (v instanceof Nothing) {
    return Nothing.value;
  }
  ;
  if (v instanceof Just) {
    return new Just(pathBBox(pts));
  }
  ;
  throw new Error("Failed pattern match at Markgraf.Animation.Camera.Focus (line 214, column 18 - line 216, column 32): " + [v.constructor.name]);
};
var otherEndpoints = function(endpoints) {
  return function(originals) {
    return function(eids) {
      var step2 = function(eid) {
        var v = lookup115(eid)(endpoints);
        if (v instanceof Just) {
          return filter(function(n) {
            return !member11(n)(originals);
          })([v.value0.source, v.value0.target]);
        }
        ;
        if (v instanceof Nothing) {
          return [];
        }
        ;
        throw new Error("Failed pattern match at Markgraf.Animation.Camera.Focus (line 208, column 14 - line 211, column 18): " + [v.constructor.name]);
      };
      return fromFoldable112(concatMap(step2)(fromFoldable28(eids)));
    };
  };
};
var nodeToBBox = function(np) {
  return {
    x: np.x,
    y: np.y,
    w: np.w,
    h: np.h
  };
};
var inferFromEvent = function(ev) {
  if (ev.kind instanceof SendToken) {
    return new Just(new Tuple(ev.kind.value0.edge, {
      source: ev.kind.value0.from,
      target: ev.kind.value0.to
    }));
  }
  ;
  return Nothing.value;
};
var inferFromScene = function(v) {
  if (v instanceof DataFlow) {
    return mapMaybe(inferFromEvent)(v.value0.events);
  }
  ;
  return [];
};
var incidentEdges = function(endpoints) {
  return function(nodeIds) {
    var pick = function(v) {
      var $72 = member11(v.value1.source)(nodeIds) || member11(v.value1.target)(nodeIds);
      if ($72) {
        return new Just(v.value0);
      }
      ;
      return Nothing.value;
    };
    return fromFoldable36(mapMaybe(pick)(toUnfoldable13(endpoints)));
  };
};
var endpointChipPointsBBox = function(pts) {
  var v = last(pts);
  var v1 = head(pts);
  if (v1 instanceof Just && (v instanceof Just && notEq10(v1.value0)(v.value0))) {
    return new Just(pathBBox([v1.value0, v.value0]));
  }
  ;
  if (v1 instanceof Just) {
    return new Just(pathBBox([v1.value0]));
  }
  ;
  return Nothing.value;
};
var combineBBoxes = function(bxs) {
  var init3 = function(b) {
    return {
      minX: b.x,
      minY: b.y,
      maxX: b.x + b.w,
      maxY: b.y + b.h
    };
  };
  var finish2 = function(r) {
    return {
      x: r.minX,
      y: r.minY,
      w: r.maxX - r.minX,
      h: r.maxY - r.minY
    };
  };
  var extend2 = function(acc) {
    return function(b) {
      return {
        minX: min13(acc.minX)(b.x),
        minY: min13(acc.minY)(b.y),
        maxX: max20(acc.maxX)(b.x + b.w),
        maxY: max20(acc.maxY)(b.y + b.h)
      };
    };
  };
  var v = uncons(bxs);
  if (v instanceof Nothing) {
    return {
      x: 0,
      y: 0,
      w: 0,
      h: 0
    };
  }
  ;
  if (v instanceof Just) {
    return finish2(foldl25(extend2)(init3(v.value0.head))(v.value0.tail));
  }
  ;
  throw new Error("Failed pattern match at Markgraf.Animation.Camera.Focus (line 236, column 21 - line 238, column 64): " + [v.constructor.name]);
};
var expandedNodesBBox = function(layout2) {
  return function(endpoints) {
    return function(nodeIds) {
      var $94 = isEmpty2(nodeIds);
      if ($94) {
        return bbox(layout2);
      }
      ;
      var incident = incidentEdges(endpoints)(nodeIds);
      var neighbours = otherEndpoints(endpoints)(nodeIds)(incident);
      var pathBoxes = mapMaybe(function(eid) {
        return map21(pathBBox)(lookup115(eid)(layout2.edges));
      })(fromFoldable28(incident));
      var chipBoxes = mapMaybe(function(eid) {
        return bindFlipped2(pointsBBox)(lookup115(eid)(layout2.chipExtras));
      })(fromFoldable28(incident));
      var allNodes = append24(nodeIds)(neighbours);
      var nodeBoxes = mapMaybe(function(nid) {
        return map21(nodeToBBox)(lookup210(nid)(layout2.nodes));
      })(fromFoldable28(allNodes));
      var combined = append111(nodeBoxes)(append111(pathBoxes)(chipBoxes));
      var $95 = $$null(combined);
      if ($95) {
        return bbox(layout2);
      }
      ;
      return combineBBoxes(combined);
    };
  };
};
var tokenFocusBBox = function(layout2) {
  return function(endpoints) {
    return function(eid) {
      var nodeBoxes = (function() {
        var v = lookup115(eid)(endpoints);
        if (v instanceof Just) {
          return mapMaybe(function(nid) {
            return map21(nodeToBBox)(lookup210(nid)(layout2.nodes));
          })([v.value0.source, v.value0.target]);
        }
        ;
        if (v instanceof Nothing) {
          return [];
        }
        ;
        throw new Error("Failed pattern match at Markgraf.Animation.Camera.Focus (line 170, column 15 - line 173, column 18): " + [v.constructor.name]);
      })();
      var endpointChipBox = bindFlipped2(endpointChipPointsBBox)(lookup115(eid)(layout2.chipExtras));
      var boxes = append111(catMaybes([endpointChipBox]))(nodeBoxes);
      var $119 = $$null(boxes);
      if ($119) {
        return expandedNodesBBox(layout2)(endpoints)(empty3);
      }
      ;
      return combineBBoxes(boxes);
    };
  };
};
var buildEdgeEndpoints = function(anim) {
  var inferred = fromFoldable43(concatMap(inferFromScene)(anim.scenes));
  var declaredEntry = function(e) {
    return new Tuple(e.id, {
      source: e.from.node,
      target: e.to.node
    });
  };
  var declared = fromFoldable43(map110(declaredEntry)(anim.graph.edges));
  return union8(declared)(inferred);
};

// ../markgraf/output/Markgraf.Animation.Easing/index.js
var Linear = /* @__PURE__ */ (function() {
  function Linear2() {
  }
  ;
  Linear2.value = new Linear2();
  return Linear2;
})();
var EaseInOutQuad = /* @__PURE__ */ (function() {
  function EaseInOutQuad2() {
  }
  ;
  EaseInOutQuad2.value = new EaseInOutQuad2();
  return EaseInOutQuad2;
})();
var EaseInOutCubic = /* @__PURE__ */ (function() {
  function EaseInOutCubic2() {
  }
  ;
  EaseInOutCubic2.value = new EaseInOutCubic2();
  return EaseInOutCubic2;
})();
var SpringBouncy = /* @__PURE__ */ (function() {
  function SpringBouncy2() {
  }
  ;
  SpringBouncy2.value = new SpringBouncy2();
  return SpringBouncy2;
})();

// ../markgraf/output/Markgraf.Animation.Camera/index.js
var clamp3 = /* @__PURE__ */ clamp(ordNumber);
var max21 = /* @__PURE__ */ max(ordNumber);
var min14 = /* @__PURE__ */ min(ordNumber);
var mapFlipped23 = /* @__PURE__ */ mapFlipped(functorMaybe);
var bind11 = /* @__PURE__ */ bind(bindMaybe);
var compare21 = /* @__PURE__ */ compare(ordInt);
var map23 = /* @__PURE__ */ map(functorArray);
var append25 = /* @__PURE__ */ append(semigroupArray);
var sort4 = /* @__PURE__ */ sort(ordNumber);
var foldl26 = /* @__PURE__ */ foldl(foldableArray);
var max110 = /* @__PURE__ */ max(ordInt);
var Hold2 = /* @__PURE__ */ (function() {
  function Hold3() {
  }
  ;
  Hold3.value = new Hold3();
  return Hold3;
})();
var Gap = /* @__PURE__ */ (function() {
  function Gap2() {
  }
  ;
  Gap2.value = new Gap2();
  return Gap2;
})();
var Move = /* @__PURE__ */ (function() {
  function Move2() {
  }
  ;
  Move2.value = new Move2();
  return Move2;
})();
var LinearLerp = /* @__PURE__ */ (function() {
  function LinearLerp2() {
  }
  ;
  LinearLerp2.value = new LinearLerp2();
  return LinearLerp2;
})();
var LogLerp = /* @__PURE__ */ (function() {
  function LogLerp2() {
  }
  ;
  LogLerp2.value = new LogLerp2();
  return LogLerp2;
})();
var eqSpanKind = {
  eq: function(x) {
    return function(y) {
      if (x instanceof Hold2 && y instanceof Hold2) {
        return true;
      }
      ;
      if (x instanceof Gap && y instanceof Gap) {
        return true;
      }
      ;
      if (x instanceof Move && y instanceof Move) {
        return true;
      }
      ;
      return false;
    };
  }
};
var eq26 = /* @__PURE__ */ eq(eqSpanKind);
var zoomEpsilon = 1e-6;
var transitionDurationFor = function(cfg) {
  return function(a) {
    return function(b) {
      var dy = b.center.y - a.center.y;
      var dx = b.center.x - a.center.x;
      var panDistance = sqrt(dx * dx + dy * dy);
      var panTime = (function() {
        var $64 = cfg.panSpeed <= 0;
        if ($64) {
          return cfg.minTransition;
        }
        ;
        return panDistance / cfg.panSpeed;
      })();
      var abs4 = function(n) {
        var $65 = n < 0;
        if ($65) {
          return -n;
        }
        ;
        return n;
      };
      var zoomDelta = abs4(b.zoom - a.zoom);
      var zoomTime = (function() {
        var $66 = cfg.zoomSpeed <= 0;
        if ($66) {
          return cfg.minTransition;
        }
        ;
        return zoomDelta / cfg.zoomSpeed;
      })();
      return clamp3(cfg.minTransition)(cfg.maxTransition)(max21(panTime)(zoomTime));
    };
  };
};
var sortUnique = /* @__PURE__ */ (function() {
  var push2 = function(acc) {
    return function(x) {
      var v = last(acc);
      if (v instanceof Just && v.value0 === x) {
        return acc;
      }
      ;
      return snoc(acc)(x);
    };
  };
  return foldl2(push2)([]);
})();
var sameCamera = function(a) {
  return function(b) {
    return a.zoom === b.zoom && (a.center.x === b.center.x && a.center.y === b.center.y);
  };
};
var posAtTime = function(samples) {
  return function(t) {
    var origin = {
      x: 0,
      y: 0
    };
    var lerpPos = function(lo) {
      return function(hi) {
        var progress = (function() {
          var $69 = hi.t <= lo.t;
          if ($69) {
            return 0;
          }
          ;
          return (t - lo.t) / (hi.t - lo.t);
        })();
        var cu = clamp3(0)(1)(progress);
        return {
          x: lo.pos.x + (hi.pos.x - lo.pos.x) * cu,
          y: lo.pos.y + (hi.pos.y - lo.pos.y) * cu
        };
      };
    };
    var firstSamplePos = maybe(origin)(function(v3) {
      return v3.pos;
    })(head(samples));
    var bracketsT = function(s) {
      return s.t <= t;
    };
    var v = findLastIndex(bracketsT)(samples);
    if (v instanceof Nothing) {
      return firstSamplePos;
    }
    ;
    if (v instanceof Just) {
      var v1 = index(samples)(v.value0 + 1 | 0);
      var v2 = index(samples)(v.value0);
      if (v2 instanceof Just && v1 instanceof Just) {
        return lerpPos(v2.value0)(v1.value0);
      }
      ;
      if (v2 instanceof Just) {
        return v2.value0.pos;
      }
      ;
      return origin;
    }
    ;
    throw new Error("Failed pattern match at Markgraf.Animation.Camera (line 243, column 23 - line 248, column 19): " + [v.constructor.name]);
  };
};
var nearlyEqualCamera = function(a) {
  return function(b) {
    var absN2 = function(n) {
      var $77 = n < 0;
      if ($77) {
        return -n;
      }
      ;
      return n;
    };
    return absN2(a.center.x - b.center.x) < 8 && (absN2(a.center.y - b.center.y) < 8 && absN2(a.zoom - b.zoom) < 0.08);
  };
};
var liftCameraToRoot = function(v) {
  return function(cam) {
    return {
      center: applyPlacement(v)(cam.center),
      zoom: cam.zoom / max21(zoomEpsilon)(v.scale)
    };
  };
};
var insertLeadIns = function(cfg) {
  return function(_layout) {
    return function(_fitAllCam) {
      return function(spans) {
        var leadDur = function(prev) {
          return function(cur) {
            return min14(transitionDurationFor(cfg)(prev.toCam)(cur.toCam))(prev.endT - prev.startT);
          };
        };
        var shrunkPrev = function(prev) {
          return function(cur) {
            return {
              startT: prev.startT,
              toCam: prev.toCam,
              easing: prev.easing,
              fromCam: prev.fromCam,
              interp: prev.interp,
              endT: cur.startT - leadDur(prev)(cur)
            };
          };
        };
        var isHold = function(s) {
          return sameCamera(s.fromCam)(s.toCam);
        };
        var directTween = function(prev) {
          return function(cur) {
            return {
              startT: cur.startT - leadDur(prev)(cur),
              endT: cur.startT,
              fromCam: prev.toCam,
              toCam: cur.toCam,
              easing: cur.easing,
              interp: LinearLerp.value
            };
          };
        };
        var step2 = function(st) {
          return function(cur) {
            if (st.pending instanceof Nothing) {
              return {
                acc: st.acc,
                pending: new Just(cur)
              };
            }
            ;
            if (st.pending instanceof Just) {
              var $83 = !isHold(cur) || (nearlyEqualCamera(st.pending.value0.toCam)(cur.toCam) || leadDur(st.pending.value0)(cur) <= 0);
              if ($83) {
                return {
                  acc: snoc(st.acc)(st.pending.value0),
                  pending: new Just(cur)
                };
              }
              ;
              return {
                acc: snoc(snoc(st.acc)(shrunkPrev(st.pending.value0)(cur)))(directTween(st.pending.value0)(cur)),
                pending: new Just(cur)
              };
            }
            ;
            throw new Error("Failed pattern match at Markgraf.Animation.Camera (line 295, column 17 - line 303, column 10): " + [st.pending.constructor.name]);
          };
        };
        var v = foldl2(step2)({
          acc: [],
          pending: Nothing.value
        })(spans);
        if (v.pending instanceof Nothing) {
          return v.acc;
        }
        ;
        if (v.pending instanceof Just) {
          return snoc(v.acc)(v.pending.value0);
        }
        ;
        throw new Error("Failed pattern match at Markgraf.Animation.Camera (line 291, column 3 - line 293, column 45): " + [v.constructor.name]);
      };
    };
  };
};
var fillInTweens = function(fitAllCam) {
  return function(raw) {
    var isSettled = function(s) {
      return eq26(s.kind)(Hold2.value) || eq26(s.kind)(Move.value);
    };
    var findNextSettled = function(i) {
      return mapFlipped23(bind11(findIndex(isSettled)(drop(i + 1 | 0)(raw)))(function(idx) {
        return index(raw)((i + 1 | 0) + idx | 0);
      }))(function(v) {
        return v.fromCam;
      });
    };
    var findAdjacent = function(i) {
      return mapFlipped23(bind11(findLastIndex(isSettled)(take(i)(raw)))(index(raw)))(function(v) {
        return v.toCam;
      });
    };
    var resolve = function(i) {
      return function(s) {
        if (s.kind instanceof Hold2) {
          return {
            startT: s.startT,
            endT: s.endT,
            fromCam: s.fromCam,
            toCam: s.toCam,
            easing: s.easing,
            interp: LinearLerp.value
          };
        }
        ;
        if (s.kind instanceof Move) {
          return {
            startT: s.startT,
            endT: s.endT,
            fromCam: s.fromCam,
            toCam: s.toCam,
            easing: Linear.value,
            interp: LinearLerp.value
          };
        }
        ;
        if (s.kind instanceof Gap) {
          return {
            startT: s.startT,
            endT: s.endT,
            fromCam: fromMaybe(fitAllCam)(findAdjacent(i)),
            toCam: fromMaybe(fromMaybe(fitAllCam)(findAdjacent(i)))(findNextSettled(i)),
            easing: s.easing,
            interp: LinearLerp.value
          };
        }
        ;
        throw new Error("Failed pattern match at Markgraf.Animation.Camera (line 217, column 17 - line 230, column 8): " + [s.kind.constructor.name]);
      };
    };
    return mapWithIndex2(resolve)(raw);
  };
};
var defaultCameraConfig = /* @__PURE__ */ (function() {
  return {
    padding: 24,
    easing: Linear.value,
    minZoom: 0.9,
    maxZoom: 2.5,
    tokenZoomFloor: 0,
    panSpeed: 1500,
    zoomSpeed: 4,
    minTransition: 0.15,
    maxTransition: 0.6,
    cameraDecay: 16
  };
})();
var computeZoom = function(layout2) {
  return function(box) {
    return function(padding) {
      var paddedW = box.w + padding * 2;
      var paddedH = box.h + padding * 2;
      var layB = bbox(layout2);
      var $93 = paddedW <= 0 || (paddedH <= 0 || (layB.w <= 0 || layB.h <= 0));
      if ($93) {
        return 1;
      }
      ;
      return min14(layB.w / paddedW)(layB.h / paddedH);
    };
  };
};
var coalesceHolds = /* @__PURE__ */ (function() {
  var isStill = function(s) {
    return sameCamera(s.fromCam)(s.toCam);
  };
  var mergeable = function(prev) {
    return function(cur) {
      return isStill(prev) && (isStill(cur) && nearlyEqualCamera(prev.toCam)(cur.toCam));
    };
  };
  var step2 = function(acc) {
    return function(cur) {
      var v = last(acc);
      if (v instanceof Just && mergeable(v.value0)(cur)) {
        return snoc(dropEnd(1)(acc))({
          fromCam: v.value0.fromCam,
          toCam: v.value0.toCam,
          easing: v.value0.easing,
          interp: v.value0.interp,
          startT: v.value0.startT,
          endT: cur.endT
        });
      }
      ;
      return snoc(acc)(cur);
    };
  };
  return foldl2(step2)([]);
})();
var clampZoomWithFloor = function(cfg) {
  return function(floor3) {
    return function(z) {
      return max21(floor3)(clamp3(cfg.minZoom)(cfg.maxZoom)(z));
    };
  };
};
var bboxToCameraWithFloor = function(cfg) {
  return function(layout2) {
    return function(box) {
      return function(floor3) {
        return {
          center: {
            x: box.x + box.w / 2,
            y: box.y + box.h / 2
          },
          zoom: clampZoomWithFloor(cfg)(floor3)(computeZoom(layout2)(box)(cfg.padding))
        };
      };
    };
  };
};
var bboxToCamera = function(cfg) {
  return function(layout2) {
    return function(box) {
      return bboxToCameraWithFloor(cfg)(layout2)(box)(0);
    };
  };
};
var buildCameraSpansFromIntervals = function(cfg) {
  return function(layout2) {
    return function(totalDuration) {
      return function(intervals) {
        var sortByPriority = sortBy(function(a) {
          return function(b) {
            return compare21(b.priority)(a.priority);
          };
        });
        var pathBoundaries = function(iv) {
          if (iv.pathFollow instanceof Nothing) {
            return [];
          }
          ;
          if (iv.pathFollow instanceof Just) {
            return map23(function(v) {
              return v.t;
            })(iv.pathFollow.value0.samples);
          }
          ;
          throw new Error("Failed pattern match at Markgraf.Animation.Camera (line 156, column 23 - line 158, column 34): " + [iv.pathFollow.constructor.name]);
        };
        var rawTimes = append25([0, totalDuration])(append25(concatMap(function(i) {
          return [i.startT, i.endT];
        })(intervals))(concatMap(pathBoundaries)(intervals)));
        var followEntry = function(a) {
          return function(b) {
            return function(fp) {
              return {
                kind: Move.value,
                startT: a,
                endT: b,
                fromCam: {
                  center: posAtTime(fp.samples)(a),
                  zoom: fp.zoom
                },
                toCam: {
                  center: posAtTime(fp.samples)(b),
                  zoom: fp.zoom
                },
                easing: Linear.value
              };
            };
          };
        };
        var fitAllCam = bboxToCamera(cfg)(layout2)(bbox(layout2));
        var boundaries = filter(function(t) {
          return t >= 0 && t <= totalDuration;
        })(sortUnique(sort4(rawTimes)));
        var activeAt = function(t) {
          return filter(function(iv) {
            return iv.startT <= t && t < iv.endT;
          })(intervals);
        };
        var floorAt = function(t) {
          var $98 = any2(function(iv) {
            return iv.priority >= 1;
          })(activeAt(t));
          if ($98) {
            return cfg.tokenZoomFloor;
          }
          ;
          return 0;
        };
        var heldCam = function(bs) {
          return function(t) {
            return bboxToCameraWithFloor(cfg)(layout2)(combineBBoxes(bs))(floorAt(t));
          };
        };
        var followAt = function(t) {
          return head(mapMaybe(function(v) {
            return v.pathFollow;
          })(sortByPriority(activeAt(t))));
        };
        var topPri = function(t) {
          return foldl26(max110)(0)(map23(function(v) {
            return v.priority;
          })(activeAt(t)));
        };
        var winningStaticAt = function(t) {
          return map23(function(v) {
            return v.bbox;
          })(filter(function(iv) {
            return iv.priority === topPri(t);
          })(activeAt(t)));
        };
        var segmentFor = function(v) {
          var midpoint = (v.value0 + v.value1) / 2;
          var $100 = v.value1 <= v.value0;
          if ($100) {
            return Nothing.value;
          }
          ;
          var v1 = followAt(midpoint);
          if (v1 instanceof Just) {
            return new Just(followEntry(v.value0)(v.value1)(v1.value0));
          }
          ;
          if (v1 instanceof Nothing) {
            var v2 = winningStaticAt(midpoint);
            if (v2.length === 0) {
              return new Just({
                kind: Gap.value,
                startT: v.value0,
                endT: v.value1,
                fromCam: fitAllCam,
                toCam: fitAllCam,
                easing: cfg.easing
              });
            }
            ;
            return new Just({
              kind: Hold2.value,
              startT: v.value0,
              endT: v.value1,
              fromCam: heldCam(v2)(midpoint),
              toCam: heldCam(v2)(midpoint),
              easing: cfg.easing
            });
          }
          ;
          throw new Error("Failed pattern match at Markgraf.Animation.Camera (line 170, column 10 - line 188, column 12): " + [v1.constructor.name]);
        };
        return insertLeadIns(cfg)(layout2)(fitAllCam)(coalesceHolds(fillInTweens(fitAllCam)(mapMaybe(segmentFor)(zip(boundaries)(drop(1)(boundaries))))));
      };
    };
  };
};

// ../markgraf/output/Markgraf.Animation.State/index.js
var FromSource = /* @__PURE__ */ (function() {
  function FromSource2() {
  }
  ;
  FromSource2.value = new FromSource2();
  return FromSource2;
})();
var FromTarget = /* @__PURE__ */ (function() {
  function FromTarget2() {
  }
  ;
  FromTarget2.value = new FromTarget2();
  return FromTarget2;
})();
var FromBoth = /* @__PURE__ */ (function() {
  function FromBoth2() {
  }
  ;
  FromBoth2.value = new FromBoth2();
  return FromBoth2;
})();
var ExtendFromSource = /* @__PURE__ */ (function() {
  function ExtendFromSource2() {
  }
  ;
  ExtendFromSource2.value = new ExtendFromSource2();
  return ExtendFromSource2;
})();

// ../markgraf/output/Markgraf.Animation.Schedule/index.js
var eq112 = /* @__PURE__ */ eq(eqEventId);
var eq62 = /* @__PURE__ */ eq(eqNodeId);
var lookup30 = /* @__PURE__ */ lookup(ordEdgeId);
var un10 = /* @__PURE__ */ un();
var max22 = /* @__PURE__ */ max(ordNumber);
var eq102 = /* @__PURE__ */ eq(eqSchedule);
var fromFoldable29 = /* @__PURE__ */ fromFoldable2(ordEventId)(foldableArray);
var comparing2 = /* @__PURE__ */ comparing(ordNumber);
var eq113 = /* @__PURE__ */ eq(/* @__PURE__ */ eqArray(eqNodeId));
var lookup116 = /* @__PURE__ */ lookup(ordKeyframeId);
var union9 = /* @__PURE__ */ union2(ordNodeId);
var min15 = /* @__PURE__ */ min(ordNumber);
var foldl27 = /* @__PURE__ */ foldl(foldableArray);
var lookup211 = /* @__PURE__ */ lookup(ordNodeId);
var fromFoldable113 = /* @__PURE__ */ fromFoldable(foldableSet);
var member14 = /* @__PURE__ */ member2(ordNodeId);
var lookup33 = /* @__PURE__ */ lookup(ordEventId);
var map24 = /* @__PURE__ */ map(functorArray);
var toUnfoldable14 = /* @__PURE__ */ toUnfoldable3(unfoldableArray);
var append26 = /* @__PURE__ */ append(semigroupArray);
var sort5 = /* @__PURE__ */ sort(ordNumber);
var fromFoldable210 = /* @__PURE__ */ fromFoldable(foldableNonEmptyArray);
var group3 = /* @__PURE__ */ group(eqEventId);
var sort1 = /* @__PURE__ */ sort(ordEventId);
var fromFoldable37 = /* @__PURE__ */ fromFoldable3(foldableArray)(ordEventId);
var member15 = /* @__PURE__ */ member2(ordEventId);
var bind13 = /* @__PURE__ */ bind(bindMaybe);
var pure4 = /* @__PURE__ */ pure(applicativeMaybe);
var insert26 = /* @__PURE__ */ insert2(ordEventId);
var eq122 = /* @__PURE__ */ eq(eqPlacement);
var member23 = /* @__PURE__ */ member(ordKeyframeId);
var bind14 = /* @__PURE__ */ bind(bindEither);
var pure1 = /* @__PURE__ */ pure(applicativeEither);
var NoKeyframes = /* @__PURE__ */ (function() {
  function NoKeyframes2() {
  }
  ;
  NoKeyframes2.value = new NoKeyframes2();
  return NoKeyframes2;
})();
var UnknownKeyframe = /* @__PURE__ */ (function() {
  function UnknownKeyframe2(value0) {
    this.value0 = value0;
  }
  ;
  UnknownKeyframe2.create = function(value0) {
    return new UnknownKeyframe2(value0);
  };
  return UnknownKeyframe2;
})();
var DuplicateEventId = /* @__PURE__ */ (function() {
  function DuplicateEventId2(value0) {
    this.value0 = value0;
  }
  ;
  DuplicateEventId2.create = function(value0) {
    return new DuplicateEventId2(value0);
  };
  return DuplicateEventId2;
})();
var UnknownEvent = /* @__PURE__ */ (function() {
  function UnknownEvent2(value0) {
    this.value0 = value0;
  }
  ;
  UnknownEvent2.create = function(value0) {
    return new UnknownEvent2(value0);
  };
  return UnknownEvent2;
})();
var ScheduleCycle = /* @__PURE__ */ (function() {
  function ScheduleCycle2(value0) {
    this.value0 = value0;
  }
  ;
  ScheduleCycle2.create = function(value0) {
    return new ScheduleCycle2(value0);
  };
  return ScheduleCycle2;
})();
var PlopIn = /* @__PURE__ */ (function() {
  function PlopIn2() {
  }
  ;
  PlopIn2.value = new PlopIn2();
  return PlopIn2;
})();
var PlopOut = /* @__PURE__ */ (function() {
  function PlopOut2() {
  }
  ;
  PlopOut2.value = new PlopOut2();
  return PlopOut2;
})();
var Retract = /* @__PURE__ */ (function() {
  function Retract2(value0) {
    this.value0 = value0;
  }
  ;
  Retract2.create = function(value0) {
    return new Retract2(value0);
  };
  return Retract2;
})();
var Extend = /* @__PURE__ */ (function() {
  function Extend2(value0) {
    this.value0 = value0;
  }
  ;
  Extend2.create = function(value0) {
    return new Extend2(value0);
  };
  return Extend2;
})();
var NodeWindow = /* @__PURE__ */ (function() {
  function NodeWindow2(value0, value1) {
    this.value0 = value0;
    this.value1 = value1;
  }
  ;
  NodeWindow2.create = function(value0) {
    return function(value1) {
      return new NodeWindow2(value0, value1);
    };
  };
  return NodeWindow2;
})();
var EdgeWindow = /* @__PURE__ */ (function() {
  function EdgeWindow2(value0, value1) {
    this.value0 = value0;
    this.value1 = value1;
  }
  ;
  EdgeWindow2.create = function(value0) {
    return function(value1) {
      return new EdgeWindow2(value0, value1);
    };
  };
  return EdgeWindow2;
})();
var TokenWindow = /* @__PURE__ */ (function() {
  function TokenWindow2(value0, value1, value2, value3, value4, value5, value6, value7) {
    this.value0 = value0;
    this.value1 = value1;
    this.value2 = value2;
    this.value3 = value3;
    this.value4 = value4;
    this.value5 = value5;
    this.value6 = value6;
    this.value7 = value7;
  }
  ;
  TokenWindow2.create = function(value0) {
    return function(value1) {
      return function(value2) {
        return function(value3) {
          return function(value4) {
            return function(value5) {
              return function(value6) {
                return function(value7) {
                  return new TokenWindow2(value0, value1, value2, value3, value4, value5, value6, value7);
                };
              };
            };
          };
        };
      };
    };
  };
  return TokenWindow2;
})();
var FillWindow = /* @__PURE__ */ (function() {
  function FillWindow2(value0, value1, value2) {
    this.value0 = value0;
    this.value1 = value1;
    this.value2 = value2;
  }
  ;
  FillWindow2.create = function(value0) {
    return function(value1) {
      return function(value2) {
        return new FillWindow2(value0, value1, value2);
      };
    };
  };
  return FillWindow2;
})();
var DiveIn = /* @__PURE__ */ (function() {
  function DiveIn2() {
  }
  ;
  DiveIn2.value = new DiveIn2();
  return DiveIn2;
})();
var DiveOut = /* @__PURE__ */ (function() {
  function DiveOut2() {
  }
  ;
  DiveOut2.value = new DiveOut2();
  return DiveOut2;
})();
var tokenTiming = function(timing) {
  return function(layout2) {
    return function(hold) {
      return function(s) {
        var worldPathLength = maybe(0)(pathLength)(lookup30(s.edge)(layout2.edges));
        var travelDur = (function() {
          var $233 = timing.tokenSpeed <= 0;
          if ($233) {
            return 0;
          }
          ;
          return worldPathLength / timing.tokenSpeed;
        })();
        var totalChars = foldl2(function(acc) {
          return function(l) {
            return acc + length5(un10(Label)(l)) | 0;
          };
        })(0)(s.labels);
        var readDur = toNumber(totalChars) * timing.tokenReadSecPerChar;
        var motionDur = max22(timing.minTokenDuration)(max22(readDur)(travelDur));
        var duration = motionDur + hold.pre + hold.post;
        return {
          duration,
          holdPre: (function() {
            var $234 = duration <= 0;
            if ($234) {
              return 0;
            }
            ;
            return hold.pre / duration;
          })(),
          holdPost: (function() {
            var $235 = duration <= 0;
            if ($235) {
              return 0;
            }
            ;
            return hold.post / duration;
          })()
        };
      };
    };
  };
};
var tokenHolds = function(timing) {
  return function(events) {
    var endHold = function(chained) {
      if (chained) {
        return 0;
      }
      ;
      return timing.tokenHold;
    };
    var continuesInto = function(when4) {
      return function(fromNode) {
        return function(p) {
          if (p.kind instanceof SendToken) {
            return eq102(when4)(new After(p.id)) && eq62(p.kind.value0.to)(fromNode);
          }
          ;
          if (p.kind instanceof FillNodeWithoutTransition) {
            return false;
          }
          ;
          throw new Error("Failed pattern match at Markgraf.Animation.Schedule (line 1070, column 35 - line 1072, column 41): " + [p.kind.constructor.name]);
        };
      };
    };
    var continuesFrom = function(eid) {
      return function(toNode2) {
        return function(n) {
          if (n.kind instanceof SendToken) {
            return eq102(n.when)(new After(eid)) && eq62(n.kind.value0.from)(toNode2);
          }
          ;
          if (n.kind instanceof FillNodeWithoutTransition) {
            return false;
          }
          ;
          throw new Error("Failed pattern match at Markgraf.Animation.Schedule (line 1077, column 32 - line 1079, column 41): " + [n.kind.constructor.name]);
        };
      };
    };
    var chainedAtTarget = function(e) {
      return function(s) {
        return any2(continuesFrom(e.id)(s.to))(events);
      };
    };
    var chainedAtSource = function(e) {
      return function(s) {
        return any2(continuesInto(e.when)(s.from))(events);
      };
    };
    var holdFor = function(e) {
      if (e.kind instanceof SendToken) {
        return new Just(new Tuple(e.id, {
          pre: endHold(chainedAtSource(e)(e.kind.value0)),
          post: endHold(chainedAtTarget(e)(e.kind.value0))
        }));
      }
      ;
      if (e.kind instanceof FillNodeWithoutTransition) {
        return Nothing.value;
      }
      ;
      throw new Error("Failed pattern match at Markgraf.Animation.Schedule (line 1060, column 15 - line 1063, column 43): " + [e.kind.constructor.name]);
    };
    return fromFoldable29(mapMaybe(holdFor)(events));
  };
};
var toWindow = function(r) {
  if (r.event.kind instanceof SendToken) {
    return new Just({
      startT: r.startT,
      endT: r.endT,
      target: new TokenWindow(r.event.id, r.event.kind.value0.edge, r.event.kind.value0.direction, r.event.kind.value0.from, r.event.kind.value0.to, r.event.kind.value0.labels, r.holdPre, r.holdPost)
    });
  }
  ;
  if (r.event.kind instanceof FillNodeWithoutTransition) {
    return new Just({
      startT: r.startT,
      endT: r.endT,
      target: new FillWindow(r.event.id, r.event.kind.value0.node, r.event.kind.value0.labels)
    });
  }
  ;
  throw new Error("Failed pattern match at Markgraf.Animation.Schedule (line 1015, column 14 - line 1025, column 6): " + [r.event.kind.constructor.name]);
};
var sortWindows = /* @__PURE__ */ sortBy(/* @__PURE__ */ comparing2(function(v) {
  return v.startT;
}));
var segmentForPath = function(flat) {
  return function(path) {
    return find2(function(seg) {
      return eq113(seg.path)(path);
    })(flat.segments);
  };
};
var segmentEndingAt = function(flat) {
  return function(path) {
    return function(startT) {
      return function(endT) {
        var nearly = function(a) {
          return function(b) {
            return abs2(a - b) < 1e-4;
          };
        };
        var onPath = function(seg) {
          return eq113(seg.path)(path) && (nearly(seg.endT)(startT) || nearly(seg.startT)(endT));
        };
        var v = find2(onPath)(flat.segments);
        if (v instanceof Just) {
          return new Just(v.value0);
        }
        ;
        if (v instanceof Nothing) {
          return segmentForPath(flat)(path);
        }
        ;
        throw new Error("Failed pattern match at Markgraf.Animation.Schedule (line 637, column 3 - line 646, column 40): " + [v.constructor.name]);
      };
    };
  };
};
var sceneBaselineIntervals = function(layout2) {
  return function(_endpoints) {
    return function(kfs) {
      var unsafeHead = function(xs) {
        var v = head(xs);
        if (v instanceof Just) {
          return v.value0;
        }
        ;
        if (v instanceof Nothing) {
          return {
            x: 0,
            y: 0,
            w: 0,
            h: 0,
            label: "",
            shape: Rectangle.value
          };
        }
        ;
        throw new Error("Failed pattern match at Markgraf.Animation.Schedule (line 702, column 19 - line 704, column 79): " + [v.constructor.name]);
      };
      var kfNodes = function(kid) {
        return maybe(empty3)(function(v) {
          return v.nodes;
        })(lookup116(kid)(kfs));
      };
      var visibleNodes = function(v) {
        if (v instanceof Structural) {
          return union9(kfNodes(v.value0.from))(kfNodes(v.value0.to));
        }
        ;
        if (v instanceof DataFlow) {
          return kfNodes(v.value0.keyframe);
        }
        ;
        if (v instanceof Hold) {
          return kfNodes(v.value0);
        }
        ;
        if (v instanceof EnterNode) {
          return empty3;
        }
        ;
        if (v instanceof ExitNode) {
          return empty3;
        }
        ;
        throw new Error("Failed pattern match at Markgraf.Animation.Schedule (line 688, column 18 - line 693, column 24): " + [v.constructor.name]);
      };
      var initial2 = function(n) {
        return {
          minX: n.x,
          minY: n.y,
          maxX: n.x + n.w,
          maxY: n.y + n.h
        };
      };
      var finalize2 = function(r) {
        return {
          x: r.minX,
          y: r.minY,
          w: r.maxX - r.minX,
          h: r.maxY - r.minY
        };
      };
      var extend2 = function(acc) {
        return function(n) {
          return {
            minX: min15(acc.minX)(n.x),
            minY: min15(acc.minY)(n.y),
            maxX: max22(acc.maxX)(n.x + n.w),
            maxY: max22(acc.maxY)(n.y + n.h)
          };
        };
      };
      var combine = function(boxes) {
        return finalize2(foldl27(extend2)(initial2(unsafeHead(boxes)))(drop(1)(boxes)));
      };
      var nodesOnly = function(nodeIds) {
        var v = mapMaybe(function(nid) {
          return lookup211(nid)(layout2.nodes);
        })(fromFoldable113(nodeIds));
        if (v.length === 0) {
          return Nothing.value;
        }
        ;
        return new Just(combine(v));
      };
      var sceneInterval = function(span3) {
        var v = nodesOnly(visibleNodes(span3.scene));
        if (v instanceof Nothing) {
          return Nothing.value;
        }
        ;
        if (v instanceof Just) {
          return new Just({
            startT: span3.startT,
            endT: span3.endT,
            bbox: v.value0,
            priority: 0,
            pathFollow: Nothing.value
          });
        }
        ;
        throw new Error("Failed pattern match at Markgraf.Animation.Schedule (line 678, column 24 - line 686, column 8): " + [v.constructor.name]);
      };
      return mapMaybe(sceneInterval);
    };
  };
};
var retractFrom = function(edgeEndpoints) {
  return function(leavingNodes) {
    return function(eid) {
      var v = lookup30(eid)(edgeEndpoints);
      if (v instanceof Nothing) {
        return FromTarget.value;
      }
      ;
      if (v instanceof Just) {
        var targetLeaving = member14(v.value0.target)(leavingNodes);
        var sourceLeaving = member14(v.value0.source)(leavingNodes);
        if (sourceLeaving && targetLeaving) {
          return FromBoth.value;
        }
        ;
        if (sourceLeaving && !targetLeaving) {
          return FromSource.value;
        }
        ;
        if (!sourceLeaving && targetLeaving) {
          return FromTarget.value;
        }
        ;
        if (!sourceLeaving && !targetLeaving) {
          return FromTarget.value;
        }
        ;
        throw new Error("Failed pattern match at Markgraf.Animation.Schedule (line 996, column 7 - line 1000, column 35): " + [sourceLeaving.constructor.name, targetLeaving.constructor.name]);
      }
      ;
      throw new Error("Failed pattern match at Markgraf.Animation.Schedule (line 989, column 46 - line 1000, column 35): " + [v.constructor.name]);
    };
  };
};
var offsetWindow = function(off) {
  return function(w) {
    return {
      target: w.target,
      startT: w.startT + off,
      endT: w.endT + off
    };
  };
};
var nodeBaseFontPx = 11;
var noHold = {
  pre: 0,
  post: 0
};
var resolveOne = function(timing) {
  return function(layout2) {
    return function(holds) {
      return function(resolved) {
        return function(e) {
          var hold = fromMaybe(noHold)(lookup33(e.event.id)(holds));
          var startT = (function() {
            if (e.event.when instanceof First2) {
              return 0;
            }
            ;
            if (e.event.when instanceof At) {
              return e.event.when.value0;
            }
            ;
            if (e.event.when instanceof After) {
              return maybe(0)(function(v2) {
                return v2.endT;
              })(find2(function(r) {
                return eq112(r.event.id)(e.event.when.value0);
              })(resolved));
            }
            ;
            if (e.event.when instanceof With) {
              return maybe(0)(function(v2) {
                return v2.startT;
              })(find2(function(r) {
                return eq112(r.event.id)(e.event.when.value0);
              })(resolved));
            }
            ;
            throw new Error("Failed pattern match at Markgraf.Animation.Schedule (line 1098, column 12 - line 1102, column 79): " + [e.event.when.constructor.name]);
          })();
          var v = (function() {
            if (e.event.kind instanceof SendToken) {
              return tokenTiming(timing)(layout2)(hold)(e.event.kind.value0);
            }
            ;
            if (e.event.kind instanceof FillNodeWithoutTransition) {
              return {
                duration: timing.plop,
                holdPre: 0,
                holdPost: 0
              };
            }
            ;
            throw new Error("Failed pattern match at Markgraf.Animation.Schedule (line 1104, column 37 - line 1106, column 90): " + [e.event.kind.constructor.name]);
          })();
          return snoc(resolved)({
            startT,
            endT: startT + v.duration,
            event: e.event,
            holdPre: v.holdPre,
            holdPost: v.holdPost
          });
        };
      };
    };
  };
};
var resolveEventTimes = function(timing) {
  return function(layout2) {
    return function(events) {
      var indexedEvents = mapWithIndex2(function(v) {
        return function(ev) {
          return {
            event: ev
          };
        };
      })(events);
      var holds = tokenHolds(timing)(events);
      return foldl27(resolveOne(timing)(layout2)(holds))([])(indexedEvents);
    };
  };
};
var maxLabelPx = 40;
var lookupChildAnim = function(animation) {
  return function(nid) {
    return fromMaybe(animation)(lookup211(nid)(un10(Interiors)(animation.interiors)));
  };
};
var liftSpanToRoot = function(placement) {
  return function(span3) {
    return {
      startT: span3.startT,
      endT: span3.endT,
      easing: span3.easing,
      interp: span3.interp,
      fromCam: liftCameraToRoot(placement)(span3.fromCam),
      toCam: liftCameraToRoot(placement)(span3.toCam)
    };
  };
};
var eventRefs = function(e) {
  if (e.when instanceof First2) {
    return [];
  }
  ;
  if (e.when instanceof At) {
    return [];
  }
  ;
  if (e.when instanceof After) {
    return [e.when.value0];
  }
  ;
  if (e.when instanceof With) {
    return [e.when.value0];
  }
  ;
  throw new Error("Failed pattern match at Markgraf.Animation.Schedule (line 845, column 15 - line 849, column 22): " + [e.when.constructor.name]);
};
var emptyKf = /* @__PURE__ */ (function() {
  return {
    id: "",
    nodes: empty3,
    edges: empty3,
    kind: Animated.value
  };
})();
var transitionDelta = function(kfs) {
  return function(t) {
    var to2 = fromMaybe(emptyKf)(lookup116(t.to)(kfs));
    var from2 = fromMaybe(emptyKf)(lookup116(t.from)(kfs));
    return delta(from2)(to2);
  };
};
var emptyInteriors = empty2;
var leafTree = function(layout2) {
  return {
    layout: layout2,
    interiors: emptyInteriors
  };
};
var lookupChild = function(tree) {
  return function(nid) {
    return fromMaybe(leafTree(tree.layout))(lookup211(nid)(un10(InteriorTrees)(tree.interiors)));
  };
};
var edgeTraversalDuration = function(speed) {
  return function(minDur) {
    return function(layout2) {
      return function(eid) {
        var v = lookup30(eid)(layout2.edges);
        if (v instanceof Just) {
          var $306 = speed <= 0;
          if ($306) {
            return minDur;
          }
          ;
          return max22(minDur)(pathLength(v.value0) / speed);
        }
        ;
        if (v instanceof Nothing) {
          return minDur;
        }
        ;
        throw new Error("Failed pattern match at Markgraf.Animation.Schedule (line 1140, column 3 - line 1144, column 22): " + [v.constructor.name]);
      };
    };
  };
};
var edgeBuildDuration = function(timing) {
  return edgeTraversalDuration(timing.edgeSpeed)(timing.minEdgeDuration);
};
var structuralPlan = function(timing) {
  return function(layout2) {
    return function(kfs) {
      return function(endpoints) {
        return function(t) {
          var retractDur = function(eid) {
            return edgeBuildDuration(timing)(layout2)(eid);
          };
          var mkPlopIn = function(nid) {
            return {
              startT: 0,
              endT: timing.plop,
              target: new NodeWindow(nid, PlopIn.value)
            };
          };
          var extendStart = function(v) {
            return 0;
          };
          var extendDur = function(eid) {
            return edgeBuildDuration(timing)(layout2)(eid);
          };
          var extendEnd = function(eid) {
            return extendStart(eid) + extendDur(eid);
          };
          var mkExtend = function(eid) {
            return {
              startT: extendStart(eid),
              endT: extendEnd(eid),
              target: new EdgeWindow(eid, new Extend(ExtendFromSource.value))
            };
          };
          var d = transitionDelta(kfs)(t);
          var extendW = map24(mkExtend)(toUnfoldable14(d.entering.edges));
          var hasIncidentLeavingEdge = function(nid) {
            var incident = function(eid) {
              var v = lookup30(eid)(endpoints);
              if (v instanceof Just) {
                return eq62(v.value0.source)(nid) || eq62(v.value0.target)(nid);
              }
              ;
              if (v instanceof Nothing) {
                return false;
              }
              ;
              throw new Error("Failed pattern match at Markgraf.Animation.Schedule (line 947, column 20 - line 949, column 23): " + [v.constructor.name]);
            };
            return any2(incident)(toUnfoldable14(d.leaving.edges));
          };
          var mkRetract = function(eid) {
            return {
              startT: 0,
              endT: retractDur(eid),
              target: new EdgeWindow(eid, new Retract(retractFrom(endpoints)(d.leaving.nodes)(eid)))
            };
          };
          var plopInW = map24(mkPlopIn)(toUnfoldable14(d.entering.nodes));
          var retractMaxEnd = foldl27(max22)(0)(map24(retractDur)(toUnfoldable14(d.leaving.edges)));
          var plopOutStart = function(nid) {
            var $312 = hasIncidentLeavingEdge(nid);
            if ($312) {
              return retractMaxEnd;
            }
            ;
            return 0;
          };
          var plopOutEnd = function(nid) {
            return plopOutStart(nid) + timing.plop;
          };
          var mkPlopOut = function(nid) {
            return {
              startT: plopOutStart(nid),
              endT: plopOutEnd(nid),
              target: new NodeWindow(nid, PlopOut.value)
            };
          };
          var plopOutW = map24(mkPlopOut)(toUnfoldable14(d.leaving.nodes));
          var retractW = map24(mkRetract)(toUnfoldable14(d.leaving.edges));
          var ends = append26(map24(function(v) {
            return v.endT;
          })(retractW))(append26(map24(function(v) {
            return v.endT;
          })(plopOutW))(append26(map24(function(v) {
            return v.endT;
          })(plopInW))(map24(function(v) {
            return v.endT;
          })(extendW))));
          var maxEnd = (function() {
            var v = last(sort5(ends));
            if (v instanceof Just) {
              return v.value0 + timing.gap;
            }
            ;
            if (v instanceof Nothing) {
              return timing.gap;
            }
            ;
            throw new Error("Failed pattern match at Markgraf.Animation.Schedule (line 984, column 12 - line 986, column 26): " + [v.constructor.name]);
          })();
          return {
            duration: maxEnd,
            windows: append26(retractW)(append26(plopOutW)(append26(plopInW)(extendW)))
          };
        };
      };
    };
  };
};
var structuralDuration = function(timing) {
  return function(layout2) {
    return function(kfs) {
      return function(endpoints) {
        return function(t) {
          return structuralPlan(timing)(layout2)(kfs)(endpoints)(t).duration;
        };
      };
    };
  };
};
var structuralWindows = function(timing) {
  return function(layout2) {
    return function(kfs) {
      return function(edgeEndpoints) {
        return function(span3) {
          return function(t) {
            return map24(offsetWindow(span3.startT))(structuralPlan(timing)(layout2)(kfs)(edgeEndpoints)(t).windows);
          };
        };
      };
    };
  };
};
var duplicateIds = function(xs) {
  var head1 = function(g) {
    var v = uncons(fromFoldable210(g));
    if (v instanceof Just) {
      return v.value0.head;
    }
    ;
    if (v instanceof Nothing) {
      return "";
    }
    ;
    throw new Error("Failed pattern match at Markgraf.Animation.Schedule (line 840, column 13 - line 842, column 26): " + [v.constructor.name]);
  };
  var groups = group3(sort1(xs));
  return mapMaybe(function(g) {
    var $318 = length(fromFoldable210(g)) > 1;
    if ($318) {
      return new Just(head1(g));
    }
    ;
    return Nothing.value;
  })(groups);
};
var validateDataflowEvents = function(events) {
  var refs = concatMap(eventRefs)(events);
  var ids = map24(function(v) {
    return v.id;
  })(events);
  var knownIds = fromFoldable37(ids);
  var unknown = filter(function(r) {
    return !member15(r)(knownIds);
  })(refs);
  var dups = duplicateIds(ids);
  return append26(map24(DuplicateEventId.create)(dups))(map24(UnknownEvent.create)(unknown));
};
var dotSampleCount = 32;
var windowsToCameraIntervals = function(cfg) {
  return function(layout2) {
    return function(endpoints) {
      var tokenZoom = max22(cfg.minZoom)(cfg.tokenZoomFloor);
      var staticInterval = function(w) {
        return function(b) {
          return {
            startT: w.startT,
            endT: w.endT,
            bbox: b,
            priority: 1,
            pathFollow: Nothing.value
          };
        };
      };
      var nodeCenter = function(np) {
        return {
          x: np.x + np.w / 2,
          y: np.y + np.h / 2
        };
      };
      var motionStart = function(w) {
        return function(holds) {
          return w.startT + holds.pre * (w.endT - w.startT);
        };
      };
      var motionEnd = function(w) {
        return function(holds) {
          return w.endT - holds.post * (w.endT - w.startT);
        };
      };
      var followInterval = function(w) {
        return function(eid) {
          return function(pf) {
            return {
              startT: w.startT,
              endT: w.endT,
              bbox: tokenFocusBBox(layout2)(endpoints)(eid),
              priority: 1,
              pathFollow: new Just(pf)
            };
          };
        };
      };
      var dotSamples = function(w) {
        return function(path) {
          return function(srcNode) {
            return function(dstNode) {
              return function(holds) {
                var fpStart = motionStart(w)(holds);
                var motionDur = max22(1e-4)(motionEnd(w)(holds) - fpStart);
                var dur = w.endT - w.startT;
                var sampleAt = function(i) {
                  var frac = toNumber(i) / toNumber(dotSampleCount);
                  var t = fpStart + frac * motionDur;
                  var raw = (function() {
                    var $319 = dur <= 0;
                    if ($319) {
                      return 0;
                    }
                    ;
                    return (t - w.startT) / dur;
                  })();
                  var pos = tokenDotAt(path)(nodeCenter(srcNode))(nodeCenter(dstNode))(raw)(holds);
                  return {
                    t,
                    pos
                  };
                };
                return map24(sampleAt)(range2(0)(dotSampleCount));
              };
            };
          };
        };
      };
      var followFor = function(w) {
        return function(eid) {
          return function(source2) {
            return function(target) {
              return function(holds) {
                return bind13(lookup30(eid)(layout2.edges))(function(path) {
                  return bind13(lookup211(source2)(layout2.nodes))(function(srcNode) {
                    return bind13(lookup211(target)(layout2.nodes))(function(dstNode) {
                      return pure4({
                        samples: dotSamples(w)(path)(srcNode)(dstNode)(holds),
                        zoom: tokenZoom
                      });
                    });
                  });
                });
              };
            };
          };
        };
      };
      var tokenInterval = function(w) {
        return function(eid) {
          return function(source2) {
            return function(target) {
              return function(holds) {
                if (cfg.tokenZoomFloor <= 0) {
                  return staticInterval(w)(tokenFocusBBox(layout2)(endpoints)(eid));
                }
                ;
                if (otherwise) {
                  var v = followFor(w)(eid)(source2)(target)(holds);
                  if (v instanceof Just) {
                    return followInterval(w)(eid)(v.value0);
                  }
                  ;
                  if (v instanceof Nothing) {
                    return staticInterval(w)(tokenFocusBBox(layout2)(endpoints)(eid));
                  }
                  ;
                  throw new Error("Failed pattern match at Markgraf.Animation.Schedule (line 742, column 19 - line 744, column 74): " + [v.constructor.name]);
                }
                ;
                throw new Error("Failed pattern match at Markgraf.Animation.Schedule (line 740, column 3 - line 744, column 74): " + [w.constructor.name, eid.constructor.name, source2.constructor.name, target.constructor.name, holds.constructor.name]);
              };
            };
          };
        };
      };
      var windowInterval = function(w) {
        if (w.target instanceof NodeWindow) {
          return Nothing.value;
        }
        ;
        if (w.target instanceof EdgeWindow) {
          return Nothing.value;
        }
        ;
        if (w.target instanceof TokenWindow) {
          return new Just(tokenInterval(w)(w.target.value1)(w.target.value3)(w.target.value4)({
            pre: w.target.value6,
            post: w.target.value7
          }));
        }
        ;
        if (w.target instanceof FillWindow) {
          return new Just(staticInterval(w)(expandedNodesBBox(layout2)(endpoints)(singleton5(w.target.value1))));
        }
        ;
        throw new Error("Failed pattern match at Markgraf.Animation.Schedule (line 722, column 22 - line 728, column 85): " + [w.target.constructor.name]);
      };
      return mapMaybe(windowInterval);
    };
  };
};
var segmentCameraSpans = function(cameraConfig) {
  return function(kfs) {
    return function(edgeEndpoints) {
      return function(flat) {
        return function(seg) {
          var segSpans = filter(function(s) {
            return s.startT >= seg.startT && s.endT <= seg.endT;
          })(flat.spans);
          var cameraIntervals = append26(sceneBaselineIntervals(seg.layout)(edgeEndpoints)(kfs)(segSpans))(windowsToCameraIntervals(cameraConfig)(seg.layout)(edgeEndpoints)(seg.windows));
          return buildCameraSpansFromIntervals(cameraConfig)(seg.layout)(flat.endT)(cameraIntervals);
        };
      };
    };
  };
};
var detectCycle = function(events) {
  var deps = fromFoldable29(map24(function(e) {
    return new Tuple(e.id, eventRefs(e));
  })(events));
  var walk = function(visited) {
    return function(path) {
      return function(eid) {
        if (member15(eid)(path)) {
          return [new ScheduleCycle(append26(fromFoldable113(path))([eid]))];
        }
        ;
        if (member15(eid)(visited)) {
          return [];
        }
        ;
        if (otherwise) {
          var v = lookup33(eid)(deps);
          if (v instanceof Nothing) {
            return [];
          }
          ;
          if (v instanceof Just) {
            return concatMap(walk(insert26(eid)(visited))(insert26(eid)(path)))(v.value0);
          }
          ;
          throw new Error("Failed pattern match at Markgraf.Animation.Schedule (line 858, column 21 - line 860, column 90): " + [v.constructor.name]);
        }
        ;
        throw new Error("Failed pattern match at Markgraf.Animation.Schedule (line 855, column 5 - line 860, column 90): " + [visited.constructor.name, path.constructor.name, eid.constructor.name]);
      };
    };
  };
  return concatMap(function(e) {
    return walk(empty3)(empty3)(e.id);
  })(events);
};
var defaultTiming = /* @__PURE__ */ (function() {
  return {
    plop: 0.5,
    gap: 0.5,
    edgeSpeed: 350,
    minEdgeDuration: 0.3,
    tokenSpeed: 250,
    minTokenDuration: 1.8,
    tokenHold: 0.5,
    stillHold: 1.8,
    hatchHold: 0.4,
    tokenReadSecPerChar: 0.06,
    nodeEasing: SpringBouncy.value,
    edgeEasing: EaseInOutQuad.value,
    tokenEasing: Linear.value,
    diveDur: 1.2,
    retreatDur: 1.2
  };
})();
var dataflowWindows = function(timing) {
  return function(layout2) {
    return function(span3) {
      return function(d) {
        return map24(offsetWindow(span3.startT))(mapMaybe(toWindow)(resolveEventTimes(timing)(layout2)(d.events)));
      };
    };
  };
};
var sceneWindows = function(timing) {
  return function(layout2) {
    return function(kfs) {
      return function(edgeEndpoints) {
        return function(span3) {
          if (span3.scene instanceof Structural) {
            return structuralWindows(timing)(layout2)(kfs)(edgeEndpoints)(span3)(span3.scene.value0);
          }
          ;
          if (span3.scene instanceof Hold) {
            return [];
          }
          ;
          if (span3.scene instanceof DataFlow) {
            return dataflowWindows(timing)(layout2)(span3)(span3.scene.value0);
          }
          ;
          if (span3.scene instanceof EnterNode) {
            return [];
          }
          ;
          if (span3.scene instanceof ExitNode) {
            return [];
          }
          ;
          throw new Error("Failed pattern match at Markgraf.Animation.Schedule (line 899, column 53 - line 904, column 17): " + [span3.scene.constructor.name]);
        };
      };
    };
  };
};
var dataflowDuration = function(timing) {
  return function(layout2) {
    return function(d) {
      var v = resolveEventTimes(timing)(layout2)(d.events);
      if (v.length === 0) {
        return timing.gap;
      }
      ;
      return foldl27(max22)(0)(map24(function(v1) {
        return v1.endT;
      })(v)) + timing.gap;
    };
  };
};
var sceneDuration = function(timing) {
  return function(layout2) {
    return function(kfs) {
      return function(endpoints) {
        return function(v) {
          if (v instanceof Structural) {
            return structuralDuration(timing)(layout2)(kfs)(endpoints)(v.value0);
          }
          ;
          if (v instanceof Hold) {
            return timing.stillHold;
          }
          ;
          if (v instanceof DataFlow) {
            return dataflowDuration(timing)(layout2)(v.value0);
          }
          ;
          if (v instanceof EnterNode) {
            return 0;
          }
          ;
          if (v instanceof ExitNode) {
            return 0;
          }
          ;
          throw new Error("Failed pattern match at Markgraf.Animation.Schedule (line 865, column 45 - line 870, column 18): " + [v.constructor.name]);
        };
      };
    };
  };
};
var flattenLevel = function(timing) {
  return function(rootTree) {
    return function(levelTree) {
      return function(path) {
        return function(animation) {
          return function(baseT) {
            var placement = composedPlacement(rootTree)(path);
            var kfs = keyframeById(animation);
            var initialKf = (function() {
              var v = head(animation.keyframes);
              if (v instanceof Just) {
                return v.value0.id;
              }
              ;
              if (v instanceof Nothing) {
                return "";
              }
              ;
              throw new Error("Failed pattern match at Markgraf.Animation.Schedule (line 331, column 15 - line 333, column 29): " + [v.constructor.name]);
            })();
            var initialAcc = function(t) {
              return {
                t,
                runStart: t,
                runSpans: [],
                runWindows: [],
                segments: [],
                spans: [],
                windows: [],
                dives: []
              };
            };
            var edgeEndpoints = buildEdgeEndpoints(animation);
            var flushRun = function(acc) {
              var seg = {
                startT: acc.runStart,
                endT: acc.t,
                path,
                layout: levelTree.layout,
                placement,
                windows: acc.runWindows,
                spans: acc.runSpans,
                keyframes: kfs,
                initialKeyframe: initialKf,
                edgeEndpoints
              };
              return {
                segments: (function() {
                  var $361 = $$null(acc.runSpans);
                  if ($361) {
                    return acc.segments;
                  }
                  ;
                  return snoc(acc.segments)(seg);
                })(),
                spans: acc.spans,
                windows: acc.windows,
                dives: acc.dives
              };
            };
            var finish2 = function(acc) {
              var closed = flushRun(acc);
              return {
                endT: acc.t,
                spans: closed.spans,
                windows: sortWindows(closed.windows),
                segments: closed.segments,
                dives: closed.dives
              };
            };
            var diveInto = function(acc) {
              return function(nid) {
                var flushed = flushRun(acc);
                var childTree = lookupChild(levelTree)(nid);
                var childStartT = acc.t + timing.diveDur;
                var childPath = snoc(path)(nid);
                var diveIn = {
                  startT: acc.t,
                  endT: childStartT,
                  node: nid,
                  parentPath: path,
                  childPath,
                  direction: DiveIn.value
                };
                var childAnim = lookupChildAnim(animation)(nid);
                var child = flattenLevel(timing)(rootTree)(childTree)(childPath)(childAnim)(childStartT);
                var resumeT = child.endT + timing.retreatDur;
                var diveOut = {
                  startT: child.endT,
                  endT: resumeT,
                  node: nid,
                  parentPath: path,
                  childPath,
                  direction: DiveOut.value
                };
                return {
                  t: resumeT,
                  runStart: resumeT,
                  runSpans: [],
                  runWindows: [],
                  segments: append26(flushed.segments)(child.segments),
                  spans: append26(flushed.spans)(child.spans),
                  windows: append26(flushed.windows)(child.windows),
                  dives: append26(flushed.dives)(append26([diveIn])(append26(child.dives)([diveOut])))
                };
              };
            };
            var addNormal = function(acc) {
              return function(scene) {
                var dur = sceneDuration(timing)(levelTree.layout)(kfs)(edgeEndpoints)(scene);
                var endT = acc.t + dur;
                var span3 = {
                  startT: acc.t,
                  endT,
                  scene
                };
                var winsHere = sceneWindows(timing)(levelTree.layout)(kfs)(edgeEndpoints)(span3);
                return {
                  dives: acc.dives,
                  runStart: acc.runStart,
                  segments: acc.segments,
                  t: endT,
                  runSpans: snoc(acc.runSpans)(span3),
                  runWindows: append26(acc.runWindows)(winsHere),
                  spans: snoc(acc.spans)(span3),
                  windows: append26(acc.windows)(winsHere)
                };
              };
            };
            var step2 = function(acc) {
              return function(scene) {
                if (scene instanceof EnterNode) {
                  return diveInto(acc)(scene.value0);
                }
                ;
                if (scene instanceof ExitNode) {
                  return acc;
                }
                ;
                return addNormal(acc)(scene);
              };
            };
            return finish2(foldl27(step2)(initialAcc(baseT))(animation.scenes));
          };
        };
      };
    };
  };
};
var clipSpanTo = function(lo) {
  return function(hi) {
    return function(span3) {
      if (span3.endT <= lo || span3.startT >= hi) {
        return Nothing.value;
      }
      ;
      if (otherwise) {
        return new Just({
          easing: span3.easing,
          fromCam: span3.fromCam,
          interp: span3.interp,
          toCam: span3.toCam,
          startT: max22(lo)(span3.startT),
          endT: min15(hi)(span3.endT)
        });
      }
      ;
      throw new Error("Failed pattern match at Markgraf.Animation.Schedule (line 570, column 1 - line 570, column 65): " + [lo.constructor.name, hi.constructor.name, span3.constructor.name]);
    };
  };
};
var childHomeCamera = function(cameraConfig) {
  return function(rootLayout) {
    return function(childSeg) {
      var placementScale = un10(Placement)(childSeg.placement).scale;
      var fp = placeBBox(childSeg.placement)(bbox(childSeg.layout));
      var footprintCenter = {
        x: fp.x + fp.w / 2,
        y: fp.y + fp.h / 2
      };
      var fontCappedZoom = maxLabelPx / (nodeBaseFontPx * placementScale);
      var containZoom = computeZoom(rootLayout)(fp)(cameraConfig.padding * placementScale);
      return {
        center: footprintCenter,
        zoom: (function() {
          var $367 = size(childSeg.layout.nodes) <= 1;
          if ($367) {
            return min15(containZoom)(fontCappedZoom);
          }
          ;
          return containZoom;
        })()
      };
    };
  };
};
var parentRestCamera = function(cameraConfig) {
  return function(rootLayout) {
    return function(seg) {
      if (eq122(seg.placement)(identityPlacement)) {
        return liftCameraToRoot(seg.placement)(bboxToCamera(cameraConfig)(seg.layout)(bbox(seg.layout)));
      }
      ;
      if (otherwise) {
        return childHomeCamera(cameraConfig)(rootLayout)(seg);
      }
      ;
      throw new Error("Failed pattern match at Markgraf.Animation.Schedule (line 503, column 1 - line 503, column 69): " + [cameraConfig.constructor.name, rootLayout.constructor.name, seg.constructor.name]);
    };
  };
};
var diveCameraSpans = function(cameraConfig) {
  return function(rootLayout) {
    return function(_kfs) {
      return function(flat) {
        var diveSpan = function(d) {
          return bind13(segmentEndingAt(flat)(d.parentPath)(d.startT)(d.endT))(function(parentSeg) {
            return bind13(segmentForPath(flat)(d.childPath))(function(childSeg) {
              var camOut = parentRestCamera(cameraConfig)(rootLayout)(parentSeg);
              var camIn = childHomeCamera(cameraConfig)(rootLayout)(childSeg);
              var v = (function() {
                if (d.direction instanceof DiveIn) {
                  return new Tuple(camOut, camIn);
                }
                ;
                if (d.direction instanceof DiveOut) {
                  return new Tuple(camIn, camOut);
                }
                ;
                throw new Error("Failed pattern match at Markgraf.Animation.Schedule (line 615, column 26 - line 617, column 35): " + [d.direction.constructor.name]);
              })();
              return pure4({
                startT: d.startT,
                endT: d.endT,
                fromCam: v.value0,
                toCam: v.value1,
                easing: EaseInOutCubic.value,
                interp: LogLerp.value
              });
            });
          });
        };
        return mapMaybe(diveSpan)(flat.dives);
      };
    };
  };
};
var checkKf = function(kfs) {
  return function(kid) {
    var $375 = member23(kid)(kfs);
    if ($375) {
      return Nothing.value;
    }
    ;
    return new Just(new UnknownKeyframe(kid));
  };
};
var validateScene = function(kfs) {
  return function(v) {
    if (v instanceof Structural) {
      return catMaybes([checkKf(kfs)(v.value0.from), checkKf(kfs)(v.value0.to)]);
    }
    ;
    if (v instanceof Hold) {
      return catMaybes([checkKf(kfs)(v.value0)]);
    }
    ;
    if (v instanceof DataFlow) {
      return append26(catMaybes([checkKf(kfs)(v.value0.keyframe)]))(append26(validateDataflowEvents(v.value0.events))(detectCycle(v.value0.events)));
    }
    ;
    if (v instanceof EnterNode) {
      return [];
    }
    ;
    if (v instanceof ExitNode) {
      return [];
    }
    ;
    throw new Error("Failed pattern match at Markgraf.Animation.Schedule (line 807, column 21 - line 817, column 17): " + [v.constructor.name]);
  };
};
var validate = function(kfs) {
  return function(scenes) {
    var errs = concatMap(validateScene(kfs))(scenes);
    var $381 = $$null(errs);
    if ($381) {
      return new Right(unit);
    }
    ;
    return new Left(errs);
  };
};
var buildLevelCameraSpans = function(cameraConfig) {
  return function(rootLayout) {
    return function(kfs) {
      return function(flat) {
        var homeHold = function(seg) {
          var home = childHomeCamera(cameraConfig)(rootLayout)(seg);
          return {
            startT: seg.startT,
            endT: seg.endT,
            fromCam: home,
            toCam: home,
            easing: Linear.value,
            interp: LinearLerp.value
          };
        };
        var spansFor = function(seg) {
          if (eq122(seg.placement)(identityPlacement)) {
            return mapMaybe(clipSpanTo(seg.startT)(seg.endT))(map24(liftSpanToRoot(seg.placement))(segmentCameraSpans(cameraConfig)(kfs)(seg.edgeEndpoints)(flat)(seg)));
          }
          ;
          if (otherwise) {
            return [homeHold(seg)];
          }
          ;
          throw new Error("Failed pattern match at Markgraf.Animation.Schedule (line 528, column 3 - line 532, column 35): " + [seg.constructor.name]);
        };
        return sortBy(comparing2(function(v) {
          return v.startT;
        }))(concatMap(spansFor)(flat.segments));
      };
    };
  };
};
var precomputeTreeWith = function(cameraConfig) {
  return function(timing) {
    return function(animation) {
      return function(levelTree) {
        var v = head(animation.keyframes);
        if (v instanceof Nothing) {
          return new Left([NoKeyframes.value]);
        }
        ;
        if (v instanceof Just) {
          var kfs = keyframeById(animation);
          var edgeEndpoints = buildEdgeEndpoints(animation);
          return bind14(validate(kfs)(animation.scenes))(function() {
            var flat = flattenLevel(timing)(levelTree)(levelTree)([])(animation)(0);
            var cameraSpans = append26(diveCameraSpans(cameraConfig)(levelTree.layout)(kfs)(flat))(buildLevelCameraSpans(cameraConfig)(levelTree.layout)(kfs)(flat));
            return pure1({
              totalDuration: flat.endT,
              windows: flat.windows,
              spans: flat.spans,
              keyframes: kfs,
              initialKeyframe: v.value0.id,
              timing,
              layout: levelTree.layout,
              cameraSpans,
              cameraConfig,
              levelTree,
              segments: flat.segments,
              dives: flat.dives,
              seed: animation.seed
            });
          });
        }
        ;
        throw new Error("Failed pattern match at Markgraf.Animation.Schedule (line 246, column 3 - line 280, column 10): " + [v.constructor.name]);
      };
    };
  };
};
var precomputeWith = function(cameraConfig) {
  return function(timing) {
    return function(animation) {
      return function(layout2) {
        return precomputeTreeWith(cameraConfig)(timing)(animation)(leafTree(layout2));
      };
    };
  };
};
var precompute = /* @__PURE__ */ precomputeWith(defaultCameraConfig);

// ../markgraf/output/Markgraf.Animation.Surface/index.js
var eq27 = /* @__PURE__ */ eq(eqNodeId);
var map25 = /* @__PURE__ */ map(functorArray);
var un11 = /* @__PURE__ */ un();
var monadStateStateT2 = /* @__PURE__ */ monadStateStateT(monadIdentity);
var modify_2 = /* @__PURE__ */ modify_(monadStateStateT2);
var discard2 = /* @__PURE__ */ discard(discardUnit);
var bindStateT2 = /* @__PURE__ */ bindStateT(monadIdentity);
var discard1 = /* @__PURE__ */ discard2(bindStateT2);
var bind15 = /* @__PURE__ */ bind(bindStateT2);
var get3 = /* @__PURE__ */ get(monadStateStateT2);
var applicativeStateT2 = /* @__PURE__ */ applicativeStateT(monadIdentity);
var pure5 = /* @__PURE__ */ pure(applicativeStateT2);
var member16 = /* @__PURE__ */ member2(ordNodeId);
var member17 = /* @__PURE__ */ member(ordNodeId);
var elem8 = /* @__PURE__ */ elem2(eqNodeId);
var show3 = /* @__PURE__ */ show(showInt);
var eq82 = /* @__PURE__ */ eq(eqKeyframeId);
var put2 = /* @__PURE__ */ put(monadStateStateT2);
var insert27 = /* @__PURE__ */ insert(ordNodeId);
var traverse_2 = /* @__PURE__ */ traverse_(applicativeStateT2)(foldableArray);
var discard22 = /* @__PURE__ */ discard2(bindEither);
var when3 = /* @__PURE__ */ when(applicativeEither);
var member24 = /* @__PURE__ */ member2(ordEdgeId);
var notEq11 = /* @__PURE__ */ notEq(eqEdgeId);
var pure12 = /* @__PURE__ */ pure(applicativeEither);
var insert112 = /* @__PURE__ */ insert2(ordEdgeId);
var $$delete7 = /* @__PURE__ */ $$delete2(ordEdgeId);
var lookup31 = /* @__PURE__ */ lookup(ordEdgeId);
var fromFoldable30 = /* @__PURE__ */ fromFoldable(foldableArray);
var toUnfoldable15 = /* @__PURE__ */ toUnfoldable3(unfoldableArray);
var mapFlipped24 = /* @__PURE__ */ mapFlipped(functorArray);
var member32 = /* @__PURE__ */ member(ordEdgeId);
var insert28 = /* @__PURE__ */ insert(ordEdgeId);
var bind22 = /* @__PURE__ */ bind(bindEither);
var foldM4 = /* @__PURE__ */ foldM(foldableArray);
var foldM1 = /* @__PURE__ */ foldM4(monadEither);
var union10 = /* @__PURE__ */ union2(ordEdgeId);
var difference5 = /* @__PURE__ */ difference2(ordEdgeId);
var fromFoldable114 = /* @__PURE__ */ fromFoldable3(foldableArray)(ordEdgeId);
var fromFoldable211 = /* @__PURE__ */ fromFoldable3(foldableSet)(ordEdgeId);
var fromFoldable38 = /* @__PURE__ */ fromFoldable(foldableList);
var insert33 = /* @__PURE__ */ insert2(ordNodeId);
var delete1 = /* @__PURE__ */ $$delete2(ordNodeId);
var union1 = /* @__PURE__ */ union(ordEdgeId);
var eq92 = /* @__PURE__ */ eq(eqKeyframeKind);
var append112 = /* @__PURE__ */ append(semigroupArray);
var foldM22 = /* @__PURE__ */ foldM4(/* @__PURE__ */ monadStateT(monadIdentity));
var when1 = /* @__PURE__ */ when(applicativeStateT2);
var map26 = /* @__PURE__ */ map(functorEither);
var AddNode = /* @__PURE__ */ (function() {
  function AddNode2(value0) {
    this.value0 = value0;
  }
  ;
  AddNode2.create = function(value0) {
    return new AddNode2(value0);
  };
  return AddNode2;
})();
var DelNode = /* @__PURE__ */ (function() {
  function DelNode2(value0) {
    this.value0 = value0;
  }
  ;
  DelNode2.create = function(value0) {
    return new DelNode2(value0);
  };
  return DelNode2;
})();
var ModNode = /* @__PURE__ */ (function() {
  function ModNode2(value0) {
    this.value0 = value0;
  }
  ;
  ModNode2.create = function(value0) {
    return new ModNode2(value0);
  };
  return ModNode2;
})();
var AddEdge = /* @__PURE__ */ (function() {
  function AddEdge2(value0) {
    this.value0 = value0;
  }
  ;
  AddEdge2.create = function(value0) {
    return new AddEdge2(value0);
  };
  return AddEdge2;
})();
var DelEdge = /* @__PURE__ */ (function() {
  function DelEdge2(value0) {
    this.value0 = value0;
  }
  ;
  DelEdge2.create = function(value0) {
    return new DelEdge2(value0);
  };
  return DelEdge2;
})();
var RepointEdge = /* @__PURE__ */ (function() {
  function RepointEdge2(value0) {
    this.value0 = value0;
  }
  ;
  RepointEdge2.create = function(value0) {
    return new RepointEdge2(value0);
  };
  return RepointEdge2;
})();
var Token = /* @__PURE__ */ (function() {
  function Token2(value0) {
    this.value0 = value0;
  }
  ;
  Token2.create = function(value0) {
    return new Token2(value0);
  };
  return Token2;
})();
var Enter = /* @__PURE__ */ (function() {
  function Enter2(value0) {
    this.value0 = value0;
  }
  ;
  Enter2.create = function(value0) {
    return new Enter2(value0);
  };
  return Enter2;
})();
var Exit = /* @__PURE__ */ (function() {
  function Exit2() {
  }
  ;
  Exit2.value = new Exit2();
  return Exit2;
})();
var AnimatedKeyframe = /* @__PURE__ */ (function() {
  function AnimatedKeyframe2() {
  }
  ;
  AnimatedKeyframe2.value = new AnimatedKeyframe2();
  return AnimatedKeyframe2;
})();
var Still = /* @__PURE__ */ (function() {
  function Still2() {
  }
  ;
  Still2.value = new Still2();
  return Still2;
})();
var Title = /* @__PURE__ */ (function() {
  function Title2() {
  }
  ;
  Title2.value = new Title2();
  return Title2;
})();
var Par = /* @__PURE__ */ (function() {
  function Par2(value0) {
    this.value0 = value0;
  }
  ;
  Par2.create = function(value0) {
    return new Par2(value0);
  };
  return Par2;
})();
var Seq = /* @__PURE__ */ (function() {
  function Seq2(value0) {
    this.value0 = value0;
  }
  ;
  Seq2.create = function(value0) {
    return new Seq2(value0);
  };
  return Seq2;
})();
var Leaf2 = /* @__PURE__ */ (function() {
  function Leaf3(value0) {
    this.value0 = value0;
  }
  ;
  Leaf3.create = function(value0) {
    return new Leaf3(value0);
  };
  return Leaf3;
})();
var upsertNode = function(nid) {
  return function(node) {
    return function(nodes) {
      var v = findIndex(function(v1) {
        return eq27(v1.value0)(nid);
      })(nodes);
      if (v instanceof Just) {
        return fromMaybe(nodes)(updateAt(v.value0)(new Tuple(nid, node))(nodes));
      }
      ;
      if (v instanceof Nothing) {
        return snoc(nodes)(new Tuple(nid, node));
      }
      ;
      throw new Error("Failed pattern match at Markgraf.Animation.Surface (line 516, column 29 - line 518, column 40): " + [v.constructor.name]);
    };
  };
};
var updateNodeLabel = function(nid) {
  return function(newLabel) {
    return map25(function(v) {
      var $349 = eq27(v.value0)(nid);
      if ($349) {
        return new Tuple(v.value0, {
          id: v.value1.id,
          ports: v.value1.ports,
          shape: v.value1.shape,
          size: v.value1.size,
          label: new Just(newLabel)
        });
      }
      ;
      return new Tuple(v.value0, v.value1);
    });
  };
};
var synthEdgeId = function(from2) {
  return function(to2) {
    return un11(NodeId)(from2) + ("->" + un11(NodeId)(to2));
  };
};
var setError = function(msg) {
  return modify_2(function(s) {
    if (s.error instanceof Just) {
      return s;
    }
    ;
    if (s.error instanceof Nothing) {
      var $354 = {};
      for (var $355 in s) {
        if ({}.hasOwnProperty.call(s, $355)) {
          $354[$355] = s[$355];
        }
        ;
      }
      ;
      $354.error = new Just({
        msg,
        line: s.currentLine,
        column: s.currentColumn
      });
      return $354;
    }
    ;
    throw new Error("Failed pattern match at Markgraf.Animation.Surface (line 608, column 30 - line 610, column 86): " + [s.error.constructor.name]);
  });
};
var runDive = function(l) {
  return discard1(modify_2(function(s) {
    var $357 = {};
    for (var $358 in s) {
      if ({}.hasOwnProperty.call(s, $358)) {
        $357[$358] = s[$358];
      }
      ;
    }
    ;
    $357.currentLine = l.line;
    $357.currentColumn = l.column;
    return $357;
  }))(function() {
    return bind15(get3)(function(s) {
      if (s.error instanceof Just) {
        return pure5(unit);
      }
      ;
      if (s.error instanceof Nothing) {
        if (l.op instanceof Enter) {
          if (!member16(l.op.value0.id)(s.currNodes)) {
            return setError("cannot enter node " + (un11(NodeId)(l.op.value0.id) + ": does not exist"));
          }
          ;
          if (!member17(l.op.value0.id)(s.interiorOf)) {
            return setError("cannot enter node " + (un11(NodeId)(l.op.value0.id) + ": it has no `inside` block"));
          }
          ;
          if (elem8(l.op.value0.id)(s.enterStack)) {
            return setError("cannot enter node " + (un11(NodeId)(l.op.value0.id) + ": already entered"));
          }
          ;
          if (otherwise) {
            return modify_2(function(s$prime) {
              var $363 = {};
              for (var $364 in s$prime) {
                if ({}.hasOwnProperty.call(s$prime, $364)) {
                  $363[$364] = s$prime[$364];
                }
                ;
              }
              ;
              $363.enterStack = snoc(s$prime.enterStack)(l.op.value0.id);
              $363.scenes = snoc(s$prime.scenes)(new EnterNode(l.op.value0.id));
              return $363;
            });
          }
          ;
        }
        ;
        if (l.op instanceof Exit) {
          var v = unsnoc(s.enterStack);
          if (v instanceof Nothing) {
            return setError("`exit` without a matching `enter`");
          }
          ;
          if (v instanceof Just) {
            return modify_2(function(s$prime) {
              var $368 = {};
              for (var $369 in s$prime) {
                if ({}.hasOwnProperty.call(s$prime, $369)) {
                  $368[$369] = s$prime[$369];
                }
                ;
              }
              ;
              $368.enterStack = v.value0.init;
              $368.scenes = snoc(s$prime.scenes)(ExitNode.value);
              return $368;
            });
          }
          ;
          throw new Error("Failed pattern match at Markgraf.Animation.Surface (line 440, column 15 - line 445, column 12): " + [v.constructor.name]);
        }
        ;
        return pure5(unit);
      }
      ;
      throw new Error("Failed pattern match at Markgraf.Animation.Surface (line 426, column 3 - line 446, column 21): " + [s.error.constructor.name]);
    });
  });
};
var renameKfForFlow = function(frameName2) {
  return bind15(get3)(function(s) {
    var newKfId = (function() {
      if (frameName2 instanceof Just && !$$null2(frameName2.value0)) {
        return frameName2.value0;
      }
      ;
      return "kf-" + show3(s.kfCounter);
    })();
    var $375 = any2(function(kf) {
      return eq82(kf.id)(newKfId);
    })(s.keyframes);
    if ($375) {
      return setError("duplicate frame name " + un11(KeyframeId)(newKfId));
    }
    ;
    var newKf = {
      id: newKfId,
      nodes: s.currNodes,
      edges: s.currEdges,
      kind: Animated.value
    };
    return put2((function() {
      var $376 = {};
      for (var $377 in s) {
        if ({}.hasOwnProperty.call(s, $377)) {
          $376[$377] = s[$377];
        }
        ;
      }
      ;
      $376.keyframes = snoc(s.keyframes)(newKf);
      $376.kfCounter = s.kfCounter + 1 | 0;
      $376.currentKf = new Just(newKfId);
      return $376;
    })());
  });
};
var registerInteriors = /* @__PURE__ */ (function() {
  var register = function(v) {
    return bind15(get3)(function(s) {
      if (s.error instanceof Just) {
        return pure5(unit);
      }
      ;
      if (s.error instanceof Nothing) {
        var $382 = member17(v.node)(s.interiorOf);
        if ($382) {
          return setError("node " + (un11(NodeId)(v.node) + " has more than one `inside` block"));
        }
        ;
        return modify_2(function(s$prime) {
          var $383 = {};
          for (var $384 in s$prime) {
            if ({}.hasOwnProperty.call(s$prime, $384)) {
              $383[$384] = s$prime[$384];
            }
            ;
          }
          ;
          $383.interiorOf = insert27(v.node)(v.doc)(s$prime.interiorOf);
          return $383;
        });
      }
      ;
      throw new Error("Failed pattern match at Markgraf.Animation.Surface (line 304, column 5 - line 310, column 81): " + [s.error.constructor.name]);
    });
  };
  return traverse_2(register);
})();
var nodeIdsMissing = function(fromMissing) {
  return function(toMissing) {
    return function(t) {
      if (fromMissing && toMissing) {
        return un11(NodeId)(t.from) + (", " + un11(NodeId)(t.to));
      }
      ;
      if (fromMissing && !toMissing) {
        return un11(NodeId)(t.from);
      }
      ;
      if (!fromMissing && toMissing) {
        return un11(NodeId)(t.to);
      }
      ;
      if (!fromMissing && !toMissing) {
        return "";
      }
      ;
      throw new Error("Failed pattern match at Markgraf.Animation.Surface (line 820, column 42 - line 824, column 21): " + [fromMissing.constructor.name, toMissing.constructor.name]);
    };
  };
};
var mkSendToken = function(t) {
  return function(edge) {
    return function(direction) {
      return new SendToken({
        from: t.from,
        to: t.to,
        edge,
        direction,
        labels: t.labels
      });
    };
  };
};
var mkNode = function(id) {
  return function(label) {
    return function(shape) {
      return {
        id,
        size: new Tuple(1, 1),
        ports: [],
        label: new Just(label),
        shape
      };
    };
  };
};
var mkEdge = function(id) {
  return function(from2) {
    return function(to2) {
      return function(label) {
        return {
          id,
          from: {
            node: from2,
            port: Nothing.value
          },
          to: {
            node: to2,
            port: Nothing.value
          },
          label
        };
      };
    };
  };
};
var planRepoint = function(s) {
  return function(r) {
    var arrow = function(a) {
      return function(b) {
        return un11(NodeId)(a) + ("\u2192" + un11(NodeId)(b));
      };
    };
    var oldId = synthEdgeId(r.from)(r.to);
    var newId = synthEdgeId(r.newFrom)(r.newTo);
    return discard22(when3(!member24(oldId)(s.currEdges))(new Left("cannot repoint " + (arrow(r.from)(r.to) + ": edge does not exist"))))(function() {
      return discard22(when3(!member16(r.newFrom)(s.currNodes))(new Left("cannot repoint " + (arrow(r.from)(r.to) + (" to " + (arrow(r.newFrom)(r.newTo) + (": unknown node " + un11(NodeId)(r.newFrom))))))))(function() {
        return discard22(when3(!member16(r.newTo)(s.currNodes))(new Left("cannot repoint " + (arrow(r.from)(r.to) + (" to " + (arrow(r.newFrom)(r.newTo) + (": unknown node " + un11(NodeId)(r.newTo))))))))(function() {
          return discard22(when3(notEq11(oldId)(newId) && member24(newId)(s.currEdges))(new Left("cannot repoint " + (arrow(r.from)(r.to) + (" to " + (arrow(r.newFrom)(r.newTo) + ": target edge already exists"))))))(function() {
            return pure12({
              nextCurrEdges: insert112(newId)($$delete7(oldId)(s.currEdges)),
              newId,
              newEdge: mkEdge(newId)(r.newFrom)(r.newTo)(Nothing.value)
            });
          });
        });
      });
    });
  };
};
var missingList = function(fromMissing) {
  return function(toMissing) {
    return function(from2) {
      return function(to2) {
        if (fromMissing && toMissing) {
          return un11(NodeId)(from2) + (", " + un11(NodeId)(to2));
        }
        ;
        if (fromMissing && !toMissing) {
          return un11(NodeId)(from2);
        }
        ;
        if (!fromMissing && toMissing) {
          return un11(NodeId)(to2);
        }
        ;
        if (!fromMissing && !toMissing) {
          return "";
        }
        ;
        throw new Error("Failed pattern match at Markgraf.Animation.Surface (line 827, column 45 - line 831, column 21): " + [fromMissing.constructor.name, toMissing.constructor.name]);
      };
    };
  };
};
var isStructural = function(v) {
  if (v instanceof AddNode) {
    return true;
  }
  ;
  if (v instanceof DelNode) {
    return true;
  }
  ;
  if (v instanceof ModNode) {
    return true;
  }
  ;
  if (v instanceof AddEdge) {
    return true;
  }
  ;
  if (v instanceof DelEdge) {
    return true;
  }
  ;
  if (v instanceof RepointEdge) {
    return true;
  }
  ;
  return false;
};
var isDive = function(v) {
  if (v instanceof Enter) {
    return true;
  }
  ;
  if (v instanceof Exit) {
    return true;
  }
  ;
  return false;
};
var initialState2 = /* @__PURE__ */ (function() {
  return {
    graphNodes: [],
    graphEdges: empty2,
    currNodes: empty3,
    currEdges: empty3,
    keyframes: [],
    scenes: [],
    kfCounter: 0,
    eventCounter: 0,
    currentKf: Nothing.value,
    currentLine: 0,
    currentColumn: 0,
    error: Nothing.value,
    enterStack: [],
    interiorOf: empty2
  };
})();
var frameLabel = function(v) {
  if (v instanceof Just && !$$null2(v.value0)) {
    return '"' + (v.value0 + '" ');
  }
  ;
  return "";
};
var emitStillHold = /* @__PURE__ */ bind15(get3)(function(s) {
  if (s.error instanceof Just) {
    return pure5(unit);
  }
  ;
  if (s.error instanceof Nothing) {
    if (s.currentKf instanceof Just) {
      return modify_2(function(s$prime) {
        var $430 = {};
        for (var $431 in s$prime) {
          if ({}.hasOwnProperty.call(s$prime, $431)) {
            $430[$431] = s$prime[$431];
          }
          ;
        }
        ;
        $430.scenes = snoc(s$prime.scenes)(new Hold(s.currentKf.value0));
        return $430;
      });
    }
    ;
    if (s.currentKf instanceof Nothing) {
      return pure5(unit);
    }
    ;
    throw new Error("Failed pattern match at Markgraf.Animation.Surface (line 401, column 16 - line 403, column 27): " + [s.currentKf.constructor.name]);
  }
  ;
  throw new Error("Failed pattern match at Markgraf.Animation.Surface (line 399, column 3 - line 403, column 27): " + [s.error.constructor.name]);
});
var emitEvent = function(parentRef) {
  return function(kind) {
    return bind15(get3)(function(s) {
      var eid = "ev-" + show3(s.eventCounter);
      var ev = {
        id: eid,
        kind,
        when: parentRef
      };
      return discard1(put2((function() {
        var $434 = {};
        for (var $435 in s) {
          if ({}.hasOwnProperty.call(s, $435)) {
            $434[$435] = s[$435];
          }
          ;
        }
        ;
        $434.eventCounter = s.eventCounter + 1 | 0;
        return $434;
      })()))(function() {
        return pure5({
          events: [ev],
          firstId: new Just(eid),
          lastId: new Just(eid)
        });
      });
    });
  };
};
var walkLeaf = function(parentRef) {
  return function(op) {
    if (op instanceof Token) {
      return bind15(get3)(function(s) {
        var fromMissing = !member16(op.value0.from)(s.currNodes);
        var toMissing = !member16(op.value0.to)(s.currNodes);
        var $438 = fromMissing || toMissing;
        if ($438) {
          return discard1(setError("token references unknown node: " + nodeIdsMissing(fromMissing)(toMissing)(op.value0)))(function() {
            return pure5({
              events: [],
              firstId: Nothing.value,
              lastId: Nothing.value
            });
          });
        }
        ;
        var rev = synthEdgeId(op.value0.to)(op.value0.from);
        var fwd = synthEdgeId(op.value0.from)(op.value0.to);
        var $439 = member24(fwd)(s.currEdges);
        if ($439) {
          return emitEvent(parentRef)(mkSendToken(op.value0)(fwd)(Forward.value));
        }
        ;
        var $440 = member24(rev)(s.currEdges);
        if ($440) {
          return emitEvent(parentRef)(mkSendToken(op.value0)(rev)(Backward.value));
        }
        ;
        return discard1(setError("token " + (un11(NodeId)(op.value0.from) + ("\u2192" + (un11(NodeId)(op.value0.to) + (": no edge between " + (un11(NodeId)(op.value0.from) + (" and " + un11(NodeId)(op.value0.to)))))))))(function() {
          return pure5({
            events: [],
            firstId: Nothing.value,
            lastId: Nothing.value
          });
        });
      });
    }
    ;
    return pure5({
      events: [],
      firstId: Nothing.value,
      lastId: Nothing.value
    });
  };
};
var diveError = function(dives) {
  return function(msg) {
    var v = head(dives);
    if (v instanceof Just) {
      return discard1(modify_2(function(s) {
        var $443 = {};
        for (var $444 in s) {
          if ({}.hasOwnProperty.call(s, $444)) {
            $443[$444] = s[$444];
          }
          ;
        }
        ;
        $443.currentLine = v.value0.line;
        $443.currentColumn = v.value0.column;
        return $443;
      }))(function() {
        return setError(msg);
      });
    }
    ;
    if (v instanceof Nothing) {
      return setError(msg);
    }
    ;
    throw new Error("Failed pattern match at Markgraf.Animation.Surface (line 413, column 23 - line 417, column 26): " + [v.constructor.name]);
  };
};
var currentEdgeData = function(s) {
  return mapMaybe(function(eid) {
    return lookup31(eid)(s.graphEdges);
  })(fromFoldable30(toUnfoldable15(s.currEdges)));
};
var planDeletion = function(s) {
  return function(n) {
    var viaPrefix = function(v) {
      return "via " + (un11(NodeId)(v.from) + (" " + (un11(NodeId)(v.to) + ": ")));
    };
    var touchesX = function(e) {
      return eq27(e.from.node)(n.id) || eq27(e.to.node)(n.id);
    };
    var touching = filter(touchesX)(currentEdgeData(s));
    var notConsumed = function(consumed) {
      return function(e) {
        return !member24(e.id)(consumed);
      };
    };
    var arrow = function(a) {
      return function(b) {
        return un11(NodeId)(a) + ("\u2192" + un11(NodeId)(b));
      };
    };
    var cannotDelete = function(leftover) {
      return "cannot delete node " + (un11(NodeId)(n.id) + (": still connected (" + (joinWith(", ")(mapFlipped24(leftover)(function(e) {
        return arrow(e.from.node)(e.to.node);
      })) + ("). Use -edge to drop them or `via a b` to merge " + (un11(NodeId)(n.id) + "'s endpoints.")))));
    };
    var applyVia = function(acc) {
      return function(v) {
        var inId = synthEdgeId(v.from)(n.id);
        var outId = synthEdgeId(n.id)(v.to);
        var mergedId = synthEdgeId(v.from)(v.to);
        return discard22(when3(!member24(inId)(s.currEdges))(new Left(viaPrefix(v) + ("no edge " + arrow(v.from)(n.id)))))(function() {
          return discard22(when3(!member24(outId)(s.currEdges))(new Left(viaPrefix(v) + ("no edge " + arrow(n.id)(v.to)))))(function() {
            return discard22(when3(member24(mergedId)(s.currEdges) || member32(mergedId)(acc.synthesized))(new Left(viaPrefix(v) + ("would create " + (arrow(v.from)(v.to) + " but it already exists")))))(function() {
              return pure12({
                consumed: insert112(inId)(insert112(outId)(acc.consumed)),
                synthesized: insert28(mergedId)(mkEdge(mergedId)(v.from)(v.to)(Nothing.value))(acc.synthesized)
              });
            });
          });
        });
      };
    };
    return bind22(foldM1(applyVia)({
      consumed: empty3,
      synthesized: empty2
    })(n.via))(function(merge) {
      var leftover = filter(notConsumed(merge.consumed))(touching);
      if (leftover.length === 0) {
        return new Right({
          nextCurrEdges: union10(difference5(s.currEdges)(fromFoldable114(mapFlipped24(touching)(function(v) {
            return v.id;
          }))))(fromFoldable211(keys3(merge.synthesized))),
          synthesized: merge.synthesized
        });
      }
      ;
      return new Left(cannotDelete(leftover));
    });
  };
};
var collectLeaves = function(v) {
  if (v instanceof Leaf2) {
    return [v.value0];
  }
  ;
  if (v instanceof Par) {
    return concatMap(collectLeaves)(v.value0);
  }
  ;
  if (v instanceof Seq) {
    return concatMap(collectLeaves)(v.value0);
  }
  ;
  throw new Error("Failed pattern match at Markgraf.Animation.Surface (line 470, column 17 - line 473, column 41): " + [v.constructor.name]);
};
var checkBalanced = /* @__PURE__ */ bind15(get3)(function(s) {
  if (s.error instanceof Just) {
    return pure5(unit);
  }
  ;
  if (s.error instanceof Nothing) {
    var v = last(s.enterStack);
    if (v instanceof Just) {
      return setError("entered node " + (un11(NodeId)(v.value0) + " was never exited"));
    }
    ;
    if (v instanceof Nothing) {
      return pure5(unit);
    }
    ;
    throw new Error("Failed pattern match at Markgraf.Animation.Surface (line 327, column 16 - line 329, column 27): " + [v.constructor.name]);
  }
  ;
  throw new Error("Failed pattern match at Markgraf.Animation.Surface (line 325, column 3 - line 329, column 27): " + [s.error.constructor.name]);
});
var buildGraph = function(s) {
  return {
    nodes: map25(snd)(s.graphNodes),
    edges: fromFoldable38(values(s.graphEdges)),
    constraints: []
  };
};
var applyStructural = function(v) {
  if (v instanceof AddNode) {
    var node = mkNode(v.value0.id)(v.value0.label)(v.value0.shape);
    return modify_2(function(s) {
      var $457 = {};
      for (var $458 in s) {
        if ({}.hasOwnProperty.call(s, $458)) {
          $457[$458] = s[$458];
        }
        ;
      }
      ;
      $457.graphNodes = upsertNode(v.value0.id)(node)(s.graphNodes);
      $457.currNodes = insert33(v.value0.id)(s.currNodes);
      return $457;
    });
  }
  ;
  if (v instanceof DelNode) {
    return bind15(get3)(function(s) {
      var $461 = !member16(v.value0.id)(s.currNodes);
      if ($461) {
        return setError("cannot delete node " + (un11(NodeId)(v.value0.id) + ": does not exist"));
      }
      ;
      var v1 = planDeletion(s)(v.value0);
      if (v1 instanceof Left) {
        return setError(v1.value0);
      }
      ;
      if (v1 instanceof Right) {
        return modify_2(function(s$prime) {
          var $464 = {};
          for (var $465 in s$prime) {
            if ({}.hasOwnProperty.call(s$prime, $465)) {
              $464[$465] = s$prime[$465];
            }
            ;
          }
          ;
          $464.currNodes = delete1(v.value0.id)(s$prime.currNodes);
          $464.currEdges = v1.value0.nextCurrEdges;
          $464.graphEdges = union1(v1.value0.synthesized)(s$prime.graphEdges);
          return $464;
        });
      }
      ;
      throw new Error("Failed pattern match at Markgraf.Animation.Surface (line 536, column 10 - line 542, column 10): " + [v1.constructor.name]);
    });
  }
  ;
  if (v instanceof ModNode) {
    return bind15(get3)(function(s) {
      var $469 = !member16(v.value0.id)(s.currNodes);
      if ($469) {
        return setError("cannot modify node " + (un11(NodeId)(v.value0.id) + ": does not exist"));
      }
      ;
      if (v.value0.label instanceof Just) {
        return modify_2(function(s$prime) {
          var $471 = {};
          for (var $472 in s$prime) {
            if ({}.hasOwnProperty.call(s$prime, $472)) {
              $471[$472] = s$prime[$472];
            }
            ;
          }
          ;
          $471.graphNodes = updateNodeLabel(v.value0.id)(v.value0.label.value0)(s$prime.graphNodes);
          return $471;
        });
      }
      ;
      if (v.value0.label instanceof Nothing) {
        return pure5(unit);
      }
      ;
      throw new Error("Failed pattern match at Markgraf.Animation.Surface (line 547, column 10 - line 550, column 27): " + [v.value0.label.constructor.name]);
    });
  }
  ;
  if (v instanceof AddEdge) {
    return bind15(get3)(function(s) {
      var fromMissing = !member16(v.value0.from)(s.currNodes);
      var toMissing = !member16(v.value0.to)(s.currNodes);
      var $476 = fromMissing || toMissing;
      if ($476) {
        return setError("cannot add edge " + (un11(NodeId)(v.value0.from) + ("\u2192" + (un11(NodeId)(v.value0.to) + (": unknown node " + missingList(fromMissing)(toMissing)(v.value0.from)(v.value0.to))))));
      }
      ;
      var eid = synthEdgeId(v.value0.from)(v.value0.to);
      var edge = mkEdge(eid)(v.value0.from)(v.value0.to)(v.value0.label);
      return modify_2(function(s$prime) {
        var $477 = {};
        for (var $478 in s$prime) {
          if ({}.hasOwnProperty.call(s$prime, $478)) {
            $477[$478] = s$prime[$478];
          }
          ;
        }
        ;
        $477.graphEdges = insert28(eid)(edge)(s$prime.graphEdges);
        $477.currEdges = insert112(eid)(s$prime.currEdges);
        return $477;
      });
    });
  }
  ;
  if (v instanceof DelEdge) {
    return bind15(get3)(function(s) {
      var eid = synthEdgeId(v.value0.from)(v.value0.to);
      var $481 = !member24(eid)(s.currEdges);
      if ($481) {
        return setError("cannot delete edge " + (un11(NodeId)(v.value0.from) + ("\u2192" + (un11(NodeId)(v.value0.to) + ": does not exist"))));
      }
      ;
      return modify_2(function(s$prime) {
        var $482 = {};
        for (var $483 in s$prime) {
          if ({}.hasOwnProperty.call(s$prime, $483)) {
            $482[$483] = s$prime[$483];
          }
          ;
        }
        ;
        $482.currEdges = $$delete7(eid)(s$prime.currEdges);
        return $482;
      });
    });
  }
  ;
  if (v instanceof RepointEdge) {
    return bind15(get3)(function(s) {
      var v1 = planRepoint(s)(v.value0);
      if (v1 instanceof Left) {
        return setError(v1.value0);
      }
      ;
      if (v1 instanceof Right) {
        return modify_2(function(s$prime) {
          var $488 = {};
          for (var $489 in s$prime) {
            if ({}.hasOwnProperty.call(s$prime, $489)) {
              $488[$489] = s$prime[$489];
            }
            ;
          }
          ;
          $488.currEdges = v1.value0.nextCurrEdges;
          $488.graphEdges = insert28(v1.value0.newId)(v1.value0.newEdge)(s$prime.graphEdges);
          return $488;
        });
      }
      ;
      throw new Error("Failed pattern match at Markgraf.Animation.Surface (line 580, column 5 - line 585, column 10): " + [v1.constructor.name]);
    });
  }
  ;
  return pure5(unit);
};
var runOp = function(l) {
  return discard1(modify_2(function(s) {
    var $493 = {};
    for (var $494 in s) {
      if ({}.hasOwnProperty.call(s, $494)) {
        $493[$494] = s[$494];
      }
      ;
    }
    ;
    $493.currentLine = l.line;
    $493.currentColumn = l.column;
    return $493;
  }))(function() {
    return applyStructural(l.op);
  });
};
var emitStructural = function(kind) {
  return function(frameName2) {
    return function(ops) {
      return discard1(traverse_2(runOp)(ops))(function() {
        return bind15(get3)(function(s) {
          var newKfId = (function() {
            if (frameName2 instanceof Just && !$$null2(frameName2.value0)) {
              return frameName2.value0;
            }
            ;
            return "kf-" + show3(s.kfCounter);
          })();
          var $498 = any2(function(kf) {
            return eq82(kf.id)(newKfId);
          })(s.keyframes);
          if ($498) {
            return setError("duplicate frame name " + un11(KeyframeId)(newKfId));
          }
          ;
          var newKf = {
            id: newKfId,
            nodes: s.currNodes,
            edges: s.currEdges,
            kind
          };
          var scene = (function() {
            if (s.currentKf instanceof Nothing) {
              return Nothing.value;
            }
            ;
            if (s.currentKf instanceof Just) {
              return new Just(new Structural({
                from: s.currentKf.value0,
                to: newKfId,
                focus: Nothing.value
              }));
            }
            ;
            throw new Error("Failed pattern match at Markgraf.Animation.Surface (line 500, column 15 - line 502, column 95): " + [s.currentKf.constructor.name]);
          })();
          return put2((function() {
            var $501 = {};
            for (var $502 in s) {
              if ({}.hasOwnProperty.call(s, $502)) {
                $501[$502] = s[$502];
              }
              ;
            }
            ;
            $501.keyframes = snoc(s.keyframes)(newKf);
            $501.kfCounter = s.kfCounter + 1 | 0;
            $501.currentKf = new Just(newKfId);
            $501.scenes = maybe(s.scenes)(snoc(s.scenes))(scene);
            return $501;
          })());
        });
      });
    };
  };
};
var processStatic = function(kind) {
  return function(frame) {
    var leaves = collectLeaves(frame.ops);
    var structural = filter(function($554) {
      return isStructural((function(v2) {
        return v2.op;
      })($554));
    })(leaves);
    var nonStructural = filter(function($555) {
      return !isStructural((function(v2) {
        return v2.op;
      })($555));
    })(leaves);
    var v = head(nonStructural);
    if (v instanceof Just) {
      return discard1(modify_2(function(s) {
        var $505 = {};
        for (var $506 in s) {
          if ({}.hasOwnProperty.call(s, $506)) {
            $505[$506] = s[$506];
          }
          ;
        }
        ;
        $505.currentLine = v.value0.line;
        $505.currentColumn = v.value0.column;
        return $505;
      }))(function() {
        return setError("still/title blocks hold a static snapshot; they cannot contain tokens (a -> b) or enter/exit");
      });
    }
    ;
    if (v instanceof Nothing) {
      var $509 = eq92(kind)(TitleCard.value) && $$null(structural);
      if ($509) {
        return setError("title " + (frameLabel(frame.name) + "has an empty body; give it nodes/edges to title, or use a still"));
      }
      ;
      return discard1(emitStructural(kind)(frame.name)(structural))(function() {
        return emitStillHold;
      });
    }
    ;
    throw new Error("Failed pattern match at Markgraf.Animation.Surface (line 375, column 3 - line 384, column 22): " + [v.constructor.name]);
  };
};
var altMaybe2 = function(v) {
  return function(v1) {
    if (v instanceof Just) {
      return new Just(v.value0);
    }
    ;
    if (v instanceof Nothing) {
      return v1;
    }
    ;
    throw new Error("Failed pattern match at Markgraf.Animation.Surface (line 764, column 1 - line 764, column 52): " + [v.constructor.name, v1.constructor.name]);
  };
};
var walkSeq = function(parentRef) {
  return function(bs) {
    var stepSeq = function(acc) {
      return function(b) {
        var nextRef = (function() {
          if (acc.lastId instanceof Just) {
            return new After(acc.lastId.value0);
          }
          ;
          if (acc.lastId instanceof Nothing) {
            return parentRef;
          }
          ;
          throw new Error("Failed pattern match at Markgraf.Animation.Surface (line 722, column 17 - line 724, column 29): " + [acc.lastId.constructor.name]);
        })();
        return bind15(walkBlock(nextRef)(b))(function(r) {
          return pure5({
            events: append112(acc.events)(r.events),
            firstId: altMaybe2(acc.firstId)(r.firstId),
            lastId: altMaybe2(r.lastId)(acc.lastId)
          });
        });
      };
    };
    var v = uncons(bs);
    if (v instanceof Nothing) {
      return pure5({
        events: [],
        firstId: Nothing.value,
        lastId: Nothing.value
      });
    }
    ;
    if (v instanceof Just) {
      return bind15(walkBlock(parentRef)(v.value0.head))(function(first) {
        return bind15(foldM22(stepSeq)(first)(v.value0.tail))(function($$final) {
          return pure5($$final);
        });
      });
    }
    ;
    throw new Error("Failed pattern match at Markgraf.Animation.Surface (line 713, column 24 - line 718, column 15): " + [v.constructor.name]);
  };
};
var walkPar = function(parentRef) {
  return function(bs) {
    var v = uncons(bs);
    if (v instanceof Nothing) {
      return pure5({
        events: [],
        firstId: Nothing.value,
        lastId: Nothing.value
      });
    }
    ;
    if (v instanceof Just) {
      return bind15(walkBlock(parentRef)(v.value0.head))(function(first) {
        var withRef = (function() {
          if (first.firstId instanceof Just) {
            return new With(first.firstId.value0);
          }
          ;
          if (first.firstId instanceof Nothing) {
            return parentRef;
          }
          ;
          throw new Error("Failed pattern match at Markgraf.Animation.Surface (line 738, column 17 - line 740, column 29): " + [first.firstId.constructor.name]);
        })();
        return bind15(traverseAccum(withRef)(v.value0.tail))(function(sibs) {
          return pure5({
            events: append112(first.events)(sibs.events),
            firstId: first.firstId,
            lastId: altMaybe2(first.lastId)(sibs.lastId)
          });
        });
      });
    }
    ;
    throw new Error("Failed pattern match at Markgraf.Animation.Surface (line 733, column 24 - line 748, column 8): " + [v.constructor.name]);
  };
};
var walkBlock = function(parentRef) {
  return function(v) {
    if (v instanceof Leaf2) {
      return discard1(modify_2(function(s) {
        var $526 = {};
        for (var $527 in s) {
          if ({}.hasOwnProperty.call(s, $527)) {
            $526[$527] = s[$527];
          }
          ;
        }
        ;
        $526.currentLine = v.value0.line;
        $526.currentColumn = v.value0.column;
        return $526;
      }))(function() {
        return walkLeaf(parentRef)(v.value0.op);
      });
    }
    ;
    if (v instanceof Seq) {
      return walkSeq(parentRef)(v.value0);
    }
    ;
    if (v instanceof Par) {
      return walkPar(parentRef)(v.value0);
    }
    ;
    throw new Error("Failed pattern match at Markgraf.Animation.Surface (line 705, column 23 - line 710, column 33): " + [v.constructor.name]);
  };
};
var traverseAccum = function(ref) {
  var step2 = function(acc) {
    return function(b) {
      return bind15(walkBlock(ref)(b))(function(r) {
        return pure5({
          events: append112(acc.events)(r.events),
          firstId: altMaybe2(acc.firstId)(r.firstId),
          lastId: altMaybe2(r.lastId)(acc.lastId)
        });
      });
    };
  };
  return foldM22(step2)({
    events: [],
    firstId: Nothing.value,
    lastId: Nothing.value
  });
};
var emitFlow = function(block) {
  return bind15(get3)(function(s0) {
    if (s0.currentKf instanceof Nothing) {
      return setError("flow ops before any structural frame");
    }
    ;
    if (s0.currentKf instanceof Just) {
      return bind15(walkBlock(First2.value)(block))(function(result) {
        return bind15(get3)(function(s1) {
          var scene = new DataFlow({
            keyframe: s0.currentKf.value0,
            events: result.events,
            focus: Nothing.value
          });
          return put2((function() {
            var $533 = {};
            for (var $534 in s1) {
              if ({}.hasOwnProperty.call(s1, $534)) {
                $533[$534] = s1[$534];
              }
              ;
            }
            ;
            $533.scenes = snoc(s1.scenes)(scene);
            return $533;
          })());
        });
      });
    }
    ;
    throw new Error("Failed pattern match at Markgraf.Animation.Surface (line 599, column 3 - line 605, column 49): " + [s0.currentKf.constructor.name]);
  });
};
var processAnimated = function(frame) {
  var leaves = collectLeaves(frame.ops);
  var structural = filter(function($556) {
    return isStructural((function(v) {
      return v.op;
    })($556));
  })(leaves);
  var dives = filter(function($557) {
    return isDive((function(v) {
      return v.op;
    })($557));
  })(leaves);
  var flow = filter(function(l) {
    return !isStructural(l.op) && !isDive(l.op);
  })(leaves);
  var $537 = !$$null(dives) && !$$null(flow);
  if ($537) {
    return diveError(dives)("`enter`/`exit` cannot be mixed with flow tokens in the same frame");
  }
  ;
  return discard1(when1(!$$null(structural))(emitStructural(Animated.value)(frame.name)(structural)))(function() {
    return discard1(when1($$null(structural) && !$$null(flow))(renameKfForFlow(frame.name)))(function() {
      return discard1(when1(!$$null(flow))(emitFlow(frame.ops)))(function() {
        return traverse_2(runDive)(dives);
      });
    });
  });
};
var processFrame = function(frame) {
  return bind15(get3)(function(s0) {
    if (s0.error instanceof Just) {
      return pure5(unit);
    }
    ;
    if (s0.error instanceof Nothing) {
      if (frame.kind instanceof AnimatedKeyframe) {
        return processAnimated(frame);
      }
      ;
      if (frame.kind instanceof Still) {
        return processStatic(StaticStill.value)(frame);
      }
      ;
      if (frame.kind instanceof Title) {
        return processStatic(TitleCard.value)(frame);
      }
      ;
      throw new Error("Failed pattern match at Markgraf.Animation.Surface (line 343, column 16 - line 346, column 45): " + [frame.kind.constructor.name]);
    }
    ;
    throw new Error("Failed pattern match at Markgraf.Animation.Surface (line 341, column 3 - line 346, column 45): " + [s0.error.constructor.name]);
  });
};
var run3 = function(surface) {
  return discard1(registerInteriors(surface.interiors))(function() {
    return discard1(traverse_2(processFrame)(surface.frames))(function() {
      return discard1(checkBalanced)(function() {
        return bind15(get3)(function(s) {
          if (s.error instanceof Just) {
            return pure5(new Left(s.error.value0));
          }
          ;
          if (s.error instanceof Nothing) {
            var v = convertInteriors(surface.interiors);
            if (v instanceof Left) {
              return pure5(new Left(v.value0));
            }
            ;
            if (v instanceof Right) {
              return pure5(new Right({
                seed: surface.seed,
                graph: buildGraph(s),
                keyframes: s.keyframes,
                scenes: s.scenes,
                interiors: v.value0
              }));
            }
            ;
            throw new Error("Failed pattern match at Markgraf.Animation.Surface (line 285, column 16 - line 295, column 10): " + [v.constructor.name]);
          }
          ;
          throw new Error("Failed pattern match at Markgraf.Animation.Surface (line 283, column 3 - line 295, column 10): " + [s.error.constructor.name]);
        });
      });
    });
  });
};
var convertInteriors = function(interiors) {
  var step2 = function(acc) {
    return function(v) {
      return bind22(evalState(run3(v.doc))(initialState2))(function(child) {
        return new Right(insert27(v.node)(child)(acc));
      });
    };
  };
  return map26(Interiors)(foldM1(step2)(empty2)(interiors));
};
var toAnimation = function(surface) {
  return evalState(run3(surface))(initialState2);
};

// ../markgraf/output/Parsing/index.js
var $runtime_lazy4 = function(name2, moduleName, init3) {
  var state2 = 0;
  var val;
  return function(lineNumber) {
    if (state2 === 2) return val;
    if (state2 === 1) throw new ReferenceError(name2 + " was needed before it finished initializing (module " + moduleName + ", line " + lineNumber + ")", moduleName, lineNumber);
    state2 = 1;
    val = init3();
    state2 = 2;
    return val;
  };
};
var unwrap2 = /* @__PURE__ */ unwrap();
var ParseState = /* @__PURE__ */ (function() {
  function ParseState2(value0, value1, value2) {
    this.value0 = value0;
    this.value1 = value1;
    this.value2 = value2;
  }
  ;
  ParseState2.create = function(value0) {
    return function(value1) {
      return function(value2) {
        return new ParseState2(value0, value1, value2);
      };
    };
  };
  return ParseState2;
})();
var ParseError = /* @__PURE__ */ (function() {
  function ParseError2(value0, value1) {
    this.value0 = value0;
    this.value1 = value1;
  }
  ;
  ParseError2.create = function(value0) {
    return function(value1) {
      return new ParseError2(value0, value1);
    };
  };
  return ParseError2;
})();
var More = /* @__PURE__ */ (function() {
  function More2(value0) {
    this.value0 = value0;
  }
  ;
  More2.create = function(value0) {
    return new More2(value0);
  };
  return More2;
})();
var Lift = /* @__PURE__ */ (function() {
  function Lift2(value0) {
    this.value0 = value0;
  }
  ;
  Lift2.create = function(value0) {
    return new Lift2(value0);
  };
  return Lift2;
})();
var Stop = /* @__PURE__ */ (function() {
  function Stop2(value0, value1) {
    this.value0 = value0;
    this.value1 = value1;
  }
  ;
  Stop2.create = function(value0) {
    return function(value1) {
      return new Stop2(value0, value1);
    };
  };
  return Stop2;
})();
var lazyParserT = {
  defer: function(f) {
    var m = defer2(f);
    return function(state1, more, lift1, $$throw, done) {
      var v = force(m);
      return v(state1, more, lift1, $$throw, done);
    };
  }
};
var functorParserT = {
  map: function(f) {
    return function(v) {
      return function(state1, more, lift1, $$throw, done) {
        return more(function(v1) {
          return v(state1, more, lift1, $$throw, function(state2, a) {
            return more(function(v2) {
              return done(state2, f(a));
            });
          });
        });
      };
    };
  }
};
var altParserT = {
  alt: function(v) {
    return function(v1) {
      return function(v2, more, lift1, $$throw, done) {
        return more(function(v3) {
          return v(new ParseState(v2.value0, v2.value1, false), more, lift1, function(v4, err) {
            return more(function(v5) {
              if (v4.value2) {
                return $$throw(v4, err);
              }
              ;
              return v1(v2, more, lift1, $$throw, done);
            });
          }, done);
        });
      };
    };
  },
  Functor0: function() {
    return functorParserT;
  }
};
var stateParserT = function(k) {
  return function(state1, v, v1, v2, done) {
    var v3 = k(state1);
    return done(v3.value1, v3.value0);
  };
};
var runParserT$prime = function(dictMonadRec) {
  var Monad0 = dictMonadRec.Monad0();
  var map31 = map(Monad0.Bind1().Apply0().Functor0());
  var pure14 = pure(Monad0.Applicative0());
  var tailRecM3 = tailRecM(dictMonadRec);
  return function(state1) {
    return function(v) {
      var go = function($copy_step) {
        var $tco_done = false;
        var $tco_result;
        function $tco_loop(step2) {
          var v1 = step2(unit);
          if (v1 instanceof More) {
            $copy_step = v1.value0;
            return;
          }
          ;
          if (v1 instanceof Lift) {
            $tco_done = true;
            return map31(Loop.create)(v1.value0);
          }
          ;
          if (v1 instanceof Stop) {
            $tco_done = true;
            return pure14(new Done(new Tuple(v1.value1, v1.value0)));
          }
          ;
          throw new Error("Failed pattern match at Parsing (line 160, column 13 - line 166, column 32): " + [v1.constructor.name]);
        }
        ;
        while (!$tco_done) {
          $tco_result = $tco_loop($copy_step);
        }
        ;
        return $tco_result;
      };
      return tailRecM3(go)(function(v1) {
        return v(state1, More.create, Lift.create, function(state2, err) {
          return new Stop(state2, new Left(err));
        }, function(state2, res) {
          return new Stop(state2, new Right(res));
        });
      });
    };
  };
};
var position = /* @__PURE__ */ stateParserT(function(v) {
  return new Tuple(v.value1, v);
});
var parseErrorPosition = function(v) {
  return v.value1;
};
var parseErrorMessage = function(v) {
  return v.value0;
};
var initialPos = {
  index: 0,
  line: 1,
  column: 1
};
var runParserT = function(dictMonadRec) {
  var map31 = map(dictMonadRec.Monad0().Bind1().Apply0().Functor0());
  var runParserT$prime1 = runParserT$prime(dictMonadRec);
  return function(s) {
    return function(p) {
      var initialState3 = new ParseState(s, initialPos, false);
      return map31(fst)(runParserT$prime1(initialState3)(p));
    };
  };
};
var runParserT1 = /* @__PURE__ */ runParserT(monadRecIdentity);
var runParser = function(s) {
  var $295 = runParserT1(s);
  return function($296) {
    return unwrap2($295($296));
  };
};
var appendConsumed = function(v) {
  return function(v1) {
    if (v.value2 && !v1.value2) {
      return new ParseState(v1.value0, v1.value1, true);
    }
    ;
    return v1;
  };
};
var applyParserT = {
  apply: function(v) {
    return function(v1) {
      return function(state1, more, lift1, $$throw, done) {
        return more(function(v2) {
          return v(state1, more, lift1, $$throw, function(state2, f) {
            return more(function(v3) {
              var state2$prime = appendConsumed(state1)(state2);
              return v1(state2$prime, more, lift1, $$throw, function(state3, a) {
                return more(function(v4) {
                  return done(appendConsumed(state2$prime)(state3), f(a));
                });
              });
            });
          });
        });
      };
    };
  },
  Functor0: function() {
    return functorParserT;
  }
};
var applicativeParserT = {
  pure: function(a) {
    return function(state1, v, v1, v2, done) {
      return done(state1, a);
    };
  },
  Apply0: function() {
    return applyParserT;
  }
};
var bindParserT = {
  bind: function(v) {
    return function(next3) {
      return function(state1, more, lift1, $$throw, done) {
        return more(function(v1) {
          return v(state1, more, lift1, $$throw, function(state2, a) {
            return more(function(v2) {
              var v3 = next3(a);
              return v3(appendConsumed(state1)(state2), more, lift1, $$throw, done);
            });
          });
        });
      };
    };
  },
  Apply0: function() {
    return applyParserT;
  }
};
var bindFlipped3 = /* @__PURE__ */ bindFlipped(bindParserT);
var monadParserT = {
  Applicative0: function() {
    return applicativeParserT;
  },
  Bind1: function() {
    return bindParserT;
  }
};
var monadThrowParseErrorParse = {
  throwError: function(err) {
    return function(state1, v, v1, $$throw, v2) {
      return $$throw(state1, err);
    };
  },
  Monad0: function() {
    return monadParserT;
  }
};
var throwError2 = /* @__PURE__ */ throwError(monadThrowParseErrorParse);
var failWithPosition = function(message2) {
  return function(pos) {
    return throwError2(new ParseError(message2, pos));
  };
};
var fail2 = function(message2) {
  return bindFlipped3(failWithPosition(message2))(position);
};
var plusParserT = {
  empty: /* @__PURE__ */ fail2("No alternative"),
  Alt0: function() {
    return altParserT;
  }
};
var alternativeParserT = {
  Applicative0: function() {
    return applicativeParserT;
  },
  Plus1: function() {
    return plusParserT;
  }
};
var monadRecParserT = {
  tailRecM: function(next3) {
    return function(initArg) {
      return function(state1, more, lift1, $$throw, done) {
        var $lazy_loop = $runtime_lazy4("loop", "Parsing", function() {
          return function(state2, arg, gas) {
            var v = next3(arg);
            return v(state2, more, lift1, $$throw, function(state3, step2) {
              var state3$prime = appendConsumed(state2)(state3);
              if (step2 instanceof Loop) {
                var $292 = gas === 0;
                if ($292) {
                  return more(function(v1) {
                    return $lazy_loop(288)(state3$prime, step2.value0, 30);
                  });
                }
                ;
                return $lazy_loop(290)(state3$prime, step2.value0, gas - 1 | 0);
              }
              ;
              if (step2 instanceof Done) {
                return done(state3$prime, step2.value0);
              }
              ;
              throw new Error("Failed pattern match at Parsing (line 284, column 19 - line 292, column 46): " + [step2.constructor.name]);
            });
          };
        });
        var loop = $lazy_loop(279);
        return loop(state1, initArg, 30);
      };
    };
  },
  Monad0: function() {
    return monadParserT;
  }
};

// ../markgraf/output/Parsing.Combinators/index.js
var alt3 = /* @__PURE__ */ alt(altParserT);
var pure6 = /* @__PURE__ */ pure(applicativeParserT);
var applySecond2 = /* @__PURE__ */ applySecond(applyParserT);
var map27 = /* @__PURE__ */ map(functorParserT);
var manyRec2 = /* @__PURE__ */ manyRec(monadRecParserT)(alternativeParserT);
var applyFirst2 = /* @__PURE__ */ applyFirst(applyParserT);
var empty7 = /* @__PURE__ */ empty(plusParserT);
var withErrorMessage = function(p) {
  return function(msg) {
    return alt3(p)(fail2("Expected " + msg));
  };
};
var $$try2 = function(v) {
  return function(v1, more, lift3, $$throw, done) {
    return v(v1, more, lift3, function(v2, err) {
      return $$throw(new ParseState(v2.value0, v2.value1, v1.value2), err);
    }, done);
  };
};
var option = function(a) {
  return function(p) {
    return alt3(p)(pure6(a));
  };
};
var optionMaybe = function(p) {
  return option(Nothing.value)(map27(Just.create)(p));
};
var notFollowedBy = function(p) {
  return $$try2(alt3(applySecond2($$try2(p))(fail2("Negated parser succeeded")))(pure6(unit)));
};
var many = manyRec2;
var lookAhead = function(v) {
  return function(state1, more, lift3, $$throw, done) {
    return v(state1, more, lift3, function(v1, err) {
      return $$throw(state1, err);
    }, function(v1, res) {
      return done(state1, res);
    });
  };
};
var choice = function(dictFoldable) {
  var go = function(p1) {
    return function(v) {
      if (v instanceof Nothing) {
        return new Just(p1);
      }
      ;
      if (v instanceof Just) {
        return new Just(alt3(p1)(v.value0));
      }
      ;
      throw new Error("Failed pattern match at Parsing.Combinators (line 362, column 11 - line 364, column 32): " + [v.constructor.name]);
    };
  };
  var $95 = fromMaybe(empty7);
  var $96 = foldr(dictFoldable)(go)(Nothing.value);
  return function($97) {
    return $95($96($97));
  };
};
var between = function(open) {
  return function(close) {
    return function(p) {
      return applyFirst2(applySecond2(open)(p))(close);
    };
  };
};

// ../markgraf/output/Parsing.String/index.js
var fromEnum3 = /* @__PURE__ */ fromEnum(boundedEnumCodePoint);
var mod4 = /* @__PURE__ */ mod(euclideanRingInt);
var fromJust5 = /* @__PURE__ */ fromJust();
var toEnum2 = /* @__PURE__ */ toEnum(boundedEnumChar);
var show1 = /* @__PURE__ */ show(showString);
var show22 = /* @__PURE__ */ show(showChar);
var updatePosSingle = function(v) {
  return function(cp) {
    return function(after) {
      var v1 = fromEnum3(cp);
      if (v1 === 10) {
        return {
          index: v.index + 1 | 0,
          line: v.line + 1 | 0,
          column: 1
        };
      }
      ;
      if (v1 === 13) {
        var v2 = codePointAt(0)(after);
        if (v2 instanceof Just && fromEnum3(v2.value0) === 10) {
          return {
            index: v.index + 1 | 0,
            line: v.line,
            column: v.column
          };
        }
        ;
        return {
          index: v.index + 1 | 0,
          line: v.line + 1 | 0,
          column: 1
        };
      }
      ;
      if (v1 === 9) {
        return {
          index: v.index + 1 | 0,
          line: v.line,
          column: (v.column + 8 | 0) - mod4(v.column - 1 | 0)(8) | 0
        };
      }
      ;
      return {
        index: v.index + 1 | 0,
        line: v.line,
        column: v.column + 1 | 0
      };
    };
  };
};
var updatePosString = function($copy_pos) {
  return function($copy_before) {
    return function($copy_after) {
      var $tco_var_pos = $copy_pos;
      var $tco_var_before = $copy_before;
      var $tco_done = false;
      var $tco_result;
      function $tco_loop(pos, before, after) {
        var v = uncons5(before);
        if (v instanceof Nothing) {
          $tco_done = true;
          return pos;
        }
        ;
        if (v instanceof Just) {
          var newPos = (function() {
            if ($$null2(v.value0.tail)) {
              return updatePosSingle(pos)(v.value0.head)(after);
            }
            ;
            if (otherwise) {
              return updatePosSingle(pos)(v.value0.head)(v.value0.tail);
            }
            ;
            throw new Error("Failed pattern match at Parsing.String (line 165, column 7 - line 167, column 52): ");
          })();
          $tco_var_pos = newPos;
          $tco_var_before = v.value0.tail;
          $copy_after = after;
          return;
        }
        ;
        throw new Error("Failed pattern match at Parsing.String (line 161, column 36 - line 168, column 38): " + [v.constructor.name]);
      }
      ;
      while (!$tco_done) {
        $tco_result = $tco_loop($tco_var_pos, $tco_var_before, $copy_after);
      }
      ;
      return $tco_result;
    };
  };
};
var satisfy = function(f) {
  return mkFn5(function(v) {
    return function(v1) {
      return function(v2) {
        return function($$throw) {
          return function(done) {
            var v3 = uncons5(v.value0);
            if (v3 instanceof Nothing) {
              return $$throw(v, new ParseError("Unexpected EOF", v.value1));
            }
            ;
            if (v3 instanceof Just) {
              var cp = fromEnum3(v3.value0.head);
              var $85 = cp < 0 || cp > 65535;
              if ($85) {
                return $$throw(v, new ParseError("Expected Char", v.value1));
              }
              ;
              var ch = fromJust5(toEnum2(cp));
              var $86 = f(ch);
              if ($86) {
                return done(new ParseState(v3.value0.tail, updatePosSingle(v.value1)(v3.value0.head)(v3.value0.tail), true), ch);
              }
              ;
              return $$throw(v, new ParseError("Predicate unsatisfied", v.value1));
            }
            ;
            throw new Error("Failed pattern match at Parsing.String (line 114, column 7 - line 129, column 75): " + [v3.constructor.name]);
          };
        };
      };
    };
  });
};
var eof = /* @__PURE__ */ mkFn5(function(v) {
  return function(v1) {
    return function(v2) {
      return function($$throw) {
        return function(done) {
          var $133 = $$null2(v.value0);
          if ($133) {
            return done(new ParseState(v.value0, v.value1, true), unit);
          }
          ;
          return $$throw(v, new ParseError("Expected EOF", v.value1));
        };
      };
    };
  };
});
var consumeWith = function(f) {
  return mkFn5(function(v) {
    return function(v1) {
      return function(v2) {
        return function($$throw) {
          return function(done) {
            var v3 = f(v.value0);
            if (v3 instanceof Left) {
              return $$throw(v, new ParseError(v3.value0, v.value1));
            }
            ;
            if (v3 instanceof Right) {
              return done(new ParseState(v3.value0.remainder, updatePosString(v.value1)(v3.value0.consumed)(v3.value0.remainder), !$$null2(v3.value0.consumed)), v3.value0.value);
            }
            ;
            throw new Error("Failed pattern match at Parsing.String (line 286, column 7 - line 290, column 121): " + [v3.constructor.name]);
          };
        };
      };
    };
  });
};
var string = function(str) {
  return consumeWith(function(input) {
    var v = stripPrefix(str)(input);
    if (v instanceof Just) {
      return new Right({
        value: str,
        consumed: str,
        remainder: v.value0
      });
    }
    ;
    return new Left("Expected " + show1(str));
  });
};
var $$char = function(c) {
  return withErrorMessage(satisfy(function(v) {
    return v === c;
  }))(show22(c));
};
var anyChar = /* @__PURE__ */ satisfy(/* @__PURE__ */ $$const(true));

// ../markgraf/output/Markgraf.Animation.SurfaceText/index.js
var $runtime_lazy5 = function(name2, moduleName, init3) {
  var state2 = 0;
  var val;
  return function(lineNumber) {
    if (state2 === 2) return val;
    if (state2 === 1) throw new ReferenceError(name2 + " was needed before it finished initializing (module " + moduleName + ", line " + lineNumber + ")", moduleName, lineNumber);
    state2 = 1;
    val = init3();
    state2 = 2;
    return val;
  };
};
var bind16 = /* @__PURE__ */ bind(bindParserT);
var pure7 = /* @__PURE__ */ pure(applicativeParserT);
var alt4 = /* @__PURE__ */ alt(altParserT);
var voidLeft2 = /* @__PURE__ */ voidLeft(functorParserT);
var fromFoldable31 = /* @__PURE__ */ fromFoldable(foldableList);
var discard3 = /* @__PURE__ */ discard(discardUnit)(bindParserT);
var applySecond3 = /* @__PURE__ */ applySecond(applyParserT);
var map28 = /* @__PURE__ */ map(functorArray);
var map111 = /* @__PURE__ */ map(functorMaybe);
var fromFoldable115 = /* @__PURE__ */ fromFoldable2(ordString)(foldableArray);
var append113 = /* @__PURE__ */ append(semigroupArray);
var bind17 = /* @__PURE__ */ bind(bindMaybe);
var lookup34 = /* @__PURE__ */ lookup(ordString);
var choice2 = /* @__PURE__ */ choice(foldableArray);
var map29 = /* @__PURE__ */ map(functorParserT);
var TopFrame = /* @__PURE__ */ (function() {
  function TopFrame2(value0) {
    this.value0 = value0;
  }
  ;
  TopFrame2.create = function(value0) {
    return new TopFrame2(value0);
  };
  return TopFrame2;
})();
var TopInside = /* @__PURE__ */ (function() {
  function TopInside2(value0) {
    this.value0 = value0;
  }
  ;
  TopInside2.create = function(value0) {
    return new TopInside2(value0);
  };
  return TopInside2;
})();
var skipSpace = /* @__PURE__ */ bind16(/* @__PURE__ */ satisfy(function(c) {
  return c === " " || (c === "	" || (c === "\n" || c === "\r"));
}))(function() {
  return pure7(unit);
});
var skipComment = /* @__PURE__ */ bind16(/* @__PURE__ */ string("#"))(function() {
  return bind16(many(satisfy(function(c) {
    return c !== "\n";
  })))(function() {
    return pure7(unit);
  });
});
var statementTerminator = /* @__PURE__ */ withErrorMessage(/* @__PURE__ */ alt4(/* @__PURE__ */ voidLeft2(/* @__PURE__ */ lookAhead(/* @__PURE__ */ $$char("}")))(unit))(/* @__PURE__ */ alt4(/* @__PURE__ */ voidLeft2(skipComment)(unit))(/* @__PURE__ */ alt4(/* @__PURE__ */ voidLeft2(/* @__PURE__ */ satisfy(function(c) {
  return c === "\n" || c === "\r";
}))(unit))(eof))))("newline or '}' (statements end at the end of the line)");
var ws = /* @__PURE__ */ bind16(/* @__PURE__ */ many(/* @__PURE__ */ alt4(skipSpace)(skipComment)))(function() {
  return pure7(unit);
});
var ws1 = /* @__PURE__ */ bind16(/* @__PURE__ */ alt4(skipSpace)(skipComment))(function() {
  return ws;
});
var pipeLabel = /* @__PURE__ */ bind16(/* @__PURE__ */ $$char("|"))(function() {
  return bind16(many(satisfy(function(c) {
    return c !== "|";
  })))(function(cs) {
    return bind16(withErrorMessage($$char("|"))("closing '|'"))(function() {
      return pure7(fromCharArray(fromFoldable31(cs)));
    });
  });
});
var letter = /* @__PURE__ */ satisfy(function(c) {
  return c >= "a" && c <= "z" || c >= "A" && c <= "Z";
});
var hws = /* @__PURE__ */ bind16(/* @__PURE__ */ many(/* @__PURE__ */ satisfy(function(c) {
  return c === " " || c === "	";
})))(function() {
  return pure7(unit);
});
var escapedChar = /* @__PURE__ */ bind16(/* @__PURE__ */ $$char("\\"))(function() {
  return bind16(anyChar)(function(c) {
    return pure7((function() {
      if (c === "n") {
        return "\n";
      }
      ;
      if (c === "t") {
        return "	";
      }
      ;
      if (c === "r") {
        return "\r";
      }
      ;
      return c;
    })());
  });
});
var quotedChar = /* @__PURE__ */ (function() {
  var isStringBody = function(c) {
    return c !== '"' && (c !== "\\" && c !== "\n");
  };
  return alt4($$try2(escapedChar))(satisfy(isStringBody));
})();
var quotedString = /* @__PURE__ */ bind16(/* @__PURE__ */ $$char('"'))(function() {
  return bind16(many(quotedChar))(function(chars) {
    return bind16(withErrorMessage($$char('"'))(`closing '"' (unterminated string)`))(function() {
      return pure7(fromCharArray(fromFoldable31(chars)));
    });
  });
});
var labelBody = /* @__PURE__ */ (function() {
  var notLineEnd = function(c) {
    return c !== "\n" && (c !== "\r" && (c !== "#" && c !== "}"));
  };
  var colonLabel = bind16($$char(":"))(function() {
    return discard3(hws)(function() {
      return bind16(many(satisfy(notLineEnd)))(function(cs) {
        return pure7(trim(fromCharArray(fromFoldable31(cs))));
      });
    });
  });
  return discard3(hws)(function() {
    return withErrorMessage(alt4(colonLabel)(alt4(pipeLabel)(quotedString)))('label ("\u2026", : rest-of-line, or |\u2026|)');
  });
})();
var tokenLabel = /* @__PURE__ */ alt4(pipeLabel)(quotedString);
var digit = /* @__PURE__ */ satisfy(function(c) {
  return c >= "0" && c <= "9";
});
var ident = /* @__PURE__ */ bind16(/* @__PURE__ */ alt4(letter)(/* @__PURE__ */ $$char("_")))(function(first) {
  return bind16(many(alt4(letter)(alt4(digit)(alt4($$char("_"))($$char("-"))))))(function(rest) {
    return pure7(singleton6(first) + fromCharArray(fromFoldable31(rest)));
  });
});
var frameName = /* @__PURE__ */ withErrorMessage(/* @__PURE__ */ alt4(quotedString)(ident))("frame name (identifier or quoted string)");
var parseAttr = /* @__PURE__ */ discard3(hws)(function() {
  return bind16(withErrorMessage(ident)("attribute key"))(function(key) {
    return discard3(hws)(function() {
      return bind16(withErrorMessage($$char(":"))("':'"))(function() {
        return discard3(hws)(function() {
          return bind16(withErrorMessage(ident)("attribute value"))(function(value) {
            return discard3(hws)(function() {
              return pure7(new Tuple(key, value));
            });
          });
        });
      });
    });
  });
});
var parseToken = /* @__PURE__ */ bind16(ident)(function(left) {
  return discard3(hws)(function() {
    return bind16(withErrorMessage(alt4(string("->"))(string("<-")))("'->' or '<-'"))(function(arrow) {
      return discard3(hws)(function() {
        return bind16(withErrorMessage(ident)("target node identifier"))(function(right) {
          return bind16(many($$try2(applySecond3(hws)(tokenLabel))))(function(labels) {
            var v = (function() {
              if (arrow === "<-") {
                return new Tuple(right, left);
              }
              ;
              return new Tuple(left, right);
            })();
            return pure7(new Token({
              from: v.value0,
              to: v.value1,
              labels: map28(Label)(fromFoldable31(labels))
            }));
          });
        });
      });
    });
  });
});
var intLit = /* @__PURE__ */ bind16(digit)(function(d) {
  return bind16(many(digit))(function(ds) {
    var s = singleton6(d) + fromCharArray(fromFoldable31(ds));
    var v = fromString(s);
    if (v instanceof Just) {
      return pure7(v.value0);
    }
    ;
    if (v instanceof Nothing) {
      return pure7(0);
    }
    ;
    throw new Error("Failed pattern match at Markgraf.Animation.SurfaceText (line 369, column 3 - line 371, column 22): " + [v.constructor.name]);
  });
});
var keyword = function(kw) {
  return $$try2(bind16(string(kw))(function() {
    return discard3(notFollowedBy(alt4(letter)(alt4(digit)(alt4($$char("_"))($$char("-"))))))(function() {
      return discard3(ws)(function() {
        return pure7(kw);
      });
    });
  }));
};
var parseVia = /* @__PURE__ */ discard3(ws1)(function() {
  return bind16(keyword("via"))(function() {
    return bind16(ident)(function(from2) {
      return discard3(ws1)(function() {
        return bind16(ident)(function(to2) {
          return pure7({
            from: from2,
            to: to2
          });
        });
      });
    });
  });
});
var prefix = function(kw) {
  return $$try2(bind16(string(kw))(function() {
    return discard3(notFollowedBy(alt4(letter)(alt4(digit)(alt4($$char("_"))($$char("-"))))))(function() {
      return pure7(unit);
    });
  }));
};
var parseAddEdge = /* @__PURE__ */ discard3(/* @__PURE__ */ prefix("+edge"))(function() {
  return discard3(ws1)(function() {
    return bind16(withErrorMessage(ident)("source node identifier"))(function(from2) {
      return discard3(ws1)(function() {
        return bind16(withErrorMessage(ident)("target node identifier"))(function(to2) {
          return bind16(optionMaybe($$try2(applySecond3(hws)(tokenLabel))))(function(label) {
            return pure7(new AddEdge({
              from: from2,
              to: to2,
              label: map111(Label)(label)
            }));
          });
        });
      });
    });
  });
});
var parseDelEdge = /* @__PURE__ */ discard3(/* @__PURE__ */ prefix("-edge"))(function() {
  return discard3(ws1)(function() {
    return bind16(withErrorMessage(ident)("source node identifier"))(function(from2) {
      return discard3(ws1)(function() {
        return bind16(withErrorMessage(ident)("target node identifier"))(function(to2) {
          return pure7(new DelEdge({
            from: from2,
            to: to2
          }));
        });
      });
    });
  });
});
var parseDelNode = /* @__PURE__ */ discard3(/* @__PURE__ */ prefix("-node"))(function() {
  return discard3(ws1)(function() {
    return bind16(withErrorMessage(ident)("node identifier"))(function(nid) {
      return bind16(many($$try2(parseVia)))(function(vias) {
        return pure7(new DelNode({
          id: nid,
          via: fromFoldable31(vias)
        }));
      });
    });
  });
});
var parseEnter = /* @__PURE__ */ discard3(/* @__PURE__ */ prefix("enter"))(function() {
  return discard3(ws1)(function() {
    return bind16(withErrorMessage(ident)("node identifier"))(function(nid) {
      return pure7(new Enter({
        id: nid
      }));
    });
  });
});
var parseExit = /* @__PURE__ */ discard3(/* @__PURE__ */ prefix("exit"))(function() {
  return pure7(Exit.value);
});
var parseRepointEdge = /* @__PURE__ */ discard3(/* @__PURE__ */ prefix("~edge"))(function() {
  return discard3(ws1)(function() {
    return bind16(withErrorMessage(ident)("source node identifier"))(function(from2) {
      return discard3(ws1)(function() {
        return bind16(withErrorMessage(ident)("target node identifier"))(function(to2) {
          return discard3(ws)(function() {
            return bind16(withErrorMessage(string("->"))("'->'"))(function() {
              return discard3(ws)(function() {
                return bind16(withErrorMessage(ident)("new source node identifier"))(function(newFrom) {
                  return discard3(ws1)(function() {
                    return bind16(withErrorMessage(ident)("new target node identifier"))(function(newTo) {
                      return pure7(new RepointEdge({
                        from: from2,
                        to: to2,
                        newFrom,
                        newTo
                      }));
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});
var parseSeed = /* @__PURE__ */ discard3(/* @__PURE__ */ prefix("seed"))(function() {
  return discard3(hws)(function() {
    return bind16(withErrorMessage(intLit)("integer (seed value)"))(function(n) {
      return discard3(ws)(function() {
        return pure7(n);
      });
    });
  });
});
var braces = /* @__PURE__ */ between(/* @__PURE__ */ applySecond3(/* @__PURE__ */ $$char("{"))(ws))(/* @__PURE__ */ withErrorMessage(/* @__PURE__ */ applySecond3(ws)(/* @__PURE__ */ $$char("}")))("closing '}'"));
var parseAttrs = /* @__PURE__ */ (function() {
  var parseBody = bind16(optionMaybe($$try2(parseAttr)))(function(first) {
    if (first instanceof Nothing) {
      return pure7(empty2);
    }
    ;
    if (first instanceof Just) {
      return bind16(many($$try2(applySecond3(applySecond3(applySecond3(hws)($$char(",")))(hws))(parseAttr))))(function(rest) {
        return pure7(fromFoldable115(append113([first.value0])(fromFoldable31(rest))));
      });
    }
    ;
    throw new Error("Failed pattern match at Markgraf.Animation.SurfaceText (line 225, column 5 - line 229, column 64): " + [first.constructor.name]);
  });
  return braces(parseBody);
})();
var parseAddNode = /* @__PURE__ */ (function() {
  var isNoLabelTerminator = function(c) {
    return c === "\n" || (c === "\r" || (c === "#" || (c === "}" || c === "{")));
  };
  var noLabelMarker = bind16(alt4(voidLeft2(eof)(unit))(voidLeft2(satisfy(isNoLabelTerminator))(unit)))(function() {
    return pure7(true);
  });
  var optionalLabel = discard3(hws)(function() {
    return bind16(alt4($$try2(lookAhead(noLabelMarker)))(pure7(false)))(function(noLabel) {
      if (noLabel) {
        return pure7("");
      }
      ;
      return labelBody;
    });
  });
  return discard3(prefix("+node"))(function() {
    return discard3(ws1)(function() {
      return bind16(withErrorMessage(ident)("node identifier"))(function(nid) {
        return bind16(optionalLabel)(function(label) {
          return bind16(alt4($$try2(applySecond3(hws)(parseAttrs)))(pure7(empty2)))(function(attrs) {
            var shape = fromMaybe(Rectangle.value)(bind17(lookup34("shape")(attrs))(parseShape));
            return pure7(new AddNode({
              id: nid,
              label,
              shape
            }));
          });
        });
      });
    });
  });
})();
var parseLeaf = /* @__PURE__ */ bind16(position)(function(v) {
  return bind16(withErrorMessage(choice2([parseAddNode, parseDelNode, parseRepointEdge, parseAddEdge, parseDelEdge, parseEnter, parseExit, parseToken]))("statement (+node, -node, +edge, -edge, ~edge, enter, exit, or 'a -> b')"))(function(op) {
    return pure7(new Leaf2({
      op,
      line: v.line,
      column: v.column
    }));
  });
});
var parseBlockBody = function(wrap2) {
  return bind16(many($lazy_parseStatement(123)))(function(items) {
    return pure7(wrap2(fromFoldable31(items)));
  });
};
var $lazy_parseStatement = /* @__PURE__ */ $runtime_lazy5("parseStatement", "Markgraf.Animation.SurfaceText", function() {
  return discard3($$try2(applySecond3(ws)(notFollowedBy($$char("}")))))(function() {
    return bind16(choice2([$$try2($lazy_parseParBlock(130)), $$try2($lazy_parseSeqBlock(131)), parseLeaf]))(function(s) {
      return discard3(hws)(function() {
        return discard3(statementTerminator)(function() {
          return pure7(s);
        });
      });
    });
  });
});
var $lazy_parseParBlock = /* @__PURE__ */ $runtime_lazy5("parseParBlock", "Markgraf.Animation.SurfaceText", function() {
  return bind16(keyword("par"))(function() {
    return braces(parseBlockBody(Par.create));
  });
});
var $lazy_parseSeqBlock = /* @__PURE__ */ $runtime_lazy5("parseSeqBlock", "Markgraf.Animation.SurfaceText", function() {
  return bind16(keyword("seq"))(function() {
    return braces(parseBlockBody(Seq.create));
  });
});
var parseFrameWith = function(kw) {
  return function(kind) {
    return bind16(keyword(kw))(function() {
      return bind16(frameName)(function(name2) {
        return discard3(ws)(function() {
          return bind16(braces(parseBlockBody(Seq.create)))(function(body) {
            return discard3(ws)(function() {
              return pure7({
                name: new Just(name2),
                ops: body,
                kind
              });
            });
          });
        });
      });
    });
  };
};
var parseAnyFrame = /* @__PURE__ */ (function() {
  return alt4(parseFrameWith("keyframe")(AnimatedKeyframe.value))(alt4(parseFrameWith("still")(Still.value))(parseFrameWith("title")(Title.value)));
})();
var $lazy_parseDocument = /* @__PURE__ */ $runtime_lazy5("parseDocument", "Markgraf.Animation.SurfaceText", function() {
  var topInterior = function(v) {
    if (v instanceof TopInside) {
      return new Just(v.value0);
    }
    ;
    if (v instanceof TopFrame) {
      return Nothing.value;
    }
    ;
    throw new Error("Failed pattern match at Markgraf.Animation.SurfaceText (line 74, column 17 - line 76, column 26): " + [v.constructor.name]);
  };
  var topFrame = function(v) {
    if (v instanceof TopFrame) {
      return new Just(v.value0);
    }
    ;
    if (v instanceof TopInside) {
      return Nothing.value;
    }
    ;
    throw new Error("Failed pattern match at Markgraf.Animation.SurfaceText (line 71, column 14 - line 73, column 27): " + [v.constructor.name]);
  };
  return bind16(optionMaybe(parseSeed))(function(seedVal) {
    return bind16(many($lazy_parseTopItem(63)))(function(itemList) {
      var items = fromFoldable31(itemList);
      return pure7({
        seed: fromMaybe(0)(seedVal),
        frames: mapMaybe(topFrame)(items),
        interiors: mapMaybe(topInterior)(items)
      });
    });
  });
});
var $lazy_parseInside = /* @__PURE__ */ $runtime_lazy5("parseInside", "Markgraf.Animation.SurfaceText", function() {
  return bind16(keyword("inside"))(function() {
    return bind16(withErrorMessage(ident)("node identifier"))(function(nid) {
      return discard3(ws)(function() {
        return bind16(braces($lazy_parseDocument(97)))(function(doc) {
          return discard3(ws)(function() {
            return pure7({
              node: nid,
              doc
            });
          });
        });
      });
    });
  });
});
var $lazy_parseTopItem = /* @__PURE__ */ $runtime_lazy5("parseTopItem", "Markgraf.Animation.SurfaceText", function() {
  return defer(lazyParserT)(function(v) {
    return alt4(map29(TopInside.create)($$try2($lazy_parseInside(81))))(map29(TopFrame.create)(parseAnyFrame));
  });
});
var parseDocument = /* @__PURE__ */ $lazy_parseDocument(60);
var parseSurface = /* @__PURE__ */ applyFirst(applyParserT)(/* @__PURE__ */ applySecond3(ws)(parseDocument))(/* @__PURE__ */ withErrorMessage(/* @__PURE__ */ applySecond3(ws)(eof))("'keyframe', 'still', 'title', 'inside', or end of input"));
var runSurfaceParserDetailed = function(src) {
  var toFailure = function(err) {
    var v2 = parseErrorPosition(err);
    return {
      msg: parseErrorMessage(err),
      line: v2.line,
      column: v2.column
    };
  };
  var v = runParser(src)(parseSurface);
  if (v instanceof Left) {
    return new Left(toFailure(v.value0));
  }
  ;
  if (v instanceof Right) {
    return new Right(v.value0);
  }
  ;
  throw new Error("Failed pattern match at Markgraf.Animation.SurfaceText (line 46, column 32 - line 48, column 27): " + [v.constructor.name]);
};
var runSurfaceParser = function(src) {
  var v = runSurfaceParserDetailed(src);
  if (v instanceof Left) {
    return new Left(v.value0.msg);
  }
  ;
  if (v instanceof Right) {
    return new Right(v.value0);
  }
  ;
  throw new Error("Failed pattern match at Markgraf.Animation.SurfaceText (line 41, column 24 - line 43, column 27): " + [v.constructor.name]);
};

// ../markgraf/output/Markgraf.Animation.Layout.Export/index.js
var show4 = /* @__PURE__ */ show(showInt);
var bind18 = /* @__PURE__ */ bind(bindMaybe);
var lookup35 = /* @__PURE__ */ lookup(ordEdgeId);
var lookup117 = /* @__PURE__ */ lookup(ordNodeId);
var pure8 = /* @__PURE__ */ pure(applicativeMaybe);
var append114 = /* @__PURE__ */ append(semigroupArray);
var map30 = /* @__PURE__ */ map(functorArray);
var un12 = /* @__PURE__ */ un();
var bind19 = /* @__PURE__ */ bind(bindEither);
var lmap2 = /* @__PURE__ */ lmap(bifunctorEither);
var pure13 = /* @__PURE__ */ pure(applicativeEither);
var fromFoldable39 = /* @__PURE__ */ fromFoldable(foldableList);
var toEdge = function(pts) {
  return {
    points: pts
  };
};
var shapeId = function(v) {
  if (v instanceof Rectangle) {
    return 0;
  }
  ;
  if (v instanceof Cylinder) {
    return 1;
  }
  ;
  if (v instanceof Parallelogram) {
    return 2;
  }
  ;
  if (v instanceof Diamond) {
    return 3;
  }
  ;
  if (v instanceof Ellipse) {
    return 4;
  }
  ;
  if (v instanceof Document) {
    return 5;
  }
  ;
  if (v instanceof Cloud) {
    return 6;
  }
  ;
  throw new Error("Failed pattern match at Markgraf.Animation.Layout.Export (line 132, column 11 - line 139, column 13): " + [v.constructor.name]);
};
var toNode = function(np) {
  return {
    x: np.x + np.w / 2,
    y: np.y + np.h / 2,
    w: np.w,
    h: np.h,
    label: np.label,
    shape: shapeId(np.shape)
  };
};
var schedErr = function(errs) {
  return "schedule: " + (show4(length(errs)) + " error(s)");
};
var renderErr = function(e) {
  return e.msg + (" (line " + (show4(e.line) + (", col " + (show4(e.column) + ")"))));
};
var scheduleJson = function(src) {
  var center = function(n) {
    return {
      x: n.x + n.w / 2,
      y: n.y + n.h / 2
    };
  };
  var tokenOf = function(layout2) {
    return function(w) {
      if (w.target instanceof TokenWindow) {
        return bind18(lookup35(w.target.value1)(layout2.edges))(function(path) {
          var pre = maybe([])(function(n) {
            return [center(n)];
          })(lookup117(w.target.value3)(layout2.nodes));
          var post = maybe([])(function(n) {
            return [center(n)];
          })(lookup117(w.target.value4)(layout2.nodes));
          var oriented = (function() {
            if (w.target.value2 instanceof Forward) {
              return path;
            }
            ;
            if (w.target.value2 instanceof Backward) {
              return reverse(path);
            }
            ;
            throw new Error("Failed pattern match at Markgraf.Animation.Layout.Export (line 93, column 20 - line 95, column 35): " + [w.target.value2.constructor.name]);
          })();
          return pure8({
            points: append114(pre)(append114(oriented)(post)),
            label: joinWith(" ")(map30(un12(Label))(w.target.value5)),
            startT: w.startT,
            endT: w.endT,
            holdPre: w.target.value6,
            holdPost: w.target.value7
          });
        });
      }
      ;
      return Nothing.value;
    };
  };
  var build3 = bind19(runSurfaceParser(src))(function(surface) {
    return bind19(lmap2(renderErr)(toAnimation(surface)))(function(animation) {
      var layout2 = layoutFromAnimation(animation);
      return bind19(lmap2(schedErr)(precompute(defaultTiming)(animation)(layout2)))(function(schedule) {
        return pure13({
          ok: true,
          error: "",
          duration: schedule.totalDuration,
          nodes: map30(toNode)(fromFoldable39(values(layout2.nodes))),
          edges: map30(toEdge)(fromFoldable39(values(layout2.edges))),
          tokens: catMaybes(map30(tokenOf(layout2))(schedule.windows))
        });
      });
    });
  });
  if (build3 instanceof Left) {
    return {
      ok: false,
      error: build3.value0,
      duration: 0,
      nodes: [],
      edges: [],
      tokens: []
    };
  }
  ;
  if (build3 instanceof Right) {
    return build3.value0;
  }
  ;
  throw new Error("Failed pattern match at Markgraf.Animation.Layout.Export (line 72, column 20 - line 74, column 15): " + [build3.constructor.name]);
};
var layoutJson = function(src) {
  var build3 = bind19(runSurfaceParser(src))(function(surface) {
    return bind19(lmap2(renderErr)(toAnimation(surface)))(function(animation) {
      return pure13(layoutFromAnimation(animation));
    });
  });
  if (build3 instanceof Left) {
    return {
      ok: false,
      error: build3.value0,
      nodes: [],
      edges: []
    };
  }
  ;
  if (build3 instanceof Right) {
    return {
      ok: true,
      error: "",
      nodes: map30(toNode)(fromFoldable39(values(build3.value0.nodes))),
      edges: map30(toEdge)(fromFoldable39(values(build3.value0.edges)))
    };
  }
  ;
  throw new Error("Failed pattern match at Markgraf.Animation.Layout.Export (line 52, column 18 - line 59, column 6): " + [build3.constructor.name]);
};
export {
  layoutJson,
  scheduleJson
};
