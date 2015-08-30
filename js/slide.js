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
    
  self.width = opts.width;
    
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
    marker.setAttribute('index', i+1);
  });
  
  $markerWrap.onclick = function (e) {
    var ele = e.target, index;
    if (ele.tagName === 'SPAN') {
      index = ele.getAttribute('index') || 1;
      self.switchTo(index);
    }
  }
  
  // 初始化slide
  $first = $('img:first-child', $list);
  $last = $('img:last-child', $list);
  $list.appendChild($first.cloneNode());
  $list.insertBefore($last.cloneNode(), $first);
  
  this.list = $list;
  this.setPosition = setPosition.bind(this);
  this.setPosition(-opts.width, true);
  
  this.markers = $markers;
  this.position = -opts.width;
  this.index = 1;
  this.len = $markers.length;
  this.animated = false;
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
function setPosition(pos, slice) {
  var self = this
    , $ele = self.list;
    
  self.animated = true;
  $ele.style.transition = 'transform 0.5s linear';
  $ele.style.transform = 'translate3d(' + pos + 'px, 0, 0)';
  
  $ele.addEventListener(TRANSITIONEND_NAME, transitionend);
  
  function transitionend() {
    var dis;
    if (slice > self.len || slice < 1) {
      if (slice > self.len) {
        dis = -self.width;
      } else if (slice < 1) {
        dis = -self.len*self.width;
      }
      $ele.style.transition = 'none';
      $ele.style.transform = 'translate3d(' + dis + 'px, 0, 0)';
    }
    $ele.removeEventListener(TRANSITIONEND_NAME, transitionend);
    self.animated = false;
  }
}

Slide.prototype.switchTo = function(slice) {
  if (this.animated || this.index === slice) {
    return;
  }
  var newSlice = slice > this.len ? 1 : (slice < 1 ? this.len : slice);
  
  this.index = newSlice;
  setMarker(this.markers, this.index - 1);
  
  this.setPosition(-slice*this.width, slice);
};

Slide.prototype.nextSlice = function() {
  this.switchTo(this.index + 1);
};

Slide.prototype.prevSlice = function() {
  this.switchTo(this.index - 1);
};

Slide.prototype.stopAutoSwitch = function() {
  
};

Slide.prototype.resumeAutoSwitch = function() {
  
};

var slide = new Slide({
  container: '.container',
  width: 750
});