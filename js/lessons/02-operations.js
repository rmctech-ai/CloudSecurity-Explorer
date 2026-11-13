/* ============ 07 NETWORK SECURITY ============ */
LESSONS.push({
  id: 'network-security', num: 7, cat: 'net', layer: 3, mins: 14,
  title: 'Network Security: Exposure & Firewalls', short: 'Risky ports, SG audits, WAF, Shield',
  overview: `<p>Internet scanners find an open port within minutes of it appearing. Network security in AWS means: keep workloads in <b>private subnets</b>, expose only what must be public (usually 443 on a load balancer), never open <b>admin or database ports</b> to <code>0.0.0.0/0</code>, and add <b>WAF</b> and <b>Shield</b> in front of public apps.</p>`,
  hook: `<b>"Only 443 faces the world."</b> Everything else is private or behind a bastion-less path (SSM).`,
  why: `Open SSH/RDP/database ports are among the top findings in every cloud security assessment and an easy entry point for ransomware crews.`,
  scene: { type: 'graph', nodes: [
    { id: 'net', x: 100, y: 240, icon: 'globe', label: 'Internet', sub: 'scanners · bots' },
    { id: 'waf', x: 300, y: 240, icon: 'shield', label: 'WAF + Shield', sub: 'L7 rules · DDoS', at: 3 },
    { id: 'alb', x: 500, y: 240, icon: 'api', label: 'ALB', sub: 'sg-0web: 443' },
    { id: 'app', x: 700, y: 120, icon: 'server', label: 'App (private)', sub: 'sg-0app from ALB', at: 1 },
    { id: 'db', x: 700, y: 380, icon: 'disk', label: 'DB (private)', sub: '5432 from app only', at: 1 },
    { id: 'ssm', x: 900, y: 240, icon: 'terminal', label: 'SSM Session Manager', sub: 'no port 22', at: 4 }
  ], edges: [{ a: 'net', b: 'waf' }, { a: 'waf', b: 'alb' }, { a: 'alb', b: 'app' }, { a: 'app', b: 'db' }, { a: 'ssm', b: 'app' }] },
  steps: [
    { t: 'Ports attackers scan first', sub: 'Know the dangerous list',
      body: `<p><b>Admin</b>: 22 (SSH), 3389 (RDP), 5985/5986 (WinRM). <b>Databases</b>: 3306 MySQL, 5432 PostgreSQL, 1433 SQL Server, 1521 Oracle, 6379 Redis, 27017 MongoDB, 9200 Elasticsearch. Any of these open to <code>0.0.0.0/0</code> (or <code>::/0</code>) is a critical finding. So is <b>all traffic</b> (<code>IpProtocol: "-1"</code>) from anywhere.</p>`,
      analogy: `Leaving the <b>back door and the safe</b> open to the street, while the front door has a guard.`,
      hook: `<b>22, 3389, and every DB port: never 0.0.0.0/0.</b>`,
      words: ['0.0.0.0/0', 'SSH 22', 'RDP 3389', 'database ports', 'IpProtocol -1'],
      flow: { from: 'net', to: 'alb', label: 'SCAN', detail: ['masscan → 22, 3389, 5432 …'], color: 'red' }, focus: ['net'],
      cmds: [{ c: 'aws ec2 describe-security-groups --filters Name=ip-permission.cidr,Values=0.0.0.0/0 --query "SecurityGroups[].GroupId" --output text', o: 'sg-0web\tsg-0ssh\tsg-0db\tsg-0all', k: 'cli' }] },
    { t: 'Security group design', sub: 'Reference groups, not CIDRs',
      body: `<p>Tier your security groups: ALB allows 443 from the internet; app allows its port <b>only from the ALB's security group</b>; database allows 5432 <b>only from the app's security group</b>. Referencing SGs instead of IP ranges keeps rules correct as instances scale and change IPs.</p>`,
      analogy: `"Only people <b>wearing a staff badge</b> may enter", instead of a list of home addresses.`,
      hook: `<b>Source = security group ID, not a CIDR.</b>`,
      words: ['SG referencing', 'tiered security groups', 'stateful', 'least exposure'],
      flow: { from: 'alb', to: 'app', label: 'ALLOW', detail: ['sg-0app: 8080 from sg-0web'], color: 'green' }, focus: ['alb', 'app', 'db'],
      cmds: [{ c: 'aws ec2 authorize-security-group-ingress --group-id sg-0db --protocol tcp --port 5432 --source-group sg-0app', o: '{\n    "Return": true\n}', k: 'cli' }],
      cloud: `<b>Link</b>: VPC Explorer lessons 7–8 trace packets through SGs and NACLs hop by hop.` },
    { t: 'Port ranges & all-traffic rules', sub: 'Read the rule correctly',
      body: `<p>A rule covers <code>FromPort</code> through <code>ToPort</code>: a rule for 0–65535 includes 22. <code>IpProtocol: "-1"</code> means <b>every protocol and port</b>. When auditing, check whether each dangerous port falls <b>inside</b> the range, and treat "-1" from anywhere as the worst case.</p>`,
      analogy: `"Rooms 1 to 500 are open" includes <b>room 22</b>, even if nobody wrote "22".`,
      hook: `<b>From ≤ port ≤ To. "-1" = everything.</b>`,
      words: ['FromPort', 'ToPort', 'port range', 'IpProtocol -1', 'IpRanges'],
      flow: { from: 'net', to: 'db', label: 'EXPOSED', detail: ['sg-0all: -1 from 0.0.0.0/0'], color: 'red' }, focus: ['net', 'db'],
      cmds: [{ c: 'sg = security_groups[4]\nprint(sg["GroupName"], sg["IpPermissions"][0]["IpProtocol"], sg["IpPermissions"][0]["IpRanges"])', o: "temp-debug -1 [{'CidrIp': '0.0.0.0/0'}]", k: 'py', f: 'audit.py' }] },
    { t: 'WAF, Shield, Firewall Manager', sub: 'Protect what must be public',
      body: `<p><b>AWS WAF</b> on ALB/CloudFront/API Gateway blocks SQL injection, XSS, bad bots and rate-limit abuse with managed rule groups. <b>Shield Standard</b> (free) absorbs common DDoS; <b>Shield Advanced</b> adds 24/7 response and cost protection. <b>Firewall Manager</b> applies WAF/SG policies across all accounts in an Organization.</p>`,
      analogy: `A <b>bouncer with a guest list</b> (WAF) and <b>crowd barriers</b> (Shield) at the only open door.`,
      hook: `<b>WAF = layer 7 rules. Shield = DDoS. FMS = org-wide.</b>`,
      words: ['AWS WAF', 'managed rule groups', 'rate-based rule', 'Shield Standard/Advanced', 'Firewall Manager'],
      flow: { from: 'waf', to: 'alb', label: 'FILTER', detail: ['AWSManagedRulesSQLiRuleSet → BLOCK'], color: 'purple' }, focus: ['waf', 'alb'],
      cmds: [{ c: 'aws wafv2 list-web-acls --scope REGIONAL --query "WebACLs[].Name" --output text', o: 'raul-alb-acl', k: 'cli' }] },
    { t: 'No more SSH', sub: 'SSM Session Manager',
      body: `<p><b>Session Manager</b> gives shell access through the SSM agent over HTTPS: <b>no inbound port</b>, no SSH keys, IAM-controlled, and every session logged to CloudWatch/S3. That deletes the most-attacked rule in AWS. Combine with <b>VPC Flow Logs</b> to see what's actually hitting your network.</p>`,
      analogy: `Entering through a <b>staff tunnel with badge logs</b> instead of a door on the street.`,
      hook: `<b>Session Manager: zero open ports, full audit.</b>`,
      words: ['SSM Session Manager', 'no bastion', 'session logging', 'VPC Flow Logs'],
      flow: { from: 'ssm', to: 'app', label: 'SESSION', detail: ['start-session (IAM-authorized, logged)'], color: 'teal' }, focus: ['ssm', 'app'],
      cmds: [{ c: 'aws ssm start-session --target i-0abc123', o: 'Starting session with SessionId: raul-0f1e2d3c4b5a69788\nsh-5.2$', k: 'cli' }] }
  ],
  summary: { title: 'Your network exposure is minimal', sub: 'Risky ports · SG design · WAF · Session Manager', text: `<p>Expose only 443 on a load balancer; keep apps and databases private with security groups that reference each other; never allow admin or database ports (or "-1") from 0.0.0.0/0; protect public endpoints with WAF and Shield; replace SSH with Session Manager.</p>` },
  quiz: [
    { q: 'A rule allowing tcp 0–65535 from 0.0.0.0/0 exposes port 22?', a: ['No', 'Yes', 'Only for UDP', 'Only IPv6'], c: 1, why: '22 is inside the range.' },
    { q: 'Best source for the DB security group rule:', a: ['0.0.0.0/0', 'The app’s security group ID', 'Your home IP', 'The VPC CIDR always'], c: 1, why: 'SG references follow instances.' },
    { q: 'Remove the need for inbound SSH:', a: ['Change port to 2222', 'SSM Session Manager', 'NACL deny', 'Bigger key'], c: 1, why: 'No inbound ports at all.' },
    { q: 'Blocks SQL injection at layer 7:', a: ['Security groups', 'AWS WAF', 'Shield Standard', 'NACLs'], c: 1, why: 'WAF inspects HTTP requests.' }
  ],
  challenge: { task: 'Write risky_sgs(sgs) → sorted GroupIds that allow 0.0.0.0/0 to any port in RISKY = {22, 3389, 3306, 5432, 1433, 6379, 27017} (check FromPort ≤ port ≤ ToPort) OR allow IpProtocol "-1" from 0.0.0.0/0.',
    hint: R`RISKY = {22, 3389, 3306, 5432, 1433, 6379, 27017}

def risky_sgs(sgs):
    out = set()
    for sg in sgs:
        for p in sg["IpPermissions"]:
            world = any(r.get("CidrIp") == "0.0.0.0/0" for r in p.get("IpRanges", []))
            if not world:
                continue
            if p["IpProtocol"] == "-1":
                out.add(sg["GroupId"])
            elif any(p["FromPort"] <= port <= p["ToPort"] for port in RISKY):
                out.add(sg["GroupId"])
    return sorted(out)

print(risky_sgs(security_groups))
`,
    starter: R`RISKY = {22, 3389, 3306, 5432, 1433, 6379, 27017}

def risky_sgs(sgs):
    out = set()
    for sg in sgs:
        for p in sg["IpPermissions"]:
            if p.get("FromPort") == 22:
                out.add(sg["GroupId"])
    return sorted(out)

print(risky_sgs(security_groups))
`,
    check: '_t(lambda: risky_sgs(security_groups) == ["sg-0all", "sg-0db", "sg-0ssh"] and risky_sgs([{"GroupId": "sg-x", "IpPermissions": [{"IpProtocol": "tcp", "FromPort": 0, "ToPort": 65535, "IpRanges": [{"CidrIp": "0.0.0.0/0"}]}]}]) == ["sg-x"])' },
  next: `You've built detections by hand. AWS has managed services that do this at scale: <b>GuardDuty, Security Hub, Inspector, Macie, Detective</b>. Next: what each one does and how to triage their findings.`,
  cheat: [['22 · 3389 · 3306 · 5432 · 6379 · 27017', 'never public'], ['--source-group sg-…', 'SG reference'], ['FromPort ≤ p ≤ ToPort', 'range check'], ['IpProtocol "-1"', 'all traffic'], ['AWS WAF managed rules', 'L7 protection'], ['aws ssm start-session', 'no SSH']]
});

