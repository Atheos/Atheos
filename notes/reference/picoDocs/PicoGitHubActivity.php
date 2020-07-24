<?php

/**
 * PicoGitHubActivity Plugin.
 *
 * Add your public GitHub activity stream to Pico! To setup, copy and paste the
 * following configuration array in your {@link config/config.php}
 *
 * // Pico GitHib Activity Plugin Configuration
 * $config['PicoGitHubActivity'] = array (
 *     'enabled' => true,       // Enable this plugin?
 *     'require' => array(      // Do you require:
 *         'jQuery' => true,    // jQuery?
 *         'momentJs' => true   // moment.js?
 *     ),
 *     'options' => array(
 *         'username' => 'theshka', // GitHub username
 *         'posts' => 10,           // How many posts?
 *         'maxLength' => 100       // Max length of descriptions
 *     )
 * );
 *
 * You can then access the plugin in your .twig template with
 * {{ PicoGitHubActivity.rendered }} // The whole plugin
 * {{ PicoGitHubActivity.style }}    // Just the stylesheet
 * {{ PicoGitHubActivity.body }}     // Just the HTML
 * {{ PicoGitHubActivity.script }}   // Just the JS
 *
 * @author Tyler Heshka
 * @link https://keybase.io/theshka
 * @license http://opensource.org/licenses/MIT
 * @version 0.1.0
 */
class PicoGitHubActivity extends AbstractPicoPlugin
{
    /**
     * This plugin is disabled by default.
     *
     * @see AbstractPicoPlugin::$enabled
     */
    protected $enabled = false;

    /**
     * This plugin depends on {@link ...}.
     *
     * @see AbstractPicoPlugin::$dependsOn
     */
    protected $dependsOn = array();

    /**
     * The GitHub username.
     */
    protected $ghUser = null;

    /**
     * The amount of posts to show.
     */
    protected $ghPosts = null;

    /**
     * Maximum length of descriptions.
     */
    protected $ghMaxLength = null;

    /**
     * Require jQuery?
     */
    protected $jQuery = true;

    /**
     * Require momentJs?
     */
    protected $momentJs = true;

    /**
     * Triggered after Pico reads its configuration.
     *
     * @see    Pico::getConfig()
     *
     * @param array &$config array of config variables
     */
    public function onConfigLoaded(&$config)
    {
        // is the username set?
        if (isset($config['PicoGitHubActivity']['options']['username']) &&
        !empty($config['PicoGitHubActivity']['options']['username'])) {
            // set the username
            $this->ghUser = $config['PicoGitHubActivity']['options']['username'];
        }

        // how many posts to show?
        if (isset($config['PicoGitHubActivity']['options']['posts']) &&
        !empty($config['PicoGitHubActivity']['options']['posts'])) {
            // set the amount of posts to show,
            $this->ghPosts = $config['PicoGitHubActivity']['options']['posts'];
        } else {
            // or 10 by default
            $this->ghPosts = 10;
        }

        // max post length?
        if (isset($config['PicoGitHubActivity']['options']['maxLength']) &&
        !empty($config['PicoGitHubActivity']['options']['maxLength'])) {
            // set the length of a post descripton,
            $this->ghMaxLength = $config['PicoGitHubActivity']['options']['maxLength'];
        } else {
            // or 500 characters by default
            $this->ghMaxLength = 500;
        }

        // require jQuery?
        if(isset($config['PicoGitHubActivity']['require']['jQuery']) &&
        !empty($config['PicoGitHubActivity']['require']['jQuery']) &&
        $config['PicoGitHubActivity']['require']['jQuery'] === true) {
            // yes, we need it
            $this->jQuery = true;
        } else {
            // no, we don't...
            $this->jQuery = false;
        }
        // require moments.js?
        if(isset($config['PicoGitHubActivity']['require']['momentJs']) &&
        !empty($config['PicoGitHubActivity']['require']['momentJs']) &&
        $config['PicoGitHubActivity']['require']['momentJs'] === true) {
            // yes, we need it
            $this->momentJs = true;
        } else {
            // no we don't...
            $this->momentJs = false;
        }
    }

    /**
     * Triggered before Pico renders the page.
     *
     * @see    Pico::getTwig()
     *
     * @param Twig_Environment &$twig          twig template engine
     * @param array            &$twigVariables variables passed to the template
     * @param string           &$templateName  name of the template to render
     */
    public function onPageRendering(&$twig, &$twigVariables, &$templateName)
    {
        // Collect the plugin pieces in twig variable
        $twigVariables['PicoGitHubActivity'] = array(
            'style' => $this->doBuildStyle(),
            'body' => $this->doBuildBody(),
            'script' => $this->doBuildScript(),
            'rendered' => $this->doBuildStyle().$this->doBuildBody().$this->doBuildScript(),
        );
    }

    /**
     * Returns the CSS for the GitHub <ul>.
     */
    private function doBuildStyle()
    {
        // buid the stylesheet
        return '<style>
        /* Feed Style
        /*---------------------------------------------*/
        ul {
            padding-left: 0px !important;
        }
        #github {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        #github h3 { margin:0; padding:0; font-size:100%; line-height:1; }
        #github li {
            padding: 10px 0;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
        }
        .github-event div { display: inline-block; }
        .github-event .event-time {
            width: 200px;
            border: 2px solid #aaa;
            font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif;
            font-size: 1.5rem;
            font-weight: normal;
            text-align: center;
            color: #999;
            margin-right: 20px;
        }
        .github-event .event-content {
            font-size: 1.5rem;
        }
        .github-event .event-content span { font-weight: bold; }

