from database.extensions import db


class UserSettings(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    
    # Visibility Settings
    profile_visibility = db.Column(db.Boolean, nullable=False)
    email_visibility = db.Column(db.Boolean, nullable=False)
    phone_number_visibility = db.Column(db.Boolean, nullable=False)
    location_visibility = db.Column(db.Boolean, nullable=False)
    friends_list_visibility = db.Column(db.Boolean, nullable=False)
    online_status_visibility = db.Column(db.Boolean, nullable=False)
    last_seen_visibility = db.Column(db.Boolean, nullable=False)
    contact_information_visibility = db.Column(db.Boolean, nullable=False)
    work_history_visibility = db.Column(db.Boolean, nullable=False)
    education_history_visibility = db.Column(db.Boolean, nullable=False)
    hobbies_visibility = db.Column(db.Boolean, nullable=False)

    # Communication Settings
    email_notifications = db.Column(db.Boolean, nullable=False)
    email_marketing = db.Column(db.Boolean, nullable=False)
    email_newsletters = db.Column(db.Boolean, nullable=False)
    
    # ... (similarly for other email sub-settings)
    sms_notifications = db.Column(db.Boolean, nullable=False)
    sms_marketing = db.Column(db.Boolean, nullable=False)
    
    # ... (similarly for other sms sub-settings)
    push_notifications = db.Column(db.Boolean, nullable=False)

    # Tracking Settings
    activity_logging = db.Column(db.Boolean, nullable=False)
    location_tracking = db.Column(db.Boolean, nullable=False)
    # ... (similarly for other tracking sub-settings)

    # Preferences Settings
    theme = db.Column(db.String(20), nullable=False)
    language = db.Column(db.String(10), nullable=False)
    timezone = db.Column(db.String(30), nullable=False)
    date_format = db.Column(db.String(20), nullable=False)
    notification_sound = db.Column(db.String(20), nullable=False)
    font_size = db.Column(db.String(20), nullable=False)
    show_images = db.Column(db.Boolean, nullable=False)
    auto_play_videos = db.Column(db.Boolean, nullable=False)
    display_name_format = db.Column(db.String(20), nullable=False)
    receive_news_alerts = db.Column(db.Boolean, nullable=False)

    # Security Settings
    two_factor_authentication = db.Column(db.Boolean, nullable=False)
    password_change_required = db.Column(db.Boolean, nullable=False)
    # ... (similarly for other security sub-settings)

    # Third-Party Access Settings
    social_media_access = db.Column(db.Boolean, nullable=False)
    app_integration_access = db.Column(db.Boolean, nullable=False)
    # ... (similarly for other third-party access sub-settings)

    # Data Sharing Settings
    with_affiliates = db.Column(db.Boolean, nullable=False)
    with_third_parties = db.Column(db.Boolean, nullable=False)
    # ... (similarly for other data sharing sub-settings)

    # relationships
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True, nullable=False)

    def __repr__(self):
        return f'<UserSettings id={self.id}>'
