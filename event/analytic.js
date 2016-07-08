// ====================================================================================================
//
// Cloud Code for analytic, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================
require("share");
var data = Spark.getData().data;
var playerDataList = Spark.runtimeCollection("playerData");
var response= {};
if(data.level_data){
	for(var i = 1; i <= NUM_LEVEL ;i++){
		response["level" + i] = playerDataList.count({"level":i});
	}
}
if(data.level_data_passed){
	var sum = 0;
	for(var i = NUM_LEVEL; i >= 1 ;i--){
		sum += playerDataList.count({"level":i});
		response["level" + i] = sum;
	}
}
if(data.report_trophies) {
	var minTrophies = data.min_trophies ? data.min_trophies : -1;
	var maxTrophies = data.max_trophies ? data.max_trophies : 0;
	var query;
	if (maxTrophies > 0) {
		query = {"trophies":{"$gt":minTrophies,"$lt":maxTrophies}};
	} else {
		query = {"trophies":{"$gt":minTrophies}};
	}
	var trophiesData = playerDataList.find(query).toArray();
	var result = [];
	for (var i = 0; i < trophiesData.length; i++) {
		var data = trophiesData[i];
		var userData = {
			"userName" : data.userName ? data.userName : data.playerID,
			"fbName"   : data.facebook_name ? data.facebook_name : data.playerID,
			"trophies" : data.trophies,
			"online_match_start" : data.online_match_start ? data.online_match_start : 0,
			"online_bot_start"   : data.online_bot_start ? data.online_bot_start : 0
		};
		result.push(userData);
	}
	response["trophiesData"] = result;
}

if (data.report_online_match) {
	var filter_pvp = data.filter_pvp ? data.filter_pvp : false;
	var query = {"online_match_start":{$gt:0}};
	if (filter_pvp) {
		query = {"online_match_start":{$gt:0},$where: "this.online_match_start > this.online_bot_start"}
	}
	var playerDataArr = playerDataList.find(query).sort({"online_match_start":-1}).toArray();
	var result = [];
	for (var i = 0; i < playerDataArr.length; i++) {
		var data = playerDataArr[i];
		var onlineData = {
			"userName" : data.userName ? data.userName : data.playerID,
			"trophies" : data.trophies,
			"online_win" : data.online_win,
			"online_match_start" : data.online_match_start ? data.online_match_start : 0,
			"online_bot_start"   : data.online_bot_start ? data.online_bot_start : 0
		}
		result.push(onlineData);
	}
	response["onlineMatchData"] = result;
}

if(data.reset_100_trophies){
	var shortCode = data.shortCode;
	var leaderboard = Spark.getLeaderboards().getLeaderboard(shortCode);
	var entries = leaderboard.getEntries(200, 0);
	while(entries.hasNext()){
        var entry = entries.next();
        var trophies = entry.getAttribute("trophies");
        if(trophies == 100){
            var id = entry.getUserId();
            response = leaderboard.deleteAllEntries(id, false);
        }
    }
}

Spark.setScriptData("data", response);
