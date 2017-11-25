
var isMobile = false, noRender = true, VR_mode = false;
var scene, camera1, camera2, scatterPlot, points = []; 
let W = 180, H = 180, D = 300;

var fpsLabel = document.getElementById("fpsLabel");
var canvas = document.getElementById("canvas"); 
var engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });

_init();  

function _init(){
	if (typeof(window.orientation) != "undefined") isMobile = true;
	
	if (!webgl_detect())  
	{   
		document.getElementById("webGLwarning").style.display = "block";
		return;
	}
		
	if (BABYLON.Engine.isSupported())
	{ 
		BABYLON.SceneLoader.ShowLoadingScreen = false; 
		BABYLON.Database.IDBStorageEnabled  = false;    
		    
		scene = new BABYLON.Scene(engine);  
		scene.clearColor = new BABYLON.Color4(0.9,0.9,0.9,1);
		
		//scene.debugLayer.show();  
		var light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(1, 1, 1), scene);
			
		camera1 = new BABYLON.ArcRotateCamera("Camera1", 0.33, 1.33, 350, BABYLON.Vector3.Zero(), scene);
		camera1.lowerRadiusLimit = 200;  
		camera1.upperRadiusLimit = 600;
		camera1.panningSensibility = 0;	
		camera1.attachControl(canvas, true);
		camera1.fov = 1;
		
		if (navigator.getVRDisplays) 
			camera2 = new BABYLON.WebVRFreeCamera("camera1", new BABYLON.Vector3(0, 1, 0), scene, false, { trackPosition: true });
		else{
			camera2 = new BABYLON.VRDeviceOrientationArcRotateCamera("vrCam", 0.76, 1.41, 350, BABYLON.Vector3.Zero(), scene);
			camera2.lowerRadiusLimit = 200;  
			camera2.upperRadiusLimit = 600;
			camera2.panningSensibility = 0;	
		} 
			 
		camera2.attachControl(canvas, true);
		
		d3.csv("/assets/portfolio/3DScatterPlot/data.csv", function (d) {
			
			//draw scatterPlot
			scatterPlot = new ScatterPlot([W,H,D],{
				x: [2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007, 2006],
				y: ["", "25°", "26°", "27°", "28°", "29°", "30°", "31°", "32°", "33°", "34°", "35°", "36°", "37°", "38°", "39°", "40°"],
				z: ["",31,30,29,28,27,26,25,24,23,22,21,20,19,18,17,16,15,14,13,12,11,10,"09","08","07","06","05","04","03","02","01"]  
			}, scene);

			var sp_labels = scatterPlot.labelsInfo;

			//set points
			for(var i=0;i<d.length;i++)
			{
				var x = Object.keys(sp_labels['x']).filter(function(k) { return sp_labels['x'][k] == d[i]["year"];});
				var xp = sp_labels['x'].length - x[0];
				var z = 1;

				for(var j in d[i])
				{
					if(j=="year") continue;
					var y = d[i][j]-24;
					points.push(new BABYLON.Vector3(roundToTwo(xp),roundToTwo(y),roundToTwo(z)));        
					z++;
				}
			}
			
			scatterPlot.draw(points);
			
			document.getElementById("htmlUI").style.display = "block";
			noRender = false;
		});	
		
		engine.runRenderLoop(function() { 
			fpsLabel.innerHTML = engine.getFps().toFixed() + " fps";
			if(scene.isReady() && !noRender) scene.render();
		});
	}
}

function roundToTwo(num) {    
    return +(Math.round(num + "e+2")  + "e-2");
};

//WEBGL DETECT
function webgl_detect() {
    if (!!window.WebGLRenderingContext) 
	{
        var names = ["webgl2", "experimental-webgl2", "webgl", "experimental-webgl", "moz-webgl", "webkit-3d"];
        var context = null;

        for(var i=0;i<names.length;i++) 
		{
			context = canvas.getContext(names[i]);
			if (context && typeof context.getParameter == "function") 
				// WebGL is enabled
				return true;   
        }
 
        // WebGL is supported, but disabled
        return false;
    } 

    // WebGL not supported
    return false;
}    

window.addEventListener("resize", function() { engine.resize();});
window.addEventListener( "contextmenu", function(e) {e.preventDefault();}, false);

var screen_change_events = "webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange";
$(document).on(screen_change_events, function () {
	if(VR_mode){
		camera1.mode = BABYLON.Camera.PERSPECTIVE_CAMERA;
		camera1.attachControl(canvas, true);
		scene.activeCamera = camera1;       
	}else{
		camera1.detachControl(canvas); 
		scene.activeCamera = camera2;
	}
	 VR_mode = !VR_mode;
});

	
$(".about").click(function(){
	$(".info").css("display",($(".info").is(':visible'))?"none":"block");
	$(".info2").css("display","none");
}); 
$(".howTo").click(function(){
	$(".info2").css("display",($(".info2").is(':visible'))?"none":"block");
	$(".info").css("display","none");
});
$(".info, .info2").click(function(){
	$(this).hide();
});
$(".ui").click(function(){
	$("#htmlUI").css("display",($("#htmlUI").is(':visible'))?"none":"block");
});
$(".menu").click(function(){ 
	$(".menu_box").css("display",($(".menu_box").is(':visible'))?"none":"block");
});
$(".menu_class2").click(function(){
	$(".menu_class2").removeClass("selected");	
	$(this).addClass("selected");	
	var attr = $(this).attr("id").split("_");
	switch(parseInt(attr[1])){ 
		case 0:
			scatterPlot.dispose();
			scatterPlot.draw(points);
			break;
		case 1:
			scatterPlot.dispose();
			scatterPlot.draw(points, true);
			break;
		case 2:
			scatterPlot.dispose();
			scatterPlot.draw(points, false, true);
			break;
		case 3:
			scatterPlot.dispose();
			scatterPlot.draw(points, false,false,true);
			break;
	}
});
$(".menu_class").click(function(){
	$(".menu_class").removeClass("selected");	
	$(this).addClass("selected");	
	var attr = $(this).attr("id").split("_");
	var attr = $(this).attr("id").split("_");
	switch(parseInt(attr[1])){ 
		case 0:
			camera1.mode = BABYLON.Camera.PERSPECTIVE_CAMERA;
			camera1.attachControl(canvas, true);  
			break;
		case 1:
			camera1.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
		
			camera1.orthoTop = 200;
			camera1.orthoBottom = -200;
			camera1.orthoLeft = -300;
			camera1.orthoRight = 300; 
			camera1.beta = Math.PI/2;
			if(camera1.alpha%(Math.PI/2)!=0)
				camera1.alpha = 0;  
			else
				camera1.alpha += Math.PI/2;
						
			camera1.detachControl(canvas);
			break;
		case 2: 
			engine.switchFullscreen(true);
			break;
	}
});

