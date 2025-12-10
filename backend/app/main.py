from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .routes.user_routes import router as user_router
from .routes.sos_routes import router as sos_router
from .routes.ml_routes import router as ml_router 
# from .routes.admin_routes import router as admin_router
from .routes.rescue_team_routes import router as rescue_router
from .routes.route_routes import router as route_router
from .websockets.ws_manager import router as ws_router


app = FastAPI(
    title="Minarah API",
    version="1.0",
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],     # frontend allowed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Minarah backend running 🚀"}

# register routes
app.include_router(user_router, prefix="/users", tags=["Users"])
app.include_router(sos_router, prefix="/sos", tags=["SOS"])
app.include_router(ml_router, prefix="/api", tags=["Flood Prediction"])
app.include_router(rescue_router,prefix="/rescue", tags=["Rescue Teams"])
app.include_router(route_router, prefix="/routing", tags=["Emergency Routing"])
app.include_router(ws_router, tags=["Live Updates / WebSocket"])
#app.include_router(admin_router, prefix="/admin", tags=["Admin"])

 
# venv\Scripts\activate
# uvicorn app.main:app --reload


