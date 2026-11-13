window.LESSONS = window.LESSONS || [];
window.R = String.raw;

/* ============ 01 SHARED RESPONSIBILITY ============ */
LESSONS.push({
  id: 'shared-responsibility', num: 1, cat: 'core', layer: 1, mins: 12,
  title: 'Cloud Security Foundations', short: 'Shared responsibility, CIA, defense in depth',
  overview: `<p>Cloud security starts with one question: <b>who is responsible for what?</b> AWS secures the cloud itself (data centers, hardware, hypervisors). <b>You</b> secure what you put in it: identities, data, network rules, OS patches, configurations. Most cloud breaches happen on the customer side, through misconfigurations and stolen credentials, not by breaking AWS.</p>`,
  hook: `<b>AWS secures the cloud. You secure what's IN the cloud.</b>`,
  why: `Every Cloud Security interview, the CCP exam and the Security Specialty exam open with the shared responsibility model. Everything else in this course is about doing your half well.`,
  scene: { type: 'graph', nodes: [
    { id: 'aws', x: 170, y: 380, icon: 'server', label: 'AWS', sub: 'security OF the cloud' },
    { id: 'you', x: 170, y: 110, icon: 'user', label: 'You', sub: 'security IN the cloud' },
    { id: 'iam', x: 450, y: 70, icon: 'key', label: 'Identity', sub: 'IAM · MFA', at: 1 },
    { id: 'data', x: 450, y: 200, icon: 'lock', label: 'Data', sub: 'encryption · backups', at: 1 },
    { id: 'net', x: 450, y: 330, icon: 'firewall', label: 'Network', sub: 'SGs · NACLs', at: 2 },
    { id: 'det', x: 730, y: 140, icon: 'eye', label: 'Detection', sub: 'CloudTrail · GuardDuty', at: 3 },
    { id: 'ir', x: 730, y: 330, icon: 'bell', label: 'Response', sub: 'contain · recover', at: 3 }
  ], edges: [{ a: 'you', b: 'iam' }, { a: 'you', b: 'data' }, { a: 'you', b: 'net' }, { a: 'aws', b: 'net' }, { a: 'iam', b: 'det' }, { a: 'data', b: 'det' }, { a: 'det', b: 'ir' }, { a: 'net', b: 'ir' }] },
  steps: [
    { t: 'Shared responsibility', sub: 'Draw the line',
      body: `<p><b>AWS</b>: physical security, hardware, global network, hypervisor, and the software of managed services. <b>You</b>: IAM users and roles, MFA, data classification and encryption choices, security groups, guest OS patching on EC2, application code, and every configuration setting.</p><p>The line moves with the service: on <b>EC2</b> you patch the OS; on <b>Lambda/DynamoDB/S3</b> AWS does, but bucket policies and IAM are still yours.</p>`,
      analogy: `Renting an apartment: the landlord fixes the <b>building and locks on the main door</b>; you lock <b>your own door</b> and don't hand out keys.`,
      hook: `<b>OF the cloud = AWS. IN the cloud = you. More managed = less for you, never zero.</b>`,
      words: ['shared responsibility', 'security OF the cloud', 'security IN the cloud', 'managed services', 'guest OS'],
      flow: { from: 'you', to: 'aws', label: 'THE LINE', detail: ['EC2: you patch the OS', 'Lambda: AWS patches, you own IAM + code'], color: 'blue' }, focus: ['you', 'aws'],
      cmds: [{ c: 'aws artifact list-reports --query "reports[?contains(name, \'SOC 2\')].name" --output text', o: 'SOC 2 Type II Report\tSOC 2 Bridge Letter', k: 'cli' }] },
    { t: 'The CIA triad', sub: 'What we protect',
      body: `<p><b>Confidentiality</b>: only the right people see data (IAM, encryption, private networks). <b>Integrity</b>: data isn't tampered with (versioning, Object Lock, log file validation, signing). <b>Availability</b>: systems stay up (multi-AZ, backups, Shield, rate limits).</p><p>Every control you add protects at least one of these.</p>`,
      analogy: `A <b>bank vault</b>: only staff open it (C), nobody swaps the gold for fakes (I), and it opens during business hours (A).`,
      hook: `<b>C = who can see, I = who can change, A = can we reach it.</b>`,
      words: ['confidentiality', 'integrity', 'availability', 'CIA triad'],
      flow: { from: 'you', to: 'data', label: 'PROTECT', detail: ['C: KMS · I: versioning · A: backups'], color: 'purple' }, focus: ['you', 'iam', 'data'],
      cmds: [{ c: 'aws s3api get-bucket-versioning --bucket raul-reports', o: '{\n    "Status": "Enabled"\n}', k: 'cli' }] },
    { t: 'Defense in depth', sub: 'Layers, not a single wall',
      body: `<p>No single control is perfect, so stack them: <b>identity</b> (least privilege, MFA) → <b>network</b> (private subnets, security groups) → <b>compute</b> (patching, no SSH keys) → <b>data</b> (encryption, backups) → <b>detection</b> (CloudTrail, GuardDuty) → <b>response</b> (playbooks, automation). An attacker must beat every layer; you only need one to stop them.</p>`,
      analogy: `A castle: <b>moat, wall, gate, guards, locked keep</b>. Losing one layer isn't losing the castle.`,
      hook: `<b>Identity, Network, Compute, Data, Detect, Respond: "I Never Carry Dangerous Devices Recklessly."</b>`,
      words: ['defense in depth', 'layers', 'least privilege', 'blast radius'],
      flow: { from: 'iam', to: 'net', label: 'LAYERS', detail: ['identity → network → data → detection'], color: 'amber' }, focus: ['iam', 'data', 'net'],
      cmds: [{ c: 'aws ec2 describe-security-groups --group-ids sg-0web --query "SecurityGroups[0].IpPermissions[].[FromPort,IpRanges[0].CidrIp]" --output text', o: '443\t0.0.0.0/0', k: 'cli' }] },
    { t: 'Know what happened', sub: 'Logging & detection',
      body: `<p>You can't defend what you can't see. <b>CloudTrail</b> records API calls (who did what, from where), <b>VPC Flow Logs</b> record network traffic, <b>GuardDuty</b> detects threats from those logs, <b>Security Hub</b> aggregates findings, and <b>AWS Config</b> records configuration history. Lessons 3, 4, 8 and 9 go deep.</p>`,
      analogy: `<b>CCTV, door logs and an alarm company</b> for your account.`,
      hook: `<b>Log everything, alert on what matters.</b>`,
      words: ['CloudTrail', 'VPC Flow Logs', 'GuardDuty', 'Security Hub', 'AWS Config'],
      flow: { from: 'det', to: 'ir', label: 'ALERT', detail: ['GuardDuty: TorIPCaller (ci-legacy)'], color: 'red' }, focus: ['det'],
      cmds: [{ c: 'aws guardduty list-detectors', o: '{\n    "DetectorIds": [\n        "12abc34d567e8fa901bc2d34e56789f0"\n    ]\n}', k: 'cli' }] },
    { t: 'Assume breach', sub: 'Plan the response',
      body: `<p>Security pros plan for <b>when</b>, not if. Have playbooks for common incidents (leaked access key, public bucket, crypto-mining instance), practise them, and automate the first steps. The NIST cycle: <b>Prepare → Detect & Analyze → Contain, Eradicate & Recover → Post-incident lessons</b> (lessons 10–11).</p><p>Your lab for this course is real Python against realistic security data. Open the <b>Security Lab</b> tab.</p>`,
      analogy: `A <b>fire drill</b>: you practise the exit before there's smoke.`,
      hook: `<b>Prepare, Detect, Contain, Learn.</b>`,
      words: ['assume breach', 'incident response', 'playbook', 'NIST 800-61'],
      flow: { from: 'ir', to: 'you', label: 'LEARN', detail: ['post-incident review → new guardrail'], color: 'green' }, focus: ['ir', 'you'],
      cmds: [{ c: 'print(len(cloudtrail), "CloudTrail events loaded")\nprint([f["Type"] for f in guardduty_findings][:2])', o: '14 CloudTrail events loaded\n[\'UnauthorizedAccess:IAMUser/TorIPCaller\', \'CryptoCurrency:EC2/BitcoinTool.B!DNS\']', k: 'py', f: 'lab.py' }],
      cloud: `<b>CCP tie-in</b>: "Shared responsibility model", "AWS Artifact for compliance reports", "GuardDuty = threat detection".` }
  ],
  summary: { title: 'You know the rules of the game', sub: 'Shared responsibility · CIA · defense in depth · assume breach', text: `<p>AWS secures the cloud; you secure what's in it (identities, data, network rules, OS patches, configuration). Protect confidentiality, integrity and availability with layered controls, log and detect everything, and prepare to respond.</p>` },
  quiz: [
    { q: 'Who patches the guest OS on EC2?', a: ['AWS', 'You', 'Nobody', 'Your ISP'], c: 1, why: 'EC2 is IaaS; the OS is yours.' },
    { q: 'Who patches the DynamoDB servers?', a: ['You', 'AWS', 'Both equally', 'The app'], c: 1, why: 'Managed service; you still own IAM and data settings.' },
    { q: 'S3 versioning mainly protects…', a: ['Confidentiality', 'Integrity / recoverability', 'Latency', 'Cost'], c: 1, why: 'Old versions survive changes and deletes.' },
    { q: 'Defense in depth means…', a: ['One strong firewall', 'Multiple independent layers of controls', 'Only encryption', 'Only MFA'], c: 1, why: 'Layers fail independently.' }
  ],
  challenge: { task: 'Write owner(item) returning "AWS" or "You" for each responsibility in the starter list. Run it to see your answers; the checker compares all 8.',
    hint: R`def owner(item):
    aws = {"physical datacenter security", "hypervisor patching", "DynamoDB server patching", "edge locations hardware"}
    return "AWS" if item in aws else "You"

items = ["physical datacenter security", "IAM users and MFA", "hypervisor patching", "S3 bucket policies",
         "EC2 guest OS patching", "DynamoDB server patching", "data encryption choices", "edge locations hardware"]
for i in items:
    print(f"{owner(i):4} {i}")
`,
    starter: R`def owner(item):
    # return "AWS" or "You"
    return "AWS"

items = ["physical datacenter security", "IAM users and MFA", "hypervisor patching", "S3 bucket policies",
         "EC2 guest OS patching", "DynamoDB server patching", "data encryption choices", "edge locations hardware"]
for i in items:
    print(f"{owner(i):4} {i}")
`,
    check: '_t(lambda: [owner(i) for i in ["physical datacenter security","IAM users and MFA","hypervisor patching","S3 bucket policies","EC2 guest OS patching","DynamoDB server patching","data encryption choices","edge locations hardware"]] == ["AWS","You","AWS","You","You","AWS","You","AWS"])' },
  next: `Your half of the model starts with the most powerful identity in the account: <b>root</b>. Next: account hygiene and auditing users with the IAM credential report.`,
  cheat: [['OF the cloud', 'AWS'], ['IN the cloud', 'you'], ['C · I · A', 'what we protect'], ['defense in depth', 'stack layers'], ['aws artifact', 'compliance reports'], ['Prepare → Detect → Contain → Learn', 'IR cycle']]
});

