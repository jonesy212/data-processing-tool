from datetime import datetime

from extensions import db
from faker import Faker
from faker_sqlalchemy import SqlAlchemyProvider
from sqlalchemy import (Column, DateTime, ForeignKey, Integer, MetaData,
                        String, Text, create_engine)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, scoped_session, sessionmaker

from models.tasks import DataProcessingTask

# Use Faker-SQLAlchemy provider
fake = Faker()
fake.add_provider(SqlAlchemyProvider)

# Connect to the database
engine = create_engine('sqlite:///data.db')
metadata = MetaData(bind=engine)
Base = declarative_base(metadata=metadata)

# Define the User class using the Base
class User(Base):
    __tablename__ = 'user'
    id = Column(Integer, primary_key=True)
    username = Column(String)
    email = Column(String)
    password = Column(String)
    tier = Column(String)
    upload_quota = Column(Integer)
    full_name = Column(String)  # New property for user profile
    bio = Column(Text)          # New property for user profile
    profile_picture = Column(String)  # New property for user profile
    processing_tasks = relationship("DataProcessingTask")
    datasets = relationship("DatasetModel")


# Define the DataProcessingTask class using the Base
class DataProcessingTask(Base):
    __tablename__ = 'data_processing_task'
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(String)
    status = Column(String(20), default='pending')
    input_dataset_id = Column(Integer, ForeignKey('dataset_model.id'))
    output_dataset_id = Column(Integer, ForeignKey('dataset_model.id'))
    created_at = Column(DateTime, default=datetime.utcnow)
    start_time = Column(DateTime)
    completion_time = Column(DateTime)
    user_id = Column(Integer,ForeignKey('user.id'))
    user = relationship("User", back_populates="processing_tasks")

    DataProcessingTask.initiate_processing_task()

class DatasetModel(Base):
    __tablename__ = 'dataset_model'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(String, nullable=True)
    file_path_or_url = Column(String(255), nullable=False)
    uploaded_by = Column(Integer, ForeignKey('user.id'), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    tags_or_categories = Column(String(255)) # Comma-separated list or JSON array
    format = Column(String(20), nullable=False)
    visibility = Column(String(20), default='private') # public, private, shared
    user = relationship("User", back_populates="datasets")

#     # Add other fields as needed
#     user = relationship("User", back_populates="datasets")


'__main__.User'
# Create tables
Base.metadata.create_all(engine)

# Create a session
Session = scoped_session(sessionmaker(bind=engine))
session = Session()

# Use Faker to generate and insert fake user data
for _ in range(10):
    fake_user = User(
        username=fake.user_name(),
        email=fake.email(),
        password=fake.password(),
        tier=fake.random_element(['free', 'standard', 'premium', 'enterprise']),
        upload_quota=fake.random_int(0, 1000),
        full_name=fake.name(),
        bio=fake.text(),
        profile_picture=fake.image_url(),
        processing_tasks = fake.random_element('DataProcessingTask'),
        dataset_model = fake.random_element('DatasetModel')
    )
    # Accessing relationships
    fake_user.processing_tasks = [
        DataProcessingTask(name=fake.word(), description=fake.sentence()),
        DataProcessingTask(name=fake.word(), description=fake.sentence()),
    ]

    fake_user.datasets = [
        DatasetModel(name=fake.word(), description=fake.sentence(), file_path_or_url=fake.image_url()),
        DatasetModel(name=fake.word(), description=fake.sentence(), file_path_or_url=fake.image_url()),
    ]
    # Generate fake data for DataProcessingTask and DatasetModel
    print(fake_user)
    session.add(fake_user)



# Commit the changes
session.commit()
