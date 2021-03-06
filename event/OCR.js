//=========Online COntroller============//
require("common");
var playerDataList = Spark.runtimeCollection("playerData");
var playerID = Spark.getPlayer().getPlayerId();
var data = Spark.getData().data;
if(!data) data = {};

if(data.get_server){
	var response= {};
	
	var index = 0;
	var found = false;
	while(index < PHOTON_SERVER_LIST.length && !found){
		var server = Spark.runtimeCollection("PhotonServer");
		var numberUser = server.count({"server_id": index});
		if(numberUser  < 20) {
			response.server = PHOTON_SERVER_LIST[index];
			response.numberUser = numberUser;
			response.server_id = index;

			var timeNow = Date.now();
			server.update({"playerID": playerID},{"playerID": playerID,"timeCreate": timeNow,"server_id":index},true,false);
			var theScheduler = Spark.getScheduler();
			theScheduler.inSeconds("remove_online_player", TIME_EXPIRE_MATCH, {"playerID" : playerID});

			if(data.game_type == "friend"){
				var currentPlayerData = playerDataList.findOne({"playerID": playerID});
				if(!currentPlayerData) currentPlayerData = {"trophies":0};
				var friendRoomDB = Spark.runtimeCollection("FriendRoom");
				var timeNow = Date.now();
				var updateData = {
					"playerID": playerID,
					"facebook_id":currentPlayerData.facebook_id?currentPlayerData.facebook_id:"",
					"userName":currentPlayerData.userName?currentPlayerData.userName:"",
					"timeCreate": timeNow,
					"server_id":index,
					"server": PHOTON_SERVER_LIST[index],
					"room_id":playerID
				};
				friendRoomDB.update({"playerID": playerID},updateData,true,false);
				var theScheduler = Spark.getScheduler();
				theScheduler.inSeconds("remove_online_player", TIME_EXPIRE_ROOM + 5, {"playerID" : playerID,"remove_room":true});
				response.room_id = playerID;
				response.timeout = TIME_EXPIRE_ROOM;
			}
			if(data.game_type == "random"){
				var onlineMatchList = Spark.runtimeCollection("OnlineMatch");
				var online_match_data =onlineMatchList.findOne({"playerID":playerID});
				if(online_match_data && online_match_data.list_ignore){
					response.list_ignore = online_match_data.list_ignore;
					if(DEBUG) response.list_ignore = [];
				}
			}
			found = true;
		}
		index ++;
	}
	if(!found){
		response.error = "Not enough server";
	}
	response.time_change_to_bot = 300 + Math.random()*20;
	Spark.setScriptData("data",response);
}

if(data.get_bot_player){
	var opponentPlayer = get_bot_player_data();
	opponentPlayer.level = BOT_LEVEL[parseInt(Math.random()* BOT_LEVEL.length)];
	opponentPlayer.seed = parseInt(Math.random() * 100000);
	if(opponentPlayer.level_bot_data){
	   // opponentPlayer.level = opponentPlayer.level_bot_data.level;
	}
	opponentPlayer.level_data = get_level_data(opponentPlayer.level);
	Spark.setScriptData("botData",opponentPlayer);
}

if(data.online_match_start  && data.game_type == "friend"){
	var response = {"time_expire": TIME_EXPIRE_MATCH};
	Spark.setScriptData("data", response);
}

