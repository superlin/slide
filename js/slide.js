function $(selector, context) {
  context = context || document;
  return context.querySelector(selector);
}

function $$(selector, context) {
  context = context || document;
  return [].slice.call(context.querySelectorAll(selector));
}

var settings = {
  interval: 3000
};

function Slide(opts) {
  var self = this,
    $container = $(opts.container),
    $list = $('.slide-list', $container),
    $prev = $('.slide-prev', $container),
    $next = $('.slide-next', $container),
    $markerWrap = $('.slide-marker', $container),
    $markers = $$('span', $markerWrap),
    $first, $last;

  // 参数初始化
  self.width = opts.width;
  self.markers = $markers;
  self.index = 1;
  self.len = $markers.length;
  self.animated = false;
  self.interval = 3000;
    
  // 上一页和下一页
  $prev.onclick = function () {
    self.nextSlice();
  };

  $next.onclick = function () {
    self.prevSlice();
  };

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
  $first = $('img:first-child', $list);
  $last = $('img:last-child', $list);
  $list.appendChild($first.cloneNode());
  $list.insertBefore($last.cloneNode(), $first);

  self.list = $list;
  self.setPosition = setPosition.bind(self);
  self.setPosition(-opts.width, 1, true);
  
  // 自动轮播
  $container.onmouseover = function () {
    self.stop();
  };
  $container.onmouseout = function () {
    self.play();
  };
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

var TRANSITIONEND_NAME = 'transitionend';
function setPosition(pos, slice, noTtransition) {
  var self = this
    , $ele = self.list;
  
  if (noTtransition) {
    $ele.style.transition = 'none';
  } else {
    self.animated = true;
    $ele.style.transition = 'transform 0.5s linear';
    $ele.addEventListener(TRANSITIONEND_NAME, transitionend);
  }
  $ele.style.transform = 'translate3d(' + pos + 'px, 0, 0)';

  function transitionend() {
    var dis;
    if (slice > self.len || slice < 1) {
      if (slice > self.len) {
        dis = -self.width;
      } else if (slice < 1) {
        dis = -self.len * self.width;
      }
      $ele.style.transition = 'none';
      $ele.style.transform = 'translate3d(' + dis + 'px, 0, 0)';
    }
    $ele.removeEventListener(TRANSITIONEND_NAME, transitionend);
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

var slide = new Slide({
  container: '.container',
  width: 750
});