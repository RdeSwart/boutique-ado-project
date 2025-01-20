from django.apps import AppConfig


class CheckoutConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'checkout'

    def ready(self):
        import checkout.signals
# Overriding the ready method and importing our signals module.
# With that done, every time a line item is saved or deleted.
# Our custom update total model method will be called.
# Updating the order totals automatically.