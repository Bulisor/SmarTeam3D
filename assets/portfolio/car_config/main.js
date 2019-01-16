  
var isMobile = false, noRender = true, enableEffect = false, startCredits = false;
var scene, light, ambientLight, postProcess, UI, FREEModeCamera, KINEMATICModeCamera;

var DRIVEModeCameras = [], driveCamIndex = 0, picker, colorButons = [], carStart, carHorn, decal;  
var car, wheels = [], doors = [], buttonColor = 1, textADT, creditsText, kinematicMusic;  
var categ = ["door_lf", "door_rf", "boot", "bonnet", "decal"], mobile_buttons, UIMob;  decalTextures = [];
var openLdoor = false, openRdoor = false, openHood = false, openBags = false, actualDecal = 0; 

var mod = {
  FREE: 1, 
  DRIVE: 2,
  KINEMATIC: 3,
} 

var actualMod = mod.FREE; 

var fpsLabel = document.getElementById("fpsLabel");
var canvas = document.getElementById("canvas"); 
var engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });

var AMG, control = new Control;     
   
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
		
		scene.registerBeforeRender(function() {  
			if(actualMod == mod.DRIVE){
				amg.updateCar(.05)
			}
			 
			if(enableEffect){
				if(scene.fogDensity>0){   
					scene.fogDensity-=0.0002;  
				}else{   
					scene.fogDensity = 0;
					enableEffect = !enableEffect;
					if(decal == null) addDecal();	  
				} 
			}
			 
			if(startCredits){ 
				if(textADT.vOffset>-0.4){      
					if(!creditsText.isVisible) creditsText.isVisible = true;
					textADT.vOffset -= .0006;      
				}else{  
					startCredits = false;
					creditsText.isVisible = false;  
					textADT.vOffset = 0.7;      
				}
			}
		}); 

		//click pe masina
		scene.onPointerDown = function (evt, pickResult) {
			if(actualMod!= mod.FREE) return;
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
					case 4:    
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
		
		//cursorul - pt pc
		if(!isMobile)
		{
			scene.constantlyUpdateMeshUnderPointer = true;
			scene.onPointerObservable.add(function (evt) {
				if(actualMod!= mod.FREE) return; 
				if (evt.pickInfo.pickedMesh!=null) { 
					if(categ.indexOf(evt.pickInfo.pickedMesh.name)>-1){ 
						if(evt.pickInfo.pickedMesh.name!= "decal")
							evt.pickInfo.pickedMesh.renderOutline = true;
						canvas.style.cursor = "pointer"; 
					}else{  
						if(doors.length>0){
							for(var i=0;i<doors.length;i++){
								if(doors[i].renderOutline == true)
									doors[i].renderOutline = false;
							}
						}  
					}     
				}      
			}, BABYLON.PointerEventTypes.POINTERMOVE);			
		} 
		
		engine.runRenderLoop(function() { 
			fpsLabel.innerHTML = engine.getFps().toFixed() + " fps";
			if(scene.isReady() && !noRender) scene.render();
		});
	};   
}  
  
