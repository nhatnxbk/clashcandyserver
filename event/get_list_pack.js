// ====================================================================================================
//
// Cloud Code for GLP, write your code here to customise the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://portal.gamesparks.net/docs.htm			
//
// ====================================================================================================
var packData = Spark.metaCollection("PackItem");
// var searchResult = packData.find();
// for(i = 0; i< searchResult.length; i++){
//     // var result = Spark.sendRequest({
//     //   "@class" : ".GetDownloadableRequest",
//     //   "shortCode" : "p1id1"
//     // });
    
// }
    for(i = 1; i <= 36; i ++){
        packData.insert({
            pack: 1,
            item: i
        });
    }