/* ============ 08 DETECTION SERVICES ============ */
LESSONS.push({
  id: 'detection-services', num: 8, cat: 'detect', layer: 4, mins: 15,
  title: 'GuardDuty, Security Hub & Friends', short: 'Managed detection and triage',
  overview: `<p>AWS's security services each answer one question. <b>GuardDuty</b>: is something malicious happening? <b>Inspector</b>: what's vulnerable? <b>Macie</b>: where is sensitive data? <b>Config</b>: is it configured correctly? <b>Security Hub</b>: show me all of it in one place, scored against standards. <b>Detective</b>: help me investigate.</p>`,
  hook: `<b>"GuardDuty guards, Inspector inspects, Macie finds data, Config checks config, Hub hubs, Detective detects."</b>`,
  why: `Security Hub + GuardDuty triage is a daily SOC task in AWS shops, and these service names are heavily tested on the CCP and Security Specialty exams.`,
  scene: { type: 'graph', nodes: [
    { id: 'logs', x: 110, y: 240, icon: 'log', label: 'Logs', sub: 'CloudTrail · VPC · DNS' },
    { id: 'gd', x: 360, y: 90, icon: 'eye', label: 'GuardDuty', sub: 'threat detection' },
    { id: 'insp', x: 360, y: 240, icon: 'bug', label: 'Inspector', sub: 'CVEs in EC2/ECR/Lambda', at: 1 },
    { id: 'macie', x: 360, y: 390, icon: 'search', label: 'Macie', sub: 'PII in S3', at: 1 },
    { id: 'hub', x: 640, y: 240, icon: 'shield', label: 'Security Hub', sub: 'aggregate · score', at: 1 },
    { id: 'soc', x: 880, y: 240, icon: 'users', label: 'You (triage)', sub: 'severity first', at: 3 }
  ], edges: [{ a: 'logs', b: 'gd' }, { a: 'gd', b: 'hub' }, { a: 'insp', b: 'hub' }, { a: 'macie', b: 'hub' }, { a: 'hub', b: 'soc' }] },
  steps: [
    { t: 'GuardDuty', sub: 'Threat detection, one click',
      body: `<p>GuardDuty analyzes CloudTrail, VPC Flow Logs and DNS logs (plus optional S3, EKS, RDS, Lambda, runtime monitoring) using threat intelligence and ML. No agents to install. Findings have a <b>type</b> like <code>CryptoCurrency:EC2/BitcoinTool.B!DNS</code> and a <b>severity</b> 1–8.9 (low &lt; 4, medium 4–6.9, high ≥ 7). Enable it in every account and region via Organizations.</p>`,
      analogy: `A <b>security company watching your CCTV 24/7</b> with a list of known burglars.`,
      hook: `<b>Type tells WHAT, severity tells HOW URGENT. ≥ 7 = high.</b>`,
      words: ['GuardDuty', 'finding type', 'severity', 'threat intelligence', 'delegated administrator'],
      flow: { from: 'logs', to: 'gd', label: 'ANALYZE', detail: ['DNS query to pool.minexmr.com'], color: 'blue' }, focus: ['logs', 'gd'],
      cmds: [{ c: 'aws guardduty list-findings --detector-id 12abc34d567e8fa901bc2d34e56789f0 --finding-criteria \'{"Criterion":{"severity":{"Gte":7}}}\'', o: '{\n    "FindingIds": ["f2", "f5", "f7"]\n}', k: 'cli' }] },
    { t: 'Inspector & Macie', sub: 'Vulnerabilities and sensitive data',
      body: `<p><b>Amazon Inspector</b> continuously scans EC2 instances, ECR images and Lambda functions for <b>software CVEs</b> and network exposure, with a risk score. <b>Amazon Macie</b> discovers <b>sensitive data</b> (PII, credentials, financial data) in S3 and flags buckets that are public or unencrypted.</p>`,
      analogy: `Inspector is the <b>building inspector</b>; Macie is the <b>auditor counting confidential files</b>.`,
      hook: `<b>Inspector = vulnerable software. Macie = sensitive data.</b>`,
      words: ['Amazon Inspector', 'CVE', 'ECR scanning', 'Amazon Macie', 'PII discovery'],
      flow: { from: 'insp', to: 'hub', label: 'CVE', detail: ['CVE-2024-3094 xz-utils (critical) on i-0abc123'], color: 'amber' }, focus: ['insp', 'macie'],
      cmds: [{ c: 'aws inspector2 list-findings --filter-criteria \'{"severity":[{"comparison":"EQUALS","value":"CRITICAL"}]}\' --query "findings[].title" --output text', o: 'CVE-2024-3094 - xz-utils', k: 'cli' }] },
    { t: 'Security Hub', sub: 'One pane, scored',
      body: `<p><b>AWS Security Hub</b> aggregates findings from GuardDuty, Inspector, Macie, Config, Access Analyzer and partner tools in a common format (<b>ASFF</b>), across accounts and regions. It also runs <b>security standards</b> (AWS Foundational Security Best Practices, CIS AWS Foundations) and gives a <b>security score</b>. Automation rules can suppress noise or route findings.</p>`,
      analogy: `A <b>single dashboard</b> on the guard's desk instead of six monitors.`,
      hook: `<b>Hub = aggregate + standards + score.</b>`,
      words: ['Security Hub', 'ASFF', 'FSBP', 'CIS benchmark', 'security score', 'automation rules'],
      flow: { from: 'gd', to: 'hub', label: 'AGGREGATE', detail: ['GuardDuty + Inspector + Macie + Config'], color: 'purple' }, focus: ['gd', 'insp', 'macie', 'hub'],
      cmds: [{ c: 'aws securityhub get-enabled-standards --query "StandardsSubscriptions[].StandardsArn" --output text', o: 'arn:aws:securityhub:ap-southeast-1::standards/aws-foundational-security-best-practices/v/1.0.0\narn:aws:securityhub:::ruleset/cis-aws-foundations-benchmark/v/1.4.0', k: 'cli' }] },
    { t: 'Detective & investigation', sub: 'From alert to story',
      body: `<p><b>Amazon Detective</b> builds a graph from CloudTrail, VPC Flow Logs and GuardDuty findings so you can pivot: "what else did this role do, from which IPs, in the hour before?". It turns a single finding into a timeline, which is exactly what you built by hand in lessons 3–4.</p>`,
      analogy: `The <b>detective's corkboard</b> with red string between clues.`,
      hook: `<b>GuardDuty says "something's wrong"; Detective says "here's the story".</b>`,
      words: ['Amazon Detective', 'behavior graph', 'pivot', 'timeline'],
      flow: { from: 'hub', to: 'soc', label: 'INVESTIGATE', detail: ['ci-legacy: 9 API calls from 185.220.101.7 in 3 min'], color: 'teal' }, focus: ['hub', 'soc'],
      cmds: [{ c: 'print(sorted({f["Resource"] for f in guardduty_findings}))', o: "['ci-legacy', 'i-0abc123', 'org-trail', 'raul-reports', 'root']", k: 'py', f: 'triage.py' }] },
    { t: 'Triage', sub: 'Highest severity first',
      body: `<p>When findings pile up, triage: sort by <b>severity</b>, group by <b>resource</b> (one compromised key may cause five findings), check for <b>known benign</b> causes (pentests, scanners), and escalate highs immediately. Don't ignore low findings blindly: <code>CloudTrailLoggingDisabled</code> is only 2.0 in the lab data but is part of the same attack!</p>`,
      analogy: `An <b>ER triage nurse</b>: the bleeding patient first, but nobody gets forgotten.`,
      hook: `<b>Sort by severity, group by resource, connect the dots.</b>`,
      words: ['triage', 'severity sorting', 'grouping', 'false positive', 'escalation'],
      flow: { from: 'soc', to: 'hub', label: 'TRIAGE', detail: ['8.5 → 8.0 → 7.2 first'], color: 'red' }, focus: ['soc'],
      cmds: [{ c: 'for f in sorted(guardduty_findings, key=lambda f: -f["Severity"])[:2]:\n    print(f["Severity"], f["Type"])', o: '8.5 UnauthorizedAccess:IAMUser/InstanceCredentialExfiltration.OutsideAWS\n8.0 CryptoCurrency:EC2/BitcoinTool.B!DNS', k: 'py', f: 'triage.py' }] }
  ],
  summary: { title: 'You know the security service map', sub: 'GuardDuty · Inspector · Macie · Hub · Detective', text: `<p>GuardDuty detects threats from logs (severity ≥ 7 is high); Inspector finds CVEs; Macie finds sensitive data in S3; Security Hub aggregates everything, runs standards and scores you; Detective helps investigate. Triage by severity, group by resource, and connect related low findings.</p>` },
  quiz: [
    { q: 'Detects crypto-mining DNS queries from EC2:', a: ['Inspector', 'GuardDuty', 'Macie', 'Config'], c: 1, why: 'Threat detection from DNS logs.' },
    { q: 'Finds CVEs in ECR images:', a: ['Inspector', 'Macie', 'Shield', 'WAF'], c: 0, why: 'Vulnerability management.' },
    { q: 'Aggregates findings and runs the CIS benchmark:', a: ['Detective', 'Security Hub', 'CloudTrail', 'Trusted Advisor'], c: 1, why: 'Standards + score.' },
    { q: 'GuardDuty severity counted as HIGH:', a: ['≥ 1', '≥ 4', '≥ 7', '= 10'], c: 2, why: 'Low < 4, medium 4–6.9, high ≥ 7.' }
  ],
  challenge: { task: 'Write triage(findings, min_sev=7) → list of finding Titles with Severity ≥ min_sev, sorted by Severity highest first. Also write by_resource(findings) → dict {Resource: count}.',
    hint: R`def triage(findings, min_sev=7):
    hot = [f for f in findings if f["Severity"] >= min_sev]
    return [f["Title"] for f in sorted(hot, key=lambda f: f["Severity"], reverse=True)]

def by_resource(findings):
    out = {}
    for f in findings:
        out[f["Resource"]] = out.get(f["Resource"], 0) + 1
    return out

for t in triage(guardduty_findings):
    print("HIGH:", t)
print(by_resource(guardduty_findings))
`,
    starter: R`def triage(findings, min_sev=7):
    return [f["Title"] for f in findings]

def by_resource(findings):
    return {}

print(triage(guardduty_findings))
`,
    check: '_t(lambda: triage(guardduty_findings) == ["EC2 instance credentials used from outside AWS", "EC2 instance querying a crypto-mining domain", "Unusual S3 ListObjects volume"] and len(triage(guardduty_findings, 5)) == 5 and by_resource(guardduty_findings)["ci-legacy"] == 2 and by_resource(guardduty_findings)["i-0abc123"] == 2)' },
  next: `Detection finds problems after they exist. <b>AWS Config</b> and compliance-as-code catch misconfigurations the moment they appear, and prove compliance to auditors. Next.`,
  cheat: [['GuardDuty', 'threats'], ['Inspector', 'CVEs'], ['Macie', 'sensitive data'], ['Security Hub', 'aggregate + standards'], ['Detective', 'investigate'], ['severity ≥ 7', 'high']]
});

