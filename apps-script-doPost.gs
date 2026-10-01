/**
 * DEPRECATED: superseded by apps-script/Code.gs, which is a complete,
 * self-contained web app (doGet + doPost, Sheets logging, owner email
 * notifications, and server-side enforcement of the 20 snow-spot cap).
 * Use apps-script/Code.gs for new deployments; this file is kept only for
 * reference and is not wired up to anything.
 */
function doPost_deprecated(e) {
  try {
    var params = e && e.parameter ? e.parameter : {};
    var isSnowSignup = params.formType === "snow_signup";

    if (!params.name || !params.email || !params.phone || !params.address) {
      throw new Error("Name, email, phone, and address are required.");
    }

    if (isSnowSignup && (
      !params.drivewayTier ||
      !params.drivewayTierLabel ||
      !params.signature ||
      params.oregonConfirm !== "Yes" ||
      params.termsAck !== "Yes" ||
      params.contractAck !== "Yes" ||
      params.cardAck !== "Yes"
    )) {
      throw new Error("The snow signup is missing a required selection or acknowledgment.");
    }

    var headers = [
      "Submitted At",
      "Name",
      "Email",
      "Address",
      "Phone",
      "Service",
      "Message",
      "Status",
      "Jobber Client ID",
      "Jobber Request ID",
      "Jobber Job ID",
      "Jobber Notes",
      "Form Type",
      "Driveway Tier",
      "Driveway Tier Label",
      "Electronic Signature",
      "Oregon Location Confirmed",
      "Terms Accepted",
      "Seasonal Agreement Acknowledged",
      "Card on File Acknowledged"
    ];

    var row = [
      new Date(),
      params.name || "",
      params.email || "",
      params.address || "",
      params.phone || "",
      params.service || "",
      params.message || "",
      "NEW",
      "",
      "",
      "",
      "",
      params.formType || "contact",
      params.drivewayTier || "",
      params.drivewayTierLabel || "",
      params.signature || "",
      params.oregonConfirm || "",
      params.termsAck || "",
      params.contractAck || "",
      params.cardAck || ""
    ];

    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (!spreadsheet) {
      throw new Error("No active spreadsheet is connected to this Apps Script.");
    }

    var sheet = spreadsheet.getActiveSheet();
    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      ensureLeadHeaders_(sheet, headers);
      sheet.appendRow(row);
    } finally {
      lock.releaseLock();
    }

    var emailRows = [
      ["Form type", isSnowSignup ? "Snow removal signup" : "Website contact"],
      ["Name", params.name],
      ["Email", params.email],
      ["Phone", params.phone],
      ["Address", params.address],
      ["Service", params.service],
      ["Driveway tier", params.drivewayTierLabel],
      ["Electronic signature", params.signature],
      ["Oregon location confirmed", params.oregonConfirm],
      ["Terms accepted", params.termsAck],
      ["Seasonal agreement acknowledged", params.contractAck],
      ["Card on file acknowledged", params.cardAck],
      ["Message", params.message]
    ];
    var emailHtml = "<h2>New " + (isSnowSignup ? "Snow Removal Signup" : "Quote Request") + "</h2>";
    emailHtml += "<table cellpadding=\"6\" cellspacing=\"0\">";
    emailRows.forEach(function(item) {
      if (item[1]) {
        emailHtml += "<tr><th align=\"left\">" + escapeHtml(item[0]) +
          "</th><td>" + escapeHtml(item[1]) + "</td></tr>";
      }
    });
    emailHtml += "</table>";

    try {
      MailApp.sendEmail({
        to: CONFIG.EMAIL,
        subject: isSnowSignup ? "New Snow Removal Signup" : "New Submission for Quotes",
        htmlBody: emailHtml
      });
    } catch (emailError) {
      Logger.log("Email failed: " + emailError);
    }

    return jsonResponse({ result: "success" });
  } catch (error) {
    Logger.log("doPost error: " + error);
    return jsonResponse({ result: "error", message: error.toString() });
  }
}

function ensureLeadHeaders_(sheet, headers) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    return;
  }

  var firstCell = sheet.getRange(1, 1).getValue();
  if (typeof firstCell !== "string" || !/^(submitted at|timestamp|date)$/i.test(firstCell.trim())) {
    return;
  }

  var currentHeaders = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  var changed = false;
  headers.forEach(function(header, index) {
    if (!currentHeaders[index]) {
      currentHeaders[index] = header;
      changed = true;
    }
  });

  if (changed) {
    sheet.getRange(1, 1, 1, headers.length).setValues([currentHeaders]);
  }
}