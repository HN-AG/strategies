/**
 * This file contains the commonly used globals so we don't have to copy & paste them
 */
"use strict";

//APIs are given to the script by the framework.  We are declaring them here so the file passes jslint
var HashNestAPI;
var AntPoolAPI;
var BitcoinAverageAPI;
var StorageAPI;

var console = { 
    log: print,
    warn: print,
    error: print
};

/* global prefs */
var globals = {
    
    //Constants & Globals (constants start with c_ you probably shouldn't mess with them if you like money)
    //Maintenance fee constants
    c_maint_usd_S3 : 0.001920,
    c_maint_usd_S4 : 0.001625,
    c_maint_usd_S5 : 0.001175,
    c_maint_usd_S7 : 0.0005796,

    //Assumes a perfect 1 block every 10 mins found by the bitcoin network globally.  Change this is they ever change it
    c_blocks_per_day_total : 144,

    //These can and should be updated and checked on from time to time
    coins_per_block : 25,
    btc_usd_rate : 200.00, //Just something so JS knows it's a float and not a string
    pool_info : null,
    split_factor : Number(StorageAPI.get("SPLITFACTOR","0.3333")),
    training_wheels : StorageAPI.get("TRAININGWHEELS","ON") //You should leave this alone until you understand the strategy, then change it by passing in --TRAINING-WHEELS=OFF
};

var state = {
    loop_count : 0,
    last_action_counter : 0,
    last_sell_counter : 0,
    last_buy_counter : 0,
    last_cancel_counter : 0
};

/* world is given to us by the framework, declaring it though */
var world = {};
//pool_info object is updated by main at each pass

var blockInfo = {};
var pricefeed = {};
var balances = {};

//Got tired of typing Array.isArray on all these sanity checks.
//Trust me, you'll thank me for this one later
function isArray(obj){
    return Array.isArray(obj);
}