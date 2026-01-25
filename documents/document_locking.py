class DocumentLocker:
    def __init__(self):
        self.locked_sections = set()

    def lock_document_section(self, user, section_id):
        # Logic to lock a specific section of the document
        if (user, section_id) not in self.locked_sections:
            self.locked_sections.add((user, section_id))
            print(f"User {user} has locked section {section_id}.")
        else:
            print(f"Section {section_id} is already locked by user {user}.")

    def unlock_document_section(self, user, section_id):
        # Logic to unlock a previously locked section
        if (user, section_id) in self.locked_sections:
            self.locked_sections.remove((user, section_id))
            print(f"User {user} has unlocked section {section_id}.")
        else:
            print(f"Section {section_id} is not locked by user {user}.")

    def is_section_locked(self, section_id):
        # Check if a specific section is locked
        return any(section_id in locked_section for _, locked_section in self.locked_sections)

    def get_locked_sections(self):
        # Get the list of currently locked sections
        return list(set(section for _, section in self.locked_sections))

    def unlock_all_sections_for_user(self, user):
        # Unlock all sections locked by a specific user
        user_locked_sections = [(locked_user, section) for locked_user, section in self.locked_sections if locked_user == user]
        
        for locked_user, section in user_locked_sections:
            self.locked_sections.remove((locked_user, section))
            print(f"User {user} has unlocked section {section}.")

    def get_users_locking_section(self, section_id):
        # Get the list of users currently locking a specific section
        return [locked_user for locked_user, section in self.locked_sections if section == section_id]

# Example usage:

# Create an instance of DocumentLocker
document_locker = DocumentLocker()

# Simulate locking multiple sections by different users
document_locker.lock_document_section("User1", "SectionA")
document_locker.lock_document_section("User2", "SectionB")
document_locker.lock_document_section("User1", "SectionC")

# Simulate checking if a section is locked
print("Is SectionA locked?", document_locker.is_section_locked("SectionA"))
print("Is SectionD locked?", document_locker.is_section_locked("SectionD"))

# Simulate getting the list of locked sections
print("Currently Locked Sections:", document_locker.get_locked_sections())

# Simulate unlocking all sections for a user
document_locker.unlock_all_sections_for_user("User1")

# Print the updated state of locked sections
print("Currently Locked Sections:", document_locker.locked_sections)
