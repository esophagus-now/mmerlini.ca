//I don't like writing difficult matrix code. This little trick lets me 
//get around it. The idea is that a transform is a linked list of 
//operations. Here we'll do a little object-oriented stuff to make the
//code a little nicer.

//A xform object has the following interface:
//	next:	 A pointer to the next transform in the list, or null if it is
//			 the last element
//
//	get_mat: A function which returns a transformation matrix as an array
//			 of twelve numbers (see matrix_stuff.js for details)




//For my purposes, I've made some constructor functions for the stuff
//I'll need in the engine.



/* Constructor for rotation transform objects. In addition to the xform
 * interface, also stores a 3D rotation as three Euler angles around
 * the x, y, and z axes (in radians). The constructor arguments are in
 * degrees, and for convenience, I've added a few methods which edit
 * the stored angles. 
 * 
 */
var rot_xform = function(x,y,z) {
	//to_rad and to_deg are defined in helper.js
	//combine_xforms is in matrix_stuff.js
	
	//Stores Euler angles as radians
	this.rot = [to_rad(x), to_rad(y), to_rad(z)];
	
	//Add rotation increment (in degrees)
	this.rotate = function(x,y,z) {
		this.rot[0] += to_rad(x);
		this.rot[1] += to_rad(y);
		this.rot[2] += to_rad(z);
		
		//Not sure if this is really needed, but for safety we'll 
		//constrain the angle to be between 0 and 2*pi
		if(this.rot[0] >= 2*Math.PI) {
			this.rot[0] %= 2*Math.PI;
		} else if (this.rot[0] < 0) {
			this.rot[0] = 2*Math.PI - (-this.rot[0] % 2*Math.PI);
		}
		
		if(this.rot[1] >= 2*Math.PI) {
			this.rot[1] %= 2*Math.PI;
		} else if (this.rot[1] < 0) {
			this.rot[1] = 2*Math.PI - (-this.rot[1] % 2*Math.PI);
		}
		
		if(this.rot[2] >= 2*Math.PI) {
			this.rot[2] %= 2*Math.PI;
		} else if (this.rot[2] < 0) {
			this.rot[2] = 2*Math.PI - (-this.rot[2] % 2*Math.PI);
		}
	}
	
	//Finally, implement the required interface
	this.next = null;
	this.get_mat = function() {
		//To clean up code:
		var cos = Math.cos;
		var sin = Math.sin;
		
		var rot_x_mat = [
            1      , 0                 , 0                 , 0,
            0      , cos(this.rot[0])  , -sin(this.rot[0]) , 0,
            0      , sin(this.rot[0])  , cos(this.rot[0])  , 0
        ];
        var rot_y_mat = [
            cos(this.rot[1])   , 0 , sin(this.rot[1])  , 0,
            0                  , 1 , 0                 , 0,
            -sin(this.rot[1])  , 0 , cos(this.rot[1])  , 0
        ];
        var rot_z_mat = [
            cos(this.rot[2])   , sin(this.rot[2])  , 0 ,   0,
            -sin(this.rot[2])  , cos(this.rot[2])  , 0 ,   0,
            0                  , 0                 , 1 ,   0
        ];
        
        //Just an FYI: rotation matrices are commutative, so the order
        //of the arguments in these function calls don't matter
        var rot_xy_mat = combine_xforms(rot_x_mat,rot_y_mat);
        return combine_xforms(rot_xy_mat, rot_z_mat);
	}
};

/* Constructor for translation transform objects. In addition to the 
 * xform interface, also stores a 3D translation. For convenience, I've
 * added a few methods which edit the stored shifts. 
 */
var translate_xform = function(x,y,z) {	
	//Stores shifts
	this.shift = [x, y, z];
	
	//Add shift increments
	this.translate = function(x,y,z) {
		this.shift[0] += x;
		this.shift[1] += y;
		this.shift[2] += z;
	}
	
	//Finally, implement the required interface
	this.next = null;
	this.get_mat = function() {
		return [
            1, 0, 0, this.shifts[0],
            0, 1, 0, this.shifts[1],
            0, 0, 1, this.shifts[2]
        ];
	}
};

/* Constructor for scaling transform objects. In addition to the xform 
 * interface, also stores a 3D scaling. For convenience, I've added a 
 * few methods which edit the stored scalings. 
 */
var scale_xform = function(x,y,z) {	
	//Stores scalings
	this.scalings = [x, y, z];
	
	//Add shift increments
	this.scale = function(x,y,z) {
		this.scalings[0] *= x;
		this.scalings[1] *= y;
		this.scalings[2] *= z;
	}
	
	//Finally, implement the required interface
	this.next = null;
	this.get_mat = function() {
		return [
            this.scalings[0], 0, 0, 0,
            0, this.scalings[1], 0, 0,
            0, 0, this.scalings[2], 0
        ];
	}
};

/* For generality, this adds an xform object interface to a raw matrix.
 * I use this as an optimization, since every point in the scene is
 * moved by the camera transform and it's faster to pre-compute the 
 * matrix for the camera transform just once
*/
var raw_xform = function(mat) {
	this.mat = mat;
	this.next = null;
	this.get_mat = function() {
		return this.mat;
	};
}

var xform_list_get_mat = function(lst) {
	if (lst == null) {
		return identity_mat();
	}
	
	var ret = lst.get_mat();
	
	for (var cur = lst.next; cur != null; cur = cur.next) {
		ret = combine_xforms(ret, cur.get_mat());
	}
	
	return ret;
}
