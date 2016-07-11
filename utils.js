

var EZIsoUtils;
EZIsometric.utils = (function(){
    var id = 0;
  
    function getUID(){
        id += 1;
        return id-1;
    }
    var makeQuickArray = function(array){
        function each(callback){
            var r;
            var i = 0;
            var len = this.length;
            for(;i < len; i++){;
                if(callback(this[i],i) === false){
                    break;
                }
            }
        }
        function getById(id){
            var r;
            var i = 0;
            var len = this.length;
            for(;i < len; i++){;
                if(this[i].id === id){
                    this.index = i;
                    return this[i];
                }
            }
        }        
        function first(){
            array.index = 0
            return this[0];
        }
        function last(){
            array.index = this.length-1
            if(array.index < 0){
                return undefined;
            }
            return this[array.index];
        }        
        function next(){
            array.index += 1
            if(array.index < this.length){ 
                return this[array.index];
            }
        }
        function prev(){
            array.index -= 1
            if(array.index > -1){ 
                return this[array.index];
            }
        }        
        function empty(){
            this.length = 0;
            this.index = 0;
        }
        if(!Array.isArray(array)){
            throw new TypeError("EZIsoUtils.makeQuickArray first argument not an array!");
        };
        array.item = undefined;
        array.index = 0;
        array.each = each.bind(array);
        array.first = first.bind(array);
        array.last = last.bind(array);
        array.next = next.bind(array);
        array.prev = prev.bind(array);
        array.empty = empty.bind(array);
        array.getById = getById.bind(array);
        return array;
        
        
    }
    // creates a blank image with 2d context
    var createImage=function(w,h){
        var i=document.createElement("canvas");
        i.width=w;
        i.height=h;
        i.ctx=i.getContext("2d");
        return i;
    }
    function drawGrid(image,x,y,col1,col2){
        image.ctx.fillStyle = col1;
        image.ctx.fillRect(0,0,image.width,image.height);
        image.ctx.fillStyle = col2;
        for(var yy = 0; yy < image.height; yy += y){
            for(var xx = 0; xx < image.width; xx += x){
                if((Math.floor(xx/x)+Math.floor(yy/y))%2 === 0){
                    image.ctx.fillRect(xx,yy,x,y);
                }
            }
            
        }
    }
    function drawGridEdge(image,x,y,col1,col2,g = 4){
        for(var yy = 0; yy < image.height; yy += y){
            for(var xx = 0; xx < image.width; xx += x){
                if((Math.floor(xx/x)+Math.floor(yy/y))%2 === 0){
                    image.ctx.fillStyle = col1;
                    image.ctx.fillRect(xx,yy,x,g);
                    image.ctx.fillRect(xx,yy,g,y);
                    image.ctx.fillRect(xx,yy+y-g,x,g);
                    image.ctx.fillRect(xx+x-g,yy,g,y);
                }else{
                    image.ctx.fillStyle = col2;
                    image.ctx.fillRect(xx,yy,x,g);
                    image.ctx.fillRect(xx,yy,g,y);
                    image.ctx.fillRect(xx,yy+y-g,x,g);
                    image.ctx.fillRect(xx+x-g,yy,g,y);
                }
            }
        }
    }
    function createBox(image,pos,size,world){
        var obj = world.createObject(new geom3D.Vec3(pos));
        var px,py,pz;
        px = 0;
        py = 0;
        pz = 0;
        var tx = image.width;
        var ty = image.height;
        var x = size.x
        var y = size.y
        var z = size.z
        var xh = x/2;
        var yh = y/2;
        var zt = z;
        var f = obj.addFace(new geom3D.Vec3(px,py,pz+zt),x,y,0,0,tx,ty,EZIsometric.CONSTS.sides.top);
        f.setTexture(image);
        f = obj.addFace(new geom3D.Vec3(px,py,pz+zt),x,y,0,0,tx,ty,EZIsometric.CONSTS.sides.bottom);
        f.setTexture(image);
        f = obj.addFace(new geom3D.Vec3(px +xh,py,pz+zt),y,z,0,0,tx,ty,EZIsometric.CONSTS.sides.front);
        f.setTexture(image);
        f = obj.addFace(new geom3D.Vec3(px-xh,py,pz+zt),y,z,0,0,tx,ty,EZIsometric.CONSTS.sides.back);
        f.setTexture(image);
        f = obj.addFace(new geom3D.Vec3(px,py+yh,pz+zt),x,z,0,0,tx,ty,EZIsometric.CONSTS.sides.left);
        f.setTexture(image);
        f = obj.addFace(new geom3D.Vec3(px,py-yh,pz+zt),x,z,0,0,tx,ty,EZIsometric.CONSTS.sides.right);
        f.setTexture(image);
        obj.proj.update();
        return obj;
      
    }

    function u8C(val){//uint8Clamp(val){
        return Math.min(255,Math.max(0,Math.floor(val)));
    }
    function createShadowTexture(image,ambientColour){
        var s = document.createElement("canvas");
        var w = s.width = image.width;
        var h = s.height = image.height;
        var ctx = s.getContext("2d");
        ctx.drawImage(image,0,0);
        ctx.globalCompositeOperation = "multiply";   
        ctx.fillStyle = "rgb("+u8C(ambientColour.r)+","+u8C(ambientColour.g)+","+u8C(ambientColour.b)+")";
        ctx.fillRect(0,0,w,h);
        if(image.iso === undefined){
            image.iso = {};
        }
        image.iso.dark = s;
        return s;
    }
    return {
        createImage : createImage,
        u8C : u8C,
        createShadowTexture : createShadowTexture,
        drawGridEdge : drawGridEdge,
        drawGrid : drawGrid,
        getUID : getUID,
        rad2Deg : function(rad){  return rad * (180 / Math.PI);},
        deg2Rad : function(deg){  return deg / (180 / Math.PI);},
        quickArray : makeQuickArray,
        box : createBox,
    }
        
})();








