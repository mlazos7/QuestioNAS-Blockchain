"use strict";

var VoteContract = function () {
    LocalContractStorage.defineMapProperty(this,"hash_vote")
};

VoteContract.prototype = {
	//Init is called once, when the contract is deployed
    init: function() {
        //Nothing
    },

    submitVote: function (vote){
    	if(Blockchain.transaction.value != 0){
    		throw new Error("I don't want your money.");
    	}

    	this.hash_vote.put(Blockchain.transaction.hash, { vote, date: Date.now()});
    },

    getVote: function(hash){
    	return this.hash_vote.get(hash);
    }
};

module.exports = VoteContract;