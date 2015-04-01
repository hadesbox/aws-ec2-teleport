# AWS-EC2-teleport
================

Teleport is a tool to jump into your EC2 instances, based on its name (tagname). It gives useful information like the state (stopped, running) the keypair, the public and private IP address.

It searchs for the given tag name you provide and it will ssh to the public IP (with the right keyname, and user) of the matching instance.

This tool has been designed to work with multi AWS Accounts. To do this you must keep the the ssh certs (.pem) and the config.json file on different folders, something like the following structure.


``` java
luis@boxita:~/aws_certs$ tree
.
├── account1
│   ├── config.json
│   ├── account1.california1.pem
│   ├── account1.california2.pem
│   └── account1.california3.pem
├── account2
│   ├── config.json
│   └── account2.ireland1.luis.pem
└── account3
    ├── config.json
    ├── account3-slave-key-california.pem
    └── account3-master-key-california.pem
```

* This means one folder per account (or region/account).
* Each folder must contain the config.json which has the region and the AWS EC2 Api keys to call your service. (future release it may support multi region with single folders)
* All key's filename HAS to be the same as the keyname value on your EC2 account.


## Running the command

1. if you do not provide a tagname (i.e. just "teleport") you will get a list of your instances with their tags, and IPs (and other information) from the current account.
2. if you provide a tagname (or a part of it) it will try to find all matching instances for that word. If it matches more than one instance with the matching tag (or partially matching tag), it will list all those instances.
3. if it finds exactly one matching instance, then it will ssh to it using the right KeyName and "username" (AMZ->ec2user, Ubuntu->ubuntu, Redhat->root, Centos->root) based on the architecture of that machine (AMI info.) if the machine has a public Ip (you can override the usernames by sending them as an option.. se below).

For example if we dont send any params:

```ruby
luis@boxita:~/aws_certs/account1$ teleport
State   InstId                           Tag                   KeyName       PrivateIp        PublicIp
=========================================================================================================
running i-22222222                     Neo4J      account1.california1      10.0.105.0     54.45.67.12
stopped i-33333333              wedbackend-1      account1.california1       undefined       undefined
stopped i-44444444             slave-backend      account1.california1       undefined       undefined
running i-vvvvvvvv                   beowulf      account1.california1    10.25.18.251    54.12.202.78
```

it will list ALL the instances in this region-account, but if I provide a partial tagname

```ruby
luis@boxita:~/aws_certs/account1$ teleport Neo
Welcome to Ubuntu 14.04 LTS (GNU/Linux 3.13.0-29-generic x86_64)

 * Documentation:  https://help.ubuntu.com/

  System information as of Mon Sep  1 07:44:46 UTC 2014

  System load:  0.29               Processes:           135
  Usage of /:   13.7% of 58.92GB   Users logged in:     1
  Memory usage: 26%                IP address for eth0: 10.0.105.0
  Swap usage:   0%

ubuntu@ip-10-0-105-0:~$
```

it will find it, and __ssh to it__ with the right __KeyName__ (wee magicssss).

also if you have custom usernames you can send it as an option, for instance to teleport to the "neo" machine with the username "hadesbox", this will ignore the AWS default ssh usernames (which you can review in the code of main.js)

```
luis@boxita:~/aws_certs/account1$ teleport Neo --hadesbox
```

## Installing it

Go into the cloned repo dir (which is where the app will live after its installation) and run global installation of npm.
```
luis@boxita:~/git/aws-ec2-teleport$ sudo npm install -g
npm http GET https://registry.npmjs.org/colors
npm http GET https://registry.npmjs.org/aws-sdk
npm http 304 https://registry.npmjs.org/colors
npm http 304 https://registry.npmjs.org/aws-sdk
npm http GET https://registry.npmjs.org/xml2js/0.2.6
npm http GET https://registry.npmjs.org/xmlbuilder/0.4.2
npm http 304 https://registry.npmjs.org/xml2js/0.2.6
npm http 304 https://registry.npmjs.org/xmlbuilder/0.4.2
npm http GET https://registry.npmjs.org/sax/0.4.2
npm http 304 https://registry.npmjs.org/sax/0.4.2
/usr/local/bin/teleport -> /usr/local/lib/node_modules/teleport/main.sh
teleport@1.0.0 /usr/local/lib/node_modules/teleport
├── colors@1.0.3
└── aws-sdk@2.1.20 (xmlbuilder@0.4.2, xml2js@0.2.6)
```