if(data.online_match_start  && data.game_type != "friend"){
	var currentPlayerData = playerDataList.findOne({"playerID": playerID});
	var currentPlayer = Spark.getPlayer();
	if(!currentPlayer) currentPlayer = {};
	if(!currentPlayerData) currentPlayerData = {"trophies":0};
	if(!currentPlayerData.trophies) currentPlayerData.trophies = 0;
	var my_total_match_on = (currentPlayer.getPrivateData("total_match_on")?currentPlayer.getPrivateData("total_match_on"):0) + 1;

	var opponentPlayerData = playerDataList.findOne({"playerID": data.opponent_id});
	var opponentPlayer = Spark.loadPlayer(data.opponent_id);
	if(!opponentPlayer) opponentPlayer = {};
	if(!opponentPlayerData) opponentPlayerData = {"trophies":0};
	if(!opponentPlayerData.trophies) opponentPlayerData.trophies = 0;	
	
	var timeNow = Date.now();
	var response = {
		"playerID": playerID,"opponent_id":data.opponent_id,
		"time": timeNow,
		"time_expire": TIME_EXPIRE_MATCH,
		"my_total_match_on": my_total_match_on,
		"my_trophy": currentPlayerData.trophies,"opponent_trophy": opponentPlayerData.trophies,
		"bot_enable": data.bot_enable
	};
	Spark.getLog().debug(response);
	var onlineMatchList = Spark.runtimeCollection("OnlineMatch");
	var online_match_data = onlineMatchList.findOne({"playerID":playerID});
	var online_opponent_match_data = onlineMatchList.findOne({"playerID":data.opponent_id});
	if(online_opponent_match_data && online_opponent_match_data.opponent_id == playerID && !online_opponent_match_data.is_finish){
		response.opponent_trophy = online_opponent_match_data.my_trophy;
	}
	
	//Them user vao danh sach moi gap
	if(data.game_type == "random"){
		var list_ignore = online_match_data?online_match_data.list_ignore:[];
		if(list_ignore && online_match_data){
			if(list_ignore.length == NUMBER_IGNORE_PLAYER){
				list_ignore.pop();
			}
			list_ignore.unshift(data.opponent_id);
		}else{
			list_ignore = [];
			list_ignore.push(data.opponent_id);
		}
		response.list_ignore = list_ignore;
	}
	response.is_finish = false;
	//rank of myPlayer on leader board friends
	var myRank = get_current_rank_with_friends();
	response.rank_before = myRank;

	onlineMatchList.update({"playerID": playerID},{"$set":response},true,false);

	var bonus_trophies = get_bonus_trophies_lost(currentPlayerData.trophies,opponentPlayerData.trophies);
	currentPlayer.setPrivateData("total_match_on",my_total_match_on);
	currentPlayerData.trophies = currentPlayerData.trophies > bonus_trophies ? (currentPlayerData.trophies - bonus_trophies) : 0;
	currentPlayerData.online_match_start = currentPlayerData.online_match_start ? (currentPlayerData.online_match_start+1) : 1;

	var result = Spark.sendRequest({
		"@class": ".LogEventRequest",
		"eventKey": "TLB",
		"trophies": currentPlayerData ? currentPlayerData.trophies : 0,
		"COUNTRY": currentPlayerData && currentPlayerData.location && currentPlayerData.location.country ? currentPlayerData.location.country : "VN",
		"CITY": ""
	});

	if(!data.bot_enable){
	}else{
		currentPlayerData.online_bot_start = currentPlayerData.online_bot_start ? (currentPlayerData.online_bot_start+1) : 1;
	}

	response.trophies = currentPlayerData.trophies;

	playerDataList.update({"playerID": playerID}, {"$set": currentPlayerData}, true,false);
	Spark.setScriptData("data", response);
}

