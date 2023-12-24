/* app.js
 * Created by Ozgur Tuna Ozturk
 * Last edited on 02/12/2022
 * This Javascript file is meant to create the distribution page for all the other
 * pages owned by Tuna. This Javascript file uses THREE JS to create a 3D simulation
 * of the Earth, the Moon, the Sun, and location linked node points for each website.
 */

/* --- Imports --- */

import * as THREE from 'https://unpkg.com/three@0.138.0/build/three.module.js';	// THREE JS Library
import { OrbitControls } from "./orbitControls.js";								// Edited OrbitControls Library
import { Lensflare, LensflareElement } from './lensflare.js';					// Edited Lensflare Library
import { DomMesh } from './DomMesh.js';											// DomMesh Library

/* --- End of Imports --- */

/* --- Import Shaders --- */

import { VertexShader_pars } from './shaders/VertexShaderExt_pars.glsl.js';		// MeshPhysicalMaterial Vertex Shader Parameter Extension
import { VertexShader } from './shaders/VertexShaderExt.glsl.js';					// MeshPhysicalMaterial Vertex Shader Extension
import { FragmentShader_pars } from './shaders/FragmentShaderExt_pars.glsl.js';	// MeshPhysicalMaterial Fragment Shader Parameter Extension
import { FragmentShader } from './shaders/FragmentShaderExt.glsl.js';			// MeshPhysicalMaterial Fragment Shader Extension

/* --- End of Import Shaders --- */

gsap.registerPlugin(ScrollToPlugin);

/* --- ShortCuts --- */

// Create a shortcut to load textures
const textureLoader = new THREE.TextureLoader();
textureLoader.crossOrigin = '';
// Create a shortcut to create dates
const dt = new Date();

/* --- End of ShortCuts --- */

//window.scrollY = 0;
//window.pageYOffset = 0;

/* --- Textures --- */

//
const lensflareTexture = textureLoader.load( "./textures/lensflare.png" );		// LensFlare Texture

/* Textures are created by Tom Patterson and can be found on Natural Earth III - Texture Maps at
 * https://www.shadedrelief.com/natural3/pages/textures.html
 */

const earthDayTexture = textureLoader.load( "./textures/earth.jpeg" );			// Earth Day Texture
const earthNightTexture = textureLoader.load( "./textures/earth_night.jpeg" );	// Earth Night Texture
const earthBumpMapTexture = textureLoader.load("./textures/earth_elev.jpeg");	// Earth Elevation Texture
const atmosphereTexture = textureLoader.load( "./textures/glow.png" );			// Atmosphere Texture
const cloudTexture = textureLoader.load( "./textures/earth_clouds.jpeg" );		// Clouds Texture
const moonTexture = textureLoader.load( "./textures/moon.jpeg" );				// Moon Texture
const moonDarkTexture = textureLoader.load( "./textures/moon_dark.jpeg" );		// Moon Dark Texture
const moonBumpMapTexture = textureLoader.load( "./textures/moon_elev.jpeg" );	// Moon Texture

/* --- End of Textures --- */

/* --- Global Variables --- */
var FOV = 50;			// Default FOV of the scene

const div = document.getElementById("canvas");

//const div = document.body;

var canvasWidth = div.clientWidth;		// Save default canvas width;
var canvasHeight = div.clientHeight;	// Save default canvas height

// Define a variable to hold the multiplier that changes the FOV according to the canvasWidth and canvasHeihgt
var cameraMultiplier = 0;
if (canvasWidth > canvasHeight) {
	// For larger devices like computers
	cameraMultiplier = ( ( 1440/821 ) / ( canvasWidth / canvasHeight ) );
} else {
	// For smaller devices like phones
	cameraMultiplier = (canvasHeight/window.innerHeight / 3.85 + canvasWidth/window.innerWidth / 1.95);
}

// The radius of camera from the origin (0,0,0)
//var cameraRadius = 1.65 * cameraMultiplier;
var cameraRadius = 10 * cameraMultiplier;

/* --- End of Global Variables --- */

/* --- Renderer --- */

