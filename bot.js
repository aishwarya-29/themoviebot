var TelegramBot = require('node-telegram-bot-api');
var token = '1330014271:AAFoYwCF54yV1JTVtxIt8gqOxyUxDqyjt50';
var bot = new TelegramBot(token,{polling: true});
var request = require('request');
const e = require('express');
var currentlyChatting = false,alreadySent = false;

bot.onText(/\/echo (.+)/, function(msg, match){
    var chatID = msg.chat.id;
    var echo = match[1];
    bot.sendMessage(chatID,echo);
});

bot.onText(/^\/start$/, function(msg,match){
    var chatID = msg.chat.id;
    bot.sendMessage(chatID, "Hello there! I'm a chatbot. \nUse the following commands!  \n*/movie <movie-name>* : get info about a movie. \n*/recommend <movie-name>* : suggest similar movies.",{parse_mode:"Markdown"})
});


bot.onText(/\/movie(.+)/, function (msg,match){
    var movie = match[1];
    var chatID = msg.chat.id;
    movie = movie.substr(1,movie.length);
    request(`http://www.omdbapi.com/?apikey=8b3243de&t=${movie}`, function(err,response,body){
        if(!err && response.statusCode == 200) {
            var res = JSON.parse(body);
            var ratings = res.Ratings;
            var rat = [];
            var str = "";
            if(ratings) {
                ratings.forEach(element => {
                    rat.push([element.Source,element.Value]);
                });
                for(var i=0;i<rat.length;i++) {
                    str+= rat[i][0] + ": " + rat[i][1] + "\n";
                }
            }
            bot.sendMessage(chatID,"*Runtime*: " + res.Runtime + "\n*Genre*: " + res.Genre + "\n*Plot*: " + res.Plot + "\n*Ratings*:\n" + str + "IMDB: " + res.imdbRating,{parse_mode:'Markdown'});
            bot.sendPhoto(chatID,res.Poster);
        }
    });
});

bot.onText(/\/recommend(.+)/, function(msg,match){
    var chatID = msg.chat.id;
    var movie = match[1];
    currentlyChatting = true;
    var currInd = 0;
    sendRecommendations(chatID,0,movie);
    setTimeout(function(){
        ask(chatID);
    },5000);
    bot.on('message',(msg) => {
        if(currentlyChatting) {
            if(msg.text.toString().toLowerCase() == "yes") {
                currInd+=5;
                sendRecommendations(chatID,currInd,movie);
                setTimeout(function(){
                    ask(chatID);
                },5000);
            } else if(msg.text.toString().toLowerCase() == "no"){
                bot.sendMessage(msg.chat.id, "Cool! Hope you found what you were looking for.");
                currentlyChatting = false;
            }
        }
    });
    
});

function sendRecommendations(chatID,currNum,movie) {
    request('https://api.themoviedb.org/3/search/movie?api_key=fc2e228c666880dd9a0a900e34947de9&language=en-US&query='+movie+'&page=1&include_adult=false', function(err,response,body){
        if(!err && response.statusCode == 200) {
            var res = JSON.parse(body);
            var id = res.results[0].id;
            request('https://api.themoviedb.org/3/movie/'+id+'/recommendations?api_key=fc2e228c666880dd9a0a900e34947de9&language=en-US', function(err,response,body){
                var resp = JSON.parse(body);
                var num = 5;
                if(resp.results.length-currNum < 5)
                    num = resp.results.length-currNum;
                for(var i=currNum;i<currNum+num;i++) {
                    bot.sendPhoto(chatID,'http://image.tmdb.org/t/p/w185//'+resp.results[i].poster_path,{caption:"*Title:* " + resp.results[i].title + "\n*Plot:* " + resp.results[i].overview, parse_mode:'Markdown'});
                }
            });
        }
    });
    alreadySent = false;
}

function ask(chatID) {
    const opts = {
        reply_markup: {
            resize_keyboard: true,
            one_time_keyboard: true,
            keyboard: [ ['Yes'],['No'] ]
        }
    };
    if(alreadySent == false) {
        bot.sendMessage(chatID, "Do you want more suggestions?", opts); 
        alreadySent = true;
    }
    else {

    }
}