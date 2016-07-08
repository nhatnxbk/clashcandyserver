// ====================================================================================================
//
// Cloud Code for GLP, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================
var packData = Spark.metaCollection("PackItem");
var searchResult = packData.find({"pack":Spark.getData().p});
var listResponse = new Array();

for(i = 0; i< searchResult.toArray().length; i++){
    var pack = searchResult.toArray()[i];
    var sCode = "p" + pack.pack + "i" + pack.item;
    var result = Spark.sendRequest({
      "@class" : ".GetDownloadableRequest",
      "shortCode" : sCode
    });
    if( result.url != null){
        pack.url = result.url;
    }else{
        pack.url = "http://cdn.bulbagarden.net/upload/thumb/0/0d/025Pikachu.png/250px-025Pikachu.png";       
    }
    listResponse.push(pack);
    packData.update({"pack":pack.pack,"item":pack.item}, //Looks for a doc with the id of the current player
    {
    	"$set": pack
    }, // Uses the $set mongo modifier to set old player data to the current player data
    true, // Create the document if it does not exist (upsert)
    false // This query will only affect a single object (multi)
    );
    
}

var is_buy = Spark.getData().isDownload;
var pack = Spark.getData().p;
if(is_buy == 1){
    var playerData = Spark.runtimeCollection("playerData"); // get the collection data
    var currentPlayer = playerData.findOne({
    	"playerID": Spark.getPlayer().getPlayerId()
    }); // search the collection data for the entry with the same id as the player
    var listBuy ;
    if(currentPlayer != null)
        listBuy= currentPlayer.list_pack;
        else currentPlayer ={};
    var found = false;
    var packData = Spark.metaCollection("Pack");
    var packResult = packData.findOne({"pack":pack});
    var playerID = Spark.getPlayer().getPlayerId();
    
    if("list_pack" in currentPlayer){
        for(i = 0 ; i < listBuy.length; i++){
            if(listBuy[i].pack == pack){
                found = true;
                listBuy[i].version = packResult.version;        
            }
        }
    }else{
       listBuy = []; 
    }
    if(!found){
        listBuy.push({'pack':pack,'version':packResult.version});
    }
    
    currentPlayer.list_pack = listBuy;
        
    playerData.update({
    	"playerID": playerID
    }, //Looks for a doc with the id of the current player
    {
    	"$set": currentPlayer
    }, // Uses the $set mongo modifier to set old player data to the current player data
    true, // Create the document if it does not exist (upsert)
    false // This query will only affect a single object (multi)
    );
}

Spark.setScriptData("player_Data", listResponse);