# modules/authentication.py
from user_utils.tier_system import Tier


class Permission:
    def __init__(self, name):
        self.name = name

class Role:
    def __init__(self, name, permissions):
        self.name = name
        self.permissions = permissions

# Define permissions
BASIC_FEATURE = Permission(name='basic_feature')
ADVANCED_FEATURE = Permission(name='advanced_feature')
PREMIUM_FEATURE = Permission(name='premium_feature')
ENTERPRISE_FEATURE = Permission(name='enterprise_feature')

# Define roles with associated permissions
BASIC_ROLE = Role(name='basic_role', permissions=[BASIC_FEATURE])
ADVANCED_ROLE = Role(name='advanced_role', permissions=[BASIC_FEATURE, ADVANCED_FEATURE])
PREMIUM_ROLE = Role(name='premium_role', permissions=[BASIC_FEATURE, ADVANCED_FEATURE, PREMIUM_FEATURE])
ENTERPRISE_ROLE = Role(name='enterprise_role', permissions=[BASIC_FEATURE, ADVANCED_FEATURE, PREMIUM_FEATURE, ENTERPRISE_FEATURE])

# Define tiers with associated roles
FREE_TIER = Tier(name='free', roles=[BASIC_ROLE])
STANDARD_TIER = Tier(name='standard', roles=[BASIC_ROLE, ADVANCED_ROLE])
PREMIUM_TIER = Tier(name='premium', roles=[BASIC_ROLE, ADVANCED_ROLE, PREMIUM_ROLE])
ENTERPRISE_TIER = Tier(name='enterprise', roles=[BASIC_ROLE, ADVANCED_ROLE, PREMIUM_ROLE, ENTERPRISE_ROLE])

# Function to get user roles based on tier
def get_user_roles(tier_name):
    if tier_name == 'free':
        return FREE_TIER.roles
    elif tier_name == 'standard':
        return STANDARD_TIER.roles
    elif tier_name == 'premium':
        return PREMIUM_TIER.roles
    elif tier_name == 'enterprise':
        return ENTERPRISE_TIER.roles
    else:
        return None

# Function to get user permissions based on roles
def get_user_permissions(roles):
    permissions = []
    for role in roles:
        permissions.extend(role.permissions)
    return permissions
