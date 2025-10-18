from collections import Counter

import nltk
from nltk.corpus import stopwords
from nltk.sentiment import SentimentIntensityAnalyzer
from nltk.stem import WordNetLemmatizer
from nltk.tokenize import sent_tokenize, word_tokenize
from feedback_analysis import analyze_sentiment, extract_topics, identify_key_phrases, analyze_feedback_data
# Download NLTK resources if not already downloaded
nltk.download('punkt')
nltk.download('vader_lexicon')
nltk.download('stopwords')
nltk.download('wordnet')

# Function to preprocess text
def preprocess_text(text):
    # Tokenize text into sentences and then into words
    sentences = sent_tokenize(text)
    words = [word_tokenize(sentence) for sentence in sentences]
    
    # Convert words to lowercase and remove punctuation
    words = [[word.lower() for word in sentence if word.isalnum()] for sentence in words]
    
    # Remove stop words
    stop_words = set(stopwords.words('english'))
    words = [[word for word in sentence if word not in stop_words] for sentence in words]
    
    # Lemmatize words
    lemmatizer = WordNetLemmatizer()
    words = [[lemmatizer.lemmatize(word) for word in sentence] for sentence in words]
    
    return words

# Function for sentiment analysis
def analyze_sentiment(text):
    analyzer = SentimentIntensityAnalyzer()
    sentiment_score = analyzer.polarity_scores(text)
    return sentiment_score

# Function for topic extraction
def extract_topics(text, num_topics=5):
    words = preprocess_text(text)
    # Flatten the list of words
    all_words = [word for sentence in words for word in sentence]
    # Count word occurrences
    word_counts = Counter(all_words)
    # Extract the most common words as topics
    topics = [topic for topic, _ in word_counts.most_common(num_topics)]
    return topics

# Function for identifying key phrases
def identify_key_phrases(text):
    phrases = []
    sentences = sent_tokenize(text)
    for sentence in sentences:
        words = word_tokenize(sentence)
        tagged_words = nltk.pos_tag(words)
        # Extract noun phrases (NN, NNS, NNP, NNPS)
        phrases.extend(" ".join(word for word, pos in tagged_words if pos.startswith('NN')))

    return phrases

# Example feedback data
feedback_data = [
    "The project management app is great! It allows seamless communication via audio, video, and text. The real-time collaboration features are impressive.",
    "I found the phases-based project management framework very useful. It helped in team formation and brainstorming the product effectively.",
    "The data analysis tools provided meaningful insights for iterative improvements. Overall, the app is user-friendly and facilitates global collaboration.",
    "The community involvement aspect of the app is commendable. It promotes unity and encourages positive impact solutions.",
    "The monetization opportunities for developers are attractive. It incentivizes efficient project execution and contributes to the sustainability of the platform.",
    "The app interface is intuitive, making it easy to navigate and use. The ability to customize features according to project requirements adds flexibility.",
    "I appreciate the inclusive design approach of the app, ensuring accessibility for users with diverse needs. It reflects a commitment to diversity and inclusion.",
    "The app's security measures are robust, safeguarding user data and ensuring privacy. This instills trust among users and enhances the platform's credibility.",
    "The support for multiple languages enhances the app's global reach and inclusivity. It facilitates collaboration among users from different linguistic backgrounds."
]



# Call the function to analyze feedback data
analyze_feedback_data(feedback_data)


# Analyze each feedback
for feedback in feedback_data:
    print("Feedback:", feedback)
    
    # Sentiment analysis
    sentiment_score = analyze_sentiment(feedback)
    print("Sentiment Score:", sentiment_score)
    
    # Topic extraction
    topics = extract_topics(feedback)
    print("Topics:", topics)
    
    # Key phrase identification
    key_phrases = identify_key_phrases(feedback)
    print("Key Phrases:", key_phrases)
    
    print()  # Empty line for readability
