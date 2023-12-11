from database.extensions import db


class CompanyRecruiters(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey('company.id'), nullable=False)
    recruiter_id = db.Column(db.Integer, db.ForeignKey('recruiter.id'), nullable=False)

    # Relationship with Company and Recruiter
    company = db.relationship('Company', backref=db.backref('recruiters_association', cascade='all, delete-orphan'))
    recruiter = db.relationship('Recruiter', backref=db.backref('companies_association', cascade='all, delete-orphan'))

    # Additional Fields
    is_lead_recruiter = db.Column(db.Boolean, default=False)  # Indicates if the recruiter is a lead recruiter for the company
    start_date = db.Column(db.Date)  # Date when the recruiter joined the company
    end_date = db.Column(db.Date)  # Date when the recruiter left the company, if applicable
    active_status = db.Column(db.Boolean, default=True)  # Indicates if the recruiter is currently active with the company

    def __repr__(self):
        return f"<CompanyRecruiters(id={self.id}, company_id={self.company_id}, recruiter_id={self.recruiter_id}, is_lead_recruiter={self.is_lead_recruiter}, active_status={self.active_status})>"
