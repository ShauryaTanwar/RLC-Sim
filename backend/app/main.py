import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from .rlc import simulate
from .schemas import CircuitParameters, SimulationResult

app = FastAPI(title="Resonance Studio API", version="1.0.0")
origins = [origin.strip() for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",") if origin.strip()]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=["GET", "POST"], allow_headers=["Content-Type"], allow_credentials=False)


@app.exception_handler(RequestValidationError)
async def validation_error(_request, exception):
    # The JSON parser can accept nonstandard NaN/Infinity tokens. Never echo
    # their non-finite input values into a JSON error response (which would 500).
    details = [{"loc": error["loc"], "msg": error["msg"], "type": error["type"]}
               for error in exception.errors()]
    return JSONResponse(status_code=422, content={"detail": details})


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "resonance-studio"}


@app.post("/api/simulate", response_model=SimulationResult)
def run_simulation(parameters: CircuitParameters):
    return simulate(parameters)
