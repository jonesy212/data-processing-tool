# error_handling_template_engine.py
class TemplateEngineError(Exception):
    pass

def handle_template_engine_errors(error_type, details):
    raise TemplateEngineError(f"Error in Template Engine ({error_type}): {details}")
