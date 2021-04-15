<div align="center">
    <h1><a href="https://atheos.io/">Atheos IDE</a>, built on <a href="http://codiad.com/">Codiad</a></h1>
</div>

<div align="center">

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/2c36f9f63b294165b604193efb8cc058)](https://www.codacy.com/gh/Atheos/Atheos?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Atheos/Atheos&amp;utm_campaign=Badge_Grade)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

</div>


<div style='margin:0 auto;width:80%;'>

![Screenshot: Atheos](https://www.atheos.io/assets/images/atheos.png "Atheos")

</div>

## About
Atheos is an updated and currently maintained fork of Codiad, a web-based IDE framework with a small footprint and minimal requirements. Atheos has been completely rewritten from the original Codiad project to utilize more modern tooling, cleaner code, and a wider arrange of features.

From Codiad:
> "Codiad was built with simplicity in mind, allowing for fast, interactive development without the massive overhead of some of the larger desktop editors. That being said even users of IDE's such as Eclipse, NetBeans and Aptana are finding Codiad's simplicity to be a huge benefit. While simplicity was key, we didn't skimp on features and have a team of dedicated developer actively adding more."

Atheos is expanding on that mentality as much as possible, trying to minimizing it's footprint even further while maximizing functionality and performance. The major goal of Atheos is to provide users with an easy, fast and fully featured Cloud Based IDE without a large server footprint.

For more information on the project please check out **[our homepage](http://www.atheos.io)**

## Getting Started
### Manual Installation
Atheos can be installed by placing Atheos in a web accessible folder and pointing your browser to it.
**Ensure that the following folders have write capabilities by your web server:**
```
/config.php
/data
/workspace
/plugins
/themes
```
If any dependencies have not been met, the system will alert you on the installation screen.

*Please note: Atheos is primarily developed using with a Debian LAMP Server. If you run into installation issues utilizing another stack, please let us know.*

### Updating Atheos
Atheos has a built in Update Check System, however does not have a system for actually updating the system itself, instead it relies on the admin to copy over the files itself. More information will be provided later as the update system is currently being rewrote.

To upgrade simply delete everything except the following or move these folders to a new directory:
```
/config.php
/data
/workspace
/plugins
/themes
```
Navigate to /themes and delete the default folder. Download the neweset verson from the Github repo and extract its content to the root directory of your Atheos installation.

Ensure that the files and folder mentioned above still have write capabilities.

### Docker
Atheos can  also be installed using the [docker image on DockerHub]([https://hub.docker.com/r/hlsiira/atheos](https://hub.docker.com/r/hlsiira/atheos)).

## Atheos vs Codiad
Atheos is an almost complete rewrite of Codiad, using the latest best practices and technologies available by JavaScript and PHP. All libraries and source code updated, and hundreds of inefficiencies, bugs,  code duplicates, and non standard functions have been addressed. The most notable changes are:
* A complete move from Get requests to Post requests to the server.
* Brand new UX and Theme
* A more complete user permission system 
* Massive reduction in unnecessary/repeated traffic from server to client
* Complete removal of jQuery and it's plugins
* Built-in Git integration
* And an incredibly strong emphasis on standardized components and modules throughout the project in order to encourage easier plugin development and user contribution.

## Contributing
Contributing to Atheos is very easy and we welcome all contributions. We strive for Atheos' source to follow an extremely standardized structure and as such, learning to understand the logic and structure of a single component within Atheos will carry over to all other components. If you want to contribute to Atheos but can't think of any ideas, please feel free to glance at the issues page for inspiration or email the team to see if there is anything you can help with.