/* app.js
 * Created by Ozgur Tuna Ozturk
 * Last edited on 02/12/2022
 * This Javascript file is meant to create the distribution page for all the other
 * pages owned by Tuna. This Javascript file uses THREE JS to create a 3D simulation
 * of the Earth, the Moon, the Sun, and location linked node points for each website.
 */

/* --- Imports --- */

import * as THREE from 'https://unpkg.com/three@0.138.0/build/three.module.js';
import { OrbitControls } from "./orbitControls.js";
import { Lensflare, LensflareElement } from './lensflare.js';
import { DomMesh, DomSprite } from './DomMesh.js';

/* --- End of Imports --- */

/* --- Shaders --- */

// Create the Vertex Shader
const EarthVertexShader = `

// Import the Position of the sun
uniform vec3 sunDirection;

// Create global variables
varying vec2 vUv; // Share the UV of the Earth
varying vec3 lightNormal; // Share the Normal Vector of the Earth in relation to the Sun

void main() {
  vUv = uv; // Share the UV
  vec4 mvPosition = (modelViewMatrix) * vec4(position, 1.0); // get the ModelViewPosition
  lightNormal = normalize(sunDirection * vec3(1,1,1)) * normal; // Get the ModelNormal with respect to Sun's Position
  gl_Position = projectionMatrix * mvPosition  ; // The Global Position of each verticies
}
`;

// Create Fragment Shader
const EarthFragmentShader = `

// The Day Time Texture of Earth
uniform sampler2D dayTexture;
// The Night Time Texture of Earth
uniform sampler2D nightTexture;

// Position of the Sun
uniform vec3 sunDirection;

// The UV of the Earth
varying vec2 vUv;
// The ModelNormal with respect to Sun's Position
varying vec3 lightNormal;

void main( void ) {
  vec3 dayColor = texture2D( dayTexture, vUv ).rgb;
  vec3 nightColor = texture2D( nightTexture, vUv ).rgb;

  // compute cosine sun to normal so -1 is away from sun and +1 is toward sun.
  float cosineAngleSunToNormal = dot(lightNormal, vec3(1,1,1));

  // sharpen the edge beween the transition
  cosineAngleSunToNormal = clamp( cosineAngleSunToNormal * 10.0, -1.0, 1.0);

  // convert to 0 to 1 for mixing
  float mixAmount = cosineAngleSunToNormal * 0.5 + 0.5 ;

  // Select day or night texture based on mix.
  vec3 color = mix( nightColor, dayColor, mixAmount );

  // Map the Sphere with the Textures
  gl_FragColor = vec4( color, 1.0 );
}
`;

/* --- End of Shaders --- */

var manager = new THREE.LoadingManager();

manager.onStart = function ( url, itemsLoaded, itemsTotal ) {

	//console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
};

manager.onLoad = function ( ) {

	//console.log( 'Loading complete!');
	const loadingScreen = document.getElementById( 'loading-screen' );
	loadingScreen.classList.add( 'fade-out' );
};


manager.onProgress = function ( url, itemsLoaded, itemsTotal ) {

	//console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
};

/* --- ShortCuts --- */

// Create a shortcut to load textures
const textureLoader = new THREE.TextureLoader(manager);
// Create a shortcut to create dates
const dt = new Date();

/* --- End of ShortCuts --- */

/* --- Textures --- */

const lensflareTexture = textureLoader.load( "./textures/lensflare.png" );		// LensFlare Texture
const skySphereTexture = textureLoader.load( "./textures/starfield.jpeg" );		// Sky Sphere Texture
const earthDayTexture = textureLoader.load( "http://shadedrelief.com/natural3/ne3_data/16200/textures/2_no_clouds_16k.jpg" );			// Earth Day Texture
const earthNightTexture = textureLoader.load( "./textures/earth_night.jpeg" );	// Earth Night Texture
const atmosphereTexture = textureLoader.load( "./textures/glow.png" );			// Atmosphere Texture
const cloudTexture = textureLoader.load( "./textures/earth_clouds.jpeg" );		// Clouds Texture
const moonTexture = textureLoader.load( "./textures/moon.jpeg" );				// Moon Texture
const node1Texture = textureLoader.load( "./signs/IstanbulSign.svg" );			// About Me Page Sign
const node2Texture = textureLoader.load( "./signs/ChangshuSign.svg" );			// Github Page Sign
const node3Texture = textureLoader.load( "./signs/ThimphuSign.svg" );			// Super Fablab Page Sign
const node4Texture = textureLoader.load( "./signs/WheatonSign.svg" );			// Fab Academy Page Sign

