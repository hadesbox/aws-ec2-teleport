#!/bin/sh

node /home/luis/git/ssht/./main.js $1 > salida

if [ $? -eq 0 ]; then
   ssh -i $(cat salida)
   exit;
else
   cat salida
   rm salida
   exit;
fi