// Create a THREE JS WebGL Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true } );
// Renderer Settings
renderer.setSize( canvasWidth, canvasHeight ); // Renderer Aspect Ratio
//renderer.shadowMap.enabled = true; // Renderer Shadow options
//renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
//document.getElementById("canvas").appendChild( renderer.domElement ); // Instantiate the Renderer on the Webpage
div.appendChild( renderer.domElement ); // Instantiate the Renderer on the Webpage

/* --- End of Renderer --- */

earthDayTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
earthNightTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
atmosphereTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

/* --- Camera --- */

// Create a THREE JS Scene
const scene = new THREE.Scene();
// Create a THREE JS Perspective Camera

//FOV = (canvasWidth/canvasHeight) * 20 + 5;

if (window.innerWidth>window.innerHeight) {
	FOV = (canvasWidth/canvasHeight) * 20 + 5;
} else {
	FOV = 13.9;
}

const camera = new THREE.PerspectiveCamera( FOV, canvasWidth / canvasHeight, 0.1, 5000 );
// Adjust the camera FOV according to the aspect ratio of the device

/*if (canvasWidth > canvasHeight) {
	// Adjust for larger devices like computers
	//camera.fov = FOV * cameraMultiplier
} else {
	// Adjust for smaller devices like phones
	camera.fov = FOV * 100;
}*/

// Instantiate the Camera in the scene
scene.add( camera );

// Create an Orbital Camera Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Lock the Camera scroll at 5 units away from the center
controls.maxDistance = cameraRadius;
controls.minDistance = cameraRadius;

controls.enableZoom = false;
// Enable Automatic Rotation feature
controls.autoRotate = true;
// Set the Automatic Rotation Speed to 0.25 CounterClockWise
controls.autoRotateSpeed = -0.25;
// Disable the Pan Feature so that the User cannot wonder around.
controls.enablePan = false;

var cameraOffsetMultiplier = 0;

if (window.innerWidth > window.innerHeight) {
	cameraOffsetMultiplier = 0.3;
} else {
	cameraOffsetMultiplier = 5.75;
}

camera.setViewOffset(canvasWidth, canvasHeight, canvasWidth * cameraOffsetMultiplier, 0, canvasWidth, canvasHeight);

/* --- End of Camera --- */

/* --- Sun --- */

// Calculate the current day of the year
const DOY = Math.ceil((dt - new Date(dt.getFullYear(),0,1)) / 86400000);
// Create a new THREE.DirectionalLight object to imitate the Sun
const sunLight = new THREE.DirectionalLight( 0xffffff, 0.5, 2000 );
// Set the position of the sunLight Object with respect to Earth
var sunPos = new THREE.Vector3(Math.cos(Math.PI), -(Math.sin(0.4101524)*Math.cos((DOY/365)*Math.PI*2)), Math.sin(Math.PI));

// Instantiate the sunLight Object into the scene
scene.add(sunLight);
// Create a THREE JS LensFlare Object to create a lensflare effect when looked at the sun
const sunFlare = new Lensflare();
// Add the LensFlare Texture and Settings
sunFlare.addElement( new LensflareElement( lensflareTexture, 500, 0 ) );
// Instantiate the LensFlare
sunLight.add(sunFlare);

sunLight.position.set(0,0,0);

/* --- End of Sun --- */

/* --- Atmospheric Lighting --- */

// Create a THREE.AmbientLight object to imitate the Atmospherical Light Reflections
const atmoLight = new THREE.AmbientLight( 0xF0F0F0 ); // soft white light
// Instantiate the atmoLight
scene.add( atmoLight );

/* --- End of Atmospheric Lighting --- */

const spotLight = new THREE.SpotLight( 0xFFFFFF, 0.5 );
spotLight.position.set( 0, 0, 0 );
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 2024;
spotLight.shadow.mapSize.height = 2024;
spotLight.shadow.camera.near = 500;
spotLight.shadow.camera.far = 4000;
spotLight.shadow.camera.fov = 30;
scene.add( spotLight );

/* --- Earth --- */
// --- Earth Base ---
// Create a new MeshPhongMaterial for Earth
let earthMaterial = new THREE.MeshPhongMaterial({
	color: 0xffffff,
	reflectivity: 0,
	shininess: 10,
	depthTest:true,
	transparent: true,
	bumpMap:earthBumpMapTexture,
	bumpScale: 0.5,
	side: THREE.DoubleSide,
});

