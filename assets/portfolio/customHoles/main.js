var scene, light, camera, camerado, cameravr, noRender = true,sound;
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
			scene.activeCamera.attachControl(canvas, true);
		} 
	}
});

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

function create_scene(){
	if (typeof(window.orientation) != "undefined") isMobile = true;
	
	BABYLON.SceneLoader.ShowLoadingScreen = false; 
	BABYLON.Database.IDBStorageEnabled  = false;
	
	scene = new BABYLON.Scene(engine);   
	scene.clearColor = new BABYLON.Color4(1, 1, 1, 0); 
	  
	//Adding a light
	light = new BABYLON.DirectionalLight("Dir0", new BABYLON.Vector3(1, 0, 1), scene);
	light.diffuse = new BABYLON.Color3(0.5, 0.5, 0.5);
	light.specular = new BABYLON.Color3(0.5, 0.5, 0.5);   

	ambientLight = new BABYLON.HemisphericLight("Hemi0", new BABYLON.Vector3(1, 1, 0), scene);
	ambientLight.diffuse = new BABYLON.Color3(0.5, 0.5, 0.5);
	ambientLight.specular = new BABYLON.Color3(1, 1, 1);
	//ambientLight.groundColor = new BABYLON.Color3(1, 1, 1);

	settingCameras()
	
	light.parent = camera;
	//scene.debugLayer.show();   
	
	var cylinder = BABYLON.Mesh.CreateCylinder("cylinder", 1, 1, 1, 16, 1, scene, false);

	csgA = BABYLON.Mesh.CreateBox("box", 1.0, scene);
	csgA.position.x = 0.5;

	csgB = BABYLON.Mesh.CreateBox("box2", 1.0, scene);
	csgB.position.z = 0.5;

	profile = new BABYLON.Mesh("profile", scene);  
	
	cylinder.parent = profile;
	csgA.parent = profile;
	csgB.parent = profile;
	
	profile.rotation.z = Math.PI/2;
	
	//acording input val
	profile.scaling.y = 300;
	
	csgA.scaling.x = 40;
	csgA.position.x = parseFloat(40/2);
	
	csgB.scaling.z = 40;
	csgB.position.z = parseFloat(40/2);
	
	csgA.scaling.z = 1.5;
	csgB.scaling.x = 1.5;
	cylinder.scaling.z = 1.5;
	cylinder.scaling.x = 1.5;
	
	showAxis(50);
	
	engine.runRenderLoop(function () {
		if(noRender && scene.isReady()) {
			document.getElementById("loader").style.display = "none";
			document.getElementById("content").style.display = "block";
			noRender = false;  
		}
		if(scene.isReady() && !noRender) { 
			scene.render(); 
			fpsLabel.innerHTML = engine.getFps().toFixed() + " fps";
		}
	});
	
	menu();
}

window.addEventListener("resize", function() { engine.resize();});
window.addEventListener( "contextmenu", function(e) {e.preventDefault();}, false);  

function settingCameras(){
	if (navigator.getVRDisplays)
		cameravr = new BABYLON.WebVRFreeCamera("WebVRCamera", new BABYLON.Vector3(0, 1, 0), scene, false, { trackPosition: false });
	else
		cameravr = new BABYLON.VRDeviceOrientationFreeCamera("vrCam", new BABYLON.Vector3(0, 1, 0), scene);
	cameravr.attachControl(canvas, false);
	cameravr.keysUp = cameravr.keysDown = cameravr.keysLeft = cameravr.keysRight = [];
	
	if(isMobile){
		camerado = new BABYLON.DeviceOrientationCamera("DevOr_camera", new BABYLON.Vector3(0, 10, 0), scene);
		camerado.attachControl(canvas, false); 
		camerado.keysUp = camerado.keysDown = camerado.keysLeft = camerado.keysRight = [];
	}
	
	camera = new BABYLON.ArcRotateCamera("Camera",3, 1.35, 300, BABYLON.Vector3.Zero(), scene); 
	camera.panningSensibility = 0;	
	camera.lowerRadiusLimit = 200;   
	camera.upperRadiusLimit = 500;
	camera.attachControl(canvas, false);
	scene.activeCamera = camera; 
}

function orientationChange() { 
	if(isMobile){
		if(window.innerWidth>window.innerHeight)
			$(".menu").css("top", "95px");
		else  
			$(".menu").css("top", "50px"); 
	} 
}

window.onorientationchange = orientationChange;

