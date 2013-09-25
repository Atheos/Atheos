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
            $('#context-menu a[onclick="codiad.filemanager.uploadToNode($(\'#context-menu\').attr(\'data-path\'));"]').attr("onclick", "codiad.demo.denied();");
            $('#sb-right a[onclick="codiad.user.password();"]').attr("onclick", "codiad.demo.denied();");
            $('#modal-content').hover(function() { 
                $('#modal-content button[onclick*=\'codiad.market.install\']').each(function() {
                    $(this).attr("onclick", "codiad.demo.denied();");
                });
                $('#modal-content button[onclick*=\'codiad.market.update\']').each(function() {
                    $(this).attr("onclick", "codiad.demo.denied();");
                });
                $('#modal-content button[onclick*=\'codiad.market.remove\']').each(function() {
                    $(this).attr("onclick", "codiad.demo.denied();");
                });
                $('#modal-content input[name="project_path"]').attr("readonly", true);
                $('#modal-content input[name="project_path"]').attr("placeholder", "Not Allowed in Demo Mode");
                $('#modal-content a[onclick="codiad.user.password(\'demo\');"]').attr("onclick", "codiad.demo.denied();");
                $('#modal-content a[onclick="codiad.user.projects(\'demo\');"]').attr("onclick", "codiad.demo.denied();");
                $('#modal-content a[onclick="codiad.user.delete(\'demo\');"]').attr("onclick", "codiad.demo.denied();");
                $('#modal-content a[onclick="codiad.project.delete(\'demo\',\'demo\');"]').attr("onclick", "codiad.demo.denied();");
            },function() {});
        },
        
        denied: function() {
            codiad.message.error('Not Allowed in Demo Mode');
            return false;
        }
    };
})(this, jQuery);
