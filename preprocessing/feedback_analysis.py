# feedback_analysis.py
from preprocessing_steps import preprocess_text
from preprocess_text import analyze_sentiment, extract_topics, identify_key_phrases  # Import your existing functions

def analyze_feedback_data(feedback_data):
    for feedback in feedback_data:
        print("Feedback:", feedback)
        
        # Preprocess text
        preprocessed_text = preprocess_text(feedback)
        
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
