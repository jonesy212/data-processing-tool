from datetime import datetime


class TeamTracker:
    def __init__(self):
        self.teams = {}  # Use a dictionary to store team details
        self.team_count = 0

    def create_team(self, team_name, creator_user_id):
        # Generate a unique team ID (you can use a more sophisticated method)
        team_id = f"team_{self.team_count + 1}"
        
        # Store team details in the dictionary
        self.teams[team_id] = {
            'team_id': team_id,
            'team_name': team_name,
            'creator_user_id': creator_user_id,
            'creation_timestamp': datetime.utcnow(),
            'members': [creator_user_id],  # Include the creator as the first member
            'tasks': [],  # Initialize an empty list of tasks for the team
            'discussions': []  # Initialize an empty list of discussions for the team
            # Add additional fields as needed
        }

        self.team_count += 1
        return team_id

    def add_member_to_team(self, team_id, member_user_id):
        # Check if the team_id is valid
        if team_id in self.teams:
            # Check if the member is not already in the team
            if member_user_id not in self.teams[team_id]['members']:
                # Add the member to the team's list of members
                self.teams[team_id]['members'].append(member_user_id)
                return True
            else:
                return False  # Member is already in the team
        else:
            return False  # Invalid team_id

    def add_task_to_team(self, team_id, task_details):
        # Check if the team_id is valid
        if team_id in self.teams:
            # Add the task to the team's list of tasks
            self.teams[team_id]['tasks'].append(task_details)
            return True
        else:
            return False  # Invalid team_id

    def add_discussion_to_team(self, team_id, discussion_details):
        # Check if the team_id is valid
        if team_id in self.teams:
            # Add the discussion to the team's list of discussions
            self.teams[team_id]['discussions'].append(discussion_details)
            return True
        else:
            return False  # Invalid team_id

    def get_team_details(self, team_id):
        # Return details of a specific team
        return self.teams.get(team_id, None)

    def get_all_teams(self):
        # Return details of all teams
        return list(self.teams.values())

# Sample usage
team_tracker = TeamTracker()

# Create a team
team_id = team_tracker.create_team("Development Team", creator_user_id=1)

# Add members to the team
team_tracker.add_member_to_team(team_id, member_user_id=2)
team_tracker.add_member_to_team(team_id, member_user_id=3)

# Add tasks to the team
task_details = {'task_id': 1, 'description': 'Implement feature X', 'assigned_to': 2}
team_tracker.add_task_to_team(team_id, task_details)

# Add discussions to the team
discussion_details = {'discussion_id': 1, 'topic': 'Design decisions for upcoming sprint'}
team_tracker.add_discussion_to_team(team_id, discussion_details)

# Get details of a specific team
team_details = team_tracker.get_team_details(team_id)

# Get details of all teams
all_teams = team_tracker.get_all_teams()