function importMesh(){   
	BABYLON.SceneLoader.Append( "../assets/portfolio/car_config/Binary2/", "amg.binary.babylon", scene, function () {
		
		scene.executeWhenReady(function () {
			car = scene.meshes[0];
			car.scaling = new BABYLON.Vector3(45,45,45);   
			 
			wheels.push(scene.meshes[2], scene.meshes[5], scene.meshes[3], scene.meshes[4]);
			doors.push(scene.meshes[15], scene.meshes[16], scene.meshes[21], scene.meshes[22]);
			set_animation([scene.meshes[15],scene.meshes[16], scene.meshes[21], scene.meshes[22]]);
			  
			if(!isMobile)
			{
				//NOS
				smoke();
				 
				//shadow
				var shadowGenerator = new BABYLON.ShadowGenerator(512, light);
				shadowGenerator.useBlurExponentialShadowMap = true;
				shadowGenerator.useKernelBlur = true; 
				shadowGenerator.blurKernel = 20;         
				
				for(var i=0; i<23; i++)   
				{   
					shadowGenerator.getShadowMap().renderList.push(scene.meshes[i]); 
				} 
				
				//metal
				var hdrTexture = new BABYLON.HDRCubeTexture("/assets/portfolio/car_config/res/txt.hdr", scene, 512);
				var metal = new BABYLON.PBRMaterial("metal", scene);
				metal.reflectionTexture = hdrTexture;
				metal.environmentIntensity = 2;
				metal.cameraExposure = 1;
				metal.cameraContrast = 1; 
				metal.reflectivityColor = new BABYLON.Color3(0.7, 0.0, 0.0);  
				metal.albedoColor = new BABYLON.Color3(0.0, 0.0, 0.0); 
				
				scene.materials[12] = metal; 
				scene.meshes[15].material.subMaterials[0] = metal;
				scene.meshes[16].material.subMaterials[0] = metal;
				scene.meshes[18].material.subMaterials[0] = metal;
				scene.meshes[19].material.subMaterials[0] = metal;
				scene.meshes[20].material.subMaterials[0] = metal;
				scene.meshes[21].material.subMaterials[0] = metal;
				scene.meshes[22].material.subMaterials[0] = metal;
				
				var metal2 = new BABYLON.PBRMaterial("metal", scene);
				metal2.reflectionTexture = hdrTexture;
				metal2.environmentIntensity = 3;
				metal2.cameraExposure = 1; 
				metal2.cameraContrast = 1; 
				metal2.reflectivityColor = new BABYLON.Color3(0.5, 0.5, 0.5);  
				metal2.albedoColor = new BABYLON.Color3(0.0, 0.0, 0.0); 
				
				scene.materials[26] = metal2; 
				scene.meshes[18].material.subMaterials[4] = metal2;
				scene.meshes[19].material.subMaterials[4] = metal2;
				scene.meshes[20].material.subMaterials[2] = metal2;
				scene.meshes[21].material.subMaterials[2] = metal2;
				scene.meshes[22].material.subMaterials[3] = metal2;
				
				var metal3 = new BABYLON.PBRMaterial("metal", scene);
				metal3.reflectionTexture = hdrTexture;
				metal3.environmentIntensity = 3;
				metal3.cameraExposure = 1; 
				metal3.cameraContrast = 1; 
				metal3.reflectivityColor = new BABYLON.Color3(1, 1, 1);  
				metal3.albedoColor = new BABYLON.Color3(0.0, 0.0, 0.0); 
				
				scene.materials[8] = metal3; 
				scene.meshes[8].material.subMaterials[0] = metal3; 
				scene.meshes[8].material.subMaterials[1] = metal3; 
				
				var metal4 = new BABYLON.PBRMaterial("metal3", scene);
				metal4.reflectionTexture = hdrTexture;
				metal4.alpha = 0.5; 
				metal4.environmentIntensity = 0.8;  
				metal4.reflectionColor = new BABYLON.Color3(0.9, 0.9, 0.9); 
				metal4.albedoColor = new BABYLON.Color3(0.0, 0.0, 0.0);
				metal4.reflectivityColor = new BABYLON.Color3(0.4, 0.4, 0.4);
				
				scene.materials[13] = metal4; 
				scene.materials[3] = metal4;  
				scene.materials[23] = metal4; 
				 
				scene.meshes[17].material = metal4; 
				scene.meshes[15].material.subMaterials[1] = metal4;
				scene.meshes[16].material.subMaterials[1] = metal4;
				
				var metal5 = new BABYLON.PBRMaterial("metal3", scene);
				metal5.reflectionTexture = hdrTexture;
				metal5.alpha = 0.5; 
				metal5.environmentIntensity = 0.8;  
				metal5.reflectionColor = new BABYLON.Color3(0.9, 0.9, 0.9); 
				metal5.albedoColor = new BABYLON.Color3(0.0, 0.0, 0.0);
				metal5.reflectivityColor = new BABYLON.Color3(0.4, 0.4, 0.4);
				scene.meshes[1].material.subMaterials[0] = metal5;
				
				var metal6 = new BABYLON.PBRMaterial("metal6", scene);
				metal6.reflectionTexture = hdrTexture;
				metal6.environmentIntensity = 0.02; 
				
				scene.materials[2] = metal6;
				scene.meshes[2].material.subMaterials[2] = metal6;
				scene.meshes[2].material.subMaterials[3] = metal6;
			}  
				
			DRIVEModeCameras[0].lockedTarget = car;  
			DRIVEModeCameras[1].lockedTarget = car;  
			DRIVEModeCameras[2].parent = car;   
			
			var ground = BABYLON.Mesh.CreatePlane("plane", 2000.0, scene);
			ground.rotation.x = Math.PI/2;       
			ground.position.y = -28.3; 
			ground.scaling.y = 0.25;  
			var groundMaterial = new BABYLON.StandardMaterial("ground", scene);
			groundMaterial.diffuseTexture = new BABYLON.Texture("/assets/portfolio/car_config/res/logo.png", scene);
			groundMaterial.diffuseTexture.hasAlpha = true;  		
			groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
			ground.material = groundMaterial; 
			ground.receiveShadows = true; 
			
			setKinematicAnimation();  
			    
			decalTextures.push( 
				new BABYLON.Texture("/assets/portfolio/car_config/res/image.png", scene),
				new BABYLON.Texture("/assets/portfolio/car_config/res/image (1).png", scene),
				new BABYLON.Texture("/assets/portfolio/car_config/res/image (2).png", scene),
				new BABYLON.Texture("/assets/portfolio/car_config/res/image (3).png", scene),
				new BABYLON.Texture("/assets/portfolio/car_config/res/image (4).png", scene),
				new BABYLON.Texture("/assets/portfolio/car_config/res/image (5).png", scene) 
			);
			
			setting_sounds();

			amg = new Car;
			  
			addGUI();  
			credits();
			 
			setTimeout(function(){ 
				document.getElementById("loadingScene").style.display = "none"; 
				document.getElementById("htmlUI").style.display = "block"; 
				enableEffect = true; noRender = false;
			}, 2000);    
		}); 
	});   
}     

$(".ui").click(function(){
	$("#htmlUI").css("display",($("#htmlUI").is(':visible'))?"none":"block");
	if(UI) UI.rootContainer.isVisible = !UI.rootContainer.isVisible;
})

