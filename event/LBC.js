//======Leader board======//
require("share");
var playerID = Spark.getPlayer().getPlayerId();
var playerData = Spark.runtimeCollection("playerData");
var currentPlayer = playerData.findOne({"playerID": playerID});
var data = Spark.getData().data;
if(!data) data = {};

if (data.leader_board_type == LEADER_BOARD_GLOBAL) {
	//leader board global
	var dataResponse = RQLeaderBoard(SHORT_CODE_LB_GLOBAL, playerID);
	if (!dataResponse.myPlayerRank) {
		dataResponse.myPlayerRank = RQMyPlayerRank(SHORT_CODE_LB_GLOBAL, playerID);
	}
	Spark.setScriptData("data", dataResponse);
}

if (data.leader_board_type == LEADER_BOARD_BY_COUNTRY) {
	//leader board by country
	var country = (currentPlayer && currentPlayer.location && currentPlayer.location.country) ? currentPlayer.location.country : "VN";
	if (country == "") country = "VN";
	var dataResponse = RQLeaderBoard(SHORT_CODE_LB_BY_COUNTRY + country, playerID);
	if (!dataResponse.myPlayerRank) {
		dataResponse.myPlayerRank = RQMyPlayerRank(SHORT_CODE_LB_BY_COUNTRY + country, playerID);
	}
	Spark.setScriptData("data", dataResponse);
}

if (data.leader_board_type == LEADER_BOARD_BY_FRIENDS) {
	//leader board by friends
	var friendList = (currentPlayer && currentPlayer.facebook_friend  && currentPlayer.facebook_friend.length > 0) ? currentPlayer.facebook_friend : [];
	var friendListArr = friendList;
	var myFBId = currentPlayer && currentPlayer.facebook_id ? currentPlayer.facebook_id : "";
	var playerList = playerData.find({"$or":[{"facebook_id":{"$ne":"","$in":friendListArr}},{"facebook_id":myFBId}],"trophies":{"$ne":null}}).sort({"trophies":-1}).limit(100).toArray();
	var listRank = [];
	var myPlayerRank;
	for (var i = 0; i < playerList.length; i++) {
		var opponent = playerList[i];
		var defaultName = playerID == opponent.playerID ? "You" : opponent.playerID;
		var rank = {
			"rank"     : (listRank.length + 1),
			"trophies" : opponent.trophies ? opponent.trophies : 0,
			"userName" : opponent.userName ? opponent.userName : defaultName,
			"userId"   : opponent.playerID,
			"avatar_local"   : opponent && opponent.avatar_local ? opponent.avatar_local : 0,
			"facebook_id"   : opponent && opponent.facebook_id ? opponent.facebook_id : "",
		};
		if (opponent.playerID == playerID) {
			myPlayerRank = rank;
		}
		listRank.push(rank);
	}
	if (!myPlayerRank) {
		myPlayerRank = {
			"rank"     : listRank.length > 0 ? (listRank.length +1) : 1,
			"trophies" : currentPlayer && currentPlayer.trophies ? currentPlayer.trophies : 0,
			"userName" : currentPlayer && currentPlayer.userName ? currentPlayer.userName : "You",
			"userId"   : currentPlayer && currentPlayer.playerID ? currentPlayer.playerID : 0,
			"avatar_local"   : currentPlayer && currentPlayer.avatar_local ? currentPlayer.avatar_local : 0,
			"facebook_id"   : currentPlayer && currentPlayer.facebook_id ? currentPlayer.facebook_id : "",
		};
	}
	var dataResponse = {
		"listRank" 	   : listRank,
		"myPlayerRank" : myPlayerRank
	};
	Spark.setScriptData("data", dataResponse);
}

function RQMyPlayerRank(shortCode) {
	var request = new SparkRequests.AroundMeLeaderboardRequest();
	request.dontErrorOnNotSocial = false;
	request.entryCount = 1;
	request.includeFirst = 0;
	request.includeLast = 0;
	request.inverseSocial = false;
	request.leaderboardShortCode = shortCode;
	request.social = false;
	var response = request.Send();
	var data = response.data;
	if (!data) data = [];
	var myPlayerRank;
	for (var i = 0; i < data.length; i++) {
		var opponent = data[i];
		if (playerID == opponent.userId) {
			myPlayerRank = {
				"rank"     : opponent.rank,
				"trophies" : opponent.trophies ? opponent.trophies : 0,
				"userName" : opponent.userName ? opponent.userName : "You",
				"userId"   : opponent.userId
			};
			var myPlayerData = playerData.findOne({"playerID":playerID},{"playerID":1,"avatar_local":1,"facebook_id":1});
			myPlayerRank.avatar_local = myPlayerData.avatar_local;
			myPlayerRank.facebook_id = myPlayerData.facebook_id;
			return myPlayerRank;
		}
	}
	return myPlayerRank;
}

function RQLeaderBoard(shortCode) {
	var request = new SparkRequests.LeaderboardDataRequest();
	request.dontErrorOnNotSocial = true;
	request.entryCount = LEADER_BOARD_NUMBER_ENTRY;
	request.friendIds = [""];
	request.includeFirst = 0;
	request.includeLast = 0;
	request.inverseSocial = false;
	request.leaderboardShortCode = shortCode;
	request.offset = 0;
	request.social = false;

	var response = request.Send();
	var data = response.data;
	if (!data) data = [];
	var objRank = {};
	var myPlayerRank;
	var listIds = [];
	for (var i = 0; i < data.length; i++) {
		var opponent = data[i];
		var defaultName = playerID == opponent.userId ? "You" : opponent.userId;
		var rank = {
			"rank"     : opponent.rank,
			"trophies" : opponent.trophies ? opponent.trophies : 0,
			"userName" : opponent.userName ? opponent.userName : defaultName,
			"userId"   : opponent.userId
		};
		listIds.push(opponent.userId);
	}
	

    var listRank = [];
	//Tim playerData trong list
	var listPlayerData = playerData.find({"playerID":{"$in":listIds}},{"playerID":1,"avatar_local":1,"facebook_id":1}).toArray();
	for(var i = 0; i< listPlayerData.length; i++){
	    var opponent = listPlayerData[i];
	    objRank[opponent.playerID] = opponent;
	}
    
	for(var i = 0; i< data.length; i++){
	    var player = data[i];
	    var obj = objRank[player.userId];
	    player.avatar_local = obj.avatar_local?obj.avatar_local:0;
	    player.facebook_id = obj.facebook_id;
	    listRank.push(player);
	    if (playerID == player.userId) {
			myPlayerRank = player;
		}
	}

	var dataResponse = {
		"listRank" 	   : listRank,
		"myPlayerRank" : myPlayerRank
	};
	return dataResponse;
}