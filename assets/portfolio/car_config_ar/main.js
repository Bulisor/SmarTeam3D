
var isMobile = false, noRender = true, enableEffect = false, GUI, activateMD = false;
var scene, light, ambientLight, camera, camera2, cameraView, videoTexture, video, backIndex = 1;
var categ = ["door_lf", "door_rf", "boot", "bonnet"], autoRotate = true;
var ground1, ground2, ground3, car, doors = [], cameras = [], camvideo;
var openLdoor = false, openRdoor = false, openHood = false, openBags = false;

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
	
	document.getElementById("loadingScene").style.display = "block";
	
	if (BABYLON.Engine.isSupported())
	{    
		BABYLON.SceneLoader.ShowLoadingScreen = true;
		BABYLON.Database.IDBStorageEnabled  = true;
		
		scene = new BABYLON.Scene(engine);  
		scene.clearColor = new BABYLON.Color4(1, 1, 1, 0); 
		scene.fogColor = new BABYLON.Color3(1.0, 1.0, 1.0);
		scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
		scene.fogDensity = 0.01; 
		
		//scene.debugLayer.show();        
		setting_lights();   
  
		setting_cameras();   

		importMesh();       
		
		shadowmap = new BABYLON.ShadowGenerator(512, light)
		shadowmap.useBlurExponentialShadowMap = true
		shadowmap.blurKernel = 32
		shadowmap.darkness = 0.6
		
		scene.registerBeforeRender(function() {  
			if(enableEffect){
				if(scene.fogDensity>0){   
					scene.fogDensity-=0.0002;  
				}else{   
					scene.fogDensity = 0;
					enableEffect = !enableEffect;  
				} 
			}
			/*if(autoRotate){
				camera.alpha += 0.001;
			}*/
		}); 

		//click pe masina
		scene.onPointerDown = function (evt, pickResult) {
			if (pickResult.hit && pickResult.pickedMesh!=null) {
				  
				var index = categ.indexOf(pickResult.pickedMesh.name);
				switch (index){
					case 0:
						openLdoor = !openLdoor;
						if(openLdoor)
							scene.beginAnimation(doors[1], 0, 50, false);  
						else
							scene.beginAnimation(doors[1], 50, 100, false);  
						break;
					case 1:
						openRdoor = !openRdoor;
						if(openRdoor)
							scene.beginAnimation(doors[0], 0, 50, false);  
						else
							scene.beginAnimation(doors[0], 50, 100, false);  
						break;
					case 2:
						openHood = !openHood;
						if(openHood)
							scene.beginAnimation(doors[2], 0, 50, false);  
						else
							scene.beginAnimation(doors[2], 50, 100, false); 
						break;		   				
					case 3:
						openBags = !openBags;  
						if(openBags)
							scene.beginAnimation(doors[3], 0, 50, false);  
						else   
							scene.beginAnimation(doors[3], 50, 100, false);  
						break;
					default: 
						break;
				}
			}
		};
		
		engine.runRenderLoop(function() { 
			fpsLabel.innerHTML = engine.getFps().toFixed() + " fps";
			if(scene.isReady() && !noRender) scene.render();
			
			if(activateMD){
				renderMD();	
				blend();	
				checkAreas();
			}
		});
	};   
}  
  		
function setting_lights(){
	light = new BABYLON.DirectionalLight("Dir0", new BABYLON.Vector3(0, -1, 0), scene);
	light.diffuse = new BABYLON.Color3(1, 1, 1);
	light.specular = new BABYLON.Color3(1, 1, 1);   

	ambientLight = new BABYLON.HemisphericLight("Hemi0", new BABYLON.Vector3(0, 1, 0), scene);
	ambientLight.diffuse = new BABYLON.Color3(0.5, 0.5, 0.5);
	ambientLight.specular = new BABYLON.Color3(0, 0, 0); 
	ambientLight.groundColor = new BABYLON.Color3(1, 1, 1);
}
		
