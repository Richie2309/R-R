document.getElementById('proceedToBuyBtn').addEventListener('click', function(event) {
  event.preventDefault()
  console.log($('#checkoutForm').serialize());
  $.ajax({           
    url: 'userCheckout',
    data: $('#checkoutForm').serialize(),
    type: "POST"
  })
  .then(res => {
      console.log(res.paymentMethod)
      if(res.err){
          return location.href = res.url;
      }
      
      if(res.paymentMethod == 'cod'){ 
          return location.href = res.url;
      }
      
      if(res.success ==true){
      const options = {
        "key": "rzp_test_IwnjcUU9Jdcian",
        "amount": res.order.price,
        "currency": "INR",
        "name": "R&R Wares",
        "description": "Test Transaction",
        // "image": "/userSide/images/header/logo.svg",
        "order_id": res.order.id, //This is a sample Order ID. Pass the id obtained in the response of Step 1
        "callback_url": "/onlinePaymentSuccessfull", //after sucessful payment
        "prefill": { //We recmmend using the prefill parameter to auto-fill customer's contact information especially their phone number
            "name": "Richin Rajeev T R", 
            "email": "richinrajeev@gmail.com",
            "contact": "9961576447" //Provide the customer's phone number for better conversion rates 
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

  //   document.getElementById('confirmation-popup').style.display = 'none';
});