from models.dataset import DatasetModel
from models.task.data_processing_task import DataProcessingTask
from models.user.user import User


def get_dashboard_data(username, user_tier):
    # Fetch user information
    user = User.query.filter_by(username=username).first()

    if not user:
        # Handle the case where the user does not exist
        return {"error": "User not found"}

    # Assuming user.tier is the user's tier
    if user.tier != user_tier:
        # Handle the case where the provided user_tier does not match the actual user's tier
        return {"error": "Invalid user tier"}

    # Fetch datasets and tasks associated with the user
    datasets = DatasetModel.query.filter_by(uploaded_by=user.id).all()
    tasks = DataProcessingTask.query.filter_by(user_id=user.id).all()

    # You can customize the data structure based on your frontend requirements
    dashboard_data = {
        "user": {
            "username": user.username,
            "email": user.email,
            "tier": user.tier,
            # Add other user-related information as needed
        },
        "datasets": [{"name": dataset.name, "description": dataset.description} for dataset in datasets],
        "tasks": [{"name": task.name, "description": task.description} for task in tasks],
    }

    return dashboard_data