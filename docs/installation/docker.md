Using Dockerized Atheos
=======================

Once you've installed [Docker](http://docker.com/), you can start *atheos* using one of the various images built by some contributors, like [wernight/atheos](https://hub.docker.com/r/wernight/atheos/) image:

    $ docker run -p 8080:80 wernight/atheos

And open your browser at `http://localhost:8080`. See that image's README for further details and data persistence.

_Note: This docker image is maintained by third party and does not represent any official release from the atheos team._