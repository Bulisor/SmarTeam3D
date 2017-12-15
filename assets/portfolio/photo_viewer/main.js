
var zooMobile = false, actualD, skyboxMaterial, SautoRot = false;
var index = 5, textures = [], entries = [], sound, goToCircle;
var path = "/assets/portfolio/photo_viewer/res/cave/";  

var scene, light, camera, camerado, cameravr, noRender = true;
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
		Ssound = !Ssound; 
		if(Ssound) sound.setVolume(0.0);
		else sound.setVolume(0.4);   
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
		goToCircle.isVisible = true;
		Svr = !Svr;
	}else{
		if(scene.activeCamera == cameravr){
			if(Sdo && camerado)
				scene.activeCamera = camerado; 
			else
				scene.activeCamera = camera; 
			scene.activeCamera.attachControl(canvas, true);
			goToCircle.isVisible = false;
		} 
	}
});

function create_scene(){
	if (typeof(window.orientation) != "undefined") isMobile = true;
	
	BABYLON.SceneLoader.ShowLoadingScreen = false; 
	BABYLON.Database.IDBStorageEnabled  = false;
	
	scene = new BABYLON.Scene(engine);   
	scene.clearColor = new BABYLON.Color4(1, 1, 1, 0); 
	
	//Adding a light 
	light = new BABYLON.HemisphericLight("Hemi0", new BABYLON.Vector3(0, 1, 0), scene);
	light.diffuse = new BABYLON.Color3(1, 1, 1);
	light.shadowEnabled = false;
	light.specular = new BABYLON.Color3(0, 0, 0);
	
	settingCameras();
	
	//cursorul - pt pc
	if(!isMobile)
	{
		scene.constantlyUpdateMeshUnderPointer = true;
		scene.onPointerObservable.add(function (evt) {
			if (evt.pickInfo.pickedMesh != null && evt.pickInfo.pickedMesh.index != null) { 
				canvas.style.cursor = "pointer";  
			}      
		}, BABYLON.PointerEventTypes.POINTERMOVE);			
	} 
		
	scene.onPointerDown = function (evt, pickResult) {
		if (pickResult.hit && pickResult.pickedMesh!=null && pickResult.pickedMesh.index!=null) {
			index = pickResult.pickedMesh.index;
			setCamAnimation();
		}
	};
	
	scene.registerBeforeRender(function () {
		if(SautoRot) scene.activeCamera.alpha+=0.001;
		if(scene.activeCamera == cameravr) castRayAndSelectObject();  
	});
	
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
	
	create_Entries();
		
	skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
	getBackground();
	
	var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:1000.0}, scene);
	skybox.material = skyboxMaterial;	
	
	skyboxMaterial.imageProcessingConfiguration.contrast = 1.4; 
	skyboxMaterial.imageProcessingConfiguration.exposure = 1.4;
	
	createSliderOnBottom();
		
	menu();
}

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
	
	camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", -Math.PI/2, Math.PI/2, 1, BABYLON.Vector3.Zero(), scene);
	camera.attachControl(canvas,false);
	camera.fov = 1.4;
	camera.lowerRadiusLimit = camera.upperRadiusLimit = 1; 
	camera.panningSensibility = 0; 	
	scene.activeCamera = camera;

	sound = new BABYLON.Sound("horror", "/assets/portfolio/photo_viewer/horror_cave.mp3", scene, null, { loop: true, autoplay: true });
	sound.setVolume(0.4);  
}

