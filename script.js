// script.js

// Function to fetch Fair Market Rent (FMR) and rental prices
async function fetchFMR() {
    const city = document.getElementById('city').value.trim();
    const state = document.getElementById('state').value.trim();
    const zip = document.getElementById('zip').value.trim();

    if (!city || !state || !zip) {
        console.error('City, State, and Zip are required.');
        return;
    }

    // Fetch Section 8 Rent from HUD API
    const hudUrl = `https://api.hud.gov/section8/fmr/${state}/${city}/${zip}`;
    try {
        const hudResponse = await fetch(hudUrl);
        if (!hudResponse.ok) {
            throw new Error(`HUD API response status: ${hudResponse.status}`);
        }
        const hudData = await hudResponse.json();
        const section8Rent = hudData.rent || 0;
        document.getElementById('section8Rent').value = section8Rent;
    } catch (error) {
        console.error('Error fetching Section 8 Rent data:', error);
    }

    // Fetch Rental Price from RentCast API
    const rentCastUrl = `https://api.rentcast.io/v1/rent/${state}/${city}/${zip}?api_key=`;
    try {
        const rentCastResponse = await fetch(rentCastUrl);
        if (!rentCastResponse.ok) {
            throw new Error(`RentCast API response status: ${rentCastResponse.status}`);
        }
        const rentCastData = await rentCastResponse.json();
        const pricePerSqFt = rentCastData.price_per_sqft || 0;
        document.getElementById('pricePerSqFt').value = pricePerSqFt;
    } catch (error) {
        console.error('Error fetching RentCast data:', error);
    }
}

// Function to calculate cash flow
function calculate() {
    const numUnits = parseFloat(document.getElementById('numUnits').value) || 0;
    const section8Rent = parseFloat(document.getElementById('section8Rent').value) || 0;

    const monthlyIncome = section8Rent * numUnits;
    const yearlyIncome = monthlyIncome * 12;
    document.getElementById('monthlyRentalIncome').value = monthlyIncome;

    // Fixed Expenses
    const pmi = parseFloat(document.getElementById('pmi').value) || 0;
    const propertyTaxes = parseFloat(document.getElementById('propertyTaxes').value) || 0;
    const electricity = parseFloat(document.getElementById('electricity').value) || 0;
    const waterSewer = parseFloat(document.getElementById('waterSewer').value) || 0;
    const hoa = parseFloat(document.getElementById('hoa').value) || 0;
    const insurance = parseFloat(document.getElementById('insurance').value) || 0;
    const otherExpenses = parseFloat(document.getElementById('otherExpenses').value) || 0;

    const totalFixedExpenses = pmi + propertyTaxes + electricity + waterSewer + hoa + insurance + otherExpenses;

    // Variable Landlord Paid Expenses
    const vacancy = parseFloat(document.getElementById('vacancy').value) / 100 || 0;
    const repairsMaintenance = parseFloat(document.getElementById('repairsMaintenance').value) / 100 || 0;
    const capEx = parseFloat(document.getElementById('capEx').value) / 100 || 0;
    const managementFees = parseFloat(document.getElementById('managementFees').value) / 100 || 0;

    const totalVariableExpenses = (monthlyIncome * vacancy) + (monthlyIncome * repairsMaintenance) + (monthlyIncome * capEx) + (monthlyIncome * managementFees);

    // Loan Qualification
    const w2GrossAnnualIncome = parseFloat(document.getElementById('w2GrossAnnualIncome').value) || 0;
    const monthlyDebt = parseFloat(document.getElementById('monthlyDebt').value) || 0;

    // Loan Details
    const purchasePrice = parseFloat(document.getElementById('purchasePrice').value) || 0;
    const downPaymentPercentage = parseFloat(document.getElementById('downPaymentPercentage').value) / 100 || 0;
    const loanAmount = purchasePrice * (1 - downPaymentPercentage);
    document.getElementById('loanAmount').value = loanAmount;

    const interestRate = parseFloat(document.getElementById('interestRate').value) / 100 || 0;
    const loanTerm = parseFloat(document.getElementById('loanTerm').value) || 30;
    const interestOnly = document.getElementById('interestOnly').value === 'yes';
    const monthlyInterestRate = interestRate / 12;

    let mortgagePayment;
    if (interestOnly) {
        mortgagePayment = loanAmount * monthlyInterestRate;
    } else {
        const numberOfPayments = loanTerm * 12;
        mortgagePayment = loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
    }

    // Total Expenses
    const totalExpenses = totalFixedExpenses + totalVariableExpenses + mortgagePayment;

    // Cash Flow Calculations
    const netMonthlyCashFlow = monthlyIncome - totalExpenses;
    const netYearlyCashFlow = netMonthlyCashFlow * 12;

    // Results
    document.getElementById('monthlyCashFlowOverall').innerText = `$${netMonthlyCashFlow.toFixed(2)}`;
    document.getElementById('monthlyCashFlowPerPerson').innerText = `$${(netMonthlyCashFlow / numUnits).toFixed(2)}`;
    document.getElementById('cashOnCashReturn').innerText = `${((netYearlyCashFlow / (downPaymentPercentage * purchasePrice)) * 100).toFixed(2)}%`;
    document.getElementById('discountRate').innerText = `${(netMonthlyCashFlow / purchasePrice * 100).toFixed(2)}%`;
    document.getElementById('debtToIncome').innerText = `${((monthlyDebt / (w2GrossAnnualIncome / 12)) * 100).toFixed(2)}%`;
    document.getElementById('onePercentRule').innerText = `$${(purchasePrice * 0.01).toFixed(2)}`;
    document.getElementById('houseHackingSavings').innerText = `$${(netMonthlyCashFlow / numUnits).toFixed(2)}`;
}