// Before compiling the website add specifics to the MeshPhongMaterial of Earth
earthMaterial.onBeforeCompile = function ( shader ) {
	// Insert custom Uniforms
	shader.uniforms.sunDirection = { value: sunPos };
	shader.uniforms.dayTexture = { value: earthDayTexture };
	shader.uniforms.nightTexture = { value: earthNightTexture };

	// Insert the custom Vertex Shader Extensions
	shader.vertexShader = VertexShader_pars + shader.vertexShader; // Insert the uniforms into the vertex shader
	shader.vertexShader = shader.vertexShader.replace('void main() {', VertexShader); // Insert the vertex shader extension

	// Insert the custom Fragment Shader Extensions
	shader.fragmentShader = FragmentShader_pars + shader.fragmentShader; // Insert the uniforms into the fragment shader
	// Change the definition for diffuseColor to insert our custom day/night texture mix
	shader.fragmentShader = shader.fragmentShader.replace('vec4 diffuseColor = vec4( diffuse, opacity );', FragmentShader); // Insert the fragment shader extension

	// Make sure to update the shader data
	earthMaterial.userData.shader = shader;
	shader.needsUpdate=true;
};

// Instantiate the Earth variable as a new DomMesh using the custom MeshPhongMaterial
const Earth = new DomMesh( new THREE.SphereGeometry( 3, 50, 50 ), earthMaterial, camera);

const point = new THREE.Mesh(new THREE.SphereGeometry(0.055 * cameraMultiplier), new THREE.MeshBasicMaterial( { color: 0xff0000, } ));

scene.add(point);

var locSet = false;
var box = document.getElementsByTagName("box")[0]

var coords;

Earth.RightMouseDown((selected) => {

	point.position.set(
		selected.point.x,
		selected.point.y,
		selected.point.z
	);

	coords = EuclodcordToSphere(selected.point);

	var NS = 'S';
	var WE = 'E';

	if (coords[0] < 0) {
		NS = 'N';
	}

	if (coords[1] < 0) {
		WE = 'W';
	}

	var loc = document.getElementById("loc");
	

	loc.innerText = "Lat: " + Math.abs(coords[0]) + "° " + NS + ", Long: " + Math.abs(coords[1]) + "° " + WE;
	loc.classList.add("enabled");

	box.classList.add("active");
	box.classList.add("enabled");

	locSet = true;

	document.getElementById("location").value = "Lat: " + Math.abs(coords[0]) + "° " + NS + ", Long: " + Math.abs(coords[1]) + "° " + WE;
	document.getElementById("location").checked = true;

})


box.addEventListener("click", () => {

	if (locSet) {

		box.classList.remove("active");

		locSet = false;

		document.getElementById("location").value = "0";
		document.getElementById("location").checked = false;
	} else  {

		box.classList.add("active");

		locSet = true;

		document.getElementById("location").value = "Lat: " + Math.abs(coords[0]) + "° " + NS + ", Long: " + Math.abs(coords[1]) + "° " + WE;
		document.getElementById("location").checked = true;
	}

});


// --- Atmosphere ---
// Create a THREE.SpriteMaterial to represent the Atmosphere around the Earth
var atmosphereMaterial = new THREE.SpriteMaterial({
  map: atmosphereTexture,  // Load the Atmospheric Glow Texture
  color: 0xddddff,                                   // The glow color is light blue
  transparent: true,                                 // Does show behind
  blending: THREE.AdditiveBlending,                  // Blends with the environment behind using THREE.AdditiveBlending
  depthWrite: false,                                 // Lightblocking off
});
// Create a new THREE.Sprite using the atmosphereMaterial
var atmosphere = new THREE.Sprite( atmosphereMaterial );
// Change the scale of the Sprite so that it shows behind the Earth and looks realistic
atmosphere.scale.set(0.025, 0.025, 1.0);
// Add the Atmosphere to the Clouds object
Earth.add(atmosphere); // this centers the glow at the mesh

