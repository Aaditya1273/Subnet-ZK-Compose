import React, { useState, useEffect } from 'react';
import {
  initPrivacyWeb3,
  createAnonymousIdentity,
  registerIdentityOnChain,
  createPrivacyGroup,
  listCropAnonymously,
  reportDiseaseAnonymously,
  getGroupInfo,
  getPrivacyStats,
  getIdentityInfo,
  deleteIdentity
} from '../components/privacyWeb3';

const PrivacyDashboard = () => {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('identity');
  
  // Identity State
  const [identityInfo, setIdentityInfo] = useState({
    hasIdentity: false,
    identityCommitment: null,
    groupId: null
  });
  
  // Stats State
  const [stats, setStats] = useState({
    totalGroups: 0,
    totalIdentities: 0,
    totalAnonymousTransactions: 0
  });
  
  // Form States
  const [cropForm, setCropForm] = useState({
    cropType: 'Tomato',
    quantity: 100,
    price: 50
  });
  
  const [diseaseForm, setDiseaseForm] = useState({
    diseaseType: 'Blight',
    location: 'Farm A'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Get local identity info
      const info = getIdentityInfo();
      setIdentityInfo(info);
      
      // Get blockchain stats
      const statsResult = await getPrivacyStats();
      if (statsResult.success) {
        setStats(statsResult);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleConnect = async () => {
    try {
      setLoading(true);
      await initPrivacyWeb3();
      setConnected(true);
      await loadData();
      setLoading(false);
    } catch (error) {
      console.error("Error connecting:", error);
      alert("Error connecting wallet: " + error.message);
      setLoading(false);
    }
  };

  const handleCreateIdentity = async () => {
    setLoading(true);
    const result = await createAnonymousIdentity();
    
    if (result.success) {
      alert(`✅ ${result.message}\n\nYour Identity Commitment:\n${result.identityCommitment}`);
      await loadData();
    } else {
      alert(`❌ Error: ${result.error}`);
    }
    setLoading(false);
  };

  const handleRegisterOnChain = async () => {
    setLoading(true);
    const result = await registerIdentityOnChain(0);
    
    if (result.success) {
      alert(`✅ ${result.message}\n\nTX: ${result.txHash}\nGroup ID: ${result.groupId}`);
      await loadData();
    } else {
      alert(`❌ Error: ${result.error}`);
    }
    setLoading(false);
  };

  const handleCreateGroup = async () => {
    setLoading(true);
    const result = await createPrivacyGroup();
    
    if (result.success) {
      alert(`✅ ${result.message}\n\nGroup ID: ${result.groupId}\nTX: ${result.txHash}`);
      await loadData();
    } else {
      alert(`❌ Error: ${result.error}`);
    }
    setLoading(false);
  };

  const handleListCropAnonymously = async () => {
    if (!identityInfo.hasIdentity) {
      alert("⚠️ Please create an anonymous identity first!");
      return;
    }
    
    setLoading(true);
    const result = await listCropAnonymously(
      cropForm.cropType,
      cropForm.quantity,
      cropForm.price
    );
    
    if (result.success) {
      alert(`✅ ${result.message}\n\nTX: ${result.txHash}\n\nYour identity is protected!`);
      await loadData();
    } else {
      alert(`❌ Error: ${result.error}`);
    }
    setLoading(false);
  };

  const handleReportDiseaseAnonymously = async () => {
    if (!identityInfo.hasIdentity) {
      alert("⚠️ Please create an anonymous identity first!");
      return;
    }
    
    setLoading(true);
    const result = await reportDiseaseAnonymously(
      diseaseForm.diseaseType,
      diseaseForm.location
    );
    
    if (result.success) {
      alert(`✅ ${result.message}\n\nTX: ${result.txHash}\n\nYour location is protected!`);
      await loadData();
    } else {
      alert(`❌ Error: ${result.error}`);
    }
    setLoading(false);
  };

  const handleDeleteIdentity = () => {
    if (window.confirm("⚠️ Are you sure you want to delete your anonymous identity? This cannot be undone.")) {
      const result = deleteIdentity();
      alert(result.message);
      loadData();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                🔒 FarmOracle Privacy Layer
              </h1>
              <p className="text-purple-200">Zero-Knowledge Proofs with Semaphore Protocol</p>
            </div>
            <div className="text-right">
              {connected ? (
                <div className="bg-green-500 text-white px-4 py-2 rounded-lg">
                  ✅ Connected
                </div>
              ) : (
                <button
                  onClick={handleConnect}
                  disabled={loading}
                  className="bg-purple-500 hover:bg-purple-600 text-white font-bold px-6 py-3 rounded-lg"
                >
                  {loading ? 'Connecting...' : 'Connect Wallet'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <div className="text-purple-300 text-sm mb-2">Privacy Groups</div>
            <div className="text-white text-3xl font-bold">{stats.totalGroups}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <div className="text-purple-300 text-sm mb-2">Anonymous Identities</div>
            <div className="text-white text-3xl font-bold">{stats.totalIdentities}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <div className="text-purple-300 text-sm mb-2">Anonymous Transactions</div>
            <div className="text-white text-3xl font-bold">{stats.totalAnonymousTransactions}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <div className="text-purple-300 text-sm mb-2">Your Identity Status</div>
            <div className={`text-2xl font-bold ${identityInfo.hasIdentity ? 'text-green-400' : 'text-red-400'}`}>
              {identityInfo.hasIdentity ? '✅ Protected' : '❌ Not Protected'}
            </div>
          </div>
        </div>

        {/* Identity Info Card */}
        {identityInfo.hasIdentity && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6">
            <h3 className="text-white text-xl font-bold mb-4">🔐 Your Anonymous Identity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-purple-300 text-sm mb-1">Identity Commitment</div>
                <div className="text-white font-mono text-sm bg-black/30 p-2 rounded">
                  {identityInfo.identityCommitment}
                </div>
              </div>
              <div>
                <div className="text-purple-300 text-sm mb-1">Group ID</div>
                <div className="text-white font-mono text-sm bg-black/30 p-2 rounded">
                  {identityInfo.groupId !== null ? identityInfo.groupId : 'Not in group'}
                </div>
              </div>
            </div>
            <button
              onClick={handleDeleteIdentity}
              className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              🗑️ Delete Identity
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab('identity')}
              className={`px-6 py-3 rounded-lg font-bold transition ${
                activeTab === 'identity'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              🔐 Identity
            </button>
            <button
              onClick={() => setActiveTab('anonymous')}
              className={`px-6 py-3 rounded-lg font-bold transition ${
                activeTab === 'anonymous'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              👻 Anonymous Actions
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`px-6 py-3 rounded-lg font-bold transition ${
                activeTab === 'groups'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              🔒 Privacy Groups
            </button>
          </div>

          {/* Identity Tab */}
          {activeTab === 'identity' && (
            <div>
              <h3 className="text-white text-2xl font-bold mb-4">Create Anonymous Identity</h3>
              <p className="text-purple-200 mb-6">
                Generate a zero-knowledge identity to protect your real identity on the blockchain.
                Your transactions will be anonymous and unlinkable.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-6">
                  <h4 className="text-white font-bold mb-4">Step 1: Create Local Identity</h4>
                  <p className="text-purple-200 text-sm mb-4">
                    Generate a cryptographic identity commitment stored locally on your device.
                  </p>
                  <button
                    onClick={handleCreateIdentity}
                    disabled={loading || identityInfo.hasIdentity}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 rounded-lg disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : identityInfo.hasIdentity ? '✅ Identity Created' : 'Create Identity'}
                  </button>
                </div>

                <div className="bg-white/5 rounded-xl p-6">
                  <h4 className="text-white font-bold mb-4">Step 2: Register On-Chain</h4>
                  <p className="text-purple-200 text-sm mb-4">
                    Register your identity commitment on the blockchain without revealing your real identity.
                  </p>
                  <button
                    onClick={handleRegisterOnChain}
                    disabled={loading || !identityInfo.hasIdentity}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 rounded-lg disabled:opacity-50"
                  >
                    {loading ? 'Registering...' : 'Register On-Chain'}
                  </button>
                </div>
              </div>

              <div className="mt-6 bg-purple-500/20 border border-purple-500/50 rounded-xl p-4">
                <h4 className="text-white font-bold mb-2">🔒 How It Works</h4>
                <ul className="text-purple-200 text-sm space-y-2">
                  <li>• Your identity is a cryptographic commitment - no personal data stored</li>
                  <li>• Transactions are verified using zero-knowledge proofs</li>
                  <li>• No one can link your transactions to your real identity</li>
                  <li>• Powered by Semaphore protocol - battle-tested ZK technology</li>
                </ul>
              </div>
            </div>
          )}

          {/* Anonymous Actions Tab */}
          {activeTab === 'anonymous' && (
            <div>
              <h3 className="text-white text-2xl font-bold mb-4">Perform Anonymous Actions</h3>
              <p className="text-purple-200 mb-6">
                List crops, report diseases, and share data without revealing your identity.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Anonymous Crop Listing */}
                <div className="bg-white/5 rounded-xl p-6">
                  <h4 className="text-white font-bold mb-4">🌾 List Crop Anonymously</h4>
                  <input
                    type="text"
                    placeholder="Crop Type"
                    value={cropForm.cropType}
                    onChange={(e) => setCropForm({...cropForm, cropType: e.target.value})}
                    className="w-full bg-white/10 text-white px-4 py-2 rounded-lg mb-3"
                  />
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={cropForm.quantity}
                    onChange={(e) => setCropForm({...cropForm, quantity: e.target.value})}
                    className="w-full bg-white/10 text-white px-4 py-2 rounded-lg mb-3"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={cropForm.price}
                    onChange={(e) => setCropForm({...cropForm, price: e.target.value})}
                    className="w-full bg-white/10 text-white px-4 py-2 rounded-lg mb-3"
                  />
                  <button
                    onClick={handleListCropAnonymously}
                    disabled={loading || !identityInfo.hasIdentity}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg disabled:opacity-50"
                  >
                    {loading ? 'Listing...' : 'List Anonymously'}
                  </button>
                  <p className="text-purple-300 text-xs mt-2">
                    ✅ Your identity will be protected using ZK proofs
                  </p>
                </div>

                {/* Anonymous Disease Report */}
                <div className="bg-white/5 rounded-xl p-6">
                  <h4 className="text-white font-bold mb-4">⚠️ Report Disease Anonymously</h4>
                  <input
                    type="text"
                    placeholder="Disease Type"
                    value={diseaseForm.diseaseType}
                    onChange={(e) => setDiseaseForm({...diseaseForm, diseaseType: e.target.value})}
                    className="w-full bg-white/10 text-white px-4 py-2 rounded-lg mb-3"
                  />
                  <input
                    type="text"
                    placeholder="Location (will be anonymized)"
                    value={diseaseForm.location}
                    onChange={(e) => setDiseaseForm({...diseaseForm, location: e.target.value})}
                    className="w-full bg-white/10 text-white px-4 py-2 rounded-lg mb-3"
                  />
                  <button
                    onClick={handleReportDiseaseAnonymously}
                    disabled={loading || !identityInfo.hasIdentity}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg disabled:opacity-50 mt-8"
                  >
                    {loading ? 'Reporting...' : 'Report Anonymously'}
                  </button>
                  <p className="text-purple-300 text-xs mt-2">
                    ✅ Your location will be protected using ZK proofs
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Groups Tab */}
          {activeTab === 'groups' && (
            <div>
              <h3 className="text-white text-2xl font-bold mb-4">Privacy Groups</h3>
              <p className="text-purple-200 mb-6">
                Create or join privacy groups to perform anonymous actions within trusted communities.
              </p>

              <div className="bg-white/5 rounded-xl p-6 mb-6">
                <h4 className="text-white font-bold mb-4">Create New Privacy Group</h4>
                <p className="text-purple-200 text-sm mb-4">
                  Groups allow farmers to share data anonymously within a trusted community.
                </p>
                <button
                  onClick={handleCreateGroup}
                  disabled={loading}
                  className="bg-purple-500 hover:bg-purple-600 text-white font-bold px-6 py-3 rounded-lg"
                >
                  {loading ? 'Creating...' : 'Create Group'}
                </button>
              </div>

              <div className="bg-purple-500/20 border border-purple-500/50 rounded-xl p-6">
                <h4 className="text-white font-bold mb-4">📊 Current Stats</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-purple-300 text-sm">Total Groups</div>
                    <div className="text-white text-2xl font-bold">{stats.totalGroups}</div>
                  </div>
                  <div>
                    <div className="text-purple-300 text-sm">Total Members</div>
                    <div className="text-white text-2xl font-bold">{stats.totalIdentities}</div>
                  </div>
                  <div>
                    <div className="text-purple-300 text-sm">Anonymous Actions</div>
                    <div className="text-white text-2xl font-bold">{stats.totalAnonymousTransactions}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrivacyDashboard;
