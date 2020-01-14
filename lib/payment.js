let stripe = require('./stripe');
let mailgun = require('./mailgun');
payment = {};

payment.makePayment = (paymentDetailsData, cartData, callback) => {
    // Get total price
    
    stripe.createPaymentToken(paymentDetailsData, (err, tokenId) => {
        if(!err && tokenId){
            stripe.makePayment(tokenId, cartData.totalPrice, (err, paymentObject) => {
                if(!err && paymentObject){
                    callback(false, paymentObject);
                } else{
                    callback({"Error" : "Could not make payment"});
                }
            });
        } else {
            callback({"Error" : "Could not create token"});
        }
    });
  
};

module.exports = payment;