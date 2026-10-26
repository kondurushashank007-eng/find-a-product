export interface ParsedSearchQuery {
  productQuery: string;
  brand?: string;
  category?: string;
  size?: string;
  pricePreference?: "cheap" | "expensive" | "any";
  inStockOnly?: boolean;
  clarifyingQuestion?: string;
  source: "gemma-ai" | "heuristic-fallback";
}

/**
 * Interpret user natural language query using Gemma / LLM API or smart heuristics.
 * If GEMMA_API_KEY or GOOGLE_API_KEY / OPENAI_API_KEY is configured, it calls the Gemma endpoint.
 * Otherwise, it reliably parses natural language intent using semantic rule-based heuristics.
 */
export async function parseQueryWithGemmaAI(rawQuery: string): Promise<ParsedSearchQuery> {
  const query = rawQuery.trim();
  if (!query) {
    return { productQuery: "", source: "heuristic-fallback" };
  }

  // Check if Gemma API key or Open-compatible endpoint is configured
  const apiKey = process.env.GEMMA_API_KEY || process.env.GOOGLE_API_KEY || process.env.AI_API_KEY;
  const apiEndpoint = process.env.GEMMA_API_ENDPOINT || "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

  if (apiKey) {
    try {
      const prompt = `You are Gemma AI assisting a local product search engine.
Analyze the user's shopping query: "${query}"

Extract:
1. "productQuery": core item name or product being searched (e.g. "rice", "organic milk", "coffee beans")
2. "brand": specific brand if mentioned (e.g. "Nestle", "Barilla", "Apple") or null
3. "category": suggested category (e.g. "Grocery", "Dairy", "Bakery", "Produce", "Household") or null
4. "size": package size or quantity if mentioned (e.g. "1 kg", "500ml", "pack of 6") or null
5. "pricePreference": "cheap" (if cheap, budget, affordable, lowest price mentioned), "expensive" (if premium, luxury), or "any"
6. "inStockOnly": boolean, true if user asks for "available", "in stock", "now", "today", false otherwise
7. "clarifyingQuestion": if the query is extremely ambiguous (e.g. just a vague word like "stuff", "thing", "something to eat"), provide a concise clarifying question (e.g. "Are you looking for ready-to-eat meals or fresh groceries?"). Otherwise null.

Respond ONLY with valid JSON in this structure:
{
  "productQuery": string,
  "brand": string | null,
  "category": string | null,
  "size": string | null,
  "pricePreference": "cheap" | "expensive" | "any",
  "inStockOnly": boolean,
  "clarifyingQuestion": string | null
}`;

      // Support Google Generative AI / Gemma format
      const response = await fetch(`${apiEndpoint}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json",
          },
        }),
        signal: AbortSignal.timeout(5000), // 5 sec timeout
      });

      if (response.ok) {
        const data = await response.json();
        const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textContent) {
          const parsed = JSON.parse(textContent);
          return {
            productQuery: parsed.productQuery || query,
            brand: parsed.brand || undefined,
            category: parsed.category || undefined,
            size: parsed.size || undefined,
            pricePreference: parsed.pricePreference || "any",
            inStockOnly: !!parsed.inStockOnly,
            clarifyingQuestion: parsed.clarifyingQuestion || undefined,
            source: "gemma-ai",
          };
        }
      }
    } catch (err) {
      console.warn("Gemma AI API call failed or timed out, falling back to heuristic AI parser:", err);
    }
  }

  // Built-in intelligent NLP heuristic parser (always works reliably even without external API key)
  return parseNaturalLanguageQuery(query);
}

export function parseNaturalLanguageQuery(query: string): ParsedSearchQuery {
  let cleaned = query.toLowerCase();

  // Ambiguity check
  const trimmed = cleaned.trim();
  const veryAmbiguous = ["stuff", "food", "thing", "items", "goods", "shop", "products"];
  if (veryAmbiguous.includes(trimmed)) {
    return {
      productQuery: trimmed,
      clarifyingQuestion: `Could you specify what kind of ${trimmed} you are looking for (e.g. fresh bread, milk, coffee, or snacks)?`,
      source: "heuristic-fallback",
    };
  }

  // Price preferences
  let pricePreference: "cheap" | "expensive" | "any" = "any";
  if (/\b(cheap|cheapest|budget|affordable|low cost|inexpensive|lowest price)\b/i.test(cleaned)) {
    pricePreference = "cheap";
    cleaned = cleaned.replace(/\b(cheap|cheapest|budget|affordable|low cost|inexpensive|lowest price)\b/gi, " ");
  } else if (/\b(expensive|premium|luxury|high end)\b/i.test(cleaned)) {
    pricePreference = "expensive";
    cleaned = cleaned.replace(/\b(expensive|premium|luxury|high end)\b/gi, " ");
  }

  // In-stock preference
  let inStockOnly = false;
  if (/\b(in stock|available|ready to pick up|on hand|right now)\b/i.test(cleaned)) {
    inStockOnly = true;
    cleaned = cleaned.replace(/\b(in stock|available|ready to pick up|on hand|right now)\b/gi, " ");
  }

  // Near me / local intent removal
  cleaned = cleaned.replace(/\b(near me|nearby|around here|closest|local|in town|around)\b/gi, " ");

  // Extract size / weights (e.g., 1kg, 500g, 1 kg, 2 liters, 500ml, pack of 6)
  let size: string | undefined = undefined;
  const sizeMatch = cleaned.match(/\b(\d+(?:\.\d+)?\s*(?:kg|g|gm|liter|litre|l|ml|oz|lb|lbs|pack|pcs|piece|pieces))\b/i);
  if (sizeMatch) {
    size = sizeMatch[0];
    cleaned = cleaned.replace(sizeMatch[0], " ");
  }

  // Extract common known brands
  const knownBrands = [
    "Barilla", "Organic Valley", "Lactaid", "Heinz", "Chobani",
    "Coca-Cola", "Pepsi", "Quaker", "Tropicana", "Folgers",
    "Lipton", "Colgate", "Dove", "Tide", "Charmin", "Bounty"
  ];
  let detectedBrand: string | undefined = undefined;
  for (const b of knownBrands) {
    const brandRegex = new RegExp(`\\b${b}\\b`, "i");
    if (brandRegex.test(cleaned)) {
      detectedBrand = b;
      cleaned = cleaned.replace(brandRegex, " ");
      break;
    }
  }

  // Clean remaining whitespace
  const finalProductQuery = cleaned.replace(/\s+/g, " ").trim();

  return {
    productQuery: finalProductQuery || query,
    brand: detectedBrand,
    size,
    pricePreference,
    inStockOnly,
    source: "heuristic-fallback",
  };
}
