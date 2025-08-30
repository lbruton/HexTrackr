#!/usr/bin/env node

/**
 * HeyGemini - Direct Gemini API interaction script
 * Usage: node heygemini.js "Your question here"
 * Or: ./heygemini "Your question here"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', 'rEngine', '.env') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY not found in rEngine/.env');
  process.exit(1);
}

async function askGemini(question) {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    console.log('🤖 Asking Gemini...\n');
    
    const result = await model.generateContent(question);
    const response = await result.response;
    const text = response.text();
    
    console.log('✨ Gemini Response:\n');
    console.log(text);
    console.log('\n---\n');
    
    return text;
  } catch (error) {
    console.error('❌ Error calling Gemini API:', error.message);
    process.exit(1);
  }
}

// Get question from command line arguments
const question = process.argv.slice(2).join(' ');

if (!question) {
  console.log('Usage: node heygemini.js "Your question here"');
  console.log('   or: ./heygemini "Your question here"');
  process.exit(1);
}

askGemini(question).catch(console.error);