if(data.online_match_end ){
	var my_score = data.my_score;
	var op_score = data.opponent_score;
	var op_id = data.opponent_id;
	var isWin = data.isWin;
	var isDraw = data.isDraw;
	var currentPlayerData = playerDataList.findOne({"playerID": playerID});
	var bonus = 0;
	var opponent_bonus = 0;
	var server = Spark.runtimeCollection("PhotonServer");
	server.remove({"playerID":playerID});
	server.remove({"playerID":op_id});
	var onlineMatchList = Spark.runtimeCollection("OnlineMatch");
	var online_match_data =onlineMatchList.findOne({"playerID":playerID});
	var bonus_coin = 0;
	var bonus_exp = 0;
	var chestReceived = {
		"result" : false,
		"full_chest": false
	};
	var log_eat_data = data.log_eat_data;
	if(log_eat_data&&log_eat_data.size >= 5){
	    var user_level_log = Spark.runtimeCollection("user_level_log");
	    log_eat_data.game_type = data.game_type;
	    log_eat_data.playerID = playerID;
	    log_eat_data.trophies = currentPlayerData.trophies ? currentPlayerData.trophies : 0;
	    user_level_log.insert(log_eat_data);
	}
	if(data.game_type != "friend"){
		if(online_match_data !== null && !online_match_data.is_finish){
			if(isWin || isDraw){
				var currentPlayer = Spark.getPlayer();
				var bonus_trophies = get_bonus_trophies_win(online_match_data.my_trophy,online_match_data.opponent_trophy);
				bonus = bonus_trophies;
				opponent_bonus = -get_bonus_trophies_lost(online_match_data.opponent_trophy,online_match_data.my_trophy);
				if(!currentPlayerData.trophies) currentPlayerData.trophies = 0;
				if(isWin){
					currentPlayerData.online_win = currentPlayerData.online_win ? (currentPlayerData.online_win+1) : 1;
					bonus_coin = getCoinBattleWin(playerID);
					bonus_exp  = getExpBattleWin(playerID);
					// add chest to player
					var chestType = currentPlayerData.online_win < 5 ? 2 : 0;
					var playerDataAfterReceiveChest = addChestToPlayerAfterBattle(currentPlayerData, chestType);
					if (playerDataAfterReceiveChest.data.result) {
						currentPlayerData = playerDataAfterReceiveChest.player_data;
						chestReceived = playerDataAfterReceiveChest.data;
					}
				}else if(isDraw){
					bonus = 0;
					opponent_bonus = 0;
					bonus_exp  = getExpBattleLose(playerID);
				}
				currentPlayerData.trophies = (online_match_data.my_trophy + bonus);
				if(!currentPlayerData.highest_trophy) currentPlayerData.highest_trophy = currentPlayerData.trophies;
				if(currentPlayerData.trophies > currentPlayerData.highest_trophy){
					currentPlayerData.highest_trophy = currentPlayerData.trophies;
				}
				// playerDataList.update({"playerID": playerID}, {"$set": currentPlayerData}, true,false);
			}else{
				currentPlayerData.online_lose = currentPlayerData.online_lose ? (currentPlayerData.online_lose+1) : 0;
				bonus = -get_bonus_trophies_lost(online_match_data.my_trophy,online_match_data.opponent_trophy);
				opponent_bonus = get_bonus_trophies_win(online_match_data.opponent_trophy,online_match_data.my_trophy);
				bonus_exp  = getExpBattleLose(playerID);
			}
            // var chestType = currentPlayerData.online_win < 5 ? 2 : 0;
   			// var playerDataAfterReceiveChest = addChestToPlayerAfterBattle(currentPlayerData, chestType);
			// if (playerDataAfterReceiveChest.data.result) {
			// 	currentPlayerData = playerDataAfterReceiveChest.player_data;
			// 	chestReceived = playerDataAfterReceiveChest.data;
			// }
			online_match_data.is_finish = true;
			//rank of myPlayer after match_end
			myRank = get_current_rank_with_friends();
			online_match_data.rank_after = myRank;
			onlineMatchList.update({"playerID": playerID}, {"$set": online_match_data}, true,false);
		}else{
			bonus = 0;
			opponent_bonus = 0;
		}
		//update coin and exp
		currentPlayerData.player_coin = currentPlayerData.player_coin ? currentPlayerData.player_coin + bonus_coin : bonus_coin;
		currentPlayerData.current_exp = currentPlayerData.current_exp ? currentPlayerData.current_exp + bonus_exp : bonus_exp;
		var levelInfo = getPlayerLevelInfoByExp(currentPlayerData.current_exp);
		currentPlayerData.level_info = levelInfo;
		playerDataList.update({"playerID":playerID},{"$set":currentPlayerData}, true, false);

		var save_data = {"playerID":playerID,"my_score":my_score,"op_id":op_id,"op_score":op_score,"draw":isDraw,"win":isWin,"data":online_match_data};
		Spark.getLog().debug(save_data);
		var result = Spark.sendRequest({
			"@class": ".LogEventRequest",
			"eventKey": "TLB",
			"trophies": currentPlayerData ? currentPlayerData.trophies : 0,
			"COUNTRY": currentPlayerData && currentPlayerData.location && currentPlayerData.location.country ? currentPlayerData.location.country : "VN",
			"CITY": ""
		});
		Spark.setScriptData("data", {"bonus" : bonus,"opponent_bonus" : opponent_bonus,"trophies": currentPlayerData.trophies,"opponent_trophies": online_match_data.opponent_trophy + opponent_bonus,"online_win":currentPlayerData.online_win,
			"online_match_start":currentPlayerData.online_match_start,"highest_trophy":currentPlayerData.highest_trophy,
			"rank_before":online_match_data.rank_before, "rank_after": online_match_data.rank_after, "bonus_coin":bonus_coin,
			"level_info":levelInfo, "chest_data": chestReceived});
	}else{
		remove_room();
	}
}