/* ============ 02 ACCOUNT HYGIENE ============ */
LESSONS.push({
  id: 'account-hygiene', num: 2, cat: 'core', layer: 1, mins: 14,
  title: 'Root & Account Hygiene', short: 'Root lock-down, MFA, credential report, stale keys',
  overview: `<p>The first hour of any AWS account: lock away <b>root</b>, enforce <b>MFA</b>, remove long-lived <b>access keys</b>, and audit users regularly with the <b>IAM credential report</b>, a CSV of every user's password, MFA and key status. Attackers love forgotten users and old keys.</p>`,
  hook: `<b>"Root sleeps, MFA everywhere, keys expire."</b>`,
  why: `Leaked or stale access keys are among the most common initial access paths in AWS breaches. Auditing the credential report is a daily task for security engineers, and an easy, impressive script for your portfolio.`,
  scene: { type: 'graph', nodes: [
    { id: 'root', x: 120, y: 240, icon: 'root', label: 'Root user', sub: 'MFA · no keys · unused' },
    { id: 'users', x: 360, y: 110, icon: 'users', label: 'IAM users', sub: 'or Identity Center', at: 1 },
    { id: 'mfa', x: 360, y: 380, icon: 'lock', label: 'MFA', sub: 'every human' },
    { id: 'rep', x: 620, y: 240, icon: 'file', label: 'Credential report', sub: 'CSV of all users', at: 2 },
    { id: 'py', x: 860, y: 240, icon: 'script', label: 'Your audit script', sub: 'no MFA · stale keys', at: 3 }
  ], edges: [{ a: 'root', b: 'users' }, { a: 'root', b: 'mfa' }, { a: 'users', b: 'rep' }, { a: 'mfa', b: 'rep' }, { a: 'rep', b: 'py' }] },
  steps: [
    { t: 'Lock away root', sub: 'Use it almost never',
      body: `<p>Root can do <b>everything</b>, including closing the account, and IAM policies can't restrict it (SCPs can, in member accounts). So: strong unique password, <b>hardware or app MFA</b>, <b>no access keys</b>, an alias email monitored by more than one person, and use it only for the handful of root-only tasks (changing support plan, closing the account).</p>`,
      analogy: `Root is the <b>master key to the whole building</b>: keep it in a safe, not on your keychain.`,
      hook: `<b>Root: MFA on, keys off, used never.</b>`,
      words: ['root user', 'root MFA', 'no root access keys', 'root-only tasks'],
      flow: { from: 'root', to: 'mfa', label: 'LOCK', detail: ['MFA enabled · 0 access keys'], color: 'blue' }, focus: ['root'],
      cmds: [{ c: 'aws iam get-account-summary --query "SummaryMap.[AccountMFAEnabled,AccountAccessKeysPresent]" --output text', o: '1\t0', k: 'cli' }] },
    { t: 'People: Identity Center + MFA', sub: 'Avoid long-lived IAM users',
      body: `<p>Humans should sign in through <b>IAM Identity Center</b> (SSO) with MFA and get <b>temporary</b> credentials. If you must have IAM users, require MFA with a policy condition (<code>aws:MultiFactorAuthPresent</code>) and give them no access keys unless truly needed.</p>`,
      analogy: `Day passes from the front desk instead of <b>permanent keys cut for everyone</b>.`,
      hook: `<b>Humans: SSO + MFA. Machines: roles.</b>`,
      words: ['IAM Identity Center', 'temporary credentials', 'aws:MultiFactorAuthPresent', 'IAM users'],
      flow: { from: 'users', to: 'mfa', label: 'REQUIRE', detail: ['Deny all unless aws:MultiFactorAuthPresent'], color: 'purple' }, focus: ['users', 'mfa'],
      cmds: [{ c: 'aws iam list-virtual-mfa-devices --assignment-status Unassigned --query "length(VirtualMFADevices)"', o: '0', k: 'cli' }],
      cloud: `<b>Link</b>: IAM Explorer lesson 11 covers Identity Center in depth.` },
    { t: 'Machines: roles, not keys', sub: 'Kill long-lived access keys',
      body: `<p>An access key (<code>AKIA…</code>) works from anywhere until someone revokes it. Workloads should use <b>roles</b>: EC2 instance profiles, Lambda execution roles, OIDC for GitHub Actions. For any key that must exist: rotate within <b>90 days</b>, alert on unused keys, and never commit them.</p>`,
      analogy: `A key that never expires is a <b>key someone will eventually copy</b>.`,
      hook: `<b>AKIA = long-lived = liability. ASIA = temporary = good.</b>`,
      words: ['access keys', 'AKIA vs ASIA', 'key rotation', 'instance profile', 'OIDC'],
      flow: { from: 'users', to: 'rep', label: 'AUDIT', detail: ['ci-legacy key last rotated 2025-02-01'], color: 'amber' }, focus: ['users', 'rep'],
      cmds: [{ c: 'aws iam list-access-keys --user-name ci-legacy --query "AccessKeyMetadata[].[AccessKeyId,Status,CreateDate]" --output text', o: 'AKIAEXAMPLELEGACY01\tActive\t2025-02-01T08:11:00Z', k: 'cli' }] },
    { t: 'The credential report', sub: 'One CSV, every user',
      body: `<p><code>aws iam generate-credential-report</code> then <code>get-credential-report</code> returns a CSV: <code>password_enabled</code>, <code>mfa_active</code>, <code>access_key_1_active</code>, <code>access_key_1_last_rotated</code>, last-used dates… In the lab it's loaded as the string <code>credential_report</code>.</p><p>Python's <code>csv.DictReader</code> turns it into a list of dictionaries in one line.</p>`,
      analogy: `The <b>staff register</b>: who has a badge, who has the alarm code, who hasn't shown up in a year.`,
      hook: `<b>generate → get → DictReader → filter.</b>`,
      words: ['credential report', 'generate-credential-report', 'csv.DictReader', 'mfa_active', 'last_rotated'],
      flow: { from: 'rep', to: 'py', label: 'PARSE', detail: ['csv.DictReader(io.StringIO(report))'], color: 'teal' }, focus: ['rep', 'py'],
      cmds: [{ c: 'import csv, io\nrows = list(csv.DictReader(io.StringIO(credential_report)))\nprint(rows[2]["user"], rows[2]["mfa_active"])', o: 'dev-maria false', k: 'py', f: 'lab.py' }] },
    { t: 'Automate the audit', sub: 'No MFA + stale keys',
      body: `<p>Two findings every security team tracks: <b>console users without MFA</b> (<code>password_enabled == "true"</code> and <code>mfa_active == "false"</code>) and <b>active keys older than 90 days</b>. Dates arrive as strings like <code>2025-02-01</code>; <code>datetime.date.fromisoformat()</code> converts them, and subtracting dates gives a <code>timedelta</code> with <code>.days</code>. Skip <code>&lt;root_account&gt;</code> and <code>N/A</code>.</p>`,
      analogy: `A <b>monthly walk-through</b> with a checklist, done by a robot in 0.1 seconds.`,
      hook: `<b>(TODAY - rotated).days > 90 → rotate or delete.</b>`,
      words: ['date.fromisoformat', 'timedelta', '90-day rotation', 'AWS Config iam-user-mfa-enabled'],
      flow: { from: 'py', to: 'users', label: 'FINDINGS', detail: ['no MFA: dev-maria, ops-jun', 'stale key: ci-legacy'], color: 'red' }, focus: ['py', 'users'],
      cmds: [{ c: 'import datetime\nprint((TODAY - datetime.date.fromisoformat("2025-02-01")).days)', o: '650', k: 'py', f: 'lab.py' }] }
  ],
  summary: { title: 'Your account basics are locked down', sub: 'Root · MFA · roles · credential report', text: `<p>Lock away root (MFA, no keys), give humans SSO + MFA, give machines roles instead of access keys, and audit the credential report regularly for console users without MFA and active keys older than 90 days.</p>` },
  quiz: [
    { q: 'Root access keys should be…', a: ['Rotated monthly', 'Deleted / never created', 'Shared with admins', 'Stored in Git'], c: 1, why: 'Root should have no keys.' },
    { q: 'Access keys starting with ASIA are…', a: ['Long-lived', 'Temporary (STS)', 'Root keys', 'Invalid'], c: 1, why: 'AKIA = long-lived, ASIA = temporary.' },
    { q: 'Best credential source for a Lambda function:', a: ['IAM user keys in env vars', 'Its execution role', 'Root keys', 'A hard-coded key'], c: 1, why: 'Roles give rotating temporary credentials.' },
    { q: 'The credential report is a…', a: ['PDF', 'CSV of all IAM users and credential status', 'CloudTrail log', 'Config rule'], c: 1, why: 'Parse it with csv.DictReader.' }
  ],
  challenge: { task: 'Write no_mfa(report) → sorted list of users with password_enabled "true" and mfa_active "false", and stale_keys(report, days=90) → sorted list of users whose access_key_1 is active and was last rotated more than 90 days before TODAY.',
    hint: R`import csv, io, datetime

def _rows(report):
    return [r for r in csv.DictReader(io.StringIO(report)) if r["user"] != "<root_account>"]

def no_mfa(report):
    return sorted(r["user"] for r in _rows(report) if r["password_enabled"] == "true" and r["mfa_active"] == "false")

def stale_keys(report, days=90):
    out = []
    for r in _rows(report):
        if r["access_key_1_active"] == "true" and r["access_key_1_last_rotated"] != "N/A":
            age = (TODAY - datetime.date.fromisoformat(r["access_key_1_last_rotated"][:10])).days
            if age > days:
                out.append(r["user"])
    return sorted(out)

print("No MFA:", no_mfa(credential_report))
print("Stale keys:", stale_keys(credential_report))
`,
    starter: R`import csv, io, datetime

def no_mfa(report):
    rows = list(csv.DictReader(io.StringIO(report)))
    return []

def stale_keys(report, days=90):
    return []

print("No MFA:", no_mfa(credential_report))
print("Stale keys:", stale_keys(credential_report))
`,
    check: '_t(lambda: no_mfa(credential_report) == ["dev-maria", "ops-jun"] and stale_keys(credential_report) == ["ci-legacy"] and stale_keys(credential_report, days=30) == ["ci-legacy", "dev-maria"])' },
  next: `You've hardened identities. Now learn to read the account's flight recorder: <b>CloudTrail</b>, and every field in an event.`,
  cheat: [['aws iam get-account-summary', 'root MFA / keys'], ['aws iam generate-credential-report', 'start report'], ['csv.DictReader(io.StringIO(s))', 'parse CSV'], ['date.fromisoformat("2025-02-01")', 'parse date'], ['(TODAY - d).days', 'age in days'], ['AKIA vs ASIA', 'long-lived vs temporary']]
});

