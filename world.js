
var EZIsoWorld; 
EZIsometric.World = EZIsoWorld = (function(){
    var v1, v2, v3, v4; // working objects created as closure and persistent to reduce overall GC hits
    v1 = {x:0,y:0};
    v2 = {x:0,y:0};
    v3 = {x:0,y:0};
    v4 = {x:0,y:0};
    const CONSTS = EZIsometric.CONSTS;
    const PLANES = CONSTS.planes;
    const SIDES = CONSTS.sides;
    const AXIS = CONSTS.axis;
    const LIGHTS = CONSTS.lights;
    var UTL = EZIsometric.utils;
    function EZIsoWorld(proj,ctx){
        this.cameras = [];
        this.lights = [];  // O
        this.projection = proj;

        this.objects = [];
        UTL.quickArray(this.objects);
        UTL.quickArray(this.cameras);
        UTL.quickArray(this.lights);
        if(ctx !== undefined){
            this.addCamera(
                new EZIsometric.Camera(
                    new geom3D.Vec3(0,0,0), 
                    new geom3D.Vec3(0,0,0)
                        .fromAngleElevation(proj.viewAngle,proj.viewElevation,100),
                    ctx
                )
            );
            this.ctx = ctx;
        }
        this.activePlane = PLANES.xy;
    }
    EZIsoWorld.prototype = {
        setProjection : function(proj){
            this.projection = proj;
        },
        addCamera : function(camera){
            this.cameras.push(camera);
            if(this.activeCamera === undefined){
                this.activeCamera = camera;
                this.ctx = camera.ctx;
            }
        },
        activateCamera : function(id){
            var camera = this.cameras.getById(id);
            if(camera === undefined){
                this.activeCamera = camera;
                this.ctx = camera.ctx;
            }
            return this.activeCamera;
        },
        frameStart : function(){
            var camera = this.activeCamera;
            camera.update();

            this.projection.update(-camera.lookAt.x, -camera.lookAt.y, camera.lookAt.z, camera.centerX, camera.centerY);
            this.projection.rotate(camera.lookAtDirZ-this.projection.viewElevation,AXIS.y);
            this.projection.rotate(-camera.lookAtDir-this.projection.viewAngle,AXIS.z);            
            this.objects.each(function(o){
                o.proj.setPosition(o.position);
                 
                o.proj.home()
            });           
        },
        update : function(){
            this.updateLights();
            this.objects.each(function(o){
                o.transform()
            });
            this.objects.sort(CONSTS.objectSort);        
        },
        render : function(context){
            var ctx = context !== undefined ? context : this.ctx;
            this.objects.each(function(o){
                o.sortFaces();
                o.render(ctx);
            });
        },
        renderAt : function(x,y,z,renderFunction,plane,data,context){
            var ctx;
            ctx = context !== undefined ? context : this.ctx;
            plane = plane === undefined || plane === null ? this.activePlane : plane; 
            this.projection.setCTXTransformPos(ctx,x,y,z, plane);
            renderFunction(ctx,this.projection,data);
        },
        locatePoint : function(x,y,v,plane){
            plane = plane === undefined ? this.activePlane : plane;       
            this.projection.invertProjection(plane);
            return this.projection.getWorldPos(x, y, v);
        },
        updateLights : function(){
            var p = this.projection;
            this.lights.each(function(l){
                if(l.type === LIGHTS.directional){
                    l.tDir.x = l.dir.x;
                    l.tDir.y = l.dir.y;
                    l.tDir.z = l.dir.z;

                    p.transformVec3(l.tDir);
                }    

            });            
        },
        renderGrid :function(plane,context){
            var ctx, sx, sy, ex, ey, p;
            p = this.projection;
            plane = plane === undefined ? PLANES.xy : plane;
            ctx = context !== undefined ? context : this.ctx;
            p.setCTXTransform(ctx, plane);
            p.invertProjection(plane);
            p.getWorldPos(0, 0, v1);
            p.getWorldPos(ctx.canvas.width, ctx.canvas.height, v2);
            p.getWorldPos(0, ctx.canvas.height, v3);
            p.getWorldPos(ctx.canvas.width, 0, v4);
            sx = Math.min(v1.x, v2.x, v3.x, v4.x);
            sy = Math.min(v1.y, v2.y, v3.y, v4.y);
            ex = Math.max(v1.x, v2.x, v3.x, v4.x);
            ey = Math.max(v1.y, v2.y, v3.y, v4.y);
            CONSTS.renderers.grid(ctx, sx, sy, ex, ey, PLANES.axisNames[plane][0], PLANES.axisNames[plane][1]);
        },
        addLight : function (loc, r, g, b, type) {
            var l;
            if(type === LIGHTS.directional){
                loc.normalise();
                this.lights.push(l = {
                    type : type,
                    dir : loc,
                    tDir : loc.copy(), // transformed direction
                    r:r,g:g,b:b,
                    id : UTL.getUID(),
                });            
                return l;
            }
            if(type === LIGHTS.ambient){
                this.ambient.r = Math.sqrt(this.ambient.r * this.ambient.r + r * r);
                this.ambient.g = Math.sqrt(this.ambient.g * this.ambient.g + g * g);
                this.ambient.b = Math.sqrt(this.ambient.b * this.ambient.b + b * b);
                this.lights.push(l = {
                    type : type,
                    r:r,g:g,b:b,
                    id : UTL.getUID(),
                });            
                return l;
            }
            return l;
        },
        createObject : function(pos){
            var obj = new EZIsoObject(pos,this.projection.createChildCopy());
            obj.world = this;
            this.objects.push(obj);
            return obj;
        }
    }


    return EZIsoWorld;
})();