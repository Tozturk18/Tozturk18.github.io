/* DomMesh.js
 * Created by Ozgur Tuna Ozturk
 * Last edited on 02/12/2022
 * This is a JavaScript Module that is build over the Mesh Module
 * of the THREE JS Library. This DomMesh Module allows THREE JS Mesh
 * to become interractable.
 * Currently this module supports Native DomEvents such as:
 * mouseenter, mouseleave, mousedown
 * and additionally this module includes linking to URL such as the <a> Element.
 * 
 * PS: Please contact me if you want additional support for DomEvents to this module.
 * Also console.log() script can slow down this library.
 */

/* --- Imports --- */

import { 
    Mesh,       // 3D Object
    Sprite,     // Sprite Object
    Raycaster,  // Raycaster
    Vector2     // Vector2
} from 'https://unpkg.com/three@0.138.0/build/three.module.js';

/* --- End of Imports --- */

/* --- DomMesh Class --- */

// Create a class that extend from THREE.Mesh
class DomMesh extends Mesh {

    /* --- Constructor --- */

    constructor(geometry, material, camera) {

        super(); // Adding super() to pull data from THREE.Mesh

        this.geometry = geometry || null;   // Assign the Mesh Geometry
        this.material = material || null;   // Assign the mesh Material
        this._camera = camera || null;      // Create a variable to share the camera
        this._raycaster = new Raycaster();  // Instantiate a new Raycaster to find the objects under the mouse

    }

    /* --- End of Constructor --- */
    
    /* --- DOMEvents --- */

    /* MouseEnter(func) Function
     *  This function checks the current location of the mouse everytime it moves
     *  and runs the function given through the parameters if the mouse just entered this DomMesh Object.
     * Parameters:
     *  - func: a function to run when the conditions are met.
     * Return:
     *  - null
     */
    MouseEnter(func) {

        // Create local instaces of the variables to be shared with the EventListener function
        const camera = this._camera;
        const raycaster = this._raycaster;
        var target = this;
        // Keep check on whether the mouse is already in the object or just entered
        var entered = false; // This variable is used to make sure that the func only run once

        // This is an Eventlistener function that runs whenever the mouse is moved
        function onPointerMove( event ) {

            // calculate pointer position in normalized device coordinates
            // (-1 to +1) for both components
            const pointer = new Vector2( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );
    
            // update the picking ray with the camera and pointer position
            raycaster.setFromCamera( pointer, camera );

            // calculate objects intersecting the picking ray
            var selected = raycaster.intersectObject( target )[0] || [];

            // Check if the object under the mouse is this DomMesh object and if this is the first time entering
            if (selected.object == target && !entered) {
                func();         // Run the user given function
                entered = true; // Disable this IF Statement for repetitiveness
            } else if (selected.object != target && entered) {
                entered = false; // Enable this IF Statement for repetitiveness
            }
        
        }
        // Run the onPointerMove function everytime the mouse moves 
        window.addEventListener('pointermove', onPointerMove);
    }

    /* MouseLeave(func) Function
     *  This function checks the current location of the mouse everytime it moves
     *  and runs the function given through the parameters if the mouse just left this DomMesh Object.
     * Parameters:
     *  - func: a function to run when the conditions are met.
     * Return:
     *  - null
     */
    MouseLeave(func) {

        // Create local instaces of the variables to be shared with the EventListener function
        const camera = this._camera;
        const raycaster = this._raycaster;
        var target = this;
        // Keep check on whether the mouse is already left the object or just left
        var left = false;

        // This is an Eventlistener function that runs whenever the mouse is moved
        function onPointerMove( event ) {

            // calculate pointer position in normalized device coordinates
            // (-1 to +1) for both components
            const pointer = new Vector2( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );
    
            // update the picking ray with the camera and pointer position
            raycaster.setFromCamera( pointer, camera );

            // calculate objects intersecting the picking ray
            var selected = raycaster.intersectObject( target )[0] || [];

            // Check if the object under the mouse is not this DomMesh object and if this is the first time leaving
            if (selected.object != target && left) {
                func();         // Run the user given function
                left = false;   // Disable this IF Statement for repetitiveness
            } else if (selected.object == target && !left) {
                left = true;    // Enable this IF Statement for repetitiveness
            }
        
        }
        // Run the onPointerMove function everytime the mouse moves
        window.addEventListener('pointermove', onPointerMove);
    }

