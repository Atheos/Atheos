#!/bin/sh

cd $1
git checkout upgrade.sh
git checkout demo/createinstance.sh

git pull https://github.com/Codiad/CodiadDemo.git
chown $2:$2 -R $1
chmod 744 demo/createinstance.sh
chmod 744 upgrade.sh
