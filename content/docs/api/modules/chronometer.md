---
Title: Chronometer
Description: A summary of the Chronometer module
Date: 2020-07-10
Cache: true
---
<section>
	<h1><a href="https://github.com/Atheos/Atheos/blob/master/modules/chronometer/init.js">The Chronometer Module</a></h1>
	<p>The Chronometer Module sets global intervals that are published through Amplify subscriptions; allowing the client browser to only have a select few Intervals running while providing plugins the ability to use timed events.</p>
	<hr>
	<h2 id="chronometer-methods-">Chronometer Methods:</h2>
	<h3 id="init-">init()</h3>
	<p>This method sets three seperate interval timers in motion that publish named Amplify events at specific intervals that other modules can subscribe to using Amplify.</p>
	<ul>
		<li><code>kilo</code>: publishes an event every 1000 milliseconds (1 second)</li>
		<li><code>mega</code>: publishes an event every 10000 milliseconds (10 seconds)</li>
		<li><code>giga</code>: publishes an event every 100000 milliseconds (100 seconds)</li>
	</ul>
<pre><code>function example() {
    amplify.subscribe('chrono.kilo', function() {
        console.log("This will log every 1 second");
    }
    amplify.subscribe('chrono.mega', function() {
        console.log("This will log every 10 second");
    }
    amplify.subscribe('chrono.giga', function() {
        console.log("This will log every 100 second");
    }    
}
</code></pre>
</section>