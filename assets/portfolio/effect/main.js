
var spheres = [],scales = [], GUI; var leftInPixels = -125;
var index = 0, textures = [], sound;
var path = "/assets/portfolio/effect/texture_min/"; 
var background = ["SanFrancisco3/","SanFrancisco2/","NissiBeach2/"];
var skyboxMaterial, shapeMaterial;

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
	});
	$("#menu").click(function(){
		Smenu = !Smenu;
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

function create_scene(){
	if (typeof(window.orientation) != "undefined") isMobile = true;
	
	BABYLON.SceneLoader.ShowLoadingScreen = false; 
	BABYLON.Database.IDBStorageEnabled  = false;
	
	scene = new BABYLON.Scene(engine);   
	scene.clearColor = new BABYLON.Color4(1, 1, 1, 0); 
	
	var defText = new BABYLON.CubeTexture(path+background[index]+((isMobile == true)?"rsn":"rs"), scene);
	defText.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
	textures.push(defText);
					
	//Adding a light
	light = new BABYLON.HemisphericLight("Hemi0", new BABYLON.Vector3(0, 1, 0), scene);
	light.diffuse = new BABYLON.Color3(1, 1, 1);
	light.specular = new BABYLON.Color3(1, 1, 1); 
	light.groundColor = new BABYLON.Color3(1, 1, 1);
	light.shadowEnabled = false;
	
	settingCameras();
    setEnvironment();
	
	scene.registerBeforeRender(function () {
		var timer = 0.0001 * Date.now(); 
		for ( var i = 0; i < spheres.length; i ++ ) {
			var sphere = spheres[ i ];
			sphere.position.x = 50 * Math.cos( timer + i );
			sphere.position.y = 50 * Math.sin( timer + i * 1.1 );
		}
		
		if(GUI){
			if(Smenu){
				if(leftInPixels < 0){
					leftInPixels+=5;  
					GUI.left = leftInPixels+"px";
				}
			}else{
				if(leftInPixels > -125){ 
					leftInPixels-=5;
					GUI.left = leftInPixels+"px";
				}
			}
		}
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
	
	addGUI();
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
	
	camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 10, 0), scene);
	camera.attachControl(canvas, false);
	camera.keysUp = camera.keysDown = camera.keysLeft = camera.keysRight = [];
	scene.activeCamera = camera; 
}

function setEnvironment(){
	var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:1000.0}, scene);
	skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
	setMaterial();
	skybox.material = skyboxMaterial;	
   
	shapeMaterial = new BABYLON.StandardMaterial("mat", scene);
	setMaterial(false);

	for ( var i = 0; i < 500; i ++ ) { 
		var mesh = BABYLON.MeshBuilder.CreateSphere("shape", {}, scene);
		mesh.position.x = Math.random() * 100 - 50;
		mesh.position.y = Math.random() * 100 - 50;
		mesh.position.z = Math.random() * 100 - 50; 
		var sc = Math.random() * 8 + Math.random();
		scales.push(sc);
		mesh.scaling.x = mesh.scaling.y = mesh.scaling.z = sc;
	   
		mesh.material = shapeMaterial;	
		spheres.push( mesh );
	}
}

function addGUI(){
	var advTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

	GUI = new BABYLON.GUI.StackPanel();   
    GUI.verticalAlignment = 0;
	GUI.horizontalAlignment = 0;
	GUI.background = "rgba(255, 255, 255, .2)";
	GUI.shadowBlur = 5;
	GUI.left = "-125px";
    GUI.shadowOffsetX = 2;
    GUI.shadowOffsetY = 2;
	GUI.height = "230px";
	
	if(isMobile){
		if(window.innerWidth>window.innerHeight)
			GUI.top = "50px";
		else 
			GUI.top = "95px"; 
	}else{
		GUI.top = "50px";
	}
    advTexture.addControl(GUI);   
	
	var menu = text_elemGUI("Menu", "16px", "white"); 
	menu.background = "rgba(220,220,220, .3)";
    GUI.addControl(menu);  
	
	var button = BABYLON.GUI.Button.CreateSimpleButton("but", "Next Background");
	button.width = "100px"; 
	button.height = "30px";
	button.fontSize = "12px";
	button.color = "black";
	button.background = "rgba(200, 200, 200, .3)";
	button.cornerRadius = 10;    
	button.pointerEnterAnimation = () => {canvas.style.cursor="pointer";button.background = "rgba(200, 200, 200, 1)";}
    button.pointerOutAnimation = () => {button.background = "rgba(200, 200, 200, .3)";} 
	
	button.onPointerUpObservable.add(function() { 
		index = (index == background.length-1)?0:index+1;
		if(typeof textures[index] == 'undefined'){ 
			var defText = new BABYLON.CubeTexture(path+background[index]+((isMobile == true)?"rsn":"rs"), scene);
			defText.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
			textures.push(defText);
		}  
		
		setMaterial(); 
		setMaterial(false);
	});
	GUI.addControl(button);
	
	var header1 = text_elemGUI("Lens Size:", "14px", "black"); 
    GUI.addControl(header1);  
	
	var slider = new BABYLON.GUI.Slider();
	slider.minimum = 0.2;
	slider.maximum = 2;  
	slider.color = "black";
	slider.background = "white";
	slider.value = 1; 
	slider.width = "105px"; 
	slider.height = "15px"; 
	slider.isThumbCircle = "true"; 
	slider.thumbWidth = "14px";   

	slider.onValueChangedObservable.add(function(value) {
		for ( var i = 0; i < spheres.length; i ++ ) {
			var sc = scales[i];
			spheres[i].scaling = new BABYLON.Vector3(sc*value, sc*value, sc*value);
		}
	})
	GUI.addControl(slider);
	
	var header2 = text_elemGUI("Lens Color:", "14px", "black"); 
    GUI.addControl(header2); 
	 
	var picker = new BABYLON.GUI.ColorPicker();
	picker.value = "black";
	picker.width = "90px"; 
	picker.height = "90px"; 
	
    picker.onValueChangedObservable.add(function(value) {			
		for ( var i = 0; i < spheres.length; i ++ ) {
			spheres[i].material.diffuseColor = value;
		} 
    });    
    GUI.addControl(picker); 
} 

function text_elemGUI(text, size, color){
	var TextBlock = new BABYLON.GUI.TextBlock();  
    TextBlock.text = text;
	TextBlock.fontSize = size; 
	TextBlock.color = color;
	TextBlock.width = "120px";
	TextBlock.height = "30px";
	return TextBlock;
}

//SETTING MATERIALS
function setMaterial(skyMaterial = true){
	if(skyMaterial){
		skyboxMaterial.backFaceCulling = false;
		skyboxMaterial.reflectionTexture = textures[index];
		skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
		skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
		skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
		skyboxMaterial.disableLighting = true;
	}else{
		shapeMaterial.backFaceCulling = false;
		shapeMaterial.refractionTexture = textures[index]; 
		shapeMaterial.refractionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
		shapeMaterial.invertRefractionY = false;
		shapeMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
		shapeMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
	}
}	

function orientationChange() { 
	if(GUI != null){  
		if(isMobile){
			if(window.innerWidth>window.innerHeight)
				GUI.top = "95px";
			else 
				GUI.top = "50px"; 
		} 
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