function setCamAnimation(){
	if(scene.activeCamera!= cameravr){
		scene.activeCamera.animations = [];
		var animationCam = new BABYLON.Animation("Cinematique", "fov", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
		var a = [];
		a.push({ 
			frame : 0,
			value : scene.activeCamera.fov  
		}),
		a.push({
			frame : 15,
			value : 0.1
		}), 
		a.push({
			frame : 30, 
			value : 1
		});
		animationCam.setKeys(a);
		
		var qe = new BABYLON.QuadraticEase;
		qe.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
		animationCam.setEasingFunction(qe); 

		var anim2 = new BABYLON.AnimationEvent(14, function () { getBackground(); }, false);     
		animationCam.addEvent(anim2);
		
		scene.activeCamera.animations.push(animationCam); 
		scene.beginAnimation(scene.activeCamera, 0, 30, false);  
	}else{
		goToCircle.animations = [];
		var animationCam = new BABYLON.Animation("Cinematique", "scaling", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
		var a = [];
		a.push({ 
			frame : 0,
			value : goToCircle.scaling
		}),
		a.push({
			frame : 30, 
			value : BABYLON.Vector3.One()
		});
		animationCam.setKeys(a);
		
		var qe = new BABYLON.QuadraticEase;
		qe.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
		animationCam.setEasingFunction(qe); 

		var anim2 = new BABYLON.AnimationEvent(30, function () { 
			getBackground();
			goToCircle.scaling = new BABYLON.Vector3(.5,.5,.5);
		}, false);      
		animationCam.addEvent(anim2);
		 
		goToCircle.animations.push(animationCam); 
		scene.beginAnimation(goToCircle, 0, 30, false); 
		
	}
}  
 
function createSliderOnBottom(){
	
	var planeBackground = BABYLON.Mesh.CreatePlane("plane", 1, scene);
	planeBackground.isVisible = false;
	planeBackground.parent = camera; 
	if(isMobile){  
		if(window.innerWidth<window.innerHeight){
			planeBackground.scaling = new BABYLON.Vector3(0.5,0.5,1); 
			planeBackground.position.y = -5; 
		}else{ 
			planeBackground.scaling = new BABYLON.Vector3(1,1,1); 
			planeBackground.position.y = 0; 
		}
	} 
	
	for(var i=0;i<6;i++){
		//deactivate bottom slider
		//settingBottom(i, -14.7+i*5.9, planeBackground);
	}
	
	var dlight = new BABYLON.DirectionalLight("Dir0", new BABYLON.Vector3(1, 1, 1), scene);
	dlight.intensity = 2;
	dlight.diffuse = new BABYLON.Color3(1, 1, 1);
	dlight.shadowEnabled = false;
	dlight.specular = new BABYLON.Color3(0, 0, 0);
	dlight.parent = scene.activeCamera;
}

function settingBottom(index, positionX, parent){
	var mon0 = BABYLON.Mesh.CreatePlane("plane", 5, scene);
    mon0.position = new BABYLON.Vector3(positionX, -9.65, 25);
	mon0.showBoundingBox = true;
	
	var planeTexture = new BABYLON.Texture(path+index+"-jos.jpg", scene);
	planeTexture.hasAlpha = true;
    var mon1mat = new BABYLON.StandardMaterial("texturePlane", scene);
    mon1mat.diffuseTexture = planeTexture;
    mon1mat.opacityTexture = planeTexture;
	mon0.material = mon1mat;
	mon0.scaling.y = 0.7;
	mon0.parent = parent;
	mon0.index = index;
}

function getBackground(){
	if(typeof textures[index] == 'undefined'){
		var defText = new BABYLON.CubeTexture(path+index, scene);
		defText.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
		textures[index] = defText; 
	}  
	
	skyboxMaterial.backFaceCulling = false;
	skyboxMaterial.reflectionTexture = textures[index];
	skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
	skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
	skyboxMaterial.disableLighting = true;
	
	for(var i=0;i<entries.length;i++){
		for(var j=0;j<entries[i].length;j++){
			if(i==index) 
				entries[i][j].isVisible = true;
			else
				entries[i][j].isVisible = false;
		}
	}
}

function create_Entries(){
	var entr1 = setEntries(1, new BABYLON.Vector3(-430, -50, -450));
	var entr2 = setEntries(2, new BABYLON.Vector3(-400, 20, -450));
	entries[0] = [entr1, entr2];
	
	var entr3 = setEntries(0, new BABYLON.Vector3(450, 30, -170));
	var entr4 = setEntries(2, new BABYLON.Vector3(-450, 90, 50));
	entries[1] = [entr3, entr4];
	
	var entr5 = setEntries(1, new BABYLON.Vector3(300, -60, 400)); 
	var entr6 = setEntries(3, new BABYLON.Vector3(-450, 20, -50));
	entries[2] = [entr5, entr6];
	 
	var entr7 = setEntries(4, new BABYLON.Vector3(-430, 20, -450)); 
	var entr8 = setEntries(2, new BABYLON.Vector3(-450, -50, 300));
	entries[3] = [entr7, entr8];
	  
	var entr9 = setEntries(5, new BABYLON.Vector3(380, -20, -450)); 
	var entr10 = setEntries(3, new BABYLON.Vector3(-450, -60, 320));
	entries[4] = [entr9, entr10];	
	
	var entr11 = setEntries(4, new BABYLON.Vector3(320, 140, 450)); 
	var entr12 = setEntries(3, new BABYLON.Vector3(-100, 20, 450));
	entries[5] = [entr11, entr12];

	createTargetCircle();	
}

function setEntries(index, position){
	var planeTexture = new BABYLON.Texture(path+index+".png", scene);
	planeTexture.hasAlpha = true;
	
	var planeMaterial = new BABYLON.StandardMaterial("plane material", scene);
	planeMaterial.backFaceCulling = false;
	planeMaterial.diffuseTexture = planeTexture;
	planeMaterial.opacityTexture = planeTexture;

	var plane = BABYLON.Mesh.CreatePlane("plane", 60, scene);
	plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;	
	plane.material = planeMaterial;
	plane.position = position;
	plane.index = index;
	
	return plane;
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

window.addEventListener("resize", function() { engine.resize();});
window.addEventListener( "contextmenu", function(e) {e.preventDefault();}, false);  

function orientationChange() {
	if(isMobile){
		if(window.innerWidth>window.innerHeight)
			$(".menu").css("top", "95px");
		else 
			$(".menu").css("top", "50px");  
	} 
}

// EVENT-URI
window.onorientationchange = orientationChange;

var wheelit = function (e) {
	var e = window.event || e; // old IE support
	var delta = Math.max(-1, Math.min(1,(e.wheelDelta || -e.detail)));

	if (delta > 0  && scene.activeCamera.fov >= 1.4) return;
	if (delta < 0  && scene.activeCamera.fov <= 0.6) return;
	
	scene.activeCamera.fov += delta * 0.1;   
	//scene.activeCamera._children[0].position.z += -delta * 10 * 0.25/scene.activeCamera.fov;
};

canvas.addEventListener('mousewheel', wheelit, false);
canvas.addEventListener('DOMMouseScroll', wheelit, false);
	
canvas.addEventListener('touchstart', ts, false);
canvas.addEventListener('touchmove', tm, false);
canvas.addEventListener('touchend', te, false);

function ts(e){
	var ev = e.originalEvent || e;
	if(ev.touches.length == 2) {
		zooMobile = true;
		var distX = ev.touches[0].pageX - ev.touches[1].pageX; 
		var distY = ev.touches[0].pageY - ev.touches[1].pageY;
		var pinchSquaredDistance = (distX * distX) + (distY * distY);
		actualD = Math.sqrt(pinchSquaredDistance);
	}
}

function tm(e){
	var ev = e.originalEvent || e;
	if(zooMobile){
		var distX = ev.touches[0].pageX - ev.touches[1].pageX; 
		var distY = ev.touches[0].pageY - ev.touches[1].pageY;
		var pinchSquaredDistance = (distX * distX) + (distY * distY);
		var dist = Math.sqrt(pinchSquaredDistance);
	
		var delta = 1; 
		if(parseFloat(dist-actualD)>0) delta = -1;
		
		if (delta > 0  && scene.activeCamera.fov >= 1.4) zooMobile = false;
		if (delta < 0  && scene.activeCamera.fov <= 0.6) zooMobile = false;
	
		if(!zooMobile) return;
		
		scene.activeCamera.fov += delta * 2; 
		//scene.activeCamera._children[0].position.z += -delta * 0.3/scene.activeCamera.fov;		
	} 
}

function createTargetCircle() {
    goToCircle = BABYLON.Mesh.CreateGround("goToCircle", 1, 1, 1, scene);
	goToCircle.scaling = new BABYLON.Vector3(.5,.5,.5);
	var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(goToCircle, 1024, 512);

    var circle = new BABYLON.GUI.Ellipse();
    circle.width = "150px";
    circle.color = "orange";
    circle.thickness = 50;
    circle.height = "150px";
    advancedTexture.addControl(circle);

    goToCircle.isVisible = false;
	goToCircle.rotation.x = Math.PI/2;
	goToCircle.position.z = 5;  
	goToCircle.parent = cameravr;
};

function castRayAndSelectObject() {
	var ray = new BABYLON.Ray();
    var rayHelper = new BABYLON.RayHelper(ray);
    
    var localMeshDirection = goToCircle.position;
    var localMeshOrigin = cameravr.position; 
    var length = 500; 
          
    rayHelper.attachToMesh(cameravr, localMeshDirection, localMeshOrigin, length);
    //rayHelper.show(scene);
	
    var hits = scene.multiPickWithRay(ray);
	if (hits){ 
	   for (var i=0; i<hits.length; i++){
		   if (hits[i].pickedMesh && hits[i].pickedMesh.index!=null) {
				index = hits[i].pickedMesh.index; 
				setCamAnimation(); 
			}
	   }
	}
} 
	
function te(e){
	zooMobile = false;
	actualD = 0;
}
 
$("#contrast").on("change mousemove", function() {
	skyboxMaterial.imageProcessingConfiguration.contrast = $(this).val(); 
});
$("#exposure").on("change mousemove", function() {
	skyboxMaterial.imageProcessingConfiguration.exposure = $(this).val();
});
$("#night").click(function() {
	skyboxMaterial.imageProcessingConfiguration.applyByPostProcess = $(this).prop('checked')?true:false;
});
$("#autorot").click(function() {
	SautoRot = !SautoRot;
});