//ADD DECAL
function addDecal(){
	var decalMaterial = new BABYLON.StandardMaterial("decalMat", scene);      
	decalMaterial.diffuseTexture = decalTextures[0];
	decalMaterial.backFaceCulling = true;
	decalMaterial.diffuseTexture.hasAlpha = true;
	decalMaterial.zOffset = -1.5; 
	
	decal = BABYLON.MeshBuilder.CreateDecal("decal", doors[3], {position: new BABYLON.Vector3(0, 15, -63), normal: new BABYLON.Vector3(0, 1, -0.081), size: new BABYLON.Vector3(50, 50, 50)});     
	decal.parent = doors[3];   
	decal.isVisible = false;	   
	decal.rotation.x = 1.46;  
	decal.position = new BABYLON.Vector3(0, 0.115, -1.15); 
	decal.scaling = new BABYLON.Vector3(0.023,0.023,0.023); 
	decal.material = decalMaterial;  
}

// ADD GUI AND FUNCTIONALITY   
function addGUI(){   
	UI = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
	if(isMobile){   
		if(window.innerWidth>window.innerHeight)
			UI.idealWidth = 1062;  
		else
			UI.idealWidth = 700;     
	}    
	var mainBlock = new BABYLON.GUI.Rectangle();
	elem_setting(0, mainBlock);
	UI.addControl(mainBlock);
	
	var button1 = BABYLON.GUI.Button.CreateSimpleButton("but1", "Free Mode");
	elem_setting(1, button1);
	elem_setting(2, button1);
	
    button1.onPointerUpObservable.add(function() {
        setting_mode(mod.FREE);
	    button1.background = "purple"; 
		button2.background = "maroon"; 
		button3.background = "maroon"; 
    });
    mainBlock.addControl(button1);  
	 
	var button2 = BABYLON.GUI.Button.CreateSimpleButton("but2", "Drive Mode");
    elem_setting(1, button2);
    elem_setting(3, button2);
	
    button2.onPointerUpObservable.add(function() {
		setting_mode(mod.DRIVE);
		button1.background = "maroon"; 
		button2.background = "purple"; 
		button3.background = "maroon"; 
    });
    mainBlock.addControl(button2);   
	
	var button3 = BABYLON.GUI.Button.CreateSimpleButton("but3", "Kinematic Mode");
    elem_setting(1, button3);
    elem_setting(4, button3);
	
    button3.onPointerUpObservable.add(function() {
		setting_mode(mod.KINEMATIC);
		button1.background = "maroon"; 
		button2.background = "maroon"; 
		button3.background = "purple"; 
    });
    mainBlock.addControl(button3);  
	
	
	var infoPanel = new BABYLON.GUI.Rectangle();
	elem_setting(0, infoPanel);
	elem_setting(6, infoPanel); 
    mainBlock.addControl(infoPanel);
	
	var header1 = new BABYLON.GUI.TextBlock();  
    header1.text = "? - In FreeMode you can interact with the car, and you can customise it too.";
    header1.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
	elem_setting(7, header1); 
    infoPanel.addControl(header1); 

	var header2 = new BABYLON.GUI.TextBlock();    
    header2.text = "? - In DriveMode use arrow keys to drive and press C to change camera.";
	header2.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
	elem_setting(7, header2); 
    infoPanel.addControl(header2);
	 
	var header3 = new BABYLON.GUI.TextBlock();  
    header3.text = "? - In KinematicMode you can save images with your car by pressing P.";
	header3.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
	elem_setting(7, header3);
    infoPanel.addControl(header3);

	
	var infoPanel2 = new BABYLON.GUI.Rectangle();
	elem_setting(0, infoPanel2);
	elem_setting(8, infoPanel2);
    mainBlock.addControl(infoPanel2);
	
	var header4 = new BABYLON.GUI.TextBlock();  
    header4.text = "Choose color:"; 
	header4.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
	elem_setting(7, header4); 
    infoPanel2.addControl(header4);

	var button5 = BABYLON.GUI.Button.CreateSimpleButton("but5", "Exterior2");
    elem_setting(1, button5);
    elem_setting(10, button5);
	
    button5.onPointerUpObservable.add(function() {  
		buttonColor = 2;
		buton_back(button5);
    }); 
    infoPanel2.addControl(button5);  

	var button6 = BABYLON.GUI.Button.CreateSimpleButton("but6", "Exterior1");
    elem_setting(1, button6);
	elem_setting(9, button6);
	button6.left = "30px";
	button6.background = "purple"; 
	
    button6.onPointerUpObservable.add(function() {
		buttonColor = 1; 
		buton_back(button6);
    });
    infoPanel2.addControl(button6);  	
	
	var button7 = BABYLON.GUI.Button.CreateSimpleButton("but7", "Interior1");
    elem_setting(1, button7); 
	elem_setting(9, button7);
	button7.left = "30px";	button7.top = "40px";
	
    button7.onPointerUpObservable.add(function() {
		buttonColor = 3;
		buton_back(button7); 
    });
    infoPanel2.addControl(button7);
	
	var button8 = BABYLON.GUI.Button.CreateSimpleButton("but8", "Interior2");
    elem_setting(1, button8);
	elem_setting(10, button8);
	button8.top = "40px";
          
    button8.onPointerUpObservable.add(function() {  
		buttonColor = 4;
		buton_back(button8); 
    });
    infoPanel2.addControl(button8);
	
	var button9 = BABYLON.GUI.Button.CreateSimpleButton("but9", "Glass");
    elem_setting(1, button9);
	elem_setting(10, button9);
	button9.top = "80px";
	
    button9.onPointerUpObservable.add(function() {  
		buttonColor = 5;
		buton_back(button9); 
    });
    infoPanel2.addControl(button9);
	
	var button10 = BABYLON.GUI.Button.CreateSimpleButton("but10", "Lights");
    elem_setting(1, button10);
	elem_setting(10, button10);
	button10.top = "120px";
	
    button10.onPointerUpObservable.add(function() {  
		buttonColor = 6;
		buton_back(button10);
    });
    infoPanel2.addControl(button10); 
	
	var button15 = BABYLON.GUI.Button.CreateSimpleButton("but15", "Rims");
    elem_setting(1, button15);
	elem_setting(9, button15);
	button15.left = "30px";	button15.top = "80px";    
	
    button15.onPointerUpObservable.add(function() {
		buttonColor = 7;
		buton_back(button15); 
    });   
    infoPanel2.addControl(button15);
	
	var button14 = BABYLON.GUI.Button.CreateSimpleButton("but14", "Decal");  
    elem_setting(1, button14);
	elem_setting(9, button14);
	button14.left = "30px";	button14.top = "120px";
	
    button14.onPointerUpObservable.add(function() {
		buttonColor = 8;
		buton_back(button14); 
    });
    infoPanel2.addControl(button14);
	
	picker = new BABYLON.GUI.ColorPicker();
	if(!isMobile)
		picker.value = scene.materials[12].reflectivityColor;
	else
		picker.value = scene.materials[12].diffuseColor;
    elem_setting(11, picker);
	   
    picker.onValueChangedObservable.add(function(value) { 
		if(actualMod != mod.FREE) return;
        switch (buttonColor){
			case 1: 
				if(!isMobile)
					scene.materials[12].reflectivityColor = value.clone();
				else
					scene.materials[12].diffuseColor = value.clone();
				break;  
			case 2: 
				if(!isMobile)
					scene.materials[26].reflectivityColor = value.clone();
				else
					scene.materials[26].diffuseColor = value.clone();
				break;	
			case 3:     
				scene.materials[17].diffuseColor = value.clone();
				break;	
			case 4: 
				scene.materials[18].diffuseColor = value.clone();
				scene.materials[19].diffuseColor = value.clone();
				break; 
			case 5:  
				if(!isMobile)
					scene.materials[13].reflectivityColor = value.clone();
				else
					scene.materials[13].diffuseColor = value.clone();
				break;  
			case 6:           
				scene.materials[3].diffuseColor = value.clone(); 
				scene.materials[23].diffuseColor = value.clone();
				if(!isMobile)
					scene.materials[8].reflectivityColor = value.clone();
				else
					scene.materials[8].diffuseColor = value.clone();
				break;	
			case 7:  
				if(!isMobile)
					scene.materials[2].reflectionColor = value.clone();
				else
					scene.materials[2].diffuseColor = value.clone();
				break;  
			case 8:
				decal.material.diffuseColor = value.clone(); 
				break;	 
		}   
    });    
    infoPanel2.addControl(picker);   
	 
	var header5 = new BABYLON.GUI.TextBlock();
    header5.text = "Decals:";
    header5.top = "335px";   
    header5.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP; 
    elem_setting(7, header5); 
    mainBlock.addControl(header5); 
	
    var slider = new BABYLON.GUI.Slider();
    elem_setting(16, slider);    
	
	slider.onValueChangedObservable.add(function(value) {
		if(actualDecal == Math.round(parseInt(value))) return;
		if(decal == null) return;
		
		actualDecal = Math.round(parseInt(value)); 
		decal.isVisible = true;
		
		switch (Math.round(parseInt(value))){
			case 0:
				decal.isVisible = false;
				break;
			case 1:
				decal.material.diffuseTexture = decalTextures[0];
				break; 
			case 2: 
				decal.material.diffuseTexture = decalTextures[1];
				break;
			case 3: 
				decal.material.diffuseTexture = decalTextures[2];
				break;
			case 4: 
				decal.material.diffuseTexture = decalTextures[3];
				break;
			case 5: 
				decal.material.diffuseTexture = decalTextures[4];
				break;
			case 6: 
				decal.material.diffuseTexture = decalTextures[5];  
				break; 
		}
		decal.material.diffuseTexture.hasAlpha = true; 
	});   
    mainBlock.addControl(slider);  
	
	var button4 = BABYLON.GUI.Button.CreateSimpleButton("but4", "Enter FullScreen");
	elem_setting(1, button4);
    elem_setting(5, button4);

    button4.onPointerUpObservable.add(function() {
		toggleFullScreen();
		if(window.innerWidth>window.innerHeight)
			UI.idealWidth = 1062;  
		else
			UI.idealWidth = 700;  
        if(IsFullScreenCurrently()){ 
		    button4.children[0].text = "Enter FullScreen";
			button4.background = "maroon"; 
	    }else{ 
			
		    button4.children[0].text = "Exit FullScreen";
			button4.background = "purple"; 
		}
    });    
    mainBlock.addControl(button4);
	
	var button11 = BABYLON.GUI.Button.CreateSimpleButton("but11", "C");
    elem_setting(1, button11);
    elem_setting(12, button11);
	
    button11.onPointerUpObservable.add(function() {  
		if(actualMod != mod.DRIVE) return;   
		
		if(driveCamIndex == 2) driveCamIndex = 0; 
		else driveCamIndex++; 
  		 
		car.parent.position = BABYLON.Vector3.Zero();  
		car.parent.rotation = BABYLON.Vector3.Zero(); 
		scene.activeCamera = DRIVEModeCameras[driveCamIndex];    
    });
    mainBlock.addControl(button11);     
	
	var button12 = BABYLON.GUI.Button.CreateSimpleButton("but12", "P");
    elem_setting(1, button12);
    elem_setting(13, button12);
		
    button12.onPointerUpObservable.add(function() {  
		if(actualMod != mod.KINEMATIC) return;
		printScreen();
    });
    mainBlock.addControl(button12);  
	
	colorButons.push(button5,button6,button7,button8,button9,button10,button14,button15);
	
	if(isMobile){
		UIMob = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
		UIMob.idealWidth = 600;             
		UIMob.idealHeight = 600;   
		UIMob.renderAtIdealSize = true; 
		UIMob._rootContainer.isVisible = false;  
		 
		var mainBlock = new BABYLON.GUI.Rectangle();
		elem_setting(15,mainBlock);  
		UIMob.addControl(mainBlock); 

		
		var button = BABYLON.GUI.Button.CreateImageOnlyButton("but", "/assets/portfolio/car_config/res/arrowKeys_up.png");
		elem_setting(14, button); 
		button.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
		button.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
		      
		button.onPointerMoveObservable.add(function() {  
			Control.moveLeft = false;   
			Control.moveRight = false;
			Control.moveBackward = true; 
			Control.moveForward = false;     
		});
		mainBlock.addControl(button); 
		
		
		var button = BABYLON.GUI.Button.CreateImageOnlyButton("but", "/assets/portfolio/car_config/res/arrowKeys_left.png");
		elem_setting(14, button);
		button.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
		button.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
		
		button.onPointerMoveObservable.add(function() {  
			Control.moveLeft = true;
			Control.moveRight = false;
			Control.moveBackward = false;
			Control.moveForward = false; 
		});
		mainBlock.addControl(button);  
		
		
		var button = BABYLON.GUI.Button.CreateImageOnlyButton("but", "/assets/portfolio/car_config/res/arrowKeys_right.png");
		elem_setting(14, button);
		button.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
		button.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
		
		button.onPointerMoveObservable.add(function() {  
			Control.moveLeft = false;
			Control.moveRight = true;
			Control.moveBackward = false;
			Control.moveForward = false; 
		});
		mainBlock.addControl(button);   
		
		
		var button = BABYLON.GUI.Button.CreateImageOnlyButton("but", "/assets/portfolio/car_config/res/arrowKeys_down.png");
		elem_setting(14, button);         
		button.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER; 
		button.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM; 
		
		button.onPointerMoveObservable.add(function() {  
			Control.moveLeft = false;
			Control.moveRight = false; 
			Control.moveBackward = false;   
			Control.moveForward = true; 
		});
		mainBlock.addControl(button);
	}
}

