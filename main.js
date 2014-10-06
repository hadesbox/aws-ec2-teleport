#!/usr/bin/env node
	
args = process.argv;

var colors = require('colors');
var AWS = require('aws-sdk');
var fs = require('fs');

AWS.config.loadFromPath('config.json');

var ec2 = new AWS.EC2();

var params2 = {
  DryRun: false,
  MaxResults: 50
};

var results = [];

ec2.describeInstances(params2, function(err, data) {
	//console.log("@@@@@@@", data)
	if (data && data.Reservations) for(item in data.Reservations){
		ritem = data.Reservations[item];
		for(tagindex in data.Reservations[item].Instances[0].Tags){
			tag = data.Reservations[item].Instances[0].Tags[tagindex];
			if(args.length < 3){
				pushData(ritem, tag);
			}
			else if(tag.Value && tag.Key == 'Name' && tag.Value.toLowerCase().indexOf(args[2].toLowerCase()) != -1){
				pushData(ritem, tag);
			}
			//console.log(tag, ritem.Instances[0].PublicDnsName);
			//console.log(JSON.stringify(ritem, null, 3));
		}

	}
	//console.log(results)
	//process.exit(-10)	
	if(results.length == 0){
		console.log("Error".red, "no results found".grey);
		process.exit(-2);
	}
	else if(results.length > 1 || args.length  == 2){
		//console.log(results)
		console.log("State  ","InstId    ","                      Tag", "                  KeyName", "      PrivateIp", "       PublicIp");
		console.log("=========================================================================================================");
		for(i=0;i<results.length;i++){
			console.log(results[i][7].grey, results[i][1].cyan, results[i][2].green, results[i][3].red, results[i][4].yellow, results[i][5]);
		}	
		process.exit(-1);
	}
	else {		
		//console.log(">>>>>>>>>>>");
		//console.log(results[0])
		//process.exit(1)
		//console.log("<<<<<<<<<<<");
		if (fs.existsSync(results[0][3].trim()+".pem")) {
			if(results[0][5] != "undefined"){
				//ssh -i innovacion.ireland.pem ubuntu@XXX.XXX.XXX.XXX
				//we search for the ami architecture ubuntu/centos/redhat
				ec2.describeImages({ ImageIds: [results[0][6]] }, function(err, dataAMI) {					
					username = "ubuntu";
					//console.log(dataAMI);
					//process.exit(1)
					if(dataAMI.Images[0].Name.toLowerCase().indexOf("rhel") != -1){
						username = "ec2-user";
					}
					else if(dataAMI.Images[0].Name.toLowerCase().indexOf("centos") != -1){
						username = "ec2-user";
					}					
					else if(dataAMI.Images[0].Name.toLowerCase().indexOf("amzn-ami") != -1){
						username = "ec2-user";
					}
					else if(dataAMI.Images[0].Name.toLowerCase().indexOf("ubuntu") != -1){
						username = "ubuntu";
					}
					console.log(results[0][3].trim()+".pem", username+"@"+results[0][5].trim());
					process.exit(0);
				});
			}
			else{
				console.log("Error".red, "no public IP address for instance".cyan, results[0][1].trim(), ".".cyan);
				process.exit(-1);
			}
		}
		else{
			console.log("Error".red, "keypair".cyan, results[0][3].trim().grey, "for instance".cyan, results[0][1].trim(), "doesn't exist.".cyan);
			process.exit(-1);
		}		
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
	results.push([ritem.ReservationId, 
		ritem.Instances[0].InstanceId, 
		pad(tag.Value, 25),
		pad(val2, 25),
		pad(val3, 15),
		pad(val4, 15),
		ritem.Instances[0].ImageId,
		ritem.Instances[0].State.Name]);
}

function pad(str, length){
	blank="";
	for(i=0;i<length;i++) blank+=" ";
	return (blank + str).slice(-1*length)
}
