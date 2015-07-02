var canvas1, canvas2, canvas3;
var gl1, gl2, gl3;
var program1, program2, program3;
var g_points1 = [];
var g_points2 = []; 
var g_points3 = [];
var sigma;


window.onload = function init() {

	initializeCanvas(canvas1, 1, gl1, program1, g_points1);		// initialize canvas1
	initializeCanvas(canvas2, 2, gl2, program2, g_points2);		// initialize canvas2
	initializeCanvas(canvas3, 3, gl3, program3, g_points3);		// initialize canvas3
	// bSpline(canvas1, g_points1);	

	dgPolynomial = document.getElementById("degreePolynomial");
	stDeviation	 = document.getElementById("standDeviation");
	btnSpline	 = document.getElementById("btnRadioSpline");
	btnRag       = document.getElementById("btnRag");

	stDeviation.style.display = "none";
	dgPolynomial.style.display = "block";

	btnSpline.onclick = function(){
		dgPolynomial.style.display = "block";
		stDeviation.style.display = "none";
	};

	btnRag.onclick = function(){
		dgPolynomial.style.display = "none";
		stDeviation.style.display = "block";
	};
}

function initializeCanvas (canvas, numCanvas, gl, program, g_points){
	canvas 		= document.getElementById( "gl-canvas"+numCanvas );
	btnClear 	= document.getElementById("btnReset"+numCanvas);
	btnOk		= document.getElementById("btnOk");	

	gl = WebGLUtils.setupWebGL( canvas );
	if ( !gl ) { alert( "WebGL isn't available" ); }

	gl.viewport( 0, 0, canvas.width, canvas.height );

	gl.enable(gl.DEPTH_TEST);

	program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram( program );

	if(numCanvas <= 2){
		var a_Position = gl.getAttribLocation(program, "a_Position");
		if (a_Position < 0) {
			console.log('Failed to get the storage location of a_Position');
			return;
		}

		canvas.onclick = function(ev){ 
			click(ev, gl, canvas, a_Position, g_points); 
		};

		btnClear.onclick = function(ev){

			g_points = [];
			gl.clear(gl.COLOR_BUFFER_BIT);

		}

		btnOk.onclick = function(ev) {
			//RaG(canvas1, g_points1);
			sigma = stDeviation.value;
			console.log(sigma);
			main();
		}
	}

	gl.clearColor(0.0, 0.0, 0.0, 1.0);

	gl.clear(gl.COLOR_BUFFER_BIT);
}

function click(ev, gl, canvas, a_Position, g_points) {
	var x = ev.clientX;
	var y = ev.clientY;
	var rect = ev.target.getBoundingClientRect() ;

	x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
	y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
	
	g_points.push([x, y]); 
	
	gl.clear(gl.COLOR_BUFFER_BIT);

	var len = g_points.length;
	for(var i = 0; i < len; i ++ ) {
		gl.vertexAttrib3f(a_Position, g_points[i][0], g_points[i][1], 0.0);

		gl.drawArrays(gl.POINTS, 0, 1);	
	}
}

//Precisa arrumar a funao bSpline
function bSpline(gl, p) {

  for (var t = 0; t < 1; t += 0.1) {
	var ax = (-p[0].x + 3*p[1].x - 3*p[2].x + p[3].x) / 6;
	var ay = (-p[0].y + 3*p[1].y - 3*p[2].y + p[3].y) / 6;
	var bx = (p[0].x - 2*p[1].x + p[2].x) / 2;
	var by = (p[0].y - 2*p[1].y + p[2].y) / 2;
	var cx = (-p[0].x +p[2].x) / 2;
	var cy = (-p[0].y +p[2].y) / 2;
	var dx = (p[0].x + 4*p[1].x + p[2].x) / 6;
	var dy = (p[0].y + 4*p[1].y + p[2].y) / 6;

	ax*Math.pow(t, 3) + bx*Math.pow(t, 2) + cx*t + dx;
	ay*Math.pow(t, 3) + by*Math.pow(t, 2) + cy*t + dy;
	ax*Math.pow(t+0.1, 3) + bx*Math.pow(t+0.1, 2) + cx*(t+0.1) + dx;
	ay*Math.pow(t+0.1, 3) + by*Math.pow(t+0.1, 2) + cy*(t+0.1) + dy;
  }

  // desenhar os pontos
}

/**
*   Function Rational Gaussian Curve
*/
function RaG(gl, p) {

	mu 		= 0.0;
	sigma 	= 1.0;
	dd		= [];

	for (var i = 0; i < p.length; i++) {
		density = stdNormalDistribution(p[i][0], mu, sigma);
		dd.push([p[i][0], density]);
	}
	console.log(dd);
}


/*function stdNormalDistribution (x, mu, sigma) {
  return 1 / (sigma*Math.sqrt(2*Math.PI)) * Math.exp(-(x-mu)*(x-mu)/(2*sigma*sigma));
}*/

var W=[1,1,1];
var V=[[3,2],[4,3],[5,7]];

function G (i, u) {
  return Math.exp(-(u-0)*(u-0)/(2*sigma*sigma));
}

function g(i, u) {
	var den = 0;
	
	for (var j = 0; j < V.length; j++) {
		den += W[j] * G(j, u);
	}

	return W[i]*G(i, u)/den;
}

function Rag (u){

	var point = [0,0];
	for (var i = 0; i < V.length; i++) {
		point[0] += V[i][0] * g(i, u);
		point[1] += V[i][1] * g(i, u);
	}
	return point;
}

function main(){
	var result = 0;
	for (var u = 0; u < 1 ; u+=0.125){
		result = Rag(u);
		console.log("Result: " + result);
	}
}




















