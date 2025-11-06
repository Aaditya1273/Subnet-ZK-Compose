import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Simulate soil analysis
    const soilTypes = [
      {
        type: "Alluvial soil",
        ph_level: "6.5-7.0",
        recommended_crops: ["Rice", "Wheat", "Corn", "Sugarcane", "Cotton"],
        care_instructions: [
          "Ensure proper drainage",
          "Regular organic matter addition", 
          "Monitor pH levels"
        ],
        fertility: "High"
      },
      {
        type: "Black Soil",
        ph_level: "6.0-7.5",
        recommended_crops: ["Cotton", "Wheat", "Jowar", "Linseed", "Tobacco"],
        care_instructions: [
          "Improve drainage",
          "Add organic compost",
          "Deep plowing recommended"
        ],
        fertility: "Very High"
      },
      {
        type: "Clay soil",
        ph_level: "6.0-7.0",
        recommended_crops: ["Rice", "Wheat", "Barley", "Oats"],
        care_instructions: [
          "Improve drainage",
          "Add organic matter",
          "Avoid working when wet"
        ],
        fertility: "Medium"
      },
      {
        type: "Red soil",
        ph_level: "5.5-6.5",
        recommended_crops: ["Millet", "Groundnut", "Potato", "Tobacco", "Pulses"],
        care_instructions: [
          "Add lime if acidic",
          "Regular fertilization",
          "Organic matter addition"
        ],
        fertility: "Medium"
      }
    ];

    const randomSoil = soilTypes[Math.floor(Math.random() * soilTypes.length)];
    const confidence = Math.random() * 0.25 + 0.75; // 75-100% confidence

    return NextResponse.json({
      oracle_type: "soil_analysis",
      status: "success",
      prediction: {
        soil_type: randomSoil.type,
        ph_level: randomSoil.ph_level,
        fertility_level: randomSoil.fertility,
        recommended_crops: randomSoil.recommended_crops,
        care_instructions: randomSoil.care_instructions,
        analysis_date: new Date().toISOString()
      },
      confidence: confidence,
      metadata: {
        model: "Multi-class CNN",
        soil_types_supported: 4,
        analysis_method: "Computer Vision",
        processing_time: "0.8s"
      },
      hackathon: "Africa Blockchain Festival 2025"
    });

  } catch (error) {
    console.error('Soil oracle error:', error);
    return NextResponse.json(
      { 
        oracle_type: "soil_analysis",
        status: "error",
        error: "Failed to analyze soil image",
        hackathon: "Africa Blockchain Festival 2025"
      },
      { status: 500 }
    );
  }
}