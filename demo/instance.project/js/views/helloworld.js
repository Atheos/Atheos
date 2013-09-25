define(function(){    
    
    var helloworld = {
        
        dependencies: {
            sampleutil: 'utils/sampleutil'
        },
        
        events: {
            'click .sample-event': 'sampleEvent'
        },
    
        routes: {
            '' : 'renderHelloWorld', // Renders in default route
            'helloworld': 'renderHelloWorld' // renders at {url}/#!/helloworld
        },
    
        // Loads up this modules main view
        renderHelloWorld: function(url_data){
            
            // Get Content From Sample Utility
            var retrieved_content = this.sampleutil.getContent(),
            
            // Setup data for template
            data = {
                title: "Hello World!",
                content: retrieved_content,
            };
            
            // Render template
            Colt.render(this,data);
            
        },
        
        // Sample event bound in the events object
        sampleEvent: function(){
            alert('Event Triggered!');
        }
        
    };
    
    return helloworld;
    
});