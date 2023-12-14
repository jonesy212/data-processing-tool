# error_handling.py
from error_handling_build_integration import (BuildIntegrationError,
                                              handle_build_integration_errors)
from error_handling_code_generation import (CodeGenerationError,
                                            handle_code_generation_errors)
from error_handling_config_options import (ConfigOptionsError,
                                           handle_config_options_errors)
from error_handling_metadata_extraction import (
    MetadataExtractionError, handle_metadata_extraction_errors)
from error_handling_naming_conventions import (
    NamingConventionsError, handle_naming_conventions_errors)
from error_handling_project_analysis import (ProjectAnalysisError,
                                             handle_project_analysis_errors)
from error_handling_template_engine import (TemplateEngineError,
                                            handle_template_engine_errors)


def handle_errors(component, error_type, details):
    if component == 'naming_conventions':
        handle_naming_conventions_errors(error_type, details)
    elif component == 'project_analysis':
        handle_project_analysis_errors(error_type, details)
    elif component == 'metadata_extraction':
        handle_metadata_extraction_errors(error_type, details)
    elif component == 'template_engine':
        handle_template_engine_errors(error_type, details)
    elif component == 'build_integration':
        handle_build_integration_errors(error_type, details)
    elif component == 'config_options':
        handle_config_options_errors(error_type, details)
    elif component == 'code_generation':
        handle_code_generation_errors(error_type, details)
    else:
        raise ValueError("Invalid component specified for error handling")
