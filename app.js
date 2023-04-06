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
import { DomMesh, DomSprite } from './DomMesh.js';								// DomMesh Library

/* --- End of Imports --- */

/* --- Import Shaders --- */

import { EarthVertexShader_pars } from './shaders/earthVertexShaderExt_pars.glsl.js';		// MeshPhysicalMaterial Vertex Shader Parameter Extension
import { EarthVertexShader } from './shaders/earthVertexShaderExt.glsl.js';					// MeshPhysicalMaterial Vertex Shader Extension
import { EarthFragmentShader_pars } from './shaders/earthFragmentShaderExt_pars.glsl.js';	// MeshPhysicalMaterial Fragment Shader Parameter Extension
import { EarthFragmentShader } from './shaders/earthFragmentShaderExt2.glsl.js';			// MeshPhysicalMaterial Fragment Shader Extension

/* --- End of Import Shaders --- */

gsap.registerPlugin(ScrollToPlugin);

/* --- Loading Manager --- */

// Create a manager that checks texture loading
var manager = new THREE.LoadingManager();

// When the Texture Loading starts
manager.onStart = function ( url, itemsLoaded, itemsTotal ) {
	//console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
};

// When the Texture Loading finishes
manager.onLoad = function ( ) {
	//console.log( 'Loading complete!');
	const loadingScreen = document.getElementById( 'loading-screen' );
	loadingScreen.classList.add( 'fade-out' );
};

// When the Texture Loading is on progress
manager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
	//console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
	document.getElementById( 'loading-screen' ).querySelector( 'h1' ).textContent = 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.';
};

/* --- End of Loading Manager --- */

/* --- ShortCuts --- */

// Create a shortcut to load textures
const textureLoader = new THREE.TextureLoader(manager);
// Create a shortcut to create dates
const dt = new Date();

/* --- End of ShortCuts --- */

window.scrollY = 0;

/* --- Textures --- */

// 
const lensflareTexture = textureLoader.load( "./textures/lensflare.png" );		// LensFlare Texture

/* Textures are created by Tom Patterson and can be found on Natural Earth III - Texture Maps at
 * https://www.shadedrelief.com/natural3/pages/textures.html 
 */
const skySphereTexture = textureLoader.load( "./textures/starfield.jpeg" );		// Sky Sphere Texture
const earthDayTexture = textureLoader.load( "./textures/earth.jpeg" );			// Earth Day Texture
const earthNightTexture = textureLoader.load( "./textures/earth_night.jpeg" );	// Earth Night Texture
const earthBumpMapTexture = textureLoader.load("./textures/earth_elev.jpeg");	// Earth Elevation Texture
const atmosphereTexture = textureLoader.load( "./textures/glow.png" );			// Atmosphere Texture
const cloudTexture = textureLoader.load( "./textures/earth_clouds.jpeg" );		// Clouds Texture
const moonTexture = textureLoader.load( "./textures/moon.jpeg" );				// Moon Texture
const moonDarkTexture = textureLoader.load( "./textures/moon_dark.jpeg" );				// Moon Dark Texture

// Node Textures are created by the author of this document, Ozgur Tuna Ozturk
const node1Texture = textureLoader.load( "./signs/IstanbulSign.svg" );			// About Me Page Sign
const node2Texture = textureLoader.load( "./signs/ChangshuSign.svg" );			// Github Page Sign
const node3Texture = textureLoader.load( "./signs/ThimphuSign.svg" );			// Super Fablab Page Sign
const node4Texture = textureLoader.load( "./signs/WheatonSign.svg" );			// Fab Academy Page Sign
const node5Texture = textureLoader.load( "./signs/FranceSign.svg" );			// WWI Pilgrimage Page Sign

/* --- End of Textures --- */

/* --- Global Variables --- */

var aspectRatio = 1;	// Aspect ratio of the screen relative to with menu ON/OFF
var FOV = 45;			// Default FOV of the scene

var canvasWidth = document.body.clientWidth * aspectRatio;		// Save default canvas width;
var canvasHeight = document.body.clientHeight * aspectRatio;	// Save default canvas height

// Define a variable to hold the multiplier that changes the FOV according to the canvasWidth and canvasHeihgt
var cameraMultiplier = 0;
if (canvasWidth > canvasHeight) {
	// For larger devices like computers
	cameraMultiplier = ( ( 1440/821 ) / ( canvasWidth / canvasHeight ) );
} else {
	// For smaller devices like phones
	cameraMultiplier = ( ( 1440/821 ) / ( canvasHeight / canvasWidth/2 ) );
}