// --- Clouds ---
// Create a THREE.MeshPhysicalMaterial for the clouds.
// The reason we use an advance material properties for clouds is
// so that there is shadow casting on the clouds due to Earth
var cloudMaterial = new THREE.MeshPhongMaterial({
  map: cloudTexture, // Load the Cloud Texture
  color: 0x505050,                                           // White Clouds
  transparent: true,                                         // Must show the Earth Underneath
  blending: THREE.AdditiveBlending,                          // Blends with the environment behind using THREE.AdditiveBlendings
  reflectivity: 0.1,                                         // 0.0% reflectivity
  depthWrite: false,                                         // Lightblocking off
  shininess: 10,
});
// Create a new THREE.Mesh object for the clouds using the cloudMaterial
var clouds = new THREE.Mesh( new THREE.SphereGeometry(3.01, 50, 50), cloudMaterial );
// Instantiate the clouds on the scene
scene.add(clouds);
// Instantiate the Earth on the scene
scene.add( Earth );
Earth.position.set(250*Math.cos(((DOY)/365)*Math.PI*2 - Math.PI/2), 0, 250*Math.sin((DOY/365)*Math.PI*2 - Math.PI/2));
//spotLight.position.set( -Earth.position.x, 0, -Earth.position.z);
spotLight.target = Earth;
clouds.position.set( Earth.position.x, Earth.position.y, Earth.position.z );

controls.target.set(Earth.position.x, Earth.position.y, Earth.position.z);

// Set the initial Camera Position so the Northern Hemisphere is in focus
camera.position.x = Earth.position.x + cameraRadius * Math.cos(Math.PI)
camera.position.y = cameraRadius * Math.sin(Math.PI/3);
camera.position.z = Earth.position.z - cameraRadius * Math.cos(Math.PI/6);

/* --- End of Earth --- */

/* --- Moon --- */

// Create a THREE.MeshPhysicalMaterial for moon to have moon cycles due to Shadow Casting
const moonMaterial = new THREE.MeshPhongMaterial({
  color: 0xa0a0a0,                                   // Set Moon's Base Color White
  transparent: false,   							 // Set transparancy to false
  reflectivity: 0.0,                                 // 0.0% Reflectivity
  shininess: 0,
  bumpMap: moonBumpMapTexture,
  bumpScale: 0.2,
});
moonMaterial.onBeforeCompile = function ( shader ) {
	// Insert custom Uniforms
	shader.uniforms.sunDirection = { value: sunPos };
	shader.uniforms.dayTexture = { value: moonTexture };
	shader.uniforms.nightTexture = { value: moonDarkTexture };

	// Insert the custom Vertex Shader Extensions
	shader.vertexShader = VertexShader_pars + shader.vertexShader; // Insert the uniforms into the vertex shader
	shader.vertexShader = shader.vertexShader.replace('void main() {', VertexShader); // Insert the vertex shader extension

	// Insert the custom Fragment Shader Extensions
	shader.fragmentShader = FragmentShader_pars + shader.fragmentShader; // Insert the uniforms into the fragment shader
	// Change the definition for diffuseColor to insert our custom day/night texture mix
	shader.fragmentShader = shader.fragmentShader.replace('vec4 diffuseColor = vec4( diffuse, opacity );', FragmentShader); // Insert the fragment shader extension

	// Make sure to update the shader data
	moonMaterial.userData.shader = shader;
	shader.needsUpdate=true;
};
// Create a THREE.Mesh Sphere object with moonmaterial
const moon = new THREE.Mesh( new THREE.SphereGeometry(0.52), moonMaterial);
// Set the moon's current position using the Day of the Year to find the exact spot on the Orbit
moon.position.set(Earth.position.x + 30*Math.cos((DOY/27)*Math.PI*2 + Math.PI), Earth.position.y + 30*Math.sin(5.14*Math.PI/180)*Math.cos((DOY/27)*Math.PI*2 + Math.PI), Earth.position.z + 30*Math.sin((DOY/27)*Math.PI*2 + Math.PI));
// Instantiate moon
scene.add(moon);

/* --- End of Moon --- */

/* --- Nodes --- */

const nodeGeometry = new THREE.SphereGeometry(0.055 * cameraMultiplier);

