# ProjectFeedback.py
# ProjectFeedback.py

class ProjectFeedback:
    def __init__(self, projectId, feedback):
        self.projectId = projectId
        self.feedback = feedback

    def get_project_id(self):
        return self.projectId

    def get_feedback(self):
        return self.feedback

    def set_project_id(self, projectId):
        self.projectId = projectId

    def set_feedback(self, feedback):
        self.feedback = feedback