// The radius of camera from the origin (0,0,0)
//var cameraRadius = 1.65 * cameraMultiplier;
var cameraRadius = 10 * cameraMultiplier;

/* --- End of Global Variables --- */

/* --- Renderer --- */

// Create a THREE JS WebGL Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true } );
// Renderer Settings
renderer.setSize( document.body.clientWidth * aspectRatio, document.body.clientHeight * aspectRatio ); // Renderer Aspect Ratio
renderer.shadowMap.enabled = true; // Renderer Shadow options
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
document.getElementById("main").appendChild( renderer.domElement ); // Instantiate the Renderer on the Webpage

/* --- End of Renderer --- */

/* --- Camera --- */

// Create a THREE JS Scene
const scene = new THREE.Scene();
// Create a THREE JS Perspective Camera
const camera = new THREE.PerspectiveCamera( FOV, document.body.clientWidth / document.body.clientHeight, 0.1, 1000 );
// Adjust the camera FOV according to the aspect ratio of the device
if (canvasWidth > canvasHeight) {
	// Adjust for larger devices like computers
	camera.fov = FOV * cameraMultiplier
} else {
	// Adjust for smaller devices like phones
	camera.fov = FOV * cameraMultiplier / 2
}

// Instantiate the Camera in the scene
scene.add( camera );
// Set the initial Camera Position so the Northern Hemisphere is in focus
camera.position.z = cameraRadius * Math.cos(Math.PI/6);
camera.position.y = cameraRadius * Math.sin(Math.PI/6);
// Create an Orbital Camera Controls
const controls = new OrbitControls(camera, renderer.domElement);
// Lock the Camera scroll at 5 units away from the center
/*controls.maxDistance = cameraRadius; 
controls.minDistance = cameraRadius;*/
controls.enableZoom = false;
// Enable Automatic Rotation feature
controls.autoRotate = true;
// Set the Automatic Rotation Speed to 0.25 CounterClockWise
controls.autoRotateSpeed = -0.25;
// Disable the Pan Feature so that the User cannot wonder around.
controls.enablePan = false;

/* --- End of Camera --- */

/* --- Sun --- */

// Calculate the current day of the year
const DOY = Math.ceil((dt - new Date(dt.getFullYear(),0,1)) / 86400000);
// Create a new THREE.DirectionalLight object to imitate the Sun
const sunLight = new THREE.DirectionalLight( 0xffffff, 0.5, 2000 );
// Set the position of the sunLight Object with respect to Earth
//sunLight.position.set(100*Math.cos(Math.PI), -100*(Math.sin(0.4101524)*Math.cos((DOY/365)*Math.PI*2)), 100*Math.sin(Math.PI));

// Instantiate the sunLight Object into the scene
scene.add(sunLight);
// Create a THREE JS LensFlare Object to create a lensflare effect when looked at the sun
const sunFlare = new Lensflare();
// Add the LensFlare Texture and Settings
sunFlare.addElement( new LensflareElement( lensflareTexture, 700, 0 ) );
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

/* --- SkySphere --- */

// Create a new THREE.Mesh Sphere object and render a 360 image of the night sky
const skySphere = new THREE.Mesh( new THREE.SphereGeometry(305), new THREE.MeshBasicMaterial({ color: 0xffffff, map: skySphereTexture, }) );
// Only render the texture in the inside of the Sphere
skySphere.material.side = THREE.BackSide;
// Instantiate the skySphere
scene.add(skySphere);

/* --- End of SkySphere --- */

/* --- Earth --- */

// --- Earth Base ---
// Create a new MeshPhysicalMaterial for Earth
const earthMaterial = new THREE.MeshPhysicalMaterial( {
	color: 0xffffff,                                   // Set Moon's Base Color White
	transparent: false,   
  	metalness: 0.0,                                    // 0.0% Metalness
  	roughness: 1.0,                                    // 100% Roughness
  	clearcoat: 1.0,                                    // 100% Clearcoat
  	clearcoatRoughness: 1.0,                           // 100% ClearcoatRoughness
  	reflectivity: 0.0,                                 // 0.0% Reflectivity
	bumpMap: earthBumpMapTexture,					   // Earth Elevation Texture
	bumpScale: 0.25,									   // Earth Elevation Scale
} );

var sunPos = new THREE.Vector3(Math.cos(Math.PI), -(Math.sin(0.4101524)*Math.cos((DOY/365)*Math.PI*2)), Math.sin(Math.PI));

