// const { response } = require("express");

// Stripe('pk_test_51GzBz9Et0TdqdJUHVrkaopjzmzdx2A2IRrJndc7MoaqoZy0y4k06WpHh0H74UaBSpsgLyMvFMWVeCcG01TYtGV6h00XOAuqoVM');
// var $form = $('#cheakout-form')
// $form.submit(function (event) {
//     $form.find('button').prop('disabled', true);
//     Stripe.card.createToken({
//         number:$('#cc-number').val(),
//         cvc:$('#cc-cvv').val(),
//         exp_month:$('#cc-expiration').val(),
//         name:$('#cc-name').val(),
//     }, stripeResponseHandler)
//     return false;
//     function stripeResponseHandler(res) {
//         if (response.error) {
//             $('#charge-error').text(response.error.message);
//             $('#charge-error').removeClass('hidden');
//             $form.find('button').prop('disabled',false)
//         } else {
//             var token = response.id
//             $form.append($('<input type="hidden" name="stripeToken" />'.val(token)))
//             FormData.length(0).submit()
//         }
//     }
// })