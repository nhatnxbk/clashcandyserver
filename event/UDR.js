//=========User Data Request Controller============//
require("share");
require("common");
var playerID = Spark.getPlayer().getPlayerId();
var playerData = playerCollection.findOne({"playerID":playerID});
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
	playerCollection.update({"playerID":playerID},{"$set":{"player_coin":playerData.player_coin}});
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
    		playerCollection.update({"playerID":playerID},{"$set":{"card_data":playerCardData}});
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
	    				playerCollection.update({"playerID":playerID},{"$set":{"card_data":playerCardData, "player_coin":playerData.player_coin}});
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

//buy item
if (data.buy_item) {
	var pack_id = data.pack_id;
	var packItem = storeMaster.findOne({"pack_id":pack_id});
	var playerCoin = playerData.player_coin ? playerData.player_coin : 0;
	var response;
	if (packItem) {
		if (packItem.item_type == server_config.PACK_ITEM_TYPE.coin) {
			playerCoin += packItem.number;
			playerCollection.update({"playerID":playerID}, {"$set":{"player_coin":playerCoin}}, true, false);
			response = {
				"result" : true,
				"message" : "Buy success",
				"player_coin" : playerCoin
			};
		} else if (packItem.item_type == server_config.PACK_ITEM_TYPE.life) {
			if (playerCoin < packItem.cost) {
				response = {
					"result" : false,
					"message" : "Can't enough coin to buy"
				};
			} else {
				playerCoin -= packItem.cost;
				var playerLife = playerData.player_life ? playerData.player_life : 0;
				playerLife += packItem.number;
				playerCollection.update({"playerID":playerID}, {"$set":{"player_coin":playerCoin, "player_life":playerLife}}, true, false);
				response = {
					"result" : true,
					"message" : "Buy success",
					"player_life" : playerLife,
					"player_coin" : playerCoin
				};
			}
		} else if (packItem.item_type == server_config.PACK_ITEM_TYPE.bomb) {
			if (playerCoin < packItem.cost) {
				response = {
					"result" : false,
					"message" : "Can't enough coin to buy"
				};
			} else {
				playerCoin -= packItem.cost;
				var playerBomb = playerData.player_bomb ? playerData.player_bomb : 0;
				playerBomb += packItem.number;
				playerCollection.update({"playerID":playerID}, {"$set":{"player_coin":playerCoin, "player_bomb":playerBomb}}, true, false);
				response = {
					"result" : true,
					"message" : "Buy success",
					"player_bomb" : playerBomb,
					"player_coin" : playerCoin
				};
			}
		}
	} else {
		response = {
			"result" : false,
			"message" : "Not found this item"
		};
	}
	Spark.setScriptData("data", response);
}

//buy card
if (data.buy_card) {
	var card_id = data.card_id;
	var buy_all = data.buy_all ? data.buy_all : 0;
	var playerCoin = playerData.player_coin ? playerData.player_coin : 0;
	var cardStore = getCardStore(playerID, card_id);
	var cardPlayer = getCardPlayer(playerID, card_id);
	var response;
	if (cardStore) {
		var cost = buy_all ? cardStore.cost_all : cardStore.cost;
		if (playerCoin < cost) {
			response = {
				"result" : false,
				"message" : "Not enough coin to buy this card"
			}
		} else {
			playerCoin -= cost;
			var numberCard = buy_all ? cardStore.max_number - cardStore.number : 1;
			cardStore.number += numberCard;
			cardStore.cost = getCardCost(cardStore.number, cardStore.card_rarity);
			cardStore.cost_all = getAllCardCost(cardStore.number, cardStore.card_rarity);
			storeDaily.update({"$and":[{"playerID":playerID},{"pack_card.card_id":cardStore.card_id}]},
				{"$set":{"pack_card.$.number": cardStore.number, "pack_card.$.max_number": cardStore.max_number,
				"pack_card.$.cost": cardStore.cost, "pack_card.$.cost_all": cardStore.cost_all}}, true, false);
			if (cardPlayer) {
				cardPlayer.current_number += numberCard;
				playerCollection.update({"$and":[{"playerID":playerID},{"card_data.card_id":cardPlayer.card_id}]},
					{"$set":{"player_coin":playerCoin, "card_data.$.current_number": cardPlayer.current_number}}, true, false);
			} else {
				cardPlayer = cardMaster.findOne({"card_id":cardStore.card_id});
				cardPlayer.current_level = 1;
				cardPlayer.current_number = numberCard;
				var listPlayerCard = playerData.card_data ? playerData.card_data : [];
				listPlayerCard.push(cardPlayer);
				playerCollection.update({"playerID":playerID},{"$set":{"player_coin":playerCoin,"card_data":listPlayerCard}}, true, false);
			}
			response = {
				"result" : true,
				"message" : "Buy success",
				"card_store" : cardStore,
				"card_player" : cardPlayer,
				"player_coin" : playerCoin
			}
		}
	} else {
		response = {
			"result" : "false",
			"message" : "Not found card in store"
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
    playerCollection.update({"playerID":playerID},{"$set":{"card_data":playerCardData}});
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