function setting_cameras(){
	 
	camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", -Math.PI/1.5, Math.PI/2.2, 350, new BABYLON.Vector3(0,10,0), scene);
	camera.upperBetaLimit = Math.PI/2; 
	camera.lowerBetaLimit = -Math.PI/18; 
	camera.lowerRadiusLimit = 140;  
	camera.upperRadiusLimit = 600;
	camera.panningSensibility = 0;
	scene.activeCamera = camera;   
	scene.activeCamera.attachControl(canvas, false);  
	
	scene.cameraToUseForPointers = scene.activeCamera;
	
	camera2 = new BABYLON.DeviceOrientationCamera("DevOr_camera", new BABYLON.Vector3(0, 10, 0), scene);
	camera2.attachControl(canvas, false); 
	camera2.keysUp = camera2.keysDown = camera2.keysLeft = camera2.keysRight = [];
}		 
 
function importMesh(){   
	BABYLON.SceneLoader.Append( "/assets/portfolio/car_config/Binary2/", "amg.binary.babylon", scene, function () {
		
		for (let i = 0; i < scene.meshes.length; i++) {
			shadowmap.addShadowCaster(scene.meshes[i])
		}
		
		scene.executeWhenReady(function () {
			car = scene.meshes[0];
			car.scaling = new BABYLON.Vector3(45,45,45);   
			
			scene.meshes[2].scaling = new BABYLON.Vector3(1,1,1);
			scene.meshes[2].position = new BABYLON.Vector3(0.82, -0.3, -1.44);
			scene.meshes[5].scaling = new BABYLON.Vector3(1,1,1);
			scene.meshes[5].position = new BABYLON.Vector3(-0.82, -0.3, -1.44);
			scene.meshes[3].scaling = new BABYLON.Vector3(1,1,1);
			scene.meshes[3].position = new BABYLON.Vector3(0.82, -0.3, 1.36);
			scene.meshes[4].scaling = new BABYLON.Vector3(1,1,1);
			scene.meshes[4].position = new BABYLON.Vector3(-0.82, -0.3, 1.36);
			
			doors.push(scene.meshes[15], scene.meshes[16], scene.meshes[21], scene.meshes[22]);
			set_animation([scene.meshes[15],scene.meshes[16], scene.meshes[21], scene.meshes[22]]);
	
			var metal = new BABYLON.PBRMaterial("metal", scene);
			metal.environmentIntensity = 0.2;  
			metal.reflectivityColor = new BABYLON.Color3(0.1, 0.1, 0.1);
			metal.albedoColor = new BABYLON.Color3(0.0, 0.0, 0.25);  
			metal.reflectionColor = new BABYLON.Color3(0.52, 0.52, 0.9);
			
			scene.meshes[11].material = metal;  
			scene.meshes[15].material.subMaterials[0] = metal;
			scene.meshes[16].material.subMaterials[0] = metal;
			scene.meshes[18].material.subMaterials[0] = metal;
			scene.meshes[19].material.subMaterials[0] = metal;
			scene.meshes[20].material.subMaterials[0] = metal;
			scene.meshes[21].material.subMaterials[0] = metal;
			scene.meshes[22].material.subMaterials[0] = metal;
			
			var metal2 = new BABYLON.PBRMaterial("metal2", scene);
			metal2.reflectionColor = new BABYLON.Color3(0.5, 0.45, 0.35); 
			metal2.reflectivityColor = new BABYLON.Color3(0.85, 0.85, 0.85);
			
			scene.meshes[15].material.subMaterials[8] = metal2;
			scene.meshes[16].material.subMaterials[9] = metal2;
			scene.meshes[18].material.subMaterials[4] = metal2; 
			scene.meshes[19].material.subMaterials[4] = metal2;
			scene.meshes[20].material.subMaterials[2] = metal2;
			scene.meshes[21].material.subMaterials[2] = metal2;
			scene.meshes[22].material.subMaterials[3] = metal2;
			
			var metal3 = new BABYLON.PBRMaterial("metal3", scene);
			metal3.alpha = 0.5; 
			metal3.environmentIntensity = 0.8; 
			metal3.reflectionColor = new BABYLON.Color3(0.9, 0.9, 0.9); 
			metal3.albedoColor = new BABYLON.Color3(0.0, 0.0, 0.0);
			metal3.reflectivityColor = new BABYLON.Color3(0.4, 0.4, 0.4);
			
			scene.meshes[6].material = metal3;
			scene.meshes[9].material = metal3;
			scene.meshes[17].material = metal3;
			scene.meshes[1].material.subMaterials[0] = metal3;
			scene.meshes[15].material.subMaterials[1] = metal3;
			scene.meshes[16].material.subMaterials[1] = metal3;
			
			var metal4 = new BABYLON.PBRMaterial("metal4", scene);
			metal4.environmentIntensity = 0.02; 
			
			scene.meshes[2].material.subMaterials[2] = metal4;
			scene.meshes[2].material.subMaterials[3] = metal4;
			
			scene.materials[27].dispose();
			scene.materials[26].dispose();
			scene.materials[13].dispose();
			scene.materials[12].dispose();
			scene.materials[8].dispose();
			scene.materials[3].dispose();
			scene.materials[2].dispose();
			scene.materials[0].dispose();
	
			addVideo(); 
			addGUI(); 
			
			const ground = BABYLON.Mesh.CreatePlane('ground', 500, scene)
			ground.rotation.x = Math.PI / 2
			ground.position.y = -30
			ground.material = new BABYLON.ShadowOnlyMaterial('mat', scene)
			ground.receiveShadows = true
		
			setTimeout(function(){ 
				document.getElementById("loadingScene").style.display = "none"; 
				document.getElementById("htmlUI").style.display = "block"; 
				enableEffect = true; noRender = false;
			}, 2000);    
		}); 
	});   
}     

