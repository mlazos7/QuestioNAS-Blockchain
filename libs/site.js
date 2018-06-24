var contract_address = "n1n6TjekYfXGNkXWFqCBL7Y4eR9TU2bZB18"
var NebPay = require("nebpay")
var nebPay = new NebPay()

$(document).ready(function () {

    if (typeof (webExtensionWallet) === "undefined") {
        alert("Extension wallet is not installed, please install it first.")
    };

    GetQuestion();

    /*     $('#btn-submit-question').on('click', function () {
            $('#question-form').submit();
        });
    
        $('#question-form').on('submit', SubmitQuestion) */

    $('#btn-refresh').click(function () {
        window.location.reload();
    });
});

$(function () {
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
        callback: "https://pay.nebulas.io/api/pay",
        listener: ShowQuestion
    });
}

function ShowQuestion(resp) {

    $('#loading-question').css('display','none');

    var question = JSON.parse(resp.result);

    question.forEach(element => {

        var idSelector = "item-" + element.question_id;

        //Crear columna y tarjeta
        $('.row').append(function () {
            return `<div class="col-md-4"><div class="card mb-4 box-shadow" id="card-${idSelector}"></div></div>`
        });

        //Agregar header con el titulo de la pregunta
        $('#card-' + idSelector).append(function () {
            return '<div class="card-header text-white bg-secondary"><p><b>' + element.title + '</b></p></div>'
        });

        //Crear inputs de respuestas
        var answersHtml = ""
        element.answers.forEach(a => {
                var count_votes = `<i><small>(${a.count_votes} votes)</small></i>`
                answersHtml += `<div class="radio"><label><input type="radio" value="${a.item}" name="vote">${a.item} ${count_votes}</label></div>`
        });

        //Agregar card-body
        $('#card-' + idSelector).append(function () {
            return '<div class="card-body"><form class="form-vote">'+
                    answersHtml +
                    `<input name="question_id" type="hidden" value="${element.question_id}">`+
                    '<div class="d-flex justify-content-between align-items-center">'+
                    '<button type="submit" class="btn btn-sm btn-info btn-vote">Vote Now</button>'+
                    `<small class="text-muted">Total votes: ${element.total_votes}</small>`+
                    '</div>'+
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
            callback: "https://pay.nebulas.io/api/pay",
            listener: function (resp) {
                alert("Your transaction has been submitted");
                console.log("SubmitVote tx => " + resp.txhash);
            }
        });
    }
    else {
        alert("You must select an answer")
    }
}

function SubmitQuestion(e) {

    e.preventDefault();
    var title = $("#question-form input[name=title]:first").val();
    if (title === undefined || title === "") {
        alert("Error: You must enter the question")
        return;
    }

    var fields = $("#question-form :input[name=fields]").serializeArray()

    var answers = []
    fields.forEach(e => {
        if (e.value !== "") {
            answers.push(e.value)
        }
    });

    if (answers.length < 2 || answers.length > 5) {
        alert("Error: You must enter between 2 and 5 answers")
        return;
    }

    nebPay.call(contract_address, 0, "postQuestion", JSON.stringify([title, answers]), {
        qrcode: {
            showQRCode: false,
            completeTip: undefined,
            cancelTip: undefined,
            container: undefined
        },
        callback: "https://pay.nebulas.io/api/pay",
        listener: function (resp) {
            $('#add-question-modal').modal('toggle')
            console("SubmitQuestion tx => " + resp.txhash);
        }
    });
}