// BACKGROUND BUTTONS
function buton_back(buton){
	for(var i=0;i<colorButons.length;i++){
		if(colorButons[i] == buton)
			colorButons[i].background = "purple";
		else  
			colorButons[i].background = "maroon";
	}
}
   
// MODS SETTING
function setting_mode(newMod){
	enableEffect = true; 
	kinematicMusic.stop();
	scene.fogDensity = 0.01; 
	actualMod = newMod;   
	driveCamIndex = 0;
	textADT.vOffset = 0.7; 
	startCredits = false;  
	creditsText.isVisible = false; 
	scene.stopAnimation(KINEMATICModeCamera);
	for(var i=0;i<doors.length;i++){
		scene.stopAnimation(doors[i]);
		doors[i].rotation = BABYLON.Vector3.Zero();
	}  
	openLdoor = false;openRdoor = false;openBags = false;openHood = false;
			
	car.parent.position = BABYLON.Vector3.Zero();  
	car.parent.rotation = BABYLON.Vector3.Zero();    
	if(UIMob!=null) UIMob._rootContainer.isVisible = false;  
	
	switch(newMod){   
		case 1:
			carHorn.play();
			FREEModeCamera.alpha = 0;
			FREEModeCamera.beta = 0;
			FREEModeCamera.radius = 0;
			FREEModeCamera.setPosition(new BABYLON.Vector3(-175, 50, -205));
		   
			scene.activeCamera = FREEModeCamera;  
			scene.activeCamera.attachControl(canvas, false);   		
			break;
		case 2: 
			carStart.play();
			 
			if(UIMob!=null) UIMob._rootContainer.isVisible = true;
			amg.carOrientation = 0;   
			amg.wheelOrientation = 0;   
			DRIVEModeCameras[driveCamIndex].position = new BABYLON.Vector3(-175, 50, -205); 
			DRIVEModeCameras[driveCamIndex].rotation = BABYLON.Vector3.Zero();
			 
			scene.activeCamera.detachControl(canvas);     
			scene.activeCamera = DRIVEModeCameras[driveCamIndex];    
			break;    
		case 3: 
			kinematicMusic.play(); 
			
			KINEMATICModeCamera.position = new BABYLON.Vector3(-175, 50, -205); 
			KINEMATICModeCamera.rotation = BABYLON.Vector3.Zero();	
			KINEMATICModeCamera.lockedTarget = car;    
			     
			scene.activeCamera.detachControl(canvas);   
			scene.activeCamera = KINEMATICModeCamera;  
			    
			scene.beginAnimation(KINEMATICModeCamera, 0, 700, false, 0.5);
			break; 
	}  
}

