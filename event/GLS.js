var score = Spark.getData().data.score;
var level = Spark.getData().data.level;
if(!level) level = Spark.getData().level;
var score_level = "score_level_" + level;

var selector = { facebook_name: 1, facebook_id: 1, userName: 1, playerID: 1,nextpeerImage:1,nextpeerName:1};
selector[score_level] = 1;

var playerData = Spark.runtimeCollection("playerData"); // get the collection data
var currentPlayer = playerData.findOne({
	"playerID": Spark.getPlayer().getPlayerId()
},selector); 

if(!currentPlayer) currentPlayer = {};

var save_obj = {};
save_obj[score_level] = score;
currentPlayer[score_level] = score;
playerData.update({
	"playerID": Spark.getPlayer().getPlayerId()
}, //Looks for a doc with the id of the current player
{
	"$set": save_obj
}, // Uses the $set mongo modifier to set old player data to the current player data
true, // Create the document if it does not exist (upsert)
false // This query will only affect a single object (multi)
);

var querry = {};
querry[score_level] = {$gt : 0};
var sort_obj = {};
sort_obj[score_level] = -1;

var friendList = playerData.find( querry, selector ).sort(sort_obj).limit(100);
var friendList_array = friendList.toArray();
for(i =0; i < friendList_array.length; i++){
    friendList_array[i].rank = i+1;
}

querry[score_level] = {$gt : score};
var currentRank = playerData.count(querry);
if(currentRank > 99){
    currentPlayer.rank = currentRank + 1;
    friendList_array.push(currentPlayer);
}

Spark.setScriptData("player_Data", friendList_array); // return the player via script-data