// --- Istanbul Node ---
const node1 = new DomMesh(nodeGeometry, new THREE.MeshBasicMaterial( { color: 0xffffff, } ), camera );
// Istanbul, Turkey Coordinates: 41.0082° N 28.9784° E
var node1Latitude = -41.0082;
var node1Longitude = 28.9784;
// Set Spherical Positions
SphereToEuclodCord(node1, node1Latitude, node1Longitude, Earth.rotation.y);
// Add the Node Group to the Scene
scene.add(node1);

// --- Changshu Node ---
const node2 = new DomMesh( nodeGeometry, new THREE.MeshBasicMaterial( { color: 0xffffff, } ), camera );
// Changshu, China Coordinates: 31.6538° N 120.7522° E
var node2Latitude = -31.6538;
var node2Longitude = 120.7522;
// Set Spherical Positions
SphereToEuclodCord(node2, node2Latitude, node2Longitude, Earth.rotation.y);
// Add the Node Group to the Scene
scene.add(node2);

// --- Thimphu Node ---
const node3 = new DomMesh( nodeGeometry, new THREE.MeshBasicMaterial( { color: 0xffffff, } ), camera );
// Thimphu, Bhutan Coordinates: 27.4716° N 89.6386° E
var node3Latitude = -27.4716;
var node3Longitude = 89.6386;
// Set Spherical Positions
SphereToEuclodCord(node3, node3Latitude, node3Longitude, Earth.rotation.y);
// Add the Node Group to the Scene
scene.add(node3);

// --- Wheaton Node ---
const node4 = new DomMesh( nodeGeometry, new THREE.MeshBasicMaterial( { color: 0xffffff, } ), camera );
// Wheaton College, Norton, USA Coordinates: 41.9672° N 71.1840° W
var node4Latitude = -41.9672;
var node4Longitude = -71.1840;
// Set Spherical Positions
SphereToEuclodCord(node4, node4Latitude, node4Longitude, Earth.rotation.y);
// Add the Node Group to the Scene
scene.add(node4);

// --- France Node ---
const node5 = new DomMesh( nodeGeometry, new THREE.MeshBasicMaterial( { color: 0xffffff, } ), camera );
// Wheaton College, Norton, USA Coordinates: 41.9672° N 71.1840° W
var node5Latitude = -48.8566;
var node5Longitude = 2.3522;
// Set Spherical Positions
SphereToEuclodCord(node5, node5Latitude, node5Longitude, Earth.rotation.y);
// Add the Node Group to the Scene
scene.add(node5);
/* --- End of Nodes --- */

/* --- Node Tags --- */

var tabs = document.getElementsByClassName("tab");
var texts = document.getElementById("texts").getElementsByTagName("div");

tabs[0].addEventListener("mouseover", e => {
	gsap.to(camera.position, {
		z: node1.position.z,
		y: node1.position.y,
		x: node1.position.x,
		duration: 0.5
	});
});

tabs[1].addEventListener("mouseover", e => {
	gsap.to(camera.position, {
		z: node2.position.z,
		y: node2.position.y,
		x: node2.position.x,
		duration: 0.5
	});
});

tabs[2].addEventListener("mouseover", e => {
	gsap.to(camera.position, {
		z: node3.position.z,
		y: node3.position.y,
		x: node3.position.x,
		duration: 0.5
	});
});

tabs[3].addEventListener("mouseover", e => {
	gsap.to(camera.position, {
		z: node4.position.z,
		y: node4.position.y,
		x: node4.position.x,
		duration: 0.5
	});
});

tabs[4].addEventListener("mouseover", e => {
	gsap.to(camera.position, {
		z: node5.position.z,
		y: node5.position.y,
		x: node5.position.x,
		duration: 0.5
	});
});

