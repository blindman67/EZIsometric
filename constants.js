"use strict";
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
    worldNormal : [ // sets the face normal in world space for off axis faces
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
            p.setAxis(EZIsometric.utils.math.deg2Rad(angX), 1, EZIsometric.CONSTS.axis.x);
            p.setAxis(EZIsometric.utils.math.deg2Rad(180 - angY), 1, EZIsometric.CONSTS.axis.y);
            p.setAxis(EZIsometric.utils.math.deg2Rad(270), 1, EZIsometric.CONSTS.axis.z);
            p.viewAngle = Math.PI / 2;
            p.viewElevation = p.xAng;
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
            p.setAxis(EZIsometric.utils.math.deg2Rad(ang), length, EZIsometric.CONSTS.axis.x);
            p.setAxis(EZIsometric.utils.math.deg2Rad(180 - ang), length, EZIsometric.CONSTS.axis.y);
            p.setAxis(EZIsometric.utils.math.deg2Rad(270), length, EZIsometric.CONSTS.axis.z);
            p.viewAngle = Math.PI / 2;
            p.viewElevation = p.xAng;  
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
            p.setAxis(EZIsometric.utils.math.deg2Rad(angX), sx, EZIsometric.CONSTS.axis.x);
            p.setAxis(EZIsometric.utils.math.deg2Rad(180 - angY), sy, EZIsometric.CONSTS.axis.y);
            p.setAxis(EZIsometric.utils.math.deg2Rad(270), sz, EZIsometric.CONSTS.axis.z);
            p.viewAngle = Math.PI / 2;
            p.viewElevation = p.xAng;  
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
            p.setAxis(EZIsometric.utils.math.deg2Rad(angX), scaleX, EZIsometric.CONSTS.axis.x);
            p.setAxis(EZIsometric.utils.math.deg2Rad(180-angY), scaleY, EZIsometric.CONSTS.axis.y);
            p.setAxis(EZIsometric.utils.math.deg2Rad(angZ), scaleZ, EZIsometric.CONSTS.axis.z);
            p.viewAngle = Math.PI / 2;
            p.viewElevation = p.xAng;  
            p.home();
            return p;
        },           
        cabinet: function(p){
            if(p === undefined || p === null){
                p = new EZIsometric.Projection();
            }
            p.setAxis(EZIsometric.utils.math.deg2Rad(0), 1, EZIsometric.CONSTS.axis.x);
            p.setAxis(EZIsometric.utils.math.deg2Rad(180-45), 2/3, EZIsometric.CONSTS.axis.y);
            p.setAxis(EZIsometric.utils.math.deg2Rad(270), 1, EZIsometric.CONSTS.axis.z);
            p.viewAngle = Math.PI / 2;
            p.viewElevation = p.xAng;  
            p.home();
            return p;               
        },
        cabinetHalf: function(p){
            if(p === undefined || p === null){
                p = new EZIsometric.Projection();
            }
            p.setAxis(EZIsometric.utils.math.deg2Rad(0), 1, EZIsometric.CONSTS.axis.x);
            p.setAxis(EZIsometric.utils.math.deg2Rad(180-45), 1/2, EZIsometric.CONSTS.axis.y);
            p.setAxis(EZIsometric.utils.math.deg2Rad(270), 1, EZIsometric.CONSTS.axis.z);
            p.viewAngle = Math.PI / 2;
            p.viewElevation = p.xAng;              
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
            p.updateAxisAngles();     
            p.viewAngle = Math.PI / 2;
            p.viewElevation = p.xAng;            
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
            p.updateAxisAngles();  
            p.viewAngle = Math.PI / 2;
            p.viewElevation = p.xAng;            
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
        extent : function (ctx, proj, projO,extent){
            ctx.beginPath();
            ctx.lineWidth = 3;
            ctx.strokeStyle = "red";
            ctx.setTransform(proj.txx, proj.txy, proj.tyx, proj.tyy, projO.rx + proj.tzx * extent.bottom, projO.ry + proj.tzy * extent.bottom);
            ctx.moveTo(extent.left,extent.front);
            ctx.lineTo(extent.left,extent.back);
            ctx.lineTo(extent.right,extent.back);
            ctx.lineTo(extent.right,extent.front);
            ctx.closePath();
            ctx.stroke();
            ctx.setTransform(proj.txx, proj.txy, proj.tyx, proj.tyy, projO.rx + proj.tzx * extent.top, projO.ry + proj.tzy * extent.top);
            ctx.beginPath();
            ctx.moveTo(extent.left,extent.front);
            ctx.lineTo(extent.left,extent.back);
            ctx.lineTo(extent.right,extent.back);
            ctx.lineTo(extent.right,extent.front);
            ctx.closePath();
            ctx.stroke();
            ctx.setTransform(proj.txx, proj.txy, proj.tzx, proj.tzy, projO.rx + proj.tyx * extent.front, projO.ry + proj.tyy * extent.front);
            ctx.beginPath();
            ctx.moveTo(extent.left,extent.top);
            ctx.lineTo(extent.left,extent.bottom);
            ctx.lineTo(extent.right,extent.bottom);
            ctx.lineTo(extent.right,extent.top);
            ctx.closePath();
            ctx.stroke();
            ctx.setTransform(proj.txx, proj.txy, proj.tzx, proj.tzy, projO.rx + proj.tyx * extent.back, projO.ry + proj.tyy * extent.back);
            ctx.beginPath();
            ctx.moveTo(extent.left,extent.top);
            ctx.lineTo(extent.left,extent.bottom);
            ctx.lineTo(extent.right,extent.bottom);
            ctx.lineTo(extent.right,extent.top);
            ctx.closePath();
            ctx.stroke();


            /*ctx.moveTo(extent.left,extent.front);            
            ctx.setTransform(proj.txx, proj.txy, proj.tyx, proj.tyy, proj.rx + proj.cx + proj.tzx * extent.bottom, proj.ry + proj.cy  + proj.tzy * extent.bottom);
            ctx.lineTo(extent.left,extent.front);   
            ctx.moveTo(extent.left,extent.back);
            ctx.setTransform(proj.txx, proj.txy, proj.tyx, proj.tyy, proj.rx + proj.cx + proj.tzx * extent.top, proj.ry + proj.cy  + proj.tzy * extent.top);
            ctx.lineTo(extent.left,extent.back);
            ctx.moveTo(extent.right,extent.back);
            ctx.setTransform(proj.txx, proj.txy, proj.tyx, proj.tyy, proj.rx + proj.cx + proj.tzx * extent.bottom, proj.ry + proj.cy  + proj.tzy * extent.bottom);
            ctx.lineTo(extent.right,extent.back);
            ctx.moveTo(extent.right,extent.front);
            ctx.setTransform(proj.txx, proj.txy, proj.tyx, proj.tyy, proj.rx + proj.cx + proj.tzx * extent.top, proj.ry + proj.cy  + proj.tzy * extent.top);
            ctx.lineTo(extent.right,extent.front); 
            ctx.stroke();*/
        },
        shape : function (ctx, proj, data){
            var i, len;
            if(data === undefined){
                if(this.data === undefined){
                    return;
                }
                data = this.data;
            }
            if(data.verts === undefined){
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
            if(Math.abs((ex-sx)/stepX) > 32){
                sx = -stepX * 16;
                ex = stepX *16;
            }
            if(Math.abs((ey-sy)/stepY) > 32){
                sy = -stepY * 16;
                ey = stepY *16;
            }
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