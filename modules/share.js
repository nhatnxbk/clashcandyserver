var gameConfig = Spark.metaCollection("game_config");
var server_config = gameConfig.findOne({"server":1});
var client_config = gameConfig.findOne({"server":0});
var DEBUG = server_config.DEBUG;
var TIME_EXPIRE_MATCH = server_config.TIME_EXPIRE_MATCH;
var TIME_EXPIRE_ROOM = server_config.TIME_EXPIRE_ROOM;
var TIME_FB_INVITE = server_config.TIME_FB_INVITE;
var NUM_LEVEL = server_config.NUM_LEVEL;
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
//easy
var rt_1_e = [3, 5, 6, 6, 7, 8, 9, 8, 9, 9, 8, 9, 8, 8, 8, 7];//con 1 cap
var rt_2_e = [3, 4, 4, 5, 6, 7, 8, 7, 9, 8, 7, 8, 8, 7, 6, 6];// con 2 cap
var rt_3_e = [2, 3, 3, 3, 4, 5, 4, 6, 4, 5, 5, 6, 5, 4, 4, 3];// con 3 cap
var rt_4_e = [2, 3, 3, 3, 4, 3, 5, 4, 5, 3, 4, 4, 3, 4, 3, 3];// con 4 cap
var rt_5_e = [2, 3, 2, 3, 2, 3, 2, 3, 4, 3, 4, 3, 3, 3, 3, 2];// con >= 5 cap
var rto_1_e = [0.8, 1.7, 1.5, 2.4, 2.5, 3.0, 3.1, 3.0, 3.2, 3.1, 3.2, 3.3, 3.3, 3.5, 3.5, 3.3];
var rto_2_e = [0.8, 2.0, 2.0, 2.1, 2.2, 2.3, 2.5, 2.8, 2.8, 2.5, 2.5, 3.0, 3.0, 3.0, 3.2, 3.2];
var rto_3_e = [1.0, 1.8, 2.0, 2.1, 2.2, 2.3, 2.5, 2.7, 2.7 ,2.7, 2.5, 2.5, 2.5, 2.5, 2,6, 2.9];
var rto_4_e = [1.2, 1.2, 2.1, 2.2, 2.3, 2.3, 2.4, 2.3, 2.3 ,2.4 ,2.4, 2.4, 2.4 ,2.5, 2.3, 2.4];
var rto_5_e = [1.5, 1.7, 1.8, 1.8, 1.8, 1.8, 1.8, 2.0, 2.2, 2.1, 2.1, 2.2, 2.2, 2.1, 2.2, 2.2];
//normal
var rt_1_n = [3, 5, 5, 6, 7, 8, 9, 8, 9, 9, 8, 8, 8, 8, 8, 6];//con 1 cap
var rt_2_n = [3, 4, 4, 5, 6, 7, 8, 7, 8, 8, 6, 7, 7, 7, 6, 5];// con 2 cap
var rt_3_n = [2, 3, 3, 3, 4, 5, 4, 5, 4, 5, 5, 4, 5, 4, 4, 3];// con 3 cap
var rt_4_n = [2, 3, 3, 3, 4, 3, 4, 4, 4, 3, 4, 4, 3, 4, 3, 3];// con 4 cap
var rt_5_n = [2, 2, 2, 3, 2, 3, 2, 3, 3, 3, 2, 3, 2, 3, 3, 2];// con >= 5 cap
var rto_1_n = [0.8, 1.7, 1.5, 2.4, 2.5, 3.0, 3.1, 3.0, 3.2, 3.1, 3.2, 3.3, 3.3, 3.5, 3.5, 3.3];
var rto_2_n = [0.8, 2.0, 2.0, 2.1, 2.2, 2.3, 2.5, 2.8, 2.8, 2.5, 2.5, 3.0, 3.0, 3.0, 3.2, 3.2];
var rto_3_n = [1.0, 1.8, 2.0, 2.1, 2.2, 2.3, 2.5, 2.7, 2.7 ,2.7, 2.5, 2.5, 2.5, 2.5, 2,6, 2.9];
var rto_4_n = [1.2, 1.2, 2.0, 2.0, 2.1, 2.2, 2.3, 2.3, 2.3 ,2.3 ,2.4, 2.4, 2.4 ,2.5, 2.3, 2.4];
var rto_5_n = [1.5, 1.7, 1.7, 1.7, 1.8, 1.8, 1.8, 2.0, 2.0, 2.1, 2.1, 2.2, 2.1, 2.1, 2.2, 2.2];
//hard
var rt_1_h = [3, 5, 5, 6, 7, 6, 7, 7, 6, 7, 6, 7, 6, 7, 6, 6];//con 1 cap
var rt_2_h = [3, 4, 4, 5, 6, 6, 7, 6, 7, 7, 6, 6, 7, 7, 6, 5];// con 2 cap
var rt_3_h = [2, 3, 3, 3, 4, 5, 4, 5, 4, 5, 5, 4, 5, 4, 4, 3];// con 3 cap
var rt_4_h = [2, 3, 3, 3, 4, 3, 4, 3, 4, 3, 4, 4, 3, 4, 3, 3];// con 4 cap
var rt_5_h = [2, 2, 2, 3, 2, 3, 2, 3, 3, 3, 2, 3, 2, 3, 3, 2];// con >= 5 cap
var rto_1_h = [0.8, 1.7, 1.5, 2.4, 2.5, 3.0, 3.1, 3.0, 3.2, 3.1, 3.2, 3.3, 3.3, 3.5, 3.5, 3.3];
var rto_2_h = [0.8, 2.0, 2.0, 2.1, 2.2, 2.3, 2.5, 2.8, 2.8, 2.5, 2.5, 3.0, 3.0, 3.0, 3.2, 3.2];
var rto_3_h = [1.0, 1.8, 2.0, 2.1, 2.2, 2.3, 2.5, 2.7, 2.7 ,2.7, 2.5, 2.5, 2.5, 2.5, 2,6, 2.9];
var rto_4_h = [1.2, 1.2, 2.0, 2.0, 2.1, 2.2, 2.3, 2.3, 2.3 ,2.3 ,2.4, 2.4, 2.4 ,2.5, 2.3, 2.4];
var rto_5_h = [1.5, 1.7, 1.7, 1.7, 1.8, 1.8, 1.8, 2.0, 2.0, 2.1, 2.1, 2.2, 2.1, 2.1, 2.2, 2.2];
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
CONFIG.num_level = NUM_LEVEL;
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