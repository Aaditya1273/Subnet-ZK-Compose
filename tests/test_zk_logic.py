import pytest
import json
from zk_compose.zk_logic.zk_engine import ZKEngine

def test_generate_public_parameters():
    pp = ZKEngine.generate_public_parameters("nova")
    assert isinstance(pp, str)
    assert len(pp) == 64

def test_prove_and_verify_success():
    base_proofs = ["proof1", "proof2"]
    base_subnet_ids = [2, 8]
    depth = 2
    
    serialized_proof, p_time = ZKEngine.prove_composition(base_proofs, base_subnet_ids, depth)
    
    assert isinstance(serialized_proof, str)
    assert p_time > 0
    
    is_valid, msg = ZKEngine.verify_composition(serialized_proof, base_proofs, base_subnet_ids, depth)
    assert is_valid is True
    assert msg == "Verification successful"

def test_verify_corruption():
    base_proofs = ["proof1", "proof2"]
    base_subnet_ids = [2, 8]
    depth = 2
    
    serialized_proof, _ = ZKEngine.prove_composition(base_proofs, base_subnet_ids, depth)
    
    # Test wrong depth
    is_valid, _ = ZKEngine.verify_composition(serialized_proof, base_proofs, base_subnet_ids, 3)
    assert is_valid is False
    
    # Test tampered data root
    proof_obj = json.loads(serialized_proof)
    proof_obj["data_root"] = "tampered_root"
    corrupted_proof = json.dumps(proof_obj)
    
    is_valid, msg = ZKEngine.verify_composition(corrupted_proof, base_proofs, base_subnet_ids, depth)
    assert is_valid is False
    assert "data integrity" in msg.lower()

def test_sn2_proof_requirement():
    # SN2 proofs (subnet 2) are simulated to require a certain length
    invalid_sn2_proof = "too_short"
    base_subnet_ids = [2]
    
    with pytest.raises(ValueError, match="Invalid base proof from subnet 2"):
        ZKEngine.prove_composition([invalid_sn2_proof], base_subnet_ids, 1)
