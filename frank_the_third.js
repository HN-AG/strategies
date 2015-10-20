/***
*
*  Frank the third is a spread trading strategy that you can use as a basis for building your own. You should not rely on this strategy long term, it is only a demo intended to show how to put your own together.
*/
"use strict";
var strategy = {
    name : "Frank The Third",
    desc : "Frank the third is a spread trading strategy that you can use as a basis for building your own.\nYou should not rely on this strategy long term, it is only a demo intended to show how to put your own together.\nCaution! Frank will trade for you when you turn off the training wheels!!!",
    version : "3.0.0",
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

function onQuit(){
    console.log("Frank was here!  Hope you made some dough.");
}

/**
 * Advizer is an app to demonstrate the bot framework
 * It does no trades and merely shows you what to invest in based on current events.
 * @returns {undefined}
 */
function onTick(){
    console.log(strategy.name+" waking up at "+Date());
    
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
    miners.sort(function(a,b){return b.spread - a.spread;});
    
    //Calculate Net Asset Value
    var nav = Number(balances.BTC.total);
    miners.forEach(function(miner){
        nav += Number(miner.nav);
    });
    nav = nav.toFixed(8);
    var nav_usd = Number(nav * Number(globals.btc_usd_rate)).toFixed(2);
    console.log("*********Pre Flight Checks End***********");
    console.log(Date());
    console.log("********Frank Sez*********");
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
    
    console.log("***********Miners By Spread***********");
    console.log("Miner : Spread : Best Ask : Best Bid");
    miners.forEach(function(miner){
        console.log(miner.name+" : "+miner.spread+" : "+miner.best_ask+" : "+miner.best_bid);
    });
    console.log("***********Owned Miners**************");
    var loop_max = Math.round(1/globals.split_factor);
    miners.forEach(function(miner,idx){
        if(Number(miner.holdings.total) > 0){
            var nav = Number(miner.nav).toFixed(8);
            var holdings = Number(miner.holdings.total);
            console.log(miner.name+": "+holdings+" worth "+nav+" BTC");
            
            if(miner.holdings.total > 0){
                miner.sell = true;
            }
            if(idx < loop_max){
                miner.buy = true;
            }
        }
    });
    console.log("************"+strategy.name+" Advice*************");
    miners.forEach(function(miner){
        if(miner.sell){
            var sellqty = miner.holdings.total * globals.split_factor;
            var sellprice = Number(miner.best_bid * (1 + globals.split_factor)).toFixed(8);
            var selltotal = (sellprice * globals.btc_usd_rate).toFixed(8);
            
            console.log("Sell "+sellqty+" of your "+miner.name+" "+" for "+sellprice+" giving you "+selltotal+"BTC use it to buy more "+miners[0].name);
        }else{
            if(miner.buy){
                console.log("Buy "+miner.name+" at "+miner.best_ask+" the spread is "+miner.spread);
            }
        }
    });
   
    console.log("********"+strategy.name+" Report End************");
    
    console.log("Alright so the nice robot just told us what to do, now let's pull the trigger on this and make some dough.");
  
    if(globals.training_wheels === "OFF"){
        console.log("It's so simple, all we gotta do is what the bot told us to.");
        
        miners.forEach(function(miner){
            var result;
            console.log("Puff...");
            if(miner.buy){
                var base_price = miner.best_ask;
                var floor_price = base_price * (1 - globals.split_factor).toFixed(8);
                var difference = Number(base_price - floor_price).toFixed(8);
                var distance = (difference * globals.split_factor).toFixed(8);
                var price = base_price;
                var amount = Math.round((Number(balances.BTC.amount)  / price) / globals.split_factor);
                
                //console.log("factor: "+factor);
                var counter = 1;
                console.log("Let's buy some "+miner.name+" baby!");
                while(counter <= loop_max){
                    price = Number(price).toFixed(8);
                    if(amount > 0){ 
                        console.log("Gettin ya "+amount+" GHS of "+miner.name+" for "+price+" is a good deal for step "+counter);
                        result = HashNestAPI.createOrder(miner.id, amount, price, "purchase");
                    }else{
                        console.log("Looks like you don't have any money right now.  I'll just go ahead and cancel some of these orders that haven't filled yet.");
                        result = HashNestAPI.cancelAllOrders(miner.id, "purchase");
                        console.log("Ahh that's better");
                    }
                    //console.log("distance: "+distance);
                    price -= distance;
                    counter++;
                }
             }
            console.log("Puff...");
            if(miner.sell){
               //console.log("miner.holdings: "+ (miner.holdings ? true : false ));
                var base_price = Number(miner.best_bid).toFixed(8);
                var price_ceil = base_price * (1 + globals.split_factor).toFixed(8);
                var difference = Number(price_ceil - base_price).toFixed(8);
                var distance = Number(difference / loop_max).toFixed(8);
                var amount = Math.round(Number(miner.holdings.amount) / loop_max);
                var counter = 1;
                var price = base_price;
                console.log("Sell distance: "+distance);
                while(counter <= loop_max){
                    if(Number(amount) > 0){
                        console.log("I'm in ur internet sellin all ur "+miner.name+" , watch this!");
                        console.log("Selling "+amount+" GHS for "+price+" is good enough for step "+counter);
                        result = HashNestAPI.createOrder(miner.id, amount, price, "sale");
                    }else{
                        console.log("Well the bot thought we had some for sale, turns out the bot was wrong.");
                        console.log("Oh wait I found some!");
                        result = HashNestAPI.cancelAllOrders(miner.id, "sale");
                        break;
                    }
                    price = Number(Number(distance) + Number(price)).toFixed(8);
                    counter++;
                }
            }
            if(!result){
                result = "Meh!  Looks like we can't do nothin this with "+miner.name+" right now, maybe next time.";
            }else{
                result ="Hey, what's this crap mean?\n"+result;
            }
            console.log(result);
        });
    }else{
        console.log("training_wheels: "+globals.training_wheels);
        console.log("Hey idjit!  I can't help you if you don't take the training wheels off, how 'bout you read the manual and get back to me later.");
    }
    
    console.log("Wow, I need to lay down a minute, be back in like "+StorageAPI.get("TICKRATE","300")+" seconds, tops.");
    console.log("********"+strategy.name+" Final Status*********");
    console.log(Date());
    console.log("Current BTC/USD rate: $"+globals.btc_usd_rate);
    console.log("*************User Assets**************");
    console.log("BTC balance: "+balances.BTC.total);
    console.log("Net Asset Value "+nav+" BTC worth $"+nav_usd);   
    console.log("***********Owned Miners**************");
    miners.forEach(function(miner,idx){
        if(Number(miner.holdings.total) > 0){
            var nav = Number(miner.nav).toFixed(8);
            var holdings = Number(miner.holdings.total);
            var daily_earnings = Number(miner.net_btc_per_ghs_daily * holdings).toFixed(8);
            console.log(miner.name+": "+holdings+" valued at "+nav+" BTC which is returning "+daily_earnings+" BTC daily.");
            //Only want the top performing miners here
            miner.sell = idx;
        }
    });   
    console.log("**********"+strategy.name+" v"+strategy.version+" End Report**********");
}

