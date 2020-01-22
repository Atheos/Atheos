/*
 * Copyright (c) Codiad & Andr3as, distributed
 * as-is and without warranty under the MIT License.
 * See http://opensource.org/licenses/MIT for more information. 
 * This information must remain intact.
 */

(function(global, $){
    
    var codiad = global.codiad;
	
    codiad.Complete.extensions.snippets = {
        
        precompiled : [],
        compiled: [],
        isReady: [],
        loading: [],
        
        init: function() {
            var _this = this;
            //Register listener
            amplify.subscribe('Complete.Session', function(obj){
                _this.suggestSnippets(obj);
                // Hardcode for c and jquery
				switch (obj.syntax) {
                    case 'c_cpp':
                        obj.syntax = 'c';
                        _this.suggestSnippets(obj);
                        break;
                    case 'javascript':
                        obj.syntax = 'javascript-jquery';
                        _this.suggestSnippets(obj);
                        break;
				}
            });
            amplify.subscribe('active.onOpen', function(path){
				var ext     = codiad.filemanager.getExtension(path);
				var mode    = codiad.editor.selectMode(ext);
				if (typeof(_this.compiled[mode]) == 'undefined') {
					//Load snippets
					_this.loadSnippets(mode);
					// Hardcode for c and jquery
					switch (mode) {
                        case 'c_cpp':
                            _this.loadSnippets('c');
                            break;
                        case 'javascript':
                            _this.loadSnippets('javascript-jquery');
                            break;
					}
				}
            });
            //Load available snippets
            this.loadPrecompiled();
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Suggest snippets
        //
        //  Parameter:
        //
        //  obj - {object} - publishObj
        //
        //////////////////////////////////////////////////////////
        suggestSnippets: function(obj) {
            if (this.isReady[obj.syntax]) {
                codiad.Complete.pluginSession(this.compiled[obj.syntax]);
            }
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Load snippets and parse them
        //
        //  Parameter:
        //
        //  mode - {object} - Syntax mode
        //
        //////////////////////////////////////////////////////////
        loadSnippets: function(mode) {
            var _this = this;
            if (typeof(this.compiled[mode]) == 'undefined') {
				if (typeof(this.precompiled[mode]) != 'undefined') {
					var files   = this.precompiled[mode];
					
					fn = function(file, i) {
                        var content = "";
                        var ext = codiad.filemanager.getExtension(file);
                        $.getJSON(codiad.Complete.path + "controller.php?action=getContent&path=snippets/" + file, function(result){
							if (result.status == "success") {
                                content = result.content;
                                if (ext == "snippets") {
                                    //Compile file
                                    content = codiad.Complete.snippetManager.parseSnippetFile(content);
                                } else {
                                    content = JSON.parse(content);
                                }
                                //Add to compiled
                                if (typeof(_this.compiled[mode]) == 'undefined') {
                                    _this.compiled[mode] = [];
                                }
                                $.each(content, function(i, item){
                                    _this.compiled[mode].push(item);
                                });
                                _this.loading[mode].splice(_this.loading[mode].indexOf(file),1);
                                if (_this.loading[mode].length === 0) {
                                    _this.createObjects(mode);
                                }
							} else {
                                codiad.message.error(result.message);
							}
						});
					};
					
					for (var i = 0; i < files.length; i++) {
						if (typeof(this.loading[mode]) == 'undefined') {
                            this.loading[mode] = [];
						}
						this.loading[mode].push(files[i]);
						fn(files[i], i);
					}
				}
            }
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Load all available snippets
        //
        //////////////////////////////////////////////////////////
        loadPrecompiled: function() {
			var _this = this;
			$.getJSON(codiad.Complete.path + 'controller.php?action=getExtensions&path=snippets', function(json){
				json = json.extensions;
				var ext = "";
				var basename = "";
				for(var i = 0; i < json.length; i++) {
					ext = codiad.filemanager.getExtension(json[i]);
                    basename = json[i].substring(0, (json[i].length - ext.length)-1);
					if (basename !== "") {
						if (typeof(_this.precompiled[basename]) == 'undefined') {
							_this.precompiled[basename] = [];
						}
						_this.precompiled[basename].push(json[i]);
					}
				}
			});
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Create objects of loaded snippets
        //
        //  Parameter:
        //
        //  mode - {object} - Syntax mode
        //
        //////////////////////////////////////////////////////////
        createObjects: function(mode) {
            if (typeof(this.isReady[mode]) != 'undefined') {
                return;
            }
            var obj, ranking,
                buffer = [];
            $.each(this.compiled[mode], function(i, item) {
                if (typeof(item.tabTrigger) != 'undefined') {
                    ranking = item.tabTrigger;
                } else {
                    ranking = item.name.substr(0,item.name.indexOf("("));
                }
                obj = codiad.Complete.pluginParser(item.content, ranking, item.name, null, true);
                buffer.push(obj);
            });
            
            this.compiled[mode] = buffer;
            this.isReady[mode]  = true;
        }
    };
    
    $(function() {
        codiad.Complete.extensions.snippets.init();
    });
})(this, jQuery);