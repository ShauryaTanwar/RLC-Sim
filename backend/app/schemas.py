"""Public API contract. All circuit quantities use SI units."""
from pydantic import BaseModel, ConfigDict, Field


class CircuitParameters(BaseModel):
    model_config = ConfigDict(allow_inf_nan=False, extra="forbid", strict=True)
    resistance: float = Field(default=10, ge=0.001, le=1e6)
    inductance: float = Field(default=0.01, ge=1e-9, le=1000)
    capacitance: float = Field(default=0.0001, ge=1e-12, le=1)
    voltage_rms: float = Field(default=5, ge=0, le=1000)
    frequency: float = Field(default=159.15494309189535, ge=1e-6, le=1e12)


class Measurements(BaseModel):
    resonant_frequency: float
    angular_frequency: float
    inductive_reactance: float
    capacitive_reactance: float
    impedance_magnitude: float
    current_rms: float
    resistor_voltage_rms: float
    quality_factor: float
    bandwidth: float
    impedance_phase_degrees: float
    phase_degrees: float
    gain_db: float
    at_resonance: bool


class FrequencyResponse(BaseModel):
    frequency: list[float]
    magnitude_db: list[float]
    phase_degrees: list[float]
    impedance: list[float]
    current_rms: list[float]
    lower_cutoff: float
    upper_cutoff: float


class Waveforms(BaseModel):
    time_seconds: list[float]
    input_voltage: list[float]
    resistor_voltage: list[float]
    input_peak: float
    output_peak: float


class SimulationResult(BaseModel):
    parameters: CircuitParameters
    measurements: Measurements
    response: FrequencyResponse
    waveforms: Waveforms
