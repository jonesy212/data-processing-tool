# backend.py

from flask import Flask, jsonify, render_template, request
from html_manager import HTMLManager

app = Flask(__name__)

@app.route('/process-text', methods=['POST'])
def process_text():
    data = request.get_json()
    text = data.get('text', '')
    
    # Process HTML content using the HTML manager
    tokens = HTMLManager.process_html(text)
    
    # You can perform additional processing based on tokens
    
    result = {'tokens': tokens}
    return jsonify({'result': result})

if __name__ == '__main__':
    app.run(debug=True)
