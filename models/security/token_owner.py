from sqlalchemy.orm import relationship

from database.extensions import db


class TokenOwner(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(50), unique=True, nullable=False)
    token_jti = db.Column(db.String(36), unique=True, nullable=False)
    # Establish a relationship with the User table
    user = relationship('User', backref='token_owner', lazy=True)
    def __repr__(self):
            return f'<TokenOwner id={self.id}, user_id={self.user_id}>'