/* --- End of Textures --- */

/* --- Global Variables --- */

var aspectRatio = 1;

/* --- End of Global Variables --- */

/* --- Renderer --- */

// Create a THREE JS WebGL Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true } );
// Renderer Settings
renderer.setSize( document.body.clientWidth*aspectRatio, document.body.clientHeight*aspectRatio ); // Renderer Aspect Ratio
renderer.shadowMap.enabled = true; // Renderer Shadow options
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
document.getElementById("main").appendChild( renderer.domElement ); // Instantiate the Renderer on the Webpage

/* --- End of Renderer --- */

/* --- Camera --- */

// Create a THREE JS Scene
const scene = new THREE.Scene();
// Create a THREE JS Perspective Camera with 75 FOV
const camera = new THREE.PerspectiveCamera( 75, document.body.clientWidth*aspectRatio / document.body.clientHeight*aspectRatio, 0.1, 1000 );
// Instantiate the Camera in the scene
scene.add( camera );
// Set the initial Camera Position so the Northern Hemisphere is in focus
camera.position.z = 5*Math.cos(Math.PI/6);
camera.position.y = 5*Math.sin(Math.PI/6);
// Create an Orbital Camera Controls
const controls = new OrbitControls(camera, renderer.domElement);
// Lock the Camera scroll at 5 units away from the center
controls.maxDistance = 5; 
controls.minDistance = 5;
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
const sunLight = new THREE.DirectionalLight( 0xffffff, 1.5, 2000 );
// Set the position of the sunLight Object with respect to Earth
sunLight.position.set(100*Math.cos(Math.PI), -100*(Math.sin(0.4101524)*Math.cos((DOY/365)*Math.PI*2)), 100*Math.sin(Math.PI));
// Instantiate the sunLight Object into the scene
scene.add(sunLight);
// Create a THREE JS LensFlare Object to create a lensflare effect when looked at the sun
const sunFlare = new Lensflare();
// Add the LensFlare Texture and Settings
sunFlare.addElement( new LensflareElement( lensflareTexture, 700, 0 ) );
// Instantiate the LensFlare
sunLight.add(sunFlare);

/* --- End of Sun --- */

/* --- Atmospheric Lighting --- */

// Create a THREE.AmbientLight object to imitate the Atmospherical Light Reflections
const atmoLight = new THREE.AmbientLight( 0x404040 ); // soft white light
// Instantiate the atmoLight
scene.add( atmoLight );

/* --- End of Atmospheric Lighting --- */

/* --- SkySphere --- */

// Create a new THREE.Mesh Sphere object and render a 360 image of the night sky
const skySphere = new THREE.Mesh( new THREE.SphereGeometry(1000), new THREE.MeshBasicMaterial({ color: 0xffffff, map: skySphereTexture, }) );
// Only render the texture in the inside of the Sphere
skySphere.material.side = THREE.BackSide;
// Instantiate the skySphere
scene.add(skySphere);

/* --- End of SkySphere --- */

/* --- Earth --- */

// --- Earth Base ---
// Create Uniforms for Earth's Shader Material
const uniforms = {
  sunDirection: {value: sunLight.position }, // The current position of the Sun with respect to Earth
  dayTexture: { value: earthDayTexture }, // The day time texture of Earth
  nightTexture: { value: earthNightTexture } // The night time texture of Earth
};
// Create a THREE.ShaderMaterial for Earth
const earthMaterial = new THREE.ShaderMaterial({
  uniforms: uniforms, // Include the Uniforms
  vertexShader: EarthVertexShader, // Include the Vertex Shader
  fragmentShader: EarthFragmentShader, // Include the Fragment Shader
});
// Create a THREE.Mesh object using the custom earthMaterial
const Earth = new THREE.Mesh( new THREE.SphereGeometry( 3, 50, 50 ), earthMaterial );

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
atmosphere.scale.set(10, 10, 1.0);
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
  metalness: 0.0,                                            // 0.0% Metalness
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

