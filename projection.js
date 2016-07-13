 "use strict";
/*
 Projection is a isometric transformation object that holds both the projection matrix, world matrix, 
 and various common derived values.
 
 There are 6 standard sides font,back,left,right,top,bottom
 
 Projection default. xx,xy,yx,yy,zx,zy  
 Projection transformed. m1,m2,m3,m4,m5,m6 
 World matrix. wxx,wxy,wxz, wyx,wyy,wyz, wzx,wzy,wzz
 Projection Cross product for each side. fa as array 
 World normals for each side. fNorm
 Shading values for each side. fShade
 
 
*/
EZIsometric.Projection = (function(){
    const CONSTS = EZIsometric.CONSTS;
    const PLANES = CONSTS.planes;
    const SIDES = CONSTS.sides;
    const AXIS = CONSTS.axis;
    const LIGHTS = CONSTS.lights;
    var UTL = EZIsometric.utils;   
    
    
    function EZIsoProjection(factor){
        var p = this;    
        factor = factor !== undefined && factor !== null ? Math.max(3,factor) : 6;
        this.setAxis(Math.PI * (1 / factor), null, AXIS.x);
        this.setAxis(Math.PI * ((factor -1) / factor), null, AXIS.y);
        this.setAxis(Math.PI * 1.5, null, AXIS.z);
        
        // the angle to the camera for the projection standard view
        p.viewAngle = (p.xAng + p.yAng)/2;
        p.viewElevation = Math.PI / 2;

        // the transformed axis will hold the result of scalar and rotational transforms

        p.txx  = p.xx;
        p.txy  = p.xy;
        p.tyx  = p.yx;
        p.tyy  = p.yy;
        p.tzx  = p.zx;
        p.tzy  = p.zy;    
        

        // inverse projection. Do not trust unless you have called invertProjection
        p.invM1 = 0;    
        p.invM2 = 0;    
        p.invM3 = 0;    
        p.invM4 = 0;    
        p.invX = 0;    
        p.invY = 0;    
        
        // The world origin
        p.x = 0;
        p.y = 0;
        p.z = 0;

        // the projection origin in pixels
        p.rx = 0;
        p.ry = 0;
        p.rz = 0;
        
        // the projection canvas offset. Where the center of the canvas is in pixels
        p.cx = 0;
        p.cy = 0;

        
        // face direction. Holds the computer cross product for up, front, and right. Used for backface cull
        p.fxy = 0;
        p.fxz = 0;
        p.fyz = 0;
        p.fa = [0,0,0,0,0,0];// face directions for sides front bac left right top bottom
        // world axis holds the transformed x,y & z axis in world space.
        p.wxx = 1;
        p.wxy = 0
        p.wxz = 0;
        p.wyx = 0;
        p.wyy = 1
        p.wyz = 0;
        p.wzx = 0;
        p.wzy = 0
        p.wzz = 1;
        

        // the world origin
       
        p.fNorms = [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]];
        p.fShade = [0,0,0,0,0,0];
        p.id = UTL.getUID(); 
        p.parent = null;
        p.children = [];
        return p;
    }


    EZIsoProjection.prototype = {
        copy : function(){
            var p = new EZIsoProjection();
            p.xx = this.xx;
            p.xy = this.xy;
            p.yx = this.yx;
            p.yy = this.yy;
            p.zx = this.zx;
            p.zy = this.zy;
            p.xAng = this.xAng;
            p.yAng = this.yAng;
            p.zAng = this.zAng;
            return p;       
        },
        createChildCopy : function(){
            var p = new EZIsoProjection();
            p.xx = 1;
            p.xy = 0;
            p.yx = 0;
            p.yy = 1;
            p.zx = 0;
            p.zy = -1;
            p.xAng = this.xAng;
            p.yAng = this.yAng;
            p.zAng = this.zAng;
            p.parent = this;
            this.children.push(p);
           // p.rotate = p.rotateMultiply;
            p.update();
            return p;       
        },
        setPosition : function(pos){
            this.x = pos.x;
            this.y = pos.y;
            this.z = pos.z;
        },
        update : function(x,y,z,cx,cy){
            var p = this;
            var pn = p.parent;
            if(x === undefined){
                if(pn === null){
                    p.rx = p.txx * p.x + p.tyx * p.y + p.tzx * p.z + p.cx + p.x;
                    p.ry = p.txy * p.x + p.tyy * p.y + p.tzy * p.z + p.cy + p.y;
                    p.rz = p.z;                 
                    return;
                }
                var vxx,vxy,vxz,vyx,vyy,vyz,vzx,vzy,vzz;   

                vxx = pn.txx * p.xx + pn.tyx * p.xy;
                vxy = pn.txy * p.xx + pn.tyy * p.xy;   
                vyx = pn.txx * p.yx + pn.tyx * p.yy;
                vyy = pn.txy * p.yx + pn.tyy * p.yy;
                p.txx = vxx;             
                p.txy = vxy;     
                p.tyx = vyx;            
                p.tyy = vyy;       
                p.tzx = pn.tzx;            
                p.tzy = pn.tzy;          
                vxx = pn.wxx * p.wxx + pn.wyx * p.wxy + pn.wzx * p.wxz;
                vxy = pn.wxy * p.wxx + pn.wyy * p.wxy + pn.wzy * p.wxz;
                vxz = pn.wxz * p.wxx + pn.wyz * p.wxy + pn.wzz * p.wxz;  
                vyx = pn.wxx * p.wyx + pn.wyx * p.wyy + pn.wzx * p.wyz;
                vyy = pn.wxy * p.wyx + pn.wyy * p.wyy + pn.wzy * p.wyz;
                vyz = pn.wxz * p.wyx + pn.wyz * p.wyy + pn.wzz * p.wyz;
                vzx = pn.wxx * p.wzx + pn.wyx * p.wzy + pn.wzx * p.wzz;
                vzy = pn.wxy * p.wzx + pn.wyy * p.wzy + pn.wzy * p.wzz;
                vzz = pn.wxz * p.wzx + pn.wyz * p.wzy + pn.wzz * p.wzz;
                p.wxx = vxx;             
                p.wxy = vxy;            
                p.wxz = vxz;            
                p.wyx = vyx;            
                p.wyy = vyy;            
                p.wyz = vyz;            
                p.wzx = vzx;            
                p.wzy = vzy;            
                p.wzz = vzz;                  
                p.rx = p.txx * p.x + p.tyx * p.y + p.tzx * p.z + pn.cx + pn.rx;
                p.ry = p.txy * p.x + p.tyy * p.y + p.tzy * p.z + pn.cy + pn.ry;
                p.rz = pn.rz  + p.z;     
                return;
            }
            p.rx = p.txx * x + p.tyx * y + p.tzx * z;
            p.ry = p.txy * x + p.tyy * y + p.tzy * z;
            p.rz = p.z ;        
            p.cx = cx;
            p.cy = cy;
        },
        setCTXTransformXY : function(ctx){
            ctx.setTransform(this.txx, this.txy, this.tyx, this.tyy, this.rx + this.cx, this.ry + this.cy);
        },    
        setCTXTransformXZ : function(ctx){
            ctx.setTransform(this.txx, this.txy, -this.tzx, -this.tzy, this.rx + this.cx, this.ry + this.cy);
        },  
        setCTXTransformYZ : function(ctx){
            ctx.setTransform(this.tyx, this.tyy, -this.tzx, -this.tzy, this.rx + this.cx, this.ry + this.cy);
        },      
        setCTXTransform : function(ctx,plane){
            if(plane === PLANES.xy){        
                ctx.setTransform(this.txx, this.txy, this.tyx, this.tyy, this.rx + this.cx, this.ry + this.cy);
            }else
            if(plane === PLANES.xz){
                ctx.setTransform(this.txx, this.txy, -this.tzx, -this.tzy, this.rx + this.cx, this.ry + this.cy);
            }else
            if(plane === PLANES.yz){
                ctx.setTransform(this.tyx, this.tyy, -this.tzx, -this.tzy, this.rx + this.cx, this.ry + this.cy);
            }            
        },    
        setCTXTransformPos : function(ctx,x,y,z,plane){
            var px,py;
            px = this.txx * x + this.tyx * y + this.tzx * z + this.cx ;
            py = this.txy * x + this.tyy * y + this.tzy * z + this.cy;       
            if(plane === PLANES.xy){        
                ctx.setTransform(this.txx, this.txy, this.tyx, this.tyy, this.rx + px, this.ry + py);
            }else
            if(plane === PLANES.xz){
                ctx.setTransform(this.txx, this.txy, -this.tzx, -this.tzy, this.rx + px, this.ry + py);
            }else
            if(plane === PLANES.yz){
                ctx.setTransform(this.tyx, this.tyy, -this.tzx, -this.tzy, this.rx + px, this.ry + py);
            }            
        },
        invertProjection : function(plane){
            if(plane === PLANES.xy){
                var cross =  this.txx * this.tyy - this.txy * this.tyx;
                this.invM1  = this.tyy / cross;
                this.invM2  = -this.txy / cross;
                this.invM3  = -this.tyx / cross;
                this.invM4  = this.txx / cross;
                this.invX  = (this.tyx * this.ry - this.tyy * this.rx) / cross;
                this.invY  = -(this.txx * this.ry - this.txy * this.rx) / cross;
            }else
            if(plane === PLANES.xz){
                var cross =  this.txx * -this.tzy + this.txy * this.tzx;
                this.invM1  = -this.tzy / cross;
                this.invM2  = -this.txy / cross;
                this.invM3  = this.tzx / cross;
                this.invM4  = this.txx / cross;
                this.invX  = (-this.tzx * this.ry + this.tzy * this.rx) / cross;
                this.invY  = -(this.txx * this.ry - this.txy * this.rx) / cross;
            }else
            if(plane === PLANES.yz){
                var cross =  this.tyx * -this.tzy + this.tyy * this.tzx;
                this.invM1  = -this.tzy / cross;
                this.invM2  = -this.tyy / cross;
                this.invM3  = this.tzx / cross;
                this.invM4  = this.tyx / cross;
                this.invX  = (-this.tzx * this.ry + this.tzy * this.rx) / cross;
                this.invY  = -(this.tyx * this.ry - this.tyy * this.rx) / cross;
            }
        },     
        getWorldPos : function(x,y,vec2){
            x -= this.cx;
            y -= this.cy;
            if(vec2 !== undefined){
                vec2.x = x * this.invM1 + y * this.invM3 + this.invX,
                vec2.y = x * this.invM2 + y * this.invM4 + this.invY
                return vec2;            
            }
            return {
                x : x * this.invM1 + y * this.invM3 + this.invX,
                y : x * this.invM2 + y * this.invM4 + this.invY
            };
        },    
        updateAxisAngles : function(){
            this.xAng = Math.atan2(this.xy,this.xx);
            this.yAng = Math.atan2(this.yy,this.yx);
            this.zAng = Math.atan2(this.zy,this.zx);
            
        },
        setAxis : function(angle,length,axis){
            if(axis === AXIS.x){
                this.xAng = angle;
                if(length === null){
                    this.xx = 1; 
                    this.xy = Math.sin(this.xAng);            
                }else{
                    this.xx = Math.cos(this.xAng) * length; 
                    this.xy = Math.sin(this.xAng) * length;            
                }
            }
            if(axis === AXIS.y){
                this.yAng = angle;
                if(length === null){
                    this.yx = -1; 
                    this.yy = Math.sin(this.yAng);            
                }else{
                    this.yx = Math.cos(this.yAng) * length; 
                    this.yy = Math.sin(this.yAng) * length;            
                }
            }
            if(axis === AXIS.z){
                this.zAng = angle;
                if(length === null){
                    length = 1;
                }
                this.zx = Math.cos(this.zAng) * length; 
                this.zy = Math.sin(this.zAng) * length; 
            }
        },
        home : function(){
            var p = this;
            p.txx  = p.xx; p.txy  = p.xy;
            p.tyx  = p.yx; p.tyy  = p.yy;
            p.tzx  = p.zx; p.tzy  = p.zy;   
            p.wxx = 1; p.wxy = 0; p.wxz = 0;
            p.wyx = 0; p.wyy = 1; p.wyz = 0;
            p.wzx = 0; p.wzy = 0; p.wzz = 1;      
            if(p.parent){
                p.update();
            }        
        },
        translate : function(x,y,z){
            this.x = x;
            this.y = y;
            this.z = z;
           
        },
        scale : function (x,y,z){
            this.txx *= x;
            this.txy *= x;
            this.wxx *= x;
            this.wxy *= x;
            this.wxz *= x;
            this.tyx *= y;
            this.tyy *= y;
            this.wyx *= y;
            this.wyy *= y;
            this.wyz *= y;
            this.tzx *= z;
            this.tzy *= z;
            this.wzx *= z;
            this.wzy *= z;
            this.wzz *= z;    
        },
        rotate : function(r,axis){
            if(axis === AXIS.z){
                var x1 = Math.cos(r);
                var y1 = Math.sin(r);
                this.txx = this.xx * x1 + this.yx * y1;
                this.txy = this.xy * x1 + this.yy * y1;
                this.tyx = this.yx * x1 - this.xx * y1;
                this.tyy = this.yy * x1 - this.xy * y1;          
                this.tzx = this.zx;
                this.tzy = this.zy;
                this.wxx = x1;
                this.wxy = y1;
                this.wxz = 0;
                this.wyx = -y1;
                this.wyy = x1;
                this.wyz = 0;   
                this.wzx = 0;
                this.wzy = 0;
                this.wzz = 1;        
            }else
            if(axis === AXIS.x){
                var x1 = Math.cos(r);
                var y1 = Math.sin(r);
                this.txx = this.xx ;
                this.txy = this.xy;
                this.tyx = this.yx*  x1 + this.zx *  y1;
                this.tyy = this.yy * x1 + this.zy *  y1;
                this.tzx = this.zx * x1 + this.yx *  -y1;
                this.tzy = this.zy * x1 + this.yy *  -y1;        
                this.wxx = 1;
                this.wxy = 0;
                this.wxz = 0;
                this.wyx = 0;
                this.wyy = x1;
                this.wyz = y1;
                this.wzx = 0;
                this.wzy = -x1;
                this.wzz = x1;  
            }else
            if(axis === AXIS.y){
                var x1 = Math.cos(r);
                var y1 = Math.sin(r);
                this.txx = this.xx *  x1 + this.zx *  y1 ;
                this.txy = this.xy * x1 + this.zy *  y1;
                this.tyx = this.yx;
                this.tyy = this.yy;
                this.tzx = this.zx * x1 + this.xx *  -y1;
                this.tzy = this.zy * x1 + this.xy *  -y1;
                this.wxx = x1;
                this.wxy = 0;
                this.wxz = y1;
                this.wyx = 0;
                this.wyy = 1;
                this.wyz = 0;   
                this.wzx = -y1;
                this.wzy = 0;
                this.wzz = x1;  
            }    
        },
        rotateMultiply : function(r,axis){
            var m1,m2,m3,m4,m5,m6;
            var vxx,vxy,vxz,vyx,vyy,vyz,vzx,vzy,vzz;
            var x1 = Math.cos(r);
            var y1 = Math.sin(r);
            if(axis === AXIS.z){
                m1 = this.txx * x1 + this.tyx * y1;
                m2 = this.txy * x1 + this.tyy * y1;
                m3 = this.tyx * x1 - this.txx * y1;
                m4 = this.tyy * x1 - this.txy * y1;        
                this.txx = m1; 
                this.txy = m2; 
                this.tyx = m3; 
                this.tyy = m4; 
                vxx = this.wxx * x1 + this.wyx * y1;
                vxy = this.wxy * x1 + this.wyy * y1;
                vxz = this.wxz * x1 + this.wyz * y1;
                vyx = this.wyx * x1 - this.wxx * y1;
                vyy = this.wyy * x1 - this.wxy * y1;
                vyz = this.wyz * x1 - this.wxz * y1;
                this.wxx = vxx;        
                this.wxy = vxy;        
                this.wxz = vxz;        
                this.wyx = vyx;
                this.wyy = vyy;
                this.wyz = vyz;        
            }else
            if(axis === AXIS.x){
                m3 = this.tyx*  x1 + this.tzx * y1;
                m4 = this.tyy * x1 + this.tzy * y1;
                m5 = this.tzx * x1 - this.tyx * y1;
                m6 = this.tzy * x1 - this.tyy * y1;
                this.tyx = m3; 
                this.tyy = m4; 
                this.tzx = m5; 
                this.tzy = m6;
                vyx = this.wyx * x1 + this.wzx * y1;
                vyy = this.wyy * x1 + this.wzy * y1;
                vyz = this.wyz * x1 + this.wzz * y1;
                vzx = this.wzx * x1 - this.wyx * y1;
                vzy = this.wzy * x1 - this.wyy * y1;
                vzz = this.wzz * x1 - this.wyz * y1;        
                this.wyx = vyx;
                this.wyy = vyy;
                this.wyz = vyz;
                this.wzx = vzx;
                this.wzy = vzy;
                this.wzz = vzz;
            }else
            if(axis === AXIS.y){
                var x1 = Math.cos(r);
                var y1 = Math.sin(r);
                m1 = this.txx * x1 + this.tzx *  y1 ;
                m2 = this.txy * x1 + this.tzy *  y1;
                m5 = this.tzx * x1 - this.txx *  y1;
                m6 = this.tzy * x1 - this.txy *  y1;  
                this.txx = m1; 
                this.txy = m2; 
                this.tzx = m5; 
                this.tzy = m6;
                vxx = this.wxx * x1  + this.wzx * y1;
                vxy = this.wxy * x1  + this.wzy * y1;
                vxz = this.wxz * x1  + this.wzz * y1;
                vzx = this.wzx * x1 - this.wxx * y1;
                vzy = this.wzy * x1 - this.wxy * y1;
                vzz = this.wzz * x1 - this.wxz * y1;        
                this.wxx = vxx;
                this.wxy = vxy;
                this.wxz = vxz;
                this.wzx = vzx;
                this.wzy = vzy;
                this.wzz = vzz;
            }    
        },
        transformPoint : function(x,y,z,vec3){
            if(vec === undefined){
                vec = new geom3D.Vec3();
            }
            vec.x = this.wxx * x + this.wyx * y + this.wzx * z + this.x;
            vec.y = this.wxy * x + this.wyy * y + this.wzy * z + this.y; 
            vec.z = this.wxz * x + this.wyz * y + this.wzz * z + this.z;     
            return vec;
        },
        transformVec3 : function(v){
            var x,y,z;
            x = this.wxx * v.x + this.wyx * v.y + this.wzx * v.z;// + this.x;
            y = this.wxy * v.x + this.wyy * v.y + this.wzy * v.z;// + this.y; 
            z = this.wxz * v.x + this.wyz * v.y + this.wzz * v.z;// + this.z;     
            v.x = x;
            v.y = y;
            v.z = z;
            return v;
        },    
        getFacing : function(){ // Use cross products to get facing direction for each standard side. Used for backface cull
            var fa = this.fa;
            fa[SIDES.bottom] = -(fa[SIDES.top]   = this.fxy = this.txx * this.tyy - this.txy * this.tyx); // for top bottom faces
            fa[SIDES.right]   = -(fa[SIDES.left] = this.fxz = this.tzx * this.txy - this.tzy * this.txx); // for front and back faces
            fa[SIDES.front]  = -(fa[SIDES.back]  = this.fyz = this.tzx * this.tyy - this.tzy * this.tyx); // for left and right faces
        },
        faceNormals : function(){ // calculates the face normals for each of the standard sides
            var p,nx,ny,nz,l,ff,fb;
            p = this;
            l = Math.hypot(p.wxx,p.wxy,p.wxz); // should not be zero 
            ff = p.fNorms[SIDES.back];
            fb = p.fNorms[SIDES.front];
            fb[0] = -(ff[0] = p.wxx / l);
            fb[1] = -(ff[1] = p.wxy / l);
            fb[2] = -(ff[2] = p.wxz / l);
            l = Math.hypot(p.wyx,p.wyy,p.wyz); // should not be zero 
            ff = p.fNorms[SIDES.right];
            fb = p.fNorms[SIDES.left];
            fb[0] = -(ff[0] = p.wyx / l);
            fb[1] = -(ff[1] = p.wyy / l);
            fb[2] = -(ff[2] = p.wyz / l);
            l = Math.hypot(p.wzx,p.wzy,p.wzz); // should not be zero 
            ff = p.fNorms[SIDES.bottom];
            fb = p.fNorms[SIDES.top];
            fb[0] = -(ff[0] = p.wzx / l);
            fb[1] = -(ff[1] = p.wzy / l);
            fb[2] = -(ff[2] = p.wzz / l); 
        },
        calcFaceLighting : function(light){ // calculate lighting values for each of the standard faces
            var p,f,lx,ly,lz;
            if(light.type !== LIGHTS.directional){
                return;
            }
            lx = light.tDir.x;
            ly = light.tDir.y;
            lz = light.tDir.z;
            p = this;
            var i =0;
            f = p.fNorms[i];
            p.fShade[i++] = 1-Math.min(1, Math.max(0,( lx * f[0] + ly * f[1] + lz * f[2])));
            f = p.fNorms[i];
            p.fShade[i++] = 1-Math.min(1, Math.max(0,( lx * f[0] + ly * f[1] + lz * f[2])));
            f = p.fNorms[i];
            p.fShade[i++] = 1-Math.min(1, Math.max(0,( lx * f[0] + ly * f[1] + lz * f[2])));
            f = p.fNorms[i];
            p.fShade[i++] = 1-Math.min(1, Math.max(0,( lx * f[0] + ly * f[1] + lz * f[2])));
            f = p.fNorms[i];
            p.fShade[i++] = 1-Math.min(1, Math.max(0,( lx * f[0] + ly * f[1] + lz * f[2])));
            f = p.fNorms[i];
            p.fShade[i++] = 1-Math.min(1, Math.max(0,( lx * f[0] + ly * f[1] + lz * f[2])));  

        }
    }
    return EZIsoProjection;
})();