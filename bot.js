var TelegramBot = require('node-telegram-bot-api');
var token = '1330014271:AAFoYwCF54yV1JTVtxIt8gqOxyUxDqyjt50';
var bot = new TelegramBot(token,{polling: true});
var request = require('request');

bot.onText(/\/echo (.+)/, function(msg, match){
    var chatID = msg.chat.id;
    var echo = match[1];
    bot.sendMessage(chatID,echo);
});

bot.onText(/\/start (.+)/, function(msg,match){
    var chatID = msg.chat.id;
    console.log("WAEdgfhg");
    //bot.sendMessage(chatID, "Hello there! I'm a chatbot. Please use _/movie [movie_name]_ to get details about a movie.",{parse_mode:"Markdown"})
});

bot.onText(/\/movie(.+)/, function(msg,match){
    var movie = match[1];
    var chatID = msg.chat.id;
    movie = movie.substr(1,movie.length);
    request(`http://www.omdbapi.com/?apikey=8b3243de&t=${movie}`, function(err,response,body){
        if(!err && response.statusCode == 200) {
            var res = JSON.parse(body);
            var ratings = res.Ratings;
            var rat = [];
            ratings.forEach(element => {
                rat.push([element.Source,element.Value]);
            });
            var str = "";
            for(var i=0;i<rat.length;i++) {
                str+= rat[i][0] + ": " + rat[i][1] + "\n";
            }
            bot.sendMessage(chatID,"*Runtime*: " + res.Runtime + "\n*Genre*: " + res.Genre + "\n*Plot*: " + res.Plot + "\n*Ratings*:\n" + str + "IMDB: " + res.imdbRating,{parse_mode:'Markdown'});
            bot.sendPhoto(chatID,res.Poster);
        }
    });
});