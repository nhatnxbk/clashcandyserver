require("share");
// ====================================================================================================
//
// Cloud Code for AuthenticationResponse, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================
var playerData = Spark.runtimeCollection("playerData"); // get the collection data
var currentPlayer = playerData.findOne({
	"playerID": Spark.getPlayer().getPlayerId()
}); // search the collection data for the entry with the same id as the player
if (currentPlayer === null){
    currentPlayer = {};
}
if(!("trophies" in currentPlayer)){
  currentPlayer.trophies = USER_START_TROPHY + parseInt(Math.random()*100);
  currentPlayer.online_win = 0;
  currentPlayer.online_match_start = 0;
  currentPlayer.highest_trophy = currentPlayer.trophies;
//   var result = Spark.sendRequest({
//     "@class": ".LogEventRequest",
//     "eventKey": "TLB",
//     "trophies": currentPlayer ? currentPlayer.trophies : 0,
//     "COUNTRY": currentPlayer && currentPlayer.location && currentPlayer.location.country ? currentPlayer.location.country : "VN",
//     "CITY": ""
// });
}

//======== Caculate time can request and receive energy or not=========//
var timeNow = Date.now();
Spark.getLog().debug("Now : " + timeNow);
var time_fb_invite = 0;
if( "time_fb_invite" in currentPlayer){
    time_fb_invite = currentPlayer.time_fb_invite;
}
if(!currentPlayer.userName && currentPlayer.facebook_name){
    currentPlayer.userName = currentPlayer.facebook_name;
    var result = Spark.sendRequest(
    {
    	"@class" : ".ChangeUserDetailsRequest",
    	"displayName" : currentPlayer.facebook_name
    });
}
var timeDelta = timeNow - time_fb_invite;
if(timeDelta < TIME_FB_INVITE){
    currentPlayer.can_fb_invite = false;
}else{
    currentPlayer.can_fb_invite = true;
}
var response = Spark.sendRequest({"@class":".AccountDetailsRequest"});
currentPlayer.location =  response.location;
playerData.update({"playerID": Spark.getPlayer().getPlayerId()}, {"$set": currentPlayer}, true,false);
delete currentPlayer.time_fb_invite;
delete currentPlayer.last_fb_friend_number;
delete currentPlayer.online_button_click;
delete currentPlayer.offline_button_click;
delete currentPlayer.rt_1;
delete currentPlayer.rt_2;
delete currentPlayer.rt_3;
delete currentPlayer.rt_4;
delete currentPlayer.rt_5;
delete currentPlayer.crt_1;
delete currentPlayer.crt_2;
delete currentPlayer.crt_3;
delete currentPlayer.crt_4;
delete currentPlayer.crt_5;
delete currentPlayer.rto_1;
delete currentPlayer.rto_2;
delete currentPlayer.rto_3;
delete currentPlayer.rto_4;
delete currentPlayer.rto_5;

Spark.setScriptData("player_Data", currentPlayer); // return the player via script-data
Spark.setScriptData("config", CONFIG); // return the player via script-data