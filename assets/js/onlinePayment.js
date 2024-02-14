document.getElementById('proceedToBuyBtn').addEventListener('click', function(event) {
  event.preventDefault()
  $.ajax({           
    url: 'userCheckout',
    data: $('#checkoutForm').serialize(),
    type: "POST"
  })
  .then(res => {
      if(res.err){
          return location.href = res.url;
      }
      
      if(res.paymentMethod == 'cod'){ 
          return location.href = res.url;
      }
      if(res.paymentMethod == 'wallet'){ 
          return location.href = res.url;
      }
      
      if(res.success ==true){
      const options = {
        "key": "rzp_test_IwnjcUU9Jdcian",
        "amount": res.order.price,
        "currency": "INR",
        "name": "R&R Wares",
        "description": "Test Transaction",
        "order_id": res.order.id, 
        "callback_url": "/onlinePaymentSuccessfull", //after sucessful payment
        "prefill": {
            "name": "Richin Rajeev T R", 
            "email": "richinrajeev@gmail.com",
            "contact": "9961576447" 
        },
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#3399cc"
        }
      };
  
      const rzp1 = new Razorpay(options);
  
      rzp1.open();
    }
  })
  .catch(err => {
      console.log(err)
  })

});