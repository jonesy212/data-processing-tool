import asyncio

from faker import Faker
from faker.providers import date_time
from flask import Flask, jsonify, request
from flask_jwt_extended import JWTManager, create_access_token, jwt_required

from configs.config import Config
from database.extensions import db
from models.dataset import DatasetModel
from models.user.user import User
from todo.todo_management import TodoManager

fake = Faker()
fake.add_provider(date_time)

app = Flask(__name__)
app.config.from_object(Config)
jwt = JWTManager(app)

# Initialize TodoManager
todo_manager = TodoManager()


async def generate_fake_data_async(model_class, num_records=10):
    fake_data = []

    for _ in range(num_records):
        fake_instance = model_class()

        for column in model_class.__table__.columns:
            if column.primary_key or column.server_default:
                continue

            if column.foreign_keys:
                for foreign_key in column.foreign_keys:
                    related_model = foreign_key.column.table
                    related_instances = await related_model.query.gino.all()
                    setattr(fake_instance, column.name, fake.random_element(related_instances))
            else:
                if isinstance(column.type, db.String):
                    setattr(fake_instance, column.name, fake.word())
                elif isinstance(column.type, db.Integer):
                    setattr(fake_instance, column.name, fake.random_int(0, 100))
                elif isinstance(column.type, db.DateTime):
                    setattr(fake_instance, column.name, fake.date_time_this_decade())

        fake_data.append(fake_instance)

    return fake_data




async def generate_and_insert_fake_data(model_class, num_records=10):
    fake_data = await generate_fake_data_async(model_class, num_records)

    # Create tables if they don't exist
    await db.gino.create_all()

    # Insert fake data
    for data_instance in fake_data:
        await model_class.create(**data_instance)

    for _ in range(num_records):
        fake_instance = model_class()

        for column in model_class.__table__.columns:
            if column.primary_key or column.server_default:
                continue

            if column.foreign_keys:
                for foreign_key in column.foreign_keys:
                    related_model = foreign_key.column.table
                    related_instances = await related_model.query.gino.all()
                    setattr(fake_instance, column.name, fake.random_element(related_instances))
            else:
                if isinstance(column.type, db.String):
                    setattr(fake_instance, column.name, fake.word())
                elif isinstance(column.type, db.Integer):
                    setattr(fake_instance, column.name, fake.random_int(0, 100))
                elif isinstance(column.type, db.DateTime):
                    setattr(fake_instance, column.name, fake.date_time_this_decade())

        fake_data.append(fake_instance)

    return fake_data


async def generate_and_insert_fake_data(model_class, num_records=10):
    fake_data = await generate_fake_data_async(model_class, num_records)
    await model_class.bulk_insert(values=fake_data).gino.status()

async def generate_and_insert_fake_data(model_class, num_records=10):
    fake_data = await generate_fake_data_async(model_class, num_records)
    db.session.add_all(fake_data)
    await db.session.commit()

async def generate_data_for_route(model_class, num_records=10):
    await generate_and_insert_fake_data(model_class, num_records)









# Example usage for User model
async def generate_data_for_user_route(num_records=10):
    await generate_and_insert_fake_data(User, num_records)

# Example usage for DatasetModel model
async def generate_data_for_dataset_route(num_records=10):
    await generate_and_insert_fake_data(DatasetModel, num_records)

# Usage in a route or controller
async def user_route(request):
    num_records = int(request.args.get('num_records', 10))
    await generate_data_for_user_route(num_records)
    return "Fake user data generated and inserted!"

async def dataset_route(request):
    num_records = int(request.args.get('num_records', 10))
    await generate_data_for_dataset_route(num_records)
    return "Fake dataset data generated and inserted!"




# Login route
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    access_token = create_access_token(identity=username)
    return jsonify(access_token=access_token)

# Protected route requiring authentication
@app.route('/generate_data', methods=['POST'])
@jwt_required()




async def generate_data():
    data = request.get_json()
    model_name = data.get('model')
    num_records = int(data.get('num_records', 10))

    # Assuming you have a dictionary mapping model names to their actual classes
    model_mapping = {'user': User, 'dataset': DatasetModel}

    if model_name in model_mapping:
        model_class = model_mapping[model_name]
        await generate_data_for_route(model_class, num_records)
        return f"Fake {model_name} data generated and inserted!"
    else:
        return "Invalid model name provided."

if __name__ == '__main__':
    app.run(debug=True)
