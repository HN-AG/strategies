/***
*
*  Advizer is a simple application that helps you find the item with the best yield at current BTCUSD rates
*/
"use strict";
var strategy = {
    name : "Advizer",
    desc : "Advizer gives general trading advice considering present market conditions and your existing positions.\nIT WILL TRADE FOR YOU NOW!",
    version : "2.0.0",
    depends : ["console","globals","pool","hashnest"],
    provides : []
};

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
 * Advizer is an app to demonstrate the bot framework
 * It does no trades and merely shows you what to invest in based on current events.
 * @returns {undefined}
 */
function onTick(){
   
    console.log(strategy.name+" v"+strategy.version+" waking up "+Date());
    console.log("*********Pre Flight Checks***********");
     
    //Can change significantly from run to run, but drives a lot of different things
    globals.pool_info = JSON.parse(world.POOLINFO);
    //balances.hashrate = JSON.parse(world.HASHRATEBALANCES);
    //balances.BTC = holdings = JSON.parse(world.BTCHOLDINGS);
    
    //Update btc_usd rate
    pricefeed = JSON.parse(BitcoinAverageAPI.getPriceFeed());
    globals.btc_usd_rate = pricefeed.last;
    
    //Next step is to examine the pool blocks
    blockInfo = pool.examinePoolBlocks(JSON.parse(world.get("POOLBLOCKS")));
    console.log("fetching BTC balance..");
    var acct_balances = JSON.parse(HashNestAPI.checkAccountBalance());
    console.log("fetched balance: "+JSON.stringify(acct_balances));
    acct_balances.forEach(function(obj){
        var code = obj.currency.code.toUpperCase();
        balances[code] = obj;
    });
    console.log("fetching hashrate balance...");
    balances.hashrate = JSON.parse(HashNestAPI.checkHashRateBalance());
    console.log("fetched hashrate balances: "+JSON.stringify(balances.hashrate));
    //Initialize miners, orderbooks etc...
    //prepare is (name, id, maint_usd_daily, order_book, active_orders, order_history
    var s7 = hashnest.createMiner("S7",20,globals.c_maint_usd_S7);
    var s5 = hashnest.createMiner("S5",19,globals.c_maint_usd_S5); 
    var s4 = hashnest.createMiner("S4",18,globals.c_maint_usd_S4);
    var s3 = hashnest.createMiner("S3",15,globals.c_maint_usd_S3); 
    
    if(!s3 || !s4 || !s5 || !s7){
        //prepare can return false when it's sanity checking if there was any sort of problem.
        //if any of these values are falsey then the whole script could crash or worse.
        console.log("data integrity failing pre-flight check, please check internet connection.");
        
        return;
    }
    
    var miners = [s3,s4,s5,s7];
    //Sort by yield
    miners.sort(function(a,b){return b.yield - a.yield;});
    
    //Calculate Net Asset Value
    var nav = Number(balances.BTC.total);
    miners.forEach(function(miner){
        nav += Number(miner.nav);
    });
    nav = nav.toFixed(8);
    var nav_usd = Number(nav * Number(globals.btc_usd_rate)).toFixed(2);
    console.log("*********Pre Flight Checks End***********");
    console.log(Date());
    console.log("********"+strategy.name+" Report Start*********");
    console.log("Current BTC/USD rate: $"+globals.btc_usd_rate);
    console.log("*************User Assets**************");
    console.log("BTC balance: "+balances.BTC.total);
    console.log("Net Asset Value "+nav+" BTC worth $"+nav_usd);   
    console.log("************Antpool***************");
    console.log("Total blocks found by AntPoool in the last 24hrs: "+pool.blocks_per_day);
    console.log("24hr avg mins per block: "+pool.avg_mins_per_block);
    console.log("Pool GHS: "+Math.round(pool.total_ghs));
    console.log("Pool THS: "+(pool.total_ghs / 1000).toFixed(2));
    console.log("Pool PHS: "+(pool.total_ghs / 1000 / 1000).toFixed(2));
    console.log("1 GHS is a fraction of "+Number(pool.one_ghs_factor).toFixed(8)+" of Antpools total hashing capacity");
    console.log("An ideal GHS at Antpool earns "+pool.btc_per_block_per_ghs+" BTC per block");
    console.log("1 GHS earns "+(pool.btc_per_block_per_ghs * +pool.blocks_per_day).toFixed(8)+" BTC daily with present luck and difficulty levels");
    
    console.log("***********Miners By Yield***********");
    miners.forEach(function(miner){
        console.log(miner.name+" : "+miner.yield);
    });
    //JUST ADDED
    console.log("***********Miners Owned**************");
    var total_yield=0.0;
    miners.forEach(function(miner,idx){
        if(Number(miner.holdings.total) > 0){
            var nav = Number(miner.nav).toFixed(8);
            var holdings = Number(miner.holdings.total);
            var daily_earnings = Number(miner.net_btc_per_ghs_daily * holdings).toFixed(8);
            console.log(miner.name+": "+holdings+" valued at "+nav+" BTC, earns "+daily_earnings+" BTC daily.");
            total_yield +=Number(miner.yield);
            miner.sell = true;
        }
        if(miner.yield > 0){
            miner.buy = true;
        }
    });
    var projected_nav = Number(Number(nav)+Number(total_yield)).toFixed(8);
    var projected_nav_usd = Number(projected_nav * globals.btc_usd_rate).toFixed(2);
    console.log("************Mining Yield**********************");
    console.log("Daily Mining Earns: "+Number(total_yield).toFixed(8)+" BTC");
    console.log("*****************NET ASSET VALUE*******************");
    console.log("Current: "+nav+" BTC worth $"+nav_usd);
    console.log("24hr Projected: "+projected_nav+" BTC worth $"+projected_nav_usd);   
    
    console.log("************"+strategy.name+" Advice*************");
    miners.forEach(function(miner){
        if(miner.sell){
            //console.log(Number(miner.mid_price));
            //console.log(Number(miner.net_btc_per_ghs_daily));
            var sellprice = Number(Number(miner.mid_price)+Number(miner.net_btc_per_ghs_daily)).toFixed(8);
            var selltotal = (sellprice * globals.btc_usd_rate).toFixed(8);
            var qty = miner.holdings.amount;
            if(qty > 0){
                console.log("Sell "+miner.holdings.total+" of your "+miner.name+" "+" for "+sellprice+" giving you "+selltotal+"BTC use it to buy more "+miners[0].name);
                console.log(miner.name+" : "+HashNestAPI.createOrder(miner.id, qty ,sellprice,"sale"));
            }else{
                hashnest.cancelAllOrders(miner);
            }
        }else{
            if(miner.buy){
                var qty = Math.round(Number(balances.BTC.amount) / Number(miner.best_ask));
                if(qty > 0){
                    var buyprice = Number(miner.best_bid+1).toFixed(8);//We use mid_point since that is where yield is calculated, NAV is based on best_bid
                    console.log("Buy "+miner.name+" at "+buyprice+" the yield is "+miner.yield+" BTC daily for each BTC invested");
                    console.log(miner.name+" : "+HashNestAPI.createOrder(miner.id,qty,buyprice,"purchase"));
                    balances.BTC.amount -= (qty * buyprice);
                }else{
                    hashnest.cancelAllOrders(miner);
                }
            }
        }
    });
   
    console.log("********"+strategy.name+" Report End************");
    console.log("Sleeping for "+StorageAPI.get("TICKRATE","300")+" seconds.");
}