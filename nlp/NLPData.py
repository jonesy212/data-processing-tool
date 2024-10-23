from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from database.extensions import db
from models.task.data_processing_task import DataProcessingTask


class NLPData(db.Model):
    id = Column(Integer, primary_key=True)
    task_id = Column(Integer, ForeignKey('data_processing_task.id'), nullable=False)
    processed_text = Column(Text, nullable=False)
    extracted_entities = Column(String(255))
    sentiment_analysis = Column(String(20))  # Add a field for sentiment analysis results
    named_entities = Column(String(255))  # Add a field for named entities
    keyword_tags = Column(String(255))  # Add a field for keyword tags
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship with DataProcessingTask
    task = relationship('DataProcessingTask', backref='nlp_data')

    def __repr__(self):
        return f"<NLPData(id={self.id}, task_id={self.task_id}, created_at={self.created_at})>"
