# Deploying Backend to Render.com (Free Tier)

## 1. Push Your Code to GitHub
- Make sure your backend code is in a GitHub repository.

## 2. Create a Render Account
- Go to https://render.com/ and sign up (use GitHub for easy integration).

## 3. Create a New Web Service
- Click "New +" → "Web Service".
- Connect your GitHub repo and select your backend project.

## 4. Configure the Service
- **Build Command:** `npm install`
- **Start Command:** `node src/index.js`
- **Environment:** Node
- **Branch:** main (or your default branch)

## 5. Add Environment Variables
- Click "Add Environment Variable" and add all variables from `.env.example` (copy your real values from your `.env` file).

## 6. Choose the Free Plan
- Select the free plan for your service.

## 7. Deploy
- Click "Create Web Service" to deploy.
- Render will build and deploy your backend, giving you a public URL (e.g., `https://your-backend.onrender.com`).

## 8. Update Google OAuth
- In the Google Cloud Console, set your OAuth "Authorized redirect URIs" to:
  ```
  https://your-backend.onrender.com/api/auth/google/callback
  ```

## 9. Test
- Your backend API is now live and accessible from anywhere!
