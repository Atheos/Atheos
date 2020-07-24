---
Title: Installation with Docker
Description: A short installation guide with Docker
Date: 2020-07-10
Cache: true
---
Using Dockerized Atheos
=======================

Once you've installed [Docker](http://docker.com/), you can start *atheos* using [HLSiira's Docker Image](https://hub.docker.com/r/hlsiira/atheos/) image:

    $ docker run --rm -p 8080:80 - d atheos:latest

And open your browser at `http://localhost:8080`. See that image's README for further details and data persistence.