/* ============ 03 CLOUDTRAIL ============ */
LESSONS.push({
  id: 'cloudtrail', num: 3, cat: 'detect', layer: 2, mins: 14,
  title: 'CloudTrail: The Flight Recorder', short: 'Who did what, when, from where',
  overview: `<p><b>AWS CloudTrail</b> records every API call in your account: console clicks, CLI commands, SDK calls, even AWS services acting for you. Each event says <b>who</b> (userIdentity), <b>what</b> (eventName, eventSource), <b>when</b> (eventTime), <b>where from</b> (sourceIPAddress, awsRegion) and <b>whether it worked</b> (errorCode).</p>`,
  hook: `<b>Who · What · When · Where · Worked?</b> The five Ws of every event.`,
  why: `Every investigation (leaked key, mystery deletion, surprise bill) starts in CloudTrail. Reading and filtering events fast is a core Cloud Security skill and a staple of the Security Specialty exam.`,
  scene: { type: 'graph', nodes: [
    { id: 'caller', x: 110, y: 240, icon: 'user', label: 'Caller', sub: 'console · CLI · SDK' },
    { id: 'api', x: 340, y: 240, icon: 'api', label: 'AWS API', sub: 's3:GetObject…' },
    { id: 'ct', x: 570, y: 240, icon: 'log', label: 'CloudTrail', sub: 'event record' },
    { id: 's3', x: 800, y: 110, icon: 'bucket', label: 'S3 log bucket', sub: 'org trail · 1y+', at: 2 },
    { id: 'lake', x: 800, y: 380, icon: 'search', label: 'Lake / Athena', sub: 'SQL queries', at: 3 },
    { id: 'py', x: 570, y: 420, icon: 'script', label: 'Your Python', sub: 'filter & count', at: 1 }
  ], edges: [{ a: 'caller', b: 'api' }, { a: 'api', b: 'ct' }, { a: 'ct', b: 's3' }, { a: 's3', b: 'lake' }, { a: 'ct', b: 'py' }] },
  steps: [
    { t: 'What gets recorded', sub: 'Management vs data events',
      body: `<p><b>Management events</b> (create/modify/delete resources, logins, IAM changes) are recorded by default and kept 90 days in <b>Event history</b>. <b>Data events</b> (S3 object reads/writes, Lambda invokes, DynamoDB items) are high volume, off by default, and must be enabled on a trail. <b>Insights</b> flag unusual API rates.</p>`,
      analogy: `Management events are the <b>building's door log</b>; data events are a <b>camera on every filing cabinet</b>.`,
      hook: `<b>Management = default. Data = opt-in. 90 days = event history only.</b>`,
      words: ['management events', 'data events', 'event history', 'CloudTrail Insights'],
      flow: { from: 'api', to: 'ct', label: 'RECORD', detail: ['eventName: GetObject (data event)'], color: 'blue' }, focus: ['caller', 'api', 'ct'],
      cmds: [{ c: 'aws cloudtrail lookup-events --lookup-attributes AttributeKey=EventName,AttributeValue=ConsoleLogin --max-results 1 --query "Events[0].[EventTime,Username]" --output text', o: '2026-11-12T01:02:11Z\traul', k: 'cli' }] },
    { t: 'Anatomy of an event', sub: 'The fields that matter',
      body: `<p><code>eventName</code> + <code>eventSource</code> (the action), <code>userIdentity.type</code> (Root, IAMUser, AssumedRole), <code>userIdentity.arn</code>, <code>sourceIPAddress</code>, <code>awsRegion</code>, <code>requestParameters</code> (what was asked), <code>responseElements</code> (what came back), and <code>errorCode</code> such as <b>AccessDenied</b> when it failed.</p>`,
      analogy: `A <b>receipt</b>: store, item, time, card used, and "DECLINED" if it didn't go through.`,
      hook: `<b>errorCode present = it failed. AccessDenied = someone tried.</b>`,
      words: ['eventName', 'eventSource', 'userIdentity', 'sourceIPAddress', 'errorCode', 'requestParameters'],
      flow: { from: 'ct', to: 'py', label: 'EVENT', detail: ['{"eventName": "ListUsers", "errorCode": "AccessDenied", …}'], color: 'purple' }, focus: ['ct', 'py'],
      cmds: [{ c: 'e = cloudtrail[4]\nprint(e["eventName"], e["userIdentity"]["userName"], e["sourceIPAddress"], e.get("errorCode"))', o: 'ListUsers ci-legacy 185.220.101.7 AccessDenied', k: 'py', f: 'lab.py' }] },
    { t: 'A trail you can trust', sub: 'Org trail, S3, validation',
      body: `<p>Create an <b>organization trail</b> (all accounts, all regions) delivering to a <b>dedicated log-archive account</b>'s S3 bucket, with <b>log file validation</b> (detects tampering), SSE-KMS encryption, and a bucket policy only CloudTrail can write to. Attackers' first move is often <code>StopLogging</code>, so alert on it (next lesson).</p>`,
      analogy: `CCTV footage stored <b>off-site in a locked room</b>, so a burglar can't just delete the tape.`,
      hook: `<b>All regions, all accounts, separate account, validated.</b>`,
      words: ['organization trail', 'log archive account', 'log file validation', 'multi-region trail'],
      flow: { from: 'ct', to: 's3', label: 'DELIVER', detail: ['s3://org-cloudtrail-logs/AWSLogs/111122223333/…'], color: 'green' }, focus: ['ct', 's3'],
      cmds: [{ c: 'aws cloudtrail validate-logs --trail-arn arn:aws:cloudtrail:ap-southeast-1:111122223333:trail/org-trail --start-time 2026-11-12T00:00:00Z', o: 'Validating log files for trail arn:aws:cloudtrail:…:trail/org-trail between 2026-11-12T00:00:00Z and 2026-11-13T00:00:00Z\n\nResults found for 2026-11-12T00:00:00Z to 2026-11-13T00:00:00Z:\n24/24 digest files valid\n312/312 log files valid', k: 'cli' }] },
    { t: 'Query at scale', sub: 'Athena & CloudTrail Lake',
      body: `<p>For millions of events, query with SQL: <b>Athena</b> over the S3 logs, or <b>CloudTrail Lake</b> (managed event data store). Example: all AccessDenied calls grouped by user in the last day. For quick work, Python over the JSON is perfect, which is what the lab does.</p>`,
      analogy: `Searching footage with a <b>search box</b> instead of fast-forwarding tapes.`,
      hook: `<b>SQL for scale, Python for speed.</b>`,
      words: ['Athena', 'CloudTrail Lake', 'event data store', 'SQL over logs'],
      flow: { from: 's3', to: 'lake', label: 'QUERY', detail: ['SELECT useridentity.username, count(*) … errorcode = \'AccessDenied\''], color: 'amber' }, focus: ['s3', 'lake'],
      cmds: [{ c: "SELECT userIdentity.userName, count(*) AS denied\nFROM cloudtrail_events\nWHERE errorCode = 'AccessDenied' AND eventTime > now() - interval '1' day\nGROUP BY 1 ORDER BY 2 DESC;", f: 'athena.sql', o: 'ci-legacy   3\ndev-maria   1', k: 'json' }] },
    { t: 'Count failures by user', sub: 'Your first detection',
      body: `<p>A burst of <b>AccessDenied</b> errors from one identity is a classic sign of a stolen key being tested ("what can I do with this?"). Loop over <code>cloudtrail</code>, keep events with an <code>errorCode</code> of <code>AccessDenied</code>, and count by <code>userIdentity.userName</code>. <code>collections.Counter</code> or a plain dict both work.</p>`,
      analogy: `Someone trying <b>every door handle in the hallway</b> is suspicious even if every door was locked.`,
      hook: `<b>Many denials, one identity → investigate.</b>`,
      words: ['AccessDenied', 'Counter', 'reconnaissance', 'enumeration'],
      flow: { from: 'py', to: 'caller', label: 'DETECT', detail: ['ci-legacy: 3 denied calls from 185.220.101.7'], color: 'red' }, focus: ['py', 'caller'],
      cmds: [{ c: 'from collections import Counter\nprint(Counter(e["eventName"] for e in cloudtrail).most_common(2))', o: "[('ConsoleLogin', 2), ('GetObject', 2)]", k: 'py', f: 'lab.py' }] }
  ],
  summary: { title: 'You can read the flight recorder', sub: 'Events · fields · trails · queries', text: `<p>CloudTrail records management events by default (data events are opt-in). Each event tells who, what, when, where and whether it failed. Use an org-wide, multi-region trail into a separate log account with validation, query with Athena/Lake at scale, and Python for quick hunts.</p>` },
  quiz: [
    { q: 'S3 object-level reads are…', a: ['Management events', 'Data events (opt-in)', 'Not logged ever', 'Insights events'], c: 1, why: 'Enable data events on a trail.' },
    { q: 'An event with errorCode AccessDenied means…', a: ['The call succeeded', 'The call was attempted and refused', 'CloudTrail failed', 'The user was deleted'], c: 1, why: 'Failed attempts are still logged.' },
    { q: 'Detect tampering with log files:', a: ['Versioning only', 'Log file validation (digest files)', 'Public bucket', 'CloudWatch'], c: 1, why: 'validate-logs checks digests.' },
    { q: 'Event history keeps management events for…', a: ['7 days', '90 days', 'Forever', '1 year'], c: 1, why: 'Use a trail for longer retention.' }
  ],
  challenge: { task: 'Write denied_by_user(events) → dict {userName: number of events with errorCode "AccessDenied"}. On the lab data it should find ci-legacy 3 and dev-maria 1.',
    hint: R`def denied_by_user(events):
    out = {}
    for e in events:
        if e.get("errorCode") == "AccessDenied":
            user = e["userIdentity"].get("userName", "unknown")
            out[user] = out.get(user, 0) + 1
    return out

print(denied_by_user(cloudtrail))
`,
    starter: R`def denied_by_user(events):
    out = {}
    for e in events:
        pass  # count AccessDenied per userIdentity.userName
    return out

print(denied_by_user(cloudtrail))
`,
    check: '_t(lambda: denied_by_user(cloudtrail) == {"ci-legacy": 3, "dev-maria": 1} and denied_by_user([]) == {})' },
  next: `Counting denials is a start. Real attackers leave a pattern: recon, privilege escalation, persistence, covering tracks. Next: <b>threat hunting</b> rules that catch them.`,
  cheat: [['aws cloudtrail lookup-events', '90-day history'], ['userIdentity.type / .arn', 'who'], ['eventName + eventSource', 'what'], ['sourceIPAddress · awsRegion', 'where'], ['errorCode AccessDenied', 'failed attempt'], ['validate-logs', 'tamper check']]
});

