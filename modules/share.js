var gameConfig = Spark.metaCollection("game_config");
var server_config = gameConfig.findOne({"server":1});
var client_config = gameConfig.findOne({"server":0});
var DEBUG = server_config.DEBUG;
var TIME_EXPIRE_MATCH = server_config.TIME_EXPIRE_MATCH;
var TIME_EXPIRE_ROOM = server_config.TIME_EXPIRE_ROOM;
var TIME_FB_INVITE = server_config.TIME_FB_INVITE;
var CLIENT_LEVEL_MAX = 100;
var BOT_LEVEL = [25,28,29];
var NORMAL_LEVEL = [25,28,29,30,31,32,33,34,35,36,37,38];
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
var CONFIG = {};
CONFIG.num_friend_per_energy = 500;
CONFIG.app_version_ios = 12;
CONFIG.app_version_android = 12;
CONFIG.time_energy_recover = 1000;
CONFIG.time_change_to_bot = 30;
CONFIG.leader_board_global = LEADER_BOARD_GLOBAL;
CONFIG.leader_board_by_country = LEADER_BOARD_BY_COUNTRY;
CONFIG.leader_board_by_friends = LEADER_BOARD_BY_FRIENDS;
CONFIG.network_ping_url   = "http://google.com";
CONFIG.network_ping_count = 3;
CONFIG.network_ping_time  = 5;
CONFIG.num_energy_lite = 60;
CONFIG.num_random_lite = 30;
CONFIG.num_hint_lite = 30;
CONFIG.num_energy_normal = 150;
CONFIG.num_random_normal = 75;
CONFIG.num_hint_normal = 75;
CONFIG.num_energy_big = 360;
CONFIG.num_random_big = 180;
CONFIG.num_hint_big = 180;
CONFIG.max_energy_offline = 5;
CONFIG.card_level_max = card_level_max;
CONFIG.csrc = card_score_rarity_common;
CONFIG.csrr = card_score_rarity_rare;
CONFIG.csre = card_score_rarity_epic;
CONFIG.cerc = card_energy_rarity_common;
CONFIG.cerr = card_energy_rarity_rare;
CONFIG.cere = card_energy_rarity_epic;
CONFIG.cnnrc = card_number_need_rarity_common;
CONFIG.cnnrr = card_number_need_rarity_rare;
CONFIG.cnnre = card_number_need_rarity_epic;
CONFIG.ccnrc = card_coin_need_rarity_common;
CONFIG.ccnrr = card_coin_need_rarity_rare;
CONFIG.ccnre = card_coin_need_rarity_epic;

function getTimeNow() {
	return Date.now() + OFFSET_TIME;
}

function setTimeNow(time_now) {
	var offset = time_now - Date.now();
	packData.update({"server":1},{"$set":{"DEBUG_OFFSET_TIME":offset}}, true, false);
}