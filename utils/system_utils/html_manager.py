# html_manager.py

import re

from bs4 import BeautifulSoup


class HTMLManager:
    @staticmethod
    def process_html(html_content):
        # Use BeautifulSoup for parsing HTML and extracting meaningful tags
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Extract meaningful tags (e.g., headings, paragraphs)
        meaningful_tags = soup.find_all(['h1', 'h2', 'h3', 'p', 'a', 'ul', 'ol', 'li'])
        
        # Extract text content from the tags
        cleaned_text = ' '.join(tag.get_text() for tag in meaningful_tags)
        
        # Tokenize the text into words or phrases
        tokens = re.findall(r'\b\w+\b', cleaned_text)
        
        return tokens