/* ============ 04 THREAT HUNTING ============ */
LESSONS.push({
  id: 'threat-hunting', num: 4, cat: 'detect', layer: 2, mins: 16,
  title: 'Threat Hunting in CloudTrail', short: 'Recon, escalation, persistence, evasion',
  overview: `<p>Attackers follow a playbook (MITRE ATT&amp;CK for Cloud): <b>discover</b> what a stolen key can do, <b>escalate</b> privileges, create <b>persistence</b> (new keys or users), run <b>impact</b> actions (crypto-mining in a far-away region) and <b>evade defenses</b> (stop logging). Each leaves recognizable CloudTrail events.</p>`,
  hook: `<b>"Look, Lift, Linger, Loot, Lie low"</b>: recon, escalate, persist, impact, evade.`,
  why: `Detection engineering, turning attacker behaviour into rules, is one of the most in-demand Cloud Security skills. These exact rules exist in GuardDuty, Security Hub and every SIEM.`,
  scene: { type: 'graph', nodes: [
    { id: 'key', x: 100, y: 240, icon: 'key', label: 'Stolen key', sub: 'ci-legacy · Tor IP' },
    { id: 'recon', x: 300, y: 90, icon: 'search', label: 'Recon', sub: 'ListBuckets · ListUsers' },
    { id: 'pers', x: 520, y: 90, icon: 'key', label: 'Persistence', sub: 'CreateAccessKey (other user)', at: 1 },
    { id: 'impact', x: 520, y: 390, icon: 'cpu', label: 'Impact', sub: 'RunInstances us-east-1', at: 2 },
    { id: 'evade', x: 300, y: 390, icon: 'eye', label: 'Evasion', sub: 'StopLogging', at: 3 },
    { id: 'rules', x: 800, y: 240, icon: 'shield', label: 'Your rules', sub: 'hunt(events)', at: 4 }
  ], edges: [{ a: 'key', b: 'recon' }, { a: 'recon', b: 'pers' }, { a: 'pers', b: 'impact' }, { a: 'key', b: 'evade' }, { a: 'pers', b: 'rules' }, { a: 'impact', b: 'rules' }, { a: 'evade', b: 'rules' }] },
  steps: [
    { t: 'Recon', sub: '"What can this key do?"',
      body: `<p>Right after stealing a key, attackers call cheap read APIs: <code>GetCallerIdentity</code>, <code>ListBuckets</code>, <code>ListUsers</code>, <code>GetSecretValue</code>, often from <b>Tor or VPS IPs</b> the real user never uses. Many fail with AccessDenied (lesson 3). Signal: a new IP + a burst of List/Get/Describe calls.</p>`,
      analogy: `A burglar <b>rattling every window</b> before choosing one.`,
      hook: `<b>New IP + many List/Get calls = recon.</b>`,
      words: ['reconnaissance', 'GetCallerIdentity', 'enumeration', 'Tor exit node', 'MITRE ATT&CK'],
      flow: { from: 'key', to: 'recon', label: 'RECON', detail: ['185.220.101.7: ListBuckets, GetSecretValue ✕, ListUsers ✕'], color: 'amber' }, focus: ['key', 'recon'],
      cmds: [{ c: 'print({e["sourceIPAddress"] for e in cloudtrail if e["userIdentity"]["userName"] == "ci-legacy"})', o: "{'185.220.101.7'}", k: 'py', f: 'hunt.py' }] },
    { t: 'Persistence', sub: 'Keys and users for later',
      body: `<p>To survive a password reset, attackers create <b>new access keys</b>, often for <b>a different, more powerful user</b> (<code>CreateAccessKey</code> where <code>requestParameters.userName</code> ≠ the caller), new IAM users, login profiles, or roles with trust to their own account. Any of these from an unexpected caller is high severity.</p>`,
      analogy: `Copying a <b>spare key</b> on the way out.`,
      hook: `<b>CreateAccessKey for someone else = red flag.</b>`,
      words: ['persistence', 'CreateAccessKey', 'CreateUser', 'CreateLoginProfile', 'UpdateAssumeRolePolicy'],
      flow: { from: 'recon', to: 'pers', label: 'PERSIST', detail: ['ci-legacy → CreateAccessKey(userName=raul)'], color: 'red' }, focus: ['recon', 'pers'],
      cmds: [{ c: 'e = cloudtrail[5]\nprint(e["userIdentity"]["userName"], "→", e["requestParameters"]["userName"])', o: 'ci-legacy → raul', k: 'py', f: 'hunt.py' }] },
    { t: 'Impact & unusual regions', sub: 'Crypto-mining 101',
      body: `<p>The most common cloud attack is <b>crypto-mining</b>: <code>RunInstances</code> of big GPU instances (<code>p4d</code>, <code>g5</code>) in a <b>region you never use</b>, hoping you won't look there. Defense: alert on any API activity outside your approved regions, and block unused regions with an <b>SCP</b> (IAM Explorer lesson 10).</p>`,
      analogy: `Someone running a <b>noisy factory in your empty warehouse</b> across town, on your electricity bill.`,
      hook: `<b>Activity outside approved regions = investigate. Better: SCP-deny it.</b>`,
      words: ['impact', 'crypto-mining', 'RunInstances', 'unused regions', 'region-deny SCP'],
      flow: { from: 'pers', to: 'impact', label: 'IMPACT', detail: ['RunInstances p4d.24xlarge ×8 in us-east-1'], color: 'red' }, focus: ['pers', 'impact'],
      cmds: [{ c: 'print([e["eventID"] for e in cloudtrail if e["awsRegion"] != "ap-southeast-1"])', o: "['e07']", k: 'py', f: 'hunt.py' }] },
    { t: 'Defense evasion & root', sub: 'Turning off the cameras',
      body: `<p>Watch for <code>StopLogging</code>, <code>DeleteTrail</code>, <code>UpdateTrail</code>, <code>PutEventSelectors</code>, disabling GuardDuty or Config, even if they fail (an <b>attempt</b> is a signal). Also alert on <b>any root activity</b>, and on <code>ConsoleLogin</code> where <code>additionalEventData.MFAUsed</code> is <code>"No"</code>.</p>`,
      analogy: `A guest <b>unplugging the CCTV</b> is suspicious even if the plug was glued in.`,
      hook: `<b>Logging changes, root use, no-MFA logins: always alert.</b>`,
      words: ['StopLogging', 'DeleteTrail', 'defense evasion', 'root activity', 'MFAUsed'],
      flow: { from: 'key', to: 'evade', label: 'EVADE', detail: ['StopLogging org-trail'], color: 'red' }, focus: ['key', 'evade'],
      cmds: [{ c: 'aws cloudtrail get-trail-status --name org-trail --query IsLogging', o: 'false', k: 'err' }] },
    { t: 'Write the rules', sub: 'Detection as code',
      body: `<p>Turn each behaviour into a small function, then combine them: <code>hunt(events)</code> returns the IDs of suspicious events. Keep rules <b>explainable</b> (each alert says why), <b>tested</b> (sample events like the lab data) and <b>tuned</b> (allow-lists for known automation). In production this runs in EventBridge + Lambda, a SIEM, or Security Hub custom insights.</p>`,
      analogy: `A <b>smoke detector per room</b>, each tested monthly.`,
      hook: `<b>One behaviour → one rule → one test.</b>`,
      words: ['detection engineering', 'rule', 'false positive', 'allow-list', 'SIEM'],
      flow: { from: 'rules', to: 'key', label: 'ALERT', detail: ['e06 e07 e08 e09 e13'], color: 'green' }, focus: ['rules'],
      cmds: [{ c: 'RULES = [is_logging_tamper, is_root_or_no_mfa_login, is_key_for_other_user, is_unapproved_region]', f: 'hunt.py', o: '', k: 'py' }] }
  ],
  summary: { title: 'You hunt like a detection engineer', sub: 'Recon · persistence · impact · evasion', text: `<p>Attackers recon with List/Get calls from new IPs, persist with new keys/users (especially for other users), cause impact like crypto-mining in unused regions, and evade by stopping logging. Alert on logging changes, root and no-MFA logins, keys created for other users, and any activity outside approved regions.</p>` },
  quiz: [
    { q: 'StopLogging that FAILED with AccessDenied is…', a: ['Harmless, ignore it', 'Still worth an alert (attempted evasion)', 'A CloudTrail bug', 'Normal automation'], c: 1, why: 'The attempt itself is a signal.' },
    { q: 'CreateAccessKey where requestParameters.userName ≠ caller suggests…', a: ['Key rotation', 'Persistence via another user', 'Recon', 'MFA setup'], c: 1, why: 'Creating keys for someone else.' },
    { q: 'Best prevention for crypto-mining in unused regions:', a: ['Bigger budgets', 'SCP denying unused regions', 'More CloudWatch', 'Turn off CloudTrail'], c: 1, why: 'Preventive guardrail.' },
    { q: 'ConsoleLogin with MFAUsed "No" for root is…', a: ['Fine', 'High severity', 'Low severity', 'Impossible'], c: 1, why: 'Root should only log in with MFA, rarely.' }
  ],
  challenge: { task: 'Write hunt(events) → sorted list of eventIDs that match ANY rule: (1) eventName in StopLogging/DeleteTrail/UpdateTrail/PutEventSelectors; (2) ConsoleLogin by userIdentity.type "Root" OR with additionalEventData.MFAUsed "No"; (3) CreateAccessKey where requestParameters.userName differs from the caller\u2019s userName; (4) awsRegion not in ALLOWED = {"ap-southeast-1"}.',
    hint: R`ALLOWED = {"ap-southeast-1"}
TAMPER = {"StopLogging", "DeleteTrail", "UpdateTrail", "PutEventSelectors"}

def hunt(events):
    hits = []
    for e in events:
        name, who = e["eventName"], e["userIdentity"]
        mfa = e.get("additionalEventData", {}).get("MFAUsed")
        rules = [
            name in TAMPER,
            name == "ConsoleLogin" and (who.get("type") == "Root" or mfa == "No"),
            name == "CreateAccessKey" and e["requestParameters"].get("userName") not in (None, who.get("userName")),
            e["awsRegion"] not in ALLOWED,
        ]
        if any(rules):
            hits.append(e["eventID"])
    return sorted(hits)

for eid in hunt(cloudtrail):
    e = next(x for x in cloudtrail if x["eventID"] == eid)
    print(eid, e["eventName"], e["userIdentity"]["userName"], e["awsRegion"])
`,
    starter: R`ALLOWED = {"ap-southeast-1"}
TAMPER = {"StopLogging", "DeleteTrail", "UpdateTrail", "PutEventSelectors"}

def hunt(events):
    hits = []
    for e in events:
        if e["eventName"] in TAMPER:
            hits.append(e["eventID"])
        # TODO: root / no-MFA logins, keys for other users, unapproved regions
    return sorted(hits)

print(hunt(cloudtrail))
`,
    check: '_t(lambda: hunt(cloudtrail) == ["e06", "e07", "e08", "e09", "e13"])' },
  next: `Detection tells you something happened. Protection makes it not matter: next, <b>data protection</b> with KMS, encryption and S3 Block Public Access.`,
  cheat: [['List*/Get*/Describe* burst', 'recon'], ['CreateAccessKey for other user', 'persistence'], ['RunInstances in unused region', 'crypto-mining'], ['StopLogging / DeleteTrail', 'evasion'], ['additionalEventData.MFAUsed', 'login MFA'], ['MITRE ATT&CK Cloud', 'attacker playbook']]
});

