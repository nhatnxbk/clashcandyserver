require("share");
var adsMaster = Spark.runtimeCollection("ads_master");
var adsLogCollection = Spark.runtimeCollection("ads_log");

function getAds(game_name, playerID) {
    var list_ads = getAdsFromCache();
    if (!list_ads) {
        list_ads = adsMaster.find().toArray();
        cacheAds(list_ads);
    }
    var list_ads_reponse = [];
    for (var i = 0; i < list_ads.length; i++) {
        var ads = list_ads[i];
        if (ads.enable && ads.ignore_game_name.indexOf(game_name) == -1
            && getCountAdsViewByPlayerID(playerID, ads.id+"") < NUMBER_TIME_CUSTOM_ADS_SHOW_MAX) {
            if (!ads.img_url) {
                var img_url = getUrlDownloadable(ads.image_id);
                ads.img_url = img_url;
            }
            list_ads_reponse.push(ads);
        }
    }
    return list_ads_reponse;
}

function cacheAds(list_ads) {
    Spark.getCache().put("list_ads", list_ads);
}

function getAdsFromCache() {
    Spark.getCache().get("list_ads");
}

function getUrlDownloadable(code){
    var result = Spark.sendRequest({
     "@class" : ".GetDownloadableRequest",
     "shortCode" : code
   });
   return result.url;
}

function getCountAdsViewByPlayerID(playerID, adsID) {
    var count = adsLogCollection.find({"playerID":playerID, "id":adsID, "type":"view"}).count();
    return count;
}

function getCountAdsClickByPlayerID(playerID, adsID) {
    var count = adsLogCollection.find({"playerID":playerID, "id":adsID, "type":"click"}).count();
    return count;
}