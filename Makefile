.PHONY: install run-backend run-frontend docker-up docker-down

install:
	cd backend && pip3 install -r requirements.txt
	cd frontend && npm install

run-backend:
	cd backend && python3 main.py

run-frontend:
	cd frontend && npm run dev

docker-up:
	docker-compose up --build

docker-down:
	docker-compose down
