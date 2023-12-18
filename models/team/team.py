from datetime import datetime

from sqlalchemy.orm import relationship

from database.extensions import db


class Team(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)

    # Relationships
    members = relationship('User', secondary='team_membership', back_populates='teams')
    projects = relationship('Project', backref='team', lazy=True)
    cards = relationship('Card', backref='team', lazy=True)

    # Analysis 
    analytics_enabled = db.Column(db.Boolean, default=False)
    hypothesis_testing_enabled = db.Column(db.Boolean, default=False)
    data_processing_enabled = db.Column(db.Boolean, default=False)

    # Communication
    real_time_chat_enabled = db.Column(db.Boolean, default=False)
    file_sharing_enabled = db.Column(db.Boolean, default=False)
    calendar_integration_enabled = db.Column(db.Boolean, default=False)
    notification_settings = db.Column(db.JSON)  # Use JSON field for flexible settings
    meeting_scheduling_enabled = db.Column(db.Boolean, default=False)
    polling_system_enabled = db.Column(db.Boolean, default=False)

    # Collaboration
    collaboration_tools_enabled = db.Column(db.Boolean, default=False)
    task_management_enabled = db.Column(db.Boolean, default=False)
    knowledge_base_enabled = db.Column(db.Boolean, default=False)
    feedback_system_enabled = db.Column(db.Boolean, default=False)
    announcement_board_enabled = db.Column(db.Boolean, default=False)
    team_roles = db.Column(db.JSON)  # Use JSON field for storing role-related information

    # Workflow
    onboarding_workflow_enabled = db.Column(db.Boolean, default=False)
    performance_metrics_enabled = db.Column(db.Boolean, default=False)
    integration_with_external_apps = db.Column(db.Boolean, default=False)
    team_goals = db.Column(db.JSON)  # Use JSON field for storing goal-related information

    # Learning and Development
    training_resources_enabled = db.Column(db.Boolean, default=False)
    community_forum_enabled = db.Column(db.Boolean, default=False)
    expense_tracking_enabled = db.Column(db.Boolean, default=False)
    attendance_tracking_enabled = db.Column(db.Boolean, default=False)
    mentorship_program_enabled = db.Column(db.Boolean, default=False)
    automated_reporting_enabled = db.Column(db.Boolean, default=False)

    # Basic Team Information
    team_name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)

    # Membership and Access Control
    members = relationship('User', secondary='team_members', backref='teams')  # Assuming a many-to-many relationship with users
    team_leader = db.Column(db.Integer, db.ForeignKey('user.id'))  # Reference to the team leader
    privacy_setting = db.Column(db.String(20), default='private')  # public, private, etc.

    # Dates and Times
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)

    # Other Considerations
    team_logo = db.Column(db.String(255))  # URL or file path for the team logo
    team_color_scheme = db.Column(db.String(20))  # Hex code or predefined name for color scheme
    def __repr__(self):
        return f"<Team(id={self.id}, name={self.name})>"
