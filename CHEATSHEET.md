# Cloud Security Cheat Sheet

_Auto-generated from the Cloud Security Explorer lessons. One master memory hook + the key commands per lesson._

## 01 · Cloud Security Foundations

> ★ AWS secures the cloud. You secure what's IN the cloud.

| Command | What it does |
|---|---|
| `OF the cloud` | AWS |
| `IN the cloud` | you |
| `C · I · A` | what we protect |
| `defense in depth` | stack layers |
| `aws artifact` | compliance reports |
| `Prepare → Detect → Contain → Learn` | IR cycle |

**Memory hooks:**

- **Shared responsibility**: OF the cloud = AWS. IN the cloud = you. More managed = less for you, never zero.
- **The CIA triad**: C = who can see, I = who can change, A = can we reach it.
- **Defense in depth**: Identity, Network, Compute, Data, Detect, Respond: "I Never Carry Dangerous Devices Recklessly."
- **Know what happened**: Log everything, alert on what matters.
- **Assume breach**: Prepare, Detect, Contain, Learn.

## 02 · Root & Account Hygiene

> ★ "Root sleeps, MFA everywhere, keys expire."

| Command | What it does |
|---|---|
| `aws iam get-account-summary` | root MFA / keys |
| `aws iam generate-credential-report` | start report |
| `csv.DictReader(io.StringIO(s))` | parse CSV |
| `date.fromisoformat("2025-02-01")` | parse date |
| `(TODAY - d).days` | age in days |
| `AKIA vs ASIA` | long-lived vs temporary |

**Memory hooks:**

- **Lock away root**: Root: MFA on, keys off, used never.
- **People: Identity Center + MFA**: Humans: SSO + MFA. Machines: roles.
- **Machines: roles, not keys**: AKIA = long-lived = liability. ASIA = temporary = good.
- **The credential report**: generate → get → DictReader → filter.
- **Automate the audit**: (TODAY - rotated).days > 90 → rotate or delete.

## 03 · CloudTrail: The Flight Recorder

> ★ Who · What · When · Where · Worked? The five Ws of every event.

| Command | What it does |
|---|---|
| `aws cloudtrail lookup-events` | 90-day history |
| `userIdentity.type / .arn` | who |
| `eventName + eventSource` | what |
| `sourceIPAddress · awsRegion` | where |
| `errorCode AccessDenied` | failed attempt |
| `validate-logs` | tamper check |

**Memory hooks:**

- **What gets recorded**: Management = default. Data = opt-in. 90 days = event history only.
- **Anatomy of an event**: errorCode present = it failed. AccessDenied = someone tried.
- **A trail you can trust**: All regions, all accounts, separate account, validated.
- **Query at scale**: SQL for scale, Python for speed.
- **Count failures by user**: Many denials, one identity → investigate.

## 04 · Threat Hunting in CloudTrail

> ★ "Look, Lift, Linger, Loot, Lie low": recon, escalate, persist, impact, evade.

| Command | What it does |
|---|---|
| `List*/Get*/Describe* burst` | recon |
| `CreateAccessKey for other user` | persistence |
| `RunInstances in unused region` | crypto-mining |
| `StopLogging / DeleteTrail` | evasion |
| `additionalEventData.MFAUsed` | login MFA |
| `MITRE ATT&CK Cloud` | attacker playbook |

**Memory hooks:**

- **Recon**: New IP + many List/Get calls = recon.
- **Persistence**: CreateAccessKey for someone else = red flag.
- **Impact & unusual regions**: Activity outside approved regions = investigate. Better: SCP-deny it.
- **Defense evasion & root**: Logging changes, root use, no-MFA logins: always alert.
- **Write the rules**: One behaviour → one rule → one test.

## 05 · Data Protection: KMS, Encryption, S3

> ★ "Encrypt at rest, encrypt in transit, never public by accident."

| Command | What it does |
|---|---|
| `GenerateDataKey` | envelope encryption |
| `customer managed key` | your key policy |
| `SSE-KMS + Bucket Keys` | S3 encryption |
| `enable-ebs-encryption-by-default` | EBS |
| `put-public-access-block (account)` | block public |
| `Macie · Access Analyzer` | find exposure |

**Memory hooks:**

- **Envelope encryption**: KMS key wraps the data key; data key encrypts the data.
- **Key types & policies**: Key policy first, IAM second. No key access = no data access.
- **Encrypt S3 & friends**: SSE-KMS for sensitive, Bucket Keys for cost, deny non-TLS.
- **Block Public Access**: Account-level BPA on. Public website? CloudFront + OAC.
- **Audit your buckets**: Unencrypted OR possibly public = risky.

## 06 · Secrets Management

> ★ "Fetch, don't paste." Code holds the secret's NAME, never its value.

| Command | What it does |
|---|---|
| `secretsmanager get_secret_value` | fetch |
| `json.loads(r["SecretString"])` | parse |
| `SSM SecureString` | cheap secrets |
| `rotate-secret --rotation-rules` | auto rotation |
| `ManageMasterUserPassword: true` | RDS managed |
| `gitleaks · push protection` | prevent leaks |

**Memory hooks:**

- **Where secrets leak**: Leaked once = rotate now. Deleting the line isn't enough.
- **Secrets Manager vs Parameter Store**: Needs rotation → Secrets Manager. Simple config → Parameter Store.
- **Fetch at runtime**: Env var = name. Secrets Manager = value. Cache it.
- **Rotation**: create → set → test → finish. Fetch-at-runtime apps never notice.
- **Prevent & detect leaks**: Block at push, scan in CI, watch GetSecretValue.

