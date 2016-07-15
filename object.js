"use strict";


var EZIsoObject;
EZIsometric.Object = EZIsoObject = (function(){
    const CONSTS = EZIsometric.CONSTS;
    const PLANES = CONSTS.planes;
    const SIDES = CONSTS.sides;
    const AXIS = CONSTS.axis;
    const LIGHTS = CONSTS.lights;
    var UTL = EZIsometric.utils;
    const FACE_SORT = CONSTS.faceSort;
    function EZIsoObject(pos,projection){
        this.faces = [];
        UTL.quickArray(this.faces);
        this.proj = projection;
        this.position = pos;
        this.extent = new geom3D.Extent();
    }
    EZIsoObject.prototype = {
        sortFaces : function (){
            this.faces.sort(FACE_SORT);
        },
        render : function(ctx){
            if(ctx === null){
                if(this.world !== undefined){
                    ctx = this.world.ctx;
                }
            }
            if(ctx === undefined){
                throw new ReferanceError("EZIsoObject.draw requiers a 2D canvas context to render.");
            }
            var i,len,lena,j,a;
            len = this.faces.length;
            var p = this.proj;
            var sh = p.fShade;
            for(var i = 0; i < len; i ++){
                var f = this.faces[i];
                if(!f.cull){
                    f.setTransform(ctx,p);
                    if(f.image === null){
                        f.render(ctx,p);
                    }else{
                        if(f.image.iso){
                            if(f.light < 1){
                                ctx.drawImage(f.image,f.tx,f.ty,f.tw,f.th,0,0,f.sx,f.sy); 
                            }
                            if(f.light > 0){
                                ctx.globalAlpha = f.light;
                                ctx.drawImage(f.image.iso.dark,f.tx,f.ty,f.tw,f.th,0,0,f.sx,f.sy); 
                                ctx.globalAlpha = 1;
                            }
                        }else{
                            ctx.drawImage(f.image,f.tx,f.ty,f.tw,f.th,0,0,f.sx,f.sy); 
                        }

                    }
                    if(f.attachedFaces !== null){                    
                        lena = (a = f.attachedFaces).length;
                        for(j = 0; j < lena; j ++){
                            if(a[j].image === null){
                                a[j].render(ctx,p);
                            }else{
                                f = a[j];
                                if(f.image.iso){
                                    if(f.light < 1){
                                        ctx.drawImage(f.image,f.tx,f.ty,f.tw,f.th,0,0,f.sx,f.sy); 
                                    }
                                    if(f.light > 0){
                                        ctx.globalAlpha = f.light;
                                        ctx.drawImage(f.image.iso.dark,f.tx,f.ty,f.tw,f.th,0,0,f.sx,f.sy); 
                                        ctx.globalAlpha = 1;
                                    }
                                }else{
                                    ctx.drawImage(f.image,f.tx,f.ty,f.tw,f.th,0,0,f.sx,f.sy); 
                                }                                
                                if(f.render !== null){
                                    f.render();
                                }
                            }
                        }
                            
                    }
                }
            }
        },
        // uses the objects projection proj to transform faces center coords to isometric projection space
        // performs back face cull 
        // and finds distance of face center to camera plane
        transform :function(){
            var i,len,lx,ly,lz,visible;
            len = this.faces.length;
            var p = this.proj;
            var camera = this.world.activeCamera;
            var cp = camera.position;
            var x,y,z;
            x = p.x;
            y = p.y;
            z = p.z;
            this.wx = x * p.wxx + y * p.wyx +  z  * p.wzx;
            this.wy = x * p.wxy + y * p.wyy +  z  * p.wzy;
            this.wz = x * p.wxz + y * p.wyz +  z  * p.wzz;
            this.dist = (cp.x - this.wx) + (cp.y - this.wy) + (cp.z - this.wz);
            p.getFacing();
            p.faceNormals();
            if(this.world !== undefined){
                if(this.world.lights.length > 0){
                    p.calcFaceLighting(this.world.lights[0]);
                    lx = this.world.lights[0].tDir.x;
                    ly = this.world.lights[0].tDir.y;
                    lz = this.world.lights[0].tDir.z;            
                }
            }
            for(var i = 0; i < len; i ++){
                var f = this.faces[i];
                if(f.offAxis){
                    f.setOffAxisProjection(p);    
                    if(f.cullBackface){
                        visible = f.facingOffAxis(p) > 0;    
                    }else{
                        visible = true;
                    }
                    if(visible){
                        f.setWorldNormal(p);
                        f.light = 1 - Math.min(1, Math.max(0,Math.abs( lx * f.wnx + ly * f.wny + lz * f.wnz))); 
                        f.wx = f.x * p.wxx + f.y * p.wyx +  f.z  * p.wzx + this.wx;
                        f.wy = f.x * p.wxy + f.y * p.wyy +  f.z  * p.wzy + this.wy;
                        f.wz = f.x * p.wxz + f.y * p.wyz +  f.z  * p.wzz + this.wz;
                        f.dist = (cp.x - f.wx)+(cp.y - f.wy)+(cp.z - f.wz);
                        f.rx = p.txx * f.x + f.offX * f.txx + p.tyx * f.y + f.offY * f.tyx + p.tzx * (f.z + f.offZ);// + x;
                        f.ry = p.txy * f.x + f.offX * f.txy + p.tyy * f.y + f.offY * f.tyy + p.tzy * (f.z + f.offZ);// + y;
                        f.rz = f.z;// + z;
                        f.cull = false;
                    }else{
                        f.cull = true;
                    }            
                }else{
                    if(!f.cullBackface || p.fa[f.side] > 0){
                        f.light = p.fShade[f.side];
                        f.wx = f.x * p.wxx + f.y * p.wyx +  f.z  * p.wzx + x;
                        f.wy = f.x * p.wxy + f.y * p.wyy +  f.z  * p.wzy + y;
                        f.wz = f.x * p.wxz + f.y * p.wyz +  f.z  * p.wzz + z;
                        f.dist = (cp.x - f.wx)+(cp.y - f.wy)+(cp.z - f.wz);
                        f.rx = p.txx * (f.x + f.offX) + p.tyx * (f.y + f.offY) + p.tzx * (f.z + f.offZ);// + x;
                        f.ry = p.txy * (f.x + f.offX) + p.tyy * (f.y + f.offY) + p.tzy * (f.z + f.offZ);// + y;
                        f.rz = f.z;// + z;
                        f.cull = false;
                    }else{
                        f.cull = true;
                    }
                }
            }
        },  
        // adds a face aligned to an axis. top,bottom,left,right,front and back faces only
        // image is the texture 
        // x,y,z 3d pos of face center
        // tx,ty texture start coords
        // tw,th texture width and height
        // width,height the face size in face coord space
        // side On of the constants SIDES.
        // noCull flag true to prevent backface culling from removing this face.
        update : function(){
            this.proj.update();
            var e = this.extent.irrate();
            this.faces.eachEZI(function(f){
                f.extent(e);
            });
        },
        renderExtent : function(ctx){
            if(this.world !== undefined){
                this.world.projection.setCTXTransformXY(ctx);
                CONSTS.renderers.extent(ctx, this.world.projection, this.proj, this.extent);
            }else{
                this.proj.setCTXTransformXY(ctx);
                CONSTS.renderers.extent(ctx, this.proj, this.proj, this.extent);
            }
        },
        addFace : function(pos,width,height,tx,ty,tw,th,side){
            var f = new EZIsometric.Face(side,pos,width,height,tx,ty,tw,th);
            f.id = UTL.getUID();
            this.faces.push(f);
            return f;
        },
        getFace : function(id){
            for(var i = 0; i < this.faces.length; i ++){
                if(this.faces[i].id === id){
                    return this.faces[i];
                }
            }
            return undefined;
        },
        removeFace : function(id){
            for(var i = 0; i < this.faces.length; i ++){
                if(this.faces[i].id === id){
                    return this.faces.splice(i,1)[0];
                }
            }
            return undefined;
        },
        attachFaceToId : function(face,id){
            for(var i = 0; i < this.faces.length; i ++){
                if(this.faces[i].id === id){
                    var f = this.faces[i];
                    if(f.attachedFaces === null){
                        f.attachedFaces = [face];
                        return f;
                    }
                    f.attachedFaces.push(face);
                    return f;
                }
            }
            return undefined;
        },
    }
    return EZIsoObject;
})();
