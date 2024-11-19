// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { getSession } from "@auth0/nextjs-auth0";
import clientPromise from "../../lib/mongodb";
import Razorpay from "razorpay";
import stripeInit from "stripe"

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID, // Add in .env file
//   key_secret: process.env.RAZORPAY_KEY_SECRET, // Add in .env file
// });


const stripe = stripeInit(process.env.STRIPE_API_KEY)
export default async function handler(req, res) {
  const { user } = await getSession(req, res);
  console.log("user: ", user);

  const lineItems = [{
    price:process.env.STRIPE_PRODUCT_PRICE_ID,
    quantity: 1
  }]
  const protocol = process.env.NODE_ENV === 'development' ? "http://" : "https://";
  const host = req.headers.host;


  const checkoutSession = await stripe.checkout.sessions.create({
    line_items: lineItems,
    mode: "payment",
    success_url: `${protocol}${host}/success`,
  })
 

  const client = await clientPromise;
  const db = client.db("BlogStandard");
 
  const userProfile = await db.collection("users").updateOne(
    {
      auth0ID: user.sub,
    },
    {
      $inc: {
        availableTokens: 10,
      },
      $setOnInsert: {
        auth0ID: user.sub,
      },
    },
    {
      upsert: true,
    }
  );
  res.status(200).json({ session: checkoutSession});
}
