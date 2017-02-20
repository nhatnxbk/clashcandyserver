//==========1 min work============//
//String Array
var enable = false;
var stringArr = [""]

if (enable) {
    //A reference to the player collection, turned into an array
    var myCollection = Spark.systemCollection("player").find().toArray();
    
    //ForEach loop that adds the ID to the string array
    myCollection.forEach( function(player){
        var playerId = player._id.$oid;
        stringArr.push(playerId);
    });
    
    //Send message by IDs in the string array
    Spark.sendMessageById({"Message": "There is message from gamesparks to your application each minute."}, stringArr);
    Spark.sendMessageExt({"ExtMessage":"There is ext message each minute"}, "TGSM", stringArr);
}