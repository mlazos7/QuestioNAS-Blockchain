function GetQuestion(){
    nebPay.simulateCall(contract_address,0,"getQuestion",null,{
        qrcode: {
            showQRCode: false,
            completeTip: undefined, 
            cancelTip: undefined,
            container: undefined
         },
        callback: "https://pay.nebulas.io/api/pay",
        listener: ShowQuestion	
    });
}

function ShowQuestion(resp){

    var question = JSON.parse(resp.result);

    question.forEach(element => {
        console.log(element);
        
        var idSelector = "item-" + element.question_id;

        //Crear columna
        $('.questions').append(function(){				
            return `<div class="col-4"><form id="${idSelector}"></form></div>`
        });

        //Agregar titulo
        $('#' + idSelector).append(function(){
            return "<h5>" + element.title + "</h5>";
        });

        //Agregar Respuestas  //<label><input type="radio" value= "Brazil" name="vote">Brazil</label>
         element.answers.forEach(a => {
             $('#' + idSelector).append(function(){
                 var count_votes = `<i><small>(${a.count_votes} votes)</small></i>`
                 return `<div class="radio"><label><input type="radio" value="${a.item}" name="vote">${a.item} ${count_votes}</label></div>`
             });
        });

        //Agregar Boton
        $('#' + idSelector).append(function(){
            return `<button type="button" class="btn btn-primary btn-vote" value="${element.question_id}">Vote Now</button>`
        })
    });

    //Asignar evento al boton
    $('.btn-vote').on("click", SubmitVote);
}

function SubmitVote(){

    var question_id = this.value;
    var parentId = $(this).parent().attr('id');
    //Obtener la respuesta seleccionada
    var vote = $('#' + parentId + ' ' + 'input[name=vote]:checked').val(); 
    if(vote !== undefined){

        nebPay.call(contract_address,0,"voteQuestion",JSON.stringify([question_id,vote]),{
            qrcode: {
                showQRCode: false,
                completeTip: undefined, 
                cancelTip: undefined,
                container: undefined
             },
            callback: "https://pay.nebulas.io/api/pay",
            listener: function(resp){
                alert(resp.txhash);
            }
        });		 
    }
    else{
        alert("You must select an answer")
    }
}

function SubmitQuestion(e){

    e.preventDefault();
    var title = $("#question-form input[name=title]:first").val();
    if(title === undefined || title === ""){
        alert("Error: You must enter the question")
        return;
    }

    var fields = $("#question-form :input[name=fields]").serializeArray()

    var answers = []
    fields.forEach(e => {
        if(e.value !== ""){
            answers.push(e.value)
        }
    });

    if(answers.length < 2 || answers.length > 5){
        alert("Error: You must enter between 2 and 5 answers")
        return;
    }

    nebPay.call(contract_address,0,"postQuestion",JSON.stringify([title,answers]),{
        qrcode: {
            showQRCode: false,
            completeTip: undefined, 
            cancelTip: undefined,
            container: undefined
         },
        callback: "https://pay.nebulas.io/api/pay",
        listener: function(resp){
            alert(resp.txhash);
        }
    });		 

}
