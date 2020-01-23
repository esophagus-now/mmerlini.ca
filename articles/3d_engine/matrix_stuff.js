//Matrix data format is a 1d array in row-major order. However, because
//the bottom row of a transformation matrix is always [0,0,0,1], there's
//no need to include it in the array. The functions in this file are
//specifically optimized for this assumption

//All functions return undefined on error



/* Translate a 3d point by a transformation matrix
 * Note: I don't know the deep math behind this, but to make it
 * possible to translate a point you use a 4x4 matrix and append 
 * a 1 at the end of the point vector.
 * 
 * xform is the result of xform.get_mat, xform.get_inv_mat, or a
 * combination of transforms. This is an array of 12 values (but
 * you never manipulate them directly, so you didn't really have 
 * to know that)
 * 
 * xform is a proper transform matrix (not a simple_xform object)
 * p is the point you're transforming (array of xyz values)
 * */
var xform_pnt = function(xform, p) {
	if (p.length !== 3 || xform.length !== 12) {
		return undefined;
	}
	
	var ret = Array(3);
	
	ret[0] = xform[0]*p[0] + xform[1]*p[1] + xform[2]*p[2] + xform[3];
	ret[1] = xform[4]*p[0] + xform[5]*p[1] + xform[6]*p[2] + xform[7];
	ret[2] = xform[8]*p[0] + xform[9]*p[1] + xform[10]*p[2] + xform[11];
	
	return ret;
}

/* Helper function which calls xform_pnt for each point in a poly
*/
var xform_poly = function(xform, poly) {
	var len = poly.length;
	var ret = Array(len);
	
	for (var i = 0; i < len; i++) {
		ret[i] = xform_pnt(xform, poly[i]);
	}
	
	return ret;
}

/* Multiplies two four by four matrices together, except it takes
 * advantage of the fact that our transformation matrices look like
 * 
 *   ABCD
 *   EFGH
 *   IJKL
 *   0001
 * 
 * So, the last row is not stored in the array (that's why there are
 * only 12 elements). Also, it's a result of the math that if you
 * multiply two matrices together each with 0001 in the last row,
 * the result will have 0001 in the last row.
 * */
var combine_xforms = function(x1, x2) {
	if (x1.length != 12 || x2.length != 12) {
		return undefined;
	}
	
	var ret = Array(12);
	
	ret[0] = x1[0]*x2[0] + x1[1]*x2[4] + x1[2]*x2[8];
	ret[1] = x1[0]*x2[1] + x1[1]*x2[5] + x1[2]*x2[9];
	ret[2] = x1[0]*x2[2] + x1[1]*x2[6] + x1[2]*x2[10];
	ret[3] = x1[0]*x2[3] + x1[1]*x2[7] + x1[2]*x2[11] + x1[3];
	
	ret[4] = x1[4]*x2[0] + x1[5]*x2[4] + x1[6]*x2[8];
	ret[5] = x1[4]*x2[1] + x1[5]*x2[5] + x1[6]*x2[9];
	ret[6] = x1[4]*x2[2] + x1[5]*x2[6] + x1[6]*x2[10];
	ret[7] = x1[4]*x2[3] + x1[5]*x2[7] + x1[6]*x2[11] + x1[7];
	
	ret[8]  = x1[8]*x2[0] + x1[9]*x2[4] + x1[10]*x2[8];
	ret[9]  = x1[8]*x2[1] + x1[9]*x2[5] + x1[10]*x2[9];
	ret[10] = x1[8]*x2[2] + x1[9]*x2[6] + x1[10]*x2[10];
	ret[11] = x1[8]*x2[3] + x1[9]*x2[7] + x1[10]*x2[11] + x1[11];
	
	return ret;
}

var identity_mat = function() {
	//I'm pretty sure you have to do this to force js to construct a
	//new array, but I'm not sure
	var ret = Array(12);
	for (var i = 0; i < 3; i++) {
		for (var j = 0; j < 4; k++) {
			if (i == j) {
				ret[i*4+j] = 1;
			} else {
				ret[i*4+j] = 0;
			}
		}
	}
	
	return ret;
};