// ADD NOS FROM PARTICLE
function smoke(){
	
	var mesh1 = new BABYLON.Mesh("box1", scene);
	mesh1.parent = car; 
	mesh1.position = new BABYLON.Vector3(0.55, -0.3, 2.2);      
	mesh1.scaling = new BABYLON.Vector3(0.02, 0.02, 0.02);        
	 
	var smokeSystem = new BABYLON.ParticleSystem("particles", 200, scene); 
	smokeSystem.particleTexture = new BABYLON.Texture("/assets/portfolio/car_config/res/image.png", scene);
	smokeSystem.emitter = mesh1; // the starting object, the emitter
    smokeSystem.minEmitBox = new BABYLON.Vector3(-1, 1, -1); // Starting all from
    smokeSystem.maxEmitBox = new BABYLON.Vector3(1, 1, 1); // To...
	
	smokeSystem.color1 = new BABYLON.Color4(1, 1, 0, 1.0);
    smokeSystem.color2 = new BABYLON.Color4(0, 0, 1, 1.0);
    smokeSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0.0);   

	smokeSystem.minSize = 0.1; 
    smokeSystem.maxSize = 2;   
 
    smokeSystem.minLifeTime = 0.1;
    smokeSystem.maxLifeTime = 0.3;

    smokeSystem.emitRate = 200;  

    // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
    smokeSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

    smokeSystem.gravity = new BABYLON.Vector3(0, 9, 0);
    smokeSystem.direction1 = new BABYLON.Vector3(0, 0, 8);
    smokeSystem.direction2 = new BABYLON.Vector3(0, 0, 8);

    smokeSystem.minAngularSpeed = 0; 
	smokeSystem.maxAngularSpeed = Math.PI/2; 

    smokeSystem.minEmitPower = 0.1;
    smokeSystem.maxEmitPower = 0.5; 
    smokeSystem.updateSpeed = 0.05;  
 
    smokeSystem.start();
	
	var mesh2 = new BABYLON.Mesh("box1", scene);
	
	mesh2.parent = car; 
	mesh2.position = new BABYLON.Vector3(-0.55, -0.3, 2.2);         
	mesh2.scaling = new BABYLON.Vector3(0.02, 0.02, 0.02);
	   
	var smokeSystem2 = new BABYLON.ParticleSystem("particles", 200, scene); 
	smokeSystem2.particleTexture = new BABYLON.Texture("/assets/portfolio/car_config/res/image.png", scene);
	smokeSystem2.emitter = mesh2; // the starting object, the emitter
    smokeSystem2.minEmitBox = new BABYLON.Vector3(-1, 1, -1); // Starting all from
    smokeSystem2.maxEmitBox = new BABYLON.Vector3(1, 1, 1); // To...
	
	smokeSystem2.color1 = new BABYLON.Color4(1, 1, 0, 1.0);
    smokeSystem2.color2 = new BABYLON.Color4(0, 0, 1, 1.0);
    smokeSystem2.colorDead = new BABYLON.Color4(0, 0, 0, 0.0);     
	 
	smokeSystem2.minSize = 0.1; 
    smokeSystem2.maxSize = 2;   

    smokeSystem2.minLifeTime = 0.1;
    smokeSystem2.maxLifeTime = 0.3;

    smokeSystem2.emitRate = 200;  

    // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
    smokeSystem2.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

    smokeSystem2.gravity = new BABYLON.Vector3(0, 9, 0);
    smokeSystem2.direction1 = new BABYLON.Vector3(0, 0, 8);
    smokeSystem2.direction2 = new BABYLON.Vector3(0, 0, 8);

    smokeSystem2.minAngularSpeed = 0; 
	smokeSystem2.maxAngularSpeed = Math.PI/2; 

    smokeSystem2.minEmitPower = 0.1;
    smokeSystem2.maxEmitPower = 0.5;
    smokeSystem2.updateSpeed = 0.05; 

    smokeSystem2.start();
}

