// ====================================================================================================
//
// Cloud Code for MatchFoundMessage, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================
require("share");
require("common");
var playerID = Spark.getPlayer().getPlayerId();
var participants = Spark.getData().participants;
var opponentInfo = {trophies:0};
if(participants){
    for(var i in participants){
        var member = participants[i];
        if(member.id != playerID){
            opponentInfo = playerCollection.findOne({"playerID": member.id});
        }
    }
}

Spark.setScriptData("opponent", opponentInfo);