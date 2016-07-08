var DEBUG = true;
var TIME_EXPIRE_MATCH = 600;
var TIME_EXPIRE_ROOM = 120;
var TIME_FB_INVITE = 86400000;
var NUM_LEVEL = 34;
var BONUS_TROPHIES = 25;
var BONUS_BY_TROPHIES_OFFSET = 15;
var BONUS_TROPHIES_OFFSET    = 200;
var PHOTON_SERVER_LIST = ["7c59e73f-5f30-40c6-90aa-6174a4450e56","e5f8004a-3f4b-4245-9917-28d4779846c5"];
var LEADER_BOARD_GLOBAL = 1;
var LEADER_BOARD_BY_COUNTRY = 2;
var LEADER_BOARD_BY_FRIENDS = 3;
var SHORT_CODE_LB_GLOBAL = "TLBG";
var SHORT_CODE_LB_BY_COUNTRY = "TLBBC.COUNTRY.";
var LEADER_BOARD_NUMBER_ENTRY = 100;
var NUMBER_IGNORE_PLAYER = 5;
var USER_START_TROPHY = 50;
var IGNORE_HAS_RANDOM_TIME = true;
var TROPHIES_OF_EASY_BOT   = 150;
var TROPHIES_OF_NORMAL_BOT = 250;
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