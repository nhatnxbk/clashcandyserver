//=========User Data Request Controller============//
require("common");
require("translate_text");
require("api");
require("GameString");
var userFeedbackData = Spark.runtimeCollection("user_feedback");
var userNotice = Spark.runtimeCollection("user_notice");
var playerID = Spark.getPlayer().getPlayerId();
var playerData = playerCollection.findOne({"playerID":playerID});
var lang = playerData.lang;
if(!lang) lang = "en";
var data = Spark.getData().data;
if(!data) data = {};
var timeNow = getTimeNow();

if(data.claim_reward){
    var id = data.id;
    var message_id = data.message_id;
    var reward = Spark.runtimeCollection("user_facebook_reward").findOne({"_id":{$oid : id}});
    if(reward){
        if(!reward.claim){
            reward.claim = true;
            playerData.player_coin = playerData.player_coin + reward.coin;
	        playerCollection.update({"playerID":playerID},{"$set":{"player_coin":playerData.player_coin}});
            Spark.runtimeCollection("user_facebook_reward").update({"_id":{$oid : id}}, reward,true,false);
            userNotice.remove({"_id":{$oid:message_id}})
            response = {
        		"result": true,
        		"message": getTextTranslation("You get ",lang) + reward.coin + " coin!",
        		"player_coin": playerData.player_coin,
        	}
        }else{
            response = {
        		"result": false,
        		"message": getTextTranslation("Reward was claimed!",lang),
        	}
        }
    }else{
        response = {
    		"result": false,
    		"message": getTextTranslation("Reward do not exist!",lang),
    	}
    }
    Spark.setScriptData("data", response);
}

if(data.log_facebook_invite){
    Spark.runtimeCollection("user_facebook_invite").insert({"playerID":playerID,"friends":data.friends})
}

if(data.get_lang_list){
    Spark.setScriptData("lang_list", getLangList());
    Spark.setScriptData("my_lang", playerData.lang ? playerData.lang : "en");
}

if(data.set_translate_data){
    var key = data.key;
    playerCollection.update({"playerID":playerID},{"$set":{"lang":key}},true,false);
    Spark.setScriptData("string_list", getGameString(key));
}

if(data.get_translate_data){
    var key = data.key;
    var lang = data.lang;
    var response = {};
    switch(key){
        case "tutorial_game_1":
            response.text1 = [
                getTextTranslation("Hello. My name is Ariel. I will be your guide.",lang),
                getTextTranslation("Welcome to the Ocean world. It's not peaceful. We must fight to live.",lang),
                getTextTranslation("Defeat your enemy to get reward. Now is battle.",lang)
            ];
            response.text2 = [
                getTextTranslation("This is your information: score, name.",lang),
                getTextTranslation("That is your enemy's information.",lang),
                getTextTranslation("And here is your target. When you reach target, game ends.",lang),
                getTextTranslation("Who have higher score will win.",lang),
                getTextTranslation("In the bottom is timer. If time runs out, game will end.",lang),
                getTextTranslation("Next is your deck. Each card has energy. When mana is enough, card will be active.",lang),
                getTextTranslation("You can only eat the sea animals that match the active Cards. If you eat, that Card will disappear.",lang),
                getTextTranslation("Oh, Enemy starts moving. Defeat him now!",lang)
            ];
            break;
        case "tutorial_game_two_target":
            response.text1 = [
                getTextTranslation("In this game, you and enemy have different targets.",lang),
                getTextTranslation("You must eat your target as fast as possible",lang),
                getTextTranslation("Remember: Do not eat enemy target!",lang),
            ];
            response.text2 = [
                getTextTranslation("This is your target.",lang),
                getTextTranslation("This is enemy's target.",lang),
                getTextTranslation("Tap the card that you don't use to make it disappeared.",lang),
                getTextTranslation("Oh, Enemy starts moving. Defeat him now!",lang)
            ];
            break;
         case "tutorial_game_target_ingredient":
            response.text1 = [
                getTextTranslation("In this game, you and enemy have different targets.",lang),
                getTextTranslation("You must move your target down to the bottom as fast as possible",lang),
                getTextTranslation("You CAN eat enemy's target to reduce his speed.",lang),
                getTextTranslation("Oh, Enemy starts moving. Defeat him now!",lang)
            ];
            break;
        case "tutorial_game_chest_first_received":
            response.text1 = [
                getTextTranslation("After winning a battle, you will receive one treasure", lang),
                getTextTranslation("There are 5 kinds of  treasure. Tap your treasure to open", lang)
            ];
            break;
        case "tutorial_game_chest_first_open_by_coin":
            response.text1 = [
                getTextTranslation("Wow, you receive another treasure. You can use coin to open this treasure immediately.", lang),
                getTextTranslation("Touch into this treasure to open immediately by coin.", lang)
            ];
            break;
        case "tutorial_game_upgrade_card":
        	response.text1 = [
                getTextTranslation("You have a Card List. Tap here to view.", lang),
                getTextTranslation("There are 3 kinds of card: Common, Rare and Epic", lang),
                getTextTranslation("The card can be upgraded. Tap the card you want to upgrade", lang),
                getTextTranslation("To upgrade a card, you need enough number of cards and coins. Tap here to upgrade card", lang),
                getTextTranslation("Your card is successfully upgraded. Tap here to close", lang)
            ];
            response.text2 = [
                getTextTranslation("You can purchase Card in the Store, tap here to visit the Store.", lang),
                getTextTranslation("Select the Card you want buy", lang),
                getTextTranslation("You can buy one or all of the Cards in the Store. Tap here to buy one Card.", lang),
                getTextTranslation("You have bought one Card, now we will go to battle", lang)
            ];
            break;
        default:
            break;
    }
    Spark.setScriptData("data", response);
}

