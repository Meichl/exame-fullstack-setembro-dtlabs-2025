.PHONY: help build up down logs clean test

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $1, $2}' $(MAKEFILE_LIST)

build: ## Build all Docker containers
	docker-compose build

up: ## Start all services
	docker-compose up -d
	@echo "Services started. Frontend: http://localhost:3000, Backend: http://localhost:8000"

dev: ## Start services in development mode with logs
	docker-compose up

down: ## Stop all services
	docker-compose down

logs: ## Show logs from all services
	docker-compose logs -f

logs-backend: ## Show backend logs
	docker-compose logs -f backend

logs-frontend: ## Show frontend logs
	docker-compose logs -f frontend

logs-simulators: ## Show simulator logs
	docker-compose logs -f simulator-1 simulator-2 simulator-3

clean: ## Remove all containers, volumes and images
	docker-compose down -v --rmi all

test: ## Run backend tests
	cd backend && python -m pytest tests/ -v

install: ## Install dependencies for local development
	cd backend && pip install -r requirements.txt
	cd frontend && npm install
	cd heartbeat-simulator && pip install -r requirements.txt

setup-db: ## Initialize database
	docker-compose exec backend python -c "from app.database import engine; from app import models; models.Base.metadata.create_all(bind=engine)"

seed-data: ## Create sample data
	@echo "Creating sample devices for testing..."
	@echo "You'll need to register a user first at http://localhost:3000/register"

restart: down up ## Restart all services

status: ## Check status of all services
	docker-compose ps