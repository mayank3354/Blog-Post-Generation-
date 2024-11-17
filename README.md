# Next JS & Open AI / GEMINI: Next-generation Next JS & AI apps
# Blog Post Generation App

This is a Next.js-based application that generates SEO-friendly blog posts using the Google Generative AI API. It includes user authentication via Auth0 and stores user-generated posts in a MongoDB database.

## Features
- **Google Generative AI Integration**: Generate blog posts and SEO metadata using Google's Generative AI (Gemini).
- **Auth0 Authentication**: Secure user authentication.
- **MongoDB Integration**: Store and manage user profiles and blog posts.
- **Responsive Design**: Built with modern UI components.
- **Token System**: Users can track and manage API usage.

## Tech Stack
- **Frontend**: Next.js, Tailwind CSS
- **Backend**: Node.js, MongoDB
- **Authentication**: Auth0
- **AI Integration**: Google Generative AI (Gemini-1.5 model)

---

## Prerequisites
Make sure you have the following installed:
1. Node.js (>=16.x)
2. MongoDB (local or cloud-based, e.g., MongoDB Atlas)
3. Auth0 account
4. Google Generative AI API key

---

## Installation

### 1. Clone the repository:
```bash
git clone https://github.com/mayank3354/Blog-Post-Generation-.git
cd Blog-Post-Generation-

#Folder Structure
.
├── components          # React components (e.g., AppLayout)
├── lib                 # Helper libraries (e.g., MongoDB connection)
├── pages
│   ├── api             # API routes
│   ├── post            # Post-related pages
│   └── index.js        # Homepage
├── public              # Static assets
├── styles              # Global styles
└── utils               # Utility functions
