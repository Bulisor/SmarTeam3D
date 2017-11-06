var Car = function () {
	this.car_m = null,
	this.wfl = null,
	this.wfr = null,
	this.wbl = null,
	this.wbr = null,
	this.car = null,
	this.frontLeftWheelMesh = null,
	this.frontRightWheelMesh = null,
	this.backLeftWheelMesh = null,
	this.backRightWheelMesh = null,
	this.wheelDiameter = 10, 
	this.modelScale = 1,
	this.speed = 0,
	this.acceleration = 0,
	this.wheelOrientation = 0,
	this.carOrientation = 0,
	this.MAX_SPEED = 200,
	this.MAX_REVERSE_SPEED = -200,
	this.MAX_WHEEL_ROTATION = .40, 
	this.FRONT_ACCELERATION = 100,  
	this.BACK_ACCELERATION = 100,
	this.WHEEL_ANGULAR_ACCELERATION = 0.5,
	this.FRONT_DECCELERATION = 100,   
	this.WHEEL_ANGULAR_DECCELERATION = 0.5,   
	this.STEERING_RADIUS_RATIO = .01, 
	this.MAX_TILT_SIDES = .03, 
	this.MAX_TILT_FRONTBACK = .018,  
	Car.prototype.updateCar = function (a) {
		if (Control.moveForward && (this.speed = this.clamp(this.speed + a * this.FRONT_ACCELERATION, this.MAX_REVERSE_SPEED, this.MAX_SPEED), this.acceleration = this.clamp(this.acceleration + a, -1, 1)), Control.moveBackward && (this.speed = this.clamp(this.speed - a * this.BACK_ACCELERATION, this.MAX_REVERSE_SPEED, this.MAX_SPEED), this.acceleration = this.clamp(this.acceleration - a, -1, 1)), Control.moveLeft && (this.wheelOrientation = this.clamp(this.wheelOrientation + a * this.WHEEL_ANGULAR_ACCELERATION, -this.MAX_WHEEL_ROTATION, this.MAX_WHEEL_ROTATION)), Control.moveRight && (this.wheelOrientation = this.clamp(this.wheelOrientation - a * this.WHEEL_ANGULAR_ACCELERATION, -this.MAX_WHEEL_ROTATION, this.MAX_WHEEL_ROTATION)), !Control.moveForward && !Control.moveBackward)
			if (this.speed > 0) { 
				var b = this.exponentialEaseOut(this.speed / this.MAX_SPEED);
				this.speed = this.clamp(this.speed - b * a * this.FRONT_DECCELERATION, 0, this.MAX_SPEED),
				this.acceleration = this.clamp(this.acceleration - b * a, 0, 1)
			} else {
				var b = this.exponentialEaseOut(this.speed / this.MAX_REVERSE_SPEED);
				this.speed = this.clamp(this.speed + b * a * this.BACK_ACCELERATION, this.MAX_REVERSE_SPEED, 0),
				this.acceleration = this.clamp(this.acceleration + b * a, -1, 0)
			}
		Control.moveLeft || Control.moveRight || (this.wheelOrientation > 0 ? this.wheelOrientation = this.clamp(this.wheelOrientation - a * this.WHEEL_ANGULAR_DECCELERATION, 0, this.MAX_WHEEL_ROTATION) : this.wheelOrientation = this.clamp(this.wheelOrientation + a * this.WHEEL_ANGULAR_DECCELERATION, -this.MAX_WHEEL_ROTATION, 0));
		var c = this.speed * a;
		this.carOrientation -= c * this.STEERING_RADIUS_RATIO * this.wheelOrientation,
		this.car.position.x += Math.sin(this.carOrientation) * c,
		this.car.position.z += Math.cos(this.carOrientation) * c,
		this.car.rotation.y = this.carOrientation,
		this.car.rotation.z = this.MAX_TILT_SIDES * this.wheelOrientation * (this.speed / this.MAX_SPEED),
		this.car.rotation.x = -this.MAX_TILT_FRONTBACK * this.acceleration;
		var d = 1 / (this.modelScale * (2 * this.wheelDiameter)),
		e = c * d;
		this.frontLeftWheelMesh.rotation.x += e,
		this.frontRightWheelMesh.rotation.x += e,
		this.backLeftWheelMesh.rotation.x += e,
		this.backRightWheelMesh.rotation.x += e,
		this.frontLeftWheelMesh.rotation.y = this.wheelOrientation,
		this.frontRightWheelMesh.rotation.y = this.wheelOrientation
	},
	Car.prototype.clamp = function (a, b, c) {
		return a < b ? b : a > c ? c : a
	},
	Car.prototype.quadraticEaseOut = function (a) {
		return -a * (a - 2)
	},
	Car.prototype.cubicEaseOut = function (a) {
		return --a * a * a + 1
	},
	Car.prototype.circularEaseOut = function (a) {
		return Math.sqrt(1 - --a * a)
	},
	Car.prototype.sinusoidalEaseOut = function (a) {
		return Math.sin(a * Math.PI / 2)
	},
	Car.prototype.exponentialEaseOut = function (a) {
		return 1 === a ? 1 : -Math.pow(2, -10 * a) + 1
	},
	Car.prototype.setUpCar = function () {
		this.car_m = scene.getMeshByName("amg"),
		this.wfl = wheels[0],
		this.wfr = wheels[1],
		this.wbl = wheels[2], 
		this.wbr = wheels[3],
		this.car = new BABYLON.Mesh("box1", scene),  
		this.frontLeftWheelMesh = new BABYLON.Mesh("box2", scene),
		this.frontRightWheelMesh = new BABYLON.Mesh("box2", scene),
		this.backLeftWheelMesh = new BABYLON.Mesh("box2", scene),
		this.backRightWheelMesh = new BABYLON.Mesh("box2", scene),  
		this.frontLeftWheelMesh.position = this.wfl.position,
		this.frontRightWheelMesh.position = this.wfr.position,
		this.backLeftWheelMesh.position = this.wbl.position,
		this.backRightWheelMesh.position = this.wbr.position, 
		this.frontLeftWheelMesh.parent = this.car, 
		this.frontRightWheelMesh.parent = this.car,
		this.backLeftWheelMesh.parent = this.car,
		this.backRightWheelMesh.parent = this.car,
		this.car_m.parent = this.car,
		this.wfl.parent = this.frontLeftWheelMesh,
		this.wfl.position = BABYLON.Vector3.Zero(),
		this.wfr.parent = this.frontRightWheelMesh,
		this.wfr.position = BABYLON.Vector3.Zero(),
		this.wbl.parent = this.backLeftWheelMesh,
		this.wbl.position = BABYLON.Vector3.Zero(), 
		this.wbr.parent = this.backRightWheelMesh,
		this.wbr.position = BABYLON.Vector3.Zero()    
	},  
	this.setUpCar()
};