// Before compiling the website add specifics to the MeshPhysicalMaterial of Earth
earthMaterial.onBeforeCompile = function ( shader ) {
	// Insert custom Uniforms
	shader.uniforms.sunDirection = { value: sunPos };
	shader.uniforms.dayTexture = { value: earthDayTexture };
	shader.uniforms.nightTexture = { value: earthNightTexture };

	// Insert the custom Vertex Shader Extensions
	shader.vertexShader = EarthVertexShader_pars + shader.vertexShader; // Insert the uniforms into the vertex shader
	shader.vertexShader = shader.vertexShader.replace('void main() {', EarthVertexShader); // Insert the vertex shader extension

	// Insert the custom Fragment Shader Extensions
	shader.fragmentShader = EarthFragmentShader_pars + shader.fragmentShader; // Insert the uniforms into the fragment shader
	// Change the definition for diffuseColor to insert our custom day/night texture mix
	shader.fragmentShader = shader.fragmentShader.replace('vec4 diffuseColor = vec4( diffuse, opacity );', EarthFragmentShader); // Insert the fragment shader extension

	// Make sure to update the shader data
	earthMaterial.userData.shader = shader;
	shader.needsUpdate=true;
};

// Instantiate the Earth variable as a new THREE.Mesh using the custom MeshPhysicalMaterial
const Earth = new DomMesh( new THREE.SphereGeometry( 3, 50, 50 ), earthMaterial, camera );

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
atmosphere.scale.set(9, 9, 1.0);
// Add the Atmosphere to the Clouds object
Earth.add(atmosphere); // this centers the glow at the mesh

// --- Clouds ---
// Create a THREE.MeshPhysicalMaterial for the clouds.
// The reason we use an advance material properties for clouds is 
// so that there is shadow casting on the clouds due to Earth
var cloudMaterial = new THREE.MeshPhysicalMaterial({
  map: cloudTexture, // Load the Cloud Texture
  color: 0xffffff,                                           // White Clouds
  transparent: true,                                         // Must show the Earth Underneath
  blending: THREE.AdditiveBlending,                          // Blends with the environment behind using THREE.AdditiveBlending
  metalness: 0.75,                                            // 0.0% Metalness
  roughness: 1.0,                                            // 100% Roughness
  clearcoat: 1.0,                                            // 100% Clearcoat
  clearcoatRoughness: 1.0,                                   // 100% ClearcoatRoughness
  reflectivity: 0.0,                                         // 0.0% reflectivity
  depthWrite: false,                                         // Lightblocking off
});
// Create a new THREE.Mesh object for the clouds using the cloudMaterial
var clouds = new THREE.Mesh( new THREE.SphereGeometry(3.01, 50, 50), cloudMaterial );
// Instantiate the clouds on the scene
scene.add(clouds);
// Instantiate the Earth on the scene
scene.add( Earth );
Earth.position.set(100*Math.cos(((DOY)/365)*Math.PI*2 - Math.PI/2), 0, 100*Math.sin((DOY/365)*Math.PI*2 - Math.PI/2));
clouds.position.set( Earth.position.x, Earth.position.y, Earth.position.z );

gsap.to(camera.position, {
	z: Earth.position.z + cameraRadius * Math.cos(Math.PI/6),
	y: Earth.position.y + cameraRadius * Math.sin(Math.PI/6),
	x: Earth.position.x,
	duration: 1.7
});
controls.target.set(Earth.position.x, Earth.position.y, Earth.position.z);

var onEarth = true;

// --- Earth Scripts ---
// Create a clickable moon
Earth.MouseEnter(() => {
	if (!onEarth)
	cursorFilled.children[0].classList.toggle("change");
});
Earth.MouseLeave(() => {
	if (!onEarth)
	cursorFilled.children[0].classList.toggle("change");
});

const homePage = document.querySelector('#home');
const aboutPage = document.querySelector('#about');

function earthScript() {
	if (!onEarth) {
		gsap.to(camera.position, {
			z: Earth.position.z + cameraRadius * Math.cos(Math.PI/6),
			y: Earth.position.y + cameraRadius * Math.sin(Math.PI/6),
			x: Earth.position.x,
			duration: 1.7
		});
		
		controls.target.set(Earth.position.x, Earth.position.y, Earth.position.z);

		gsap.to(window, {
			scrollTo:"#home",
			duration: 1.7
		});

		gsap.to( "#home", {
			opacity: 1,
			duration: 1.7
		});
		gsap.to( "#about", {
			opacity: 0,
			duration: 1.7
		});

		onEarth = true;
	}
}
Earth.MouseDown(earthScript);
// --- End of Moon Scripts ---

/* --- End of Earth --- */

/* --- Moon --- */

