# modules/tier_system.py
class Tier:
    def __init__(self, name, roles, permissions):
        self.name = name
        self.permissions = permissions
        self.roles = roles

# Define your tiers and associated permissions
FREE_TIER = Tier(name='free', permissions=['basic_feature'])
STANDARD_TIER = Tier(name='standard', permissions=['basic_feature', 'advanced_feature'])
PREMIUM_TIER = Tier(name='premium', permissions=['basic_feature', 'advanced_feature', 'premium_feature'])
ENTERPRISE_TIER = Tier(name='enterprise', permissions=['basic_feature', 'advanced_feature', 'premium_feature', 'enterprise_feature'])

# Function to get tier based on user's subscription
def get_user_tier(subscription_type):
    if subscription_type == 'free':
        return FREE_TIER
    elif subscription_type == 'standard':
        return STANDARD_TIER
    elif subscription_type == 'premium':
        return PREMIUM_TIER
    elif subscription_type == 'enterprise':
        return ENTERPRISE_TIER
    else:
        return None
