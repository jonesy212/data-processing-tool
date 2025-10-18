import os
import subprocess


def generate_html_from_tsx(tsx_file):
    
   

    try:
        # Run a command to transpile TypeScript to JavaScript
        subprocess.run(['tsc', tsx_file])

        # Extract the generated JavaScript code
        js_file_path = tsx_file.replace('.tsx', '.js')
        with open(js_file_path, 'r') as js_file:
            js_code = js_file.read()

        # Assume the HTML is within a `return` statement in the generated JavaScript
        html_start = js_code.find('return (') + len('return (')
        html_end = js_code.find(');', html_start)

        # Extract the HTML content
        html_content = js_code[html_start:html_end]

        # Write the HTML to a new file
        html_file_path = tsx_file.replace('.tsx', '_form.html')
        with open(html_file_path, 'w') as html_file:
            html_file.write(html_content)

        print(f"HTML file generated: {html_file_path}")

        return html_file_path

    except Exception as e:
        print(f"Error generating HTML: {e}")
        return None

def generate_html_for_files(tsx_files):
    generated_files = []
    for tsx_file in tsx_files:
        generated_file = generate_html_from_tsx(tsx_file)
        if generated_file:
            generated_files.append(generated_file)
    return generated_files

# Include the generated HTML files
generated_html_files = generate_html_for_files(['login_form.tsx'])  # Add more files as needed

if __name__ == "__main__":
    tsx_files_to_process = ['login_form.tsx', 'other_form.tsx']  # Add more files as needed
    generated_files = generate_html_for_files(tsx_files_to_process)


    # Now, you can use generated_files to integrate the HTML with your application.
