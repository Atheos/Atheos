/*
 *  Copyright (c) Codiad & Kent Safranski (codiad.com), distributed
 *  as-is and without warranty under the MIT License. See
 *  [root]/license.txt for more. This information must remain intact.
 */

(function(global, $){

    var codiad = global.codiad;

    $(function() {
        codiad.demo.init();
    });

    codiad.demo = {
        init: function() {
            $('input[name=username]').val('demo');
            $('input[name=password]').val('demo');
            $('input[name=password_confirm]').val('demo');
            $('input[name=project_name]').val('demo');
            $('input[name=project_path]').val('demo');
            
            $('input').each(function(){
                $(this).attr("readonly", true);
            });
        }
    };
})(this, jQuery);