if(data.online_match_cancel){
	var server = Spark.runtimeCollection("PhotonServer");
	server.remove({"playerID":playerID});
	if(data.game_type == "friend"){
		remove_room();
	}
    Spark.getMultiplayer().cancelMatchmaking(Spark.getPlayer(), "PVP", null);
}

if(data.get_friend_room_list){
	var friendRoomDB = Spark.runtimeCollection("FriendRoom");
	var response = friendRoomDB.find({"playerID":{"$ne":playerID},"server_id":{"$ne":null}}).toArray();
	var timeNow = Date.now();
	var list = [];
	for (var i = 0; i < response.length; i++) {
		response[i].timeout = TIME_EXPIRE_ROOM - parseInt((timeNow - response[i].timeCreate) /1000);
		if(response[i].timeout >= 5) list.push(response[i]);
	};
	Spark.setScriptData("data", list);
}

if(data.join_room){
	var room_id = data.room_id;
	var index = data.server_id;
	var server = Spark.runtimeCollection("FriendRoom");

	if(server.find({"room_id":room_id})){
		var response = true;
		server.remove({"room_id":room_id});
		var timeNow = Date.now();
		server.update({"playerID": playerID},{"playerID": playerID,"timeCreate": timeNow,"server_id":index},true,false);
		var theScheduler = Spark.getScheduler();
		theScheduler.inSeconds("remove_online_player", TIME_EXPIRE_MATCH, {"playerID" : playerID});
	}else{
		var response = false;
	}
	Spark.setScriptData("data", response);
}

if (data.get_bonus_trophies) {
	var myTrophies = data.my_trophies;
	var oppoentTrophies = data.opponent_trophies;
	var bonus_win  = get_bonus_trophies_win(myTrophies, oppoentTrophies);
	var bonus_lost = get_bonus_trophies_lost(myTrophies, oppoentTrophies);
	Spark.setScriptData("data", {"bonus_win":bonus_win, "bonus_lost": bonus_lost});
}

if(data.get_level_data){
    Spark.setScriptData("data", get_level_data(data.level));
}

function remove_room () {
	var server = Spark.runtimeCollection("FriendRoom");
	server.remove({"playerID":playerID});
}

function get_current_rank_with_friends() {
	var currentPlayer = playerDataList.findOne({"playerID": playerID});
	var friendList = (currentPlayer && currentPlayer.facebook_friend  && currentPlayer.facebook_friend.length > 0) ? currentPlayer.facebook_friend : [];
	var friendListArr = friendList;
	var myFBId = currentPlayer && currentPlayer.facebook_id ? currentPlayer.facebook_id : "";
	var playerList = playerDataList.find({"$or":[{"facebook_id":{"$exists":true,"$ne":"","$in":friendListArr}},{"facebook_id":myFBId}],"trophies":{"$ne":null}}).sort({"trophies":-1}).limit(100).toArray();
	var rank = 0;
	for (var i = 0; i < playerList.length; i++) {
		var opponent = playerList[i];
		if (opponent.playerID == playerID) {
			return (rank + 1);
		} else {
			rank++;
		}
	}
	if (rank > 0) {
		return 101;
	} else {
		return 1;
	}
}

function get_level_data(level){
    if(level <= CLIENT_LEVEL_MAX){
        return null;
    }
    var levelMaster = Spark.metaCollection("level_match_master");
    var lvl_data = levelMaster.findOne({level:level});
    if(!lvl_data) {
        Spark.getLog().error("Can not find level in db " + level + " time " + new Date().toLocaleDateString()+ " " + new Date().toLocaleTimeString());
        return get_level_data(25);
    }
    return lvl_data;
}