function background(param){ 
	camera.alpha = -Math.PI/1.5;
	camera.beta = Math.PI/2;
	
	if(ground2) ground2.isVisible = false;
	if(ground1) ground1.scale = BABYLON.Vector2.Zero();
	if(ground3) ground3.scale = BABYLON.Vector2.Zero();
	if(videoTexture) videoTexture.dispose();
	stop();
	
	camera.upperBetaLimit = Math.PI/2; 
	camera.lowerBetaLimit = -Math.PI/18;
	scene.activeCamera.detachControl(canvas);
	
	switch(param){
		case 1:			
			scene.activeCamera = camera;   
			scene.activeCamera.attachControl(canvas, false); 
			break;
		case 2:
			scene.activeCamera = camera;   
			scene.activeCamera.attachControl(canvas, false); 
			
			camera.upperBetaLimit = camera.lowerBetaLimit = Math.PI/2; 
			if(!ground2){
				ground2 = BABYLON.MeshBuilder.CreateBox("skyBox", {size:3000.0}, scene);
				var defText = new BABYLON.CubeTexture("/assets/portfolio/zoom3D/res/"+((isMobile)?"rsn":"rs"), scene);
				defText.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
					
				var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene); 
				skyboxMaterial.backFaceCulling = false;
				skyboxMaterial.reflectionTexture = defText;
				skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
				skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
				skyboxMaterial.disableLighting = true;
				ground2.material = skyboxMaterial;
			}
			ground2.isVisible = true;
			break;
		case 3:
			scene.activeCamera = camera;   
			scene.activeCamera.attachControl(canvas, false); 
			
			camera.upperBetaLimit = camera.lowerBetaLimit = Math.PI/2; 
			if(!ground3){
				ground3 = new BABYLON.Layer("bg", "/assets/portfolio/zoom3D/res/rs_nx.jpg", scene, true);
			}
			ground3.scale = BABYLON.Vector2.One();
			break;
		case 4:
			scene.activeCamera = camera2;   
			scene.activeCamera.attachControl(canvas, false); 
	
			stopMD();
			activateMD = false;
			$("#motionD").css("background-color","maroon");
			if($(".colors").css('display') == 'none')
				$(".colors").css("display",($(".layers").is(':visible'))?"inline-flex":"none");
		
			$(".layers").hide();
			
			start(0);
			videoTexture = new BABYLON.VideoTexture("video", video, scene, false, (isMobile && navigator.userAgent.indexOf("Firefox") != -1)?true:false, 2);
			ground1 = new BABYLON.Layer("bg", null, scene, true);
			ground1.texture = videoTexture; 
			break;
			
		case 5:
			scene.activeCamera = camera2;   
			scene.activeCamera.attachControl(canvas, false); 
			
			stopMD();
			activateMD = false; 
			$("#motionD").css("background-color","maroon");
			if($(".colors").css('display') == 'none')
				$(".colors").css("display",($(".layers").is(':visible'))?"inline-flex":"none");
		
			$(".layers").hide();
			
			start(1);
			videoTexture = new BABYLON.VideoTexture("video", video, scene, false, (isMobile && navigator.userAgent.indexOf("Firefox") != -1)?true:false, 2);
			ground1 = new BABYLON.Layer("bg", null, scene, true);
			ground1.texture = videoTexture; 
			break;
			
	}
}

