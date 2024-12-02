import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0"
import clientPromise from "../../lib/mongodb"
import { ObjectId } from "mongodb";

export default withApiAuthRequired(async function handler(req,res){
    try {
        const {user: {sub}} = await getSession(req, res)
        const client = await clientPromise;
        const db = client.db("BlogStandard")
        const userProfile = await db.collection("users").findOne({
            auth0ID: sub,
          });
          console.log("User Profile",userProfile)
        const {postId} = req.body;

        await db.collection("posts").deleteOne({
            userID: userProfile._id,
            _id: new ObjectId(postId),
        })
        res.status(200).json({ success: true})

    } catch (error) {
        console.log('Error Trying To delete a Post',error)
    }
    return;
})