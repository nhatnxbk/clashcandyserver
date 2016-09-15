//===========common function================//
var levelMaster = Spark.metaCollection("level_master");
var playerCollection = Spark.runtimeCollection("playerData");

function getPlayerLevelInfo(playerID) {
	var levelInfo = {};
	var playerData = playerCollection.findOne({"playerID":playerID});
	var currentExp = playerData.current_exp ? playerData.current_exp : 0;
	var levelArr = levelMaster.find({"exp":{"$gt":currentExp}}).sort({"level":1}).toArray();
	if (levelArr.length > 0) {
	  var nextLevel = levelArr[0];
	  levelInfo.level = nextLevel.level > 1 ? nextLevel.level - 1 : 1;
	  levelInfo.current_exp = currentExp;
	  levelInfo.next_exp = nextLevel.exp;
	}
	return levelInfo;
}
