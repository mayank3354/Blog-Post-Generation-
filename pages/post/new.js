import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { AppLayout } from "../../components/AppLayout";
import { useState } from "react";
import Markdown from "react-markdown";
import { useRouter } from "next/router";
//mongoose.connect('mongodb+srv://new_user:mayank123@cluster0.at9io.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')

export default function NewPost(props) {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords  ] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
   

    const response = await fetch("/api/generatePost", {
      method: "POST",
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({topic, keywords})
    });
    const json = await response.json();
    console.log("RESULT :", json);
    if(json?.postID){
      router.push(`/post/${json.postID}`);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            <strong>
              Generate  a blog post on the topic of:
            </strong>
          </label>
          <textarea className="resize-none border border-slate-500 w-full block my-2 px-4 py-2 rounded-sm" value={topic} onChange={(e) => setTopic(e.target.value)}/>
        </div>
      <div>
      <label>
        <strong>
          Targeting the following keywords:
        </strong>
      </label>
      <textarea className="resize-none border border-slate-500 w-full block my-2 px-4 py-2 rounded-sm" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
      </div>
      <button type="submit" className="btn" >Generate</button>
      </form>
      
    
    </div>
  );
}

NewPost.getLayout = function getLayout(page, pageProps) {
  return <AppLayout {...pageProps}>{page}</AppLayout>;
};
export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx){
    const props = await getAppProps(ctx);
    return {
      props
    }
  }

});