// Create a THREE.MeshPhysicalMaterial for moon to have moon cycles due to Shadow Casting
const moonMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,                                   // Set Moon's Base Color White
  //map: moonTexture, 								 // Load the Moon texture
  transparent: false,   							 // Set transparancy to false
  metalness: 0.0,                                    // 0.0% Metalness
  roughness: 1.0,                                    // 100% Roughness
  clearcoat: 1.0,                                    // 100% Clearcoat
  clearcoatRoughness: 1.0,                           // 100% ClearcoatRoughness
  reflectivity: 0.0,                                 // 0.0% Reflectivity
});
moonMaterial.onBeforeCompile = function ( shader ) {
	// Insert custom Uniforms
	shader.uniforms.sunDirection = { value: sunPos };
	shader.uniforms.dayTexture = { value: moonTexture };
	shader.uniforms.nightTexture = { value: moonDarkTexture };

	// Insert the custom Vertex Shader Extensions
	shader.vertexShader = EarthVertexShader_pars + shader.vertexShader; // Insert the uniforms into the vertex shader
	shader.vertexShader = shader.vertexShader.replace('void main() {', EarthVertexShader); // Insert the vertex shader extension

	// Insert the custom Fragment Shader Extensions
	shader.fragmentShader = EarthFragmentShader_pars + shader.fragmentShader; // Insert the uniforms into the fragment shader
	// Change the definition for diffuseColor to insert our custom day/night texture mix
	shader.fragmentShader = shader.fragmentShader.replace('vec4 diffuseColor = vec4( diffuse, opacity );', EarthFragmentShader); // Insert the fragment shader extension

	// Make sure to update the shader data
	moonMaterial.userData.shader = shader;
	shader.needsUpdate=true;
};
// Create a THREE.Mesh Sphere object with moonmaterial
const moon = new DomMesh( new THREE.SphereGeometry(0.5), moonMaterial, camera );
// Set the moon's current position using the Day of the Year to find the exact spot on the Orbit
moon.position.set(Earth.position.x + 30*Math.cos((DOY/27)*Math.PI*2), Earth.position.y + 30*Math.sin(5.14*Math.PI/180)*Math.cos((DOY/27)*Math.PI*2), Earth.position.z + 30*Math.sin((DOY/27)*Math.PI*2));
// Instantiate moon
scene.add(moon);

// --- Moon Scripts ---
// Create a clickable moon
moon.MouseEnter(() => {
	if (onEarth)
	cursorFilled.children[0].classList.toggle("change");
});
moon.MouseLeave(() => {
	if (onEarth)
	cursorFilled.children[0].classList.toggle("change");
});
function moonScript() {
	if (onEarth) {
		gsap.to(camera.position, {
			z: moon.position.z + 1,
			y: moon.position.y + 1,
			x: moon.position.x + 1,
			duration: 1.7
		});
		
		controls.target.set(moon.position.x, moon.position.y, moon.position.z);

		gsap.to(window, {
			scrollTo:"#about",
			duration: 1.7
		});

		gsap.to( "#home", {
			opacity: 0,
			duration: 1.7
		});
		gsap.to( "#about", {
			opacity: 1,
			duration: 1.7
		});

		onEarth = false;
	}
}
moon.MouseDown(moonScript);
// --- End of Moon Scripts ---

/* --- End of Moon --- */

/* --- Nodes --- */

const nodeGeometry = new THREE.SphereGeometry(0.05 * cameraMultiplier);

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

var node1TextMaterial = new THREE.SpriteMaterial({ 
	map: node1Texture,  // Load the Page-City Texture
	color: 0xffffff,                                   // The default color is white
  	transparent: true,                                 // Does show behind
  	blending: THREE.AdditiveBlending,                  // Blends with the environment behind using THREE.AdditiveBlending
  	depthWrite: false,                                 // Lightblocking off
});
// Create a new THREE.Sprite using the node1TextMaterial
var node1Text = new DomSprite( node1TextMaterial, camera );
// Change the scale of the Sprite so that it shows behind the Earth and looks realistic
node1Text.scale.set(1*cameraMultiplier, 0.5*cameraMultiplier, 1.0);
// Set the anchor to the bottom left corner
node1Text.center.set(0,0);
// Add the node1Text to the node1 object
node1.add(node1Text); // this centers the glow at the mesh

