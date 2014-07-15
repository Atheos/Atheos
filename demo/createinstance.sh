#!/bin/sh

CORE=$1
SANDBOX=$2
URL=$3
RAND=$4

# Delete old sandboxes which are older then 3 days
find $SANDBOX -type d -mmin +30 -exec rm -rf {} \;

mkdir $SANDBOX
mkdir $SANDBOX/$RAND
cd $SANDBOX/$RAND

# syslinking codiad core
ln -s $CORE/common.php $SANDBOX/$RAND/common.php
ln -s $CORE/demo/instance.index.php $SANDBOX/$RAND/index.php
ln -s $CORE/favicon.ico $SANDBOX/$RAND/favicon.ico
ln -s $CORE/components $SANDBOX/$RAND/components
ln -s $CORE/languages $SANDBOX/$RAND/languages
ln -s $CORE/lib $SANDBOX/$RAND/lib
ln -s $CORE/themes $SANDBOX/$RAND/themes

cp -r $CORE/js $SANDBOX/$RAND/js
cp $CORE/demo/instance.instance.js $SANDBOX/$RAND/js/instance.js

# copy config stuff
cp $CORE/demo/instance.config.php $SANDBOX/$RAND/config.php
sed -i "s,%SANDBOXPATH%,$SANDBOX/$RAND,g" $SANDBOX/$RAND/config.php
sed -i "s,%SANDBOXURL%,$URL/$RAND/workspace,g" $SANDBOX/$RAND/config.php
cp -r $CORE/plugins $SANDBOX/$RAND/plugins
mkdir $SANDBOX/$RAND/workspace

# security stuff
cp $CORE/demo/instance.htaccess $SANDBOX/$RAND/workspace/.htaccess

cp -r $CORE/demo/instance.project $SANDBOX/$RAND/workspace/demo
cp -r $CORE/data $SANDBOX/$RAND/data
echo $RAND
