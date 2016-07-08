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
	var friendList = (currentPlayer && currentPlayer.facebook_friend  && currentPlayer.facebook_friend.length > 0) ? currentPlayer.facebook_friend : "";
	var friendListArr = friendList ? JSON.parse(friendList) : [];
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
			"userId"   : opponent.playerID
		};
		if (opponent.playerID == playerID) {
			myPlayerRank = rank;
		}
		listRank.push(rank);
	}
	if (!myPlayerRank) {
		myPlayerRank = {
			"rank"     : listRank.length > 0 ? 101 : 1,
			"trophies" : currentPlayer && currentPlayer.trophies ? currentPlayer.trophies : 0,
			"userName" : currentPlayer && currentPlayer.userName ? currentPlayer.userName : "You",
			"userId"   : currentPlayer && currentPlayer.playerID ? currentPlayer.playerID : 0
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
	var listRank = [];
	var myPlayerRank;
	for (var i = 0; i < data.length; i++) {
		var opponent = data[i];
		var defaultName = playerID == opponent.userId ? "You" : opponent.userId;
		var rank = {
			"rank"     : opponent.rank,
			"trophies" : opponent.trophies ? opponent.trophies : 0,
			"userName" : opponent.userName ? opponent.userName : defaultName,
			"userId"   : opponent.userId
		};
		listRank.push(rank);
		if (playerID == opponent.userId) {
			myPlayerRank = rank;
		}
	}
	var dataResponse = {
		"listRank" 	   : listRank,
		"myPlayerRank" : myPlayerRank
	};
	return dataResponse;
}