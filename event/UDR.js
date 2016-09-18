//=========User Data Request Controller============//
require("share");
require("common");
var playerDataList = Spark.runtimeCollection("playerData");
var playerID = Spark.getPlayer().getPlayerId();
var playerData = playerDataList.findOne({"playerID":playerID});
var data = Spark.getData().data;
if(!data) data = {};

//get player card data
if (data.get_card_data) {
    var cardData = playerData.card_data ? playerData.card_data : [];
    Spark.setScriptData("data", cardData);
}

//add coin
if (data.add_coin && data.number !== undefined) {
	var response;
	var playerCoin = playerData.player_coin ? playerData.player_coin : 0;
	playerData.player_coin = playerCoin + data.number;
	playerDataList.update({"playerID":playerID},{"$set":{"player_coin":playerData.player_coin}});
	response = {
		"result":true,
		"message": "You have got " + data.number + " coin!",
		"player_coin": playerData.player_coin
	}
	Spark.setScriptData("data", response);
}

//add card
if (data.add_card && data.card_id !== undefined && data.number !== undefined) {
	var card_upgrade_id = data.card_id;
    var playerCardData = playerData.card_data;
    var response;
    
    for (var i = 0; i < playerCardData.length; i++) {
    	var cardData = playerCardData[i];
    	if (cardData.card_id == data.card_id) {
    		cardData.current_number = cardData.current_number + data.number;
    		playerDataList.update({"playerID":playerID},{"$set":{"card_data":playerCardData}});
    		response = {
    			"result":true,
    			"message": "You have got " + data.number + " card!",
    			"card_data": [
    				{
	    				"card_id": cardData.card_id,
	    				"current_number": cardData.current_number
	    			}
    			]
    		}
    		break;
    	}
    }

    Spark.setScriptData("data", response);
}

//upgrade card
if (data.upgrade_card && data.card_id !== undefined) {
    var card_upgrade_id = data.card_id;
    var playerCardData = playerData.card_data;
    // var playerCardDataArr = playerCardData ? JSON.parse(playerCardData) : [];
    var playerCoin = playerData.player_coin;
    var response;
    
    for (var i = 0; i < playerCardData.length; i++) {
    	var cardData = playerCardData[i];
    	if (cardData.card_id == data.card_id) {
    		if (cardData.current_level < card_level_max) {
    			if (getCardNumberNeed(cardData.rarity, cardData.current_level + 1) > cardData.current_number) {
	    			response = {
	    				"result":false,
	    				"message":"Can not enough card to upgrade this card!"
	    			}
	    		} else if (getCardCoinNeed(cardData.rarity, cardData.current_level + 1) > playerCoin) {
	    			response = {
	    				"result":false,
	    				"message":"Can not enough coin to upgrade this card!"
	    			}
	    		} else {
	    				playerData.player_coin = playerCoin - getCardCoinNeed(cardData.rarity, cardData.current_level + 1);
	    				cardData.current_number = cardData.current_number - getCardNumberNeed(cardData.rarity, cardData.current_level + 1);
	    				cardData.current_level = cardData.current_level + 1;
	    				playerDataList.update({"playerID":playerID},{"$set":{"card_data":playerCardData, "player_coin":playerCoin}});
	    				response = {
	    					"result":true,
	    					"message":"Upgrade success!",
	    					"card_data":
			    				{
				    				"card_id": cardData.card_id,
				    				"current_level": cardData.current_level,
				    				"current_number": cardData.current_number,
				    				"next_level" : cardData.current_level + 1,
				    				"next_score" : getCardScore(cardData.rarity, cardData.current_level + 1),
									"next_energy" : getCardEnergy(cardData.rarity, cardData.current_level + 1),
									"next_number" : getCardNumberNeed(cardData.rarity, cardData.current_level + 1),
									"coin_need" : getCardCoinNeed(cardData.rarity, cardData.current_level + 1)
				    			},
	    					"player_coin":playerData.player_coin
	    				}
	    		}
    		} else {
    				response = {
    					"result":false,
    					"message":"Your card is max level!"
    				}
    			}
    		break;
    	}
    }
    Spark.setScriptData("data", response);
}
//=====================RQ debug======================//
if (data.debug_add_card) {
	var number = data.number ? data.number : 500;
    var playerCardData = playerData.card_data;
    var response;
    var reponseCardData = [];
    
    for (var i = 0; i < playerCardData.length; i++) {
    	var cardData = playerCardData[i];
    	cardData.current_number = cardData.current_number + number;
    	reponseCardData.push({
    		"card_id": cardData.card_id,
	    	"current_number": cardData.current_number
    	});
    }
    playerDataList.update({"playerID":playerID},{"$set":{"card_data":playerCardData}});
    response = {
    	"result":true,
    	"message": "You have got " + number + " card for each kind!",
  		"card_data": reponseCardData
  	}

    Spark.setScriptData("data", response);
}

//=====================function======================//

function getCardData(id) {
	var playerCardData = playerData.card_data;
    // var playerCardDataArr = playerCardData ? JSON.parse(playerCardData) : [];
    for (var i = 0; i < playerCardData.length; i++) {
    	var cardData = playerCardData[i];
    	if (cardData.id == id) {
    		return cardData;
    	}
    }
    return null;
}