# Quiz Planner - Frontend

This is the frontend for the Quiz Planner application, a tool that helps users create and manage study materials and generate quizzes using AI.

## Features

- User authentication and profile management
- Create, view, edit, and delete study materials
- AI-powered quiz generation from study materials
- Multiple question types (multiple choice, true/false, short answer)
- Interactive quiz taking experience
- Dashboard with statistics and recent activities

## Technology Stack

- React (Create React App)
- React Router for navigation
- Axios for API calls
- Tailwind CSS for styling
- Recharts for data visualization
- Headless UI for accessible components

## Project Structure

The project follows a feature-based structure with the following main directories:

- `src/components`: UI components organized by feature
- `src/contexts`: React context providers for state management
- `src/services`: API service modules for backend communication
- `src/hooks`: Custom React hooks
- `src/utils`: Utility functions

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend server running (see backend repository)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/quiz-planner-frontend.git
cd quiz-planner-frontend
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory with the following content:
```
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the development server
```bash
npm start
# or
yarn start
```

The application will be available at http://localhost:3000.

## Connecting to the Backend

Make sure the backend server is running at http://localhost:5000 or update the `REACT_APP_API_URL` in your `.env` file accordingly.

## Build for Production

```bash
npm run build
# or
yarn build
```

This will create a production-ready build in the `build` directory.

## License

This project is licensed under the MIT License - see the LICENSE file for details.