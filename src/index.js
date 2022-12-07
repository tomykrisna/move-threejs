import './style/index.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

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
		const currAction = animationActions['idle'].action
		if (prevState) {
			const prevAction = animationActions[prevState.name].action
			currAction.enabled = true
			currAction.crossFadeFrom(prevAction, 0.5, true)
			currAction.play()
		} else {
			currAction.crossFadeFrom(animationActions.idle.action, 0.5, true)
			currAction.play()
		}
	},
	exit: function () { },
	update: function (delta, input) {
		if (input.forward) {
			StateObj.set("walk")
		} else if (input.space) {
			// StateObj.set("jump")
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
		const currAction = animationActions['turnRight'].action
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
	update: function (delta, input) {
		if (input.right) {

			return
		}
		StateObj.set("idle")
	}
}

const TurnLeft = {
	name: "turnLeft",
	play: function (prevState) {
		const currAction = animationActions['turnLeft'].action
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
	update: function (delta, input) {
		if (input.left) {
			// StateObj.set("turnLeft")
			return
		} else if (input.right) {
			// StateObj.set("turnRight")
			return
		}
		StateObj.set("idle")
	}
}

const Walk = {
	name: "walk",
	play: function (prevState) {
		const currAction = animationActions["walk"].action

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
		if (input.forward || input.backward) {
			if (input.shift) {
				StateObj.set("run")
			}
			return;
		}
		StateObj.set("idle")
	}
}

const Run = {
	name: "run",
	play: function (prevState) {
		const currAction = animationActions["run"].action
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
		const currAction = animationActions["jump"].action
		const mixer = currAction.getMixer()
		mixer.addEventListener("finished", () => { })
		if (prevState) {
			const prevAction = animationActions[prevState.name].action
			currAction.enabled = true
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
	},
	exit: function () {
		const action = animationActions["jump"].action
		action.getMixer().removeEventListener("finished", () => { console.log("out"); })
		StateObj.set("idle")
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
let avatar = null
// load model FBX
// const gltfLoader = new GLTFLoader()
// gltfLoader.load('./files/myninja/ninja.glb', (gltf) => {
// 	console.log("gltf", gltf.scenes);
// 	gltf.scenes[0].traverse(mesh => {
// 		mesh.castShadow = true
// 	})
// 	gltf.scene.scale.set(5, 5, 5)
// 	gltf.scene.position.x = -10
// 	gltf.scene.castShadow = true
// 	scene.add(gltf.scene)
// })
// load model FBX
const fog = new THREE.Fog("gray", 20, 80)
scene.fog = fog
scene.background = new THREE.Color("gray")
const fbxLoader = new FBXLoader()
fbxLoader.load("./files/ninja/ninja.fbx", (fbx) => {
	fbx.scale.set(.05, .05, .05)
	fbx.traverse(e => e.castShadow = true)
	avatar = fbx
	const loadingManager = new THREE.LoadingManager()
	loadingManager.onStart = function () {
		loadingElement.style.display = "flex"
	}
	loadingManager.onLoad = () => {
		loadingElement.style.display = "none"
		isReady = true
		StateObj.addState("idle", Idle)
		StateObj.addState("walk", Walk)
		StateObj.addState("run", Run)
		// StateObj.addState("jump", Jump)
		StateObj.addState("turnRight", TurnRight)
		StateObj.addState("turnLeft", TurnLeft)
		StateObj.set("idle")
	}
	mixer = new THREE.AnimationMixer(avatar)

	const _OnLoad = (animName, anim) => {
		const clip = anim.animations[0];
		const action = mixer.clipAction(clip);
		animationActions[animName] = {
			clip,
			action,
			name: animName
		};
	};
	const fbxLoader = new FBXLoader(loadingManager)
	fbxLoader.load('./files/ninja/Idle.fbx', (e) => _OnLoad("idle", e))
	fbxLoader.load('./files/ninja/Walk.fbx', (e) => _OnLoad("walk", e))
	fbxLoader.load('./files/ninja/Run.fbx', (e) => _OnLoad("run", e))
	// fbxLoader.load('./files/ninja/Jump.fbx', (e) => _OnLoad("jump", e))
	fbxLoader.load('./files/ninja/turn_right.fbx', (e) => _OnLoad("turnRight", e))
	fbxLoader.load('./files/ninja/turn_left.fbx', (e) => _OnLoad("turnLeft", e))

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

	if (_keys.shift) {
		acc.multiplyScalar(2.0)
	}

	if (StateObj.currentState.name === "jump") {
		acc.multiplyScalar(0.0)
	}

	if (_keys.forward) {
		velocity.z += acc.z * delta * 0.8
	}
	if (_keys.backward) {
		velocity.z -= acc.z * delta
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
	// sideways.multiplyScalar(0 * 0.01);
	controlObj.position.add(forward)
	controlObj.position.add(sideways)
	if (mixer) {
		mixer.update(delta)
	}
}

const planeGeometry = new THREE.PlaneGeometry(300, 300, 1)
const planeMaterial = new THREE.MeshPhongMaterial({ color: 0xCC8866, side: THREE.DoubleSide })
const ground = new THREE.Mesh(planeGeometry, planeMaterial)
ground.receiveShadow = true
ground.rotation.x = Math.PI * 0.5
scene.add(ground)

const geometry = new THREE.BoxGeometry(2, 2, 2)
const material = new THREE.MeshPhongMaterial({ color: "salmon" })
const mesh = new THREE.Mesh(geometry, material)
mesh.castShadow = true
mesh.position.y = 2
mesh.position.x = 4
mesh.position.z = -5
// scene.add(mesh)
// scene.add(new THREE.CameraHelper(directionalLight.shadow.camera))

// const acc = new THREE.Vector3()
// acc.add(mesh)
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
	// console.log("keys", _keys);
	// mesh.position.set(acc)
	renderer.render(scene, camera)
	window.requestAnimationFrame(animate)
}

animate()
