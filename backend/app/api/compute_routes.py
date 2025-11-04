from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
import docker
from docker.errors import DockerException
from jose import jwt, JWTError
from app.auth import decode_token
import os
from fastapi import Body
from pydantic import BaseModel
from app.db import models
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.api.utils import get_docker_client
from sqlalchemy import func
from app.db.models import Container, User
import json




router = APIRouter(prefix="/compute", tags=["Aether Compute"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

SECRET_KEY = "supersecretkey"  # same as in your auth_routes.py
ALGORITHM = "HS256"

# Connect to the local Docker engine
def get_docker_client():
    try:
        return docker.from_env()
    except DockerException as e:
        raise HTTPException(status_code=500, detail=f"Docker not available: {e}")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Verify JWT and return user record from DB.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_email: str = payload.get("sub")
        if not user_email:
            raise HTTPException(status_code=401, detail="Invalid token")

        # Case-insensitive match
        user = db.query(models.User).filter(func.lower(models.User.email) == user_email.lower()).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found in database")

        return user

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.post("/create")
def create_container(
    image: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Launch a new Docker container for the current user
    and record it in the database.
    """
    try:
       
        client = get_docker_client()

        ports = None
        if "nginx" in image:
            ports = {"80/tcp": 8081}
        elif "node" in image:
            ports = {"3000/tcp": 3000}

        # ✅ Create a friendly unique name
        safe_name = f"aether_{current_user.email.replace('@','_')}_{image.replace(':','_')}"
        container = client.containers.run(
            image,
            command="sleep infinity",
            detach=True,
            ports=ports,
            name=safe_name,
            network_mode="bridge",
            publish_all_ports=True,
        )

        # ✅ Add to database
        db_container = models.Container(
            container_id=container.id[:12],
            name=safe_name,
            image=image,
            status=container.status,
            ports=str(ports),
            user_id=current_user.id,
        )
        db.add(db_container)
        db.commit()
        db.refresh(db_container)

        return {
            "status": "success",
            "message": f"Container {container.name} launched successfully.",
            "id": container.id[:12],
            "image": image,
            "state": container.status,
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        # ⛔ Log the error but *don’t* raise a 400 — just return it
        return {
            "status": "error",
            "message": f"Failed to start container: {str(e)}"
        }




@router.get("/list")
def list_containers(current_user: str = Depends(get_current_user)):
    """
    List all containers belonging to the current user with port info.
    """
    client = get_docker_client()
    containers = client.containers.list(all=True)
    user_containers = []

    for c in containers:
        if f"aether_{current_user.email.split('@')[0]}" not in c.name:
            continue

        port_bindings = c.attrs["NetworkSettings"]["Ports"] or {}
        web_port = None

        # Extract the host port from bindings
        for port, bindings in port_bindings.items():
            if bindings and len(bindings) > 0:
                web_port = bindings[0]["HostPort"]

        user_containers.append({
            "id": c.id[:12],
            "name": c.name,
            "image": c.image.tags[0] if c.image.tags else "unknown",
            "status": c.status,
            "port": web_port,
        })

    return user_containers



@router.delete("/stop/{container_id}")
def stop_container(container_id: str, current_user: str = Depends(get_current_user)):
    """
    Stop and remove a container by ID.
    """
    client = get_docker_client()
    try:
        container = client.containers.get(container_id)
        container.stop()
        container.remove()
        return {"message": f"Container {container_id} stopped and removed."}
    except DockerException as e:
        raise HTTPException(status_code=400, detail=f"Failed to stop container: {e}")


@router.get("/logs/{container_id}")
def get_container_logs(container_id: str, current_user: str = Depends(get_current_user)):
    """
    Get the latest logs for a container.
    """
    client = get_docker_client()
    try:
        container = client.containers.get(container_id)
        logs = container.logs(tail=50).decode("utf-8")
        return {
            "id": container.id[:12],
            "name": container.name,
            "logs": logs,
        }
    except DockerException as e:
        raise HTTPException(status_code=400, detail=f"Failed to get logs: {e}")

class CommandInput(BaseModel):
    command: str

@router.post("/exec/{container_id}")
def execute_command(container_id: str, data: CommandInput, current_user: str = Depends(get_current_user)):
    """
    Execute a command inside a running container.
    """
    client = get_docker_client()
    try:
        container = client.containers.get(container_id)
        if container.status != "running":
            raise HTTPException(status_code=400, detail="Container is not running.")
        exec_result = container.exec_run(data.command)
        output = exec_result.output.decode("utf-8") if exec_result.output else ""
        return {"command": data.command, "output": output}
    except DockerException as e:
        raise HTTPException(status_code=400, detail=f"Execution failed: {e}")
