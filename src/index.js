import './style/index.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// axis helper
const setAxis = (obj) => {
	const axis = new THREE.AxesHelper()
	axis.material.depthTest = false
	axis.renderOrder = 1
	obj.add(axis)
}

const setGrid = obj => {
	const grid = new THREE.GridHelper(5, 5)
	grid.material.depthTest = false
	grid.renderOrder = 1
	obj.add(grid)
}

// scene
const scene = new THREE.Scene()
// canvas and render
const canvas = document.querySelector(".webgl")
const loadingElement = document.querySelector(".loading")
const renderer = new THREE.WebGLRenderer({ canvas })
renderer.setClearColor(0xAAAAAA)

renderer.setSize(window.innerWidth, window.innerHeight)
// camera
const makeCamera = (fov = 45) => {
	return new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight)
}
const camera = makeCamera(75)
camera.position.set(0, 14, -17)
// camera.lookAt(0, 0, 0)
scene.add(camera)
const controls = new OrbitControls(camera, canvas)

// light
const ambientLight = new THREE.AmbientLight(0xffffff, .5)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
directionalLight.castShadow = true
// directionalLight.position.set(-10, 10, 10);
directionalLight.shadow.bias = -0.001;
directionalLight.shadow.mapSize.width = 4096
directionalLight.shadow.mapSize.height = 4096
directionalLight.shadow.camera.near = 0.1
directionalLight.shadow.camera.far = 500.0
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 500.0;
directionalLight.shadow.camera.left = 40;
directionalLight.shadow.camera.right = -40;
directionalLight.shadow.camera.top = 40;
directionalLight.shadow.camera.bottom = -40;
directionalLight.position.set(0, 40, 40)
scene.add(directionalLight)

// key action 
let _keys = {
	forward: false,
	backward: false,
	left: false,
	right: false,
	space: false,
	shift: false,
}

function _onKeyDown(event) {
	switch (event.keyCode) {
		case 87: // w
			_keys = { ..._keys, forward: true }
			break;
		case 65: // a
			_keys = { ..._keys, left: true }
			break;
		case 83: // s
			_keys = { ..._keys, backward: true }
			break;
		case 68: // d
			_keys = { ..._keys, right: true }
			break;
		case 32: // SPACE
			_keys = { ..._keys, space: true }
			break;
		case 16: // SHIFT
			_keys = { ..._keys, shift: true }
			break;
	}
}

function _onKeyUp(event) {
	switch (event.keyCode) {
		case 87: // w
			_keys = { ..._keys, forward: false }
			break;
		case 65: // a
			_keys = { ..._keys, left: false }
			break;
		case 83: // s
			_keys = { ..._keys, backward: false }
			break;
		case 68: // d
			_keys = { ..._keys, right: false }
			break;
		case 32: // SPACE
			_keys = { ..._keys, space: false }
			break;
		case 16: // SHIFT
			_keys = { ..._keys, shift: false }
			break;
	}
}

document.addEventListener('keydown', (e) => _onKeyDown(e), false);
document.addEventListener('keyup', (e) => _onKeyUp(e), false);

const Idle = {
	name: "idle",
	play: function (prevState) {
		const currAction = animationActions[this.name].action
		if (prevState) {
			const prevAction = animationActions[prevState.name].action
			currAction.enabled = true
			currAction.crossFadeFrom(prevAction, 0.5, true)
			currAction.play()
		} else {
			currAction.crossFadeFrom(animationActions[this.name].action, 0.5, true)
			currAction.play()
		}
	},
	exit: function () { },
	update: function (_, input) {
		if (input.forward) {
			StateObj.set("walk")
		} else if (input.backward) {
			StateObj.set("walkingBackwards")
		} else if (input.space) {
			StateObj.set("jump")
		} else if (input.right) {
			StateObj.set("turnRight")
		} else if (input.left) {
			StateObj.set("turnLeft")
		}
	}
}

const TurnRight = {
	name: "turnRight",
	play: function (prevState) {
		const currAction = animationActions[this.name].action
		if (prevState) {
			const prevAction = animationActions[prevState.name].action
			if (prevState.name !== this.name) {
				currAction.clampWhenFinished = true;
				currAction.reset()
				currAction.setLoop(THREE.LoopOnce, 1)
			}
			currAction.crossFadeFrom(prevAction, 0.2, true)
			currAction.play()
		} else {
			currAction.play()
		}
	},
	exit: function () { },
	update: function (_, input) {
		if (input.right || input.right) {
			return
		}
		StateObj.set("idle")
	}
}

