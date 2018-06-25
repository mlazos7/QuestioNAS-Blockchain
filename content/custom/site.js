var contract_address = "n1oBFQf3yeg6M5PHcjAcWZScnUJXA4Uz9B9"
var NebPay = require("nebpay")
var nebPay = new NebPay()

$(document).ready(function () {

    $('#btn-refresh').click(function () {
        window.location.reload();
    });

    if (typeof (webExtensionWallet) === "undefined") {
        $('#no-extension').css('display','block');
        return;
    };

    $('#loading-question').css('display', 'block');

    $('#btn-submit-question').on('click', function () {
        $('#question-form').submit();
    });

    $('#question-form').on('submit', SubmitQuestion);

    GetQuestion();

    $(document).on('click', '.btn-add', function (e) {

        e.preventDefault();

        var controlForm = $('.controls form:first'),
            currentEntry = $(this).parents('.entry:first'),
            newEntry = $(currentEntry.clone()).appendTo(controlForm);

        newEntry.find('input').val('');
        controlForm.find('.entry:not(:last) .btn-add')
            .removeClass('btn-add').addClass('btn-remove')
            .removeClass('btn-success').addClass('btn-danger')
            .html('<span class="fas fa-minus"></span>');
    }).on('click', '.btn-remove', function (e) {

        $(this).parents('.entry:first').remove();
        e.preventDefault();
    });
});


function GetQuestion() {
    nebPay.simulateCall(contract_address, 0, "getQuestion", null, {
        qrcode: {
            showQRCode: false,
            completeTip: undefined,
            cancelTip: undefined,
            container: undefined
        },
        listener: ShowQuestion
    });
}

function ShowQuestion(resp) {

    $('#loading-question').css('display', 'none');

    if(resp.result === "" && resp.execute_err === "contract check failed"){
        $('#no-extension').text("Switch the NAS extension to mainnet.");
        $('#no-extension').css('display','block');
        return;
    }
    var question = JSON.parse(resp.result);

    question.forEach(element => {

        var idSelector = "item-" + element.question_id;

        //Crear columna y tarjeta
        $('#row-questions').append(function () {
            return `<div class="col-md-4"><div class="card mb-4 box-shadow" id="card-${idSelector}"></div></div>`;
        });

        //Agregar header con el titulo de la pregunta
        $('#card-' + idSelector).append(function () {
            return '<div class="card-header text-white bg-secondary"><p><b>' + element.title + '</b></p></div>';
        });

        //Crear inputs de respuestas
        var answersHtml = "";
        element.answers.forEach(a => {
            var count_votes = `<i><small>(${a.count_votes} votes)</small></i>`
            answersHtml += `<div class="radio"><label><input type="radio" value="${a.item}" name="vote">${a.item} ${count_votes}</label></div>`;
        });

        //Agregar card-body
        $('#card-' + idSelector).append(function () {
            return '<div class="card-body"><form class="form-vote">' +
                answersHtml +
                `<input name="question_id" type="hidden" value="${element.question_id}">` +
                '<div class="d-flex justify-content-between align-items-center">' +
                '<button type="submit" class="btn btn-sm btn-info btn-vote">Vote Now</button>' +
                `<small class="text-muted">Total votes: ${element.total_votes}</small>` +
                '</div>' +
                '</form></div>';
        });
    });

    //Asignar handler on submite al form 
    $('.form-vote').on("submit", SubmitVote);
}

function SubmitVote(e) {

    e.preventDefault();
    //question_id
    var question_id = $(this).find('input[name=question_id]').val();
    //Obtener las respuesta seleccionadas
    var vote = $(this).find('input[name=vote]:checked').val();
    //Call Smart Contract
    if (vote !== undefined) {
        nebPay.call(contract_address, 0, "voteQuestion", JSON.stringify([question_id, vote]), {
            qrcode: {
                showQRCode: false,
                completeTip: undefined,
                cancelTip: undefined,
                container: undefined
            },
            listener: function (resp) {
                if(resp === "Error: Transaction rejected by user" ){
                    alert(resp);
                    return;
                }
                else{
                    alert("Your transaction has been submitted");
                    console.log("SubmitVote tx => " + resp.txhash);
                }
            }
        });
    }
    else {
        alert("You must select an answer");
    }
}

function SubmitQuestion(e) {

    e.preventDefault();
    var title = $(this).find("input[name=title]:first").val();
    if (title === undefined || title === "") {
        alert("Error: You must enter the question");
        return;
    }
    if(title.length >= 100){
        alert("Plase enter a question with 100 characteres max");
        return;
    }

    var fields = $(this).find(':input[name=fields]').serializeArray();

    //Agregar las respuesta a un array, excepto las vacias.
    var answers = [];
    fields.forEach(e => {
        if (e.value !== "") {
            answers.push(e.value)
        }
    });

    if (answers.length < 2 || answers.length > 5) {
        alert("Error: You must enter between 2 and 5 answers");
        return;
    }

    nebPay.call(contract_address, 0, "postQuestion", JSON.stringify([title, answers]), {
        qrcode: {
            showQRCode: false,
            completeTip: undefined,
            cancelTip: undefined,
            container: undefined
        },
        listener: function (resp) {
            $('#add-question-modal').modal('toggle');
            if(resp === "Error: Transaction rejected by user" ){
                alert(resp);
                return;
            }
            else{
                alert("Your transaction has been submitted");
                console.log("SubmitQuestion tx => " + resp.txhash);
            }
        }
    });
}
