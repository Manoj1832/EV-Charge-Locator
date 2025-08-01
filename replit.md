# Electric Vehicle Charging Dashboard

## Overview

This is a full-stack web application for electric vehicle (EV) charging management. The application provides a comprehensive dashboard for EV owners to monitor their vehicle's battery status, locate nearby charging stations, and manage charging activities. Built with a modern React frontend and Express.js backend, it features real-time vehicle monitoring, interactive maps, and detailed charging station information.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and modern development
- **UI Library**: Shadcn/ui components built on Radix UI primitives for consistent, accessible design
- **Styling**: Tailwind CSS with custom EV-themed color variables and responsive design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Build System**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **API Design**: RESTful API endpoints for vehicle and charging station management
- **Storage Pattern**: Repository pattern with pluggable storage implementations (currently in-memory, designed for database integration)
- **Development**: Hot module replacement and development middleware integration

### Data Storage Solutions
- **ORM**: Drizzle ORM configured for PostgreSQL with type-safe database operations
- **Database**: PostgreSQL with Neon Database serverless configuration
- **Schema**: Strongly typed database schemas with Zod validation for runtime type checking
- **Current Implementation**: In-memory storage for development with database migration ready structure

### Key Data Models
- **Vehicles**: Battery level, capacity, range, location coordinates, connection status
- **Charging Stations**: Location data, port availability, pricing, connector types, operational status

### Authentication and Authorization
- **Current State**: No authentication implemented (development phase)
- **Prepared For**: Session-based authentication with PostgreSQL session store (connect-pg-simple configured)

### UI/UX Design Patterns
- **Design System**: Consistent component library with EV-specific theming
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Real-time Updates**: 30-second polling intervals for vehicle status updates
- **Interactive Elements**: Modal dialogs for detailed views, toast notifications for user feedback
- **Accessibility**: Screen reader support and keyboard navigation through Radix UI primitives

### Development Experience
- **Code Organization**: Monorepo structure with shared schemas between frontend and backend
- **Type Safety**: End-to-end TypeScript with strict configuration
- **Path Aliases**: Organized imports with @ prefixes for clean module resolution
- **Development Tools**: ESBuild for production bundling, TSX for development server

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle Kit**: Database migrations and schema management

### UI Framework Dependencies
- **Radix UI**: Comprehensive set of accessible, unstyled React components
- **Lucide React**: Modern icon library with consistent styling
- **React Hook Form**: Form state management with validation support
- **Date-fns**: Date manipulation and formatting utilities

### Development and Build Tools
- **Vite**: Fast build tool with HMR and optimized bundling
- **Replit Integration**: Runtime error overlay and development banner for Replit environment
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer

### Styling and Theming
- **Tailwind CSS**: Utility-first CSS framework with custom EV color palette
- **Class Variance Authority**: Type-safe component variant management
- **Embla Carousel**: Touch-friendly carousel components for mobile interfaces

### Map and Geolocation Services
- **Current State**: Mock map implementation with placeholder UI
- **Prepared For**: Integration with mapping services for real charging station locations