/*

Core logic/payment flow for this comes from here:
https://stripe.com/docs/payments/accept-a-payment

CSS from here:
https://stripe.com/docs/stripe.js

*/

var stripePublicKey = $('#id_stripe_public_key').text().slice(1, -1);//Slice of quotation marks which we dont want 
var clientSecret = $('#id_client_secret').text().slice(1, -1);
var stripe = Stripe(stripePublicKey); //All we need to do to set up stripe is create a variable using our stripe public key.
var elements = stripe.elements(); // Now we can use it to create an instance of stripe elements.
var style = {
    base: {
        color: '#000',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
            color: '#aab7c4'
        }
    },
    invalid: {
        color: '#dc3545',
        iconColor: '#dc3545'
    }
};
var card = elements.create('card', {style: style});//Use that to create a card element.
card.mount('#card-element');//Mount the card element to the div we created in checkout.html

// Handle realtime validation errors on the card element
card.addEventListener('change', function (event) {
    var errorDiv = document.getElementById('card-errors');
    if (event.error) {
        var html = `
            <span class="icon" role="alert">
                <i class="fas fa-times"></i>
            </span>
            <span>${event.error.message}</span>
        `;
        $(errorDiv).html(html);
    } else {
        errorDiv.textContent = '';
    }
});

// Handle form submit
var form = document.getElementById('payment-form');

form.addEventListener('submit', function(ev) {
    ev.preventDefault();// When the user clicks the submit button the event listener prevents the form from submitting
    card.update({ 'disabled': true});// and instead disables the card element
    $('#submit-button').attr('disabled', true);
    $('#payment-form').fadeToggle(100);//(FYI:trigger the overlay and fade out the form when the user clicks the submit button and reverse that if there's any error.)
    $('#loading-overlay').fadeToggle(100);// and triggers the loading overlay.

    var saveInfo = Boolean($('#id-save-info').attr('checked'));//Then we create a few variables to capture the form data we can't put in the payment intent here,
    // From using {% csrf_token %} in the form
    var csrfToken = $('input[name="csrfmiddlewaretoken"]').val();
    var postData = {
        'csrfmiddlewaretoken': csrfToken,
        'client_secret': clientSecret,
        'save_info': saveInfo,
    };
    var url = '/checkout/cache_checkout_data/';

    $.post(url, postData).done(function () { //and instead post it to the cache_checkout_data view
        stripe.confirmCardPayment(clientSecret, { //The view updates the payment intent and returns a 200 response, at which point we call the confirm card payment method from stripe
            payment_method: {
                card: card,
                billing_details: {
                    name: $.trim(form.full_name.value),
                    phone: $.trim(form.phone_number.value),
                    email: $.trim(form.email.value),
                    address:{
                        line1: $.trim(form.street_address1.value),
                        line2: $.trim(form.street_address2.value),
                        city: $.trim(form.town_or_city.value),
                        country: $.trim(form.country.value),
                        state: $.trim(form.county.value),
                    }
                }
            },
            shipping: {
                name: $.trim(form.full_name.value),
                phone: $.trim(form.phone_number.value),
                address: {
                    line1: $.trim(form.street_address1.value),
                    line2: $.trim(form.street_address2.value),
                    city: $.trim(form.town_or_city.value),
                    country: $.trim(form.country.value),
                    postal_code: $.trim(form.postcode.value),
                    state: $.trim(form.county.value),
                }
            },
        }).then(function(result) {
            if (result.error) {
                var errorDiv = document.getElementById('card-errors');
                var html = `
                    <span class="icon" role="alert">
                    <i class="fas fa-times"></i>
                    </span>
                    <span>${result.error.message}</span>`;
                $(errorDiv).html(html);
                $('#payment-form').fadeToggle(100);
                $('#loading-overlay').fadeToggle(100); // If there's an error in the form then the loading overlay will be hidden,
                card.update({ 'disabled': false}); // the card element re-enabled and the error displayed for the user.
                $('#submit-button').attr('disabled', false);
            } else {
                if (result.paymentIntent.status === 'succeeded') {
                    form.submit(); // and if everything is ok, submit the form.
                }
            }
        });
    }).fail(function () { //If anything goes wrong posting the data to our view. We'll reload the page and display the error without ever charging the user.
        // just reload the page, the error will be in django messages
        location.reload();
    })
});
// Sequence of events happening here:
// When the user clicks the submit button the event listener prevents the form from submitting
// and instead disables the card element and triggers the loading overlay.
// Then we create a few variables to capture the form data we can't put in
// the payment intent here, and instead post it to the cache_checkout_data view
// The view updates the payment intent and returns a 200 response, at which point we
// call the confirm card payment method from stripe and if everything is ok
// submit the form.
// If there's an error in the form then the loading overlay will
// be hidden the card element re-enabled and the error displayed for the user.
// If anything goes wrong posting the data to our view. We'll reload the page and
// display the error without ever charging the user.

