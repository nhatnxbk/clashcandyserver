require("share");

var playerDataList = Spark.runtimeCollection("playerData"); 
var playerID = Spark.getPlayer().getPlayerId(); 
var player_data = Spark.getData().list_score;

if(player_data.ignore_bonus){
    delete player_data.bonus_energy;
    delete player_data.bonus_hint;
    delete player_data.bonus_random;
    delete player_data.bonus_message;
}

delete player_data.online_win;
delete player_data.online_lose;
delete player_data.highest_trophy;
delete player_data.online_match_start;
delete player_data.online_bot_start;
delete player_data.trophies;
delete player_data.location;

var currentPlayer = playerDataList.findOne({
	"playerID": Spark.getPlayer().getPlayerId()
}); // search the collection data for the entry with the same id as the player

var timeNow = Date.now();
var time_fb_invite = 0;
if(currentPlayer == null) currentPlayer ={};
if("time_fb_invite" in currentPlayer){
    time_fb_invite = currentPlayer.time_fb_invite;
}
var timeDelta = timeNow - time_fb_invite;
if(timeDelta < TIME_FB_INVITE){
    currentPlayer.can_fb_invite = false;
}else{
    currentPlayer.can_fb_invite = true;
}

if("time_fb_invite" in player_data && currentPlayer.can_fb_invite){
    player_data.time_fb_invite = Date.now();
    currentPlayer.can_fb_invite = false;
}else{
    delete player_data.time_fb_invite;
}

player_data.can_fb_invite = currentPlayer.can_fb_invite;

player_data.playerID = playerID;

//================ Check facebook friend bonus=========//
if("facebook_friend" in player_data && currentPlayer.time_fb_invite > 100){
    friends = JSON.parse(player_data.facebook_friend);
    if(currentPlayer == null) {
        currentPlayer = {}
        currentPlayer.last_fb_friend_number = 0;
    }else if(!currentPlayer.last_fb_friend_number){
        currentPlayer.last_fb_friend_number = 0;
    }
    if(currentPlayer.last_fb_friend_number < friends.length){
        player_data.bonus_energy = friends.length - currentPlayer.last_fb_friend_number;
        player_data.bonus_random = player_data.bonus_energy;
        player_data.bonus_hint = player_data.bonus_energy;
        player_data.bonus_message = "Invite facebook friend bonus";
        player_data.last_fb_friend_number = friends.length;
    }
}else{
    if("facebook_friend" in player_data){
        friends = JSON.parse(player_data.facebook_friend);
        player_data.last_fb_friend_number = friends.length;
    }
}

//=============== Check new user name =============//
if(player_data.userName != currentPlayer.userName){
    var result = Spark.sendRequest(
    {
      "@class" : ".ChangeUserDetailsRequest",
      "displayName" : player_data.userName
  });
}

playerDataList.update({
	"playerID": playerID
}, //Looks for a doc with the id of the current player
{
	"$set": player_data
}, // Uses the $set mongo modifier to set old player data to the current player data
true, // Create the document if it does not exist (upsert)
false // This query will only affect a single object (multi)
);

delete player_data.hint;
delete player_data.random;
delete player_data.energy;

Spark.setScriptData("player_Data", player_data);