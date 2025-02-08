import { NextRequest, NextResponse } from "next/server";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { createClient } from "@supabase/supabase-js";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { OpenAIEmbeddings } from "@langchain/openai";

// Before running, follow set-up instructions at
// https://js.langchain.com/v0.2/docs/integrations/vectorstores/supabase

/**
 * This handler takes input text, splits it into chunks, and embeds those chunks
 * into a vector store for later retrieval. See the following docs for more information:
 *
 * https://js.langchain.com/v0.2/docs/how_to/recursive_text_splitter
 * https://js.langchain.com/v0.2/docs/integrations/vectorstores/supabase
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const pdfFile = formData.get("pdf") as File;

    if (!pdfFile) {
      return NextResponse.json(
        { error: "No PDF file provided" },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const bytes = await pdfFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Dynamic import pdf-parse
    const { default: pdf } = await import('pdf-parse/lib/pdf-parse.js');
    
    // Extract text from PDF using the buffer directly
    const pdfData = await pdf(buffer, {
      pagerender: async function(pageData: any) {
        const textContent = await pageData.getTextContent();
        // Extract text from each item and join them with spaces (or newlines)
        return textContent.items.map((item: any) => item.str).join(" ");
      },
      max: 0,
    });

    
    const text = pdfData.text;

    // Create text chunks
    const splitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const documents = await splitter.createDocuments([text]);

    // Store in Supabase
    const client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PRIVATE_KEY!,
    );

    await SupabaseVectorStore.fromDocuments(
      documents,
      new OpenAIEmbeddings(),
      {
        client,
        tableName: "documents",
        queryName: "match_documents",
      },
    );

    return NextResponse.json({ message: "PDF processed successfully" });
  } catch (error: any) {
    console.error("Error processing PDF:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process PDF" },
      { status: 500 }
    );
  }
}
