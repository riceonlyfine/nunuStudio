"use strict";

/**
 * The viewport object is used to handle virtual visualization windows for the WebGL renderer.
 * 
 * It uses normalized coordinates [0 to 1] when using RELATIVE mode or pixel based coordinated for ABSOLUTE mode.
 * 
 * @class Viewport
 * @param {Number} mode
 */
function Viewport(mode)
{
	/**
	 * Camera viewport offset.
	 * 
	 * Values range from 0.0 to 1.0 in screen space when in RELATIVE mode.
	 * 
	 * @property offset
	 * @type {THREE.Vector2}
	*/
	this.offset = new THREE.Vector2(0.0, 0.0);

	/**
	 * Camera viewport size.
	 * 
	 * Values range from 0.0 to 1.0 in screen space when in RELATIVE mode.
	 * 
	 * @property size
	 * @type {THREE.Vector2}
	 */
	this.size = new THREE.Vector2(1.0, 1.0);

	/** 
	 * Viewport sizing mode.
	 * 
	 * Can be RELATIVE or ABSOLUTE.
	 *
	 * @property mode
	 * @type {Number}
	 */
	this.mode = mode !== undefined ? mode : Viewport.RELATIVE;

	/** 
	 * Positioning anchor of the viewport.
	 *
	 * @property anchor
	 * @type {Number}
	 */
	this.anchor = Viewport.TOP_LEFT;

	/**
	 * Calculated absolute viewport value.
	 *
	 * It is calculated using the update() method that should be called after applying changes.
	 *
	 * @property viewport
	 * @type {THREE.Vector4}
	 */
	this.viewport = new THREE.Vector4();
}

/** 
 * Viewport calculated relatively to the screen viewport.
 * 
 * @static
 * @attribute RELATIVE
 */
Viewport.RELATIVE = 200;

/** 
 * Viewport defined absolutely in pixels.
 * 
 * @static
 * @attribute ABSOLUTE
 */
Viewport.ABSOLUTE = 201;

Viewport.TOP_LEFT = 301;
Viewport.TOP_RIGHT = 302;
Viewport.BOTTOM_LEFT = 303;
Viewport.BOTTOM_RIGHT = 304;

/** 
 * Update the viewport box from the values.
 *
 * Has to be called after applying changes to the viewport.
 *
 * @method update
 */
Viewport.prototype.update = function()
{
	//TODO <ADD CODE HERE>
};

/**
 * Get the aspect ratio of this viewport x/y.
 * 
 * @method getAspectRatio
 * @param {Canvas} canvas DOM canvas only required to calculate aspect ration on relative sizing.
 * @return {Number} The aspect ratio of the viewport.
 */
Viewport.prototype.getAspectRatio = function()
{
	return this.size.x / this.size.y;
};

/**
 * Check if the mouse is inside this viewport.
 * 
 * @method isInside
 * @param {DOM} canvas Canvas for offset calculation.
 * @param {Mouse} mouse Mouse object with coordinates inside of the canvas.
 */
Viewport.prototype.isInside = function(canvas, mouse)
{
	var width = canvas.width;
	var height = canvas.height;

	if(this.mode === Viewport.RELATIVE)
	{
		var offset = new THREE.Vector2(this.offset.x * width, this.offset.y * height);
		var viewport = new THREE.Vector2(this.size.x * width, this.size.y * height);
	}
	else //if(this.mode === Viewport.ABSOLUTE)
	{
		var offset = this.offset;
		var viewport = this.size;
	}

	if(this.anchor === Viewport.TOP_LEFT)
	{
		return mouse.position.x > offset.x &&
		mouse.position.x < offset.x + viewport.x &&
		mouse.position.y > offset.y &&
		mouse.position.y < offset.y + viewport.y;
	}
	else if(this.anchor === Viewport.TOP_RIGHT)
	{
		return mouse.position.x > width - viewport.x - offset.x &&
		mouse.position.x < width - offset.x &&
		mouse.position.y > offset.y &&
		mouse.position.y < offset.y + viewport.y;
	}
	else if(this.anchor === Viewport.BOTTOM_LEFT)
	{
		return mouse.position.x > offset.x &&
		mouse.position.x < offset.x + viewport.x &&
		mouse.position.y > height - offset.y - viewport.y &&
		mouse.position.y < height - offset.y;
	}
	else //if(this.anchor === Viewport.BOTTOM_RIGHT)
	{
		return mouse.position.x > width - viewport.x - offset.x &&
		mouse.position.x < width - offset.x &&
		mouse.position.y > height - offset.y - viewport.y &&
		mouse.position.y < height - offset.y;
	}
};

