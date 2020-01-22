/*
* Copyright (c) Codiad & Andr3as, distributed
* as-is and without warranty under the MIT License.
* See [root]/license.md for more information. This information must remain intact.
*/

(function(global, $){

    var codiad  = global.codiad,
        scripts = document.getElementsByTagName('script'),
        path    = scripts[scripts.length-1].src.split('?')[0],
        curpath = path.split('/').slice(0, -1).join('/')+'/';
    var EventEmitter    = ace.require('ace/lib/event_emitter').EventEmitter;
    var Range           = ace.require('ace/range').Range;

    $(function() {
        codiad.Complete.init();
    });

    codiad.Complete = {
        
        path        : curpath,
        comAdded    : false,
        isVisible   : false,
        prefix      : "",
        
        api         : 1.1,
        wordRegex   : /[^a-zA-Z_0-9\$\-]+/,
        
        extensions	: {},   //Autocomplete extensions
        
        snippetManager: null,
        
        //Caches
        suggestionCache     : null,     //Cache displayed suggestions
        suggestionTextCache : null,     //Cache suggestions of the text
        pluginInitCache     : null,     //Cache suggestions of plugins at start of init
        pluginCache         : null,     //Cache suggestions of plugins on each change
        pluginSessionCache	: null,		//Cache suggestions of plugins at start of session
        pluginMajCache      : null,     //Cache suggestions of plugins to display them matching or not
        
        //Default commands
        defaultEscExec      : null,
        defaultUpExec       : null,
        defaultDownExec     : null,
        defaultLeftExec     : null,
        defaultRightExec    : null,
        defaultEnterExec    : null,
        defaultIndentExec   : null,
        
        init: function() {
            var _this = this;
            //Load library
            $.getScript(_this.path + 'Snippets.js').complete(function(){
                var id = setInterval(function(){
                    if (typeof(ace.require) != 'undefined') {
                        if (typeof(ace.require("ace/snippets")) != 'undefined') {
                            if (typeof(ace.require("ace/snippets").snippetManager) != 'undefined') {
                                clearInterval(id);
                                _this.snippetManager = ace.require("ace/snippets").snippetManager;
                            }
                        }
                    }
                },250);
            });
            //Load extensions
            $.getJSON(this.path + 'controller.php?action=getExtensions', function(result) {
                $.each(result.extensions, function(i, ext){
                    $.getScript(_this.path + 'extensions/' + ext);
                });
            });
            
            this.$comUp             = this.goUp.bind(this);
            this.$comDown           = this.goDown.bind(this);
            this.$comLeft           = this.goLeft.bind(this);
            this.$comRight          = this.goRight.bind(this);
            this.$comReturn         = this.enter.bind(this);
            this.$comIndent         = this.indent.bind(this);
            this.$comComplete       = this.complete.bind(this);
            this.$onDocumentChange  = this.onDocumentChange.bind(this);
            //Overwrite existing click command
            codiad.autocomplete.complete = this.$comComplete;
            //Register complete command
            amplify.subscribe('active.onOpen', function(path){
                setTimeout(_this.setKeyBindings(), 50);
            });
            //Hide dialog on file close
            amplify.subscribe('active.onClose', function(){
                _this.hide();
            });
            amplify.subscribe('active.onRemoveAll', function(){
                _this.hide(); 
            });
            //Get init data
            setTimeout(function(){
                //Publish plugin listener
                amplify.publish("Complete.Init");
            }, 1000);
        },
        
   
        
        //////////////////////////////////////////////////////////
        //
        //  Set key bindings and publish Complete.Init
        //
        //////////////////////////////////////////////////////////
        setKeyBindings: function() {
            var _this = this;
            if (codiad.editor.getActive() !== null) {
                //Add initial keyboard command
                var _commandManager = codiad.editor.getActive().commands;
                _commandManager.addCommand({
                    name: 'CompletePlus',
                    bindKey: {
                        "win": "Ctrl-Space",
                        "mac": "Ctrl-Space"
                    },
                    exec: function () {
                        _this.suggest();
                    }
                });
                
                if (this.__onKeyUpEnabled()) {
                    $('.editor').keyup(function(e){
                        if (e.which >= 48 && e.which <= 90) {
                            _this.suggest();
                        } 
                    });
                }
            }
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Add keyboard command to handle user interactions
        //
		//////////////////////////////////////////////////////////
        addKeyboardCommands: function() {
            if (codiad.editor.getActive() === null) {
                return false;
            }
            var _this   = this;
            var _commandManager = codiad.editor.getActive().commands;
            //Save default commands
            this.defaultUpExec      = _commandManager.commands.golineup.exec;
            this.defaultDownExec    = _commandManager.commands.golinedown.exec;
            this.defaultLeftExec    = _commandManager.commands.gotoleft.exec;
            this.defaultRightExec   = _commandManager.commands.gotoright.exec;
            this.defaultIndentExec  = _commandManager.commands.indent.exec;
            //Register new commands
            _commandManager.commands.golineup.exec      = this.$comUp;
            _commandManager.commands.golinedown.exec    = this.$comDown;
            _commandManager.commands.gotoleft.exec      = this.$comLeft;
            _commandManager.commands.gotoright.exec     = this.$comRight;
            _commandManager.commands.indent.exec        = this.$comIndent;
            //Overwrite multiselection rule
            _commandManager.commands.golineup.multiSelectAction      = "";
            _commandManager.commands.golinedown.multiSelectAction    = "";
            _commandManager.commands.gotoleft.multiSelectAction      = "";
            _commandManager.commands.gotoright.multiSelectAction     = "";
            _commandManager.commands.indent.multiSelectAction        = "";
            
            _commandManager.addCommand({
                name: 'hidecomplete',
                bindKey: 'Esc',
                exec: function () {
                    _this.hide();
                }
            });
            _commandManager.addCommand({
                name: 'ReturnToComplete',
                bindKey: 'Return',
                exec: this.$comReturn
            });
            
            var session = codiad.editor.getActive().getSession();
            session.addEventListener('change', this.$onDocumentChange);
            
            // handle click-out autoclosing.
            var fn = function () {
                _this.hide();
                $(window).off('click', fn);
            };
            $(window).on('click', fn);
            
            this.comAdded   = true;
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Remove keyboard commands and restore default commands
        //
		//////////////////////////////////////////////////////////
        removeKeyboardCommands: function() {
            if (codiad.editor.getActive() === null) {
                return false;
            }
            //Restore default commands
            var _commandManager = codiad.editor.getActive().commands;
            //Make sure default exits
            if (this.defaultUpExec !== null) {
                _commandManager.commands.golineup.exec      = this.defaultUpExec;
            }
            if (this.defaultDownExec !== null) {
                _commandManager.commands.golinedown.exec    = this.defaultDownExec;
            }
            if (this.defaultLeftExec !== null) {
                _commandManager.commands.gotoleft.exec      = this.defaultLeftExec;
            }
            if (this.defaultRightExec !== null) {
                _commandManager.commands.gotoright.exec     = this.defaultRightExec;
            }
            if (this.defaultIndentExec !== null) {
                _commandManager.commands.indent.exec        = this.defaultIndentExec;
            }
            
            //Restore multiselection rule
            _commandManager.commands.golineup.multiSelectAction      = "forEach";
            _commandManager.commands.golinedown.multiSelectAction    = "forEach";
            _commandManager.commands.gotoleft.multiSelectAction      = "forEach";
            _commandManager.commands.gotoright.multiSelectAction     = "forEach";
            _commandManager.commands.indent.multiSelectAction        = "forEach";
            
            _commandManager.removeCommand('hidecomplete');
            _commandManager.removeCommand('ReturnToComplete');
            var session = codiad.editor.getActive().getSession();
            session.removeEventListener('change', this.$onDocumentChange);
            this.comAdded   = false;
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Suggest
        //
        //  Parameter:
        //
        //  position - (Optional) - {Object} - Position of the cursor
        //
		//////////////////////////////////////////////////////////
        suggest: function(position) {
            if (codiad.editor.getActive() === null) {
                this.hide();
                return false;
            }
            //Get prefix
            if (typeof(position) == 'undefined') {
                position = codiad.editor.getActive().getCursorPosition();
            }
            var token = codiad.editor.getActive().getSession().getTokenAt(position.row,position.column);
            if (token === null) {
                this.hide();
                return false;
            }
            //Get text before cursor
            var prefix  = token.value.substr(0, position.column - token.start);
            prefix      = prefix.split(this.wordRegex).slice(-1)[0];
            //Get the current line
            var text    = codiad.editor.getActive().getSession().getValue();
            var line    = text.split("\n")[position.row];
            //Get content before prefix
            var range   = new Range(position.row,0,position.row,position.column);
            var value   = codiad.editor.getActive().getSession().getTextRange(range);
            var syntax  = $('#current-mode').text();
            //Get current file
            var file    = codiad.editor.getActive().getSession().path;
            var publishObj  = {"prefix": prefix, "before": value, "syntax": syntax, "line": line, "token": token, "position": position, "file": file };
            this.prefix = prefix;
            this.suggestionTextCache = this.getTextSuggestions();
            //Remove old plugin data
            this.pluginMajCache = [];
            this.pluginCache    = [];
            //Publish for Plugins
            amplify.publish( "Complete.Normal", publishObj);
            amplify.publish( "Complete.Major", publishObj);
            //Suggestion for current session
            if (!this.isVisible) {
				amplify.publish( "Complete.Session", publishObj);
            }
            
            var matches, fuzzilies;
            if (prefix !== "") {
                matches     = this.getMatches(prefix, this.suggestionTextCache);
                fuzzilies   = this.getFuzzilies(prefix, this.suggestionTextCache);
            } else {
                matches     = [];
                fuzzilies   = [];
            }
            
            var pluginSugs  = this.pluginInitCache;
            if (pluginSugs === null || pluginSugs.length === 0) {
                pluginSugs  = this.pluginCache;
            } else {
                pluginSugs  = this.push(pluginSugs, this.pluginCache);
            }
            //Add session suggestions
            if (pluginSugs === null || pluginSugs.length === 0) {
				pluginSugs  = this.pluginSessionCache;
            } else {
				pluginSugs  = this.push(pluginSugs, this.pluginSessionCache);
            }
            
            var pluginMatches   = this.getMatches(prefix, pluginSugs);
            var pluginFuzzilies = this.getFuzzilies(prefix, pluginSugs);
            //Add type info
            matches             = this.addExtraInfo(matches, "type", "text");
            fuzzilies           = this.addExtraInfo(fuzzilies, "type", "text");
            
            pluginMatches       = this.addExtraInfo(pluginMatches, "type", "plugin");
            pluginFuzzilies     = this.addExtraInfo(pluginFuzzilies, "type", "plugin");
            this.pluginMajCache = this.addExtraInfo(this.pluginMajCache, "type", "plugin");
            //Remove double entries
            fuzzilies           = this.removeDoubleEntries(matches, fuzzilies);
            pluginFuzzilies     = this.removeDoubleEntries(pluginMatches, pluginFuzzilies);
            //Remove entries in textArray, which are defined in pluginArray
            matches             = this.removeDoubleEntries(pluginMatches, matches);
            fuzzilies           = this.removeDoubleEntries(pluginFuzzilies, fuzzilies);
            //Combine plugin und text matches
            matches     = this.push(matches, pluginMatches);
            fuzzilies   = this.push(fuzzilies, pluginFuzzilies);
            //Remove empty arrays
            matches     = this.removeEmptyArrays(matches);
            fuzzilies   = this.removeEmptyArrays(fuzzilies);
            //Rank suggestions
            matches     = this.rankSuggestions(prefix, matches);
            fuzzilies   = this.rankSuggestions(prefix, fuzzilies);
            //Combine matches and fuzzilies
            var pluginMaj   = this.pluginMajCache;
            var sugs        = pluginMaj;
            sugs            = this.push(sugs, matches);
            sugs            = this.push(sugs, fuzzilies);
            //Remove empty arrays
            sugs = this.removeEmptyArrays(sugs);
            if (sugs.length === 0) {
                this.hide();
                return false;
            }
            //Limit suggestions on 30
            sugs = sugs.slice(0,30);
            
            this.suggestionCache = sugs;
            //Smart complete enabled?
            if (sugs.length == 1 && this.__onSmartCompleteEnabled() && !this.__onKeyUpEnabled()) {
                //Complete without dialog
                this.complete(sugs[0]);
            } else {
                this.show();
            }
            return true;
        },
        
        /*
            Array - [{
                        title - Title of the suggestions to display
                        suggestion - Suggestions to insert
                        ranking - Suggestion to rank
                        callback - "Amplify Topic" -> amplify.publish(callback, {Array of the Suggestion})
                            wenn callback == "" -> macht CompletePlus die ersetzung aufgrundlage von suggestion
                        },{...}]
        */
        //////////////////////////////////////////////////////////
        //
        //  Function for plugins to add their suggestions
        //
        //  Parameter:
        //
        //  sug - {Object/Array} - Suggestion(s) to add
        //
		//////////////////////////////////////////////////////////
        pluginInit: function(sug) {
            return this.pluginSuggest("pluginInitCache", sug);
        },
        
        pluginNormal: function(sug) {
            return this.pluginSuggest("pluginCache", sug);
        },
        
        pluginSession: function(sug) {
			return this.pluginSuggest("pluginSessionCache", sug);
        },
        
        pluginMajor: function(sug) {
            return this.pluginSuggest("pluginMajCache", sug);
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Function to add suggestions of plugins
        //
        //  PRIVATE - ! DO NOT USE !
        //
        //  Parameter:
        //
        //  sugArray - {String} - Array to add the suggestion
        //  sug - {Object/Array} - Suggestion(s) to add
        //
        //////////////////////////////////////////////////////////
        pluginSuggest: function(sugArray, sug) {
            if (typeof(sug) == 'undefined' || sug === null || sug.length === 0) {
                return false;
            }
            if (this[sugArray] === null) {
                this[sugArray] = [];
            }
            this[sugArray] = this.push(this[sugArray], sug);
            return true;
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Complete the current active suggestin or publish it 
        //      for a plugin
        //
        //  Parameters:
        //
        //  suggestion - {Object} - Object to complete current suggestion
        //
        //////////////////////////////////////////////////////////
        complete: function(object) {
            if (typeof(object) === 'undefined') {
                var sug = this.extensions.phpjs.htmlspecialchars_decode($('.active-suggestion').attr("data-suggestion"));
                object = this.getObjectOutArray(sug, this.suggestionCache);
            }
            
            this.hide();
            if (object === false) {
                return false;
            }
            
            if (object.type == "plugin") {
                if (object.callback !== "") {
                    //Workaround for return command
                    setTimeout(function(){
                        amplify.publish(object.callback, object);
                    },0);
                    return true;
                }
            }
            //Insert suggestion
            this.replacePrefix(object.suggestion, object.isSnippet);
            return true;
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Activate suggestion over the current active
        //
        //////////////////////////////////////////////////////////
        goUp: function() {
            var entries = $('.suggestion');
            if (entries.length == 1) {
                return false;
            }
            for (var i = 0; i < entries.length; i++) {
                if ($(entries[i]).hasClass('active-suggestion')) {
                    if ($('.suggestion:first').hasClass('active-suggestion')) {
                        $('.suggestion:last').addClass('active-suggestion');
                    } else {
                        $(entries[i-1]).addClass('active-suggestion');
                    }
                    $(entries[i]).removeClass('active-suggestion');
                    //Scroll dialog
                    this._computeScrolling();
                    return true;
                }
            }
            return false;
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Activate suggestion under the current active
        //
        //////////////////////////////////////////////////////////
        goDown: function() {
            var entries = $('.suggestion');
            if (entries.length == 1) {
                return false;
            }
            for (var i = 0; i < entries.length; i++) {
                if ($(entries[i]).hasClass('active-suggestion')) {
                    if ($('.suggestion:last').hasClass('active-suggestion')) {
                        $('.suggestion:first').addClass('active-suggestion');
                    } else {
                        $(entries[i+1]).addClass('active-suggestion');
                    }
                    $(entries[i]).removeClass('active-suggestion');
                    //Scroll dialog
                    this._computeScrolling();
                    return true;
                }
            }
            return false;
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Handle left key
        //
        //////////////////////////////////////////////////////////
        goLeft: function() {
            this.hide();
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Handle right key
        //
        //////////////////////////////////////////////////////////
        goRight: function() {
            this.complete();
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Handle tab key
        //
        //////////////////////////////////////////////////////////
        indent: function() {
            this.complete();
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Handle return key
        //
        //////////////////////////////////////////////////////////
        enter: function() {
            this.complete();
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Handle document change
        //
        //////////////////////////////////////////////////////////
        onDocumentChange: function (e) {
            var _this = this, text, action, range;
            if (typeof(e.data) == 'undefined') {
                text = e.text || e.lines[0] || "";
                action = e.action;
                if (typeof(e.range) == 'undefined') {
                    range = {start: e.start, end: e.end};
                } else {
                    range = e.range;
                }
            } else {
                text = e.data.text;
                action = e.data.action;
                range = e.data.range;
            }
            
            if (text.search(/^\s+$/) !== -1) {
                this.hide();
                return;
            }
            
            var position = null;
            if (action === 'insertText' || action === 'insert') {
                position = range.end;
            } else if (action === 'removeText' || action == 'remove') {
                position = range.start;
            } else {
                alert('Unkown document change action.');
            }
            
            setTimeout(function(){
                if (!_this.suggest(position)){
                    _this.hide();
                }
            }, 0);
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Show autocomplete dialog
        //
        //////////////////////////////////////////////////////////
        show: function() {
            if (!this.isVisible) {
                this.isVisible = true;
                var popup = $('#autocomplete');
                popup.css({
                    'top': this._computeTopOffset(),
                    'left': this._computeLeftOffset(),
                    'font-family': $('.ace_editor').css('font-family'),
                    'font-size': $('.ace_editor').css('font-size')
                });
                popup.slideToggle('fast', function(){
                    $(this).css('overflow', '');
                });
                
                this.addKeyboardCommands();
            }
            //Remove old suggestions
            $('#suggestions').html("");
            for (var i = 0; i < this.suggestionCache.length; i++) {
                this.insertSuggestion(this.suggestionCache[i]);
            }
            //Select first suggestion
            $('.suggestion:first').addClass('active-suggestion');
            //Scroll to top
            this._computeScrolling();
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Hide autocomplete dialog
        //
        //////////////////////////////////////////////////////////
        hide: function() {
            if (this.isVisible) {
                this.isVisible = false;
                $('#autocomplete').hide();
                
                this.removeKeyboardCommands();
            }
            this.suggestionCache        = null;
            this.suggestionTextCache    = null;
            this.pluginCache            = null;
            this.pluginSessionCache		= null;
            this.pluginMajCache         = null;
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Insert suggestion to autocomplete dialog
        //
        //  Parameter:
        //
        //  sug - {Object} - Suggestion to insert
        //
        //////////////////////////////////////////////////////////
        insertSuggestion: function(sug) {
            if (sug === null || sug == [] || typeof(sug) == 'undefined') {
                return false;
            }
            var _this = this;
            
            var color = function(title) {
                var indexes = _this.removeNegativeIndexes(codiad.autocomplete.getMatchIndexes(_this.prefix, title));
                var colored = "";
                var char	= "";
                for (var i = 0; i < title.length; i++) {
                    char = $('<div/>').text(title[i]).html();
                    if (indexes.indexOf(i) != -1) {
                        colored += '<span class="matched">'+char+'</span>';
                    } else {
                        colored += char;
                    }
                }
                return colored;
            };
            
            var insText = '<li class="suggestion" data-suggestion="'+_this.extensions.phpjs.htmlentities(sug.suggestion)+'" ';
            if (sug.type == "plugin") {
                insText += 'data-type="plugin" data-callback="'+sug.callback+'" >';
                insText += color(sug.title) + '</li>';
            } else {
                insText += 'data-type="text">';
                insText += color(sug.suggestion) + '</li>';
            }
            $('#suggestions').append(insText);
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Get every suggestion of the text
        //
        //////////////////////////////////////////////////////////
        getTextSuggestions: function() {
            if (this.suggestionTextCache !== null) {
                return this.suggestionTextCache;
            }
            var buf     = "";
            var marker  = "__complete_markerword__";
            var position= codiad.editor.getActive().getCursorPosition();
            var text    = codiad.editor.getActive().getSession().getValue();
            text        = text.split("\n");
            for (var i = 0; i < position.row; i++) {
                buf += "\n"+text[i];
            }
            buf += text[position.row].substring(0, position.column) + marker + text[position.row].substring(position.column);
            for (i++; i < text.length; i++) {
                buf += "\n"+text[i];
            }
            var sugBuf  = buf.split(this.wordRegex);
            var sugs    = [];
            for (i = 0; i < sugBuf.length; i++) {
                if ((sugBuf[i] !== "") && (sugBuf[i].search(marker) == -1)) {
                    //Get each value just one time
                    if (sugs.indexOf(sugBuf[i]) == -1) {
                        sugs.push(sugBuf[i]);
                    }
                }
            }
            //Formatting array
            var result = [];
            for (i = 0; i < sugs.length; i++) {
                result.push({"suggestion":sugs[i], "ranking": sugs[i]});
            }
            return result;
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Get matching suggestions
        //
        //  Parameter:
        //
        //  prefix - {String} - Prefix
        //  sugCache - {Array} - Suggestion to check
        //
        //////////////////////////////////////////////////////////
        getMatches: function(prefix, sugCache) {
            var score;
            var buf = [];
            if (sugCache === null || typeof(sugCache) == 'undefined' || sugCache.length === 0) {
                return [];
            }
            for (var i = 0; i < sugCache.length; i++) {
                score = codiad.autocomplete.computeSimpleMatchScore(prefix, sugCache[i].ranking);
                if (score == prefix.length) {
                    buf.push(sugCache[i]);
                }
            }
            return buf;
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Get fuzzilies
        //
        //  Parameter:
        //
        //  prefix - {String} - Prefix
        //  sugCache - {Array} - Suggestion to check
        //
        //////////////////////////////////////////////////////////
        getFuzzilies: function(prefix, sugCache) {
            var buf = [];
            if (sugCache === null || typeof(sugCache) == 'undefined' || sugCache.length === 0) {
                return [];
            }
            for (var i = 0; i < sugCache.length; i++) {
                if (codiad.autocomplete.isMatchingFuzzily(prefix, sugCache[i].ranking)) {
                    buf.push(sugCache[i]);
                }                
            }
            return buf;
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Add an extra information to each object of an array
        //
        //  Parameter:
        //
        //  cache - {Array} - Array of objects
        //  type - {String} - Object element to add information
        //  kind - {various} - Extra information to add
        //
        //////////////////////////////////////////////////////////
        addExtraInfo: function(cache, type, kind) {
            if (cache === null || typeof(cache) == 'undefined' || cache.length === 0) {
                return [];
            }
            for (var i = 0; i < cache.length; i++) {
                cache[i][type] = kind;
            }
            return cache;
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Rank suggestions
        //
        //  Parameter:
        //
        //  prefix - {String} - Prefix
        //  sugCache - {Array} - Suggestion to rank
        //
        //////////////////////////////////////////////////////////
        rankSuggestions: function(prefix, sugCache) {
            var _this = this;
            if (sugCache === null || typeof(sugCache) == 'undefined' || sugCache.length === 0) {
                return [];
            }
            return sugCache.sort(function(a, b) {
                if (a == b) {
                    return 0;
                }
                var aScore = codiad.autocomplete.getMatchIndexes(prefix, a.ranking);
                var bScore = codiad.autocomplete.getMatchIndexes(prefix, b.ranking);
                aScore = _this.removeNegativeIndexes(aScore);
                bScore = _this.removeNegativeIndexes(bScore);
                var result = aScore.length-bScore.length;
                if (result === 0) {
                    var buf = [a.ranking, b.ranking];
                    buf.sort();
                    if (buf[0] === a.ranking) {
                        return -1;
                    } else {
                        return 1;
                    }
                } else {
                    return result;
                }
            });
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Remove negative integer elements of an array
        //
        //  Parameter:
        //
        //  buf - {Array} - Array to remove from
        //
        //////////////////////////////////////////////////////////
        removeNegativeIndexes: function(buf) {
            var result = [];
            for (var i = 0; i < buf.length; i++) {
                if (buf[i] != -1) {
                    result.push(buf[i]);
                }
            }
            return result;
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Remove double entries of the second array
        //
        //  Parameter:
        //
        //  one - {Array} - Array with entries to keep
        //  two - {Array} - Array with entries to discard
        //
        //////////////////////////////////////////////////////////
        removeDoubleEntries: function(one, two) {
            var buf = [];
            for (var i = 0; i < two.length; i++) {
                if (!this.isInArraySpecial(two[i].ranking, one)) {
                    buf.push(two[i]);
                }
            }
            return buf;
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Search in array for element (MyOne)
        //
        //  Parameter:
        //
        //  element - {various} - Element to search for
        //  buf - {Array} - Array to search in
        //
        //////////////////////////////////////////////////////////
        isInArraySpecial: function(element, buf) {
            for (var i = 0; i < buf.length; i++) {
                if (buf[i].ranking === element) {
                    return true;
                }
            }
            return false;
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Return element out of buf defined by needle
        //
        //  Parameter:
        //
        //  needle - {String} - Suggestion text as needle
        //  buf - {Array} - Array to search in
        //
        //////////////////////////////////////////////////////////
        getObjectOutArray: function(needle, buf) {
            for (var i = 0; i < buf.length; i++) {
                if (buf[i].suggestion === needle) {
                    return buf[i];
                }
            }
            return false;
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Push an array or an element to an array
        //
        //  Parameter:
        //
        //  cache - {Array} - Array push element in
        //  buf - {Array/Element} - Element or Elements to push
        //
        //////////////////////////////////////////////////////////
        push: function(cache, buf) {
            if (cache === null) {
                cache = [];
            }
            if (buf === null) {
				return cache;
            }
            if (cache.length === 0) {
                return buf;
            }
            if ($.isArray(buf)) {
                for (var i = 0; i < buf.length; i++) {
                    cache.push(buf[i]);
                }
            } else {
                cache.push(buf);
            }            
            return cache;
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Remove empty arrays of an array
        //
        //  Parameter:
        //
        //  cache - {Array}
        //
        //////////////////////////////////////////////////////////
        removeEmptyArrays: function(cache) {
            var buf = [];
            for (var i = 0; i < cache.length; i++) {
                if (cache[i].length !== 0) {
                    buf.push(cache[i]);
                }                
            }
            return buf;
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Compute top offset for autocomplete dialog
        //
        //////////////////////////////////////////////////////////
        _computeTopOffset: function() {
            var position = codiad.editor.getActive().getCursorPosition();
            var cursor = $('.ace_gutter-cell:contains("'+ (position.row+1) +'")');
            if (cursor.length > 0) {
                var fontSize = codiad.editor.getActive().container.style.fontSize.replace('px', '');
                var interLine = 1.7;
                cursor = $(cursor[0]);
                var top = cursor.offset().top + fontSize * interLine;
                return top;
            }
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Compute left offset for autocomplete dialog
        //
        //////////////////////////////////////////////////////////
        _computeLeftOffset: function() {
            var cursor = $('.ace_cursor');
            if (cursor.length > 0) {
                var position = codiad.editor.getActive().getCursorPosition();
                var line = $('.ace_gutter-cell:contains("'+ (position.row+1) +'")');
                for (var i = 0; i < cursor.length; i++) {
                    if ($(cursor[i]).offset().top == $(line).offset().top) {
                        return $(cursor[i]).offset().left;
                    }
                }
                cursor = $(cursor[0]);
                var left = cursor.offset().left;
                return left;
            }
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Compute scrolling for autocomplete dialog
        //
        //////////////////////////////////////////////////////////
        _computeScrolling: function() {
			var pos = $('.suggestion').index($('.active-suggestion')) - 4;
			if (pos < 0) {
                pos = 0;
			}
			$('#autocomplete').scrollTop(pos * 16);
        },
        
        /*{
            title - Title of the suggestions to display
            suggestion - Suggestions to insert
            ranking - Suggestion to rank
            callback - "Amplify Topic" -> amplify.publish(callback, {Array of the Suggestion})
                wenn callback == "" -> macht CompletePlus die ersetzung aufgrundlage von suggestion
            }*/
        //////////////////////////////////////////////////////////
        //
        //  Parse an suggestion for a plugin
        //
        //  Parameter:
        //
        //  sug - (Required) - {String} - Suggestion
        //  rank - (Optional) - {String} - Text to rank suggestion
        //  title - (Optional) - {String} - Text to display in autocomplete dialog
        //  callback - (Optional) - {String} - Amplify callback topic
        //	isSnippet - (Optional) - {Boolean} - Wheater the suggestion is an snippet or not
        //
        //////////////////////////////////////////////////////////
        pluginParser: function (sug, rank, title, callback, isSnippet) {
            if (sug === null || typeof(sug) == 'undefined' || sug === "") {
                return false;
            }
            if (rank === null || typeof(rank) == 'undefined' || rank === "") {
                rank = sug;
            }
            if (title === null || typeof(title) == 'undefined' || title === "") {
                title = sug;
            }
            if (callback === null || typeof(callback) == 'undefined') {
                callback = "";
            }
            if (isSnippet === null || typeof(isSnippet) == 'undefined') {
				isSnippet = false;
            }
            var obj = {
                    "title": title,
                    "suggestion": sug,
                    "ranking": rank,
                    "callback": callback,
                    "isSnippet": isSnippet
                };
            return obj;
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Replace prefix at the current position with suggestion
        //
        //  Parameter:
        //
        //  suggestion - {String} - Text to replace with
        //	isSnippet - {Boolean} - If true run suggestion as snippet
        //
        //////////////////////////////////////////////////////////
        replacePrefix: function(suggestion, isSnippet) {
            var _this = this;
            if (codiad.editor.getActive() === null) {
                return false;
            }
            if (typeof(suggestion) == 'undefined' || suggestion === null) {
                return false;
            }
            if (typeof(isSnippet) != 'boolean') {
				isSnippet = false;
            }
            
            var editor  = codiad.editor.getActive();
            var session = editor.getSession();
            
            //Complete function
            var range = function(position) {
				/* Get the length of the word being typed. */
                var token = session.getTokenAt(position.row, position.column);
                if (!token) {
                    /* No token at the given position. */
                    return false;
                }
                
                var prefix = token.value.substr(0, position.column - token.start);
                var prefixLength = prefix.split(_this.wordRegex).slice(-1)[0].length;
                
                return new Range(position.row,
                                    position.column - prefixLength,
                                    position.row,
                                    position.column);
            };
            var fn = function(position) {
                session.replace(range(position), suggestion);
                return true;
            };
            
            if (isSnippet) {
				if (editor.inMultiSelectMode) {
					codiad.message.notice("Snippets doesn't work on multiselection");
				}
				editor.getSession().selection.setSelectionRange(range(editor.getCursorPosition()), false);
				this.snippetManager.insertSnippet(editor, suggestion);
            } else {
				if (editor.inMultiSelectMode) {
					//Multiselection
					var multiRanges = editor.multiSelect.getAllRanges();
					var result = [];
					var one;
					for (var i = 0; i < multiRanges.length; i++) {
						fn(multiRanges[i].cursor);
					}
				} else {
					//Singleselection
					fn(editor.getCursorPosition());
				}
            }
            return true;
        },
        
        //////////////////////////////////////////////////////////
        //
        //  Test if needle is at the end of string
        //
        //  Parameters:
        //
        //  string - {String} - String to search in
        //  needle - {String} - Needle to search for
        //
        //////////////////////////////////////////////////////////
        isAtEnd: function(string, needle) {
            var pos = string.lastIndexOf(needle);
            if (pos != -1) {
                var part = string.substring(pos);
                if (part === needle) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        },
        
        __onKeyUpEnabled: function() {
            var setting = localStorage.getItem('codiad.plugin.completeplus.keyup');
            return false || setting == "true";
        },
        
        __onSmartCompleteEnabled: function() {
            var setting = localStorage.getItem('codiad.plugin.completeplus.smartComplete');
            if (setting === null) {
                return true;
            }
            return false || setting == "true";
       } 
    };

})(this, jQuery);