"use strict";

var EZIsoFace;
EZIsometric.Face = (function(){
    
    const CONSTS = EZIsometric.CONSTS;
    const PLANES = CONSTS.planes;
    const SIDES = CONSTS.sides;
    const AXIS = CONSTS.axis;
    const LIGHTS = CONSTS.lights;
    var UTL = EZIsometric.utils;
    
    function EZIsoFace(side,pos,width,height,tx,ty,tw,th){
        this.x = pos.x;
        this.y = pos.y;
        this.z = pos.z;
        this.sx = width;
        this.sy = height;
        this.offX = 0;// -this.sx / 2;
        this.offY = 0;//-this.sy / 2;
        this.tx = tx;
        this.ty = ty;
        this.tw = tw;
        this.th = th;
        this.image = null;
        this.render = null;
        this.side = side;
        this.cullBackface = true;
        this.cull = false;
        this.dist = 0;
        this.setTransform = CONSTS.transformFunctions[side];  
        this.rx = pos.x;
        this.ry = pos.y;
        this.rz = pos.z;
        this.wx = pos.x;
        this.wy = pos.y;
        this.wz = pos.z;
        this.dist = 0;
        this.attachedFaces = null;
        this.offAxis = false;
        var ww,hh,dd;
        ww = hh = dd = 0;
        if(side === SIDES.top){
            ww = -width/2;
            hh = -height/2;
        }else
        if(side === SIDES.bottom){
            ww = width/2;
            hh = height/2;

        }else{
            if(side === SIDES.front || side === SIDES.back){
                hh = side === SIDES.back? -width / 2 : width / 2;
            }else
            if(side === SIDES.left || side === SIDES.right){
                ww = side === SIDES.right? width / 2 : -width / 2;
            }
        }    
        this.offX = ww;
        this.offY = hh;
        this.offZ = dd; 
    }
    EZIsoFace.prototype = {
        setOffAxis : function(angle){
            if(!this.offAxis){
                this.setTransform = CONSTS.transformOffAxisFunctions[this.side]; 
                this.setOffAxisProjection = CONSTS.offAxis[this.side];
                this.facingOffAxis = CONSTS.facingOffAxis[this.side];
                this.setWorldNormal = CONSTS.worldNormal[this.side];
                this.offAxis = true;
            }
            this.oax = Math.cos(angle);
            this.oay = Math.sin(angle);
            return this;
        },
        setTexture : function(image){
            this.image = image;
            return this;
        },
        setRenderFunction : function(renderFunction,data){
            this.data = data;
            this.render = renderFunction;
            return this;
        },
        extent : function(extent){
            if(this.side === SIDES.top || this.side === SIDES.bottom){
                extent.top    = Math.max(extent.top,    this.z);
                extent.bottom = Math.min(extent.bottom, this.z);
                extent.left   = Math.max(extent.left,   this.y, this.y + this.offY, this.y - this.offY);
                extent.right  = Math.min(extent.right,  this.y, this.y + this.offY, this.y - this.offY);
                extent.front  = Math.max(extent.front,  this.x, this.x + this.offX, this.x - this.offX);
                extent.back   = Math.min(extent.back,   this.x, this.x + this.offX, this.x - this.offX);
            }else
            if(this.side === SIDES.front || this.side === SIDES.back){
                extent.top    = Math.max(extent.top,    this.z, this.z - this.sy);
                extent.bottom = Math.min(extent.bottom, this.z, this.z - this.sy);
                extent.left   = Math.max(extent.left,   this.y, this.y + this.offY, this.y - this.offY);
                extent.right  = Math.min(extent.right,  this.y, this.y + this.offY, this.y - this.offY);
                extent.front  = Math.max(extent.front,  this.x);
                extent.back   = Math.min(extent.back,   this.x);
            }else
            if(this.side === SIDES.left || this.side === SIDES.right){
                extent.top    = Math.max(extent.top,    this.z, this.z - this.sy);
                extent.bottom = Math.min(extent.bottom, this.z, this.z - this.sy);
                extent.left   = Math.max(extent.left,   this.y);
                extent.right  = Math.min(extent.right,  this.y);
                extent.front  = Math.max(extent.front,  this.x, this.x + this.offX, this.x - this.offX);
                extent.back   = Math.min(extent.back,   this.x, this.x + this.offX, this.x - this.offX);
            }
            return extent;
        }
    }
return EZIsoFace;
})();
