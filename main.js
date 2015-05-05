#!/usr/bin/env node
	
args = process.argv;

var colors = require('colors');
var AWS = require('aws-sdk');
var fs = require('fs');

try {

	if (!fs.existsSync('config.json')) { 
    	console.log("ERROR2".red, "config.json".blue, "doesnt exist on current folder")
        process.exit(-1);
    }
}
catch (e) {
    console.log("ERROR1".red, "config.json".blue, "doesnt exist on current folder", e)
    process.exit(-1);
}

AWS.config.loadFromPath('config.json');

var ec2 = new AWS.EC2();

var results = [];

var hit = null;

args = args.slice(2);
tagname="";
globalusername="";
for(i=0;i<args.length;i++){
	if(args[i].lastIndexOf("--", 0) === 0){
		globalusername = args[i].substring(2);
	}
	else{
		tagname = args[i];
	}
}

var params2 = genParams(tagname);

ec2.describeInstances(params2, function(err, data) {
	//console.log("@@@@@@@", JSON.stringify(data, null, 3))
	if (data && data.Reservations) for(item in data.Reservations){
		ritem = data.Reservations[item];
		for(tagindex in data.Reservations[item].Instances[0].Tags){
			tag = data.Reservations[item].Instances[0].Tags[tagindex];
			if(tag.Value != "" && tag.Key == 'Name'){
				pushData(ritem, tag);
				break;
			}
			//console.log(tag, ritem.Instances[0].PublicDnsName);
			//console.log(JSON.stringify(ritem, null, 3));
		}
	}

	if(hit != null) {		
		//console.log(">>>>>>>>>>>");
		//console.log(hit)
		//process.exit(1)
		//console.log("<<<<<<<<<<<");
		if(hit[7]=="stopped"){
			console.log("Error".red, "machine is".cyan,"STOPPED".red,"you can't teleport to a closed portal.".cyan);
			process.exit(-1);
		}
		else if (fs.existsSync(hit[3].trim()+".pem")) {
			if(hit[5] != "undefined"){

				if(hit[8]!="-"){
					username = hit[8];
					console.log(hit[3].trim()+".pem", username+"@"+hit[5].trim());
					process.exit(0);
				}

				ec2.describeImages({ ImageIds: [hit[6]] }, function(err, dataAMI) {					
					username = "ubuntu";
					if(dataAMI.Images[0].Name.toLowerCase().indexOf("rhel") != -1){
						username = "ec2-user";
					}
					else if(dataAMI.Images[0].Name.toLowerCase().indexOf("centos") != -1){
						username = "ec2-user";
					}
					else if(dataAMI.Images[0].Name.toLowerCase().indexOf("coreos") != -1){
						username = "core";
					}
					else if(dataAMI.Images[0].Name.toLowerCase().indexOf("amzn-ami") != -1){
						username = "ec2-user";
					}
					else if(dataAMI.Images[0].Name.toLowerCase().indexOf("ubuntu") != -1){
						username = "ubuntu";
					}
					if(globalusername!=""){
						username = globalusername;
					}
					console.log(hit[3].trim()+".pem", username+"@"+hit[5].trim());
					process.exit(0);
				});
			}
			else{
				console.log("Error".red, "no public IP address for instance".cyan, hit[1].trim(), ".".cyan);
				process.exit(0);
			}
		}
		else{
			console.log("Error".red, "keypair".cyan, hit[3].trim().grey, "for instance".cyan, hit[1].trim(), "doesn't exist.".cyan);
			process.exit(-1);
		}		
	}
    else if(results.length > 1 || tagname==""){
		//console.log(results)
		console.log("State  ","InstId    ","                      Tag", "                  KeyName", "      PrivateIp", "       PublicIp", "SSHUser");
		console.log("================================================================================================================");
		for(i=0;i<results.length;i++){
			console.log(results[i][7].grey, results[i][1].cyan, results[i][2].green, results[i][3].red, results[i][4].yellow, results[i][5], results[i][8]);
		}	
		process.exit(-1);
	}	
	else {
		console.log("Error".red, "no results found".grey);
		process.exit(-2);
	}
});


function getPublicIp(item){
	if(item.Instances[0].PublicIpAddress){
		return item.Instances[0].PublicIpAddress;
	}
	else{
		try{
			for(pip in item.Instances[0].NetworkInterfaces[0].PrivateIpAddresses){
				try{
					//console.log(item.Instances[0].NetworkInterfaces[0].PrivateIpAddresses[pip].PublicIp);
					if(item.Instances[0].NetworkInterfaces[0].PrivateIpAddresses[pip].Association.PublicIp)
						return item.Instances[0].NetworkInterfaces[0].PrivateIpAddresses[pip].Association.PublicIp;					
				}
				catch(ex){
					//return "noip-e2"
				}
			}
		}
		catch(ex){
			//console.log(ex);
			return "noip-e1"
		}		
	}
	return "noip";
}

function pushData(ritem, tag){

	val2="undefined"; val3="undefined"; val4="undefined";

	try{
		val2 = ritem.Instances[0].KeyName;
		val4 = getPublicIp(ritem),
		val3 = ritem.Instances[0].PrivateIpAddress;
	}
	catch(ex){
		console.log(ex)
		process.exit(-1)
	}

	if(tagname!="" && tag.Value.toUpperCase().indexOf(tagname.toUpperCase()) != -1 && ritem.Instances[0].State.Name == "running"){
		hit = [ritem.ReservationId, 
		ritem.Instances[0].InstanceId, 
		pad(tag.Value, 25),
		pad(val2, 25),
		pad(val3, 15),
		pad(val4, 15),
		ritem.Instances[0].ImageId,
		ritem.Instances[0].State.Name.substring(0,7),
		findSSHUser(ritem.Instances[0].Tags)]
	}

	results.push([ritem.ReservationId, 
		ritem.Instances[0].InstanceId, 
		pad(tag.Value, 25),
		pad(val2, 25),
		pad(val3, 15),
		pad(val4, 15),
		ritem.Instances[0].ImageId,
		ritem.Instances[0].State.Name.substring(0,7),
		findSSHUser(ritem.Instances[0].Tags)]);
}

function findSSHUser(items){
	for(i=0;i<items.length;i++){
		if(items[i].Key == 'ssh_user'){
			return items[i].Value
		}
	}
	return "-"
}

function pad(str, length){
	blank="";
	for(i=0;i<length;i++) blank+=" ";
	return (blank + str).slice(-1*length)
}

function genParams(tagname){
	if(tagname==""){
		return { DryRun: false, MaxResults: 50 };
	}
	else {
		return { DryRun: false, MaxResults: 50, Filters: [ { Name: 'tag:Name', Values: ["*"+tagname+"*"] } ] };
	}
}