/* ============ 09 CONFIG & COMPLIANCE ============ */
LESSONS.push({
  id: 'config-compliance', num: 9, cat: 'gov', layer: 4, mins: 15,
  title: 'AWS Config & Compliance as Code', short: 'Rules, conformance packs, evidence',
  overview: `<p><b>AWS Config</b> records the configuration of your resources over time and evaluates them against <b>rules</b>: managed rules (300+, like <code>s3-bucket-server-side-encryption-enabled</code>) or <b>custom rules</b> (a Lambda or Guard policy you write). Results are COMPLIANT / NON_COMPLIANT, with history, which is exactly the evidence auditors ask for.</p>`,
  hook: `<b>"Record, Evaluate, Remediate, Report."</b>`,
  why: `GRC (governance, risk, compliance) roles live in Config, Security Hub standards and Audit Manager. Writing a custom rule is a classic Security Specialty scenario and a strong portfolio piece.`,
  scene: { type: 'graph', nodes: [
    { id: 'res', x: 110, y: 240, icon: 'bucket', label: 'Resources', sub: 'S3 · SG · IAM · EC2' },
    { id: 'rec', x: 340, y: 240, icon: 'clock', label: 'Config recorder', sub: 'configuration items' },
    { id: 'rule', x: 580, y: 110, icon: 'list', label: 'Config rules', sub: 'managed + custom', at: 1 },
    { id: 'pack', x: 580, y: 380, icon: 'book', label: 'Conformance pack', sub: 'CIS · PCI · NIST', at: 3 },
    { id: 'fix', x: 830, y: 110, icon: 'gear', label: 'Remediation', sub: 'SSM Automation', at: 4 },
    { id: 'aud', x: 830, y: 380, icon: 'file', label: 'Audit evidence', sub: 'Audit Manager', at: 3 }
  ], edges: [{ a: 'res', b: 'rec' }, { a: 'rec', b: 'rule' }, { a: 'rec', b: 'pack' }, { a: 'rule', b: 'fix' }, { a: 'pack', b: 'aud' }] },
  steps: [
    { t: 'The recorder', sub: 'Configuration history',
      body: `<p>Config records a <b>configuration item</b> every time a supported resource changes: who changed it (linked to CloudTrail), before and after. You can answer "what did this security group look like last Tuesday?" and "which resources reference this KMS key?". Enable it in every account and region, aggregated to a security account.</p>`,
      analogy: `A <b>time-lapse camera</b> on every resource.`,
      hook: `<b>CloudTrail = who called what. Config = what it looked like.</b>`,
      words: ['AWS Config', 'configuration item', 'resource timeline', 'aggregator'],
      flow: { from: 'res', to: 'rec', label: 'RECORD', detail: ['sg-0db changed: +5432 from 0.0.0.0/0'], color: 'blue' }, focus: ['res', 'rec'],
      cmds: [{ c: 'aws configservice get-resource-config-history --resource-type AWS::EC2::SecurityGroup --resource-id sg-0db --limit 1 --query "configurationItems[0].configurationItemCaptureTime"', o: '"2026-11-12T07:05:31Z"', k: 'cli' }] },
    { t: 'Managed rules', sub: 'Hundreds ready to use',
      body: `<p>Examples: <code>s3-bucket-versioning-enabled</code>, <code>s3-bucket-server-side-encryption-enabled</code>, <code>restricted-ssh</code>, <code>iam-user-mfa-enabled</code>, <code>root-account-mfa-enabled</code>, <code>cloudtrail-enabled</code>, <code>encrypted-volumes</code>. Rules trigger on <b>configuration change</b> or <b>periodically</b>.</p>`,
      analogy: `A <b>checklist the inspector runs</b> every time you remodel.`,
      hook: `<b>Change-triggered or periodic. Start with managed rules.</b>`,
      words: ['managed rules', 'restricted-ssh', 'iam-user-mfa-enabled', 'change-triggered', 'periodic'],
      flow: { from: 'rec', to: 'rule', label: 'EVALUATE', detail: ['restricted-ssh: sg-0ssh NON_COMPLIANT'], color: 'purple' }, focus: ['rec', 'rule'],
      cmds: [{ c: 'aws configservice describe-compliance-by-config-rule --config-rule-names restricted-ssh --query "ComplianceByConfigRules[0].Compliance.ComplianceType"', o: '"NON_COMPLIANT"', k: 'err' }] },
    { t: 'Custom rules', sub: 'Your policy in code',
      body: `<p>A custom Lambda rule receives the configuration item, decides <b>COMPLIANT</b> or <b>NON_COMPLIANT</b> (or <b>NOT_APPLICABLE</b>), and calls <code>put_evaluations</code>. Or write it as a <b>Guard</b> policy, no Lambda needed. Your company standard might be "every bucket: encrypted, versioned, Block Public Access on", which you'll code in the lab.</p>`,
      analogy: `Writing your <b>own house rules</b> into the inspector's checklist.`,
      hook: `<b>Input: configuration. Output: COMPLIANT / NON_COMPLIANT.</b>`,
      words: ['custom rule', 'put_evaluations', 'NOT_APPLICABLE', 'Guard custom policy', 'compliance as code'],
      flow: { from: 'rule', to: 'res', label: 'VERDICT', detail: ['raul-backups NON_COMPLIANT (no encryption)'], color: 'amber' }, focus: ['rule', 'res'],
      cmds: [{ c: 'def evaluate(bucket):\n    ok = bucket["encryption"] and bucket["versioning"] and bucket["public_access_block"]\n    return "COMPLIANT" if ok else "NON_COMPLIANT"', f: 'rule.py', o: '', k: 'py' }] },
    { t: 'Conformance packs & standards', sub: 'Frameworks in a box',
      body: `<p>A <b>conformance pack</b> deploys a bundle of rules mapped to a framework (CIS, NIST 800-53, PCI DSS, HIPAA) across your Organization. Security Hub standards overlap; <b>Audit Manager</b> collects evidence automatically for auditors. This is how a 50-account company proves "all buckets are encrypted" in one report.</p>`,
      analogy: `Buying the <b>full exam syllabus</b> instead of writing questions one by one.`,
      hook: `<b>Pack = framework as rules. Audit Manager = evidence folder.</b>`,
      words: ['conformance pack', 'CIS', 'NIST', 'PCI DSS', 'Audit Manager', 'GRC'],
      flow: { from: 'pack', to: 'aud', label: 'EVIDENCE', detail: ['CIS 2.1.1 S3 encryption: 2/5 compliant'], color: 'teal' }, focus: ['pack', 'aud'],
      cmds: [{ c: 'aws configservice describe-conformance-pack-compliance --conformance-pack-name cis-aws --query "ConformancePackRuleComplianceList[?ComplianceType==\'NON_COMPLIANT\'].ConfigRuleName"', o: '[\n    "s3-bucket-versioning-enabled",\n    "restricted-ssh",\n    "iam-user-mfa-enabled"\n]', k: 'cli' }] },
    { t: 'Auto-remediation', sub: 'Fix it, not just flag it',
      body: `<p>Attach an <b>SSM Automation</b> runbook to a rule (e.g. <code>AWS-EnableS3BucketEncryption</code>, <code>AWS-DisablePublicAccessForSecurityGroup</code>) to fix non-compliant resources automatically or with one click. Start with <b>manual</b> remediation, prove it's safe, then automate (lesson 11).</p>`,
      analogy: `The inspector who <b>tightens the loose bolt</b> instead of just writing it down.`,
      hook: `<b>Detect → remediate → re-evaluate → COMPLIANT.</b>`,
      words: ['remediation action', 'SSM Automation runbook', 'auto-remediation', 'retry'],
      flow: { from: 'rule', to: 'fix', label: 'REMEDIATE', detail: ['AWS-EnableS3BucketEncryption on raul-backups'], color: 'green' }, focus: ['rule', 'fix'],
      cmds: [{ c: 'aws configservice start-remediation-execution --config-rule-name s3-encryption --resource-keys resourceType=AWS::S3::Bucket,resourceId=raul-backups', o: '{\n    "FailedItems": []\n}', k: 'cli' }] }
  ],
  summary: { title: 'Compliance is code now', sub: 'Recorder · rules · packs · remediation', text: `<p>Config records configuration history and evaluates rules (managed or custom) on change or periodically. Conformance packs map rules to frameworks; Audit Manager collects evidence. Attach SSM Automation runbooks to remediate, manually first, automatically once proven safe.</p>` },
  quiz: [
    { q: '"What did this SG look like last week?" Use…', a: ['CloudTrail', 'AWS Config', 'GuardDuty', 'Macie'], c: 1, why: 'Configuration history.' },
    { q: 'A custom Config rule returns…', a: ['ALLOW/DENY', 'COMPLIANT/NON_COMPLIANT/NOT_APPLICABLE', 'HIGH/LOW', '200/403'], c: 1, why: 'Evaluation results.' },
    { q: 'Deploy CIS rules across an Organization:', a: ['Conformance pack', 'Stack policy', 'SCP', 'WAF'], c: 0, why: 'Bundled framework rules.' },
    { q: 'Auto-fix non-compliant resources with…', a: ['SSM Automation remediation', 'Detective', 'Artifact', 'Shield'], c: 0, why: 'Remediation actions.' }
  ],
  challenge: { task: 'Write a custom rule: evaluate(bucket) → "COMPLIANT" only if encryption is set AND versioning is True AND public_access_block is True AND policy_public is False, else "NON_COMPLIANT". Then compliance_report(buckets) → {name: result}.',
    hint: R`def evaluate(bucket):
    ok = (bucket["encryption"] is not None and bucket["versioning"]
          and bucket["public_access_block"] and not bucket["policy_public"])
    return "COMPLIANT" if ok else "NON_COMPLIANT"

def compliance_report(buckets):
    return {b["name"]: evaluate(b) for b in buckets}

for name, result in compliance_report(buckets).items():
    print(f"{result:14} {name}")
`,
    starter: R`def evaluate(bucket):
    return "COMPLIANT" if bucket["encryption"] else "NON_COMPLIANT"

def compliance_report(buckets):
    return {}

print(compliance_report(buckets))
`,
    check: '_t(lambda: compliance_report(buckets) == {"raul-reports": "COMPLIANT", "raul-public-site": "NON_COMPLIANT", "raul-backups": "NON_COMPLIANT", "raul-logs": "COMPLIANT", "raul-tmp": "NON_COMPLIANT"})' },
  next: `Rules and detections will eventually fire for real. Next: what to do in the first 15 minutes of an <b>incident</b>: the leaked access key playbook.`,
  cheat: [['aws configservice get-resource-config-history', 'history'], ['restricted-ssh · iam-user-mfa-enabled', 'managed rules'], ['put_evaluations', 'custom rule result'], ['conformance pack', 'framework bundle'], ['start-remediation-execution', 'fix'], ['Audit Manager', 'evidence']]
});

