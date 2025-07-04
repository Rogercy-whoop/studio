export interface ClothingItem {
  id: string;
  photoDataUri: string;
  category: string;
  subCategory: string;
  tags: string[];
  dominantColors: string[];
  hasPattern: boolean;
  patternDescription?: string;
}

export interface Inspiration {
  id: string;
  description: string;
  items: ClothingItem[];
}