/* ============ 05 DATA PROTECTION ============ */
LESSONS.push({
  id: 'data-protection', num: 5, cat: 'data', layer: 3, mins: 15,
  title: 'Data Protection: KMS, Encryption, S3', short: 'Encrypt everything, block public access',
  overview: `<p>Protect data <b>at rest</b> (KMS encryption on S3, EBS, RDS, DynamoDB), <b>in transit</b> (TLS everywhere, <code>aws:SecureTransport</code>), and from <b>accidental exposure</b> (S3 Block Public Access). <b>AWS KMS</b> manages keys and logs every use in CloudTrail, so encryption is also an access-control and audit layer.</p>`,
  hook: `<b>"Encrypt at rest, encrypt in transit, never public by accident."</b>`,
  why: `Public S3 buckets have caused some of the largest data leaks in history. Encryption plus Block Public Access are table-stakes controls every audit (SOC 2, ISO, PCI) checks.`,
  scene: { type: 'graph', nodes: [
    { id: 'app', x: 110, y: 240, icon: 'server', label: 'App', sub: 'PutObject' },
    { id: 'kms', x: 360, y: 90, icon: 'key', label: 'AWS KMS', sub: 'customer managed key' },
    { id: 's3', x: 360, y: 380, icon: 'bucket', label: 'S3 bucket', sub: 'SSE-KMS · versioning', at: 2 },
    { id: 'bpa', x: 620, y: 380, icon: 'shield', label: 'Block Public Access', sub: 'account + bucket', at: 3 },
    { id: 'ct', x: 620, y: 90, icon: 'log', label: 'CloudTrail', sub: 'kms:Decrypt logged' },
    { id: 'audit', x: 860, y: 240, icon: 'script', label: 'Audit script', sub: 'unencrypted · public', at: 4 }
  ], edges: [{ a: 'app', b: 'kms' }, { a: 'app', b: 's3' }, { a: 'kms', b: 'ct' }, { a: 's3', b: 'bpa' }, { a: 'bpa', b: 'audit' }, { a: 's3', b: 'audit' }] },
  steps: [
    { t: 'Envelope encryption', sub: 'How KMS really works',
      body: `<p>KMS keys never leave KMS. To encrypt big data, a service asks KMS for a <b>data key</b>: it gets a plaintext copy (used to encrypt, then wiped from memory) and an <b>encrypted copy</b> stored next to the data. To decrypt, it sends the encrypted data key to KMS, which checks the <b>key policy + IAM</b> and returns the plaintext key. Every call is logged.</p>`,
      analogy: `Lock the documents in a <b>box (data key)</b>, then lock the box's key in a <b>bank vault (KMS)</b> that logs every visit.`,
      hook: `<b>KMS key wraps the data key; data key encrypts the data.</b>`,
      words: ['envelope encryption', 'data key', 'GenerateDataKey', 'KMS key', 'key policy'],
      flow: { from: 'app', to: 'kms', label: 'DATA KEY', detail: ['GenerateDataKey → plaintext + encrypted copy'], color: 'blue' }, focus: ['app', 'kms', 'ct'],
      cmds: [{ c: 'aws kms generate-data-key --key-id alias/raul-data --key-spec AES_256 --query KeyId', o: '"arn:aws:kms:ap-southeast-1:111122223333:key/1234abcd-12ab-34cd-56ef-1234567890ab"', k: 'cli' }] },
    { t: 'Key types & policies', sub: 'AWS owned, AWS managed, customer managed',
      body: `<p><b>Customer managed keys</b> (CMKs) give you control: key policy, grants, rotation (yearly automatic), disabling, and cross-account use. <b>AWS managed</b> keys (<code>aws/s3</code>) are easy but you can't edit their policy. The key policy is the <b>first gate</b>: without it allowing access, even an admin can't decrypt. That's a powerful separation of duties.</p>`,
      analogy: `Your own <b>safe with your own combination</b> vs the hotel's safe.`,
      hook: `<b>Key policy first, IAM second. No key access = no data access.</b>`,
      words: ['customer managed key', 'AWS managed key', 'key rotation', 'grants', 'separation of duties'],
      flow: { from: 'kms', to: 'ct', label: 'AUDIT', detail: ['kms:Decrypt by role/report-reader'], color: 'purple' }, focus: ['kms', 'ct'],
      cmds: [{ c: 'aws kms get-key-rotation-status --key-id alias/raul-data', o: '{\n    "KeyRotationEnabled": true,\n    "RotationPeriodInDays": 365\n}', k: 'cli' }] },
    { t: 'Encrypt S3 & friends', sub: 'Default encryption',
      body: `<p>S3 encrypts new objects by default (SSE-S3) since 2023; use <b>SSE-KMS</b> with a customer managed key for sensitive data (audit + access control), plus <b>S3 Bucket Keys</b> to cut KMS costs. Turn on <b>EBS encryption by default</b> per region, and encryption for RDS, DynamoDB and backups. Enforce TLS with a bucket policy denying <code>aws:SecureTransport = false</code>.</p>`,
      analogy: `Every filing cabinet <b>locked by default</b>; no one has to remember.`,
      hook: `<b>SSE-KMS for sensitive, Bucket Keys for cost, deny non-TLS.</b>`,
      words: ['SSE-S3', 'SSE-KMS', 'S3 Bucket Keys', 'EBS encryption by default', 'aws:SecureTransport'],
      flow: { from: 'app', to: 's3', label: 'PUT', detail: ['x-amz-server-side-encryption: aws:kms'], color: 'green' }, focus: ['app', 's3'],
      cmds: [{ c: 'aws ec2 enable-ebs-encryption-by-default --region ap-southeast-1', o: '{\n    "EbsEncryptionByDefault": true\n}', k: 'cli' }] },
    { t: 'Block Public Access', sub: 'The big safety switch',
      body: `<p><b>S3 Block Public Access</b> has four settings (block public ACLs, ignore public ACLs, block public policies, restrict public buckets). Turn all four on at the <b>account level</b>; it overrides any bucket policy or ACL that would make data public. For public websites, serve through <b>CloudFront with Origin Access Control</b> instead of a public bucket.</p>`,
      analogy: `A <b>master breaker</b> that cuts public access no matter which switch someone flips in a room.`,
      hook: `<b>Account-level BPA on. Public website? CloudFront + OAC.</b>`,
      words: ['Block Public Access', 'account-level BPA', 'public bucket policy', 'CloudFront OAC', 'Access Analyzer'],
      flow: { from: 's3', to: 'bpa', label: 'BLOCK', detail: ['raul-public-site policy_public → blocked'], color: 'amber' }, focus: ['s3', 'bpa'],
      cmds: [{ c: 'aws s3control put-public-access-block --account-id 111122223333 --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true', o: '', k: 'cli' }] },
    { t: 'Audit your buckets', sub: 'Find the risky ones',
      body: `<p>In the lab, <code>buckets</code> is a list of dicts: <code>name</code>, <code>encryption</code> (<code>None</code> if off), <code>public_access_block</code>, <code>versioning</code>, <code>policy_public</code>. A bucket is <b>risky</b> if it's unencrypted <b>or</b> could be public (BPA off, or a public policy). In real life, <b>IAM Access Analyzer</b>, <b>Macie</b> (sensitive data discovery) and Config rules do this continuously.</p>`,
      analogy: `Walking the archive with a flashlight: <b>unlocked cabinets</b> and <b>doors to the street</b>.`,
      hook: `<b>Unencrypted OR possibly public = risky.</b>`,
      words: ['bucket audit', 'Macie', 'IAM Access Analyzer', 's3-bucket-public-read-prohibited'],
      flow: { from: 'audit', to: 's3', label: 'FINDINGS', detail: ['raul-backups · raul-public-site · raul-tmp'], color: 'red' }, focus: ['audit', 's3', 'bpa'],
      cmds: [{ c: 'for b in buckets:\n    print(f"{b[\'name\']:18} enc={b[\'encryption\']} bpa={b[\'public_access_block\']}")', o: 'raul-reports       enc=aws:kms bpa=True\nraul-public-site   enc=AES256 bpa=False\nraul-backups       enc=None bpa=True\nraul-logs          enc=aws:kms bpa=True\nraul-tmp           enc=None bpa=False', k: 'py', f: 'audit.py' }] }
  ],
  summary: { title: 'Your data is protected', sub: 'KMS · envelope encryption · SSE-KMS · BPA', text: `<p>KMS uses envelope encryption and logs every key use; customer managed keys give you key policies, rotation and separation of duties. Encrypt S3 (SSE-KMS + Bucket Keys), EBS by default, RDS and DynamoDB; enforce TLS; turn on account-level Block Public Access; audit with Access Analyzer, Macie and Config.</p>` },
  quiz: [
    { q: 'In envelope encryption, the data is encrypted with…', a: ['The KMS key directly', 'A data key (itself encrypted by the KMS key)', 'Your password', 'TLS'], c: 1, why: 'KMS keys never leave KMS.' },
    { q: 'Which key type lets you edit the key policy?', a: ['AWS owned', 'AWS managed (aws/s3)', 'Customer managed', 'None'], c: 2, why: 'Full control with CMKs.' },
    { q: 'Overrides public bucket policies account-wide:', a: ['Versioning', 'S3 Block Public Access', 'Bucket Keys', 'Lifecycle rules'], c: 1, why: 'The master switch.' },
    { q: 'Find sensitive data like PII in S3:', a: ['GuardDuty', 'Macie', 'Inspector', 'Shield'], c: 1, why: 'Macie discovers sensitive data.' }
  ],
  challenge: { task: 'Write risky_buckets(buckets) → sorted list of bucket names that are unencrypted (encryption is None) OR possibly public (public_access_block is False or policy_public is True).',
    hint: R`def risky_buckets(buckets):
    out = []
    for b in buckets:
        unencrypted = b["encryption"] is None
        public = (not b["public_access_block"]) or b["policy_public"]
        if unencrypted or public:
            out.append(b["name"])
    return sorted(out)

print(risky_buckets(buckets))
`,
    starter: R`def risky_buckets(buckets):
    out = []
    for b in buckets:
        if b["encryption"] is None:
            out.append(b["name"])
    return sorted(out)

print(risky_buckets(buckets))
`,
    check: '_t(lambda: risky_buckets(buckets) == ["raul-backups", "raul-public-site", "raul-tmp"])' },
  next: `Encryption keys are one kind of secret. Database passwords and API tokens are another, and they love to end up in code. Next: <b>secrets management</b>.`,
  cheat: [['GenerateDataKey', 'envelope encryption'], ['customer managed key', 'your key policy'], ['SSE-KMS + Bucket Keys', 'S3 encryption'], ['enable-ebs-encryption-by-default', 'EBS'], ['put-public-access-block (account)', 'block public'], ['Macie · Access Analyzer', 'find exposure']]
});

