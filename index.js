document.addEventListener("DOMContentLoaded", function(event) {
  (function() {
    document.getElementById("ajaxButton").addEventListener('click', makeRequest);
  }());

  function makeRequest() {
    // var subjectPin = 1517201005;
    // var comparable1Pin = 1517201041;
    // var comparable2Pin = 1517202011;
    // var comparable3Pin = 1517201043;

    var subjectPin = document.getElementById('subjectPin').value;
    var comparable1Pin = document.getElementById('comparable1Pin').value;
    var comparable2Pin = document.getElementById('comparable2Pin').value;
    var comparable3Pin = document.getElementById('comparable3Pin').value;

    var sqftValueOverride = document.getElementById('sqftValueOverride').value;

    var subjectLastSaleAmount = document.getElementById('subjectlastsaleamount').value;
    var cmp1LastSaleAmount = document.getElementById('cmp1lastsaleamount').value;
    var cmp2LastSaleAmount = document.getElementById('cmp2lastsaleamount').value;
    var cmp3LastSaleAmount = document.getElementById('cmp3lastsaleamount').value;

    var subjectDateOfSale = document.getElementById('subjectdate').value;
    var cmp1DateOfSale = document.getElementById('cmp1date').value;
    var cmp2DateOfSale = document.getElementById('cmp2date').value;
    var cmp3DateOfSale = document.getElementById('cmp3date').value;

    var params = {
      subjectPin: encodeURIComponent(subjectPin),
      comparable1Pin: encodeURIComponent(comparable1Pin),
      comparable2Pin: encodeURIComponent(comparable2Pin),
      comparable3Pin: encodeURIComponent(comparable3Pin),
      sqftValueOverride: encodeURIComponent(sqftValueOverride),
      subjectLastSaleAmount: encodeURIComponent(subjectLastSaleAmount),
      cmp1LastSaleAmount: encodeURIComponent(cmp1LastSaleAmount),
      cmp2LastSaleAmount: encodeURIComponent(cmp2LastSaleAmount),
      cmp3LastSaleAmount: encodeURIComponent(cmp3LastSaleAmount),
      subjectDateOfSale: encodeURIComponent(subjectDateOfSale),
      cmp1DateOfSale: encodeURIComponent(cmp1DateOfSale),
      cmp2DateOfSale: encodeURIComponent(cmp2DateOfSale),
      cmp3DateOfSale: encodeURIComponent(cmp3DateOfSale),
    };

    postJSONData(`https://t2c8h0jsp7.execute-api.us-east-1.amazonaws.com/default/calculate-assessment`, params)
    .then(data => addValuesToTable(data))
    .catch(error => console.error(error));
  };

  function postJSONData(url = ``, data = {}) { 
    return fetch(url, { 
      method: "POST",
      headers: { 
        "Accept": '*/*',
        "Content-Type": "application/json"
      }, 
      body: JSON.stringify(data),
    }) 
    .then(response => response.json()); // parses response to JSON
  };

  function addValuesToTable(response) {
    resetTable();

    for (const key of Object.keys(response.originalValues)) {
      var row = document.getElementById(key);
      if (row != null) {
        for (var i = 0; i < response.originalValues[key].length; i++) {
          var newItem = document.createElement('td');

          //
          var originalValue = response.originalValues[key][i].split('/');
          var numberOfSubValues = originalValue.length;
          var originalValueText = '';
          for (var j = 0; j < numberOfSubValues; j++) {
            if (j > 0) {
              originalValueText += '/' + originalValue[j];
            }
            else {
              originalValueText += originalValue[j];
            }
          }

          if (i > 0 && key in response.adjustedValues && response.adjustedValues[key][i-1] !== undefined) {

            //
            var adjustedValue = response.adjustedValues[key][i-1].toString().split('/');
            var numberOfAdjustedSubValues = adjustedValue.length;
            var adjustedValueText = '';
            var adjustedValueValue = 0;
            for (var j = 0; j < numberOfAdjustedSubValues; j++) {
              adjustedValueValue += parseInt(adjustedValue[j]);
              var text = formatAsUSCurrency(parseInt(adjustedValue[j]));
              if (j > 0) {
                adjustedValueText += ' / ' + text;
              }
              else {
                adjustedValueText += text;
              }
            }

            if (adjustedValueValue === 0) {
              adjustedValueText = 'No Adjustment';
            }

            newItem.innerHTML += '<span class="comparable">' + originalValueText + '</span> <span class="adjustment"><strong>(' + adjustedValueText + ')</strong></span>';
          }
          else {
            newItem.innerHTML += '<span class="comparable">' + originalValueText + '</span>';
          }
          row.appendChild(newItem);
        }
      }
    }

    // Adjusted sale amounts
    var table = document.getElementById('assessments-table');
    var newRow = document.createElement('tr');
    var newHeader = document.createElement('th');
    newHeader.innerHTML = 'Adjusted Sale Amounts';
    newRow.appendChild(newHeader);
    var newTableData = document.createElement('td');
    newTableData.innerHTML = '<span class="adjustment"><strong>' + formatAsUSCurrency(0) + '</strong></span>';
    newRow.appendChild(newTableData);
    for (var i = 0; i < response.adjustedValues['Year Built / Effective Age'].length; i++) {
      var newTableData = document.createElement('td');
      var adjustedSaleAmount = 0;
      for (const key of Object.keys(response.adjustedValues)) {
        //console.log(String(response.adjustedValues[key][i]).split('/'));
        for (var j = 0; j < String(response.adjustedValues[key][i]).split('/').length; j++) {
          //console.log(adjustedSaleAmount + parseInt(String(response.adjustedValues[key][i]).split('/')[j]));
          adjustedSaleAmount = adjustedSaleAmount + parseInt(String(response.adjustedValues[key][i]).split('/')[j]);
        }
      }
      newTableData.innerHTML = '<span class="adjustment"><strong>' + formatAsUSCurrency(adjustedSaleAmount) + '</strong></span>';
      newRow.appendChild(newTableData);
    }
    table.appendChild(newRow);

    // Add sketch images
    for (var i = 0; i < response.originalValues['Sketches'].length; i++) {
      var sketches = document.getElementById('sketches');
      var newItem = document.createElement('img');
      newItem.src = response.originalValues['Sketches'][i];
      newItem.className = 'sketch';
      sketches.appendChild(newItem);
    }
  };

  function formatAsUSCurrency(number) {
    if (number > 0) {
      return '+' + number.toLocaleString('en-US', 
      { 
        style: 'currency', 
        currency: 'USD', 
        minimumFractionDigits: 0,
        maximumFractionDigits: 0 
      });
    }

    return number.toLocaleString('en-US', 
    { 
      style: 'currency', 
      currency: 'USD', 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    });
  }

  function resetTable() {
    document.getElementById('sketches').innerHTML = '';
    document.getElementById('assessments-table').innerHTML = `
      <thead>
        <tr>
          <th></th>
          <th>Subject</th>
          <th>Comp #1</th>
          <th>Comp #2</th>
          <th>Comp #3</th>
        </tr>
      </thead>
      <tbody>
        <tr id='Permanent Index Number'>
          <th>Permanent Index Number</th>
        </tr>
        <tr id='Map'>
          <th>Map</th>
        </tr>
        <tr id='Street Address'>
          <th>Street Address</th>
        </tr>
        <tr id='Neighborhood Number'>
          <th>Neighborhood Number</th>
        </tr>
        <tr id='Neighborhood Name'>
          <th>Neighborhood Name</th>
        </tr>
        <tr id='Distance'>
          <th>Distance</th>
        </tr>
        <tr id='Land Size'>
          <th>Land Size</th>
        </tr>
        <tr id='House Type Code'>
          <th>House Type Code</th>
        </tr>
        <tr id='Structure Type / Stories'>
          <th>Structure Type / Stories</th>
        </tr>
        <tr id='Exterior Cover'>
          <th>Exterior Cover</th>
        </tr>
        <tr id='Quality Grade'>
          <th>Quality Grade</th>
        </tr>
        <tr id='Condition'>
          <th>Condition</th>
        </tr>
        <tr id='Year Built / Effective Age'>
          <th>Year Built / Effective Age</th>
        </tr>
        <tr id='Land Assessed Value'>
          <th>Land Assessed Value</th>
        </tr>
        <tr id='Building Assessed Value'>
          <th>Building Assessed Value</th>
        </tr>
        <tr id='Total Assessed Value'>
          <th>Total Assessed Value</th>
        </tr>
        <tr id='Land Market Value'>
          <th>Land Market Value</th>
        </tr>
        <tr id='Building Market Value'>
          <th>Building Market Value</th>
        </tr>
        <tr id='Total Market Value'>
          <th>Total Market Value</th>
        </tr>
        <tr id='Primary Land Method'>
          <th>Primary Land Method</th>
        </tr>
        <tr id='Land Price Per Land Size of Assessed Value'>
          <th>Land Price Per Land Size of Assessed Value</th>
        </tr>
        <tr id='Building Value per AGLA Assessed Value'>
          <th>Building Value per AGLA Assessed Value</th>
        </tr>
        <tr id='Total Value per AGLA Market Value'>
          <th>Total Value per AGLA Market Value</th>
        </tr>
        <tr id='Last Sale Amount'>
          <th>Last Sale Amount</th>
        </tr>
        <tr id='Date of Sale'>
          <th>Date of Sale</th>
        </tr>
        <tr id='Sales Validation'>
          <th>Sales Validation</th>
        </tr>
        <tr id='Compulsory Sale'>
          <th>Compulsory Sale</th>
        </tr>
        <tr id='Sale Price per AGLA'>
          <th>Sale Price per AGLA</th>
        </tr>
        <tr id='First Floor Area'>
          <th>First Floor Area</th>
        </tr>
        <tr id='Second Floor Area'>
          <th>Second Floor Area</th>
        </tr>
        <tr id='Half Floor Area'>
          <th>Half Floor Area</th>
        </tr>
        <tr id='Attic / Other Floor Area'>
          <th>Attic / Other Floor Area</th>
        </tr>
        <tr id='Total Above Ground Living Area (AGLA)'>
          <th>Total Above Ground Living Area (AGLA)</th>
        </tr>
        <tr id='Basement Area / Finished Area'>
          <th>Basement Area / Finished Area</th>
        </tr>
        <tr id='Lower Level Area / Finished Area'>
          <th>Lower Level Area / Finished Area</th>
        </tr>
        <tr id='Full Baths / Half Baths / Total Fixtures'>
          <th>Full Baths / Half Baths / Total Fixtures</th>
        </tr>
        <tr id='Air Conditioning'>
          <th>Air Conditioning</th>
        </tr>
        <tr id='Fireplaces'>
          <th>Fireplaces</th>
        </tr>
        <tr id='Face Brick'>
          <th>Face Brick</th>
        </tr>
        <tr id='Roof Cover'>
          <th>Roof Cover</th>
        </tr>
        <tr id='Garage Attached / Detached / Carport'>
          <th>Garage Attached / Detached / Carport</th>
        </tr>
        <tr id='Garage Attached / Detached / Carport Area'>
          <th>Garage Attached / Detached / Carport Area</th>
        </tr>
        <tr id='Decks / Patio'>
          <th>Decks / Patio</th>
        </tr>
        <tr id='Decks / Patio Area'>
          <th>Decks / Patio Area</th>
        </tr>
        <tr id='Porches Open / Enclosed'>
          <th>Porches Open / Enclosed</th>
        </tr>
        <tr id='Porches Open / Enclosed Area'>
          <th>Porches Open / Enclosed Area</th>
        </tr>
        <tr id='Pool (Size)'>
          <th>Pool (Size)</th>
        </tr>
        <tr id='Gazebo (Size)'>
          <th>Gazebo (Size)</th>
        </tr>
        <tr id='Shed'>
          <th>Shed</th>
        </tr>
        <tr id='Pole Barn'>
          <th>Pole Barn</th>
        </tr>
      </tbody>
    `;
  }
});