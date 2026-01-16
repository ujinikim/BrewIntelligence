import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

export interface Coffee {
  name: string;
  roaster: string;
  roast: string;
  loc_country: string;
  origin: string;
  '100g_USD': number;
  rating: number;
  review_date: string;
  review: string;
  value_score: number; // Positive = Good Value, Negative = Bad Value
}

export const getCoffeeData = async (): Promise<Coffee[]> => {
  // Path is relative to the process cwd, which in Next.js is the project root (web/)
  const filePath = path.join(process.cwd(), 'src/data/coffee_data_scored.csv');
  
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');

    const { data } = Papa.parse<Coffee>(fileContent, {
      header: true,
      dynamicTyping: true, // Automatically convert numbers
      skipEmptyLines: true,
    });

    return data;
  } catch (error) {
    console.error("Error reading coffee data:", error);
    return [];
  }
};
