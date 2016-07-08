var playerData = Spark.runtimeCollection("playerData"); // get the collection data
var currentPlayer = playerData.findOne({
	"playerID": Spark.getPlayer().getPlayerId()
}); 
var selector = {facebook_id: 1, level: 1, playerID: 1};
var friendList = playerData.find( { facebook_friend: { $regex: Spark.getData().facebook_id, $options: 'i' } } ,selector);
Spark.setScriptData("player_Data", friendList); // return the player via script-data