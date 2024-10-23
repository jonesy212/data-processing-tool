# modules/tier_system.py
from enum import Enum


class SubscriberTypeEnum(Enum):
    FREE = "FREE"
    STANDARD = "STANDARD"
    PREMIUM = "PREMIUM"
    ENTERPRISE = "ENTERPRISE"
    TRIAL = "TRIAL"
    
    
class Tier:
    def __init__(self, name, roles, permissions):
        self.name = name
        self.permissions = permissions
        self.roles = roles
TIERS = {
    # Define your tiers and associated permissions
    SubscriberTypeEnum.FREE: Tier(name='free', permissions=['basic_feature']),
    SubscriberTypeEnum.STANDARD: Tier(name='standard', permissions=['basic_feature', 'advanced_feature']),
    SubscriberTypeEnum.PREMIUM: Tier(name='premium', permissions=['basic_feature', 'advanced_feature', 'premium_feature']),
    SubscriberTypeEnum.ENTERPRISE: Tier(name='enterprise', permissions=['basic_feature', 'advanced_feature', 'premium_feature', 'enterprise_feature']),
    SubscriberTypeEnum.TRIAL: Tier(name="trial", permissions=["basic_feature"])
}

# Function to get tier based on user's subscription
def get_user_tier(subscriber_type):
    return TIERS.get(subscriber_type, None)
    
   
   
    
    
# Function to get tier based on user's subscription
def get_user_tier(subscriber_type):
    return TIERS.get(subscriber_type, None)
