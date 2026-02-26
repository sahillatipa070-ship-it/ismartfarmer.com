let generatedOTP = "";
let resendTimer;
let currentLang = "en";

/* ================= LANGUAGE TEXT ================= */

const translations = {
    en: {
        invalidPhone: "Please enter a valid mobile number",
        invalidEmail: "Please enter a valid email",
        enterOTP: "Please enter OTP",
        loginSuccess: "Login Successful ✅",
        invalidOTP: "Invalid OTP ❌",
        resendIn: "Resend in ",
        sendOTP: "Send OTP"
    },
    hi: {
        invalidPhone: "कृपया सही मोबाइल नंबर दर्ज करें",
        invalidEmail: "कृपया सही ईमेल दर्ज करें",
        enterOTP: "कृपया ओटीपी दर्ज करें",
        loginSuccess: "लॉगिन सफल ✅",
        invalidOTP: "अमान्य ओटीपी ❌",
        resendIn: "पुनः भेजें ",
        sendOTP: "ओटीपी भेजें"
    },
    mr: {
        invalidPhone: "कृपया योग्य मोबाईल नंबर टाका",
        invalidEmail: "कृपया योग्य ईमेल टाका",
        enterOTP: "कृपया ओटीपी टाका",
        loginSuccess: "लॉगिन यशस्वी ✅",
        invalidOTP: "अवैध ओटीपी ❌",
        resendIn: "पुन्हा पाठवा ",
        sendOTP: "ओटीपी पाठवा"
    }
};

/* ================= LANGUAGE SWITCH ================= */

function changeLanguage() {
    currentLang = document.getElementById("languageSelect").value;
}

/* ================= OTP SYSTEM ================= */

function sendOTP() {

    const phone = document.getElementById("mobile").value.trim();
    const email = document.getElementById("email").value.trim();
    const otpSection = document.getElementById("otpSection");

    if (phone.length < 10) {
        alert(translations[currentLang].invalidPhone);
        return;
    }

    if (email && !validateEmail(email)) {
        alert(translations[currentLang].invalidEmail);
        return;
    }

    generatedOTP = Math.floor(1000 + Math.random() * 9000);

    console.log("Demo OTP:", generatedOTP);
    alert("Demo OTP: " + generatedOTP); // Remove in production

    otpSection.style.display = "block";

    startResendTimer();
}

function verifyOTP() {

    const userOTP = document.getElementById("otp").value.trim();

    if (!userOTP) {
        alert(translations[currentLang].enterOTP);
        return;
    }

    if (userOTP == generatedOTP) {
        alert(translations[currentLang].loginSuccess);

        document.querySelector(".login-section").style.display = "none";
        document.getElementById("dashboard").style.display = "block";

        clearInterval(resendTimer);
    } else {
        alert(translations[currentLang].invalidOTP);
    }
}

/* ================= HELPER FUNCTIONS ================= */

function validateEmail(email) {
    const pattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
    return pattern.test(email.toLowerCase());
}

function startResendTimer() {

    let timeLeft = 30;
    const button = document.querySelector("button[onclick='sendOTP()']");
    
    button.disabled = true;
    button.innerText = translations[currentLang].resendIn + timeLeft + "s";

    resendTimer = setInterval(() => {
        timeLeft--;
        button.innerText = translations[currentLang].resendIn + timeLeft + "s";

        if (timeLeft <= 0) {
            clearInterval(resendTimer);
            button.disabled = false;
            button.innerText = translations[currentLang].sendOTP;
        }
    }, 1000);
}

/* ================= crop dectecror SYSTEM ================= */
const API_KEY = "HD9oimw564y4mkYtXBQdfN64bv0afX2fdx9UNlCq8hRCVG6Rtz";   // 🔑 Keep your key safe (Do NOT expose in frontend in production)

let selectedImageBase64 = null;

/* ================= OPEN SCANNER UI ================= */

function openCropScanner() {
    document.getElementById("output").innerHTML = `
        <h3>🌾 AI Crop Scanner</h3>

        <input type="file" id="cropFile" accept="image/*" onchange="previewImage(event)">
        <br><br>

        <button onclick="openCamera()">📷 Open Camera</button>
        <br><br>

        <video id="camera" width="250" height="200" autoplay 
        style="display:none;border-radius:10px;"></video>
        <br>
        <button id="captureBtn" onclick="captureImage()" 
        style="display:none;">Capture</button>

        <br><br>
        <canvas id="canvas" width="250" height="200" style="display:none;"></canvas>

        <div id="imagePreview"></div>
        <br>
        <button onclick="analyzeCropImage()">🔍 Analyze Crop</button>

        <div id="scanResult" style="margin-top:20px;"></div>
    `;
}

/* ================= IMAGE PREVIEW ================= */

function previewImage(event) {
    const reader = new FileReader();

    reader.onload = function () {
        selectedImageBase64 = reader.result.split(',')[1];

        document.getElementById("imagePreview").innerHTML = `
            <img src="${reader.result}" width="250" style="border-radius:10px;">
        `;
    };

    reader.readAsDataURL(event.target.files[0]);
}

/* ================= CAMERA ================= */

function openCamera() {
    const video = document.getElementById("camera");
    const captureBtn = document.getElementById("captureBtn");

    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.style.display = "block";
            captureBtn.style.display = "inline-block";
            video.srcObject = stream;
        })
        .catch(() => alert("Camera not supported."));
}

function captureImage() {
    const video = document.getElementById("camera");
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/jpeg");

    selectedImageBase64 = imageData.split(',')[1];

    document.getElementById("imagePreview").innerHTML = `
        <img src="${imageData}" width="250" style="border-radius:10px;">
    `;

    video.srcObject.getTracks().forEach(track => track.stop());
    video.style.display = "none";
    document.getElementById("captureBtn").style.display = "none";
}

/* ================= PLANT.ID API ANALYSIS ================= */

