import spacy
from spacy.training.example import Example

# Load a pre-trained English language model
nlp = spacy.load("en_core_web_sm")

# Add or get existing entity labels from the model
ner = nlp.get_pipe("ner", config={"beam_width": 16})  # You can adjust beam_width as needed

# Define entity labels
TASK = "TASK"
PROJECT = "PROJECT"
TEAM = "TEAM"
CALENDAR = "CALENDAR"

# Add custom labels
ner.add_label(TASK)
ner.add_label(PROJECT)
ner.add_label(TEAM)
ner.add_label(CALENDAR)

# Annotated training data organized by entity type
task_data = [
    ("Create a new project by Friday.", {"entities": [(0, 6, "TASK"), (16, 31, "PROJECT"), (36, 42, "DEADLINE")]}),
    ("Assign tasks to the development team.", {"entities": [(0, 6, "TASK"), (17, 35, "TEAM")]}),
    ("Create a detailed project plan for the marketing campaign.", {"entities": [(0, 6, "TASK"), (25, 42, "PROJECT")]}),
    ("Review and finalize the budget report for the finance team.", {"entities": [(0, 6, "TASK"), (33, 47, "TEAM")]}),
    ("Implement security measures for the upcoming software release.", {"entities": [(0, 8, "TASK"), (41, 61, "PROJECT")]}),
    ("Schedule a meeting with the design team to discuss new concepts.", {"entities": [(0, 8, "TASK"), (26, 38, "TEAM")]}),
    ("Prepare a presentation on market trends for the sales department.", {"entities": [(0, 7, "TASK"), (45, 59, "TEAM")]}),
    ("Code a new feature for the software development project.", {"entities": [(0, 4, "TASK"), (40, 61, "PROJECT")]}),
    ("Train new hires on the company's project management system.", {"entities": [(0, 4, "TASK"), (25, 47, "TEAM")]}),
    ("Conduct a usability test for the user experience team.", {"entities": [(0, 7, "TASK"), (36, 54, "TEAM")]}),
    ("Optimize the server infrastructure for the IT department.", {"entities": [(0, 8, "TASK"), (39, 51, "TEAM")]}),
    ("Create content for the social media marketing campaign.", {"entities": [(0, 6, "TASK"), (34, 55, "PROJECT")]}),
    ("Coordinate logistics for the team-building event next month.", {"entities": [(0, 9, "TASK"), (38, 51, "TEAM")]}),
    ("Write a report on the latest industry trends for the research team.", {"entities": [(0, 4, "TASK"), (44, 57, "TEAM")]}),
    ("Review and update the employee handbook for the HR department.", {"entities": [(0, 6, "TASK"), (40, 52, "TEAM")]}),
    ("Test the new mobile app features for the QA testing team.", {"entities": [(0, 4, "TASK"), (39, 54, "TEAM")]}),
    ("Create a survey for gathering feedback from the customer support team.", {"entities": [(0, 6, "TASK"), (51, 69, "TEAM")]}),
    ("Develop a training program for the customer service team.", {"entities": [(0, 7, "TASK"), (40, 58, "TEAM")]}),
    ("Analyze data and generate insights for the data science project.", {"entities": [(0, 7, "TASK"), (47, 60, "PROJECT")]}),
    ("Organize and host a webinar for the education and outreach team.", {"entities": [(0, 7, "TASK"), (47, 67, "TEAM")]}),
    ("Update the website content for the marketing and communications team.", {"entities": [(0, 6, "TASK"), (34, 59, "TEAM")]}),
    ("Prepare and deliver a presentation on the upcoming product launch.", {"entities": [(0, 6, "TASK"), (43, 58, "PROJECT")]}),
]

project_data = [
    ("Create a detailed project plan for the marketing campaign.", {"entities": [(0, 6, "TASK"), (25, 42, "PROJECT")]}),
    ("Implement security measures for the upcoming software release.", {"entities": [(0, 8, "TASK"), (41, 61, "PROJECT")]}),
    ("Code a new feature for the software development project.", {"entities": [(0, 4, "TASK"), (40, 61, "PROJECT")]}),
    ("Create content for the social media marketing campaign.", {"entities": [(0, 6, "TASK"), (34, 55, "PROJECT")]}),
    ("Review and update the employee handbook for the HR department.", {"entities": [(0, 6, "TASK"), (40, 52, "PROJECT")]}),
    ("Analyze data and generate insights for the data science project.", {"entities": [(0, 7, "TASK"), (47, 60, "PROJECT")]}),
    ("Prepare and deliver a presentation on the upcoming product launch.", {"entities": [(0, 6, "TASK"), (43, 58, "PROJECT")]}),
]