/* ============ 06 SECRETS ============ */
LESSONS.push({
  id: 'secrets', num: 6, cat: 'data', layer: 3, mins: 13,
  title: 'Secrets Management', short: 'Secrets Manager, Parameter Store, rotation',
  overview: `<p>Passwords, API keys and tokens must never live in code, config files, environment variables in plain text, or Git. Store them in <b>AWS Secrets Manager</b> (rotation, cross-account, versioning) or <b>SSM Parameter Store SecureString</b> (cheaper, simpler), encrypted with KMS, and fetch them at runtime with IAM-controlled access.</p>`,
  hook: `<b>"Fetch, don't paste."</b> Code holds the secret's NAME, never its value.`,
  why: `Hard-coded secrets in public repos are scraped by bots within minutes. Secret scanning findings and rotation projects are everyday work for security engineers.`,
  scene: { type: 'graph', nodes: [
    { id: 'code', x: 110, y: 240, icon: 'code', label: 'Your code', sub: 'SecretId only' },
    { id: 'role', x: 340, y: 110, icon: 'key', label: 'IAM role', sub: 'GetSecretValue on prod/db', at: 1 },
    { id: 'sm', x: 580, y: 240, icon: 'vault', label: 'Secrets Manager', sub: 'prod/db (KMS)' },
    { id: 'rot', x: 820, y: 110, icon: 'clock', label: 'Rotation Lambda', sub: 'every 30 days', at: 3 },
    { id: 'db', x: 820, y: 380, icon: 'disk', label: 'Database', sub: 'new password', at: 3 },
    { id: 'git', x: 340, y: 400, icon: 'bug', label: 'Git history', sub: 'never here!', at: 4 }
  ], edges: [{ a: 'code', b: 'role' }, { a: 'role', b: 'sm' }, { a: 'code', b: 'sm' }, { a: 'sm', b: 'rot' }, { a: 'rot', b: 'db' }, { a: 'code', b: 'git' }] },
  steps: [
    { t: 'Where secrets leak', sub: 'The usual suspects',
      body: `<p>Leaks happen through: code and Git history (even after deleting the line), Docker images, CI logs, plain environment variables visible in the console, Slack/tickets, and CloudFormation templates or outputs. Once leaked, assume compromise: <b>rotate first</b>, then clean up.</p>`,
      analogy: `Writing your PIN <b>on the back of the card</b>.`,
      hook: `<b>Leaked once = rotate now. Deleting the line isn't enough.</b>`,
      words: ['hard-coded secret', 'Git history', 'secret scanning', 'rotate on leak'],
      flow: { from: 'code', to: 'sm', label: 'FETCH', detail: ['GetSecretValue(SecretId="prod/db")'], color: 'red' }, focus: ['code'],
      cmds: [{ c: 'gitleaks detect --source . --redact', o: 'Finding:     password = "REDACTED"\nRuleID:      generic-api-key\nFile:        app/db.py\nLine:        4\nWRN leaks found: 1', k: 'err', f: 'terminal' }] },
    { t: 'Secrets Manager vs Parameter Store', sub: 'Pick the right vault',
      body: `<p><b>Secrets Manager</b>: built-in <b>rotation</b> (RDS, Redshift, DocumentDB, custom Lambda), cross-account resource policies, versioning stages (<code>AWSCURRENT</code>, <code>AWSPREVIOUS</code>), about $0.40/secret/month. <b>Parameter Store SecureString</b>: free standard tier, KMS-encrypted, great for config + simple secrets, no native rotation.</p>`,
      analogy: `A <b>bank safety-deposit box with auto-changing locks</b> vs a <b>good home safe</b>.`,
      hook: `<b>Needs rotation → Secrets Manager. Simple config → Parameter Store.</b>`,
      words: ['Secrets Manager', 'Parameter Store SecureString', 'AWSCURRENT', 'resource policy', 'cost'],
      flow: { from: 'role', to: 'sm', label: 'AUTHZ', detail: ['secretsmanager:GetSecretValue on prod/db*'], color: 'purple' }, focus: ['role', 'sm'],
      cmds: [{ c: 'aws ssm get-parameter --name /prod/api-url --query Parameter.Value --output text', o: 'https://api.raul.dev', k: 'cli' }] },
    { t: 'Fetch at runtime', sub: 'boto3 get_secret_value',
      body: `<p><code>boto3.client("secretsmanager").get_secret_value(SecretId=os.environ["SECRET_ID"])["SecretString"]</code> returns the secret (often JSON: <code>{"username": …, "password": …}</code>). The environment variable holds only the secret's <b>name</b>. Cache it in the Lambda init phase (or use the Parameters and Secrets Lambda Extension) to avoid an API call per request.</p>`,
      analogy: `The code carries a <b>claim ticket</b>, not the coat.`,
      hook: `<b>Env var = name. Secrets Manager = value. Cache it.</b>`,
      words: ['get_secret_value', 'SecretString', 'json.loads', 'caching', 'Secrets Lambda Extension'],
      flow: { from: 'sm', to: 'code', label: 'VALUE', detail: ['{"username": "app", "password": "•••"}'], color: 'green' }, focus: ['code', 'sm'],
      cmds: [{ c: 'import boto3, json, os\nsm = boto3.client("secretsmanager")\nsecret = json.loads(sm.get_secret_value(SecretId=os.environ["SECRET_ID"])["SecretString"])\nprint(secret["username"])', o: 'app', k: 'py', f: 'lab.py' }] },
    { t: 'Rotation', sub: 'Change it without downtime',
      body: `<p>Rotation Lambdas follow four steps: <code>createSecret</code> (new version <code>AWSPENDING</code>), <code>setSecret</code> (update the database), <code>testSecret</code>, <code>finishSecret</code> (promote to <code>AWSCURRENT</code>). Apps that fetch at runtime pick up the new value automatically. For RDS, simplest of all: <code>ManageMasterUserPassword: true</code> and AWS rotates it for you.</p>`,
      analogy: `Changing the locks while <b>everyone's key automatically updates</b>.`,
      hook: `<b>create → set → test → finish. Fetch-at-runtime apps never notice.</b>`,
      words: ['rotation', 'AWSPENDING', 'AWSCURRENT', 'rotation Lambda', 'ManageMasterUserPassword'],
      flow: { from: 'rot', to: 'db', label: 'ROTATE', detail: ['setSecret → ALTER USER app PASSWORD …'], color: 'teal' }, focus: ['rot', 'db', 'sm'],
      cmds: [{ c: 'aws secretsmanager rotate-secret --secret-id prod/db --rotation-rules AutomaticallyAfterDays=30', o: '{\n    "Name": "prod/db",\n    "VersionId": "8f2c…"\n}', k: 'cli' }] },
    { t: 'Prevent & detect leaks', sub: 'Shift left',
      body: `<p>Turn on <b>GitHub secret scanning + push protection</b>, run <b>gitleaks</b> in CI (CI/CD Explorer lesson 11), use IAM conditions so only the right role reads each secret, and alert on unusual <code>GetSecretValue</code> calls in CloudTrail (like the AccessDenied attempt from ci-legacy in the lab data).</p>`,
      analogy: `A <b>bouncer at the door</b> (push protection) and a <b>camera at the safe</b> (CloudTrail).`,
      hook: `<b>Block at push, scan in CI, watch GetSecretValue.</b>`,
      words: ['push protection', 'gitleaks', 'least privilege', 'GetSecretValue monitoring'],
      flow: { from: 'code', to: 'git', label: 'BLOCKED', detail: ['push protection: secret detected'], color: 'amber' }, focus: ['code', 'git'],
      cmds: [{ c: 'print([e["eventID"] for e in cloudtrail if e["eventName"] == "GetSecretValue"])', o: "['e04']", k: 'py', f: 'lab.py' }] }
  ],
  summary: { title: 'Secrets stay secret', sub: 'Vault · fetch at runtime · rotate · prevent leaks', text: `<p>Keep secrets in Secrets Manager (rotation, cross-account) or Parameter Store SecureString, encrypted with KMS. Code and env vars hold only the secret's name; fetch with <code>get_secret_value</code> and cache. Rotate automatically, block leaks with push protection and gitleaks, and rotate immediately if anything leaks.</p>` },
  quiz: [
    { q: 'A password was committed and then deleted in the next commit. You should…', a: ['Do nothing', 'Rotate it immediately', 'Rename the file', 'Make the repo private only'], c: 1, why: 'It\u2019s still in history; assume compromised.' },
    { q: 'Built-in rotation for RDS credentials:', a: ['Parameter Store', 'Secrets Manager', 'KMS', 'S3'], c: 1, why: 'Native rotation support.' },
    { q: 'The Lambda env var should contain…', a: ['The password', 'The secret\u2019s name/ARN', 'The KMS key material', 'Nothing'], c: 1, why: 'Fetch the value at runtime.' },
    { q: 'Rotation stage for the new, not-yet-active version:', a: ['AWSCURRENT', 'AWSPENDING', 'AWSPREVIOUS', 'AWSNEW'], c: 1, why: 'Promoted to AWSCURRENT in finishSecret.' }
  ],
  challenge: { task: 'Remove the hard-coded password. get_db_password() must call boto3 secretsmanager get_secret_value with SecretId=os.environ["SECRET_ID"], parse the JSON SecretString, and return its "password".',
    hint: R`import boto3, json, os

sm = boto3.client("secretsmanager")

def get_db_password():
    resp = sm.get_secret_value(SecretId=os.environ["SECRET_ID"])
    return json.loads(resp["SecretString"])["password"]

pw = get_db_password()
print("Got a password of length", len(pw))
print(calls("secretsmanager"))
`,
    starter: R`import boto3, json, os

def get_db_password():
    # TODO: fetch from Secrets Manager instead!
    return "s3cr3t-from-vault"

pw = get_db_password()
print("Got a password of length", len(pw))
`,
    check: '_t(lambda: get_db_password() == "s3cr3t-from-vault" and len(calls("secretsmanager", "GetSecretValue")) == 1 and calls("secretsmanager")[0]["secret"] == "prod/db")' },
  next: `Identity and data are covered. Now the network layer: <b>security groups, NACLs and the ports attackers scan first</b>.`,
  cheat: [['secretsmanager get_secret_value', 'fetch'], ['json.loads(r["SecretString"])', 'parse'], ['SSM SecureString', 'cheap secrets'], ['rotate-secret --rotation-rules', 'auto rotation'], ['ManageMasterUserPassword: true', 'RDS managed'], ['gitleaks · push protection', 'prevent leaks']]
});
