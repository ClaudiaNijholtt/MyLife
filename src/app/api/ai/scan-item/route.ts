import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import env from "@/config/env";

function extractJsonFromText(text: string) {
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");

  if (first === -1 || last === -1 || last <= first) {
    throw new Error("Claude response did not contain valid JSON");
  }

  return JSON.parse(text.slice(first, last + 1));
}

function getImageMediaType(type: string) {
  if (type === "image/png") return "image/png";
  if (type === "image/webp") return "image/webp";
  return "image/jpeg";
}

export async function POST(request: Request) {
  try {
    if (env.aiProvider !== "claude") {
      return NextResponse.json(
        { error: "AI provider is not configured for Claude" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") ?? formData.get("image");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing image file" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "Image too large (max 8MB)" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const anthropic = new Anthropic({ apiKey: env.claude.apiKey });

    const prompt = `Analyze this clothing image and return ONLY a valid JSON object with this exact shape:
{
  "name": "short product name",
  "category": "top|bottom|outerwear|shoes|jewelry|accessory|full-body|other",
  "subcategory": "see list below",
  "season": "summer|winter|all",
  "colors": ["lowercase color names"],
  "brand": "brand name or empty string",
  "size": "size if visible or empty string",
  "style": "casual|classy|sporty|formal|bohemian|streetwear|minimalist|other",
  "confidence": 0.0
}

Valid subcategories per category:
- top: t-shirt, sweater, blouse, shirt, top, tank-top, bodysuit, other
- bottom: shorts, pants, trousers, tights, skirt, jeans, other
- outerwear: jacket, vest, cardigan, blazer, coat, other
- shoes: sneakers, boots, sandals, heels, flats, slippers, other
- jewelry: earrings, necklace, bracelet, ring, watch, anklet, other
- accessory: bag, belt, scarf, hat, sunglasses, headband, other
- full-body: dress, jumpsuit, romper, overall, other

Rules:
- category MUST be one of: top, bottom, outerwear, shoes, jewelry, accessory, full-body, other
- subcategory MUST be from the list above matching the chosen category
- colors MUST be an array of lowercase color names (e.g. ["green", "black"]). Always include at least one color.
- colors should ONLY include colors of the clothing item itself. IGNORE the background, floor, wall, or any other objects in the image.
- A dress is category "full-body", subcategory "dress"
- If unsure, use sensible defaults and lower confidence.
- Output JSON only, no markdown and no explanation.`;

    const message = await anthropic.messages.create({
      model: env.claude.model,
      max_tokens: 700,
      temperature: 0.1,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: getImageMediaType(file.type),
                data: base64,
              },
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    });

    const textPart = message.content.find((part) => part.type === "text");
    if (!textPart || textPart.type !== "text") {
      throw new Error("Claude response did not contain text output");
    }

    const parsed = extractJsonFromText(textPart.text);

    return NextResponse.json({
      provider: "claude",
      model: env.claude.model,
      data: parsed,
    });
  } catch (error) {
    console.error("scan-item error", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
