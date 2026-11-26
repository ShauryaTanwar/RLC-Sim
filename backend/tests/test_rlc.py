from math import isclose, pi, sqrt
import numpy as np
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.rlc import operating_point, resonance, simulate
from app.schemas import CircuitParameters

client = TestClient(app)


def test_resonance_and_transfer_function():
    p = CircuitParameters()
    f0 = resonance(p.inductance, p.capacitance)
    assert isclose(f0, 159.15494309189535, rel_tol=1e-12)
    m = operating_point(p, f0)
    assert m.impedance_magnitude == pytest.approx(p.resistance)
    assert m.phase_degrees == pytest.approx(0, abs=1e-10)
    assert m.gain_db == pytest.approx(0, abs=1e-10)
    assert m.resistor_voltage_rms == pytest.approx(p.voltage_rms)
    assert m.current_rms > operating_point(p, f0 * 0.8).current_rms
    assert m.current_rms > operating_point(p, f0 * 1.2).current_rms


def test_quality_bandwidth_and_half_power():
    p = CircuitParameters(resistance=3)
    result = simulate(p)
    m, r = result.measurements, result.response
    assert m.quality_factor == pytest.approx(2 * pi * m.resonant_frequency * p.inductance / p.resistance)
    assert m.bandwidth == pytest.approx(p.resistance / (2 * pi * p.inductance))
    assert m.quality_factor == pytest.approx(m.resonant_frequency / m.bandwidth)
    assert r.upper_cutoff - r.lower_cutoff == pytest.approx(m.bandwidth)
    for f in [r.lower_cutoff, r.upper_cutoff]:
        assert operating_point(p, f).gain_db == pytest.approx(-3.01029995664)


def test_waveforms_and_phase_convention():
    for f, sign in [(50, 1), (500, -1)]:
        p = CircuitParameters(frequency=f)
        result = simulate(p)
        w, m = result.waveforms, result.measurements
        assert m.phase_degrees * sign > 0
        t = np.array(w.time_seconds)
        expected = sqrt(2) * m.resistor_voltage_rms * np.sin(2 * pi * f * t + np.radians(m.phase_degrees))
        np.testing.assert_allclose(w.resistor_voltage, expected, atol=1e-12)
        assert w.input_peak == pytest.approx(sqrt(2) * p.voltage_rms)


def test_api_structure_and_extreme_valid_values():
    assert client.get("/api/health").json()["status"] == "ok"
    for values in [{}, {"resistance": 0.001, "inductance": 1e-9, "capacitance": 1e-12, "frequency": 1e-6}, {"resistance": 1e6, "inductance": 1000, "capacitance": 1, "frequency": 1e12, "voltage_rms": 0}]:
        response = client.post("/api/simulate", json=values)
        assert response.status_code == 200
        data = response.json()
        assert set(data) == {"parameters", "measurements", "response", "waveforms"}
        r = data["response"]
        assert len(r["frequency"]) >= 220
        assert len(r["frequency"]) == len(r["magnitude_db"]) == len(r["phase_degrees"])
        assert len(data["waveforms"]["time_seconds"]) == 720
        assert np.isfinite(r["magnitude_db"]).all()
        assert all(a < b for a, b in zip(r["frequency"], r["frequency"][1:]))


def test_invalid_inputs_rejected():
    for field in ["resistance", "inductance", "capacitance", "frequency"]:
        for value in [0, -1, "invalid", "NaN", "Infinity", None, True]:
            assert client.post("/api/simulate", json={field: value}).status_code == 422
    for value in [-1, 1001, "NaN"]:
        assert client.post("/api/simulate", json={"voltage_rms": value}).status_code == 422
    assert client.post("/api/simulate", json={"unknown": 1}).status_code == 422
    for token in ["NaN", "Infinity", "-Infinity"]:
        response = client.post("/api/simulate", content='{"frequency":' + token + '}', headers={"Content-Type": "application/json"})
        assert response.status_code == 422
        assert response.json()["detail"][0]["loc"] == ["body", "frequency"]