## 07 · Network Security: Exposure & Firewalls

> ★ "Only 443 faces the world." Everything else is private or behind a bastion-less path (SSM).

| Command | What it does |
|---|---|
| `22 · 3389 · 3306 · 5432 · 6379 · 27017` | never public |
| `--source-group sg-…` | SG reference |
| `FromPort ≤ p ≤ ToPort` | range check |
| `IpProtocol "-1"` | all traffic |
| `AWS WAF managed rules` | L7 protection |
| `aws ssm start-session` | no SSH |

**Memory hooks:**

- **Ports attackers scan first**: 22, 3389, and every DB port: never 0.0.0.0/0.
- **Security group design**: Source = security group ID, not a CIDR.
- **Port ranges & all-traffic rules**: From ≤ port ≤ To. "-1" = everything.
- **WAF, Shield, Firewall Manager**: WAF = layer 7 rules. Shield = DDoS. FMS = org-wide.
- **No more SSH**: Session Manager: zero open ports, full audit.

## 08 · GuardDuty, Security Hub & Friends

> ★ "GuardDuty guards, Inspector inspects, Macie finds data, Config checks config, Hub hubs, Detective detects."

| Command | What it does |
|---|---|
| `GuardDuty` | threats |
| `Inspector` | CVEs |
| `Macie` | sensitive data |
| `Security Hub` | aggregate + standards |
| `Detective` | investigate |
| `severity ≥ 7` | high |

**Memory hooks:**

- **GuardDuty**: Type tells WHAT, severity tells HOW URGENT. ≥ 7 = high.
- **Inspector & Macie**: Inspector = vulnerable software. Macie = sensitive data.
- **Security Hub**: Hub = aggregate + standards + score.
- **Detective & investigation**: GuardDuty says "something's wrong"; Detective says "here's the story".
- **Triage**: Sort by severity, group by resource, connect the dots.

## 09 · AWS Config & Compliance as Code

> ★ "Record, Evaluate, Remediate, Report."

| Command | What it does |
|---|---|
| `aws configservice get-resource-config-history` | history |
| `restricted-ssh · iam-user-mfa-enabled` | managed rules |
| `put_evaluations` | custom rule result |
| `conformance pack` | framework bundle |
| `start-remediation-execution` | fix |
| `Audit Manager` | evidence |

**Memory hooks:**

- **The recorder**: CloudTrail = who called what. Config = what it looked like.
- **Managed rules**: Change-triggered or periodic. Start with managed rules.
- **Custom rules**: Input: configuration. Output: COMPLIANT / NON_COMPLIANT.
- **Conformance packs & standards**: Pack = framework as rules. Audit Manager = evidence folder.
- **Auto-remediation**: Detect → remediate → re-evaluate → COMPLIANT.

## 10 · Incident Response: Leaked Access Key

> ★ "Disable, Deny, Dig, Delete, Debrief."

| Command | What it does |
|---|---|
| `update-access-key --status Inactive` | contain key |
| `put-user-policy (Deny * *)` | block identity |
| `create-snapshot` | preserve |
| `lookup-events AccessKeyId=…` | investigate |
| `every region` | eradicate |
| `OIDC role` | root-cause fix |

**Memory hooks:**

- **Prepare before it happens**: No logs before = no investigation after.
- **Contain the identity**: Inactive, not deleted. Deny-all, not detach.
- **Preserve evidence**: Snapshot, isolate, tag, document.
- **Investigate**: Filter by key ID → list every write → check every region.
- **Eradicate, recover, learn**: Every region, every artifact, every secret, then the root cause.

## 11 · Automated Remediation

> ★ "Detect, Decide, Do, Tell."

| Command | What it does |
|---|---|
| `detail-type: AWS API Call via CloudTrail` | API events |
| `event["detail"]["requestParameters"]` | facts |
| `revoke_security_group_ingress` | close port |
| `put_public_access_block` | close bucket |
| `sns.publish` | tell humans |
| `least-privilege remediation role` | safe automation |

**Memory hooks:**

- **Event-driven security**: API call or finding → rule → Lambda.
- **Read the event**: event["detail"]["requestParameters"] has the facts.
- **Decide carefully**: Precise, idempotent, logged.
- **Fix it**: Smallest fix, smallest permissions.
- **Tell humans**: Fix + tell + track. Repeat offenders → prevent upstream.

## 12 · Security Pillar, Guardrails & Career Map

> ★ "Prevent with guardrails, detect with services, respond with automation."

| Command | What it does |
|---|---|
| `Control Tower landing zone` | multi-account |
| `SCP deny cloudtrail:StopLogging` | guardrail |
| `delegated administrator` | security account |
| `WA Tool security pillar` | review |
| `CCP → SAA → SCS-C02` | cert path |
| `posture(): 5 numbers` | weekly report |

**Memory hooks:**

- **Multi-account foundation**: Management · Log archive · Security · Workloads.
- **Preventive guardrails**: Detections you keep firing → turn into SCPs.
- **The Security Pillar**: "Foundations, Identity, Detect, Infra, Data, Respond, App."
- **Your career map**: CCP → SAA → SCS. Labs → repo → interviews.
- **Capstone: posture report**: Five numbers, every week, trending down.