    /* MouseDown(func) Function
     *  This function checks the current location of the mouse everytime it is clicked
     *  and runs the function given through the parameters only if the mouse is clicked above this DomMesh Object.
     * Parameters:
     *  - func: a function to run when the conditions are met.
     * Return:
     *  - null
     */
    MouseDown(func){

        // Create local instaces of the variables to be shared with the EventListener function
        const camera = this._camera;
        const raycaster = this._raycaster;
        var target = this;

        window.addEventListener( 'touchstart', (event) => {

            // calculate pointer position in normalized device coordinates
            // (-1 to +1) for both components
            const pointer = new Vector2( Math.round( ( ( event.touches[0].clientX / document.querySelector("canvas").width ) * 2 - 1 )*1000 )/1000, Math.round(( - ( event.touches[0].clientY / document.querySelector("canvas").height ) * 2 + 1 )*1000)/1000 );
    
            // update the picking ray with the camera and pointer position
            raycaster.setFromCamera( pointer, camera );
    
            // calculate objects intersecting the picking ray
            var selected = raycaster.intersectObject( target )[0] || [];

            // Check if the object under the mouse is this DomMesh object
            if (selected.object == target) {
                func();
            }

        } );

        window.addEventListener( 'click', (event) => {

            // calculate pointer position in normalized device coordinates
            // (-1 to +1) for both components
            const pointer = new Vector2( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );
    
            // update the picking ray with the camera and pointer position
            raycaster.setFromCamera( pointer, camera );
    
            // calculate objects intersecting the picking ray
            var selected = raycaster.intersectObject( target )[0] || [];

            // Check if the object under the mouse is this DomMesh object
            if (selected.object == target) {
                func();
            }

        });
    }

    /* Link(func) Function
     *  This function uses the 3 functions above to create the <a> tag element effect
     * Parameters:
     *  - url: a string with a link (a url).
     *  - defaultColor: the default color of this DomMesh before mouseover.
     *  - highlightColor: the highlight color of this DomMesh during mouseover.
     * Return:
     *  - null
     */
    Link(url, defaultColor, highlightColor) {
        this.MouseEnter(() => { this.material.color.set( highlightColor );    document.body.style.cursor	= 'pointer'; } );
        this.MouseLeave(() => { this.material.color.set( defaultColor );  document.body.style.cursor	= 'default'; } );
        this.MouseDown(() => { window.open(url, "_blank"); } );
    }

    /* --- End of DOMEvents --- */

}

/* --- End of DomSprite Class --- */

// Create a class that extend from THREE.Mesh
class DomSprite extends Sprite {

    /* --- Constructor --- */

    constructor(material, camera) {

        super(); // Adding super() to pull data from THREE.Mesh

        this.material = material || null;   // Assign the Sprite Material
        this._camera = camera || null;      // Create a variable to share the camera
        this._raycaster = new Raycaster();  // Instantiate a new Raycaster to find the objects under the mouse

    }

    /* --- End of Constructor --- */
    
    /* --- DOMEvents --- */

    /* MouseEnter(func) Function
     *  This function checks the current location of the mouse everytime it moves
     *  and runs the function given through the parameters if the mouse just entered this DomMesh Object.
     * Parameters:
     *  - func: a function to run when the conditions are met.
     * Return:
     *  - null
     */
    MouseEnter(func) {

        // Create local instaces of the variables to be shared with the EventListener function
        const camera = this._camera;
        const raycaster = this._raycaster;
        var target = this;
        // Keep check on whether the mouse is already in the object or just entered
        var entered = false; // This variable is used to make sure that the func only run once

        // This is an Eventlistener function that runs whenever the mouse is moved
        function onPointerMove( event ) {

            // calculate pointer position in normalized device coordinates
            // (-1 to +1) for both components
            const pointer = new Vector2( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );
    
            // update the picking ray with the camera and pointer position
            raycaster.setFromCamera( pointer, camera );

            // calculate objects intersecting the picking ray
            var selected = raycaster.intersectObject( target )[0] || [];

            // Check if the object under the mouse is this DomMesh object and if this is the first time entering
            if (selected.object == target && !entered) {
                func();         // Run the user given function
                entered = true; // Disable this IF Statement for repetitiveness
            } else if (selected.object != target && entered) {
                entered = false; // Enable this IF Statement for repetitiveness
            }
        
        }
        // Run the onPointerMove function everytime the mouse moves 
        window.addEventListener('pointermove', onPointerMove);
    }