const TurnLeft = {
	name: "turnLeft",
	play: function (prevState) {
		const currAction = animationActions[this.name].action
		if (prevState) {
			const prevAction = animationActions[prevState.name].action
			currAction.clampWhenFinished = true;
			currAction.reset()
			currAction.setLoop(THREE.LoopOnce, 1)
			currAction.crossFadeFrom(prevAction, 0.2, true)
			currAction.play()
		} else {
			currAction.play()
		}
	},
	exit: function () { },
	update: function (_, input) {
		if (input.left || input.right) {
			return
		}
		StateObj.set("idle")
	}
}

const Walk = {
	name: "walk",
	play: function (prevState) {
		const currAction = animationActions[this.name].action
		if (prevState) {
			const prevAction = animationActions[prevState.name].action
			currAction.enabled = true
			currAction.time = 0.0;
			currAction.setEffectiveTimeScale(1.0);
			currAction.setEffectiveWeight(1.0);
			currAction.crossFadeFrom(prevAction, 0.5, true)
			currAction.play()
		} else {
			currAction.play()
		}
	},
	exit: function () { },
	update: (_, input) => {
		if (input.forward) {
			if (input.shift) {
				StateObj.set("run")
			}
			return;
		}
		StateObj.set("idle")
	}
}

const WalkingBackwards = {
	name: "walkingBackwards",
	play: function (prevState) {
		const currAction = animationActions[this.name].action
		if (prevState) {
			const prevAction = animationActions[prevState.name].action
			currAction.enabled = true
			currAction.time = 2.0;
			currAction.setEffectiveTimeScale(1.0);
			currAction.setEffectiveWeight(1.0);
			currAction.crossFadeFrom(prevAction, 0.5, true)
			currAction.play()
		} else {
			currAction.play()
		}
	},
	exit: function () { },
	update: (_, input) => {
		if (input.backward) {
			return;
		} else if (input.forward) {
			StateObj.set("walk")
		}
		StateObj.set("idle")
	}
}

const Run = {
	name: "run",
	play: function (prevState) {
		const currAction = animationActions[this.name].action
		if (prevState) {
			const prevAction = animationActions[prevState.name].action
			currAction.enabled = true
			currAction.time = 0.0;
			currAction.setEffectiveTimeScale(1.0);
			currAction.setEffectiveWeight(1.0);
			currAction.crossFadeFrom(prevAction, 0.5, true)
			currAction.play()
		} else {
			currAction.play()
		}
	},
	exit: function () { },
	update: (_, input) => {
		if (input.forward) {
			if (!input.shift) {
				StateObj.set("walk")
			}
			return
		}
		StateObj.set("idle")
	}
}

const Jump = {
	name: "jump",
	play: function (prevState) {
		const currAction = animationActions[this.name].action
		const mixer = currAction.getMixer()
		mixer.addEventListener("finished", () => { this.finishCallback() })
		if (prevState) {
			const prevAction = animationActions[prevState.name].action
			currAction.reset()
			currAction.setLoop(THREE.LoopOnce, 1)
			currAction.clampWhenFinished = true
			currAction.setEffectiveTimeScale(1.0);
			currAction.setEffectiveWeight(1.0);
			currAction.crossFadeFrom(prevAction, 0.2, true)
			currAction.play()
		} else {
			currAction.play()
		}
	},
	finishCallback: function () {
		this.exit()
		StateObj.set("idle")
	},
	exit: function () {
		const action = animationActions[this.name].action
		action.getMixer().removeEventListener("finished", () => { })
	},
	update: (_, input) => {

	}
}

const StateObj = {
	state: {},
	currentState: null,
	addState: function (name, stateObj) {
		this.state = { ...this.state, [name]: stateObj }
	},
	set: function (name) {
		const prevState = this.currentState
		if (prevState) {
			if (prevState.name === name) {
				return
			}
			prevState.exit()
		}
		const state = this.state[name]
		this.currentState = state
		state.play(prevState)
	},
	update: function (delta, input) {
		if (this.currentState) {
			this.currentState.update(delta, input)
		}
	}
}

let isReady = false
let mixer
let animationActions = {}
// let gltfAnimations = []
let avatar = null
// load model FBX

