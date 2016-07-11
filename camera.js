
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