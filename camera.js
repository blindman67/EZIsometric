"use strict";

EZIsometric.Camera = (function(){
    var v1,x1,z1,y1; // working 3d vector
    v1 = new geom3D.Vec3();
    function EZIsoCamera(lookAt, position, ctx){
        this.lookAt = lookAt;
        this.position = position;
        this.id = EZIsometric.utils.getUID();
        if(ctx !== undefined){
            this.setContext(ctx); 
        }
    }
    EZIsoCamera.prototype = {
        pan : function(vec,y,z){
            if(y === undefined){
                this.lookAt.x += vec.x;
                this.lookAt.y += vec.y;
                this.lookAt.z += vec.z;
                this.position.x += vec.x;      
                this.position.y += vec.y;      
                this.position.z += vec.z;      
                return this;
            }else
            if(z === undefined){
                z = 0;
            }
            this.lookAt.x += vec;
            this.lookAt.y += y;
            this.lookAt.z += z;
            this.position.x += vec;      
            this.position.y += y;      
            this.position.z += z;      
            return this;
        },
        panTo : function(vec,y,z){
            x1 = this.position.x - this.lookAt.x;
            y1 = this.position.y - this.lookAt.y;
            z1 = this.position.z - this.lookAt.z;
            if(y === undefined){
                this.lookAt.x = vec.x;
                this.lookAt.y = vec.y;
                this.lookAt.z = vec.z;
                this.position.x = vec.x + x1;      
                this.position.y = vec.y + y1;      
                this.position.z = vec.z + z1;      
                return this;
            }else
            if(z === undefined){
                z = 0;
            }
            this.lookAt.x = vec;
            this.lookAt.y = y;
            this.lookAt.z = z;
            this.position.x = vec + x1;      
            this.position.y = y + y1;      
            this.position.z = z + z1;      
            return this;
        },        
        setContext : function(ctx){
            this.width = ctx.canvas.width;
            this.height = ctx.canvas.height;
            this.centerX = this.width / 2;
            this.centerY = this.height /2;
        },
        update : function(){
            this.lookAtDir = this.position.directionTo(this.lookAt);
            this.lookAtDirZ = this.position.elevationAngleTo(this.lookAt);
            
        }
    }
    return EZIsoCamera;
})();