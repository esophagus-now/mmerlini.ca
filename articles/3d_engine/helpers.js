/* This function implements the Bresenham line algorithm on a 2D canvas
 * pixels is the buffer to draw on, assumed to be rgba and row-major 
 * pw is the width of the canvas in pixels.
 * x0,y0,x1,y1 are the line endpoints.
 * col is an array of rgb values. 
 * 
 * This algorithm based on the rosetta code algorithm
 * */
var bresline = function(pixels, pw, x0, y0, x1, y1, col) {
	var pos = (y0*pw + x0)*4;
	var lastPos = (y1*pw + x1)*4;
	var dx, dy, sx, sy;
	
	if (x1 < x0) { //Backwards x
		sx = -4;
		dx = x0 - x1;
	} else { //Forwards x
		sx = 4;
		dx = x1 - x0;
	}
	
	if (y1 < y0) { //Backwards y
		sy = -4*pw;
		dy = y0 - y1;
	} else { //Forwards y;
		sy = 4*pw;
		dy = y1 - y0;
	}
	
	//Initialize error term. 
	var err;
	if (dx > dy) {
		err = dx/2;
	} else {
		err = -dy/2;
	}
	
	for(var i = 0; i < dx+dy+10; i++) {
		pixels[pos] = col[0];
		pixels[pos+1] = col[1];
		pixels[pos+2] = col[2];
		
		//Check if we're done the line
		if (pos == lastPos) break;
		
		//I don't really know the details of how this works. The best
		//I've been able to figure out is that it is tracking the
		//error in the slope (as opposed to just the y error or just
		//the x error)
		var tmp = err;
		if (tmp > -dx) {
			err -= dy; pos += sx;
		}
		if (tmp < dy) {
			err += dx; pos += sy;
		}
	}
	if (i > dx+dy) {
		alert("Error!");
	}
};

/* pixels is the buffer to draw on
 * col is an array of rgb values
 * */
var bg_fill = function(pixels, col) {
	for (var i = 0; i < pixels.length; i += 4) {
		pixels[i] = col[0];
		pixels[i+1] = col[1];
		pixels[i+2] = col[2];
		pixels[i+3] = 255;
	}
};

/* Used by scan_poly. Fills the scan-conversion bookkeeping structure with
 * the linw's x coordinates. Puts in different coordinates if this is a 
 * left line or a right line. Because of integer rounding in the 
 * transformations, it's possible for some edges to have no length or to
 * be flat; we need to treat these cases properly
 * 
 * x0, y0, x1, and y1 and the line's endpoints
 * lr (1 or 0) says whether this line is (left or right)
 * books is the bookkeeping data structure (see scan_poly for details)
 */
var scan_edge = function(x0, y0, x1, y1, lr, skip_first, books) {
	var dx, sx;
	var dy, sy;
	
	//Get abs(x1 - x0) and also set sx to be sign(x1-x0)
	if (x0 < x1) {
		dx = x1 - x0;
		sx = 1;
	} else {
		dx = x0 - x1;
		sx = -1;
	}
	
	//Get abs(y1-y0)
	if (y0 < y1) {
		dy = y1 - y0;
		sy = 1;
	} else {
		dy = y0 - y1;
		sy = -1;
	}
	
	//The only horizontal lines that get into this function are bottom 
	//lines, and the rule is not to draw those. Also, this could happen
	//if two vertices end up on top of one another; these should also be
	//discarded
	if (dy == 0) {
		return;
	}
	
	//Keep track of integer and fractional part of x coordinate as we step y
	var I = x0 + lr; //Integer part of x coordinate
	var N = 0; //Numerator part of fraction of x coordinate
	var D = dy; //Denominator part
	
	//Special case: sometimes we will deliberately skip the first point
	var init_y = y0;
	if (skip_first != 0) {
		init_y += sy;
		N += dx;
		while (N >= D) { //Not the best performance... but js has no integer division
			N -= D;
			I += sx;
		}
	}
	
	//Finally, scan out all the x values on this edge
	if (lr == 1) {
		for (var y = init_y; y != y1; y+=sy) {
			//console.log("left: " + I + ", " + y);
			books.lefts[books.lpos++] = I;
			N += dx;
			while (N >= D) {
				N -= dy;
				I += sx;
			}
		}
	} else {
		for (var y = init_y; y != y1; y+=sy) {
			//console.log("right: " + I + ", " + y);
			books.rights[books.rpos++] = I;
			N += dx;
			while (N >= D) {
				N -= dy;
				I += sx;
			}
		}
	}
}

