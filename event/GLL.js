require("share");
// ====================================================================================================
//
// Cloud Code for GLL, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================
var listResponse = new Array();
var off_level = Spark.getData().level;
if(off_level < NUM_LEVEL){
    for(i = off_level + 1 ; i<= NUM_LEVEL; i++){
        var sCode = "level_" + i;
        var result = Spark.sendRequest({
          "@class" : ".GetDownloadableRequest",
          "shortCode" : sCode
        });
        if( result.url != null){
            var level = {};
            level.url = result.url;
            level.level = i;
            listResponse.push(level);
        }
    }
}

Spark.setScriptData("player_Data", listResponse);