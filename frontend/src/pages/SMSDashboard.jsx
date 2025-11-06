import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:10000';

const SMSDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('send');
  
  // Statistics
  const [stats, setStats] = useState({
    total_sent: 0,
    total_failed: 0,
    success_rate: 0,
    mock_mode: true
  });
  
  // Recent SMS
  const [recentSMS, setRecentSMS] = useState([]);
  
  // Form States
  const [smsForm, setSmsForm] = useState({
    phoneNumber: '+254712345678',
    message: '',
    alertType: 'general'
  });
  
  const [diseaseForm, setDiseaseForm] = useState({
    phoneNumber: '+254712345678',
    cropType: 'Tomato',
    diseaseName: 'Late Blight',
    confidence: 0.94
  });
  
  const [priceForm, setPriceForm] = useState({
    phoneNumber: '+254712345678',
    cropType: 'Wheat',
    currentPrice: 100,
    predictedPrice: 120,
    recommendation: 'HOLD - Price increasing'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Get statistics
      const statsRes = await axios.get(`${API_URL}/sms/statistics`);
      if (statsRes.data.status === 'success') {
        setStats(statsRes.data.data);
      }
      
      // Get recent SMS
      const recentRes = await axios.get(`${API_URL}/sms/recent?limit=10`);
      if (recentRes.data.status === 'success') {
        setRecentSMS(recentRes.data.data);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleSendSMS = async () => {
    if (!smsForm.phoneNumber || !smsForm.message) {
      alert("⚠️ Please fill in all fields");
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/sms/send`, null, {
        params: {
          phone_number: smsForm.phoneNumber,
          message: smsForm.message,
          alert_type: smsForm.alertType
        }
      });
      
      if (response.data.status === 'success') {
        alert(`✅ SMS sent successfully!\n\nTo: ${smsForm.phoneNumber}\nMessage: ${smsForm.message}`);
        setSmsForm({...smsForm, message: ''});
        await loadData();
      } else {
        alert(`❌ Error: ${response.data.error}`);
      }
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    }
    setLoading(false);
  };

  const handleSendDiseaseAlert = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/sms/disease-alert`, null, {
        params: {
          phone_number: diseaseForm.phoneNumber,
          crop_type: diseaseForm.cropType,
          disease_name: diseaseForm.diseaseName,
          confidence: diseaseForm.confidence
        }
      });
      
      if (response.data.status === 'success') {
        alert(`✅ Disease alert sent!\n\n${response.data.message}`);
        await loadData();
      } else {
        alert(`❌ Error: ${response.data.error}`);
      }
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    }
    setLoading(false);
  };

  const handleSendPriceAlert = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/sms/price-alert`, null, {
        params: {
          phone_number: priceForm.phoneNumber,
          crop_type: priceForm.cropType,
          current_price: priceForm.currentPrice,
          predicted_price: priceForm.predictedPrice,
          recommendation: priceForm.recommendation
        }
      });
      
      if (response.data.status === 'success') {
        alert(`✅ Price alert sent!\n\n${response.data.message}`);
        await loadData();
      } else {
        alert(`❌ Error: ${response.data.error}`);
      }
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                📱 FarmOracle SMS Alerts
              </h1>
              <p className="text-blue-200">Low-Connectivity Farmer Notifications via Twilio</p>
            </div>
            <div className="text-right">
              {stats.mock_mode ? (
                <div className="bg-yellow-500 text-black px-4 py-2 rounded-lg">
                  🧪 Demo Mode
                </div>
              ) : (
                <div className="bg-green-500 text-white px-4 py-2 rounded-lg">
                  ✅ Live Mode
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <div className="text-blue-300 text-sm mb-2">Total SMS Sent</div>
            <div className="text-white text-3xl font-bold">{stats.total_sent}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <div className="text-blue-300 text-sm mb-2">Failed</div>
            <div className="text-red-400 text-3xl font-bold">{stats.total_failed}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <div className="text-blue-300 text-sm mb-2">Success Rate</div>
            <div className="text-green-400 text-3xl font-bold">{stats.success_rate.toFixed(1)}%</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <div className="text-blue-300 text-sm mb-2">Recent Messages</div>
            <div className="text-white text-3xl font-bold">{recentSMS.length}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6">
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab('send')}
              className={`px-6 py-3 rounded-lg font-bold transition ${
                activeTab === 'send'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              📤 Send SMS
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-6 py-3 rounded-lg font-bold transition ${
                activeTab === 'alerts'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              ⚠️ Farming Alerts
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 rounded-lg font-bold transition ${
                activeTab === 'history'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              📊 History
            </button>
          </div>

          {/* Send SMS Tab */}
          {activeTab === 'send' && (
            <div>
              <h3 className="text-white text-2xl font-bold mb-4">Send Custom SMS</h3>
              <div className="bg-white/5 rounded-xl p-6">
                <input
                  type="tel"
                  placeholder="Phone Number (+254712345678)"
                  value={smsForm.phoneNumber}
                  onChange={(e) => setSmsForm({...smsForm, phoneNumber: e.target.value})}
                  className="w-full bg-white/10 text-white px-4 py-3 rounded-lg mb-4"
                />
                <textarea
                  placeholder="Message (max 160 characters)"
                  value={smsForm.message}
                  onChange={(e) => setSmsForm({...smsForm, message: e.target.value})}
                  maxLength={160}
                  rows={4}
                  className="w-full bg-white/10 text-white px-4 py-3 rounded-lg mb-4"
                />
                <div className="text-blue-300 text-sm mb-4">
                  {smsForm.message.length}/160 characters
                </div>
                <select
                  value={smsForm.alertType}
                  onChange={(e) => setSmsForm({...smsForm, alertType: e.target.value})}
                  className="w-full bg-white/10 text-white px-4 py-3 rounded-lg mb-4"
                >
                  <option value="general">General</option>
                  <option value="alert">Alert</option>
                  <option value="reminder">Reminder</option>
                  <option value="notification">Notification</option>
                </select>
                <button
                  onClick={handleSendSMS}
                  disabled={loading}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg disabled:opacity-50"
                >
                  {loading ? 'Sending...' : '📤 Send SMS'}
                </button>
              </div>
            </div>
          )}

          {/* Farming Alerts Tab */}
          {activeTab === 'alerts' && (
            <div>
              <h3 className="text-white text-2xl font-bold mb-4">Pre-configured Farming Alerts</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Disease Alert */}
                <div className="bg-white/5 rounded-xl p-6">
                  <h4 className="text-white font-bold mb-4">⚠️ Disease Alert</h4>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={diseaseForm.phoneNumber}
                    onChange={(e) => setDiseaseForm({...diseaseForm, phoneNumber: e.target.value})}
                    className="w-full bg-white/10 text-white px-4 py-2 rounded-lg mb-3"
                  />
                  <input
                    type="text"
                    placeholder="Crop Type"
                    value={diseaseForm.cropType}
                    onChange={(e) => setDiseaseForm({...diseaseForm, cropType: e.target.value})}
                    className="w-full bg-white/10 text-white px-4 py-2 rounded-lg mb-3"
                  />
                  <input
                    type="text"
                    placeholder="Disease Name"
                    value={diseaseForm.diseaseName}
                    onChange={(e) => setDiseaseForm({...diseaseForm, diseaseName: e.target.value})}
                    className="w-full bg-white/10 text-white px-4 py-2 rounded-lg mb-3"
                  />
                  <input
                    type="number"
                    placeholder="Confidence (0-1)"
                    value={diseaseForm.confidence}
                    onChange={(e) => setDiseaseForm({...diseaseForm, confidence: parseFloat(e.target.value)})}
                    step="0.01"
                    min="0"
                    max="1"
                    className="w-full bg-white/10 text-white px-4 py-2 rounded-lg mb-3"
                  />
                  <button
                    onClick={handleSendDiseaseAlert}
                    disabled={loading}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send Disease Alert'}
                  </button>
                </div>

                {/* Price Alert */}
                <div className="bg-white/5 rounded-xl p-6">
                  <h4 className="text-white font-bold mb-4">💰 Price Alert</h4>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={priceForm.phoneNumber}
                    onChange={(e) => setPriceForm({...priceForm, phoneNumber: e.target.value})}
                    className="w-full bg-white/10 text-white px-4 py-2 rounded-lg mb-3"
                  />
                  <input
                    type="text"
                    placeholder="Crop Type"
                    value={priceForm.cropType}
                    onChange={(e) => setPriceForm({...priceForm, cropType: e.target.value})}
                    className="w-full bg-white/10 text-white px-4 py-2 rounded-lg mb-3"
                  />
                  <input
                    type="number"
                    placeholder="Current Price"
                    value={priceForm.currentPrice}
                    onChange={(e) => setPriceForm({...priceForm, currentPrice: parseFloat(e.target.value)})}
                    className="w-full bg-white/10 text-white px-4 py-2 rounded-lg mb-3"
                  />
                  <input
                    type="number"
                    placeholder="Predicted Price"
                    value={priceForm.predictedPrice}
                    onChange={(e) => setPriceForm({...priceForm, predictedPrice: parseFloat(e.target.value)})}
                    className="w-full bg-white/10 text-white px-4 py-2 rounded-lg mb-3"
                  />
                  <input
                    type="text"
                    placeholder="Recommendation"
                    value={priceForm.recommendation}
                    onChange={(e) => setPriceForm({...priceForm, recommendation: e.target.value})}
                    className="w-full bg-white/10 text-white px-4 py-2 rounded-lg mb-3"
                  />
                  <button
                    onClick={handleSendPriceAlert}
                    disabled={loading}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send Price Alert'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div>
              <h3 className="text-white text-2xl font-bold mb-4">Recent SMS History</h3>
              {recentSMS.length > 0 ? (
                <div className="space-y-4">
                  {recentSMS.map((sms, index) => (
                    <div key={index} className="bg-white/5 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-white font-bold">To: {sms.to}</div>
                          <div className="text-blue-300 text-sm">{sms.alert_type}</div>
                        </div>
                        <div className={`px-3 py-1 rounded-lg text-sm ${
                          sms.success ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                          {sms.success ? '✅ Sent' : '❌ Failed'}
                        </div>
                      </div>
                      <div className="text-white text-sm mb-2">{sms.message}</div>
                      <div className="text-blue-400 text-xs">{new Date(sms.timestamp).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-white text-center py-12">
                  <div className="text-6xl mb-4">📱</div>
                  <div className="text-xl">No SMS history yet</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-6">
          <h4 className="text-white font-bold mb-4">📱 SMS Alert Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-200 text-sm">
            <div>
              <div className="font-bold mb-2">✅ Supported Alerts:</div>
              <ul className="space-y-1">
                <li>• Disease Detection Alerts</li>
                <li>• Market Price Alerts</li>
                <li>• Weather Warnings</li>
                <li>• Harvest Reminders</li>
                <li>• NFT Minting Notifications</li>
                <li>• Staking Reward Alerts</li>
              </ul>
            </div>
            <div>
              <div className="font-bold mb-2">🌍 Coverage:</div>
              <ul className="space-y-1">
                <li>• Kenya (+254)</li>
                <li>• Nigeria (+234)</li>
                <li>• Ghana (+233)</li>
                <li>• South Africa (+27)</li>
                <li>• All African countries supported</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SMSDashboard;
