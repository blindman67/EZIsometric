// The global nameSpace

var EZIsometric = {};


EZIsometric.flags = {
    allowTaintedImageFallback : false,
}


EZIsometric.CONSTS = {
    lights : {
        directional : 0,
        ambient : 1,
        point : 2, // currently not supported
    },
    axis : {
        x : 0,
        y : 1,
        z : 2,
    },
    planes : {
        xy : 0,
        xz : 1,
        yz : 2,
        axisNames : [[ "X axis","Y axis"],[ "X axis","Z axis"],[ "Y axis","Z axis"]],
    },
    sides : {
        front : 0, // the following 6 sides must be in the range 0-5 as they are used as array indexs
        back : 1,
        left : 2,
        right : 3,
        top : 4,
        bottom : 5,
    },
    transformFunctions : [// function to set unique transform for faces SIDES.front ... are the indexes to the coorisponding function
        function(ctx,p){ ctx.setTransform(-p.tyx,  -p.tyy, -p.tzx, -p.tzy, p.rx + this.rx, p.ry + this.ry);},
        function(ctx,p){ ctx.setTransform( p.tyx,  p.tyy, -p.tzx, -p.tzy, p.rx + this.rx, p.ry + this.ry);},
        function(ctx,p){ ctx.setTransform( p.txx,  p.txy, -p.tzx, -p.tzy, p.rx + this.rx, p.ry + this.ry);},
        function(ctx,p){ ctx.setTransform(-p.txx, -p.txy, -p.tzx, -p.tzy, p.rx + this.rx, p.ry + this.ry);},
        function(ctx,p){ ctx.setTransform( p.txx,  p.txy,  p.tyx,  p.tyy, p.rx + this.rx, p.ry + this.ry);},
        function(ctx,p){ ctx.setTransform(-p.txx, -p.txy, -p.tyx, -p.tyy, p.rx + this.rx, p.ry + this.ry);},
    ],
    transformOffAxisFunctions : [ // function to set unique transform for faces SIDES.front ... are the indexes to the coorisponding function
        function(ctx,p){ ctx.setTransform( this.txx,  this.txy, -p.tzx, -p.tzy, p.rx + this.rx, p.ry + this.ry);},
        function(ctx,p){ ctx.setTransform( this.txx,  this.txy, -p.tzx, -p.tzy, p.rx + this.rx, p.ry + this.ry);},
        function(ctx,p){ ctx.setTransform( p.tyx,  p.tyy, -p.tzx, -p.tzy, p.x + this.rx, p.y + this.ry);},
        function(ctx,p){ ctx.setTransform(-p.tyx, -p.tyy, -p.tzx, -p.tzy, p.x + this.rx, p.y + this.ry);},
        function(ctx,p){ ctx.setTransform( p.txx,  p.txy,  p.tyx,  p.tyy, p.x + this.rx, p.y + this.ry);},
        function(ctx,p){ ctx.setTransform(-p.txx, -p.txy, -p.tyx, -p.tyy, p.x + this.rx, p.y + this.ry);},
    ],
    offAxis : [  // sets the projection axis for off axis faces
        function(p){ 
            this.txx = p.txx * this.oax + p.tyx * this.oay; 
            this.txy = p.txy * this.oax + p.tyy * this.oay;
            this.tyx = p.tyx * this.oax - p.txx * this.oay; 
            this.tyy = p.tyy * this.oax - p.txy * this.oay;            
        },
        function(p){ this.txx = -(p.txx * this.oax + p.tyx * this.oay); this.txy = -(p.txy * this.oax + p.tyy * this.oay);},
        function(p){},
        function(p){},
        function(p){},
        function(p){},
    ],
    facingOffAxis : [  // returns cross product of projected face for offAxis faces
        function(p){ return p.tzx * this.txy - p.tzy * this.txx;},
        function(p){ return p.tzx * this.txy - p.tzy * this.txx;},
        function(p){},
        function(p){},
        function(p){},
        function(p){},        
    ],
    worldNormal : [ // sets the fave normal in world space for off axis faces
        function(p){
            this.wnx = p.wxx * this.oax + p.wyx * this.oay;// + p.wzx * wxz;
            this.wny = p.wxy * this.oax + p.wyy * this.oay;// + p.wzy * wxz;
            this.wnz = p.wxz * this.oax + p.wyz * this.oay;// + p.wzz * wxz;  
            var l = Math.hypot(this.wnx,this.wny,this.wnz);
            this.wnx /= l;
            this.wny /= l;
            this.wnz /= l;
        },
        function(p){},
        function(p){},
        function(p){},
        function(p){},
        function(p){},         
    ],     
    faceSort : function (a, b) {
        return b.dist - a.dist;
    },
    objectSort : function (a, b) {
        return b.dist - a.dist;
    },
    projections : {
        names : "deg30,deg45,deg12,military,cavalier,topDown,cabinet,cabinetHalf,pixelArt1To1,pixelArt2To1,pixelArt3To1,pixelArt4To1,pixelArtOpp2To1,pixelArtOpp3To1,pixelArtOpp4To1".split(","),
        isometric : function(angX,angY,p){
            if(p === undefined || p === null){
                p = new EZIsometric.Projection();
            }
            p.setAxis(EZIsometric.utils.deg2Rad(angX), 1, EZIsometric.CONSTS.axis.x);
            p.setAxis(EZIsometric.utils.deg2Rad(180 - angY), 1, EZIsometric.CONSTS.axis.y);
            p.setAxis(EZIsometric.utils.deg2Rad(270), 1, EZIsometric.CONSTS.axis.z);
            p.home();
            return p;
        },
        deg30 : function (p) { return this.isometric(30,30,p); },
        deg45 : function (p) { return this.isometric(45,45,p); },
        military : function (p) { return this.isometric(45,45,p); },
        deg12 : function (p) { return this.isometric(12.5,12.5,p); },
        cavalier : function (p) { return this.isometric(45,0,p); },
        topDown : function (p) { return this.isometric(90,0,p); },
        customIsometric : function (ang,length,p) {
            if(p === undefined || p === null){
                p = new EZIsometric.Projection();
            }
            p.setAxis(EZIsometric.utils.deg2Rad(ang), length, EZIsometric.CONSTS.axis.x);
            p.setAxis(EZIsometric.utils.deg2Rad(180 - ang), length, EZIsometric.CONSTS.axis.y);
            p.setAxis(EZIsometric.utils.deg2Rad(270), length, EZIsometric.CONSTS.axis.z);
            p.home();
            return p;
        },
        customDimetric : function (angX,angY,scale,axis,p) {
            if(p === undefined || p === null){
                p = new EZIsometric.Projection();
            }
            var sx,sy,sz;
            if(angX === undefined || angY === undefined){
                throw new ReferenceError("EZIsometric.CONSTS.projections.customDimetric is missing arguments.");
            }
            if(isNaN(angX) || isNaN(angY)){
                throw new TypeError("EZIsometric.CONSTS.projections.customDimetric incompatible argument/s. Requires numbers.");
            }
            sx = sy = sz = 1;
            scale = scale !== undefined || scale !== null && !isNaN(scale) ? scale : (2/3);
            if(axis === EZIsometric.CONSTS.axis.x){
                sx = scale;
            }else if(axis === EZIsometric.CONSTS.axis.z){
                sz = scale;
            }else{
                sy = scale;
            }
            var p = new EZIsometric.Projection();
            p.setAxis(EZIsometric.utils.deg2Rad(angX), sx, EZIsometric.CONSTS.axis.x);
            p.setAxis(EZIsometric.utils.deg2Rad(180 - angY), sy, EZIsometric.CONSTS.axis.y);
            p.setAxis(EZIsometric.utils.deg2Rad(270), sz, EZIsometric.CONSTS.axis.z);
            p.home();
            return p;
        },
        customTrimetric : function (angX,angY,angZ,scaleX,scaleY,scaleZ,p) {
            if(angX === undefined || angY === undefined || angZ === undefined){
                throw new ReferenceError("EZIsometric.CONSTS.projections.customTrimetric is missing arguments.");
            }
            if(isNaN(angX) || isNaN(angY) || isNaN(angZ)){
                throw new TypeError("EZIsometric.CONSTS.projections.customTrimetric incompatible argument/s. Requires numbers.");
            }
            scaleX = scaleX !== undefined && scaleX !== null && !isNaN(scaleX) ? scaleX : 1;
            scaleY = scaleY !== undefined && scaleY !== null && !isNaN(scaleY) ? scaleY : 1;
            scaleZ = scaleZ !== undefined && scaleZ !== null && !isNaN(scaleZ) ? scaleZ : 1;
            if(p === undefined || p === null){
                p = new EZIsometric.Projection();
            }
            p.setAxis(EZIsometric.utils.deg2Rad(angX), scaleX, EZIsometric.CONSTS.axis.x);
            p.setAxis(EZIsometric.utils.deg2Rad(180-angY), scaleY, EZIsometric.CONSTS.axis.y);
            p.setAxis(EZIsometric.utils.deg2Rad(angZ), scaleZ, EZIsometric.CONSTS.axis.z);
            p.home();
            return p;
        },           
        cabinet: function(p){
            if(p === undefined || p === null){
                p = new EZIsometric.Projection();
            }
            p.setAxis(EZIsometric.utils.deg2Rad(0), 1, EZIsometric.CONSTS.axis.x);
            p.setAxis(EZIsometric.utils.deg2Rad(180-45), 2/3, EZIsometric.CONSTS.axis.y);
            p.setAxis(EZIsometric.utils.deg2Rad(270), 1, EZIsometric.CONSTS.axis.z);
            p.home();
            return p;               
        },
        cabinetHalf: function(p){
            if(p === undefined || p === null){
                p = new EZIsometric.Projection();
            }
            p.setAxis(EZIsometric.utils.deg2Rad(0), 1, EZIsometric.CONSTS.axis.x);
            p.setAxis(EZIsometric.utils.deg2Rad(180-45), 1/2, EZIsometric.CONSTS.axis.y);
            p.setAxis(EZIsometric.utils.deg2Rad(270), 1, EZIsometric.CONSTS.axis.z);
            p.home();
            return p;               
        },     
        pixelArtDimetric: function(fraction,p){
            if(p === undefined || p === null){
                p = new EZIsometric.Projection();
            }
            p.xx = 1;
            p.zy = p.yx = -1;
            p.xy = p.yy = 1/fraction;
            p.zx = 0;
            p.home();            
            return p;               
        },    
        pixelArt1To1: function(p){
            return this.pixelArtDimetric(1,p);
        },    
        pixelArt2To1: function(p){
            return this.pixelArtDimetric(2,p);
        },    
        pixelArt3To1: function(p){
            return this.pixelArtDimetric(3,p);
        },    
        pixelArt4To1: function(p){
            return this.pixelArtDimetric(4,p);
        },    
        pixelArtTrimetric: function(fraction,p){
            if(p === undefined || p === null){
                p = new EZIsometric.Projection();
            }
            p.xx = 1/fraction;
            p.xy = 1;
            p.yx = -1;
            p.yy = 1/fraction;
            p.zx = 0;           
            p.zy = -1;           
            p.home();
            return p;               
        },        
        pixelArtOpp2To1: function(p){
            return this.pixelArtTrimetric(2,p);              
        },      
        pixelArtOpp3To1: function(p){
            return this.pixelArtTrimetric(3,p);              
        },      
        pixelArtOpp4To1: function(p){
            return this.pixelArtTrimetric(4,p);              
        },      
        
    },
    renderers : {
        shape : function (ctx, proj, data){
            var i, len;
            if(data === undefined || data.verts === undefined){
                return;
            }
            var verts = data.verts;
            i = 0;
            len = verts.length;
            if(data.style){
                ctx.fillStyle = data.style;
            }
            if(data.angle){
                ctx.rotate(data.angle);
            }
            ctx.beginPath();
            ctx.moveTo(verts[i][0],verts[i++][1]);
            while(i < len){
                ctx.lineTo(verts[i][0],verts[i++][1]);
            }
            ctx.closePath();
            ctx.fill();
        },
        grid : function(ctx,sx,sy,ex,ey,labelX,labelY){
            var x,y,stepX,stepY,ssx,ssy;
            stepX = 64;//(ex-sx)/16;
            stepY = 64;//(ey-sy)/16;
            ssx = Math.floor(sx / stepX) * stepX;
            ssy = Math.floor(sy / stepY) * stepY;

            ctx.strokeStyle = "black";
            if(Math.abs(stepX) <= 0.01 || Math.abs(stepY) <= 0.01){return;}
            ctx.beginPath();
            ctx.lineWidth = 1;
            if(stepX > 0){
                for(x = ssx; x < ex; x += stepX){
                    ctx.moveTo(x,sy);
                    ctx.lineTo(x,ey);
                }
            }else{
                for(x = ssx; x > ex; x -= stepX){
                    ctx.moveTo(x,sy);
                    ctx.lineTo(x,ey);
                }
            }
            if(stepY > 0){
                for(y = ssy; y < ey; y += stepY){
                    ctx.moveTo(sx,y);
                    ctx.lineTo(ex,y);
                }
            }else{
                for(y = ssy; y > ey; y -= stepY){
                    ctx.moveTo(sx,y);
                    ctx.lineTo(ex,y);
                }
            }
            ctx.stroke();            
            ctx.strokeStyle = "Yellow";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(sx,0);
            ctx.lineTo(ex,0);
            ctx.stroke();  
            ctx.strokeStyle = "#0FF";            
            ctx.beginPath();            
            ctx.moveTo(0,sy);
            ctx.lineTo(0,ey);
            ctx.stroke();
            ctx.fillStyle = "Yellow";
            ctx.fillText(labelX,(ey-sy)/2,-20);
            ctx.rotate(-Math.PI/2)
            ctx.fillStyle = "#0FF";
            ctx.fillText(labelY,(ex-sx)/2,-20);
            ctx.rotate(Math.PI/2)            

        }
    }
}




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


