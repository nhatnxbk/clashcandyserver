var gameString = {};
gameString.VERSION = 4;
gameString.not_enough_money = "You don't have enough coin!";
gameString.not_enough_card = "You don't have enough card!";
gameString.over_max_card = "Max today! Can not buy anymore.";
gameString.name_updated = "Your name is updated";
gameString.error = "Something wrong! Please try again later!";
gameString.name_empty = "Your name can not empty!!!";
gameString.fb_connect_already = "Facebook Connected";
gameString.facebook_override_data = "Your facebook already linked to other account. That account will override this account. Are you sure?";

function getGameString(lang){
    var list = Object.keys(gameString);
    for(var i in list){
        var key = list[i];
        gameString[key] = getTextTranslation(gameString[key],lang);
    }
    return gameString;
}