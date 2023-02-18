from django.contrib import admin

from .models import Email

class EmailAdmin(admin.ModelAdmin):
    list_display = ('id', 'sender', 'subject', 'timestamp', 'read', 'archived')

admin.site.register(Email, EmailAdmin)
