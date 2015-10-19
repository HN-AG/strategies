# strategies
This repository is where you will find the public trading strategies for the community edition of Hashbuddy 

At the moment there are two strategies for you to try out.

You can select a strategy by adding it to the command line of the engine.

java -jar hashbuddy.jar --strategy=strategies/advizer.js

Once you've test your chosen strategy it's helpful to create a shell script or batch file to start it for example
An example of how to create an outrestar script

nano hashbuddy.sh

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

EOF

Save it 
ctrl+s (with nano)

make it executable 
chmod +x hashbuddy.sh

and start it up
./hashbuddy.sh

Before doing ANY of that, you should examine the code very closely so you understand what's going on.

If you're a programmer and just want to jump into making a bot with the framework, you should start with main.js which shows you how to create a strategy that is compliant with the API without rendering any sort of opinions.
Examining it is a great way to learn how to build your own from scratch, in the meantime we have provided 2 sample strategies you can play with.
As long as you do not explicitly remove the training wheels, no orders will execute and so you're pretty safe.
When developing a strategy, you should leave the training wheels on and manually perform the trades until you feel confident that the bot is trading the same way you would trade.

Remember these rules when developing strategies:  
#1  A bot only executes a strategy you select.  
#2  The strategy is what wins and what loses.  
#3  All the bot is doing is automating and accelerating your strategy, this is true for wins and losses.
#4  Leave the training wheels on until you are perfectly comfortable with what your bot is telling you to do by hand.
#5  Not all strategies that win, will win in every situation.
#6  Not all strategies that lose, will lose in every situation.
#7  Trade with only small amounts.
#8  Experiment only with even smaller amounts.

Now the rules are out of the way it's time to talk about the 2 demo strategies.

The first strategy is Advizer, it's purpose is to examine your portfolio and make simplified trading recommendations.
Advizer uses a very simple yield strategy.

If you would like to make automated trades using Advizer, you need to remove the training wheels, this is a new thing.  
Previous versions of Advizer did not trade at all, but after feedback from early testers, we decided to let you put on your big boy pants and shoot yourself in the foot.

We do not advise you to remove the training wheels without examining the code and looking closely at how it makes it's decisions.
On the whole it should be fine but keep in mind that a yield strategy might return sub-optimal results especially in the short term.

For example, S3 is frequently the highest yielding miner type at hashnest.  
However, a single long block can wipe out several days of mining earnings for S3 at current rates and difficulty levels and Antpool is world famous for it's random long blocks.
This is a risk you take with yield trading, over the long haul yield trading does provide good, consistent performance, but lacks the huge gains from properly executed spread trading.

Yield trading works best when humans are in control and trades are occurring every few blocks, instead of every 5 minutes.
The strategy needs time to work because it's trying to maximize mining earnings while still generating a little trading income on the side.

The ideal tick rate for Advizer to give you the best advice is about 300 seconds.  
In an ideal world, this will net you really good advice per block, but if you're trading on every single advice you'll find that your Net Worth is dipping unless the market makes a major move or the yields change drastically.

The yield calculation already factors in long blocks, that's a good thing but it's not a perfect calculation.

At current pricing an hashrate in general will begin to return negative yields at lower BTCUSD rates and longer block times.

If you take the training wheels off and allow Advizer to directly do the trading, it will immediately dump ANYTHING with a 0 or negative yield.

It will do that dump at market rates.
A human should use common sense and not do that unless the loss from negative mining earnings is greater than the loss from dumping.  
Feel free to add some common sense to Advizer before allowing it to do that, it's simple math and a good place to start coding your own bot from.


The second strategy we provide is Frank the third.  
This is a considerably more advanced trading strategy. 
It is a hybrid of spread and yield.  

It will first sort by spread and then eliminate any positions with a negative yield, and try not to invest in those in the first place.

It makes a very good basis for your to begin building your own bot.
If you turn off the training wheels, it will trade.
It is "batteries included" and very opinionated, it may also insult you from time to time, just roll with it.

This is not really the safest strategy if you're trading large amounts.  (which you never should).

At a tick rate of 200 seconds or lower, the bot can easily keep up with most of the spread changes that occur on hashnest, without overwhelming the hashnest API with too many calls and thus getting you rate limited or banned.
If you set the tick rate to 120 seconds (2 mins or lower), you may quickly find yourself rate limited by hashnest.
Hashnest's API endpoints tend to be temperamental that way.
Rate limiting is bad because you get stale information, a bot like frank the third needs good, up to date information, or it will make really bad decisions.

#Words of Advice
Whereas Advizer performs best with fewer trades, Frank the third performs best with more trades.

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
Feeds are present and easily accessible in the API, but it has been intentionally left as an excercise to you, on how to utilize those feeds to maximum effect.

We provide these strategies free to you with the understanding that they are only demonstrations of how to implement simple algorithmic trades and we are not responsible for the results.
You may make money, you may suffer losses, all any bot does is automate the process of doing so.
  
If you run any of these strategies, you are explicitly releasing us of any liability.  
Generally we feel that they're pretty safe, but you should review the code.
And especially with frank, don't remove his training wheels until you have read the code and feel comfortable with what he's planning to do with your assets. 

If you would like more information about how to construct your very own bot, please check the wiki frequently.

#Coming soon!
hashbuddy.io is being setup as a valuable resource for the community. 
We are also creating a market for professionally crafted strategies that can provide more optimal results.
If you are a programmer and would like to earn some extra money, you should consider the strategy market as another possible revenue source.

#Some final words...

##Remember above all else.  Have fun & try to make lots of money!

If this software has been of any use to you, please remember that was provided to you entirely free and is 100% community supported.
We are doing this to give you an edge, because we know how it is to have to do everything by hand.

Several people have been involved in it's development and we all share any tips or donations that come through equally.
If you feel that all this effort has been worth something to you, please consider donating.
While we don't provide individualized support at this time, that is coming in the future.

Bob & Ash have setup a coinsplit tip jar at.
#1LpvaYjpphVnbAYMhV5gEbBrVMs2Dxbnk5

Donations to this tip jar are split among all regular contributors and more people will be added as the community grows.

Thank You for taking the time to read this,
Your Friends @ hashbuddy.io

(to remove the training wheels add the command line parameter --training-wheels="OFF")