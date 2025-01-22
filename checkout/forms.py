from django import forms
from .models import Order


class OrderForm(forms.ModelForm):
    class Meta:
        model = Order
        fields = ('full_name', 'email', 'phone_number',
                  'street_address1', 'street_address2',
                  'town_or_city', 'postcode', 'country',
                  'county',)

    def __init__(self, *args, **kwargs): #here we override the init method of the form which will allow us to customise it quite a bit.
        """
        Add placeholders and classes, remove auto-generated
        labels and set autofocus on first field
        """
        super().__init__(*args, **kwargs)
        placeholders = { #dictionary of placeholders which will show up in the form fields rather than having clunky looking labels and empty text boxes in the template.
            'full_name': 'Full Name',
            'email': 'Email Address',
            'phone_number': 'Phone Number',
            'postcode': 'Postal Code',
            'town_or_city': 'Town or City',
            'street_address1': 'Street Address 1',
            'street_address2': 'Street Address 2',
            'county': 'County, State or Locality',
        }

        self.fields['full_name'].widget.attrs['autofocus'] = True #setting the autofocus attribute on the full name field to true so the cursor will start in the full name field when the user loads the page.
        for field in self.fields: #iterate through the forms fields adding a star to the placeholder if it's a required field on the model.
            if field != 'country': # Only throw error if field is not ='country'
                if self.fields[field].required:
                    placeholder = f'{placeholders[field]} *'#Setting all the placeholder attributes to their values in the dictionary above.
                else:
                    placeholder = placeholders[field]
                self.fields[field].widget.attrs['placeholder'] = placeholder
            self.fields[field].widget.attrs['class'] = 'stripe-style-input'#Adding a CSS class
            self.fields[field].label = False #removing the form fields labels,Since we won't need them given the placeholders are now set.