    /* MouseLeave(func) Function
     *  This function checks the current location of the mouse everytime it moves
     *  and runs the function given through the parameters if the mouse just left this DomMesh Object.
     * Parameters:
     *  - func: a function to run when the conditions are met.
     * Return:
     *  - null
     */
    MouseLeave(func) {

        // Create local instaces of the variables to be shared with the EventListener function
        const camera = this._camera;
        const raycaster = this._raycaster;
        var target = this;
        // Keep check on whether the mouse is already left the object or just left
        var left = false;

        // This is an Eventlistener function that runs whenever the mouse is moved
        function onPointerMove( event ) {

            // calculate pointer position in normalized device coordinates
            // (-1 to +1) for both components
            const pointer = new Vector2( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );
    
            // update the picking ray with the camera and pointer position
            raycaster.setFromCamera( pointer, camera );

            // calculate objects intersecting the picking ray
            var selected = raycaster.intersectObject( target )[0] || [];

            // Check if the object under the mouse is not this DomMesh object and if this is the first time leaving
            if (selected.object != target && left) {
                func();         // Run the user given function
                left = false;   // Disable this IF Statement for repetitiveness
            } else if (selected.object == target && !left) {
                left = true;    // Enable this IF Statement for repetitiveness
            }
        
        }
        // Run the onPointerMove function everytime the mouse moves
        window.addEventListener('pointermove', onPointerMove);
    }

    /* MouseDown(func) Function
     *  This function checks the current location of the mouse everytime it is clicked
     *  and runs the function given through the parameters only if the mouse is clicked above this DomMesh Object.
     * Parameters:
     *  - func: a function to run when the conditions are met.
     * Return:
     *  - null
     */
    MouseDown(func){

        // Create local instaces of the variables to be shared with the EventListener function
        const camera = this._camera;
        const raycaster = this._raycaster;
        var target = this;

        window.addEventListener( 'touchstart', (event) => {

            // calculate pointer position in normalized device coordinates
            // (-1 to +1) for both components
            const pointer = new Vector2( Math.round( ( ( event.touches[0].clientX / document.querySelector("canvas").width ) * 2 - 1 )*1000 )/1000, Math.round(( - ( event.touches[0].clientY / document.querySelector("canvas").height ) * 2 + 1 )*1000)/1000 );
    
            // update the picking ray with the camera and pointer position
            raycaster.setFromCamera( pointer, camera );
    
            // calculate objects intersecting the picking ray
            var selected = raycaster.intersectObject( target )[0] || [];

            // Check if the object under the mouse is this DomMesh object
            if (selected.object == target) {
                func();
            }

        } );

        window.addEventListener( 'click', (event) => {

            // calculate pointer position in normalized device coordinates
            // (-1 to +1) for both components
            const pointer = new Vector2( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );
    
            // update the picking ray with the camera and pointer position
            raycaster.setFromCamera( pointer, camera );            
    
            // calculate objects intersecting the picking ray
            var selected = raycaster.intersectObject( target )[0] || [];

            // Check if the object under the mouse is this DomMesh object
            if (selected.object == target) {
                func();
            }

        });
    }

    /* Link(func) Function
     *  This function uses the 3 functions above to create the <a> tag element effect
     * Parameters:
     *  - url: a string with a link (a url).
     *  - defaultColor: the default color of this DomMesh before mouseover.
     *  - highlightColor: the highlight color of this DomMesh during mouseover.
     * Return:
     *  - null
     */
    Link(url, defaultColor, highlightColor) {
        this.MouseEnter(() => { this.material.color.set( highlightColor );  document.body.style.cursor	= 'pointer'; } );
        this.MouseLeave(() => { this.material.color.set( defaultColor );    document.body.style.cursor	= 'default'; } );
        this.MouseDown(() => { window.open(url, "_blank"); } );
    }

    /* --- End of DOMEvents --- */

}

/* --- End of DomSprite Class --- */

/* --- Export Classes --- */

export { DomMesh, DomSprite };

/* --- End of Export Classes --- */