async function analyzeCropImage() {

    if (!selectedImageBase64) {
        alert("Please upload or capture an image first.");
        return;
    }

    document.getElementById("scanResult").innerHTML =
        "⏳ Analyzing crop... Please wait.";

    try {
        const response = await fetch(
            "https://api.plant.id/v2/health_assessment",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Api-Key": API_KEY
                },
                body: JSON.stringify({
                    images: [selectedImageBase64],
                    modifiers: ["crops_fast"],
                    plant_language: "en",
                    disease_details: ["description", "treatment"]
                })
            }
        );

        const result = await response.json();

        if (
            result.health_assessment &&
            result.health_assessment.diseases &&
            result.health_assessment.diseases.length > 0
        ) {

            const disease = result.health_assessment.diseases[0];

            /* ===== FIX TREATMENT OBJECT HERE ===== */

            let treatmentHTML = "Consult local expert";

            const treatment = disease.disease_details?.treatment;

            if (treatment && typeof treatment === "object") {

                treatmentHTML = "";

                if (treatment.biological && treatment.biological.length > 0) {
                    treatmentHTML += "<b>🌿 Biological:</b><br>" +
                        treatment.biological.join("<br>") + "<br><br>";
                }

                if (treatment.chemical && treatment.chemical.length > 0) {
                    treatmentHTML += "<b>🧪 Chemical:</b><br>" +
                        treatment.chemical.join("<br>") + "<br><br>";
                }

                if (treatment.prevention && treatment.prevention.length > 0) {
                    treatmentHTML += "<b>🛡 Prevention:</b><br>" +
                        treatment.prevention.join("<br>");
                }

                if (treatmentHTML === "") {
                    treatmentHTML = "Consult local expert";
                }
            }

            document.getElementById("scanResult").innerHTML = `
                <h4>🦠 Disease Detected:</h4>
                <b>${disease.name}</b><br><br>

                <b>Probability:</b>
                ${(disease.probability * 100).toFixed(2)}%<br><br>

                <b>Description:</b><br>
                ${disease.disease_details?.description || "Not available"}<br><br>

                <b>Treatment:</b><br>
                ${treatmentHTML}
            `;

        } else {
            document.getElementById("scanResult").innerHTML =
                "✅ Your crop looks healthy!";
        }

    } catch (error) {
        document.getElementById("scanResult").innerHTML =
            "❌ Error analyzing image. Check API key or internet connection.";
        console.error(error);
    }
}
/* ================= MANDI DASHBOARD ================= */

function getMandi() {
    document.getElementById("output").innerHTML = `
        <h3>📈 Live Mandi Prices - Mumbai Market</h3>
        <p>Last Updated: ${new Date().toLocaleString()}</p>

        <button onclick="showAllMandi()">📋 Show All Crops</button>
        <button onclick="sortHighToLow()">⬆ Sort High → Low</button>
        <button onclick="sortLowToHigh()">⬇ Sort Low → High</button>
        <br><br>

        <input type="text" id="cropSearch" placeholder="Enter crop name">
        <button onclick="searchMandi()">Search</button>

        <br><br>
        <input type="number" id="priceFilter" placeholder="Show crops above ₹">
        <button onclick="filterByPrice()">Filter</button>

        <div id="mandiResult" style="margin-top:20px;"></div>
    `;
}

/* ================= MANDI DATA ================= */

let mandiData = {
    wheat: { price: 2200, trend: "up" },
    rice: { price: 3100, trend: "down" },
    maize: { price: 1800, trend: "up" },
    cotton: { price: 7200, trend: "stable" },
    barley: { price: 1700, trend: "down" },
    mustard: { price: 5400, trend: "up" },
    soybean: { price: 4300, trend: "up" },
    groundnut: { price: 6000, trend: "stable" },
    sugarcane: { price: 350, trend: "up" },
    tur: { price: 6800, trend: "down" },
    chana: { price: 5200, trend: "stable" },
    onion: { price: 1400, trend: "up" },
    potato: { price: 1200, trend: "down" },
    tomato: { price: 1600, trend: "up" },
    bajra: { price: 1900, trend: "stable" }
};

/* ================= SEARCH ================= */

function searchMandi() {
    let cropName = document.getElementById("cropSearch").value.toLowerCase();

    if (mandiData[cropName]) {
        displaySingleCrop(cropName, mandiData[cropName]);
    } else {
        document.getElementById("mandiResult").innerHTML =
            "❌ Crop not found. Please enter valid crop name.";
    }
}

/* ================= DISPLAY SINGLE ================= */

function displaySingleCrop(crop, data) {

    let trendSymbol = data.trend === "up" ? "📈 Increasing"
                    : data.trend === "down" ? "📉 Decreasing"
                    : "➖ Stable";

    document.getElementById("mandiResult").innerHTML = `
        <div style="padding:15px;background:#eef;border-radius:10px;">
            <h4>${crop.toUpperCase()}</h4>
            <b>Price:</b> ₹${data.price} per quintal <br>
            <b>Trend:</b> ${trendSymbol}
        </div>
    `;
}

/* ================= SHOW ALL ================= */

function showAllMandi() {
    renderMandi(Object.entries(mandiData));
}

/* ================= SORT HIGH TO LOW ================= */

function sortHighToLow() {
    let sorted = Object.entries(mandiData)
        .sort((a, b) => b[1].price - a[1].price);
    renderMandi(sorted);
}

/* ================= SORT LOW TO HIGH ================= */

function sortLowToHigh() {
    let sorted = Object.entries(mandiData)
        .sort((a, b) => a[1].price - b[1].price);
    renderMandi(sorted);
}

/* ================= FILTER BY PRICE ================= */

function filterByPrice() {
    let minPrice = parseFloat(document.getElementById("priceFilter").value);

    if (isNaN(minPrice)) {
        alert("Enter valid price");
        return;
    }

    let filtered = Object.entries(mandiData)
        .filter(([crop, data]) => data.price >= minPrice);

    renderMandi(filtered);
}

/* ================= COMMON RENDER FUNCTION ================= */