tabs[0].addEventListener("click", e => {
	tabs[0].classList.remove("inactive")
	texts[0].classList.remove("inactive")

	tabs[1].classList.add("inactive")
	texts[1].classList.add("inactive")

	tabs[2].classList.add("inactive")
	texts[2].classList.add("inactive")

	tabs[3].classList.add("inactive")
	texts[3].classList.add("inactive")

	tabs[4].classList.add("inactive")
	texts[4].classList.add("inactive")

});
tabs[1].addEventListener("click", e => {
	tabs[1].classList.remove("inactive")
	texts[1].classList.remove("inactive")
	
	tabs[0].classList.add("inactive")
	texts[0].classList.add("inactive")

	tabs[2].classList.add("inactive")
	texts[2].classList.add("inactive")

	tabs[3].classList.add("inactive")
	texts[3].classList.add("inactive")

	tabs[4].classList.add("inactive")
	texts[4].classList.add("inactive")

});
tabs[2].addEventListener("click", e => {
	tabs[2].classList.remove("inactive")
	texts[2].classList.remove("inactive")

	tabs[1].classList.add("inactive")
	texts[1].classList.add("inactive")

	tabs[0].classList.add("inactive")
	texts[0].classList.add("inactive")

	tabs[3].classList.add("inactive")
	texts[3].classList.add("inactive")

	tabs[4].classList.add("inactive")
	texts[4].classList.add("inactive")

});
tabs[3].addEventListener("click", e => {
	tabs[3].classList.remove("inactive")
	texts[3].classList.remove("inactive")

	tabs[2].classList.add("inactive")
	texts[2].classList.add("inactive")

	tabs[1].classList.add("inactive")
	texts[1].classList.add("inactive")

	tabs[0].classList.add("inactive")
	texts[0].classList.add("inactive")

	tabs[4].classList.add("inactive")
	texts[4].classList.add("inactive")

});
tabs[4].addEventListener("click", e => {
	tabs[4].classList.remove("inactive")
	texts[4].classList.remove("inactive")

	tabs[3].classList.add("inactive")
	texts[3].classList.add("inactive")

	tabs[2].classList.add("inactive")
	texts[2].classList.add("inactive")

	tabs[1].classList.add("inactive")
	texts[1].classList.add("inactive")

	tabs[0].classList.add("inactive")
	texts[0].classList.add("inactive")

});

/* --- End of Node Tags --- */

/* --- DOM Events --- */

// Check if the current browser is Safari
var isSafari = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 && navigator.userAgent && navigator.userAgent.indexOf('CriOS') == -1 && navigator.userAgent.indexOf('FxiOS') == -1;

// Get the center area of the cursor for dynamic filling when hovering a node

// Link node1 with a url with white as default color and gray as highligh color
node1.MouseEnter(() => {
	node1.material.color.set( 0x555555 );

	gsap.to(camera.position, {
		z: node1.position.z,
		y: node1.position.y,
		x: node1.position.x,
		duration: 0.5
	});
});
node1.MouseLeave(() => {
	node1.material.color.set( 0xffffff );
});
node1.MouseDown(() => {
	if (!isSafari) {
		window.open("https://www.linkedin.com/in/ozgur-tuna-ozturk/", "_blank");
	} else if (window.confirm('If you click "ok" you would be redirected.')) {
		window.location.href = "https://www.linkedin.com/in/ozgur-tuna-ozturk/";
	};
});

// Link node2 with a url white as default color and gray as highligh color
node2.MouseEnter(() => {
	node2.material.color.set( 0x555555 );

	gsap.to(camera.position, {
		z: node2.position.z,
		y: node2.position.y,
		x: node2.position.x,
		duration: 0.5
	});
});
node2.MouseLeave(() => {
	node2.material.color.set( 0xffffff );
});
node2.MouseDown(() => {
	if (!isSafari) {
		window.open("https://github.com/Tozturk18", "_blank");
	} else if (window.confirm('If you click "ok" you would be redirected.')) {
		window.location.href = "https://github.com/Tozturk18";
	};
});

// Link node3 with a url white as default color and gray as highligh color
node3.MouseEnter(() => {
	node3.material.color.set( 0x555555 );

	gsap.to(camera.position, {
		z: node3.position.z,
		y: node3.position.y,
		x: node3.position.x,
		duration: 0.5
	});
});
node3.MouseLeave(() => {
	node3.material.color.set( 0xffffff );
});
node3.MouseDown(() => {
	if (!isSafari) {
		window.open("https://www.fablabs.io/labs/BhutanSFL", "_blank");
	} else if (window.confirm('If you click "ok" you would be redirected.')) {
		window.location.href = "https://www.fablabs.io/labs/BhutanSFL";
	};
});