/* Converts a (convex) polygon into a list of horizontal scan lines
 * Borrowed from the Graphics Programming Black Book by Micheal Abrash
 * */
var scan_poly = function(poly) {
	var len = poly.length;
	if (len < 3) {
		return null; //No need to draw; polygon has no area
	}
	
	//These two constants just make the code a little easier to read
	var X = 0;
	var Y = 1;
	
	//Check if clockwise or counterclockwise
	//This calculates the sign of the cross product 
	var v10_x = poly[1][X] - poly[0][X];
	var v10_y = poly[1][Y] - poly[0][Y];
	var v21_x = poly[2][X] - poly[1][X];
	var v21_y = poly[2][Y] - poly[1][Y];
	if (v10_x*v21_y < v21_x*v10_y) {
		return null; //If CCW, poly points away from us. Don't draw it.
	}
	
	//Find top and bottom vertices
	var top_y = poly[0][Y], top_ind = 0;
	var bot_y = poly[0][Y], bot_ind = 0;
	for (var i = 1; i < poly.length; i++) {
		if (poly[i][Y] < top_y) {
			top_y = poly[i][Y];
			top_ind = i;
		}
		if (poly[i][Y] > bot_y) {
			bot_y = poly[i][Y];
			bot_ind = i;
		}
	}
	
	if (top_y == bot_y) {
		return null; //Polygon has no height; nothing to draw
	}
	
	//The top could be flat; find the leftmost and rightmost top points
	var cur_left = top_ind;
	var next_left = (len + cur_left - 1) % len;
	while (poly[next_left][Y] == top_y) {
		cur_left = next_left;
		next_left = (len + cur_left - 1) % len;
	}
	
	var cur_right = top_ind;
	var next_right = (cur_right + 1) % len;
	while (poly[next_right][Y] == top_y) {
		cur_right = next_right;
		next_right = (cur_right + 1) % len;
	}
	
	var top_is_pointy = (cur_left == cur_right) ? 1 : 0;
	
	
	//Scan the left and right sides into the following data structure:
	var num_lines = bot_y - top_y - top_is_pointy;
	var books = {
		lefts: Array(num_lines),
		lpos: 0,
		rights: Array(num_lines),
		rpos: 0,
		top_y: top_y + top_is_pointy
	};
	
	//Left lines...
	var skip_first = top_is_pointy;
	while (cur_left != bot_ind) {
		scan_edge(
			poly[cur_left][X], poly[cur_left][Y],
			poly[next_left][X], poly[next_left][Y],
			1, //This is a left edge
			skip_first,
			books
		);
		skip_first = 0;
		cur_left = next_left;
		next_left = (len + cur_left - 1) % len;
	}
	
	//Right lines...
	var skip_first = top_is_pointy;
	while (cur_right != bot_ind) {
		scan_edge(
			poly[cur_right][X], poly[cur_right][Y],
			poly[next_right][X], poly[next_right][Y],
			0, //This is a right edge
			skip_first,
			books
		);
		skip_first = 0;
		cur_right = next_right;
		next_right = (cur_right + 1) % len;
	}
	
	return books;
}

/* Uses the results of scan_poly and draws to the pixel buffer
 * pixels is the buffer
 * sw is the width of the screen (in pixels)
 * books is the returned data structure from scan_poly
 * col is an array of rgb values
 * 
 * books can be null; in this case, draw_scanline will ignore it
 */
var draw_scanlines = function(pixels, sw, books, col) {
	var y_off = books.top_y * 4 * sw;
	for (var i = 0; i < books.lefts.length; i++) {
		for (var x = books.lefts[i]; x <= books.rights[i]; x++) {
			pixels[y_off + 4*x + 0] = col[0];
			pixels[y_off + 4*x + 1] = col[1];
			pixels[y_off + 4*x + 2] = col[2];
		}
		y_off += 4*sw;
	}
}

var bg_clear = function(pixels) {
	bg_fill(pixels, [255,255,255]);
};

var to_rad = function(deg) {
	return Math.PI*deg/180.0;
};

var to_deg = function(rad) {
	return rad*180.0/Math.PI;
};

var convert_whole_object = function(obj, xform, zfov, canvas_scale) {
	var len = obj.length;
	var ret = Array(len);
	
	for (var i = 0; i < len; i++) {
		var xformed = xform_poly(xform, obj[i]);
		var coord2d = xyz_xform_vec(xformed, zfov, canvas_scale);
		ret[i] = scan_poly(coord2d);
	}
	
	return ret;
};