// Geom3D is a cut down version of Groover.geom3d (no release date yet)
// provides basic Vector and Matrix3by3 math in via objects Vec3 and Matrix3

var geom3D = (function(){
    var wxx,wxy,wxz,wyx,wyy,wyz,wzx,wzy,wzz;  
    var a,b,c,d,e,u;
    var a1,b1,c1,d1,e1,u1;
    var v1,v2,v3,v4,v5;
    function Vec3(vec,y,z){
        if(vec === undefined || vec === null){
            this.x = 1;
            this.y = 0;
            this.z = 0;
        }else
        if(!isNaN(vec)){    
            this.x = vec;
            this.y = y;
            this.z = z;
        }else{
            this.x = vec.x;
            this.y = vec.y;
            this.z = vec.z;
        }        
    }
    Vec3.prototype = {
        copy : function(){
            return new Vec3(this);
        },
        setAs : function(vx,y,z){
            if(isNaN(vx)){
                this.x = vx.x;
                this.y = vx.y;
                this.z = vx.z;
                return this;
            }
            this.x = vx;
            this.y = y;
            this.z = z;
            return this;            
        },
        add : function(vec,y,z){
            if(y !== undefined){
                this.x += vec;
                this.y += y;
                this.z += z !== undefined ? z : 0;
            }else{
                this.x += vec.x;
                this.y += vec.y;
                this.z += vec.z;
            }
            return this;
        },
        reverse : function(){
            this.x = -this.x;
            this.y = -this.y;
            this.z = -this.z;
            return this;
        },
        normalise : function(){
            u = Math.hypot(this.x,this.y,this.z);
            this.x /= u;
            this.y /= u;
            this.z /= u;
            return this;
        },
        getLength : function(){
            return Math.hypot(this.x,this.y,this.z);
        },
        
    }
    function Matrix3D(m3D){
        if(m3D ===undefined || m3d === null){
            this.xx = 1;
            this.xy = 0;
            this.xz = 0;
            this.yx = 0;
            this.yy = 1;
            this.yz = 0;
            this.zx = 0;
            this.zy = 0;
            this.zz = 1;
        }else{
            this.xx = m3D.xx;
            this.xy = m3D.xy;
            this.xz = m3D.xz;
            this.yx = m3D.yx;
            this.yy = m3D.yy;
            this.yz = m3D.yz;
            this.zx = m3D.zx;
            this.zy = m3D.zy;
            this.zz = m3D.zz;
        }
    }
    Matrix3D.prototype = {
        copy : function(){
            return new Matrix3D(this);
        },
        identity : function(){
            this.xx = 1;
            this.xy = 0;
            this.xz = 0;
            this.yx = 0;
            this.yy = 1;
            this.yz = 0;
            this.zx = 0;
            this.zy = 0;
            this.zz = 1;
            return this;
        },
        scaleUniform: function(scale){
            this.xx *= scale;
            this.xy *= scale;
            this.xz *= scale;
            this.yx *= scale;
            this.yy *= scale;
            this.yz *= scale;
            this.zx *= scale;
            this.zy *= scale;
            this.zz *= scale;
            return this;
        },
        scale: function(x,y,z){
            this.xx *= x;
            this.xy *= x;
            this.xz *= x;
            this.yx *= y;
            this.yy *= y;
            this.yz *= y;
            this.zx *= z;
            this.zy *= z;
            this.zz *= z;
            return this;
        },
        setRotate : function(x,y,z){ //x,y,z is rotation around the same axis
            if(x !== null){
                this.xx = Math.cos(x);
                this.xy = Math.sin(x);
                this.xz = 0;
            }
            if(y !== null){
                this.yx = Math.sin(y);
                this.yy = Math.cos(y);
                this.yz = 0;
            }
            if(y !== null){
                this.zx = Math.sin(z);
                this.zy = 0;
                this.zz = Math.cos(z);
            }
            return this;      
            
        },
        multiplyPost : function(mat){ // B * A rather than A * B
            wxx = mat.xx * this.xx + mat.yx * this.xy + mat.zx * this.xz;
            wxy = mat.xy * this.xx + mat.yy * this.xy + mat.zy * this.xz;
            wxz = mat.xz * this.xx + mat.yz * this.xy + mat.zz * this.xz;
        
            wyx = mat.xx * this.yx + mat.yx * this.yy + mat.zx * this.yz;
            wyy = mat.xy * this.yx + mat.yy * this.yy + mat.zy * this.yz;
            wyz = mat.xz * this.yx + mat.yz * this.yy + mat.zz * this.yz;
        
            wzx = mat.xx * this.zx + mat.yx * this.zy + mat.zx * this.zz;
            wzy = mat.xy * this.zx + mat.yy * this.zy + mat.zy * this.zz;
            wzz = mat.xz * this.zx + mat.yz * this.zy + mat.zz * this.zz;        
        },
        multiply : function(mat){
            wxx = this.xx * mat.xx + this.yx * mat.xy + this.zx * mat.xz;
            wxy = this.xy * mat.xx + this.yy * mat.xy + this.zy * mat.xz;
            wxz = this.xz * mat.xx + this.yz * mat.xy + this.zz * mat.xz;
        
            wyx = this.xx * mat.yx + this.yx * mat.yy + this.zx * mat.yz;
            wyy = this.xy * mat.yx + this.yy * mat.yy + this.zy * mat.yz;
            wyz = this.xz * mat.yx + this.yz * mat.yy + this.zz * mat.yz;
        
            wzx = this.xx * mat.zx + this.yx * mat.zy + this.zx * mat.zz;
            wzy = this.xy * mat.zx + this.yy * mat.zy + this.zy * mat.zz;
            wzz = this.xz * mat.zx + this.yz * mat.zy + this.zz * mat.zz;        
            this.xx = wxx
            this.xy = wxy;
            this.xz = wxz;
            this.yx = wyx;
            this.yy = wyy;
            this.yz = wyz;
            this.zx = wzx;
            this.zy = wzy;
            this.zz = wzz;            
        }    
        
    };
    return {
        Vec3 : Vec3,
        Matrix : Matrix3D,
    };
})();

