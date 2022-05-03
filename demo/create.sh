#!/bin/sh

CORE=$1
SANDBOX=$2
URL=$3
UUID=$4

# Delete old sandboxes which are older then 3 days
find $SANDBOX -type d -mmin +30 -exec rm -rf {} \;

mkdir $SANDBOX
mkdir $SANDBOX/$UUID
cd $SANDBOX/$UUID

# syslinking codiad core
ln -s $CORE/common.php $SANDBOX/$UUID/common.php
ln -s $CORE/demo/instance.index.php $SANDBOX/$UUID/index.php
ln -s $CORE/favicon.ico $SANDBOX/$UUID/favicon.ico
ln -s $CORE/components $SANDBOX/$UUID/components
ln -s $CORE/languages $SANDBOX/$UUID/languages
ln -s $CORE/lib $SANDBOX/$UUID/lib
ln -s $CORE/themes $SANDBOX/$UUID/themes

cp -r $CORE/js $SANDBOX/$UUID/js
cp $CORE/demo/instance.instance.js $SANDBOX/$UUID/js/instance.js

# copy config stuff
cp $CORE/demo/instance.config.php $SANDBOX/$UUID/config.php
sed -i "s,%SANDBOXPATH%,$SANDBOX/$UUID,g" $SANDBOX/$UUID/config.php
sed -i "s,%SANDBOXURL%,$URL/$UUID/workspace,g" $SANDBOX/$UUID/config.php
cp -r $CORE/plugins $SANDBOX/$UUID/plugins
mkdir $SANDBOX/$UUID/workspace

# security stuff
cp $CORE/demo/instance.htaccess $SANDBOX/$UUID/workspace/.htaccess

cp -r $CORE/demo/instance.project $SANDBOX/$UUID/workspace/demo
cp -r $CORE/data $SANDBOX/$UUID/data
echo $UUID
