# generate_fake_data

from faker import Faker
from faker.providers import date_time

from database.extensions import db

fake = Faker()
fake.add_provider(date_time)

def generate_fake_data(model_class, num_records=10):
    fake_data = []

    for _ in range(num_records):
        fake_instance = model_class()

        for column in model_class.__table__.columns:
            # Skip columns that are auto-generated or should be handled differently
            if column.primary_key or column.server_default:
                continue

            # Handle relationships
            if column.foreign_keys:
                for foreign_key in column.foreign_keys:
                    related_model = foreign_key.column.table
                    related_instances = related_model.query.all()
                    setattr(fake_instance, column.name, fake.random_element(related_instances))
            else:
                # Generate fake data based on column type
                if isinstance(column.type, db.String):
                    setattr(fake_instance, column.name, fake.word())
                elif isinstance(column.type, db.Integer):
                    setattr(fake_instance, column.name, fake.random_int(0, 100))
                elif isinstance(column.type, db.DateTime):
                    setattr(fake_instance, column.name, fake.date_time_this_decade())
                elif isinstance(column.type, db.Enum):  # Handle Enum types
                    setattr(fake_instance, column.name, fake.random_element(column.type.enums))

        fake_data.append(fake_instance)

    return fake_data









# # Example usage for User model
# from models.user import User

# # Create tables
# db.create_all()

# # Generate and insert fake user data
# fake_users = generate_fake_data(User, num_records=10)
# db.session.add_all(fake_users)
# db.session.commit()



















#todo verify above works before remove
# from datetime import datetime

# from databases import Database
# from extensions import db
# from faker import Faker
# from faker_sqlalchemy import SqlAlchemyProvider
# from sqlalchemy import (Column, DateTime, ForeignKey, Integer, MetaData,
#                         String, Text, create_engine)
# from sqlalchemy.ext.declarative import declarative_base
# from sqlalchemy.orm import relationship, scoped_session, sessionmaker

# from configs.config import app
# from models.tasks import DataProcessingTask

# # Use Faker-SQLAlchemy provider
# fake = Faker()
# fake.add_provider(SqlAlchemyProvider)

# # Connect to the database
# engine = create_engine('sqlite:///data.db')
# metadata = MetaData(bind=engine)
# Base = declarative_base(metadata=metadata)

# database = Database(app.config['SQLALCHEMY_DATABASE_URI'])
# # Define the User class using the Base
# class User(Base):
#     __tablename__ = 'user'
#     id = Column(Integer, primary_key=True)
#     username = Column(String)
#     email = Column(String)
#     password = Column(String)
#     tier = Column(String)
#     upload_quota = Column(Integer)
#     full_name = Column(String)  # New property for user profile
#     bio = Column(Text)          # New property for user profile
#     profile_picture = Column(String)  # New property for user profile
#     processing_tasks = relationship("DataProcessingTask")
#     datasets = relationship("DatasetModel")


# # Define the DataProcessingTask class using the Base
# class DataProcessingTask(Base):
#     __tablename__ = 'data_processing_task'
#     id = Column(Integer, primary_key=True)
#     name = Column(String(255), nullable=False)
#     description = Column(String)
#     status = Column(String(20), default='pending')
#     input_dataset_id = Column(Integer, ForeignKey('dataset_model.id'))
#     output_dataset_id = Column(Integer, ForeignKey('dataset_model.id'))
#     created_at = Column(DateTime, default=datetime.utcnow)
#     start_time = Column(DateTime)
#     completion_time = Column(DateTime)
#     user_id = Column(Integer,ForeignKey('user.id'))
#     user = relationship("User", back_populates="processing_tasks")

#     DataProcessingTask.initiate_processing_task()

# class DatasetModel(Base):
#     __tablename__ = 'dataset_model'
#     id = Column(Integer, primary_key=True)
#     name = Column(String(100), nullable=False)
#     description = Column(String, nullable=True)
#     file_path_or_url = Column(String(255), nullable=False)
#     uploaded_by = Column(Integer, ForeignKey('user.id'), nullable=False)
#     uploaded_at = Column(DateTime, default=datetime.utcnow)
#     tags_or_categories = Column(String(255)) # Comma-separated list or JSON array
#     format = Column(String(20), nullable=False)
#     visibility = Column(String(20), default='private') # public, private, shared
#     user = relationship("User", back_populates="datasets")

# #     # Add other fields as needed
# #     user = relationship("User", back_populates="datasets")


# '__main__.User'
# # Create tables
# Base.metadata.create_all(engine)

# # Create a session
# Session = scoped_session(sessionmaker(bind=engine))
# session = Session()

# # Use Faker to generate and insert fake user data
# for _ in range(10):
#     fake_user = User(
#         username=fake.user_name(),
#         email=fake.email(),
#         password=fake.password(),
#         tier=fake.random_element(['free', 'standard', 'premium', 'enterprise']),
#         upload_quota=fake.random_int(0, 1000),
#         full_name=fake.name(),
#         bio=fake.text(),
#         profile_picture=fake.image_url(),
#         processing_tasks = fake.random_element('DataProcessingTask'),
#         dataset_model = fake.random_element('DatasetModel')
#     )
#     # Accessing relationships
#     fake_user.processing_tasks = [
#         DataProcessingTask(name=fake.word(), description=fake.sentence()),
#         DataProcessingTask(name=fake.word(), description=fake.sentence()),
#     ]

#     fake_user.datasets = [
#         DatasetModel(name=fake.word(), description=fake.sentence(), file_path_or_url=fake.image_url()),
#         DatasetModel(name=fake.word(), description=fake.sentence(), file_path_or_url=fake.image_url()),
#     ]
#     # Generate fake data for DataProcessingTask and DatasetModel
#     print(fake_user)
#     session.add(fake_user)



# # Commit the changes
# session.commit()
