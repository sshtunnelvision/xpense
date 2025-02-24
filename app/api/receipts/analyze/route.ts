import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import OpenAI from "openai";
import { readFile } from "fs/promises";
import { join } from "path";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getUserFromToken(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload.userId;
  } catch {
    return null;
  }
}

async function imageUrlToBase64(imagePath: string): Promise<string> {
  try {
    // Remove leading slash if present
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    // Get the full path to the image
    const fullPath = join(process.cwd(), 'public', cleanPath);
    // Read the file
    const imageBuffer = await readFile(fullPath);
    // Convert to base64
    return `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw new Error('Failed to process image');
  }
}

export async function POST(request: Request) {
  try {
    // Get the user token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify the user
    const userId = await getUserFromToken(token);
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the image URL from the request body
    const { imageUrl } = await request.json();
    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    console.log('Processing image URL:', imageUrl);

    // Convert the local image path to base64
    const base64Image = await imageUrlToBase64(imageUrl);

    // Call OpenAI API to analyze the receipt
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please analyze this receipt and extract the following information in JSON format with these exact field names:\n" +
                "- company (name of the business/establishment)\n" +
                "- date (in ISO format YYYY-MM-DD)\n" +
                "- time (in 24-hour format HH:MM)\n" +
                "- items (comma-separated list of main items purchased)\n" +
                "- subtotal (number, before tax and tip)\n" +
                "- tax (number, tax amount)\n" +
                "- tip (number, if present)\n" +
                "- total (number, final amount including tax and tip)\n" +
                "- amount (same as total, included for backward compatibility)\n" +
                "- category (one of: food, transport, entertainment, shopping, utilities, other)\n" +
                "- notes (provide a brief business purpose based on the items/establishment, e.g., 'Team lunch meeting at Restaurant Name', 'Office supplies from Store Name', etc.)\n\n" +
                "If you can't determine a field, use null.",
            },
            {
              type: "image_url",
              image_url: {
                url: base64Image,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    if (!response.choices[0]?.message?.content) {
      throw new Error("No response from OpenAI");
    }

    // Parse the JSON response
    const content = response.choices[0].message.content;
    console.log('OpenAI Response:', content);

    let parsedData;
    try {
      parsedData = JSON.parse(content);
      // Ensure amount is set to total for backward compatibility
      if (!parsedData.amount && parsedData.total) {
        parsedData.amount = parsedData.total;
      }
      console.log('Parsed Data:', parsedData);
    } catch {
      // If JSON parsing fails, try to extract the JSON part from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
        // Ensure amount is set to total for backward compatibility
        if (!parsedData.amount && parsedData.total) {
          parsedData.amount = parsedData.total;
        }
      } else {
        throw new Error("Failed to parse OpenAI response");
      }
    }

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error("Error analyzing receipt:", error);
    // More detailed error response
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorDetails = error instanceof OpenAI.APIError ? {
      status: error.status,
      code: error.code,
      type: error.type,
      param: error.param
    } : undefined;

    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails
      },
      { status: 500 }
    );
  }
} 