// ====================================================================================================
//
// Cloud Code for GLP, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================
// var packData = Spark.runtimeCollection("Pack");
var packData = Spark.metaCollection("Pack");
var searchResult = packData.find().toArray();
var list = new Array();

var playerData = Spark.runtimeCollection("playerData"); // get the collection data
var currentPlayer = playerData.findOne({
	"playerID": Spark.getPlayer().getPlayerId()
}); // search the collection data for the entry with the same id as the player
var listBuy ;
if(currentPlayer != null)
 listBuy = currentPlayer.list_pack;

for(i = 0; i< searchResult.length; i++){
    var pack = searchResult[i];
    var sCode = "p" + pack.pack;
    var result = Spark.sendRequest({
      "@class" : ".GetDownloadableRequest",
      "shortCode" : sCode
    });
    pack.url = result.url;
    packData.update({"pack":pack.pack}, //Looks for a doc with the id of the current player
    {
        "$set": pack
    }, // Uses the $set mongo modifier to set old player data to the current player data
    true, // Create the document if it does not exist (upsert)
    false // This query will only affect a single object (multi)
    );
    if("list_pack" in currentPlayer){
        for(j = 0 ; j < listBuy.length; j++){
            if(listBuy[j].pack == pack.pack){
                pack.hint = 0;
                pack.random = 0;
            }
        }
    }
    list.push(pack);
}
Spark.setScriptData("player_Data", list);