/**
 * Nick Yard Services — unified Google Apps Script backend.
 *
 * Handles all three site forms (contact, estimator, snow removal signup):
 *  - Appends each submission as a row in the bound Google Sheet.
 *  - Emails the business owner whenever a new submission comes in.
 *  - Enforces a hard cap of SNOW_SPOTS_TOTAL snow removal signups. Once that
 *    many "snow_signup" rows exist, further snow signup submissions are
 *    rejected server-side (the cap is NOT just a front-end check).
 *
 * Deployment:
 *  1. Create/open a Google Sheet to store leads.
 *  2. Extensions > Apps Script, paste this file in as Code.gs.
 *  3. Deploy > New deployment > Web app.
 *     - Execute as: Me
 *     - Who has access: Anyone
 *  4. Copy the deployment URL into js/script.js for CONTACT_FORM_ENDPOINT /
 *     SNOW_FORM_ENDPOINT / ESTIMATE_FORM_ENDPOINT (all three can point at the
 *     same deployment).
 */

var CONFIG = {
  EMAIL: 'nicksyardservices9@gmail.com',
  SNOW_SPOTS_TOTAL: 20,
  SHEET_NAME: 'Leads'
};

var HEADERS = [
  'Submitted At',
  'Form Type',
  'Name',
  'Email',
  'Phone',
  'Address',
  'Service',
  'Message',
  'Status',
  'Driveway Tier',
  'Driveway Tier Label',
  'Salt Treatment',
  'Corner Lot',
  'Electronic Signature',
  'Oregon Location Confirmed',
  'Terms Accepted',
  'Seasonal Agreement Acknowledged',
  'Card On File Acknowledged',
  'Square Feet',
  'Terrain',
  'Start Timing',
  'Estimate Range',
  'Estimate Summary',
  'Estimate Notes'
];

function doGet(e) {
  var params = (e && e.parameter) ? e.parameter : {};

  if (params.action === 'snowSpots') {
    var sheet = getSheet_();
    var remaining = CONFIG.SNOW_SPOTS_TOTAL - countActiveSnowSignups_(sheet);
    return jsonResponse({
      total: CONFIG.SNOW_SPOTS_TOTAL,
      remaining: Math.max(0, remaining)
    });
  }

  return jsonResponse({ result: 'error', message: 'Unknown action.' });
}

function doPost(e) {
  try {
    var params = (e && e.parameter) ? e.parameter : {};
    var formType = params.formType || 'contact';
    var isSnowSignup = formType === 'snow_signup';
    var isEstimate = formType === 'estimate';

    validateSubmission_(formType, params);

    var sheet = getSheet_();
    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      ensureHeaders_(sheet);

      if (isSnowSignup) {
        var remainingNow = CONFIG.SNOW_SPOTS_TOTAL - countActiveSnowSignups_(sheet);
        if (remainingNow <= 0) {
          throw new Error('All ' + CONFIG.SNOW_SPOTS_TOTAL + ' snow removal spots for this season are filled.');
        }
      }

      sheet.appendRow(buildRow_(formType, params));
    } finally {
      lock.releaseLock();
    }

    sendOwnerEmail_(formType, params);

    return jsonResponse({ result: 'success' });
  } catch (error) {
    Logger.log('doPost error: ' + error);
    return jsonResponse({ result: 'error', message: error.toString().replace(/^Error:\s*/, '') });
  }
}

function validateSubmission_(formType, params) {
  if (formType === 'snow_signup') {
    if (!params.name || !params.email || !params.phone || !params.address) {
      throw new Error('Name, email, phone, and address are required.');
    }
    if (
      !params.drivewayTier ||
      !params.drivewayTierLabel ||
      !params.signature ||
      params.oregonConfirm !== 'Yes' ||
      params.termsAck !== 'Yes' ||
      params.contractAck !== 'Yes' ||
      params.cardAck !== 'Yes'
    ) {
      throw new Error('The snow signup is missing a required selection or acknowledgment.');
    }
    return;
  }

  if (formType === 'estimate') {
    if (!params.customerName || !params.customerEmail || !params.customerPhone || !params.customerAddress) {
      throw new Error('Name, email, phone, and address are required.');
    }
    return;
  }

  // Default: contact form
  if (!params.name || !params.email || !params.phone || !params.address) {
    throw new Error('Name, email, phone, and address are required.');
  }
}