// Link node4 with a url white as default color and gray as highligh color
node4.MouseEnter(() => {
	node4.material.color.set( 0x555555 );

	gsap.to(camera.position, {
		z: node4.position.z,
		y: node4.position.y,
		x: node4.position.x,
		duration: 0.5
	});
});
node4.MouseLeave(() => {
	node4.material.color.set( 0xffffff );
});
node4.MouseDown(() => {
	if (!isSafari) {
		window.open("http://fabacademy.org/2021/labs/wheaton/students/ozgur-tunaozturk/", "_blank");
	} else if (window.confirm('If you click "ok" you would be redirected.')) {
		window.location.href = "http://fabacademy.org/2021/labs/wheaton/students/ozgur-tunaozturk/";
	};
});

// Link node5 with a url white as default color and gray as highligh color
node5.MouseEnter(() => {
	node5.material.color.set( 0x555555 );

	gsap.to(camera.position, {
		z: node5.position.z,
		y: node5.position.y,
		x: node5.position.x,
		duration: 0.5
	});
});
node5.MouseLeave(() => {
	node5.material.color.set( 0xffffff );
});
node5.MouseDown(() => {
	if (!isSafari) {
		window.open("https://tozturk18.github.io/wwi-virtual-pilgrimage/", "_blank");
	} else if (window.confirm('If you click "ok" you would be redirected.')) {
		window.location.href = "https://tozturk18.github.io/wwi-virtual-pilgrimage/";
	};
});

/* --- End of DOM Events --- */

/* --- Functions --- */

/* SphereToEuclodCord() Function
 * Parameters:
 *  - node: each THREE.Mesh object that represents cities on the globe.
 *  - latitude: the latitude of the associated place.
 *  - longtitude: the longitude of the asociated place.
 * retuns:
 *  - Returns nothing but sets the position of the node by
 *  converting the paramters given (latitude & longitude) into
 *  Euclodian coordinates to place it on the globe.
 */
function SphereToEuclodCord( node , latitude, longitude, earthRotation ) {

  // Uses + (Math.PI/2) to change the phase by 90 deg
  node.position.set(
	(3 * Math.sin( longitude * (Math.PI/180) + earthRotation + (Math.PI/2) ) * Math.sin( latitude * (Math.PI/180) + (Math.PI/2) )),
	3 * Math.cos( latitude  * (Math.PI/180) + (Math.PI/2) ),
	(3 * Math.cos( longitude * (Math.PI/180) + earthRotation + (Math.PI/2) ) * Math.sin( latitude * (Math.PI/180) + (Math.PI/2) ))
  );

  node.position.set(
	Earth.position.x + node.position.x,
	Earth.position.y + node.position.y,
	Earth.position.z + node.position.z
  );

} /* --- End of SphereToEuclodCord --- */

function EuclodcordToSphere( Vector ) {

	var unitVec = new THREE.Vector3( (Vector.x - Earth.position.x)/3, (Vector.y - Earth.position.y)/3, (Vector.z - Earth.position.z)/3 )

	var latitude = ( Math.acos(unitVec.y) - (Math.PI/2) ) / (Math.PI/180);
	var longitude = 360 + ( Math.acos(unitVec.z / ( Math.sin( latitude * (Math.PI/180) + (Math.PI/2) ) ) ) - (Math.PI/2) -  Earth.rotation.y ) / (Math.PI/180)

	return [latitude, longitude]
}


// Add event listener to the current webpage to run onWindowResize() function when the page is resized
window.addEventListener('resize', onWindowResize, false);

/* onWindowResize() Function
 * Parameters:
 *  - none
 * Returns:
 *  - none but it rerenders the canvas and resets the camera according to the new page size.
 */
function onWindowResize() {
  /*// calculate the new aspect ratio for the camera
  camera.aspect = canvasWidth / canvasHeight;*/

  /*div = document.getElementById("canvas");

  // calculate the new relative canvas width
  canvasWidth = div.clientWidth;
  // calculate the new relative canvas height
  canvasHeight = div.clientHeight;

  if (window.innerWidth>window.innerHeight) {
	FOV = (canvasWidth/canvasHeight) * 20 + 5;
	cameraOffsetMultiplier = 0.3;
  } else {
	FOV = 30;
	cameraOffsetMultiplier = 5.75;
  }

  //camera.fov = FOV;
  camera.setViewOffset(canvasWidth, canvasHeight, canvasWidth * cameraOffsetMultiplier, 0, canvasWidth, canvasHeight);

  // Update the camera properties
  camera.updateProjectionMatrix();

  // Readjust the renderer size
  renderer.setSize(canvasWidth, canvasHeight)
  // rerun the renderer with the new size
  renderer.render(scene, camera);*/
}

