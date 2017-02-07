//===========common function================//
require("share");
var levelMaster = Spark.metaCollection("level_master");
var playerCollection = Spark.runtimeCollection("playerData");
var playerDataSys = Spark.systemCollection("player");
var storeMaster = Spark.metaCollection("store_master");
var storeDaily = Spark.runtimeCollection("store_daily");
var cardMaster = Spark.metaCollection("card_master");
var chestMaster = Spark.metaCollection("chest_master");
var timeNow = getTimeNow();

function SendNewNotification(include_player_ids, included_segments, excluded_segments, title, message, data) {
  var jsonBody = {
    "app_id": "b2c8f180-b9b8-4ab6-85e2-cd6c8c1c02e7",
    "excluded_segments": excluded_segments,
    "headings" : title,
    "contents" : message
  };
  if (include_player_ids.length > 0) {
      jsonBody.include_player_ids = include_player_ids;
  }
  if (included_segments.length > 0) {
      jsonBody.included_segments = included_segments;
  }
  if (data) {
    jsonBody.data = data;
  }
   var promise = Spark.getHttp("https://onesignal.com/api/v1/notifications").setHeaders({
    "Content-Type": "application/json;charset=utf-8",
    "Authorization": "Basic MGJkOWRjZTAtZGU5Mi00Njk1LTgwYWMtNDUwMWI0NmNiODc3"
  }).postJson(jsonBody);
  return promise;
}

function getPlayerLevelInfo(playerID) {
	var levelInfo = {};
	var playerData = playerCollection.findOne({"playerID":playerID});
	if(playerData == null) playerData = {};
	var currentExp = playerData.current_exp ? playerData.current_exp : 0;
	var levelArr = levelMaster.find({"exp":{"$gt":currentExp}}).sort({"level":1}).toArray();
	if (levelArr.length > 0) {
	  var nextLevel = levelArr[0];
	  levelInfo.level = nextLevel.level > 1 ? nextLevel.level - 1 : 1;
	  levelInfo.current_exp = currentExp;
	  levelInfo.next_exp = nextLevel.exp;
	}
	return levelInfo;
}

function getPlayerLevelInfoByExp(currentExp) {
	var levelInfo = {};
	var levelArr = levelMaster.find({"exp":{"$gt":currentExp}}).sort({"level":1}).toArray();
	if (levelArr.length > 0) {
	  var nextLevel = levelArr[0];
	  levelInfo.level = nextLevel.level > 1 ? nextLevel.level - 1 : 1;
	  levelInfo.current_exp = currentExp;
	  levelInfo.next_exp = nextLevel.exp;
	}
	return levelInfo;
}

function getStoreInfo(playerID) {
	var storeInfo = {};
	var packCoin = storeMaster.find({"item_type":server_config.PACK_ITEM_TYPE.coin}).toArray();
	var packLife = storeMaster.find({"item_type":server_config.PACK_ITEM_TYPE.life}).toArray();
	// var packBomb = storeMaster.find({"item_type":server_config.PACK_ITEM_TYPE.bomb}).toArray();
	storeInfo.pack_coin = packCoin;
	storeInfo.pack_life = packLife;
	// storeInfo.pack_bomb = packBomb;
	var packDaily = storeDaily.findOne({"playerID":playerID});
	if (packDaily && timeNow - packDaily.time < 5*60*1000) {
		storeInfo.pack_card = packDaily.pack_card;
	} else {
		var listCard = cardMaster.find().toArray();
		var lastListCard = packDaily && packDaily.pack_card ? packDaily.pack_card : [];
		var lastListCardID = [];
		lastListCard.forEach(function(card){
			lastListCardID.push(card.card_id);
		});
		var packCard = [];
		var listCardLength = listCard.length;
		while(packCard.length < 3) {
			var idx = Math.floor(Math.random()*listCardLength);
			var card = listCard[idx];
			if (lastListCardID.indexOf(card.card_id) == -1) {
				var maxNumber = getCardNumberMaxCanBuy(card.rarity);
				var costDefault = getDefaultCardCost(card.rarity);
				var costAll = getAllCardCost(0, card.rarity);
				var cardStore = {
					"item_type"   : server_config.PACK_ITEM_TYPE.card,
					"card_id"     : card.card_id,
					"color_id"    : card.color_id,
					"card_type"   : card.type,
					"color_id1"   : card.color_id1 ? card.color_id1 : 0,
					"color_id2"   : card.color_id2 ? card.color_id2 : 0,
					"card_rarity" : card.rarity,
					"number"      : 0,
					"max_number"  : maxNumber,
					"cost"        : costDefault,
					"cost_all"    : costAll
				};
				packCard.push(cardStore);
				lastListCardID.push(card.card_id);
			}
		}
		if (packDaily) {
			storeDaily.update({"playerID":playerID},{"$set":{"pack_card":packCard,"time":timeNow}}, true, false);
		} else {
			storeDaily.insert({"playerID":playerID,"pack_card":packCard,"time":timeNow});
		}
		storeInfo.pack_card = packCard;
	}
	return storeInfo;
}

