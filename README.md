**EZIsometric (Alpha 0.1)**

EZIsometric is a Axonometric projection 3D rendering interface that uses the HTML5 canvas element to render real-time 3D content via the CanvasRenderingContext2D API


Currently in Alpha experimental stage, there will be much re-factoring as I hone in on the API that is practical and EZey to use.

**Progress**
July 13 2016
Added progress.
Improved camera. Now directly related to the creation of the world view. Changing the camera lookAt and position attributes now sets the world view
Moved and re-factored EZIsometric.utils
Renamed transform.js to projection.js

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

