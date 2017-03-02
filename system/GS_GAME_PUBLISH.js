// ====================================================================================================
//
// Cloud Code for GS_GAME_PUBLISH, write your code here to customize the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://docs.gamesparks.com/
//
// ====================================================================================================
Spark.runtimeCollection('playerData').ensureIndex({"last_read" : -1});
Spark.runtimeCollection('user_level_log').ensureIndex({"playerID" : -1});