function textGradient() {
  var text = document.getElementById("texts").querySelectorAll("div:not(.inactive) > p");

  text = text[0];

  if (window.innerWidth/window.innerHeight < 1.5 && window.innerWidth > window.innerHeight) {
	
	text.style.backgroundClip = "text";

	var textGradientAdjust;
	var adjust;
	var textadjust;

	if (window.innerWidth > window.innerHeight) {
		textGradientAdjust = (1440*0.92 - window.innerWidth*0.552)/4;
		adjust = "-18.4vw"
		textadjust = 50 - (controls.getPolarAngle()/Math.PI - 0.5) * 25;
	} else {
		textGradientAdjust = window.innerHeight*2;
		adjust = "-425vw"
		textadjust = 50;
	}

	var earthAdjust = Earth.rotation.y/(Math.PI*2);

	var camAdjust = (controls.getAzimuthalAngle()+Math.PI)/(2*Math.PI);

	//console.log("Earth: " + earthAdjust);
	//console.log("Camera: " + camAdjust);

	if (earthAdjust < camAdjust || camAdjust < 1-earthAdjust) {
		
		text.style.background = "radial-gradient(circle at "+adjust+" " + textadjust + "%, #fff " + textGradientAdjust + "px, #555 38.6vw)";
	} else {
		text.style.background = "radial-gradient(circle at "+adjust+" " + textadjust + "%, #000 " + textGradientAdjust + "px, #555 38.6vw)";
	}
  } else {
	text.style.background = "#555";
  }
}

/* animate() Function
 * Parameters:
 *  - none
 * Returns:
 *  - none but it sets the animations for THREE.Mesh objects.
 */
function animate() {
  requestAnimationFrame( animate );

  // Calculate the current second of the day.
  const seconds = (dt.getUTCHours()*60 + dt.getUTCMinutes())*60 + dt.getUTCSeconds();

  // Set the current position of the sun with respect to earth using the second of the day.
  // (in other words set the rotation of the earth)

  sunPos.x =  (Math.cos((seconds/86400)*(2*Math.PI) + (Math.PI)));
  sunPos.y = -(Math.sin(0.6)*Math.cos((DOY/365)*Math.PI*2));
  sunPos.z = (Math.sin((seconds/86400)*(2*Math.PI) + (Math.PI)));

  const earthPos = Earth.position.clone();
  earthPos.normalize();
  sunPos.normalize();

  Earth.rotation.y = Math.PI + Math.acos( earthPos.dot(sunPos) );

  SphereToEuclodCord(node1, node1Latitude, node1Longitude, Earth.rotation.y);
  SphereToEuclodCord(node2, node2Latitude, node2Longitude, Earth.rotation.y);
  SphereToEuclodCord(node3, node3Latitude, node3Longitude, Earth.rotation.y);
  SphereToEuclodCord(node4, node4Latitude, node4Longitude, Earth.rotation.y);
  SphereToEuclodCord(node5, node5Latitude, node5Longitude, Earth.rotation.y);

  const moonPos = moon.position.clone();
  moonPos.normalize();

  // Set the moon's current rotation
  moon.rotation.y = Math.PI + Math.acos( moonPos.dot(sunPos) );

  // Create a realistic cloud effect by moving the clouds at 15/kmph and use the Day of the Year
  clouds.rotation.y = (( (DOY-1)*24 + dt.getUTCHours())/(40075/15))*Math.PI*2;

  // Adjust text gradient according to day night cycle
  textGradient()

  // Update the controls for the Orbital Camera to rotate automatically
  controls.update();

  // Rerender the scene
  renderer.render(scene, camera);
}

/* --- End of Functions --- */

// Call the animate() function
animate();