//update player data
if (data.update_player_data) {
	var updatePlayerID = data.player_id ? data.player_id : playerID;
	var updatePlayerData = data.player_id && data.player_id != playerID ? playerCollection.findOne({"playerID":data.player_id}): playerData;
	if (data.facebook_id) {
		updatePlayerData.facebook_id = data.facebook_id;
	}
	if (data.facebook_friend) {
	    if(!updatePlayerData.facebook_friend) updatePlayerData.facebook_friend = [];
	    if(updatePlayerData.facebook_friend.length < data.facebook_friend.length){
	        var new_list = [];
	        for(var i in data.facebook_friend){
	            if(updatePlayerData.facebook_friend.indexOf(data.facebook_friend[i]) < 0){
	                new_list.push(data.facebook_friend[i]);
	            }
	        }
            var coin = (new_list.length * 100);
    	    var insert_reward = {"coin": coin,"playerID":playerID,"claim":false,"new_friend":new_list};
    	    Spark.runtimeCollection("user_facebook_reward").insert(insert_reward);
    	    var title = {"en": getTextTranslation("Reward",lang)};
        	var content = {"en" : getTextTranslation("You receive " ,lang)+" " + coin + " coins. " +getTextTranslation( "Because of inviting facebook friend success!" ,lang)};
        	var notice = {
        		"playerID": playerID,
        		"title"   : title,
        		"message" : content,
        		"action"  : "claim_coin",
        		"button_name"  : getTextTranslation("Claim",lang),
        		"reward_id": insert_reward._id.$oid,
        		"time"    : timeNow
        	}
        	userNotice.insert(notice);
	    }
	    updatePlayerData.facebook_friend = data.facebook_friend;
	}
	if (data.game_tutorial_step != undefined) {
	    updatePlayerData.game_tutorial_step = data.game_tutorial_step;
	}
	if (data.game_tutorial_sub_step != undefined) {
	    updatePlayerData.game_tutorial_sub_step = data.game_tutorial_sub_step;
	}
	if (data.one_signal_player_id != undefined) {
		updatePlayerData.one_signal_player_id = data.one_signal_player_id;
	}
	playerCollection.update({"playerID":updatePlayerID},{"$set":updatePlayerData}, true, false);
	Spark.setScriptData("data", {"result":true});
}

//update one signal player id
if (data.one_signal_player_id) {
	var response;
	if (data.userId) {
		playerCollection.update({"playerID":playerID}, {"$set":{"one_signal_player_id":data.userId}}, true, false);
		response = {
			"result"  : true,
			"message" : getTextTranslation("Update one signal player id success",lang)
		}
	} else {
		response = {
			"result"  : false,
			"message" : getTextTranslation("Update one signal player id failure",lang)
		}
	}
	Spark.setScriptData("data", response);
}

//change user name
if (data.change_user_name) {
	var response;
	var playerID = data.player_id ? data.player_id : playerID;
	if (data.userName && data.userName !== "") {
		playerCollection.update({"playerID":playerID},{$set:{"userName":data.userName}}, true, false);
		Spark.sendRequest({
			"@class" : ".ChangeUserDetailsRequest",
			"displayName" : data.userName
		});
		response = {
			"result": true,
			"message": getTextTranslation("Change name success!",lang)
		}
	} else {
		response = {
			"result": false,
			"message": getTextTranslation("Your name must not be empty!",lang)
		}
	}
	Spark.setScriptData("data", response);
}

//get player card data
if (data.get_card_data) {
    var cardData = playerData.card_data ? playerData.card_data : [];
    Spark.setScriptData("data", cardData);
}

