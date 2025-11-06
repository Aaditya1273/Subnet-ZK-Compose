'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ENDPOINTS } from '../config/api';

function SoilPredictor() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [animateResult, setAnimateResult] = useState(false);

  // Create image preview when file is selected
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null); // Clear previous results
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setResult(null); // Clear previous results
    }
  };

  const handleSubmit = async () => {
    if (!file) return alert("Please upload an image!");

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(ENDPOINTS.PREDICT_SOIL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log("🔍 Backend response:", res.data); // debug output
      
      // Check if there's an error in the response
      if (res.data.error || res.data.message === "Error analyzing image") {
        setResult({
          error: true,
          message: res.data.error || "Soil analysis temporarily unavailable",
          prediction: "Service Update In Progress",
          confidence: 0,
          notes: "The soil analysis AI is being updated for better compatibility. Our team is working to resolve this issue. Please try again in a few minutes, or contact support if the problem persists.",
          crops: [],
          care: []
        });
      } else {
        // Transform backend response to frontend format
        const prediction = res.data.prediction || {};
        setResult({
          prediction: prediction.soil_type || "Unknown",
          confidence: (res.data.confidence * 100) || 0,
          crops: prediction.recommended_crops || [],
          care: prediction.care_instructions || [],
          notes: prediction.notes || "",
          ph_range: prediction.ph_range || "N/A",
          texture: prediction.texture || "N/A",
          water_retention: prediction.water_retention || "N/A"
        });
      }
      
      setAnimateResult(true);
    } catch (err) {
      console.error("❌ Soil prediction error:", err);
      
      // More detailed error handling
      let errorMessage = "Prediction failed.";
      if (err.response) {
        // Server responded with error status
        errorMessage = `Server error: ${err.response.status}`;
        if (err.response.data && err.response.data.error) {
          errorMessage = err.response.data.error;
        }
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = "Network error. Please check your connection.";
      }
      
      setResult({
        error: true,
        message: errorMessage,
        prediction: "Error",
        confidence: 0,
        notes: "Unable to analyze the image. Please try again with a clearer image or check your connection.",
        crops: [],
        care: []
      });
      setAnimateResult(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6">
      {/* Service Status Banner */}
      <div className="max-w-3xl mx-auto mb-6">
        <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-yellow-600 text-xl">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Service Update Notice
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                We're currently updating our soil analysis AI for better accuracy. 
                If you encounter any issues, please try our other features or check back in a few minutes.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
        <div className="bg-gradient-to-r from-gray-900 to-black text-white py-6 px-8 rounded-t-2xl">
          <h2 className="text-3xl font-bold flex items-center">
            <svg className="w-8 h-8 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#22c55e" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Soil Type Predictor
            <span className="ml-2 text-gray-300">AI</span>
          </h2>
          <p className="mt-2 text-gray-200 opacity-90">Upload a soil image for instant analysis and recommendations</p>
        </div>
        
        <div className="p-8">
          {/* Upload section */}
          <div 
            className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center transition-all duration-300 hover:border-black"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {!preview ? (
              <div className="space-y-4">
                <svg className="w-20 h-20 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-600 font-medium">Drag & drop your soil image here or click to browse</p>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  className="hidden" 
                  id="fileInput" 
                />
                <button 
                  onClick={() => document.getElementById('fileInput').click()}
                  className="bg-smart-green text-white px-6 py-3 rounded-lg transform transition hover:scale-105 hover:bg-green-800"
                >
                  Select Image
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <img 
                    src={preview} 
                    alt="Soil preview" 
                    className="max-h-64 mx-auto rounded-lg shadow-md object-contain animate-fadeIn" 
                  />
                  <button 
                    onClick={() => {setFile(null); setPreview(null);}}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full w-8 h-8 flex items-center justify-center opacity-80 hover:opacity-100 transition"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-gray-700 font-medium">{file?.name}</p>
                <button 
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className={`w-full bg-smart-yellow text-smart-green font-bold px-6 py-3 rounded-lg transform transition hover:scale-105 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-yellow-400'}`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-smart-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing...
                    </span>
                  ) : (
                    'Predict Soil Type'
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Results section */}
          {result && (
            <div className={`mt-8 border-2 ${result.error ? 'border-gray-400 bg-gray-50' : 'border-gray-300 bg-white'} rounded-lg p-6 transition-all duration-500 ${animateResult ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-2xl font-bold ${result.error ? 'text-gray-700' : 'text-black'}`}>
                  {result.error ? 'Analysis Error' : 'Analysis Results'}
                </h3>
                {!result.error && (
                  <div className="bg-gray-200 text-black px-4 py-2 rounded font-semibold border-2 border-gray-400">
                    {typeof result.confidence === 'number'
                      ? result.confidence.toFixed(0) + '% Confidence'
                      : result.confidence}
                  </div>
                )}
                {result.error && (
                  <div className="bg-gray-700 text-white px-4 py-2 rounded font-semibold">
                    Service Issue
                  </div>
                )}
              </div>

              <div className={`mt-4 p-4 ${result.error ? 'bg-gray-100 border-2 border-gray-300' : 'bg-gray-50 border-2 border-gray-200'} rounded-lg`}>
                <h3 className="text-xl font-bold flex items-center">
                  {result.error ? 'Status:' : 'Predicted:'} 
                  <span className={`ml-2 ${result.error ? 'text-gray-700' : 'text-black'}`}>
                    {result.prediction}
                  </span>
                </h3>
                {result.error && result.message && (
                  <p className="mt-2 text-gray-600 text-sm">{result.message}</p>
                )}
              </div>

              {result.notes && (
                <div className={`mt-4 p-4 ${result.error ? 'bg-gray-100 border-2 border-gray-300' : 'bg-white border-2 border-gray-200'} rounded-lg`}>
                  <h4 className={`font-bold ${result.error ? 'text-gray-800' : 'text-black'}`}>
                    {result.error ? 'What happened:' : 'About this soil:'}
                  </h4>
                  <p className={`mt-2 ${result.error ? 'text-gray-700' : 'text-gray-600'}`}>{result.notes}</p>
                  {result.error && (
                    <div className="mt-3 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                      <h5 className="font-semibold text-yellow-800">💡 What's happening?</h5>
                      <div className="mt-2 text-yellow-700 text-sm space-y-2">
                        <p><strong>Current Status:</strong> The soil analysis AI model is being updated for better compatibility with our servers.</p>
                        <p><strong>What you can do:</strong></p>
                        <ul className="ml-4 space-y-1">
                          <li>• Try the Plant Disease Detection feature instead</li>
                          <li>• Check the Market Prediction for crop pricing</li>
                          <li>• Try again in 10-15 minutes</li>
                          <li>• If the issue persists, contact our support team</li>
                        </ul>
                        <p className="mt-2 text-xs text-yellow-600">
                          <strong>Technical note:</strong> We're resolving TensorFlow model compatibility issues on our servers.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!result.error && (
                <>
                  {/* Soil Characteristics */}
                  {(result.ph_range || result.texture || result.water_retention) && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border-2 border-gray-300">
                      <h4 className="font-bold text-black flex items-center mb-4">
                        Soil Characteristics
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {result.ph_range && result.ph_range !== "N/A" && (
                          <div className="bg-white p-3 rounded-lg border-2 border-gray-200">
                            <p className="text-xs text-gray-500 font-semibold uppercase">pH Range</p>
                            <p className="text-lg font-bold text-black mt-1">{result.ph_range}</p>
                          </div>
                        )}
                        {result.texture && result.texture !== "N/A" && (
                          <div className="bg-white p-3 rounded-lg border-2 border-gray-200">
                            <p className="text-xs text-gray-500 font-semibold uppercase">Texture</p>
                            <p className="text-lg font-bold text-black mt-1">{result.texture}</p>
                          </div>
                        )}
                        {result.water_retention && result.water_retention !== "N/A" && (
                          <div className="bg-white p-3 rounded-lg border-2 border-gray-200">
                            <p className="text-xs text-gray-500 font-semibold uppercase">Water Retention</p>
                            <p className="text-lg font-bold text-black mt-1">{result.water_retention}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {result.crops && result.crops.length > 0 && (
                    <div className="p-4 bg-white rounded-lg border-2 border-gray-300">
                      <h4 className="font-bold text-black flex items-center border-b-2 border-gray-200 pb-2 mb-3">
                        Suitable Crops
                      </h4>
                      <ul className="mt-3 space-y-2">
                        {result.crops.map((crop, index) => (
                          <li 
                            key={crop} 
                            className="flex items-center text-gray-700"
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <span className="mr-2 text-black font-bold">•</span> {crop}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.care && result.care.length > 0 && (
                    <div className="p-4 bg-white rounded-lg border-2 border-gray-300">
                      <h4 className="font-bold text-black flex items-center border-b-2 border-gray-200 pb-2 mb-3">
                        Care Tips
                      </h4>
                      <ul className="mt-3 space-y-2">
                        {result.care.map((tip, index) => (
                          <li 
                            key={tip} 
                            className="flex items-center text-gray-700"
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <span className="mr-2 text-black font-bold">•</span> {tip}
                          </li>
                        ))}
                      </ul>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="text-center mt-6 text-gray-500 text-sm">
        © 2025 Soil Predictor AI | Using advanced ML for accurate soil analysis
      </div>
    </div>
  );
}

export default SoilPredictor;