team_data = [
    ("Assign tasks to the development team.", {"entities": [(0, 6, "TASK"), (17, 35, "TEAM")]}),
    ("Review and finalize the budget report for the finance team.", {"entities": [(0, 6, "TASK"), (33, 47, "TEAM")]}),
    ("Schedule a meeting with the design team to discuss new concepts.", {"entities": [(0, 8, "TASK"), (26, 38, "TEAM")]}),
    ("Prepare a presentation on market trends for the sales department.", {"entities": [(0, 7, "TASK"), (45, 59, "TEAM")]}),
    ("Train new hires on the company's project management system.", {"entities": [(0, 4, "TASK"), (25, 47, "TEAM")]}),
    ("Conduct a usability test for the user experience team.", {"entities": [(0, 7, "TASK"), (36, 54, "TEAM")]}),
    ("Coordinate logistics for the team-building event next month.", {"entities": [(0, 9, "TASK"), (38, 51, "TEAM")]}),
    ("Write a report on the latest industry trends for the research team.", {"entities": [(0, 4, "TASK"), (44, 57, "TEAM")]}),
    ("Test the new mobile app features for the QA testing team.", {"entities": [(0, 4, "TASK"), (39, 54, "TEAM")]}),
    ("Create a survey for gathering feedback from the customer support team.", {"entities": [(0, 6, "TASK"), (51, 69, "TEAM")]}),
    ("Develop a training program for the customer service team.", {"entities": [(0, 7, "TASK"), (40, 58, "TEAM")]}),
    ("Organize and host a webinar for the education and outreach team.", {"entities": [(0, 7, "TASK"), (47, 67, "TEAM")]}),
    ("Update the website content for the marketing and communications team.", {"entities": [(0, 6, "TASK"), (34, 59, "TEAM")]}),
]

calendar_data = [
    ("Schedule a team meeting for next Monday at 10 AM.", {"entities": [(0, 8, "TASK"), (15, 28, "CALENDAR"), (33, 38, "TEAM")]}),
    ("Set a reminder for the project deadline on the calendar.", {"entities": [(0, 3, "TASK"), (25, 35, "CALENDAR"), (39, 45, "PROJECT")]}),
    ("Block time in the calendar for focused work on the coding task.", {"entities": [(0, 5, "TASK"), (31, 39, "CALENDAR"), (43, 53, "PROJECT")]}),
    ("Attend the marketing workshop scheduled for this Friday.", {"entities": [(0, 5, "TASK"), (23, 45, "CALENDAR"), (54, 62, "PROJECT")]}),
    ("Check the calendar for upcoming team events and activities.", {"entities": [(0, 4, "TASK"), (10, 17, "CALENDAR"), (26, 31, "TEAM")]}),
    ("Create a recurring event for the weekly status update meeting.", {"entities": [(0, 6, "TASK"), (30, 44, "CALENDAR"), (51, 58, "TEAM")]}),
    ("Review the calendar for any overlapping tasks and meetings.", {"entities": [(0, 6, "TASK"), (17, 24, "CALENDAR")]}),
    ("Mark the calendar for the product launch on the specified date.", {"entities": [(0, 3, "TASK"), (19, 28, "CALENDAR"), (39, 54, "PROJECT")]}),
    ("Receive a notification for the upcoming client meeting on the calendar.", {"entities": [(0, 8, "TASK"), (41, 57, "CALENDAR"), (61, 67, "TEAM")]}),
    ("Add a new task to the calendar for the development sprint.", {"entities": [(0, 3, "TASK"), (24, 31, "CALENDAR"), (35, 48, "TEAM")]}),
    ("Review the calendar for any project milestones and deadlines.", {"entities": [(0, 6, "TASK"), (17, 24, "CALENDAR"), (35, 43, "PROJECT")]}),
    ("Block time in the calendar for personal development activities.", {"entities": [(0, 5, "TASK"), (31, 39, "CALENDAR")]}),
    ("Check the calendar for the availability of team members.", {"entities": [(0, 4, "TASK"), (10, 17, "CALENDAR"), (32, 45, "TEAM")]}),
    ("Create a calendar event for the training session next month.", {"entities": [(0, 6, "TASK"), (26, 37, "CALENDAR"), (43, 55, "PROJECT")]}),
    ("Receive a calendar notification for the upcoming sprint planning.", {"entities": [(0, 8, "TASK"), (28, 44, "CALENDAR"), (48, 55, "TEAM")]}),
    ("Block time in the calendar for reviewing project documentation.", {"entities": [(0, 5, "TASK"), (31, 39, "CALENDAR"), (43, 58, "PROJECT")]}),
    ("Set a calendar reminder for the team-building event next week.", {"entities": [(0, 3, "TASK"), (19, 32, "CALENDAR"), (36, 49, "TEAM")]}),
    ("Check the calendar for the schedule of client calls this week.", {"entities": [(0, 4, "TASK"), (17, 24, "CALENDAR"), (42, 47, "TEAM")]}),
    ("Add a calendar entry for the quarterly business review meeting.", {"entities": [(0, 3, "TASK"), (21, 31, "CALENDAR"), (40, 59, "PROJECT")]}),
    ("Receive a calendar alert for the upcoming software release date.", {"entities": [(0, 8, "TASK"), (28, 43, "CALENDAR"), (53, 61, "PROJECT")]}),
    ("Block time in the calendar for brainstorming sessions with the team.", {"entities": [(0, 5, "TASK"), (31, 39, "CALENDAR"), (49, 54, "TEAM")]}),
]

# Combine data for all entity types
train_data = task_data + project_data + team_data + calendar_data

# Convert the training data to spaCy format
train_examples = [Example.from_dict(nlp.make_doc(text), annotations) for text, annotations in train_data]

# Train the model
nlp.begin_training()
for epoch in range(10):  # Adjust the number of epochs
    spacy.training.shuffle(train_examples)
    for example in train_examples:
        nlp.update([example], drop=0.5, losses={})

# Save the trained model
nlp.to_disk("/path/to/custom_model")