// ADD SOUNDS AND FUNCTIONALITY
function setting_sounds(){
	carStart = new BABYLON.Sound("carStart", "/assets/portfolio/car_config/res/CarStart.mp3", scene);
	carHorn = new BABYLON.Sound("carHorn", "/assets/portfolio/car_config/res/CarHorn.mp3", scene);
	carStart.setVolume(0.3);
	carHorn.setVolume(0.3);     
	kinematicMusic = new BABYLON.Sound("kinematicMusic", "/assets/portfolio/car_config/res/Nintendo.mp3", scene, null, { loop: true });
	kinematicMusic.setVolume(0.1);      
}   

// ADD LIGHTS AND FUNCTIONALITY
function setting_lights(){
	
	light = new BABYLON.DirectionalLight("Dir0", new BABYLON.Vector3(0, -1, 0), scene);
	light.diffuse = new BABYLON.Color3(1, 1, 1);
	light.specular = new BABYLON.Color3(1, 1, 1);   

	ambientLight = new BABYLON.HemisphericLight("Hemi0", new BABYLON.Vector3(0, 1, 0), scene);
	ambientLight.diffuse = new BABYLON.Color3(0.5, 0.5, 0.5);
	ambientLight.specular = new BABYLON.Color3(0, 0, 0); 
	ambientLight.groundColor = new BABYLON.Color3(1, 1, 1);
}

