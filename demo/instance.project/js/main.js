require.config({
    baseUrl: "js/",
    paths: {
        colt:  "libs/colt.0.7.2"
    }
});

define(["colt"], function (Colt) {

    // Define all of the modules as array
    Colt.modules = [
        "views/helloworld"
    ];

    // Initialize application
    Colt.init();

});
