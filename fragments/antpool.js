/**
 * Support file for antpool specific computations, provide "pool" global object
 */
"use strict";

//How many blocks the pool found in the last 24hrs and a few other important bits  
//This is updated by examinePoolBlocks, but we want to init it here just in case
var pool = {
    blocks_per_day : 1,
    total_ghs : 1,
    one_ghs_factor : 0.000000000001,
    avg_mins_per_block : 1000000000,
    //This number is based on an ideal miner with no maint, it is set in examinePoolBlocks
    btc_per_block_per_ghs : 0.00000000000001, 
    //The last 6 blocks.  These are important, because the last 5 blocks are unpaid if one is over long_block_time we should exit before we are charged maintenance
    unpaid_blocks : [],

    /**
     * Here we make some interesting computations about the blocks produced by ant pool over a rolling 24hr window
     * We don't want to trust antpool for this information, so we source the data from blockchain.info
     *  * @param {type} block_feed
     * @returns {undefined}
     */

    examinePoolBlocks: function(block_feed){
        pool.unpaid_blocks = [];
        var blocks = block_feed.blocks;
        var length = blocks.length;
        var now = Number(new Date()) / 1000;
        var limit = now - (24 * 60 * 60);

        //Blockfeed gave us several days of data, we're only interested in the last 24hrs.
        var idx = 0;
        var prevFoundTime = now;
        var interval = 0;
        var interval_accum = 0;
            //This logic can get confusing, as idx goes up we are going back in time, thus the .time goes down.
        for(; idx <= length; idx++){
            var currentBlock = blocks[idx];
            var foundTime = currentBlock.time;

            interval = prevFoundTime - foundTime;

            //Unpaid blocks (base assumption here is wrong, needs a collate against actual found blocks, this is pool blocks only
            if(idx <=5 ){
                currentBlock.time_spent = Math.round(interval); //Should be seconds
                pool.unpaid_blocks.push(currentBlock);
            }
            //Check to see if we're outside the 24hr sliding window that we care about
            if(foundTime <= limit){
                break;
            }
            interval_accum += interval;
            prevFoundTime = foundTime;
        }

        pool.blocks_per_day = idx;
        pool.avg_mins_per_block = Math.round((interval_accum / pool.blocks_per_day) / 60);
        //Now all we need to know is what the pool total hashrate is
        pool.total_ghs = Number(globals.pool_info.data.poolHashrate) / 1000;  //This was in MHS we needed to convert to GHS
        pool.one_ghs_factor = 1 / pool.total_ghs;
        pool.btc_per_block_per_ghs = Number(pool.one_ghs_factor * globals.coins_per_block).toFixed(8);

    }
};


