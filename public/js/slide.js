/*global Detect*/
; (function (window, undefined) {

  function $(selector, context) {
    var eles;

    if (typeof selector !== 'string') {
      if (selector.length && selector.length !== 1) {
        return [].slice.call(selector);
      } else {
        return [selector];
      }
    } else {
      context = context || document;
      eles = context.querySelectorAll(selector);
      eles = eles || [];
  
      return [].slice.call(eles);
    }
  }

  function bind(eles, events, fun) {
    eles = $(eles);
    events = events.split(/\s+/);

    eles.forEach(function (ele) {
      events.forEach(function (event) {
        if (event) {
          ele.addEventListener(event, fun);
        }
      });
    });
  }
  
  function unbind(eles, events, fun) {
    eles = $(eles);
    events = events.split(/\s+/);

    eles.forEach(function (ele) {
      events.forEach(function (event) {
        if (event) {
          ele.removeEventListener(event, fun);
        }
      });
    });
  }

  /*var settings = {
    interval: 3000
  };*/

  function Slide(opts) {
    var self = this,
      $container = $(opts.container)[0],
      $list = $('.slide-list', $container)[0],
      $prev = $('.slide-prev', $container)[0],
      $next = $('.slide-next', $container)[0],
      $markerWrap = $('.slide-marker', $container)[0],
      $markers = $('span', $markerWrap),
      $first, $last,
      startpos, lastpos;

    // 参数初始化
    self.width = opts.width;
    self.markers = $markers;
    self.index = 1;
    self.len = $markers.length;
    self.animated = false;
    self.interval = 3000;
    
    // 上一页和下一页
    if (Detect.isTouch) {
      $prev.style.display = 'none';
      $next.style.display = 'none';
    } else {
      bind($prev, 'click', function () {
        self.nextSlice();
      });
      
      bind($next, 'click', function () {
        self.prevSlice();
      });
    }

    // 初始化slide-marker
    $markers[0].classList.add('active');
    $markers.forEach(function (marker, i) {
      marker.setAttribute('index', i + 1);
    });

    $markerWrap.onclick = function (e) {
      var ele = e.target, index;
      if (ele.tagName === 'SPAN') {
        index = ele.getAttribute('index') || 1;
        self.switchTo(parseInt(index, 10));
      }
    }
  
    // 初始化slide
    $first = $('img:first-child', $list)[0];
    $last = $('img:last-child', $list)[0];
    $list.appendChild($first.cloneNode());
    $list.insertBefore($last.cloneNode(), $first);

    self.list = $list;
    self.setPosition = setPosition.bind(self);
    self.setPosition(-opts.width, 1, true);
  
    // 自动轮播
    if (Detect.isTouch) {
      bind($container, 'touchstart', function (e) {
        e.preventDefault();
        if (self.animated) {
          return;
        }
        startpos = e.touches[0].pageX;
        self.stop();
      });
      
      bind($container, 'touchmove', function (e) {
        e.preventDefault();
        if (self.animated) {
          return;
        }
        var x = e.touches[0].pageX, 
          dis = lastpos ? (x - lastpos) : 0;
        
        lastpos = x;
        
        self.setPosition(self.position + dis, undefined, true);
      });
      
      bind($container, 'touchend', function (e) {
        e.preventDefault();
        if (self.animated) {
          return;
        }
        // 向右滑动
        if (lastpos > startpos) {
          self.prevSlice();
        }
        // 向左滑动
        else {
          self.nextSlice();
        }
        startpos = lastpos = 0;
        self.play();
      });
    } else {
      bind($container, 'mouseover', function () {
        self.stop();
      });
      
      bind($container, 'mouseout', function () {
        self.play();
      });
    }
    self.play();
  }

  /**
   * 设置下方第i个marker为active
   * @param {Array}   所有的marker
   * @param {Integer} 活动的下标
   */
  function setMarker($markers, i) {
    $markers.forEach(function ($marker) {
      var cls = $marker.classList;
      if (cls.contains('active')) {
        cls.remove(cls);
        return false;
      }
    });
    $markers[i].classList.add('active');
  }

  function setPosition(pos, slice, noTtransition) {
    var self = this,
      $ele = self.list,
      transition = Detect.transitionName,
      transform = Detect.transformName;

    if (noTtransition) {
      $ele.style[transition.key] = 'none';
    } else {
      self.animated = true;
      $ele.style[transition.key] = transform.val + ' 0.5s linear';
      bind($ele, Detect.transitionEndName, transitionend);
    }
    self.position = pos;
    $ele.style[transform.key] = Detect.transform3d ? 'translate3d(' + pos + 'px, 0, 0)' : 'translate(' + pos + 'px, 0)';

    function transitionend() {
      var dis;
      if (slice > self.len || slice < 1) {
        if (slice > self.len) {
          dis = -self.width;
        } else if (slice < 1) {
          dis = -self.len * self.width;
        }
        $ele.style[transition.key] = 'none';
        $ele.style[transform.key] = Detect.transform3d ? 'translate3d(' + dis + 'px, 0, 0)' : 'translate(' + dis + 'px, 0)';;
        self.position = dis;
      }
      unbind($ele, Detect.transitionEndName, transitionend);
      self.animated = false;
    }
  }

  Slide.prototype.switchTo = function (slice) {
    if (this.animated || this.index === slice) {
      return;
    }
    var newSlice = slice > this.len ? 1 : (slice < 1 ? this.len : slice);

    this.index = newSlice;
    setMarker(this.markers, this.index - 1);

    this.setPosition(-slice * this.width, slice);
  };

  Slide.prototype.nextSlice = function () {
    this.switchTo(this.index + 1);
  };

  Slide.prototype.prevSlice = function () {
    this.switchTo(this.index - 1);
  };

  Slide.prototype.stop = function () {
    clearTimeout(this.timer);
  };

  Slide.prototype.play = function () {
    var self = this;
    self.timer = setTimeout(function () {
      self.nextSlice();
      self.play();
    }, self.interval);
  };

  window.Slide = Slide;

})(this);

var slide = new Slide({
  container: '.container',
  width: 750
});