var gameConfig = Spark.metaCollection("game_config");
var server_config = gameConfig.findOne({"server":1});
var client_config = gameConfig.findOne({"server":0});
var DEBUG = server_config.DEBUG;
var TIME_EXPIRE_MATCH = server_config.TIME_EXPIRE_MATCH;
var TIME_EXPIRE_ROOM = server_config.TIME_EXPIRE_ROOM;
var TIME_FB_INVITE = server_config.TIME_FB_INVITE;
var CLIENT_LEVEL_MAX = 100;
var BOT_LEVEL = [25,28,29,33,35,36,37,38,45];
var BONUS_TROPHIES = server_config.BONUS_TROPHIES;
var BONUS_BY_TROPHIES_OFFSET = server_config.BONUS_BY_TROPHIES_OFFSET;
var BONUS_TROPHIES_OFFSET    = server_config.BONUS_TROPHIES_OFFSET;
var PHOTON_SERVER_LIST = server_config.PHOTON_SERVER_LIST;
var LEADER_BOARD_GLOBAL = server_config.LEADER_BOARD_GLOBAL;
var LEADER_BOARD_BY_COUNTRY = server_config.LEADER_BOARD_BY_COUNTRY;
var LEADER_BOARD_BY_FRIENDS = server_config.LEADER_BOARD_BY_FRIENDS;
var SHORT_CODE_LB_GLOBAL = server_config.SHORT_CODE_LB_GLOBAL;
var SHORT_CODE_LB_BY_COUNTRY = server_config.SHORT_CODE_LB_BY_COUNTRY;
var LEADER_BOARD_NUMBER_ENTRY = server_config.LEADER_BOARD_NUMBER_ENTRY;
var NUMBER_IGNORE_PLAYER = server_config.NUMBER_IGNORE_PLAYER;
var USER_START_TROPHY = server_config.USER_START_TROPHY;
var IGNORE_HAS_RANDOM_TIME = server_config.IGNORE_HAS_RANDOM_TIME;
var TROPHIES_OF_EASY_BOT   = server_config.TROPHIES_OF_EASY_BOT;
var TROPHIES_OF_NORMAL_BOT = server_config.TROPHIES_OF_NORMAL_BOT;
var DEFAULT_COIN = server_config.DEFAULT_COIN;
var OFFSET_TIME = server_config.DEBUG_OFFSET_TIME;
var LIST_ADMIN = server_config.LIST_ADMIN;
var NUM_NOTICE = server_config.NUM_NOTICE;
var NUM_NOTICE_ADMIN = server_config.NUM_NOTICE_ADMIN;
//====card parameter====//
var card_level_max = server_config.card_level_max;
var card_score_rarity_common = server_config.card_score_rarity_common;
var card_score_rarity_rare = server_config.card_score_rarity_rare;
var card_score_rarity_epic = server_config.card_score_rarity_epic;
var card_energy_rarity_common = server_config.card_energy_rarity_common;
var card_energy_rarity_rare = server_config.card_energy_rarity_rare;
var card_energy_rarity_epic = server_config.card_energy_rarity_epic;
var card_number_need_rarity_common = server_config.card_number_need_rarity_common;
var card_number_need_rarity_rare = server_config.card_number_need_rarity_rare;
var card_number_need_rarity_epic = server_config.card_number_need_rarity_epic;
var card_coin_need_rarity_common = server_config.card_coin_need_rarity_common;
var card_coin_need_rarity_rare = server_config.card_coin_need_rarity_rare;
var card_coin_need_rarity_epic = server_config.card_coin_need_rarity_epic;
//Config send to user
client_config.coin_need_open_chest_per_seconds = server_config.coin_need_open_chest_per_seconds;
client_config.random_min_time = 10;
client_config.random_max_time = 100;
client_config.max_time_bot_eat = 20;
client_config.bot_time_tranfer = 0.4;
client_config.bot_time_start_game = 1;
function getTimeNow() {
	return Date.now() + OFFSET_TIME;
}

function setTimeNow(time_now) {
	var offset = time_now - Date.now();
	packData.update({"server":1},{"$set":{"DEBUG_OFFSET_TIME":offset}}, true, false);
}