/* ============ 10 INCIDENT RESPONSE ============ */
LESSONS.push({
  id: 'incident-response', num: 10, cat: 'ir', layer: 5, mins: 16,
  title: 'Incident Response: Leaked Access Key', short: 'Contain, investigate, eradicate, recover',
  overview: `<p>The most common AWS incident: an access key leaked (GitHub, a laptop, a log) and someone is using it. The playbook: <b>contain</b> (deactivate the key, block the identity), <b>preserve evidence</b>, <b>investigate</b> (what did it do?), <b>eradicate</b> (remove persistence and attacker resources), <b>recover</b>, then <b>learn</b>.</p>`,
  hook: `<b>"Disable, Deny, Dig, Delete, Debrief."</b>`,
  why: `Speed matters: attackers spin up mining fleets within minutes of a leak. Having a scripted, tested containment step is what separates a $50 incident from a $50,000 one.`,
  scene: { type: 'graph', nodes: [
    { id: 'alert', x: 100, y: 240, icon: 'bell', label: 'Alert', sub: 'GuardDuty / AWS notice' },
    { id: 'contain', x: 320, y: 110, icon: 'lock', label: 'Contain', sub: 'key Inactive · deny-all' },
    { id: 'evid', x: 320, y: 380, icon: 'disk', label: 'Preserve', sub: 'snapshots · logs', at: 2 },
    { id: 'dig', x: 580, y: 240, icon: 'search', label: 'Investigate', sub: 'CloudTrail by key ID', at: 3 },
    { id: 'erad', x: 820, y: 110, icon: 'gear', label: 'Eradicate', sub: 'delete attacker resources', at: 3 },
    { id: 'learn', x: 820, y: 380, icon: 'book', label: 'Lessons learned', sub: 'roles, not keys', at: 4 }
  ], edges: [{ a: 'alert', b: 'contain' }, { a: 'alert', b: 'evid' }, { a: 'contain', b: 'dig' }, { a: 'evid', b: 'dig' }, { a: 'dig', b: 'erad' }, { a: 'dig', b: 'learn' }] },
  steps: [
    { t: 'Prepare before it happens', sub: 'Playbooks, roles, contacts',
      body: `<p>Preparation: a written <b>playbook</b> per incident type, a break-glass <b>IR role</b> with the permissions to contain, logging already on (you can't investigate what wasn't recorded), a forensics account, and contacts (AWS Support, security team, legal). Practise with game days.</p>`,
      analogy: `The <b>fire extinguisher</b> must be on the wall before the fire.`,
      hook: `<b>No logs before = no investigation after.</b>`,
      words: ['playbook', 'IR role', 'break-glass', 'forensics account', 'game day'],
      flow: { from: 'alert', to: 'contain', label: 'PAGE', detail: ['GuardDuty high finding → on-call'], color: 'blue' }, focus: ['alert'],
      cmds: [{ c: 'aws sts assume-role --role-arn arn:aws:iam::111122223333:role/IncidentResponder --role-session-name ir-raul --query Credentials.Expiration', o: '"2026-11-13T15:04:10Z"', k: 'cli' }] },
    { t: 'Contain the identity', sub: 'First 5 minutes',
      body: `<p>For a leaked IAM user key: <code>update-access-key --status Inactive</code> on every <b>active</b> key (inactive, not deleted: you keep the evidence and can re-enable), attach an inline <b>deny-all</b> policy to the user, and remove its console password if present. For a role: revoke active sessions (deny with <code>aws:TokenIssueTime</code> condition). <b>Don't</b> delete the user yet.</p>`,
      analogy: `<b>Freeze the stolen card</b> immediately; don't shred it, the bank needs it for the investigation.`,
      hook: `<b>Inactive, not deleted. Deny-all, not detach.</b>`,
      words: ['update-access-key Inactive', 'deny-all inline policy', 'revoke sessions', 'aws:TokenIssueTime', 'containment'],
      flow: { from: 'alert', to: 'contain', label: 'CONTAIN', detail: ['AKIAEXAMPLELEGACY01 → Inactive', 'PutUserPolicy DenyAll'], color: 'red' }, focus: ['alert', 'contain'],
      cmds: [{ c: 'aws iam update-access-key --user-name ci-legacy --access-key-id AKIAEXAMPLELEGACY01 --status Inactive\naws iam put-user-policy --user-name ci-legacy --policy-name ir-deny-all --policy-document \'{"Version":"2012-10-17","Statement":[{"Effect":"Deny","Action":"*","Resource":"*"}]}\'', o: '', k: 'cli' }] },
    { t: 'Preserve evidence', sub: 'Before you change more',
      body: `<p>For affected EC2 instances: <b>snapshot the EBS volumes</b>, capture memory if possible, tag the instance, and <b>isolate</b> it with a security group that allows nothing (don't stop it, which loses memory). Copy relevant CloudTrail logs to the forensics account. Write down every action with timestamps.</p>`,
      analogy: `<b>Tape off the crime scene</b> and photograph it before cleaning up.`,
      hook: `<b>Snapshot, isolate, tag, document.</b>`,
      words: ['EBS snapshot', 'isolation security group', 'chain of custody', 'forensics'],
      flow: { from: 'alert', to: 'evid', label: 'PRESERVE', detail: ['create-snapshot vol-0abc · isolate i-0abc123'], color: 'amber' }, focus: ['evid'],
      cmds: [{ c: 'aws ec2 create-snapshot --volume-id vol-0abc123 --description "IR-2026-11-12 ci-legacy evidence"', o: '{\n    "SnapshotId": "snap-0f1e2d3c",\n    "State": "pending"\n}', k: 'cli' }] },
    { t: 'Investigate', sub: 'What did the key do?',
      body: `<p>Search CloudTrail by the <b>access key ID</b> and user: first and last use, source IPs, regions, and especially <b>write</b> actions: new users/keys/roles (persistence), instances launched (impact), data accessed, logging changes. Your <code>hunt()</code> from lesson 4 already finds most of these in the lab data.</p>`,
      analogy: `Reading the <b>card statement</b> line by line after the fraud alert.`,
      hook: `<b>Filter by key ID → list every write → check every region.</b>`,
      words: ['accessKeyId', 'timeline', 'write actions', 'all regions', 'Detective'],
      flow: { from: 'dig', to: 'erad', label: 'TIMELINE', detail: ['03:40 recon → 03:41 CreateAccessKey → 03:42 RunInstances us-east-1 → 03:43 StopLogging'], color: 'purple' }, focus: ['contain', 'dig'],
      cmds: [{ c: 'aws cloudtrail lookup-events --lookup-attributes AttributeKey=AccessKeyId,AttributeValue=AKIAEXAMPLELEGACY01 --query "Events[].EventName" --output text', o: 'StopLogging\tRunInstances\tCreateAccessKey\tListUsers\tGetSecretValue\tListBuckets', k: 'cli' }] },
    { t: 'Eradicate, recover, learn', sub: 'Close every door',
      body: `<p><b>Eradicate</b>: terminate attacker instances in every region, delete keys/users/roles they created, restart logging. <b>Recover</b>: rotate any secrets the identity could read, restore from backups if data changed. <b>Learn</b>: why did a long-lived key exist? Replace with a role/OIDC, add the detection that would have caught it sooner, update the playbook.</p>`,
      analogy: `<b>Change all the locks</b>, then ask why the spare key was under the doormat.`,
      hook: `<b>Every region, every artifact, every secret, then the root cause.</b>`,
      words: ['eradication', 'recovery', 'root cause', 'post-incident review', 'blameless'],
      flow: { from: 'dig', to: 'learn', label: 'LEARN', detail: ['ci-legacy → GitHub OIDC role, key deleted'], color: 'green' }, focus: ['erad', 'learn'],
      cmds: [{ c: 'aws ec2 describe-instances --region us-east-1 --filters Name=instance-type,Values=p4d.24xlarge --query "Reservations[].Instances[].InstanceId" --output text', o: 'i-0f9e8d7c6b5a4\ti-0a1b2c3d4e5f6', k: 'cli' }] }
  ],
  summary: { title: 'You can run the leaked-key playbook', sub: 'Contain · preserve · investigate · eradicate · learn', text: `<p>Prepare playbooks, IR roles and logging ahead of time. Contain fast: set every active key Inactive and attach a deny-all policy (don't delete yet). Preserve evidence (snapshots, isolation, logs), investigate by key ID across all regions, eradicate persistence and attacker resources, rotate secrets, and fix the root cause.</p>` },
  quiz: [
    { q: 'First containment step for a leaked user key:', a: ['Delete the user', 'Set the key Inactive and attach deny-all', 'Email the attacker', 'Wait for GuardDuty'], c: 1, why: 'Fast and reversible, keeps evidence.' },
    { q: 'For a compromised EC2 instance, you should first…', a: ['Terminate it', 'Snapshot volumes and isolate it', 'Reboot it', 'Change its tag only'], c: 1, why: 'Preserve evidence.' },
    { q: 'Investigation must cover…', a: ['Only your main region', 'All regions', 'Only S3', 'Only IAM'], c: 1, why: 'Attackers use unused regions.' },
    { q: 'Long-term fix for a leaked CI key:', a: ['A longer key', 'Replace with an OIDC role', 'Hide it better', 'Rotate yearly'], c: 1, why: 'No long-lived key to leak.' }
  ],
  challenge: { task: 'Write contain(user): use boto3 iam to list_access_keys(UserName=user), call update_access_key(UserName, AccessKeyId, Status="Inactive") for each ACTIVE key only, then put_user_policy with PolicyName "ir-deny-all" and a JSON PolicyDocument that denies Action "*" on Resource "*". Return the list of key IDs you deactivated.',
    hint: R`import boto3, json

iam = boto3.client("iam")

DENY_ALL = {"Version": "2012-10-17",
            "Statement": [{"Effect": "Deny", "Action": "*", "Resource": "*"}]}

def contain(user):
    disabled = []
    for k in iam.list_access_keys(UserName=user)["AccessKeyMetadata"]:
        if k["Status"] == "Active":
            iam.update_access_key(UserName=user, AccessKeyId=k["AccessKeyId"], Status="Inactive")
            disabled.append(k["AccessKeyId"])
    iam.put_user_policy(UserName=user, PolicyName="ir-deny-all", PolicyDocument=json.dumps(DENY_ALL))
    return disabled

print(contain("ci-legacy"))
for c in calls("iam"):
    print(c["op"], c.get("AccessKeyId", c.get("PolicyName")))
`,
    starter: R`import boto3, json

iam = boto3.client("iam")

def contain(user):
    disabled = []
    # 1. list the user's keys, 2. set ACTIVE ones to Inactive, 3. attach a deny-all inline policy
    return disabled

print(contain("ci-legacy"))
`,
    check: '_t(lambda: contain("ci-legacy") == ["AKIAEXAMPLELEGACY01"] and [c["AccessKeyId"] for c in calls("iam", "UpdateAccessKey") if c["Status"] == "Inactive"] == ["AKIAEXAMPLELEGACY01"] and any(json.loads(c["PolicyDocument"])["Statement"][0]["Effect"] == "Deny" and json.loads(c["PolicyDocument"])["Statement"][0]["Action"] == "*" for c in calls("iam", "PutUserPolicy")))' },
  next: `You just scripted containment. The next step is obvious: <b>run it automatically</b> the moment the detection fires. Next: event-driven auto-remediation with EventBridge + Lambda.`,
  cheat: [['update-access-key --status Inactive', 'contain key'], ['put-user-policy (Deny * *)', 'block identity'], ['create-snapshot', 'preserve'], ['lookup-events AccessKeyId=…', 'investigate'], ['every region', 'eradicate'], ['OIDC role', 'root-cause fix']]
});

