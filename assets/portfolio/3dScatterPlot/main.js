var scatterPlot, points = []; 
let W = 180, H = 180, D = 300; 

var scene, light, camera, camerado, cameravr, noRender = true, sound;
var isMobile = false, Sfullscreen = false, Svr = false; Sdo = false;
var Ssound = false, Smenu = false, Sinfo = false, Sabout = false;

var fpsLabel = document.getElementById("fpsLabel");
var canvas = document.getElementById("canvas"); 
var engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
		
_init();   
   
function _init(){
	if (!webgl_detect() || !BABYLON.Engine.isSupported())  
	{   
		document.getElementById("error").style.display = "block";
		$("#error>.follow").animate({bottom: '0px'}, "slow");
		return;
	}else{
		document.getElementById("loader").style.display = "block";
		$("#loader>.follow").animate({bottom: '0px'}, "slow", ()=>{create_scene();});
	} 
}  

function menu(){
	//true change color when is close
	arrows(".footer_click", ".bottom_banner");
	arrows(".header_click", ".top_banner");
	
	showDivInfo("about", Sabout);
	showDivInfo("info", Sinfo); 
	
	$("#vr").click(function(){
		Svr = true;
		engine.switchFullscreen(true); 
		if(Smenu) Smenu = !Smenu;
	});
	$("#fullscreen").click(function(){
		//true - no pointer, false - pointer
		engine.switchFullscreen(true);
		if(Smenu) Smenu = !Smenu;
	});
	$("#tablet").click(function(){
		Sdo = !Sdo;
		if(camerado){
			if(Sdo){
				camera.detachControl(canvas);
				scene.activeCamera = camerado;  
			}else{
				camera.attachControl(canvas, true);
				scene.activeCamera = camera; 
			}
		}
	});
	$("#sound").click(function(){
		//mute sound if exist
	});
	$("#menu").click(function(){
		Smenu = !Smenu;
		if(Smenu) 
			$(".menu").animate({left: '0px'}, "slow").show();
		else
			$(".menu").animate({left: -$(".menu")[0].offsetWidth+'px'}, "slow",()=>{$(".menu").hide();});
	}); 
	if(!isMobile){
		$("#tablet").css("color","#7a7a7a").css("cursor","auto");
	}
	if(!sound){ 
		$("#sound").css("color","#7a7a7a").css("cursor","auto");
	}
	if(!cameravr){
		$("#vr").css("opacity","0.5").css("cursor","auto");
	}
	if(isMobile){
		if(window.innerWidth>window.innerHeight)
			$(".menu").css("top", "50px");
		else 
			$(".menu").css("top", "95px"); 
	} 
}

function showDivInfo(str, param){
	$("#"+str).click(function(){
		param = !param;
		if(param) 
			$("."+str).animate({bottom: '0px'}, "slow").show();
		else
			$("."+str).animate({bottom: -$("."+str)[0].offsetHeight+'px'}, "slow",()=>{$("."+str).hide();});
	});
	$("."+str).click(function(){param = !param;$("."+str).animate({bottom: -$("."+str)[0].offsetHeight+'px'}, "slow",()=>{$("."+str).hide();});});
}

function arrows(str1, str2, changeColor = false){
	$(str1).click(function(){ 
		if($(str1+" i").hasClass("fa-chevron-circle-right")){
		$(str2).animate({right: -screen.width+"px"}, "slow", ()=>{
				$(str1+" i").addClass("fa-chevron-circle-left");
				$(str1+" i").removeClass("fa-chevron-circle-right");
				$(str2).hide();
				if(changeColor) $(str1).css("color","black"); 				
			});
		}else{
			$(str2).animate({right: '0px'}, "slow", ()=>{
				$(str1+" i").addClass("fa-chevron-circle-right");
				$(str1+" i").removeClass("fa-chevron-circle-left");
				if(changeColor) $(str1).css("color","white");
			}).show();	
		}
	});
}

var screen_change_events = "webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange";
$(document).on(screen_change_events, function () {
	if(Sfullscreen) {
		Sfullscreen = !Sfullscreen;
		return;
	}
		
	if(Svr){
		scene.activeCamera.detachControl(canvas); 
		cameravr.position = scene.activeCamera.position.clone();
		scene.activeCamera = cameravr;
		Svr = !Svr;
	}else{
		if(scene.activeCamera == cameravr){
			if(Sdo && camerado)
				scene.activeCamera = camerado; 
			else
				scene.activeCamera = camera; 
			if(camera.mode != BABYLON.Camera.ORTHOGRAPHIC_CAMERA)
				scene.activeCamera.attachControl(canvas, true); 
		} 
	}
});