var node2TextMaterial = new THREE.SpriteMaterial({ 
	map: node2Texture,  // Load the Page-City Texture
	color: 0xffffff,                                   // The default color is white
  	transparent: true,                                 // Does show behind
  	blending: THREE.AdditiveBlending,                  // Blends with the environment behind using THREE.AdditiveBlending
  	depthWrite: false,                                 // Lightblocking off
});
// Create a new THREE.Sprite using the node1TextMaterial
var node2Text = new DomSprite( node2TextMaterial, camera );
// Change the scale of the Sprite so that it shows behind the Earth and looks realistic
node2Text.scale.set(1*cameraMultiplier, 0.5*cameraMultiplier, 1.0);
// Set the anchor to the bottom left corner
node2Text.center.set(0,0);
// Add the node1Text to the node1 object
node2.add(node2Text); // this centers the glow at the mesh

var node3TextMaterial = new THREE.SpriteMaterial({ 
	map: node3Texture,  // Load the Page-City Texture
	color: 0xffffff,                                   // The default color is white
  	transparent: true,                                 // Does show behind
  	blending: THREE.AdditiveBlending,                  // Blends with the environment behind using THREE.AdditiveBlending
  	depthWrite: false,                                 // Lightblocking off
});
// Create a new THREE.Sprite using the node1TextMaterial
var node3Text = new DomSprite( node3TextMaterial, camera );
// Change the scale of the Sprite so that it shows behind the Earth and looks realistic
node3Text.scale.set(1*cameraMultiplier, 0.5*cameraMultiplier, 1.0);
// Set the anchor to the bottom left corner
node3Text.center.set(0,0);
// Add the node1Text to the node1 object
node3.add(node3Text); // this centers the glow at the mesh

var node4TextMaterial = new THREE.SpriteMaterial({ 
	map: node4Texture,  // Load the Page-City Texture
	color: 0xffffff,                                   // The default color is white
  	transparent: true,                                 // Does show behind
  	blending: THREE.AdditiveBlending,                  // Blends with the environment behind using THREE.AdditiveBlending
  	depthWrite: false,                                 // Lightblocking off
});
// Create a new THREE.Sprite using the node1TextMaterial
var node4Text = new DomSprite( node4TextMaterial, camera );
// Change the scale of the Sprite so that it shows behind the Earth and looks realistic
node4Text.scale.set(1*cameraMultiplier, 0.5*cameraMultiplier, 1.0);
// Set the anchor to the bottom left corner
node4Text.center.set(0,0);
// Add the node1Text to the node1 object
node4.add(node4Text); // this centers the glow at the mesh

var node5TextMaterial = new THREE.SpriteMaterial({ 
	map: node5Texture,  // Load the Page-City Texture
	color: 0xffffff,                                   // The default color is white
  	transparent: true,                                 // Does show behind
  	blending: THREE.AdditiveBlending,                  // Blends with the environment behind using THREE.AdditiveBlending
  	depthWrite: false,                                 // Lightblocking off
});
// Create a new THREE.Sprite using the node1TextMaterial
var node5Text = new DomSprite( node5TextMaterial, camera );
// Change the scale of the Sprite so that it shows behind the Earth and looks realistic
node5Text.scale.set(1*cameraMultiplier, 0.5*cameraMultiplier, 1.0);
// Set the anchor to the bottom left corner
node5Text.center.set(0,0);
// Add the node1Text to the node1 object
node5.add(node5Text); // this centers the glow at the mesh

/* --- End of Node Tags --- */

/* --- DOM Events --- */

// Check if the current browser is Safari
var isSafari = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 && navigator.userAgent && navigator.userAgent.indexOf('CriOS') == -1 && navigator.userAgent.indexOf('FxiOS') == -1;

// Get the center area of the cursor for dynamic filling when hovering a node
const cursorFilled = document.querySelector('.filled');

