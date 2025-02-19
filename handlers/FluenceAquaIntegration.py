# fluence_aqua_integration.py
from fluence_aqua_handler import FluenceAquaHandler

from versioning.version_generator import \
    BaseVersionGenerator  # Adjust the import based on your actual structure


class FluenceAquaIntegration:
    def __init__(self):
        # Create instances for Fluence and Aqua version generators
        fluence_version_generator = BaseVersionGenerator(name="Fluence")
        aqua_version_generator = BaseVersionGenerator(name="Aqua")

        # Create FluenceAquaHandler instance
        self.fluence_aqua_handler = FluenceAquaHandler(fluence_version_generator, aqua_version_generator)

    def integrate_fluence_aqua(self):
        # Handle Fluence and Aqua integration
        self.fluence_aqua_handler.handle_fluence_aqua_integration()

        # Get integration version information
        integration_info = self.fluence_aqua_handler.get_integration_version_info()
        return integration_info
