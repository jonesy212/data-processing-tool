# Import the tier system module
from modules.tier_system import get_user_tier


# Function to check if a user has permission for a feature
def has_permission(user_tier, required_permission):
    return required_permission in user_tier.permissions

# # Example usage
# user_subscription_type = 'standard'  # You need to replace this with the actual user's subscription type
# user_tier = get_user_tier(user_subscription_type)

# if has_permission(user_tier, 'advanced_feature'):
#     # User has permission, allow access to the advanced feature
    
    #todo finish has permissions
#     # Your logic here
#     else:
#         # User does not have permission, handle accordingly
#         print("Sorry, you do not have access to the advanced feature. Please upgrade your subscription.")
#         # Your logic here