// Link node1 with a url with white as default color and gray as highligh color
node1.MouseEnter(() => {
	node1.material.color.set( 0x555555 );
	node1Text.material.color.set( 0x555555 );
	cursorFilled.children[0].classList.toggle("change");
});
node1.MouseLeave(() => {
	node1.material.color.set( 0xffffff );
	node1Text.material.color.set( 0xffffff );
	cursorFilled.children[0].classList.toggle("change");
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
	node2Text.material.color.set( 0x555555 );
	cursorFilled.children[0].classList.toggle("change");
});
node2.MouseLeave(() => {
	node2.material.color.set( 0xffffff );
	node2Text.material.color.set( 0xffffff );
	cursorFilled.children[0].classList.toggle("change");
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
	node3Text.material.color.set( 0x555555 );
	cursorFilled.children[0].classList.toggle("change");
});
node3.MouseLeave(() => {
	node3.material.color.set( 0xffffff );
	node3Text.material.color.set( 0xffffff );
	cursorFilled.children[0].classList.toggle("change");
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
	node4Text.material.color.set( 0x555555 );
	cursorFilled.children[0].classList.toggle("change");
});
node4.MouseLeave(() => {
	node4.material.color.set( 0xffffff );
	node4Text.material.color.set( 0xffffff );
	cursorFilled.children[0].classList.toggle("change");
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
	node5Text.material.color.set( 0x555555 );
	cursorFilled.children[0].classList.toggle("change");
});
node5.MouseLeave(() => {
	node5.material.color.set( 0xffffff );
	node5Text.material.color.set( 0xffffff );
	cursorFilled.children[0].classList.toggle("change");
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

// Add event listener to the current webpage to run onWindowResize() function when the page is resized
window.addEventListener('resize', onWindowResize, false);

/* onWindowResize() Function
 * Parameters:
 *  - none
 * Returns:
 *  - none but it rerenders the canvas and resets the camera according to the new page size.
 */
function onWindowResize() {
  // calculate the new aspect ratio for the camera
  camera.aspect = document.body.clientWidth / document.body.clientHeight;

  // calculate the new relative canvas width
  canvasWidth = document.body.clientWidth * aspectRatio;
  // calculate the new relative canvas height
  canvasHeight = document.body.clientHeight * aspectRatio;

  // Set the camera FOV
  if (canvasWidth > canvasHeight) {
	cameraMultiplier = ( ( 1440/821 ) / ( canvasWidth / canvasHeight ) );
	// Adjust for larger devices like computers
	camera.fov = FOV * cameraMultiplier
  } else {
	cameraMultiplier = ( ( 1440/821 ) / ( canvasHeight / canvasWidth/2 ) );
	// Adjust for smaller devices like phones
	camera.fov = FOV * cameraMultiplier / 2
  }

  cameraRadius = 10 * cameraMultiplier;

  // Update the camera properties
  camera.updateProjectionMatrix();

  // Readjust the renderer size
  renderer.setSize(document.body.clientWidth*aspectRatio, document.body.clientHeight*aspectRatio)
  // rerun the renderer with the new size
  renderer.render(scene, camera);
}

// Get the cursor elements
const cursorRounded = document.querySelector('.rounded');
const cursorPointed = document.querySelector('.pointed');

// Store the Cursor Pos
var mouseY = 0;
var mouseX = 0;

// When the cursor moves update the Position variables
const moveCursor = (e) => {
	mouseY = e.clientY;
	mouseX = e.clientX;
}
window.addEventListener('mousemove', moveCursor);
// Store the current mouse angle 
var mouseAngle = 0;

/* animate() Function
 * Parameters:
 *  - none
 * Returns:
 *  - none but it sets the animations for THREE.Mesh objects.
 */
function animate() {
  requestAnimationFrame( animate );

  // Fail safe for the mouseangle
  if (mouseAngle > 360) {
	mouseAngle = 0;
  }

  // Calculate the current second of the day.
  const seconds = (dt.getUTCHours()*60 + dt.getUTCMinutes())*60 + dt.getUTCSeconds();

  // Set the current position of the sun with respect to earth using the second of the day.
  // (in other works set the rotation of the earth) 
  //sunLight.position.x = 100*(Math.cos((seconds/86400)*(2*Math.PI) + (Math.PI)));
  //sunLight.position.z = 100*(Math.sin((seconds/86400)*(2*Math.PI) + (Math.PI)));

  sunPos.x =  (Math.cos((seconds/86400)*(2*Math.PI) + (Math.PI)));
  sunPos.z = (Math.sin((seconds/86400)*(2*Math.PI) + (Math.PI)));

  const earthPos = Earth.position.clone();
  earthPos.normalize();
  sunPos.normalize();
  Earth.rotation.y = Math.acos( earthPos.dot(sunPos) ) - Math.PI;

  SphereToEuclodCord(node1, node1Latitude, node1Longitude, Earth.rotation.y);
  SphereToEuclodCord(node2, node2Latitude, node2Longitude, Earth.rotation.y);
  SphereToEuclodCord(node3, node3Latitude, node3Longitude, Earth.rotation.y);
  SphereToEuclodCord(node4, node4Latitude, node4Longitude, Earth.rotation.y);
  SphereToEuclodCord(node5, node5Latitude, node5Longitude, Earth.rotation.y);

  // Set the position of the moon's orbit using the Day of the Year
  moon.position.x = Earth.position.x + 25*Math.sin((DOY/27)*Math.PI*2 - Math.PI/2);
  moon.position.z = Earth.position.y + 25*Math.cos((DOY/27)*Math.PI*2 - Math.PI/2);

  const moonPos = moon.position.clone();
  moonPos.normalize();

  // Set the moon's current rotation
  //moon.rotation.y = (DOY/27)*Math.PI*2;
  moon.rotation.y = Math.acos( moonPos.dot(sunPos) ) - Math.PI

  // Create a realistic cloud effect by moving the clouds at 15/kmph and use the Day of the Year
  clouds.rotation.y = (( (DOY-1)*24 + dt.getUTCHours())/(40075/15))*Math.PI*2

  // Calculate the positions of the mouse span
  cursorFilled.style.transform = `translate3d(${mouseX - 10}px, ${mouseY - 10}px, 0)`;
  cursorRounded.style.transform = `translate3d(${mouseX - 17}px, ${mouseY - 37}px, 0)`;
  cursorPointed.style.transform = `translate3d(${(mouseX - 4) + 25*Math.cos( mouseAngle * (Math.PI/180) ) }px, ${(mouseY - 55) + 25*Math.sin( mouseAngle * (Math.PI/180) )}px, 0)`;

  // Update the controls for the Orbital Camera to rotate automatically
  controls.update();

  // Rerender the scene
  renderer.render(scene, camera);

  // Increment the angle
  mouseAngle++;
}

/* --- End of Functions --- */

// Call the animate() function
animate();

/* --- On Screen Button Controls --- */

// Get the on screen buttons
const nav = document.getElementById('nav')
const home = document.getElementById('homeTag');
const about = document.getElementById('aboutTag');
const expertise = document.getElementById('expertiseTag');
const experience = document.getElementById('experienceTag');
const contact = document.getElementById('contactTag');

home.onmouseenter = function(){
	cursorFilled.children[0].classList.toggle("change");

	nav.children[0].classList.toggle("navChange");
	nav.children[2].classList.toggle("navChange");
	nav.children[3].classList.toggle("navChange");
	nav.children[4].classList.toggle("navChange");
	nav.children[5].classList.toggle("navChange");
	nav.children[6].classList.toggle("navChange");
	nav.children[7].classList.toggle("navChange");
	nav.children[8].classList.toggle("navChange");
	nav.children[9].classList.toggle("navChange");
	nav.children[10].classList.toggle("navChange");
};

home.onmouseleave = function(){
	cursorFilled.children[0].classList.toggle("change");

	nav.children[0].classList.toggle("navChange");
	nav.children[2].classList.toggle("navChange");
	nav.children[3].classList.toggle("navChange");
	nav.children[4].classList.toggle("navChange");
	nav.children[5].classList.toggle("navChange");
	nav.children[6].classList.toggle("navChange");
	nav.children[7].classList.toggle("navChange");
	nav.children[8].classList.toggle("navChange");
	nav.children[9].classList.toggle("navChange");
	nav.children[10].classList.toggle("navChange");
};

home.onmousedown = function() {
	if (!onEarth) {
		earthScript();
		cursorFilled.children[0].classList.toggle("change");
	}
}

about.onmouseenter = function(){
	cursorFilled.children[0].classList.toggle("change");

	nav.children[0].classList.toggle("navChange");
	nav.children[1].classList.toggle("navChange");
	nav.children[2].classList.toggle("navChange");
	nav.children[4].classList.toggle("navChange");
	nav.children[5].classList.toggle("navChange");
	nav.children[6].classList.toggle("navChange");
	nav.children[7].classList.toggle("navChange");
	nav.children[8].classList.toggle("navChange");
	nav.children[9].classList.toggle("navChange");
	nav.children[10].classList.toggle("navChange");
};

about.onmouseleave = function(){
	cursorFilled.children[0].classList.toggle("change");

	nav.children[0].classList.toggle("navChange");
	nav.children[1].classList.toggle("navChange");
	nav.children[2].classList.toggle("navChange");
	nav.children[4].classList.toggle("navChange");
	nav.children[5].classList.toggle("navChange");
	nav.children[6].classList.toggle("navChange");
	nav.children[7].classList.toggle("navChange");
	nav.children[8].classList.toggle("navChange");
	nav.children[9].classList.toggle("navChange");
	nav.children[10].classList.toggle("navChange");
};

about.onmousedown = function() {
	if (onEarth) {
		moonScript();
		cursorFilled.children[0].classList.toggle("change");
	}
}

expertise.onmouseenter = function(){
	cursorFilled.children[0].classList.toggle("change");

	nav.children[0].classList.toggle("navChange");
	nav.children[1].classList.toggle("navChange");
	nav.children[2].classList.toggle("navChange");
	nav.children[3].classList.toggle("navChange");
	nav.children[4].classList.toggle("navChange");
	nav.children[6].classList.toggle("navChange");
	nav.children[7].classList.toggle("navChange");
	nav.children[8].classList.toggle("navChange");
	nav.children[9].classList.toggle("navChange");
	nav.children[10].classList.toggle("navChange");
};

expertise.onmouseleave = function(){
	cursorFilled.children[0].classList.toggle("change");

	nav.children[0].classList.toggle("navChange");
	nav.children[1].classList.toggle("navChange");
	nav.children[2].classList.toggle("navChange");
	nav.children[3].classList.toggle("navChange");
	nav.children[4].classList.toggle("navChange");
	nav.children[6].classList.toggle("navChange");
	nav.children[7].classList.toggle("navChange");
	nav.children[8].classList.toggle("navChange");
	nav.children[9].classList.toggle("navChange");
	nav.children[10].classList.toggle("navChange");
};

expertise.onmousedown = function() {

};

experience.onmouseenter = function(){
	cursorFilled.children[0].classList.toggle("change");

	nav.children[0].classList.toggle("navChange");
	nav.children[1].classList.toggle("navChange");
	nav.children[2].classList.toggle("navChange");
	nav.children[3].classList.toggle("navChange");
	nav.children[4].classList.toggle("navChange");
	nav.children[5].classList.toggle("navChange");
	nav.children[6].classList.toggle("navChange");
	nav.children[8].classList.toggle("navChange");
	nav.children[9].classList.toggle("navChange");
	nav.children[10].classList.toggle("navChange");
};

experience.onmouseleave = function(){
	cursorFilled.children[0].classList.toggle("change");

	nav.children[0].classList.toggle("navChange");
	nav.children[1].classList.toggle("navChange");
	nav.children[2].classList.toggle("navChange");
	nav.children[3].classList.toggle("navChange");
	nav.children[4].classList.toggle("navChange");
	nav.children[5].classList.toggle("navChange");
	nav.children[6].classList.toggle("navChange");
	nav.children[8].classList.toggle("navChange");
	nav.children[9].classList.toggle("navChange");
	nav.children[10].classList.toggle("navChange");
};

contact.onmouseenter = function(){
	cursorFilled.children[0].classList.toggle("change");

	nav.children[0].classList.toggle("navChange");
	nav.children[1].classList.toggle("navChange");
	nav.children[2].classList.toggle("navChange");
	nav.children[3].classList.toggle("navChange");
	nav.children[4].classList.toggle("navChange");
	nav.children[5].classList.toggle("navChange");
	nav.children[6].classList.toggle("navChange");
	nav.children[7].classList.toggle("navChange");
	nav.children[8].classList.toggle("navChange");
	nav.children[10].classList.toggle("navChange");
};

contact.onmouseleave = function(){
	cursorFilled.children[0].classList.toggle("change");

	nav.children[0].classList.toggle("navChange");
	nav.children[1].classList.toggle("navChange");
	nav.children[2].classList.toggle("navChange");
	nav.children[3].classList.toggle("navChange");
	nav.children[4].classList.toggle("navChange");
	nav.children[5].classList.toggle("navChange");
	nav.children[6].classList.toggle("navChange");
	nav.children[7].classList.toggle("navChange");
	nav.children[8].classList.toggle("navChange");
	nav.children[10].classList.toggle("navChange");
};

var temp = 0;
var directionControl = 0;
window.onscroll = function(event) {

	gsap.to(camera.position, {
		z: Earth.position.z + cameraRadius * Math.cos(Math.PI/6),
		y: Earth.position.y + cameraRadius * Math.sin(Math.PI/6),
		x: Earth.position.x,
		duration: 0
	});
	camera.position.lerp( new THREE.Vector3( moon.position.x + 1, moon.position.y + 1, moon.position.z + 1 ), window.pageYOffset/window.innerHeight );

	if (window.pageYOffset > temp) {

		if (directionControl == 0) {
			directionControl = 1;
			cursorFilled.children[0].classList.toggle("change");
		}

		
		controls.target.set(moon.position.x, moon.position.y, moon.position.z);

		gsap.to( "#home", {
			opacity: 0,
			duration: 1.7
		});
		gsap.to( "#about", {
			opacity: 1,
			duration: 1.7
		});

		onEarth = false;

	} else if (window.pageYOffset < temp) {

		if (directionControl == 1) {
			directionControl = 0;
			cursorFilled.children[0].classList.toggle("change");
		}


		controls.target.set(Earth.position.x, Earth.position.y, Earth.position.z);

		gsap.to( "#home", {
			opacity: 1,
			duration: 1.7
		});
		gsap.to( "#about", {
			opacity: 0,
			duration: 1.7
		});

		onEarth = true;
	}

	temp = window.pageYOffset;
};

