// script.js

async function fetchFMR() {
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;
    const zip = document.getElementById('zip').value;

    // Fetch Section 8 Rent from HUD API
    const hudUrl = `https://api.hud.gov/section8/fmr/${state}/${city}/${zip}`;
    const hudResponse = await fetch(hudUrl);
    const hudData = await hudResponse.json();

    const section8Rent = hudData.rent;
    document.getElementById('section8Rent').value = section8Rent;

    // Fetch Property Details from Zillow API
    const zillowUrl = `https://api.zillow.com/v1/GetDeepSearchResults?address=${encodeURIComponent(city)}&citystatezip=${state}&zws-id=YOUR_ZILLOW_API_KEY`;
    const zillowResponse = await fetch(zillowUrl);
    const zillowData = await zillowResponse.json();

    const pricePerSqFt = zillowData.results[0].pricePerSquareFoot;
    document.getElementById('pricePerSqFt').value = pricePerSqFt;
}

function calculate() {
    const numUnits = parseFloat(document.getElementById('numUnits').value);
    const section8Rent = parseFloat(document.getElementById('section8Rent').value);

    const monthlyIncome = section8Rent * numUnits;
    const yearlyIncome = monthlyIncome * 12;
    document.getElementById('monthlyRentalIncome').value = monthlyIncome;

    // Fixed Expenses
    const pmi = parseFloat(document.getElementById('pmi').value);
    const propertyTaxes = parseFloat(document.getElementById('propertyTaxes').value);
    const electricity = parseFloat(document.getElementById('electricity').value);
    const waterSewer = parseFloat(document.getElementById('waterSewer').value);
    const hoa = parseFloat(document.getElementById('hoa').value);
    const insurance = parseFloat(document.getElementById('insurance').value);
    const otherExpenses = parseFloat(document.getElementById('otherExpenses').value);

    const totalFixedExpenses = pmi + propertyTaxes + electricity + waterSewer + hoa + insurance + otherExpenses;

    // Variable Landlord Paid Expenses
    const vacancy = parseFloat(document.getElementById('vacancy').value) / 100;
    const repairsMaintenance = parseFloat(document.getElementById('repairsMaintenance').value) / 100;
    const capEx = parseFloat(document.getElementById('capEx').value) / 100;
    const managementFees = parseFloat(document.getElementById('managementFees').value) / 100;

    const totalVariableExpenses = (monthlyIncome * vacancy) + (monthlyIncome * repairsMaintenance) + (monthlyIncome * capEx) + (monthlyIncome * managementFees);

    // Loan Qualification
    const w2GrossAnnualIncome = parseFloat(document.getElementById('w2GrossAnnualIncome').value);
    const monthlyDebt = parseFloat(document.getElementById('monthlyDebt').value);

    // Loan Details
    const purchasePrice = parseFloat(document.getElementById('purchasePrice').value);
    const downPaymentPercentage = parseFloat(document.getElementById('downPaymentPercentage').value) / 100;
    const loanAmount = purchasePrice * (1 - downPaymentPercentage);
    document.getElementById('loanAmount').value = loanAmount;

    const interestRate = parseFloat(document.getElementById('interestRate').value) / 100;
    const loanTerm = parseFloat(document.getElementById('loanTerm').value);
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
