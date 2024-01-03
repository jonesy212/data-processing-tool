import nltk
from nltk.tokenize import word_tokenize

# Download the necessary resources for tokenization
nltk.download('punkt')

def tokenize_text(data, column):
    from nltk.tokenize import word_tokenize
    data[column] = data[column].apply(word_tokenize)

# Example of text tokenization
text = "This is an example sentence."
tokens = word_tokenize(text)

print(tokens)