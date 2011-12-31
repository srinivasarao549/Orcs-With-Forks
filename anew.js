void function(root, module_p, exports_p){

    var get_proto = Object.getPrototypeOf
    
    function anew(proto, object){
        
        function mixin_object(to, from){
            
            function copy_key_val(key){
                to[key] = from[key]
            }
            Object.keys(from).forEach(copy_key_val)
        }
        

        function call_proto_constructors(object, proto){
            
            if ( !proto ) proto = get_proto(object)
            
            if ( proto === Object.prototype ) return
            else call_proto_constructors(object, get_proto(proto)) 
            
            // apply while falling from stack 
            if ( proto["constructor"] ) proto["constructor"].apply(object)
        }


        // defaults 
        if ( proto === undefined ) proto = {}
        if ( object === undefined ) object = {}

        // logic
        var return_object = Object.create(proto)
        
        mixin_object(return_object, object)
        if ( proto instanceof Object ) call_proto_constructors(return_object)
        if ( {}.hasOwnProperty.call(return_object, "constructor") ) return_object["constructor"]()
        
        return return_object
    }
    
    // export
    if ( module_p && exports_p ) module.exports = anew
    else root["anew"] = anew

}(this,
typeof module != "undefined",
typeof exports != "undefined")