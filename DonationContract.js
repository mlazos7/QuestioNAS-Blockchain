"use strict";

//var contract_address = "n1pPTuf9ttrzfNZAdYd68LRzFRHGYdFhjB2";

var ArticleItem = class{
    constructor(article_id,author,title,description,date){
        this.article_id = article_id;
        this.author = author;
        this.title = title;
        this.description = description;
        this.date = date;
    }
};

var DonationsContract = function () {
    LocalContractStorage.defineMapProperty(this,"hash_article");
    LocalContractStorage.defineProperty(this,"article_id");
    LocalContractStorage.defineMapProperty(this,"total_collected");
};

DonationsContract.prototype = {
	//Init is called once, when the contract is deployed
    init: function() {
        this.article_id = 1; //The first id should be 1 (not 0)
    },

    createArticle: function(title,description){

        title = title.trim();
        description = description.trim();
        
        if (title === "" || description === ""){
            throw new Error("You must complete all fields for submit an article");
        }

        if(Blockchain.transaction.value < 0){
    		throw new Error("You don't need pay to post a donations");
        }

        var article = new ArticleItem(
            this.article_id,
            Blockchain.transaction.from,
            title,
            description,
            Date.now()
        );

        this.hash_article.put(this.article_id, article);
        this.article_id++;  
    },

    getArticles: function (){
        var articles = [];

        for(var i = 1 ; i < this.article_id; i++){
            articles.push(this.hash_article.get(i));
        }
        
        return articles;
    },

    getArticleById: function(id){
        return this.hash_article.get(id)
    },

    getArticlesCount: function(){
        return this.article_id -1;
    },

    makeDonation: function(to_address){
        if(Blockchain.transaction.value < 0,01){
    		throw new Error("The minimum amount of donation is 0,01 NAS");
        }
        if(Blockchain.transaction.value > 1){
    		throw new Error("The max amount allow is 1 NAS");
        }

        var totalDonations = null;
        var donations = null;
        
    },

/*     getVote: function(hash){
    	return this.hash_vote.get(hash);
    } */
};

module.exports = DonationsContract;