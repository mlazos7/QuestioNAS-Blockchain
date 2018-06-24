"use strict";

//var contract_address_testnet = "n1nPMtWh2KKZCpXsd316WvAf9iwYX8C4ZDz";
//var contract_address_mainnet = "n1oBFQf3yeg6M5PHcjAcWZScnUJXA4Uz9B9";

var AnswerItem = function(item){
    this.item = item;
    this.count_votes = 0;
};

var QuestionItem = function(question_id,author,title,answers){
    this.question_id = question_id;
    this.author = author;
    this.title = title;
    this.answers = answers;     
    this.date = Date.now();
    this.total_votes = 0;
};

var QuestionContract = function () {
    LocalContractStorage.defineMapProperty(this,"hash_question");
    LocalContractStorage.defineMapProperty(this,"hash_my_votes");
    LocalContractStorage.defineProperty(this,"question_id");
};

QuestionContract.prototype = {

    init: function() {

        this.question_id = 1;

        //create first question
        var initialQuestion = new QuestionItem(
            this.question_id,
            Blockchain.transaction.from,
            "Would you like to try QuestioNAS?",
            new Array(new AnswerItem("Yes"),new AnswerItem("No"))
        );

        //put question
        this.hash_question.put(this.question_id, initialQuestion);        
        this.question_id++;
    },

    postQuestion: function(title,answers){

        title = title.trim();
        if (title === ""){
            throw new Error("You must enter the question");
        }
        if(!Array.isArray(answers)){
            throw new Error("You must enter an array");
        }
        else if(answers.length < 2 || answers.length > 5){
            throw new Error("You must enter between 2 and 5 answers");
        }
        if(Blockchain.transaction.value < 0){
    		throw new Error("You don't need pay to post a question");
        }

        //answers = ["item1","item2","item3"]
        var answerItems = [];
        for(var i=0; i< answers.length; i++){
            answerItems.push(new AnswerItem(answers[i]));
        }

        var question = new QuestionItem(
            this.question_id,
            Blockchain.transaction.from,
            title,
            answerItems
        );

        this.hash_question.put(this.question_id, question);
        this.question_id++;  
    },

    getQuestion: function (){
        //returns up to 30 questions
        var question = [];
        for(var i = 1 ; i <= this.question_id -1 ; i++){
            question.push(this.hash_question.get(i));
            if(i == 30){
                break;
            }
        }      
        return question.reverse();
    },

    getMyVotes: function(){
        return this.hash_my_votes.get(Blockchain.transaction.from);
    },

    getQuestionById: function(question_id){
        return this.hash_question.get(question_id)
    },

    getQuestionCount: function(){
        return this.question_id -1;
    },

    voteQuestion: function(question_id,option){

        var from_address = null;
        var question = null;
        var my_votes = [];

        //Chequear que la alternativa seleccionada no este vacia
        option = option.trim();
        if(option === ""){
            throw new Error("You must select one answer");
        }

        //Chequear existencia de votos anteriores
        from_address = Blockchain.transaction.from;  
        my_votes = this.hash_my_votes.get(from_address);
        if(my_votes){ 
            //Si tengo votos, verificar que yo no haya respondido esta pregunta
            for(var i=0; i< my_votes.length; i++){
                if(my_votes[i] == question_id){ 
                    // Ya vote en esta pregunta
                    throw new Error("You already voted on this question");
                }
            }
        }else{
            my_votes = [];
        }

        //Obtenemos la pregunta
        question = this.hash_question.get(question_id);    
        //Chequear que la alternativa seleccionada exista como respuesta
        var found_option = false;
        for(var i = 0; i< question.answers.length; i++){
            if(question.answers[i].item == option){
                found_option = true;
                question.answers[i].count_votes ++;
                question.total_votes ++;
                break;
            }
        }
        if(!found_option){ //Si no existe
            throw new Error("The answer that you select doesn't exist");
        }

        //Actualizo la pregunta
        this.hash_question.put(question_id,question);
        //Agrego la pregunta a mis voto
        my_votes.push(question_id)
        this.hash_my_votes.put(from_address,my_votes);    
    }
};

module.exports = QuestionContract;