EZIsometric.Camera = (function(){
    function EZIsoCamera(lookAt, position, ctx){
        this.lookAt = lookAt;
        this.position = position;
        this.id = EZIsometric.utils.getUID();
        if(ctx !== undefined){
            this.setContext(ctx); 
        }
    }
    EZIsoCamera.prototype = {
        pan : function(vec){
            this.lookAt.add(vec);
            this.position.add(vec);      
            return this;
        },
        setContext : function(ctx){
            this.width = ctx.canvas.width;
            this.height = ctx.canvas.height;
            this.centerX = this.width / 2;
            this.centerY = this.height /2;
        }
    }
    return EZIsoCamera;
})();

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

        // the projection origin
        p.rx = 0;
        p.ry = 0;
        p.rz = 0;
        
        // the projection offset. Where the center of the canvas is in pixels
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







//
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
                this.setOffAxis = CONSTS.offAxis[this.side];
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
        setRenderFunction : function(renderFunction){
            this.render = renderFunction;
            return this;
        },
    }
    return EZIsoFace;
})();


var EZIsoObject;
EZIsometric.Object = EZIsoObject = (function(){
    const CONSTS = EZIsometric.CONSTS;
    const PLANES = CONSTS.planes;
    const SIDES = CONSTS.sides;
    const AXIS = CONSTS.axis;
    const LIGHTS = CONSTS.lights;
    var UTL = EZIsometric.utils;
    function EZIsoObject(pos,projection){
        this.faces = [];
        this.proj = projection;
        this.position = pos;
        this.bounds = {
            w : 0,
            h : 0,
            d : 0,
        };
    }
    EZIsoObject.prototype = {
        sortFaces : function (){
            this.faces.sort(UTL.faceSort);
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
                        f.render(ctx);
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
                                a[j].render(ctx);
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
                    f.setOffAxis(p);    
                    if(f.cullBackface){
                        visible = f.facingOffAxis(p) > 0;    
                    }else{
                        visible = true;
                    }
                    if(visible){
                        f.setWorldNormal(p);
                        f.light = Math.min(1, Math.max(0,Math.abs( lx * f.wnx + ly * f.wny + lz * f.wnz))); 
                        f.wx = f.x * p.wxx + f.y * p.wyx +  f.z  * p.wzx + x;
                        f.wy = f.x * p.wxy + f.y * p.wyy +  f.z  * p.wzy + y;
                        f.wz = f.x * p.wxz + f.y * p.wyz +  f.z  * p.wzz + z;
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
            this.addCamera(new EZIsometric.Camera(new geom3D.Vec3(0,0,0), new geom3D.Vec3(500,500,100),ctx));
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
            this.projection.update(camera.lookAt.x, camera.lookAt.y, camera.lookAt.z, camera.centerX, camera.centerY);
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