///*** Video Camera functions ***///
function addVideo(){
	scene.environmentTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("/assets/portfolio/zoom3D/res/environment.dds", scene);
		
	var myElem = document.getElementById('videoElement');
	if (myElem === null) {    
		var myLayer = document.createElement('video');
		myLayer.id = 'videoElement';
		myLayer.autoplay = true;
		document.body.appendChild(myLayer);
	}
	
	video = document.querySelector('#videoElement');
	
	var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;  
	if(!iOS) navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);
	camvideo = document.querySelector('#webcam');
}
  
function gotDevices(deviceInfos) {
  cameras = [];
  for (var i = 0; i !== deviceInfos.length; ++i) {
    var deviceInfo = deviceInfos[i];
    if (deviceInfo.kind === 'videoinput') {
		cameras.push(deviceInfo.deviceId);
	}
  }
}

function gotStream(stream) {
	
	window.stream = stream; // make stream available to console
	video.srcObject = stream;
	
	// Refresh button list in case labels have become available
  return navigator.mediaDevices.enumerateDevices();
}

function start(index) {
  stop();
  
  if(index>cameras.length-1) index = 0;
 
  var constraints = {
    audio: false,
    video: {deviceId: cameras[index] ? {exact: cameras[index]} : undefined}
  };
  
  navigator.mediaDevices.getUserMedia(constraints).
      then(gotStream).then(gotDevices).catch(handleError);
}

function stop(){
	if (window.stream) {
		window.stream.getTracks().forEach(function(track) {
			track.stop();
		});
	}
}

function stopMD(){
	if (window.str) {
		window.str.getTracks().forEach(function(track) {
			track.stop();
		});
	}
}

function handleError(error) {
  console.log('navigator.getUserMedia error: ', error); 
  alert("Your browser doesn't support getUserMedia function or it doesn't have enough permissions to access the device’s camera. For more details press 'HowTo' button.");
}

function gotStreamMD(stream) {
	
	window.str = stream;
	camvideo.srcObject = stream;
	
	// Refresh button list in case labels have become available
  return navigator.mediaDevices.enumerateDevices();
}

function startMD(index) {

  var constraints = {
    audio: false,
    video: true
  };
  
  navigator.mediaDevices.getUserMedia(constraints).
      then(gotStreamMD).then(gotDevices).catch(handleError);
}
///*** End Video Camera functions ***///

