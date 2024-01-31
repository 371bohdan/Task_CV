const STYLES = {
    key1: { canvas: 'value1' },
    key2: { canvas: 'value2' },
};


function Ctx() {
    
}

Ctx.prototype.__IterateKey = function(obj, callback) {
    let keys = Object.keys(obj);
    for(let i =0; i<keys.length; i++){
        callback.call(this, keys[i]) //for use our object and value in other functions
    }
}

Ctx.prototype.__applyStyleState = function(styleState) {
    this.__IterateKey(styleState, function(key) {
        this[key] = styleState[key];
    });
};

Ctx.prototype.__setDefaultStyles = function() {
    this.__IterateKey(STYLES, function(key){
        this[key] = STYLES[key].canvas;
    });
}

Ctx.prototype.__getStyleState = function() {
    let styleState = {}
    this.__IterateKey(STYLES, function(key){
        styleState[key] = this[key];
    })
    return styleState;
}


const ctxInstance = new Ctx();

ctxInstance.__applyStyleState({ key1: 'value3', key2: 'value3' });

ctxInstance.__setDefaultStyles();

console.log(ctxInstance.__getStyleState());

    
