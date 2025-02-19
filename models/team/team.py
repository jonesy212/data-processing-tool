from datetime import datetime

from sqlalchemy import (JSON, Boolean, Column, DateTime, ForeignKey, Integer,
                        String, Text)
from sqlalchemy.orm import relationship

from database.extensions import db


class Team(db.Model):
    __tablename__ = 'team'

    # Basic Information
    id = Column(Integer, primary_key=True)
    team_name = Column(String(100), nullable=False)
    description = Column(Text)

    # Analytics and Data Processing
    analytics_enabled = Column(Boolean, default=False)
    hypothesis_testing_enabled = Column(Boolean, default=False)
    data_processing_enabled = Column(Boolean, default=False)

    # Communication
    real_time_chat_enabled = Column(Boolean, default=False)
    file_sharing_enabled = Column(Boolean, default=False)
    calendar_integration_enabled = Column(Boolean, default=False)
    notification_settings = Column(JSON)
    meeting_scheduling_enabled = Column(Boolean, default=False)
    polling_system_enabled = Column(Boolean, default=False)

    # Collaboration
    collaboration_tools_enabled = Column(Boolean, default=False)
    task_management_enabled = Column(Boolean, default=False)
    knowledge_base_enabled = Column(Boolean, default=False)
    feedback_system_enabled = Column(Boolean, default=False)
    announcement_board_enabled = Column(Boolean, default=False)
    team_roles = Column(JSON)

    # Workflow and Goals
    onboarding_workflow_enabled = Column(Boolean, default=False)
    performance_metrics_enabled = Column(Boolean, default=False)
    integration_with_external_apps = Column(Boolean, default=False)
    team_goals = Column(JSON)

    # Learning and Development
    training_resources_enabled = Column(Boolean, default=False)
    community_forum_enabled = Column(Boolean, default=False)
    expense_tracking_enabled = Column(Boolean, default=False)
    attendance_tracking_enabled = Column(Boolean, default=False)
    mentorship_program_enabled = Column(Boolean, default=False)
    automated_reporting_enabled = Column(Boolean, default=False)

    # Membership and Access Control
    team_leader_id = Column(Integer, ForeignKey('user.id'))
    team_leader = relationship('User')  # Add this line for the team leader relationship
    privacy_setting = Column(String(20), default='private')

    # Dates and Times
    created_at = Column(DateTime, default=datetime.utcnow)
    last_updated_at = Column(DateTime, onupdate=datetime.utcnow)

   
    # Relationships
    members = relationship('User', secondary='team_members', backref='teams')
    projects = relationship('Project', backref='team', lazy=True)
    cards = relationship('Card', backref='team', lazy=True)

 
    # Other Considerations
    team_logo = db.Column(db.String(255))  # URL or file path for the team logo
    team_color_scheme = db.Column(db.String(20))  # Hex code or predefined name for color scheme
    
    def __repr__(self):
            return f"<Team(id={self.id}, team_name={self.team_name})>"
