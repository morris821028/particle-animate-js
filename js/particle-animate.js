(function($) {
"use strict";
$.fn.extend({
    partdem: function(options, arg) {
        if (options && typeof(options) == 'object') {
            options = $.extend({}, $.partdem.defaults, options);
        } else {
            options = $.extend($.partdem.defaults, options);
        }

        this.each(function() {
            new $.partdem(this, options, arg);
        });
        return;
	}
});
var Dot = function(centerX, centerY, centerZ, radius, color) {
	var that = {
		ex: centerX,
		ey: centerY,
		ez: centerZ,
		vx: centerX,
		vy: centerY,
		vz: centerZ,
		sx: 0,
		sy: 0,
		sz: 0,
		radius: radius,
		color: color
	};
	that.paint = function(canvas, context, focallength) {
		if (this.vz <= -focallength)
        	return 0;
        context.save();
        context.beginPath();
        var scale = focallength/(focallength + this.vz);
        context.arc(canvas.width/2 + (this.vx-canvas.width/2)*scale, canvas.height/2 + (this.vy-canvas.height/2) * scale, this.radius*scale, 0, 2*Math.PI);
        context.fillStyle = `rgba(${this.color}, ${scale})`;
        context.fill()
        context.restore();
	}
	that.arrive = function(dir) {
		if (dir == 1)
			return Math.abs(this.ex - this.vx) < 0.1 &&
				Math.abs(this.ey - this.vy) < 0.1 && 
				Math.abs(this.ez - this.vz) < 0.1;
		else
			return Math.abs(this.sx - this.vx) < 0.1 &&
				Math.abs(this.sy - this.vy) < 0.1 && 
				Math.abs(this.sz - this.vz) < 0.1;
	}
	that.step = function(dir) {
		if (dir == 1) {
			this.vx = this.vx + (this.ex - this.vx) * 0.1;
			this.vy = this.vy + (this.ey - this.vy) * 0.1;
			this.vz = this.vz + (this.ez - this.vz) * 0.1;
		} else {
			this.vx = this.vx + (this.sx - this.vx) * 0.1;
			this.vy = this.vy + (this.sy - this.vy) * 0.1;
			this.vz = this.vz + (this.sz - this.vz) * 0.1;
		}
	}
	that.boom = function(canvas, context, focallength, deep) {
		this.vx = Math.random()*canvas.width*2 - canvas.width/2;
        this.vy = Math.random()*canvas.height*2 - canvas.height/2;
        this.vz = Math.random()*focallength*2 - focallength + deep * focallength;
        this.sx = Math.random()*canvas.width*2 - canvas.width/2;
        this.sy = Math.random()*canvas.height*2 - canvas.width/2;
        this.sz = Math.random()*focallength*2 - focallength + deep * focallength;
	}
	that.move = function() {
		this.vz -= 2;
		this.sz -= 2;
		this.ez -= 2;
	}
    return that;
}
$.partdem = function(elem, options, arg) {
	var canvas = document.getElementById($(elem).attr('id')),
		context = canvas.getContext('2d');
	var bgdots;
	init(elem, options);

	function init(elem, options) {
		if (typeof(options.caption) != "undefined") {
            deploy(0);
		} else {
			alert('no caption');
		}
	}

	function bg_dots() {
		var diameter = options.diameter,
			gap = options.gap;
		var dots = [];
		for (var i = 0; i < 384; i++) {
			var dot = new Dot(Math.random()*canvas.width, Math.random()*canvas.height, 0, diameter/2 - gap/2, '46,46,254');
			dots.push(dot);
		}
		dots.forEach(function(e){
            e.boom(canvas, context, 128, Math.random()*(options.caption.length+3));
        });
		return dots;
	}

	function text2dots(text){
		var diameter = options.diameter,
			gap = options.gap;
		var	dots = [],
			data;
        drawtext(context, text);
        data = context.getImageData(0, 0, canvas.width, canvas.height);
        context.clearRect(0, 0, canvas.width, canvas.height);
        for (var x = 0; x < data.width; x += diameter) {
            for (var y = 0; y < data.height; y += diameter) {
                var i = (y*data.width + x)*4;
                if (data.data[i] >= 128){
                    var dot = new Dot(x-diameter/2, y-diameter/2, 0, diameter/2 - gap/2, options.fontcolor);
                    dots.push(dot);
                }
            }
        }
        options.dots = dots;
        initAnimate();
        return dots;
    }

    function img2dots(url) {
    	var diameter = options.diameter,
			gap = options.gap;
    	var img = new Image;
		img.onload = function() {
			var dots = [],
				data;
			var width = parseInt(img.width),
				height = parseInt(img.height);
			context.drawImage(img, canvas.width/2 - width/2, canvas.height/2 - height/2);
			data = context.getImageData(0, 0, canvas.width, canvas.height);
            context.clearRect(0, 0, canvas.width, canvas.height);
            for (var x = 0; x < data.width; x += diameter){
                for (var y = 0; y < data.height; y += diameter){
                    var i = (y*data.width + x)*4;
                    var color = data.data[i] + ',' + data.data[i+1] + ',' + data.data[i+2];

                    if (data.data[i+3] >= 128){
                        var dot = new Dot(x-diameter/2, y-diameter/2, 0, diameter/2 - gap/2, color);
                        dots.push(dot);
                    }
                }
            }
            options.dots = dots;
        	initAnimate();
		};
		img.crossOrigin = "anonymous";
		img.src = url;
    }

    function drawtext(context, text) {
        var fsize = 968/text.length;
    	context.font =  `${fsize}px Heiti bold`;
    	context.fillStyle = 'rgba(168,168,168,1)';
    	context.textAlign = 'center';
    	context.textBaseline = 'middle';
    	context.fillText(text, canvas.width/2, canvas.height/2);
    }

    function initAnimate() {
        options.dots.forEach(function(e){
            e.boom(canvas, context, 128, 1);
        });
        animate();
    }

    function deploy(index) {
        if (index == 0)
            bgdots = bg_dots();
        if (isURL(options.caption[index])) {
            options.dots = img2dots(options.caption[index]);
        } else {
            options.dots = text2dots(options.caption[index]);
        }
    }

    function animate() {
    	var run_next = false;
    	options.thisTime = new Date();
    	context.clearRect(0, 0, canvas.width, canvas.height);

        bgdots.forEach(function(e) {
        	if (options.status == -1 && options.base_z % 144 != 0)
				e.move();
            e.paint(canvas, context, 128);
        });

    	options.dots.forEach(function(e) {
    		if (!e.arrive(options.status)) {
    			e.step(options.status);
    			options.lastTime = new Date();
    		} else {
    			if (options.thisTime - options.lastTime > 1000) {
    				if (options.status == -1 && options.base_z % 144 == 0) {
    					if (options.caption_index+1 == options.caption.length && !options.loop) {
    						options.pause = true;
    					} else {
    						run_next = true;
                        }
    				} else if (options.status == -1 && options.base_z % 144 != 0) {
    					
    				} else if (options.status == 1) {
    					options.status = - options.status;
    				}
    			}
    		}
    		if (options.status == -1 && options.base_z % 144 != 0) {
    			e.move();
                e.move();
            }
            e.paint(canvas, context, 128);
        });

		if (run_next == true) {
			options.caption_index = (options.caption_index+1)%options.caption.length;
			deploy(options.caption_index);
			options.status = - options.status;
			options.base_z = 1;
		} else if (options.status == -1 && options.base_z % 144 != 0) {
			options.base_z ++;
		}

    	if (!options.pause) {
            if("requestAnimationFrame" in window) {
                requestAnimationFrame(animate);
            }
            else if("webkitRequestAnimationFrame" in window) {
                webkitRequestAnimationFrame(animate);
            }
            else if("msRequestAnimationFrame" in window) {
                msRequestAnimationFrame(animate);
            }
            else if("mozRequestAnimationFrame" in window) {
                mozRequestAnimationFrame(animate);
            }
        }
    }

    function isURL(s) {
		var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
			return regexp.test(s);
	}
};
$.partdem.defaults = {
	dots : [],
	diameter: 8,
	gap: 2, 
	pause: false,
	caption: undefined,
	fontcolor: '192,192,192',
	thisTime: new Date(),
	lastTime: new Date(),
	status: 1,
	caption_index: 0,
	base_z: 1,
    loop: true
};
})(jQuery);