// const gltfManager = new THREE.LoadingManager()
// gltfManager.onStart = function () {
// 	loadingElement.style.display = "flex"
// }
// gltfManager.onLoad = function () {
// 	console.log("gltf", gltfAnimations);
// 	isReady = true
// 	StateObj.addState("Idle", Idle)
// 	StateObj.addState("Walking", Walk)
// 	StateObj.addState("Running", Run)
// 	// StateObj.addState("jump", Jump)
// 	StateObj.addState("turn_right", TurnRight)
// 	StateObj.addState("turn_left", TurnLeft)
// 	StateObj.set("Idle")
// 	loadingElement.style.display = "none"
// }
// const gltfLoader = new GLTFLoader(gltfManager)
// gltfLoader.load('./files/ninja/avatar.glb', function (gltf) {
// const root = gltf.scenes[0]
// root.traverse(mesh => {
// 	mesh.castShadow = true
// })
// root.castShadow = true
// root.scale.set(5, 5, 5)
// avatar = root
// mixer = new THREE.AnimationMixer(avatar)
// gltfAnimations = gltf.animations.map(function (item) {
// 	const action = mixer.clipAction(item)
// 	return {
// 		action,
// 		name: item.name,
// 		clip: item,
// 	}
// })
// scene.add(avatar)
// })

// load model FBX
const fog = new THREE.Fog("#c4c4c4", 20, 80)
scene.fog = fog
scene.background = new THREE.Color("#c4c4c4")
const loadingFirst = new THREE.LoadingManager()
loadingFirst.onStart = function () {
	loadingElement.style.display = "flex"
}
const fbxLoader = new FBXLoader(loadingFirst)
fbxLoader.load("./files/swat/Swat.fbx", (fbx) => {
	fbx.scale.set(.05, .05, .05)
	fbx.traverse(e => e.castShadow = true)
	avatar = fbx
	const loadingManager = new THREE.LoadingManager()
	loadingManager.onLoad = () => {
		loadingElement.style.display = "none"
		isReady = true
		StateObj.addState("idle", Idle)
		StateObj.addState("walk", Walk)
		StateObj.addState("walkingBackwards", WalkingBackwards)
		StateObj.addState("run", Run)
		StateObj.addState("jump", Jump)
		StateObj.addState("turnRight", TurnRight)
		StateObj.addState("turnLeft", TurnLeft)
		StateObj.set("idle")
	}
	mixer = new THREE.AnimationMixer(avatar)

	const _OnLoad = (animName, anim) => {
		const clip = anim.animations.find(i => i.name === "mixamo.com")
		const action = mixer.clipAction(clip);
		animationActions[animName] = {
			clip,
			action,
			name: animName
		};
	};
	const fbxLoader = new FBXLoader(loadingManager)
	fbxLoader.load('./files/swat/Run.fbx', (e) => _OnLoad("run", e))
	fbxLoader.load('./files/swat/Jump.fbx', (e) => _OnLoad("jump", e))
	fbxLoader.load('./files/swat/Idle.fbx', (e) => _OnLoad("idle", e))
	fbxLoader.load('./files/swat/Walk.fbx', (e) => _OnLoad("walk", e))
	fbxLoader.load('./files/swat/TurnLeft.fbx', (e) => _OnLoad("turnLeft", e))
	fbxLoader.load('./files/swat/TurnRight.fbx', (e) => _OnLoad("turnRight", e))
	fbxLoader.load('./files/swat/Walking Backwards.fbx', (e) => _OnLoad("walkingBackwards", e))
	scene.add(avatar)
}
)

let _velocity = new THREE.Vector3(0, 0, 0);
const _decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
const _acceleration = new THREE.Vector3(1, 0.25, 50);

