import './style/index.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// axis helper
const setAxis = (obj) => {
	const axis = new THREE.AxesHelper()
	axis.material.depthTest = false
	axis.renderOrder = 1
	// obj.add(axis)
}

const setGrid = obj => {
	const grid = new THREE.GridHelper(5, 5)
	grid.material.depthTest = false
	grid.renderOrder = 1
	// obj.add(grid)
}

// scene
const scene = new THREE.Scene()
// canvas and render
const canvas = document.querySelector(".webgl")
const renderer = new THREE.WebGLRenderer({ canvas })
renderer.setClearColor(0xAAAAAA)
renderer.shadowMap.enabled = true
renderer.setSize(window.innerWidth, window.innerHeight)
// camera
const makeCamera = (fov = 45) => {
	return new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight)
}
const camera = makeCamera(45)
camera.position.set(0, 5, 15).multiplyScalar(3)
camera.lookAt(0, 0, 0)
scene.add(camera)
const controls = new OrbitControls(camera, canvas)

// light
const ambientLight = new THREE.AmbientLight(0xffffff, .5)
scene.add(ambientLight)
{
	const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
	directionalLight.position.set(0, 20, 0)
	scene.add(directionalLight)
}
{
	// const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
	// directionalLight.position.set(1, 2, 4)
	// scene.add(directionalLight)
}

// ground
const groudnGeometry = new THREE.PlaneGeometry(30, 30, 30)
const groundMaterial = new THREE.MeshPhongMaterial({ color: 0xCC8866 })
const ground = new THREE.Mesh(groudnGeometry, groundMaterial)
ground.rotation.set(Math.PI * -0.5, 0, 0)
scene.add(ground)


const targetPosition = new THREE.Vector3(0, 0, 0)
const tankPosition = new THREE.Vector2()
const tankTarget = new THREE.Vector2()
const tank = new THREE.Object3D()
setGrid(tankTarget)
scene.add(tank)

const bodyColor = 0x6688AA
const bodyGeometry = new THREE.BoxGeometry(4, 1, 8)
const bodyTexture = new THREE.MeshPhongMaterial({ color: bodyColor })
// bodyTexture.wireframe = true
const body = new THREE.Mesh(bodyGeometry, bodyTexture)
setAxis(body)
body.position.set(0, 1, 0)
tank.add(body)
setGrid(tank)

const wheelGeometry = new THREE.CylinderGeometry(1, 1, 0.5, 10)
const wheelTexture = new THREE.MeshPhongMaterial({ color: bodyColor })
const createWheel = ({ x, y, z }) => {
	const mesh = new THREE.Mesh(wheelGeometry, wheelTexture)
	mesh.position.set(x, y, z)
	mesh.rotation.set(Math.PI * 0.5, 0, Math.PI * 0.5)
	setAxis(mesh)
	body.add(mesh)
}
createWheel({ x: -2.25, y: 0, z: 0 })
createWheel({ x: -2.25, y: 0, z: 2.5 })
createWheel({ x: -2.25, y: 0, z: -2.5 })
createWheel({ x: 2.25, y: 0, z: 0 })
createWheel({ x: 2.25, y: 0, z: 2.5 })
createWheel({ x: 2.25, y: 0, z: -2.5 })

const domeGeometry = new THREE.SphereGeometry(1.5, 20, 20, 6, 10, 0, 2)
const domeTexture = new THREE.MeshPhongMaterial({ color: bodyColor, side: THREE.DoubleSide })
const dome = new THREE.Mesh(domeGeometry, domeTexture)
dome.position.set(0, 0.7, 0)
body.add(dome)

const turretGeometry = new THREE.BoxGeometry(.1, .1, 1)
const turretTexture = new THREE.MeshPhongMaterial({ color: "red" })
const turret = new THREE.Mesh(turretGeometry, turretTexture)
setAxis(turret)
turret.position.set(0, .15, 0.5)
const turretPivot = new THREE.Object3D()
turretPivot.scale.set(5, 5, 5)
turretPivot.position.y = 0.1
turretPivot.add(turret)
body.add(turretPivot)
// setGrid(turretPivot)

const turretCamera = makeCamera(45)
turretCamera.position.y = 2
turret.add(turretCamera)

const targetGeometry = new THREE.SphereGeometry(0.5, 6, 6)
const targetMaterial = new THREE.MeshPhongMaterial({ color: bodyColor })
const target = new THREE.Mesh(targetGeometry, targetMaterial)

const targetOrbit = new THREE.Object3D()
const targetElevation = new THREE.Object3D()
const targetBob = new THREE.Object3D()

scene.add(targetOrbit)
targetOrbit.add(targetElevation)
targetElevation.position.y = 8
targetElevation.position.z = 9
targetElevation.position.x = 8
targetElevation.add(targetBob)
targetBob.add(target)
setGrid(targetOrbit)
setGrid(targetElevation)
setGrid(targetBob)

// path 
const curve = new THREE.SplineCurve([
	new THREE.Vector2(-10, 0),
	new THREE.Vector2(-5, 5),
	new THREE.Vector2(0, 0),
	new THREE.Vector2(5, -5),
	new THREE.Vector2(10, 0),
	new THREE.Vector2(5, 10),
	new THREE.Vector2(-5, 10),
	new THREE.Vector2(-10, -10),
	new THREE.Vector2(-15, -8),
	new THREE.Vector2(-10, 0),
])

const points = curve.getPoints(50)
const curveGeometry = new THREE.BufferGeometry().setFromPoints(points)
const curveMaterial = new THREE.LineBasicMaterial({ color: bodyColor })
const splineObject = new THREE.Line(curveGeometry, curveMaterial)
splineObject.rotation.x = Math.PI * 0.5
splineObject.position.y = 0.05
// splineObject.position.x = -2
// splineObject.position.z = 10
scene.add(splineObject)

// curve.getPointAt(0.001, tankPosition)
// tank.position.set(tankPosition.x, 0, tankPosition.y)

renderer.render(scene, camera)
window.addEventListener("resize", () => {
	const pixelRatio = window.devicePixelRatio
	renderer.setSize(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio)
	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()
})

function animate(time = 0) {
	time *= 0.001

	const tankTime = time * .05;
	curve.getPointAt(tankTime % 1, tankPosition);
	curve.getPointAt((tankTime + 0.01) % 1, tankTarget);
	tank.position.set(tankPosition.x, 0, tankPosition.y);
	// console.log("tank target ", tankTarget);
	// console.log("tank position ", tankPosition);
	tank.lookAt(tankTarget.x, 0, tankTarget.y);

	targetOrbit.rotation.y = time * 0.27;
	targetBob.position.y = Math.sin(time * 2) * 4;
	target.rotation.x = time * 7;
	target.rotation.y = time * 13;
	targetMaterial.emissive.setHSL(time * 10 % 1, 1, .25);
	targetMaterial.color.setHSL(time * 10 % 1, 1, .25);

	target.getWorldPosition(targetPosition)
	turretPivot.lookAt(targetPosition)
	// controls.update()
	turretCamera.lookAt(targetPosition)
	renderer.render(scene, camera)
	window.requestAnimationFrame(animate)
}

animate()
