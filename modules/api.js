// ====================================================================================================
//
// Cloud Code for api, write your code here to customize the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://docs.gamesparks.com/
//
// ====================================================================================================

function GetUnityAdsToday(){
    var today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setMilliseconds(0);
    return Spark.getHttp("http://gameads-admin.applifier.com/stats/monetization-api?apikey=5f0f25cb53bc44ebe449f6000cab9c3f8ac4edb53b7383b780affea723322d09&start="+today.toISOString()+"&splitBy=source&scale=all").get().getResponseString();
}

function SendSlack(message){
    return Spark.getHttp("https://hooks.slack.com/services/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").setHeaders({
        "Content-type":"application/x-www-form-urlencoded",
    }).postString(encodeURI('payload={"text":"'+message+'"}'));
}

//var csv is the CSV file with headers
function csvJSON(csv){

  var lines=csv.split("\n");

  var result = [];

  var headers=lines[0].split(",");

  for(var i=1;i<lines.length;i++){

	  var obj = {};
	  var currentline=lines[i].split(",");

	  for(var j=0;j<headers.length;j++){
		  obj[headers[j]] = currentline[j];
	  }

	  result.push(obj);

  }
  
  //return result; //JavaScript object
  return JSON.stringify(result); //JSON
}