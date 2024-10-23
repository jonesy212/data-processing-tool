# fluence_aqua_handler.py
from versioning.version_generator import VersionGenerator


class FluenceAquaHandler:
    def __init__(self, fluence_version_generator, aqua_version_generator):
        self.fluence_version_generator = fluence_version_generator
        self.aqua_version_generator = aqua_version_generator

    def handle_fluence_aqua_integration(self):
        # Your integration logic here
        integration_changes = ["Fluence and Aqua integration added", "Bug fixes"]
        
        # Update versions
        self.fluence_version_generator.update_version("1.3.0", integration_changes)
        self.aqua_version_generator.update_version("2.2.0", integration_changes)

        # Additional logic...

    def get_integration_version_info(self):
        fluence_info = self.fluence_version_generator.get_version_info()
        aqua_info = self.aqua_version_generator.get_version_info()

        return {"fluence": fluence_info, "aqua": aqua_info}


# Example usage:

# Create instances for Fluence and Aqua version generators
fluence_version_generator = VersionGenerator(name="Fluence")
aqua_version_generator = VersionGenerator(name="Aqua")

# Create FluenceAquaHandler instance
fluence_aqua_handler = FluenceAquaHandler(fluence_version_generator, aqua_version_generator)

# Handle Fluence and Aqua integration
fluence_aqua_handler.handle_fluence_aqua_integration()

# Get integration version information
integration_info = fluence_aqua_handler.get_integration_version_info()
print(integration_info)