function get_bot_player_data(isEvent) {
	var currentPlayerData = playerDataList.findOne({"playerID": playerID});
    var friendList = (currentPlayer && currentPlayer.facebook_friend  && currentPlayer.facebook_friend.length > 0) ? currentPlayer.facebook_friend : [];
	var friendListArr = friendList;
	var onlineMatchList = Spark.runtimeCollection("OnlineMatch");
	var online_match_data = onlineMatchList.findOne({"playerID":playerID});
	var list_ignore = online_match_data && online_match_data.list_ignore ? online_match_data.list_ignore : [];
	var opponentPlayer;
	var opponentPlayerData;
	var offsetTrophies1 = server_config.offset_trophies_1;
	var offsetTrophies2 = server_config.offset_trophies_2;
	var offsetTrophies3 = server_config.offset_trophies_3;
	// Find player has trophies around +/- 300
	var myTrophies = currentPlayerData.trophies ? currentPlayerData.trophies : 0;
	var trophiesMax = myTrophies + offsetTrophies1;
	var trophiesMin = myTrophies > offsetTrophies1 ? myTrophies - offsetTrophies1 : 0;
	if (IGNORE_HAS_RANDOM_TIME) {
		opponentPlayerData = playerDataList.find({"playerID":{"$ne":playerID},"trophies":{"$exists":true,"$lte":trophiesMax,"$gte":trophiesMin},"facebook_id":{"$exists":true,"$nin":friendListArr}});
	} else {
		opponentPlayerData = playerDataList.find({"playerID":{"$ne":playerID},"trophies":{"$exists":true,"$lte":trophiesMax,"$gte":trophiesMin},"facebook_id":{"$exists":true,"$nin":friendListArr},"has_random_time":true});
	}
	var opponentPlayerDataArr = opponentPlayerData.toArray();
	if (!IGNORE_HAS_RANDOM_TIME && opponentPlayerDataArr.length == 0) {
		opponentPlayerData = playerDataList.find({"playerID":{"$ne":playerID},"trophies":{"$exists":true,"$lte":trophiesMax,"$gte":trophiesMin},"facebook_id":{"$exists":true,"$nin":friendListArr}});
		opponentPlayerDataArr = opponentPlayerData.toArray();
	}
	//Find player has trophies around +/- 500
	if (opponentPlayerDataArr.length == 0) {
		trophiesMax = myTrophies + offsetTrophies2;
		trophiesMin = myTrophies > offsetTrophies2 ? myTrophies - offsetTrophies2 : 0;
		opponentPlayerData = playerDataList.find({"playerID":{"$ne":playerID},"trophies":{"$exists":true,"$lte":trophiesMax,"$gte":trophiesMin},"facebook_id":{"$exists":true,"$nin":friendListArr}});
		opponentPlayerDataArr = opponentPlayerData.toArray();
	}
	//Find player has trophies around +/- 800
	if (opponentPlayerDataArr.length == 0) {
		trophiesMax = myTrophies + offsetTrophies3;
		trophiesMin = myTrophies > offsetTrophies3 ? myTrophies - offsetTrophies3 : 0;
		opponentPlayerData = playerDataList.find({"playerID":{"$ne":playerID},"trophies":{"$exists":true,"$lte":trophiesMax,"$gte":trophiesMin},"facebook_id":{"$exists":true,"$nin":friendListArr}});
		opponentPlayerDataArr = opponentPlayerData.toArray();
	}
	//Find player has trophies
	if (opponentPlayerDataArr.length == 0) {
		opponentPlayerData = playerDataList.find({"playerID":{"$ne":playerID},"trophies":{"$exists":true},"facebook_id":{"$exists":true,"$nin":friendListArr}});
		opponentPlayerDataArr = opponentPlayerData.toArray();
	}
	var count = 0;
	while(count < 10) {
		if (opponentPlayerDataArr.length == 0) {
			break;
		}
		var r = Math.floor(Math.random() * opponentPlayerDataArr.length);
		var opponent = opponentPlayerDataArr[r];
		var levelBotList = Spark.runtimeCollection("user_level_log").find({"playerID": opponent.playerID,"level":{"$in":BOT_LEVEL}}).toArray();//Kiem tra xem co data log cua bot khong
		if (levelBotList.length > 0 && list_ignore.indexOf(opponent.playerID) == -1) {
			if(list_ignore.length == NUMBER_IGNORE_PLAYER){
				list_ignore.pop();
			}
			list_ignore.unshift(opponent.playerID);
			opponentPlayer = opponent;
			var r2 = Math.floor(Math.random() * levelBotList.length);
			opponentPlayer.level_bot_data = levelBotList[r2];
			opponentPlayer.case1 = true;
			onlineMatchList.update({"playerID": playerID}, {"$set": {"list_ignore": list_ignore}}, true,false);
			break;
		}
		count++;
	}
	if (!opponentPlayer) {//Lay random trong list user_level_log
		count = 0;
		var levelBotList = Spark.runtimeCollection("user_level_log").find({"level":{"$in":BOT_LEVEL}}).toArray();
		while(count < 10) {
			var r = Math.floor(Math.random() * levelBotList.length);
			var opponent = levelBotList[r];
			if (list_ignore.indexOf(opponent.playerID) == -1) {
				if(list_ignore.length == NUMBER_IGNORE_PLAYER){
					list_ignore.pop();
				}
				list_ignore.unshift(opponent.playerID);
				opponentPlayer = playerDataList.findOne({"playerID":opponent.playerID});
				opponentPlayer.level_bot_data = levelBotList[r];
				opponentPlayer.case2 = true;
				onlineMatchList.update({"playerID": playerID}, {"$set": {"list_ignore": list_ignore}}, true,false);
				break;
			}
			count++;
		}
		if (!opponentPlayer) {
			var r = Math.floor(Math.random() * levelBotList.length);
			opponentPlayer = playerDataList.findOne({"playerID":levelBotList[r].playerID});
			opponentPlayer.case3 = true;
		}
	}
	
	if (isEvent) {
		opponentPlayer.trophies = opponentPlayer.event_trophies ? opponentPlayer.event_trophies : 0;
	}
	
	var levelBotList = Spark.runtimeCollection("user_level_log").find({"playerID": opponentPlayer.playerID,"level":{"$in":BOT_LEVEL}}).toArray();//Kiem tra xem co data log cua bot khong
	if(levelBotList.length == 0){
	    opponentPlayer.level_bot_data = null;
	}else{
	    var r2 = Math.floor(Math.random() * levelBotList.length);
		opponentPlayer.level_bot_data = levelBotList[r2];
	}

	var cardData = opponentPlayer.card_data;
	if (!cardData) {
		cardData = cardMaster.find({"card_default":1},{"card_score":0,"card_energy":0,"description":false}).toArray();
		for(var i = 0; i < cardData.length; i++) {
			cardData[i].current_level = 1;
		}
	}
	cardData.forEach(function(card){
		card.current_score = getCardScore(card, card.current_level);
		card.current_energy = getCardEnergy(card, card.current_level);
	});
	opponentPlayer.card_data = cardData;

	return opponentPlayer;
}

