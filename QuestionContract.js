"use strict";

//var contract_address = "n1otKVaAaCuf4GMovbepRbSETUx4CyMX8hd";

var QuestionItem = class{
    constructor(question_id,author,title,answers){
        this.question_id = question_id;
        this.author = author;
        this.title = title;
        this.answers = answers;     
        this.total_votes = 0;
        this.date = Date.now();
    }
};

function AnswerItemsObj(data)
{
    if(data){
        var answers = [];
        var item = null;
        for( var i=0; i<data.length; i++){
            item = {answer: data[i], count_votes: 0}
            answers.push(item);
        }
        return answers;
    }
}


var QuestionContract = function () {
    LocalContractStorage.defineMapProperty(this,"hash_question");
    LocalContractStorage.defineProperty(this,"question_id");
    LocalContractStorage.defineMapProperty(this,"total_question");
};

QuestionContract.prototype = {
	//Init is called once, when the contract is deployed
    init: function() {
        this.question_id = 1; //The first id should be 1 (not 0)
    },

    postQuestion: function(title,answers){

        title = title.trim();
        if (title === ""){
            throw new Error("You must enter the question");
        }
        if(!Array.isArray(answers)){
            throw new Error("You must enter an array");
        }
        else if(answers.length < 2){
            throw new Error("You must enter at least 2 answer");
        }

        if(Blockchain.transaction.value < 0){
    		throw new Error("You don't need pay to post a question");
        }

        var items = AnswerItemsObj(answers);

        var question = new QuestionItem(
            this.question_id,
            Blockchain.transaction.from,
            title,
            items,
        );

        this.hash_question.put(this.question_id, question);
        this.question_id++;  
    },

    getQuestion: function (){
        var question = [];
        for(var i = 1 ; i < this.question_id; i++){
            question.push(this.hash_question.get(i));
        }      
        return question;
    },

    getQuestionById: function(question_id){
        return this.hash_question.get(question_id)
    },

    getQuestionCount: function(){
        return this.question_id -1;
    },

    voteQuestion: function(question_id,option){
        option = option.trim();
        if(option === ""){
            throw new Error("You must select one answer");
        }
        var question = this.hash_question.get(question_id);
        var found_option = false;

        for(var i = 0; i< question.answers.length; i++){
            if(question.answers[i].answer == option){
                found_option = true;
                question.answers[i].count_votes ++;
                question.total_votes ++;
            }
        }

        if(!found_option){
            throw new Error("The answer that you select doesn't exist");
        }
        
        return question;
    }
};

module.exports = QuestionContract;