function renderMandi(dataArray) {

    let html = "<h4>📋 Crop List</h4>";

    if (dataArray.length === 0) {
        html += "No crops found.";
    }

    dataArray.forEach(([crop, data]) => {

        let trendSymbol = data.trend === "up" ? "📈"
                        : data.trend === "down" ? "📉"
                        : "➖";

        html += `
            <div style="
                margin-bottom:12px;
                padding:12px;
                background:#f9f9f9;
                border-radius:10px;
                box-shadow:0 2px 5px rgba(0,0,0,0.1);">

                <strong>${crop.toUpperCase()}</strong><br>
                ₹${data.price} per quintal <br>
                ${trendSymbol} ${data.trend}
            </div>
        `;
    });

    document.getElementById("mandiResult").innerHTML = html;
}

/* ================= ADVANCED ANIMAL DOCTORS ================= */
/* ================= ANIMAL DOCTORS ================= */

/* =========================================
   🐄 SMART ANIMAL DOCTOR SYSTEM - ADVANCED
========================================= */

function animalDoctors(filter = "all") {

    let doctors = [

        { name: "Dr. Sharma", type: "Veterinary Surgeon", distance: 5, status: "Available", phone: "9876543210", rating: 4.5, emergency: true },
        { name: "Dr. Patel", type: "Dairy Specialist", distance: 12, status: "Busy", phone: "9823456781", rating: 4.2, emergency: false },
        { name: "Dr. Singh", type: "Poultry Expert", distance: 8, status: "Available", phone: "9811122233", rating: 4.8, emergency: true },
        { name: "Dr. Verma", type: "Animal Nutritionist", distance: 3, status: "Available", phone: "9898989898", rating: 4.6, emergency: false },
        { name: "Dr. Reddy", type: "Large Animal Specialist", distance: 15, status: "Busy", phone: "9845012345", rating: 4.1, emergency: false },
        { name: "Dr. Khan", type: "Veterinary Surgeon", distance: 6, status: "Available", phone: "9833344455", rating: 4.7, emergency: true },
        { name: "Dr. Mehta", type: "Dairy Specialist", distance: 10, status: "Available", phone: "9800011122", rating: 4.3, emergency: false },
        { name: "Dr. Iyer", type: "Pet & Farm Vet", distance: 18, status: "Busy", phone: "9797979797", rating: 3.9, emergency: false },
        { name: "Dr. Das", type: "Emergency Vet", distance: 4, status: "Available", phone: "9788887777", rating: 4.9, emergency: true },
        { name: "Dr. Rao", type: "Surgery Specialist", distance: 1, status: "Available", phone: "9709988776", rating: 5.0, emergency: true },
        { name: "Dr. Nair", type: "Goat & Sheep Specialist", distance: 7, status: "Available", phone: "9765432100", rating: 4.4, emergency: false },
        { name: "Dr. Choudhary", type: "Buffalo Expert", distance: 9, status: "Busy", phone: "9654321876", rating: 4.0, emergency: false },
        { name: "Dr. Pillai", type: "Veterinary Physician", distance: 2, status: "Available", phone: "9543218765", rating: 4.6, emergency: true },
        { name: "Dr. Tiwari", type: "Livestock Consultant", distance: 11, status: "Available", phone: "9432109876", rating: 4.2, emergency: false },
        { name: "Dr. Yadav", type: "Cattle Reproduction Expert", distance: 6, status: "Available", phone: "9321098765", rating: 4.8, emergency: true }
    ];

    // Filter logic
    if (filter === "available") {
        doctors = doctors.filter(doc => doc.status === "Available");
    }

    if (filter === "emergency") {
        doctors = doctors.filter(doc => doc.emergency === true);
    }

    // Sort nearest first
    doctors.sort((a, b) => a.distance - b.distance);

    let html = `
        <h3>🐄 Nearby Animal Doctors</h3>

        <button onclick="animalDoctors('all')">All</button>
        <button onclick="animalDoctors('available')">Available</button>
        <button onclick="animalDoctors('emergency')">Emergency</button>
        <br><br>
    `;

    doctors.forEach(doc => {

        let statusColor = doc.status === "Available" ? "green" : "red";
        let stars = "⭐".repeat(Math.floor(doc.rating));
        let emergencyBadge = doc.emergency ? " 🚨 Emergency Available" : "";

        html += `
            <div style="margin-bottom:15px; padding:12px; border-radius:10px; box-shadow:0 0 8px #ccc; background:#f9f9f9;">
                <strong>${doc.name}</strong> (${doc.type})<br>
                Distance: ${doc.distance} km<br>
                Status: <span style="color:${statusColor}; font-weight:bold;">
                    ${doc.status}
                </span>${emergencyBadge}<br>
                Rating: ${stars} (${doc.rating})<br>
                Phone: ${doc.phone}<br><br>
                <button onclick="callDoctor('${doc.name}', '${doc.phone}')">
                    📞 Call Doctor
                </button>
            </div>
        `;
    });

    document.getElementById("output").innerHTML = html;
}

/* ========= CALL FUNCTION ========= */

function callDoctor(name, phone) {
    alert("📞 Calling " + name + " at " + phone + "...");
    window.location.href = "tel:" + phone;
}/* ================= GOVERNMENT SCHEMES ================= */

function governmentSchemes() {

    let schemes = [
        { name: "PM-KISAN", benefit: "₹6000 per year support.", link: "https://pmkisan.gov.in/" },
        { name: "PM Fasal Bima Yojana", benefit: "Crop insurance.", link: "https://pmfby.gov.in/" },
        { name: "Kisan Credit Card", benefit: "Low interest loans.", link: "https://www.myscheme.gov.in/schemes/kcc" },
        { name: "Soil Health Card", benefit: "Free soil testing.", link: "https://soilhealth.dac.gov.in/" },
        { name: "PM Kusum", benefit: "Solar pump subsidy.", link: "https://pmkusum.mnre.gov.in/" },
        { name: "eNAM", benefit: "Online mandi trading.", link: "https://www.enam.gov.in/" }
    ];

    let html = "<h3>🏛 Government Schemes for Farmers</h3>";

    schemes.forEach(scheme => {
        html += `
            <div style="background:#f1f8e9;padding:15px;margin-bottom:15px;border-radius:10px;box-shadow:0 0 5px #ccc;">
                <strong>${scheme.name}</strong><br>
                <p>${scheme.benefit}</p>
                <a href="${scheme.link}" target="_blank">
                    <button style="padding:6px 12px;cursor:pointer;">
                        Visit Official Website
                    </button>
                </a>
            </div>
        `;
    });

    document.getElementById("output").innerHTML = html;
}
/* ================= PROFIT CALCULATOR ================= */

