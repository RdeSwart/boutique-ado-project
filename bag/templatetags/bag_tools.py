from django import template


register = template.Library() #see "creating custom template tags & filters" on django docs

@register.filter(name='calc_subtotal')
def calc_subtotal(price, quantity):
    return price * quantity

#this is to calculate subtotal per item in shopping cart
# Load it into the bag.html template to use it