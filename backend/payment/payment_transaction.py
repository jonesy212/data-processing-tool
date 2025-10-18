from datetime import datetime

from database.extensions import db


class PaymentTransaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    status = db.Column(db.String(20), nullable=False)  # 'success' or 'failed'
    error = db.Column(db.String(255))

    def __repr__(self):
        return f"<PaymentTransaction {self.id}: User ID {self.user_id}, Amount {self.amount}, Status {self.status}>"

    @staticmethod
    def log_transaction(user_id, amount, status, error=None):
        """
        Logs a payment transaction to the database.
        :param user_id: The ID of the user associated with the transaction.
        :param amount: The amount of the transaction.
        :param status: The status of the transaction ('success' or 'failed').
        :param error: Optional error message if the transaction failed.
        """
        transaction = PaymentTransaction(user_id=user_id, amount=amount, status=status, error=error)
        db.session.add(transaction)
        db.session.commit()
