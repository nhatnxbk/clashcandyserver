//=========Remove online player module ========//
var playerID = Spark.getData().playerID;
if(Spark.getData().remove_room){
    var server = Spark.runtimeCollection("FriendRoom");
    server.remove({"playerID":playerID});
}else{
    var server = Spark.runtimeCollection("PhotonServer");
    server.remove({"playerID":playerID});
}