function getListCardFull(list_card) {
	list_card.forEach(function(card){
		card = getCardFull(card);
	});
	return list_card;
}

function getCardFull(card) {
	card.current_score = getCardScore(card, card.current_level);
	card.current_energy = getCardEnergy(card, card.current_level);
	card.next_level = card.current_level < card_level_max ? card.current_level + 1 : card.current_level;
	card.next_score = getCardScore(card, card.next_level);
	card.next_energy = getCardEnergy(card, card.next_level);
	card.next_number = getCardNumberNeed(card.rarity, card.next_level);
	card.coin_need = getCardCoinNeed(card.rarity, card.next_level);
	return card;
}

function getCardStore(playerID, cardID) {
	var cardStore = storeDaily.findOne({"playerID":playerID});
	var cardData = cardStore ? cardStore.pack_card : [];
	if (cardData) {
		for (var i = 0; i < cardData.length; i++) {
			if (cardData[i].card_id == cardID) {
				return cardData[i];
			}
		}
	}
	return undefined;
}

function getCardPlayer(playerID, cardID) {
	var playerData = playerCollection.findOne({"playerID":playerID});
	var listCard = playerData.card_data ? playerData.card_data : [];
	for (var i = 0; i < listCard.length; i++) {
		if (listCard[i].card_id == cardID) {
			return listCard[i];
		}
	}
	return undefined;
}

function getCardScore(card, level) {
	return level <= card_level_max && level > 0 ? card.card_score[level - 1] : card.card_score[0];
}

function getCardEnergy(card, level) {
	return level <= card_level_max && level > 0 ? card.card_energy[level - 1] : card.card_energy[0];
}

function getCardNumberNeed(rarity, level) {
	switch (rarity) {
		case 1:
			return level <= card_level_max && level > 0 ? card_number_need_rarity_common[level - 1] : card_number_need_rarity_common[0];
		case 2:
			return level <= card_level_max && level > 0 ? card_number_need_rarity_rare[level - 1] : card_number_need_rarity_rare[0];
		case 3:
			return level <= card_level_max && level > 0 ? card_number_need_rarity_epic[level - 1] : card_number_need_rarity_epic[0];
		default:
			return level <= card_level_max && level > 0 ? card_number_need_rarity_common[level - 1] : card_number_need_rarity_common[0];
	}
}

function getCardCoinNeed(rarity, level) {
	switch (rarity) {
		case 1:
			return level <= card_level_max && level > 0 ? card_coin_need_rarity_common[level - 1] : card_coin_need_rarity_common[0];
		case 2:
			return level <= card_level_max && level > 0 ? card_coin_need_rarity_rare[level - 1] : card_coin_need_rarity_rare[0];
		case 3:
			return level <= card_level_max && level > 0 ? card_coin_need_rarity_epic[level - 1] : card_coin_need_rarity_epic[0];
		default:
			return level <= card_level_max && level > 0 ? card_coin_need_rarity_common[level - 1] : card_coin_need_rarity_common[0];
	}
}

