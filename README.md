# AWS-EC2-teleport
================

Teleport is a quick tool to jump into your EC2 instances, based on its. If followo the given premises.

It searchs for the given tag name and it will ssh to its public IP (with the right keyname, and user).

This tool has been designed to work with multi AWS Accounts. For it to work you need to create a folder structure like the following.


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
* All keynames filenames are the same as the keyname value on yout EC2 account.


## Running the command

1. if you do not provide a tagname (i.e. "$teleport") you will get a list of your instances with their tags, and IPs (and other information) from the  current account.
2. if it finds more than one instance with the matching tag (or partially matching tag), it will list those instances
3. if it finds exactly one matching instance, then it will ssh to it using the rigth KeyName and "username" (AMZ->ec2user, Ubuntu->ubuntu, Redhat->root, Centos->root) based on the architecture of that machine (AMI info.) if the machine has a public Ip.

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
luis@boxita:~/aws_certs/innnovacion$ teleport Neo
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

## Installing it

Go into the cloned repo dir (which is where the app will live after its installation) and run the install script.
```
luis@boxita:~/git/aws-ec2-teleport$ sudo ./install.sh
```

alternatively you can review the code of the install.sh and manually execute it.

```
luis@boxita:~/git/aws-ec2-teleport$ npm install
luis@boxita:~/git/aws-ec2-teleport$ sudo ln -s $(pwd)/main.sh /usr/bin/teleport
luis@boxita:~/git/aws-ec2-teleport$ chmod +x $(pwd)/main.sh
luis@boxita:~/git/aws-ec2-teleport$ chmod +x $(pwd)/main.js
```