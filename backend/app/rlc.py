"""Ideal, sinusoidal steady-state series RLC analysis; output is across R."""
from math import atan2, degrees, hypot, log10, pi, sqrt
import numpy as np
from .schemas import CircuitParameters, FrequencyResponse, Measurements, SimulationResult, Waveforms


def resonance(inductance: float, capacitance: float) -> float:
    return 1 / (2 * pi * sqrt(inductance * capacitance))


def operating_point(p: CircuitParameters, frequency: float | None = None) -> Measurements:
    f = p.frequency if frequency is None else frequency
    omega = 2 * pi * f
    f0 = resonance(p.inductance, p.capacitance)
    xl, xc = omega * p.inductance, 1 / (omega * p.capacitance)
    z = hypot(p.resistance, xl - xc)
    theta = atan2(xl - xc, p.resistance)
    return Measurements(
        resonant_frequency=f0, angular_frequency=omega,
        inductive_reactance=xl, capacitive_reactance=xc,
        impedance_magnitude=z, current_rms=p.voltage_rms / z,
        resistor_voltage_rms=p.voltage_rms * p.resistance / z,
        quality_factor=2 * pi * f0 * p.inductance / p.resistance,
        bandwidth=p.resistance / (2 * pi * p.inductance),
        impedance_phase_degrees=degrees(theta), phase_degrees=-degrees(theta),
        gain_db=20 * log10(p.resistance / z),
        at_resonance=abs(f / f0 - 1) <= 0.005 and abs(degrees(theta)) <= 1,
    )


def simulate(p: CircuitParameters) -> SimulationResult:
    m = operating_point(p)
    # Stable half-power roots avoid cancellation for very large bandwidths.
    a = p.resistance / p.inductance
    omega0 = 2 * pi * m.resonant_frequency
    upper_w = (hypot(a, 2 * omega0) + a) / 2
    lower_w = omega0 * omega0 / upper_w
    lower, upper = lower_w / (2 * pi), upper_w / (2 * pi)
    low = max(1e-9, min(m.resonant_frequency / 100, lower / 3))
    high = min(1e16, max(m.resonant_frequency * 100, upper * 3))
    # Include f0 and the exact half-power points so even high-Q peaks are resolved.
    freq = np.unique(np.concatenate((np.geomspace(low, high, 220),
                                    np.geomspace(max(low, lower * 0.9), min(high, upper * 1.1), 80),
                                    [m.resonant_frequency, lower, upper])))
    x = 2 * pi * freq * p.inductance - 1 / (2 * pi * freq * p.capacitance)
    z = np.hypot(p.resistance, x)
    phase = -np.arctan2(x, p.resistance)
    time = np.linspace(0, 3 / p.frequency, 720)
    input_peak, output_peak = sqrt(2) * p.voltage_rms, sqrt(2) * m.resistor_voltage_rms
    return SimulationResult(
        parameters=p, measurements=m,
        response=FrequencyResponse(
            frequency=freq.tolist(), magnitude_db=(20 * np.log10(p.resistance / z)).tolist(),
            phase_degrees=np.degrees(phase).tolist(), impedance=z.tolist(),
            current_rms=(p.voltage_rms / z).tolist(), lower_cutoff=lower, upper_cutoff=upper),
        waveforms=Waveforms(
            time_seconds=time.tolist(), input_voltage=(input_peak * np.sin(2 * pi * p.frequency * time)).tolist(),
            resistor_voltage=(output_peak * np.sin(2 * pi * p.frequency * time + np.radians(m.phase_degrees))).tolist(),
            input_peak=input_peak, output_peak=output_peak),
    )
