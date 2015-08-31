/*global Detect*/
; (function (window, undefined) {
  'use strict';

  /**
   * 简单的选择器
   * @param {String|DOMElement|Array} 选择器/单个dom元素/dom数组
   * @param {DOMElement}              父级元素
   * @return                          DOM元素数组
   */
  function $(selector, context) {
    var eles;

    if (typeof selector !== 'string') {
      // DOM数组
      if (selector.length && selector.length !== 1) {
        return [].slice.call(selector);
      }
      // 单个元素
      else {
        return [selector];
      }
    }
    // 字符串
    else {
      context = context || document;
      eles = context.querySelectorAll(selector);
      eles = eles || [];
  
      return [].slice.call(eles);
    }
  }

  /**
   * 绑定事件
   * @param {String|DOMElement|Array} 选择器/单个dom元素/dom数组
   * @param {String}                  事件数组，空格分隔
   * @param {Function}                回调函数
   */
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
  
  /**
   * 解除绑定
   * @param {String|DOMElement|Array} 选择器/单个dom元素/dom数组
   * @param {String}                  事件数组，空格分隔
   * @param {Function}                回调函数
   */
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
  
  /**
   * 设置默认参数
   * @param {Object} 默认参数
   * @param {Object} 参数列表
   */
  function defaults(defs, opts) {
    for (var k in defs) {
      if (defs.hasOwnProperty(k)) {
        if (!opts.hasOwnProperty(k)) {
          opts[k] = defs[k];
        }
      }
    }
  }
  
  // 默认参数列表
  var settings = {
    interval: 3000,
    container: '.container',
    list: '.slide-list',
    prev: '.slide-prev',
    next: '.slide-next',
    markers: '.slide-marker',
    img: 'img'
  };

  function Slide(opts) {
    // 设置默认值
    defaults(settings, opts);
    
    var self = this,
      // 容器
      $container = $(opts.container)[0],
      // 轮播图片列表
      $list = $(opts.list, $container)[0],
      // 下一页链接
      $prev = $(opts.prev, $container)[0],
      // 上一页链接
      $next = $(opts.next, $container)[0],
      // 页数指示器
      $markerWrap = $(opts.markers, $container)[0],
      // 所有的指示器
      $markers = $('span', $markerWrap),
      
      $first, $last,
      startpos, lastpos,
      scrolltimer;

    // 参数初始化
    self.width = opts.width;      // 一页的宽度
    self.markers = $markers;      // 指示器列表
    self.index = 1;               // 当前页数
    self.len = $markers.length;   // 总页数
    self.animated = false;        // 当前是否正在播放动画
    self.interval = opts.interval;// 自动轮播时间间隔
    
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
    $first = $(opts.img + ':first-child', $list)[0];
    $last = $(opts.img + ':last-child', $list)[0];
    $list.appendChild($first.cloneNode());
    $list.insertBefore($last.cloneNode(), $first);

    self.list = $list;
    self.setPosition = setPosition.bind(self);
    self.setPosition(-opts.width, 1, true);
    
    // 超出界限 停止轮播（防抖动）
    bind(window, 'scroll', function () {
      if (scrolltimer) {
        clearTimeout(scrolltimer);
      }
      scrolltimer = setTimeout(function () {
        var rect = $container.getBoundingClientRect();
        if (rect.height < -rect.top || rect.height < -rect.bottom
          || rect.width < -rect.left || rect.width < -rect.right) {
          self.stop();
        } else {
          self.play();
        }
      }, 100);
    });
  
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
    // 开始轮播
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

  /**
   * 设置轮播的偏移位置
   * @param {Integer} 偏移的位置
   * @param {Integer} 当前到第几页
   * @param {Boolean} 是否需要过渡效果
   */
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

  /**
   * 轮播到某一页
   * @param {Integer} 页面编号
   */
  Slide.prototype.switchTo = function (slice) {
    if (this.animated || this.index === slice) {
      return;
    }
    var newSlice = slice > this.len ? 1 : (slice < 1 ? this.len : slice);

    this.index = newSlice;
    setMarker(this.markers, this.index - 1);

    this.setPosition(-slice * this.width, slice);
  };

  /**
   * 轮播到下一页
   */
  Slide.prototype.nextSlice = function () {
    this.switchTo(this.index + 1);
  };

  /**
   * 轮播到上一页
   */
  Slide.prototype.prevSlice = function () {
    this.switchTo(this.index - 1);
  };

  /**
   * 停止自动轮播
   */
  Slide.prototype.stop = function () {
    clearInterval(this.timer);
    this.timer = undefined;
  };

  /**
   * 开始自动轮播
   */
  Slide.prototype.play = function () {
    var self = this;
    // 之前的没有清除，不能再次设定
    if (this.timer) {
      return;
    }
    self.timer = setInterval(function () {
      self.nextSlice();
    }, self.interval);
  };

  window.Slide = Slide;

})(this);

var slide = new Slide({
  container: '.container',
  width: 640
});