; (function (window, undefined) {
  'use strict';
  
  var TEST_ELE = document.createElement('p');
  var PREFIXS = ['', 'webkit', 'Moz', 'ms', 'O'];
  
  function prefixed(prop) {
    var res = {},
      camp = prop.slice(0, 1).toUpperCase() + prop.slice(1);
    
    prop = prop.toLowerCase();
    
    PREFIXS.forEach(function (pre) {
      var key = pre === '' ? prop : pre+camp,
        val =  pre === '' ? prop : '-'+pre.toLowerCase()+'-'+prop;
      res[key] = val;
    });
    
    return res;
  }
  
  function propName(prop) {
    var props = prefixed(prop);
    for (var t in props) {
      if (TEST_ELE.style[t] !== undefined) {
        return {
          key: t,
          val: props[t]
        };
      }
    }
  }

  var transformName = (function () {
    return propName('transform');
  })();
  
  var transitionName = (function () {
    return propName('transition');
  })();

  var transitionEndName = (function () {
    var i,
      el = document.createElement('div'),
      transitions = {
        'transition': 'transitionend',
        'webkitTransition': 'webkitTransitionEnd',
        'MozTransition': 'transitionend',
        'msTransition': 'msTransitionEnd',
        'OTransition': 'otransitionend'
      };

    for (i in transitions) {
      if (transitions.hasOwnProperty(i) && el.style[i] !== undefined) {
        return transitions[i];
      }
    }
  })();

  var transform3d = (function () {
    if (!transformName || !window.getComputedStyle) {
      return false;
    }

    var has3d;

    document.body.insertBefore(TEST_ELE, null);

    if (TEST_ELE.style[transformName.key] !== undefined) {
      TEST_ELE.style[transformName.key] = 'translate3d(1px, 1px, 1px)';
      has3d = window.getComputedStyle(TEST_ELE).getPropertyValue(transformName.val);
    }

    document.body.removeChild(TEST_ELE);

    return (has3d !== undefined && has3d.length > 0 && has3d !== "none");
  })();
  
  var isTouch = (function() {
    return 'ontouchstart' in window;
  })();
  
  window.Detect = {
    transitionName: transitionName,
    transitionEndName: transitionEndName,
    transformName: transformName,
    transform3d: transform3d,
    isTouch: isTouch
  };
})(this);