function addGUI(){
	GUI = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

	var header1 = new BABYLON.GUI.TextBlock();  
    header1.text = "Background:";
	setting_GUI(header1,2);
    GUI.addControl(header1);  
	
	var button1 = BABYLON.GUI.Button.CreateSimpleButton("but", "None");
	button1.color = "green";
	button1.top = "25px";
	setting_GUI(button1,1);
	GUI.addControl(button1); 
	
	button1.onPointerUpObservable.add(function() {
		button2.color = button3.color = button4.color = "maroon";
		if(button5) button5.color = "maroon";
		button1.color = "green";
		backIndex = 1;
		background(backIndex);
	});
	
	var button2 = BABYLON.GUI.Button.CreateSimpleButton("but", "360");
	button2.color = "maroon";
	button2.top = "55px";
	setting_GUI(button2,1);
	GUI.addControl(button2); 
	
	button2.onPointerUpObservable.add(function() {
		button1.color = button3.color = button4.color = "maroon";
		if(button5) button5.color = "maroon";
		button2.color = "green";
		backIndex = 2;
		background(backIndex);
	});
	
	var button3 = BABYLON.GUI.Button.CreateSimpleButton("but", "Photo");
	button3.color = "maroon";
	button3.top = "85px";
	setting_GUI(button3,1);
	GUI.addControl(button3); 
	
	button3.onPointerUpObservable.add(function() {
		button2.color = button1.color = button4.color = "maroon";
		if(button5) button5.color = "maroon";
		button3.color = "green";
		backIndex = 3;
		background(backIndex);
	});
	
	if(isMobile){
		var button4 = BABYLON.GUI.Button.CreateSimpleButton("but", "Camera1");
		button4.color = "maroon";
		button4.top = "115px";
		setting_GUI(button4,1);
		GUI.addControl(button4); 
		
		button4.onPointerUpObservable.add(function() {
			button2.color = button3.color = button1.color = button5.color = "maroon";
			button4.color = "green";
			backIndex = 4;
			background(backIndex);
		});
		var button5 = BABYLON.GUI.Button.CreateSimpleButton("but", "Camera2");
		button5.color = "maroon";
		button5.top = "145px"; 
		setting_GUI(button5,1);
		GUI.addControl(button5); 
		
		button5.onPointerUpObservable.add(function() {
			button2.color = button3.color = button1.color = button4.color = "maroon";
			button5.color = "green";
			backIndex = 5;
			background(backIndex);
		});
	}else{
		var button4 = BABYLON.GUI.Button.CreateSimpleButton("but", "Camera");
		button4.color = "maroon";
		button4.top = "115px";
		setting_GUI(button4,1);
		GUI.addControl(button4); 
		
		button4.onPointerUpObservable.add(function() {
			button2.color = button3.color = button1.color = "maroon";
			if(button5) button5.color = "maroon";
			button4.color = "green";
			backIndex = 4;
			background(backIndex);
		});
	}
	/*
	var header2 = new BABYLON.GUI.TextBlock();  
    header2.text = "AutoRotation:";
	setting_GUI(header2,2);
	header2.top = (isMobile)?"175px":"145px";
    GUI.addControl(header2); 
	
	var checkbox = new BABYLON.GUI.Checkbox();
    checkbox.isChecked = true;
	setting_GUI(checkbox,3);
	checkbox.top = (isMobile)?"173px":"142px";
    checkbox.onIsCheckedChangedObservable.add(function(value) {
        autoRotate = value;
    });
    GUI.addControl(checkbox);
	*/
}	

function setting_GUI(elem, param){
	switch(param){
		case 1:
			elem.width = (isMobile)?"55px":"65px"; 
			elem.height = "25px";
			elem.fontSize = (isMobile)?"12px":"15px";
			elem.background = "transparent"; 
			elem.cornerRadius = 10;
			elem.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
			elem.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
			elem.thickness = (isMobile)?1:2;
			elem.left = "15px";
			break;
		case 2:
			elem.verticalAlignment = 0;
			elem.horizontalAlignment = 0;
			elem.fontSize = (isMobile)?"11px":"14px"; 
			elem.color = "maroon";
			elem.top = "5px";
			elem.left = "10px";
			elem.width = "90px";
			elem.background = "transparent"; 
			elem.textHorizontalAlignment = 0;
			elem.textVerticalAlignment = 0;
			break;
		case 3:
			elem.width = (isMobile)?"15px":"20px";
			elem.height = (isMobile)?"15px":"20px";
			elem.color = "maroon";
			elem.left = (isMobile)?"82px":"100px";
			elem.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
			elem.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
			break;
	}
	
}

