/**
 * Simple util example
 */

define(function () {
    
    var sampleutil = {
        
        // Array of content blurbs
        content: [
            'This is sample content one.',
            'This is sample content two.',
            'This is sample content three.'
        ],
        
        // Method to randomly choose content blurb
        getContent: function() {
            var pick = Math.floor(Math.random()*this.content.length);
            return this.content[pick];
        }
        
    };
    
    return sampleutil;
    
});