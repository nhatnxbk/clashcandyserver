require("share");
require("common");
require("translate_text");
require("GameString");
require("ads_module");

var playerID ="";
if( Spark.getPlayer()){
    playerID =  Spark.getPlayer().getPlayerId();
}
var currentPlayer = playerCollection.findOne({"playerID": playerID});
var currentServerPlayer = playerServerCollection.findOne({"playerID": playerID});

if (currentPlayer === null){
    currentPlayer = {};
}
if (currentServerPlayer === null){
    currentServerPlayer = {gameStringVersion:0};
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

//======== Add default avatar for new user =========//
if(!currentPlayer.avatar_local){
    currentPlayer.avatar_local = parseInt(Math.random() * 100);
}
if(!currentPlayer.lang){
    Spark.setScriptData("lang_list", getLangList());
}else{
    if(currentServerPlayer.gameStringVersion < gameString.VERSION){
        Spark.setScriptData("string_list", getGameString(currentPlayer.lang));
        playerServerCollection.update({"playerID": playerID}, {"$set":{"gameStringVersion":gameString.VERSION}},true,false);
    }
}

//======== Add default card for new user =========//
if (!currentPlayer.card_data || currentPlayer.card_data.length == 0) {
  var cardData = cardMaster.find({"card_default":1},{"card_score":0,"card_energy":0,"description":false}).toArray();
  currentPlayer.card_data = cardData;
}

if (!currentPlayer.player_coin && !currentPlayer.init_player_coin) {
    currentPlayer.player_coin = DEFAULT_COIN;
    currentPlayer.init_player_coin = true;
}

//======== Ads module ========//
var needUpdateListAds = currentPlayer.need_update_list_ads ? currentPlayer.need_update_list_ads : false;
currentPlayer.need_update_list_ads = false;
var canShowListAds = 1;
// currentPlayer.can_show_ads = canShowListAds;

//======== Caculate time can request and receive energy or not=========//
var timeNow = getTimeNow();
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
} else if (currentPlayer.userName) {
    Spark.sendRequest(
      {
        "@class" : ".ChangeUserDetailsRequest",
        "displayName" : currentPlayer.userName
      });
}
var timeDelta = timeNow - time_fb_invite;
if(timeDelta < TIME_FB_INVITE){
    currentPlayer.can_fb_invite = false;
}else{
    currentPlayer.can_fb_invite = true;
}

var levelInfo = getPlayerLevelInfo(playerID);
if (levelInfo) {
  currentPlayer.current_level = levelInfo.level;
  currentPlayer.level_info = levelInfo;
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

//store data
// var storeData = getStoreInfo(playerID);
// if (storeData) {
//   currentPlayer.store = storeData;
// }

//card data
currentPlayer.card_data = getListCardFull(currentPlayer.card_data,currentPlayer.lang);

//chest data
// var chestData = currentPlayer.chest_data;
// if (chestData) {
//   for (var i = 1; i < 5; i++) {
//     var chest = chestData["chest"+i];
//     if (chest) {
//       chest.status = getChestStatus(chest);
//       chest.time_remain = chest.time_open ? (chest.time_out - (timeNow - chest.time_open)) / 1000
//           : chest.time_out / 1000;
//     }
//   }
// }
// currentPlayer.chest_data = chestData;
if (!currentPlayer.chest_data) {
    currentPlayer.chest_data = {};
}

// check admin
var is_admin = isAdmin();
currentPlayer.is_admin = isAdmin();

// get new message
var numNewMessage = getNumberNewMessgae(is_admin);
currentPlayer.new_message = numNewMessage;

// ads
currentPlayer.need_update_list_ads = needUpdateListAds;
var list_ads = canShowListAds ? getAds(currentPlayer.game_name, playerID) : [];
currentPlayer.list_ads = list_ads;

function getNumberNewMessgae(isAdmin) {
  var lastTimeRead = currentPlayer.last_read ? currentPlayer.last_read : 0;
  var userFeedbackData = Spark.runtimeCollection("user_feedback");
  var userNotice = Spark.runtimeCollection("user_notice");
  var notice = userNotice.find({$or:[{"playerID":"all"},{"playerID":playerID}]}).limit(NUM_NOTICE).sort({"time":-1}).toArray();
  var feedbacks;
  var limit = isAdmin ? NUM_NOTICE_ADMIN : NUM_NOTICE;
  if (isAdmin) {
    feedbacks = userFeedbackData.find().limit(limit).sort({"response":1,"time":-1}).toArray();
  } else {
    feedbacks = userFeedbackData.find({"playerID":playerID}).limit(limit).sort({"time":-1}).toArray();
  }
  var allMessage = notice.concat(feedbacks);
  allMessage.sort(function(a,b){
    return b.time - a.time;
  });
  var numNewMessage = 0;
  for (var i = 0; i < allMessage.length; i++) {
    if (i < limit) {
      if (allMessage[i].time >= lastTimeRead) {
        numNewMessage++;
      }
    } else {
      return numNewMessage;
    }
  }
  return numNewMessage;
}

Spark.setScriptData("player_Data", currentPlayer); // return the player via script-data
Spark.setScriptData("config", client_config); // return the player via script-data

function isAdmin() {
  if (LIST_ADMIN.indexOf(playerID) != -1) {
    return 1;
  }
  return 0;
}