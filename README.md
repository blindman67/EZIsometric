**EZIsometric (Alpha 0.1)**

EZIsometric is a Axonometric projection 3D rendering interface that uses the HTML5 canvas element to render real-time 3D content via the CanvasRenderingContext2D API


Currently in Alpha experimental stage, there will be much re-factoring as I hone in on the API that is practical and EZey to use.

The object EZIsometric.pixelArt is stand alone. It has no dependencies to any of the other EZIsomteric object. WARNING pixelArt is written for in ECMAScript6 an at time of writing only Chrome will handle it.
Pixel Art module is not for real-time rendering. It is to aid in the creation images for isometric (and just 2D images). It will provide things like lines/circles/shapes without anti aliasing, colour line patterns, dithering, limit colour sets, smart fills, pixel inner and outer borders, bevels, Isometric image folding, extrusion... and more 

**Progress**
July 13 2016
Added progress.
Improved camera. Now directly related to the creation of the world view. Changing the camera lookAt and position attributes now sets the world view. But introduced a bug where light direction x and y have changed position. Will fix when I work on lights again.
Moved and re-factored EZIsometric.utils
Renamed transform.js to projection.js
Added test code for offAxis faces.
Add "use strict"; to all code.
Re-factored quickArray function names to not clash with existing array methods (eg jQuery each) and my groover each
Added EZIsometric.utils.objects.cylinder and EZIsometric.utils.objects.faceExtrude as test functions
Improved EZIsometric.Face.setRenderFunction to include data reference that is passed to the render function
Added geom3D.extent that is used to get a 3D bounds
Added EZIsometric.CONSTS.renderers.extent that renders a bounding box (Slow due to use of moveTo,lineTo calls)
Added EZIsometric.Projection.getTopProjection which returns the top of the projection chain.
Added EZIsometric.Face.extent which adds the extent of a face to an extent object (incomplete)
Added EZIsometric.Object.update rebuilds any required data after modifying the object
Did profile test. Could not find any GC major hits during run (good news) most code as expected, but still need to test in standalone environment
July 15 2016
Added module pixelArt.js as EZIsometric.pixelArt that will provide functionality required by pixel art
Completed first test of pixelArt.js.
July 16 2016
More work on pixelArt module. 
    Fixed a few minor bugs. 
    Improved error system.
    Did work to make pixelArt actually do as the documentation states 
Added functions Trim, Lighten, Darken
EZIsometric.pixelArt.bitmapToISOFace function now returns clipped amount
EZIsometric.pixelArt.drawRect and EZIsometric.pixelArt.drawFillRect now round down to rather than up the find the right and bottom edges
Made Pattern a Function constructor and added it methods to the prototype
Added Pattern.position and Pattern.appendColor


**Basics**
To use add the js file to the document which is the most current release version (Would like to say stable but as an Alpha there is much work still to be done)

<script src="EZIsometric.js"></script>

For the most current version include the development files

<script src = "constants.js" ></script>
<script src = "utils.js" ></script>
<script src = "projection.js" ></script>
<script src = "camera.js" ></script>
<script src = "face.js" ></script>
<script src = "object.js" ></script>
<script src = "world.js" ></script>

Changes are to big to include any type of API documentation at the moment.


**Info as I go**

As most of the maths has to be done in javascript the EZIsometric is far from easy to use when you directly manipulate the object structures. This is because it is optimised for performance. The EZ in EZIsometric is the accompanying utilities and functions that separate you from the work under the hood. 


Faces
The basic unit of render is a EZIsometric.Face. 
A face is a four sided rectangle that is associated to one of the 6 sides of a cude, front, back, left, right, top and bottom. Due to the nature of axonometric projections a lot of the maths required to do backface culls and lighting  can be done at once for an object. Faces are located in 3d space by setting the top center position. Faces have a width and height face.sx, face.sy that are local to the face. 
Faces can also be offAxis but for the time being that is limited to one axis only, with front faces allowing rotation around the Z axis, back faces around the y axis, left faces around the x axis the rest are currently undecided (these axis may change at any time).
Offaxis faces incur additional computational overhead.

Faces can have faces attached. The attached faces are not z sorted and drawn in the order they are attached, they are also rendered with the parent faces projection and lighting.

Faces can have custom renders. This allows you to add a wide verity of face types.
When added the render function is bound to the face so you can use `this` to get access to face properties
The render function takes as its first argument the rendering 2D context
For example to draw a circle on a face you create a face, set its renderer. 
Example
```
function drawCircle(ctx){ //  
    ctx.lineWidth = 4;
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.arc(0,0,Math.min(this.sx,this.sy),0,Math.PI * 2);  // draw circle radius the min dimension
    ctx.stroke();
}

face.setRenderFunction(drawCircle);

```