function get_bonus_trophies_win(myTrophies, oppoentTrophies) {
	var bonus  = BONUS_TROPHIES;
	var offset = Math.abs(myTrophies - oppoentTrophies)
	var bonusByOffset = Math.floor(offset / BONUS_TROPHIES_OFFSET * BONUS_BY_TROPHIES_OFFSET);
	if (bonusByOffset > BONUS_BY_TROPHIES_OFFSET) {
		bonusByOffset = BONUS_BY_TROPHIES_OFFSET;
	}
	if (myTrophies > oppoentTrophies) {
		bonusByOffset = -bonusByOffset;
	}
	return bonus + bonusByOffset;
}

function get_bonus_trophies_lost(myTrophies, oppoentTrophies) {
	var bonus  = BONUS_TROPHIES;
	var offset = Math.abs(myTrophies - oppoentTrophies)
	var bonusByOffset = Math.floor(offset / BONUS_TROPHIES_OFFSET * BONUS_BY_TROPHIES_OFFSET);
	if (bonusByOffset > BONUS_BY_TROPHIES_OFFSET) {
		bonusByOffset = BONUS_BY_TROPHIES_OFFSET;
	}
	if (myTrophies > oppoentTrophies) {
		bonusByOffset = -bonusByOffset;
	}
	return bonus - bonusByOffset;
}