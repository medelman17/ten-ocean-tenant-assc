# 10 Ocean Tenant Association Documentation

This directory contains documentation for the 10 Ocean Tenant Association web application.

## Contents

- [Database Schema](./schema/README.md) - Comprehensive documentation of the database structure
- [Authentication](./schema/auth.md) - User authentication and authorization
- [Data Models](./schema/data-models.md) - Core data models and relationships
- [Database Policies](./schema/policies.md) - Row-level security policies

## Project Overview

The 10 Ocean Tenant Association web application provides a platform for residential community organization and management. The application is built with:

- Next.js 15 with App Router
- React 19
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL, Auth, Storage)
- shadcn/ui components

## Architecture

The application follows a layered architecture:

1. **Database Layer** - PostgreSQL managed by Supabase
2. **API Layer** - Server components and server actions
3. **UI Layer** - Client components and shadcn/ui

## Key Features

- User authentication and profile management
- Resident directory with verification system
- Unit/apartment management
- Community events and calendar
- Maintenance request system
- Document sharing and management
- Discussion forums
- Surveys and voting
- AI-powered chat assistant
- Alumni membership system