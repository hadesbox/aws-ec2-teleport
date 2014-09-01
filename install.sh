#!/bin/bash

echo installing node libraries ... aws ec2 teleport
npm install

echo creating link on /usr/bin... aws ec2 teleport
ln -s $(pwd)/main.sh /usr/bin/teleport

echo setting permissions... aws ec2 teleport
chmod +x $(pwd)/main.sh
chmod +x $(pwd)/main.js

echo all done... 