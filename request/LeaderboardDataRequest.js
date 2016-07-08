// ====================================================================================================
//
// Cloud Code for LeaderboardDataRequest, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================
// var playerDataList = Spark.runtimeCollection("playerData");
// var playerID = Spark.getPlayer().getPlayerId();
// var currentPlayerData = playerDataList.findOne({"playerID": playerID});
// var currentPlayer = Spark.getPlayer();
// var lastTrophies = currentPlayer.getPrivateData("lastTrophies");
// if(currentPlayerData && lastTrophies != currentPlayerData.trophies){
//     currentPlayer.setPrivateData("lastTrophies",currentPlayerData.trophies);
// 	var result = Spark.sendRequest({
// 		"@class": ".LogEventRequest",
// 		"eventKey": "TLB",
// 		"trophies": currentPlayerData ? currentPlayerData.trophies : 0,
// 		"COUNTRY": currentPlayerData && currentPlayerData.location && currentPlayerData.location.country ? currentPlayerData.location.country : "VN",
// 		"CITY": ""
// 	});
// }