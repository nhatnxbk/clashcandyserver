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
	var packCoin = storeMaster.find({"item_type":0}).toArray();
	var packItem = storeMaster.find({"item_type":1}).toArray();
	storeInfo.pack_coin = packCoin;
	storeInfo.pack_item = packItem;
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
				var cardStore = {
					"card_id"     : card.card_id,
					"card_type"   : card.type,
					"card_rarity" : card.rarity,
					"number"      : 0,
					"max_number"  : 20,
					"cost_one"    : 20,

				};
				packCard.push(card);
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
		card.current_score = getCardScore(card.rarity, card.current_level);
		card.current_energy = getCardEnergy(card.rarity, card.current_level);
		card.next_level = card.current_level < card_level_max ? card.current_level + 1 : card.current_level;
		card.next_score = getCardScore(card.rarity, card.next_level);
		card.next_energy = getCardEnergy(card.rarity, card.next_level);
		card.next_number = getCardNumberNeed(card.rarity, card.next_level);
		card.coin_need = getCardCoinNeed(card.rarity, card.next_level);
	});
	return list_card;
}

function getCardScore(rarity, level) {
	switch (rarity) {
		case 1:
			return level <= card_level_max && level > 0 ? card_score_rarity_common[level - 1] : card_score_rarity_common[0];
		case 2:
			return level <= card_level_max && level > 0 ? card_score_rarity_rare[level - 1] : card_score_rarity_rare[0];
		case 3:
			return level <= card_level_max && level > 0 ? card_score_rarity_epic[level - 1] : card_score_rarity_epic[0];
		default:
			return level <= card_level_max && level > 0 ? card_score_rarity_common[level - 1] : card_score_rarity_common[0];
	}
}

function getCardEnergy(rarity, level) {
	switch (rarity) {
		case 1:
			return level <= card_level_max && level > 0 ? card_energy_rarity_common[level - 1] : card_energy_rarity_common[0];
		case 2:
			return level <= card_level_max && level > 0 ? card_energy_rarity_rare[level - 1] : card_energy_rarity_rare[0];
		case 3:
			return level <= card_level_max && level > 0 ? card_energy_rarity_epic[level - 1] : card_energy_rarity_epic[0];
		default:
			return level <= card_level_max && level > 0 ? card_energy_rarity_common[level - 1] : card_energy_rarity_common[0];
	}
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