/* ============ 11 AUTO-REMEDIATION ============ */
LESSONS.push({
  id: 'auto-remediation', num: 11, cat: 'ir', layer: 5, mins: 15,
  title: 'Automated Remediation', short: 'EventBridge + Lambda fix it in seconds',
  overview: `<p>Humans take minutes to hours; automation takes seconds. Pattern: a risky API call (or a GuardDuty/Config finding) → <b>EventBridge rule</b> → <b>Lambda</b> that checks the details, <b>fixes</b> the problem (revoke the open port, block public access, disable a key) and <b>notifies</b> the team. Keep humans in the loop for anything destructive.</p>`,
  hook: `<b>"Detect, Decide, Do, Tell."</b>`,
  why: `Security automation (SOAR) is how small teams protect big environments. It's also the perfect bridge between your Serverless and Security skills, and a standout portfolio project.`,
  scene: { type: 'graph', nodes: [
    { id: 'dev', x: 100, y: 240, icon: 'user', label: 'dev-maria', sub: 'opens 5432 to world' },
    { id: 'ct', x: 300, y: 240, icon: 'log', label: 'CloudTrail', sub: 'AuthorizeSGIngress' },
    { id: 'eb', x: 500, y: 240, icon: 'bell', label: 'EventBridge rule', sub: 'pattern match' },
    { id: 'fn', x: 700, y: 240, icon: 'lambda', label: 'Remediation λ', sub: 'decide & fix', at: 1 },
    { id: 'sg', x: 900, y: 110, icon: 'firewall', label: 'sg-0db', sub: 'rule revoked', at: 2 },
    { id: 'sns', x: 900, y: 380, icon: 'bell', label: 'SNS / Slack', sub: 'team notified', at: 4 }
  ], edges: [{ a: 'dev', b: 'ct' }, { a: 'ct', b: 'eb' }, { a: 'eb', b: 'fn' }, { a: 'fn', b: 'sg' }, { a: 'fn', b: 'sns' }] },
  steps: [
    { t: 'Event-driven security', sub: 'React in seconds',
      body: `<p>CloudTrail management events flow to <b>EventBridge</b> automatically. A rule can match one API call (<code>AuthorizeSecurityGroupIngress</code>, <code>PutBucketPolicy</code>, <code>CreateAccessKey</code>) or a finding (<code>GuardDuty Finding</code> with severity ≥ 7, <code>Config Rules Compliance Change</code>). The target Lambda runs within seconds.</p>`,
      analogy: `A <b>motion sensor that turns on the sprinkler</b>, no phone call needed.`,
      hook: `<b>API call or finding → rule → Lambda.</b>`,
      words: ['EventBridge', 'event pattern', 'AWS API Call via CloudTrail', 'GuardDuty Finding', 'SOAR'],
      flow: { from: 'ct', to: 'eb', label: 'EVENT', detail: ['detail-type: AWS API Call via CloudTrail'], color: 'blue' }, focus: ['dev', 'ct', 'eb'],
      cmds: [{ c: '{\n  "source": ["aws.ec2"],\n  "detail-type": ["AWS API Call via CloudTrail"],\n  "detail": { "eventName": ["AuthorizeSecurityGroupIngress"] }\n}', f: 'event-pattern.json', o: '', k: 'json' }] },
    { t: 'Read the event', sub: 'Where the details live',
      body: `<p>The Lambda receives the CloudTrail record under <code>event["detail"]</code>: <code>eventName</code>, <code>userIdentity</code>, and <code>requestParameters</code>, where the group ID and <code>ipPermissions.items[]</code> (protocol, ports, <code>ipRanges.items[].cidrIp</code>) are. In the lab it's the variable <code>sg_event</code>.</p>`,
      analogy: `Opening the <b>alarm report</b>: which door, who, what time.`,
      hook: `<b>event["detail"]["requestParameters"] has the facts.</b>`,
      words: ['event detail', 'requestParameters', 'ipPermissions.items', 'cidrIp'],
      flow: { from: 'eb', to: 'fn', label: 'INVOKE', detail: ['groupId sg-0db · tcp 5432 · 0.0.0.0/0'], color: 'purple' }, focus: ['eb', 'fn'],
      cmds: [{ c: 'rp = sg_event["detail"]["requestParameters"]\nperm = rp["ipPermissions"]["items"][0]\nprint(rp["groupId"], perm["fromPort"], perm["ipRanges"]["items"][0]["cidrIp"])', o: 'sg-0db 5432 0.0.0.0/0', k: 'py', f: 'remediate.py' }] },
    { t: 'Decide carefully', sub: 'Only fix what’s really wrong',
      body: `<p>The function must be <b>precise</b>: revoke only world-open rules on non-web ports, ignore 443/80 for public load balancers, and allow-list tagged exceptions. A bad auto-remediation can cause an outage, which is a security incident of its own (availability!). Make it <b>idempotent</b> and log every decision.</p>`,
      analogy: `An auto-sprinkler that soaks the room <b>only for real fires</b>, not birthday candles.`,
      hook: `<b>Precise, idempotent, logged.</b>`,
      words: ['precision', 'allow-list', 'idempotent', 'blast radius', 'dry-run mode'],
      flow: { from: 'fn', to: 'sg', label: 'DECIDE', detail: ['5432 from 0.0.0.0/0 → remediate', '443 → leave it'], color: 'amber' }, focus: ['fn'],
      cmds: [{ c: 'WEB_PORTS = {80, 443}\nworld = any(r["cidrIp"] == "0.0.0.0/0" for r in perm["ipRanges"]["items"])\nprint(world and perm["fromPort"] not in WEB_PORTS)', o: 'True', k: 'py', f: 'remediate.py' }] },
    { t: 'Fix it', sub: 'revoke_security_group_ingress',
      body: `<p>Call <code>ec2.revoke_security_group_ingress(GroupId=…, IpPermissions=[{"IpProtocol": "tcp", "FromPort": 5432, "ToPort": 5432, "IpRanges": [{"CidrIp": "0.0.0.0/0"}]}])</code>. The Lambda's role needs only <code>ec2:RevokeSecurityGroupIngress</code> (and <code>sns:Publish</code>), scoped as tightly as possible. Similar one-liners: <code>put_public_access_block</code>, <code>update_access_key</code>, <code>start_logging</code>.</p>`,
      analogy: `The sprinkler head <b>for that one room</b>, not the whole building.`,
      hook: `<b>Smallest fix, smallest permissions.</b>`,
      words: ['revoke_security_group_ingress', 'least-privilege remediation role', 'put_public_access_block', 'start_logging'],
      flow: { from: 'fn', to: 'sg', label: 'REVOKE', detail: ['RevokeSecurityGroupIngress sg-0db tcp/5432 0.0.0.0/0'], color: 'green' }, focus: ['fn', 'sg'],
      cmds: [{ c: 'aws ec2 revoke-security-group-ingress --group-id sg-0db --protocol tcp --port 5432 --cidr 0.0.0.0/0', o: '{\n    "Return": true\n}', k: 'cli' }] },
    { t: 'Tell humans', sub: 'Notify and explain',
      body: `<p>Always <b>notify</b>: publish to an SNS topic (email, Slack via Chatbot) with who did it, what was changed, and how to request an exception. Silent fixes confuse developers and erode trust. Track remediations as metrics; a rising count means you need a preventive guardrail (SCP, IaC scanning) instead.</p>`,
      analogy: `The alarm company <b>calls you</b> after the sprinkler fires.`,
      hook: `<b>Fix + tell + track. Repeat offenders → prevent upstream.</b>`,
      words: ['SNS', 'AWS Chatbot', 'exception process', 'remediation metrics', 'preventive guardrails'],
      flow: { from: 'fn', to: 'sns', label: 'NOTIFY', detail: ['"Revoked 5432 from 0.0.0.0/0 on sg-0db (dev-maria)"'], color: 'teal' }, focus: ['fn', 'sns'],
      cmds: [{ c: 'sns.publish(TopicArn=os.environ["TOPIC_ARN"], Subject="Auto-remediated sg-0db",\n            Message="Removed tcp/5432 from 0.0.0.0/0 added by dev-maria")', f: 'remediate.py', o: '', k: 'py' }] }
  ],
  summary: { title: 'Your account fixes itself', sub: 'EventBridge · precise Lambda · least privilege · notify', text: `<p>Route CloudTrail API calls and security findings through EventBridge rules to a remediation Lambda. Read <code>event["detail"]</code>, decide precisely (skip web ports and allow-listed exceptions), apply the smallest fix with a least-privilege role, notify via SNS, and track counts to drive preventive guardrails.</p>` },
  quiz: [
    { q: 'Route an AuthorizeSecurityGroupIngress call to Lambda:', a: ['CloudWatch alarm', 'EventBridge rule on CloudTrail events', 'S3 event', 'SQS'], c: 1, why: 'API calls arrive as EventBridge events.' },
    { q: 'Where is the group ID in the event?', a: ['event["groupId"]', 'event["detail"]["requestParameters"]["groupId"]', 'context', 'event["source"]'], c: 1, why: 'CloudTrail record lives in detail.' },
    { q: 'A good remediation Lambda role allows…', a: ['ec2:*', 'Only the specific fix actions (e.g. RevokeSecurityGroupIngress, sns:Publish)', 'AdministratorAccess', 'Nothing'], c: 1, why: 'Least privilege applies to security tools too.' },
    { q: 'If the same remediation fires daily, you should…', a: ['Ignore it', 'Add a preventive control upstream', 'Disable it', 'Increase Lambda memory'], c: 1, why: 'Prevent instead of repeatedly fixing.' }
  ],
  challenge: { task: 'Write lambda_handler(event, context): if any permission in requestParameters is open to 0.0.0.0/0 on a port NOT in {80, 443}, call ec2.revoke_security_group_ingress(GroupId=…, IpPermissions=[…]) and sns.publish(TopicArn=os.environ["TOPIC_ARN"], Message=…), returning {"remediated": True, "group": groupId}. Otherwise return {"remediated": False, "group": groupId} and change nothing.',
    hint: R`import boto3, os

ec2 = boto3.client("ec2")
sns = boto3.client("sns")
WEB_PORTS = {80, 443}

def lambda_handler(event, context):
    rp = event["detail"]["requestParameters"]
    gid = rp["groupId"]
    bad = []
    for p in rp["ipPermissions"]["items"]:
        world = any(r.get("cidrIp") == "0.0.0.0/0" for r in p.get("ipRanges", {}).get("items", []))
        if world and p.get("fromPort") not in WEB_PORTS:
            bad.append({"IpProtocol": p["ipProtocol"], "FromPort": p["fromPort"], "ToPort": p["toPort"],
                        "IpRanges": [{"CidrIp": "0.0.0.0/0"}]})
    if not bad:
        return {"remediated": False, "group": gid}
    ec2.revoke_security_group_ingress(GroupId=gid, IpPermissions=bad)
    who = event["detail"]["userIdentity"].get("userName", "unknown")
    sns.publish(TopicArn=os.environ["TOPIC_ARN"], Subject=f"Auto-remediated {gid}",
                Message=f"Removed world-open rule(s) {bad} added by {who}")
    return {"remediated": True, "group": gid}

invoke(lambda_handler, sg_event)
print(calls())
`,
    starter: R`import boto3, os

ec2 = boto3.client("ec2")
sns = boto3.client("sns")
WEB_PORTS = {80, 443}

def lambda_handler(event, context):
    rp = event["detail"]["requestParameters"]
    gid = rp["groupId"]
    # TODO: find world-open non-web rules, revoke them, notify
    return {"remediated": False, "group": gid}

invoke(lambda_handler, sg_event)
`,
    check: '_t(lambda: lambda_handler(sg_event, context) == {"remediated": True, "group": "sg-0db"} and len(calls("ec2", "RevokeSecurityGroupIngress")) == 1 and calls("ec2", "RevokeSecurityGroupIngress")[0]["GroupId"] == "sg-0db" and len(calls("sns", "Publish")) == 1 and lambda_handler(json.loads(json.dumps(sg_event).replace("5432", "443")), context) == {"remediated": False, "group": "sg-0db"} and len(calls("ec2", "RevokeSecurityGroupIngress")) == 1)' },
  next: `Last lesson: zoom out. The <b>Well-Architected Security Pillar</b>, multi-account guardrails, and a career map from Cloud Engineer to Cloud Security Architect, plus a capstone that ties every lab together.`,
  cheat: [['detail-type: AWS API Call via CloudTrail', 'API events'], ['event["detail"]["requestParameters"]', 'facts'], ['revoke_security_group_ingress', 'close port'], ['put_public_access_block', 'close bucket'], ['sns.publish', 'tell humans'], ['least-privilege remediation role', 'safe automation']]
});

