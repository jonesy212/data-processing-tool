from datetime import datetime

from database.extensions import db


class Payment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # Define relationship with User model
    user = db.relationship('User', backref=db.backref('payments', lazy=True))

    # Define relationship with Project model
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=True)
    project = db.relationship('Project', backref=db.backref('payments', lazy=True))

    # Define relationship with TeamMember model
    team_member_id = db.Column(db.Integer, db.ForeignKey('team_member.id'), nullable=True)
    team_member = db.relationship('TeamMember', backref=db.backref('payments', lazy=True))

    def __repr__(self):
        return f'<Payment {self.id}>'
