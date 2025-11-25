import type { FoodData } from './types';

export const mockFoodData: FoodData = {
  "Fruits": {
    "Apple": {
      "Macros": { "All": "Carbohydrates: 25g, Fiber: 4g, Sugar: 19g, Protein: 0.5g" },
      "Micros": { "All": "Vitamin C: 14% DV, Potassium: 6% DV, Vitamin K: 5% DV" },
      "Specific Benefits": { "All": "Rich in fiber and antioxidants. Promotes gut health and may lower the risk of chronic diseases like heart disease and diabetes." },
      "Health Tags": { "All": "Gut Health, Heart Health, Antioxidant" },
      "_imageUrl": { "All": "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?q=80&w=800" }
    }
  },
  "Nuts": {
    "Almonds": {
      "Macros": { "All": "Fat: 14g (mostly monounsaturated), Protein: 6g, Carbohydrates: 6g, Fiber: 3.5g" },
      "Micros": { "All": "Vitamin E: 37% DV, Magnesium: 20% DV, Manganese: 32% DV" },
      "Specific Benefits": { "All": "Excellent source of healthy fats, vitamin E, and magnesium. Helps lower cholesterol and blood pressure." },
      "Health Tags": { "All": "Heart Health, Blood Sugar Control, Healthy Fats" },
      "_imageUrl": { "All": "https://images.unsplash.com/photo-1607532941433-304659e8198a?q=80&w=800" }
    }
  },
  "Herbs": {
    "Turmeric": {
      "Specific Benefits": { "All": "Contains curcumin, a substance with powerful anti-inflammatory and antioxidant properties. It's a cornerstone of traditional medicine." },
      "Active Constituents": { "All": "Curcuminoids, primarily Curcumin." },
      "Notes / Traditional Wisdom": { "All": "Known as a 'warming' spice in Ayurveda, used to purify the blood and support healthy joints." },
      "Clinical Synergy / Key Combinations (Only for herbs)": { "All": "Combine with black pepper (piperine) to dramatically increase curcumin absorption." }
    }
  }
};