/* --- End of Earth --- */

/* --- Moon --- */

// Create a THREE.MeshPhysicalMaterial for moon to have moon cycles due to Shadow Casting
const moonMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,                                   // Set Moon's Base Color White
  map: moonTexture, // Load the Moon texture
  metalness: 0.0,                                    // 0.0% Metalness
  roughness: 1.0,                                    // 100% Roughness
  clearcoat: 1.0,                                    // 100% Clearcoat
  clearcoatRoughness: 1.0,                           // 100% ClearcoatRoughness
  reflectivity: 0.0,                                 // 0.0% Reflectivity
});
// Create a THREE.Mesh Sphere object with moonmaterial
const moon = new THREE.Mesh( new THREE.SphereGeometry(1), moonMaterial );
// Set the moon's current position using the Day of the Year to find the exact spot on the Orbit
moon.position.set(30*Math.cos((DOY/27)*Math.PI*2), 30*Math.sin(5.14*Math.PI/180)*Math.cos((DOY/27)*Math.PI*2), 30*Math.sin((DOY/27)*Math.PI*2));
// Instantiate moon
scene.add(moon);

/* --- End of Moon --- */

/* --- Nodes --- */

const nodeGeometry = new THREE.SphereGeometry(0.05);

// --- Istanbul Node ---
const node1 = new DomMesh(nodeGeometry, new THREE.MeshBasicMaterial( { color: 0xffffff, } ), camera );
// Istanbul, Turkey Coordinates: 41.0082° N 28.9784° E
var node1Latitude = -41.0082;
var node1Longitude = 28.9784;
// Set Spherical Positions
SphereToEuclodCord(node1, node1Latitude, node1Longitude);
// Add the Node Group to the Scene
scene.add(node1);

// --- Changshu Node ---
const node2 = new DomMesh( nodeGeometry, new THREE.MeshBasicMaterial( { color: 0xffffff, } ), camera );
// Changshu, China Coordinates: 31.6538° N 120.7522° E
var node2Latitude = -31.6538;
var node2Longitude = 120.7522;
// Set Spherical Positions
SphereToEuclodCord(node2, node2Latitude, node2Longitude);
// Add the Node Group to the Scene
scene.add(node2);

// --- Thimphu Node ---
const node3 = new DomMesh( nodeGeometry, new THREE.MeshBasicMaterial( { color: 0xffffff, } ), camera );
// Thimphu, Bhutan Coordinates: 27.4716° N 89.6386° E
var node3Latitude = -27.4716;
var node3Longitude = 89.6386;
// Set Spherical Positions
SphereToEuclodCord(node3, node3Latitude, node3Longitude);
// Add the Node Group to the Scene
scene.add(node3);

// --- Wheaton Node ---
const node4 = new DomMesh( nodeGeometry, new THREE.MeshBasicMaterial( { color: 0xffffff, } ), camera );
// Wheaton College, Norton, USA Coordinates: 41.9672° N 71.1840° W
var node4Latitude = -41.9672;
var node4Longitude = -71.1840;
// Set Spherical Positions
SphereToEuclodCord(node4, node4Latitude, node4Longitude);
// Add the Node Group to the Scene
scene.add(node4);

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
node1Text.scale.set(1, 0.5, 1.0);
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
node2Text.scale.set(1, 0.5, 1.0);
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
node3Text.scale.set(1, 0.5, 1.0);
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
node4Text.scale.set(1, 0.5, 1.0);
// Set the anchor to the bottom left corner
node4Text.center.set(0,0);
// Add the node1Text to the node1 object
node4.add(node4Text); // this centers the glow at the mesh

/* --- End of Node Tags --- */

/* --- DOM Events --- */

// Link node1 with a url with white as default color and gray as highligh color
node1.MouseEnter(() => {
	node1.material.color.set( 0x555555 );
	node1Text.material.color.set( 0x555555 );
	document.body.style.cursor	= 'pointer';
});
node1.MouseLeave(() => {
	node1.material.color.set( 0xffffff );
	node1Text.material.color.set( 0xffffff );
	document.body.style.cursor	= 'default';
});
node1.MouseDown(() => {
	window.open("https://www.linkedin.com/in/ozgur-tuna-ozturk/", "_blank");
});

