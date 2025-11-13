flowchart TD
    A[User] --> B[Sign In Sign Up]
    B --> C[Protected Dashboard]
    C --> D[Idea Form]
    D --> E[Get Suggestions]
    E --> F[AI Suggestion API]
    F --> G[External AI Service]
    G --> F
    F --> H[Suggestions Received]
    H --> D
    D --> I[Save Idea]
    I --> J[Ideas API]
    J --> K[Persist in Database]
    K --> J
    J --> L[Idea Saved]
    L --> C
    C --> M[Fetch Saved Ideas]
    M --> N[Display Idea List]