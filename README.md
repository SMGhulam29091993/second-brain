# Gemini Project Overview: Second Brain

## 1. Project Description

This project is the backend service for a "Second Brain" application. Its primary purpose is to allow users to save web links, which are then automatically summarized and tagged using an AI service. Users can then manage and retrieve this processed content.

## 2. Technology Stack

- **Backend:** Node.js with the Express.js framework.
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose as the Object Data Modeling (ODM) library.
- **Authentication:** JSON Web Tokens (JWT) for securing API endpoints.
- **AI Integration:** Uses Google's Generative AI (likely Gemini) to process URLs and extract summaries and tags.
- **Other Key Libraries:** `bcryptjs` for password hashing, `nodemailer` for sending emails (like OTPs for verification), `zod` for validation, and `morgan` for logging.

## 3. Core Features

- **User Management:**
  - User registration with email and password.
  - Email verification via One-Time Passwords (OTP) sent to the user's email.
  - Secure login and password management (hashing, password reset).
  - Authenticated users can manage their profile and content.
- **Link & Content Processing:**
  - Users can submit a URL to be saved.
  - The backend takes the URL and uses the `ai.service.ts` to call a Google AI model.
  - The AI model generates a summary and a list of relevant tags for the content at the given URL.
  - The original link and the processed content (title, summary, tags) are saved to the database.
- **Content Management:**
  - Provides full CRUD (Create, Read, Update, Delete) functionality for the saved content.
  - Content is associated with the user who saved it.
  - Content has various status flags like `is_archived`, `is_favorite`, etc.

## 4. Architecture

The application follows a well-structured, layered architecture, separating concerns into different modules:

- **`src/models`**: Defines the database schemas for `User`, `Content`, `Link`, `Tag`, `Source`, and `Otp`.
- **`src/routes`**: Defines the API endpoints (e.g., `/api/v1/user`, `/api/v1/content`).
- **`src/controllers`**: Handles the logic for each route, processing incoming requests and sending back responses.
- **`src/services`**: Contains the core business logic, such as interacting with the database and calling the external AI service.
- **`src/middleware`**: Includes functions for authentication (`auth.middleware.ts`), error handling, and request validation.
- **`src/lib` & `src/utils`**: Contain helper functions for tasks like sending standardized responses and handling JWTs.

## 5. Getting Started

To run this project locally, you will need to have Node.js and MongoDB installed.

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd second-brain
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add the following variables:
    ```
    MONGO_URI=<your-mongodb-connection-string>
    JWT_SECRET=<your-jwt-secret>
    JWT_REFRESH_SECRET=<your-jwt-refresh-secret>
    GEMINI_API_KEY=<your-gemini-api-key>
    YOUTUBE_API_KEY=<your-youtube-api-key>
    TWITTER_BEARER_TOKEN=<your-twitter-bearer-token>
    GITHUB_ACCESS_TOKEN=<your-github-access-token>
    SMTP_HOST=<your-smtp-host>
    SMTP_PORT=<your-smtp-port>
    SMTP_USER=<your-smtp-user>
    SMTP_PASS=<your-smtp-pass>
    FRONTEND_URL=<your-frontend-url>
    ```
4.  **Run the development server:**
    `bash
    npm run dev
    `
    The server will start on port 3002.

5.  **Run the production server:**
    ```bash
    npm run start:prod
    ```

## 6. API Endpoints

The API routes are defined in the `src/routes/api/v1` directory.

- **User Routes (`/api/v1/user`):
  - `POST /register`: Register a new user.
  - `POST /login`: Log in a user.
  - `POST /logout`: Log out a user.
  - `GET /refresh-token`: Refresh the authentication token.
  - `POST /verify/:hashedCode`: Verify a user's email.
- **Content Routes (`/api/v1/content`):
  - `POST /add-content`: Add new content.
  - `GET /get-all-content`: Get all content for the authenticated user.
  - `DELETE /delete-content`: Delete a content item.
- **Link Routes (`/api/v1/link`):
  - `POST /create-link/:contentId`: Create a shareable link for a content item.
  - `GET /brain/:hash`: Access a user's "brain" (all their content) via a shareable link.

## 7. Author

S M Ghulam Ghaus Faiyaz

## 8. License

ISC License