// ADD CAMERAS AND FUNCTIONALITY
function setting_cameras(){
	 
	FREEModeCamera = new BABYLON.ArcRotateCamera("ArcRotateCamera", 0, 0, 0, new BABYLON.Vector3(0,10,0), scene);
	FREEModeCamera.setPosition(new BABYLON.Vector3(-175, 50, -205));
	FREEModeCamera.upperBetaLimit = Math.PI/2; 
	FREEModeCamera.lowerBetaLimit = -Math.PI/18; 
	FREEModeCamera.lowerRadiusLimit = 140;  
	FREEModeCamera.upperRadiusLimit = 400;
	FREEModeCamera.panningSensibility = 0;	

	scene.activeCamera = FREEModeCamera;   
	scene.activeCamera.attachControl(canvas, false);  
	 
	var cam1 =  new BABYLON.FreeCamera("Cam_amg",new BABYLON.Vector3(-175, 50, -205),scene);
	cam1.rotation = BABYLON.Vector3.Zero(); 
		
	var cam2 = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 50, -50), scene);
	cam2.radius = 220;     
	cam2.heightOffset = 70;     
	cam2.cameraAcceleration = 0.05  
	
	var cam3 =  new BABYLON.FreeCamera("Cam_amg",new BABYLON.Vector3(0.43, 0.45, 0.4),scene);
	cam3.rotation = new BABYLON.Vector3(0.15, Math.PI, 0);     
	cam3.minZ = 0;
	    
	DRIVEModeCameras.push(cam1, cam2, cam3);    
	
	KINEMATICModeCamera = new BABYLON.FreeCamera("KINEMATICModeCamera",new BABYLON.Vector3(-175, 50, -205),scene);
	KINEMATICModeCamera.rotation = BABYLON.Vector3.Zero();  
} 