function getCardNumberMaxCanBuy(rarity) {
	switch (rarity) {
		case 1:
			return server_config.max_number_card_common_store;
		case 2:
			return server_config.max_number_card_rare_store;
		case 3:
			return server_config.max_number_card_epic_store;
		default:
			return server_config.max_number_card_common_store;
	}
}

function getDefaultCardCost(rarity) {
	switch (rarity) {
		case 1:
			return server_config.default_cost_card_common;
		case 2:
			return server_config.default_cost_card_rare;
		case 3:
			return server_config.default_cost_card_epic;
		default:
			return server_config.default_cost_card_rare;
	}
}

function getCardCost(currentNumber, rarity) {
	var costDefault = getDefaultCardCost(rarity);
	return costDefault * (currentNumber + 1);
}

function getAllCardCost(currentNumber, rarity) {
	var costTotal = 0;
	var costDefault = getDefaultCardCost(rarity);
	var maxNumber = getCardNumberMaxCanBuy(rarity);
	for (var i = currentNumber + 1; i <= maxNumber; i++) {
		costTotal += costDefault * i;
	}
	return costTotal;
}

function getCoinBattleWin(playerID) {
	var playerData = playerCollection.findOne({"playerID":playerID});
	var level = playerData.current_level ? playerData.current_level : 1;
	return level > 0 && level <= server_config.coin_battle_win.length ? server_config.coin_battle_win[level - 1] : server_config.coin_battle_win[0];
}

function getExpBattleWin() {
	var playerData = playerCollection.findOne({"playerID":playerID});
	var level = playerData.current_level ? playerData.current_level : 1;
	return level > 0 && level <= server_config.exp_battle_win.length ? server_config.exp_battle_win[level - 1] : server_config.exp_battle_win[0];
}

function getExpBattleLose() {
	var playerData = playerCollection.findOne({"playerID":playerID});
	var level = playerData.current_level ? playerData.current_level : 1;
	return level > 0 && level <= server_config.exp_battle_lose.length ? server_config.exp_battle_lose[level - 1] : server_config.exp_battle_lose[0];
}

function getChestDataMasterByProbability(probability) {
	if (probability === undefined) {
		probability = Math.floor(Math.random() * 100);
	}
	var chestMasterArr = chestMaster.find().toArray();
	for (var i = 0; i < chestMasterArr.length; i++) {
		var chestDataMaster = chestMasterArr[i];
		if (chestDataMaster.probability_start <= probability && probability < chestDataMaster.probability_end) {
			return chestDataMaster;
		}
	}
}

function getChestDataMasterByType(type) {
	var chestDataMaster = chestMaster.findOne({"type":type});
	return chestDataMaster;
}

//chest data get from chest master
function getChestData(chestDataMaster) {
	var chestData;
	var listCard = [];
	var listCardID = [];
	// var listCardRarity = [];
	var totalNumberCard = 0;
	while(totalNumberCard < chestDataMaster.number_card) {
		var cardResult = {};
		var cardRewardMaster = getCardByProbability(chestDataMaster.card);
		var listCardMaster = cardMaster.find({"rarity":cardRewardMaster.rarity}).toArray();
		var idx = Math.floor(Math.random() * listCardMaster.length);
		var card = listCardMaster[idx];
		if (listCardID.indexOf(card.card_id) != -1) {
			continue;
		}
		var number = Math.ceil(Math.random() * cardRewardMaster.number_card_max);
		if (totalNumberCard + number > chestDataMaster.number_card) {
			number = chestDataMaster.number_card - totalNumberCard;
		}
		card.current_level = 1;
		card.current_number = number;
		card = getCardFull(card);
		totalNumberCard += number;
		listCard.push(card);
		listCardID.push(card.card_id);
	}
	chestData = {
		"type": chestDataMaster.type,
		"description" : chestDataMaster.description,
		"time_out" : chestDataMaster.time,
		"card" : listCard
	}
	return chestData;
}

