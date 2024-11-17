// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import { GoogleGenerativeAI } from "@google/generative-ai";
import clientPromise from "../../lib/mongodb";

export default withApiAuthRequired(async function handler(req, res) {
  const { user } = await getSession(req, res);

  const client = await clientPromise;
  // console.log("Database connected:", client.isConnected());

  const db = client.db("BlogStandard");
  const userProfile = await db.collection("users").findOne({
    auth0ID: user.sub,
  });

  console.log(userProfile);
  console.log(user.sub);
  if (!userProfile?.availableTokens) {
    res.status(403).json({ error: "Insufficient tokens available" });
    return;
  }

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-002" });

  const { topic, keywords } = req.body;

  try {
    // Generate Blog Post
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [
            {
              text: `You are an SEO Friendly blog post generator called Blog Standard. Your task is to write a detailed, SEO-friendly blog post based on the following context:
              
              - Topic: ${topic}
              - Keywords: ${keywords}
              
              Write a comprehensive blog post for the above topic and keywords.
              Please use markdown as the formatter.`,
            },
          ],
        },
        {
          role: "model",
          parts: [{ text: "Understood. Here is your blog post:" }],
        },
      ],
    });

    const blogResult = await chat.sendMessage("Generate the blog post");
    const generatedContent = blogResult?.response?.text();

    if (!generatedContent) {
      throw new Error("Failed to generate blog content.");
    }

    // Generate SEO Metadata
    const seoChat = model.startChat({
      history: [
        {
          role: "user",
          parts: [
            {
              text: `You are an SEO generator. Based on the following blog content, generate a JSON response with a title and meta description:

Blog Content:
${generatedContent}

The output **must only contain JSON** in the following format:
{
  "title": "example title",
  "metaDescription": "example meta description"
} 
              `,
            },
          ],
        },
      ],
      response_format: { type : "json_object"}
    });

    const seoResult = await seoChat.sendMessage("Generate SEO metadata");
    let seoContent = seoResult?.response?.text();

    const cleanedResponse = cleanJSON(seoContent);

    console.log("Cleaned JSON Response:", cleanedResponse);
    
    const { title, metaDescription } = JSON.parse(cleanedResponse);
    console.log("Title:", title);
    console.log("Meta Description:", metaDescription);
    // if (!title || !metaDescription) {
    //   throw new Error("Failed to generate valid SEO metadata.");
    // }
    
    // Update Database
    await db
      .collection("users")
      .updateOne({ auth0ID: user.sub }, { $inc: { availableTokens: -1 } });

    const post = await db.collection("posts").insertOne({
      generatedContent,
      topic,
      keywords,
      title,
      metaDescription,
      userID: userProfile._id,
      created: new Date(),
    });
    console.log("POST: ",post)

    // Respond with Success
    res.status(200).json({
      postID : post.insertedId
    });
  } catch (error) {
    console.error("Error generating blog post:", error);
    res.status(500).json({ error: "Failed to generate blog post" });
  }
});

// Helper Function to Check JSON Validity
function isJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

function cleanJSON(response) {
  // Remove Markdown backticks and extra formatting
  return response.replace(/```(?:json)?\n?|\n?```$/g, "").trim();
}