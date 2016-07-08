var playerDataList = Spark.runtimeCollection("playerData"); // this will get the collection of player data
var playerID = Spark.getPlayer().getPlayerId(); // first we get the id of the current player
var facebook_id = Spark.getData().facebook_id == "" ? Spark.getPlayer().facebook_id : Spark.getData().facebook_id; // we get the xp input from Unity
var facebook_name = Spark.getData().facebook_name == "" ? Spark.getPlayer().facebook_name : Spark.getData().facebook_name; // Get the gold input from Unity
var user_name = Spark.getData().user_name == "" ? Spark.getPlayer().user_name : Spark.getData().user_name; // and the position input from Unity
var bonus_message = Spark.getData().bonus_message == "" ? Spark.getPlayer().bonus_message : Spark.getData().bonus_message; // and the position input from Unity
var bonus_energy = Spark.getData().bonus_energy == "" ? Spark.getPlayer().bonus_energy : Spark.getData().bonus_energy; // and the position input from Unity
var bonus_random = Spark.getData().bonus_random == "" ? Spark.getPlayer().bonus_random : Spark.getData().bonus_random; // and the position input from Unity
var bonus_hint = Spark.getData().bonus_hint == "" ? Spark.getPlayer().bonus_hint : Spark.getData().bonus_hint; // and the position input from Unity
var level = Spark.getData().level == "" ? Spark.getPlayer().level : Spark.getData().level; // and the position input from Unity
var facebook_friend = Spark.getData().facebook_friend == "" ? Spark.getPlayer().facebook_friend : Spark.getData().facebook_friend; // and the position input from Unity

var currentPlayer = {};
if(typeof playerID != "undefined") currentPlayer.playerID = playerID;
if(typeof facebook_id != "undefined") currentPlayer.facebook_id = facebook_id;
if(typeof facebook_name != "undefined") currentPlayer.facebook_name = facebook_name;
if(typeof bonus_energy != "undefined") currentPlayer.bonus_energy = bonus_energy;
if(typeof bonus_random != "undefined") currentPlayer.bonus_random = bonus_random;
if(typeof bonus_hint != "undefined") currentPlayer.bonus_hint = bonus_hint;
if(typeof level != "undefined") currentPlayer.level = level;
if(typeof facebook_friend != "undefined") currentPlayer.facebook_friend = facebook_friend;
if(typeof user_name != "undefined") currentPlayer.userName = user_name;
playerDataList.update({
	"playerID": playerID
}, //Looks for a doc with the id of the current player
{
	"$set": currentPlayer
}, // Uses the $set mongo modifier to set old player data to the current player data
true, // Create the document if it does not exist (upsert)
false // This query will only affect a single object (multi)
);