function create_scene(){
	if (typeof(window.orientation) != "undefined") isMobile = true;
	
	BABYLON.SceneLoader.ShowLoadingScreen = false; 
	BABYLON.Database.IDBStorageEnabled  = false;
		
	scene = new BABYLON.Scene(engine);   
	scene.clearColor = new BABYLON.Color4(.9, .9, .9, 1); 
	
	light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(1, 1, 1), scene);
	
	settingCameras();
    
	d3.csv("/assets/portfolio/3DScatterPlot/data.csv", function (d) {
		
		//draw scatterPlot
		scatterPlot = new ScatterPlot([W,H,D],{
			x: [2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007, 2006],
			y: ["", "25Â°", "26Â°", "27Â°", "28Â°", "29Â°", "30Â°", "31Â°", "32Â°", "33Â°", "34Â°", "35Â°", "36Â°", "37Â°", "38Â°", "39Â°", "40Â°"],
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
		
		document.getElementById("loader").style.display = "none";
		document.getElementById("content").style.display = "block";
		noRender = false;
	});	

	engine.runRenderLoop(function () { 
		if(scene.isReady() && !noRender) { 
			scene.render(); 
			fpsLabel.innerHTML = engine.getFps().toFixed() + " fps";
		}
	});
	
	menu();
}

function settingCameras(){
	if (navigator.getVRDisplays)
		cameravr = new BABYLON.WebVRFreeCamera("WebVRCamera", new BABYLON.Vector3(0, 1, 0), scene, false, { trackPosition: false });
	else{
		cameravr = new BABYLON.VRDeviceOrientationArcRotateCamera("vrCam", 0.76, 1.41, 250, BABYLON.Vector3.Zero(), scene);
		cameravr.lowerRadiusLimit = 200;  
		cameravr.upperRadiusLimit = 600;
		cameravr.panningSensibility = 0;	
	} 
	cameravr.attachControl(canvas, false);
		
	if(isMobile){
		camerado = new BABYLON.DeviceOrientationCamera("DevOr_camera", new BABYLON.Vector3(0, 10, 0), scene);
		camerado.attachControl(canvas, false);
		camerado.keysUp = camerado.keysDown = camerado.keysLeft = camerado.keysRight = [];
	}
	
	camera = new BABYLON.ArcRotateCamera("Camera1", 0.33, 1.33, 350, BABYLON.Vector3.Zero(), scene);
	camera.lowerRadiusLimit = 200;  
	camera.upperRadiusLimit = 600;
	camera.panningSensibility = 0;	
	camera.attachControl(canvas, false);
	camera.fov = 1;
		
	scene.activeCamera = camera; 
}

function roundToTwo(num) {    
    return +(Math.round(num + "e+2")  + "e-2");
};

function orientationChange() { 
	if(isMobile){
		if(window.innerWidth>window.innerHeight)
			$(".menu").css("top", "95px");
		else  
			$(".menu").css("top", "50px"); 
	} 
}

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

window.onorientationchange = orientationChange;
window.addEventListener("resize", function() { engine.resize();});
window.addEventListener( "contextmenu", function(e) {e.preventDefault();}, false);
	
$(".view").click(function(){
	$(".view").removeClass("selected");	
	$(this).addClass("selected");	
	var attr = $(this).attr("id").split("_");
	
	camera.attachControl(canvas, true);
	scene.activeCamera = camera; 
	if(Sdo) Sdo=!Sdo;
				
	switch(parseInt(attr[1])){ 
		case 1:
			camera.mode = BABYLON.Camera.PERSPECTIVE_CAMERA;
			camera.attachControl(canvas, true);  
			break;
		case 2:
			camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
		
			camera.orthoTop = 200;
			camera.orthoBottom = -200;
			camera.orthoLeft = -300;
			camera.orthoRight = 300; 
			camera.beta = Math.PI/2;
			if(camera.alpha%(Math.PI/2)!=0)
				camera.alpha = 0;  
			else
				camera.alpha += Math.PI/2;
						 
			camera.detachControl(canvas);
			break;
	}
});

$(".draw").click(function(){
	$(".draw").removeClass("selected");	
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