/** 
 * Get normalized coordinates between [-1, 1] for a canvas size and mouse position.
 *
 * Usefull to use raycasting for object picking in a viewport.
 *
 * @method getNormalized
 * @param {DOM} canvas Canvas for offset calculation.
 * @param {Mouse} mouse Mouse object with coordinates inside of the canvas.
 * @return {THREE.Vector2} Normalized coordinated of the mouse.
 */
Viewport.prototype.getNormalized = function()
{
	var normalized = new THREE.Vector2();

	return function(canvas, mouse)
	{
		var width = canvas.width;
		var height = canvas.height;

		if(this.mode === Viewport.RELATIVE)
		{
			var offset = new THREE.Vector2(this.offset.x * width, this.offset.y * height);
			var viewport = new THREE.Vector2(this.size.x * width, this.size.y * height);
		}
		else //if(this.mode === Viewport.ABSOLUTE)
		{
			var offset = this.offset;
			var viewport = this.size;
		}

		if(this.anchor === Viewport.TOP_LEFT)
		{
			var x = mouse.position.x - viewport.x - offset.x;
			var y = mouse.position.y - offset.y;
			normalized.set((x / viewport.x) * 2 + 1, (-y / viewport.y) * 2 + 1);
		}
		else if(this.anchor === Viewport.TOP_RIGHT)
		{
			var x = width - mouse.position.x - viewport.x - offset.x;
			var y = mouse.position.y - offset.y;
			normalized.set((-x / viewport.x) * 2 - 1, (-y / viewport.y) * 2 + 1);
		}
		else if(this.anchor === Viewport.BOTTOM_LEFT)
		{
			var x = mouse.position.x - viewport.x - offset.x;
			var y = height - mouse.position.y - offset.y;
			normalized.set((x / viewport.x) * 2 + 1, (y / viewport.y) * 2 - 1);
		}
		else //if(this.anchor === Viewport.BOTTOM_RIGHT)
		{
			var x = width - mouse.position.x - viewport.x - offset.x;
			var y = height - mouse.position.y - offset.y;
			normalized.set((-x / viewport.x) * 2 - 1, (y / viewport.y) * 2 - 1);
		}
		
		return normalized;
	};
}();

/**
 * Enable this viewport for rendering using a WebGLRenderer
 *
 * After rendering the WebGL renderer has to manually reset to the original values.
 *
 * @method enable
 * @param {THREE.WebGLRenderer} renderer
 */
Viewport.prototype.enable = function(renderer)
{
	var width = renderer.domElement.width;
	var height = renderer.domElement.height;

	if(this.mode === Viewport.RELATIVE)
	{
		var offset = new THREE.Vector2(this.offset.x * width, this.offset.y * height);
		var viewport = new THREE.Vector2(this.size.x * width, this.size.y * height);
	}
	else //if(this.mode === Viewport.ABSOLUTE)
	{
		var offset = this.offset;
		var viewport = this.size;
	}

	if(this.anchor === Viewport.BOTTOM_LEFT)
	{
		renderer.setViewport(offset.x, offset.y, viewport.x, viewport.y);
		renderer.setScissor(offset.x, offset.y, viewport.x, viewport.y);
	}
	else if(this.anchor === Viewport.BOTTOM_RIGHT)
	{
		var x = width - viewport.x - offset.x;
		renderer.setViewport(x, offset.y, viewport.x, viewport.y);
		renderer.setScissor(x, offset.y, viewport.x, viewport.y);
	}
	else if(this.anchor === Viewport.TOP_LEFT)
	{
		var y = height - viewport.y - offset.y;
		renderer.setViewport(offset.x, y, viewport.x, viewport.y);
		renderer.setScissor(offset.x, y, viewport.x, viewport.y);
	}
	else //if(this.anchor === Viewport.TOP_RIGHT)
	{
		var x = width - viewport.x - offset.x;
		var y = height - viewport.y - offset.y;
		renderer.setViewport(x, y, viewport.x, viewport.y);
		renderer.setScissor(x, y, viewport.x, viewport.y);
	}
};

/**
 * Serializer viewport data to JSON.
 *
 * @method toJSON
 * @return {Object} Serialized viewport object.
 */
Viewport.prototype.toJSON = function()
{
	var data = 
	{
		offset: this.offset.toArray(),
		size: this.size.toArray(),
		mode: this.mode,
		anchor: this.anchor
	};

	return data;
};

/**
 * Fill viewport data from serialized JSON data.
 *
 * @method toJSON
 * @param {Object} data Serialized viewport object.
 */
Viewport.prototype.fromJSON = function(data)
{
	this.offset.fromArray(data.offset);
	this.size.fromArray(data.size);
	this.mode = data.mode;
	this.anchor = data.anchor;
};
