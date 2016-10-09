//=========User Data Request Controller============//
require("share");
require("common");
var userFeedbackData = Spark.runtimeCollection("user_feedback");
var userNotice = Spark.runtimeCollection("user_notice");
var playerID = Spark.getPlayer().getPlayerId();
var playerData = playerCollection.findOne({"playerID":playerID});
var data = Spark.getData().data;
if(!data) data = {};
var timeNow = getTimeNow();

//update one signal player id
if (data.one_signal_player_id) {
	var response;
	if (data.userId) {
		playerCollection.update({"playerID":playerID}, {"$set":{"one_signal_player_id":data.userId}}, true, false);
		response = {
			"result"  : true,
			"message" : "Update one signal player id success"
		}
	} else {
		response = {
			"result"  : false,
			"message" : "Update one signal player id failure"
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
				    				"next_score" : getCardScore(cardData, cardData.current_level + 1),
									"next_energy" : getCardEnergy(cardData, cardData.current_level + 1),
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
	var playerExp = playerData.current_exp ? playerData.current_exp : 0;
	var response;
	if (packItem) {
		if (packItem.item_type == server_config.PACK_ITEM_TYPE.coin) {
			playerCoin += packItem.number;
			playerExp ++;
			var levelInfo = getPlayerLevelInfoByExp(playerExp);
			playerCollection.update({"playerID":playerID}, {"$set":{"player_coin":playerCoin, "current_exp":playerExp, "current_level":levelInfo.level}}, true, false);
			response = {
				"result" : true,
				"message" : "Buy success",
				"player_coin" : playerCoin,
				"level_info" : levelInfo
			};
		} else if (packItem.item_type == server_config.PACK_ITEM_TYPE.life) {
			if (playerCoin < packItem.cost) {
				response = {
					"result" : false,
					"message" : "Can't enough coin to buy"
				};
			} else {
				playerCoin -= packItem.cost;
				playerExp ++;
				var playerLife = playerData.player_life ? playerData.player_life : 0;
				playerLife += packItem.number;
				var levelInfo = getPlayerLevelInfoByExp(playerExp);
				playerCollection.update({"playerID":playerID}, {"$set":{"player_coin":playerCoin, "current_exp":playerExp, "current_level":levelInfo.level,"player_life":playerLife}}, true, false);
				response = {
					"result" : true,
					"message" : "Buy success",
					"player_life" : playerLife,
					"player_coin" : playerCoin,
					"level_info" : levelInfo
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
				"message" : "Not enough coin to buy this card"
			}
		} else if (cardStore.number >= cardStore.max_number) {
			response = {
				"result" : false,
				"message" : "Over number card can bought!"
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
				cardPlayer = cardMaster.findOne({"card_id":cardStore.card_id});
				cardPlayer.current_level = 1;
				cardPlayer.current_number = numberCard;
				cardPlayer = getCardFull(cardPlayer);
				var listPlayerCard = playerData.card_data ? playerData.card_data : [];
				listPlayerCard.push(cardPlayer);
				playerCollection.update({"playerID":playerID},{"$set":{"player_coin":playerCoin,"current_exp": playerExp, "current_level":levelInfo.level, "card_data":listPlayerCard}}, true, false);
			}
			response = {
				"result" : true,
				"message" : "Buy success",
				"card_store" : cardStore,
				"card_player" : cardPlayer,
				"player_coin" : playerCoin,
				"level_info" : levelInfo
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

//add feedback
if (data.user_feedback) {
	var title = data.title ? data.title : "User Feedback";
	var content = data.content ? data.content : "No feedback from user!";
	var feedback = {
		"playerID": playerID,
		"title"   : title,
		"feedback": content,
		"time"    : timeNow
	}
	userFeedbackData.insert(feedback);
	var response = {
		"result"   : true,
		"message"  : "Your feedback was sent!",
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
			"message": "Response success!"
		}
	} else {
		response = {
			"result"  : false,
			"message" : "Response failure!"
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
		"message" : "Add notice success!",
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
					"message" : "This chest opened. Can't open again!"
				}
			} else if (chestOpening) {
				response = {
					"result" : false,
					"message" : "Other chest is opening."
				}
			} else {
				chest.time_open = timeNow;
				playerData.chest_data["chest"+chest_id] = chest;
				playerCollection.update({"playerID":playerID},{"$set":{"chest_data":playerData.chest_data}}, true, false);
				response = {
					"result" : true,
					"message" : "Chest " + chest_id + " is opening."
				}
			}
		} else {
			response = {
				"result" : false,
				"message" : "Can't found chest"
			}
		}
	} else {
		response = {
			"result" : false,
			"message" : "Can't found chest"
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
			if (chestStatus.status == server_config.chest_status.locked.status) {
				response = {
					"result" : false,
					"message" : "This chest is locked!"
				}
			} else if (chestStatus.status == server_config.chest_status.opening.status) {
				if (useCoin) {
					if (!playerData.player_coin) playerData.player_coin = 0;
					var timeOut = chest.time_out;
					var timeOpen = chest.time_open;
					var timeNow2 = timeNow;
					var timeRemain = (chest.time_out - (timeNow - chest.time_open)) / 1000;
					var coinNeed = getCoinNeedToOpenChest(Math.ceil(timeRemain));
					if (playerData.player_coin < coinNeed) {
						response = {
							"result" : false,
							"message" : "Not enough coin to open this chest!"
						}
					} else {
						playerData.player_coin = playerData.player_coin - coinNeed;
						var listCardResult = _claimChest(chest);
						response = {
							"result" : true,
							"message": "Claim chest by coin success",
							"list_card": listCardResult
						}
					}
				} else {
					response = {
						"result" : false,
						"message" : "This chest is opening, please wait!"
					}
				}
			} else if (chestStatus.status == server_config.chest_status.opened.status) {
				var listCardResult = _claimChest(chest);
				response = {
					"result" : true,
					"message" : "Claim chest success",
					"list_card":listCardResult
				}
			}
		} else {
			response = {
				"result" : false,
				"message" : "Can't found chest"
			}
		}
	} else {
		response = {
			"result" : false,
			"message" : "Can't found chest"
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
	var player = data.player_id ? playerCollection.findOne({"playerID":player_id}) : playerData;
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
	delete chestData["chest"+chest.chest_id];
	cardArr.forEach(function(card) {
		var cardPlayer = getCardPlayer(playerID, card.card_id);
		if (cardPlayer) {
			cardPlayer.current_number += card.current_number;
			playerCollection.update({"$and":[{"playerID":playerID},{"card_data.card_id":cardPlayer.card_id}]},
			{"$set":{"card_data.$.current_number": cardPlayer.current_number, "player_coin":playerData.player_coin, "chest_data":chestData}}, true, false);
		} else {
			cardPlayer = cardMaster.findOne({"card_id":card.card_id});
			cardPlayer.current_level = 1;
			cardPlayer.current_number = card.current_number;
			cardPlayer = getCardFull(cardPlayer);
			var listPlayerCard = playerData.card_data ? playerData.card_data : [];
			listPlayerCard.push(cardPlayer);
			playerCollection.update({"playerID":playerID},{"$set":{"card_data":listPlayerCard, "player_coin" : playerData.player_coin},"$unset":{"chest_data":{chestKey:""}}}, true, false);
		}
		listCardResult.push(cardPlayer);
	});
	return listCardResult;
}