// KINEMATIC ANIMATION SET
function setKinematicAnimation(){
	var animationCam = new BABYLON.Animation("Cinematique_Part01", "position", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
	var a = [];
	a.push({ 
		frame : 0,
		value : new BABYLON.Vector3(-175, 50, -205) 
	}),
	a.push({
		frame : 60,
		value : new BABYLON.Vector3(-50, 15, -150) 
	}), 
	a.push({
		frame : 120, 
		value : new BABYLON.Vector3(-155, 80, 205)
	}),
	a.push({ 
		frame : 180,
		value : new BABYLON.Vector3(0, 400, 500) 
	}),
	a.push({
		frame : 240, 
		value : new BABYLON.Vector3(50, 15, 20)      
	}),  
	a.push({
		frame : 300,   
		value : new BABYLON.Vector3(-20, 10, 25)      
	}),  
	a.push({    
		frame : 360,  
		value : new BABYLON.Vector3(400, 50, 0) 
	}),
	a.push({
		frame : 420,
		value : new BABYLON.Vector3(0, 500, -205)
	}), 
	a.push({
		frame : 560, 
		value : new BABYLON.Vector3(0, 1000, -1200)       
	}),   
	a.push({ 
		frame : 700,  
		value : new BABYLON.Vector3(-175, 50, -205) 
	}),
	animationCam.setKeys(a);
	
	var qe = new BABYLON.QuadraticEase;
	qe.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
	animationCam.setEasingFunction(qe); 
	 
	var anim1 = new BABYLON.AnimationEvent(140, function () {
				scene.beginAnimation(doors[1], 0, 50, false);  
				scene.beginAnimation(doors[0], 0, 50, false);  
			}, false);
	animationCam.addEvent(anim1);
	 
	var anim2 = new BABYLON.AnimationEvent(450, function () {  
				scene.beginAnimation(doors[1], 50, 100, false);  
				scene.beginAnimation(doors[0], 50, 100, false);  
			}, false);     
	animationCam.addEvent(anim2)	
	 
	var credits = new BABYLON.AnimationEvent(685, function () { 
				startCredits = true;   		
			}, false);        
	animationCam.addEvent(credits)
	
	KINEMATICModeCamera.animations.push(animationCam);

} 

// ADD CREDITS TEXT
function credits(){  

	creditsText = BABYLON.Mesh.CreatePlane("plane", 50.0, scene);
    creditsText.position = new BABYLON.Vector3(-147.5, 50, -173.5);                     
    creditsText.scaling.x = 0.5;   
    creditsText.billboardMode = 2;    
	creditsText.isVisible = false;  
	 
    textADT = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(creditsText);
    var text1 = new BABYLON.GUI.TextBlock("Credits");
    text1.text = "Credits: \n\n" +     
				 "Author: Marian Gaje \n" +  
				 "3D artist: Loredana Zavalszki \n" + 
				 "Produced by: SmarTeam3D.com \n" +   
				 "Language: Javascript \n" +   
				 "Car model: Mercedes Benz SLS \n" +
				 "Model source:  https://free3d.com/3d-model/mercedes-benz-sls-53003.html \n" +
				 "Car Controller Script: http://www.visualiser.fr/Babylon/Drift/default.html \n" +
				 "Everything was possible with: \n BabylonJS - https://www.babylonjs.com \n" +
				 "\n Thanks for watching!"   

    text1.width = 1; 
    text1.height = 4; 
    text1.color = "black";
    text1.fontSize = 36;
    text1.fontFamily = "Georgia";
    text1.textWrapping = true;
        
    text1._scaleY = .6;    
    textADT.addControl(text1);  
    textADT.vOffset = .7;  
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

// GUI ELEMENTS SETTING
function elem_setting(index, UIelem){
	switch (index){
		case 0:
			UIelem.width = '30%';
			UIelem.height = '420px';    
			UIelem.top = '15px';   
			UIelem.left = '15px';   
			UIelem.thickness = 2; 
			UIelem.color = 'white'; 
			UIelem.background = 'transparent';
			UIelem.cornerRadius = 10;
			UIelem.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
			UIelem.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
			break;
		case 1:
			UIelem.width = 0.3;
			UIelem.fontSize = "15px";
			UIelem.height = "40px";
			UIelem.color = "white"; 
			UIelem.cornerRadius = 10;
			UIelem.thickness = 2;  
			UIelem.background = "maroon";
			break;
		case 2:
			UIelem.background = "purple"; 
			UIelem.top = '5px';
			UIelem.left = '5px';
			UIelem.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
			UIelem.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
			break;
		case 3:
			UIelem.top = '5px';
			UIelem.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
			UIelem.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
			break;
		case 4:
			UIelem.top = '5px';
			UIelem.left = '-5px';
			UIelem.background = "maroon";
			UIelem.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
			UIelem.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP; 
			break;
		case 5:
			UIelem.top = '-5px';
			UIelem.width = 0.5;
			UIelem.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
			UIelem.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM; 
			break;
		case 6:
			UIelem.height = "120px";     
			UIelem.width = "95%";    
			UIelem.top = "50px";
			UIelem.left = "3%"; 
			UIelem.fontSize = "14px";
			UIelem.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
			break;
		case 7:
			UIelem.height = "40px"; 
			UIelem.fontSize = "16px"; 
			UIelem.paddingLeft = "10px";  
			UIelem.color = "maroon";
			UIelem.textWrapping = true;
			UIelem.textHorizontalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_LEFT;
			break;
		case 8:
			UIelem.height = "162px";      
			UIelem.width = "95%";    
			UIelem.top = "178px";    
			UIelem.left = "3%";
			UIelem.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
			break;
		case 9:
			UIelem.width = "25%";
			UIelem.height = "38px";
			UIelem.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
			break;
		case 10:
			UIelem.width = "25%";
			UIelem.height = "38px";
			UIelem.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
			UIelem.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
			break;
		case 11:
			UIelem.height = "110px";
			UIelem.width = "110px";
			UIelem.top = "13px";
			UIelem.left = "10px";
			UIelem.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
			break;
		case 12:
			UIelem.width = "20%";
			UIelem.left = "5px";
			UIelem.top = "-5px";
			UIelem.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
			UIelem.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
			break;
		case 13:
			UIelem.width = "20%";
			UIelem.left = "-5px"; 
			UIelem.top = "-5px";
			UIelem.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
			UIelem.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
			break;
		case 14:
			UIelem.width = 0.33;
			UIelem.height = 0.5;
			UIelem.thickness = 0; 
			break;
		case 15:
			UIelem.width = '150px';
			UIelem.height = '120px';          
			UIelem.top = '-5%';    
			UIelem.left = '-5%';
			UIelem.thickness = 0; 
			UIelem.background = 'transparent';
			UIelem.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
			UIelem.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
			break; 
		case 16:
			UIelem.minimum = 0;
			UIelem.maximum = 6;  
			UIelem.color = "maroon";
			UIelem.value = 0; 
			UIelem.height = "20px";
			UIelem.top = "148px";
			UIelem.left = "2px";   
			UIelem.width = "76%"; 
			UIelem.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
			break;
	}
}

// PRINTSCREEN Function
function printScreen(){
	UI._rootContainer.isVisible = false;  	
	scene.render();        
	BABYLON.Tools.CreateScreenshot(engine, scene.activeCamera, {precision: 1});
	UI._rootContainer.isVisible = true;    
}   

//////*****	ENTER FULLSCREEN FUNCTIONS *****\\\\\

function toggleFullScreen(buton) {
	if(IsFullScreenCurrently())
		GoOutFullscreen();
	else	
		GoInFullscreen(); 
}	

function GoInFullscreen() {
	if(canvas.requestFullscreen)
		canvas.requestFullscreen();
	else if(canvas.mozRequestFullScreen)
		canvas.mozRequestFullScreen();
	else if(canvas.webkitRequestFullscreen)
		canvas.webkitRequestFullscreen();
	else if(canvas)
		canvas.msRequestFullscreen();
}

function GoOutFullscreen() {
	if(document.exitFullscreen)
		document.exitFullscreen();
	else if(document.mozCancelFullScreen)
		document.mozCancelFullScreen();
	else if(document.webkitExitFullscreen)
		document.webkitExitFullscreen();
	else if(document.msExitFullscreen)
		document.msExitFullscreen();
}

function IsFullScreenCurrently() {
	return (document.fullscreen || document.webkitIsFullScreen || document.mozFullScreen);
}
//////*****	EXIT FULLSCREEN FUNCTIONS *****\\\\\

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

function orientationChange() { 
	if(isMobile && UI != null){  
		if(window.innerWidth>window.innerHeight)
			UI.idealWidth = 700;  
		else 
			UI.idealWidth = 1062;  
	} 
}

// EVENT-URI
window.onorientationchange = orientationChange;
window.addEventListener("resize", function() { engine.resize();});
window.addEventListener( "contextmenu", function(e) {e.preventDefault();}, false);
document.addEventListener("keydown", function (e) {return control.keyDown(e.keyCode);});
document.addEventListener("keyup", function (e) {return control.keyUp(e.keyCode);});  
 