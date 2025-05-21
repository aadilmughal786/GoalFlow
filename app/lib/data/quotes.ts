// src/lib/data/quotes.ts

import { IQuote } from "@/types";
import { v4 as uuidv4 } from "uuid";

export const initialQuotes: Omit<IQuote, "id" | "createdAt">[] = [
  {
    text: "The best way to predict the future is to create it.",
    author: "Peter Drucker",
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
  },
  {
    text: "Success is not final, failure is not fatal: It is the courage to continue that counts.",
    author: "Winston S. Churchill",
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
  },
  {
    text: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt",
  },
  { text: "The harder I work, the luckier I get.", author: "Samuel Goldwyn" },
  {
    text: "It always seems impossible until it's done.",
    author: "Nelson Mandela",
  },
  {
    text: "The mind is everything. What you think you become.",
    author: "Buddha",
  },
  {
    text: "Strive not to be a success, but rather to be of value.",
    author: "Albert Einstein",
  },
  {
    text: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
    author: "Nelson Mandela",
  },
  {
    text: "The only limit to our realization of tomorrow will be our doubts of today.",
    author: "Franklin D. Roosevelt",
  },
  {
    text: "Do not wait for a leader; do it alone, person to person.",
    author: "Mother Teresa",
  },
  {
    text: "The journey of a thousand miles begins with a single step.",
    author: "Lao Tzu",
  },
  {
    text: "What you get by achieving your goals is not as important as what you become by achieving your goals.",
    author: "Zig Ziglar",
  },
  {
    text: "The difference between ordinary and extraordinary is that little extra.",
    author: "Jimmy Johnson",
  },
  {
    text: "Your time is limited, don't waste it living someone else's life.",
    author: "Steve Jobs",
  },
  { text: "The best revenge is massive success.", author: "Frank Sinatra" },
  {
    text: "If you want to achieve greatness stop asking for permission.",
    author: "Anonymous",
  },
  {
    text: "Things work out best for those who make the best of how things work out.",
    author: "John Wooden",
  },
  {
    text: "To live a creative life, we must lose our fear of being wrong.",
    author: "Joseph Chilton Pearce",
  },
  {
    text: "If you are not willing to risk the usual, you will have to settle for the ordinary.",
    author: "Jim Rohn",
  },
  {
    text: "All our dreams can come true, if we have the courage to pursue them.",
    author: "Walt Disney",
  },
  {
    text: "Don't be afraid to give up the good to go for the great.",
    author: "John D. Rockefeller",
  },
  {
    text: "I find that the harder I work, the more luck I seem to have.",
    author: "Thomas Jefferson",
  },
  {
    text: "Success is walking from failure to failure with no loss of enthusiasm.",
    author: "Winston Churchill",
  },
  {
    text: "The starting point of all achievement is desire.",
    author: "Napoleon Hill",
  },
  {
    text: "The only place where success comes before work is in the dictionary.",
    author: "Vidal Sassoon",
  },
  {
    text: "The best way to appreciate your job is to imagine yourself without one.",
    author: "Oscar Wilde",
  },
  {
    text: "You miss 100% of the shots you don't take.",
    author: "Wayne Gretzky",
  },
  {
    text: "If you want to lift yourself up, lift up someone else.",
    author: "Booker T. Washington",
  },
  {
    text: "The only person you are destined to become is the person you decide to be.",
    author: "Ralph Waldo Emerson",
  },
  {
    text: "Go confidently in the direction of your dreams. Live the life you have imagined.",
    author: "Henry David Thoreau",
  },
  {
    text: "What's money? A man is a success if he gets up in the morning and goes to bed at night and in between does what he wants to do.",
    author: "Bob Dylan",
  },
  {
    text: "Twenty years from now you will be more disappointed by the things that you didn't do than by the ones you did do.",
    author: "Mark Twain",
  },
  {
    text: "Build your own dreams, or someone else will hire you to build theirs.",
    author: "Farrah Gray",
  },
  {
    text: "The most difficult thing is the decision to act, the rest is merely tenacity.",
    author: "Amelia Earhart",
  },
  {
    text: "Every strike brings me closer to the next home run.",
    author: "Babe Ruth",
  },
  {
    text: "Definiteness of purpose is the starting point of all achievement.",
    author: "W. Clement Stone",
  },
  {
    text: "Life is 10% what happens to me and 90% of how I react to it.",
    author: "Charles R. Swindoll",
  },
  {
    text: "Your true success in life begins only when you commit to an­ exciting goal that is bigger than you are.",
    author: "Brian Tracy",
  },
];