var csgA, csgB;
function addForm(forma, params){
	console.log(scene.meshes.length)
	//console.log(forma)
	var side = parseInt(document.getElementById("side").value);
	//console.log(side)
	switch (parseInt(forma)){
		case 1:
			var box = BABYLON.Mesh.CreateCylinder("cylinder", 100, params['radius'], params['radius'], 32, 1, scene, false);
			
			
			if(side==1) {
				box.rotation.x = Math.PI/2; 
				box.position.y = params['y'];
			}
			else
			{
				box.position.z = params['y'];
			}
			
			box.position.x = params['x'];
			
			var innerCSG = BABYLON.CSG.FromMesh(box);
			var outerCSG = BABYLON.CSG.FromMesh((side==1)?csgA:csgB);
			
			box.dispose();
			if(side==1) csgA.dispose();
			else csgB.dispose();
			
			var subCSG = outerCSG.subtract(innerCSG);
			
			scene.removeMesh(innerCSG);
			scene.removeMesh(outerCSG);
			
			if(side==1) {
				csgA = subCSG.toMesh("csgA", null, scene);
				csgA.createNormals(false);
				csgA.parent = profile;
			}else{ 
				csgB = subCSG.toMesh("csgB", null, scene);
				csgB.createNormals(false);
				csgB.parent = profile;
			}
			break;
		case 2:
			var box = BABYLON.MeshBuilder.CreateBox("box", { height: params['height'], width: params['width'], depth: 100 }, scene);
			
			if(side==1) {
				box.position.y = params['y'];
			}
			else
			{
				box.rotation.x = Math.PI/2;
				box.position.z = params['y'];
			}
			
			box.position.x = params['x'];
			 
			var innerCSG = BABYLON.CSG.FromMesh(box);
			var outerCSG = BABYLON.CSG.FromMesh((side==1)?csgA:csgB);
			
			box.dispose();
			if(side==1) csgA.dispose();
			else csgB.dispose();
			
			var subCSG = outerCSG.subtract(innerCSG);
			
			scene.removeMesh(innerCSG);
			scene.removeMesh(outerCSG);
			
			if(side==1) {
				csgA = subCSG.toMesh("csgA", null, scene);
				csgA.createNormals(false);
				csgA.parent = profile;
			}else{ 
				csgB = subCSG.toMesh("csgB", null, scene);
				csgB.createNormals(false);
				csgB.parent = profile;
			}
			break;
		case 3:
			var box = BABYLON.MeshBuilder.CreateBox("box", { height: params['height'], width: params['width'], depth: 100 }, scene);
			var box2 = BABYLON.Mesh.CreateBox("box", parseFloat(params['corner']), scene);
			box2.rotation.z = Math.PI/4;
			box2.position.x = params['width']/2;
			box2.position.y = -params['height']/2;
			box2.scaling.z = 100/params['corner'];
			 
			var innerCSG = BABYLON.CSG.FromMesh(box2);
			var outerCSG = BABYLON.CSG.FromMesh(box);
			
			box.dispose();
			box2.dispose();
			
			var subCSG = outerCSG.subtract(innerCSG);
			
			scene.removeMesh(innerCSG);
			scene.removeMesh(outerCSG);
			
			var box = subCSG.toMesh("subCSG", null, scene);
			
			if(side==1) {
				box.position.y = params['y'];
			}
			else
			{
				box.rotation.x = Math.PI/2;
				box.position.z = params['y'];
			}
			
			box.position.x = params['x'];
			 
			var innerCSG = BABYLON.CSG.FromMesh(box);
			var outerCSG = BABYLON.CSG.FromMesh((side==1)?csgA:csgB);
			
			box.dispose();
			if(side==1) csgA.dispose();
			else csgB.dispose();
			
			var subCSG = outerCSG.subtract(innerCSG);
			
			scene.removeMesh(innerCSG);
			scene.removeMesh(outerCSG);
			
			if(side==1) {
				csgA = subCSG.toMesh("csgA", null, scene);
				csgA.createNormals(false);
				csgA.parent = profile;
			}else{ 
				csgB = subCSG.toMesh("csgB", null, scene);
				csgB.createNormals(false);
				csgB.parent = profile;
			}
			break;
		case 4:
			var cylinder = BABYLON.Mesh.CreateCylinder("cylinder", params['height'], params['radius'], params['radius'], 32, 1, scene, false);
			var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, params['radius'], scene);
			var sphere2 = sphere.clone("sphere2");
			
			cylinder.rotation.z = Math.PI/2;
			sphere.position.x = params['height']/2;
			sphere2.position.x = -params['height']/2;
			
			var innerCSG = BABYLON.CSG.FromMesh(cylinder);
			cylinder.dispose();
			var innerCSG2 = BABYLON.CSG.FromMesh(sphere);
			sphere.dispose();
			var innerCSG3 = BABYLON.CSG.FromMesh(sphere2);
			sphere2.dispose();
			
			var subCSG = innerCSG.union(innerCSG2).union(innerCSG3);
			
			scene.removeMesh(innerCSG);
			scene.removeMesh(innerCSG2);
			scene.removeMesh(innerCSG3);
			
			var box = subCSG.toMesh("subCSG2", null, scene);
			
			if(side==1) {
				box.position.y = params['y'];
			}
			else
			{
				box.rotation.x = Math.PI/2;
				box.position.z = params['y'];
			}
			
			box.position.x = params['x']; 
			
			var innerCSG = BABYLON.CSG.FromMesh(box);
			var outerCSG = BABYLON.CSG.FromMesh((side==1)?csgA:csgB);
			
			box.dispose();
			if(side==1) csgA.dispose();
			else csgB.dispose();
			
			var subCSG = outerCSG.subtract(innerCSG);
			
			scene.removeMesh(innerCSG);
			scene.removeMesh(outerCSG);
			
			if(side==1) {
				csgA = subCSG.toMesh("csgA", null, scene);
				csgA.createNormals(false);
				csgA.parent = profile;
			}else{ 
				csgB = subCSG.toMesh("csgB", null, scene);
				csgB.createNormals(false);
				csgB.parent = profile;
			}
			break;
	}
	
	console.log(scene.meshes.length)
}