let profitChartInstance = null;

function profitCalculator() {

    const output = document.getElementById("output");
    if (!output) {
        console.error("Div with id 'output' not found in HTML.");
        return;
    }

    output.innerHTML = `
        <h3>💰 Advanced Profit Calculator</h3>

        <label>Select Crop:</label><br>
        <select id="crop">
            <option value="Wheat">Wheat</option>
            <option value="Rice">Rice</option>
            <option value="Cotton">Cotton</option>
            <option value="Maize">Maize</option>
        </select><br><br>

        <label>Land Area (Acres):</label><br>
        <input type="number" id="area" value="1"><br><br>

        <label>Total Investment (₹):</label><br>
        <input type="number" id="cost"><br><br>

        <label>Total Revenue (₹):</label><br>
        <input type="number" id="revenue"><br><br>

        <label>Government Subsidy (₹):</label><br>
        <input type="number" id="subsidy" value="0"><br><br>

        <label>Loan Amount (₹):</label><br>
        <input type="number" id="loan" value="0"><br><br>

        <label>Interest Rate (%):</label><br>
        <input type="number" id="interest" value="0"><br><br>

        <button onclick="calculateAdvancedProfit()">Calculate Profit</button>

        <canvas id="profitChart" height="100"></canvas>
        <div id="result" style="margin-top:20px;"></div>
    `;
}

