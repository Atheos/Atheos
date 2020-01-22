/*
 * Copyright (c) Codiad & Andr3as, distributed
 * as-is and without warranty under the MIT License.
 * See http://opensource.org/licenses/MIT for more information. 
 * This information must remain intact.
 */

(function(global, $){
    
    var codiad = global.codiad;
	
    codiad.Complete.extensions.php = {
        
        init: function() {
            var _this = this;
            //Register listener
            amplify.subscribe('Complete.Normal', function(obj){
                if (obj.syntax == 'php') {
                    _this.removeProperties(obj);
                }
            });
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Remove variables, if necessary
        //
        //  Parameter:
        //
        //  obj - {object} - publishObj
        //
        //////////////////////////////////////////////////////////
        removeProperties: function(obj) {
            if (codiad.Complete.isAtEnd(obj.before, '->' + obj.prefix)) {
                var buffer = [];
                $.each(codiad.Complete.suggestionTextCache, function(i, item){
                    if (item.suggestion.indexOf("$") !== 0) {
                        buffer.push(item);
                    }
                });
                codiad.Complete.suggestionTextCache = buffer;
            }
        }
    };
    
    $(function() {
        codiad.Complete.extensions.php.init();
    });
})(this, jQuery);