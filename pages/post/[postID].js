import { getSession, withPageAuthRequired } from "@auth0/nextjs-auth0";
import { AppLayout } from "../../components/AppLayout";
import { ObjectId } from "mongodb";
import clientPromise from "../../lib/mongodb";
import Markdown from "react-markdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHashtag } from "@fortawesome/free-solid-svg-icons";
import { getAppProps } from "../../utils/getAppProps";
import { useContext, useState } from "react";
import { useRouter } from "next/router";
import PostsContext from "../../context/postsContext";

export default function Post(props) {
  console.log("PROPS: ", props);
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { deletePost } = useContext(PostsContext);

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`/api/deletePost`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId: props.id }),
      });
      const json = await response.json();

      if (json.success) {
        deletePost(props.id);
        // Redirect to create a new post page
        router.replace("/post/new"); // Use absolute path
      } else {
        console.error(
          "Failed to delete the post:",
          json.error || "Unknown error"
        );
      }
    } catch (e) {
      console.error("Error occurred while deleting the post:", e);
    }
  };

  return (
    <div className="overflow-auto h-full">
      <div className="max-w-screen-sm mx-auto">
        <div className="text-sm font-bold mt-6 p-2 bg-stone-200 rounded-sm">
          SEO title and meta description
        </div>
        <div className="p-4 my-2 border border-stone-200 rounded-md">
          <div className="text-blue-600 text-2xl font-bold">{props.title}</div>
          <div className="mt-2">{props.metaDescription}</div>
        </div>
        <div className="text-sm font-bold mt-6 p-2 bg-stone-200 rounded-sm">
          Keywords
        </div>
        <div className="flex flex-wrap pt-2 gap-1">
          {props.keywords.split(",").map((keyword, i) => (
            <div key={i} className="p-2 rounded-full bg-slate-800 text-white">
              <FontAwesomeIcon icon={faHashtag} /> {keyword}
            </div>
          ))}
        </div>
        <div className="text-sm font-bold mt-6 p-2 bg-stone-200 rounded-sm">
          Blog post
        </div>
        <Markdown>{props.postContent}</Markdown>
      </div>
      <div className="my-4 ">
        {!showDeleteConfirm && (
          <button
            className="btn bg-red-600 hover:bg-red-700"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Post
          </button>
        )}
        {!!showDeleteConfirm && (
          <div className="p-2 bg-red-300 text-center">
            <p>
              Are you sure you want to delete this post? This action is
              irreversible.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn bg-stone-600 hover:bg-stone-700"
              >
                cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="btn bg-red-600 hover:bg-red-700"
              >
                confirm delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

Post.getLayout = function getLayout(page, pageProps) {
  return <AppLayout {...pageProps}>{page}</AppLayout>;
};

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    const props = await getAppProps(ctx);

    const userSession = await getSession(ctx.req, ctx.res);
    const client = await clientPromise;
    const db = client.db("BlogStandard");

    const user = await db.collection("users").findOne({
      auth0ID: userSession.user.sub,
    });

    if (!user) {
      // Handle case where user is not found
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      };
    }

    const post = await db.collection("posts").findOne({
      _id: new ObjectId(ctx.params.postID),
      userID: user._id,
    });
    console.log(user._id, post);
    if (!post) {
      // Redirect to create new post page if post is not found
      return {
        redirect: {
          destination: "/post/new",
          permanent: false,
        },
      };
    }

    return {
      props: {
        id: ctx.params.postID,
        postContent: post.generatedContent,
        title: post.title,
        metaDescription: post.metaDescription,
        topic: post.topic,
        keywords: post.keywords,
        postCreated: post.created.toString(),
        ...props,
      },
    };
  },
});
