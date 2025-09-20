# Tea Stall Management System

A modern e-commerce web application for managing tea stall operations, built with React and TypeScript.

## Features

- **Product Management**: Browse and search through various tea products
- **Shopping Cart**: Add items with flexible quantity options (kg/piece)
- **Order Processing**: Complete ordering system with multiple payment methods
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS
- **Modern UI**: Clean, intuitive design with shadcn-ui components

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
```sh
git clone <YOUR_GIT_URL>
cd tea-stall
```

2. **Install dependencies**
```sh
npm install
```

3. **Start the development server**
```sh
npm run dev
```

4. **Open your browser**
Navigate to `http://localhost:8080` to view the application.

### Backend Setup

To run the full application with backend functionality:

1. **Navigate to backend directory**
```sh
cd backend
```

2. **Install backend dependencies**
```sh
npm install
```

3. **Set up environment variables**
```sh
cp .env.example .env
# Edit .env with your MongoDB configuration
```

4. **Start the backend server**
```sh
npm run dev
```

## Project Structure

```
tea-stall/
├── src/
│   ├── components/     # React components
│   ├── pages/         # Page components
│   ├── hooks/         # Custom React hooks
│   ├── services/      # API services
│   ├── types/         # TypeScript type definitions
│   └── lib/           # Utility functions
├── backend/           # Node.js/Express backend
├── public/            # Static assets
└── docs/              # Documentation
```

## Technologies Used

This project is built with:

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and building
- **Styling**: Tailwind CSS for utility-first styling
- **UI Components**: shadcn-ui for modern, accessible components
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication system

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint for code linting

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
