#!/bin/sh

node /home/luix/git/node/teleport/./main.js $1 > salida

if [ $? -eq 0 ]; then
   ssh -i $(cat salida)
   exit;
else
   cat salida
   rm salida
   exit;
fi
