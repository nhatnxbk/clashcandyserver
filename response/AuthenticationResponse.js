require("share");
require("common");

var playerID = Spark.getPlayer().getPlayerId();
var currentPlayer = playerCollection.findOne({"playerID": playerID});

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
//======== Add default card for new user =========//
if (!currentPlayer.card_data) {
  var cardDataMaster = Spark.metaCollection("card_master");
  var cardData = cardDataMaster.find({"card_default":1}).toArray();
  var userCardData = [];
  for(var i = 0; i < cardData.length; i++) {
      var card = cardData[i];
      card.current_level = 1;
      card.current_number = 0;
  }
  currentPlayer.card_data = cardData;
}

if (!currentPlayer.player_coin) {
    currentPlayer.player_coin = DEFAULT_COIN;
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
playerCollection.update({"playerID": playerID}, {"$set": currentPlayer}, true,false);
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

//player level info
var levelInfo = getPlayerLevelInfo(playerID);
if (levelInfo) {
  currentPlayer.level_info = levelInfo;
}

//store data
var storeData = getStoreInfo(playerID);
if (storeData) {
  currentPlayer.store = storeData;
}

//card data
currentPlayer.card_data = getListCardFull(currentPlayer.card_data);

Spark.setScriptData("player_Data", currentPlayer); // return the player via script-data
Spark.setScriptData("config", client_config); // return the player via script-data