// CAR ANIMATIONS SETTING
function set_animation(meshes){
	for(var i=0;i<meshes.length;i++)
	{
		var keys = [];
		if(i<2)
			var animation = new BABYLON.Animation("animation", "rotation.z", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
		else
			var animation = new BABYLON.Animation("animation", "rotation.x", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
		
		keys.push({
			frame: 0,
			value: 0
		}); 
		
		switch (i){
			case 0:
				keys.push({
					frame: 50,
					value: -Math.PI/2.5
				});
				break; 
			case 1:
				keys.push({
					frame: 50,
					value: Math.PI/2.5
				});
				break;
			case 2:  
				keys.push({
					frame: 50,
					value: -Math.PI/4
				});
				break;
			case 3:
				keys.push({
					frame: 50,
					value: Math.PI/4
				});
				break;
		}
			
		keys.push({ 
			frame: 100, 
			value: 0
		});

		animation.setKeys(keys);
		meshes[i].animations.push(animation); 
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

window.addEventListener("resize", function() { engine.resize();});
window.addEventListener( "contextmenu", function(e) {e.preventDefault();}, false);  

///*** Menu ***///
$(".howTo").click(function(){
	$(this).children('div').css("display",($(this).children('div').is(':visible'))?"none":"block");
});
$(".about").click(function(){
	$(".info").css("display",($(".info").is(':visible'))?"none":"block");
});
$(".info").click(function(){
	$(this).hide();
});
var colors = [new BABYLON.Color3(0.25,0,0),new BABYLON.Color3(0.25,0.25,0.25),new BABYLON.Color3(0,0,0.25)];
var colorsr = [new BABYLON.Color3(0.9,0.52,0.52),new BABYLON.Color3(0.9,0.9,0.9),new BABYLON.Color3(0.52,0.52,0.9)];

$(".color").click(function(){
	$('.color').removeClass('selected');
	$(this).addClass('selected');
	var index = $(this).attr("id").split("_");
	scene.materials[20].albedoColor = colors[index[1]];
	scene.materials[20].reflectionColor = colorsr[index[1]];
});
$(".menu p").click(function(){
	if(noRender) return;
	if(($(".colors").css('display') == 'none') && ($(".layers").css('display') == 'none')){
		$(".colors").css("display","inline-flex");
		$("#motionD").css("display","block");
	}else{
		if($(".colors").css('display') == 'inline-flex'){
			$(".colors").css("display","none");
			$("#motionD").css("display","none");
		}else{
			$(".layers").css("display","none");
			$("#motionD").css("display","none").css("background-color","maroon");
			stopMD();
			activateMD = false;
		}
	}
})
$("#motionD").click(function(){
	if(backIndex>3){
		alert("Motion Detection doesn't work while using the camera as background");
		return;
	}
	$(this).css("background-color",($(this).css("background-color")=="rgb(128, 0, 0)")?"green":"maroon");
	$(".colors").css("display",($(".colors").is(':visible'))?"none":"inline-flex");
	
	activateMD = !activateMD; 
	if($(".layers").is(':visible')){
		$(".layers").hide();
		stopMD();
	}else{
		$(".layers").show(); 
		startMD(camvideo);
	}
	
}); 
$(".ui").click(function(){
	$("#htmlUI").css("display",($("#htmlUI").is(':visible'))?"none":"block");
	if(GUI) GUI.rootContainer.isVisible = !GUI.rootContainer.isVisible;
})
///*** End Menu ***///

///*** Motion Detection functions ***///
var videoCanvas = document.getElementById( 'videoCanvas' );
var videoContext = videoCanvas.getContext( '2d' );

var layer2Canvas = document.getElementById( 'layer2' );
var layer2Context = layer2Canvas.getContext( '2d' );

var blendCanvas  = document.getElementById( "blendCanvas" );
var blendContext = blendCanvas.getContext('2d');

videoContext.fillStyle = '#550000';
videoContext.fillRect( 0, 0, videoCanvas.width, videoCanvas.height );				

var buttons = [];

var buttonData1 = { index:0, name:"brown", x:182 - 120 - 50, y:10, w:40, h:30 };
buttons.push( buttonData1 );

var buttonData2 = { index:1, name:"lightGray ", x:182 - 80 - 30, y:10, w:40, h:30 };
buttons.push( buttonData2 );

var buttonData3 = { index:2, name:"blue", x:182 - 40 - 10, y:10, w:40, h:30 };
buttons.push( buttonData3 );

function renderMD() 
{	
	if (camvideo.readyState === 4) 
	{
		videoContext.drawImage( camvideo, 0, 0, videoCanvas.width, videoCanvas.height );
		for ( var i = 0; i < buttons.length; i++ ){
			layer2Context.beginPath();
			layer2Context.rect(buttons[i].x, buttons[i].y, buttons[i].w, buttons[i].h);
			layer2Context.fillStyle = buttons[i].name;
			layer2Context.fill();
		}
	}
}

var lastImageData;

function blend() 
{
	var width  = videoCanvas.width;
	var height = videoCanvas.height;
	// get current webcam image data
	var sourceData = videoContext.getImageData(0, 0, width, height);
	// create an image if the previous image doesn�t exist
	if (!lastImageData) lastImageData = videoContext.getImageData(0, 0, width, height);
	// create a ImageData instance to receive the blended result
	var blendedData = videoContext.createImageData(width, height);
	// blend the 2 images
	differenceAccuracy(blendedData.data, sourceData.data, lastImageData.data);
	// draw the result in a canvas
	blendContext.putImageData(blendedData, 0, 0);
	// store the current webcam image
	lastImageData = sourceData;
}
function differenceAccuracy(target, data1, data2) 
{
	if (data1.length != data2.length) return null;
	var i = 0;
	while (i < (data1.length * 0.25)) 
	{
		var average1 = (data1[4*i] + data1[4*i+1] + data1[4*i+2]) / 3;
		var average2 = (data2[4*i] + data2[4*i+1] + data2[4*i+2]) / 3;
		var diff = threshold(fastAbs(average1 - average2));
		target[4*i]   = diff;
		target[4*i+1] = diff;
		target[4*i+2] = diff;
		target[4*i+3] = 0xFF;
		++i;
	}
}
function fastAbs(value) 
{
	return (value ^ (value >> 31)) - (value >> 31);
}
function threshold(value) 
{
	return (value > 0x15) ? 0xFF : 0;
}
// check if white region from blend overlaps area of interest (e.g. triggers)
function checkAreas() 
{
	for (var b = 0; b < buttons.length; b++)
	{
		// get the pixels in a note area from the blended image
		var blendedData = blendContext.getImageData( buttons[b].x, buttons[b].y, buttons[b].w, buttons[b].h );
			
		// calculate the average lightness of the blended data
		var i = 0;
		var sum = 0;
		var countPixels = blendedData.data.length * 0.25;
		while (i < countPixels) 
		{
			sum += (blendedData.data[i*4] + blendedData.data[i*4+1] + blendedData.data[i*4+2]);
			++i;
		}
		// calculate an average between of the color values of the note area [0-255]
		var average = Math.round(sum / (3 * countPixels));
		if (average > 20) // more than 20% movement detected
		{
			scene.materials[20].albedoColor = colors[buttons[b].index];
			scene.materials[20].reflectionColor = colorsr[buttons[b].index];
		}
	}
}
///*** End Motion Detection functions ***///