function buildRow_(formType, params) {
  if (formType === 'estimate') {
    return [
      new Date(),
      formType,
      params.customerName || '',
      params.customerEmail || '',
      params.customerPhone || '',
      params.customerAddress || '',
      'Estimator',
      params.estimateSummary || '',
      'NEW',
      '', '', '', '', '', '', '', '', '',
      params.squareFeet || '',
      params.terrain || '',
      params.startTiming || '',
      params.estimateRange || '',
      params.estimateSummary || '',
      params.estimateNotes || ''
    ];
  }

  return [
    new Date(),
    formType,
    params.name || '',
    params.email || '',
    params.phone || '',
    params.address || '',
    params.service || '',
    params.message || '',
    'NEW',
    params.drivewayTier || '',
    params.drivewayTierLabel || '',
    params.saltTreatment || '',
    params.cornerLot || '',
    params.signature || '',
    params.oregonConfirm || '',
    params.termsAck || '',
    params.contractAck || '',
    params.cardAck || '',
    '', '', '', '', '', ''
  ];
}

function sendOwnerEmail_(formType, params) {
  var subject;
  var rows;

  if (formType === 'snow_signup') {
    subject = 'New Snow Removal Signup';
    rows = [
      ['Form type', 'Snow removal signup'],
      ['Name', params.name],
      ['Email', params.email],
      ['Phone', params.phone],
      ['Address', params.address],
      ['Driveway tier', params.drivewayTierLabel],
      ['Salt & ice treatment', params.saltTreatment],
      ['Corner lot', params.cornerLot],
      ['Electronic signature', params.signature],
      ['Message', params.message]
    ];
  } else if (formType === 'estimate') {
    subject = 'New Estimator Submission';
    rows = [
      ['Form type', 'Online estimate'],
      ['Name', params.customerName],
      ['Email', params.customerEmail],
      ['Phone', params.customerPhone],
      ['Address', params.customerAddress],
      ['Square feet', params.squareFeet],
      ['Terrain', params.terrain],
      ['Start timing', params.startTiming],
      ['Estimate range', params.estimateRange],
      ['Summary', params.estimateSummary],
      ['Notes', params.estimateNotes]
    ];
  } else {
    subject = 'New Submission for Quotes';
    rows = [
      ['Form type', 'Website contact'],
      ['Name', params.name],
      ['Email', params.email],
      ['Phone', params.phone],
      ['Address', params.address],
      ['Service', params.service],
      ['Message', params.message]
    ];
  }

  var html = '<h2>' + escapeHtml(subject) + '</h2><table cellpadding="6" cellspacing="0">';
  rows.forEach(function (item) {
    if (item[1]) {
      html += '<tr><th align="left">' + escapeHtml(item[0]) + '</th><td>' + escapeHtml(item[1]) + '</td></tr>';
    }
  });
  html += '</table>';

  try {
    MailApp.sendEmail({
      to: CONFIG.EMAIL,
      subject: subject,
      htmlBody: html
    });
  } catch (emailError) {
    Logger.log('Email failed: ' + emailError);
  }
}

function countActiveSnowSignups_(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return 0;
  }

  var currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var formTypeCol = currentHeaders.indexOf('Form Type');
  var statusCol = currentHeaders.indexOf('Status');
  if (formTypeCol === -1) {
    return 0;
  }

  var data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  var count = 0;
  data.forEach(function (row) {
    var isSnowSignup = row[formTypeCol] === 'snow_signup';
    var isCancelled = statusCol !== -1 && String(row[statusCol]).toUpperCase() === 'CANCELLED';
    if (isSnowSignup && !isCancelled) {
      count += 1;
    }
  });
  return count;
}

function getSheet_() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) {
    throw new Error('No active spreadsheet is connected to this Apps Script.');
  }
  var sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME) || spreadsheet.getActiveSheet();
  ensureHeaders_(sheet);
  return sheet;
}

function ensureHeaders_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    return;
  }

  var firstCell = sheet.getRange(1, 1).getValue();
  if (typeof firstCell !== 'string' || !/^(submitted at|timestamp|date)$/i.test(firstCell.trim())) {
    return;
  }

  var currentHeaders = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  var changed = false;
  HEADERS.forEach(function (header, index) {
    if (!currentHeaders[index]) {
      currentHeaders[index] = header;
      changed = true;
    }
  });

  if (changed) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([currentHeaders]);
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
