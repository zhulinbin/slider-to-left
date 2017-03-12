/*!
 * slideToLeft.js - v1.0.0 - 2017
 * Copyright (c) 2017 Luoxiaobin.
 * Usage: $("selector").slideToLeft(options);
 */
(function($) {
	var defaults = {
	    /**
	      The threshold we start dragging.
	      @property dragStartDistance
	      @type Number
	      @default 10
	     */
		dragStartDistance: 10,
	    /**
	      The threshold to stop touch element being dragging.
	      @property buttonsWidth
	      @type Number
	      @default 80
	     */
		buttonsWidth: 80
	};

	/* Setting basic touch object attributes */
	var touchBaseObj = function() {};
	touchBaseObj.prototype = {
		start: function() {},
		move: function() {},
		end: function() {},
		createEvent: function() {},
		addEvents: function() {},
		removeEvents: function() {}
	};

	/* Defined element which inherit basic touch object */
	var touchElement = function(element, opts){
		this.startOffsetX      = "";
		this.isDragging        = false;
		this.dragStartDistance = opts.dragStartDistance;
		this.touchX1           = 0;
		this.touchX2           = 0;
		this.buttonsWidth      = opts.buttonsWidth;
		this.event             = null,
		this.$element          = element;
		this.oldTarget		   = null;
	};

	touchElement.prototype = new touchBaseObj();

	touchElement.prototype.start = function(ev) {
		/* When we touch other element, should reset old element */
		if (this.oldTarget && this.oldTarget[0] != $(ev.currentTarget)[0]) {
			this.oldTarget.css("transform", "");
		}
		/* Take this start point as refrence point */
		this.startOffsetX = parseFloat($(ev.currentTarget).css("transform").replace('translate3d(', '').split(',')[4]) || 0;

		/* *
		 * Record start left position. 
		 * It is used for calculating moving distance. 
		 */
		this.touchX1      = ev.touches[0].pageX;
	};
	touchElement.prototype.move = function(ev) {
		this.touchX2 = ev.touches[0].pageX;
		this.deltaX  = this.touchX2 - this.touchX1;
		/**
		 * 1.Check if we should start dragging. 
		 * 2.Check if we've dragged past the threshold, or we are starting from the open state.
		 */
	    if (!this._isDragging && ((Math.abs(this.deltaX) > this.dragStartDistance) || (Math.abs(this.startOffsetX) > 0))) {
	      this._isDragging = true;
	    }
		if (this._isDragging) {
			/* Grab the new X point, capping it at zero to prevent from overstepping right boundary  */
			var newX = Math.min(0, this.startOffsetX + this.deltaX);

			/* Setting the left value by translate3d attribute */
			$(ev.currentTarget).css('transform', 'translate3d(' + newX + 'px, 0, 0)');
		}

	};
	touchElement.prototype.end = function(ev) {
		/* Because it is moved to left, therefore restingPoint always less than or equal to zero*/
	    var restingPoint = -this.buttonsWidth;

	    if (this.deltaX > -(this.buttonsWidth / 2)) {
	        restingPoint = 0;
	    }

		if (restingPoint === 0) {
			/* Set position to right threshold */
			$(ev.currentTarget).css("transform", '');
		} else {
			/* Set position to left threshold */
			$(ev.currentTarget).css("transform", 'translate3d(' + restingPoint + 'px,0,0)');
		}

		/* Recored old touch elemnt */
		this.oldTarget = $(ev.currentTarget);
	};

	touchElement.prototype.createEvent = function() {
		this.event = {
			_touchstart: (function(_this) {
				return function(ev) {
					_this.start(ev);
				}
			})(this),
			_touchmove: (function(_this) {
				return function(ev) {
					_this.move(ev);
				}
			})(this),
			_touchend: (function(_this) {
				return function(ev) {
					_this.end(ev);
				}
			})(this)
		}
	};
	touchElement.prototype.addEvents = function() {
		this.removeEvents();
		this.$element.bind("touchstart", this.event["_touchstart"]);
		this.$element.bind("touchmove", this.event["_touchmove"]);
		this.$element.bind("touchend", this.event["_touchend"]);
	};
	touchElement.prototype.removeEvents = function() {
		this.$element.unbind("touchstart", this.event["_touchstart"]);
		this.$element.unbind("touchmove", this.event["_touchmove"]);
		this.$element.unbind("touchend", this.event["_touchend"]);
	};

	/* Defined function which can be called by jQuery Object */
	$.fn.slideToLeft = function(settings) {
		var options = $.extend({}, defaults, settings);
		var obj = new touchElement(this, options);
		obj.createEvent();
		obj.addEvents();
	};
})(jQuery);