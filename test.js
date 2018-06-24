var QuestionItem = class{
    constructor(question_id,author,title,answers,total_votes,date){
        this.question_id = question_id;
        this.author = author;
        this.title = title;
        this.answers = answers;     
        this.total_votes = total_votes
        this.date = date;
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

function Main(){

    console.log("Test QuestionContract:")

    var resp = ["resp1","resp2"];
    var item = AnswerItemsObj(resp);

    console.log(JSON.stringify(item));

    var needle = "resp2";

    for(var i = 0; i< item.length; i++){
        if(item[i].answer == needle){
            console.log("I Found it!");
            item[i].count_votes ++;
        }
    }

    console.log(JSON.stringify(item));
}


Main();

