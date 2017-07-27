// ====================================================================================================
//
// Cloud Code for GS_HOURLY, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm          
//
// ====================================================================================================
require("api");
require("share");
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
    
if(isSandbox()){
    var list = JSON.parse(csvJSON(GetUnityAdsToday()));
    var text = "====================================\n";
    var log_money = Spark.runtimeCollection("log_money");
    var last_log = log_money.findOne();
    var total_money = 0;
    for(var i in list){
        var money = parseFloat(list[i]["revenue"].replace("\"","").replace("\"",""));
        total_money += money;
        if(money > 1){
            text += list[i]["Source game name"].replace("\"","").replace("\"","") + " " 
            + "\nView: " + list[i]["views"].replace("\"","").replace("\"","") 
            + " Money: " + money + "$"+"\n";
        }
    }
    
    if( (total_money - last_log.money > 1) || total_money < last_log.money){
        log_money.update({}, {"$set":{money:total_money,time:getTimeNow()}},true,false);
        text += " <https://dashboard.unityads.unity3d.com/|Detail>";
        var status = SendSlack(text + " <!here>").getResponseString();
        Spark.setScriptData("data", status + text);
    }
}