function updateTextInput(id,val) {
	//document.getElementById(id).value=val; 
	switch(id){
		case "lengthText":
			profile.scaling.y = parseFloat(val);
			
			if(parseFloat(val)<20){
				camera.lowerRadiusLimit = parseInt(val);
				camera.radius = camera.lowerRadiusLimit*2;
			}else{
				camera.lowerRadiusLimit = parseInt(val-val/3);
				camera.radius = camera.lowerRadiusLimit + camera.lowerRadiusLimit/3;
			}
			break;
		case "lengthAText":
			csgA.scaling.x = parseFloat(val);
			csgA.position.x = parseFloat(val/2);
			break;
		case "lengthBText":
			csgB.scaling.z = parseFloat(val);
			csgB.position.z = parseFloat(val/2);
			break;
		case "thicknessText":
			csgA.scaling.z = parseFloat(val);
			csgB.scaling.x = parseFloat(val);;
			cylinder.scaling.z = parseFloat(val);
			cylinder.scaling.x = parseFloat(val);
			break;
	}
}

function myFunction() {
	var x = document.getElementById("form").value;
	$("#radiusXY").hide();
	$("#LlXY").hide();
	$("#LlCorner").hide();
	$("#RLlCorner").hide();
	
	switch(parseInt(x)){
		case 1:
			$("#radiusXY").show();
			break;
		case 2:
			$("#LlXY").show();
			break;
		case 3:
			$("#LlCorner").show();
			break;
		case 4:
			$("#RLlCorner").show();
			break;
	}
}

$("#button").click(function(){
	var forma = document.getElementById("form").value;
	var params = {};
	switch(parseInt(forma)){
		case 1:
			var r = document.getElementById("radiusText").value;
			var x = document.getElementById("XText").value;
			var y = document.getElementById("YText").value;
		
			params = {"radius": r,"x": x,"y":y}
			break;
		case 2:
			var w = document.getElementById("widthText").value;
			var h = document.getElementById("heightText").value;
			var x = document.getElementById("LXText").value;
			var y = document.getElementById("lYText").value;
			
			params = {"width": w,"height": h,"x": x,"y":y}
			break;
		case 3:
			var w = document.getElementById("width2Text").value;
			var h = document.getElementById("height2Text").value;
			var c = document.getElementById("CornerText").value;
			var x = document.getElementById("LX2Text").value;
			var y = document.getElementById("lY2Text").value;
		
			params = {"width": w,"height": h,"corner": c,"x": x,"y":y}
			break;
		case 4:
			var r = document.getElementById("Radius2Text").value;
			var h = document.getElementById("height3Text").value;
			var x = document.getElementById("LX3Text").value;
			var y = document.getElementById("lY3Text").value;
		
			params = {"radius": r,"height": h,"x": x,"y":y}
			break;
	}
	
	addForm(forma, params)
});

function showAxis(size) {
	var makeTextPlane = function (text, color, size) {
		var dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", 50, scene, true);
		dynamicTexture.hasAlpha = true;
		dynamicTexture.drawText(text, 5, 40, "bold 36px Arial", color, "transparent", true);
		var plane = BABYLON.Mesh.CreatePlane("TextPlane", size, scene, true);
		plane.material = new BABYLON.StandardMaterial("TextPlaneMaterial", scene);
		plane.material.backFaceCulling = false;
		plane.material.specularColor = new BABYLON.Color3(0, 0, 0);
		plane.material.diffuseTexture = dynamicTexture;
		plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
		return plane;
	};
	var axisX = BABYLON.Mesh.CreateLines("axisX", [
		BABYLON.Vector3.Zero(), new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, 0.05 * size, 0),
		new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, -0.05 * size, 0)
	], scene);
	axisX.color = new BABYLON.Color3(1, 0, 0);
	var xChar = makeTextPlane("X", "red", size / 10);
	xChar.position = new BABYLON.Vector3(0.9 * size, -0.05 * size, 0);
	var axisY = BABYLON.Mesh.CreateLines("axisY", [
		BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(-0.05 * size, size * 0.95, 0),
		new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(0.05 * size, size * 0.95, 0)
	], scene);
	axisY.color = new BABYLON.Color3(0, 1, 0);
	var yChar = makeTextPlane("Y", "green", size / 10);
	yChar.position = new BABYLON.Vector3(0, 0.9 * size, -0.05 * size);
	var axisZ = BABYLON.Mesh.CreateLines("axisZ", [
		BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, -0.05 * size, size * 0.95),
		new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, 0.05 * size, size * 0.95)
	], scene);
	axisZ.color = new BABYLON.Color3(0, 0, 1);
	var zChar = makeTextPlane("Z", "blue", size / 10);
	zChar.position = new BABYLON.Vector3(0, 0.05 * size, 0.9 * size);
};