# Assuming you have a tree structure for models
class Category:
    def __init__(self, name, models=None, subcategories=None):
        self.name = name
        self.models = models or {}
        self.subcategories = subcategories or {}
    
# Example tree structure
model_tree = Category('root', subcategories={
    'category1': Category('category1', models={'model1': Model1, 'model2': Model2}),
    'category2': Category('category2', models={'model3': Model3}),
    # Add more categories as needed
})

def get_model_class_by_name(model_class_name, category):
    if model_class_name in category.models:
        return category.models[model_class_name]
    
    for subcategory in category.subcategories.values():
        result = get_model_class_by_name(model_class_name, subcategory)
        if result:
            return result
    
    return None

# Usage example
category_name = 'category1'
model_name = 'model1'
model_class = get_model_class_by_name(model_name, model_tree.subcategories[category_name])

if model_class:
    print(f"Found model class: {model_class}")
else:
    print(f"Model class '{model_name}' not found in category '{category_name}'.")
