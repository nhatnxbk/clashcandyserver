var gameString = {};
gameString.VERSION = 13;
gameString.not_enough_money = "You don't have enough coin!";
gameString.not_enough_card = "You don't have enough card!";
gameString.over_max_card = "Max today! Can not buy anymore.";
gameString.name_updated = "Your name is updated";
gameString.error = "Something wrong! Please try again later!";
gameString.name_empty = "Your name can not empty!!!";
gameString.fb_connect_already = "Facebook Connected";
gameString.facebook_override_data = "Your facebook already linked to other account. That account will override this account. Are you sure?";
gameString.reload_card = "New card in : ";
gameString.exit_game_confirm = "You will lose. Do you want to exit game?";
gameString.FacebookInviteText = "Bring your friend to the ocean and get more coin.";
gameString.translate_text_hint = "English is default.\nOther is power by Google Translate";
gameString.no_card = "No card available";
list_hint = [
	"If you win a match, you will get a Treasure and Coin.",
	"Upgrade Card to reduce Energy cost and increase score you get.",
	"You can buy Card in store.",
	"You can use Coin to unlock Treasure immediately.",
	"You can get Coin from a match or buy it in store.",
	"In the match with same target, you must get Score as much as possible to win the match.",
	"In the match with different animal target, you should eat your target and must not eat enemy target.",
	"In the match bring target down, you can bring enemy target down to stop him to win.",
	"When time over, who has higher score will be the winner.",
	"Eat special block to get higher score.",
	"You can not eat a animal if Card does not appear in the Deck or Card does not have enough Energy to active.",
	"With Bomb Card, you can destroy any animal in the game.",
	"With Card contain two animal, you can eat one of animal in that card.",
	"If you lost connection, you will lose the Cup. Please sure you have good connection!"
];

function getGameString(lang){
    var list = Object.keys(gameString);
    for(var i in list){
        var key = list[i];
        gameString[key] = getTextTranslation(gameString[key],lang);
    }
    var new_list_hint = [];
    for(var i in list_hint){
        new_list_hint.push(getTextTranslation(list_hint[i],lang));
    }
    gameString.list_hint = new_list_hint;
    return gameString;
}