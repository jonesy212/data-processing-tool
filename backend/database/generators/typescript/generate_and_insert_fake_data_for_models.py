from database.generators.async_generate_data import (
    generate_and_insert_fake_data, generate_fake_data_async)


async def generate_and_insert_fake_data_for_models(models, num_records=10):
    fake_data = {}
    for model_class in models:
        fake_data[model_class] = await generate_fake_data_async(model_class, num_records)
        await generate_and_insert_fake_data(model_class, num_records)
    return fake_data
