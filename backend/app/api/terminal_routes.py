from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import docker, asyncio

router = APIRouter(prefix="/terminal", tags=["Aether Terminal"])
client = docker.from_env()

@router.websocket("/stream/{container_id}")
async def stream_logs(websocket: WebSocket, container_id: str):
    await websocket.accept()
    try:
        container = client.containers.get(container_id)
        log_stream = container.attach(stdout=True, stderr=True, stream=True, logs=True)
        for line in log_stream:
            await websocket.send_text(line.decode("utf-8"))
            await asyncio.sleep(0.05)
    except WebSocketDisconnect:
        print("🔌 Terminal disconnected")
    except Exception as e:
        await websocket.send_text(f"Error: {e}")
    finally:
        await websocket.close()
