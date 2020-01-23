/* Transforms a 3D point into (integer) screen coordinates. The view 
 * frustum has the "eye" at (0,0,zfov) and has a cross-section defined
 * by the rectangle from (-sw/2, -sh/2, 0) to (sw/2, sh/2, 0). I call 
 * this rectangle the "screen".
 * 
 * v is the 3D point as an array of 3 numbers
 * zfov is the position of the frustum's "eye"
 * sw is the screen width (in pixels)
 * sh is the screen height (in pixels)
 * 
 * More details: 
 * 
 * First, we multiply the x and y coordinates by zfov/(zfov-v[2]) for 
 * the "perspective transform". That is, if you were to draw a line from 
 * the eye at (0,0,zfov) to the 3D point in v, then this calculation
 * finds where the line intersects the xy-plane. 
 * 
 * Afterwards, we scale and shift the points to "appropriate" pixel 
 * locations. This is where things get a little tricky:
 * 
 * The 3D code doesn't want to have to know the size of the canvas. For 
 * this reason, it would be helpful to pre-define a fixed "view
 * rectangle" in the xy-plane which will get automatically mapped to
 * fill the canvas. The problem is that the canvas can have an arbitrary
 * aspect ratio. So, the rule is that -0.5 to 0.5 will be mapped to the 
 * largest dimension of the canvas and the smallest dimension will be 
 * scaled by the same amount (but won't necessarily be completely 
 * visible).
 * 
 * So, to put all that together, call this function as
 * 
 * 		var result = xyz_xform(my_point, 10, canvas_width);
 * 
 * if this width is greater than the height, or as
 * 
 * 		var result = xyz_xform(my_point, 10, canvas_height);
 * 
 * if the height is greater.
 */
var xyz_xform = function(v, zfov, canvas_scale) {
	var ret = Array(2);
	var persp_calc = zfov/(zfov-v[2]);
	
	ret[0] = Math.round(canvas_scale*(persp_calc*v[0] + 0.5));
	ret[1] = Math.round(canvas_scale*(persp_calc*v[1] + 0.5));
	//ret[2] = zfov - v[2]; //Depth of this point (not really needed)
	
	return ret;
}

/* Applies XYZ transform to all points in an array
 * */
var xyz_xform_vec = function(v, zfov, canvas_scale) {
	var len = v.length;
	var ret = Array(len);
	
	for(var i = 0; i < len; i++) {
		ret[i] = xyz_xform(v[i], zfov, canvas_scale);
	}
	
	return ret;
}
