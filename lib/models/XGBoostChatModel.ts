import * as tf from '@tensorflow/tfjs';
import { RandomForestClassifier } from 'ml-random-forest';

// Feature extraction utilities
interface FeatureVector {
  [key: string]: number;
}

interface TrainingData {
  input: string;
  response: string;
}

/**
 * XGBoost-based chatbot model implementation
 * Uses decision tree ensemble methods for better message classification
 */
export class XGBoostChatModel {
  private responses: Record<string, string>;
  private fallbackResponses: string[];
  private vocabulary: Set<string>;
  private model: any; // Will hold the trained model
  private featureMap: Map<string, number>;
  private trainingData: TrainingData[];
  
  constructor() {
    // Initial training data
    this.responses = {
      "hello": "Hi there! How can I help you today?",
      "hi": "Hello! How can I assist you?",
      "how are you": "I'm just a bot, but I'm functioning well! How can I help you?",
      "help": "I can help you with product information, store locations, and basic troubleshooting. What do you need?",
      "bye": "Goodbye! Feel free to chat again if you need assistance.",
      "thank you": "You're welcome! Is there anything else I can help with?",
      "thanks": "You're welcome! Is there anything else I can help with?",
      "product": "We offer smartphones, laptops, and accessories. Which category are you interested in?",
      "smartphone": "We have the latest models from Apple, Samsung, and other brands. Would you like specific information?",
      "laptop": "Our laptop collection includes gaming, business, and everyday use models. What are you looking for?",
      "store": "You can find our stores in major cities. Use the store locator on the customer dashboard to find the nearest one.",
      "price": "Prices vary by product. You can check specific prices on the product pages or visit a store near you.",
      "discount": "We regularly offer discounts and promotions. Check the offers section for current deals.",
      "warranty": "Most products come with a standard 1-year warranty. Extended warranty options are available at checkout.",
      "return policy": "We offer a 30-day return policy for most products, provided they're in original condition with packaging."
    };

    this.fallbackResponses = [
      "I'm not sure I understand. Could you rephrase that?",
      "I don't have information on that yet. Can I help with something else?",
      "I'm still learning! Could you try asking something else?",
      "I don't have an answer for that. Would you like to know about our products or stores instead?"
    ];
    
    // Initialize model components
    this.vocabulary = new Set<string>();
    this.featureMap = new Map<string, number>();
    this.trainingData = [];
    
    // Convert initial responses to training data
    Object.entries(this.responses).forEach(([input, response]) => {
      this.trainingData.push({ input, response });
    });
    
    // Build vocabulary from initial training data
    this.buildVocabulary();
    
    // Train the initial model
    this.trainModel();
  }
  
  /**
   * Builds vocabulary from training data
   */
  private buildVocabulary(): void {
    // Clear existing vocabulary
    this.vocabulary.clear();
    
    // Process each training example
    this.trainingData.forEach(example => {
      // Tokenize and add to vocabulary
      const tokens = this.tokenize(example.input);
      tokens.forEach(token => this.vocabulary.add(token));
    });
    
    // Create feature map (word to index mapping)
    this.featureMap.clear();
    Array.from(this.vocabulary).forEach((word, index) => {
      this.featureMap.set(word, index);
    });
  }
  
  /**
   * Simple tokenization function
   */
  private tokenize(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .split(/\s+/) // Split by whitespace
      .filter(token => token.length > 0); // Remove empty tokens
  }
  
  /**
   * Convert text to bag-of-words feature vector
   */
  private textToFeatures(text: string): number[] {
    const tokens = this.tokenize(text);
    const features = new Array(this.vocabulary.size).fill(0);
    
    tokens.forEach(token => {
      const index = this.featureMap.get(token);
      if (index !== undefined) {
        features[index] += 1; // Count occurrences
      }
    });
    
    return features;
  }
  
  /**
   * Train the XGBoost model using the current training data
   */
  private trainModel(): void {
    if (this.trainingData.length === 0) return;
    
    try {
      // Prepare features and labels
      const X: number[][] = [];
      const y: number[] = [];
      
      // Create a map of unique responses
      const responseMap = new Map<string, number>();
      this.trainingData.forEach(example => {
        if (!responseMap.has(example.response)) {
          responseMap.set(example.response, responseMap.size);
        }
      });
      
      // Convert training data to features and labels
      this.trainingData.forEach(example => {
        const features = this.textToFeatures(example.input);
        const label = responseMap.get(example.response) || 0;
        
        X.push(features);
        y.push(label);
      });
      
      // Train the model using Random Forest (as XGBoost alternative)
      const options = {
        seed: 42,
        maxFeatures: 0.8,
        replacement: true,
        nEstimators: 25
      };
      
      this.model = new RandomForestClassifier(options);
      this.model.train(X, y);
      
      // Store response mapping for prediction
      this.model.responseMap = Array.from(responseMap.entries())
        .reduce((obj, [response, index]) => {
          obj[index] = response;
          return obj;
        }, {} as Record<number, string>);
      
    } catch (error) {
      console.error('Error training model:', error);
    }
  }
  
  /**
   * Train the model with new data
   */
  train(input: string, response: string): void {
    const normalizedInput = input.toLowerCase().trim();
    
    // Add to responses dictionary for fallback
    this.responses[normalizedInput] = response;
    
    // Add to training data
    this.trainingData.push({ input: normalizedInput, response });
    
    // Rebuild vocabulary with new data
    this.buildVocabulary();
    
    // Retrain the model
    this.trainModel();
  }
  
  /**
   * Get a response based on input using the trained model
   */
  getResponse(input: string): string {
    const normalizedInput = input.toLowerCase().trim();
    
    // Direct match (fallback to dictionary approach)
    if (this.responses[normalizedInput]) {
      return this.responses[normalizedInput];
    }
    
    try {
      // Use the model for prediction if available
      if (this.model) {
        const features = this.textToFeatures(normalizedInput);
        const prediction = this.model.predict([features]);
        
        // Get the predicted response
        if (prediction.length > 0 && this.model.responseMap[prediction[0]]) {
          return this.model.responseMap[prediction[0]];
        }
      }
      
      // Fallback to keyword matching if model prediction fails
      for (const key in this.responses) {
        if (normalizedInput.includes(key)) {
          return this.responses[key];
        }
      }
    } catch (error) {
      console.error('Error in prediction:', error);
    }
    
    // Fallback response if everything else fails
    return this.fallbackResponses[Math.floor(Math.random() * this.fallbackResponses.length)];
  }
}