function calculateAdvancedProfit() {

    if (typeof Chart === "undefined") {
        alert("Chart.js is not loaded. Please add Chart.js CDN in HTML.");
        return;
    }

    let crop = document.getElementById("crop").value;
    let area = parseFloat(document.getElementById("area").value) || 1;
    let cost = parseFloat(document.getElementById("cost").value);
    let revenue = parseFloat(document.getElementById("revenue").value);
    let subsidy = parseFloat(document.getElementById("subsidy").value) || 0;
    let loan = parseFloat(document.getElementById("loan").value) || 0;
    let interest = parseFloat(document.getElementById("interest").value) || 0;

    if (isNaN(cost) || isNaN(revenue) || cost <= 0 || revenue <= 0) {
        alert("Please enter valid Cost and Revenue values");
        return;
    }

    let interestAmount = (loan * interest) / 100;
    let totalCost = cost + interestAmount - subsidy;
    let profit = revenue - totalCost;
    let percentage = ((profit / totalCost) * 100).toFixed(2);
    let profitPerAcre = (profit / area).toFixed(2);
    let breakEven = ((totalCost / revenue) * 100).toFixed(2);

    let status = profit >= 0 ? "📈 Profit" : "📉 Loss";

    document.getElementById("result").innerHTML = `
        <h4>📊 Result Summary (${crop})</h4>
        <b>${status}</b><br><br>
        Net Profit/Loss: ₹${profit.toFixed(2)}<br>
        Profit Percentage: ${percentage}%<br>
        Profit Per Acre: ₹${profitPerAcre}<br>
        Break-even Ratio: ${breakEven}%<br>
        Total Cost: ₹${totalCost.toFixed(2)}
    `;

    if (profitChartInstance) {
        profitChartInstance.destroy();
    }

    const ctx = document.getElementById("profitChart").getContext("2d");

    profitChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Total Cost', 'Revenue', 'Profit/Loss'],
            datasets: [{
                label: 'Financial Overview (₹)',
                data: [totalCost, revenue, profit],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

/* ================= SMART CROP RECOMMENDATION ================= */
function cropRecommendation() {

    const output = document.getElementById("output");
    if (!output) {
        console.error("Div with id 'output' not found.");
        return;
    }

    output.innerHTML = `
        <h3>🌱 Advanced Smart Crop Recommendation</h3>

        <label>Soil Type:</label><br>
        <select id="soil">
            <option value="Black">Black</option>
            <option value="Loamy">Loamy</option>
            <option value="Sandy">Sandy</option>
            <option value="Clay">Clay</option>
            <option value="Red">Red</option>
        </select><br><br>

        <label>Water Availability:</label><br>
        <select id="water">
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
        </select><br><br>

        <label>Season:</label><br>
        <select id="season">
            <option value="Kharif">Kharif</option>
            <option value="Rabi">Rabi</option>
            <option value="Zaid">Zaid</option>
        </select><br><br>

        <label>Temperature:</label><br>
        <select id="temperature">
            <option value="Hot">Hot</option>
            <option value="Moderate">Moderate</option>
            <option value="Cold">Cold</option>
        </select><br><br>

        <label>Land Size:</label><br>
        <select id="land">
            <option value="Small">Small (1-2 acres)</option>
            <option value="Medium">Medium (3-5 acres)</option>
            <option value="Large">Large (5+ acres)</option>
        </select><br><br>

        <button onclick="suggestCrop()">Get Recommendation</button>

        <div id="cropResult" style="margin-top:20px;"></div>
    `;
}

function suggestCrop() {

    let soil = document.getElementById("soil").value;
    let water = document.getElementById("water").value;
    let season = document.getElementById("season").value;
    let temperature = document.getElementById("temperature").value;
    let land = document.getElementById("land").value;

    let suggestion = "Vegetables";
    let reason = "Suitable for moderate conditions.";
    let fertilizer = "Use balanced NPK fertilizer.";
    let yieldEstimate = "2-4 tons per acre";
    let marketPrice = "₹15-30 per kg";
    let irrigation = "Drip irrigation recommended.";
    let riskLevel = "Medium";
    let diseaseTip = "Regular pest monitoring required.";

    /* ================= SMART LOGIC ================= */

    if (season === "Kharif" && water === "High") {
        suggestion = "Rice";
        reason = "High rainfall & water availability suits rice.";
        fertilizer = "Nitrogen-rich fertilizer.";
        yieldEstimate = "4-6 tons per acre";
        marketPrice = "₹18-25 per kg";
        irrigation = "Flood irrigation method.";
        riskLevel = "Low";
        diseaseTip = "Watch for leaf blast disease.";
    }

    else if (season === "Rabi" && soil === "Loamy") {
        suggestion = "Wheat";
        reason = "Loamy soil is ideal for wheat cultivation.";
        fertilizer = "NPK + Zinc.";
        yieldEstimate = "3-5 tons per acre";
        marketPrice = "₹20-28 per kg";
        irrigation = "Sprinkler irrigation.";
        riskLevel = "Low";
        diseaseTip = "Prevent rust disease.";
    }

    else if (soil === "Black" && temperature === "Hot") {
        suggestion = "Cotton";
        reason = "Black soil and warm climate favor cotton.";
        fertilizer = "Potash-rich fertilizer.";
        yieldEstimate = "8-12 quintals per acre";
        marketPrice = "₹6000-7500 per quintal";
        irrigation = "Drip irrigation best.";
        riskLevel = "Medium";
        diseaseTip = "Monitor bollworm attack.";
    }

    else if (water === "Low") {
        suggestion = "Millets";
        reason = "Millets require less water and are drought-resistant.";
        fertilizer = "Organic compost preferred.";
        yieldEstimate = "1-3 tons per acre";
        marketPrice = "₹25-40 per kg";
        irrigation = "Minimal irrigation required.";
        riskLevel = "Low";
        diseaseTip = "Generally pest resistant.";
    }

    else if (season === "Kharif" && soil === "Red") {
        suggestion = "Groundnut";
        reason = "Red soil is good for groundnut farming.";
        fertilizer = "Calcium + Phosphorus.";
        yieldEstimate = "8-10 quintals per acre";
        marketPrice = "₹5000-6500 per quintal";
        irrigation = "Light irrigation required.";
        riskLevel = "Medium";
        diseaseTip = "Watch for leaf spot disease.";
    }

    else if (season === "Rabi" && temperature === "Cold") {
        suggestion = "Mustard";
        reason = "Cold climate is ideal for mustard crop.";
        fertilizer = "Sulphur-rich fertilizer.";
        yieldEstimate = "6-8 quintals per acre";
        marketPrice = "₹5500-7000 per quintal";
        irrigation = "Limited irrigation needed.";
        riskLevel = "Low";
        diseaseTip = "Prevent aphid attack.";
    }

    else if (land === "Large" && water === "High") {
        suggestion = "Sugarcane";
        reason = "Large land and sufficient water suits sugarcane.";
        fertilizer = "High Nitrogen fertilizer.";
        yieldEstimate = "30-40 tons per acre";
        marketPrice = "₹300-350 per quintal";
        irrigation = "Regular irrigation required.";
        riskLevel = "Medium";
        diseaseTip = "Prevent red rot disease.";
    }

    else if (land === "Small" && temperature === "Moderate") {
        suggestion = "Pulses";
        reason = "Pulses are profitable for small land farmers.";
        fertilizer = "Rhizobium bio-fertilizer.";
        yieldEstimate = "5-7 quintals per acre";
        marketPrice = "₹6000-8000 per quintal";
        irrigation = "Minimal irrigation.";
        riskLevel = "Low";
        diseaseTip = "Protect from pod borer.";
    }

    /* ================= OUTPUT ================= */

    document.getElementById("cropResult").innerHTML = `
        <h4>🌾 Recommended Crop: ${suggestion}</h4>

        <b>Reason:</b> ${reason}<br><br>

        <b>🌱 Fertilizer:</b> ${fertilizer}<br>
        <b>📦 Expected Yield:</b> ${yieldEstimate}<br>
        <b>💰 Market Price:</b> ${marketPrice}<br>
        <b>⚠ Risk Level:</b> ${riskLevel}<br>
        <b>💧 Irrigation Method:</b> ${irrigation}<br>
        <b>🦠 Disease Prevention:</b> ${diseaseTip}
    `;
}/* ================= VALUE ADDITION ================= */

function cropValueAddition() {
    document.getElementById("output").innerHTML = `
        <h3>🏭 Crop Value Addition Ideas</h3>
        <select id="valueCrop">
            <option value="wheat">Wheat</option>
            <option value="rice">Rice</option>
            <option value="maize">Maize</option>
            <option value="tomato">Tomato</option>
            <option value="milk">Milk</option>
        </select><br><br>
        <button onclick="showValueProcess()">Show Ideas</button>
        <div id="valueResult" style="margin-top:20px;"></div>
    `;
}

function showValueProcess() {
    let crop = document.getElementById("valueCrop").value;
    let result = "";

    if (crop === "wheat") {
        result = `
            Flour, Bread, Biscuits<br>
            Steps: Clean → Dry → Grind → Pack<br>
            🎥 https://www.youtube.com/results?search_query=wheat+processing+business
        `;
    }
    else if (crop === "rice") {
        result = `
            Rice Flour, Bran Oil<br>
            Steps: Clean → Remove husk → Polish → Pack<br>
            🎥 https://www.youtube.com/results?search_query=rice+processing+plant
        `;
    }
    else if (crop === "maize") {
        result = `
            Corn Flour, Popcorn<br>
            Steps: Dry → Grind or Pop → Pack<br>
            🎥 https://www.youtube.com/results?search_query=maize+processing+business
        `;
    }
    else if (crop === "tomato") {
        result = `
            Sauce, Ketchup<br>
            Steps: Wash → Crush → Boil → Bottle<br>
            🎥 https://www.youtube.com/results?search_query=tomato+sauce+business
        `;
    }
    else if (crop === "milk") {
        result = `
            Paneer, Ghee, Curd<br>
            Steps: Boil → Add coagulant → Separate → Pack<br>
            🎥 https://www.youtube.com/results?search_query=paneer+making+business
        `;
    }

    document.getElementById("valueResult").innerHTML = result;
}

/* ================= LIVE WEATHER SYSTEM ================= */

const apiKey = "d79e2d1f68d2a29dad5e10e5f7f180f9";   // Paste your real OpenWeather API key

async function getWeather() {

    const output = document.getElementById("output");
    if (!output) {
        console.error("Div with id 'output' not found.");
        return;
    }

    let city = prompt("Enter your city name:");

    if (!city) {
        alert("Please enter city name");
        return;
    }

    try {

        let response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );

        let data = await response.json();

        if (data.cod != 200) {
            alert("City not found");
            return;
        }

        let temperature = data.main.temp;
        let humidity = data.main.humidity;
        let windSpeed = data.wind.speed;
        let weatherMain = data.weather[0].main.toLowerCase();

        let alertMessage = "";
        let alertColor = "green";
        let farmingAdvice = "";

        if (weatherMain.includes("rain")) {
            alertMessage = "⚠ Heavy Rain Alert!";
            alertColor = "red";
            farmingAdvice = "Avoid spraying pesticides. Ensure proper drainage.";
        }
        else if (temperature > 35) {
            alertMessage = "🌡 Heat Alert!";
            alertColor = "orange";
            farmingAdvice = "Increase irrigation and protect crops from heat stress.";
        }
        else if (temperature < 10) {
            alertMessage = "❄ Cold Alert!";
            alertColor = "blue";
            farmingAdvice = "Protect crops from frost. Use mulching.";
        }
        else {
            alertMessage = "☀ Weather is Normal";
            alertColor = "green";
            farmingAdvice = "Suitable for farming activities.";
        }

        output.innerHTML = `
            <div style="background:#f4f4f4;padding:20px;border-radius:12px;">
                <h3>🌦 Live Weather Report</h3>

                <p><strong>City:</strong> ${data.name}</p>
                <p><strong>🌡 Temperature:</strong> ${temperature}°C</p>
                <p><strong>💧 Humidity:</strong> ${humidity}%</p>
                <p><strong>💨 Wind Speed:</strong> ${windSpeed} m/s</p>
                <p><strong>Condition:</strong> ${data.weather[0].description}</p>

                <h4 style="color:${alertColor};margin-top:15px;">
                    ${alertMessage}
                </h4>

                <p><strong>🌾 Farming Advice:</strong><br>
                    ${farmingAdvice}
                </p>
            </div>
        `;

    } catch (error) {
        alert("Error fetching weather data");
        console.error(error);
    }
}



/* ================= CROP BUSINESS IDEAS ================= */

function cropBusinessIdeas() {

    const output = document.getElementById("output");
    if (!output) {
        alert("Add <div id='output'></div> in HTML");
        return;
    }

    output.innerHTML = `
        <h3>🏭 Crop Business & Value Addition Hub</h3>

        <select id="businessCrop">
            <option value="wheat">Wheat</option>
            <option value="rice">Rice</option>
            <option value="maize">Maize</option>
            <option value="tomato">Tomato</option>
            <option value="potato">Potato</option>
            <option value="sugarcane">Sugarcane</option>
            <option value="milk">Milk</option>
            <option value="onion">Onion</option>
            <option value="garlic">Garlic</option>
            <option value="chilli">Chilli</option>
            <option value="banana">Banana</option>
            <option value="mango">Mango</option>
            <option value="soybean">Soybean</option>
            <option value="groundnut">Groundnut</option>
            <option value="turmeric">Turmeric</option>
            <option value="ginger">Ginger</option>
            <option value="poultry">Poultry</option>
        </select>

        <br><br>
        <button onclick="showCropBusiness()">Show Business Ideas</button>

        <div id="businessResult" style="margin-top:20px;"></div>
    `;
}

function showCropBusiness() {

    const crop = document.getElementById("businessCrop").value;
    const resultDiv = document.getElementById("businessResult");

    const businessData = {

        wheat: {
            products: "Flour, Bread, Biscuits, Pasta",
            investment: "₹50,000 – ₹2 Lakhs",
            profit: "20–35%",
            link: "wheat processing business"
        },

        rice: {
            products: "Rice Flour, Bran Oil, Packaged Rice",
            investment: "₹1–3 Lakhs",
            profit: "15–30%",
            link: "rice processing plant business"
        },

        maize: {
            products: "Corn Flour, Popcorn, Cattle Feed",
            investment: "₹40,000 – ₹1.5 Lakhs",
            profit: "25–40%",
            link: "maize processing business"
        },

        tomato: {
            products: "Sauce, Ketchup, Tomato Powder",
            investment: "₹60,000 – ₹2 Lakhs",
            profit: "30–50%",
            link: "tomato sauce business idea"
        },

        potato: {
            products: "Chips, French Fries, Starch",
            investment: "₹80,000 – ₹3 Lakhs",
            profit: "35–55%",
            link: "potato chips business"
        },

        sugarcane: {
            products: "Jaggery, Juice, Sugar",
            investment: "₹50,000 – ₹2 Lakhs",
            profit: "25–45%",
            link: "jaggery making business"
        },

        milk: {
            products: "Paneer, Ghee, Curd, Ice Cream",
            investment: "₹1–5 Lakhs",
            profit: "30–60%",
            link: "milk products business idea"
        },

        onion: {
            products: "Onion Powder, Pickle, Dehydrated Onion",
            investment: "₹40,000 – ₹1.5 Lakhs",
            profit: "25–45%",
            link: "onion processing business"
        },

        garlic: {
            products: "Garlic Paste, Powder, Pickle",
            investment: "₹40,000 – ₹1.5 Lakhs",
            profit: "30–50%",
            link: "garlic processing business"
        },

        chilli: {
            products: "Chilli Powder, Pickle, Sauce",
            investment: "₹50,000 – ₹2 Lakhs",
            profit: "30–55%",
            link: "chilli powder business"
        },

        banana: {
            products: "Banana Chips, Powder, Puree",
            investment: "₹60,000 – ₹2 Lakhs",
            profit: "35–60%",
            link: "banana chips business"
        },

        mango: {
            products: "Pickle, Pulp, Juice, Jam",
            investment: "₹70,000 – ₹3 Lakhs",
            profit: "35–55%",
            link: "mango processing business"
        },

        soybean: {
            products: "Soy Oil, Tofu, Soy Milk",
            investment: "₹1–4 Lakhs",
            profit: "25–40%",
            link: "soybean processing business"
        },

        groundnut: {
            products: "Peanut Butter, Oil, Roasted Nuts",
            investment: "₹60,000 – ₹2 Lakhs",
            profit: "30–50%",
            link: "groundnut oil business"
        },

        turmeric: {
            products: "Turmeric Powder, Oil, Capsules",
            investment: "₹50,000 – ₹2 Lakhs",
            profit: "35–55%",
            link: "turmeric processing business"
        },

        ginger: {
            products: "Ginger Powder, Candy, Paste",
            investment: "₹50,000 – ₹2 Lakhs",
            profit: "30–50%",
            link: "ginger processing business"
        },

        poultry: {
            products: "Egg Production, Broiler Farming",
            investment: "₹1–6 Lakhs",
            profit: "25–45%",
            link: "poultry farming business"
        }

    };

    const selected = businessData[crop];

    resultDiv.innerHTML = `
        <div style="background:#f4f4f4;padding:20px;border-radius:12px;">
            <strong>Products:</strong> ${selected.products} <br>
            <strong>Investment:</strong> ${selected.investment} <br>
            <strong>Profit Margin:</strong> ${selected.profit} <br><br>
            🎥 <a href="https://www.youtube.com/results?search_query=${selected.link}" target="_blank">
                Watch Business Videos
            </a>
        </div>
    `;
}

/* ================= ANIMAL & FARMING BUSINESS IDEAS ================= */

function animalBusinessIdeas() {

    const output = document.getElementById("output");

    if (!output) {
        alert("Add <div id='output'></div> in your HTML");
        return;
    }

    const businesses = [

        { name: "🐄 Dairy Farming", desc: "Milk production & selling", invest: "₹2–10 Lakhs", profit: "₹50,000+ per month", link: "dairy farming business plan" },
        { name: "🐓 Poultry Farming", desc: "Egg & Chicken production", invest: "₹1–5 Lakhs", profit: "25–40% margin", link: "poultry farming business plan" },
        { name: "🐐 Goat Farming", desc: "Meat & Milk business", invest: "₹80,000 – ₹3 Lakhs", profit: "30–50% margin", link: "goat farming business plan" },
        { name: "🐟 Fish Farming", desc: "Pond-based fish production", invest: "₹1–4 Lakhs", profit: "25–45% margin", link: "fish farming business plan" },
        { name: "🐝 Beekeeping", desc: "Honey production", invest: "₹50,000 – ₹2 Lakhs", profit: "40–60% margin", link: "beekeeping business plan" },
        { name: "🐑 Sheep Farming", desc: "Wool & Meat business", invest: "₹1–4 Lakhs", profit: "30–45%", link: "sheep farming business plan" },
        { name: "🐇 Rabbit Farming", desc: "Meat & Breeding business", invest: "₹50,000 – ₹2 Lakhs", profit: "35–55%", link: "rabbit farming business plan" },
        { name: "🦆 Duck Farming", desc: "Egg & Meat production", invest: "₹80,000 – ₹3 Lakhs", profit: "30–50%", link: "duck farming business plan" },
        { name: "🐖 Pig Farming", desc: "Meat production business", invest: "₹1–5 Lakhs", profit: "35–60%", link: "pig farming business plan" },
        { name: "🐂 Organic Manure Production", desc: "Vermicompost & Organic Fertilizer", invest: "₹40,000 – ₹1.5 Lakhs", profit: "30–50%", link: "vermicompost business plan" },
        { name: "🌿 Mushroom Farming", desc: "Oyster & Button mushroom production", invest: "₹50,000 – ₹2 Lakhs", profit: "40–70%", link: "mushroom farming business plan" },
        { name: "🌾 Hydroponic Farming", desc: "Soilless vegetable production", invest: "₹2–8 Lakhs", profit: "35–60%", link: "hydroponic farming business plan" },
        { name: "🌱 Nursery Plant Business", desc: "Plant sapling production", invest: "₹30,000 – ₹1 Lakh", profit: "40–65%", link: "plant nursery business plan" },
        { name: "🌻 Flower Farming", desc: "Marigold, Rose, Jasmine farming", invest: "₹50,000 – ₹2 Lakhs", profit: "35–55%", link: "flower farming business plan" },
        { name: "🥚 Hatchery Business", desc: "Chick production & selling", invest: "₹2–6 Lakhs", profit: "30–50%", link: "poultry hatchery business plan" },
        { name: "🐃 Buffalo Farming", desc: "High fat milk production", invest: "₹3–12 Lakhs", profit: "₹60,000+ per month", link: "buffalo farming business plan" },
        { name: "🌾 Silage Making Business", desc: "Animal feed production", invest: "₹1–3 Lakhs", profit: "25–45%", link: "silage making business plan" },
        { name: "🦋 Sericulture", desc: "Silk production business", invest: "₹1–4 Lakhs", profit: "35–60%", link: "sericulture silk farming business" },
        { name: "🐓 Country Chicken Farming", desc: "Desi chicken business", invest: "₹80,000 – ₹3 Lakhs", profit: "30–55%", link: "country chicken farming business" },
        { name: "🐠 Aquarium Fish Farming", desc: "Decorative fish breeding", invest: "₹50,000 – ₹2 Lakhs", profit: "40–70%", link: "ornamental fish farming business" },
        { name: "🌿 Aloe Vera Farming", desc: "Medicinal plant cultivation", invest: "₹60,000 – ₹2 Lakhs", profit: "35–55%", link: "aloe vera farming business" },
        { name: "🌳 Teak Farming", desc: "Long term timber investment", invest: "₹1–5 Lakhs", profit: "High long-term returns", link: "teak farming business plan" },
        { name: "🌾 Fodder Farming", desc: "Green feed supply business", invest: "₹50,000 – ₹2 Lakhs", profit: "25–40%", link: "fodder farming business plan" },
        { name: "🐕 Dog Breeding Business", desc: "Pet breeding & selling", invest: "₹1–5 Lakhs", profit: "40–70%", link: "dog breeding business plan" },
        { name: "🐓 Emu Farming", desc: "Oil, Meat & Egg production", invest: "₹2–6 Lakhs", profit: "30–50%", link: "emu farming business plan" }

    ];

    let html = `<h3>🐓 Animal & Farming Business Ideas</h3>`;

    businesses.forEach(business => {
        html += `
            <div style="background:#f4f4f4;padding:15px;margin-bottom:15px;border-radius:12px;box-shadow:0 0 5px #ccc;">
                <strong>${business.name}</strong><br>
                ${business.desc}<br>
                <strong>Investment:</strong> ${business.invest}<br>
                <strong>Profit:</strong> ${business.profit}<br><br>
                🎥 <a href="https://www.youtube.com/results?search_query=${business.link}" target="_blank">
                Watch Business Videos</a>
            </div>
        `;
    });

    output.innerHTML = html;
}


/* ================= AI ASSISTANT ================= */

/* =========================================
   🧠 SMART AI FARMING ASSISTANT - FULL VERSION
========================================= */

function askAI() {

    document.getElementById("output").innerHTML = `
        <h3>🧠 Smart AI Farming Assistant</h3>

        <textarea id="aiQuestion"
        placeholder="Say Hi or ask about crops, fertilizer, pests, weather..."
        style="width:100%;height:90px;padding:10px;border-radius:8px;"></textarea>

        <br><br>

        <button onclick="getAIResponse()">🤖 Ask AI</button>
        <button onclick="startVoice()">🎤 Voice</button>
        <button onclick="clearAI()">🗑 Clear</button>

        <div id="aiResult" style="margin-top:20px;"></div>
    `;
}

/* ================= GET AI RESPONSE ================= */

function getAIResponse() {

    let question = document.getElementById("aiQuestion").value.toLowerCase().trim();
    let resultBox = document.getElementById("aiResult");

    if (question === "") {
        resultBox.innerHTML = "⚠ Please enter your question first.";
        return;
    }

    // Loading effect
    resultBox.innerHTML = "🤖 AI is thinking...";

    setTimeout(() => {

        let answer = generateSmartAnswer(question);

        resultBox.innerHTML = `
            <div style="background:#e8f5e9;padding:15px;border-radius:10px;font-size:15px;">
                ${answer}
            </div>
        `;

    }, 800);
}

/* ================= SMART LOGIC ENGINE ================= */

function generateSmartAnswer(question) {

    /* ===== GREETINGS ===== */

    if (question.includes("hi") || question.includes("hello") || question.includes("hey"))
        return "👋 Hello Farmer! How can I help you today?";

    if (question.includes("good morning"))
        return "🌅 Good Morning! Ready for a productive farming day?";

    if (question.includes("good evening"))
        return "🌇 Good Evening! How was your farming today?";

    if (question.includes("who are you"))
        return "🤖 I am your Smart AI Farming Assistant. I help with crops, weather, fertilizer, profit & more.";

    /* ===== CROP ADVICE ===== */

    if (question.includes("wheat"))
        return "🌾 Wheat grows best in loamy soil during Rabi season. Irrigate 4–5 times. Use NPK 120:60:40.";

    if (question.includes("rice"))
        return "🌾 Rice needs clay soil and high water supply. Best in Kharif season. Maintain standing water.";

    if (question.includes("cotton"))
        return "🌱 Cotton grows well in black soil. Avoid waterlogging. Use potash fertilizer.";

    if (question.includes("maize"))
        return "🌽 Maize requires well-drained soil. Avoid excess irrigation.";

    /* ===== FERTILIZER ===== */

    if (question.includes("fertilizer"))
        return "🧪 Always perform soil testing before fertilizer use. Organic compost improves soil health.";

    /* ===== PEST CONTROL ===== */

    if (question.includes("pest") || question.includes("aphid") || question.includes("insect"))
        return "🐛 Spray neem oil every 7 days for natural control. For severe attack use recommended pesticide.";

    /* ===== DISEASE ===== */

    if (question.includes("disease") || question.includes("fungus"))
        return "🦠 Remove infected plants immediately. Spray Mancozeb or Carbendazim.";

    /* ===== DAIRY ===== */

    if (question.includes("milk") || question.includes("cow"))
        return "🥛 Provide balanced feed (18% protein), clean water & mineral mixture. Vaccinate regularly.";

    /* ===== WEATHER ===== */

    if (question.includes("weather") || question.includes("rain"))
        return "🌦 Check weather before spraying pesticides. Avoid irrigation during heavy rainfall.";

    /* ===== PROFIT ===== */

    if (question.includes("profit") || question.includes("income"))
        return "💰 Reduce input cost, use drip irrigation & check mandi prices before selling crops.";

    /* ===== GOVERNMENT ===== */

    if (question.includes("government") || question.includes("scheme"))
        return "🏛 Check PM-KISAN, Fasal Bima Yojana & Soil Health Card schemes for financial support.";

    return "🤖 I am still learning. Please ask about crops, fertilizer, pests, dairy, weather or profit.";
}

/* ================= VOICE INPUT ================= */

function startVoice() {

    if (!('webkitSpeechRecognition' in window)) {
        alert("Voice recognition not supported in this browser.");
        return;
    }

    let recognition = new webkitSpeechRecognition();
    recognition.lang = "en-IN";
    recognition.start();

    recognition.onresult = function(event) {
        document.getElementById("aiQuestion").value =
            event.results[0][0].transcript;
    };
}

/* ================= CLEAR FUNCTION ================= */

function clearAI() {
    document.getElementById("aiQuestion").value = "";
    document.getElementById("aiResult").innerHTML = "";
}
// 🌾 Generate Individual Crop Blades
function createCrops() {
    const field = document.getElementById("field");

    for (let i = 0; i < 120; i++) {
        let crop = document.createElement("div");
        crop.className = "crop";

        // Random height
        crop.style.height = (80 + Math.random() * 80) + "px";

        // Random animation delay
        crop.style.animationDelay = (Math.random() * 3) + "s";

        field.appendChild(crop);
    }
}

createCrops();
