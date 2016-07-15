"use strict";

// This module will be ECMAScript 6 AT time of writing Chrome Beta is 100% compliant. IE MUST DIE!!!
// Power to the programmer, write the code that make users want to learn.


// EZIcometric.pixelArt


if(typeof EZIsometric === "undefined"){
    if(typeof window !== "undefined"){
        window["EZIsometric"] = {};
    }else{
        throw new ReferanceError("EZIcometric could not install.");
    }
}


EZIsometric.pixelArt = (function(){
    var isLittleEndian = true;
    (()=>{
        var buf = new ArrayBuffer(4);
        var buf8 = new Uint8ClampedArray(buf);
        var data = new Uint32Array(buf);
        data[0] = 0x0F000000;
        if(buf8[0] === 0x0f){
            isLittleEndian = false;
        }
    })();
        
    var warnings = new Set();
    const consoleWarn = (funcName, message) => {
        if(!warnings.has(message)){
            warnings.add(message);
            console.warn("EZIcometric.pixelArt." + funcName + " " + message);
        }
    }
            
    const createBitmap = (w = 256,h = 256) => {
        var bitmap = document.createElement("canvas");
        bitmap.width = Math.floor(w);
        bitmap.height = Math.floor(h);
        bitmap.ctx = bitmap.getContext("2d");
        return bitmap;
    }
    const copyBitmap = (bitmap) => {
        var copyBM = createBitmap(bitmap.width,bitmap.height);
        copyBM.ctx.drawImage(bitmap, 0, 0);
        return copyBM;
    }
    const missingBitmap = (functName) => {
        throw new ReferanceError("EZIsometric.pixelArt."+funcName+" requires a bitmap.");
    }
    const throwMB = missingBitmap;
    const throwMissingArgument = (functName,message) => {
        throw new ReferanceError("EZIsometric.pixelArt."+funcName+" "+message);
    }
    const throwMA = throwMissingArgument;    
    const pixelArt = {
        faces : (() => {
            if(EZIsometric.CONSTS !== undefined && EZIsometric.CONSTS.sides !== undefined){
                return EZIsometric.CONSTS.sides;
            }
            return {
                front : 0, 
                back : 1,
                left : 2,
                right : 3,
                top : 4,
                bottom : 5,
            };
        })(),    
        color : { // bloody US spelling does my head in
            RGBA2Style : (col) => {
                if(Array.isArray(col)){
                    return `rgba(${col[0]&0xFF},${col[1]&0xFF},${col[2]&0xFF},${(col[3]&0xFF)/255})`;
                }
                if(!isNaN(col)){
                    col &= 0xFFFFFFFF
                    return `rgba(${col>>24},${(col>>16)&0xFF},${(col>>8)&0xFF},${(col&0xFF)/255})`;
                }
                return style;                
            },
            RGBAArrayLerp : (colour1,colour2,amount,result) => {
                result = result === undefined ? [] : result;
                result[0] = ((colour2[0] - colour1[0]) * amount + colour1[0]) & 0xFF;
                result[1] = ((colour2[1] - colour1[1]) * amount + colour1[1]) & 0xFF;
                result[2] = ((colour2[2] - colour1[2]) * amount + colour1[2]) & 0xFF;
                result[3] = ((colour2[3] - colour1[3]) * amount + colour1[3]) & 0xFF;
                return result;
            },
            RGBAArrayLerpClamp : (colour1,colour2,amount,result) => {
                amount = Math.min(1, Math.max(0, amount));
                result = result === undefined ? [] : result;
                result[0] = ((colour2[0] - colour1[0]) * amount + colour1[0]) & 0xFF;
                result[1] = ((colour2[1] - colour1[1]) * amount + colour1[1]) & 0xFF;
                result[2] = ((colour2[2] - colour1[2]) * amount + colour1[2]) & 0xFF;
                result[3] = ((colour2[3] - colour1[3]) * amount + colour1[3]) & 0xFF;
                return result;
            },
            style2RGBAArray : (style,result) => {
                result = result === undefined ? [] : result;                
                if(typeof style === "string"){
                    if(style[0] === "#"){
                        if(style.length === 4){
                            result[0] = parseInt(style[1],16) << 4;
                            result[1] = parseInt(style[2],16) << 4;
                            result[2] = parseInt(style[3],16) << 4;
                            result[3] = 255;
                        }else{
                            // need to test is style[1]+style[2] is quicker the substr as I do not trust this info
                            result[0] = parseInt(style[1]+style[2],16);
                            result[1] = parseInt(style[3]+style[4],16);
                            result[2] = parseInt(style[5]+style[6],16);
                            result[3] = 255;
                        }
                        return result;
                    }
                }
                consoleWarn("color.style2RGBArray","This function is partly inmplemented currently only convers #FFF and #FFFFFF strings as style")
                result[0] = 0;
                result[1] = 0;
                result[2] = 0;
                result[3] = 255;
                return result;
            },
            color2RGBAArray : (col,result) => {
                result = result === undefined ? [] : result;                
                if(!isNaN(col)){
                    col = col & 0xffffffff;
                    if(isLittleEndian){
                        result[3] = col >>> 24;
                        result[2] = (col >> 16) & 0xFF;
                        result[1] = (col >> 8) & 0xFF;
                        result[0] = col & 0xFF; 
                    }else{
                        result[0] = col >>> 24;
                        result[1] = (col >> 16) & 0xFF;
                        result[2] = (col >> 8) & 0xFF;
                        result[3] = col & 0xFF; 
                    }
                }else if(typeof col === "string"){
                    colour.style2RGBAArray(col,result);
                }else if(Array.isArray(col)){
                    result[0] = col[0] & 0xFF;
                    result[1] = col[1] & 0xFF;
                    result[2] = col[2] & 0xFF;
                    result[3] = col[3] & 0xFF;
                }else{
                    result[0] = 0;
                    result[1] = 0;
                    result[2] = 0;
                    result[3] = 255;
                }
                return result;
            },
            RGBAArray2RGBANumber : (col) => {
                if(isLittleEndian){
                    return col[0]  | (col[1] << 8) | (col[2] << 16) | (col[3] << 24);
                }else{
                    return col[3]  | (col[2] << 8) | (col[1] << 16) | (col[0] << 24);
                }
            },            
            RGBANumber2RGBAArray : (col,result) => {
                result = result === undefined ? [] : result;                
                col = col & 0xffffffff;
                if(isLittleEndian){
                    result[3] = col >>> 24;
                    result[2] = (col >> 16) & 0xFF;
                    result[1] = (col >> 8) & 0xFF;
                    result[0] = col & 0xFF;                 
                }else{
                    result[0] = col >>> 24;
                    result[1] = (col >> 16) & 0xFF;
                    result[2] = (col >> 8) & 0xFF;
                    result[3] = col & 0xFF;                                     
                }
                return result;
            },
            color2RGBANumber : (col) => {
                if(!isNaN(col)){
                    return col & 0xffffffff;
                }else if(typeof col === "string"){
                    col = colour.style2RGBAArray(col);
                    if(isLittleEndian){
                        return col[0]  | (col[1] << 8) | (col[2] << 16) | (col[3] << 24);
                    }else{
                        return col[3]  | (col[2] << 8) | (col[1] << 16) | (col[0] << 24);
                    }
                }else if(Array.isArray(col)){
                    if(isLittleEndian){
                        return col[0]  | (col[1] << 8) | (col[2] << 16) | (col[3] << 24);
                    }else{
                        return col[3]  | (col[2] << 8) | (col[1] << 16) | (col[0] << 24);
                    }
                }
                return 255;
            },
            color2Style : (col) => {
                if(!isNaN(col) || Array.isArray(col)){
                    return colour.RGBA2Style(col);
                }
                return col;
            },
            createLinePattern : (cols) => {
                var pattern = {
                    isPattern : true,
                    RGBA : [],
                    style : [],
                    index : 0,
                    scale : 1,
                    setScaleToLength : function(length = 1){
                        if(length === 0){
                            this.scale = 1;
                        }
                        this.scale = this.RGBA.length / length;
                        return this;
                    },
                    indexed : function(index,RGBA){
                        index %= this.RGBA.length;
                        return RGBA ? this.RGBA[index] : this.style[index];
                    },
                    home : function(){
                        this.index = 0;
                        return this;
                    },
                    next : function(RGBA){
                        if(this.RGBA.length === 0){
                            return RGBA ? 0 : "rgba(0,0,0,0)";
                        }
                        var rv = Math.floor(this.index);
                        this.index += this.scale;
                        this.index = (this.index + this.RGBA.length) % this.RGBA.length;
                        return RGBA ? this.RGBA[rv] : this.style[rv];
                    },
                };
                if(Array.isArray(cols)){
                    cols.forEach(c => {
                        pattern.RGBA.push(colour.color2RGBANumber(c));
                        pattern.style.push(colour.color2Style(c));
                    });
                }
                return pattern;
            }
        
        },
        createBitmap : (w = 256,h = 256) => {
            var bitmap = document.createElement("canvas");
            bitmap.width = Math.floor(w);
            bitmap.height = Math.floor(h);
            bitmap.ctx = bitmap.getContext("2d");
            return bitmap;
        },
        imageToBitmap : (image = throwMA("imageToBitmap","Requires first argument image.")) => {
            if(image.ctx === undefined){
                var bitmap = pA.createBitmap(image.width, image.height);  
                bitmap.ctx.drawImage(image, 0, 0);
                return bitmap;
            }
            return image;
        },
        copyBitmap : (bitmap = throwMB("copyBitmap")) => {
            var copyBM = pA.createBitmap(bitmap.width,bitmap.height);
            copyBM.ctx.drawImage(bitmap, 0, 0);
            return copyBM;
        },
        getPixels : (bitmap = throwMB("getPixels"), x = 0, y = 0, width = bitmap.width, height = bitmap.height) => {
            var ctx = bitmap.ctx;
            if(ctx === undefined){
                ctx = pA.imageToBitmap(bitmap).ctx;
            }                
            return ctx.getImageData(x,y,width,height);            
        },
        putPixels : (pixels = throwMA("putPixels","Requires first argument to be pixel data."),
                     bitmap = throwMB("copyBitmap"), x = 0, y = 0) => {
             bitmap = pA.imageToBitmap(bitmap);
             if(x + pixels.width > bitmap.width || y + pixels.height > bitmap.height){
                 consoleWarn("putPixels","pixels data is being clipped to fit.");
             }
             
             bitmap.ctx.putImageData(pixels,x,y);
             return bitmap;
        }, 
        pixelsToBitmap : (pixels = throwMA("pixelsToBitmap","Requires first argument to be pixel data.")) => {
            var bitmap = pA.createBitmap(pixels.width,pixels.height);
            return pA.putPixels(pixels, bitmap);
        },        
        bitmapToISOFace: (bitmap = throwMB("bitmapToISOFace"), 
                    face = () => {consoleWarn("bitmapToISOFace","Missing face argument defaults to top"); return pA.faces.top;} ) => {
            var slide = 0; // slides pixels rows left to right as y goes down it represents the slope in terms of y
            var x,y;
            var up = 0; // slides pixel columns up for every up pixels across
            var w = bitmap.width;
            var h = bitmap.height;
            var nw,nh; // new width and height when known.
            if(face === pA.faces.top || face === pA.faces.bottom){
                slide = 1;
                up = 2;
            }else if(face === pA.faces.front || face === pA.faces.back){
                slide = 0;
                up = 2;
            }else if(face === pA.faces.left || face === pA.faces.right){
                slide = 0;
                up = -2;
            }else{
                consoleWarn("bitmapToISOFace","Unknown face, returning copy of original bitmap.");
                return pA.copyBitmap(bitmap);
            }   
            var pixels = pA.getPixels(bitmap);
            var dataN32,ind,ind1,off;
            var data32 = new Uint32Array(pixels.data.buffer);
            if(slide !== 0){
                nw = w + Math.ceil(h / slide);
                nh = h;
                dataN32 = new Uint32Array(nw * nh);
                for(y = 0; y < h; y += 1){
                    ind = y * w;
                    dataN32.set(data32.subarray(ind, ind + w),Math.floor(y * slide) + y * nw);
                }
                data32 = dataN32;
                w = nw;
                h = nh;
            }
            if(up !== 0){
                off = up < 0 ? w - 1: 0;
                up = Math.abs(up);
                nw = w;
                nh = h + Math.ceil(w / up);
                dataN32 = new Uint32Array(nw * nh);
                for(x = 0; x < w; x += 1){
                    ind = x;
                    ind1 = x + ((nh-Math.floor(Math.abs(off - x) / up))-h) * w;
                    y = h;
                    while(y > 0){
                        dataN32[ind1] = data32[ind];
                        ind += w;
                        ind1 += nw;
                        y -= 1;
                    }
                }
            }
            var pd = bitmap.ctx.createImageData(nw,nh);
            pd.data.set(new Uint8ClampedArray(dataN32.buffer));
            pA.putPixels(pd,bitmap)
            return pA.pixelsToBitmap(pd);
            /*
                width : nw,
                height : nh,
                data : new Uint8ClampedArray(dataN32.buffer),
            });*/
        },
        drawFillRect : (bitmap = throwMB("drawRect"),
                    x = throwMA("drawRect","missing arguments."),
                    y = throwMA("drawRect","missing arguments."),
                    w = throwMA("drawRect","missing arguments."),
                    h = throwMA("drawRect","missing arguments."),
                    style,scalePattern = 0) => {
            style = style === undefined ? "#000" : style;     
            var pixelData = false;   
            var pattern1 = false;             
            if (bitmap.data && bitmap.width && bitmap.height) { // assume its pixel data                        
                data32 = new Uint32Array(bitmap.data.buffer);    
                pixelData = true;
                if(style.isPattern){
                    pattern1 = true;
                }else{                    
                    pixel = colour.color2RGBANumber(style);
                }               
            }else{
                bitmap = pA.imageToBitmap(bitmap);
                if(style.isPattern){
                    pattern1 = true;
                }else{
                    bitmap.ctx.fillStyle = colour.color2Style(style);
                }                
            }            
            var xx = Math.floor(x + w);
            var yy = Math.floor(y + h);
            x = Math.floor(x);
            y = Math.floor(y);
            w = xx-x;
            h = hh-h;
            
            if(!pixelData){
                bitmap.ctx.fillRect(x,y,w,h);
            }
        },
        drawRect : (bitmap = throwMB("drawRect"),
                    x = throwMA("drawRect","missing arguments."),
                    y = throwMA("drawRect","missing arguments."),
                    w = throwMA("drawRect","missing arguments."),
                    h = throwMA("drawRect","missing arguments."),
                    style,scalePattern = 0) => {
            style = style === undefined ? "#000" : style;     
            var pixelData = false;   
            var pattern1 = false;             
            if (bitmap.data && bitmap.width && bitmap.height) { // assume its pixel data                        
                data32 = new Uint32Array(bitmap.data.buffer);    
                pixelData = true;
                if(style.isPattern){
                    pattern1 = true;
                }else{                    
                    pixel = colour.color2RGBANumber(style);
                }               
            }else{
                bitmap = pA.imageToBitmap(bitmap);
                if(style.isPattern){
                    pattern1 = true;
                }else{
                    bitmap.ctx.fillStyle = colour.color2Style(style);
                }                
            }
            var xx = Math.floor(x + w);
            var yy = Math.floor(y + h);
            x = Math.floor(x);
            y = Math.floor(y);
            if(!pixelData){
                if(!pattern1){
                    bitmap.ctx.fillRect(x,y,xx-x+1,1);
                    bitmap.ctx.fillRect(x,yy,xx-x+1,1);
                    bitmap.ctx.fillRect(x,y+1,1,(yy-y)-1);
                    bitmap.ctx.fillRect(xx,y+1,1,(yy-y)-1);
                }else{
                    var lx = xx-x;
                    var ly = yy-y;
                    style.setScaleToLength((lx * 2 + ly * 2)*scalePattern);
                    for(var i = 0; i <= lx; i ++){
                        bitmap.ctx.fillStyle = style.next();
                        bitmap.ctx.fillRect(x + i,y,1,1);
                    }
                    for(var i = 1; i <= ly; i ++){
                        bitmap.ctx.fillStyle = style.next();
                        bitmap.ctx.fillRect(xx,y + i,1,1);
                    }
                    for(var i = 1; i <= lx; i ++){
                        bitmap.ctx.fillStyle = style.next();
                        bitmap.ctx.fillRect(xx-i,yy,1,1);
                    }                     
                    for(var i = 1; i < ly; i ++){
                        bitmap.ctx.fillStyle = style.next();
                        bitmap.ctx.fillRect(x,yy-i,1,1);
                    }    
                }                    
            }else{
            }
         
            
        },
        drawLine : (bitmap = throwMB("drawLine"),
                    x = throwMA("drawLine","missing arguments."),
                    y = throwMA("drawLine","missing arguments."),
                    xx = throwMA("drawLine","missing arguments."),
                    yy = throwMA("drawLine","missing arguments."),
                    style,style2,skipFirstPixel = false) => {                            // BRENSENHAM line
            style = style === undefined ? "#000" : style;
            var index;
            var data32;
            var s1,s2;
            var pixel;
            var pixel1;
            var pattern1 = false;
            var pattern2 = false;
            var gradient = false;
            var pixelData = false;
            var canClip = false; // the becomes true when pixels are rendered and means that when the clip boundary is reached line rendering can stop
            if (bitmap.data && bitmap.width && bitmap.height) { // assume its pixel data
                data32 = new Uint32Array(bitmap.data.buffer);
                pixelData = true;
                if(style.isPattern){
                    pattern1 = true;
                }else{                    
                    pixel = colour.color2RGBANumber(style);
                }
                if (style2 !== undefined  && style2 !== null) {
                    if(!pattern1){
                        s1 = colour.color2RGBAArray(style);
                    }
                    if(style2.isPattern){
                        pattern2 = true;
                    }else{
                        s2 = colour.color2RGBAArray(style2);
                    }
                    gradient = true;
                }

            } else {
                bitmap = pA.imageToBitmap(bitmap);
                if(style.isPattern){
                    pattern1 = true;
                }else{
                    bitmap.ctx.fillStyle = colour.color2Style(style);
                }
                if(style2 !== undefined && style2 !== null){
                    if(!pattern1){
                        s1 = colour.color2RGBAArray(style);
                    }                   
                    if(style2.isPattern){
                        pattern2 = true;
                    }else{
                        s2 = colour.color2RGBAArray(style2);
                    }

                    gradient = true;
                }
                

            }
            xx = Math.floor(xx);
            yy = Math.floor(yy);
            x = Math.floor(x);
            y = Math.floor(y);
            const w = bitmap.width;
            const h = bitmap.height;
            var dx = Math.abs(xx - x);
            const sx = x < xx ? 1 : -1;
            var dy = -Math.abs(yy - y);
            const sy = y < yy ? 1 : -1;
            var err = dx + dy;
            var e2;
            var end = false;
            var x1 = x;
            var y1 = y;
            var dist,tempCol;
            if(gradient){
                dist = Math.hypot(x-xx,y-yy);
                
            }
            if(skipFirstPixel){
                if ((x1 === xx && y1 === yy)) {
                    end = true; 
                } else {
                    e2 = 2 * err;
                    if (e2 >= dy) {
                        err += dy;
                        x1 += sx;
                    }
                    if (e2 <= dx) {
                        err += dx;
                        y1 += sy;
                    }
                }                
            }
           
            while (!end) {
                if (x1 >= 0 && x1 < w && y1 >= 0 && y1 < h) {                    
                    if(gradient){
                        if(pattern1){
                            s1 = colour.RGBANumber2RGBAArray(style.next(true),s1);
                        }
                        if(pattern2){
                            s2 = colour.RGBANumber2RGBAArray(style2.next(true),s2);
                        }
                        tempCol = colour.RGBAArrayLerp(s1,s2,Math.hypot(x-x1,y-y1)/(dist),tempCol);
                        if (pixelData) {
                            data32[x1 + y1 * w] = colour.RGBAArray2RGBANumber(tempCol);
                        } else {
                            bitmap.ctx.fillStyle = colour.RGBA2Style(tempCol);
                            bitmap.ctx.fillRect(x1, y1, 1, 1);
                        }                        
                    }else{
                        if (pixelData) {
                            if(pattern1){
                                data32[x1 + y1 * w] = style.next(true);
                            }else{
                                data32[x1 + y1 * w] = pixel;
                            }
                        } else {
                            if(pattern1){
                                bitmap.ctx.fillStyle = style.next();
                                bitmap.ctx.fillRect(x1, y1, 1, 1);
                            }else{
                                bitmap.ctx.fillRect(x1, y1, 1, 1);
                            }
                        }
                    }
                    canClip = true;
                } else {
                    if (canClip) {
                        break;
                    }
                }
                if ((x1 === xx && y1 === yy)) {
                    end = true; // this may look silly but JavaScript optimiser require that iteration loops provide a clear exit condition. Having while(true) and the exiting on the break will confuse some optimisers and then they will make the function or whole module are "do not optimise" something we don't want.
                } else {
                    e2 = 2 * err;
                    if (e2 >= dy) {
                        err += dy;
                        x1 += sx;
                    }
                    if (e2 <= dx) {
                        err += dx;
                        y1 += sy;
                    }
                }
            }
            return;
        },
        
        floodFill : (bitmap  = throwMB("floodFill"),
                    x = throwMA("floodFill","missing arguments."), 
                    y = throwMA("floodFill","missing arguments."), 
                    style,
                    tolerance = 0,
                    diagonal = false,
                    edgeMask = 0) => {
            var isBitmap = false;           
            var pixels;
            if (bitmap.data && bitmap.width && bitmap.height) { // assume its pixel data                          
                pixels = bitmap;
            }else{
                bitmap = pA.imageToBitmap(bitmap);
                isBitmap = true;
                pixels = pA.getPixels(bitmap);
            }
            var w = pixels.width;
            var h = pixels.height;
            var data = pixels.data;
            var data32 = new Uint32Array(pixels.data.buffer);
            var stack = [];          // paint stack to find new pixels to paint
            var lLeft = false;    // test directions
            var lRight = false;
            var painted = new Uint8ClampedArray(w*h);  // byte array to mark painted area;
            var dw = w*4; // data width.
            var pixel;
            var pixelCols;
            var i;
            if(!(edgeMask > 0 && style.isPattern)){
                pixel = colour.color2RGBANumber(style);
            }
            var pos;
            var top = y;
            var bot = y;
            var left = x;
            var right = x;
            var ind = y * dw + x * 4;  // get the starting pixel index
            var sr = data[ind];        // get the start colour that we will use tolerance against.
            var sg = data[ind+1];
            var sb = data[ind+2];
            var sa = data[ind+3];  
            var dontPaint = false;  // flag to indicate if checkColour can paint
            var checkColour;
            var checkColour = (x,y) => {
                if( x< 0 || y < 0 || y >=h || x >= w){  // test bounds
                    return false;
                }
                if(painted[y * w + x] === 255){
                    return false;
                }
                var ind = y * dw + x * 4;  // get index of pixel
  
                if(tolerance > Math.max(        // get the max channel differance;
                    Math.abs(sr-data[ind]),
                    Math.abs(sg-data[ind+1]),
                    Math.abs(sb-data[ind+2]),                
                    Math.abs(sa-data[ind+3]))){         // if under tolerance pass it
                    return true;
                }        
                return false
            }
            // set a pixel and flag it as painted;
            
            var setPixel = (x,y) => {
                var ind = y*w+x;
                if(edgeMask === 0){
                    data32[ind] = pixel;  // get index;
                }else{
                    top = Math.min(top,y);
                    bot = Math.max(bot,y);
                    left = Math.min(left,x);
                    right = Math.max(right,x);
                }
                //data[ind*4] = pixel;  // get index;
                painted[ind] = 255;   // 255 or any number >0 will do;
            }

            stack.push([x,y]);  // push the first pixel to paint onto the paint stack
                
            while (stack.length) {   // do while pixels on the stack
                pos = stack.pop();  // get the pixel
                x = pos[0];
                y = pos[1];
                while (checkColour(x,y-1)) {  // finf the bottom most pixel within tollerance;
                    y -= 1;
                }
                //checkTop left and right if allowing diagonal painting
                if(diagonal){
                    if(!checkColour(x-1,y) && checkColour(x-1,y-1)){
                        stack.push([x-1,y-1]);
                    }
                    if(!checkColour(x+1,y) && checkColour(x+1,y-1)){
                        stack.push([x+1,y-1]);
                    }
                }
                lLeft = false;  // set look directions
                lRight = false; // only look is a pixel left or right was blocked
                while (checkColour(x,y)) { // move up till no more room
                    setPixel(x,y);         // set the pixel
                    if (checkColour(x - 1,y)) {  // check left is blocked
                        if (!lLeft) {        
                            stack.push([x - 1, y]);  // push a new area to fill if found
                            lLeft = true;
                        }
                    } else if (lLeft) {
                        lLeft = false;
                    }
                    if (checkColour(x+1,y)) {  // check right is blocked
                        if (!lRight) {
                            stack.push([x + 1, y]); // push a new area to fill if found
                            lRight = true;
                        }
                    } else if (lRight) {
                        lRight = false;
                    }
                    y += 1;
                }
                if(diagonal){
                    if(checkColour(x-1,y) && !lLeft){
                        stack.push([x-1,y]);
                    }
                    if(checkColour(x+1,y) && !lRight){
                        stack.push([x+1,y]);
                    }
                }
            }
            if(edgeMask > 0){
                var l = edgeMask & 1;
                var t = edgeMask & 2;
                var r = edgeMask & 4;
                var b = edgeMask & 8;
                var w1 = w-1;
                var h1 = h-1;   
                var colourMap = [0,1,2,5,3,13,6,9,4,8,14, 12, 7,11, 10, 15];
               for(y = top; y <= bot; y ++){                        
                    for(x = left; x <= right; x ++){
                        ind = y * w + x;
                        if(painted[ind] === 255){
                            var sides = 0;
                            if(l && (painted[ind-1] === 0 || x === 0)){
                                sides |= 1;
                            }
                            if(r && (painted[ind+1] === 0 || x === w1)){
                                sides |= 4
                            }
                            if(t && (painted[ind-w] === 0 || y === 0)){
                                sides |= 2
                            }
                            if(b && (painted[ind+w] === 0 || y === h1)){
                                sides |= 8
                            }
                            if(sides > 0){
                                if(pixel !== undefined){
                                    data32[ind] = pixel;
                                }else{
                                    data32[ind] = style.indexed(colourMap[sides],true);
                                }
                            }
                        }
                    }
                }
                
                
            }
            if(isBitmap){
                pA.putPixels(pixels, bitmap);
            }
            return bitmap;
        }     
    }
    const pA = pixelArt;
    const colour = pA.color;
    
    
    return pixelArt
})();



