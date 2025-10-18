# preferences.py

from marshmallow import Schema, fields


class PreferencesSchema(Schema):
    # Existing preferences fields
    enableNotifications = fields.Boolean()
    notificationSound = fields.String()

    # New preferences for asynchronous processing
    asyncTaskTimeout = fields.Integer()
    asyncTaskConcurrency = fields.Integer()
    # Add more fields as needed