function getCardByProbability(listCard) {
	var probability = Math.floor(Math.random() * 100);
	for (var i = 0; i < listCard.length; i++) {
		if (listCard[i].probability_start <= probability && probability < listCard[i].probability_end) {
			return listCard[i];
		}
	}
}

function addChestToPlayer(playerID, chestData) {
	var playerData = playerCollection.findOne({"playerID":playerID});
	var message;
	if (!playerData.chest_data) playerData.chest_data = {};
	if (!playerData.chest_data.chest1) {
		chestData.chest_id = 1;
		playerData.chest_data.chest1 = chestData;
		message = "Add chest to chest slot 1";
	} else if (!playerData.chest_data.chest2) {
		chestData.chest_id = 2;
		playerData.chest_data.chest2 = chestData;
		message = "Add chest to chest slot 2";
	} else if (!playerData.chest_data.chest3) {
		chestData.chest_id = 3;
		playerData.chest_data.chest3 = chestData;
		message = "Add chest to chest slot 3";
	} else if (!playerData.chest_data.chest4) {
		chestData.chest_id = 4;
		playerData.chest_data.chest4 = chestData;
		message = "Add chest to chest slot 4";
	} else {
		message = "Chest slot full, can not add chest";
	}
	playerCollection.update({"playerID":playerID},{"$set":{"chest_data":playerData.chest_data}}, true, false);
	return message;
}

function addChestToPlayerAfterBattle(playerData) {
	var chestDataMaster = getChestDataMasterByProbability();
	var chestData = getChestData(chestDataMaster);
	chestData.status = server_config.chest_status.locked;
	chestData.time_remain = chestData.time_out / 1000;
	var result;
	if (!playerData.chest_data) playerData.chest_data = {};
	if (!playerData.chest_data.chest1) {
		chestData.chest_id = 1;
		playerData.chest_data.chest1 = chestData;
		result = {
			"result"     : true,
			"message"    : "Add chest to chest slot 1",
			"chest_id"   : 1,
			"type" 		 : chestData.type,
			"chest_data" : chestData
		}
	} else if (!playerData.chest_data.chest2) {
		chestData.chest_id = 2;
		playerData.chest_data.chest2 = chestData;
		result = {
			"result"     : true,
			"message"    : "Add chest to chest slot 2",
			"chest_id"   : 2,
			"type" 		 : chestData.type,
			"chest_data" : chestData
		}
	} else if (!playerData.chest_data.chest3) {
		chestData.chest_id = 3;
		playerData.chest_data.chest3 = chestData;
		result = {
			"result"     : true,
			"message"    : "Add chest to chest slot 3",
			"chest_id"   : 3,
			"type" 		 : chestData.type,
			"chest_data" : chestData
		}
	} else if (!playerData.chest_data.chest4) {
		chestData.chest_id = 4;
		playerData.chest_data.chest4 = chestData;
		result = {
			"result"     : true,
			"message"    : "Add chest to chest slot 4",
			"chest_id"   : 4,
			"type" 		 : chestData.type,
			"chest_data" : chestData
		}
	} else {
		result = {
			"result": true,
			"message" : "Your chest slot is full",
			"full_chest": true
		}
	}
	return {
		"data": result,
		"player_data": playerData
	};
}

function getCoinNeedToOpenChest(timeRemain) {
	var coin = Math.ceil(server_config.coin_need_open_chest_per_seconds * timeRemain);
	return coin;
}

function getChestStatus(chest) {
	if (chest.time_open && timeNow - chest.time_open < chest.time_out) {
		return server_config.chest_status.opening;
	} else if (chest.time_open && timeNow - chest.time_open >= chest.time_out) {
		return server_config.chest_status.opened;
	} else {
		return server_config.chest_status.locked;
	}
}

function getExpWhenUpgradeCard(rarity, level) {
	var exp = server_config.exp_upgrade_card[rarity][level];
	return exp;
}