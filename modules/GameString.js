var gameString = {};
gameString.VERSION = 14;
gameString.not_enough_money = "You don't have enough coins!";
gameString.not_enough_card = "You don't have enough Cards!";
gameString.over_max_card = "Max today! Can not buy anymore.";
gameString.name_updated = "Your name is updated";
gameString.error = "Something's  wrong! Please try again later!";
gameString.name_empty = "Please enter your name!!!";
gameString.fb_connect_already = "Facebook Connected";
gameString.facebook_override_data = "Your Facebook already linked to another account. That account will override this one. Are you sure?";
gameString.reload_card = "New card in : ";
gameString.exit_game_confirm = "You will lose. Do you want to exit game?";
gameString.FacebookInviteText = "Invite your friend to the Ocean and get more coins.";
gameString.translate_text_hint = "English is default.\nOthers are powered by Google Translate";
gameString.no_card = "No available card";
list_hint = [
	"If you win a match, you will get coins and a Treasure.",
	"Upgrade Card to reduce Energy cost and increase score you get.",
	"You can buy Cards in the Store.",
	"You can use Coins to unlock Treasure immediately.",
	"You can get Coins from a match or buy it in the store.",
	"In the match with the same target, you must get as much Score as possible to win the match.",
	"In the match with different animal targets, you should eat your target and must not eat enemy target.",
	"In the match with Drop Down target, you can bring enemy's target down to stop him to win.",
	"When time is over, who has higher score will be the winner.",
	"Eat special block to get higher score.",
	"You can not eat a animal if Card does not appear in Deck or does not have enough Energy to active.",
	"With Bomb Card, you can destroy any animal in the game.",
	"With Card contains two animals, you can eat either one of the two.",
	"If you lose Internet connection, you will lose the Cup. Please make sure you have good connection!"
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