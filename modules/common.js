//===========common function================//
require("share");
var levelMaster = Spark.metaCollection("level_master");
var playerCollection = Spark.runtimeCollection("playerData");
var storeMaster = Spark.metaCollection("store_master");
var storeDaily = Spark.runtimeCollection("store_daily");
var cardMaster = Spark.metaCollection("card_master");
var timeNow = Date.now();

function getPlayerLevelInfo(playerID) {
	var levelInfo = {};
	var playerData = playerCollection.findOne({"playerID":playerID});
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
		card.current_score = getCardScore(card, card.current_level);
		card.current_energy = getCardEnergy(card, card.current_level);
		card.next_level = card.current_level < card_level_max ? card.current_level + 1 : card.current_level;
		card.next_score = getCardScore(card, card.next_level);
		card.next_energy = getCardEnergy(card, card.next_level);
		card.next_number = getCardNumberNeed(card.rarity, card.next_level);
		card.coin_need = getCardCoinNeed(card.rarity, card.next_level);
	});
	return list_card;
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