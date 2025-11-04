import docker
from docker.errors import DockerException
from fastapi import HTTPException

def get_docker_client():
    """
    Get a Docker client connected to the host's Docker socket.
    Works inside Docker by mounting /var/run/docker.sock.
    """
    try:
        client = docker.from_env()
        # quick sanity check
        client.ping()
        return client
    except DockerException as e:
        raise HTTPException(status_code=500, detail=f"Docker client error: {e}")
