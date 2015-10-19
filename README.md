# strategies
This repository is where you will find the public trading strategies for the community edition of Hashbuddy 

At the moment there are two strategies for you to try out.

You can select a strategy by adding it to the command line of the engine.

java -jar hashbuddy.jar --strategy=strategies/advizer.js

Once you've test your chosen strategy it's helpful to create a shell script or batch file to start it for example

nano hashbuddy.sh
#begin auto-restart script
java -Djsse.enableSNIExtension=false -jar hashbuddy.jar \
--TICKRATE=300 \
--HASHNESTAPIUSERNAME=yourname \
--HASHNESTAPIKEY=changeme \
--HASHNESTAPISECRET=changeme \
--ANTPOOLAPIKEY=changeme \
--ANTPOOLAPISECRET=changeme \
--ANTPOOLUSERNAME=changeme \
--strategy=strategies/frank_the_third.js \
--training-wheels="ON"

echo "Something happened, the strategy crash, to exit you must press ctrl+c really fast!
sleep 10
hashbuddy.sh  
#end of script
Save it 
ctrl+s (with nano)

make it executable 
chmod +x hashbuddy.sh

and start it up
./hashbuddy.sh

Before doing ANY of that, you should examine the code very closely so you understand what's going on.

The first strategy is Advizer, it's purpose is to examine your portfolio and make simplified trading recommendations.
Advizer uses a very simple yield strategy and does not do any trading.

If you would like to make automated trades using Advizer then make a copy of it (for later reference) and rename it.
From there all you need to do is add buy & sell API calls.

You should look at strategies/frank_the_third.js for examples of how to implement the buy and sell calls.
It's very straightforward, to do this, the information is not provided directly here because of the odds that a yield strategy might return sub-optimal results.
For example, S3 is frequently the highest yielding hash at hashnest.  
However, a single long block can wipe out several days of mining earnings.
This is a risk you take with yield trading.

Yield trading works best when humans are in control and trades are occuring every few blocks, instead of every 5 minutes.
It needs time to work because it's trying to maximize mining earnings while still generating a little trading income on the side.

The ideal tick rate for Advizer to give you the best advice is about 300 seconds.  
In an ideal world this will get you 2 pieces of advice per block.
The yield calculation factors in long blocks, thus an S3 will begin to return negative yields at lower BTCUSD rates and longer block times.
If you just hook up Advizer directly to trading, it will dump anything with a 0 or negative yield at market rates.
A human should use common sense and not do that unless the loss from negative mining earnings is greater than the loss from dumping.  
Feel free to add some common sense to Advizer.


The second strategy we provide is Frank the third.  
This is a considerably more advanced trading strategy. 
It is a hybrid of spread and yield.  
It will first sort by spread and then eliminate any positions with a negative yield.

It makes a very good basis for your to begin building your own bot.
If you turn off the training wheels, it will trade.
It is "batteries included", although not really the safest strategy if you're trading large amounts.  (which you never should).

At a tick rate of 200 seconds or lower, the bot can easily keep up with most of the spread changes that occur on hashnest, without overwhelming the hashnest API with too many calls and thus getting you rate limited or banned.
If you set the tick rate to 120 seconds (2 mins or lower), you may quickly find yourself rate limited, Hashnest's API endpoints tend to be tempramental that way.
Rate limiting is bad because you get stale information, a bot like frank the third needs good, up to date information, or it will make really bad decisions.

No matter what you choose to do, please ONLY use these bots with small accounts without very much money in them.

1 BTC in the account should be more than enough.

It is considered best practice to shut your bot down daily, examine it's logs, and review your current positions.  
Mistakes can and do happen, we try for high levels of safety, but sometimes junk will slip through and when that happens you just have to deal with the outcome.

Watch what your bot does and how it's thinking.  
Re-evaluate the logic structure and always try to tinker with it for optimal performance.
When your bot has made a profit on the day, don't get greedy.  
Shut it down, log into your account and draw your balance down before restarting it.

Also keep in mind that these bots are starting places for you to build your own bot that trades like you would trade.
Everyone has different preferences and ideas about what is best.  
Feel free to modify your bot to trade like you would, in fact it should make the same decisions you would.
If you don't know how you would make decisions, then you should not be using a bot, you'll only accelerate your losses.

Bots should only be used to implement strategies that you feel will work.  
If your strategies would be profitable by manual trading, then the bot will automate and accelerate your gains.
If your strategies would take losses in manual trading, then the bot will automate and accelerate your losses.

Therefore consider carefully your strategy before executing it, and try running it by hand for a few days before automating it.

Some things to keep in mind...

These bots only consider the present conditions, they do not look at historical data.  
Feeds are present and easily accesible in the API, but it has been intentionally left as an excersize to you, on how to utilize those feeds to maximum effect.

We provide these strategies free to you with the understanding that they are only demonstrations of how to implement simple algorithmic trades and we are not responsible for the results.
You may make money, you may suffer losses, all any bot does is automate the process of doing so.
  
If you run any of these strategies, you are explicitly releasing us of any liability.  
Generally we feel that they're pretty safe, but you should review the code.
And especially with frank, don't remove his training wheels until you've read the code and feel comfortable with what he's planning to do. 

If you would like more information about how to construct your very own bot, please check the wiki frequently.
Coming soon!
Also hashbuddy.io is being setup as a valuable resource for the community. 
We are also creating a market for professionally crafted strategies that can provide more optimal results.
If you are a programmer and would like to earn some extra money, you should consider the strategy market as another possible revenue source.

Some final words...

Remember above all else.  Have fun & try to make lots of money!

If this software has been of any use to you, please remember that was provided to you entirely free and is entirely community supported.
We are doing this to give you an edge, because we know how it is to have to do everything by hand.

Several people have been involved in it's development and we all share any tips that come through equally.
If you feel that all this effort has been worth something to you, please consider donating.
While we don't provide individualized support at this time, that is coming in the future.

Bob & Ash have setup a coinsplit tip jar at.
# 1LpvaYjpphVnbAYMhV5gEbBrVMs2Dxbnk5

This tip jar is split among all regular contributors and more people will be added as the community grows.


Thank You for taking the time to read this,
Your Friends @ hashbuddy.io

(to remove the training wheels just add the command line parameter --training-wheels="OFF")
