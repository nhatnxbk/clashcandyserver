// ====================================================================================================
//
// Cloud Code for GS_HOURLY, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================
require("api");
var enable = false;
var stringArr = [""]

if (enable) {
    //A reference to the player collection, turned into an array
    var myCollection = Spark.systemCollection("player").find().toArray();
    
    //ForEach loop that adds the ID to the string array
    myCollection.forEach( function(player){
        var playerId = player._id.$oid;
        stringArr.push(playerId);
    });
    
    //Send message by IDs in the string array
    Spark.sendMessageById({"Message": "There is message from gamesparks to your application each hour."}, stringArr);
    Spark.sendMessageExt({"ExtMessage":"There is ext message each hour"}, "TGSM", stringArr);
}

var list = JSON.parse(csvJSON(GetUnityAdsToday()));
var text = "====================================\n";
for(var i in list){
    if(parseFloat(list[i]["revenue"].replace("\"","").replace("\"","")) > 0.5){
        text += list[i]["Source game name"].replace("\"","").replace("\"","") + " " 
        + "\nView: " + list[i]["views"].replace("\"","").replace("\"","") 
        + " Money: " + list[i]["revenue"].replace("\"","").replace("\"","") + "$"+"\n";
    }
}
text += " <https://dashboard.unityads.unity3d.com/|Detail>";
var status = SendSlack(text + " <!here>").getResponseString();
Spark.setScriptData("data", status + text);