        /* Mobile Styles
        /*---------------------------------------------*/

        /* Small Devices, Tablets */
        @media only screen and (max-width : 768px) {

            #github li {
                padding: 5px 0;
            }
            .github-event .event-time {
                width: 125px;
                font-size: 1rem;
                margin-right: 20px;
            }
            .github-event .event-content {
                font-size: 1rem;
            }
        }

        /* Extra Small Devices, Phones */
        @media only screen and (max-width : 480px) {
            #github li {
                padding: 1px 0;
            }
            .github-event .event-time {
                width: 75px;
                font-size: .5rem;
                margin-right: 20px;
            }
            .github-event .event-content {
                font-size: .5rem;
            }
        }
        </style>';
    }

    /**
     * Returns the text and feed's HTML container <ul>.
     */
    private function doBuildBody()
    {
        if ($this->ghUser) {
            // build the HTML
            return '<hr>
            <!--GitHub User -->
    		<h2><a href="http://github.com/'.$this->ghUser.'">@'.$this->ghUser.'</a>\'s Recent GitHub Activity</h2>
            <!-- GitHub Feed -->
            <ul id="github"></ul>';
        }
    }

    /**
     * Returns the javascript portion of the plugin.
     */
    private function doBuildScript()
    {
        // check for varibles
        if ($this->ghUser && $this->ghPosts && $this->ghMaxLength) {
            // init script
            $script = '';
            // do we need to include jQuery?
            if ($this->jQuery) { $script .= "<script src='//code.jquery.com/jquery-1.11.3.min.js'></script>"; }
            // do we need to include moment.js?
            if ($this->momentJs) { $script .= "<script src='//cdnjs.cloudflare.com/ajax/libs/moment.js/2.10.2/moment.min.js'></script>"; }
            // parse the GitHub Feed
            $script .= "<script>
//GitHub Activity Feed
if($('#github').length){
    //Set username
    var username = '".$this->ghUser."';
    //Load GitHub API data feed
    $.get('https://api.github.com/users/' + username + '/events/public', function(data){
        if(data.length){
            //data to show
            console.log( 'GitHub API has data to show.' );
            //get data
            $.each(data, function(idx, event){
                if(idx > ".$this->ghPosts.") return;

                var template = $('<div />').addClass('post-preview '+ event.type),
                    userLink = '<a href=\"https://github.com/' + username + '\">@'+ username +'</a>',
                    eventTime = $('<p />').addClass('post-meta').html('Posted by '+ userLink + ' about ' + moment(event.created_at).fromNow()),
                    eventContent = null;

                if(event.type == 'CreateEvent'){
                    eventContent = '<div class=\"event-content\"><h2 class=\"post-title\"><a href=\"http://github.com/'+ event.repo.name +'\" target=\"_blank\"> Created a <span class=\"type\">'+ event.payload.ref_type +'</span> @ '+ event.repo.name +'</a></h2><h3 class=\"post-subtitle\">' + event.payload.description.substring(0,".$this->ghMaxLength.") + '</h3></div>';
                }
                if(event.type == 'DeleteEvent'){
                    if (event.payload.commits) {
                        eventContent = '<div class=\"event-content\"><h2 class=\"post-title\"><a href=\"http://github.com/'+ event.repo.name +'\" target=\"_blank\"> Deleted a <span class=\"type\">'+ event.payload.ref_type +'</span> @ '+ event.repo.name +'</a></h2><h3 class=\"post-subtitle\">' + event.payload.commits[0].message.substring(0,".$this->ghMaxLength.") + '</h3></div>';
                    }
                }
                if(event.type == 'PushEvent'){
                    if (event.payload.commits[0]) {
                        eventContent = '<div class=\"event-content\"><h2 class=\"post-title\"><a href=\"http://github.com/'+ event.repo.name +'\" target=\"_blank\"> Pushed <span class=\"count\">'+ event.payload.size +'</span> commits to '+ event.repo.name +'</a></h2><h3 class=\"post-subtitle\">' + event.payload.commits[0].message.substring(0,".$this->ghMaxLength.") + '</h3></div>';
                    }
                }
                if(event.type == 'IssueCommentEvent'){
                    eventContent = '<div class=\"event-content\"><h2 class=\"post-title\"><a href=\"'+ event.payload.issue.html_url +'\" target=\"_blank\"> Commented on '+ event.payload.issue.title +'</a></h2><h3 class=\"post-subtitle\">' + event.payload.issue.body.substring(0,".$this->ghMaxLength.") + '</h3></div>';
                }

                if(eventContent){
                    template.append(eventContent);
                    template.append(eventTime);
                    template.append('<hr>');
                    $('#github').append(template);
                    console.log( 'GitHub item(s) added.' );
                }
            });

            //data loaded
            console.log( 'GitHub feed loaded.' );
        }
    });
}
</script>
            ";
            //return the script...
            return $script;
        }
    }
}