/* ============ 12 WELL-ARCHITECTED & CAPSTONE ============ */
LESSONS.push({
  id: 'security-pillar', num: 12, cat: 'gov', layer: 6, mins: 16,
  title: 'Security Pillar, Guardrails & Career Map', short: 'Well-Architected, multi-account, capstone',
  overview: `<p>The AWS <b>Well-Architected Security Pillar</b> organizes everything in this course into seven areas: security foundations, identity and access management, detection, infrastructure protection, data protection, incident response, and application security. At scale, it's delivered with <b>multi-account guardrails</b>: Organizations, SCPs, Control Tower, delegated security accounts.</p>`,
  hook: `<b>"Prevent with guardrails, detect with services, respond with automation."</b>`,
  why: `Architect interviews ask you to design a secure landing zone. The Security Specialty exam (SCS-C02) maps directly to these areas, and this lesson is your study map.`,
  scene: { type: 'graph', nodes: [
    { id: 'org', x: 480, y: 70, icon: 'users', label: 'AWS Organizations', sub: 'SCPs · Control Tower' },
    { id: 'sec', x: 180, y: 240, icon: 'shield', label: 'Security account', sub: 'GuardDuty · Hub admin' },
    { id: 'log', x: 480, y: 240, icon: 'log', label: 'Log archive', sub: 'CloudTrail · Config' },
    { id: 'wl', x: 780, y: 240, icon: 'server', label: 'Workload accounts', sub: 'dev · prod', at: 1 },
    { id: 'wa', x: 330, y: 410, icon: 'book', label: 'Well-Architected', sub: 'Security pillar', at: 2 },
    { id: 'you', x: 630, y: 410, icon: 'user', label: 'You', sub: 'Cloud Security path', at: 2 }
  ], edges: [{ a: 'org', b: 'sec' }, { a: 'org', b: 'log' }, { a: 'org', b: 'wl' }, { a: 'wl', b: 'log' }, { a: 'sec', b: 'wl' }, { a: 'wa', b: 'you' }] },
  steps: [
    { t: 'Multi-account foundation', sub: 'Accounts are the strongest boundary',
      body: `<p>Separate accounts limit blast radius. A standard landing zone (<b>Control Tower</b>): management account (billing, nothing else), <b>log archive</b> (CloudTrail + Config, immutable), <b>security/audit</b> (delegated admin for GuardDuty, Security Hub, Inspector, Macie, Detective), and workload accounts per environment in OUs.</p>`,
      analogy: `Separate <b>buildings</b> for HQ, records and each shop, instead of one giant warehouse.`,
      hook: `<b>Management · Log archive · Security · Workloads.</b>`,
      words: ['AWS Organizations', 'Control Tower', 'landing zone', 'log archive account', 'delegated administrator'],
      flow: { from: 'org', to: 'sec', label: 'DELEGATE', detail: ['GuardDuty/Security Hub admin = security account'], color: 'blue' }, focus: ['org', 'sec', 'log'],
      cmds: [{ c: 'aws organizations list-delegated-administrators --query "DelegatedAdministrators[].[Name,Id]" --output text', o: 'security\t222233334444', k: 'cli' }] },
    { t: 'Preventive guardrails', sub: 'SCPs and friends',
      body: `<p><b>SCPs</b> set maximum permissions for every account: deny leaving the Organization, deny disabling CloudTrail/GuardDuty/Config, deny unused regions, deny root actions, require IMDSv2. Plus <b>RCPs</b> (resource control policies) and declarative policies. Guardrails turn your detections from lesson 4 into things that <b>can't happen</b>.</p>`,
      analogy: `<b>Building codes</b>: no tenant can remove the fire exits, whatever their lease says.`,
      hook: `<b>Detections you keep firing → turn into SCPs.</b>`,
      words: ['SCP', 'RCP', 'deny StopLogging', 'region deny', 'IMDSv2', 'preventive vs detective'],
      flow: { from: 'org', to: 'wl', label: 'SCP', detail: ['Deny cloudtrail:StopLogging, guardduty:Delete*'], color: 'purple' }, focus: ['org', 'wl'],
      cmds: [{ c: '{\n  "Effect": "Deny",\n  "Action": ["cloudtrail:StopLogging", "cloudtrail:DeleteTrail", "guardduty:DeleteDetector", "config:StopConfigurationRecorder"],\n  "Resource": "*"\n}', f: 'protect-security-services.json', o: '', k: 'json' }],
      cloud: `<b>Link</b>: IAM Explorer lesson 10 lets you simulate SCPs.` },
    { t: 'The Security Pillar', sub: 'Seven areas, one checklist',
      body: `<p><b>Foundations</b> (accounts, governance) · <b>IAM</b> (lessons 2, IAM Explorer) · <b>Detection</b> (3, 4, 8) · <b>Infrastructure protection</b> (7, VPC Explorer) · <b>Data protection</b> (5, 6) · <b>Incident response</b> (10, 11) · <b>Application security</b> (CI/CD Explorer scanning). Run a <b>Well-Architected review</b> in the console's WA Tool to find gaps.</p>`,
      analogy: `A <b>seven-room house inspection</b>; you've now walked every room.`,
      hook: `<b>"Foundations, Identity, Detect, Infra, Data, Respond, App."</b>`,
      words: ['Well-Architected Framework', 'Security Pillar', 'WA Tool', 'design principles'],
      flow: { from: 'wa', to: 'you', label: 'REVIEW', detail: ['WA Tool: 3 high-risk issues'], color: 'amber' }, focus: ['wa'],
      cmds: [{ c: 'aws wellarchitected list-lens-review-improvements --workload-id abc123 --lens-alias wellarchitected --pillar-id security --query "ImprovementSummaries[].QuestionTitle" --max-items 2', o: '[\n    "How do you detect and investigate security events?",\n    "How do you protect your data at rest?"\n]', k: 'cli' }] },
    { t: 'Your career map', sub: 'Cloud Engineer → Cloud Security',
      body: `<p>Certifications: <b>CCP</b> → <b>Solutions Architect Associate</b> → <b>Security Specialty (SCS-C02)</b>. Roles: Cloud Engineer → Cloud Security Engineer / DevSecOps → Security Architect. Portfolio that gets interviews: the scripts from these labs as a GitHub repo (credential audit, CloudTrail hunter, auto-remediation Lambda via SAM, Config custom rule), plus a write-up of a simulated incident.</p>`,
      analogy: `You've collected the <b>tools</b>; the portfolio shows you can <b>build the house</b>.`,
      hook: `<b>CCP → SAA → SCS. Labs → repo → interviews.</b>`,
      words: ['CCP', 'SAA-C03', 'SCS-C02', 'Cloud Security Engineer', 'portfolio'],
      flow: { from: 'you', to: 'wa', label: 'GROW', detail: ['CCP (Dec) → SAA → Security Specialty'], color: 'green' }, focus: ['you'],
      cmds: [{ c: 'git init cloud-security-toolkit && cd cloud-security-toolkit\nmkdir audits hunts remediation rules incidents', o: 'Initialized empty Git repository in /home/raul/cloud-security-toolkit/.git/', k: 'cli', f: 'terminal' }] },
    { t: 'Capstone: posture report', sub: 'Tie every lab together',
      body: `<p>Real security teams produce a <b>weekly posture report</b>: users without MFA, stale keys, risky security groups, risky buckets, and high-severity findings. In the lab, write <code>posture()</code> that returns all five counts from the lab datasets, reusing the logic from lessons 2, 5, 7 and 8. Then print it like a report.</p>`,
      analogy: `The <b>monthly health check-up</b> summary: five numbers that tell the story.`,
      hook: `<b>Five numbers, every week, trending down.</b>`,
      words: ['security posture', 'KPI', 'trend', 'executive summary'],
      flow: { from: 'sec', to: 'you', label: 'REPORT', detail: ['no_mfa 2 · stale_keys 1 · risky_sgs 3 · risky_buckets 3 · high_findings 3'], color: 'teal' }, focus: ['sec', 'you'],
      cmds: [{ c: 'report = posture()\nfor k, v in report.items():\n    print(f"{k:14} {v}")', o: 'no_mfa         2\nstale_keys     1\nrisky_sgs      3\nrisky_buckets  3\nhigh_findings  3', k: 'py', f: 'posture.py' }] }
  ],
  summary: { title: 'You think like a Cloud Security engineer', sub: 'Accounts · guardrails · pillar · career', text: `<p>Build on a multi-account landing zone with log-archive and security accounts; prevent with SCPs, detect with managed services, respond with automation. Use the Well-Architected Security Pillar as your checklist, and turn these labs into a portfolio on the way to the Security Specialty.</p>` },
  quiz: [
    { q: 'Where should CloudTrail logs live in a landing zone?', a: ['Each workload account', 'A dedicated log-archive account', 'The management account only', 'A public bucket'], c: 1, why: 'Immutable, separated from workloads.' },
    { q: 'Make "StopLogging" impossible in member accounts:', a: ['GuardDuty', 'An SCP deny', 'A Config rule', 'A WAF rule'], c: 1, why: 'Preventive guardrail.' },
    { q: 'AWS security certification after SAA:', a: ['SCS-C02 Security Specialty', 'CLF-C02', 'DVA-C02', 'MLS-C01'], c: 0, why: 'The Security Specialty.' },
    { q: 'Which is NOT a Security Pillar area?', a: ['Detection', 'Data protection', 'Cost optimization', 'Incident response'], c: 2, why: 'Cost optimization is its own pillar.' }
  ],
  challenge: { task: 'Capstone: write posture() returning {"no_mfa": …, "stale_keys": …, "risky_sgs": …, "risky_buckets": …, "high_findings": …} as COUNTS computed from credential_report, security_groups, buckets and guardduty_findings (same rules as lessons 2, 7, 5 and 8; high = Severity ≥ 7).',
    hint: R`import csv, io, datetime

RISKY = {22, 3389, 3306, 5432, 1433, 6379, 27017}

def posture():
    rows = [r for r in csv.DictReader(io.StringIO(credential_report)) if r["user"] != "<root_account>"]
    no_mfa = [r for r in rows if r["password_enabled"] == "true" and r["mfa_active"] == "false"]
    stale = [r for r in rows if r["access_key_1_active"] == "true" and r["access_key_1_last_rotated"] != "N/A"
             and (TODAY - datetime.date.fromisoformat(r["access_key_1_last_rotated"][:10])).days > 90]
    sgs = set()
    for sg in security_groups:
        for p in sg["IpPermissions"]:
            if any(x.get("CidrIp") == "0.0.0.0/0" for x in p.get("IpRanges", [])):
                if p["IpProtocol"] == "-1" or any(p["FromPort"] <= port <= p["ToPort"] for port in RISKY):
                    sgs.add(sg["GroupId"])
    risky_b = [b for b in buckets if b["encryption"] is None or not b["public_access_block"] or b["policy_public"]]
    high = [f for f in guardduty_findings if f["Severity"] >= 7]
    return {"no_mfa": len(no_mfa), "stale_keys": len(stale), "risky_sgs": len(sgs),
            "risky_buckets": len(risky_b), "high_findings": len(high)}

print("WEEKLY SECURITY POSTURE")
for k, v in posture().items():
    print(f"  {k:14} {v}")
`,
    starter: R`def posture():
    return {"no_mfa": 0, "stale_keys": 0, "risky_sgs": 0, "risky_buckets": 0, "high_findings": 0}

print("WEEKLY SECURITY POSTURE")
for k, v in posture().items():
    print(f"  {k:14} {v}")
`,
    check: '_t(lambda: posture() == {"no_mfa": 2, "stale_keys": 1, "risky_sgs": 3, "risky_buckets": 3, "high_findings": 3})' },
  next: `🎓 <b>Course complete, and so is the whole series!</b> Capstone for real: in a free-tier account, enable an org trail, GuardDuty and Security Hub (FSBP), deploy your lesson 11 remediation Lambda with SAM, open port 5432 to the world on a test SG, and watch it get revoked within seconds. Write it up in your cloud-security-toolkit repo.`,
  cheat: [['Control Tower landing zone', 'multi-account'], ['SCP deny cloudtrail:StopLogging', 'guardrail'], ['delegated administrator', 'security account'], ['WA Tool security pillar', 'review'], ['CCP → SAA → SCS-C02', 'cert path'], ['posture(): 5 numbers', 'weekly report']]
});
