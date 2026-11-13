window.COURSE = {
 "short": "SEC",
 "key": "cloudsecurity-explorer-v1",
 "prompt": "$",
 "termTitle": "aws cli",
 "where": "CLI",
 "lab": "python",
 "handsOn": "Security Lab challenge",
 "errRe": "Traceback|AccessDenied|error occurred|Error:|NON_COMPLIANT|WRN leaks|false$",
 "cats": [
  [
   "all",
   "ALL"
  ],
  [
   "core",
   "FOUNDATIONS"
  ],
  [
   "detect",
   "DETECTION"
  ],
  [
   "data",
   "DATA"
  ],
  [
   "net",
   "NETWORK"
  ],
  [
   "gov",
   "GOVERNANCE"
  ],
  [
   "ir",
   "RESPONSE"
  ]
 ],
 "catTitle": {
  "core": "SECURITY FOUNDATIONS",
  "detect": "LOGGING & DETECTION",
  "data": "DATA PROTECTION",
  "net": "NETWORK SECURITY",
  "gov": "GOVERNANCE & COMPLIANCE",
  "ir": "INCIDENT RESPONSE"
 },
 "kinds": {
  "cli": [
   "AWS CLI",
   "#1d5bd8"
  ],
  "py": [
   "PYTHON",
   "#7c3aed"
  ],
  "json": [
   "POLICY / QUERY",
   "#db2777"
  ],
  "err": [
   "FINDING",
   "#e11d48"
  ]
 },
 "layers": [
  "FOUNDATIONS",
  "DETECTION",
  "PROTECTION",
  "SERVICES",
  "RESPONSE",
  "ARCHITECTURE"
 ],
 "levels": [
  [
   0,
   "SECURITY CURIOUS"
  ],
  [
   150,
   "MFA ENFORCER"
  ],
  [
   400,
   "LOG READER"
  ],
  [
   800,
   "THREAT HUNTER"
  ],
  [
   1300,
   "DATA GUARDIAN"
  ],
  [
   2000,
   "INCIDENT RESPONDER"
  ],
  [
   2900,
   "CLOUD SECURITY ARCHITECT"
  ]
 ],
 "defaultCode": "# Security Lab: real Python + realistic security data. Try:\nprint(len(cloudtrail), \"CloudTrail events\")\nprint(cloudtrail[3][\"eventName\"], cloudtrail[3].get(\"errorCode\"))\nprint([b[\"name\"] for b in buckets if b[\"encryption\"] is None])\n"
};
COURSE.errRe = new RegExp(COURSE.errRe, "i");
