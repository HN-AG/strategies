/**
 * Common functions needed for setting up a hashnest specific information.
 * You should not edit this, instead always work on a copy
 */
"use strict";

//APIs are given to the script by the framework.  We are declaring them here so the file passes jslint
var HashNestAPI;

var hashnest = {
    /**
    * Sets up the miner object for the rest of the trading strategy
    * @param {type} name
    * @param {type} id
    * @param {type} daily_fee_usd
    * @returns {prepare.x}
    */
   createMiner: function(name, id, daily_fee_usd){

       var x = {
           name : name,
           id : id,
           daily_fee_usd : daily_fee_usd,
           orderbook : JSON.parse(HashNestAPI.getOrderBooks(id)),
           orders : {
               active : JSON.parse(HashNestAPI.getUserActiveOrders(id)),
               complete : JSON.parse(HashNestAPI.getUserOrderHistory(id))
           },
           history : JSON.parse(HashNestAPI.getMarketHistory(id)),
       };

       //Check we have all our data, or it can crash, the script will automatically restart after 2 mins
       if(!x.orderbook || !x.orders
               || !x.orderbook.sale || !isArray(x.orderbook.sale)
               || !x.orderbook.purchase || !isArray(x.orderbook.purchase)
               ||!x.orders.active || !isArray(x.orders.active) 
               || !x.orders.complete || !isArray(x.orders.complete) 
               || !x.history || !isArray(x.history)
               ){

           console.log("failure to obtain some data for "+x.name);
           console.log(x.name+": "+JSON.stringify(x));
           return false;
       }else{
           console.log(x.name+" passes pre-flight checks");
       }

       //Loop through balances_hashrate, find x.name and attach as holdings
       for(var idx = 0; idx <= balances.hashrate.length -1; idx++){
           var obj = balances.hashrate[idx];
           //console.log("Examining: "+obj.currency.code);
           if(obj.currency.code.indexOf(x.name) > -1){
               x.holdings = obj;
               break;
           }
       }
       //Historical facts
       x.total_cost = 0;
       var count = 0;
       x.orders.complete.forEach(function(order,idx){
           //console.log("history "+idx+" : "+JSON.stringify(order));
           if(order.category ==="purchase"){
                x.total_cost += Number(order.ppc);
                count++;
            }
       });
       x.unit_cost = Number(x.total_cost / count).toFixed(8);

       //Trading info
       x.best_ask = Number(x.orderbook.sale[0].ppc).toFixed(8);
       x.best_bid = Number(x.orderbook.purchase[0].ppc).toFixed(8);
       x.spread = Math.abs(x.best_ask - x.best_bid).toFixed(8); //funky crap could happen if spread is negative
       x.mid_price = Number(Number(x.best_ask) + Number(x.best_bid)).toFixed(8) / 2;
       x.ghs_per_btc = Number(1.0 / x.best_ask).toFixed(8);
       x.nav = Number(Number(x.holdings.total) * Number(x.best_bid));
       if(isNaN(x.unit_cost)){
           x.unit_cost = x.best_ask;
       }
       //Mining info
       x.gross_btc_per_block_per_ghs = pool.btc_per_block_per_ghs;

       x.daily_fee_btc = Number(x.daily_fee_usd / Number(globals.btc_usd_rate)).toFixed(8);
       x.fees_per_minute = x.daily_fee_btc / 24 / 60;
       x.avg_fees_per_block = pool.avg_mins_per_block * x.fees_per_minute;
       //We use gross in this calculation because net would double the fees
       x.allowed_mins_per_block = Math.round(x.gross_btc_per_block_per_ghs / x.fees_per_minute);

       x.gross_btc_per_ghs_daily = Number((pool.btc_per_block_per_ghs * pool.blocks_per_day)).toFixed(8);
       //Had to change to gross from net, leave this the hell alone, if you use net here you're screwing up
       x.net_btc_per_ghs_daily = Number(x.gross_btc_per_ghs_daily - x.daily_fee_btc).toFixed(8);


       x.net_earnings_per_btc_daily = Number(x.ghs_per_btc * x.net_btc_per_ghs_daily).toFixed(8);   
       x.roi_days = Math.round(x.mid_price / x.net_btc_per_ghs_daily);
       x.yield = x.net_earnings_per_btc_daily; //Yes we're just renaming it because it's more common outside this function

       return x;
   },
   
   cancelAllOrders : function(miner){
       var orders = miner.orders.active;
       console.log("cancelling: "+JSON.stringify(orders));
       orders.forEach(function(order){
            console.log("Cancelling order: "+order.id);
            HashNestAPI.cancelOrder(order.id);
       });
   }
}