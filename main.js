/**
 * Simple default strategy, does nothing at all, but demonstrates current best practices.
 */

"use strict";
//All strategies should declare the following information...
var strategy = {
    //Name, what are you calling it?
    name : "Main",
    //Desc a short simple description of what it does
    desc : "This file, is intended to show how to construct a strategy",
    //Version number (should change this on each iteration, major.minor.bugfix
    //anything a non-breaking "fix" occurs, change bugfix, minor is a potentially breaking change, major means significant refactor
    version : "1.0.0",
    //Dependencies, this is used to ensure your script has everything it needs available in it's global scope, before trying to execute
    //Anything in the global space you intend to use should be declared here for safety reasons.
    depends : ["console","globals","pool","hashnest"],
    provides : []
};

//Fragments, usually these are what "provides" whatever you have in "depends"
//If you find you have a bit of code that is highly reusable, consider submitting it to the the repo
//Same is true if you find a bug or make an optimization.  PRs are always considered for fragments assuming they follow best practices guidelines
load("./strategies/fragments/globals.js"); //Include the globals we'll need
load("./strategies/fragments/antpool.js"); //antpool specific stuff goes here
load("./strategies/fragments/hashnest.js"); //hashnest (miner related stuff) goes here

/**
 * onInit is a function that must be present in every strategy it gives you a chance to initialize and if necessary halt execution
 * @returns {undefined}
 */
function onInit(){
    //Things that can change but usually don't, survives a tick but not a restart
    globals.coins_per_block = Number(JSON.parse(StorageAPI.get("COINSPERBLOCK","25")));
    globals.long_block_time = Number(JSON.parse(StorageAPI.get("LONGBLOCKTIME","30")));
    globals.default_spread = Number(JSON.parse(StorageAPI.get("MINSPREAD","0.00000001")));
    console.log("Initializing "+strategy.name+" v"+strategy.version);
    console.log("Description: "+strategy.desc);
    strategy.depends.forEach(function(dependency){
        var dep = eval(dependency);
        if(!dep){
            console.log("Error missing "+dependency+" or it failed to load!");
            return false;
        }
        if(dep.hasOwnProperty("onInit")){
            console.log("Attempting to initialize "+dependency+"");
            var result = eval(dep.onInit());
            if(result){
                console.log(result);
            }else{
                console.log("Initializing dependecy "+dependency+" failed, please check logs.");
                console.log("Exiting now!");
                return false;
            }
        }else{
            console.log(dependency+" does not provide an onInit method, that's ok not all of them do.");
        }
    });
    console.log(strategy.name+" v"+strategy.version+" Initialized!");
    return true;
}

/**
 * onExit is a function that must be present in every strategy
 * It gives you an opportunity to some cleanup work.
 * It is called by the execution framework prior to application exit
 * @returns {undefined}
 */
function onExit(){
    console.log(strategy.name+" is quitting");
}

/**
 * onTick() is a function that must be present in every strategy.
 * A tick is a defined moment in time.
 * The rate of "ticking" is in seconds and set by the command line --TICKRATE=N parameter
 * Where N is the number of seconds in between "ticks"
 * You should not tick at a rate faster than 60s or else bad things can happen to you at hashnest
 * The hashnest API is finicky and may rate limit you causing it to return junk, or outdated results, or blocking you all together
 * The default is 300s or 5 minutes, this is adequate for a yield strategy, a spread strategy should be 200s or 3 mins for best effect 
 * @returns {undefined}
 */
function onTick(){
   
    console.log(strategy.name+" v"+strategy.version+" waking up "+Date());
    console.log("*********Pre Flight Checks***********");
    console.log("It's working, but it's not doing anything because this is only a skeleton!");
    console.log("Sleeping for "+StorageAPI.get("TICKRATE","300")+" seconds.");
}