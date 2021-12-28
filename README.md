# Circles

## Running Circles on your local machine

### Installing Docker

Circles uses `docker` for development. This means you do not need to install anything locally on your machine and it avoids the hassle of configuring MongoDB locally. You will only need to install `docker` on your local system: `https://www.docker.com/get-started`.

We use docker to build 'images' for the backend, frontend, and mongodb. These `images` can then be used to run `containers`. An image is a blueprint for a container and a container contains everything we need to run an application. All dependencies for code exist within these containers, and via `docker-compose`, these containers can talk to each other.

### Creating Environment Variables

MongoDB and the backend require a few environment variables to get started. In the root folder, create a folder called `env` and add two files: `backend.env` and `mongodb.env`. 

In `backend.env`, add the environment variables:
- `MONGODB_USERNAME=...`
- `MONGODB_PASSWORD=...`
- `MONGODB_URL=mongodb`

In `mongodb.env`, add:
- `MONGO_INITDB_ROOT_USERNAME=...`
- `MONGO_INITDB_ROOT_PASSWORD=...`

Replace the ellipses with a username and password. The username and password in `backend.env` must match the values in `mongodb.env`. The `env` folder has been added to `.gitignore` and will not be committed to the repo. 

### Running Circles with Docker

The first time you run Circles, or if you have made changes to the backend codebase, run `docker-compose build`. Add the flag `--no-cache` if you have made changes to the dockerfiles. This will rebuild the docker images with the updated code. You can run `docker images` to see what images exist on your machine. Note the `docker rmi <image>` command deletes an image.

To run the whole application (frontend, backend and database), use `docker-compose up frontend`. You can include the `-d` option if you wish to run it in detached mode. 

You will now have the backend API available on `localhost:8000/docs` and the frontend on `localhost:3000`. Since we use `docker-compose`, the backend, frontend and database can talk to each other in their own special docker network (called `circles-net`).

Note that changes to the frontend React code will be visible live while developing due to the bind mount in the docker-compose file (see line 37). It is not necessary to rebuild the images to view the frontend changes.

To see what containers are running, use `docker ps`. To see all containers, including stopped containers, add option `-a`. You can remove a particular container using `docker rm <container>`. Another handy command is `docker logs <containerName>` to view a container's output.

### Populating the Database

The first time you compose the application, or whenever you need to overwrite mongodb data, run `docker-compose run --rm init-mongo`. This will create a utility container that connects to the database and writes in data scraped from the handbook. The container will be automatically removed after the overwriting process due to the `--rm` flag.

### Running Only the Backend

If you are just working on the backend, you can run only the backend and mongodb containers via `docker-compose up backend` (with `-d` for detached if you wish). The backend container depends on the mongodb container, so this command will launch both. The API will now be available on `localhost:8000/docs`. 

You can stop a particular container with `docker-compose stop <containerName>`. For example, say I want to run the backend to test the API and don't need the frontend container. Assuming I have already built the images, I will run `docker-compose up -d backend` which will start just the backend and mongodb containers. When I am done, I will run `docker-compose stop backend mongodb` to stop both containers. Both containers will still exist (see `docker ps -a`) but will no longer be running.

Note if working on particular files or functions, you can still just run `python3 <fileName>`. This can be faster than starting and stopping docker containers. Ensure you have the requisite dependencies by following the below steps:

1. Create a virtual environment inside the backend folder called venv. Make sure it is called venv or else it will not be gitignored.
```
cd backend
python3 -m venv venv
```
2. Activate the virtual environment
```
source venv/bin/activate
```
Now you should have `(venv)` at the beginning of your terminal. This indicates you are inside the virtual environment called venv.

3. Install all necessary modules
```
pip3 install -r requirements.txt
```

### Running Only the Frontend

If you are doing superficial work with the frontend and do not need to communicate with the backend, you can `cd` to the frontend folder, run `npm install` to install required packages locally, and then `npm start`. This is faster than running docker compose since you avoid having to set up the backend and mongodb containers.

### Removing Docker Containers

To remove all containers and the docker network, run `docker-compose down`. Add the option `-v` to also remove persistant volumes: that is, the mongoDB data. I tend to run this before I rebuild if I have made changes to the backend code to keep everything clean on my system.

To stop a docker containers that is running, run `docker-compose stop <containerName>`. This will not remove the container.