//add coin
if (data.add_coin && data.number !== undefined) {
	var response;
	var playerCoin = playerData.player_coin ? parseInt(playerData.player_coin) : 0;
	playerData.player_coin = playerCoin + data.number;
	playerCollection.update({"playerID":playerID},{"$set":{"player_coin":playerData.player_coin}});
	response = {
		"result":true,
		"message": getTextTranslation("You get ",lang) + data.number + " coin!",
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
    			"message": getTextTranslation("You get ",lang) + data.number + " card!",
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
    var playerCoin = parseInt(playerData.player_coin);
    if (!playerData.current_exp) playerData.current_exp = 0;
    var response;
    for (var i = 0; i < playerCardData.length; i++) {
    	var cardData = playerCardData[i];
    	if (cardData.card_id == data.card_id) {
    		if (cardData.current_level < card_level_max) {
    			if (getCardNumberNeed(cardData.rarity, cardData.current_level + 1) > cardData.current_number) {
	    			response = {
	    				"result":false,
	    				"message": getTextTranslation("Do not have enough card to upgrade this card!",lang)
	    			}
	    		} else if (getCardCoinNeed(cardData.rarity, cardData.current_level + 1) > playerCoin) {
	    			response = {
	    				"result":false,
	    				"message":getTextTranslation("Do not have enough coin to upgrade this card!",lang)
	    			}
	    		} else {
	    				cardData.current_level = cardData.current_level + 1;
	    				playerData.player_coin = playerCoin - getCardCoinNeed(cardData.rarity, cardData.current_level);
	    				cardData.current_number = cardData.current_number - getCardNumberNeed(cardData.rarity, cardData.current_level);
	    				playerData.current_exp += getExpWhenUpgradeCard(cardData.rarity, cardData.current_level);
						var levelInfo = getPlayerLevelInfoByExp(playerData.current_exp);
	    				playerCollection.update({"playerID":playerID},{"$set":{"card_data":playerCardData, "player_coin":playerData.player_coin, "current_exp":playerData.current_exp, "current_level":levelInfo}});
	    				response = {
	    					"result":true,
	    					"message":getTextTranslation("Upgrade success!",lang),
	    					"card_data":
			    				{
				    				"card_id": cardData.card_id,
				    				"current_level": cardData.current_level,
				    				"current_number": cardData.current_number,
				    				"next_level" : cardData.current_level + 1,
				    				"next_score" : getCardScore(cardData, cardData.current_level + 1),
									"next_energy" : getCardEnergy(cardData, cardData.current_level + 1),
									"next_number" : getCardNumberNeed(cardData.rarity, cardData.current_level + 1),
									"coin_need" : getCardCoinNeed(cardData.rarity, cardData.current_level + 1)
				    			},
	    					"player_coin":playerData.player_coin,
	    					"level_info": levelInfo
	    				}
	    		}
    		} else {
    				response = {
    					"result":false,
    					"message":getTextTranslation("Your card is max level!",lang)
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
	var playerCoin = playerData.player_coin ? parseInt(playerData.player_coin) : 0;
	var playerExp = playerData.current_exp ? playerData.current_exp : 0;
	var response;
	if (packItem) {
		if (packItem.item_type == server_config.PACK_ITEM_TYPE.coin) {
			playerCoin += parseInt(packItem.number);
			playerExp ++;
			var levelInfo = getPlayerLevelInfoByExp(playerExp);
			playerCollection.update({"playerID":playerID}, {"$set":{"player_coin":playerCoin, "current_exp":playerExp, "current_level":levelInfo.level}}, true, false);
			response = {
				"result" : true,
				"message" : getTextTranslation("Buy success",lang),
				"player_coin" : playerCoin,
				"level_info" : levelInfo
			};
		} else if (packItem.item_type == server_config.PACK_ITEM_TYPE.life) {
			if (playerCoin < packItem.cost) {
				response = {
					"result" : false,
					"message" : getTextTranslation("Not enough coin to buy",lang)
				};
			} else {
				playerCoin -= parseInt(packItem.cost);
				playerExp ++;
				var playerLife = playerData.player_life ? playerData.player_life : 0;
				playerLife += packItem.number;
				var levelInfo = getPlayerLevelInfoByExp(playerExp);
				playerCollection.update({"playerID":playerID}, {"$set":{"player_coin":playerCoin, "current_exp":playerExp, "current_level":levelInfo.level,"player_life":playerLife}}, true, false);
				response = {
					"result" : true,
					"message" : getTextTranslation("Buy success",lang),
					"player_life" : playerLife,
					"player_coin" : playerCoin,
					"level_info" : levelInfo
				};
			}
		} else if (packItem.item_type == server_config.PACK_ITEM_TYPE.bomb) {
			if (playerCoin < packItem.cost) {
				response = {
					"result" : false,
					"message" : getTextTranslation("Not enough coin to buy",lang)
				};
			} else {
				playerCoin -= parseInt(packItem.cost);
				var playerBomb = playerData.player_bomb ? playerData.player_bomb : 0;
				playerBomb += packItem.number;
				playerCollection.update({"playerID":playerID}, {"$set":{"player_coin":playerCoin, "player_bomb":playerBomb}}, true, false);
				response = {
					"result" : true,
					"message" : getTextTranslation("Buy success",lang),
					"player_bomb" : playerBomb,
					"player_coin" : playerCoin
				};
			}
		}
	} else {
		response = {
			"result" : false,
			"message" : getTextTranslation("Item not found",lang)
		};
	}
	Spark.setScriptData("data", response);
}

//buy card
if (data.buy_card) {
	var card_id = data.card_id;
	var buy_all = data.buy_all ? data.buy_all : 0;
	var playerCoin = playerData.player_coin ? parseInt(playerData.player_coin) : 0;
	// dung hoac ko
	var playerExp = playerData.current_exp ? playerData.current_exp : 0;
	var cardStore = getCardStore(playerID, card_id);
	var cardPlayer = getCardPlayer(playerID, card_id);
	var response;
	if (cardStore) {
		var cost = buy_all ? cardStore.cost_all : cardStore.cost;
		if (playerCoin < cost) {
			response = {
				"result" : false,
				"message" : getTextTranslation("Not enough coin to buy this card",lang)
			}
		} else if (cardStore.number >= cardStore.max_number) {
			response = {
				"result" : false,
				"message" : getTextTranslation("Card is maximum!",lang)
			}
		} else {
			playerCoin -= cost;
			var numberCard = buy_all ? cardStore.max_number - cardStore.number : 1;
			playerExp += numberCard;
			cardStore.number += numberCard;
			cardStore.cost = getCardCost(cardStore.number, cardStore.card_rarity);
			cardStore.cost_all = getAllCardCost(cardStore.number, cardStore.card_rarity);
			var levelInfo = getPlayerLevelInfoByExp(playerExp);
			storeDaily.update({"$and":[{"playerID":playerID},{"pack_card.card_id":cardStore.card_id}]},
				{"$set":{"pack_card.$.number": cardStore.number, "pack_card.$.max_number": cardStore.max_number,
				"pack_card.$.cost": cardStore.cost, "pack_card.$.cost_all": cardStore.cost_all}}, true, false);
			if (cardPlayer) {
				cardPlayer.current_number += numberCard;
				playerCollection.update({"$and":[{"playerID":playerID},{"card_data.card_id":cardPlayer.card_id}]},
					{"$set":{"player_coin":playerCoin, "current_exp": playerExp, "current_level":levelInfo.level, "card_data.$.current_number": cardPlayer.current_number}}, true, false);
			} else {
				cardPlayer = cardMaster.findOne({"card_id":cardStore.card_id},{"card_score":0,"card_energy":0,"description":false});
				cardPlayer.current_level = 1;
				cardPlayer.current_number = numberCard;
				cardPlayer = getCardFull(cardPlayer,playerData.lang);
				var listPlayerCard = playerData.card_data ? playerData.card_data : [];
				listPlayerCard.push(cardPlayer);
				playerCollection.update({"playerID":playerID},{"$set":{"player_coin":playerCoin,"current_exp": playerExp, "current_level":levelInfo.level, "card_data":listPlayerCard}}, true, false);
			}
			response = {
				"result" : true,
				"message" : getTextTranslation("Buy success",lang),
				"card_store" : cardStore,
				"card_player" : cardPlayer,
				"player_coin" : playerCoin,
				"level_info" : levelInfo
			}
		}
	} else {
		response = {
			"result" : "false",
			"message" : getTextTranslation("Not found card in store",lang)
		}
	}
	Spark.setScriptData("data", response);
}

//add feedback
if (data.user_feedback) {
	var title = data.title ? data.title : getTextTranslation("User Feedback",lang);
	var content = data.content ? data.content : getTextTranslation("No feedback from user!",lang);
	var feedback = {
		"playerID": playerID,
		"title"   : title,
		"feedback": content,
		"time"    : timeNow
	}
	userFeedbackData.insert(feedback);
	var response = {
		"result"   : true,
		"message"  : getTextTranslation("Your feedback was sent!",lang),
		"feedback" : feedback
	}
	var userName = playerData.userName ? playerData.userName : "UserFeedback";
	var listAdmin = getAdmin();
	var message = content;
	if (!isAdmin()) {
		var push = SendNewNotification(listAdmin, [], [], {"en" : title}, {"en": message}, null).getResponseJson();
	}
	Spark.setScriptData("data",response);
}

//get feedback
if (data.get_user_feedback) {
	var feedback = getUserFeedback();
	playerCollection.update({"playerID":playerID}, {"$set": {"last_read":timeNow}}, true, false);
	Spark.setScriptData("data", feedback);
}

//get all feedback
if (data.get_all_feedback) {
	var limit = data.limit ? data.limit : 100;
	var feedbacks = userFeedbackData.find().limit(limit).sort({"response":1,"time":-1}).toArray();
	for (var i = 0; i < feedbacks.length; i++) {
		feedbacks[i].time = timeNow - feedbacks[i].time;
		feedbacks[i].type = 1;
		feedbacks[i].is_new = 0;
	}
	Spark.setScriptData("data", feedbacks);
}

//reponse feedback
if (data.response_feedback) {
	var feedbackID   = data.id ? data.id : 0;
	var responseData = data.response ? data.response : undefined;
	var response;
	var is_show_android_store = data.is_show_android_store;
	var is_show_ios_store = data.is_show_ios_store;
	if (feedbackID && responseData) {
		var feedbackPlayerID = userFeedbackData.findOne({"_id":{$oid:feedbackID}}).playerID;
		var oneSignalPlayerID = getOneSignalPlayerID(feedbackPlayerID);
		var saveData = {"response":responseData,"time":timeNow};
		if (oneSignalPlayerID) {
			var push = SendNewNotification([oneSignalPlayerID], [], [], {"en" : "Picachu Online Response Feedback"}, {"en" : responseData}, null).getResponseJson();
		}
		if(is_show_android_store){
			saveData.button_name = "Rate 5 star";
			saveData.url = "https://play.google.com/store/apps/details?id=com.SunnyMonkey.PikachuOnline";
		}
		if(is_show_ios_store){
			saveData.button_name = "Rate 5 star";
			saveData.url = "https://itunes.apple.com/vn/app/pukachi-online/id1068833233?mt=8";
		}
		userFeedbackData.update({"_id":{$oid:feedbackID}}, {"$set":saveData}, true, false);
		response = {
			"result" : true,
			"message": getTextTranslation("Response success!",lang)
		}
	} else {
		response = {
			"result"  : false,
			"message" : getTextTranslation("Response failure!",lang)
		}
	}
	Spark.setScriptData("data",response);
}

//add notice
if (data.add_notice) {
	var title = data.title ? data.title : {"en": "Pika Notice"};
	var content = data.content ? data.content : {"en" : "No have notice!"};
	var playerID = data.playerID ? data.playerID : "all";
	var notice = {
		"playerID": playerID,
		"title"   : title,
		"message" : content,
		"time"    : timeNow
	}
	userNotice.insert(notice);
	var response = {
		"result"  : true,
		"message" : getTextTranslation("Add notice success!",lang),
		"notice"  : notice
	}
	if (playerID == "all") {
	    //khi nao release bo comment
        SendNewNotification([], ["All"], [], title, content, null).getResponseJson();
	} else {
		var oneSignalPlayerID = getOneSignalPlayerID(playerID);
		if (oneSignalPlayerID) {
			var push = SendNewNotification([oneSignalPlayerID], [], [], title, content, null).getResponseJson();
		}
	}
	Spark.setScriptData("data",response);
}

//get notice without feedback
if (data.get_notice_without_feedback) {
	var notice = getNotice();
	playerCollection.update({"playerID":playerID}, {"$set": {"last_read":timeNow}}, true, false);
	Spark.setScriptData("data", notice);
}

//get all notice
if (data.get_notice) {
	var feedback = getUserFeedback();
	var notice = getNotice();
	var allNotice = feedback.concat(notice);
	allNotice.sort(function(a,b){
		return a.time - b.time;
	});
	var limit = isAdmin() ? NUM_NOTICE_ADMIN : NUM_NOTICE;
	allNotice = allNotice.slice(0, limit);
	playerCollection.update({"playerID":playerID}, {"$set": {"last_read":timeNow}}, true, false);
	Spark.setScriptData("data", allNotice);
}

//open chest
if (data.open_chest) {
	var chest_id = data.chest_id;
	var response;
	if (chest_id) {
		var chest = getPlayerChest(chest_id);
		if (chest) {
			var chestOpening = getChestOpening();
			if (timeNow - chest.time_open >= chest.time_out) {
				response = {
					"result" : false,
					"message" : getTextTranslation("This chest opened. Can't open again!",lang)
				}
			} else if (chestOpening) {
				response = {
					"result" : false,
					"message" : getTextTranslation("Other chest is opening.",lang)
				}
			} else {
				chest.time_open = timeNow;
				playerData.chest_data["chest"+chest_id] = chest;
				playerCollection.update({"playerID":playerID},{"$set":{"chest_data":playerData.chest_data}}, true, false);
				response = {
					"result" : true,
					"message" : getTextTranslation("Chest " + chest_id + " is opening.",lang)
				}
			}
		} else {
			response = {
				"result" : false,
				"message" : getTextTranslation("Can't found chest",lang)
			}
		}
	} else {
		response = {
			"result" : false,
			"message" : getTextTranslation("Can't found chest",lang)
		}
	}
	Spark.setScriptData("data", response);
}

//claim chest
if (data.claim_chest) {
	var chest_id = data.chest_id;
	var useCoin = data.use_coin ? data.use_coin : false;
	var response;
	if (chest_id) {
		var chest = getPlayerChest(chest_id);
		if (chest) {
			var chestStatus = getChestStatus(chest);
			if (chestStatus.status == server_config.chest_status.locked.status && !useCoin) {
				response = {
					"result" : false,
					"message" : getTextTranslation("This chest is locked!",lang)
				}
			} else if (chestStatus.status == server_config.chest_status.opened.status) {
				var listCardResult = _claimChest(chest);
				response = {
					"result" : true,
					"message" : getTextTranslation("Claim chest success",lang),
					"list_card":listCardResult
				}
			} else {
				if (useCoin) {
					if (!playerData.player_coin) playerData.player_coin = 0;
					var timeRemain = chest.time_open ? (chest.time_out - (timeNow - chest.time_open)) / 1000 : chest.time_out / 1000;
					var coinNeed = getCoinNeedToOpenChest(Math.ceil(timeRemain));
					if (playerData.player_coin < coinNeed) {
						response = {
							"result" : false,
							"message" : getTextTranslation("Not enough coin to open this chest!",lang)
						}
					} else {
						playerData.player_coin = playerData.player_coin - coinNeed;
						var listCardResult = _claimChest(chest);
						response = {
							"result" : true,
							"message": getTextTranslation("Claim chest by coin success",lang),
							"list_card": listCardResult,
							"player_coin": playerData.player_coin
						}
					}
				} else {
					response = {
						"result" : false,
						"message" : getTextTranslation("This chest is opening, please wait!",lang)
					}
				}
			}
		} else {
			response = {
				"result" : false,
				"message" : getTextTranslation("Can't found chest",lang)
			}
		}
	} else {
		response = {
			"result" : false,
			"message" : getTextTranslation("Can't found chest",lang)
		}
	}
	Spark.setScriptData("data", response);
}

//get chest data
if (data.get_chest_data) {
	var response;
	var player = data.player_id ? playerCollection.findOne({"playerID":data.player_id}) : playerData;
	var chestData = player ? player.chest_data : undefined;
	if (chestData) {
		for (var i = 1; i < 5; i++) {
			var chest = chestData["chest"+i];
		    if (chest) {
		      chest.status = getChestStatus(chest);
		      chest.time_remain = chest.time_open ? (chest.time_out - (timeNow - chest.time_open)) / 1000
		          : chest.time_out / 1000;
		    }
		}
	}
	response = {
		"result": true,
		"message": getTextTranslation("Get chest data success!",lang),
		"chest_data" : chestData
	}
	Spark.setScriptData("data", response);
}

//get store data
if (data.get_store_data) {
	var response;
	var player_id = data.player_id ? data.player_id : playerID;
	var storeData = getStoreInfo(player_id);
	response = {
		"result": true,
		"store": storeData
	}
	Spark.setScriptData("data", response);
}

// get data for scene main (store_data, chest_data)
if (data.get_data_for_main) {
	var player = data.player_id ? playerCollection.findOne({"playerID":data.player_id}) : playerData;
	var storeData = getStoreInfo(data.player_id ? data.player_id : playerID);
	var chestData = player && player.chest_data ? player.chest_data : {};
	if (chestData) {
		for (var i = 1; i < 5; i++) {
			var chest = chestData["chest"+i];
		    if (chest) {
		      chest.status = getChestStatus(chest);
		      chest.time_remain = chest.time_open ? (chest.time_out - (timeNow - chest.time_open)) / 1000
		          : chest.time_out / 1000;
		    }
		}
	}
	var response = {
		"store": storeData,
		"chest_data": chestData,
		"result": true
	}
	Spark.setScriptData("data", response);
}

//get coin need to open chest now
if (data.get_chest_data_to_open_now) {
	var chestID = data.chest_id ? data.chest_id : 0;
	var player = data.player_id ? playerCollection.findOne({"playerID":data.player_id}) : playerData;
	var chestData = player ? player.chest_data : undefined;
	var response = {
		"result": false,
		"message": getTextTranslation("Can not found this chest",lang)
	}
	if (chestData) {
		var chest = chestData["chest"+chestID];
		if (chest) {
			var timeRemain = chest.time_open ? (chest.time_out - (timeNow - chest.time_open)) / 1000
		          : chest.time_out / 1000;
		    var coinNeed = getCoinNeedToOpenChest(timeRemain);
		    response = {
		    	"result": true,
		    	"message": getTextTranslation("Get coin need to open chest success",lang),
		    	"coin_need": coinNeed,
		    	"time_remain": timeRemain
		    }
		}
	}
	Spark.setScriptData("data", response);
}

if (data.get_game_string) {
	var lang = playerData.lang ? playerData.lang : "en";
	var gameString = getGameString(lang);
	Spark.setScriptData("string_list", gameString);
}

//=====================RQ debug======================//
if(data.debug_some_thing){
    Spark.setScriptData("data", getGameString("vi"));
}

if (data.debug_clear_cache) {
    Spark.getCache().removeAll();
    Spark.setScriptData("data", {"result":true, "message": "Clear cache success"});
}

if(data.debug_test_unity_ads_api){
    
    
if(isSandbox()){
    var list = JSON.parse(csvJSON(GetUnityAdsToday()));
    var text = "====================================\n";
    var log_money = Spark.runtimeCollection("log_money");
    var last_log = log_money.findOne();
    var total_money = 0;
    for(var i in list){
        var money = parseFloat(list[i]["revenue"].replace("\"","").replace("\"",""));
        total_money += money;
        if(money > 1){
            text += list[i]["Source game name"].replace("\"","").replace("\"","") + " " 
            + "\nView: " + list[i]["views"].replace("\"","").replace("\"","") 
            + " Money: " + money + "$"+"\n";
        }
    }
    
    if( (total_money - last_log.money > 1) || total_money < last_log.money){
        log_money.update({}, {"$set":{money:total_money,time:getTimeNow()}},true,false);
        text += " <https://dashboard.unityads.unity3d.com/|Detail>";
        var status = SendSlack(text + " <!here>").getResponseString();
        Spark.setScriptData("data", status + text);
    }
}

}

if (data.debug_reset_user_data) {
	var response = {
		"result" : true,
		"message" : "Reset user data success!"
	}
	var updatePlayerData = {
		"online_win": 0,
		"online_lose":0,
		"chest_data": {},
		"card_data": [],
		"player_coin": 0,
		"init_player_coin": false,
		"game_tutorial_step": 0,
		"online_bot_start":0,
		"online_match_start":0,
		"current_level":1,
		"current_exp":0,
		"trophies":0,
		"highest_trophy":0
	}
	playerCollection.update({"playerID":playerID},{"$set":updatePlayerData}, true, false);
	Spark.setScriptData("data",response);
}

if (data.debug_add_card) {
	var number = data.number ? data.number : 500;
	var cardID = data.card_id ? data.card_id : -1;
    var playerCardData = playerData.card_data ? playerData.card_data : [];
    var response;
    var cardDataMaster = cardMaster.find({},{"card_score":0,"card_energy":0,"description":false}).toArray();
    if (cardID == -1) {
    	for (var i = 0; i < cardDataMaster.length; i++) {
    		var isAdded = false;
    		for (var j = 0; j < playerCardData.length; j++) {
    			if (cardDataMaster[i].card_id == playerCardData[j].card_id) {
    				playerCardData[j].current_number = playerCardData[j].current_number + number;
    				isAdded = true;
    			}
    		}
    		if (!isAdded) {
    			var card = cardDataMaster[i];
				card.current_level = 1;
				card.current_number = number;
				playerCardData.push(card);
    		}
    	}
    } else {
    	var isAdded = false;
    	for (var i = 0; i < playerCardData.length; i++) {
	    	var cardData = playerCardData[i];
	    	if (cardData.card_id == cardID) {
		    	cardData.current_number += number;
		    	isAdded = true;
	    	}
	    }
	    if (!isAdded) {
	    	var cardData = cardMaster.findOne({"card_id":cardID},{"card_score":0,"card_energy":0,"description":false});
	    	if (cardData) {
	    		cardData.current_number = number;
	    		cardData.current_level = 1;
	    		playerCardData.push(cardData);
	    	}
	    }
    }
    
    playerCollection.update({"playerID":playerID},{"$set":{"card_data":playerCardData}});
    response = {
    	"result":true,
    	"message": getTextTranslation("You have got " + number + " card for each kind!",lang),
  		"card_data": getListCardFull(playerCardData,playerData.lang)
  	}

    Spark.setScriptData("data", response);
}

if (data.debug_reset_card) {
	var cardData = cardMaster.find({"card_default":1},{"card_score":0,"card_energy":0,"description":false}).toArray();
	for(var i = 0; i < cardData.length; i++) {
		var card = cardData[i];
		card.current_level = 1;
		card.current_number = 1;
	}
	playerCollection.update({"playerID":playerID},{"$set":{"card_data":cardData}});
	var response = {
    	"result":true,
    	"message": getTextTranslation("Reset card success",lang),
  		"card_data": getListCardFull(cardData,playerData.lang)
  	}
	Spark.setScriptData("data", response);
}

if (data.debug_get_chest) {
	var chest_type = data.chest_type ? data.chest_type : 0;
	var chestDataMaster = chest_type ? getChestDataMasterByType(chest_type) : getChestDataMasterByProbability();
	var chestData = getChestData(chestDataMaster);
	Spark.setScriptData("data", chestData);
}

if (data.debug_add_chest) {
	var player_id = data.player_id ? data.player_id : playerID;
	var chest_type = data.chest_type ? data.chest_type : 0;
	var chestDataMaster = chest_type ? getChestDataMasterByType(chest_type) : getChestDataMasterByProbability();
	var chestData = getChestData(chestDataMaster);
	var result = addChestToPlayer(player_id, chestData);
	var response = {
		"result" : result,
		"chestData" : chestData
	}
	Spark.setScriptData("data", response);
}

if (data.debug_get_player_chest_status) {
	var player = data.player_id ? playerCollection.findOne({"playerID":data.player_id}) : playerData;
	var playerChest = player.chest_data;
	var response;
	if (playerChest) {
		if (playerChest.chest1) {
			delete playerChest.chest1.card;
			playerChest.chest1.status = getChestStatus(playerChest.chest1);
		}
		if (playerChest.chest2) {
			delete playerChest.chest2.card;
			playerChest.chest2.status = getChestStatus(playerChest.chest2);
		}
		if (playerChest.chest3) {
			delete playerChest.chest3.card;
			playerChest.chest3.status = getChestStatus(playerChest.chest3);
		}
		if (playerChest.chest4) {
			delete playerChest.chest4.card;
			playerChest.chest4.status = getChestStatus(playerChest.chest4);
		}
		response = {
			"result" : true,
			"chest_data": playerChest
		}
	} else {
		response = {
			"result" : false,
			"message" : "Not found player chest"
		}
	}
	Spark.setScriptData("data", response);
}

if(data.debug_gs_disconnect) {
    Spark.getPlayer().disconnect(true);
}

if (data.debug_add_card_master) {
	// var card_id = 8;
	// for (var i = 1; i < 6; i++) {
	// 	for(var j = i+1; j < 7; j++) {
	// 		var cardData = {
	// 			"card_id": card_id,
	// 			"type": 1,
	// 			"rarity": 2,
	// 			"current_level": 1,
	// 			"current_number": 0,
	// 			"card_default": 0,
	// 			"color_id1": i,
	// 			"color_id2": j,
	// 			"card_energy" : [60,58,56,54,52,50,47,44,40,33],
	// 			"card_score" : [25,30,35,40,45,55,65,75,85,100]
	// 		}
	// 		cardMaster.insert(cardData);
	// 		card_id++;
	// 	}
	// }
}

if(data.debug_send_slack){
    var mes = data.message;
    Spark.setScriptData("data",SendSlack(mes).getResponseJson());
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

function isVN() {
  return (playerData.location && playerData.location.country == "VN") ? true : false;
}

function isAdmin() {
  if (LIST_ADMIN.indexOf(playerID) != -1) {
    return 1;
  }
  return 0;
}

function getAdmin() {
	var listAdmin = playerCollection.find({"playerID":{"$in": LIST_ADMIN}}).toArray();
	var adminsPush = [];
	for (var i = 0; i < listAdmin.length; i++) {
		if (listAdmin[i].one_signal_player_id) {
			adminsPush.push(listAdmin[i].one_signal_player_id);
		}
	}
	return adminsPush;
}

function getOneSignalPlayerID(player_id) {
	var player = playerCollection.findOne({"playerID":player_id});
	return player ? player.one_signal_player_id : "";
}

function getNotice () {
	var notice = userNotice.find({$and:[{$or:[{"playerID":"all"},{"playerID":playerID}]}, {"time":{"$lt":timeNow}}]}).limit(NUM_NOTICE).sort({"time":-1}).toArray();
	var lastTimeRead = playerData.last_read ? playerData.last_read : 0;
	var isVN = playerData.location && playerData.location.country && playerData.location.country == "VN" ? true : false;
	for (var i = 0; i < notice.length; i++) {
		notice[i].is_new = notice[i].time >= lastTimeRead ? 1 : 0;
		notice[i].time = timeNow - notice[i].time;
		notice[i].title = isVN && notice[i].title.vi ? "Notice: " + notice[i].title.vi : "Notice: " + notice[i].title.en;
		notice[i].message = isVN && notice[i].message.vi ? "Notice: " + notice[i].message.vi : "Notice: " + notice[i].message.en;
		notice[i].type = 0;
	}
	return notice;
}

function getUserFeedback () {
	var feedbacks;
	if (isAdmin()) {
		feedbacks = userFeedbackData.find({"time":{"$lt":timeNow}}).limit(NUM_NOTICE_ADMIN).sort({"response":1,"time":-1}).toArray();
	} else {
		feedbacks = userFeedbackData.find({"playerID":playerID}).limit(NUM_NOTICE).sort({"time":-1}).toArray();
	}
	var lastTimeRead = playerData.last_read ? playerData.last_read : 0;
	for (var i = 0; i < feedbacks.length; i++) {
		var feedback = feedbacks[i];
		feedback.is_new = feedback.time >= lastTimeRead ? 1 : 0;
		feedback.time = timeNow - feedback.time;
		feedback.type = 1;
		if (isAdmin()) {
			var userFeedback = playerCollection.findOne({"playerID":feedback.playerID});
			var userSys = playerDataSys.findOne({"_id":{"$oid":feedback.playerID}});
			feedback.feedback = feedback.feedback + "\n"
			+ "UserName : " + userFeedback.userName + ". "
			+ "Trophies : " + userFeedback.trophies + ". "
			+ "Total Win : " + userFeedback.online_win + ". "
			+ "Online match : " + userFeedback.online_match_start + ". "
			+ "Bot match : " + userFeedback.online_bot_start + ". "
			+ "OS : " + userSys.userName;
		}
	}
	return feedbacks;
}

function getPlayerChest(chest_id) {
	if (!playerData.chest_data) playerData.chest_data = {};
	return playerData.chest_data["chest"+chest_id];
}

function getChestOpening() {
	var chestData = playerData.chest_data;
	if (chestData) {
		if (chestData.chest1 && chestData.chest1.time_open && timeNow - chestData.chest1.time_open < chestData.chest1.time_out) {
			return chestData.chest1;
		}
		if (chestData.chest2 && chestData.chest2.time_open && timeNow - chestData.chest2.time_open < chestData.chest2.time_out) {
			return chestData.chest2;
		}
		if (chestData.chest3 && chestData.chest3.time_open && timeNow - chestData.chest3.time_open < chestData.chest3.time_out) {
			return chestData.chest3;
		}
		if (chestData.chest4 && chestData.chest4.time_open && timeNow - chestData.chest4.time_open < chestData.chest4.time_out) {
			return chestData.chest4;
		}
		// if (chestData.chest1 && chestData.chest1.status == server_config.chest_status.opening.status) {
		// 	return chestData.chest1;
		// }
		// if (chestData.chest2 && chestData.chest2.status == server_config.chest_status.opening.status) {
		// 	return chestData.chest2;
		// }
		// if (chestData.chest3 && chestData.chest3.status == server_config.chest_status.opening.status) {
		// 	return chestData.chest3;
		// }
		// if (chestData.chest4 && chestData.chest4.status == server_config.chest_status.opening.status) {
		// 	return chestData.chest4;
		// }
	}
	return undefined;
}

function _claimChest(chest) {
	var listCardResult = [];
	var cardArr = chest.card;
	var chestData = playerData.chest_data;
	var listPlayerCard = playerData.card_data ? playerData.card_data : [];
	for (var j = 0 ; j < cardArr.length; j++) {
		var card = cardArr[j];
		var cardPlayer = undefined;
		for (var i = 0; i < listPlayerCard.length; i++) {
			if (listPlayerCard[i].card_id == card.card_id) {
				cardPlayer = listPlayerCard[i];
				cardPlayer.current_number += card.current_number;
				break;
			}
		}
		if (cardPlayer == undefined) {
			cardPlayer = cardMaster.findOne({"card_id":card.card_id},{"card_score":0,"card_energy":0,"description":false});
			cardPlayer.current_level = 1;
			cardPlayer.current_number = card.current_number;
			listPlayerCard.push(cardPlayer);
		}
		cardPlayer = getCardFull(cardPlayer,playerData.lang);
		cardPlayer.added_number = card.current_number;
		listCardResult.push(cardPlayer);
	}
	delete chestData["chest"+chest.chest_id];
	playerCollection.update({"playerID":playerID},{"$set":{"player_coin":playerData.player_coin,"card_data":listPlayerCard,"chest_data":chestData}}, true, false);
	var claimChestLog = {
		"playerID": playerID,
		"reg_date": timeNow,
		"list_card": listCardResult
	}
	userClaimChestLog.insert(claimChestLog);
	return listCardResult;
}