const controlsInput = (delta) => {
	if (!avatar) {
		return
	}

	StateObj.currentState.update(delta, _keys)
	const velocity = _velocity;
	const frameDecceleration = new THREE.Vector3(
		velocity.x * _decceleration.x,
		velocity.y * _decceleration.y,
		velocity.z * _decceleration.z
	);
	frameDecceleration.multiplyScalar(delta);
	frameDecceleration.z = Math.sign(frameDecceleration.z) * Math.min(
		Math.abs(frameDecceleration.z), Math.abs(velocity.z));

	velocity.add(frameDecceleration);

	const controlObj = avatar

	const _Q = new THREE.Quaternion()
	const _V = new THREE.Vector3()
	const _R = controlObj.quaternion.clone()
	const acc = _acceleration.clone();

	if (_keys.shift && !_keys.backward) {
		acc.multiplyScalar(3.0)
	}

	// if (StateObj.currentState.name === "walk") {
	// 	acc.multiplyScalar(0.0)
	// }

	if (_keys.forward) {
		velocity.z += acc.z * delta * 0.7
	}
	if (_keys.backward) {
		velocity.z -= acc.z * delta * 0.3
	}
	if (_keys.left) {
		_V.set(0, 1, 0)
		_Q.setFromAxisAngle(_V, 4.0 * Math.PI * delta * 1.4 * _acceleration.y)
		_R.multiply(_Q)
	}
	if (_keys.right) {
		_V.set(0, 1, 0)
		_Q.setFromAxisAngle(_V, 4.0 * -Math.PI * delta * 1.4 * _acceleration.y)
		_R.multiply(_Q)
	}

	controlObj.quaternion.copy(_R)

	const forward = new THREE.Vector3(0, 0, 1);
	forward.applyQuaternion(controlObj.quaternion);
	forward.normalize();

	const sideways = new THREE.Vector3(1, 0, 0);
	sideways.applyQuaternion(avatar.quaternion);
	sideways.normalize();

	sideways.multiplyScalar(velocity.x * delta);
	forward.multiplyScalar(velocity.z * delta);

	controlObj.position.add(forward)
	controlObj.position.add(sideways)
	if (mixer) {
		mixer.update(delta)
	}
}

const textureLoader = new THREE.TextureLoader()
const colorTexture = textureLoader.load("./files/grass/BaseColor.jpg")
const normalTexture = textureLoader.load("./files/grass/Normal.jpg")
const roughnessTexture = textureLoader.load("./files/grass/Roughness.jpg")
const ambientTexture = textureLoader.load("./files/grass/AmbientOcclusion.jpg")
const heightTexture = textureLoader.load("./files/grass/Height.png")

// colorTexture.magFilter = THREE.NearestFilter
// colorTexture.generateMipmaps = false
colorTexture.repeat.set(20, 20)
colorTexture.wrapS = THREE.RepeatWrapping
colorTexture.wrapT = THREE.RepeatWrapping

// normalTexture.magFilter = THREE.NearestFilter
// normalTexture.generateMipmaps = false
normalTexture.repeat.set(20, 20)
normalTexture.wrapS = THREE.RepeatWrapping
normalTexture.wrapT = THREE.RepeatWrapping

// roughnessTexture.magFilter = THREE.NearestFilter
// roughnessTexture.generateMipmaps = false
roughnessTexture.repeat.set(20, 20)
roughnessTexture.wrapS = THREE.RepeatWrapping
roughnessTexture.wrapT = THREE.RepeatWrapping

ambientTexture.repeat.set(20, 20)
ambientTexture.wrapS = THREE.RepeatWrapping
ambientTexture.wrapT = THREE.RepeatWrapping

heightTexture.repeat.set(20, 20)
heightTexture.wrapS = THREE.RepeatWrapping
heightTexture.wrapT = THREE.RepeatWrapping

const planeGeometry = new THREE.PlaneGeometry(300, 300, 1)
const planeMaterial = new THREE.MeshStandardMaterial({
	map: colorTexture,
	displacementMap: heightTexture,
	roughnessMap: roughnessTexture,
	normalMap: normalTexture,
	aoMap: ambientTexture
})
planeMaterial.displacementScale = 0.5
const phongMaterial = new THREE.MeshPhongMaterial({ color: 0xCC8866 })
const ground = new THREE.Mesh(planeGeometry, phongMaterial)
ground.receiveShadow = true
ground.rotation.x = -Math.PI * 0.5
scene.add(ground)

// scene.add(new THREE.CameraHelper(directionalLight.shadow.camera))

renderer.shadowMap.enabled = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.render(scene, camera)
window.addEventListener("resize", () => {
	const pixelRatio = window.devicePixelRatio
	renderer.setSize(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio)
	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()
})

const clock = new THREE.Clock()
let previousTime = 0
function animate(time) {
	time *= 0.001
	const elapsedTime = clock.getElapsedTime()
	const delta = elapsedTime - previousTime
	previousTime = elapsedTime
	// if (mixer) {
	// 	mixer.update(delta)
	// }
	// console.log("animation", animationActions);
	if (isReady) {
		controlsInput(delta)
	}
	renderer.render(scene, camera)
	window.requestAnimationFrame(animate)
}

animate()
