EZIsometric

EZIsometric is a Axonometric projection 3D rendering interface that uses the HTML5 canvas element to render real-time 3D content via the CanvasRenderingContext2D API


Currently in Alpha experimental stage.

To use add the js file to the document

<script src="EZIsometric.js"></script>


To create a simple scene, you need to have a canvas and a 2D context

Create a world

```
var iso = new EZIsometric.World(EZIsometric.CONSTS.projections.deg45(),ctx);
```


A camera is created. Cameras are linked to the canvas.


```
var cam = iso.activeCamera; 
```


You can set the look at location


```
cam.lookAt.x = 100;
cam.lookAt.y = 100;
cam.lookAt.z = 32;
```


You can add a light. Currently only one light and an ambient level.


```
// adds a Directional light 
// first arg is the direction x,y,z. 
//  Next are the rgb value (not used ATM) 
// then the type. In this case directional
iso.addLight(new geom3D.Vec3(-5,-5,-5),255,255,255,EZIsometric.CONSTS.lights.directional);
```


Create a image 


```
var image = EZIsometric.utils.createImage(128,128); // 128 by 128 image
EZIsometric.utils.drawGrid(image,32,32,"#555","#DDD"); // Draws a grid on the image
```


To allow the light to work you need to create a shadow text. The shadow texture is attached to the image


```
var ambient = {r : 64, g : 48, b : 96};
EZIsometric.utils.createShadowTexture(image,ambient);
```
To add a simple object 

```
EZIsometric.utils.box(image,{x:100,y:100,z:0},128,iso); // uses image size to set x,y size. the 3 arge is the height
```

Update the world

```
iso.update();
```

Then to render


```
function update(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    
    // set any camera movements, world.projection transformations here
    
    iso.frameStart(); // set up world for a render
    
    // update object positions, rotations, scales here
    
    iso.update(); // update the world
    
    iso.renderGrid(EZIsometric.CONSTS.planes.xy);  // draw a grid
    // mouse object you must implement
    // following function return the x,y pos projected into the scene
    mouseWorldXY = {x:0,y:0,z:0};
    iso.locatePoint(mouse.x,mouse.y,mouseWorldXY,EZIsometric.CONSTS.planes.xy);
    // draw a rectangle on the xy plane where the mouse intercept is
    iso.renderAt(mouseWorldXY.x,mouseWorldXY.y, 0, function(ctx, projection){
        ctx.fillFect(-5,-5,10,10);
    });
    
    // then complete the scene with
    iso.render(); // render with the current camera    
    
    
    
}
```

Current projection types. You can use the helper constants to create some standard Axonometric projections.


```
EZIsometric.CONSTS.projections.
deg30()
deg45()
deg12()
military()
cavalier()
topDown()
cabinet()
cabinetHalf()
pixelArt1To1()
pixelArt2To1()
pixelArt3To1()
pixelArt4To1()
pixelArtOpp2To1()
pixelArtOpp3To1()
pixelArtOpp4To1()
```