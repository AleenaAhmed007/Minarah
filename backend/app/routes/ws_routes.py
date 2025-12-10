from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from ..websockets.ws_manager import ws_manager

router = APIRouter()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Main WebSocket endpoint for real-time updates"""
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and listen for messages
            data = await websocket.receive_text()
            print(f"Received from client: {data}")
            
            # Optional: Echo back or handle client messages
            # await websocket.send_json({"type": "ack", "payload": {"message": "received"}})
            
    except WebSocketDisconnect:
        print("Client disconnected normally")
        ws_manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        ws_manager.disconnect(websocket)