// Link node2 with a url white as default color and gray as highligh color
node2.MouseEnter(() => {
	node2.material.color.set( 0x555555 );
	node2Text.material.color.set( 0x555555 );
	document.body.style.cursor	= 'pointer';
});
node2.MouseLeave(() => {
	node2.material.color.set( 0xffffff );
	node2Text.material.color.set( 0xffffff );
	document.body.style.cursor	= 'default';
});
node2.MouseDown(() => {
	window.open("https://github.com/Tozturk18", "_blank");
});

// Link node3 with a url white as default color and gray as highligh color
node3.MouseEnter(() => {
	node3.material.color.set( 0x555555 );
	node3Text.material.color.set( 0x555555 );
	document.body.style.cursor	= 'pointer';
});
node3.MouseLeave(() => {
	node3.material.color.set( 0xffffff );
	node3Text.material.color.set( 0xffffff );
	document.body.style.cursor	= 'default';
});
node3.MouseDown(() => {
	window.open("https://www.fablabs.io/labs/BhutanSFL", "_blank");
});

// Link node4 with a url white as default color and gray as highligh color
node4.MouseEnter(() => {
	node4.material.color.set( 0x555555 );
	node4Text.material.color.set( 0x555555 );
	document.body.style.cursor	= 'pointer';
});
node4.MouseLeave(() => {
	node4.material.color.set( 0xffffff );
	node4Text.material.color.set( 0xffffff );
	document.body.style.cursor	= 'default';
});
node4.MouseDown(() => {
	window.open("http://fabacademy.org/2021/labs/wheaton/students/ozgur-tunaozturk/", "_blank");
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
function SphereToEuclodCord( node , latitude, longitude ) {

  node.position.set( 
    3 * Math.sin( longitude * (Math.PI/180) + (Math.PI/2) ) * Math.sin( latitude * (Math.PI/180) + (Math.PI/2) ), 
    3 * Math.cos( latitude  * (Math.PI/180) + (Math.PI/2) ), 
    3 * Math.cos( longitude * (Math.PI/180) + (Math.PI/2) ) * Math.sin( latitude * (Math.PI/180) + (Math.PI/2) ) 
  );

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
  camera.aspect = document.body.clientWidth / document.body.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(document.body.clientWidth*aspectRatio, document.body.clientHeight*aspectRatio)
  renderer.render(scene, camera);
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
  // (in other works set the rotation of the earth) 
  sunLight.position.x = 100*(Math.cos((seconds/86400)*(2*Math.PI) + (Math.PI)));
  sunLight.position.z = 100*(Math.sin((seconds/86400)*(2*Math.PI) + (Math.PI)));

  // Set the position of the moon's orbit using the Day of the Year
  moon.position.x = 30*Math.sin((DOY/27)*Math.PI*2 - Math.PI/2);
  moon.position.z = 30*Math.cos((DOY/27)*Math.PI*2 - Math.PI/2);

  // Set the moon's current rotation
  moon.rotation.y = (DOY/27)*Math.PI*2;

  // Create a realistic cloud effect by moving the clouds at 15/kmph and use the Day of the Year
  clouds.rotation.y = (( (DOY-1)*24 + dt.getUTCHours())/(40075/15))*Math.PI*2

  // Update the controls for the Orbital Camera to rotate automatically
  controls.update();

  // Rerender the scene
  renderer.render(scene, camera);
}

/* --- End of Functions --- */

// Call the animate() function
animate();

/* --- Menu Controls --- */

// Activate .canvasChange2 CSS Class on Canvas Element
document.querySelector("canvas").classList.toggle("canvasChange2");

// Instantiate a GSAP animation with easeout settings
let fovAnim = gsap.timeline({
    defaults: {
      ease: "easeout"
    }
});

// Add Click EventListener on the Menu Icon
document.getElementById("menuIcon").addEventListener("click", () => {
	// Activate the .change CSS Class on #menuIcon Element
	document.getElementById("menuIcon").classList.toggle("change");
	// Activate the .menuChange CSS Class on #menu Element
	document.getElementById("menu").classList.toggle("menuChange");

	// Check id the menu is activated or not
	if (document.getElementsByClassName("change")[0]) {
		aspectRatio = 1.5 // Change the Aspect Ratio
		// rerender the canvas using the new aspect ratio
		renderer.setSize(document.body.clientWidth*aspectRatio, document.body.clientHeight*aspectRatio);
		// Activate the .canvasChange1 and deactivate the .canvasChange2 Elements
		document.querySelector("canvas").classList.toggle("canvasChange1");
		document.querySelector("canvas").classList.toggle("canvasChange2");
		// Create an animation updating the FOV of the camera
		fovAnim.to(camera, {
			duration: 0.5,	// Set duration to 0.5s
			fov: 100,		// Set FOV to 100
			onUpdate: function() {camera.updateProjectionMatrix();}	// Update the Camera
		});
	} else {
		aspectRatio = 1; // Change the Aspect Ratio
		// rerender the canvas using the new aspect ratio
		renderer.setSize(document.body.clientWidth*aspectRatio, document.body.clientHeight*aspectRatio);
		// Activate the .canvasChange2 and deactivate the .canvasChange1 Elements
		document.querySelector("canvas").classList.toggle("canvasChange1");
		document.querySelector("canvas").classList.toggle("canvasChange2");
		// Create an animation updating the FOV of the camera
		fovAnim.to(camera, {
			duration: 0.5,	// Set duration to 0.5s
			fov: 75,		// Set FOV to 100
			onUpdate: function() {camera.updateProjectionMatrix();}	// Update the Camera
		});
	}
	
});

/* --- End of Menu Controls --- */

/* --- Menu Item Hover Controls --- */

// Iterate through all elements with .row CSS Class
document.querySelectorAll('.row').forEach( item => {
	// Add mouseover EventListener to all elements
	item.addEventListener('mouseover', event => {

		// Store the Element name
		const itemName = item.childNodes[1].innerHTML;

		// Check which element
		if (itemName == "About Me") {
			// Move the camera to the associated node
			gsap.to(camera.position, {
				duration: 0.5,
				x: node1.position.x * (5/3),
				y: node1.position.y * (5/3),
				z: node1.position.z * (5/3),
				onUpdate: function() {camera.lookAt(node1.position)}
			} );
		} else if (itemName == "Github") {
			// Move the camera to the associated node
			gsap.to(camera.position, {
				duration: 0.5,
				x: node2.position.x * (5/3),
				y: node2.position.y * (5/3),
				z: node2.position.z * (5/3),
				onUpdate: function() {camera.lookAt(node2.position)}
			} );
		} else if (itemName == "Super Fab Lab") {
			// Move the camera to the associated node
			gsap.to(camera.position, {
				duration: 0.5,
				x: node3.position.x * (5/3),
				y: node3.position.y * (5/3),
				z: node3.position.z * (5/3),
				onUpdate: function() {camera.lookAt(node3.position)}
			} );
		} else if (itemName == "Fab Academy") {
			// Move the camera to the associated node
			gsap.to(camera.position, {
				duration: 0.5,
				x: node4.position.x * (5/3),
				y: node4.position.y * (5/3),
				z: node4.position.z * (5/3),
				onUpdate: function() {camera.lookAt(node4.position)}
			} );
		}
	});
});

/* --- End of Menu Item Hover Controls --- */

/* --- Menu Item Click Controls --- */

document.querySelectorAll('.row').forEach( item => {
	// Add mouseover EventListener to all elements
	item.addEventListener('click', event => {

		// Store the Element name
		const itemName = item.childNodes[1].innerHTML;

		// Check which element
		if (itemName == "About Me") {
			window.open("https://www.linkedin.com/in/ozgur-tuna-ozturk/", "_blank");
		} else if (itemName == "Github") {
			window.open("https://github.com/Tozturk18", "_blank");
		} else if (itemName == "Super Fab Lab") {
			window.open("https://www.fablabs.io/labs/BhutanSFL", "_blank");
		} else if (itemName == "Fab Academy") {
			window.open("http://fabacademy.org/2021/labs/wheaton/students/ozgur-tunaozturk/", "_blank");
		}
	});
});

/* --- End of Menu Item Click Controls --- */