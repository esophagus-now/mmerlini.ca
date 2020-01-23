/* Runs tests as I incrementally add stuff to the code.
 * Call as 
 * 		cv = document.getElementById("cv");
 *      ctx = cv.getContext("2d");
 *      dat = ctx.createImageData(200,200);
 *      pixels = dat.data;
 * 		handle = setInterval(incr_test, 1000/60);
 * 
 * And stop the test with
 * 
 * 		window.clearInterval(handle);
 * 
 * */


//Lines that make up a cube
var p = 0.2;
var n = -p;
lines = [
	//Bottom edges
	[[n,n,n], [n,p,n]],
	[[n,p,n], [p,p,n]],
	[[p,p,n], [p,n,n]],
	[[p,n,n], [n,n,n]],
	
	//Vertical edges
	[[n,n,n], [n,n,p]],
	[[n,p,n], [n,p,p]],
	[[p,p,n], [p,p,p]],
	[[p,n,n], [p,n,p]],
	
	//Top edges
	[[n,n,p], [n,p,p]],
	[[n,p,p], [p,p,p]],
	[[p,p,p], [p,n,p]],
	[[p,n,p], [n,n,p]]
];

//Cube vertices
var v = [
	[n, n, n], //0, Front-left
	[p, n, n], //1, Front-right
	[p, p, n], //2, Back-right
	[n, p, n], //3, Back-left
	
	[n, n, p], //4, Front-left
	[n, p, p], //5, Back-left
	[p, p, p], //6, Back-right
	[p, n, p]  //7, Front-right
];
var polys = [
	//Bottom face
	[v[0], v[3], v[2], v[1]],
	//Left face
	[v[0], v[4], v[5], v[3]],
	//Right face
	[v[2], v[6], v[7], v[1]],
	//Front face
	[v[1], v[7], v[4], v[0]],
	//Back face
	[v[3], v[5], v[6], v[2]],
	//Top face
	[v[4], v[7], v[6], v[5]]
];

var cols = [
	[160, 0, 240],
	[0, 80, 210],
	[0, 200, 200],
	[160, 82, 45],
	[0, 255, 0],
	[255, 140, 0]
];

var rotation = new rot_xform(90-54.7356103, 0, 45);
var scaling = new scale_xform(1,1,1);
var dynamic_rot = new rot_xform(0,0,0);
dynamic_rot.next = rotation;
//rotation.next = scaling;

var head = dynamic_rot;

var cycle_pos = 0;
var cycle_max = 60*5; //5 seconds

var incr_test = function() {
	cycle_pos++;
	if (cycle_pos == cycle_max) {
		cycle_pos = 0;
	}
	
	bg_clear(pixels);
	
	scaling.scalings[0] = 1 + 0.5*Math.cos(2*Math.PI*cycle_pos/cycle_max);
	scaling.scalings[1] = 1 + 0.3*Math.cos(4*Math.PI*cycle_pos/cycle_max);
	dynamic_rot.rotate(0, 1, 0);
	
	var final_xform = xform_list_get_mat(head);
	
	var b = convert_whole_object(polys, final_xform, 2, 200);
	for (var i = 0; i < b.length; i++) {
		if (b[i] == null) {
			continue;
		}
		draw_scanlines(pixels, 200, b[i], cols[i]);
	}
	
	//For each line, transform it and draw it with bresline
	for (var i = 0; i < lines.length; i++) {
		var p1 = lines[i][0];
		var p2 = lines[i][1];
		
		p1 = xform_pnt(final_xform, p1);
		p1 = xyz_xform(p1, 2, 200);
		
		p2 = xform_pnt(final_xform, p2);
		p2 = xyz_xform(p2, 2, 200);
		
		//bresline(pixels, 200, p1[0], p1[1], p2[0], p2[1], [0,0,0]);
	}
	
    ctx.putImageData(dat,0,0);
}

var begin_test = function() {
	window.cv = document.getElementById("cv");
	window.ctx = cv.getContext("2d");
	window.dat = ctx.createImageData(200,200);
	window.pixels = dat.data;
	window.handle = setInterval(incr_test, 1000/60);
};
